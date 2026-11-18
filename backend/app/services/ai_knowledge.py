"""Zero-dependency retrieval layer for the OrienX AI advisor.

The advisor must stay accurate and free to run. Instead of sending the whole
catalogue to a model, this module turns verified database records into small
knowledge documents and selects the most relevant ones with a local BM25-ish
score. No external service, vector database, or paid embedding API is needed.
"""

from __future__ import annotations

import math
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass
from typing import Any, List, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.catalog import Career, Major, University, UniversityMajor
from app.models.scholarship import Scholarship

KHMER_RE = re.compile(r"[\u1780-\u17ff]+")
WORD_RE = re.compile(r"[a-z0-9]+")

STOPWORDS = {
    "a", "about", "an", "and", "are", "as", "at", "be", "by", "can", "do",
    "does", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of",
    "on", "or", "should", "tell", "that", "the", "there", "this", "to", "was",
    "what", "when", "where", "which", "who", "why", "will", "with", "you",
    "your",
}

# Cheap query expansion. A student says "coding", a course catalogue says
# "programming"; both should reach the same records without an embedding model.
QUERY_SYNONYMS = {
    "coding": ("programming", "software", "code", "developer"),
    "code": ("programming", "software", "developer"),
    "programming": ("coding", "software", "developer"),
    "developer": ("software", "programming"),
    "ai": ("artificial", "intelligence", "data"),
    "cs": ("computer", "science", "software"),
    "it": ("information", "technology", "computer"),
    "doctor": ("medicine", "medical", "health"),
    "medicine": ("doctor", "medical", "health"),
    "business": ("management", "entrepreneur", "marketing"),
    "money": ("finance", "salary", "tuition", "scholarship"),
    "cheap": ("affordable", "budget", "tuition"),
    "affordable": ("cheap", "budget", "tuition"),
    "abroad": ("international", "scholarship"),
    "design": ("arts", "creative", "media"),
    "robot": ("robotics", "mechatronics", "engineering"),
    "khmer": ("cambodia", "cambodian"),
}

# Khmer academic phrases do not share Latin word boundaries (and the catalogue
# stores English and Khmer side by side). These phrase hints connect the two.
PHRASE_SYNONYMS = {
    "វិស្វកម្មកុំព្យូទ័រ": ("software", "computer", "programming", "engineering"),
    "វិស្វកម្មសូហ្វវែរ": ("software", "programming", "engineering"),
    "វិទ្យាសាស្ត្រកុំព្យូទ័រ": ("computer", "science", "software"),
    "បច្ចេកវិទ្យាព័ត៌មាន": ("information", "technology", "software"),
    "កម្មវិធីកុំព្យូទ័រ": ("software", "programming", "computer"),
    "បញ្ញាសិប្បនិម្មិត": ("artificial", "intelligence", "data"),
    "អាហារូបករណ៍": ("scholarship", "grant", "funding"),
    "ថ្លៃសិក្សា": ("tuition", "fee", "cost"),
    "អាជីព": ("career", "job", "salary"),
}

TYPE_HINTS = {
    "university": (
        "university college campus tuition fees scholarship admission province "
        "public private សាកលវិទ្យាល័យ ថ្លៃសិក្សា អាហារូបករណ៍"
    ),
    "major": (
        "major degree program study subjects skills career ជំនាញ កម្មវិធីសិក្សា "
        "មុខវិជ្ជា ជំនាញវិជ្ជាជីវៈ"
    ),
    "career": (
        "career job work industry salary skills អាជីព ការងារ ប្រាក់ខែ ជំនាញ"
    ),
    "scholarship": (
        "scholarship grant financial aid deadline eligibility apply "
        "អាហារូបករណ៍ ថវិកា ផុតកំណត់"
    ),
}

INTENT_KEYWORDS = {
    "scholarship": (
        "scholarship", "scholarships", "financial aid", "grant", "funding",
        "អាហារូបករណ៍", "ថវិកា",
    ),
    "tuition": (
        "tuition", "fee", "fees", "cost", "price", "expensive", "afford",
        "ថ្លៃ", "តម្លៃ", "ចំណាយ",
    ),
    "career": (
        "career", "careers", "job", "jobs", "salary", "work", "profession",
        "អាជីព", "ការងារ", "ប្រាក់ខែ",
    ),
    "major": (
        "major", "majors", "degree", "degrees", "program", "programs",
        "study", "subject", "subjects", "ជំនាញ", "មុខវិជ្ជា",
        "កម្មវិធីសិក្សា",
    ),
    "university": (
        "university", "universities", "college", "colleges", "campus",
        "school", "schools", "សាកលវិទ្យាល័យ", "សាលា",
    ),
}

DOMAIN_WORDS_EN = {
    "university", "universities", "college", "colleges", "school", "schools",
    "major", "majors", "degree", "degrees", "program", "programs", "course",
    "courses", "study", "studies", "student", "students", "tuition", "fee",
    "fees", "scholarship", "scholarships", "grant", "grants", "funding",
    "financial", "aid", "career", "careers", "job", "jobs", "salary",
    "salaries", "admission", "admissions", "bacii", "exam", "exams",
    "eligibility", "eligible", "requirement", "requirements", "engineering",
    "engineer", "computer", "computers", "software", "data", "business",
    "medicine", "medical", "nursing", "nurse", "law", "lawyer", "finance",
    "banking", "accounting", "accountant", "design", "designer", "arts",
    "education", "teaching", "teacher", "agriculture", "tourism",
    "hospitality", "robotics", "ai", "coding", "programming", "architect",
    "architecture", "analyst", "developer", "technician", "manager",
    "economist", "scientist", "dentist", "pharmacy", "pharmacist",
    "veterinarian", "agronomist", "civil", "structural", "province", "campus",
    "itc", "rupp", "aupp", "cadt", "rufa", "rule", "puc",
}

DOMAIN_TERMS_KM = (
    "សាកលវិទ្យាល័យ", "ជំនាញ", "កម្មវិធី", "ថ្លៃ", "តម្លៃ", "អាហារូបករណ៍",
    "អាជីព", "ការងារ", "ប្រាក់ខែ", "ការសិក្សា", "សិក្សា", "ចូលរៀន",
    "ប្រឡង", "កុំព្យូទ័រ", "វិស្វកម្ម", "គ្រប់គ្រង", "គណនេយ្យ",
    "ហិរញ្ញវត្ថុ", "ច្បាប់", "វេជ្ជសាស្ត្រ", "គិលានុបដ្ឋាយិកា", "កសិកម្ម",
    "ទេសចរណ៍", "រចនា", "សិល្បៈ", "អប់រំ", "បច្ចេកវិទ្យា", "ទិន្នន័យ",
)


@dataclass(slots=True)
class KnowledgeDocument:
    id: str
    type: str
    slug: str
    title_en: str
    title_km: str
    body_en: str
    body_km: str
    snippet_en: str
    snippet_km: str
    url: str
    search_text: str
    title_tokens: frozenset[str] = frozenset()
    search_tokens: frozenset[str] = frozenset()
    aliases: frozenset[str] = frozenset()


def _normalize(value: str) -> str:
    return unicodedata.normalize("NFKC", value or "").lower()


def _text(value: Any) -> str:
    """Flatten bilingual JSON values into a readable string."""
    if value is None:
        return ""
    if isinstance(value, dict):
        return " ".join(part for part in (_text(v) for v in value.values()) if part)
    if isinstance(value, (list, tuple, set)):
        return " ".join(part for part in (_text(v) for v in value) if part)
    return str(value).strip()


def _localized(value: Any, language: str) -> str:
    if isinstance(value, dict):
        selected = value.get(language)
        if isinstance(selected, str) and selected.strip():
            return selected.strip()
        for fallback in ("en", "km"):
            candidate = value.get(fallback)
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()
        return _text(value)
    return _text(value)


def _localized_list(value: Any, language: str) -> str:
    if isinstance(value, dict):
        value = value.get(language) or value.get("en") or value.get("km") or value
    if isinstance(value, (list, tuple, set)):
        return ", ".join(
            part for part in (_text(item) for item in value) if part
        )
    return _text(value)


def _money(value: Any) -> str:
    try:
        return f"${float(value):,.0f}"
    except (TypeError, ValueError):
        return ""


def _snippet(text: str, limit: int = 240) -> str:
    collapsed = re.sub(r"\s+", " ", text or "").strip()
    if len(collapsed) <= limit:
        return collapsed
    cut = collapsed[:limit].rsplit(" ", 1)[0]
    return f"{cut}…"


def _tuition_text(
    minimum: Any, maximum: Any, verified: bool
) -> str:
    low = _money(minimum)
    high = _money(maximum)
    if low and high and low != high:
        suffix = "" if verified else " (estimated)"
        return f"{low}–{high} per year{suffix}"
    if low or high:
        suffix = "" if verified else " (estimated)"
        return f"{low or high} per year{suffix}"
    return "tuition not published"


async def load_knowledge_documents(session: AsyncSession) -> List[KnowledgeDocument]:
    """Load the verified catalogue into compact, searchable documents."""
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

    majors = (
        await session.execute(
            select(Major).options(
                selectinload(Major.university_majors).selectinload(
                    UniversityMajor.university
                ),
                selectinload(Major.careers),
            )
        )
    ).scalars().all()

    careers = (await session.execute(select(Career))).scalars().all()

    scholarships = (
        await session.execute(
            select(Scholarship)
            .where(Scholarship.is_verified == True)  # noqa: E712
            .options(selectinload(Scholarship.eligible_majors))
        )
    ).scalars().all()

    documents: List[KnowledgeDocument] = []

    for university in universities:
        name_en = _localized(university.name, "en") or university.slug
        name_km = _localized(university.name, "km") or name_en
        acronym_en = _localized(university.acronym, "en")
        acronym_km = _localized(university.acronym, "km") or acronym_en
        province = university.province or "Cambodia"
        tuition = _tuition_text(
            university.tuition_range_min_usd,
            university.tuition_range_max_usd,
            university.is_tuition_verified,
        )

        offerings = [
            offering
            for offering in university.university_majors
            if offering.major is not None
        ]
        major_names_en = ", ".join(
            _localized(offering.major.name, "en") for offering in offerings[:12]
        )
        major_names_km = ", ".join(
            _localized(offering.major.name, "km") for offering in offerings[:12]
        )
        description_en = _localized(university.description, "en")
        description_km = _localized(university.description, "km")
        admission = _text(university.admission_requirements)
        scholarship_summary = _text(university.scholarship_summary)

        body_en = (
            f"{name_en} ({acronym_en}) is a {university.university_type.lower()} "
            f"university in {province}, Cambodia. Tuition: {tuition}. "
            f"{description_en} "
            f"Programs include: {major_names_en or 'not listed'}. "
            f"Admission requirements: {admission or 'contact the university'}. "
            f"Scholarships: {scholarship_summary or 'check the university website'}."
        )
        body_km = (
            f"{name_km} ({acronym_km}) ជាសាកលវិទ្យាល័យប្រភេទ "
            f"{university.university_type.lower()} នៅ {province}។ "
            f"ថ្លៃសិក្សា៖ {tuition}។ {description_km} "
            f"កម្មវិធីសិក្សារួមមាន៖ {major_names_km or major_names_en or 'មិនមានព័ត៌មាន'}។"
        )
        snippet_en = (
            f"{university.university_type.title()} university in {province}. "
            f"Tuition {tuition}. Programs include "
            f"{', '.join(major_names_en.split(', ')[:3]) or 'not listed'} "
            f"({len(offerings)} total)."
        )
        snippet_km = (
            f"សាកលវិទ្យាល័យប្រភេទ {university.university_type.lower()} នៅ {province}។ "
            f"ថ្លៃសិក្សា {tuition}។ មានកម្មវិធីសិក្សា {len(offerings)}។"
        )

        documents.append(
            KnowledgeDocument(
                id=str(university.id),
                type="university",
                slug=university.slug,
                title_en=(
                    f"{name_en} ({acronym_en})"
                    if acronym_en and acronym_en.lower() not in name_en.lower()
                    else name_en
                ),
                title_km=(
                    f"{name_km} ({acronym_km})"
                    if acronym_km and acronym_km.lower() not in name_km.lower()
                    else name_km
                ),
                body_en=body_en,
                body_km=body_km,
                snippet_en=_snippet(snippet_en),
                snippet_km=_snippet(snippet_km),
                url=f"/universities/{university.slug}",
                search_text=_normalize(
                    f"{name_en} {name_km} {acronym_en} {acronym_km} "
                    f"{body_en} {body_km} {TYPE_HINTS['university']}"
                ),
                aliases=frozenset(
                    _tokens(f"{acronym_en} {acronym_km} {university.slug}")
                ),
            )
        )

    for major in majors:
        name_en = _localized(major.name, "en") or major.slug
        name_km = _localized(major.name, "km") or name_en
        description_en = _localized(major.description, "en")
        description_km = _localized(major.description, "km")
        subjects = _localized_list(major.subjects_studied, "en")
        subjects_km = _localized_list(major.subjects_studied, "km")
        skills = _localized_list(major.required_skills, "en")
        skills_km = _localized_list(major.required_skills, "km")

        offering_lines_en = []
        offering_lines_km = []
        offering_names_en = []
        offering_names_km = []
        tuition_values: List[float] = []
        for offering in major.university_majors:
            if offering.university is None:
                continue
            university_name = _localized(offering.university.name, "en")
            university_name_km = _localized(offering.university.name, "km")
            offering_names_en.append(university_name)
            offering_names_km.append(university_name_km)
            fee = _money(offering.tuition_annual_usd)
            if offering.tuition_annual_usd is not None:
                try:
                    tuition_values.append(float(offering.tuition_annual_usd))
                except (TypeError, ValueError):
                    pass
            fee_text = f" — {fee}/year" if fee else ""
            grade = (offering.min_bacii_grade or "").upper()
            grade_text = f" (minimum BACII {grade})" if grade else ""
            grade_text_km = f" (និទ្ទេស BACII អប្បបរមា {grade})" if grade else ""
            offering_lines_en.append(f"{university_name}{fee_text}{grade_text}")
            offering_lines_km.append(
                f"{university_name_km}{fee_text}{grade_text_km}"
            )

        career_names = ", ".join(
            _localized(career.title, "en") for career in major.careers
        )
        career_names_km = ", ".join(
            _localized(career.title, "km") for career in major.careers
        )
        tuition_summary = (
            f"{_money(min(tuition_values))}–{_money(max(tuition_values))} per year"
            if len(tuition_values) > 1
            else (f"{_money(tuition_values[0])} per year" if tuition_values else "varies")
        )

        body_en = (
            f"{name_en} is a {major.category} major in Cambodia. {description_en} "
            f"Typical subjects: {subjects or 'not listed'}. "
            f"Skills developed: {skills or 'not listed'}. "
            f"Related careers: {career_names or 'not listed'}. "
            f"Offered at: {'; '.join(offering_lines_en[:8]) or 'no university listed yet'}. "
            f"Tuition range: {tuition_summary}."
        )
        body_km = (
            f"{name_km} ជាជំនាញផ្នែក {major.category} នៅកម្ពុជា។ {description_km} "
            f"មុខវិជ្ជាសំខាន់ៗ៖ {subjects_km or subjects or 'មិនមានព័ត៌មាន'}។ "
            f"ជំនាញដែលទទួលបាន៖ {skills_km or skills or 'មិនមានព័ត៌មាន'}។ "
            f"អាជីពពាក់ព័ន្ធ៖ {career_names_km or career_names or 'មិនមានព័ត៌មាន'}។ "
            f"បង្រៀននៅ៖ {'; '.join(offering_lines_km[:8]) or 'មិនទាន់មានព័ត៌មាន'}។"
        )
        snippet_en = _snippet(
            f"{major.category} major. {description_en} Offered at "
            f"{', '.join(offering_names_en[:3]) or 'no university listed yet'}. "
            f"Tuition {tuition_summary}."
        )
        snippet_km = _snippet(
            f"ជំនាញផ្នែក {major.category}។ {description_km} "
            f"បង្រៀននៅ {', '.join(offering_names_km[:2]) or 'មិនទាន់មានព័ត៌មាន'}។"
        )

        documents.append(
            KnowledgeDocument(
                id=str(major.id),
                type="major",
                slug=major.slug,
                title_en=name_en,
                title_km=name_km,
                body_en=body_en,
                body_km=body_km,
                snippet_en=snippet_en,
                snippet_km=snippet_km,
                url=f"/majors/{major.slug}",
                search_text=_normalize(
                    f"{name_en} {name_km} {body_en} {body_km} "
                    f"{TYPE_HINTS['major']}"
                ),
            )
        )

    for career in careers:
        title_en = _localized(career.title, "en") or career.slug
        title_km = _localized(career.title, "km") or title_en
        description_en = _localized(career.description, "en")
        description_km = _localized(career.description, "km")
        skills = _localized_list(career.required_skills, "en")
        responsibilities = _localized_list(career.responsibilities, "en")

        body_en = (
            f"{title_en} is a career in the {career.industry} industry. "
            f"{description_en} Responsibilities: {responsibilities or 'not listed'}. "
            f"Skills: {skills or 'not listed'}. "
            f"Typical education: {career.education_level}. "
            f"RIASEC code: {career.riasec_code}."
        )
        body_km = (
            f"{title_km} ជាអាជីពក្នុងវិស័យ {career.industry}។ {description_km} "
            f"ជំនាញត្រូវការ៖ {skills or 'មិនមានព័ត៌មាន'}។ "
            f"កម្រិតអប់រំ៖ {career.education_level}។"
        )
        snippet_en = _snippet(
            f"{career.industry} career. Skills: {skills or 'not listed'}. "
            f"{description_en}",
            320,
        )
        snippet_km = _snippet(description_km or snippet_en, 320)

        documents.append(
            KnowledgeDocument(
                id=str(career.id),
                type="career",
                slug=career.slug,
                title_en=title_en,
                title_km=title_km,
                body_en=body_en,
                body_km=body_km,
                snippet_en=snippet_en,
                snippet_km=snippet_km,
                url=f"/careers/{career.slug}",
                search_text=_normalize(
                    f"{title_en} {title_km} {body_en} {body_km} "
                    f"{TYPE_HINTS['career']}"
                ),
            )
        )

    for scholarship in scholarships:
        title_en = _localized(scholarship.title, "en") or scholarship.slug
        title_km = _localized(scholarship.title, "km") or title_en
        provider = _localized(scholarship.provider, "en")
        provider_km = _localized(scholarship.provider, "km") or provider
        description_en = _localized(scholarship.description, "en")
        description_km = _localized(scholarship.description, "km")
        eligibility = _localized_list(scholarship.eligibility_criteria, "en")
        coverage = scholarship.coverage_type.replace("_", " ").lower()
        if scholarship.coverage_percentage:
            coverage = f"{coverage} ({scholarship.coverage_percentage}%)"
        deadline = (
            scholarship.application_deadline.isoformat()
            if scholarship.application_deadline
            else "not published"
        )
        eligible_majors = ", ".join(
            _localized(major.name, "en") for major in scholarship.eligible_majors
        )

        body_en = (
            f"{title_en} is offered by {provider}. Coverage: {coverage}. "
            f"Deadline: {deadline}. Eligibility: {eligibility or 'see official page'}. "
            f"{description_en} Eligible majors: {eligible_majors or 'all majors'}. "
            f"Official page: {scholarship.official_url}."
        )
        body_km = (
            f"{title_km} ផ្តល់ដោយ {provider_km}។ ការគាំទ្រ៖ {coverage}។ "
            f"ផុតកំណត់៖ {deadline}។ លក្ខខណ្ឌ៖ {eligibility or 'សូមមើលទំព័រផ្លូវការ'}។ "
            f"{description_km}"
        )
        snippet_en = _snippet(
            f"{provider}. Coverage: {coverage}. Eligibility: "
            f"{eligibility or 'see official page'}. Deadline: {deadline}.",
            320,
        )
        snippet_km = _snippet(
            f"{provider_km}។ ការគាំទ្រ៖ {coverage}។ ផុតកំណត់៖ {deadline}។",
            320,
        )

        documents.append(
            KnowledgeDocument(
                id=str(scholarship.id),
                type="scholarship",
                slug=scholarship.slug,
                title_en=title_en,
                title_km=title_km,
                body_en=body_en,
                body_km=body_km,
                snippet_en=snippet_en,
                snippet_km=snippet_km,
                url=f"/scholarships/{scholarship.slug}",
                search_text=_normalize(
                    f"{title_en} {title_km} {body_en} {body_km} "
                    f"{TYPE_HINTS['scholarship']}"
                ),
            )
        )

    for document in documents:
        document.title_tokens = frozenset(
            _tokens(f"{document.title_en} {document.title_km}")
        )
        document.search_tokens = frozenset(_tokens(document.search_text))

    return documents


def _tokens(text: str) -> set[str]:
    normalized = _normalize(text)
    tokens: set[str] = set()

    for word in WORD_RE.findall(normalized):
        if len(word) > 1 and word not in STOPWORDS:
            tokens.add(word)

    # Khmer is written without consistent word spaces. Character n-grams give
    # stable overlap without needing a Khmer tokenizer or a paid embedding.
    for run in KHMER_RE.findall(normalized):
        if len(run) <= 4:
            tokens.add(run)
            continue
        for size in (3, 4):
            for index in range(len(run) - size + 1):
                tokens.add(run[index : index + size])

    return tokens


def _query_tokens(text: str) -> set[str]:
    normalized = _normalize(text)
    tokens = _tokens(normalized)
    for word in WORD_RE.findall(normalized):
        variants = {word}
        if len(word) > 3 and word.endswith("s"):
            variants.add(word[:-1])
        if word.endswith("ies"):
            variants.add(f"{word[:-3]}y")
        for variant in variants:
            for synonym in QUERY_SYNONYMS.get(variant, ()):
                tokens.add(synonym)
    for phrase, synonyms in PHRASE_SYNONYMS.items():
        if phrase in normalized:
            tokens.update(synonyms)
    return tokens


def _token_weight(token: str, weights: dict[str, float]) -> float:
    weight = weights.get(token, 1.0)
    # Khmer contributes many overlapping 3/4-grams. Without down-weighting,
    # a long Khmer sentence drowns out two or three distinctive Latin terms
    # such as "software" or "ITC".
    if KHMER_RE.fullmatch(token):
        return weight * 0.25
    return weight


def score_document(
    document: KnowledgeDocument,
    query: str,
    idf: Optional[dict[str, float]] = None,
) -> float:
    query_tokens = _query_tokens(query)
    if not query_tokens:
        return 0.0

    weights = idf or {}
    title_hits = sum(
        _token_weight(token, weights)
        for token in query_tokens & document.title_tokens
    )
    body_hits = sum(
        _token_weight(token, weights)
        for token in query_tokens & document.search_tokens
    )
    alias_hits = len(query_tokens & document.aliases)
    if body_hits == 0:
        return 0.0

    # A student who types "ITC" or "RUPP" expects that institution first, even
    # inside a Khmer sentence where character n-grams can dominate the score.
    acronym_boost = sum(
        20.0
        for acronym in re.findall(r"\b[A-Z]{2,6}\b", query)
        if acronym.lower() in document.aliases
    )

    phrase_bonus = 0.0
    normalized_query = _normalize(query)
    query_words = [
        word for word in WORD_RE.findall(normalized_query)
        if len(word) > 2 and word not in STOPWORDS
    ]
    for index in range(len(query_words) - 1):
        phrase = f"{query_words[index]} {query_words[index + 1]}"
        if phrase in document.search_text:
            phrase_bonus += 2.0
    if len(normalized_query) >= 4 and normalized_query in document.search_text:
        phrase_bonus += 4.0

    # Title matches are strong evidence. IDF keeps generic terms such as
    # "year" or "cost" from overwhelming a distinctive acronym like "ITC".
    return (
        (title_hits * 4.0)
        + body_hits
        + (alias_hits * 8.0)
        + acronym_boost
        + phrase_bonus
    )


def _intent_types(query: str) -> List[str]:
    normalized = _normalize(query)
    if any(word in normalized for word in INTENT_KEYWORDS["scholarship"]):
        return ["scholarship"]
    if any(word in normalized for word in INTENT_KEYWORDS["tuition"]):
        return ["university", "major"]
    if any(word in normalized for word in INTENT_KEYWORDS["career"]):
        return ["career", "major"]
    if any(word in normalized for word in INTENT_KEYWORDS["major"]):
        return ["major", "career"]
    if any(word in normalized for word in INTENT_KEYWORDS["university"]):
        return ["university", "major"]
    return []


def _is_domain_query(
    query: str, documents: Sequence[KnowledgeDocument]
) -> bool:
    normalized = _normalize(query)
    words = set(WORD_RE.findall(normalized))
    if words & DOMAIN_WORDS_EN:
        return True
    if any(term in normalized for term in DOMAIN_TERMS_KM):
        return True
    query_tokens = _tokens(query)
    return any(query_tokens & document.aliases for document in documents)


def retrieve_documents(
    documents: Sequence[KnowledgeDocument],
    query: str,
    limit: int = 6,
    similarities: Optional[dict[tuple[str, str], float]] = None,
) -> List[KnowledgeDocument]:
    if not documents or not _is_domain_query(query, documents):
        return []

    document_frequency: Counter[str] = Counter()
    for document in documents:
        document_frequency.update(document.search_tokens)
    total_documents = len(documents)
    idf = {
        token: math.log((total_documents + 1) / (frequency + 0.5)) + 1.0
        for token, frequency in document_frequency.items()
    }

    lexical_scored = [
        (score_document(document, query, idf), index, document)
        for index, document in enumerate(documents)
    ]
    lexical_scored.sort(key=lambda item: (item[0], -item[1]), reverse=True)
    max_lexical = lexical_scored[0][0] if lexical_scored else 0.0

    if similarities is not None:
        scored = []
        for lexical, index, document in lexical_scored:
            semantic = similarities.get((document.type, document.id), 0.0)
            semantic = max(0.0, min(1.0, semantic))
            lexical_normalized = lexical / max_lexical if max_lexical > 0 else 0.0
            hybrid = (0.55 * semantic) + (0.45 * lexical_normalized)
            scored.append((hybrid, index, document))
        scored.sort(key=lambda item: (item[0], -item[1]), reverse=True)
        top_score = scored[0][0] if scored else 0.0
        relevance_floor = max(0.30, top_score * 0.55) if top_score > 0 else 0.0
    else:
        scored = lexical_scored
        relevance_floor = scored[0][0] * 0.25 if scored else 0.0

    selected: List[KnowledgeDocument] = []
    seen: set[str] = set()

    def add(document: KnowledgeDocument) -> None:
        if document.id not in seen and len(selected) < limit:
            selected.append(document)
            seen.add(document.id)

    intent_types = _intent_types(query)

    # An explicit acronym ("ITC", "RUPP") should always surface that record
    # first, even inside a Khmer sentence.
    acronym_tokens = {
        acronym.lower()
        for acronym in re.findall(r"\b[A-Z]{2,6}\b", query)
    }
    if acronym_tokens:
        for score, _, document in scored:
            if score <= relevance_floor:
                break
            if acronym_tokens & document.aliases:
                add(document)

    # Reserve one seat per detected intent. A question about universities that
    # offer software engineering should always include at least one university,
    # even when individual major pages score slightly higher.
    for wanted in intent_types:
        for score, _, document in scored:
            if score > relevance_floor and document.type == wanted:
                add(document)
                break

    # Then prefer the remaining documents that match the intent before filling
    # with general context.
    if intent_types:
        for score, _, document in scored:
            if score <= relevance_floor:
                break
            if document.type in intent_types:
                add(document)
            if len(selected) >= limit:
                break

    for score, _, document in scored:
        if score <= relevance_floor:
            break
        add(document)
        if len(selected) >= limit:
            break

    return selected[:limit]


def build_context(
    documents: Sequence[KnowledgeDocument],
    language: str,
    max_chars: int,
    per_document_chars: int = 700,
) -> str:
    blocks: List[str] = []
    for index, document in enumerate(documents, start=1):
        title = document.title_km if language == "km" else document.title_en
        body = document.body_km if language == "km" else document.body_en
        blocks.append(
            f"[{index}] {document.type.upper()}: {title}\n"
            f"{body[:per_document_chars]}"
        )
    context = "\n\n".join(blocks)
    return context[:max_chars]


def build_extractive_answer(
    documents: Sequence[KnowledgeDocument], language: str
) -> str:
    is_km = language == "km"
    if not documents:
        return (
            "ខ្ញុំមិនបានរកឃើញព័ត៌មានត្រូវគ្នានៅក្នុងទិន្នន័យ OrienX ទេ។ សូមសាកល្បងសួរអំពីសាកលវិទ្យាល័យ "
            "ជំនាញ អាហារូបករណ៍ ឬអាជីពជាក់លាក់មួយ។"
            if is_km
            else "I could not find a matching record in OrienX's verified data. "
            "Try asking about a specific university, major, scholarship, or career."
        )

    labels = {
        "university": ("សាកលវិទ្យាល័យ", "University"),
        "major": ("ជំនាញ", "Major"),
        "career": ("អាជីព", "Career"),
        "scholarship": ("អាហារូបករណ៍", "Scholarship"),
    }
    intro = (
        "នេះជាព័ត៌មានដែលខ្ញុំរកឃើញក្នុងទិន្នន័យដែលបានផ្ទៀងផ្ទាត់របស់ OrienX៖"
        if is_km
        else "Here is what I found in OrienX's verified records:"
    )
    lines = [intro]
    for document in documents[:5]:
        title = document.title_km if is_km else document.title_en
        snippet = document.snippet_km if is_km else document.snippet_en
        label = labels.get(document.type, (document.type, document.type))[0 if is_km else 1]
        lines.append(f"• {label}: {title} — {snippet}")

    lines.append(
        "ចំណាំ៖ ម៉ូដែល AI មូលដ្ឋានមិនទាន់ដំណើរការ ដូច្នេះចម្លើយនេះបង្កើតដោយផ្ទាល់ពីទិន្នន័យ។ "
        "ដំណើរការ Ollama ដើម្បីទទួលបានចម្លើយសន្ទនាបន្ថែម។"
        if is_km
        else "Note: the local AI model is not running, so this answer was assembled "
        "directly from the database. Start Ollama for a conversational answer."
    )
    return "\n".join(lines)


def suggested_questions(language: str) -> List[str]:
    if language == "km":
        return [
            "តើសាកលវិទ្យាល័យណាខ្លះបង្រៀនវិស្វកម្មកុំព្យូទ័រ?",
            "ថ្លៃសិក្សានៅ ITC ប៉ុន្មានក្នុងមួយឆ្នាំ?",
            "មានអាហារូបករណ៍អ្វីខ្លះសម្រាប់និស្សិត?",
            "តើជំនាញណាសមស្របនឹងមនុស្សចូលចិត្តបង្កើតរបស់ថ្មី?",
        ]
    return [
        "Which universities offer software engineering?",
        "How much does ITC cost per year?",
        "What scholarships can I apply for?",
        "Which major suits a creative student?",
    ]
