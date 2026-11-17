"""Add UHST associate-degree programs from its official admission page.

UHST's official admission tuition table lists grades A-E for bachelor's
programs and grade F for associate programs. The page also lists the five
associate majors added here.

Usage:
    PYTHONPATH=. ./venv/bin/python scripts/add_uhst_associate.py --dry-run
    PYTHONPATH=. ./venv/bin/python scripts/add_uhst_associate.py
"""

import argparse
import asyncio
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.catalog import Major, University, UniversityMajor

CHECKED_AT = date.today().isoformat()
SOURCE_URL = "https://www.uhst.edu.kh/study/admission"
NOTES = (
    "UHST's official admission tuition table lists grade F for associate "
    "programs. Associate programs are two years."
)

PROGRAMS = [
    {
        "major_slug": "agronomy-agricultural-sciences",
        "language_of_instruction": "KHMER",
        "tuition_annual_usd": 450.00,
    },
    {
        "major_slug": "business-administration",
        "language_of_instruction": "KHMER",
        "tuition_annual_usd": 450.00,
    },
    {
        "major_slug": "accounting-auditing",
        "language_of_instruction": "KHMER",
        "tuition_annual_usd": 450.00,
    },
    {
        "major_slug": "english-teaching-tefl",
        "language_of_instruction": "ENGLISH",
        "tuition_annual_usd": 450.00,
    },
    {
        "major_slug": "computer-science",
        "language_of_instruction": "BILINGUAL",
        "tuition_annual_usd": 450.00,
    },
]


async def upsert_offering(
    db: AsyncSession,
    university: University,
    major: Major,
    program: dict,
    apply: bool,
) -> bool:
    existing = (
        await db.execute(
            select(UniversityMajor).where(
                UniversityMajor.university_id == university.id,
                UniversityMajor.major_id == major.id,
                UniversityMajor.degree_level == "ASSOCIATE",
                UniversityMajor.language_of_instruction
                == program["language_of_instruction"],
            )
        )
    ).scalar_one_or_none()

    values = {
        "degree_level": "ASSOCIATE",
        "duration_years": 2.0,
        "tuition_annual_usd": program["tuition_annual_usd"],
        "is_tuition_verified": True,
        "language_of_instruction": program["language_of_instruction"],
        "official_curriculum_url": SOURCE_URL,
        "min_bacii_grade": "F",
        "required_subjects": None,
        "is_admission_verified": True,
        "admission_source_url": SOURCE_URL,
        "admission_criteria": {
            "notes": NOTES,
            "scope": "university-published",
            "degree_level": "ASSOCIATE",
            "checked_at": CHECKED_AT,
        },
    }

    if existing:
        if apply:
            for field, value in values.items():
                setattr(existing, field, value)
        return False

    offering = UniversityMajor(
        university_id=university.id,
        major_id=major.id,
        **values,
    )
    if apply:
        db.add(offering)
    return True


async def main(apply: bool) -> None:
    async with AsyncSessionLocal() as db:
        university = (
            await db.execute(select(University).where(University.slug == "uhst"))
        ).scalar_one_or_none()
        if not university:
            raise ValueError("UHST university record is missing")

        created = 0
        updated = 0
        for program in PROGRAMS:
            major = (
                await db.execute(
                    select(Major).where(Major.slug == program["major_slug"])
                )
            ).scalar_one_or_none()
            if not major:
                raise ValueError(f"Missing major slug {program['major_slug']!r}")

            offering_created = await upsert_offering(
                db, university, major, program, apply
            )
            created += int(offering_created)
            updated += int(not offering_created)
            print(
                f"ASSOCIATE {program['major_slug']}: "
                f"{('created' if apply else 'would create') if offering_created else ('updated' if apply else 'would update')}"
            )

        if apply:
            await db.commit()
            print(f"Committed: {created} created, {updated} updated.")
        else:
            await db.rollback()
            print(
                f"Dry run: {created} would be created, {updated} would be updated."
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(apply=not args.dry_run))
