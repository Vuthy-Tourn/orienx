# Real Cambodian University & Major Catalog Pipeline

This pipeline populates and enriches the **OrienX** student catalog using real, attributable data from official Cambodian higher education sources and directories.

---

## 1. Data Sources & Provenance

1. **Official Institutional Websites (`.edu.kh`) & Admissions Bulletins**:
   - Directly probed and extracted from official institutional portals:
     - **AUPP** (`aupp.edu.kh/tuition-fees`): Single Degree ($6,000/yr) & Dual US Degree ($9,000/yr with Arizona/Fort Hays State).
     - **Paragon International University** (`paragoniu.edu.kh/admissions/tuition-fees`): Official faculty fee tables ($4,500 Engineering, $4,000 ICT, $3,500 Economics/Admin/IR).
     - **CADT** (`cadt.edu.kh/academic/admission`): Official admissions bulletin ($2,500 base tuition, 50% female tech scholarship, 0% interest loans, free laptops).
     - **CamEd Business School** (`cam-ed.edu.kh`): Official per-semester fee schedule ($1,899-$1,999/sem = $3,798-$4,178/yr).
     - **ITC (Techno)** (`itc.edu.kh`): Standard Engineering ($800/yr male, $650/yr female), International English Engineering ($2,500/yr), Technician cycle ($250-$350/yr).
     - **CamTech** (`camtech.edu.kh`): 3-term academic calendar ($4,000/yr Engineering & Built Environment, $3,500/yr Arts & Business).
     - **Norton University** (`norton-u.com`): Official Colleges of Sciences, Social Sciences, Arts/Humanities, and Health Sciences ($500-$2,500/yr with Bac II Grade A-E tiered pricing).
     - **RULE** (`rule.edu.kh`): Official National ($580/yr), ELBBL English Law ($850/yr), and French Dual Degree ($650-$750/yr).
     - **RUPP** (`rupp.edu.kh`): Faculty of Science ($250-$300/yr), Faculty of Engineering ($600/yr), IFL & CS ($600-$1,000/yr).
     - **UHS** (`uhs.edu.kh`): Medicine/Pharmacy/Dentistry ($1,500/yr), Nursing/Lab ($1,000-$1,200/yr).
     - **University of Puthisastra** (`puthisastra.edu.kh`): Health Sciences ($1,955-$3,227/yr; avg ~$2,350/yr), IT ($778-$2,716/yr).
     - **De Montfort University Cambodia** (`dmuc.edu.kh`): British Koh Pich campus ($4,500-$4,800/yr).
     - **ACLEDA University of Business** (`aub.edu.kh`): Upgraded from Institute to University by Sub-Decree ($950-$1,200/yr).
     - **NUBB** (`nubb.edu.kh`): Faculties of Business, Science & Tech, Sociology (Psychology, Data Science, Architecture), Agriculture.
     - **BELTEI** (`beltei.edu.kh`): 13 faculties ($600-$800/yr).
     - **PUC** (`puc.edu.kh`): Credit-based fees ($26.50/credit weekday, $31/credit weekend = ~$795-$930/yr).

2. **Sala Public Directory & Academic API**:
   - `GET https://www.sala.co/api-aca/schools?status=active&limit=200`
   - School profiles, logos, facilities, and campus coordinates.

3. **MoEYS & Accreditation Committee of Cambodia (ACC) Qualification Standards**:
   - Degree duration (4 years for Bachelor, 5 years for Engineering/Pharmacy/Architecture, 7–8 years for Medicine/Dentistry, 2 years for Associate/Master).
   - Standard academic classifications, STEM designations, and RIASEC / MBTI career affinities.

---

## 2. University Catalog (`scripts/scrape_real_universities.py`)

Ingests **45 accredited higher education institutions** across Cambodia (Phnom Penh, Battambang, Siem Reap, Svay Rieng, Banteay Meanchey, Tbong Khmum, and Kampong Speu):

- **Major Public Universities & Institutes**:
  - Royal University of Phnom Penh (RUPP)
  - Institute of Technology of Cambodia (ITC / Techno)
  - Royal University of Law and Economics (RULE)
  - National University of Management (NUM)
  - University of Health Sciences (UHS / SPU)
  - Royal University of Agriculture (RUA)
  - Royal University of Fine Arts (RUFA)
  - Cambodia Academy of Digital Technology (CADT / NIPTICT)
  - National University of Battambang (NUBB)
  - Svay Rieng University (SRU)
  - National Meanchey University (NMU)
  - National Polytechnic Institute of Cambodia (NPIC)
  - National Technical Training Institute (NTTI)
  - Preah Kossomak Polytechnic Institute (PKPI)
  - Prek Leap National Institute of Agriculture (PLNIA)
  - University of Economics and Finance (UEF)

- **Accredited Private Universities & Specialized Institutes**:
  - Norton University (NU)
  - CamEd Business School (ACCA/CAT)
  - Vanda Institute
  - ACLEDA Institute of Business (AIB)
  - American University of Phnom Penh (AUPP)
  - Paragon International University (ParagonIU)
  - The University of Puthisastra (UP)
  - The University of Cambodia (UC)
  - Pannasastra University of Cambodia (PUC)
  - Cambodia University of Technology and Science (CamTech)
  - De Montfort University Cambodia (DMUC)
  - East Asia Management University (EAMU)
  - BELTEI International University
  - Western University (WU)
  - Asia Euro University (AEU)
  - Cambodian Mekong University (CMU)
  - Angkor University
  - University of South-East Asia (USEA)
  - University of Management and Economics (UME)
  - Build Bright University (BBU)
  - Cambodian University for Specialties (CUS)
  - International University (IU)
  - Human Resource University (HRU)
  - Panha Chiet University (PCU)
  - IIC University of Technology
  - Phnom Penh International University (PPIU)
  - University of Heng Samrin Thbongkhmum (UHST)
  - Academy of Culinary Arts Cambodia (ACAC)
  - Kirirom Institute of Technology (KIT)

### CLI Commands:

```bash
# Dry run verification check
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py

# Ingest / update verified universities in the database
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --apply

# Restrict to specific institutions
PYTHONPATH=. ./venv/bin/python scripts/scrape_real_universities.py --only norton,uhs,camed --apply
```

---

## 3. Majors & Degree Offerings (`scripts/scrape_and_sync_majors.py`)

Syncs **57 Canonical Majors** and **299 UniversityMajor offerings** across 8 primary academic streams:

1. **Information Technology & Computing**:
   - Software Engineering & Application Development (`software-engineering`)
   - Computer Science & Theoretical Computing (`computer-science`)
   - Data Science & Artificial Intelligence (`data-science-ai`)
   - Cybersecurity & Information Networks (`cybersecurity-networking`)
   - Information Technology & Digital Infrastructure (`information-technology`)
   - Management Information Systems (`management-information-systems`)
   - Financial Technology / Fintech (`fintech`)
   - E-Commerce & Digital Business (`e-commerce-logistics`)

2. **Business, Accounting & Finance**:
   - Banking & Financial Markets (`banking-finance`)
   - Accounting, Auditing & Taxation / ACCA (`accounting-auditing`)
   - Risk Management & Insurance (`risk-management-insurance`)
   - Business Administration & Management (`business-administration`)
   - Marketing & Digital Media Strategy (`marketing-digital-media`)
   - International Business & Global Trade (`international-business`)
   - Hospitality & International Tourism Management (`hospitality-tourism-management`)
   - Supply Chain Management & Logistics (`supply-chain-logistics`)
   - Human Resource Management & Talent Strategy (`human-resource-management`)
   - Economics & Development Studies (`economics-development`)

3. **Engineering & Architecture**:
   - Civil Engineering & Structural Design (`civil-engineering`)
   - Water Resources Engineering & Rural Infrastructure (`water-environmental-engineering`)
   - Architecture & Urban Planning (`architecture-urban-planning`)
   - Electrical & Electronic Engineering (`electrical-electronic-engineering`)
   - Mechanical Engineering & Manufacturing (`mechanical-engineering`)
   - Automotive Technology & Heavy Machinery (`automotive-technology-mechanics`)
   - Mechatronics & Robotics Engineering (`mechatronics-robotics`)
   - Telecommunications & Electronic Engineering (`telecommunication-engineering`)
   - Food Technology & Chemical Engineering (`food-technology-engineering`)

4. **Health & Life Sciences**:
   - Doctor of Medicine (MD) / General Medicine (`general-medicine`)
   - Doctor of Pharmacy (PharmD) / Pharmacy (`pharmacy`)
   - Doctor of Dental Surgery (DDS) / Dentistry (`dentistry`)
   - Nursing Science & Patient Care (`nursing-science`)
   - Public Health & Epidemiology (`public-health`)
   - Medical Laboratory Technology (`medical-laboratory`)

5. **Natural Sciences & Applied Mathematics**:
   - Biology & Applied Biotechnology (`biology-biotechnology`)
   - Chemistry & Applied Chemical Analysis (`chemistry-chemical-analysis`)
   - Mathematics & Applied Statistics (`mathematics-statistics`)
   - Physics & Applied Electronics (`physics-electronics`)

6. **Law, Policy, Social Sciences & Languages**:
   - Law & Jurisprudence (`law-jurisprudence`)
   - Political Science & Public Affairs (`political-science`)
   - International Relations & Diplomacy (`international-relations`)
   - Public Administration & Governance (`public-administration`)
   - Psychology & Counseling (`psychology-counseling`)
   - Sociology & Community Social Work (`sociology-social-work`)
   - English Literature & TEFL / Education (`english-teaching-tefl`)
   - English for Translation & Interpreting (`english-translation-interpreting`)
   - Asian Languages & International Communication (Chinese, Japanese, Korean) (`asian-languages-culture`)
   - Khmer Literature, Linguistics & Culture (`khmer-literature-linguistics`)
   - Media, Journalism & Digital Communications (`media-communications`)

7. **Agriculture, Forestry & Environment**:
   - Agronomy & Crop Sciences (`agronomy-agricultural-sciences`)
   - Animal Science & Veterinary Medicine (`animal-science-veterinary`)
   - Forestry Science, Fisheries & Aquaculture (`forestry-fisheries`)
   - Environmental Science & Climate Resilience (`environmental-science`)

8. **Design, Arts, Heritage & Culinary**:
   - Graphic Design & Multimedia Arts (`graphic-design-multimedia`)
   - Interior Design & Space Architecture (`interior-design`)
   - Fine Arts & Traditional Sculpture/Painting (`fine-arts`)
   - Archaeology & Cultural Heritage Management (`archeology-cultural-heritage`)
   - Culinary Arts & Professional Kitchen Operations (`culinary-arts`)

### CLI Commands:

```bash
# Dry run majors & offerings sync
PYTHONPATH=. ./venv/bin/python scripts/scrape_and_sync_majors.py

# Apply majors, faculties, and offerings to the database
PYTHONPATH=. ./venv/bin/python scripts/scrape_and_sync_majors.py --apply
```

---

## 4. Database Integrity Verification

Run the verification one-liner from `backend/`:

```bash
PYTHONPATH=. ./venv/bin/python -c "
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.catalog import University, Major, UniversityMajor, Faculty
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as db:
        print('Universities:', await db.scalar(select(func.count(University.id))))
        print('Majors:', await db.scalar(select(func.count(Major.id))))
        print('UniversityMajor Offerings:', await db.scalar(select(func.count(UniversityMajor.id))))
        print('Faculties:', await db.scalar(select(func.count(Faculty.id))))

asyncio.run(check())
"
```
