"""Deterministic advisor tools for search, comparison, and eligibility.

Gemma 3 does not expose Ollama tool-calling, so the advisor routes obvious
intents in Python before calling the model. The tools query PostgreSQL directly
and their structured results are given to the model as authoritative context.
They also produce a complete answer in retrieval-only mode.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.catalog import Major, University, UniversityMajor
from app.services.ai_knowledge import (
    KnowledgeDocument,
    STOPWORDS,
    WORD_RE,
    _normalize,
)

GRADE_RANK = {"A": 6, "B": 5, "C": 4, "D": 3, "E": 2, "F": 1}

GENERIC_MAJOR_WORDS = {
    "and", "of", "the", "applied", "professional", "general", "studies",
    "science", "sciences", "technology", "engineering", "management",
    "business", "international", "development", "arts", "systems",
}

COMPARE_WORDS = (
    "compare", "comparison", "versus", " vs ", "cheaper", "cheapest",
    "difference", "ធៀប", "ថោកជាង", "ប្រៀបធៀប",
)
ELIGIBILITY_WORDS = (
    "bacii", "grade", "eligible", "eligibility", "requirement", "admission",
    "can i get in", "can i enter", "និទ្ទេស", "ចូលរៀន", "លក្ខខណ្ឌ", "អាចចូល",
)
SEARCH_WORDS = (
    "which universities", "what universities", "where can i study",
    "universities offer", "university offer", "find university",
    "សាកលវិទ្យាល័យណា", "បង្រៀន", "សិក្សានៅណា",
)


@dataclass(slots=True)
class ToolRun:
    names: List[str] = field(default_factory=list)
    context: str = ""
    answer: str = ""
    related: List[Tuple[str, str]] = field(default_factory=list)


def _localized(value: Any, language: str = "en") -> str:
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


def _money(value: Any) -> str:
    try:
        return f"${float(value):,.0f}"
    except (TypeError, ValueError):
        return ""


def _tuition_range(university: University) -> str:
    low = _money(university.tuition_range_min_usd)
    high = _money(university.tuition_range_max_usd)
    if low and high and low != high:
        return f"{low}–{high}/year"
    if low or high:
        return f"{low or high}/year"
    return "tuition not published"


def _notes(value: Any) -> str:
    if isinstance(value, dict):
        notes = value.get("notes")
        if isinstance(notes, str) and notes.strip():
            return notes.strip()
        return ""
    if isinstance(value, str):
        return value.strip()
    return ""


def _matching_offerings(
    university: University, major_slug: Optional[str]
) -> List[UniversityMajor]:
    offerings = [
        offering
        for offering in university.university_majors
        if offering.major is not None
    ]
    if not major_slug:
        return offerings
    return [o for o in offerings if o.major.slug == major_slug]


async def search_universities(
    session: AsyncSession,
    major: Optional[str] = None,
    province: Optional[str] = None,
    max_tuition_usd: Optional[float] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    limit = max(1, min(int(limit or 5), 10))
    universities = (
        await session.execute(
            select(University)
            .where(University.is_verified == True)  # noqa: E712
            .options(
                selectinload(University.university_majors).selectinload(
                    UniversityMajor.major
                )
            )
        )
    ).scalars().all()

    major_normalized = _normalize(major or "").strip()
    province_normalized = _normalize(province or "").strip()
    results: List[Dict[str, Any]] = []

    for university in universities:
        if province_normalized and province_normalized not in _normalize(
            university.province
        ):
            continue
        if (
            max_tuition_usd is not None
            and university.tuition_range_min_usd is not None
            and float(university.tuition_range_min_usd) > float(max_tuition_usd)
        ):
            continue

        matching = _matching_offerings(
            university, major_normalized.replace(" ", "-") or None
        )
        if major_normalized and not matching:
            matching = [
                offering
                for offering in university.university_majors
                if offering.major is not None
                and (
                    major_normalized in _normalize(offering.major.slug)
                    or major_normalized
                    in _normalize(_localized(offering.major.name, "en"))
                    or major_normalized
                    in _normalize(_localized(offering.major.name, "km"))
                )
            ]
        if major_normalized and not matching:
            continue

        offered = matching or [
            o for o in university.university_majors if o.major is not None
        ]
        programs = []
        for offering in offered[:3]:
            fee = _money(offering.tuition_annual_usd)
            grade = (offering.min_bacii_grade or "").upper()
            programs.append(
                {
                    "slug": offering.major.slug,
                    "name_en": _localized(offering.major.name, "en"),
                    "name_km": _localized(offering.major.name, "km"),
                    "tuition_annual_usd": float(offering.tuition_annual_usd)
                    if offering.tuition_annual_usd is not None
                    else None,
                    "minimum_bacii_grade": grade or None,
                    "fee_label": fee or "not published",
                }
            )

        results.append(
            {
                "slug": university.slug,
                "name_en": _localized(university.name, "en"),
                "name_km": _localized(university.name, "km"),
                "acronym": _localized(university.acronym, "en"),
                "province": university.province,
                "type": university.university_type,
                "tuition_range": _tuition_range(university),
                "tuition_min_usd": float(university.tuition_range_min_usd)
                if university.tuition_range_min_usd is not None
                else None,
                "website": university.website_url,
                "programs": programs,
            }
        )

    results.sort(
        key=lambda item: (
            item["tuition_min_usd"] is None,
            item["tuition_min_usd"] or 0.0,
        )
    )
    return {
        "tool": "search_universities",
        "filters": {
            "major": major,
            "province": province,
            "max_tuition_usd": max_tuition_usd,
        },
        "count": len(results),
        "results": results[:limit],
    }


async def compare_universities(
    session: AsyncSession,
    university_slugs: Sequence[str],
    major_slug: Optional[str] = None,
) -> Dict[str, Any]:
    slugs = [str(slug).strip().lower() for slug in university_slugs if str(slug).strip()][:4]
    if len(slugs) < 2:
        return {
            "tool": "compare_universities",
            "error": "Provide at least two university slugs.",
            "universities": [],
        }

    universities = (
        await session.execute(
            select(University)
            .where(University.slug.in_(slugs))
            .options(
                selectinload(University.university_majors).selectinload(
                    UniversityMajor.major
                )
            )
        )
    ).scalars().all()
    by_slug = {university.slug: university for university in universities}

    items = []
    cheapest: Optional[Dict[str, Any]] = None
    for slug in slugs:
        university = by_slug.get(slug)
        if university is None:
            continue
        matching = _matching_offerings(university, major_slug)
        offered = matching or [
            o for o in university.university_majors if o.major is not None
        ]
        programs = []
        for offering in offered[:4]:
            programs.append(
                {
                    "slug": offering.major.slug,
                    "name_en": _localized(offering.major.name, "en"),
                    "name_km": _localized(offering.major.name, "km"),
                    "tuition_annual_usd": float(offering.tuition_annual_usd)
                    if offering.tuition_annual_usd is not None
                    else None,
                    "minimum_bacii_grade": (offering.min_bacii_grade or "").upper()
                    or None,
                }
            )

        effective_min = None
        if matching:
            fees = [
                float(o.tuition_annual_usd)
                for o in matching
                if o.tuition_annual_usd is not None
            ]
            effective_min = min(fees) if fees else None
        elif university.tuition_range_min_usd is not None:
            effective_min = float(university.tuition_range_min_usd)

        item = {
            "slug": university.slug,
            "name_en": _localized(university.name, "en"),
            "name_km": _localized(university.name, "km"),
            "acronym": _localized(university.acronym, "en"),
            "province": university.province,
            "type": university.university_type,
            "tuition_range": _tuition_range(university),
            "effective_minimum_usd": effective_min,
            "program_count": len(university.university_majors),
            "programs": programs,
            "admission_notes": _notes(university.admission_requirements),
            "website": university.website_url,
        }
        items.append(item)
        if effective_min is not None and (
            cheapest is None or effective_min < cheapest["effective_minimum_usd"]
        ):
            cheapest = item

    return {
        "tool": "compare_universities",
        "major_slug": major_slug,
        "universities": items,
        "cheapest_slug": cheapest["slug"] if cheapest else None,
        "cheapest_name_en": cheapest["name_en"] if cheapest else None,
        "cheapest_name_km": cheapest["name_km"] if cheapest else None,
    }


async def check_eligibility(
    session: AsyncSession,
    university_slug: str,
    major_slug: str,
    bacii_grade: Optional[str] = None,
) -> Dict[str, Any]:
    offering = (
        await session.execute(
            select(UniversityMajor)
            .join(University, UniversityMajor.university_id == University.id)
            .join(Major, UniversityMajor.major_id == Major.id)
            .where(
                func.lower(University.slug) == university_slug.strip().lower(),
                func.lower(Major.slug) == major_slug.strip().lower(),
            )
            .options(
                selectinload(UniversityMajor.university),
                selectinload(UniversityMajor.major),
            )
        )
    ).scalars().first()

    if offering is None:
        return {
            "tool": "check_eligibility",
            "found": False,
            "message": "No matching university/major offering was found.",
            "university_slug": university_slug,
            "major_slug": major_slug,
        }

    minimum = (offering.min_bacii_grade or "").upper()
    grade = (bacii_grade or "").upper().strip()
    status = "not_published"
    reason = "No published minimum BACII grade is available for this program."

    if minimum in GRADE_RANK:
        if grade in GRADE_RANK:
            if GRADE_RANK[grade] >= GRADE_RANK[minimum]:
                status = "eligible"
                reason = f"You meet the published minimum grade of {minimum}."
            else:
                status = "below_requirements"
                reason = f"This program requires grade {minimum} or higher."
        else:
            status = "min_grade_published"
            reason = f"The published minimum BACII grade is {minimum}."

    return {
        "tool": "check_eligibility",
        "found": True,
        "university_slug": offering.university.slug,
        "university_name_en": _localized(offering.university.name, "en"),
        "university_name_km": _localized(offering.university.name, "km"),
        "major_slug": offering.major.slug,
        "major_name_en": _localized(offering.major.name, "en"),
        "major_name_km": _localized(offering.major.name, "km"),
        "minimum_bacii_grade": minimum or None,
        "bacii_grade": grade or None,
        "status": status,
        "reason": reason,
        "degree_level": offering.degree_level,
        "required_subjects": offering.required_subjects,
        "admission_verified": offering.is_admission_verified,
        "admission_source_url": offering.admission_source_url,
        "admission_notes": _notes(offering.admission_criteria),
        "tuition_annual_usd": float(offering.tuition_annual_usd)
        if offering.tuition_annual_usd is not None
        else None,
    }


def _contains_any(query: str, words: Sequence[str]) -> bool:
    normalized = _normalize(query)
    return any(word in normalized for word in words)


def _query_words(query: str) -> set[str]:
    return {
        word for word in WORD_RE.findall(_normalize(query))
        if len(word) > 1 and word not in STOPWORDS
    }


def _find_university_mentions(
    query: str, documents: Sequence[KnowledgeDocument]
) -> List[KnowledgeDocument]:
    normalized = _normalize(query)
    words = _query_words(query)
    matches = []
    for document in documents:
        if document.type != "university":
            continue
        name_en = document.title_en.split(" (")[0].lower()
        if name_en and name_en in normalized:
            matches.append(document)
            continue
        if words & set(document.aliases):
            matches.append(document)
    return matches


def _find_major_mentions(
    query: str, documents: Sequence[KnowledgeDocument]
) -> List[KnowledgeDocument]:
    normalized = _normalize(query)
    words = _query_words(query)
    matches: List[tuple[int, KnowledgeDocument]] = []
    for document in documents:
        if document.type != "major":
            continue
        title_en = document.title_en.lower()
        if title_en and title_en in normalized:
            matches.append((100, document))
            continue
        slug_words = {
            word for word in document.slug.split("-")
            if len(word) > 2 and word not in GENERIC_MAJOR_WORDS
        }
        overlap = words & slug_words
        if overlap:
            matches.append((len(overlap), document))
    matches.sort(key=lambda item: item[0], reverse=True)
    return [document for _, document in matches[:2]]


def _grade_from_query(query: str) -> Optional[str]:
    match = re.search(r"(?:grade|និទ្ទេស)\s*([A-Fa-f])\b", query)
    if match:
        return match.group(1).upper()
    match = re.search(r"\b([A-F])\b", query)
    return match.group(1).upper() if match else None


def _format_search_answer(result: Dict[str, Any], language: str) -> str:
    is_km = language == "km"
    if not result.get("results"):
        return (
            "ខ្ញុំមិនបានរកឃើញសាកលវិទ្យាល័យដែលត្រូវនឹងលក្ខខណ្ឌនេះទេ។"
            if is_km
            else "I could not find a university matching those filters."
        )

    lines = [
        "សាកលវិទ្យាល័យដែលត្រូវគ្នា៖"
        if is_km
        else "Matching universities:"
    ]
    for item in result["results"]:
        name = item["name_km"] if is_km else item["name_en"]
        program = item["programs"][0] if item.get("programs") else None
        detail = ""
        if program:
            fee = program.get("fee_label")
            grade = program.get("minimum_bacii_grade")
            if fee and fee != "not published":
                detail += f" — {fee}/year" if not is_km else f" — {fee}/ឆ្នាំ"
            if grade:
                detail += (
                    f", min BACII {grade}"
                    if not is_km
                    else f", និទ្ទេស BACII អប្បបរមា {grade}"
                )
        lines.append(
            f"• {name} ({item['province']}, {item['type'].lower()}, "
            f"{item['tuition_range']}){detail}"
        )
    return "\n".join(lines)


def _format_compare_answer(result: Dict[str, Any], language: str) -> str:
    is_km = language == "km"
    universities = result.get("universities") or []
    if not universities:
        return (
            "ខ្ញុំមិនអាចប្រៀបធៀបសាកលវិទ្យាល័យទាំងនេះបានទេ។"
            if is_km
            else "I could not compare those universities."
        )
    lines = ["ការប្រៀបធៀប៖" if is_km else "Comparison:"]
    for item in universities:
        name = item["name_km"] if is_km else item["name_en"]
        line = (
            f"• {name} — {item['province']}, {item['type'].lower()}, "
            f"{item['tuition_range']}, {item['program_count']} programs"
        )
        if result.get("major_slug") and item.get("programs"):
            program = item["programs"][0]
            fee = _money(program.get("tuition_annual_usd"))
            grade = program.get("minimum_bacii_grade")
            if fee:
                line += (
                    f"; program fee {fee}/year"
                    if not is_km
                    else f"; ថ្លៃកម្មវិធី {fee}/ឆ្នាំ"
                )
            if grade:
                line += (
                    f", min BACII {grade}"
                    if not is_km
                    else f", និទ្ទេស BACII អប្បបរមា {grade}"
                )
        lines.append(line)
    cheapest = result.get("cheapest_name_km" if is_km else "cheapest_name_en")
    if cheapest:
        lines.append(
            f"\nសាកលវិទ្យាល័យដែលមានតម្លៃទាបជាងគេ៖ {cheapest}"
            if is_km
            else f"\nLowest published minimum: {cheapest}"
        )
    return "\n".join(lines)


def _format_eligibility_answer(result: Dict[str, Any], language: str) -> str:
    is_km = language == "km"
    if not result.get("found"):
        return (
            "ខ្ញុំមិនបានរកឃើញកម្មវិធីសិក្សានេះទេ។"
            if is_km
            else "I could not find that program."
        )
    name = result["major_name_km"] if is_km else result["major_name_en"]
    university = (
        result["university_name_km"] if is_km else result["university_name_en"]
    )
    minimum = result.get("minimum_bacii_grade")
    if not minimum:
        return (
            f"{university} — {name}: មិនមាននិទ្ទេស BACII អប្បបរមាដែលបានផ្សព្វផ្សាយទេ។"
            if is_km
            else f"{university} — {name}: no published minimum BACII grade."
        )
    reason = result["reason"]
    if is_km:
        reason = (
            f"និទ្ទេស BACII អប្បបរមាគឺ {minimum}។ "
            + (
                "អ្នកមានលក្ខណៈគ្រប់គ្រាន់។"
                if result["status"] == "eligible"
                else "អ្នកមិនទាន់គ្រប់លក្ខខណ្ឌទេ។"
                if result["status"] == "below_requirements"
                else ""
            )
        )
    return f"{university} — {name}: {reason}"


def _format_tool_answer(result: Dict[str, Any], language: str) -> str:
    tool = result.get("tool")
    if tool == "search_universities":
        return _format_search_answer(result, language)
    if tool == "compare_universities":
        return _format_compare_answer(result, language)
    if tool == "check_eligibility":
        return _format_eligibility_answer(result, language)
    return ""


async def run_relevant_tools(
    session: AsyncSession,
    query: str,
    documents: Sequence[KnowledgeDocument],
    language: str,
) -> ToolRun:
    run = ToolRun()
    results: List[Dict[str, Any]] = []

    universities = _find_university_mentions(query, documents)
    majors = _find_major_mentions(query, documents)
    major_slug = majors[0].slug if majors else None

    if _contains_any(query, COMPARE_WORDS) and len(universities) >= 2:
        result = await compare_universities(
            session,
            [document.slug for document in universities[:4]],
            major_slug=major_slug,
        )
        results.append(result)
        run.names.append("compare_universities")
        run.related.extend(
            ("university", item["slug"]) for item in result.get("universities", [])
        )
        if major_slug:
            run.related.append(("major", major_slug))

    if _contains_any(query, ELIGIBILITY_WORDS) and universities and majors:
        result = await check_eligibility(
            session,
            university_slug=universities[0].slug,
            major_slug=majors[0].slug,
            bacii_grade=_grade_from_query(query),
        )
        results.append(result)
        run.names.append("check_eligibility")
        if result.get("found"):
            run.related.extend(
                [
                    ("university", result["university_slug"]),
                    ("major", result["major_slug"]),
                ]
            )

    if _contains_any(query, SEARCH_WORDS) and majors and not run.names:
        result = await search_universities(
            session, major=major_slug, limit=10
        )
        results.append(result)
        run.names.append("search_universities")
        run.related.extend(
            ("university", item["slug"]) for item in result.get("results", [])
        )
        run.related.append(("major", majors[0].slug))

    if results:
        run.answer = "\n\n".join(
            _format_tool_answer(result, language) for result in results
        )
        # A compact text summary is cheaper for the model than raw JSON with
        # nested programs, and it contains the same verified facts.
        run.context = "TOOL RESULTS:\n" + run.answer
    return run
