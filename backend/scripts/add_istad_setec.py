"""Add ISTAD and SETEC Institute with their official program offerings.

Usage:
    PYTHONPATH=. ./venv/bin/python scripts/add_istad_setec.py --dry-run
    PYTHONPATH=. ./venv/bin/python scripts/add_istad_setec.py
"""

import argparse
import asyncio
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.catalog import Major, University, UniversityMajor

CHECKED_AT = date.today().isoformat()

UNIVERSITIES = [
    {
        "slug": "istad",
        "name": {
            "en": "Institute of Science and Technology Advanced Development",
            "km": "វិទ្យាស្ថាន សាយអិនស៍ អេន ថេកណឡជី អ៊ែតវ៉ានស៍ ឌីវេឡុបម៉ិន (ISTAD)",
        },
        "acronym": {"en": "ISTAD", "km": "ISTAD"},
        "description": {
            "en": "Private IT institute in Phnom Penh offering 2-year associate and 4-year bachelor programs in information technology, with practical training in full-stack development, mobile apps, DevOps and cybersecurity.",
            "km": "វិទ្យាស្ថានឯកជនផ្នែកបច្ចេកវិទ្យាព័ត៌មាននៅរាជធានីភ្នំពេញ ផ្តល់កម្មវិធីបរិញ្ញាបត្ររង ២ឆ្នាំ និងបរិញ្ញាបត្រ ៤ឆ្នាំ លើជំនាញបច្ចេកវិទ្យាព័ត៌មាន ជាមួយការបណ្តុះបណ្តាលជាក់ស្តែងលើ Full-stack កម្មវិធីទូរស័ព្ទ DevOps និងសន្តិសុខសាយប័រ។",
        },
        "university_type": "PRIVATE",
        "logo_url": "/images/universities/istad-logo.png",
        "cover_image_url": None,
        "province": "Phnom Penh",
        "address": {
            "en": "No. 40, Street 273, Sangkat Boeung Kak I, Khan Toul Kork, Phnom Penh",
            "km": "លេខ ៤០ ផ្លូវ ២៧៣ សង្កាត់បឹងកក់ ១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
        },
        "website_url": "https://istad.co",
        "contact_email": "info.istad@gmail.com",
        "contact_phone": "+855 95 990 910 / +855 93 990 910",
        "established_year": None,
        "tuition_range_min_usd": None,
        "tuition_range_max_usd": None,
        "is_tuition_verified": False,
        "admission_requirements": {
            "en": [
                "High school national diploma (BacII) or equivalent",
                "High school transcript",
                "Online application and document upload",
            ],
            "km": [
                "សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ឬសមមូល",
                "សៀវភៅពិន្ទុវិទ្យាល័យ",
                "ពាក្យសុំតាមអនឡាញ និងការផ្ទុកឯកសារ",
            ],
        },
        "facilities": {
            "en": [
                "Computer labs",
                "Full-stack project studio",
                "Cybersecurity lab",
                "Career mentoring",
            ],
            "km": [
                "បន្ទប់កុំព្យូទ័រ",
                "ស្ទូឌីយោគម្រោង Full-stack",
                "មន្ទីរពិសោធន៍សន្តិសុខសាយប័រ",
                "ការណែនាំអាជីព",
            ],
        },
        "scholarship_summary": None,
        "is_verified": True,
        "data_source": "Official ISTAD website",
        "source_url": "https://istad.co/admission",
        "last_verified_at": date.today(),
    },
    {
        "slug": "setec",
        "name": {"en": "SETEC Institute", "km": "វិទ្យាស្ថានស៊ីតិក"},
        "acronym": {"en": "SETEC", "km": "ស៊ីតិក"},
        "description": {
            "en": "Private institute in Phnom Penh specializing in information technology, design, and business information systems, with foundation-year, associate, bachelor's, and master's programs.",
            "km": "វិទ្យាស្ថានឯកជននៅរាជធានីភ្នំពេញ ដែលឯកទេសលើបច្ចេកវិទ្យាព័ត៌មាន ការរចនា និងប្រព័ន្ធព័ត៌មានពាណិជ្ជកម្ម ជាមួយកម្មវិធីឆ្នាំមូលដ្ឋាន បរិញ្ញាបត្ររង បរិញ្ញាបត្រ និងអនុបណ្ឌិត។",
        },
        "university_type": "PRIVATE",
        "logo_url": "/images/universities/setec-logo.png",
        "cover_image_url": None,
        "province": "Phnom Penh",
        "address": {
            "en": "No. 86A, Street 110, Russian Federation Boulevard, Sangkat Teuk Laak I, Khan Toul Kork, Phnom Penh",
            "km": "លេខ ៨៦A ផ្លូវ ១១០ មហាវិថីសហព័ន្ធរុស្ស៊ី សង្កាត់ទឹកល្អក់ ១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
        },
        "website_url": "https://www.setecu.com",
        "contact_email": "info@setecu.com",
        "contact_phone": "+855 23 880 612 / +855 10 880 612",
        "established_year": None,
        "tuition_range_min_usd": None,
        "tuition_range_max_usd": None,
        "is_tuition_verified": False,
        "admission_requirements": {
            "en": [
                "Official academic programs: Management Information System, Design, Business Information System",
                "BacII grade requirement is not published on the official website",
            ],
            "km": [
                "កម្មវិធីសិក្សាផ្លូវការ៖ ប្រព័ន្ធព័ត៌មានគ្រប់គ្រង ការរចនា និងប្រព័ន្ធព័ត៌មានពាណិជ្ជកម្ម",
                "លក្ខខណ្ឌនិទ្ទេសបាក់ឌុបមិនទាន់បានបង្ហាញនៅលើគេហទំព័រផ្លូវការទេ",
            ],
        },
        "facilities": {
            "en": ["Computer labs", "Design studios", "Library", "Internship support"],
            "km": ["បន្ទប់កុំព្យូទ័រ", "ស្ទូឌីយោរចនា", "បណ្ណាល័យ", "ការគាំទ្រកម្មសិក្សា"],
        },
        "scholarship_summary": None,
        "is_verified": True,
        "data_source": "Official SETEC website",
        "source_url": "https://www.setecu.com/index.php/en/academic",
        "last_verified_at": date.today(),
    },
]

PROGRAMS = {
    "istad": [
        {
            "major_slug": "information-technology",
            "degree_level": "BACHELOR",
            "duration_years": 4.0,
            "language_of_instruction": "ENGLISH",
            "tuition_annual_usd": None,
            "is_tuition_verified": False,
            "official_curriculum_url": "https://istad.co/academics",
            "min_bacii_grade": "E",
            "required_subjects": None,
            "is_admission_verified": True,
            "admission_source_url": "https://istad.co/admission",
            "admission_notes": "High school national diploma (BacII) or equivalent and high school transcript required. Applicants upload a BacII certificate or equivalent; no specific grade cutoff is published.",
        },
        {
            "major_slug": "information-technology",
            "degree_level": "ASSOCIATE",
            "duration_years": 2.0,
            "language_of_instruction": "ENGLISH",
            "tuition_annual_usd": None,
            "is_tuition_verified": False,
            "official_curriculum_url": "https://istad.co/academics",
            "min_bacii_grade": "E",
            "required_subjects": None,
            "is_admission_verified": True,
            "admission_source_url": "https://istad.co/admission",
            "admission_notes": "Associate applicants follow the same high school graduation requirement: national diploma (BacII) or equivalent and transcript. No specific grade cutoff is published.",
        },
    ],
    "setec": [
        {
            "major_slug": "management-information-systems",
            "degree_level": "BACHELOR",
            "duration_years": 4.0,
            "language_of_instruction": "BILINGUAL",
            "tuition_annual_usd": None,
            "is_tuition_verified": False,
            "official_curriculum_url": "https://www.setecu.com/index.php/en/academic/bachelor-degree/2014-07-17-00-21-15",
            "min_bacii_grade": None,
            "required_subjects": None,
            "is_admission_verified": False,
            "admission_source_url": "https://www.setecu.com/index.php/en/academic",
            "admission_notes": "SETEC's official academic page lists this program but does not publish a BacII grade requirement. Confirm directly with the institute.",
        },
        {
            "major_slug": "graphic-design-multimedia",
            "degree_level": "BACHELOR",
            "duration_years": 4.0,
            "language_of_instruction": "BILINGUAL",
            "tuition_annual_usd": None,
            "is_tuition_verified": False,
            "official_curriculum_url": "https://www.setecu.com/index.php/en/academic/bachelor-degree/2014-07-17-00-21-50",
            "min_bacii_grade": None,
            "required_subjects": None,
            "is_admission_verified": False,
            "admission_source_url": "https://www.setecu.com/index.php/en/academic",
            "admission_notes": "SETEC's official academic page lists this program but does not publish a BacII grade requirement. Confirm directly with the institute.",
        },
        {
            "major_slug": "information-technology",
            "degree_level": "BACHELOR",
            "duration_years": 4.0,
            "language_of_instruction": "BILINGUAL",
            "tuition_annual_usd": None,
            "is_tuition_verified": False,
            "official_curriculum_url": "https://www.setecu.com/index.php/en/academic/bachelor-degree/2014-07-17-00-22-38",
            "min_bacii_grade": None,
            "required_subjects": None,
            "is_admission_verified": False,
            "admission_source_url": "https://www.setecu.com/index.php/en/academic",
            "admission_notes": "SETEC's official academic page lists this program but does not publish a BacII grade requirement. Confirm directly with the institute.",
        },
    ],
}


async def upsert_university(
    db: AsyncSession, data: dict, apply: bool
) -> tuple[University, bool]:
    existing = (
        await db.execute(select(University).where(University.slug == data["slug"]))
    ).scalar_one_or_none()
    if existing:
        if apply:
            for field, value in data.items():
                setattr(existing, field, value)
        return existing, False

    university = University(**data)
    if apply:
        db.add(university)
        await db.flush()
    return university, True


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
                UniversityMajor.degree_level == program["degree_level"],
                UniversityMajor.language_of_instruction
                == program["language_of_instruction"],
            )
        )
    ).scalar_one_or_none()

    values = {
        "duration_years": program["duration_years"],
        "tuition_annual_usd": program["tuition_annual_usd"],
        "is_tuition_verified": program["is_tuition_verified"],
        "language_of_instruction": program["language_of_instruction"],
        "official_curriculum_url": program["official_curriculum_url"],
        "min_bacii_grade": program["min_bacii_grade"],
        "required_subjects": program["required_subjects"],
        "is_admission_verified": program["is_admission_verified"],
        "admission_source_url": program["admission_source_url"],
        "admission_criteria": {
            "notes": program["admission_notes"],
            "scope": "university-published",
            "degree_level": program["degree_level"],
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
        degree_level=program["degree_level"],
        **values,
    )
    if apply:
        db.add(offering)
    return True


async def main(apply: bool) -> None:
    async with AsyncSessionLocal() as db:
        created_unis = 0
        created_offerings = 0
        existing_offerings = 0

        for uni_data in UNIVERSITIES:
            university, created = await upsert_university(db, uni_data, apply)
            created_unis += int(created)
            print(
                f"{uni_data['slug']}: "
                f"{('created' if apply else 'would create') if created else ('updated' if apply else 'would update')} university"
            )

            for program in PROGRAMS[uni_data["slug"]]:
                major = (
                    await db.execute(
                        select(Major).where(Major.slug == program["major_slug"])
                    )
                ).scalar_one_or_none()
                if not major:
                    raise ValueError(
                        f"Missing major slug {program['major_slug']!r} for {uni_data['slug']}"
                    )

                offering_created = await upsert_offering(
                    db, university, major, program, apply
                )
                created_offerings += int(offering_created)
                existing_offerings += int(not offering_created)
                print(
                    f"  {program['degree_level']:<9} {program['major_slug']}: "
                    f"{('created' if apply else 'would create') if offering_created else ('updated' if apply else 'would update')}"
                )

        if apply:
            await db.commit()
            print(
                f"Committed: {created_unis} new universities, "
                f"{created_offerings} new offerings, {existing_offerings} updated."
            )
        else:
            await db.rollback()
            print(
                f"Dry run: {created_unis} universities, "
                f"{created_offerings} offerings would be created; "
                f"{existing_offerings} would be updated."
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(apply=not args.dry_run))
