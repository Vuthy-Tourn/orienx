from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.catalog import UniversityMajor
from app.models.profile import StudentProfile
from app.schemas.admissions import EligibilityOfferingOut, EligibilityOut
from app.schemas.common import ApiResponse

router = APIRouter()

GRADE_RANK = {"A": 6, "B": 5, "C": 4, "D": 3, "E": 2, "F": 1}


def _offering_out(offering: UniversityMajor, status: str, reason: str) -> EligibilityOfferingOut:
    return EligibilityOfferingOut(
        id=offering.id,
        university_id=offering.university_id,
        university_slug=offering.university.slug,
        university_name=offering.university.name
        if isinstance(offering.university.name, dict)
        else {},
        university_acronym=offering.university.acronym
        if isinstance(offering.university.acronym, dict)
        else {},
        university_logo_url=offering.university.logo_url,
        university_province=offering.university.province,
        major_id=offering.major_id,
        major_slug=offering.major.slug,
        major_name=offering.major.name if isinstance(offering.major.name, dict) else {},
        major_category=offering.major.category,
        major_image_url=offering.major.image_url,
        degree_level=offering.degree_level,
        duration_years=float(offering.duration_years or 0),
        tuition_annual_usd=float(offering.tuition_annual_usd)
        if offering.tuition_annual_usd is not None
        else None,
        language_of_instruction=offering.language_of_instruction,
        min_bacii_grade=offering.min_bacii_grade,
        required_subjects=offering.required_subjects,
        is_admission_verified=offering.is_admission_verified,
        admission_source_url=offering.admission_source_url,
        admission_notes=(
            offering.admission_criteria.get("notes")
            if isinstance(offering.admission_criteria, dict)
            else None
        ),
        status=status,
        reason=reason,
    )


@router.get("/eligibility", response_model=ApiResponse[EligibilityOut])
async def check_bacii_eligibility(
    grade: Optional[str] = Query(None, min_length=1, max_length=1),
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    profile = (
        await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        )
    ).scalar_one_or_none()

    effective_grade = (grade or (profile.bacii_grade if profile else None) or "").upper()
    if effective_grade not in GRADE_RANK:
        raise HTTPException(
            status_code=400,
            detail="Provide a BACII grade from A to F",
        )

    rows = (
        await db.execute(
            select(UniversityMajor)
            .options(
                selectinload(UniversityMajor.university),
                selectinload(UniversityMajor.major),
            )
            .where(UniversityMajor.min_bacii_grade.is_not(None))
        )
    ).scalars().all()

    eligible = []
    below = []
    unverified = []
    student_rank = GRADE_RANK[effective_grade]

    for offering in rows:
        minimum = (offering.min_bacii_grade or "").upper()
        if minimum not in GRADE_RANK:
            continue
        if not offering.is_admission_verified:
            unverified.append(
                _offering_out(
                    offering,
                    "UNVERIFIED",
                    "Admission requirement has not been verified against an official source.",
                )
            )
            continue
        if student_rank >= GRADE_RANK[minimum]:
            if minimum == "F" and offering.degree_level == "ASSOCIATE":
                reason = "This associate program publishes a grade F entry option."
            elif minimum == "F":
                reason = "This program publishes a minimum grade of F."
            else:
                reason = f"Meets the minimum published grade of {minimum}."
            eligible.append(
                _offering_out(
                    offering,
                    "ELIGIBLE",
                    reason,
                )
            )
        else:
            below.append(
                _offering_out(
                    offering,
                    "BELOW",
                    f"Requires grade {minimum} or higher.",
                )
            )

    missing_count = (
        await db.execute(
            select(func.count())
            .select_from(UniversityMajor)
            .where(UniversityMajor.min_bacii_grade.is_(None))
        )
    ).scalar() or 0

    return ApiResponse(
        success=True,
        data=EligibilityOut(
            grade=effective_grade,
            total_with_requirements=len(rows),
            eligible=eligible,
            below_requirements=below,
            unverified_requirements=unverified,
            unverified_programs_count=missing_count,
        ),
    )
