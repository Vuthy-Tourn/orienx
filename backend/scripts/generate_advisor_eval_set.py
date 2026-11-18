"""Generate the 100-question advisor evaluation set from verified database data.

The dataset is regenerated from the current catalogue, so expected facts always
match the seed data. Run this after changing catalogue records.

Usage:
    cd backend
    python scripts/generate_advisor_eval_set.py
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Iterable, List, Sequence

from sqlalchemy import select
from sqlalchemy.orm import selectinload

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.catalog import Career, Major, University, UniversityMajor  # noqa: E402
from app.models.scholarship import Scholarship  # noqa: E402

OUTPUT = Path(__file__).resolve().parents[1] / "data" / "eval" / "advisor_eval.jsonl"


def loc(value: Any, language: str = "en") -> str:
    if isinstance(value, dict):
        selected = value.get(language)
        if isinstance(selected, str) and selected.strip():
            return selected.strip()
        for fallback in ("en", "km"):
            candidate = value.get(fallback)
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()
        return ""
    return str(value or "").strip()


def money(value: Any) -> str:
    try:
        return f"${float(value):,.0f}"
    except (TypeError, ValueError):
        return ""


def pick_spread(items: Sequence[Any], count: int) -> List[Any]:
    if len(items) <= count:
        return list(items)
    step = len(items) / count
    return [items[int(index * step)] for index in range(count)]


def tuition_values(university: University) -> List[str]:
    values = []
    for amount in (
        university.tuition_range_min_usd,
        university.tuition_range_max_usd,
    ):
        formatted = money(amount)
        if formatted and formatted not in values:
            values.append(formatted)
    return values


def entry(
    question_id: str,
    language: str,
    category: str,
    question: str,
    expected_urls: Iterable[str] = (),
    must_include: Iterable[str] = (),
    expected_tools: Iterable[str] = (),
    must_refuse: bool = False,
    notes: str = "",
) -> dict:
    return {
        "id": question_id,
        "language": language,
        "category": category,
        "question": question,
        "expected_urls": list(expected_urls),
        "must_include": list(must_include),
        "expected_tools": list(expected_tools),
        "must_refuse": must_refuse,
        "notes": notes,
    }


async def generate() -> List[dict]:
    async with AsyncSessionLocal() as session:
        universities = (
            await session.execute(
                select(University)
                .where(University.is_verified == True)  # noqa: E712
                .order_by(University.slug)
            )
        ).scalars().all()
        majors = (
            await session.execute(
                select(Major)
                .options(
                    selectinload(Major.university_majors).selectinload(
                        UniversityMajor.university
                    )
                )
                .order_by(Major.slug)
            )
        ).scalars().all()
        careers = (
            await session.execute(select(Career).order_by(Career.slug))
        ).scalars().all()
        scholarships = (
            await session.execute(
                select(Scholarship)
                .where(Scholarship.is_verified == True)  # noqa: E712
                .order_by(Scholarship.slug)
            )
        ).scalars().all()

    tuition_universities = [
        university
        for university in universities
        if university.tuition_range_min_usd is not None
    ]
    selected_universities = pick_spread(tuition_universities, 15)
    selected_majors = pick_spread(majors, 15)
    offering_majors = [
        major
        for major in majors
        if len([o for o in major.university_majors if o.university]) >= 2
    ]
    selected_offering_majors = pick_spread(offering_majors, 10)

    questions: List[dict] = []
    counter = 1

    def next_id() -> str:
        nonlocal counter
        value = f"q{counter:03d}"
        counter += 1
        return value

    # 15 tuition questions
    for university in selected_universities:
        name = loc(university.name, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "tuition",
                f"How much is the annual tuition at {name}?",
                [f"/universities/{university.slug}"],
                tuition_values(university),
                notes=f"tuition range {tuition_values(university)}",
            )
        )

    # 10 location/type questions
    for university in pick_spread(universities, 10):
        name = loc(university.name, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "university_info",
                f"Where is {name} located, and is it a public or private university?",
                [f"/universities/{university.slug}"],
                [university.province, university.university_type.lower()],
                notes=f"{university.province}, {university.university_type}",
            )
        )

    # 15 major overview questions
    for major in selected_majors:
        name = loc(major.name, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "major_info",
                f"What does the {name} major cover at Cambodian universities?",
                [f"/majors/{major.slug}"],
                [major.category],
                notes=f"category {major.category}",
            )
        )

    # 10 major-offering questions
    for major in selected_offering_majors:
        name = loc(major.name, "en")
        offerings = [o for o in major.university_majors if o.university]
        first = offerings[0].university
        questions.append(
            entry(
                next_id(),
                "en",
                "major_offerings",
                f"Which universities offer the {name} major?",
                [f"/majors/{major.slug}"],
                [],
                ["search_universities"],
                notes=f"first offering {first.slug} (not required exclusively)",
            )
        )

    # 10 scholarship questions (3 coverage, 3 deadline, 3 provider, 1 eligibility)
    for scholarship in scholarships:
        title = loc(scholarship.title, "en")
        percentage = (
            f"{scholarship.coverage_percentage}%"
            if scholarship.coverage_percentage
            else ""
        )
        questions.append(
            entry(
                next_id(),
                "en",
                "scholarship",
                f"What does the {title} cover?",
                [f"/scholarships/{scholarship.slug}"],
                [percentage] if percentage else [],
                notes=f"coverage {scholarship.coverage_type} {percentage}",
            )
        )
    for scholarship in scholarships:
        title = loc(scholarship.title, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "scholarship",
                f"When is the deadline for the {title}?",
                [f"/scholarships/{scholarship.slug}"],
                ["2026"],
                notes=f"deadline {scholarship.application_deadline}",
            )
        )
    providers = {
        "techo-digital-talent-scholarship": "MPTC",
        "aupp-merit-scholarship": "American University",
        "moeys-national-scholarship": "MoEYS",
    }
    for scholarship in scholarships:
        title = loc(scholarship.title, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "scholarship",
                f"Who provides the {title}?",
                [f"/scholarships/{scholarship.slug}"],
                [providers.get(scholarship.slug, loc(scholarship.provider, "en"))],
                notes="provider",
            )
        )
    aupp = next(
        (s for s in scholarships if s.slug == "aupp-merit-scholarship"),
        scholarships[0] if scholarships else None,
    )
    if aupp is not None:
        questions.append(
            entry(
                next_id(),
                "en",
                "scholarship",
                f"What are the eligibility criteria for the {loc(aupp.title, 'en')}?",
                [f"/scholarships/{aupp.slug}"],
                ["BacII"],
                notes="eligibility criteria",
            )
        )

    # 5 career questions
    for career in careers:
        title = loc(career.title, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "career",
                f"What does a {title} do?",
                [f"/careers/{career.slug}"],
                [career.industry],
                notes=f"industry {career.industry}",
            )
        )
    for career in careers[:2]:
        title = loc(career.title, "en")
        skill = ""
        if isinstance(career.required_skills, list) and career.required_skills:
            skill = str(career.required_skills[0]).split("/")[0].strip()
        questions.append(
            entry(
                next_id(),
                "en",
                "career",
                f"What skills does a {title} need?",
                [f"/careers/{career.slug}"],
                [skill] if skill else [],
                notes=f"first skill {skill}",
            )
        )

    # 10 university comparison questions
    for index in range(10):
        first = selected_universities[index]
        second = selected_universities[(index + 5) % len(selected_universities)]
        first_name = loc(first.name, "en")
        second_name = loc(second.name, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "comparison",
                f"Compare annual tuition at {first_name} and {second_name}. Which is cheaper?",
                [f"/universities/{first.slug}", f"/universities/{second.slug}"],
                [first_name, second_name] + tuition_values(first) + tuition_values(second),
                ["compare_universities"],
                notes="tuition comparison",
            )
        )

    # 10 Khmer questions (4 tuition, 3 major, 3 scholarship)
    for university in selected_universities[:4]:
        name = loc(university.name, "km") or loc(university.name, "en")
        questions.append(
            entry(
                next_id(),
                "km",
                "khmer",
                f"តើថ្លៃសិក្សានៅ {name} ប៉ុន្មានក្នុងមួយឆ្នាំ?",
                [f"/universities/{university.slug}"],
                tuition_values(university),
                notes="Khmer tuition",
            )
        )
    for major in selected_majors[:3]:
        name = loc(major.name, "km") or loc(major.name, "en")
        questions.append(
            entry(
                next_id(),
                "km",
                "khmer",
                f"តើជំនាញ {name} សិក្សាអំពីអ្វី?",
                [f"/majors/{major.slug}"],
                [],
                notes="Khmer major overview",
            )
        )
    for scholarship in scholarships:
        title = loc(scholarship.title, "km") or loc(scholarship.title, "en")
        must = []
        if scholarship.coverage_percentage:
            must.append(f"{scholarship.coverage_percentage}%")
        if scholarship.application_deadline:
            must.append("2026")
        questions.append(
            entry(
                next_id(),
                "km",
                "khmer",
                f"តើអាហារូបករណ៍ {title} ផ្តល់អ្វី និងផុតកំណត់ពេលណា?",
                [f"/scholarships/{scholarship.slug}"],
                must,
                notes="Khmer scholarship",
            )
        )

    # 8 eligibility questions
    eligibility_offerings = []
    for major in majors:
        for offering in major.university_majors:
            if (
                offering.university is not None
                and offering.min_bacii_grade
                and offering.is_admission_verified
            ):
                eligibility_offerings.append((major, offering))
    for major, offering in pick_spread(eligibility_offerings, 8):
        university_name = loc(offering.university.name, "en")
        major_name = loc(major.name, "en")
        questions.append(
            entry(
                next_id(),
                "en",
                "eligibility",
                f"What BACII grade do I need for {major_name} at {university_name}?",
                [
                    f"/majors/{major.slug}",
                    f"/universities/{offering.university.slug}",
                ],
                [offering.min_bacii_grade.upper()],
                ["check_eligibility"],
                notes=f"minimum {offering.min_bacii_grade}",
            )
        )

    # 7 refusal / out-of-scope questions
    refusals = [
        "What is the weather in Phnom Penh today?",
        "Who won the 2022 FIFA World Cup?",
        "What is the capital of France?",
        "Can you write me a Python sorting function?",
        "What is the price of an iPhone 17?",
        "Tell me a joke.",
        "How do I cook spaghetti?",
    ]
    for question in refusals:
        questions.append(
            entry(
                next_id(),
                "en",
                "refusal",
                question,
                [],
                [],
                must_refuse=True,
                notes="out of scope",
            )
        )

    if len(questions) != 100:
        raise RuntimeError(f"Expected 100 questions, generated {len(questions)}")
    return questions


def main() -> None:
    questions = asyncio.run(generate())
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8") as handle:
        for question in questions:
            handle.write(json.dumps(question, ensure_ascii=False) + "\n")
    print(f"Wrote {len(questions)} questions to {OUTPUT}")


if __name__ == "__main__":
    main()
