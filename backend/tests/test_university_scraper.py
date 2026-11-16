import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "scrape_real_universities.py"
spec = importlib.util.spec_from_file_location("scrape_real_universities", SCRIPT)
scraper = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(scraper)


def test_strip_html_keeps_readable_structure():
    text = scraper.strip_html(
        "<h3>Faculty of Engineering</h3><ul><li>Civil Engineering</li>"
        "<li>Architecture</li></ul><script>ignore()</script>"
    )
    assert "Faculty of Engineering" in text
    assert "• Civil Engineering" in text
    assert "ignore" not in text


def test_normalize_text_handles_khmer_diacritics_and_case():
    assert scraper.normalize_text("Paññāsāstra University of Cambodia") == (
        "pannasastra university of cambodia"
    )


def test_parse_page_extracts_metadata_and_contact_links():
    page = scraper.parse_page(
        """
        <html><head>
          <title>Royal University of Law and Economics</title>
          <meta name="description" content="Public university in Phnom Penh." />
          <meta property="og:image" content="https://rule.edu.kh/cover.jpg" />
          <link rel="icon" href="/favicon.png" />
        </head><body>
          <a href="mailto:info@rule.edu.kh">Email</a>
          <a href="tel:+855123456789">Call</a>
        </body></html>
        """
    )
    assert page.meta["title"] == "Royal University of Law and Economics"
    assert page.meta["description"] == "Public university in Phnom Penh."
    assert page.meta["og:image"] == "https://rule.edu.kh/cover.jpg"
    assert any(
        link.get("href") == "mailto:info@rule.edu.kh" for link in page.links
    )


def test_choose_schools_uses_explicit_mapping_and_skips_subunits():
    sources = scraper.load_sources()
    schools = [
        {
            "_source": {
                "name": "Royal University of Law and Economics",
                "schoolType": "university",
                "verified": True,
                "overview": "A public university.",
            }
        },
        {
            "_source": {
                "name": "RUPP - Department of Media and Communication",
                "schoolType": "university",
                "verified": True,
            }
        },
        {
            "_source": {
                "name": "National University of Battambang",
                "schoolType": "university",
                "verified": False,
            }
        },
        {
            "_source": {
                "name": "Some Short Course",
                "schoolType": "short-course",
                "verified": True,
            }
        },
    ]
    candidates, skipped = scraper.choose_schools(schools, sources)
    assert "rule" in {candidate["slug"] for candidate in candidates}
    assert all(candidate["slug"] != "rupp-dmc" for candidate in candidates)
    assert any("Department" in item["name"] for item in skipped)


def test_pick_email_prefers_institution_domain():
    assert (
        scraper.pick_email(
            ["international@partner.org"],
            "https://rule.edu.kh",
            "urdsecoopfreco@gmail.com",
            "RULE",
        )
        is None
    )
    assert (
        scraper.pick_email(
            ["international@partner.org"],
            "https://www.rufa.edu.kh",
            "info@rufa.edu.kh",
            "RUFA",
        )
        == "info@rufa.edu.kh"
    )


def test_bad_directory_phone_is_rejected():
    assert scraper.clean_phone("+85512345678") is None
    assert scraper.clean_phone("+855 23 999 906") == "+855 23 999 906"


def test_normalized_candidate_does_not_store_unverified_sala_tuition():
    record = scraper.normalize_candidate(
        "rule",
        {
            "name": "Royal University of Law and Economics",
            "website": "https://rule.edu.kh",
            "province": "Phnom Penh",
        },
        {
            "name": "Royal University of Law and Economics",
            "nameNative": "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច",
            "schoolId": "abc",
            "isPublic": "yes",
            "address": "Preah Monivong Blvd, Phnom Penh",
            "overview": "The Royal University of Law and Economics is a public university.",
            "minPrice": "79.5",
            "maxPrice": "4560",
            "verified": True,
        },
        {
            "verified": True,
            "emails": ["info@rule.edu.kh"],
            "phone": "+855 23 999 906",
        },
    )
    assert record["tuition_range_min_usd"] is None
    assert record["tuition_range_max_usd"] is None
    assert record["is_tuition_verified"] is False
    assert record["sala_tuition"] == {"min": 79.5, "max": 4560.0}
    assert record["contact_email"] == "info@rule.edu.kh"
    assert record["name"]["en"] == "Royal University of Law and Economics"
