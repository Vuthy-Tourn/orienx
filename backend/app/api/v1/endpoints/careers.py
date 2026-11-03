import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.catalog import Career, Major
from app.schemas.catalog import CareerSummaryOut, CareerDetailOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[CareerSummaryOut]])
async def list_careers(
    industry: Optional[str] = Query(None, description="Filter by career industry"),
    riasec: Optional[str] = Query(None, description="Filter by RIASEC Holland code"),
    q: Optional[str] = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Career)
    if industry:
        stmt = stmt.where(Career.industry == industry)
    if riasec:
        stmt = stmt.where(Career.riasec_code.ilike(f"%{riasec}%"))

    res = await db.execute(stmt)
    careers = res.scalars().all()

    if q:
        q_lower = q.lower()
        filtered = []
        for c in careers:
            tit_en = str(c.title.get("en", "")).lower()
            tit_km = str(c.title.get("km", "")).lower()
            ind = str(c.industry).lower()
            if q_lower in tit_en or q_lower in tit_km or q_lower in ind:
                filtered.append(c)
        careers = filtered

    total = len(careers)
    start = (page - 1) * limit
    paginated = careers[start:start + limit]

    data = [
        CareerSummaryOut(
            id=c.id,
            slug=c.slug,
            title=c.title,
            industry=c.industry,
            description=c.description,
            education_level=c.education_level,
            riasec_code=c.riasec_code
        )
        for c in paginated
    ]
    return ApiResponse(success=True, data=data, meta={"page": page, "limit": limit, "total": total})


@router.get("/{slug}", response_model=ApiResponse[CareerDetailOut])
async def get_career_detail(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Career)
        .options(selectinload(Career.majors))
        .where(
            or_(
                Career.slug == slug,
                Career.id == uuid.UUID(slug) if len(slug) == 36 and "-" in slug else False
            )
        )
    )
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career not found")

    related_majors = [
        {
            "id": str(m.id),
            "slug": m.slug,
            "name": m.name,
            "category": m.category
        }
        for m in c.majors
    ]

    return ApiResponse(
        success=True,
        data=CareerDetailOut(
            id=c.id,
            slug=c.slug,
            title=c.title,
            industry=c.industry,
            description=c.description,
            education_level=c.education_level,
            riasec_code=c.riasec_code,
            responsibilities=c.responsibilities,
            required_skills=c.required_skills,
            work_environments=c.work_environments,
            career_progression=c.career_progression,
            related_majors=related_majors
        )
    )

