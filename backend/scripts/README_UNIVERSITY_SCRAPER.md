# Real university data importer

This scraper fills the OrienX university catalog from public, attributable
sources.

## Sources

1. **Sala public school directory API** — discovery and enrichment:
   - `GET https://www.sala.co/api-aca/schools?status=active&limit=200`
   - Only `schoolType = university` records are considered.
   - Sala profile URLs under `/profile` and `/advisor` are disallowed by
     `robots.txt`; this script never requests them.
2. **The institution's official website** — verification:
   - The URL must be listed in `scripts/university_sources.json`.
   - The page title or visible body must contain the institution name.
   - Only verified records are written to the database by default.

## What is imported

Safe identity and contact fields:

- canonical name + Khmer name
- acronym
- description (English/Khmer when the directory provides it)
- public/private type
- province and address
- official website
- contact email and phone (domain-checked; directory placeholders rejected)
- logo/cover image where available
- established year when it can be parsed
- `data_source`, `source_url`, `last_verified_at` provenance

## What is deliberately not imported

Sala's tuition columns are **not** written as verified tuition. They can be
per-credit or legacy ranges. Existing curated tuition is preserved. The raw
values remain visible in the review report under `sala_tuition`.

Admissions, facilities, scholarship summaries, and degree programs are left
alone unless a future source-specific parser is added. This prevents
unverified or stale content from entering the student catalog.

## Commands

Run from `backend/`:

```bash
# Dry run: fetch, verify, and write a review report (no DB changes)
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py

# Import the verified records
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --apply

# Restrict to particular institutions
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --only rule,camtech

# Overwrite existing curated description/tuition fields (careful)
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --apply --force
```

Reports and raw snapshots are written to
`backend/data/university_scrape/` and are git-ignored.

## Adding another institution

1. Add its official website and name aliases to
   `scripts/university_sources.json`.
2. Re-run the dry run and inspect `preview_*.json`.
3. Apply once the official-site check passes.

The script only processes institutions explicitly present in the registry, so
adding a source is an intentional verification step.
