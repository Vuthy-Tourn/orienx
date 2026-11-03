from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.auth import User
from app.models.profile import StudentProfile
from app.models.assessment import PersonalityResult, RiasecResult
from app.models.preferences import AcademicPreferences
from app.models.recommendation import MajorRecommendation
from app.models.favorites import FavoriteMajor, FavoriteUniversity, FavoriteScholarship
from app.schemas.profile import StudentProfileUpdate, StudentProfileOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/profile", response_model=ApiResponse[StudentProfileOut])
async def get_student_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return ApiResponse(
        success=True,
        data=StudentProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            full_name_en=profile.full_name_en,
            full_name_km=profile.full_name_km,
            phone=profile.phone,
            gender=profile.gender,
            date_of_birth=profile.date_of_birth,
            province=profile.province,
            high_school=profile.high_school,
            current_education_level=profile.current_education_level,
            graduation_year=profile.graduation_year,
            preferred_language=profile.preferred_language,
            avatar_url=profile.avatar_url,
            bio=profile.bio
        )
    )


@router.put("/profile", response_model=ApiResponse[StudentProfileOut])
async def update_student_profile(
    data: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(profile, key, val)

    await db.commit()
    await db.refresh(profile)

    return ApiResponse(
        success=True,
        message="Profile updated successfully",
        data=StudentProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            full_name_en=profile.full_name_en,
            full_name_km=profile.full_name_km,
            phone=profile.phone,
            gender=profile.gender,
            date_of_birth=profile.date_of_birth,
            province=profile.province,
            high_school=profile.high_school,
            current_education_level=profile.current_education_level,
            graduation_year=profile.graduation_year,
            preferred_language=profile.preferred_language,
            avatar_url=profile.avatar_url,
            bio=profile.bio
        )
    )


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Assessment completion flags
    stmt_p = select(PersonalityResult).where(PersonalityResult.user_id == current_user.id).order_by(PersonalityResult.created_at.desc()).limit(1)
    res_p = await db.execute(stmt_p)
    personality = res_p.scalar_one_or_none()

    stmt_r = select(RiasecResult).where(RiasecResult.user_id == current_user.id).order_by(RiasecResult.created_at.desc()).limit(1)
    res_r = await db.execute(stmt_r)
    riasec = res_r.scalar_one_or_none()

    stmt_pref = select(AcademicPreferences).where(AcademicPreferences.user_id == current_user.id).limit(1)
    res_pref = await db.execute(stmt_pref)
    pref = res_pref.scalar_one_or_none()

    # Top recommendations
    stmt_rec = (
        select(MajorRecommendation)
        .where(MajorRecommendation.user_id == current_user.id)
        .order_by(MajorRecommendation.rank_position.asc())
        .limit(3)
    )
    res_rec = await db.execute(stmt_rec)
    top_recs = res_rec.scalars().all()

    # Favorites count
    c_maj = (await db.execute(select(func.count(FavoriteMajor.major_id)).where(FavoriteMajor.user_id == current_user.id))).scalar() or 0
    c_uni = (await db.execute(select(func.count(FavoriteUniversity.university_id)).where(FavoriteUniversity.user_id == current_user.id))).scalar() or 0
    c_sch = (await db.execute(select(func.count(FavoriteScholarship.scholarship_id)).where(FavoriteScholarship.user_id == current_user.id))).scalar() or 0

    return ApiResponse(
        success=True,
        data={
            "assessments_status": {
                "personality_completed": personality is not None,
                "personality_type": personality.personality_type if personality else None,
                "riasec_completed": riasec is not None,
                "holland_code": riasec.holland_code if riasec else None,
                "preferences_completed": pref is not None,
                "overall_progress_percent": sum([personality is not None, riasec is not None, pref is not None]) * 33.33
            },
            "favorites_count": {
                "majors": c_maj,
                "universities": c_uni,
                "scholarships": c_sch,
                "total": c_maj + c_uni + c_sch
            },
            "top_recommendations_count": len(top_recs)
        }
    )

