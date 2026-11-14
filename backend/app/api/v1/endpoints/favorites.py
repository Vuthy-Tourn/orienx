import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.auth import User
from app.models.catalog import University, Major, Career
from app.models.scholarship import Scholarship
from app.models.favorites import (
    FavoriteUniversity,
    FavoriteMajor,
    FavoriteCareer,
    FavoriteScholarship,
)
from app.schemas.favorites import FavoriteToggleIn, FavoriteToggleOut, UserFavoritesOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("/toggle", response_model=ApiResponse[FavoriteToggleOut])
async def toggle_favorite(
    body: FavoriteToggleIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    e_type = body.entity_type.lower()
    e_id = body.entity_id

    if e_type == "university":
        model = FavoriteUniversity
        fk_field = FavoriteUniversity.university_id
    elif e_type == "major":
        model = FavoriteMajor
        fk_field = FavoriteMajor.major_id
    elif e_type == "career":
        model = FavoriteCareer
        fk_field = FavoriteCareer.career_id
    elif e_type == "scholarship":
        model = FavoriteScholarship
        fk_field = FavoriteScholarship.scholarship_id
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid entity_type")

    stmt = select(model).where(model.user_id == current_user.id, fk_field == e_id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing:
        await db.execute(delete(model).where(model.user_id == current_user.id, fk_field == e_id))
        is_fav = False
    else:
        if e_type == "university":
            fav = FavoriteUniversity(user_id=current_user.id, university_id=e_id)
        elif e_type == "major":
            fav = FavoriteMajor(user_id=current_user.id, major_id=e_id)
        elif e_type == "career":
            fav = FavoriteCareer(user_id=current_user.id, career_id=e_id)
        elif e_type == "scholarship":
            fav = FavoriteScholarship(user_id=current_user.id, scholarship_id=e_id)
        db.add(fav)
        is_fav = True

    await db.commit()
    return ApiResponse(
        success=True,
        message="Favorite updated",
        data=FavoriteToggleOut(entity_type=e_type, entity_id=e_id, is_favorited=is_fav)
    )


@router.get("", response_model=ApiResponse[UserFavoritesOut])
async def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Universities
    res_u = await db.execute(
        select(FavoriteUniversity).options(selectinload(FavoriteUniversity.university)).where(FavoriteUniversity.user_id == current_user.id)
    )
    fav_unis = [
        {
            "id": str(fu.university.id),
            "slug": fu.university.slug,
            "name": fu.university.name,
            "acronym": fu.university.acronym,
            "description": fu.university.description,
            "province": fu.university.province,
            "university_type": fu.university.university_type,
            "cover_image_url": fu.university.cover_image_url,
            "logo_url": fu.university.logo_url,
            "tuition_range_min_usd": float(fu.university.tuition_range_min_usd) if fu.university.tuition_range_min_usd else None,
            "tuition_range_max_usd": float(fu.university.tuition_range_max_usd) if fu.university.tuition_range_max_usd else None,
            "website_url": fu.university.website_url,
        }
        for fu in res_u.scalars().all() if fu.university
    ]

    # Majors
    res_m = await db.execute(
        select(FavoriteMajor).options(selectinload(FavoriteMajor.major)).where(FavoriteMajor.user_id == current_user.id)
    )
    fav_majors = [
        {
            "id": str(fm.major.id),
            "slug": fm.major.slug,
            "name": fm.major.name,
            "category": fm.major.category,
            "description": fm.major.description,
            "is_stem": fm.major.is_stem,
            "riasec_primary": fm.major.riasec_primary,
            "riasec_secondary": fm.major.riasec_secondary,
            "personality_affinity": fm.major.personality_affinity,
            "image_url": fm.major.image_url,
        }
        for fm in res_m.scalars().all() if fm.major
    ]

    # Careers
    res_c = await db.execute(
        select(FavoriteCareer).options(selectinload(FavoriteCareer.career)).where(FavoriteCareer.user_id == current_user.id)
    )
    fav_careers = [
        {
            "id": str(fc.career.id),
            "slug": fc.career.slug,
            "title": fc.career.title,
            "industry": fc.career.industry,
            "description": fc.career.description,
            "riasec_code": fc.career.riasec_code,
            "education_level": fc.career.education_level,
        }
        for fc in res_c.scalars().all() if fc.career
    ]

    # Scholarships
    res_s = await db.execute(
        select(FavoriteScholarship).options(selectinload(FavoriteScholarship.scholarship)).where(FavoriteScholarship.user_id == current_user.id)
    )
    fav_scholarships = [
        {
            "id": str(fs.scholarship.id),
            "slug": fs.scholarship.slug,
            "title": fs.scholarship.title,
            "provider": fs.scholarship.provider,
            "description": fs.scholarship.description,
            "coverage_type": fs.scholarship.coverage_type,
            "coverage_percentage": fs.scholarship.coverage_percentage,
            "country_or_institution": fs.scholarship.country_or_institution,
            "deadline": str(fs.scholarship.application_deadline) if fs.scholarship.application_deadline else None,
            "official_url": fs.scholarship.official_url,
            "poster_url": fs.scholarship.poster_url,
            "status": fs.status,
        }
        for fs in res_s.scalars().all() if fs.scholarship
    ]

    return ApiResponse(
        success=True,
        data=UserFavoritesOut(
            universities=fav_unis,
            majors=fav_majors,
            careers=fav_careers,
            scholarships=fav_scholarships
        )
    )

