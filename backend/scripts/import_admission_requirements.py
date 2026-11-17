"""Apply curated, officially sourced admission requirements to degree programs.

Each university entry applies to bachelor programs by default. An optional
``associate`` object applies a separate rule to associate/diploma programs.

Usage:
    PYTHONPATH=. ./venv/bin/python scripts/import_admission_requirements.py --dry-run
    PYTHONPATH=. ./venv/bin/python scripts/import_admission_requirements.py
"""

import argparse
import asyncio
import json
from datetime import date
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.catalog import University, UniversityMajor

VALID_GRADES = {"A", "B", "C", "D", "E", "F"}


async def apply_rule(
    db: AsyncSession,
    university: University,
    degree_level: str,
    rule: dict,
    checked_at: str,
) -> int:
    grade = str(rule.get("min_bacii_grade", "")).upper()
    if grade not in VALID_GRADES:
        raise ValueError(
            f"{university.slug} {degree_level}: invalid min_bacii_grade {grade!r}"
        )
    if grade == "F" and degree_level != "ASSOCIATE":
        raise ValueError(
            f"{university.slug} {degree_level}: grade F is only valid for associate programs"
        )

    offerings = (
        await db.execute(
            select(UniversityMajor).where(
                UniversityMajor.university_id == university.id,
                UniversityMajor.degree_level == degree_level,
            )
        )
    ).scalars().all()

    for offering in offerings:
        offering.min_bacii_grade = grade
        offering.required_subjects = rule.get("required_subjects") or None
        offering.is_admission_verified = bool(rule.get("verified", False))
        offering.admission_source_url = rule["source_url"]
        offering.admission_criteria = {
            "notes": rule.get("admission_notes") or "",
            "scope": "university-published",
            "degree_level": degree_level,
            "checked_at": checked_at,
        }

    if offerings:
        print(
            f"{university.slug}: {len(offerings)} {degree_level.lower()} programs "
            f"min_grade={grade}"
        )
    return len(offerings)


async def main(apply: bool) -> None:
    data_path = Path(__file__).resolve().parents[1] / "data" / "university_admission_sources.json"
    payload = json.loads(data_path.read_text(encoding="utf-8"))
    checked_at = date.today().isoformat()

    async with AsyncSessionLocal() as db:
        updated = 0
        missing = []
        for entry in payload["universities"]:
            university = (
                await db.execute(
                    select(University).where(University.slug == entry["slug"])
                )
            ).scalar_one_or_none()
            if not university:
                missing.append(entry["slug"])
                continue

            updated += await apply_rule(
                db, university, "BACHELOR", entry, checked_at
            )

            associate_rule = entry.get("associate")
            if associate_rule:
                updated += await apply_rule(
                    db, university, "ASSOCIATE", associate_rule, checked_at
                )

        if missing:
            print("Missing universities:", ", ".join(missing))
        print(f"Total programs updated: {updated}")
        if apply:
            await db.commit()
            print("Committed changes.")
        else:
            await db.rollback()
            print("Dry run only. No changes committed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(apply=not args.dry_run))
