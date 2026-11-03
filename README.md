# FUTERA — Complete Education & Career Guidance Platform for Cambodia

> **"Discover Your Direction. Shape Your Future."**  
> *ស្វែងរកទិសដៅរបស់អ្នក។ កំណត់អនាគតរបស់អ្នក។*

Futera is a modern, responsive, full-stack student guidance ecosystem engineered for Cambodian high school students, Grade 12 graduates, and university undergraduates. Moving beyond basic quiz tools and passive directories, Futera pairs psychometric self-discovery (MBTI-inspired & Holland RIASEC assessments) with an explainable recommendation engine and verified Cambodian higher education data.

---

## 🧭 Brand Identity & Design System

| Element | Specification | Visual Role |
| :--- | :--- | :--- |
| **Primary Navy** | `#111965` | Navigation, headers, brand accents, footer |
| **Accent Yellow** | `#F7CE4D` | Action buttons (CTAs), active states, badges, highlights |
| **Canvas Background** | `#F5F6FA` | App workspace, dashboard backing |
| **Surface White** | `#FFFFFF` | Cards, forms, comparison matrices, modals |
| **Primary Text** | `#171A2C` | High-contrast body copy & headings |
| **Secondary Text** | `#68708A` | Subtitles, helper text, metadata |
| **Border** | `#E6E8F0` | Structural dividers & card boundaries |
| **Khmer Font** | `Noto Sans Khmer` | Authentic Cambodian typography |
| **English Font** | `Inter` / `Plus Jakarta Sans` | Modern high-density startup UI |

---

## 🏛️ Verified Cambodian Higher Education Benchmark

Futera strictly uses fact-verified institutional data reflecting actual tuition fees and academic standards across public, semi-public, and private universities in Cambodia:

* **Royal University of Phnom Penh (RUPP / ស.ភ.ភ):** Public institution established in 1960. Tuition: **$250 – $900/year** (Information Technology: $450/yr; Civil Engineering: $600/yr; International Relations: $400/yr).
* **Institute of Technology of Cambodia (ITC / តិចណូ):** Semi-public French-accredited STEM leader founded in 1964. Tuition: **$600 – $800/year** (Software & Information Engineering: $650/yr; Structural Civil Engineering: $750/yr).
* **American University of Phnom Penh (AUPP / អេយូប៊ីភី):** U.S.-accredited private university founded in 2013 (dual degrees with Univ. of Arizona & Fort Hays). Tuition: **$6,000 – $9,000/year** (Software Engineering: $6,000/yr; Business Administration: $6,000/yr).
* **Paragon International University (ParagonIU):** Private English-medium university. Tuition: **$2,500 – $3,500/year**.
* **National University of Management (NUM):** Public business university. Tuition: **$450 – $650/year**.

---

## ⚡ Core Architecture & Technology Stack

Futera is strictly decoupled into a high-performance Next.js frontend and an async Python FastAPI REST backend with zero direct frontend-to-database connections:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐         ┌───────────────────────┐
│ Next.js 16 (React 19 / TS)     │  HTTP   │ FastAPI Backend (Python 3.12)  │ Asyncpg │ PostgreSQL 16 Alpine  │
│ Port 3000                      │ ──────> │ Port 8000                      │ ──────> │ Port 5433 (Host)      │
│ TanStack Query v5 + Recharts   │ REST/v1 │ SQLAlchemy 2.0 Async + Alembic │ Pool    │ 28 Core Tables        │
└────────────────────────────────┘         └────────────────────────────────┘         └───────────────────────┘
```

### Frontend (`/frontend`)
- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling:** Tailwind CSS with Futera custom design tokens.
- **Data Fetching:** TanStack Query v5 (`@tanstack/react-query`) with automatic query caching and deduplication.
- **Visualizations:** Recharts (interactive 6-axis Holland RIASEC radar charts and analytics).
- **Icons & Effects:** Lucide React icons & Canvas Confetti celebration feedback.
- **Bilingual i18n:** Built-in reactive English (`en`) and Khmer (`km`) language context with full vocabulary dictionaries.

### Backend (`/backend`)
- **API Framework:** FastAPI with Pydantic v2 validation.
- **ORM & Migrations:** SQLAlchemy 2.0 Async with `asyncpg` connection pooling and Alembic migrations.
- **Security & Crypto:** Argon2id password hashing, PyJWT access tokens (15-min lifetime) with rotating refresh tokens (7-day lifetime), and Role-Based Access Control (`STUDENT`, `ADMIN`, `SUPER_ADMIN`).
- **Recommendation Engine:** Rule-based explainable algorithm scoring majors across Personality ($w_P=0.20$), RIASEC Holland Code ($w_R=0.35$), Academic Aptitude ($w_A=0.30$), and Career Goals ($w_C=0.15$).

---

## 🚀 Quickstart & Setup Guide

### Option 1: One-Click Launch via Docker Compose (Recommended)

Make sure Docker and Docker Compose are installed and running on your machine:

```bash
# 1. Clone repository
git clone https://github.com/futera/futera.git
cd Futera

# 2. Launch complete stack (PostgreSQL + FastAPI + Next.js)
docker compose up --build
```

Access the platform:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Option 2: Local Development Setup

#### 1. Start the PostgreSQL Container
```bash
docker compose up -d postgres
```
*(Runs PostgreSQL 16 on port `5433`)*

#### 2. Configure and Start Backend
```bash
cd backend

# Create virtual environment and activate
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed verified Cambodian educational data & demo accounts
python scripts/seed_data.py

# Launch FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Configure and Start Frontend
```bash
cd frontend

# Install npm packages
npm install

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Email Address | Password | Pre-Configured State |
| :--- | :--- | :--- | :--- |
| **Student** | `student@futera.edu.kh` | `StudentPass123!` | Complete profile, completed MBTI (`ESTJ`), completed RIASEC (`RIA`), recommendations generated, saved favorites. |
| **Administrator** | `admin@futera.edu.kh` | `AdminPass123!` | Access to `/admin`, platform metrics, live recommendation weight tuner, user directory. |
| **Super Admin** | `superadmin@futera.edu.kh` | `SuperAdmin123!` | System settings, permission controls, and audit trails. |

*(The login screen features one-click quick-fill buttons for both Student and Admin accounts for instantaneous testing)*

---

## 🧪 Running Automated Tests

Run backend integration and unit tests with Pytest:

```bash
cd backend
source venv/bin/activate
pytest -v
```

All test suites verify authentication tokens, RBAC permission barriers, assessment calculation math, and explainable recommendations.

---

## 🗄️ Database Entity Overview

Futera models 28 comprehensive relational tables:
1. `users`, `refresh_tokens`, `student_profiles`
2. `universities`, `faculties`, `majors`, `university_majors`
3. `careers`, `major_careers`, `scholarships`
4. `personality_questions`, `personality_options`, `personality_results`, `personality_dimension_scores`
5. `riasec_questions`, `riasec_results`, `riasec_dimension_scores`
6. `academic_preferences`
7. `major_recommendations`, `recommendation_weights_config`
8. `favorite_majors`, `favorite_universities`, `favorite_scholarships`
9. `admin_audit_logs`

---

## 📄 License & Attribution

Developed with pride for the students of Cambodia.  
Built with Next.js, FastAPI, PostgreSQL, and Tailwind CSS.

