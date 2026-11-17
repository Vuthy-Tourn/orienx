"""Compose the read-only report behind a shared parent/counselor link."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.assessment import PersonalityResult, RiasecResult
from app.models.auth import User
from app.models.catalog import University, UniversityMajor
from app.models.plan import ApplicationPlan
from app.models.preferences import AcademicPreferences
from app.models.profile import StudentProfile
from app.models.recommendation import MajorRecommendation
from app.models.scholarship import Scholarship
from app.models.report import SharedReport

GRADE_RANK = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0}


def _localized(value: Any, language: str) -> str:
    if isinstance(value, dict):
        return str(value.get(language) or value.get("en") or value.get("km") or "")
    return str(value or "")


async def _student_payload(
    db: AsyncSession, share: SharedReport
) -> Dict[str, Any]:
    profile = (
        await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == share.user_id)
        )
    ).scalar_one_or_none()
    user = (
        await db.execute(select(User).where(User.id == share.user_id))
    ).scalar_one_or_none()

    name = (
        (profile.full_name_km if share.language == "km" else profile.full_name_en)
        if profile
        else None
    ) or (profile.full_name_en if profile else None) or (
        user.email.split("@")[0] if user and user.email else "Student"
    )

    student: Dict[str, Any] = {
        "name": name,
        "avatar_url": profile.avatar_url if profile else None,
    }
    if "profile" in set(share.sections or []):
        student.update(
            {
                "high_school": profile.high_school if profile else None,
                "province": profile.province if profile else None,
                "current_education_level": (
                    profile.current_education_level if profile else None
                ),
                "graduation_year": profile.graduation_year if profile else None,
                "bacii_grade": profile.bacii_grade if profile else None,
            }
        )
    return student


async def _assessments_payload(
    db: AsyncSession, share: SharedReport
) -> Dict[str, Any]:
    language = share.language
    personality = (
        await db.execute(
            select(PersonalityResult)
            .where(PersonalityResult.user_id == share.user_id)
            .order_by(PersonalityResult.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    riasec = (
        await db.execute(
            select(RiasecResult)
            .where(RiasecResult.user_id == share.user_id)
            .order_by(RiasecResult.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    preferences = (
        await db.execute(
            select(AcademicPreferences).where(
                AcademicPreferences.user_id == share.user_id
            )
        )
    ).scalar_one_or_none()

    personality_payload = None
    if personality:
        summary = (
            personality.traits_summary_km
            if language == "km"
            else personality.traits_summary_en
        )
        personality_payload = {
            "type": personality.personality_type,
            "summary": summary if isinstance(summary, dict) else {},
        }

    riasec_payload = None
    if riasec:
        summary = (
            riasec.analysis_km if language == "km" else riasec.analysis_en
        )
        riasec_payload = {
            "code": riasec.holland_code,
            "summary": summary if isinstance(summary, dict) else {},
            "scores": {
                "R": float(riasec.realistic_score),
                "I": float(riasec.investigative_score),
                "A": float(riasec.artistic_score),
                "S": float(riasec.social_score),
                "E": float(riasec.enterprising_score),
                "C": float(riasec.conventional_score),
            },
        }

    preferences_payload = None
    if preferences:
        preferences_payload = {
            "favorite_subjects": preferences.favorite_subjects or [],
            "strongest_subjects": preferences.strongest_subjects or [],
            "preferred_locations": preferences.preferred_locations or [],
            "annual_tuition_budget_usd": (
                float(preferences.annual_tuition_budget_usd)
                if preferences.annual_tuition_budget_usd is not None
                else None
            ),
            "requires_scholarship": preferences.requires_scholarship,
        }

    return {
        "personality": personality_payload,
        "riasec": riasec_payload,
        "preferences": preferences_payload,
    }


async def _recommendations_payload(
    db: AsyncSession, share: SharedReport
) -> List[Dict[str, Any]]:
    recommendations = (
        await db.execute(
            select(MajorRecommendation)
            .options(selectinload(MajorRecommendation.major))
            .where(MajorRecommendation.user_id == share.user_id)
            .order_by(MajorRecommendation.rank_position.asc())
            .limit(5)
        )
    ).scalars().all()
    if not recommendations:
        return []

    major_ids = [item.major_id for item in recommendations]
    counts = dict(
        (
            await db.execute(
                select(UniversityMajor.major_id, func.count())
                .where(UniversityMajor.major_id.in_(major_ids))
                .group_by(UniversityMajor.major_id)
            )
        ).all()
    )

    payload: List[Dict[str, Any]] = []
    for item in recommendations:
        explanation = item.explanation if isinstance(item.explanation, dict) else {}
        summary = explanation.get(f"fit_summary_{share.language}") or explanation.get(
            "fit_summary_en"
        )
        payload.append(
            {
                "major": _localized(item.major.name, share.language),
                "category": item.major.category,
                "fit": round(float(item.match_score)),
                "universities": int(counts.get(item.major_id, 0) or 0),
                "summary": summary or "",
            }
        )
    return payload


async def _plans_payload(
    db: AsyncSession, share: SharedReport
) -> List[Dict[str, Any]]:
    plans = (
        await db.execute(
            select(ApplicationPlan)
            .options(selectinload(ApplicationPlan.documents))
            .where(
                ApplicationPlan.user_id == share.user_id,
                ApplicationPlan.status != "REJECTED",
            )
        )
    ).scalars().all()
    if not plans:
        return []

    university_ids = {p.target_id for p in plans if p.kind == "UNIVERSITY"}
    scholarship_ids = {p.target_id for p in plans if p.kind == "SCHOLARSHIP"}
    targets: Dict[uuid.UUID, Any] = {}
    if university_ids:
        for university in (
            await db.execute(
                select(University).where(University.id.in_(university_ids))
            )
        ).scalars():
            targets[university.id] = university.name
    if scholarship_ids:
        for scholarship in (
            await db.execute(
                select(Scholarship).where(Scholarship.id.in_(scholarship_ids))
            )
        ).scalars():
            targets[scholarship.id] = scholarship.title

    payload: List[Dict[str, Any]] = []
    for plan in plans:
        required = [d for d in plan.documents if d.is_required]
        next_due = min(
            (
                d.due_date
                for d in required
                if not d.is_completed and d.due_date is not None
            ),
            default=None,
        )
        payload.append(
            {
                "id": str(plan.id),
                "kind": plan.kind,
                "title": _localized(targets.get(plan.target_id), share.language)
                or "Application",
                "status": plan.status,
                "deadline": plan.deadline.isoformat() if plan.deadline else None,
                "next_action": plan.next_action,
                "documents_total": len(plan.documents),
                "documents_completed": sum(
                    1 for d in plan.documents if d.is_completed
                ),
                "required_total": len(required),
                "required_completed": sum(
                    1 for d in required if d.is_completed
                ),
                "next_document_due_date": (
                    next_due.isoformat() if next_due else None
                ),
            }
        )

    payload.sort(
        key=lambda item: (item["deadline"] is None, item["deadline"] or "")
    )
    return payload[:10]


async def _eligibility_payload(
    db: AsyncSession, share: SharedReport
) -> Dict[str, Any]:
    profile = (
        await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == share.user_id)
        )
    ).scalar_one_or_none()
    grade = (profile.bacii_grade or "").upper() if profile else ""
    if not grade or grade not in GRADE_RANK:
        return {
            "available": False,
            "grade": None,
            "message": (
                "The student has not added a BACII grade yet."
                if share.language == "en"
                else "សិស្សមិនទាន់បានបញ្ចូលពិន្ទុ BACII នៅឡើយទេ។"
            ),
        }

    rows = (
        await db.execute(
            select(
                UniversityMajor.min_bacii_grade,
                UniversityMajor.degree_level,
            ).where(
                UniversityMajor.is_admission_verified == True,
                UniversityMajor.min_bacii_grade.isnot(None),
            )
        )
    ).all()
    student_rank = GRADE_RANK[grade]
    within_reach = 0
    higher_requirement = 0
    associate_within = 0
    bachelor_within = 0
    for minimum, degree_level in rows:
        minimum_rank = GRADE_RANK.get(str(minimum or "").upper())
        if minimum_rank is None:
            continue
        if minimum_rank <= student_rank:
            within_reach += 1
            if degree_level == "ASSOCIATE":
                associate_within += 1
            elif degree_level == "BACHELOR":
                bachelor_within += 1
        else:
            higher_requirement += 1

    return {
        "available": True,
        "grade": grade,
        "verified_programs": len(rows),
        "within_reach": within_reach,
        "higher_requirement": higher_requirement,
        "associate_within_reach": associate_within,
        "bachelor_within_reach": bachelor_within,
        "note": (
            "Based on the minimum BACII grade published for each verified program."
            if share.language == "en"
            else "ផ្អែកលើពិន្ទុ BACII អប្បបរមាដែលបានផ្សាយសម្រាប់កម្មវិធីដែលបានផ្ទៀងផ្ទាត់នីមួយៗ។"
        ),
    }


async def build_shared_report(
    db: AsyncSession, share: SharedReport
) -> Dict[str, Any]:
    sections = set(share.sections or [])
    payload: Dict[str, Any] = {
        "token": share.token,
        "audience": share.audience,
        "language": share.language,
        "note": share.note,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": share.expires_at.isoformat(),
        "student": await _student_payload(db, share),
    }
    if "assessments" in sections:
        payload["assessments"] = await _assessments_payload(db, share)
    if "recommendations" in sections:
        payload["recommendations"] = await _recommendations_payload(db, share)
    if "plans" in sections:
        payload["plans"] = await _plans_payload(db, share)
    if "eligibility" in sections:
        payload["eligibility"] = await _eligibility_payload(db, share)
    return payload
