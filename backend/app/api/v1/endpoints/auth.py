import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.auth import User, Role, RefreshToken
from app.models.profile import StudentProfile
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("/register", response_model=ApiResponse[TokenResponse])
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    # Check if email exists
    stmt = select(User).where(User.email == data.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Get STUDENT role
    stmt_role = select(Role).where(Role.name == "STUDENT")
    res_role = await db.execute(stmt_role)
    student_role = res_role.scalar_one_or_none()
    if not student_role:
        student_role = Role(name="STUDENT", description="Student exploring guidance")
        db.add(student_role)
        await db.flush()

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        status="ACTIVE",
        is_email_verified=True, # Auto-verify for onboarding
        roles=[student_role]
    )
    db.add(new_user)
    await db.flush()

    # Create profile
    profile = StudentProfile(
        user_id=new_user.id,
        full_name_en=data.full_name_en,
        full_name_km=data.full_name_km or data.full_name_en,
        province=data.province,
        high_school=data.high_school,
        current_education_level=data.current_education_level,
        graduation_year=data.graduation_year,
        preferred_language=data.preferred_language
    )
    db.add(profile)

    # Generate tokens
    access_token = create_access_token(str(new_user.id), "STUDENT")
    raw_refresh = str(uuid.uuid4())
    token_family = uuid.uuid4()
    
    db_refresh = RefreshToken(
        user_id=new_user.id,
        token_hash=hash_password(raw_refresh),
        token_family=token_family,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    await db.commit()

    # Set HttpOnly refresh cookie
    response.set_cookie(
        key="futera_refresh_token",
        value=f"{raw_refresh}:{db_refresh.id}",
        httponly=True,
        secure=False, # Set to True in production HTTPS
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth"
    )

    return ApiResponse(
        success=True,
        message="Account created successfully",
        data=TokenResponse(
            access_token=access_token,
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=new_user.id,
            email=new_user.email,
            role="STUDENT"
        )
    )


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == data.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or deactivated")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)

    primary_role = user.roles[0].name if user.roles else "STUDENT"
    access_token = create_access_token(str(user.id), primary_role)

    raw_refresh = str(uuid.uuid4())
    token_family = uuid.uuid4()
    
    db_refresh = RefreshToken(
        user_id=user.id,
        token_hash=hash_password(raw_refresh),
        token_family=token_family,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(db_refresh)
    await db.commit()

    response.set_cookie(
        key="futera_refresh_token",
        value=f"{raw_refresh}:{db_refresh.id}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth"
    )

    return ApiResponse(
        success=True,
        message="Login successful",
        data=TokenResponse(
            access_token=access_token,
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user.id,
            email=user.email,
            role=primary_role
        )
    )


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    cookie_val = request.cookies.get("futera_refresh_token")
    if not cookie_val or ":" not in cookie_val:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh cookie missing")

    raw_token, token_id_str = cookie_val.split(":", 1)
    try:
        token_id = uuid.UUID(token_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed refresh token ID")

    stmt = select(RefreshToken).where(RefreshToken.id == token_id)
    res = await db.execute(stmt)
    rt = res.scalar_one_or_none()

    if not rt or rt.is_revoked:
        if rt and rt.is_revoked:
            # Token family reuse attack detected! Revoke all tokens in family!
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.token_family == rt.token_family)
                .values(is_revoked=True, revoked_at=datetime.now(timezone.utc))
            )
            await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Revoked refresh token")

    if not verify_password(raw_token, rt.token_hash) or rt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired or invalid refresh token")

    # Invalidate old token and issue child token (Token Rotation)
    rt.is_revoked = True
    rt.revoked_at = datetime.now(timezone.utc)

    # Load user
    stmt_user = select(User).where(User.id == rt.user_id)
    res_user = await db.execute(stmt_user)
    user = res_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    primary_role = user.roles[0].name if user.roles else "STUDENT"
    new_access_token = create_access_token(str(user.id), primary_role)

    new_raw = str(uuid.uuid4())
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=hash_password(new_raw),
        token_family=rt.token_family,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_rt)
    await db.commit()

    response.set_cookie(
        key="futera_refresh_token",
        value=f"{new_raw}:{new_rt.id}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth"
    )

    return ApiResponse(
        success=True,
        message="Token refreshed",
        data=TokenResponse(
            access_token=new_access_token,
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user.id,
            email=user.email,
            role=primary_role
        )
    )


@router.post("/logout", response_model=ApiResponse[bool])
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    cookie_val = request.cookies.get("futera_refresh_token")
    if cookie_val and ":" in cookie_val:
        _, token_id_str = cookie_val.split(":", 1)
        try:
            token_id = uuid.UUID(token_id_str)
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.id == token_id)
                .values(is_revoked=True, revoked_at=datetime.now(timezone.utc))
            )
            await db.commit()
        except Exception:
            pass

    response.delete_cookie(key="futera_refresh_token", path="/api/v1/auth")
    return ApiResponse(success=True, message="Logged out successfully", data=True)


@router.get("/me", response_model=ApiResponse[UserOut])
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt_p = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    res_p = await db.execute(stmt_p)
    profile = res_p.scalar_one_or_none()

    role_names = [r.name for r in current_user.roles]

    return ApiResponse(
        success=True,
        data=UserOut(
            id=current_user.id,
            email=current_user.email,
            status=current_user.status,
            is_email_verified=current_user.is_email_verified,
            roles=role_names,
            full_name_en=profile.full_name_en if profile else None,
            full_name_km=profile.full_name_km if profile else None,
            province=profile.province if profile else None,
            current_education_level=profile.current_education_level if profile else None,
            preferred_language=profile.preferred_language if profile else "km"
        )
    )

