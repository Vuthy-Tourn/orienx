import uuid
from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.core.security import decode_token
from app.models.auth import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # API clients may send a Bearer header; the browser uses the httpOnly
    # access cookie set by the auth endpoints.
    token = token or request.cookies.get(settings.ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_str = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    
    stmt = select(User).where(User.id == user_uuid)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
        
    return user


async def get_optional_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    token = token or request.cookies.get(settings.ACCESS_COOKIE_NAME)
    if not token:
        return None
    try:
        return await get_current_user(request=request, token=token, db=db)
    except HTTPException:
        return None


def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_roles = [r.name for r in current_user.roles]
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


get_current_admin = require_role(["ADMIN", "SUPER_ADMIN"])
get_current_super_admin = require_role(["SUPER_ADMIN"])
get_current_student = require_role(["STUDENT", "ADMIN", "SUPER_ADMIN"])

