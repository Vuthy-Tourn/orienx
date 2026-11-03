import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, distinct
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.catalog import Major, UniversityMajor, University, Career
from app.schemas.catalog import MajorSummaryOut, MajorDetailOut, MajorOfferingUniversityOut, CareerSummaryOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/categories", response_model=ApiResponse[List[str]])
async def list_major_categories(db: AsyncSession = Depends(get_db)):
    stmt = select(distinct(Major.category)).order_by(Major.category.asc())
    res = await db.execute(stmt)
    categories = [row[0] for row in res.fetchall()]
    return ApiResponse(success=True, data=categories)


@router.get("", response_model=ApiResponse[List[MajorSummaryOut]])
async def list_majors(
    category: Optional[str] = Query(None, description="Filter by major category"),
    is_stem: Optional[bool] = Query(None, description="Filter by STEM"),
    riasec: Optional[str] = Query(None, description="Filter by RIASEC code (R, I, A, S, E, C)"),
    q: Optional[str] = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Major).options(selectinload(Major.university_majors))

    if category:
        stmt = stmt.where(Major.category == category)
    if is_stem is not None:
        stmt = stmt.where(Major.is_stem == is_stem)
    if riasec:
        riasec_up = riasec.upper()
        stmt = stmt.where(or_(Major.riasec_primary == riasec_up, Major.riasec_secondary == riasec_up))

    res = await db.execute(stmt)
    majors = res.scalars().all()

    if q:
        q_lower = q.lower()
        filtered = []
        for m in majors:
            name_en = str(m.name.get("en", "")).lower()
            name_km = str(m.name.get("km", "")).lower()
            cat = str(m.category).lower()
            if q_lower in name_en or q_lower in name_km or q_lower in cat:
                filtered.append(m)
        majors = filtered

    total = len(majors)
    start = (page - 1) * limit
    paginated = majors[start:start + limit]

    data = [
        MajorSummaryOut(
            id=m.id,
            slug=m.slug,
            name=m.name,
            category=m.category,
            description=m.description,
            riasec_primary=m.riasec_primary,
            riasec_secondary=m.riasec_secondary,
            personality_affinity=m.personality_affinity,
            is_stem=m.is_stem,
            universities_count=len(m.university_majors)
        )
        for m in paginated
    ]

    return ApiResponse(success=True, data=data, meta={"page": page, "limit": limit, "total": total})


@router.get("/{slug}", response_model=ApiResponse[MajorDetailOut])
async def get_major_detail(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Major)
        .options(
            selectinload(Major.university_majors).selectinload(UniversityMajor.university),
            selectinload(Major.careers)
        )
        .where(
            or_(
                Major.slug == slug,
                Major.id == uuid.UUID(slug) if len(slug) == 36 and "-" in slug else False
            )
        )
    )
    res = await db.execute(stmt)
    m = res.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")

    unis_offering = [
        MajorOfferingUniversityOut(
            university_id=um.university.id,
            university_slug=um.university.slug,
            university_name=um.university.name,
            university_acronym=um.university.acronym,
            university_type=um.university.university_type,
            province=um.university.province,
            tuition_annual_usd=float(um.tuition_annual_usd) if um.tuition_annual_usd else None,
            is_tuition_verified=um.is_tuition_verified,
            duration_years=float(um.duration_years),
            degree_level=um.degree_level
        )
        for um in m.university_majors
    ]

    careers_related = [
        CareerSummaryOut(
            id=c.id,
            slug=c.slug,
            title=c.title,
            industry=c.industry,
            description=c.description,
            education_level=c.education_level,
            riasec_code=c.riasec_code
        )
        for c in m.careers
    ]

    return ApiResponse(
        success=True,
        data=MajorDetailOut(
            id=m.id,
            slug=m.slug,
            name=m.name,
            category=m.category,
            description=m.description,
            subjects_studied=m.subjects_studied,
            required_skills=m.required_skills,
            potential_challenges=m.potential_challenges,
            riasec_primary=m.riasec_primary,
            riasec_secondary=m.riasec_secondary,
            personality_affinity=m.personality_affinity,
            is_stem=m.is_stem,
            universities_count=len(m.university_majors),
            universities=unis_offering,
            careers=careers_related
        )
    )

