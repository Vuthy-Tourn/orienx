#!/usr/bin/env python3
"""Collect verified Cambodian university data for OrienX.

The scraper uses two layers:

1. Sala's public school directory API as a discovery/enrichment index.
2. The institution's own official website as the verification source.

Only public landing pages are requested, with a short delay between requests.
Raw snapshots and a review report are written under ``backend/data/university_scrape``.

Examples:
    PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py
    PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --apply
    PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --only rule,camtech
"""

from __future__ import annotations

import argparse
import asyncio
import html as html_lib
import json
import re
import sys
import unicodedata
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.catalog import University  # noqa: E402
from sqlalchemy import select  # noqa: E402

SALA_SCHOOLS_URL = "https://www.sala.co/api-aca/schools"
SALA_SCHOOL_URL = f"{SALA_SCHOOLS_URL}/{{school_id}}"
DATA_DIR = ROOT / "data" / "university_scrape"
SOURCES_FILE = Path(__file__).with_name("university_sources.json")

BOT_UA = "OrienXDataBot/1.0 (+https://orienx.edu.kh; data verification)"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
)
REQUEST_DELAY_SECONDS = 0.7
REQUEST_TIMEOUT_SECONDS = 25
MAX_DESCRIPTION_CHARS = 2400

SKIP_NAME_MARKERS = (
    "department",
    "faculty",
    "campus",
    "international college",
    "training",
)


class _PageParser(HTMLParser):
    """Small HTML parser for page metadata and visible text."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.links: list[dict[str, str]] = []
        self.parts: list[str] = []
        self._in_title = False
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]) -> None:
        values = {key.lower(): (value or "") for key, value in attrs}
        tag = tag.lower()

        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            key = values.get("name") or values.get("property") or values.get("itemprop")
            content = values.get("content")
            if key and content:
                self.meta[key.lower()] = content
        elif tag == "link":
            self.links.append(values)
        elif tag == "a":
            href = values.get("href", "")
            if href.startswith(("mailto:", "tel:")):
                self.links.append({"href": href, "rel": "contact"})

        if self._skip_depth == 0:
            if tag in {"br", "p", "div", "section", "article", "h1", "h2", "h3", "h4", "tr"}:
                self.parts.append("\n")
            elif tag == "li":
                self.parts.append("\n• ")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript"}:
            self._skip_depth = max(0, self._skip_depth - 1)
        elif tag == "title":
            self._in_title = False
        elif tag in {"p", "div", "section", "article", "h1", "h2", "h3", "h4", "tr", "ul", "ol"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.meta["title"] = f"{self.meta.get('title', '')}{data}"
        if self._skip_depth == 0:
            self.parts.append(data)


def clean_text(value: str) -> str:
    value = html_lib.unescape(value or "")
    value = re.sub(r"\r", "\n", value)
    value = re.sub(r"[ \t\f\v]+", " ", value)
    value = re.sub(r"\n\s*\n+", "\n\n", value)
    return value.strip()


def strip_html(value: Optional[str]) -> str:
    if not value:
        return ""
    parser = _PageParser()
    try:
        parser.feed(value)
        parser.close()
        return clean_text("".join(parser.parts))
    except Exception:
        return clean_text(re.sub(r"<[^>]+>", " ", value))


def parse_page(source: str) -> _PageParser:
    parser = _PageParser()
    parser.feed(source)
    parser.close()
    return parser


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-z0-9]+", " ", value.lower())
    return re.sub(r"\s+", " ", value).strip()


def token_set(value: str) -> set[str]:
    return set(normalize_text(value).split())


def alias_score(name: str, aliases: list[str]) -> float:
    """How strongly a Sala name matches one official registry entry."""
    name_tokens = token_set(name)
    best = 0.0
    for alias in aliases:
        alias_tokens = token_set(alias)
        if len(alias_tokens) < 2:
            continue
        overlap = len(name_tokens & alias_tokens)
        best = max(best, overlap / len(alias_tokens))
    return best


def make_slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value[:120]


def first_email(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", value)
    return match.group(0) if match else None


def email_domain(email: str) -> str:
    return email.rsplit("@", 1)[-1].lower().replace("www.", "")


def pick_email(
    emails: list[Optional[str]],
    website: str,
    sala_email: Optional[str],
    acronym: str,
) -> Optional[str]:
    site_domain = urlparse(website).netloc.lower().replace("www.", "")
    candidates = [email for email in emails if email] + ([sala_email] if sala_email else [])
    ranked: list[tuple[int, str]] = []
    for email in candidates:
        domain = email_domain(email)
        local = email.split("@", 1)[0].lower()
        score = 0
        if domain == site_domain or domain.endswith(f".{site_domain}"):
            score += 6
        if domain.endswith(".edu.kh"):
            score += 3
        if local in {"info", "admissions", "admission", "contact", "enquiry", "secretary", "office"}:
            score += 2
        if acronym and acronym.lower() in local:
            score += 1
        if domain in {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com"}:
            score -= 6
        ranked.append((score, email))
    if not ranked:
        return None
    ranked.sort(key=lambda item: item[0], reverse=True)
    score, email = ranked[0]
    return email if score > 0 else None


def clean_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = re.sub(r"\s+", " ", value).strip()
    digits = re.sub(r"\D", "", value)
    if len(digits) < 6:
        return None
    # Directory placeholders such as +855 12 345 678 are not real contacts.
    if re.search(r"(12345678|0000000|1111111)", digits):
        return None
    if len(set(digits)) <= 2:
        return None
    return value[:100]


def parse_price(value: Any) -> Optional[float]:
    if value in (None, ""):
        return None
    match = re.search(r"\d+(?:\.\d+)?", str(value).replace(",", ""))
    if not match:
        return None
    number = float(match.group(0))
    return number if number >= 0 else None


def parse_year(text: str) -> Optional[int]:
    match = re.search(
        r"(?:founded|established|since|opened)\s+(?:in\s+)?(19\d{2}|20\d{2})",
        text,
        flags=re.IGNORECASE,
    )
    if not match:
        return None
    year = int(match.group(1))
    return year if 1900 <= year <= 2100 else None


def normalize_province(value: Optional[str], address: str) -> str:
    if value:
        return str(value).strip()
    for province in (
        "Phnom Penh",
        "Battambang",
        "Siem Reap",
        "Preah Sihanouk",
        "Kampong Cham",
        "Kampong Chhnang",
        "Kampong Thom",
        "Kandal",
        "Takeo",
        "Svay Rieng",
        "Banteay Meanchey",
        "Tbong Khmum",
        "Pursat",
    ):
        if province.lower() in address.lower():
            return province
    return "Phnom Penh"


# Exact Sala display-name -> OrienX slug. This avoids fuzzy matches between
# generic names such as "National University of Management" and
# "National University of Battambang".
SALA_NAME_TO_SLUG = {
    normalize_text(name): slug
    for name, slug in {
        "Paragon International University": "paragoniu",
        "Royal University of Law and Economics": "rule",
        "American University of Phnom Penh": "aupp",
        "De Montfort University Cambodia": "dmuc",
        "Cambodia University of Technology and Science": "camtech",
        "Cambodia Academy of Digital Technology": "cadt",
        "East Asia Management University": "eamu",
        "IIC University of Technology": "iic",
        "Phnom Penh International University (PPIU)": "ppiu",
        "Royal University of Fine Arts": "rufa",
        "Pannasastra University Cambodia": "puc",
        "Institute of Technology of Cambodia": "itc",
        "Cambodian University for Specialties": "cus",
        "Build Bright University (BBU)": "bbu",
        "Royal University of Agriculture": "rua",
        "Royal University of Phnom Penh": "rupp",
        "The University of Cambodia": "uc",
        "Western University": "western",
    }.items()
}


def load_sources() -> dict[str, dict[str, Any]]:
    with SOURCES_FILE.open(encoding="utf-8") as handle:
        return json.load(handle)


def choose_source(
    name: str, sources: dict[str, dict[str, Any]]
) -> Optional[tuple[str, dict[str, Any]]]:
    slug = SALA_NAME_TO_SLUG.get(normalize_text(name))
    if slug and slug in sources:
        return slug, sources[slug]

    # Accept an exact registry alias if the directory added punctuation or a
    # legal suffix while keeping the same canonical name.
    normalized = normalize_text(name)
    for candidate_slug, source in sources.items():
        for alias in source.get("aliases", [source["name"]]):
            if normalize_text(alias) == normalized:
                return candidate_slug, source
    return None


def choose_schools(
    schools: list[dict[str, Any]], sources: dict[str, dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Return one best Sala record per official institution, plus skipped names."""
    grouped: dict[str, tuple[int, dict[str, Any]]] = {}
    skipped: list[dict[str, str]] = []

    for hit in schools:
        school = hit.get("_source", hit)
        name = (school.get("name") or "").strip()
        if not name:
            continue
        if str(school.get("schoolType", "")).strip().lower() != "university":
            continue
        if any(marker in name.lower() for marker in SKIP_NAME_MARKERS):
            skipped.append({"name": name, "reason": "sub-unit or duplicate campus"})
            continue

        selected = choose_source(name, sources)
        if not selected:
            skipped.append({"name": name, "reason": "no official source in registry"})
            continue

        slug, source = selected
        score = 1 if school.get("verified") else 0
        rich = len(school.get("overview") or "") + len(school.get("nameNative") or "")
        rank = (score, rich)
        current = grouped.get(slug)
        if current is None or rank > current[0]:
            grouped[slug] = (rank, school)

    candidates: list[dict[str, Any]] = []
    for slug, (_, school) in grouped.items():
        candidates.append({"slug": slug, "source": sources[slug], "school": school})
    return candidates, skipped


async def fetch_sala_schools(client: httpx.AsyncClient) -> dict[str, Any]:
    response = await client.get(
        SALA_SCHOOLS_URL,
        params={"status": "active", "limit": 200},
    )
    response.raise_for_status()
    return response.json()


async def check_robots(
    client: httpx.AsyncClient,
    url: str,
    cache: dict[str, RobotFileParser | None],
) -> bool:
    parsed = urlparse(url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    if origin not in cache:
        parser: RobotFileParser | None = None
        try:
            response = await client.get(
                f"{origin}/robots.txt",
                headers={"User-Agent": BOT_UA},
                timeout=10,
            )
            if response.status_code < 400:
                parser = RobotFileParser()
                parser.set_url(f"{origin}/robots.txt")
                parser.parse(response.text.splitlines())
            cache[origin] = parser
        except Exception:
            cache[origin] = None
    parser = cache[origin]
    return parser.can_fetch(BOT_UA, url) if parser else True


async def scrape_official(
    client: httpx.AsyncClient,
    url: str,
    aliases: list[str],
    robots_cache: dict[str, RobotFileParser | None],
) -> dict[str, Any]:
    if not await check_robots(client, url, robots_cache):
        return {"reachable": False, "verified": False, "reason": "robots.txt"}

    try:
        response = await client.get(
            url,
            headers={"User-Agent": BROWSER_UA, "Accept": "text/html,*/*"},
        )
    except Exception as exc:
        return {"reachable": False, "verified": False, "reason": str(exc)[:160]}

    if response.status_code >= 400:
        return {
            "reachable": False,
            "verified": False,
            "reason": f"HTTP {response.status_code}",
        }

    page = parse_page(response.text)
    title = clean_text(page.meta.get("title", ""))
    text = strip_html(response.text)[:80000]
    haystack = normalize_text(f"{title} {text}")
    alias_hit = any(
        len(normalize_text(alias)) >= 6 and normalize_text(alias) in haystack
        for alias in aliases
    )

    official_emails = [
        link["href"][7:].split("?")[0]
        for link in page.links
        if link.get("href", "").startswith("mailto:")
    ]
    official_phone = next(
        (
            link["href"][4:].split("?")[0]
            for link in page.links
            if link.get("href", "").startswith("tel:")
        ),
        None,
    )
    icon = next(
        (
            link.get("href")
            for link in page.links
            if "icon" in link.get("rel", "").lower() and link.get("href")
        ),
        None,
    )

    return {
        "reachable": True,
        "verified": alias_hit,
        "reason": None if alias_hit else "name not found on official page",
        "title": title,
        "description": clean_text(
            page.meta.get("description")
            or page.meta.get("og:description")
            or ""
        ),
        "og_image": page.meta.get("og:image") or "",
        "favicon": urljoin(url, icon) if icon else None,
        "emails": [email for email in (first_email(item) for item in official_emails) if email],
        "phone": clean_phone(official_phone),
    }


def normalize_candidate(
    slug: str,
    source: dict[str, Any],
    school: dict[str, Any],
    official: dict[str, Any],
) -> dict[str, Any]:
    name = clean_text(source["name"])
    name_km = clean_text(school.get("nameNative") or "")
    address = clean_text(school.get("address") or "")
    official_verified = bool(official.get("verified"))

    description_en = strip_html(school.get("overview")) or official.get("description") or ""
    if len(description_en) < 40:
        description_en = strip_html(school.get("mission")) or description_en
    description_en = description_en[:MAX_DESCRIPTION_CHARS].strip()
    description_km = strip_html(school.get("overviewKhmer"))[:MAX_DESCRIPTION_CHARS].strip()

    if not description_en:
        description_en = (
            f"{name} is a Cambodian higher education institution in "
            f"{normalize_province(school.get('province'), address)}."
        )

    code = clean_text(school.get("code") or "")
    acronym = code[:20] if code else "".join(
        word[0] for word in name.split() if word[:1].isalpha()
    )[:8]

    tuition_min = parse_price(school.get("minPrice"))
    tuition_max = parse_price(school.get("maxPrice"))
    if tuition_min is not None and tuition_max is not None and tuition_min > tuition_max:
        tuition_min, tuition_max = tuition_max, tuition_min

    cover = school.get("featureImage") or official.get("og_image")
    if isinstance(cover, dict):
        cover = cover.get("url")
    if not isinstance(cover, str) or not cover.startswith(("http://", "https://")):
        cover = None

    established = parse_year(" ".join([description_en, strip_html(school.get("mission"))]))
    sala_id = school.get("schoolId") or ""
    website = source["website"]
    source_url = f"{SALA_SCHOOL_URL.format(school_id=sala_id)} | {website}" if sala_id else website

    return {
        "slug": slug,
        "name": {"en": name, "km": name_km},
        "acronym": {"en": acronym, "km": acronym},
        "description": {"en": description_en, "km": description_km},
        "university_type": "PUBLIC"
        if str(school.get("isPublic", "")).lower() in {"yes", "true", "public", "1"}
        else "PRIVATE",
        "logo_url": official.get("favicon"),
        "cover_image_url": cover,
        "province": normalize_province(school.get("province"), address),
        "address": {"en": address or source.get("province", "Phnom Penh"), "km": ""},
        "website_url": website,
        "contact_email": pick_email(
            official.get("emails", []),
            website,
            first_email(school.get("email")),
            acronym,
        ),
        "contact_phone": official.get("phone") or clean_phone(school.get("phone")),
        "established_year": established,
        # Sala price fields are not always annual tuition (some are per
        # credit or legacy ranges). Keep them in the review report, but do
        # not store them as verified tuition in the public catalog.
        "sala_tuition": {"min": tuition_min, "max": tuition_max},
        "tuition_range_min_usd": None,
        "tuition_range_max_usd": None,
        "is_tuition_verified": False,
        "admission_requirements": None,
        "facilities": None,
        "scholarship_summary": None,
        "is_verified": official_verified,
        "data_source": "Sala public school directory + official institution website",
        "source_url": source_url,
        "last_verified_at": date.today() if official_verified else None,
        "official_check": official,
        "sala_id": sala_id,
    }


async def collect(only: Optional[set[str]], limit: Optional[int]) -> dict[str, Any]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    sources = load_sources()
    generated_at = datetime.now(timezone.utc)

    async with httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT_SECONDS,
        follow_redirects=True,
    ) as client:
        sala = await fetch_sala_schools(client)
        schools = sala.get("hits", [])
        candidates, skipped = choose_schools(schools, sources)

        if only:
            candidates = [candidate for candidate in candidates if candidate["slug"] in only]
        if limit:
            candidates = candidates[:limit]

        checked: list[dict[str, Any]] = []
        robots_cache: dict[str, RobotFileParser | None] = {}
        for index, candidate in enumerate(candidates, start=1):
            source = candidate["source"]
            school = candidate["school"]
            official = await scrape_official(
                client,
                source["website"],
                source.get("aliases", [source["name"]]),
                robots_cache,
            )
            record = normalize_candidate(candidate["slug"], source, school, official)
            checked.append(record)
            status = "verified" if official.get("verified") else "unverified"
            print(f"[{index}/{len(candidates)}] {status:10} {record['name']['en']}")
            await asyncio.sleep(REQUEST_DELAY_SECONDS)

    snapshot_path = DATA_DIR / f"sala_schools_{generated_at:%Y%m%d}.json"
    snapshot_path.write_text(
        json.dumps(sala, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    verified = [record for record in checked if record["official_check"].get("verified")]
    review = [record for record in checked if not record["official_check"].get("verified")]

    report = {
        "generated_at": generated_at.isoformat(),
        "source": SALA_SCHOOLS_URL,
        "sala_schools_in_response": len(schools),
        "official_candidates": len(candidates),
        "verified": len(verified),
        "needs_review": len(review),
        "skipped": skipped,
        "universities": verified,
        "review": review,
    }

    report_path = DATA_DIR / f"preview_{generated_at:%Y%m%d_%H%M%S}.json"
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    report["report_path"] = str(report_path)
    report["snapshot_path"] = str(snapshot_path)
    return report


async def apply_records(records: list[dict[str, Any]], force: bool) -> dict[str, int]:
    inserted = 0
    updated = 0
    unchanged = 0

    async with AsyncSessionLocal() as db:
        for record in records:
            if not record.get("official_check", {}).get("verified"):
                continue

            existing = (
                await db.execute(select(University).where(University.slug == record["slug"]))
            ).scalar_one_or_none()

            if existing is None:
                university = University(
                    slug=record["slug"],
                    name=record["name"],
                    acronym=record["acronym"],
                    description=record["description"],
                    university_type=record["university_type"],
                    logo_url=record["logo_url"],
                    cover_image_url=record["cover_image_url"],
                    province=record["province"],
                    address=record["address"],
                    website_url=record["website_url"],
                    contact_email=record["contact_email"],
                    contact_phone=record["contact_phone"],
                    established_year=record["established_year"],
                    tuition_range_min_usd=record["tuition_range_min_usd"],
                    tuition_range_max_usd=record["tuition_range_max_usd"],
                    is_tuition_verified=False,
                    admission_requirements=record["admission_requirements"],
                    facilities=record["facilities"],
                    scholarship_summary=record["scholarship_summary"],
                    is_verified=True,
                    data_source=record["data_source"],
                    source_url=record["source_url"],
                    last_verified_at=record["last_verified_at"],
                )
                db.add(university)
                inserted += 1
                continue

            changed = False
            scalar_fields = (
                "logo_url",
                "cover_image_url",
                "contact_email",
                "contact_phone",
                "established_year",
                "tuition_range_min_usd",
                "tuition_range_max_usd",
            )
            for field in scalar_fields:
                value = record.get(field)
                if value in (None, "") and not force:
                    continue
                if force or not getattr(existing, field):
                    setattr(existing, field, value)
                    changed = True

            if force or not (existing.description or {}).get("en"):
                existing.description = record["description"]
                changed = True
            if force or not (existing.address or {}).get("en"):
                existing.address = record["address"]
                changed = True
            if force or not existing.website_url:
                existing.website_url = record["website_url"]
                changed = True
            if force or not (existing.acronym or {}).get("en"):
                existing.acronym = record["acronym"]
                changed = True
            if force or not (existing.name or {}).get("km"):
                existing.name = {
                    **(existing.name or {}),
                    "km": record["name"].get("km") or (existing.name or {}).get("km", ""),
                }
                changed = True

            # Existing curated tuition/admissions are intentionally kept unless
            # the operator explicitly asks for a forced overwrite.
            if force:
                existing.is_tuition_verified = record["is_tuition_verified"]
                existing.admission_requirements = record["admission_requirements"]
                existing.facilities = record["facilities"]
                existing.scholarship_summary = record["scholarship_summary"]
                existing.is_verified = True
                changed = True

            # Earlier versions of this importer stored Sala price ranges
            # directly. Remove those unverified values on the next run.
            if (
                not existing.is_tuition_verified
                and (existing.data_source or "").startswith("Sala public school directory")
            ):
                if existing.tuition_range_min_usd is not None or existing.tuition_range_max_usd is not None:
                    existing.tuition_range_min_usd = None
                    existing.tuition_range_max_usd = None
                    changed = True

            existing.data_source = record["data_source"]
            existing.source_url = record["source_url"]
            existing.last_verified_at = record["last_verified_at"]
            changed = True

            if changed:
                updated += 1
            else:
                unchanged += 1

        await db.commit()

    return {"inserted": inserted, "updated": updated, "unchanged": unchanged}


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write verified records to the database (default is dry-run).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing description/tuition/admissions with scraped values.",
    )
    parser.add_argument(
        "--only",
        help="Comma-separated slugs to import, e.g. rule,camtech.",
    )
    parser.add_argument("--limit", type=int, help="Maximum institutions to process.")
    args = parser.parse_args()

    only = {item.strip() for item in args.only.split(",") if item.strip()} if args.only else None
    report = await collect(only=only, limit=args.limit)

    print(
        f"\nSala schools: {report['sala_schools_in_response']} | "
        f"registry candidates: {report['official_candidates']} | "
        f"verified: {report['verified']} | review: {report['needs_review']}"
    )
    print(f"Report: {report['report_path']}")
    print(f"Snapshot: {report['snapshot_path']}")

    if not report["universities"]:
        print("No verified records to import.")
        return

    if args.apply:
        result = await apply_records(report["universities"], force=args.force)
        print(f"Database: {result}")
    else:
        print("Dry run — no database rows changed. Re-run with --apply to import.")


if __name__ == "__main__":
    asyncio.run(main())
