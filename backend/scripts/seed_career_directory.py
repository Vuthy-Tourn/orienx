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
    "sales-executive": [
        "Talk with customers and explain products or services",
        "Follow up with leads and close sales",
        "Record customer information and sales activity",
    ],
    "business-development-manager": [
        "Find new business opportunities and partners",
        "Prepare proposals and negotiate agreements",
        "Manage relationships with key clients",
    ],
    "marketing-executive": [
        "Plan marketing campaigns and promotions",
        "Create content and coordinate promotions",
        "Track campaign results and report findings",
    ],
    "social-media-specialist": [
        "Create posts and manage social media pages",
        "Respond to comments and messages",
        "Review engagement and improve content",
    ],
    "human-resources-officer": [
        "Recruit and onboard new employees",
        "Maintain employee records and attendance",
        "Support staff with policies and questions",
    ],
    "logistics-coordinator": [
        "Plan deliveries and track shipments",
        "Coordinate with warehouses and drivers",
        "Resolve delays and update customers",
    ],
    "procurement-officer": [
        "Compare suppliers, prices, and quality",
        "Prepare purchase orders and contracts",
        "Track deliveries and supplier performance",
    ],
    "customer-service-officer": [
        "Answer customer questions and complaints",
        "Record cases and follow up until resolved",
        "Explain products, services, and policies",
    ],
    "credit-loan-officer": [
        "Meet customers and explain loan options",
        "Check documents and assess applications",
        "Follow up on repayments and customer needs",
    ],
    "legal-officer": [
        "Review contracts and legal documents",
        "Research laws and prepare advice",
        "Help the organization follow regulations",
    ],
    "hotel-supervisor": [
        "Lead front-office and service staff",
        "Handle guest requests and complaints",
        "Check service quality and daily operations",
    ],
    "translator": [
        "Translate documents between Khmer and other languages",
        "Interpret conversations and meetings",
        "Proofread translated text for accuracy",
    ],
    "pr-officer": [
        "Write announcements and public messages",
        "Contact media and organize interviews",
        "Prepare events and protect public image",
    ],
    "research-development-officer": [
        "Test ideas and collect research data",
        "Analyze results and prepare reports",
        "Support new product or process development",
    ],
    "administrative-assistant": [
        "Organize files, schedules, and office records",
        "Prepare documents and support meetings",
        "Help the team with daily administrative tasks",
    ],
    "operations-manager": [
        "Plan daily operations and staff schedules",
        "Track performance and solve operational problems",
        "Lead the team and report results",
    ],
    "chef-fb-supervisor": [
        "Prepare food and manage kitchen service",
        "Lead kitchen staff and check food safety",
        "Control stock, costs, and service quality",
    ],
    "electrician": [
        "Install and repair electrical systems",
        "Check wiring and follow safety rules",
        "Find faults and test equipment",
    ],
    "quality-assurance-officer": [
        "Check products and processes against standards",
        "Record problems and follow up on fixes",
        "Prepare quality reports and support audits",
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
    "sales-executive": ["Office or field", "Customer meetings", "Retail or showroom"],
    "business-development-manager": ["Office", "Client meetings", "Travel to partners"],
    "marketing-executive": ["Office", "Agency", "Events and campaigns"],
    "social-media-specialist": ["Office or remote", "Creative team", "Online platforms"],
    "human-resources-officer": ["Office", "HR team", "Employee meetings"],
    "logistics-coordinator": ["Office", "Warehouse", "Transport coordination"],
    "procurement-officer": ["Office", "Supplier meetings", "Warehouse visits"],
    "customer-service-officer": ["Office or call center", "Customer meetings", "Online support"],
    "credit-loan-officer": ["Bank branch", "Customer visits", "Office"],
    "legal-officer": ["Office", "Meeting rooms", "Court or public offices"],
    "hotel-supervisor": ["Hotel", "Front desk", "Guest areas"],
    "translator": ["Office or remote", "Meetings and events", "Publishing teams"],
    "pr-officer": ["Office", "Media events", "Client meetings"],
    "research-development-officer": ["Laboratory", "Office", "Field research"],
    "administrative-assistant": ["Office", "Reception", "Meeting rooms"],
    "operations-manager": ["Office", "Operations sites", "Team meetings"],
    "chef-fb-supervisor": ["Restaurant kitchen", "Hotel kitchen", "Food service"],
    "electrician": ["Construction sites", "Buildings", "Workshop"],
    "quality-assurance-officer": ["Factory", "Laboratory", "Office"],
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
    "sales-executive": ["Sales Trainee", "Sales Executive", "Sales Supervisor"],
    "business-development-manager": ["Business Development Executive", "Business Development Manager", "Head of Growth"],
    "marketing-executive": ["Marketing Assistant", "Marketing Executive", "Marketing Manager"],
    "social-media-specialist": ["Content Assistant", "Social Media Specialist", "Social Media Lead"],
    "human-resources-officer": ["HR Assistant", "HR Officer", "HR Manager"],
    "logistics-coordinator": ["Logistics Assistant", "Logistics Coordinator", "Logistics Manager"],
    "procurement-officer": ["Procurement Assistant", "Procurement Officer", "Procurement Manager"],
    "customer-service-officer": ["Customer Service Trainee", "Customer Service Officer", "Customer Service Supervisor"],
    "credit-loan-officer": ["Loan Assistant", "Credit / Loan Officer", "Branch Manager"],
    "legal-officer": ["Legal Assistant", "Legal Officer", "Legal Manager"],
    "hotel-supervisor": ["Hotel Staff", "Hotel Supervisor", "Hotel Manager"],
    "translator": ["Junior Translator", "Translator", "Senior Translator / Editor"],
    "pr-officer": ["PR Assistant", "PR Officer", "PR Manager"],
    "research-development-officer": ["Research Assistant", "R&D Officer", "R&D Manager"],
    "administrative-assistant": ["Office Assistant", "Administrative Assistant", "Office Manager"],
    "operations-manager": ["Operations Officer", "Operations Manager", "Head of Operations"],
    "chef-fb-supervisor": ["Kitchen Staff", "Chef / F&B Supervisor", "Head Chef / F&B Manager"],
    "electrician": ["Electrical Assistant", "Electrician", "Electrical Supervisor"],
    "quality-assurance-officer": ["QA Assistant", "QA Officer", "QA Manager"],
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
