"""Apply curated, officially sourced admission requirements to degree programs.

Each university entry applies to bachelor programs by default. An optional
``associate`` object applies a separate rule to associate/diploma programs,
and an optional ``programs`` list applies rules to specific major slugs.

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
from app.models.catalog import Major, University, UniversityMajor

VALID_GRADES = {"A", "B", "C", "D", "E", "F"}


def _validate_grade(university: University, degree_level: str, rule: dict) -> str:
    grade = str(rule.get("min_bacii_grade", "")).upper()
    if grade not in VALID_GRADES:
        raise ValueError(
            f"{university.slug} {degree_level}: invalid min_bacii_grade {grade!r}"
        )
    if grade == "F" and degree_level != "ASSOCIATE":
        raise ValueError(
            f"{university.slug} {degree_level}: grade F is only valid for associate programs"
        )
    return grade


def _assign_rule(
    offerings: list[UniversityMajor],
    degree_level: str,
    rule: dict,
    checked_at: str,
    grade: str,
) -> int:
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
    return len(offerings)


async def apply_rule(
    db: AsyncSession,
    university: University,
    degree_level: str,
    rule: dict,
    checked_at: str,
) -> int:
    grade = _validate_grade(university, degree_level, rule)

    offerings = (
        await db.execute(
            select(UniversityMajor).where(
                UniversityMajor.university_id == university.id,
                UniversityMajor.degree_level == degree_level,
            )
        )
    ).scalars().all()

    count = _assign_rule(offerings, degree_level, rule, checked_at, grade)
    if offerings:
        print(
            f"{university.slug}: {count} {degree_level.lower()} programs "
            f"min_grade={grade}"
        )
    return count


async def apply_program_rule(
    db: AsyncSession,
    university: University,
    rule: dict,
    checked_at: str,
) -> int:
    degree_level = str(rule.get("degree_level", "BACHELOR")).upper()
    major_slug = rule["major_slug"]
    grade = _validate_grade(university, degree_level, rule)

    offerings = (
        await db.execute(
            select(UniversityMajor)
            .join(UniversityMajor.major)
            .where(
                UniversityMajor.university_id == university.id,
                UniversityMajor.degree_level == degree_level,
                Major.slug == major_slug,
            )
        )
    ).scalars().all()

    count = _assign_rule(offerings, degree_level, rule, checked_at, grade)
    if offerings:
        print(
            f"{university.slug}: {major_slug} ({degree_level}) "
            f"min_grade={grade}"
        )
    else:
        print(f"{university.slug}: no offering found for {major_slug} ({degree_level})")
    return count


async def main(apply: bool, slugs: list[str] | None = None) -> None:
    data_path = Path(__file__).resolve().parents[1] / "data" / "university_admission_sources.json"
    payload = json.loads(data_path.read_text(encoding="utf-8"))
    checked_at = date.today().isoformat()

    async with AsyncSessionLocal() as db:
        updated = 0
        missing = []
        for entry in payload["universities"]:
            if slugs and entry["slug"] not in slugs:
                continue
            university = (
                await db.execute(
                    select(University).where(University.slug == entry["slug"])
                )
            ).scalar_one_or_none()
            if not university:
                missing.append(entry["slug"])
                continue

            if entry.get("min_bacii_grade"):
                updated += await apply_rule(
                    db, university, "BACHELOR", entry, checked_at
                )

            associate_rule = entry.get("associate")
            if associate_rule:
                updated += await apply_rule(
                    db, university, "ASSOCIATE", associate_rule, checked_at
                )

            for program_rule in entry.get("programs", []):
                updated += await apply_program_rule(
                    db, university, program_rule, checked_at
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
    parser.add_argument(
        "--slug",
        action="append",
        dest="slugs",
        help="Only apply these university slugs (repeatable)",
    )
    args = parser.parse_args()
    asyncio.run(main(apply=not args.dry_run, slugs=args.slugs))
