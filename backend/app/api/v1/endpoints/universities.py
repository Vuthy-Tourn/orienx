import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.catalog import University, Faculty, Major, UniversityMajor
from app.schemas.catalog import UniversitySummaryOut, UniversityDetailOut, UniversityOfferingOut, UniversityCompareOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[UniversitySummaryOut]])
async def list_universities(
    q: Optional[str] = Query(None, description="Search by name, acronym, or province"),
    province: Optional[str] = Query(None, description="Filter by Cambodian province"),
    university_type: Optional[str] = Query(None, description="PUBLIC or PRIVATE"),
    max_tuition: Optional[float] = Query(None, description="Maximum annual tuition USD"),
    major: Optional[str] = Query(None, description="Filter by major slug"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(University)
        .options(selectinload(University.university_majors))
        .where(University.is_verified == True)
    )

    if major:
        stmt = (
            stmt.join(UniversityMajor, UniversityMajor.university_id == University.id)
            .join(Major, UniversityMajor.major_id == Major.id)
            .where(func.lower(Major.slug) == major.lower())
            .distinct()
        )

    if province:
        stmt = stmt.where(func.lower(University.province) == province.lower())

    if university_type:
        stmt = stmt.where(University.university_type == university_type.upper())

    if max_tuition is not None:
        stmt = stmt.where(
            or_(
                University.tuition_range_min_usd <= max_tuition,
                University.tuition_range_min_usd == None
            )
        )

    res = await db.execute(stmt)
    all_unis = res.scalars().all()

    # Filter by search string in python for localized JSONB name & acronym
    if q:
        q_lower = q.lower()
        filtered = []
        for u in all_unis:
            name_en = str(u.name.get("en", "")).lower()
            name_km = str(u.name.get("km", "")).lower()
            acro_en = str(u.acronym.get("en", "")).lower()
            acro_km = str(u.acronym.get("km", "")).lower()
            prov = str(u.province).lower()
            if q_lower in name_en or q_lower in name_km or q_lower in acro_en or q_lower in acro_km or q_lower in prov:
                filtered.append(u)
        all_unis = filtered

    total = len(all_unis)
    start = (page - 1) * limit
    paginated = all_unis[start:start + limit]

    data = [
        UniversitySummaryOut(
            id=u.id,
            slug=u.slug,
            name=u.name,
            acronym=u.acronym,
            description=u.description,
            university_type=u.university_type,
            logo_url=u.logo_url,
            cover_image_url=u.cover_image_url,
            province=u.province,
            website_url=u.website_url,
            tuition_range_min_usd=float(u.tuition_range_min_usd) if u.tuition_range_min_usd else None,
            tuition_range_max_usd=float(u.tuition_range_max_usd) if u.tuition_range_max_usd else None,
            is_tuition_verified=u.is_tuition_verified,
            is_verified=u.is_verified,
            majors_count=len(u.university_majors)
        )
        for u in paginated
    ]

    return ApiResponse(
        success=True,
        data=data,
        meta={"page": page, "limit": limit, "total": total}
    )


@router.get("/compare", response_model=ApiResponse[UniversityCompareOut])
async def compare_universities(
    ids: str = Query(..., description="Comma-separated UUIDs or slugs of universities to compare (up to 4)"),
    db: AsyncSession = Depends(get_db)
):
    id_list = [item.strip() for item in ids.split(",") if item.strip()][:4]
    if len(id_list) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide at least 2 universities to compare")

    parsed_uuids = []
    slug_list = []
    for item in id_list:
        try:
            parsed_uuids.append(uuid.UUID(item))
        except ValueError:
            slug_list.append(item)

    stmt = (
        select(University)
        .options(
            selectinload(University.university_majors).selectinload(UniversityMajor.major)
        )
        .where(
            or_(
                University.id.in_(parsed_uuids),
                University.slug.in_(slug_list)
            )
        )
    )
    res = await db.execute(stmt)
    unis = res.scalars().all()

    detail_list = []
    for u in unis:
        offerings = [
            UniversityOfferingOut(
                major_id=um.major.id,
                major_slug=um.major.slug,
                major_name=um.major.name,
                major_category=um.major.category,
                major_image_url=um.major.image_url,
                degree_level=um.degree_level,
                duration_years=float(um.duration_years),
                tuition_annual_usd=float(um.tuition_annual_usd) if um.tuition_annual_usd else None,
                is_tuition_verified=um.is_tuition_verified,
                language_of_instruction=um.language_of_instruction,
                min_bacii_grade=um.min_bacii_grade,
                required_subjects=um.required_subjects,
                is_admission_verified=um.is_admission_verified,
                admission_source_url=um.admission_source_url,
                admission_notes=(
                    um.admission_criteria.get("notes")
                    if isinstance(um.admission_criteria, dict)
                    else None
                ),
            )
            for um in u.university_majors
        ]
        detail_list.append(
            UniversityDetailOut(
                id=u.id,
                slug=u.slug,
                name=u.name,
                acronym=u.acronym,
                description=u.description,
                university_type=u.university_type,
                logo_url=u.logo_url,
                cover_image_url=u.cover_image_url,
                province=u.province,
                address=u.address,
                website_url=u.website_url,
                contact_email=u.contact_email,
                contact_phone=u.contact_phone,
                established_year=u.established_year,
                tuition_range_min_usd=float(u.tuition_range_min_usd) if u.tuition_range_min_usd else None,
                tuition_range_max_usd=float(u.tuition_range_max_usd) if u.tuition_range_max_usd else None,
                is_tuition_verified=u.is_tuition_verified,
                admission_requirements=u.admission_requirements,
                facilities=u.facilities,
                scholarship_summary=u.scholarship_summary,
                is_verified=u.is_verified,
                majors_count=len(u.university_majors),
                offerings=offerings
            )
        )

    return ApiResponse(success=True, data=UniversityCompareOut(universities=detail_list))


@router.get("/{slug}", response_model=ApiResponse[UniversityDetailOut])
async def get_university_detail(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(University)
        .options(
            selectinload(University.university_majors).selectinload(UniversityMajor.major)
        )
        .where(
            or_(
                University.slug == slug,
                University.id == uuid.UUID(slug) if len(slug) == 36 and "-" in slug else False
            )
        )
    )
    res = await db.execute(stmt)
    u = res.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")

    offerings = [
        UniversityOfferingOut(
            major_id=um.major.id,
            major_slug=um.major.slug,
            major_name=um.major.name,
            major_category=um.major.category,
            major_image_url=um.major.image_url,
            degree_level=um.degree_level,
            duration_years=float(um.duration_years),
            tuition_annual_usd=float(um.tuition_annual_usd) if um.tuition_annual_usd else None,
            is_tuition_verified=um.is_tuition_verified,
            language_of_instruction=um.language_of_instruction,
            min_bacii_grade=um.min_bacii_grade,
            required_subjects=um.required_subjects,
            is_admission_verified=um.is_admission_verified,
            admission_source_url=um.admission_source_url,
        )
        for um in u.university_majors
    ]

    return ApiResponse(
        success=True,
        data=UniversityDetailOut(
            id=u.id,
            slug=u.slug,
            name=u.name,
            acronym=u.acronym,
            description=u.description,
            university_type=u.university_type,
            logo_url=u.logo_url,
            cover_image_url=u.cover_image_url,
            province=u.province,
            address=u.address,
            website_url=u.website_url,
            contact_email=u.contact_email,
            contact_phone=u.contact_phone,
            established_year=u.established_year,
            tuition_range_min_usd=float(u.tuition_range_min_usd) if u.tuition_range_min_usd else None,
            tuition_range_max_usd=float(u.tuition_range_max_usd) if u.tuition_range_max_usd else None,
            is_tuition_verified=u.is_tuition_verified,
            admission_requirements=u.admission_requirements,
            facilities=u.facilities,
            scholarship_summary=u.scholarship_summary,
            is_verified=u.is_verified,
            majors_count=len(u.university_majors),
            offerings=offerings
        )
    )

