import asyncio
import uuid
from datetime import datetime, date, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, delete

from app.core.config import settings
from app.core.security import hash_password
from app.core.database import Base
from app.models.auth import Role, Permission, RolePermission, User, UserRole
from app.models.profile import StudentProfile
from app.models.catalog import University, Faculty, Major, UniversityMajor, Career, MajorCareer
from app.models.scholarship import Scholarship, ScholarshipMajor
from app.models.assessment import PersonalityQuestion, PersonalityOption, RiasecQuestion
from app.models.recommendation import RecommendationRule


async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)

    async with session_factory() as session:
        print("🌱 Seeding OrienX platform data...")

        # -----------------------------------------------------------------
        # 1. ROLES & PERMISSIONS
        # -----------------------------------------------------------------
        roles_data = [
            ("STUDENT", "Cambodian student exploring majors and careers"),
            ("ADMIN", "Institutional administrator managing catalog and rules"),
            ("SUPER_ADMIN", "System administrator with full platform control")
        ]
        roles_dict = {}
        for name, desc in roles_data:
            stmt = select(Role).where(Role.name == name)
            res = await session.execute(stmt)
            role = res.scalar_one_or_none()
            if not role:
                role = Role(name=name, description=desc)
                session.add(role)
                await session.flush()
            roles_dict[name] = role

        # Permissions
        perms_data = [
            ("profile:read_own", "profile", "Read own profile"),
            ("profile:write_own", "profile", "Update own profile"),
            ("assessments:take", "assessments", "Take personality and RIASEC tests"),
            ("recommendations:generate", "recommendations", "Generate major recommendations"),
            ("favorites:manage", "favorites", "Bookmark content"),
            ("catalog:read", "catalog", "Browse universities and majors"),
            ("catalog:manage", "catalog", "Manage universities and majors"),
            ("scholarships:manage", "scholarships", "Manage scholarships"),
            ("questions:manage", "assessments", "Manage assessment questions"),
            ("rules:manage", "recommendations", "Configure recommendation rules"),
            ("analytics:read", "admin", "View system analytics"),
            ("users:manage", "admin", "Manage user accounts"),
            ("audit_logs:read", "admin", "View administrative audit logs"),
        ]
        for code, module, desc in perms_data:
            stmt = select(Permission).where(Permission.code == code)
            res = await session.execute(stmt)
            perm = res.scalar_one_or_none()
            if not perm:
                perm = Permission(code=code, module=module, description=desc)
                session.add(perm)

        await session.flush()

        # -----------------------------------------------------------------
        # 2. SEED INITIAL USERS
        # -----------------------------------------------------------------
        users_to_create = [
            ("superadmin@futera.edu.kh", "SuperAdminPass123!", "SUPER_ADMIN", "Dara Superadmin", "ដារ៉ា អភិបាលជាន់ខ្ពស់"),
            ("admin@futera.edu.kh", "AdminPass123!", "ADMIN", "Sokha Admin", "សុខា អភិបាល"),
            ("student@futera.edu.kh", "StudentPass123!", "STUDENT", "Vireak Bot", "វីរៈ បុត្រ")
        ]

        for email, password, role_name, full_name_en, full_name_km in users_to_create:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            user = res.scalar_one_or_none()
            if not user:
                hashed = hash_password(password)
                user = User(
                    email=email,
                    password_hash=hashed,
                    status="ACTIVE",
                    is_email_verified=True,
                    roles=[roles_dict[role_name]]
                )
                session.add(user)
                await session.flush()

                profile = StudentProfile(
                    user_id=user.id,
                    full_name_en=full_name_en,
                    full_name_km=full_name_km,
                    province="Phnom Penh",
                    current_education_level="GRADE_12",
                    graduation_year=2026,
                    preferred_language="km",
                    high_school="Hun Sen Bak Touk High School"
                )
                session.add(profile)

        await session.flush()

        # -----------------------------------------------------------------
        # 3. VERIFIED CAMBODIAN UNIVERSITIES
        # -----------------------------------------------------------------
        universities_data = [
            {
                "slug": "rupp",
                "name": {"en": "Royal University of Phnom Penh", "km": "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ"},
                "acronym": {"en": "RUPP", "km": "ស.ភ.ភ"},
                "description": {
                    "en": "Cambodia's oldest and largest public university, founded in 1960. Renowned for science, foreign languages (IFL), engineering, and social sciences.",
                    "km": "សាកលវិទ្យាល័យរដ្ឋចំណាស់ជាងគេ និងធំជាងគេនៅកម្ពុជា បង្កើតឡើងក្នុងឆ្នាំ ១៩៦០ ដែលល្បីល្បាញលើផ្នែកវិទ្យាសាស្ត្រ ភាសាបរទេស (IFL) វិស្វកម្ម និងវិទ្យាសាស្ត្រសង្គម។"
                },
                "university_type": "PUBLIC",
                "province": "Phnom Penh",
                "address": {
                    "en": "Russian Federation Boulevard, Toul Kork, Phnom Penh",
                    "km": "មហាវិថីសហព័ន្ធរុស្ស៊ី ខណ្ឌទួលគោក រាជធានីភ្នំពេញ"
                },
                "website_url": "http://www.rupp.edu.kh",
                "contact_email": "info@rupp.edu.kh",
                "contact_phone": "+855 23 883 640",
                "established_year": 1960,
                "tuition_range_min_usd": 250.00,
                "tuition_range_max_usd": 900.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School Diploma (BacII)", "Pass Entrance Examination for Computer Science & Engineering"],
                    "km": ["សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប)", "ប្រឡងជាប់ការប្រឡងជ្រើសរើសសម្រាប់មុខវិជ្ជាព័ត៌មានវិទ្យា និងវិស្វកម្ម"]
                },
                "facilities": {
                    "en": ["National Library", "STEM Labs", "Sports Grounds", "Auditorium", "Language Labs"],
                    "km": ["បណ្ណាល័យជាតិ", "មន្ទីរពិសោធន៍ STEM", "ទីលានកីឡា", "សាលមហោស្រព", "បន្ទប់ភាសា"]
                }
            },
            {
                "slug": "itc",
                "name": {"en": "Institute of Technology of Cambodia", "km": "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា"},
                "acronym": {"en": "ITC", "km": "តិចណូ"},
                "description": {
                    "en": "Cambodia's premier public higher education institution in engineering, technology, and applied sciences since 1964. Accredited with international engineer qualifications.",
                    "km": "គ្រឹះស្ថានឧត្តមសិក្សាសាធារណៈឈានមុខគេរបស់កម្ពុជាលើជំនាញវិស្វកម្ម បច្ចេកវិទ្យា និងវិទ្យាសាស្ត្រអនុវត្ត តាំងពីឆ្នាំ ១៩៦៤។"
                },
                "university_type": "PUBLIC",
                "province": "Phnom Penh",
                "address": {
                    "en": "PO Box 86, Russian Federation Blvd, Phnom Penh",
                    "km": "ប្រអប់សំបុត្រ ៨៦ មហាវិថីសហព័ន្ធរុស្ស៊ី រាជធានីភ្នំពេញ"
                },
                "website_url": "https://itc.edu.kh",
                "contact_email": "info@itc.edu.kh",
                "contact_phone": "+855 23 880 370",
                "established_year": 1964,
                "tuition_range_min_usd": 600.00,
                "tuition_range_max_usd": 1500.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School Diploma with Math/Physics focus", "Mandatory ITC National Entrance Exam"],
                    "km": ["សញ្ញាបត្របាក់ឌុប (ផ្តោតលើគណិត/រូបវិទ្យា)", "ការប្រឡងចូលថ្នាក់ជាតិប្រចាំវិទ្យាស្ថានតិចណូ"]
                },
                "facilities": {
                    "en": ["Advanced Electronics Labs", "Robotics Research Center", "Civil Engineering Wind Tunnel", "CAD Center"],
                    "km": ["មន្ទីរពិសោធន៍អេឡិចត្រូនិកទំនើប", "មជ្ឈមណ្ឌលស្រាវជ្រាវមនុស្សយន្ត", "មន្ទីរពិសោធន៍សំណង់ស៊ីវិល"]
                }
            },
            {
                "slug": "aupp",
                "name": {"en": "American University of Phnom Penh", "km": "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ"},
                "acronym": {"en": "AUPP", "km": "អេយូប៊ីភី"},
                "description": {
                    "en": "A premier private university providing U.S.-accredited dual and single-degree programs in partnership with the University of Arizona and Fort Hays State University.",
                    "km": "សាកលវិទ្យាល័យឯកជនកម្រិតស្តង់ដារអន្តរជាតិ ដែលផ្តល់កម្មវិធីសិក្សាសញ្ញាបត្រទ្វេភាគីជាមួយសាកលវិទ្យាល័យលំដាប់កំពូលនៅសហរដ្ឋអាមេរិក។"
                },
                "university_type": "PRIVATE",
                "province": "Phnom Penh",
                "address": {
                    "en": "278H Street 201R, Kroalkor Village, Russey Keo, Phnom Penh",
                    "km": "ផ្លូវ ២០១R ភូមិក្រោលគោ សង្កាត់គីឡូម៉ែត្រលេខ៦ ខណ្ឌឫស្សីកែវ រាជធានីភ្នំពេញ"
                },
                "website_url": "https://www.aupp.edu.kh",
                "contact_email": "info@aupp.edu.kh",
                "contact_phone": "+855 23 990 023",
                "established_year": 2013,
                "tuition_range_min_usd": 6000.00,
                "tuition_range_max_usd": 9000.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School Diploma (BacII or Equivalent)", "English Proficiency Test (IELTS 6.0 or AUPP Placement)"],
                    "km": ["សញ្ញាបត្របាក់ឌុប ឬសមមូល", "តេស្តសមត្ថភាពភាសាអង់គ្លេស (IELTS 6.0 ឬតេស្តផ្ទាល់របស់ AUPP)"]
                },
                "facilities": {
                    "en": ["State-of-the-art Digital Classrooms", "Innovation Center", "Modern Cafeteria", "Makerspace"],
                    "km": ["បន្ទប់រៀនឌីជីថលទំនើប", "មជ្ឈមណ្ឌលនវានុវត្តន៍", "បណ្ណាល័យអន្តរជាតិ"]
                }
            },
            {
                "slug": "paragoniu",
                "name": {"en": "Paragon International University", "km": "សាកលវិទ្យាល័យអន្តរជាតិផារ៉ាហ្គន"},
                "acronym": {"en": "ParagonIU", "km": "ផារ៉ាហ្គន"},
                "description": {
                    "en": "A recognized private university specialized in engineering, architecture, computer science, and business, with English-only instruction.",
                    "km": "សាកលវិទ្យាល័យឯកជនឈានមុខគេមួយលើជំនាញវិស្វកម្ម ស្ថាបត្យកម្ម វិទ្យាសាស្ត្រកុំព្យូទ័រ និងធុរកិច្ច ដោយបង្រៀនជាភាសាអង់គ្លេសទាំងស្រុង។"
                },
                "university_type": "PRIVATE",
                "province": "Phnom Penh",
                "address": {
                    "en": "No. 8, St. 315, Boeng Kak 1, Tuol Kork, Phnom Penh",
                    "km": "លេខ ៨ ផ្លូវ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ"
                },
                "website_url": "https://paragoniu.edu.kh",
                "contact_email": "info@paragoniu.edu.kh",
                "contact_phone": "+855 23 996 111",
                "established_year": 2010,
                "tuition_range_min_usd": 2500.00,
                "tuition_range_max_usd": 3500.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School Diploma", "ParagonIU English Proficiency & Math Exam"],
                    "km": ["សញ្ញាបត្របាក់ឌុប", "ការប្រឡងតេស្តភាសាអង់គ្លេស និងគណិតវិទ្យា"]
                },
                "facilities": {
                    "en": ["Architecture Studios", "Computer Labs", "Campus Library", "Student Lounges"],
                    "km": ["ស្ទូឌីយោស្ថាបត្យកម្ម", "បន្ទប់កុំព្យូទ័រ", "បណ្ណាល័យ", "កន្លែងសម្រាកសិស្ស"]
                }
            },
            {
                "slug": "num",
                "name": {"en": "National University of Management", "km": "សាកលវិទ្យាល័យជាតិគ្រប់គ្រង"},
                "acronym": {"en": "NUM", "km": "ស.ជ.គ"},
                "description": {
                    "en": "The leading public business and management university in Cambodia, offering programs in business administration, digital economy, finance, and law.",
                    "km": "សាកលវិទ្យាល័យសាធារណៈឈានមុខគេផ្នែកធុរកិច្ច និងការគ្រប់គ្រងនៅកម្ពុជា ផ្តល់ការបណ្តុះបណ្តាលលើរដ្ឋបាលពាណិជ្ជកម្ម សេដ្ឋកិច្ចឌីជីថល និងហិរញ្ញវត្ថុ។"
                },
                "university_type": "PUBLIC",
                "province": "Phnom Penh",
                "address": {
                    "en": "St. 96, Wat Phnom, Daun Penh, Phnom Penh",
                    "km": "ផ្លូវលេខ ៩៦ សង្កាត់វត្តភ្នំ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ"
                },
                "website_url": "https://www.num.edu.kh",
                "contact_email": "info@num.edu.kh",
                "contact_phone": "+855 23 428 120",
                "established_year": 1983,
                "tuition_range_min_usd": 450.00,
                "tuition_range_max_usd": 1400.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School BacII Diploma", "Interview for International BBA Programs"],
                    "km": ["សញ្ញាបត្របាក់ឌុប", "សម្ភាសន៍សម្រាប់កម្មវិធីអន្តរជាតិ BBA"]
                },
                "facilities": {
                    "en": ["Digital Innovation Lab", "Incubation Center", "Auditorium", "Business Library"],
                    "km": ["មន្ទីរពិសោធន៍នវានុវត្តន៍ឌីជីថល", "មជ្ឈមណ្ឌលបណ្តុះធុរកិច្ចថ្មី"]
                }
            },
            {
                "slug": "cadt",
                "name": {"en": "Cambodia Academy of Digital Technology", "km": "បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា"},
                "acronym": {"en": "CADT", "km": "ប.ប.ឌ.ក"},
                "description": {
                    "en": "Cambodia's flagship national digital academy under MPTC, leading higher education and research in Artificial Intelligence, Software Engineering, Cybersecurity, and Data Science.",
                    "km": "បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលជាតិឈានមុខគេក្រោមឱវាទក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ (MPTC) បណ្តុះបណ្តាលលើបញ្ញាសិប្បនិម្មិត (AI) វិស្វកម្មសូហ្វវែរ សុវត្ថិភាពអ៊ីនធឺណិត និងវិទ្យាសាស្ត្រទិន្នន័យ។"
                },
                "university_type": "PUBLIC",
                "province": "Phnom Penh",
                "address": {
                    "en": "National Road 6A, Prek Leap, Chroy Changvar, Phnom Penh",
                    "km": "ផ្លូវជាតិលេខ ៦A សង្កាត់ព្រែកលៀប ខណ្ឌជ្រោយចង្វារ រាជធានីភ្នំពេញ"
                },
                "website_url": "https://www.cadt.edu.kh",
                "contact_email": "info@cadt.edu.kh",
                "contact_phone": "+855 23 999 501",
                "established_year": 2014,
                "tuition_range_min_usd": 1000.00,
                "tuition_range_max_usd": 1500.00,
                "is_tuition_verified": True,
                "is_verified": True,
                "admission_requirements": {
                    "en": ["High School BacII Diploma", "CADT National Digital Talent Entrance Exam & Interview"],
                    "km": ["សញ្ញាបត្របាក់ឌុប", "ការប្រឡងជ្រើសរើសអាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ"]
                },
                "facilities": {
                    "en": ["AI & Robotics Innovation Hub", "Cybersecurity Cyber Range", "Makerspace & IoT Lab", "Modern Smart Classrooms"],
                    "km": ["មជ្ឈមណ្ឌលនវានុវត្តន៍ AI និងមនុស្សយន្ត", "មន្ទីរពិសោធន៍សុវត្ថិភាពអ៊ីនធឺណិត Cyber Range", "បន្ទប់ពិសោធន៍ IoT"]
                }
            }
        ]

        unis_dict = {}
        for u_data in universities_data:
            stmt = select(University).where(University.slug == u_data["slug"])
            res = await session.execute(stmt)
            uni = res.scalar_one_or_none()
            if not uni:
                uni = University(**u_data)
                session.add(uni)
                await session.flush()
            unis_dict[u_data["slug"]] = uni

        # -----------------------------------------------------------------
        # 4. MAJORS
        # -----------------------------------------------------------------
        majors_data = [
            {
                "slug": "software-engineering",
                "name": {"en": "Software Engineering & Computer Science", "km": "វិទ្យាសាស្ត្រកុំព្យូទ័រ និងវិស្វកម្មកម្មវិធី"},
                "category": "Information Technology",
                "description": {
                    "en": "Focuses on software architecture, algorithms, cloud computing, database engineering, and full-stack development to build modern digital products.",
                    "km": "ផ្តោតលើស្ថាបត្យកម្មកម្មវិធី ក្បួនដោះស្រាយ (Algorithms) កុំព្យូទ័រពពក (Cloud) និងការអភិវឌ្ឍប្រព័ន្ធឌីជីថលទំនើប។"
                },
                "subjects_studied": ["Data Structures & Algorithms", "Full-Stack Web & Mobile", "Database Systems", "Software Architecture", "DevOps & Cloud"],
                "required_skills": ["Logical Reasoning", "Problem Solving", "Mathematics", "Code Design"],
                "potential_challenges": ["Rapidly evolving technologies", "Abstract conceptual problem-solving", "Deep independent debugging"],
                "riasec_primary": "I",
                "riasec_secondary": "R",
                "personality_affinity": "INTJ,INTP,ISTJ,ENTP",
                "is_stem": True
            },
            {
                "slug": "data-science-ai",
                "name": {"en": "Data Science & Artificial Intelligence", "km": "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត"},
                "category": "Information Technology",
                "description": {
                    "en": "Covers statistics, machine learning algorithms, big data analysis, predictive modeling, and intelligent agent systems.",
                    "km": "សិក្សាអំពីស្ថិតិ ក្បួនដោះស្រាយការរៀនរបស់ម៉ាស៊ីន (Machine Learning) ការវិភាគទិន្នន័យធំៗ និងប្រព័ន្ធបញ្ញាសិប្បនិម្មិត។"
                },
                "subjects_studied": ["Applied Statistics & Probability", "Machine Learning & Deep Learning", "Big Data Analytics", "Python & SQL", "Natural Language Processing"],
                "required_skills": ["Advanced Mathematical Modeling", "Python Programming", "Analytical Thinking"],
                "potential_challenges": ["Heavy mathematical rigor", "Data cleaning complexity"],
                "riasec_primary": "I",
                "riasec_secondary": "C",
                "personality_affinity": "INTP,INTJ,ISTJ",
                "is_stem": True
            },
            {
                "slug": "business-administration",
                "name": {"en": "Business Administration & Management", "km": "រដ្ឋបាលពាណិជ្ជកម្ម និងការគ្រប់គ្រង"},
                "category": "Business & Economics",
                "description": {
                    "en": "Equips students with leadership, organizational planning, marketing strategies, entrepreneurship, and financial management skills.",
                    "km": "បំពាក់បំប៉នជំនាញភាពជាអ្នកដឹកនាំ ការធ្វើផែនការស្ថាប័ន យុទ្ធសាស្ត្រទីផ្សារ សហគ្រិនភាព និងការគ្រប់គ្រងហិរញ្ញវត្ថុ។"
                },
                "subjects_studied": ["Principles of Management", "Marketing Strategy", "Financial Accounting", "Operations & Supply Chain", "Business Law"],
                "required_skills": ["Strategic Planning", "Communication", "Leadership", "Negotiation"],
                "potential_challenges": ["High market competition", "Cross-functional team coordination"],
                "riasec_primary": "E",
                "riasec_secondary": "S",
                "personality_affinity": "ENTJ,ESTJ,ENFJ,ESFJ",
                "is_stem": False
            },
            {
                "slug": "banking-finance",
                "name": {"en": "Banking & Finance", "km": "ធនាគារ និងហិរញ្ញវត្ថុ"},
                "category": "Business & Economics",
                "description": {
                    "en": "Focuses on capital markets, investment banking, risk management, FinTech, microfinance, and commercial banking operations in Cambodia.",
                    "km": "ផ្តោតលើទីផ្សារមូលធន ការវិនិយោគ ការគ្រប់គ្រងហានិភ័យ បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech) និងប្រតិបត្តិការធនាគារនៅកម្ពុជា។"
                },
                "subjects_studied": ["Corporate Finance", "Investment Analysis", "Commercial Banking", "Financial Modeling", "FinTech Systems"],
                "required_skills": ["Quantitative Analysis", "Financial Risk Assessment", "Attention to Detail"],
                "potential_challenges": ["Strict regulatory frameworks", "High stakes and precision demands"],
                "riasec_primary": "C",
                "riasec_secondary": "E",
                "personality_affinity": "ESTJ,ISTJ,INTJ",
                "is_stem": False
            },
            {
                "slug": "civil-engineering",
                "name": {"en": "Civil Engineering & Structural Design", "km": "វិស្វកម្មសំណង់ស៊ីវិល"},
                "category": "Engineering",
                "description": {
                    "en": "Covers structural engineering, bridges, highways, geotechnical assessment, urban infrastructure design, and construction project management.",
                    "km": "សិក្សាពីការរចនា និងគណនាគ្រឿងផ្គុំសំណង់ ស្ពាន ផ្លូវថ្នល់ ភូមិសាស្ត្រដី និងការគ្រប់គ្រងគម្រោងសាងសង់ហេដ្ឋារចនាសម្ព័ន្ធ។"
                },
                "subjects_studied": ["Structural Mechanics", "Reinforced Concrete", "Soil Mechanics & Foundations", "Surveying & CAD", "Construction Management"],
                "required_skills": ["Spatial Reasoning", "Advanced Physics", "Site Management", "Safety Compliance"],
                "potential_challenges": ["On-site environmental demands", "Zero-tolerance for safety errors"],
                "riasec_primary": "R",
                "riasec_secondary": "I",
                "personality_affinity": "ISTP,ESTJ,INTJ",
                "is_stem": True
            },
            {
                "slug": "international-relations",
                "name": {"en": "International Relations & Diplomacy", "km": "ទំនាក់ទំនងអន្តរជាតិ និងការទូត"},
                "category": "Social Sciences",
                "description": {
                    "en": "Examines geopolitics, international law, diplomatic negotiation, global economic cooperation, ASEAN affairs, and conflict resolution.",
                    "km": "ពិនិត្យមើលភូមិសាស្ត្រនយោបាយ ច្បាប់អន្តរជាតិ ការចរចាការទូត កិច្ចសហប្រតិបត្តិការអាស៊ាន និងការដោះស្រាយជម្លោះអន្តរជាតិ។"
                },
                "subjects_studied": ["Diplomatic History", "International Public Law", "Foreign Policy Analysis", "ASEAN Studies", "Global Political Economy"],
                "required_skills": ["Public Speaking", "Analytical Writing", "Diplomatic Tact", "Critical Thinking"],
                "potential_challenges": ["Complex subjective geopolitical dynamics", "High requirement for multilingual fluency"],
                "riasec_primary": "S",
                "riasec_secondary": "E",
                "personality_affinity": "ENFJ,ENTJ,INFJ,INFP",
                "is_stem": False
            }
        ]

        majors_dict = {}
        for m_data in majors_data:
            stmt = select(Major).where(Major.slug == m_data["slug"])
            res = await session.execute(stmt)
            maj = res.scalar_one_or_none()
            if not maj:
                maj = Major(**m_data)
                session.add(maj)
                await session.flush()
            majors_dict[m_data["slug"]] = maj

        # -----------------------------------------------------------------
        # 5. UNIVERSITY MAJORS (OFFERINGS & TUITION)
        # -----------------------------------------------------------------
        offerings_data = [
            ("rupp", "software-engineering", 450.00, True, 4.0, "BACHELOR"),
            ("rupp", "international-relations", 400.00, True, 4.0, "BACHELOR"),
            ("rupp", "civil-engineering", 600.00, True, 4.0, "BACHELOR"),
            ("itc", "software-engineering", 650.00, True, 5.0, "BACHELOR"),
            ("itc", "civil-engineering", 750.00, True, 5.0, "BACHELOR"),
            ("aupp", "software-engineering", 6000.00, True, 4.0, "BACHELOR"),
            ("aupp", "business-administration", 6000.00, True, 4.0, "BACHELOR"),
            ("paragoniu", "software-engineering", 2800.00, True, 4.0, "BACHELOR"),
            ("paragoniu", "civil-engineering", 3000.00, True, 4.0, "BACHELOR"),
            ("paragoniu", "business-administration", 2600.00, True, 4.0, "BACHELOR"),
            ("num", "business-administration", 550.00, True, 4.0, "BACHELOR"),
            ("num", "banking-finance", 600.00, True, 4.0, "BACHELOR"),
        ]

        for u_slug, m_slug, tuition, verified, duration, degree in offerings_data:
            uni = unis_dict[u_slug]
            maj = majors_dict[m_slug]
            stmt = select(UniversityMajor).where(
                UniversityMajor.university_id == uni.id,
                UniversityMajor.major_id == maj.id
            )
            res = await session.execute(stmt)
            um = res.scalar_one_or_none()
            if not um:
                um = UniversityMajor(
                    university_id=uni.id,
                    major_id=maj.id,
                    degree_level=degree,
                    duration_years=duration,
                    tuition_annual_usd=tuition,
                    is_tuition_verified=verified,
                    language_of_instruction="BILINGUAL" if u_slug in ["rupp", "num"] else "ENGLISH"
                )
                session.add(um)

        # -----------------------------------------------------------------
        # 6. CAREERS & MAJOR LINKS
        # -----------------------------------------------------------------
        careers_data = [
            {
                "slug": "software-engineer",
                "title": {"en": "Software Engineer", "km": "វិស្វករកម្មវិធី"},
                "industry": "Technology",
                "description": {
                    "en": "Designs, writes, tests, and maintains software applications for cloud platforms, mobile devices, and enterprise systems.",
                    "km": "រចនា សរសេរកូដ និងថែទាំប្រព័ន្ធកម្មវិធីកុំព្យូទ័រ និងទូរស័ព្ទដៃសម្រាប់ស្ថាប័ននានា។"
                },
                "responsibilities": ["Develop clean, tested code", "Design backend APIs and database schemas", "Collaborate with UI/UX designers"],
                "required_skills": ["Python / JavaScript / Go", "SQL & Database Design", "Git & Problem Solving"],
                "education_level": "BACHELOR",
                "work_environments": ["Tech Companies", "Startups", "Remote / Hybrid"],
                "career_progression": ["Junior Developer -> Mid-Level -> Senior Engineer -> Tech Lead / Software Architect"],
                "riasec_code": "IRE",
                "majors": ["software-engineering", "data-science-ai"]
            },
            {
                "slug": "financial-analyst",
                "title": {"en": "Financial Analyst", "km": "អ្នកវិភាគហិរញ្ញវត្ថុ"},
                "industry": "Finance & Banking",
                "description": {
                    "en": "Evaluates financial data, forecasts corporate performance, builds financial models, and provides investment guidance.",
                    "km": "វិភាគទិន្នន័យហិរញ្ញវត្ថុ ព្យាករណ៍ចំណូលចំណាយ និងផ្តល់អនុសាសន៍លើការវិនិយោគដល់ក្រុមហ៊ុន ឬធនាគារ។"
                },
                "responsibilities": ["Build Excel DCF models", "Assess market risks and balance sheets", "Draft investment memorandums"],
                "required_skills": ["Financial Modeling", "Corporate Accounting", "Data Analytics"],
                "education_level": "BACHELOR",
                "work_environments": ["Commercial Banks", "Investment Funds", "Corporate Finance Offices"],
                "career_progression": ["Junior Analyst -> Senior Financial Analyst -> Finance Manager -> CFO"],
                "riasec_code": "CEI",
                "majors": ["banking-finance", "business-administration"]
            },
            {
                "slug": "civil-engineer",
                "title": {"en": "Civil & Structural Engineer", "km": "វិស្វករសំណង់ស៊ីវិល"},
                "industry": "Engineering & Construction",
                "description": {
                    "en": "Plans, calculates, designs, and oversees construction projects such as high-rise buildings, bridges, and municipal infrastructure.",
                    "km": "រៀបចំផែនការ គណនាគ្រឿងផ្គុំ និងត្រួតពិនិត្យការសាងសង់អគារ ស្ពាន ថ្នល់ និងហេដ្ឋារចនាសម្ព័ន្ធ។"
                },
                "responsibilities": ["Calculate structural loads", "Review architectural blueprints with AutoCAD", "Inspect on-site concrete and steel quality"],
                "required_skills": ["AutoCAD / Revit", "Structural Calculations", "Site Project Supervision"],
                "education_level": "BACHELOR",
                "work_environments": ["Construction Sites", "Engineering Design Firms", "Ministry of Public Works"],
                "career_progression": ["Site Engineer -> Project Engineer -> Structural Design Lead -> Project Director"],
                "riasec_code": "RIC",
                "majors": ["civil-engineering"]
            }
        ]

        for c_data in careers_data:
            stmt = select(Career).where(Career.slug == c_data["slug"])
            res = await session.execute(stmt)
            career = res.scalar_one_or_none()
            if not career:
                maj_slugs = c_data.pop("majors")
                career = Career(**c_data)
                session.add(career)
                await session.flush()
                for m_slug in maj_slugs:
                    if m_slug in majors_dict:
                        mc = MajorCareer(career_id=career.id, major_id=majors_dict[m_slug].id)
                        session.add(mc)

        # -----------------------------------------------------------------
        # 7. SCHOLARSHIPS
        # -----------------------------------------------------------------
        scholarships_data = [
            {
                "slug": "moeys-national-scholarship",
                "title": {
                    "en": "MoEYS National University Scholarship",
                    "km": "អាហារូបករណ៍ថ្នាក់ជាតិនៃក្រសួងអប់រំ យុវជន និងកីឡា"
                },
                "provider": {"en": "Ministry of Education, Youth and Sport (MoEYS)", "km": "ក្រសួងអប់រំ យុវជន និងកីឡា"},
                "description": {
                    "en": "100% full-tuition government scholarship awarded annually to top-performing Grade 12 BacII graduates across Cambodian state universities.",
                    "km": "អាហារូបករណ៍រដ្ឋ ១០០% ផ្តល់ជូនសិស្សនិទ្ទេស A, B, C ដែលប្រឡងជាប់សញ្ញាបត្របាក់ឌុបឆ្នើម ដើម្បីសិក្សានៅសាកលវិទ្យាល័យរដ្ឋ។"
                },
                "eligibility_criteria": {
                    "en": ["Cambodian Citizen", "Grade 12 BacII Exam Passer (Grade A, B, or C)", "High national rank"],
                    "km": ["សញ្ជាតិខ្មែរ", "ប្រឡងជាប់បាក់ឌុប (និទ្ទេស A, B, ឬ C)", "ពិន្ទុចំណាត់ថ្នាក់ខ្ពស់"]
                },
                "coverage_type": "FULL_TUITION",
                "coverage_percentage": 100,
                "country_or_institution": "Cambodia",
                "application_deadline": date(2026, 12, 15),
                "application_process": {
                    "en": ["Apply through High School Principal or Provincial Department of Education", "Submit BacII result slip"],
                    "km": ["ដាក់ពាក្យតាមរយៈវិទ្យាល័យ ឬមន្ទីរអប់រំខេត្ត", "ភ្ជាប់មកជាមួយនូវលិខិតបញ្ជាក់ពិន្ទុបាក់ឌុប"]
                },
                "official_url": "http://www.moeys.gov.kh",
                "source_name": "MoEYS Higher Education Portal",
                "last_verified_at": date(2026, 10, 1),
                "is_verified": True
            },
            {
                "slug": "aupp-merit-scholarship",
                "title": {
                    "en": "AUPP Presidential & Merit Scholarship",
                    "km": "អាហារូបករណ៍ឧត្តមភាព AUPP"
                },
                "provider": {"en": "American University of Phnom Penh", "km": "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ"},
                "description": {
                    "en": "Merit scholarships covering 25% to 100% of undergraduate tuition for Cambodian students demonstrating exceptional academic and leadership excellence.",
                    "km": "អាហារូបករណ៍ ២៥% ទៅ ១០០% សម្រាប់សិស្សដែលមានស្នាដៃសិក្សាឆ្នើម និងមានភាពជាអ្នកដឹកនាំ។"
                },
                "eligibility_criteria": {
                    "en": ["BacII Grade A or B", "Pass AUPP English & Math Scholarship Exam", "Personal Essay & Interview"],
                    "km": ["និទ្ទេស A ឬ B ក្នុងបាក់ឌុប", "ប្រឡងជាប់តេស្តអាហារូបករណ៍ AUPP", "សរសេរតែងសេចក្តី និងឆ្លងកាត់ការសម្ភាសន៍"]
                },
                "coverage_type": "PARTIAL_TUITION",
                "coverage_percentage": 50,
                "country_or_institution": "AUPP Cambodia",
                "application_deadline": date(2026, 8, 30),
                "application_process": {
                    "en": ["Apply online via AUPP admissions portal", "Take in-person scholarship test"],
                    "km": ["ដាក់ពាក្យតាមអនឡាញលើគេហទំព័រ AUPP", "ចូលរួមការប្រឡងអាហារូបករណ៍ផ្ទាល់"]
                },
                "official_url": "https://www.aupp.edu.kh/admissions/scholarships/",
                "source_name": "AUPP Admissions Office",
                "last_verified_at": date(2026, 9, 15),
                "is_verified": True
            }
        ]

        for s_data in scholarships_data:
            stmt = select(Scholarship).where(Scholarship.slug == s_data["slug"])
            res = await session.execute(stmt)
            sch = res.scalar_one_or_none()
            if not sch:
                sch = Scholarship(**s_data)
                session.add(sch)

        # -----------------------------------------------------------------
        # 8. ORIGINAL BILINGUAL PERSONALITY ASSESSMENT QUESTIONS
        # -----------------------------------------------------------------
        # 24 balanced bilingual statements covering 4 dimensions: EI, SN, TF, JP (6 per axis, 3 forward + 3 reverse)
        personality_q_data = [
            # Cycle 1: Forward (Agree -> E, S, T, J)
            ("EI", "You feel energized after spending time with a large group of people or collaborating on team projects.",
             "អ្នកមានអារម្មណ៍ស្វាហាប់ និងសប្បាយចិត្ត នៅពេលបានចំណាយពេលនៅជាមួយមនុស្សច្រើន ឬធ្វើការងារជាក្រុម។", 1,
             [("Agree", "យល់ស្រប", "E", 1.0), ("Disagree", "មិនយល់ស្រប", "I", 1.0)]),
            ("SN", "You are more drawn to practical facts and real-world examples than to abstract theories and future possibilities.",
             "អ្នកចូលចិត្តរៀនពីរឿងពិត និងឧទាហរណ៍ជាក់ស្តែង ជាជាងទ្រឹស្តីពិបាកយល់ ឬការស្រមៃទៅថ្ងៃមុខ។", 2,
             [("Agree", "យល់ស្រប", "S", 1.0), ("Disagree", "មិនយល់ស្រប", "N", 1.0)]),
            ("TF", "You prioritize objective logic and evidence over personal feelings when making important decisions.",
             "ពេលសម្រេចចិត្តរឿងសំខាន់ អ្នកគិតតាមហេតុផល និងភស្តុតាងជាក់ស្តែង ជាជាងធ្វើតាមអារម្មណ៍ផ្ទាល់ខ្លួន។", 3,
             [("Agree", "យល់ស្រប", "T", 1.0), ("Disagree", "មិនយល់ស្រប", "F", 1.0)]),
            ("JP", "You like to plan a detailed schedule and stick closely to deadlines rather than keeping things open-ended.",
             "អ្នកចូលចិត្តរៀបចំកាលវិភាគច្បាស់លាស់ និងធ្វើតាមពេលកំណត់ ជាជាងកែប្រែតាមស្ថានភាពជាក់ស្តែង។", 4,
             [("Agree", "យល់ស្រប", "J", 1.0), ("Disagree", "មិនយល់ស្រប", "P", 1.0)]),

            # Cycle 2: Reverse-balanced (Agree -> I, N, F, P)
            ("EI", "After a busy day at school or events, you need quiet time alone to recharge your energy.",
             "បន្ទាប់ពីរៀន ឬចូលរួមកម្មវិធីពេញមួយថ្ងៃ អ្នកត្រូវការពេលស្ងៀមស្ងាត់ម្នាក់ឯង ដើម្បីឱ្យមានថាមពលឡើងវិញ។", 5,
             [("Agree", "យល់ស្រប", "I", 1.0), ("Disagree", "មិនយល់ស្រប", "E", 1.0)]),
            ("SN", "You enjoy imagining big-picture possibilities and brainstorming brand-new ways to do things.",
             "អ្នកចូលចិត្តស្រមៃគិតពីគំនិតថ្មីៗ និងរកវិធីប្លែកៗសម្រាប់ធ្វើកិច្ចការទៅថ្ងៃមុខ។", 6,
             [("Agree", "យល់ស្រប", "N", 1.0), ("Disagree", "មិនយល់ស្រប", "S", 1.0)]),
            ("TF", "When a classmate makes a choice you disagree with, protecting their feelings matters more than winning the debate.",
             "ពេលមិត្តភក្តិគិតខុសពីអ្នក អ្នកសុខចិត្តយល់ដល់ទឹកចិត្តគេ ជាជាងប្រកែកចង់ឈ្នះថាខ្លួនឯងត្រូវ។", 7,
             [("Agree", "យល់ស្រប", "F", 1.0), ("Disagree", "មិនយល់ស្រប", "T", 1.0)]),
            ("JP", "You prefer keeping your options flexible rather than locking yourself into a strict daily routine.",
             "អ្នកចូលចិត្តមានសេរីភាពផ្លាស់ប្តូរគម្រោងបានគ្រប់ពេល ជាជាងធ្វើតាមកាលវិភាគតឹងរ៉ឹងរាល់ថ្ងៃ។", 8,
             [("Agree", "យល់ស្រប", "P", 1.0), ("Disagree", "មិនយល់ស្រប", "J", 1.0)]),

            # Cycle 3: Forward (Agree -> E, S, T, J)
            ("EI", "In a new room or gathering, you comfortably initiate conversations and make new friends right away.",
             "ពេលទៅកន្លែងថ្មី ឬកម្មវិធីជួបជុំ អ្នកងាយស្រួលចាប់ផ្តើមនិយាយរកគេ និងរាប់អានមិត្តថ្មីៗភ្លាមៗ។", 9,
             [("Agree", "យល់ស្រប", "E", 1.0), ("Disagree", "មិនយល់ស្រប", "I", 1.0)]),
            ("SN", "When solving problems, you rely on proven methods and practical experience rather than untested novel ideas.",
             "ពេលដោះស្រាយបញ្ហា អ្នកចូលចិត្តប្រើវិធីដែលធ្លាប់ធ្វើបានផលរួចមកហើយ ជាជាងសាកល្បងគំនិតថ្មីៗដែលមិនទាន់ច្បាស់លាស់។", 10,
             [("Agree", "យល់ស្រប", "S", 1.0), ("Disagree", "មិនយល់ស្រប", "N", 1.0)]),
            ("TF", "If someone makes a mistake, your instinct is to point out the factual flaws directly so they can be fixed.",
             "បើមានអ្នកណាម្នាក់ធ្វើខុស អ្នកតែងតែប្រាប់ត្រង់ៗពីចំណុចខុស ដើម្បីឱ្យគេកែប្រែបានលឿន។", 11,
             [("Agree", "យល់ស្រប", "T", 1.0), ("Disagree", "មិនយល់ស្រប", "F", 1.0)]),
            ("JP", "You prefer to have a structured, organized plan before traveling or starting an activity rather than being spontaneous.",
             "មុនពេលដើរលេង ឬចាប់ផ្តើមធ្វើអ្វីមួយ អ្នកចូលចិត្តរៀបចំផែនការទុកជាមុន ជាជាងសម្រេចចិត្តធ្វើភ្លាមៗ។", 12,
             [("Agree", "យល់ស្រប", "J", 1.0), ("Disagree", "មិនយល់ស្រប", "P", 1.0)]),

            # Cycle 4: Reverse-balanced (Agree -> I, N, F, P)
            ("EI", "You usually prefer deep one-on-one conversations with a close friend over lively group discussions.",
             "ជាទូទៅ អ្នកចូលចិត្តជជែកស៊ីជម្រៅតែពីរនាក់ជាមួយមិត្តជិតស្និទ្ធ ជាជាងនិយាយគ្នាក្នុងក្រុមធំដែលអ៊ូអរ។", 13,
             [("Agree", "យល់ស្រប", "I", 1.0), ("Disagree", "មិនយល់ស្រប", "E", 1.0)]),
            ("SN", "You prefer coming up with your own new way to do a task rather than following the exact example shown to you.",
             "អ្នកចូលចិត្តគិតរកវិធីថ្មីដោយខ្លួនឯង ជាជាងធ្វើតាមគំរូដែលគេបង្ហាញឱ្យទាំងស្រុង។", 14,
             [("Agree", "យល់ស្រប", "N", 1.0), ("Disagree", "មិនយល់ស្រប", "S", 1.0)]),
            ("TF", "Friends naturally come to you for empathy and emotional comfort when they are going through a tough time.",
             "ពេលមិត្តភក្តិជួបទុក្ខលំបាក គេតែងតែមករកអ្នកដើម្បីឱ្យអ្នកយល់ចិត្ត និងជួយលួងលោមផ្លូវចិត្ត។", 15,
             [("Agree", "យល់ស្រប", "F", 1.0), ("Disagree", "មិនយល់ស្រប", "T", 1.0)]),
            ("JP", "You do some of your best work under last-minute pressure rather than finishing everything days in advance.",
             "អ្នកច្រើនតែធ្វើកិច្ចការបានល្អនៅពេលជិតដល់ថ្ងៃកំណត់ ជាជាងធ្វើទុកឱ្យរួចរាល់មុនច្រើនថ្ងៃ។", 16,
             [("Agree", "យល់ស្រប", "P", 1.0), ("Disagree", "មិនយល់ស្រប", "J", 1.0)]),

            # Cycle 5: Forward (Agree -> E, S, T, J)
            ("EI", "After a busy week, you prefer going out to social events rather than spending quiet time alone.",
             "បន្ទាប់ពីរៀន ឬធ្វើការហត់ពេញមួយសប្តាហ៍ អ្នកចូលចិត្តចេញក្រៅជួបជុំមិត្តភក្តិ ជាជាងសម្រាកស្ងៀមស្ងាត់ម្នាក់ឯង។", 17,
             [("Agree", "យល់ស្រប", "E", 1.0), ("Disagree", "មិនយល់ស្រប", "I", 1.0)]),
            ("SN", "You prefer specific, step-by-step instructions with clear criteria rather than open-ended creative freedom.",
             "អ្នកចូលចិត្តឱ្យមានការណែនាំច្បាស់លាស់តាមលំដាប់ជំហាន ជាជាងឱ្យអ្នកគិត ឬច្នៃធ្វើដោយខ្លួនឯង។", 18,
             [("Agree", "យល់ស្រប", "S", 1.0), ("Disagree", "មិនយល់ស្រប", "N", 1.0)]),
            ("TF", "You value praise for rigorous reasoning and analytical excellence more than praise for warmth and harmony.",
             "អ្នកសប្បាយចិត្តពេលគេសរសើរថាអ្នកគិតបានហ្មត់ចត់ និងពូកែវិភាគ ច្រើនជាងគេសរសើរថាអ្នកចិត្តល្អ និងរួសរាយ។", 19,
             [("Agree", "យល់ស្រប", "T", 1.0), ("Disagree", "មិនយល់ស្រប", "F", 1.0)]),
            ("JP", "You cannot truly relax or enjoy hanging out while homework or tasks are still unfinished—you have to finish work before relaxing.",
             "បើកិច្ចការសាលា ឬការងារមិនទាន់ធ្វើហើយទេ អ្នកពិបាកនឹងសម្រាកលេងសប្បាយណាស់—ទាល់តែបង្ហើយការងារសិន ទើបអ្នកដើរលេង ឬសម្រាកបានស្រួលចិត្ត។", 20,
             [("Agree", "យល់ស្រប", "J", 1.0), ("Disagree", "មិនយល់ស្រប", "P", 1.0)]),

            # Cycle 6: Reverse-balanced (Agree -> I, N, F, P)
            ("EI", "You prefer thinking through your ideas silently before sharing them with a class or team.",
             "អ្នកចូលចិត្តគិតពិចារណាឱ្យច្បាស់ក្នុងចិត្តសិន មុនពេលនិយាយបញ្ចេញគំនិតក្នុងថ្នាក់ ឬក្នុងក្រុម។", 21,
             [("Agree", "យល់ស្រប", "I", 1.0), ("Disagree", "មិនយល់ស្រប", "E", 1.0)]),
            ("SN", "In school projects, you get bored by repetitive step-by-step tasks and prefer exploring open creative concepts.",
             "ក្នុងគម្រោងសាលា អ្នកឆាប់ធុញនឹងការងារដដែលៗតាមលំដាប់ ហើយចូលចិត្តសាកល្បងគំនិតថ្មីៗដោយសេរី។", 22,
             [("Agree", "យល់ស្រប", "N", 1.0), ("Disagree", "មិនយល់ស្រប", "S", 1.0)]),
            ("TF", "You make your best choices when a decision feels right in line with your personal values and helps people around you.",
             "ពេលសម្រេចចិត្តធ្វើអ្វីមួយ អ្នកតែងតែគិតថាតើរឿងនោះល្អត្រឹមត្រូវ ហើយអាចជួយដល់អ្នកជុំវិញខ្លួនឬអត់។", 23,
             [("Agree", "យល់ស្រប", "F", 1.0), ("Disagree", "មិនយល់ស្រប", "T", 1.0)]),
            ("JP", "Your study desk or daily to-do list stays flexible—you happily switch tasks whenever something more interesting comes up.",
             "តារាងកិច្ចការប្រចាំថ្ងៃរបស់អ្នកមិនសូវតឹងរ៉ឹងទេ—បើមានរឿងថ្មីគួរឱ្យចាប់អារម្មណ៍ អ្នកងាយប្តូរទៅធ្វើភ្លាមៗ។", 24,
             [("Agree", "យល់ស្រប", "P", 1.0), ("Disagree", "មិនយល់ស្រប", "J", 1.0)])
        ]

        for dim, p_en, p_km, o_idx, options in personality_q_data:
            stmt = select(PersonalityQuestion).where(PersonalityQuestion.order_index == o_idx)
            res = await session.execute(stmt)
            q = res.scalar_one_or_none()
            if not q:
                q = PersonalityQuestion(dimension=dim, prompt_en=p_en, prompt_km=p_km, order_index=o_idx)
                session.add(q)
                await session.flush()
                for opt_idx, (l_en, l_km, trait, w) in enumerate(options, start=1):
                    opt = PersonalityOption(
                        question_id=q.id,
                        label_en=l_en,
                        label_km=l_km,
                        target_trait=trait,
                        weight=w,
                        order_index=opt_idx
                    )
                    session.add(opt)

        # -----------------------------------------------------------------
        # 9. ORIGINAL RIASEC ASSESSMENT QUESTIONS (18 items, 3 per Holland category)
        # -----------------------------------------------------------------
        riasec_q_data = [
            # Realistic (R)
            ("R", "Assembling, repairing, or troubleshooting mechanical devices or electronic circuits",
             "ការដំឡើង ជួសជុល ឬស្វែងរកបញ្ហាលើគ្រឿងម៉ាស៊ីន និងសៀគ្វីអគ្គិសនី", 1),
            ("R", "Working outdoors with hands-on tools, building physical structures or equipment",
             "ការធ្វើការនៅខាងក្រៅ ប្រើឧបករណ៍ជាងដោយផ្ទាល់ដៃ ឬការងារសាងសង់ និងដំឡើងសម្ភារៈ", 2),
            ("R", "Operating technical machinery, drones, or computer hardware diagnostics",
             "ការបញ្ជាគ្រឿងម៉ាស៊ីនបច្ចេកទេស ដ្រូន ឬការត្រួតពិនិត្យ និងជួសជុលគ្រឿងកុំព្យូទ័រ", 3),

            # Investigative (I)
            ("I", "Analyzing complex scientific data, statistics, and solving mathematical equations",
             "ការវិភាគទិន្នន័យវិទ្យាសាស្ត្រ ស្ថិតិ និងការដោះស្រាយលំហាត់គណិតវិទ្យាពិបាកៗ", 4),
            ("I", "Investigating how computer algorithms, artificial intelligence, or software programs work",
             "ការសិក្សាស្វែងយល់ពីរបៀបដំណើរការនៃកម្មវិធីកុំព្យូទ័រ ប្រព័ន្ធសរសេរកូដ និងបច្ចេកវិទ្យា AI", 5),
            ("I", "Conducting laboratory experiments or research to discover underlying causes of problems",
             "ការធ្វើពិសោធន៍ក្នុងមន្ទីរពិសោធន៍ ឬការស្រាវជ្រាវដើម្បីរកមូលហេតុពិតនៃបញ្ហា", 6),

            # Artistic (A)
            ("A", "Designing logos, user interfaces, digital graphics, or aesthetic layouts",
             "ការរចនាឡូហ្គោ ទម្រង់កម្មវិធីទូរស័ព្ទ និងវេបសាយ (UI) រូបភាពឌីជីថល ឬផ្ទាំងរូបភាពស្អាតៗ", 7),
            ("A", "Expressing ideas through creative writing, storytelling, poetry, or screenplays",
             "ការបញ្ចេញគំនិតតាមរយៈការសរសេរប្រលោមលោក រឿងរ៉ាវច្នៃប្រឌិត ឬស្គ្រីបវីដេអូ", 8),
            ("A", "Composing music, creating digital media, photography, or video editing",
             "ការតាក់តែងតន្ត្រី ការថតរូបសិល្បៈ ឬការកាត់តវីដេអូប្រកបដោយភាពច្នៃប្រឌិត", 9),

            # Social (S)
            ("S", "Teaching, mentoring, or explaining difficult subjects to fellow students",
             "ការបង្រៀន ការបង្ហាត់បង្ហាញ ឬការពន្យល់មេរៀនពិបាកៗដល់មិត្តរួមថ្នាក់", 10),
            ("S", "Volunteering in community development projects to help underprivileged people",
             "ការស្ម័គ្រចិត្តជួយសហគមន៍ និងជួយឧបត្ថម្ភដល់អ្នកខ្វះខាត", 11),
            ("S", "Counseling peers and offering empathetic support when they face personal issues",
             "ការស្តាប់ ផ្តល់យោបល់ និងលើកទឹកចិត្តមិត្តភក្តិ ឬអ្នកដទៃពេលគេជួបបញ្ហា", 12),

            # Enterprising (E)
            ("E", "Leading a student association, organizing campus events, and motivating people",
             "ការដឹកនាំក្រុម ឬសមាគមសិស្ស ការរៀបចំកម្មវិធីសាលា និងការលើកទឹកចិត្តអ្នកដទៃ", 13),
            ("E", "Starting a business, selling a product or service, and negotiating deals",
             "ការចាប់ផ្តើមរកស៊ី ការលក់ផលិតផល ឬសេវាកម្ម និងការចរចាធ្វើកិច្ចព្រមព្រៀង", 14),
            ("E", "Persuading others to adopt an innovative proposal through public speaking",
             "ការនិយាយបញ្ចុះបញ្ចូលអ្នកដទៃឱ្យគាំទ្រគំនិត ឬគម្រោងថ្មីរបស់អ្នក នៅចំពោះមុខមហាជន", 15),

            # Conventional (C)
            ("C", "Organizing detailed spreadsheets, tracking expenditures, and financial records",
             "ការរៀបចំឯកសារតារាង Excel ការតាមដានចំណូលចំណាយ និងបញ្ជីគណនេយ្យ", 16),
            ("C", "Developing step-by-step operating checklists and ensuring systematic compliance",
             "ការរៀបចំតារាងតាមដានការងារតាមលំដាប់ និងការធ្វើឱ្យប្រាកដថាអ្វីៗធ្វើតាមគោលការណ៍ត្រឹមត្រូវ", 17),
            ("C", "Managing database registries, structured records, and archived documents",
             "ការគ្រប់គ្រងទិន្នន័យក្នុងប្រព័ន្ធ និងការរៀបចំទុកដាក់ឯកសារឱ្យមានសណ្តាប់ធ្នាប់", 18)
        ]

        for cat, p_en, p_km, o_idx in riasec_q_data:
            stmt = select(RiasecQuestion).where(RiasecQuestion.order_index == o_idx)
            res = await session.execute(stmt)
            q = res.scalar_one_or_none()
            if not q:
                q = RiasecQuestion(category=cat, prompt_en=p_en, prompt_km=p_km, order_index=o_idx)
                session.add(q)

        # -----------------------------------------------------------------
        # 10. DEFAULT RECOMMENDATION RULE
        # -----------------------------------------------------------------
        stmt = select(RecommendationRule).where(RecommendationRule.rule_name == "DEFAULT_BALANCED_V1")
        res = await session.execute(stmt)
        rule = res.scalar_one_or_none()
        if not rule:
            rule = RecommendationRule(
                rule_name="DEFAULT_BALANCED_V1",
                weight_personality=0.20,
                weight_riasec=0.35,
                weight_academic_strengths=0.30,
                weight_career_alignment=0.15,
                is_active=True,
                parameters={
                    "tuition_penalty_weight": 15.0,
                    "location_mismatch_penalty": 10.0,
                    "stem_bonus": 5.0
                }
            )
            session.add(rule)

        await session.commit()
        print("✅ Seeding completed successfully! Verified Cambodian universities, majors, careers, scholarships & questions seeded.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
