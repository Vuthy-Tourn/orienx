#!/usr/bin/env python3
"""Export public catalog and assessment content to static JSON.

The Vercel-only guest build must not call the FastAPI backend at runtime.
This script snapshots only public data (no users, emails, plans, or
applications) into ``frontend/src/data/static``.

Usage:
    ./venv/bin/python scripts/export_static_data.py
    ./venv/bin/python scripts/export_static_data.py --check
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import shutil
import sys
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any
from uuid import UUID

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.assessment import PersonalityQuestion, RiasecQuestion
from app.models.catalog import Career, Major, University, UniversityMajor
from app.models.scholarship import Scholarship

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "frontend" / "src" / "data" / "static"
SCHEMA_VERSION = 1


def jsonable(value: Any) -> Any:
    """Convert SQLAlchemy/Python values into JSON-safe values."""
    if isinstance(value, str) and value.startswith("/api/v1/uploads/"):
        return value.replace("/api/v1/uploads/", "/uploads/", 1)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, dict):
        return {str(key): jsonable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [jsonable(item) for item in value]
    return value


def localized(value: Any) -> dict[str, str]:
    if isinstance(value, dict):
        return {
            "en": str(value.get("en") or ""),
            "km": str(value.get("km") or ""),
        }
    return {"en": str(value or ""), "km": ""}


def university_summary(university: University, majors_count: int) -> dict[str, Any]:
    return {
        "id": university.id,
        "slug": university.slug,
        "name": localized(university.name),
        "acronym": localized(university.acronym),
        "description": localized(university.description),
        "university_type": university.university_type,
        "logo_url": university.logo_url,
        "cover_image_url": university.cover_image_url,
        "province": university.province,
        "website_url": university.website_url,
        "tuition_range_min_usd": university.tuition_range_min_usd,
        "tuition_range_max_usd": university.tuition_range_max_usd,
        "is_tuition_verified": university.is_tuition_verified,
        "is_verified": university.is_verified,
        "majors_count": majors_count,
    }


def university_detail(university: University) -> dict[str, Any]:
    offerings = [
        {
            "major_id": offering.major_id,
            "major_slug": offering.major.slug,
            "major_name": localized(offering.major.name),
            "major_category": offering.major.category,
            "major_image_url": offering.major.image_url,
            "degree_level": offering.degree_level,
            "duration_years": offering.duration_years,
            "tuition_annual_usd": offering.tuition_annual_usd,
            "is_tuition_verified": offering.is_tuition_verified,
            "language_of_instruction": offering.language_of_instruction,
            "min_bacii_grade": offering.min_bacii_grade,
            "required_subjects": offering.required_subjects,
            "is_admission_verified": offering.is_admission_verified,
            "admission_source_url": offering.admission_source_url,
            "admission_notes": (
                offering.admission_criteria.get("notes")
                if isinstance(offering.admission_criteria, dict)
                else None
            ),
        }
        for offering in sorted(
            university.university_majors,
            key=lambda item: (item.major.slug, item.degree_level),
        )
    ]
    detail = university_summary(university, len(offerings))
    detail.update(
        {
            "address": localized(university.address),
            "contact_email": university.contact_email,
            "contact_phone": university.contact_phone,
            "established_year": university.established_year,
            "admission_requirements": university.admission_requirements,
            "facilities": university.facilities,
            "scholarship_summary": university.scholarship_summary,
            "offerings": offerings,
        }
    )
    return detail


def career_summary(career: Career) -> dict[str, Any]:
    return {
        "id": career.id,
        "slug": career.slug,
        "title": localized(career.title),
        "industry": career.industry,
        "description": localized(career.description),
        "education_level": career.education_level,
        "riasec_code": career.riasec_code,
    }


def career_detail(career: Career) -> dict[str, Any]:
    detail = career_summary(career)
    detail.update(
        {
            "responsibilities": career.responsibilities,
            "required_skills": career.required_skills,
            "work_environments": career.work_environments,
            "career_progression": career.career_progression,
            "related_majors": [
                {
                    "id": major.id,
                    "slug": major.slug,
                    "name": localized(major.name),
                    "category": major.category,
                }
                for major in sorted(career.majors, key=lambda item: item.slug)
            ],
        }
    )
    return detail


def major_summary(major: Major, offerings: list[UniversityMajor]) -> dict[str, Any]:
    return {
        "id": major.id,
        "slug": major.slug,
        "name": localized(major.name),
        "category": major.category,
        "description": localized(major.description),
        "riasec_primary": major.riasec_primary,
        "riasec_secondary": major.riasec_secondary,
        "personality_affinity": major.personality_affinity,
        "image_url": major.image_url,
        "is_stem": major.is_stem,
        "universities_count": len(offerings),
        "min_tuition_usd": min(
            (
                float(offering.tuition_annual_usd)
                for offering in offerings
                if offering.tuition_annual_usd is not None
            ),
            default=None,
        ),
    }


def major_detail(major: Major) -> dict[str, Any]:
    offerings = list(major.university_majors)
    detail = major_summary(major, offerings)
    detail.update(
        {
            "subjects_studied": major.subjects_studied,
            "required_skills": major.required_skills,
            "potential_challenges": major.potential_challenges,
            "universities": [
                {
                    "university_id": offering.university.id,
                    "university_slug": offering.university.slug,
                    "university_name": localized(offering.university.name),
                    "university_acronym": localized(offering.university.acronym),
                    "university_type": offering.university.university_type,
                    "province": offering.university.province,
                    "tuition_annual_usd": offering.tuition_annual_usd,
                    "is_tuition_verified": offering.is_tuition_verified,
                    "duration_years": offering.duration_years,
                    "degree_level": offering.degree_level,
                    "logo_url": offering.university.logo_url,
                }
                for offering in sorted(
                    offerings, key=lambda item: item.university.slug
                )
            ],
            "careers": [career_summary(career) for career in major.careers],
        }
    )
    return detail


def scholarship_summary(scholarship: Scholarship) -> dict[str, Any]:
    return {
        "id": scholarship.id,
        "slug": scholarship.slug,
        "title": localized(scholarship.title),
        "provider": localized(scholarship.provider),
        "description": localized(scholarship.description),
        "coverage_type": scholarship.coverage_type,
        "coverage_percentage": scholarship.coverage_percentage,
        "country_or_institution": scholarship.country_or_institution,
        "application_deadline": scholarship.application_deadline,
        "official_url": scholarship.official_url,
        "source_name": scholarship.source_name,
        "last_verified_at": scholarship.last_verified_at,
        "poster_url": scholarship.poster_url,
        "is_verified": scholarship.is_verified,
    }


def scholarship_detail(scholarship: Scholarship) -> dict[str, Any]:
    detail = scholarship_summary(scholarship)
    detail.update(
        {
            "eligibility_criteria": scholarship.eligibility_criteria,
            "academic_requirements": scholarship.academic_requirements,
            "application_process": scholarship.application_process,
            "eligible_majors": [
                {
                    "id": major.id,
                    "slug": major.slug,
                    "name": localized(major.name),
                    "category": major.category,
                }
                for major in sorted(
                    scholarship.eligible_majors, key=lambda item: item.slug
                )
            ],
        }
    )
    return detail


def offering_row(offering: UniversityMajor) -> dict[str, Any]:
    return {
        "id": offering.id,
        "university_id": offering.university_id,
        "university_slug": offering.university.slug,
        "university_name": localized(offering.university.name),
        "university_acronym": localized(offering.university.acronym),
        "university_type": offering.university.university_type,
        "university_province": offering.university.province,
        "university_logo_url": offering.university.logo_url,
        "major_id": offering.major_id,
        "major_slug": offering.major.slug,
        "major_name": localized(offering.major.name),
        "major_category": offering.major.category,
        "major_image_url": offering.major.image_url,
        "degree_level": offering.degree_level,
        "duration_years": offering.duration_years,
        "tuition_annual_usd": offering.tuition_annual_usd,
        "is_tuition_verified": offering.is_tuition_verified,
        "language_of_instruction": offering.language_of_instruction,
        "min_bacii_grade": offering.min_bacii_grade,
        "required_subjects": offering.required_subjects,
        "is_admission_verified": offering.is_admission_verified,
        "admission_source_url": offering.admission_source_url,
        "admission_notes": (
            offering.admission_criteria.get("notes")
            if isinstance(offering.admission_criteria, dict)
            else None
        ),
    }


def build_search_index(
    universities: list[dict[str, Any]],
    majors: list[dict[str, Any]],
    careers: list[dict[str, Any]],
    scholarships: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for university in universities:
        entries.append(
            {
                "type": "university",
                "id": university["id"],
                "slug": university["slug"],
                "title": university["name"],
                "subtitle": university["acronym"],
                "keywords": [
                    university["province"],
                    university["university_type"],
                ],
                "href": f"/universities/{university['slug']}",
            }
        )
    for major in majors:
        entries.append(
            {
                "type": "major",
                "id": major["id"],
                "slug": major["slug"],
                "title": major["name"],
                "subtitle": {"en": major["category"], "km": major["category"]},
                "keywords": [
                    major["category"],
                    major["riasec_primary"],
                    major["riasec_secondary"],
                ],
                "href": f"/majors/{major['slug']}",
            }
        )
    for career in careers:
        entries.append(
            {
                "type": "career",
                "id": career["id"],
                "slug": career["slug"],
                "title": career["title"],
                "subtitle": {"en": career["industry"], "km": career["industry"]},
                "keywords": [career["industry"], career["riasec_code"]],
                "href": f"/careers/{career['slug']}",
            }
        )
    for scholarship in scholarships:
        entries.append(
            {
                "type": "scholarship",
                "id": scholarship["id"],
                "slug": scholarship["slug"],
                "title": scholarship["title"],
                "subtitle": scholarship["provider"],
                "keywords": [
                    scholarship["coverage_type"],
                    scholarship["country_or_institution"],
                ],
                "href": f"/scholarships/{scholarship['slug']}",
            }
        )
    return entries


async def collect() -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        universities = (
            await db.execute(
                select(University)
                .options(
                    selectinload(University.university_majors).selectinload(
                        UniversityMajor.major
                    )
                )
                .where(University.is_verified.is_(True))
                .order_by(University.slug.asc())
            )
        ).scalars().all()

        majors = (
            await db.execute(
                select(Major)
                .options(
                    selectinload(Major.university_majors).selectinload(
                        UniversityMajor.university
                    ),
                    selectinload(Major.careers),
                )
                .order_by(Major.slug.asc())
            )
        ).scalars().all()

        careers = (
            await db.execute(
                select(Career)
                .options(selectinload(Career.majors))
                .order_by(Career.slug.asc())
            )
        ).scalars().all()

        scholarships = (
            await db.execute(
                select(Scholarship)
                .options(selectinload(Scholarship.eligible_majors))
                .where(Scholarship.is_verified.is_(True))
                .order_by(Scholarship.slug.asc())
            )
        ).scalars().all()

        personality_questions = (
            await db.execute(
                select(PersonalityQuestion)
                .options(selectinload(PersonalityQuestion.options))
                .where(PersonalityQuestion.is_active.is_(True))
                .order_by(PersonalityQuestion.order_index.asc())
            )
        ).scalars().all()

        riasec_questions = (
            await db.execute(
                select(RiasecQuestion)
                .where(RiasecQuestion.is_active.is_(True))
                .order_by(RiasecQuestion.order_index.asc())
            )
        ).scalars().all()

    university_rows = [university_detail(university) for university in universities]
    major_rows = [major_detail(major) for major in majors]
    career_rows = [career_detail(career) for career in careers]
    scholarship_rows = [scholarship_detail(scholarship) for scholarship in scholarships]

    offerings: list[dict[str, Any]] = []
    for university in universities:
        for offering in university.university_majors:
            offerings.append(offering_row(offering))
    offerings.sort(
        key=lambda item: (
            item["university_slug"],
            item["major_slug"],
            item["degree_level"],
        )
    )

    personality_rows = [
        {
            "id": question.id,
            "dimension": question.dimension,
            "prompt": {"en": question.prompt_en, "km": question.prompt_km},
            "order_index": question.order_index,
            "options": [
                {
                    "id": option.id,
                    "label": {"en": option.label_en, "km": option.label_km},
                    "target_trait": option.target_trait,
                    "weight": option.weight,
                    "order_index": option.order_index,
                }
                for option in sorted(
                    question.options, key=lambda item: item.order_index
                )
            ],
        }
        for question in personality_questions
    ]

    riasec_rows = [
        {
            "id": question.id,
            "category": question.category,
            "prompt": {"en": question.prompt_en, "km": question.prompt_km},
            "order_index": question.order_index,
        }
        for question in riasec_questions
    ]

    search_index = build_search_index(
        university_rows, major_rows, career_rows, scholarship_rows
    )

    # Compact rows for the in-browser recommendation engine. Keeping this
    # separate avoids shipping full major descriptions and offerings to the
    # assessment pages.
    major_fits = [
        {
            "slug": major["slug"],
            "name": major["name"],
            "category": major["category"],
            "riasec_primary": major["riasec_primary"],
            "riasec_secondary": major["riasec_secondary"],
            "personality_affinity": major["personality_affinity"],
            "is_stem": major["is_stem"],
            "universities_count": major["universities_count"],
            "min_tuition_usd": major["min_tuition_usd"],
            "image_url": major["image_url"],
        }
        for major in major_rows
    ]

    data_version = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    payload = {
        "meta.json": {
            "schemaVersion": SCHEMA_VERSION,
            "dataVersion": data_version,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "source": "FastAPI/Postgres catalog snapshot",
            "counts": {
                "universities": len(university_rows),
                "majors": len(major_rows),
                "offerings": len(offerings),
                "careers": len(career_rows),
                "scholarships": len(scholarship_rows),
                "personalityQuestions": len(personality_rows),
                "riasecQuestions": len(riasec_rows),
            },
        },
        "universities.json": university_rows,
        "majors.json": major_rows,
        "major-fits.json": major_fits,
        "offerings.json": offerings,
        "careers.json": career_rows,
        "scholarships.json": scholarship_rows,
        "personality-questions.json": personality_rows,
        "riasec-questions.json": riasec_rows,
        "search-index.json": search_index,
    }

    data_hash = hashlib.sha256(
        "".join(
            serialize(payload[key])
            for key in sorted(payload)
            if key != "meta.json"
        ).encode("utf-8")
    ).hexdigest()[:8]
    payload["meta.json"]["dataVersion"] = f"{data_version}+{data_hash}"
    return payload


def serialize(value: Any) -> str:
    return json.dumps(
        jsonable(value),
        ensure_ascii=False,
        indent=2,
        sort_keys=False,
    ) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output directory (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Fail if the committed JSON differs from the database snapshot.",
    )
    args = parser.parse_args()

    payload = asyncio.run(collect())
    args.output.mkdir(parents=True, exist_ok=True)

    uploads_source = BACKEND_ROOT / "uploads"
    uploads_target = ROOT / "frontend" / "public" / "uploads"
    if uploads_source.exists() and not args.check:
        uploads_target.mkdir(parents=True, exist_ok=True)
        for file in uploads_source.iterdir():
            if file.is_file():
                shutil.copy2(file, uploads_target / file.name)

    changed: list[str] = []
    for filename, value in payload.items():
        target = args.output / filename
        content = serialize(value)
        if args.check:
            if not target.exists():
                changed.append(filename)
                continue
            try:
                existing_obj = json.loads(target.read_text(encoding="utf-8"))
                expected_obj = json.loads(content)
            except json.JSONDecodeError:
                changed.append(filename)
                continue
            if filename == "meta.json":
                existing_obj.pop("generatedAt", None)
                expected_obj.pop("generatedAt", None)
            if existing_obj != expected_obj:
                changed.append(filename)
            continue
        target.write_text(content, encoding="utf-8")
        print(f"wrote {target.relative_to(ROOT)}")

    if args.check and changed:
        print(
            "Static data is stale: " + ", ".join(changed),
            file=sys.stderr,
        )
        return 1

    if args.check:
        print("Static data is up to date.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
