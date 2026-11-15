#!/usr/bin/env python3
"""Sync canonical Cambodian university majors, faculties, and verified offerings into OrienX.

This script:
1. Populates 57 Canonical Cambodian Majors with rich bilingual names (EN/KM),
   categories, descriptions, core subjects, required skills, RIASEC career-alignment
   codes, MBTI affinities, and STEM classifications.
2. Ingests and updates official University Faculties for Cambodian universities.
3. Links verified UniversityMajor offerings with real academic durations, degree
   levels (Bachelor, Associate, Master), instruction languages, and exact annual
   tuition fees derived from verified institutional fee tables.
4. Recalculates and updates the tuition_range_min_usd and tuition_range_max_usd
   directly on the University catalog table.

Run from backend/:
    PYTHONPATH=. ./venv/bin/python scripts/scrape_and_sync_majors.py --apply
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import select, func  # noqa: E402
from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.catalog import University, Major, Faculty, UniversityMajor  # noqa: E402

DATA_DIR = ROOT / "data" / "university_scrape"
SALA_SNAPSHOT = DATA_DIR / "sala_schools_20261115.json"

# ==============================================================================
# CANONICAL MAJORS CATALOG (Bilingual Khmer/English with Holland RIASEC & MBTI)
# ==============================================================================

CANONICAL_MAJORS: List[Dict[str, Any]] = [
    # --- 1. Technology & Computing (STEM) ---
    {
        "slug": "software-engineering",
        "name": {
            "en": "Software Engineering & Application Development",
            "km": "វិស្វកម្មសូហ្វវែរ និងការអភិវឌ្ឍកម្មវិធី",
        },
        "category": "Information Technology",
        "description": {
            "en": "Focuses on the systematic design, development, testing, and maintenance of high-performance software systems, mobile apps, enterprise cloud platforms, and scalable backend architectures.",
            "km": "ផ្តោតលើការរចនា ការអភិវឌ្ឍ ការធ្វើតេស្ត និងការថែទាំប្រព័ន្ធសូហ្វវែរ កម្មវិធីទូរស័ព្ទ និងប្រព័ន្ធក្លោដប្រកបដោយប្រសិទ្ធភាព និងសុវត្ថិភាពខ្ពស់។",
        },
        "subjects_studied": [
            "Data Structures & Algorithms",
            "Object-Oriented Programming (Java/Python)",
            "Web Architecture & Full-Stack Development",
            "Mobile App Engineering (Flutter/React Native)",
            "Database Systems & SQL Optimization",
            "Software Architecture & Design Patterns",
            "DevOps, CI/CD & Cloud Infrastructure",
            "Software Testing & Quality Assurance",
        ],
        "required_skills": [
            "Algorithmic Thinking & Problem Solving",
            "Programming in Modern Languages (TypeScript, Python, Java, Go)",
            "System Architecture Design",
            "Version Control & Collaborative Development (Git)",
        ],
        "potential_challenges": [
            "Rapidly shifting framework ecosystems and library tooling",
            "Complex debugging and distributed system concurrency issues",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTJ,INTP,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "computer-science",
        "name": {
            "en": "Computer Science & Theoretical Computing",
            "km": "វិទ្យាសាស្ត្រកុំព្យូទ័រ និងទ្រឹស្តីគណនា",
        },
        "category": "Information Technology",
        "description": {
            "en": "Explores the fundamental mathematics of computation, algorithm design, compiler construction, operating systems, and computer hardware-software boundaries.",
            "km": "សិក្សាអំពីទ្រឹស្តីគ្រឹះនៃគណនា គណិតវិទ្យាកុំព្យូទ័រ ក្បួនដោះស្រាយ (Algorithms) ការស្ថាបនា Compiler និងប្រព័ន្ធប្រតិបត្តិការ។",
        },
        "subjects_studied": [
            "Discrete Mathematics & Logic",
            "Advanced Algorithm Analysis",
            "Theory of Computation & Automata",
            "Operating Systems & Kernel Concepts",
            "Computer Architecture & Organization",
            "Compiler Design & Programming Paradigms",
        ],
        "required_skills": [
            "Deep Mathematical & Deductive Reasoning",
            "Low-Level & High-Level Programming (C/C++, Rust)",
            "Analytical Abstraction",
        ],
        "potential_challenges": [
            "Steep abstract mathematical foundation",
            "Complex memory management and hardware-level debugging",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTP,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "data-science-ai",
        "name": {
            "en": "Data Science & Artificial Intelligence",
            "km": "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត",
        },
        "category": "Information Technology",
        "description": {
            "en": "Combines statistical modeling, machine learning, deep neural networks, and big data engineering to extract actionable insights and build autonomous predictive systems.",
            "km": "រួមបញ្ចូលស្ថិតិវិភាគ ម៉ាស៊ីនរៀនសូត្រ (Machine Learning) បញ្ញាសិប្បនិម្មិត (AI) និងវិស្វកម្មទិន្នន័យខ្នាតធំ (Big Data) ដើម្បីបង្កើតប្រព័ន្ធស្វ័យប្រវត្តិកម្រិតខ្ពស់។",
        },
        "subjects_studied": [
            "Applied Linear Algebra & Multivariable Calculus",
            "Probability & Mathematical Statistics",
            "Machine Learning & Statistical Modeling",
            "Deep Learning & Neural Networks (PyTorch/TensorFlow)",
            "Natural Language Processing & LLMs",
            "Computer Vision & Pattern Recognition",
        ],
        "required_skills": [
            "Statistical Analysis & Data Wrangling",
            "Python Programming (NumPy, Pandas, Scikit-learn)",
            "Model Evaluation, Validation & Tuning",
        ],
        "potential_challenges": [
            "Navigating sparse or noisy real-world data pipelines",
            "High computational and mathematical complexity",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "C",
        "personality_affinity": "INTJ,INTP,ENTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "cybersecurity-networking",
        "name": {
            "en": "Cybersecurity & Information Networks",
            "km": "សន្តិសុខសាយប័រ និងបណ្តាញព័ត៌មាន",
        },
        "category": "Information Technology",
        "description": {
            "en": "Prepares professionals to defend computer networks, mission-critical infrastructure, cloud services, and sensitive enterprise data against intrusions, malware, and sophisticated cyberattacks.",
            "km": "បណ្តុះបណ្តាលអ្នកជំនាញការពារបណ្តាញកុំព្យូទ័រ ហេដ្ឋារចនាសម្ព័ន្ធព័ត៌មានវិទ្យា និងទិន្នន័យស្ថាប័នពីការវាយប្រហារសាយប័រ ការលួចជ្រៀតចូល និងមេរោគកុំព្យូទ័រ។",
        },
        "subjects_studied": [
            "Computer Networking & Protocol Analysis (TCP/IP)",
            "Network Defense & Firewall Configurations",
            "Ethical Hacking & Penetration Testing",
            "Cryptography & Secure Communications",
            "Digital Forensics & Incident Response",
            "Security Information and Event Management (SIEM)",
        ],
        "required_skills": [
            "Network Packet Inspection (Wireshark)",
            "Linux Server Administration & Scripting (Bash, Python)",
            "Vulnerability Assessment & Threat Modeling",
        ],
        "potential_challenges": [
            "Constant evolution of zero-day exploits and threat vectors",
            "High-stakes incident response under time pressure",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "C",
        "personality_affinity": "ISTP,INTJ,ESTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "information-technology",
        "name": {
            "en": "Information Technology & Digital Infrastructure",
            "km": "បច្ចេកវិទ្យាព័ត៌មាន និងហេដ្ឋារចនាសម្ព័ន្ធឌីជីថល",
        },
        "category": "Information Technology",
        "description": {
            "en": "Focuses on deploying, administering, and integrating enterprise IT infrastructure, virtualization platforms, corporate networks, and organizational software solutions.",
            "km": "ផ្តោតលើការរៀបចំ ការគ្រប់គ្រង និងការតភ្ជាប់ហេដ្ឋារចនាសម្ព័ន្ធព័ត៌មានវិទ្យា ប្រព័ន្ធ Server បណ្តាញកុំព្យូទ័រ និងដំណោះស្រាយបច្ចេកវិទ្យាសម្រាប់ស្ថាប័ន។",
        },
        "subjects_studied": [
            "Enterprise Network Administration",
            "Server Operations (Windows Server / Linux)",
            "Cloud Architecture (AWS / GCP / Azure)",
            "Database Administration & Backup Systems",
            "IT Service Management (ITIL)",
        ],
        "required_skills": [
            "System Troubleshooting & Hardware Maintenance",
            "Network Configuration (Routers, Switches, VLANs)",
            "Scripting for Automation (PowerShell, Bash)",
        ],
        "potential_challenges": [
            "Maintaining 24/7 high-availability system uptimes",
            "Rapid hardware and software compatibility iterations",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTJ,ESTJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "management-information-systems",
        "name": {
            "en": "Management Information Systems (MIS)",
            "km": "ប្រព័ន្ធព័ត៌មានគ្រប់គ្រង",
        },
        "category": "Information Technology",
        "description": {
            "en": "Bridges technical IT systems with executive business strategy, empowering organizations to design enterprise ERPs, optimize workflows, and drive digital transformation.",
            "km": "ផ្សារភ្ជាប់បច្ចេកវិទ្យាព័ត៌មានវិទ្យាជាមួយយុទ្ធសាស្ត្រអាជីវកម្ម ជួយស្ថាប័នរៀបចំប្រព័ន្ធ ERP សម្រួលដំណើរការការងារ និងដឹកនាំការផ្លាស់ប្តូរឌីជីថល។",
        },
        "subjects_studied": [
            "Enterprise Resource Planning (ERP Systems)",
            "Business Process Modeling & Re-engineering",
            "Database Design & Business Intelligence",
            "IT Project Management (Agile/Scrum)",
            "Digital Business Strategy",
        ],
        "required_skills": [
            "Business Analysis & Requirements Gathering",
            "Data Analysis & Dashboard Creation (PowerBI, Tableau)",
            "Cross-Functional Stakeholder Communication",
        ],
        "potential_challenges": [
            "Managing organizational change resistance during tech adoption",
            "Balancing business budgets with technical architecture ideals",
        ],
        "riasec_primary": "C",
        "riasec_secondary": "E",
        "personality_affinity": "ENTJ,ESTJ,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "fintech",
        "name": {
            "en": "Financial Technology (Fintech)",
            "km": "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ",
        },
        "category": "Information Technology",
        "description": {
            "en": "Explores mobile payment architectures, blockchain technology, digital banking (Bakong QR standards), automated micro-lending, algorithmic trading, and financial cybersecurity.",
            "km": "សិក្សាអំពីប្រព័ន្ធទូទាត់ចល័ត បច្ចេកវិទ្យា Blockchain ធនាគារឌីជីថល (ស្តង់ដារ KHQR/Bakong) ប្រព័ន្ធឥណទានស្វ័យប្រវត្តិ និងសុវត្ថិភាពសេវាកម្មហិរញ្ញវត្ថុ។",
        },
        "subjects_studied": [
            "Digital Payment Gateways & API Integration",
            "Blockchain & Distributed Ledger Technology",
            "Financial Data Analytics & Risk Modeling",
            "Regulatory Technology (RegTech) & Compliance",
            "Mobile Banking Systems Architecture",
        ],
        "required_skills": [
            "Financial Systems Programming",
            "Understanding of NBC/Banking Regulations",
            "Cryptographic Security in Payments",
        ],
        "potential_challenges": [
            "Strict financial regulatory compliance requirements",
            "Zero tolerance for transaction errors or latency",
        ],
        "riasec_primary": "C",
        "riasec_secondary": "E",
        "personality_affinity": "INTJ,ENTJ,ISTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "e-commerce-logistics",
        "name": {
            "en": "E-Commerce & Digital Business",
            "km": "ពាណិជ្ជកម្មអេឡិចត្រូនិក និងអាជីវកម្មឌីជីថល",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Equips students with the expertise to launch, manage, and scale online retail operations, digital payment systems, omni-channel marketing, and fulfillment logistics in Cambodia's digital economy.",
            "km": "បណ្តុះបណ្តាលចំណេះដឹងគ្រប់គ្រងហាងអនឡាញ ប្រព័ន្ធទូទាត់ឌីជីថល ទីផ្សារឌីជីថល និងភស្តុភារកម្មដឹកជញ្ជូនក្នុងសេដ្ឋកិច្ចឌីជីថលកម្ពុជា។",
        },
        "subjects_studied": [
            "E-Commerce Platform Technologies",
            "Digital Payment Gateways & FinTech Integration",
            "Digital Marketing & SEO/SEM Strategies",
            "Cross-Border Supply Chain & Fulfillment",
            "Customer Relationship Management (CRM)",
        ],
        "required_skills": [
            "Online Store Management & Merchandising",
            "Conversion Rate Optimization (CRO)",
            "Social Commerce & Campaign Planning",
        ],
        "potential_challenges": [
            "Intense online market competition and fluctuating ad costs",
            "Managing last-mile delivery and inventory holding costs",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "C",
        "personality_affinity": "ENTP,ESTP,ENFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
    },

    # --- 2. Business, Accounting & Finance ---
    {
        "slug": "banking-finance",
        "name": {
            "en": "Banking & Financial Markets",
            "km": "ធនាគារ និងទីផ្សារហិរញ្ញវត្ថុ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Prepares analysts and executives for commercial banking, investment analysis, microfinance institutions (MFIs), corporate capital allocation, and Central Bank (NBC) regulatory governance.",
            "km": "បណ្តុះបណ្តាលអ្នកវិភាគហិរញ្ញវត្ថុ និងមន្ត្រីធនាគារពាណិជ្ជ មីក្រូហិរញ្ញវត្ថុ ទីផ្សារមូលបត្រកម្ពុជា និងការគ្រប់គ្រងហានិភ័យឥណទាន។",
        },
        "subjects_studied": [
            "Corporate Finance & Capital Budgeting",
            "Commercial Bank Management & Lending",
            "Investment Analysis & Portfolio Management",
            "Financial Statement Analysis",
            "Credit Risk Assessment & Mitigation",
            "Money, Banking & Monetary Policy",
        ],
        "required_skills": [
            "Financial Modeling in Excel",
            "Credit Appraisal & Due Diligence",
            "Quantitative Analysis & Risk Assessment",
        ],
        "potential_challenges": [
            "High accountability for fiduciary assets and credit risks",
            "Evolving regulatory mandates and macro-economic volatility",
        ],
        "riasec_primary": "C",
        "riasec_secondary": "E",
        "personality_affinity": "ESTJ,ISTJ,ENTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "accounting-auditing",
        "name": {
            "en": "Accounting, Auditing & Taxation (ACCA/CAT)",
            "km": "គណនេយ្យ សវនកម្ម និងពន្ធដារ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Delivers comprehensive training in international financial reporting standards (IFRS/CIFRS), cost accounting, corporate tax compliance (GDT Cambodia), internal control, and external auditing.",
            "km": "ផ្តល់ចំណេះដឹងស៊ីជម្រៅលើស្តង់ដារគណនេយ្យអន្តរជាតិ (CIFRS) ការគ្រប់គ្រងថ្លៃដើម ពន្ធដារកម្ពុជា សវនកម្មផ្ទៃក្នុង និងសវនកម្មឯករាជ្យស្របតាមស្ដង់ដារ ACCA។",
        },
        "subjects_studied": [
            "Financial Accounting I & II (CIFRS/IFRS)",
            "Cost & Management Accounting",
            "Cambodian Corporate & Salary Taxation",
            "Audit & Assurance Methodologies",
            "Accounting Information Systems (QuickBooks, Sage)",
            "Business Law & Ethics for Accountants",
        ],
        "required_skills": [
            "Meticulous Attention to Numeric Detail",
            "Application of CIFRS Accounting Standards",
            "Tax Return Preparation & Reconciliation",
        ],
        "potential_challenges": [
            "Demanding tax filing and audit closing peak seasons",
            "Zero margin for clerical or numerical calculation errors",
        ],
        "riasec_primary": "C",
        "riasec_secondary": "E",
        "personality_affinity": "ISTJ,ISFJ,ESTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "risk-management-insurance",
        "name": {
            "en": "Risk Management & Insurance",
            "km": "ការគ្រប់គ្រងហានិភ័យ និងការធានារ៉ាប់រង",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Focuses on actuarial principles, life and property insurance underwriting, reinsurance contracts, enterprise risk governance, and claims management in Cambodia's growing insurance sector.",
            "km": "ផ្តោតលើគោលការណ៍គណិតវិទ្យាធានារ៉ាប់រង (Actuarial Science) ការវាយតម្លៃហានិភ័យធានារ៉ាប់រងអាយុជីវិតនិងទ្រព្យសម្បត្តិ ការធានារ៉ាប់រងបន្ត និងការដោះស្រាយសំណង។",
        },
        "subjects_studied": [
            "Principles of Risk & Insurance Underwriting",
            "Life, Health & Property Insurance Products",
            "Enterprise Risk Management (ERM Frameworks)",
            "Actuarial Mathematics & Loss Distributions",
            "Insurance Law & Regulatory Compliance",
        ],
        "required_skills": [
            "Statistical Loss Modeling & Risk Evaluation",
            "Underwriting Due Diligence",
            "Claims Investigation & Settlement",
        ],
        "potential_challenges": [
            "Complex statistical calculations in claim probabilities",
            "Handling disputed insurance claims professionally",
        ],
        "riasec_primary": "C",
        "riasec_secondary": "E",
        "personality_affinity": "ISTJ,ESTJ,INTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "business-administration",
        "name": {
            "en": "Business Administration & Management",
            "km": "រដ្ឋបាលពាណិជ្ជកម្ម និងការគ្រប់គ្រងសហគ្រាស",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Provides an all-round executive foundation covering general management, strategic planning, operations optimization, organizational leadership, and entrepreneurship.",
            "km": "ផ្តល់មូលដ្ឋានគ្រឹះទូលំទូលាយលើការគ្រប់គ្រងទូទៅ ផែនការយុទ្ធសាស្ត្រ ភាពជាអ្នកដឹកនាំ ភាពជាសហគ្រិន និងការគ្រប់គ្រងប្រតិបត្តិការសហគ្រាស។",
        },
        "subjects_studied": [
            "Principles of Management & Leadership",
            "Strategic Management & Case Studies",
            "Operations & Quality Management",
            "Entrepreneurship & Venture Creation",
            "Organizational Behavior",
        ],
        "required_skills": [
            "Executive Leadership & Decision-Making",
            "Team Building & Negotiation",
            "Strategic Planning & Execution",
        ],
        "potential_challenges": [
            "Broad theoretical scope requiring practical application",
            "Handling organizational politics and team dynamics",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "S",
        "personality_affinity": "ENTJ,ESTJ,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "marketing-digital-media",
        "name": {
            "en": "Marketing & Digital Media Strategy",
            "km": "ទីផ្សារ និងយុទ្ធសាស្ត្រប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Explores market research, brand building, digital campaign execution, consumer psychology, content marketing, and performance analytics across omnichannel platforms.",
            "km": "សិក្សាអំពីការស្រាវជ្រាវទីផ្សារ ការកសាងម៉ាកយីហោ (Branding) យុទ្ធនាការផ្សព្វផ្សាយឌីជីថល ចិត្តវិទ្យាអ្នកប្រើប្រាស់ និងការវិភាគទិន្នន័យទីផ្សារ។",
        },
        "subjects_studied": [
            "Marketing Principles & Consumer Behavior",
            "Digital Marketing & Social Media Strategies",
            "Brand Strategy & Creative Positioning",
            "Content Creation & Copywriting",
            "Marketing Analytics & Web Metrics",
        ],
        "required_skills": [
            "Creative Visual & Written Storytelling",
            "Campaign Performance Optimization (Google Ads, Meta Ads)",
            "Consumer Empathy & Market Intuition",
        ],
        "potential_challenges": [
            "Keeping up with algorithmic updates on social media platforms",
            "Proving clear ROI on brand awareness campaigns",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "A",
        "personality_affinity": "ENFP,ENTP,ESFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "international-business",
        "name": {
            "en": "International Business & Global Trade",
            "km": "ពាណិជ្ជកម្មអន្តរជាតិ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Covers multinational operations, cross-border customs regulations, international trade agreements (RCEP, ASEAN), foreign currency risk hedging, and international marketing.",
            "km": "ផ្តោតលើប្រតិបត្តិការអាជីវកម្មឆ្លងដែន នីតិវិធីគយអន្តរជាតិ កិច្ចព្រមព្រៀងពាណិជ្ជកម្មតំបន់ (RCEP, ASEAN) និងការគ្រប់គ្រងហានិភ័យរូបិយប័ណ្ណបរទេស។",
        },
        "subjects_studied": [
            "Global Business Environment & Institutions",
            "International Trade Theory & Customs Policy",
            "Export-Import Documentation & Procedures",
            "Cross-Cultural Management",
            "International Finance & Forex Management",
        ],
        "required_skills": [
            "Cross-Cultural Communication & Diplomacy",
            "Trade Compliance & Regulatory Fluency",
            "Multilingual Negotiation",
        ],
        "potential_challenges": [
            "Geopolitical changes and shifting tariff barriers",
            "Currency exchange rate volatility",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "C",
        "personality_affinity": "ENTJ,ESTJ,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "hospitality-tourism-management",
        "name": {
            "en": "Hospitality & International Tourism Management",
            "km": "ការគ្រប់គ្រងបដិសណ្ឋារកិច្ច និងទេសចរណ៍អន្តរជាតិ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Trains future leaders for world-class hotels, international eco-tourism resorts, airline operations, event management, and sustainable cultural tourism destinations across Cambodia.",
            "km": "បណ្តុះបណ្តាលអ្នកគ្រប់គ្រងសណ្ឋាគារលំដាប់អន្តរជាតិ រមណីយដ្ឋានអេកូទេសចរណ៍ ក្រុមហ៊ុនអាកាសចរណ៍ និងការគ្រប់គ្រងទេសចរណ៍វប្បធម៌ប្រកបដោយនិរន្តរភាពនៅកម្ពុជា។",
        },
        "subjects_studied": [
            "Hotel Operations & Front Office Management",
            "Food & Beverage Service Systems",
            "Sustainable Tourism & Ecotourism Planning",
            "Hospitality Marketing & Sales Management",
            "Event, Convention & Exhibition Management (MICE)",
        ],
        "required_skills": [
            "Guest Experience Excellence & Hospitality Polish",
            "Operational Scheduling & Team Coordination",
            "Multilingual Fluency",
        ],
        "potential_challenges": [
            "Seasonal tourist influx fluctuations and weekend shifts",
            "Demanding guest expectations and fast-paced floor operations",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "S",
        "personality_affinity": "ESFJ,ENFJ,ESFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "supply-chain-logistics",
        "name": {
            "en": "Supply Chain Management & Logistics",
            "km": "ការគ្រប់គ្រងខ្សែច្រវាក់ផ្គត់ផ្គង់ និងភស្តុភារកម្ម",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Teaches the optimization of freight forwarding, automated warehousing, inventory holding models, port operations, and intermodal transport corridors connecting Cambodia with global markets.",
            "km": "បង្រៀនអំពីការរៀបចំប្រព័ន្ធដឹកជញ្ជូនទំនិញ ឃ្លាំងស្តុកទំនិញស្វ័យប្រវត្តិ ប្រតិបត្តិការកំពង់ផែ និងច្រករបៀងដឹកជញ្ជូនតភ្ជាប់កម្ពុជាទៅកាន់ពិភពលោក។",
        },
        "subjects_studied": [
            "Supply Chain Strategy & Network Design",
            "Warehouse Operations & Inventory Management",
            "Freight Forwarding & Customs Clearance",
            "Port & Shipping Logistics (Sihanoukville/Phnom Penh)",
            "Procurement & Vendor Contract Management",
        ],
        "required_skills": [
            "Inventory Forecasting & Cost Optimization",
            "Transport Scheduling & Route Planning",
            "Enterprise Warehouse Software Usage",
        ],
        "potential_challenges": [
            "Unforeseen supply chain disruptions, port congestion, and fuel price volatility",
            "Rigid deadline pressures for urgent shipments",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "R",
        "personality_affinity": "ESTJ,ISTJ,INTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "human-resource-management",
        "name": {
            "en": "Human Resource Management & Talent Strategy",
            "km": "ការគ្រប់គ្រងធនធានមនុស្ស និងយុទ្ធសាស្ត្រទេពកោសល្យ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Focuses on strategic talent recruitment, compensation and benefits, Cambodian labor law compliance, performance appraisals, leadership development, and organizational workplace culture.",
            "km": "ផ្តោតលើការជ្រើសរើសបុគ្គលិក គោលនយោបាយប្រាក់បៀវត្សរ៍និងអត្ថប្រយោជន៍ ច្បាប់ស្តីពីការងារនៃព្រះរាជាណាចក្រកម្ពុជា ការវាយតម្លៃសមត្ថភាព និងការអភិវឌ្ឍវប្បធម៌ស្ថាប័ន។",
        },
        "subjects_studied": [
            "Human Resource Planning & Recruitment",
            "Cambodian Labor Law & Industrial Relations",
            "Compensation, Payroll & Benefits Structuring",
            "Training & Employee Development",
            "Performance Management Systems",
        ],
        "required_skills": [
            "Empathy, Active Listening & Conflict Resolution",
            "Labor Law Adherence & Dispute Mediation",
            "HR Metrics & People Analytics",
        ],
        "potential_challenges": [
            "Balancing management business objectives with employee welfare",
            "Handling sensitive disciplinary procedures and terminations",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "E",
        "personality_affinity": "ENFJ,ESFJ,ISFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "economics-development",
        "name": {
            "en": "Economics & Development Studies",
            "km": "សេដ្ឋកិច្ច និងការអភិវឌ្ឍ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Analyzes macroeconomic policies, poverty alleviation, fiscal policy, econometric modeling, international trade, and Cambodia's path toward upper-middle-income status.",
            "km": "វិភាគគោលនយោបាយសេដ្ឋកិច្ចម៉ាក្រូ ការកាត់បន្ថយភាពក្រីក្រ គោលនយោបាយសារពើពន្ធ គំរូសេដ្ឋកិច្ចវិមាត្រ (Econometrics) និងការអភិវឌ្ឍប្រកបដោយចីរភាពនៅកម្ពុជា។",
        },
        "subjects_studied": [
            "Microeconomic Theory & Applications",
            "Macroeconomic Analysis & Monetary Policy",
            "Econometrics & Statistical Forecasting (STATA/R)",
            "Development Economics & Poverty Analysis",
            "Public Finance & Fiscal Policy",
        ],
        "required_skills": [
            "Quantitative Econometric Modeling",
            "Policy Analysis & Critical Evaluation",
            "Data Extraction & Interpretation",
        ],
        "potential_challenges": [
            "Heavy emphasis on abstract calculus and statistical derivations",
            "Complex real-world policy trade-offs without single answers",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "E",
        "personality_affinity": "INTJ,ENTJ,INTP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    },

    # --- 3. Engineering & Architecture (STEM) ---
    {
        "slug": "civil-engineering",
        "name": {
            "en": "Civil Engineering & Structural Design",
            "km": "វិស្វកម្មសំណង់ស៊ីវិល និងការរចនាគ្រោងបង្គុំ",
        },
        "category": "Engineering",
        "description": {
            "en": "Prepares structural engineers to plan, design, calculate, and supervise the construction of high-rise buildings, bridges, highways, drainage networks, and smart infrastructure.",
            "km": "បណ្តុះបណ្តាលវិស្វកររៀបចំផែនការ គណនា និងត្រួតពិនិត្យការសាងសង់អគារខ្ពស់ៗ ស្ពាន ផ្លូវថ្នល់ ប្រព័ន្ធធារាសាស្ត្រ និងហេដ្ឋារចនាសម្ព័ន្ធទីក្រុង។",
        },
        "subjects_studied": [
            "Engineering Mechanics & Statics",
            "Strength of Materials & Mechanics of Deformable Bodies",
            "Structural Analysis & Finite Element Methods",
            "Reinforced Concrete Design & Prestressed Concrete",
            "Soil Mechanics & Deep Foundation Engineering",
            "Highway, Pavement & Transportation Engineering",
        ],
        "required_skills": [
            "Structural Calculation & Load Analysis",
            "CAD/BIM Software Proficiency (AutoCAD, Revit, Etabs)",
            "Site Supervision & Quality Control",
        ],
        "potential_challenges": [
            "High safety responsibility where errors can cause structural failure",
            "Demanding on-site field environments under varied weather conditions",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTJ,ESTJ,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "water-environmental-engineering",
        "name": {
            "en": "Water Resources Engineering & Rural Infrastructure",
            "km": "វិស្វកម្មធនធានទឹក និងហេដ្ឋារចនាសម្ព័ន្ធជនបទ",
        },
        "category": "Engineering",
        "description": {
            "en": "Focuses on irrigation canal design, hydrological flood modeling, dams, clean water treatment plants, urban wastewater drainage, and climate adaptation along the Mekong basin.",
            "km": "ផ្តោតលើការរចនាប្រព័ន្ធធារាសាស្ត្រ ទំនប់ទឹក ស្ថានីយប្រព្រឹត្តិកម្មទឹកស្អាត ប្រព័ន្ធបង្ហូរទឹកកខ្វក់ទីក្រុង និងការការពារទឹកជំនន់តាមដងទន្លេមេគង្គ។",
        },
        "subjects_studied": [
            "Fluid Mechanics & Open Channel Hydraulics",
            "Engineering Hydrology & Flood Frequency Analysis",
            "Design of Hydraulic Structures (Dams, Weirs, Gates)",
            "Water Supply & Wastewater Treatment Engineering",
            "Irrigation & Drainage Network Design",
        ],
        "required_skills": [
            "Hydraulic Modeling (HEC-RAS, EPANET)",
            "Hydrological Surveying & Watershed Analysis",
            "Field Irrigation Construction Management",
        ],
        "potential_challenges": [
            "Managing seasonal monsoon floods and river sediment changes",
            "Extensive outdoor field surveys along remote river basins",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTJ,INTJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "architecture-urban-planning",
        "name": {
            "en": "Architecture & Urban Planning",
            "km": "ស្ថាបត្យកម្ម និងនគរូបនីយវិទ្យា",
        },
        "category": "Architecture & Design",
        "description": {
            "en": "Synthesizes architectural aesthetic vision, Khmer cultural heritage preservation, environmental sustainability, structural feasibility, and modern urban master planning.",
            "km": "រួមបញ្ចូលសិល្បៈស្ថាបត្យកម្ម ការអភិរក្សកេរដំណែលវប្បធម៌ខ្មែរ និរន្តរភាពបរិស្ថាន សុវត្ថិភាពសំណង់ និងប្លង់មេនគរូបនីយកម្មទីក្រុងទំនើប។",
        },
        "subjects_studied": [
            "Architectural Design Studio (Year 1 to 5)",
            "History of Khmer & World Architecture",
            "Building Construction & Material Science",
            "Environmental Systems & Passive Energy Design",
            "Urban Design, Zoning & Master Planning",
            "3D Digital Visualization & BIM Rendering",
        ],
        "required_skills": [
            "Spatial Reasoning & Freehand Architectural Sketching",
            "Parametric 3D Modeling (Rhino, SketchUp, Revit)",
            "Concept Presentation & Client Pitching",
        ],
        "potential_challenges": [
            "Extremely demanding studio critique schedules and late-night model making",
            "Balancing artistic creative ideals with client budget constraints",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "I",
        "personality_affinity": "INFJ,INFP,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "electrical-electronic-engineering",
        "name": {
            "en": "Electrical & Electronic Engineering",
            "km": "វិស្វកម្មអគ្គិសនី និងអេឡិចត្រូនិក",
        },
        "category": "Engineering",
        "description": {
            "en": "Spans power grid generation and transmission (EDC standards), renewable solar/hydro energy installations, industrial motor control, embedded circuits, and power electronics.",
            "km": "សិក្សាអំពីបណ្តាញអគ្គិសនីថាមពល ការផលិតនិងបញ្ជូនថាមពល ថាមពលកកើតឡើងវិញ (ពន្លឺព្រះអាទិត្យ វារីអគ្គិសនី) និងសៀគ្វីអេឡិចត្រូនិកឧស្សាហកម្ម។",
        },
        "subjects_studied": [
            "Electric Circuit Theory & Signal Processing",
            "Power Systems Analysis & High Voltage Transmission",
            "Electrical Machine Drives & Transformers",
            "Renewable Energy Systems (Solar PV, Hydro)",
            "Industrial Automation & Programmable Logic Controllers (PLC)",
        ],
        "required_skills": [
            "Circuit Schematics & Simulation (MATLAB/Simulink)",
            "Power System Load Calculation",
            "PLC Programming & Industrial Wiring",
        ],
        "potential_challenges": [
            "Intense mathematical foundation in electromagnetic field theory",
            "Strict workplace electrical safety precautions required",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTP,INTJ,ISTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "mechanical-engineering",
        "name": {
            "en": "Mechanical Engineering & Manufacturing",
            "km": "វិស្វកម្មមេកានិក និងការផលិត",
        },
        "category": "Engineering",
        "description": {
            "en": "Focuses on the mechanics of machinery, thermodynamics, fluid power, heating/ventilation/AC (HVAC), industrial piping, and advanced precision manufacturing.",
            "km": "ផ្តោតលើមេកានិកគ្រឿងចក្រ ទែរម៉ូឌីណាមិក មេកានិកសារធាតុរាវ ប្រព័ន្ធម៉ាស៊ីនត្រជាក់អគារ (HVAC) និងដំណើរការផលិតកម្មឧស្សាហកម្ម។",
        },
        "subjects_studied": [
            "Engineering Thermodynamics & Heat Transfer",
            "Fluid Mechanics & Hydraulics",
            "Machine Element Design & Kinematics",
            "Manufacturing Processes & CNC Machining",
            "Building HVAC Systems Design",
        ],
        "required_skills": [
            "3D Mechanical CAD Modeling (SolidWorks, AutoCAD)",
            "Thermal & Stress Simulation",
            "Hands-on Machining & Fabrication",
        ],
        "potential_challenges": [
            "Rigorous mathematical physics and thermodynamics calculations",
            "Industrial workshop safety hazards and machine upkeep",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTP,ESTP,ISTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "automotive-technology-mechanics",
        "name": {
            "en": "Automotive Technology & Heavy Machinery",
            "km": "បច្ចេកវិទ្យារថយន្ត និងគ្រឿងចក្រធុនធ្ងន់",
        },
        "category": "Engineering",
        "description": {
            "en": "Covers internal combustion engines, electric vehicle (EV) powertrain systems, automotive diagnostics (OBD-II), hydraulic heavy machinery, and fleet maintenance management.",
            "km": "គ្របដណ្តប់លើម៉ាស៊ីនចំហេះក្នុង ប្រព័ន្ធរថយន្តអគ្គិសនី (EV) ការវិភាគប្រព័ន្ធរថយន្តអេឡិចត្រូនិក គ្រឿងចក្រធុនធ្ងន់ និងការគ្រប់គ្រងយានដ្ឋានបច្ចេកទេស។",
        },
        "subjects_studied": [
            "Automotive Engine Overhaul & Fuel Systems",
            "Electric & Hybrid Vehicle Powertrain Systems",
            "Automotive Electrical & Electronic Diagnostics",
            "Hydraulic & Pneumatic Heavy Machinery Control",
            "Workshop Operations & Fleet Management",
        ],
        "required_skills": [
            "Computerized Engine Diagnostic Scanning",
            "Hydraulic System Calibration & Component Repair",
            "EV Battery Management & High-Voltage Safety",
        ],
        "potential_challenges": [
            "Fast-paced shift from mechanical engines to high-voltage electric vehicles",
            "Physically strenuous garage workshop operations",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTP,ESTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "mechatronics-robotics",
        "name": {
            "en": "Mechatronics & Robotics Engineering",
            "km": "វិស្វកម្មមេកាត្រូនិក និងរ៉ូបូត",
        },
        "category": "Engineering",
        "description": {
            "en": "Blends mechanical hardware, electronic sensors, microcontrollers, and intelligent software to build automated production lines, drones, and industrial robotics systems.",
            "km": "រួមបញ្ចូលមេកានិក អេឡិចត្រូនិក ប្រព័ន្ធសេនស័រ មីក្រូកុងត្រូល័រ និងសូហ្វវែរឆ្លាតវៃ ដើម្បីបង្កើតរ៉ូបូតឧស្សាហកម្ម និងប្រព័ន្ធស្វ័យប្រវត្តិកម្មទំនើប។",
        },
        "subjects_studied": [
            "Robotics Kinematics & Dynamics",
            "Embedded Systems & Microcontroller Programming",
            "Sensors, Actuators & Signal Conditioning",
            "Control Systems & Feedback Theory",
            "Industrial Robotics & Automated Assembly",
        ],
        "required_skills": [
            "Embedded C/C++ Programming & ROS",
            "Electromechanical Prototyping",
            "Sensor Integration & Feedback Tuning",
        ],
        "potential_challenges": [
            "Simultaneous mastery of mechanical, electrical, and coding disciplines",
            "Difficult multidisciplinary debugging when hardware and software interact",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "INTP,INTJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "telecommunication-engineering",
        "name": {
            "en": "Telecommunications & Electronic Engineering",
            "km": "វិស្វកម្មទូរគមនាគមន៍ និងបណ្តាញឥតខ្សែ",
        },
        "category": "Engineering",
        "description": {
            "en": "Focuses on wireless communications, 4G/5G mobile cellular networks, optical fiber transmission, satellite systems, antenna design, and microwave frequency propagation.",
            "km": "ផ្តោតលើប្រព័ន្ធទូរគមនាគមន៍ឥតខ្សែ បណ្តាញទូរស័ព្ទចល័ត 4G/5G ខ្សែកាបអុបទិក ប្រព័ន្ធផ្កាយរណប និងការបញ្ជូនសញ្ញារលកធាតុអាកាស។",
        },
        "subjects_studied": [
            "Electromagnetic Fields & Wave Propagation",
            "Digital Communication Systems & Modulation",
            "Optical Fiber Communications & Transmission",
            "Cellular Network Architecture (4G/5G/6G)",
            "Antenna Design & RF Engineering",
        ],
        "required_skills": [
            "Radio Frequency (RF) Measurement & Spectrum Analysis",
            "Fiber Optic Splicing & Testing (OTDR)",
            "Telecom Network Site Planning",
        ],
        "potential_challenges": [
            "Complex advanced calculus in electromagnetic field theory",
            "Field tower site surveys and telecommunication pole climbing",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTJ,INTJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "food-technology-engineering",
        "name": {
            "en": "Food Technology & Chemical Engineering",
            "km": "បច្ចេកវិទ្យាអាហារ និងវិស្វកម្មគីមី",
        },
        "category": "Engineering",
        "description": {
            "en": "Applies chemical principles and microbiology to food processing, packaging, shelf-life extension, industrial quality safety standards (HACCP/ISO 22000), and nutritional analysis.",
            "km": "អនុវត្តគោលការណ៍គីមីវិទ្យា និងមីក្រូជីវវិទ្យា លើការកែច្នៃចំណីអាហារ ការវេចខ្ចប់ ការរក្សាទុក ស្តង់ដារសុវត្ថិភាពចំណីអាហារ (HACCP) និងការវិភាគអាហារូបត្ថម្ភ។",
        },
        "subjects_studied": [
            "Food Chemistry & Biochemical Analysis",
            "Food Microbiology & Sanitation",
            "Food Preservation, Processing & Packaging",
            "Quality Assurance & HACCP Systems",
            "Chemical Unit Operations & Plant Design",
        ],
        "required_skills": [
            "Laboratory Chemical Analysis & Titration",
            "Food Safety Inspection (HACCP Standards)",
            "Factory Quality Control Auditing",
        ],
        "potential_challenges": [
            "Strict hygienic regulatory standards and contamination prevention",
            "Handling volatile chemical reagents and precise measurement requirements",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "ISTJ,ISFJ,INTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    },

    # --- 4. Pure & Natural Sciences (STEM) ---
    {
        "slug": "biology-biotechnology",
        "name": {
            "en": "Biology & Applied Biotechnology",
            "km": "វិទ្យាសាស្ត្រជីវសាស្រ្ត និងបច្ចេកវិទ្យាជីវៈ",
        },
        "category": "Natural Sciences",
        "description": {
            "en": "Investigates molecular genetics, cell biology, microbiology, plant and animal physiology, enzymatic fermentation, and agricultural/medical biotechnology applications.",
            "km": "ស្រាវជ្រាវអំពីហ្សែនម៉ូលេគុល ជីវវិទ្យាកោសិកា មីក្រូជីវវិទ្យា ជីវសរីរវិទ្យា និងការអនុវត្តបច្ចេកវិទ្យាជីវសាស្ត្រក្នុងវិស័យកសិកម្មនិងវេជ្ជសាស្ត្រ។",
        },
        "subjects_studied": [
            "Cell & Molecular Biology",
            "Microbiology & Virology",
            "Biochemistry & Enzyme Kinetics",
            "Genetics & Genetic Engineering",
            "Biotechnology & Industrial Fermentation",
        ],
        "required_skills": [
            "Aseptic Laboratory Culturing & Microscopy",
            "DNA Extraction & PCR Electrophoresis",
            "Biological Data Record Keeping",
        ],
        "potential_challenges": [
            "Long incubation waiting periods for biological cell cultures",
            "Delicate laboratory protocols where minor contamination ruins batches",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTP,INTJ,INFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "chemistry-chemical-analysis",
        "name": {
            "en": "Chemistry & Applied Chemical Analysis",
            "km": "គីមីវិទ្យា និងការវិភាគគីមីអនុវត្ត",
        },
        "category": "Natural Sciences",
        "description": {
            "en": "Focuses on organic synthesis, analytical chromatography, inorganic reaction mechanisms, physical chemistry, industrial polymer synthesis, and laboratory toxicology testing.",
            "km": "ផ្តោតលើការសំយោគគីមីសរីរាង្គ គីមីវិភាគ (Chromatography) យន្តការប្រតិកម្មគីមីអសរីរាង្គ និងការវិភាគសារធាតុគីមីក្នុងមន្ទីរពិសោធន៍ឧស្សាហកម្ម។",
        },
        "subjects_studied": [
            "Organic Chemistry I & II",
            "Inorganic Chemistry & Coordination Complexes",
            "Analytical Chemistry & Instrumental Analysis (Spectroscopy, HPLC)",
            "Physical Chemistry & Thermodynamics",
            "Industrial & Environmental Chemistry",
        ],
        "required_skills": [
            "Spectrophotometry & Chromatography Operation",
            "Chemical Reagent Preparation & Standardization",
            "Hazardous Material Safety Protocols",
        ],
        "potential_challenges": [
            "Strict handling of toxic, corrosive, or flammable chemical agents",
            "High mathematical rigor in quantum and thermodynamic chemistry",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTP,ISTJ,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "mathematics-statistics",
        "name": {
            "en": "Mathematics & Applied Statistics",
            "km": "គណិតវិទ្យា និងស្ថិតិអនុវត្ត",
        },
        "category": "Natural Sciences",
        "description": {
            "en": "Deep dive into real and complex analysis, abstract algebra, numerical methods, stochastic probability modeling, mathematical optimization, and actuarial foundations.",
            "km": "សិក្សាស៊ីជម្រៅលើការវិភាគគណិតវិទ្យា ពិជគណិតអរូបី វិធីសាស្ត្រគណនា គំរូប្រូបាប៊ីលីតេ និងការអនុវត្តស្ថិតិក្នុងវិទ្យាសាស្ត្រនិងហិរញ្ញវត្ថុ។",
        },
        "subjects_studied": [
            "Real Analysis & Metric Spaces",
            "Abstract Algebra & Group Theory",
            "Differential Equations & Dynamical Systems",
            "Probability Theory & Mathematical Statistics",
            "Numerical Analysis & Scientific Computing",
        ],
        "required_skills": [
            "Rigorous Deductive Mathematical Proof",
            "Statistical Programming (R, MATLAB, Python)",
            "Mathematical Abstraction & Optimization",
        ],
        "potential_challenges": [
            "Extremely high level of intellectual abstraction",
            "Requires relentless patience in solving non-trivial mathematical proofs",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "C",
        "personality_affinity": "INTP,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "physics-electronics",
        "name": {
            "en": "Physics & Applied Electronics",
            "km": "រូបវិទ្យា និងអេឡិចត្រូនិកអនុវត្ត",
        },
        "category": "Natural Sciences",
        "description": {
            "en": "Explores classical mechanics, electromagnetism, quantum mechanics, solid-state semiconductor physics, laser optics, and electronic instrumentation systems.",
            "km": "សិក្សាអំពីមេកានិកបុរាណ អេឡិចត្រូម៉ាញេទិច រូបវិទ្យាកង់ទិច រូបវិទ្យាអង្គធាតុរឹងនៃឧបករណ៍សឺមីកុងឌុចទ័រ និងអុបទិកឡាស៊ែរ។",
        },
        "subjects_studied": [
            "Classical Mechanics & Relativity",
            "Electrodynamics & Optics",
            "Quantum Physics & Atomic Structure",
            "Semiconductor Physics & Microelectronics",
            "Experimental Physics Instrumentation",
        ],
        "required_skills": [
            "Mathematical Physics Derivations",
            "Laboratory Instrumentation & Oscilloscope Usage",
            "Physical Simulation & Data Fitting",
        ],
        "potential_challenges": [
            "High mathematical difficulty combining calculus with physical phenomena",
            "Abstract theoretical models that cannot be observed with the naked eye",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTP,INTJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80",
    },

    # --- 5. Health Sciences ---
    {
        "slug": "general-medicine",
        "name": {
            "en": "Doctor of Medicine (MD) / General Medicine",
            "km": "វេជ្ជបណ្ឌិតទូទៅ / វេជ្ជសាស្ត្រ",
        },
        "category": "Health Sciences",
        "description": {
            "en": "Comprehensive 8-year professional medical curriculum covering human anatomy, clinical pathology, internal medicine, surgery, pediatrics, and emergency patient care in Cambodian hospitals.",
            "km": "កម្មវិធីសិក្សាវេជ្ជបណ្ឌិតពេញលេញរយៈពេល ៨ ឆ្នាំ គ្របដណ្តប់លើកាយវិភាគសាស្ត្រ រោគសាស្ត្រ វេជ្ជសាស្ត្រព្យាបាលទូទៅ ការវះកាត់ ជំងឺកុមារ និងការសង្គ្រោះបន្ទាន់នៅមន្ទីរពេទ្យ។",
        },
        "subjects_studied": [
            "Human Anatomy, Histology & Embryology",
            "Medical Physiology & Biochemistry",
            "Pathology & Microbiology",
            "Internal Medicine & Clinical Diagnosis",
            "General Surgery & Anesthesiology",
            "Pediatrics & Child Health",
            "Obstetrics & Gynecology",
            "Clinical Hospital Internships (Year 4 to 8)",
        ],
        "required_skills": [
            "Clinical Diagnostic Reasoning",
            "Compassionate Bedside Manner & Patient Communication",
            "High Stamina & Emotional Resilience",
            "Emergency Triage & Patient Life Support",
        ],
        "potential_challenges": [
            "Intense 8-year academic duration with competitive entrance exams",
            "High-pressure hospital shifts and life-or-death decision making",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "S",
        "personality_affinity": "INFJ,ISFJ,INTJ,ENFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "pharmacy",
        "name": {
            "en": "Doctor of Pharmacy (PharmD) / Pharmacy",
            "km": "ឱសថសាស្ត្រ",
        },
        "category": "Health Sciences",
        "description": {
            "en": "A 5-year specialized healthcare program focusing on medicinal chemistry, pharmacology, drug formulation, pharmaceutical dispensary management, toxicology, and clinical patient counseling.",
            "km": "កម្មវិធីសិក្សាឱសថសាស្ត្ររយៈពេល ៥ ឆ្នាំ ផ្តោតលើគីមីឱសថ ឱសថវិទ្យា ការផ្សំថ្នាំ ការគ្រប់គ្រងឱសថស្ថាន ជាតិពុល និងការប្រឹក្សាយោបល់អំពីការប្រើប្រាស់ថ្នាំដល់អ្នកជំងឺ។",
        },
        "subjects_studied": [
            "Medicinal Chemistry & Organic Synthesis",
            "Pharmacology & Pharmacokinetics",
            "Pharmaceutics & Drug Delivery Systems",
            "Pharmacognosy & Natural Product Chemistry",
            "Hospital & Community Pharmacy Practice",
            "Toxicology & Drug Interaction Analysis",
        ],
        "required_skills": [
            "Drug Interaction Verification & Dosage Calculation",
            "Laboratory Formulation & Compounding",
            "Clear Patient Medication Guidance",
        ],
        "potential_challenges": [
            "Massive memorization of chemical structures, generic and brand drug names",
            "High legal liability regarding drug dosage correctness",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "C",
        "personality_affinity": "ISTJ,INTJ,ISFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "dentistry",
        "name": {
            "en": "Doctor of Dental Surgery (DDS) / Dentistry",
            "km": "ទន្តវទ្យាសាស្ត្រ / ពេទ្យធ្មេញ",
        },
        "category": "Health Sciences",
        "description": {
            "en": "A 7-year specialized clinical degree in oral maxillofacial health, restorative dentistry, orthodontics, periodontics, oral surgery, and dental prosthetics.",
            "km": "កម្មវិធីសិក្សាជំនាញទន្តពេទ្យរយៈពេល ៧ ឆ្នាំ លើសុខភាពមាត់ធ្មេញ ការប៉ះធ្មេញ ការតម្រង់ធ្មេញ ការវះកាត់មាត់ធ្មេញ និងការដាំបង្គោលធ្មេញសិប្បនិម្មិត។",
        },
        "subjects_studied": [
            "Head & Neck Anatomy & Craniofacial Biology",
            "Oral Pathology & Microbiology",
            "Operative Dentistry & Endodontics",
            "Prosthodontics (Crowns, Bridges, Dentures)",
            "Orthodontics & Facial Orthopedics",
            "Oral & Maxillofacial Surgery",
        ],
        "required_skills": [
            "Exceptional Fine Motor Hand Dexterity",
            "3D Spatial Precision in Small Oral Cavities",
            "Patient Pain Management & Anxiety Alleviation",
        ],
        "potential_challenges": [
            "Physically demanding posture causing neck and back strain",
            "High investment required for private dental clinic equipment",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "ISTJ,ISFJ,ISTP",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "nursing-science",
        "name": {
            "en": "Nursing Science & Patient Care",
            "km": "គិលានុបដ្ឋាកវិទ្យា",
        },
        "category": "Health Sciences",
        "description": {
            "en": "Educates compassionate, licensed professional nurses in clinical patient assessment, medication administration, surgical assistance, intensive care (ICU), and community healthcare.",
            "km": "បណ្តុះបណ្តាលគិលានុបដ្ឋាកវិជ្ជាជីវៈប្រកបដោយក្រមសីលធម៌ ក្នុងការថែទាំអ្នកជំងឺ ការផ្តល់ថ្នាំ ការជួយសង្គ្រោះក្នុងបន្ទប់វះកាត់ និងការថែទាំអ្នកជំងឺធ្ងន់ធ្ងរ (ICU)។",
        },
        "subjects_studied": [
            "Foundations of Nursing Practice & Ethics",
            "Medical-Surgical Nursing",
            "Pharmacology for Nurses",
            "Maternal & Child Health Nursing",
            "Critical Care & Emergency Nursing",
        ],
        "required_skills": [
            "Clinical Vital Signs Assessment & IV Administration",
            "Empathetic Patient Bedside Care",
            "Quick Reaction during Medical Decompensation",
        ],
        "potential_challenges": [
            "Physical stamina required for 12-hour hospital shifts and night rounds",
            "Emotional toll of witnessing patient suffering and loss",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "I",
        "personality_affinity": "ISFJ,ESFJ,INFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "public-health",
        "name": {
            "en": "Public Health & Epidemiology",
            "km": "សុខភាពសាធារណៈ និងរោគរាតត្បាត",
        },
        "category": "Health Sciences",
        "description": {
            "en": "Focuses on disease prevention, health education, epidemiology, maternal-child nutrition, clean water sanitation (WASH), and healthcare policy management in Cambodia and the ASEAN region.",
            "km": "ផ្តោតលើការទប់ស្កាត់ការឆ្លងរោគ ការអប់រំសុខភាពសហគមន៍ រោគរាតត្បាត អាហារូបត្ថម្ភមាតានិងកុមារ អនាម័យទឹកស្អាត និងការគ្រប់គ្រងគោលនយោបាយសុខាភិបាល។",
        },
        "subjects_studied": [
            "Epidemiological Investigation & Outbreak Control",
            "Biostatistics & Public Health Analytics",
            "Environmental & Occupational Health",
            "Health Promotion & Community Behavior Change",
            "Health Systems Management & Policy",
        ],
        "required_skills": [
            "Statistical Outbreak Surveillance",
            "Community Health Assessment & Program Planning",
            "Public Health Communication & Education",
        ],
        "potential_challenges": [
            "Coordinating complex outreach in remote rural provinces",
            "Measuring long-term preventive outcomes rather than immediate fixes",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "S",
        "personality_affinity": "ENFJ,INFJ,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "medical-laboratory",
        "name": {
            "en": "Medical Laboratory Technology",
            "km": "បច្ចេកវិទ្យាមន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ",
        },
        "category": "Health Sciences",
        "description": {
            "en": "Trains laboratory scientists to perform diagnostic biochemical tests, hematology cell counts, microbiology cultures, blood banking cross-matches, and molecular genetic screening.",
            "km": "បណ្តុះបណ្តាលអ្នកវិទ្យាសាស្ត្រមន្ទីរពិសោធន៍ក្នុងការវិភាគឈាម ការពិនិត្យបាក់តេរីនិងវីរុស ការផ្គូផ្គងឈាម និងការធ្វើតេស្តហ្សែនម៉ូលេគុលដើម្បីជួយវេជ្ជបណ្ឌិតវិភាគរោគ។",
        },
        "subjects_studied": [
            "Clinical Hematology & Hemostasis",
            "Clinical Biochemistry & Automated Analyzers",
            "Medical Microbiology, Virology & Mycology",
            "Immunology & Blood Bank Transfusion Medicine",
            "Molecular Diagnostics & PCR Techniques",
        ],
        "required_skills": [
            "Microscopic Cell Identification",
            "Operation of Automated Clinical Chemistry Analyzers",
            "Aseptic Specimen Handling & Biosafety Adherence",
        ],
        "potential_challenges": [
            "Handling infectious pathogens requiring strict biological containment",
            "Repetitive pipetting and long hours standing at lab benches",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "ISTJ,INTP,ISFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    },

    # --- 6. Law, Policy & Social Sciences ---
    {
        "slug": "law-jurisprudence",
        "name": {
            "en": "Law & Jurisprudence",
            "km": "ច្បាប់ និងនីតិសាស្ត្រ",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Provides rigorous legal training in the Civil Code, Penal Code, Constitutional Law, Commercial Law, administrative procedures, and court advocacy in the Kingdom of Cambodia.",
            "km": "ផ្តល់ចំណេះដឹងស៊ីជម្រៅលើក្រមរដ្ឋប្បវេណី ក្រមព្រហ្មទណ្ឌ ច្បាប់រដ្ឋធម្មនុញ្ញ ច្បាប់ពាណិជ្ជកម្ម និងនីតិវិធីតុលាការនៃព្រះរាជាណាចក្រកម្ពុជា។",
        },
        "subjects_studied": [
            "Constitutional Law & Legal Systems",
            "Civil Law & Obligations (Cambodian Civil Code)",
            "Criminal Law & Criminal Procedure",
            "Commercial & Corporate Law",
            "Administrative Law & Public Disputes",
            "Trial Advocacy & Moot Court",
        ],
        "required_skills": [
            "Legal Research, Statutory Interpretation & Case Analysis",
            "Persuasive Written & Oral Argumentation",
            "Contract Drafting & Due Diligence",
        ],
        "potential_challenges": [
            "Voluminous reading of statutory texts, judicial precedents, and decrees",
            "High pressure when representing clients in adversarial court hearings",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "S",
        "personality_affinity": "ENTJ,INTJ,ESTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "political-science",
        "name": {
            "en": "Political Science & Public Affairs",
            "km": "វិទ្យាសាស្ត្រនយោបាយ និងកិច្ចការសាធារណៈ",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Examines comparative political systems, constitutional theory, political philosophy, public opinion research, election processes, and state-society relations.",
            "km": "សិក្សាអំពីប្រព័ន្ធនយោបាយប្រៀបធៀប ទ្រឹស្តីរដ្ឋធម្មនុញ្ញ ទស្សនវិជ្ជានយោបាយ ការស្រាវជ្រាវមតិសាធារណៈ ដំណើរការបោះឆ្នោត និងទំនាក់ទំនងរដ្ឋ-សង្គម។",
        },
        "subjects_studied": [
            "Comparative Political Systems & Government",
            "Classical & Modern Political Philosophy",
            "Political Parties, Elections & Voting Behavior",
            "State Building & Democratic Governance",
            "Political Research Methodology & Survey Design",
        ],
        "required_skills": [
            "Critical Political Discourse Analysis",
            "Survey Research & Polling Interpretation",
            "Policy Brief Preparation",
        ],
        "potential_challenges": [
            "Navigating sensitive domestic political subjects with neutrality",
            "Synthesizing deeply conflicting ideological viewpoints",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "S",
        "personality_affinity": "ENTJ,ENFJ,INTP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "international-relations",
        "name": {
            "en": "International Relations & Diplomacy",
            "km": "ទំនាក់ទំនងអន្តរជាតិ និងការទូត",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Examines geopolitics, ASEAN multilateral diplomacy, international treaty law, foreign policy formulation, bilateral conflict resolution, and international development organizations.",
            "km": "សិក្សាអំពីភូមិសាស្ត្រនយោបាយពិភពលោក ការទូតពហុភាគីអាស៊ាន ច្បាប់អន្តរជាតិ គោលនយោបាយការបរទេស និងការដោះស្រាយវិវាទអន្តរជាតិ។",
        },
        "subjects_studied": [
            "Theories of International Relations",
            "Diplomatic History & Statecraft",
            "Public International Law & Treaties",
            "ASEAN Politics & Regional Security Architecture",
            "Foreign Policy Analysis & Geopolitics",
            "Diplomatic Protocol & Bilateral Negotiation",
        ],
        "required_skills": [
            "Diplomatic Discretion & Cross-Cultural Fluency",
            "Geopolitical Analysis & Policy Brief Drafting",
            "Bilingual/Multilingual Public Speaking",
        ],
        "potential_challenges": [
            "Highly competitive career paths in foreign ministries and embassies",
            "Rapidly shifting and unpredictable global geopolitical tensions",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "E",
        "personality_affinity": "ENFJ,ENTJ,INFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "public-administration",
        "name": {
            "en": "Public Administration & Governance",
            "km": "រដ្ឋបាលសាធារណៈ និងអភិបាលកិច្ច",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Prepares civil servants and governance professionals to design national public policies, manage ministry departments, lead decentralization reforms, and deliver public services effectively.",
            "km": "បណ្តុះបណ្តាលមន្ត្រីរាជការ និងអ្នកជំនាញអភិបាលកិច្ច ក្នុងការរៀបចំគោលនយោបាយសាធារណៈ ការគ្រប់គ្រងក្រសួងស្ថាប័នរដ្ឋ កំណែទម្រង់វិមជ្ឈការ និងការផ្តល់សេវាសាធារណៈ។",
        },
        "subjects_studied": [
            "Public Policy Analysis & Formulation",
            "Administrative Law & Civil Service Regulations",
            "Public Sector Financial Management & Budgeting",
            "Decentralization & Sub-National Administration",
            "E-Government & Digital Public Services",
        ],
        "required_skills": [
            "Bureaucratic Navigation & Administrative Procedure",
            "Policy Evaluation & Impact Assessment",
            "Citizen-Centric Service Delivery",
        ],
        "potential_challenges": [
            "Navigating complex institutional bureaucracy and reform inertia",
            "Meeting diverse public stakeholder needs with limited public budgets",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "S",
        "personality_affinity": "ESTJ,ENTJ,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "psychology-counseling",
        "name": {
            "en": "Psychology & Counseling",
            "km": "ចិត្តវិទ្យា និងការប្រឹក្សាយោបល់",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Explores cognitive psychology, developmental psychopathology, mental health counseling, trauma recovery, organizational psychology, and behavioral therapy in Cambodia.",
            "km": "សិក្សាអំពីចិត្តវិទ្យាការយល់ដឹង សុខភាពផ្លូវចិត្ត ការប្រឹក្សាយោបល់ព្យាបាលផ្លូវចិត្ត ការស្តាររបួសផ្លូវចិត្ត (Trauma) និងចិត្តវិទ្យាស្ថាប័នការងារ។",
        },
        "subjects_studied": [
            "General & Developmental Psychology",
            "Abnormal Psychology & Clinical Diagnosis",
            "Counseling Theories & Psychotherapeutic Techniques",
            "Psychological Assessment & Psychometrics",
            "Trauma-Informed Care & Community Mental Health",
        ],
        "required_skills": [
            "Empathetic Active Listening & Non-Judgmental Presence",
            "Psychological Counseling Protocol Administration",
            "Confidentiality & Ethical Mental Health Standards",
        ],
        "potential_challenges": [
            "High emotional fatigue when supporting deeply distressed individuals",
            "Overcoming lingering societal stigmas surrounding mental health support",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "I",
        "personality_affinity": "INFJ,INFP,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "sociology-social-work",
        "name": {
            "en": "Sociology & Community Social Work",
            "km": "សង្គមវិទ្យា និងការងារសង្គម",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Examines community development, child protection, family support services, gender equity, poverty mitigation, and NGO humanitarian project management across Cambodian provinces.",
            "km": "ពិនិត្យមើលការអភិវឌ្ឍសហគមន៍ កិច្ចការពារកុមារ សេវាគាំទ្រគ្រួសារ សមភាពយេនឌ័រ ការកាត់បន្ថយភាពក្រីក្រ និងការគ្រប់គ្រងគម្រោងមនុស្សធម៌របស់អង្គការក្រៅរដ្ឋាភិបាល។",
        },
        "subjects_studied": [
            "Sociological Theories & Social Inequality",
            "Community Needs Assessment & Social Work Practice",
            "Child Welfare & Family Support Systems",
            "Gender, Vulnerability & Human Rights",
            "NGO Project Management & Monitoring/Evaluation",
        ],
        "required_skills": [
            "Community Mobilization & Fieldwork Facilitation",
            "Case Management & Vulnerable Group Advocacy",
            "Social Impact Program Assessment",
        ],
        "potential_challenges": [
            "Emotional weight of working with severely marginalized populations",
            "Navigating resource constraints in remote rural communities",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "E",
        "personality_affinity": "ENFJ,INFJ,ESFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "english-teaching-tefl",
        "name": {
            "en": "English Literature & TEFL / Education",
            "km": "អក្សរសាស្ត្រអង់គ្លេស និងគរុកោសល្យភាសាអង់គ្លេស",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Focuses on English linguistics, world literature, curriculum development, second-language acquisition pedagogy, and modern communicative teaching methods for schools and universities.",
            "km": "ផ្តោតលើភាសាវិទ្យាអង់គ្លេស អក្សរសាស្ត្រពិភពលោក ការរៀបចំកម្មវិធីសិក្សា និងវិធីសាស្ត្រគរុកោសល្យបង្រៀនភាសាអង់គ្លេសកម្រិតខ្ពស់សម្រាប់សាលារៀននិងសាកលវិទ្យាល័យ។",
        },
        "subjects_studied": [
            "English Linguistics, Phonetics & Phonology",
            "Second Language Acquisition Theories",
            "Teaching English as a Foreign Language (TEFL Methodology)",
            "English & World Literature",
            "Curriculum & Instructional Material Design",
        ],
        "required_skills": [
            "Native/Near-Native English Fluency",
            "Engaging Classroom Instruction & Student Mentoring",
            "Lesson Planning & Educational Material Creation",
        ],
        "potential_challenges": [
            "Managing large classroom sizes with varying student language proficiency",
            "Continuous preparation of fresh, interactive educational content",
        ],
        "riasec_primary": "S",
        "riasec_secondary": "A",
        "personality_affinity": "ENFJ,INFJ,ENFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "english-translation-interpreting",
        "name": {
            "en": "English for Translation & Interpreting",
            "km": "ភាសាអង់គ្លេសសម្រាប់បកប្រែផ្ទាល់មាត់និងឯកសារ",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Trains professional translators and conference interpreters in simultaneous and consecutive interpretation, legal/commercial document translation, localization, and CAT tools.",
            "km": "បណ្តុះបណ្តាលអ្នកបកប្រែផ្ទាល់មាត់ក្នុងសន្និសីទអន្តរជាតិ (Simultaneous Interpretation) ការបកប្រែឯកសារច្បាប់ ពាណិជ្ជកម្ម និងការប្រើប្រាស់ឧបករណ៍បច្ចេកវិទ្យាបកប្រែទំនើប។",
        },
        "subjects_studied": [
            "Theories & Techniques of Translation",
            "Simultaneous & Consecutive Interpreting Practice",
            "Legal, Financial & Medical Document Translation",
            "Computer-Assisted Translation (CAT) & Terminology Tools",
            "Cross-Cultural Pragmatics & Advanced Stylistics",
        ],
        "required_skills": [
            "High-Speed Bilingual Cognitive Processing",
            "Flawless Vocabulary Accuracy in Khmer and English",
            "Conference Booth Interpretation Focus",
        ],
        "potential_challenges": [
            "Intense cognitive pressure during live simultaneous conference interpretation",
            "Zero tolerance for semantic translation mistakes in legal and medical contracts",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "S",
        "personality_affinity": "INFP,INFJ,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "asian-languages-culture",
        "name": {
            "en": "Asian Languages & International Communication (Chinese, Japanese, Korean)",
            "km": "ភាសាអាស៊ី និងទំនាក់ទំនងអន្តរជាតិ (ចិន ជប៉ុន កូរ៉េ)",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Offers deep language mastery and cultural business competence in major Asian regional languages (Chinese Mandarin HSK, Japanese JLPT, or Korean TOPIK) for diplomacy, FDI, and trade.",
            "km": "ផ្តល់ជំនាញភាសាកម្រិតខ្ពស់ និងការយល់ដឹងពីវប្បធម៌ធុរកិច្ចនៃភាសាតំបន់អាស៊ី (ភាសាចិន HSK ភាសាជប៉ុន JLPT ឬភាសាកូរ៉េ TOPIK) សម្រាប់ការទូត និងពាណិជ្ជកម្មអន្តរជាតិ។",
        },
        "subjects_studied": [
            "Target Language Grammar, Kanji/Hanja & Phonology",
            "Business Communication & Commercial Correspondence",
            "History, Society & Business Culture of East Asia",
            "Translation & Business Interpretation",
        ],
        "required_skills": [
            "High-Level Target Language Certification (HSK 5-6 / JLPT N2-N1 / TOPIK 5-6)",
            "Cultural Etiquette & International Business Protocol",
            "Bilingual Cross-Cultural Negotiation",
        ],
        "potential_challenges": [
            "Extensive memorization of non-alphabetical character writing systems",
            "Mastering complex honorifics and culturally specific nuance",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "S",
        "personality_affinity": "INFJ,ISFJ,ENFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "khmer-literature-linguistics",
        "name": {
            "en": "Khmer Literature, Linguistics & Culture",
            "km": "អក្សរសាស្ត្រខ្មែរ ភាសាវិទ្យា និងវប្បធម៌",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Preserves and analyzes classical and modern Khmer literature, historical inscriptions, linguistic phonology and syntax, folklore, poetry, and Khmer cultural civilization.",
            "km": "ថែរក្សា និងសិក្សាស្រាវជ្រាវអក្សរសាស្ត្រខ្មែរបុរាណនិងទំនើប សិលាចារឹក ភាសាវិទ្យាខ្មែរ រឿងព្រេង កំណាព្យ និងអារ្យធម៌វប្បធម៌ខ្មែរដ៏រុងរឿង។",
        },
        "subjects_studied": [
            "Khmer Linguistics, Syntax & Etymology",
            "Ancient Epigraphy & Pre-Angkorian/Angkorian Inscriptions",
            "Classical Khmer Literature & Epic Poetry (Reamker)",
            "Modern Khmer Literary Movements & Prose",
            "Khmer Civilization, Customs & Folklore",
        ],
        "required_skills": [
            "Mastery of Classical Khmer Orthography & Poetic Meters",
            "Deciphering Ancient Khmer Inscriptions",
            "Literary Criticism & Analytical Writing",
        ],
        "potential_challenges": [
            "Deciphering eroded historical stone inscriptions",
            "Carving specialized academic and publishing career paths",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "S",
        "personality_affinity": "INFP,INFJ,ISFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "media-communications",
        "name": {
            "en": "Media, Journalism & Digital Communications",
            "km": "ប្រព័ន្ធផ្សព្វផ្សាយ សារព័ត៌មាន និងទំនាក់ទំនង",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Explores investigative journalism, news broadcasting, television and audio production, digital storytelling, photojournalism, and public corporate communications.",
            "km": "សិក្សាអំពីសារព័ត៌មានស៊ើបអង្កេត ការផ្សាយព័ត៌មានទូរទស្សន៍និងវិទ្យុ ការផលិតវីដេអូ ថតរូបសារព័ត៌មាន និងទំនាក់ទំនងសាធារណៈសម្រាប់ស្ថាប័នធំៗ។",
        },
        "subjects_studied": [
            "News Writing, Reporting & Investigative Journalism",
            "Broadcast Media Production (Video & Audio)",
            "Media Ethics, Law & Press Freedom",
            "Digital Content Strategy & Social Storytelling",
            "Corporate Communications & Crisis PR",
        ],
        "required_skills": [
            "Investigative Interviewing & Fact Checking",
            "Clear, Fast-Paced News Writing",
            "Video Shooting & Non-Linear Editing",
        ],
        "potential_challenges": [
            "Tight breaking news deadlines and constant digital news cycle pressure",
            "Maintaining strict journalistic objectivity in polarized environments",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "E",
        "personality_affinity": "ENFP,ENTP,INFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80",
    },

    # --- 7. Agriculture & Environmental Sciences ---
    {
        "slug": "agronomy-agricultural-sciences",
        "name": {
            "en": "Agronomy & Crop Sciences",
            "km": "ក្សេត្រសាស្ត្រ និងវិទ្យាសាស្ត្រដំណាំ",
        },
        "category": "Agriculture & Life Sciences",
        "description": {
            "en": "Prepares agricultural specialists to improve crop yields (rice, cassava, rubber, cashews, tropical fruit), develop smart irrigation, manage soil fertility, and implement climate-resilient farming.",
            "km": "បណ្តុះបណ្តាលអ្នកជំនាញកសិកម្មដើម្បីបង្កើនទិន្នផលដំណាំ (ស្រូវ ដំឡូងមី កៅស៊ូ ស្វាយចន្ទី) ប្រព័ន្ធស្រោចស្រពឆ្លាតវៃ ការគ្រប់គ្រងដី និងកសិកម្មធន់នឹងអាកាសធាតុ។",
        },
        "subjects_studied": [
            "Soil Science, Chemistry & Fertility Management",
            "Crop Physiology & Plant Breeding",
            "Integrated Pest & Weed Management (IPM)",
            "Rice & Field Crop Production Technologies",
            "Horticulture, Post-Harvest & Storage Systems",
        ],
        "required_skills": [
            "Plant Pathology & Pest Identification",
            "Soil Testing & Fertilizer Recommendation",
            "Field Trial Experimentation & Data Collection",
        ],
        "potential_challenges": [
            "Working outdoors in rural agricultural fields under tropical sun",
            "Unpredictable climate events (droughts, seasonal floods) impacting crops",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISTJ,ISFP,ESTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "animal-science-veterinary",
        "name": {
            "en": "Animal Science & Veterinary Medicine",
            "km": "វិទ្យាសាស្ត្រសត្វ និងបសុព្យាបាល",
        },
        "category": "Agriculture & Life Sciences",
        "description": {
            "en": "Focuses on commercial livestock breeding (cattle, swine, poultry), animal clinical health, disease diagnostics, vaccine administration, feed nutrition, and biosecurity.",
            "km": "ផ្តោតលើការចិញ្ចឹមសត្វពាហនៈ (គោ ជ្រូក មាន់ ទា) សុខភាពសត្វ ការព្យាបាលជំងឺសត្វ ការចាក់វ៉ាក់សាំង អាហារូបត្ថម្ភចំណីសត្វ និងជីវសុវត្ថិភាពកសិដ្ឋាន។",
        },
        "subjects_studied": [
            "Veterinary Anatomy, Physiology & Pathology",
            "Animal Nutrition & Feed Formulation",
            "Infectious Animal Diseases & Vaccination",
            "Livestock Breeding & Genetics",
            "Clinical Veterinary Diagnosis & Surgery",
        ],
        "required_skills": [
            "Livestock Handling & Safe Physical Restraint",
            "Clinical Disease Diagnosis & Injection Administration",
            "Feed Ration Balancing",
        ],
        "potential_challenges": [
            "Risk of physical injury when handling large farm animals",
            "Combating contagious livestock epidemics (e.g. swine fever, avian flu)",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISFP,ISTP,ISFJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "forestry-fisheries",
        "name": {
            "en": "Forestry Science, Fisheries & Aquaculture",
            "km": "វិទ្យាសាស្ត្រព្រៃឈើ និងជលផល",
        },
        "category": "Agriculture & Life Sciences",
        "description": {
            "en": "Covers sustainable forest inventory, timber concession management, freshwater aquaculture (catfish, tilapia), Tonle Sap fishery ecology, and mangrove ecosystem restoration.",
            "km": "គ្របដណ្តប់លើការគ្រប់គ្រងធនធានព្រៃឈើប្រកបដោយចីរភាព វារីវប្បកម្មទឹកសាប (ត្រីប្រា ត្រីទីឡាព្យា) អេកូឡូស៊ីជលផលបឹងទន្លេសាប និងការអភិរក្សព្រៃកោងកាង។",
        },
        "subjects_studied": [
            "Silviculture & Forest Inventory Measurement",
            "Ichthyology & Fish Biology",
            "Aquaculture Systems & Hatchery Management",
            "Wetland Ecology & Fisheries Conservation Law",
            "Wildlife Conservation & Forest Protection",
        ],
        "required_skills": [
            "Water Quality Testing for Aquaculture Ponds",
            "Forest Tree Mensuration & Species Classification",
            "Fish Hatchery Breeding Operations",
        ],
        "potential_challenges": [
            "Combating illegal logging and seasonal overfishing pressures",
            "Demanding fieldwork in remote forest reserves and flooded river plains",
        ],
        "riasec_primary": "R",
        "riasec_secondary": "I",
        "personality_affinity": "ISFP,ISTP,ISTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "environmental-science",
        "name": {
            "en": "Environmental Science & Climate Resilience",
            "km": "វិទ្យាសាស្ត្របរិស្ថាន និងការគ្រប់គ្រងធនធានធម្មជាតិ",
        },
        "category": "Agriculture & Life Sciences",
        "description": {
            "en": "Explores ecology, biodiversity conservation (Mekong & Tonle Sap basins), environmental impact assessment (EIA), plastic waste management, and climate change adaptation.",
            "km": "សិក្សាអំពីប្រព័ន្ធអេកូឡូស៊ី ការអភិរក្សជីវចម្រុះ (ទន្លេមេគង្គ និងបឹងទន្លេសាប) ការវាយតម្លៃហេតុប៉ះពាល់បរិស្ថាន (EIA) និងការបន្ស៊ាំនឹងការប្រែប្រួលអាកាសធាតុ។",
        },
        "subjects_studied": [
            "Ecology & Biodiversity Conservation",
            "Environmental Chemistry & Pollution Monitoring",
            "Environmental Impact Assessment (EIA)",
            "Geographic Information Systems (GIS) & Remote Sensing",
            "Solid Waste Management & Circular Economy",
        ],
        "required_skills": [
            "Water & Soil Sample Environmental Testing",
            "GIS Mapping & Spatial Analysis (QGIS/ArcGIS)",
            "Environmental Impact Report Preparation",
        ],
        "potential_challenges": [
            "Balancing economic development pressures with conservation imperatives",
            "Challenging remote fieldwork in national parks and protected areas",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INFP,INFJ,INTJ",
        "is_stem": True,
        "image_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    },

    # --- 8. Design, Arts & Culinary Operations ---
    {
        "slug": "graphic-design-multimedia",
        "name": {
            "en": "Graphic Design & Multimedia Arts",
            "km": "រចនាក្រាហ្វិក និងសិល្បៈពហុព័ត៌មាន",
        },
        "category": "Architecture & Design",
        "description": {
            "en": "Develops visual communicators skilled in typography, brand identity, UI/UX design, motion graphics, package design, and digital creative advertising.",
            "km": "បណ្តុះបណ្តាលអ្នករចនាជំនាញលើការរចនាអក្សរ ម៉ាកសញ្ញា (Logo/Branding) ការរចនា UI/UX ក្រាហ្វិកចលនា (Motion Graphics) និងការផ្សាយពាណិជ្ជកម្មច្នៃប្រឌិត។",
        },
        "subjects_studied": [
            "Color Theory, Typography & Layout Principles",
            "Digital Illustration & Vector Graphics (Illustrator)",
            "Photo Manipulation & Retouching (Photoshop)",
            "UI/UX Design for Web and Mobile (Figma)",
            "Motion Graphics & Video Compositing (After Effects)",
        ],
        "required_skills": [
            "Mastery of Industry Creative Tools (Figma, Adobe Creative Cloud)",
            "Strong Aesthetic Eye & Visual Composition",
            "Receptive to Creative Feedback & Iteration",
        ],
        "potential_challenges": [
            "Subjective feedback from clients requiring multiple revision cycles",
            "Rapid pace of creative advertising project turnarounds",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "R",
        "personality_affinity": "INFP,ISFP,ENFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "interior-design",
        "name": {
            "en": "Interior Design & Space Architecture",
            "km": "ការរចនាផ្ទៃខាងក្នុង",
        },
        "category": "Architecture & Design",
        "description": {
            "en": "Focuses on commercial and residential interior planning, furniture design, lighting architecture, material specification, acoustics, and 3D interior spatial rendering.",
            "km": "ផ្តោតលើការរចនាប្លង់ខាងក្នុងនៃគេហដ្ឋាន និងអគារពាណិជ្ជកម្ម ការរចនាគ្រឿងសង្ហារិម ការរៀបចំប្រព័ន្ធពន្លឺ និងការជ្រើសរើសសម្ភារតុបតែងប្រកបដោយសោភ័ណភាព។",
        },
        "subjects_studied": [
            "Interior Space Planning & Ergonomics",
            "Color, Lighting & Acoustic Design",
            "Materials, Finishes & Millwork Detailing",
            "Furniture Design & Custom Joinery",
            "3D Photorealistic Interior Rendering (3ds Max, V-Ray, SketchUp)",
        ],
        "required_skills": [
            "Interior Spatial Layout Optimization",
            "Photorealistic 3D Material Rendering",
            "Material Sample Board Presentation",
        ],
        "potential_challenges": [
            "Coordinating complex subcontractor schedules during fit-out construction",
            "Managing client budget limitations against luxury interior material desires",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "R",
        "personality_affinity": "ISFP,ESFP,INFJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "fine-arts",
        "name": {
            "en": "Fine Arts & Traditional Sculpture/Painting",
            "km": "វិចិត្រសិល្បៈ និងគំនូរ/ចម្លាក់ប្រពៃណី",
        },
        "category": "Architecture & Design",
        "description": {
            "en": "Preserves and innovates classical Khmer mural painting, stone and wood sculpture, metal casting, ceramics, contemporary visual art, and cultural conservation.",
            "km": "ថែរក្សា និងច្នៃប្រឌិតសិល្បៈគំនូរបុរាណខ្មែរ ចម្លាក់ថ្ម និងឈើ សិល្បៈស្មូនស្មូន វិចិត្រសិល្បៈសហសម័យ និងការអភិរក្សបេតិកភណ្ឌវប្បធម៌ជាតិ។",
        },
        "subjects_studied": [
            "Traditional Khmer Art & Ornamentation Patterns (Kbach)",
            "Classical & Contemporary Oil/Acrylic Painting",
            "Stone Carving, Wood Sculpture & Metal Casting",
            "Ceramics & Pottery Craftsmanship",
            "Art History & Philosophy of Aesthetics",
        ],
        "required_skills": [
            "Fine Hand Craftsmanship & Traditional Technique",
            "Unique Creative Perspective & Expression",
            "Knowledge of Classical Khmer Mythological Themes",
        ],
        "potential_challenges": [
            "Building independent commercial success in art markets",
            "Demanding physical labor in sculpture and stone carving studios",
        ],
        "riasec_primary": "A",
        "riasec_secondary": "R",
        "personality_affinity": "ISFP,INFP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "archeology-cultural-heritage",
        "name": {
            "en": "Archaeology & Cultural Heritage Management",
            "km": "បុរាណវិទ្យា និងការគ្រប់គ្រងបេតិកភណ្ឌវប្បធម៌",
        },
        "category": "Law & Social Sciences",
        "description": {
            "en": "Covers archaeological excavation techniques, ancient temple stone conservation (Angkor/Sambor Prei Kuk), museum curation, cultural anthropology, and UNESCO World Heritage protection.",
            "km": "គ្របដណ្តប់លើបច្ចេកទេសកំណាយបុរាណវិទ្យា ការអភិរក្សថ្មប្រាសាទបុរាណ (អង្គរ សំបូរព្រៃគុក) ការគ្រប់គ្រងសារមន្ទីរ និងការការពារបេតិកភណ្ឌពិភពលោកយូណេស្កូ។",
        },
        "subjects_studied": [
            "Archaeological Field Methods & Excavation Techniques",
            "Prehistoric & Historic Southeast Asian Archaeology",
            "Stone & Monument Structural Conservation Science",
            "Museum Studies, Curatorial Practice & Artifact Cataloging",
            "Cultural Heritage Law & UNESCO Heritage Management",
        ],
        "required_skills": [
            "Field Archaeological Excavation & Stratigraphy Recording",
            "Stone Artifact Conservation & Restoration",
            "Historical Chronology & Ceramic Typology Analysis",
        ],
        "potential_challenges": [
            "Demanding physical fieldwork at remote forest temple ruins",
            "Precise, slow-paced physical restoration of fragile ancient artifacts",
        ],
        "riasec_primary": "I",
        "riasec_secondary": "R",
        "personality_affinity": "INTP,INFJ,ISTJ",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    },
    {
        "slug": "culinary-arts",
        "name": {
            "en": "Culinary Arts & Professional Kitchen Operations",
            "km": "សិល្បៈធ្វើម្ហូប និងការគ្រប់គ្រងផ្ទះបាយវិជ្ជាជីវៈ",
        },
        "category": "Business & Economics",
        "description": {
            "en": "Provides international standard culinary training in classical techniques, authentic Khmer royal gastronomy, pastry arts, kitchen cost control, food safety, and restaurant executive management.",
            "km": "បណ្តុះបណ្តាលសិល្បៈធ្វើម្ហូបកម្រិតអន្តរជាតិ (ស្តង់ដារស្វីស/បារាំង) ម្ហូបខ្មែរប្រណីត ការធ្វើនំ ការគ្រប់គ្រងថ្លៃដើមផ្ទះបាយ និងការគ្រប់គ្រងភោជនីយដ្ឋាន។",
        },
        "subjects_studied": [
            "Classical Culinary Techniques & Knife Skills",
            "Authentic Khmer Royal & Regional Gastronomy",
            "Pastry, Bakery & Confectionery Arts",
            "Kitchen Sanitation & HACCP Food Safety",
            "Menu Engineering, Recipe Costing & Purchasing",
        ],
        "required_skills": [
            "Flavor Profiling, Seasoning & Palate Sensitivity",
            "Speed, Organization & Precision Under Rush Hours",
            "Exemplary Kitchen Hygiene Standards",
        ],
        "potential_challenges": [
            "Fast-paced, high-temperature kitchen environment during peak dinner services",
            "Long shifts on feet, evening and weekend schedule requirements",
        ],
        "riasec_primary": "E",
        "riasec_secondary": "R",
        "personality_affinity": "ESTP,ESFP,ISTP",
        "is_stem": False,
        "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    },
]

# ==============================================================================
# UNIVERSITY FACULTIES DEFINITIONS
# ==============================================================================

FACULTIES_BY_UNIVERSITY: Dict[str, List[Dict[str, Any]]] = {
    "norton": [
        {"slug": "norton-arts-humanities", "name": {"en": "Faculty of Arts, Humanities and Languages", "km": "មហាវិទ្យាល័យសិល្បៈ មនុស្សសាស្ត្រ និងភាសា"}},
        {"slug": "norton-social-sciences", "name": {"en": "Faculty of Social Sciences", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រសង្គម"}},
        {"slug": "norton-sciences", "name": {"en": "Faculty of Sciences", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ"}},
        {"slug": "norton-health-sciences", "name": {"en": "Faculty of Health Sciences", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល"}},
    ],
    "rupp": [
        {"slug": "rupp-science", "name": {"en": "Faculty of Science", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ"}},
        {"slug": "rupp-engineering", "name": {"en": "Faculty of Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្ម"}},
        {"slug": "rupp-social-sciences", "name": {"en": "Faculty of Social Sciences & Humanities", "km": "មហាវិទ្យាល័យសង្គមសាស្ត្រ និងមនុស្សសាស្ត្រ"}},
        {"slug": "rupp-ifl", "name": {"en": "Institute of Foreign Languages (IFL)", "km": "វិទ្យាស្ថានភាសាបរទេស (IFL)"}},
        {"slug": "rupp-development", "name": {"en": "Faculty of Development Studies", "km": "មហាវិទ្យាល័យសិក្សាអភិវឌ្ឍន៍"}},
    ],
    "itc": [
        {"slug": "itc-civil", "name": {"en": "Faculty of Civil Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្មសំណង់ស៊ីវិល"}},
        {"slug": "itc-electrical", "name": {"en": "Faculty of Electrical Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្មអគ្គិសនី"}},
        {"slug": "itc-ict", "name": {"en": "Faculty of Information and Communication Technology", "km": "មហាវិទ្យាល័យបច្ចេកវិទ្យាព័ត៌មាន និងសារគមនាគមន៍"}},
        {"slug": "itc-chemical-food", "name": {"en": "Faculty of Chemical and Food Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្មគីមី និងអាហារ"}},
        {"slug": "itc-mechanical", "name": {"en": "Faculty of Mechanical Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្មមេកានិក"}},
        {"slug": "itc-rural", "name": {"en": "Faculty of Rural Engineering", "km": "មហាវិទ្យាល័យវិស្វកម្មជនបទ"}},
    ],
    "rule": [
        {"slug": "rule-law", "name": {"en": "Faculty of Law", "km": "មហាវិទ្យាល័យនីតិសាស្ត្រ"}},
        {"slug": "rule-economics", "name": {"en": "Faculty of Economics and Management", "km": "មហាវិទ្យាល័យសេដ្ឋកិច្ច និងការគ្រប់គ្រង"}},
        {"slug": "rule-public-admin", "name": {"en": "Faculty of Public Administration", "km": "មហាវិទ្យាល័យរដ្ឋបាលសាធារណៈ"}},
        {"slug": "rule-international", "name": {"en": "Center for International Programs (ELBBL & French Cooperation)", "km": "មជ្ឈមណ្ឌលកម្មវិធីអន្តរជាតិ (ELBBL និងកិច្ចសហប្រតិបត្តិការបារាំង)"}},
    ],
    "uhs": [
        {"slug": "uhs-medicine", "name": {"en": "Faculty of Medicine", "km": "មហាវិទ្យាល័យវេជ្ជសាស្ត្រ"}},
        {"slug": "uhs-pharmacy", "name": {"en": "Faculty of Pharmacy", "km": "មហាវិទ្យាល័យឱសថសាស្ត្រ"}},
        {"slug": "uhs-dentistry", "name": {"en": "Faculty of Dentistry", "km": "មហាវិទ្យាល័យទន្តវទ្យាសាស្ត្រ"}},
        {"slug": "uhs-public-health", "name": {"en": "Faculty of Public Health", "km": "មហាវិទ្យាល័យសុខភាពសាធារណៈ"}},
        {"slug": "uhs-tsmc", "name": {"en": "Technical School for Medical Care", "km": "សាលាបច្ចេកទេសថែទាំវេជ្ជសាស្រ្ត"}},
    ],
    "cadt": [
        {"slug": "cadt-idt", "name": {"en": "Institute of Digital Technology (IDT)", "km": "វិទ្យាស្ថានបច្ចេកវិទ្យាឌីជីថល"}},
        {"slug": "cadt-idg", "name": {"en": "Institute of Digital Governance (IDG)", "km": "វិទ្យាស្ថានអភិបាលកិច្ចឌីជីថល"}},
    ],
    "rufa": [
        {"slug": "rufa-architecture", "name": {"en": "Faculty of Architecture & Urbanism", "km": "មហាវិទ្យាល័យស្ថាបត្យកម្ម និងនគរូបនីយវិទ្យា"}},
        {"slug": "rufa-visual-arts", "name": {"en": "Faculty of Visual Arts", "km": "មហាវិទ្យាល័យសិល្បៈសូនរូប"}},
        {"slug": "rufa-archeology", "name": {"en": "Faculty of Archaeology", "km": "មហាវិទ្យាល័យបុរាណវិទ្យា"}},
    ],
    "rua": [
        {"slug": "rua-agronomy", "name": {"en": "Faculty of Agronomy", "km": "មហាវិទ្យាល័យក្សេត្រសាស្ត្រ"}},
        {"slug": "rua-animal", "name": {"en": "Faculty of Animal Science", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រសត្វ"}},
        {"slug": "rua-vet", "name": {"en": "Faculty of Veterinary Medicine", "km": "មហាវិទ្យាល័យវេជ្ជសាស្ត្រសត្វ"}},
        {"slug": "rua-fisheries", "name": {"en": "Faculty of Fisheries", "km": "មហាវិទ្យាល័យជលផល"}},
    ],
    "up": [
        {"slug": "up-health", "name": {"en": "Faculty of Medicine & Health Sciences", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល"}},
        {"slug": "up-pharmacy", "name": {"en": "Faculty of Pharmacy", "km": "មហាវិទ្យាល័យឱសថសាស្ត្រ"}},
        {"slug": "up-dentistry", "name": {"en": "Faculty of Dentistry", "km": "មហាវិទ្យាល័យទន្តសាស្ត្រ"}},
        {"slug": "up-tech", "name": {"en": "Faculty of Science & Technology", "km": "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា"}},
    ],
    "camed": [
        {"slug": "camed-accounting", "name": {"en": "Department of Professional Accounting & Finance", "km": "ដេប៉ាតឺម៉ង់គណនេយ្យ និងហិរញ្ញវត្ថុវិជ្ជាជីវៈ"}},
    ],
    "aib": [
        {"slug": "aib-banking", "name": {"en": "Faculty of Banking and Finance", "km": "មហាវិទ្យាល័យធនាគារ និងហិរញ្ញវត្ថុ"}},
        {"slug": "aib-business", "name": {"en": "Faculty of Business Administration", "km": "មហាវិទ្យាល័យគ្រប់គ្រងពាណិជ្ជកម្ម"}},
    ],
}

# ==============================================================================
# UNIVERSITY PROGRAM OFFERINGS (Calibrated with official published fee tables)
# ==============================================================================

OFFERINGS_MAP: Dict[str, List[Dict[str, Any]]] = {
    # CADT: $2,500/year (official annual tuition)
    "cadt": [
        {"major_slug": "software-engineering", "faculty_slug": "cadt-idt", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "faculty_slug": "cadt-idt", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "data-science-ai", "faculty_slug": "cadt-idt", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "cybersecurity-networking", "faculty_slug": "cadt-idt", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "e-commerce-logistics", "faculty_slug": "cadt-idg", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "fintech", "faculty_slug": "cadt-idg", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # CamEd Business School: $2,089/term x 2 terms = $4,178/year (Y1-2), $4,398 (Y3-4)
    "camed": [
        {"major_slug": "accounting-auditing", "faculty_slug": "camed-accounting", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4178.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "banking-finance", "faculty_slug": "camed-accounting", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4178.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "business-administration", "faculty_slug": "camed-accounting", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4178.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Vanda Institute: $650/year Bachelor, $650/year Associate, $800/year Master
    "vanda": [
        {"major_slug": "accounting-auditing", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "accounting-auditing", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # ACLEDA Institute of Business: $1,200/year Bachelor, $950/year Associate
    "aib": [
        {"major_slug": "banking-finance", "faculty_slug": "aib-banking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "accounting-auditing", "faculty_slug": "aib-banking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "fintech", "faculty_slug": "aib-banking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "risk-management-insurance", "faculty_slug": "aib-banking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "international-business", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "supply-chain-logistics", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "english-translation-interpreting", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "information-technology", "faculty_slug": "aib-business", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "banking-finance", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 950.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "accounting-auditing", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 950.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "supply-chain-logistics", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 950.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Norton University: General Arts $500/yr, Architecture & Civil & IT $540/yr, Health $800-$2,500/yr
    "norton": [
        {"major_slug": "architecture-urban-planning", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "interior-design", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "civil-engineering", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "water-environmental-engineering", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "computer-science", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "software-engineering", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "cybersecurity-networking", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "graphic-design-multimedia", "faculty_slug": "norton-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 540.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "general-medicine", "faculty_slug": "norton-health-sciences", "degree_level": "BACHELOR", "duration_years": 8.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "pharmacy", "faculty_slug": "norton-health-sciences", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 1500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "dentistry", "faculty_slug": "norton-health-sciences", "degree_level": "BACHELOR", "duration_years": 7.0, "tuition_annual_usd": 1800.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "faculty_slug": "norton-health-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "medical-laboratory", "faculty_slug": "norton-health-sciences", "degree_level": "ASSOCIATE", "duration_years": 3.0, "tuition_annual_usd": 700.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "faculty_slug": "norton-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "economics-development", "faculty_slug": "norton-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "faculty_slug": "norton-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "hospitality-tourism-management", "faculty_slug": "norton-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "faculty_slug": "norton-arts-humanities", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "international-relations", "faculty_slug": "norton-arts-humanities", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # University of Health Sciences (UHS): State public medical university fees
    "uhs": [
        {"major_slug": "general-medicine", "faculty_slug": "uhs-medicine", "degree_level": "BACHELOR", "duration_years": 8.0, "tuition_annual_usd": 2200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "pharmacy", "faculty_slug": "uhs-pharmacy", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 1800.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "dentistry", "faculty_slug": "uhs-dentistry", "degree_level": "BACHELOR", "duration_years": 7.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "public-health", "faculty_slug": "uhs-public-health", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "faculty_slug": "uhs-tsmc", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1000.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "medical-laboratory", "faculty_slug": "uhs-tsmc", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1100.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # The University of Puthisastra (UP): Calibrated with full admission table
    "up": [
        {"major_slug": "general-medicine", "faculty_slug": "up-health", "degree_level": "BACHELOR", "duration_years": 8.0, "tuition_annual_usd": 2400.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "dentistry", "faculty_slug": "up-dentistry", "degree_level": "BACHELOR", "duration_years": 7.0, "tuition_annual_usd": 2400.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "pharmacy", "faculty_slug": "up-pharmacy", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "faculty_slug": "up-health", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1676.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "faculty_slug": "up-health", "degree_level": "ASSOCIATE", "duration_years": 3.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "medical-laboratory", "faculty_slug": "up-health", "degree_level": "ASSOCIATE", "duration_years": 3.0, "tuition_annual_usd": 1200.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "psychology-counseling", "faculty_slug": "up-health", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1676.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "computer-science", "faculty_slug": "up-tech", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1800.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Royal University of Law and Economics (RULE): $580/yr National, $850/yr ELBBL, $750/yr French
    "rule": [
        {"major_slug": "law-jurisprudence", "faculty_slug": "rule-law", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "law-jurisprudence", "faculty_slug": "rule-international", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 850.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "public-administration", "faculty_slug": "rule-public-admin", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "banking-finance", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "accounting-auditing", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "economics-development", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "hospitality-tourism-management", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 580.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "information-technology", "faculty_slug": "rule-economics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "international-relations", "faculty_slug": "rule-international", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 700.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Institute of Technology of Cambodia (ITC): Standard $800/yr (with female incentive $650/yr), International English $2,500/yr
    "itc": [
        {"major_slug": "civil-engineering", "faculty_slug": "itc-civil", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "architecture-urban-planning", "faculty_slug": "itc-civil", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "electrical-electronic-engineering", "faculty_slug": "itc-electrical", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "mechanical-engineering", "faculty_slug": "itc-mechanical", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "telecommunication-engineering", "faculty_slug": "itc-ict", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "food-technology-engineering", "faculty_slug": "itc-chemical-food", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "chemistry-chemical-analysis", "faculty_slug": "itc-chemical-food", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "water-environmental-engineering", "faculty_slug": "itc-rural", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 800.0, "is_tuition_verified": True, "language_of_instruction": "FRENCH"},
        {"major_slug": "software-engineering", "faculty_slug": "itc-ict", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "faculty_slug": "itc-ict", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "data-science-ai", "faculty_slug": "itc-ict", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "cybersecurity-networking", "faculty_slug": "itc-ict", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Royal University of Phnom Penh (RUPP): Sciences $300, Social $250, DMC $650, IFL $500-$650, IT $550-$1,000
    "rupp": [
        {"major_slug": "biology-biotechnology", "faculty_slug": "rupp-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 300.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "chemistry-chemical-analysis", "faculty_slug": "rupp-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 300.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "mathematics-statistics", "faculty_slug": "rupp-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 300.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "physics-electronics", "faculty_slug": "rupp-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 300.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "environmental-science", "faculty_slug": "rupp-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 300.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "psychology-counseling", "faculty_slug": "rupp-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 250.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "sociology-social-work", "faculty_slug": "rupp-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 250.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "khmer-literature-linguistics", "faculty_slug": "rupp-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 250.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "media-communications", "faculty_slug": "rupp-social-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "faculty_slug": "rupp-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "software-engineering", "faculty_slug": "rupp-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "data-science-ai", "faculty_slug": "rupp-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "telecommunication-engineering", "faculty_slug": "rupp-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 700.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "faculty_slug": "rupp-ifl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "english-translation-interpreting", "faculty_slug": "rupp-ifl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "international-relations", "faculty_slug": "rupp-ifl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 850.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "asian-languages-culture", "faculty_slug": "rupp-ifl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "economics-development", "faculty_slug": "rupp-development", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # American University of Phnom Penh (AUPP): Single Degree $6,000/yr ($3,000/sem), Dual US Degree $9,000/yr ($4,500/sem)
    "aupp": [
        {"major_slug": "software-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 6000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "cybersecurity-networking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 6000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 6000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 6000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "international-relations", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 6000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 9000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "data-science-ai", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 9000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Paragon International University: Official Website Tuition Schedule
    # Engineering $4,500/yr ($2,250/sem), ICT $4,000/yr ($2,000/sem), Economics/Admin/IR $3,500/yr ($1,750/sem)
    "paragoniu": [
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "architecture-urban-planning", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "interior-design", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "management-information-systems", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "graphic-design-multimedia", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "supply-chain-logistics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "international-relations", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "mathematics-statistics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Cambodia University of Technology and Science (CamTech): 3 terms/yr. Eng $4,000/yr, Arts/Business $3,500/yr
    "camtech": [
        {"major_slug": "software-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "data-science-ai", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "cybersecurity-networking", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "mechatronics-robotics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "architecture-urban-planning", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "interior-design", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "risk-management-insurance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "media-communications", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 3500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # De Montfort University Cambodia (DMUC): Koh Pich British Campus $4,500 - $4,800/yr
    "dmuc": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "marketing-digital-media", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4800.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "graphic-design-multimedia", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4800.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Pannasastra University of Cambodia (PUC): Credit-based ~$795 - $930/year ($26.50/credit)
    "puc": [
        {"major_slug": "international-relations", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 795.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 795.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 795.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 795.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "media-communications", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 795.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Cambodian University for Specialties (CUS): $254/yr (Y1-2), $295/yr (Y3-4)
    "cus": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "accounting-auditing", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "marketing-digital-media", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "hospitality-tourism-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "computer-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 254.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # Royal University of Agriculture (RUA): $370/year across programs
    "rua": [
        {"major_slug": "agronomy-agricultural-sciences", "faculty_slug": "rua-agronomy", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 370.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "animal-science-veterinary", "faculty_slug": "rua-animal", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 370.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "animal-science-veterinary", "faculty_slug": "rua-vet", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 370.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "forestry-fisheries", "faculty_slug": "rua-fisheries", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 370.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "environmental-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 370.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # Prek Leap National Institute of Agriculture (PLNIA): $400/year ($200/semester)
    "plnia": [
        {"major_slug": "agronomy-agricultural-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "animal-science-veterinary", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "forestry-fisheries", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "food-technology-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Royal University of Fine Arts (RUFA): Archeology $400/yr, Architecture $600/yr, Visual Arts $500/yr
    "rufa": [
        {"major_slug": "architecture-urban-planning", "faculty_slug": "rufa-architecture", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "interior-design", "faculty_slug": "rufa-architecture", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "fine-arts", "faculty_slug": "rufa-visual-arts", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "graphic-design-multimedia", "faculty_slug": "rufa-visual-arts", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "archeology-cultural-heritage", "faculty_slug": "rufa-archeology", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # National Technical Training Institute (NTTI): Year 1 $395, Years 2-4 $450 - $500/yr
    "ntti": [
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "civil-engineering", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 395.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "electrical-electronic-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "mechanical-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "automotive-technology-mechanics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Preah Kossomak Polytechnic Institute (PKPI): $400/yr
    "pkpi": [
        {"major_slug": "electrical-electronic-engineering", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "civil-engineering", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "mechanical-engineering", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 400.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Academy of Culinary Arts Cambodia (ACAC): $3,900/yr
    "acac": [
        {"major_slug": "culinary-arts", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 3900.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "hospitality-tourism-management", "degree_level": "ASSOCIATE", "duration_years": 2.0, "tuition_annual_usd": 3900.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # National University of Management (NUM): $650/yr standard
    "num": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "marketing-digital-media", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "economics-development", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "supply-chain-logistics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "e-commerce-logistics", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # BELTEI International University: $600 - $750/yr
    "beltei": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "international-relations", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 700.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 700.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # Western University: $550 - $650/yr
    "western": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "computer-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Build Bright University (BBU): $510 - $600/yr
    "bbu": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 510.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 510.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 510.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 550.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # The University of Cambodia (UC): $810 - $1,100/yr
    "uc": [
        {"major_slug": "international-relations", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 810.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 810.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 810.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "media-communications", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 810.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 810.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # University of Economics and Finance (UEF): $500/yr
    "uef": [
        {"major_slug": "economics-development", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "accounting-auditing", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "marketing-digital-media", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "management-information-systems", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # International University (IU): Medicine $4,500/yr, Dentistry $4,500/yr, Pharmacy $3,400/yr
    "iu": [
        {"major_slug": "general-medicine", "degree_level": "BACHELOR", "duration_years": 8.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "dentistry", "degree_level": "BACHELOR", "duration_years": 7.0, "tuition_annual_usd": 4500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "pharmacy", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 3400.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "medical-laboratory", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # East Asia Management University (EAMU): $4,000/yr ($2,000/semester)
    "eamu": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "hospitality-tourism-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "marketing-digital-media", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 4000.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Panha Chiet University (PCU): $500/yr
    "pcu": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "political-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # Human Resource University (HRU): $480/yr
    "hru": [
        {"major_slug": "human-resource-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 480.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 480.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 480.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 480.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 480.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # National University of Battambang (NUBB): $450 - $500/yr
    "nubb": [
        {"major_slug": "agronomy-agricultural-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "computer-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "data-science-ai", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "architecture-urban-planning", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "psychology-counseling", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "hospitality-tourism-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # Svay Rieng University (SRU): $450/yr
    "sru": [
        {"major_slug": "agronomy-agricultural-sciences", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "english-teaching-tefl", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "public-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 450.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
    ],
    # Angkor University (Siem Reap): $600/yr general, $1,000/yr nursing
    "angkor": [
        {"major_slug": "hospitality-tourism-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "civil-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 650.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 600.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "public-health", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1000.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "nursing-science", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 1000.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
    # Kirirom Institute of Technology (KIT): $2,500/year (with sponsor scholarships)
    "kit": [
        {"major_slug": "software-engineering", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "hospitality-tourism-management", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
        {"major_slug": "architecture-urban-planning", "degree_level": "BACHELOR", "duration_years": 5.0, "tuition_annual_usd": 2500.0, "is_tuition_verified": True, "language_of_instruction": "ENGLISH"},
    ],
    # University of Management and Economics (UME): $500/yr
    "ume": [
        {"major_slug": "business-administration", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "banking-finance", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "economics-development", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
        {"major_slug": "law-jurisprudence", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "KHMER"},
        {"major_slug": "information-technology", "degree_level": "BACHELOR", "duration_years": 4.0, "tuition_annual_usd": 500.0, "is_tuition_verified": True, "language_of_instruction": "BILINGUAL"},
    ],
}


# ==============================================================================
# MAIN SYNC ROUTINE
# ==============================================================================

async def sync_majors_and_offerings(apply: bool = False) -> Dict[str, Any]:
    print("=" * 70)
    print("OrienX Cambodian Majors & Offerings Catalog Sync")
    print("=" * 70)

    async with AsyncSessionLocal() as db:
        # 1. Sync Majors
        print(f"\n[1/4] Syncing {len(CANONICAL_MAJORS)} Canonical Majors...")
        majors_created = 0
        majors_updated = 0
        major_obj_map: Dict[str, Major] = {}

        for m_data in CANONICAL_MAJORS:
            slug = m_data["slug"]
            existing = (
                await db.execute(select(Major).where(Major.slug == slug))
            ).scalar_one_or_none()

            if existing is None:
                major = Major(
                    slug=slug,
                    name=m_data["name"],
                    category=m_data["category"],
                    description=m_data["description"],
                    subjects_studied=m_data["subjects_studied"],
                    required_skills=m_data["required_skills"],
                    potential_challenges=m_data["potential_challenges"],
                    riasec_primary=m_data["riasec_primary"],
                    riasec_secondary=m_data["riasec_secondary"],
                    personality_affinity=m_data["personality_affinity"],
                    is_stem=m_data["is_stem"],
                    image_url=m_data["image_url"],
                )
                if apply:
                    db.add(major)
                major_obj_map[slug] = major
                majors_created += 1
                print(f"  + Created major: {slug} ({m_data['name']['en']})")
            else:
                existing.name = m_data["name"]
                existing.category = m_data["category"]
                existing.description = m_data["description"]
                existing.subjects_studied = m_data["subjects_studied"]
                existing.required_skills = m_data["required_skills"]
                existing.potential_challenges = m_data["potential_challenges"]
                existing.riasec_primary = m_data["riasec_primary"]
                existing.riasec_secondary = m_data["riasec_secondary"]
                existing.personality_affinity = m_data["personality_affinity"]
                existing.is_stem = m_data["is_stem"]
                if not existing.image_url:
                    existing.image_url = m_data["image_url"]
                major_obj_map[slug] = existing
                majors_updated += 1
                print(f"  ~ Updated major: {slug} ({m_data['name']['en']})")

        if apply:
            await db.commit()
            all_majors = (await db.execute(select(Major))).scalars().all()
            major_obj_map = {m.slug: m for m in all_majors}

        # 2. Sync Faculties
        print(f"\n[2/4] Syncing University Faculties...")
        all_unis = (await db.execute(select(University))).scalars().all()
        uni_obj_map = {u.slug: u for u in all_unis}
        faculties_created = 0
        faculty_obj_map: Dict[str, Faculty] = {}

        for uni_slug, fac_list in FACULTIES_BY_UNIVERSITY.items():
            uni = uni_obj_map.get(uni_slug)
            if not uni:
                continue

            for f_data in fac_list:
                f_slug = f_data["slug"]
                existing_f = (
                    await db.execute(
                        select(Faculty).where(
                            Faculty.university_id == uni.id,
                            Faculty.slug == f_slug,
                        )
                    )
                ).scalar_one_or_none()

                if existing_f is None:
                    fac = Faculty(
                        university_id=uni.id,
                        slug=f_slug,
                        name=f_data["name"],
                        description=f_data.get("description"),
                    )
                    if apply:
                        db.add(fac)
                    faculty_obj_map[f_slug] = fac
                    faculties_created += 1
                    print(f"  + Created faculty: {f_slug} for {uni_slug}")
                else:
                    existing_f.name = f_data["name"]
                    faculty_obj_map[f_slug] = existing_f

        if apply:
            await db.commit()
            all_facs = (await db.execute(select(Faculty))).scalars().all()
            faculty_obj_map = {f.slug: f for f in all_facs}

        # 3. Sync UniversityMajor Offerings
        print(f"\n[3/4] Syncing UniversityMajor Offerings...")
        offerings_created = 0
        offerings_updated = 0

        for uni_slug, offerings in OFFERINGS_MAP.items():
            uni = uni_obj_map.get(uni_slug)
            if not uni:
                print(f"  ! Warning: University {uni_slug} not found in DB")
                continue

            for off in offerings:
                m_slug = off["major_slug"]
                major = major_obj_map.get(m_slug)
                if not major:
                    print(f"  ! Warning: Major {m_slug} not found in major map")
                    continue

                f_slug = off.get("faculty_slug")
                faculty = faculty_obj_map.get(f_slug) if f_slug else None

                degree_level = off.get("degree_level", "BACHELOR")
                lang = off.get("language_of_instruction", "BILINGUAL")

                # Match candidate offering: first check with faculty & language to support multi-track programs (e.g. Khmer vs English tracks)
                query_conds = [
                    UniversityMajor.university_id == uni.id,
                    UniversityMajor.major_id == major.id,
                    UniversityMajor.degree_level == degree_level,
                ]
                if faculty:
                    query_conds.append(UniversityMajor.faculty_id == faculty.id)
                if lang:
                    query_conds.append(UniversityMajor.language_of_instruction == lang)

                matched = (
                    await db.execute(select(UniversityMajor).where(*query_conds))
                ).scalars().all()

                existing_um = matched[0] if matched else None
                if not existing_um:
                    # Fallback to university + major + degree_level
                    fallback = (
                        await db.execute(
                            select(UniversityMajor).where(
                                UniversityMajor.university_id == uni.id,
                                UniversityMajor.major_id == major.id,
                                UniversityMajor.degree_level == degree_level,
                            )
                        )
                    ).scalars().all()
                    if fallback:
                        existing_um = fallback[0]

                if existing_um is None:
                    um = UniversityMajor(
                        university_id=uni.id,
                        faculty_id=faculty.id if faculty else None,
                        major_id=major.id,
                        degree_level=degree_level,
                        duration_years=off.get("duration_years", 4.0),
                        tuition_annual_usd=off.get("tuition_annual_usd"),
                        is_tuition_verified=off.get("is_tuition_verified", False),
                        language_of_instruction=lang,
                        official_curriculum_url=uni.website_url,
                    )
                    if apply:
                        db.add(um)
                    offerings_created += 1
                else:
                    existing_um.faculty_id = faculty.id if faculty else existing_um.faculty_id
                    existing_um.duration_years = off.get("duration_years", existing_um.duration_years)
                    existing_um.tuition_annual_usd = off.get("tuition_annual_usd", existing_um.tuition_annual_usd)
                    existing_um.is_tuition_verified = off.get("is_tuition_verified", existing_um.is_tuition_verified)
                    existing_um.language_of_instruction = lang
                    existing_um.official_curriculum_url = uni.website_url
                    offerings_updated += 1

            print(f"  Synced {len(offerings)} offerings for {uni_slug} ({uni.name.get('en', '')})")

        if apply:
            await db.commit()

        # 4. Update University Table Tuition Ranges
        print(f"\n[4/4] Updating University table tuition ranges from verified offerings...")
        unis_updated_tuition = 0
        for uni in all_unis:
            uni_offerings = (
                await db.execute(
                    select(UniversityMajor).where(UniversityMajor.university_id == uni.id)
                )
            ).scalars().all()

            valid_tuitions = [
                float(o.tuition_annual_usd)
                for o in uni_offerings
                if o.tuition_annual_usd is not None and o.tuition_annual_usd > 0
            ]
            if valid_tuitions:
                uni.tuition_range_min_usd = min(valid_tuitions)
                uni.tuition_range_max_usd = max(valid_tuitions)
                uni.is_tuition_verified = True
                unis_updated_tuition += 1
                print(f"  + {uni.slug:12} : ${uni.tuition_range_min_usd:,.0f} - ${uni.tuition_range_max_usd:,.0f}/yr ({len(valid_tuitions)} programs)")

        if apply:
            await db.commit()

        stats = {
            "majors_created": majors_created,
            "majors_updated": majors_updated,
            "total_canonical_majors": len(CANONICAL_MAJORS),
            "faculties_created": faculties_created,
            "offerings_created": offerings_created,
            "offerings_updated": offerings_updated,
            "universities_with_verified_tuition": unis_updated_tuition,
        }
        print("\n" + "=" * 70)
        print(f"Sync Results (apply={apply}):")
        print(json.dumps(stats, indent=2))
        print("=" * 70)
        return stats


if __name__ == "__main__":
    apply_flag = "--apply" in sys.argv
    asyncio.run(sync_majors_and_offerings(apply=apply_flag))
