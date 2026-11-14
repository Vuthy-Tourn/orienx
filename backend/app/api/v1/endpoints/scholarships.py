import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.auth import User
from app.models.scholarship import Scholarship
from app.models.favorites import FavoriteScholarship
from app.schemas.scholarship import ScholarshipSummaryOut, ScholarshipDetailOut, ScholarshipTrackIn
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[ScholarshipSummaryOut]])
async def list_scholarships(
    coverage_type: Optional[str] = Query(None, description="FULL_TUITION, PARTIAL_TUITION, etc."),
    q: Optional[str] = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Scholarship).where(Scholarship.is_verified == True)
    if coverage_type:
        stmt = stmt.where(Scholarship.coverage_type == coverage_type.upper())

    res = await db.execute(stmt)
    scholarships = res.scalars().all()

    if q:
        q_lower = q.lower()
        filtered = []
        for s in scholarships:
            tit_en = str(s.title.get("en", "")).lower()
            tit_km = str(s.title.get("km", "")).lower()
            prov_en = str(s.provider.get("en", "")).lower()
            if q_lower in tit_en or q_lower in tit_km or q_lower in prov_en:
                filtered.append(s)
        scholarships = filtered

    total = len(scholarships)
    start = (page - 1) * limit
    paginated = scholarships[start:start + limit]

    data = [
        ScholarshipSummaryOut(
            id=s.id,
            slug=s.slug,
            title=s.title,
            provider=s.provider,
            description=s.description,
            coverage_type=s.coverage_type,
            coverage_percentage=s.coverage_percentage,
            country_or_institution=s.country_or_institution,
            application_deadline=s.application_deadline,
            official_url=s.official_url,
            source_name=s.source_name,
            last_verified_at=s.last_verified_at,
            poster_url=s.poster_url,
            is_verified=s.is_verified
        )
        for s in paginated
    ]
    return ApiResponse(success=True, data=data, meta={"page": page, "limit": limit, "total": total})


@router.get("/{slug}", response_model=ApiResponse[ScholarshipDetailOut])
async def get_scholarship_detail(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Scholarship).where(
        or_(
            Scholarship.slug == slug,
            Scholarship.id == uuid.UUID(slug) if len(slug) == 36 and "-" in slug else False
        )
    )
    res = await db.execute(stmt)
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scholarship not found")

    return ApiResponse(
        success=True,
        data=ScholarshipDetailOut(
            id=s.id,
            slug=s.slug,
            title=s.title,
            provider=s.provider,
            description=s.description,
            coverage_type=s.coverage_type,
            coverage_percentage=s.coverage_percentage,
            country_or_institution=s.country_or_institution,
            application_deadline=s.application_deadline,
            official_url=s.official_url,
            source_name=s.source_name,
            last_verified_at=s.last_verified_at,
            poster_url=s.poster_url,
            is_verified=s.is_verified,
            eligibility_criteria=s.eligibility_criteria,
            academic_requirements=s.academic_requirements,
            application_process=s.application_process
        )
    )


@router.put("/{id}/track", response_model=ApiResponse[bool])
async def track_scholarship_application(
    id: uuid.UUID,
    body: ScholarshipTrackIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FavoriteScholarship).where(
        FavoriteScholarship.user_id == current_user.id,
        FavoriteScholarship.scholarship_id == id
    )
    res = await db.execute(stmt)
    fav = res.scalar_one_or_none()
    if not fav:
        fav = FavoriteScholarship(
            user_id=current_user.id,
            scholarship_id=id,
            status=body.status,
            notes=body.notes
        )
        db.add(fav)
    else:
        fav.status = body.status
        fav.notes = body.notes

    await db.commit()
    return ApiResponse(success=True, message="Scholarship tracking updated", data=True)

