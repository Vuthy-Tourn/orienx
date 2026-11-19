# Public Gemini Assistant Setup

The public mascot can use Gemini on the Vercel deployment while keeping the API key on the server.

## How it works

```text
Browser mascot
  → POST /api/public-assistant   (Next.js route on Vercel)
  → Gemini API with server-side GEMINI_API_KEY
  → Answer + verified catalogue sources
```

The route is `frontend/src/app/api/public-assistant/route.ts`.

The key is **never** sent to the browser. Do not create a `NEXT_PUBLIC_GEMINI_API_KEY`.

If Gemini is missing, rate-limited, or unavailable, the mascot automatically falls back to the local static guide.

## Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**:

| Name | Required | Example |
|---|---|---|
| `GEMINI_API_KEY` | Yes | your Google AI Studio key |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` |
| `PUBLIC_ASSISTANT_RATE_LIMIT` | No | `20` requests per IP per 10 minutes |
| `PUBLIC_ASSISTANT_DAILY_LIMIT` | No | `300` requests per server instance per day |
| `NEXT_PUBLIC_APP_MODE` | Yes | `static` |

The route tries the configured model first, then `gemini-flash-latest` and `gemini-3.5-flash` if the first model is unavailable.

## Local testing

Put the key in `frontend/.env.local` (gitignored):

```bash
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.1-flash-lite
NEXT_PUBLIC_APP_MODE=static
```

Then run:

```bash
cd frontend
npm run dev
```

Test the route directly:

```bash
curl -X POST http://localhost:3000/api/public-assistant \
  -H 'Content-Type: application/json' \
  -d '{"question":"what is western university","language":"en"}'
```

## Conversation memory

The browser sends the last six chat messages with each request. The Gemini route includes them as conversation turns, so follow-ups such as “tell me more”, “what about its tuition?”, and “which one is cheaper?” keep the previous subject.

## Cost and abuse protection

- `maxOutputTokens` is capped at 380.
- Questions are limited to 500 characters.
- Per-IP rate limiting defaults to 20 requests per 10 minutes.
- A per-instance daily cap defaults to 300 requests.
- The route sends a limited catalogue context, not the full database.
- Do not enable public Gemini without a rate limit.

The in-memory limiter is approximate on serverless because each Vercel instance has its own memory. For stronger protection, put the rate limit in Upstash Redis or Vercel KV, or add a Vercel WAF rule.

## What the assistant can answer

The route is grounded in the static catalogue:

- Universities and acronyms
- Majors and categories
- Tuition ranges
- Program counts
- Scholarships and deadlines
- Student Personality/RIASEC context sent from localStorage

It is instructed not to invent admission requirements, tuition, or deadlines. It returns source links to the internal catalogue pages.

## Fallback order

1. Gemini answer
2. Local rule-based guide if Gemini is unavailable or over quota
3. Friendly fallback with suggested questions

The public UI does not label which path answered. Both paths are presented as the same OrienX assistant. The route returns `mode` and `model` internally for debugging.
