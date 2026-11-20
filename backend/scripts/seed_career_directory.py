#!/usr/bin/env python3
"""Seed extra career profiles used by the public career directory.

The source summaries and RIASEC codes live in the frontend career-ideas.json;
this script adds full Career records so /careers and /careers/[slug] work.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.catalog import Career, Major

CAREER_IDEAS_PATH = ROOT / "frontend" / "src" / "data" / "career-ideas.json"

# Practical task descriptions for the career detail page. These are written in
# plain language from the O*NET occupation summaries used in career-ideas.json.
TASKS: dict[str, list[str]] = {
    "data-scientist": [
        "Collect and clean data for analysis",
        "Build models and look for useful patterns",
        "Explain findings with charts and reports",
    ],
    "cybersecurity-analyst": [
        "Monitor networks and systems for security threats",
        "Investigate alerts and help respond to incidents",
        "Help teams follow safe security practices",
    ],
    "mechanical-engineer": [
        "Design mechanical parts, machines, and systems",
        "Test prototypes and improve designs",
        "Work with manufacturers and project teams",
    ],
    "graphic-designer": [
        "Create designs for digital and print media",
        "Work with clients on brand, layout, and visuals",
        "Prepare final files for publication",
    ],
    "architect": [
        "Develop building designs and plans",
        "Coordinate with engineers and construction teams",
        "Check that designs meet safety and building rules",
    ],
    "registered-nurse": [
        "Care for patients and monitor their recovery",
        "Record health information and coordinate care",
        "Explain health advice to patients and families",
    ],
    "high-school-teacher": [
        "Plan and teach lessons for high school students",
        "Assess student progress and give feedback",
        "Support students and communicate with parents",
    ],
    "marketing-manager": [
        "Plan marketing campaigns and promotions",
        "Study customer needs and competitor activity",
        "Lead a team and track campaign results",
    ],
    "accountant": [
        "Prepare financial records and reports",
        "Check numbers and follow tax rules",
        "Support audits and budget planning",
    ],
}

ENVIRONMENTS: dict[str, list[str]] = {
    "data-scientist": ["Office or remote", "Data and research teams", "Technology companies"],
    "cybersecurity-analyst": ["Security operations center", "Office or remote", "IT teams"],
    "mechanical-engineer": ["Design studio", "Factory or workshop", "Engineering sites"],
    "graphic-designer": ["Design studio", "Creative agency", "Remote or office"],
    "architect": ["Design office", "Construction sites", "Client meetings"],
    "registered-nurse": ["Hospital or clinic", "Patient wards", "Community health center"],
    "high-school-teacher": ["Classroom", "School campus", "Student meetings"],
    "marketing-manager": ["Office", "Agency", "Events and campaigns"],
    "accountant": ["Office", "Finance team", "Client meetings"],
}

PROGRESSION: dict[str, list[str]] = {
    "data-scientist": ["Junior Data Analyst", "Data Scientist", "Senior / Lead Data Scientist"],
    "cybersecurity-analyst": ["Security Operations Analyst", "Cybersecurity Analyst", "Security Manager"],
    "mechanical-engineer": ["Junior Mechanical Engineer", "Mechanical Engineer", "Engineering Manager"],
    "graphic-designer": ["Junior Designer", "Graphic Designer", "Art Director"],
    "architect": ["Architectural Assistant", "Architect", "Project Architect"],
    "registered-nurse": ["Staff Nurse", "Senior Nurse", "Nurse Manager"],
    "high-school-teacher": ["Assistant Teacher", "High School Teacher", "Head of Department"],
    "marketing-manager": ["Marketing Associate", "Marketing Manager", "Marketing Director"],
    "accountant": ["Junior Accountant", "Accountant", "Finance Manager"],
}


async def main() -> None:
    ideas = json.loads(CAREER_IDEAS_PATH.read_text(encoding="utf-8"))
    async with AsyncSessionLocal() as db:
        existing_slugs = set(
            (await db.execute(select(Career.slug))).scalars().all()
        )
        added = 0
        updated = 0
        for idea in ideas:
            slug = idea["slug"]
            if slug in existing_slugs:
                continue
            major_slugs = idea["related_majors"]
            majors = (
                await db.execute(select(Major).where(Major.slug.in_(major_slugs)))
            ).scalars().all()
            career = await db.scalar(select(Career).where(Career.slug == slug))
            if career is None:
                career = Career(slug=slug)
                db.add(career)
                added += 1
            else:
                updated += 1
            career.title = idea["title"]
            career.industry = idea["industry"]
            career.description = idea["summary"]
            career.responsibilities = TASKS.get(slug, [])
            career.required_skills = [item["en"] for item in idea["skills"]]
            career.education_level = idea["education"]["en"]
            career.work_environments = ENVIRONMENTS.get(slug, [])
            career.career_progression = PROGRESSION.get(slug, [])
            career.riasec_code = "".join(idea["riasec_codes"])
            career.majors = list(majors)
        await db.commit()
        print(f"career directory: added {added}, updated {updated}")


if __name__ == "__main__":
    asyncio.run(main())
