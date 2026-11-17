from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.catalog import Career, Major, University
from app.models.scholarship import Scholarship
from app.schemas.common import ApiResponse

router = APIRouter()


def _localized(value: Any, key: str = "en") -> str:
    if isinstance(value, dict):
        return str(value.get(key) or value.get("en") or value.get("km") or "")
    return str(value or "")


def _rank(haystacks: List[str], needle: str) -> tuple[int, int, int] | None:
    best: tuple[int, int, int] | None = None
    for text in haystacks:
        lowered = text.lower()
        position = lowered.find(needle)
        if position < 0:
            continue
        candidate = (0 if lowered.startswith(needle) else 1, position, len(lowered))
        if best is None or candidate < best:
            best = candidate
    return best


@router.get("", response_model=ApiResponse[Dict[str, Any]])
async def global_search(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    needle = q.strip().lower()
    if not needle:
        return ApiResponse(
            success=True,
            data={
                "query": q,
                "total": 0,
                "universities": [],
                "majors": [],
                "careers": [],
                "scholarships": [],
            },
        )

    universities = (
        await db.execute(
            select(University).where(University.is_verified == True)
        )
    ).scalars().all()
    majors = (await db.execute(select(Major))).scalars().all()
    careers = (await db.execute(select(Career))).scalars().all()
    scholarships = (
        await db.execute(
            select(Scholarship).where(Scholarship.is_verified == True)
        )
    ).scalars().all()

    ranked_universities = []
    for university in universities:
        rank = _rank(
            [
                _localized(university.name, "en"),
                _localized(university.name, "km"),
                _localized(university.acronym, "en"),
                _localized(university.acronym, "km"),
                university.province or "",
            ],
            needle,
        )
        if rank:
            ranked_universities.append((rank, university))
    ranked_universities.sort(key=lambda item: item[0])

    ranked_majors = []
    for major in majors:
        rank = _rank(
            [
                _localized(major.name, "en"),
                _localized(major.name, "km"),
                major.category or "",
            ],
            needle,
        )
        if rank:
            ranked_majors.append((rank, major))
    ranked_majors.sort(key=lambda item: item[0])

    ranked_careers = []
    for career in careers:
        rank = _rank(
            [
                _localized(career.title, "en"),
                _localized(career.title, "km"),
                career.industry or "",
            ],
            needle,
        )
        if rank:
            ranked_careers.append((rank, career))
    ranked_careers.sort(key=lambda item: item[0])

    ranked_scholarships = []
    for scholarship in scholarships:
        rank = _rank(
            [
                _localized(scholarship.title, "en"),
                _localized(scholarship.title, "km"),
                _localized(scholarship.provider, "en"),
                _localized(scholarship.provider, "km"),
                scholarship.country_or_institution or "",
            ],
            needle,
        )
        if rank:
            ranked_scholarships.append((rank, scholarship))
    ranked_scholarships.sort(key=lambda item: item[0])

    university_results = [
        {
            "id": str(university.id),
            "slug": university.slug,
            "name": university.name,
            "acronym": university.acronym,
            "province": university.province,
            "university_type": university.university_type,
            "logo_url": university.logo_url,
        }
        for _, university in ranked_universities[:limit]
    ]
    major_results = [
        {
            "id": str(major.id),
            "slug": major.slug,
            "name": major.name,
            "category": major.category,
            "riasec_primary": major.riasec_primary,
            "universities_count": len(major.university_majors),
        }
        for _, major in ranked_majors[:limit]
    ]
    career_results = [
        {
            "id": str(career.id),
            "slug": career.slug,
            "title": career.title,
            "industry": career.industry,
            "riasec_code": career.riasec_code,
        }
        for _, career in ranked_careers[:limit]
    ]
    scholarship_results = [
        {
            "id": str(scholarship.id),
            "slug": scholarship.slug,
            "title": scholarship.title,
            "provider": scholarship.provider,
            "coverage_type": scholarship.coverage_type,
            "application_deadline": (
                scholarship.application_deadline.isoformat()
                if scholarship.application_deadline
                else None
            ),
            "poster_url": scholarship.poster_url,
        }
        for _, scholarship in ranked_scholarships[:limit]
    ]

    total = (
        len(ranked_universities)
        + len(ranked_majors)
        + len(ranked_careers)
        + len(ranked_scholarships)
    )
    return ApiResponse(
        success=True,
        data={
            "query": q,
            "total": total,
            "universities": university_results,
            "majors": major_results,
            "careers": career_results,
            "scholarships": scholarship_results,
        },
    )
