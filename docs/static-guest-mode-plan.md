# OrienX Static Guest Mode — Implementation Plan

**Status:** Draft for approval  
**Target:** Vercel-only launch, no backend, no database, no login  
**Date:** 2026-11-19

## Implementation status (2026-11-19)

Built in this pass:

- Static catalog export script: `backend/scripts/export_static_data.py`
- Static JSON for universities, majors, offerings, careers, scholarships, questions, and search
- Public guest Personality and RIASEC tests with `localStorage` drafts/results/history
- Results page with combined top majors, profile name, backup JSON, and clear-data controls
- Export dialog with PDF, XLSX, CSV, JSON, Markdown, HTML, TXT, PNG share card, and share link
- Public mascot guide with local, rule-based answers from the static catalogue
- Optional public Gemini mode through the server-side `frontend/src/app/api/public-assistant/route.ts`; the key stays on the server and the local guide is the fallback
- Static mode (`NEXT_PUBLIC_APP_MODE=static`) gating for auth, dashboard, admin, share routes, and assistant
- Public catalog/search pages now read bundled JSON instead of the FastAPI API
- Backend tests: 46 passing; frontend TypeScript and production builds passing

Still optional / next:

- Guest BACII eligibility checker
- Combined report export (both tests in one PDF/XLSX)
- True pure static export (`output: "export"`)
- Expanded question bank and validated scoring review

## 1. Goal

Launch OrienX as a static-first website where any student can:

1. Take the Personality and RIASEC tests without an account.
2. Resume a test after refresh or closing the browser.
3. See their result immediately.
4. Keep results in `localStorage`.
5. Export results in several formats.
6. Explore majors, universities, careers, and scholarships from static data.

The existing FastAPI backend, dashboard, admin panel, notifications, and parent reports stay in the codebase for a later release, but are not used in static mode.

## 2. Recommended architecture

```text
Browser
├── Static pages (home, directories, guides)
├── Guest test runner
│   ├── Questions from JSON
│   ├── Scoring in TypeScript
│   ├── Draft/result storage in localStorage
│   └── Export engine (PDF, XLSX, CSV, JSON, MD, HTML, PNG, link)
├── Static catalog data (majors, universities, offerings, careers, scholarships)
└── Client-side search index
```

**Recommendation:** use a static-first Next.js deployment on Vercel, not `output: "export"` yet.

- Public pages read committed JSON that is bundled at build time.
- Dynamic detail pages (`/majors/[slug]`, etc.) still work.
- No API rewrite, no backend URL, no auth calls.
- A later pure static export (`output: "export"`) remains possible.

## 3. Routes

### New public routes

| Route | Purpose |
|---|---|
| `/assessments/personality/test` | Guest Personality test |
| `/assessments/personality/result` | Latest local Personality result |
| `/assessments/riasec/test` | Guest RIASEC test |
| `/assessments/riasec/result` | Latest local RIASEC result |
| `/assessments/results` | All local results, history, combined report |
| `/assessments/shared` | Read-only result decoded from a share link |

### Existing routes to update

| Route | Change |
|---|---|
| `/assessments` | Point all test CTAs to the new guest routes |
| `/personality` | Guide page; CTA to `/assessments/personality/test` |
| `/riasec` | Guide page; CTA to `/assessments/riasec/test` |
| `/majors`, `/universities`, `/careers`, `/scholarships` | Read static JSON instead of API |
| `/search` | Use the static search index |

### Routes to hide or replace in static mode

| Route | Static behavior |
|---|---|
| `/login`, `/register` | Friendly notice: accounts coming later |
| `/dashboard/*` | Notice + link to guest tests; no redirect loop |
| `/admin/*` | Notice or 404 |
| `/share/[token]` | Explain that hosted share links are unavailable; use local share link |
| Favorite/save/track actions | Hidden or replaced with local-only saved items |

Optional: redirect `/dashboard/assessments/personality` and `/dashboard/assessments/riasec` to the guest test routes when `NEXT_PUBLIC_APP_MODE=static`.

## 4. Static data layer

### Files to generate

Output directory: `frontend/src/data/static/`

```text
meta.json                     # version, generatedAt, counts, source commit
universities.json             # 46
majors.json                   # 57
offerings.json                # 304
careers.json                  # 3
scholarships.json             # 3
personality-questions.json    # 12 questions, 24 options, with weights
riasec-questions.json         # 18 questions
search-index.json             # flat searchable entries
```

### Export script

Add `backend/scripts/export_static_data.py`.

- Reads the database, not the UI.
- Writes stable, sorted JSON with `ensure_ascii=False`.
- Includes `schemaVersion`, `dataVersion`, `generatedAt`, and row counts in `meta.json`.
- Excludes users, emails, applications, plans, notifications, and all private data.
- Supports `--check` to fail CI when committed JSON is stale.
- Should be run before every static release.

### Data access layer

Add `frontend/src/lib/data/`:

```text
types.ts       # DTOs mirroring current API responses
static.ts      # reads JSON, filters, joins
api.ts         # current apiFetch implementation
index.ts       # selects static or API from NEXT_PUBLIC_APP_MODE
```

Public pages currently calling `apiFetch`:

- `app/(public)/majors/page.tsx`
- `app/(public)/majors/[slug]/page.tsx`
- `app/(public)/universities/page.tsx`
- `app/(public)/universities/[slug]/page.tsx`
- `app/(public)/careers/page.tsx`
- `app/(public)/careers/[slug]/page.tsx`
- `app/(public)/scholarships/page.tsx`
- `app/(public)/scholarships/[slug]/page.tsx`
- `components/home/featured-majors-grid.tsx`
- `components/home/scholarships-showcase.tsx`

Replace each call with a data-layer function, for example:

```ts
listMajors({ search, category, stemOnly })
getMajor(slug)
listUniversities({ search, type, province, majorSlug })
getUniversity(slug)
listCareers({ search, industry })
listScholarships({ search, coverage })
searchStatic(query)
```

### Search

Build `search-index.json` from majors, universities, careers, and scholarships.

- Match English and Khmer names.
- Normalize case and whitespace.
- Keep grouped results: Universities, Majors, Careers, Scholarships.
- Limit each group.
- Update `components/search/global-search.tsx` to use the static index in static mode.

### Data freshness

- Show `dataVersion` or "Data updated: <date>" in the footer of directory pages.
- Add a release checklist item: run export script, run `--check`, commit JSON.
- Do not hand-edit generated JSON.

## 5. localStorage design

### Keys

```text
orienx.guest.profile.v1
orienx.guest.personality.draft.v1
orienx.guest.personality.results.v1
orienx.guest.riasec.draft.v1
orienx.guest.riasec.results.v1
orienx.guest.settings.v1
```

Do **not** reuse `futera_personality_draft_v1` or `futera_riasec_draft_v1`; those are account-scoped and cleared by `AuthProvider`.

### Draft shape

```ts
interface PersonalityDraft {
  version: 1;
  answers: Record<string, { scaleLevel: number; optionId: string }>;
  currentIndex: number;
  updatedAt: string;
}

interface RiasecDraft {
  version: 1;
  answers: Record<string, number>;
  currentIndex: number;
  updatedAt: string;
}
```

### Completed result shape

```ts
interface GuestResultRecord {
  id: string;                 // crypto.randomUUID()
  kind: "personality" | "riasec";
  schemaVersion: 1;
  engineVersion: 1;
  dataVersion: string;
  completedAt: string;
  answers: Record<string, unknown>;
  result: PersonalityScore | RiasecScore;
}
```

Store the last 10 completed results per kind. Each retake creates a new record.

### Behavior

- Autosave draft after 300–500 ms of inactivity.
- Show "Saved on this device" indicator.
- On mount, if a draft exists, show "Continue" or "Start over".
- On completion, clear the draft and prepend to results.
- Add "Clear all my data" with a centered confirmation modal.
- Handle `localStorage` unavailable (private mode) with an in-memory fallback and a visible warning.
- Handle `QuotaExceededError` by pruning oldest history and retrying.
- Sync across tabs with the `storage` event (optional but low cost).
- No name is required. Optional display name is stored locally only.

### Privacy copy

- "Your answers and results stay in this browser. They are not sent to a server."
- "Clearing browser data deletes your results. Export a copy if you want to keep it."
- Share links contain the result data in the URL. Warn before sharing.

## 6. Scoring

### Personality parity

Port `AssessmentService.calculate_personality` to TypeScript.

1. For each answer, read the selected option's `targetTrait` and `weight`.
2. Sum weights per trait: E, I, S, N, T, F, J, P.
3. Normalize each pair:

```text
percentage = trait / (traitA + traitB) * 100
```

4. Dominant trait wins; ties go to the first trait (`E`, `S`, `T`, `J`), matching current backend behavior.
5. Build the 4-letter type.
6. Load archetype metadata from `lib/personality-meta.ts`.

**Known quirk:** the current UI maps neutral (level 3) to the Agree option. Decide whether to keep parity or change neutral scoring to 50/50. If changed, update both backend and frontend and bump `engineVersion`.

### RIASEC parity

Port `AssessmentService.calculate_riasec`.

1. Average ratings per category R, I, A, S, E, C.
2. Convert to percentage: `average / 5 * 100`.
3. Sort descending; tie-break in fixed order R, I, A, S, E, C.
4. Take the top three letters as the Holland code.
5. Load archetype metadata from `lib/riasec-meta.ts`.

### Recommendation engine v1

Use a transparent client-side fit score, not a copy of the full 4-pillar backend engine.

- Inputs: `majors.json`, `offerings.json`, optional Personality score, optional RIASEC score.
- RIASEC fit:
  - `0.70 * score[primary] + 0.30 * score[secondary]`
  - small bonus if the major's primary letter is in the student's top three
- Personality fit:
  - compare the student's 4-letter type with each type in `personality_affinity`
  - score = highest letter-match percentage across affinity types
  - fallback 60 if affinity is empty
- Combined fit when both tests exist:
  - `0.55 * riasecFit + 0.45 * personalityFit`
- Return top 6 majors with:
  - major name and slug
  - fit percentage
  - university count
  - tuition range from offerings
  - category
- Label it **"Interest fit"**, not "admission chance".
- Include a short "How this is calculated" note.

## 7. UI and UX

### Guest test shell

- Brand header with language and theme controls.
- "No account needed" badge.
- Three-step intro: answer honestly, see your result, export or share.
- Progress bar and question counter.
- Back/Next controls; keyboard shortcuts (1–5 for Personality, 1–5 for RIASEC ratings).
- Autosave indicator.
- Exit confirmation only if answers exist.
- Reuse `components/assessments/assessment-stage.tsx` where practical.

### Result page

1. Hero: type or Holland code, archetype name, tagline.
2. Score visualization:
   - Personality: four paired bars.
   - RIASEC: six-dimension radar or bars.
3. Strengths, learning style, best fields / work environment.
4. Top recommended majors with links.
5. Next steps: explore majors, take the other test, export, share.
6. Retake and history.

### Combined results page

`/assessments/results`

- Cards for Personality and RIASEC results.
- "Take the missing test" prompt if only one exists.
- Combined top majors.
- Export combined report.
- History list with dates and delete buttons.
- Clear-all-data action.

### Brand and accessibility

- Navy `#111965` and gold `#F7CE4D`.
- English and Khmer copy for every new string.
- Dark mode support.
- Mobile-first layouts.
- Visible focus states.
- Reduced-motion support.
- No native `alert`; reuse centered modals and HeroUI toasts.

## 8. Export formats

| Format | Extension | Contents | Implementation | Priority |
|---|---|---|---|---|
| PDF / Print | `.pdf` via print dialog | Full branded report, scores, strengths, majors | Existing print-window exporter | Must |
| Excel | `.xlsx` | Summary, dimensions, majors, answers | `write-excel-file` (already installed) | Must |
| CSV | `.csv` | Flat summary and dimension table, UTF-8 BOM | Existing exporter | Must |
| JSON | `.json` | Full result, answers, engine/data versions | Existing exporter, extended | Must |
| Markdown | `.md` | Portable summary with tables | New template | Should |
| HTML | `.html` | Standalone styled report, no scripts | New template | Should |
| PNG share card | `.png` | 1080×1350 branded card for social sharing | `html-to-image` (new dependency) | Should |
| Plain text | `.txt` | Short summary | New template | Could |
| Share link | URL | Compressed result in URL fragment | `lz-string` or native compression | Should |
| Combined report | `.pdf`, `.xlsx`, `.json` | Both tests + combined majors | New combined model | Should |

### Export details

- File names:
  - `OrienX-Personality-INTJ-2026-11-19.pdf`
  - `OrienX-RIASEC-IAS-2026-11-19.xlsx`
  - `OrienX-Combined-2026-11-19.pdf`
- Include `dataVersion` and `engineVersion` in JSON and HTML metadata.
- PDF uses the existing print window; if popups are blocked, show a toast and offer HTML download.
- Excel exports should include an `Answers` sheet for full transparency.
- CSV must include a UTF-8 BOM so Khmer text opens correctly in Excel.
- HTML and PNG must wait for `document.fonts.ready` before rendering.
- For standalone HTML, include a Google Fonts link for Noto Sans Khmer, with a system-font fallback.
- PNG card: type/code, top three dimensions, top three majors, OrienX mark, date. Optional QR code for the share link.
- Share link: encode a compact payload, not the full answers unless the student opts in.
- Add a "Copy summary" action for quick pasting into chat or email.

### Possible new dependencies

- `html-to-image` for PNG cards.
- `lz-string` for share links.
- Optional: `qrcode` for QR codes.
- Optional: `docx` only if true Word files are required.

## 9. Static-mode gating

Add a single flag:

```bash
NEXT_PUBLIC_APP_MODE=static
```

Default to `full` when unset.

### Build-time, not runtime

`NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at build time. Changing `NEXT_PUBLIC_APP_MODE` requires a new deployment; it is not a per-request or per-user switch.

| Mode | Public catalog | Tests | Auth / dashboard | Backend |
|---|---|---|---|---|
| `static` | JSON | `localStorage` | Hidden | Not required |
| `full` | API | API + database | Enabled | Required |
| `hybrid` (later) | JSON | Local or API | Enabled | Required for account features only |

Recommended Vercel setup:

- **Production:** `static` — the public launch.
- **Preview / staging:** `full` with `BACKEND_INTERNAL_URL` — test accounts and dashboard before switching.
- **Local:** `full` by default; use `.env.local` with `static` when testing the guest build.

In `full` mode the FastAPI backend and Postgres must be running, and `BACKEND_INTERNAL_URL` must point to the deployed API. In `static` mode that variable is not needed, and the `/api/v1` rewrite is removed at build time.

### Files to update

| File | Change |
|---|---|
| `next.config.ts` | Only add `/api/v1` rewrite when mode is not `static` |
| `contexts/auth-context.tsx` | Skip `/auth/me`, skip draft purging in static mode |
| `components/layout/navbar.tsx` | Replace Login/Register with "My results" and "Take a test" |
| `app/(dashboard)/layout.tsx` | Render static notice instead of redirecting to `/login` |
| `app/(admin)/...` | Render notice or 404 |
| `app/(auth)/login/page.tsx`, `register/page.tsx` | Friendly notice |
| `app/share/[token]/page.tsx` | Explain hosted sharing is unavailable |
| Public scholarship pages | Hide "Track scholarship" when signed out |
| Public majors pages | Hide favorite/save actions |
| `components/search/global-search.tsx` | Static search fallback |
| `components/home/*` | Static catalog data |

### Build behavior

- No `BACKEND_INTERNAL_URL` required.
- No auth cookies.
- No API requests in the browser.
- Dashboard and admin code remain in the bundle only if routes are still reachable; hide links and guard routes.

## 10. Deployment

### Vercel

- Framework: Next.js.
- Build command: `npm run build`.
- Environment: `NEXT_PUBLIC_APP_MODE=static`.
- No backend environment variables.
- No database.

### Optional pure static export

Only if hosting on GitHub Pages, Cloudflare Pages, or S3:

- Set `output: "export"` and `images.unoptimized: true`.
- Add `generateStaticParams` for all directory detail pages.
- Remove or convert `/share/[token]`.
- Ensure no middleware, server actions, or dynamic routes remain.

Recommendation: start with the hybrid static-first deployment, then evaluate pure export after launch.

## 11. Phases and estimates

| Phase | Work | Estimate |
|---|---|---|
| 0 | Confirm scope and scoring decisions | 1 day |
| 1 | Static data export script + data layer + search index | 2–3 days |
| 2 | Guest test runner + localStorage repository + resume | 3–4 days |
| 3 | Result pages + client-side recommendations | 2–3 days |
| 4 | Export engine + share link + combined report | 3–4 days |
| 5 | Static-mode gating + public page conversion | 3–4 days |
| 6 | QA, accessibility, mobile, Vercel deployment | 2 days |

**Total:** roughly 3–4 weeks for one developer.

**MVP cut:** Phases 1–4 plus minimal static gating, about 8–10 working days. This gives working tests, local results, and exports without converting every public page.

## 12. Testing and acceptance criteria

### Automated

- Unit tests for Personality scoring, RIASEC scoring, recommendation ranking, storage migrations, and export serializers.
- Build with `NEXT_PUBLIC_APP_MODE=static`.
- Backend tests remain green; backend is unchanged.
- Optional Playwright smoke test: start test, answer all, see result, reload, export JSON.

### Manual

- No `/api/v1` requests in DevTools on public routes.
- Complete each test; result appears immediately.
- Refresh and close/reopen; draft and result persist.
- Resume a partially completed test.
- Export every format; files open correctly.
- Khmer text renders in PDF, Excel, CSV, HTML, and PNG.
- Clear all data removes drafts, results, and history.
- Share link opens in a new browser profile and renders the result.
- Test on mobile Safari and Chrome.
- Test with localStorage disabled; app still works in memory with a warning.
- Dashboard, admin, login, and hosted share routes show notices, not redirect loops.
- Lighthouse: performance and accessibility at least 90 on test pages (target).

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Marketing says 60/30 questions but database has 12/18 | Update copy to the real counts for launch; expand the validated question bank later |
| Client recommendation feels less accurate than the backend engine | Label it "interest fit"; explain the formula; keep the full engine for account mode |
| Static JSON becomes stale | Export script, data version badge, release checklist, `--check` mode |
| Khmer fonts in PNG/HTML exports | Wait for fonts, embed Noto Sans Khmer link, test on macOS/Windows/Android |
| localStorage is cleared or unavailable | Clear warnings, export reminder, in-memory fallback |
| Share links expose result data | Explicit warning, optional name exclusion, no answers in share payload |
| Bundle size grows with catalog JSON | Split files, lazy-load search index, dynamic import export libraries |
| Vercel Hobby is non-commercial | Treat launch as a free student project; plan Vercel Pro or another host if it becomes commercial |
| Pure static export breaks dynamic routes | Use hybrid static-first for launch; evaluate export later |

## 14. Decisions needed before implementation

1. **Scope:** full public site conversion, or tests + results only for the first release?
   - Recommended: full public site, because directory pages still call the backend today.
2. **Question bank:** keep the current 12 Personality / 18 RIASEC questions, or expand to match the 60/30 marketing copy?
   - Recommended: keep current questions and correct the copy; expand later.
3. **Export formats:** which are must-have?
   - Recommended: PDF, XLSX, CSV, JSON, PNG, share link. Markdown, HTML, and TXT are low-cost extras.
4. **Deployment style:** hybrid static-first or pure `output: "export"`?
   - Recommended: hybrid static-first.
5. **BACII checker:** include it in the static launch?
   - Recommended: yes, after the two tests, using the exported admission data.
6. **Student name:** optional local display name, or anonymous only?
   - Recommended: optional, local-only, easy to clear.
