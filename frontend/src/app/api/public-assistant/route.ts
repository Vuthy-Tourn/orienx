import {
  STATIC_MAJORS,
  STATIC_SCHOLARSHIPS,
  STATIC_UNIVERSITIES,
  getStaticMajor,
  getStaticUniversity,
  staticSearch,
} from "@/lib/data/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-3.5-flash"];

type Language = "en" | "km";

interface RateBucket {
  count: number;
  resetAt: number;
}

interface DailyCounter {
  day: string;
  count: number;
}

interface StudentProfile {
  personalityType?: string;
  hollandCode?: string;
  topMajors?: string[];
}

interface AssistantSource {
  type: string;
  title_en: string;
  title_km: string;
  url: string;
  snippet_en: string;
  snippet_km: string;
}

const globalStore = globalThis as unknown as {
  __orienxAssistantBuckets?: Map<string, RateBucket>;
  __orienxAssistantDaily?: DailyCounter;
};

const buckets =
  globalStore.__orienxAssistantBuckets ??
  (globalStore.__orienxAssistantBuckets = new Map<string, RateBucket>());

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const limit = Math.max(1, Number(process.env.PUBLIC_ASSISTANT_RATE_LIMIT || 20));
  const current = buckets.get(ip);
  if (!current || current.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { ok: true };
}

function checkDailyLimit(): { ok: true } | { ok: false } {
  const day = new Date().toISOString().slice(0, 10);
  const limit = Math.max(1, Number(process.env.PUBLIC_ASSISTANT_DAILY_LIMIT || 300));
  const current = globalStore.__orienxAssistantDaily;
  if (!current || current.day !== day) {
    globalStore.__orienxAssistantDaily = { day, count: 1 };
    return { ok: true };
  }
  if (current.count >= limit) return { ok: false };
  current.count += 1;
  return { ok: true };
}

function sanitizeProfile(value: unknown): StudentProfile | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const profile: StudentProfile = {};
  if (
    typeof record.personalityType === "string" &&
    /^[EI][SN][TF][JP]$/i.test(record.personalityType)
  ) {
    profile.personalityType = record.personalityType.toUpperCase();
  }
  if (
    typeof record.hollandCode === "string" &&
    /^[RIASEC]{3}$/i.test(record.hollandCode)
  ) {
    profile.hollandCode = record.hollandCode.toUpperCase();
  }
  if (Array.isArray(record.topMajors)) {
    profile.topMajors = record.topMajors
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.slice(0, 100))
      .slice(0, 5);
  }
  return Object.keys(profile).length > 0 ? profile : null;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "can",
  "detail",
  "details",
  "do",
  "does",
  "for",
  "from",
  "give",
  "hello",
  "help",
  "how",
  "i",
  "in",
  "information",
  "is",
  "it",
  "me",
  "much",
  "my",
  "of",
  "on",
  "or",
  "please",
  "show",
  "tell",
  "the",
  "to",
  "what",
  "which",
  "with",
  "you",
  "តើ",
  "មាន",
  "អ្វី",
  "ខ្លះ",
  "នៅ",
  "ក្នុង",
  "ជា",
  "ដែល",
  "ខ្ញុំ",
  "អាច",
  "ទេ",
  "សូម",
  "របស់",
  "និង",
  "ឬ",
  "មួយ",
  "ពី",
]);

function extractSearchQuery(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[?!.,;:()[\]{}"']/g, " ")
    .split(/\s+/)
    .filter(
      (word) => word.length > 1 && !SEARCH_STOP_WORDS.has(word)
    );
  return words.join(" ").trim() || question;
}

function compactDescription(value: { en?: string; km?: string } | null | undefined): string {
  if (!value) return "";
  return (value.en || "").replace(/\s+/g, " ").trim().slice(0, 480);
}

function buildCatalogContext(
  question: string,
  language: Language,
  profile: StudentProfile | null
): string {
  const lines: string[] = [];
  lines.push("VERIFIED ORIENX CATALOG (Cambodia):");
  lines.push("");
  lines.push("UNIVERSITIES:");
  STATIC_UNIVERSITIES.forEach((university) => {
    const tuition =
      university.tuition_range_min_usd != null
        ? `$${Math.round(university.tuition_range_min_usd)}-$${Math.round(
            university.tuition_range_max_usd ?? university.tuition_range_min_usd
          )}/year`
        : "tuition not published";
    lines.push(
      `- ${university.name.en} (${university.acronym.en}) — ${university.province}, ${university.university_type.toLowerCase()}, ${tuition}, ${university.offerings.length} programs`
    );
  });
  lines.push("");
  lines.push("MAJORS:");
  STATIC_MAJORS.forEach((major) => {
    lines.push(
      `- ${major.name.en} — ${major.category}, RIASEC ${major.riasec_primary}${major.riasec_secondary}, ${major.universities_count} universities, from ${
        major.min_tuition_usd != null ? `$${Math.round(major.min_tuition_usd)}/year` : "tuition not published"
      }`
    );
  });
  lines.push("");
  lines.push("SCHOLARSHIPS:");
  STATIC_SCHOLARSHIPS.forEach((scholarship) => {
    lines.push(
      `- ${scholarship.title.en} — ${scholarship.provider.en}, ${scholarship.coverage_type.replaceAll(
        "_",
        " "
      )}, deadline ${scholarship.application_deadline || "not published"}`
    );
  });

  const search = staticSearch(extractSearchQuery(question), 4);
  if (search.total > 0) {
    lines.push("");
    lines.push("MATCHED RECORDS FOR THIS QUESTION:");
    search.universities.forEach((item) => {
      const university = getStaticUniversity(item.slug);
      if (!university) return;
      lines.push(
        `University: ${university.name.en} (${university.acronym.en}). ${compactDescription(
          university.description
        )}`
      );
      lines.push(
        `Programs: ${university.offerings
          .slice(0, 8)
          .map((offering) => offering.major_name.en)
          .join(", ")}. Website: ${university.website_url}`
      );
    });
    search.majors.forEach((item) => {
      const major = getStaticMajor(item.slug);
      if (!major) return;
      lines.push(
        `Major: ${major.name.en}. ${compactDescription(major.description)}`
      );
      lines.push(
        `Offered by: ${major.universities
          .slice(0, 8)
          .map((university) => university.university_name.en)
          .join(", ")}.`
      );
    });
  }

  if (profile) {
    lines.push("");
    lines.push("STUDENT'S LOCAL RESULT CONTEXT (no name or contact data):");
    if (profile.personalityType) {
      lines.push(`- Personality type: ${profile.personalityType}`);
    }
    if (profile.hollandCode) {
      lines.push(`- Holland code: ${profile.hollandCode}`);
    }
    if (profile.topMajors?.length) {
      lines.push(`- Top interest-fit majors: ${profile.topMajors.join(", ")}`);
    }
  }

  lines.push("");
  lines.push(`ANSWER LANGUAGE: ${language === "km" ? "Khmer" : "English"}.`);
  return lines.join("\n");
}

function buildSources(question: string): AssistantSource[] {
  const search = staticSearch(extractSearchQuery(question), 5);
  const sources: AssistantSource[] = [];
  search.universities.forEach((university) => {
    sources.push({
      type: "university",
      title_en: university.name.en,
      title_km: university.name.km,
      url: `/universities/${university.slug}`,
      snippet_en: `${university.acronym.en} · ${university.province}`,
      snippet_km: `${university.acronym.km} · ${university.province}`,
    });
  });
  search.majors.forEach((major) => {
    sources.push({
      type: "major",
      title_en: major.name.en,
      title_km: major.name.km,
      url: `/majors/${major.slug}`,
      snippet_en: `${major.category} · ${major.universities_count} universities`,
      snippet_km: `${major.category} · ${major.universities_count} សាកលវិទ្យាល័យ`,
    });
  });
  search.careers.forEach((career) => {
    sources.push({
      type: "career",
      title_en: career.title.en,
      title_km: career.title.km,
      url: `/careers/${career.slug}`,
      snippet_en: career.industry,
      snippet_km: career.industry,
    });
  });
  search.scholarships.forEach((scholarship) => {
    sources.push({
      type: "scholarship",
      title_en: scholarship.title.en,
      title_km: scholarship.title.km,
      url: `/scholarships/${scholarship.slug}`,
      snippet_en: scholarship.coverage_type.replaceAll("_", " ").toLowerCase(),
      snippet_km: scholarship.coverage_type.replaceAll("_", " ").toLowerCase(),
    });
  });
  if (sources.length === 0) {
    sources.push(
      {
        type: "page",
        title_en: "Explore majors",
        title_km: "រកមើលជំនាញ",
        url: "/majors",
        snippet_en: "Browse all majors",
        snippet_km: "រកមើលជំនាញទាំងអស់",
      },
      {
        type: "page",
        title_en: "Explore universities",
        title_km: "រកមើលសាកលវិទ្យាល័យ",
        url: "/universities",
        snippet_en: "Browse all universities",
        snippet_km: "រកមើលសាកលវិទ្យាល័យទាំងអស់",
      }
    );
  }
  return sources.slice(0, 5);
}

function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text);
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  question: string,
  language: Language
): Promise<{ text: string; model: string }> {
  const models = [
    process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
    ...FALLBACK_MODELS,
  ].filter((model, index, list) => list.indexOf(model) === index);

  let lastError = "Gemini request failed.";
  for (const model of models) {
    try {
      let text = await generateOnce(apiKey, model, systemPrompt, question);
      if (language === "km" && containsThai(text)) {
        text = await generateOnce(
          apiKey,
          model,
          `${systemPrompt}\n\nCRITICAL: Write Khmer Unicode only (U+1780–U+17FF). Never use Thai characters. If you cannot write natural Khmer, answer in English.`,
          question
        );
      }
      if (text) return { text, model };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError);
}

async function generateOnce(
  apiKey: string,
  model: string,
  systemPrompt: string,
  question: string
): Promise<string> {
  const response = await fetch(
    `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 380,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.error?.message || "";
    } catch {
      // Ignore malformed error bodies.
    }
    throw new Error(
      `Gemini ${model} failed (${response.status})${detail ? `: ${detail}` : ""}`
    );
  }

  const data = await response.json();
  const candidates = data?.candidates || [];
  if (!candidates.length) throw new Error("Gemini returned no answer.");
  const parts = candidates[0]?.content?.parts || [];
  const text = parts
    .map((part: { text?: string }) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty answer.");
  return text;
}

function suggestedQuestions(language: Language): string[] {
  return language === "km"
    ? [
        "តើខ្ញុំគួរធ្វើតេស្តមួយណា?",
        "បង្ហាញជំនាញកំពូលរបស់ខ្ញុំ",
        "ថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?",
        "មានអាហារូបករណ៍អ្វីខ្លះ?",
      ]
    : [
        "Which test should I take?",
        "Show my top majors",
        "How much is ITC tuition?",
        "What scholarships are available?",
      ];
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return Response.json(
      {
        error: "rate_limited",
        fallback: true,
        message: "Too many assistant requests. The local guide is still available.",
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rate.retryAfter),
        },
      }
    );
  }
  if (!checkDailyLimit().ok) {
    return Response.json(
      {
        error: "daily_limit_reached",
        fallback: true,
        message: "The public Gemini limit was reached for today.",
      },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = await request.json().catch(() => null);
  const question =
    body && typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 2 || question.length > 500) {
    return Response.json(
      { error: "invalid_question", fallback: true },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  const language: Language = body?.language === "km" ? "km" : "en";
  const profile = sanitizeProfile(body?.profile);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error: "not_configured",
        fallback: true,
        message: "GEMINI_API_KEY is not configured.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const catalogContext = buildCatalogContext(question, language, profile);
  const systemPrompt = `You are Tara, the OrienX student guidance assistant for Cambodian high school and university-bound students.

Answer in ${language === "km" ? "natural Khmer Unicode" : "clear English"}.
Keep the answer warm, practical, and concise: 120-180 words, short paragraphs or bullets.
Do not start with "Hello", "Hi", "សួស្តី", or introduce yourself. Start directly with the answer.
Use ONLY the verified context below. If the context does not contain the answer, say so and suggest a next step.
Never invent tuition, deadlines, admission requirements, program names, or university facts.
When discussing fit, say "interest fit" or "published minimum", never guarantee admission.
Do not claim to be a therapist or provide medical advice.
Do not use markdown headings. Plain text with simple bullet points is fine.

${catalogContext}`;

  try {
    const { text, model } = await callGemini(
      apiKey,
      systemPrompt,
      question,
      language
    );
    return Response.json(
      {
        answer: text,
        mode: "gemini",
        model,
        sources: buildSources(question),
        suggested_questions: suggestedQuestions(language),
        tools_used: [],
        warning: null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Public assistant Gemini failure:",
      error instanceof Error ? error.message : error
    );
    return Response.json(
      {
        error: "gemini_unavailable",
        fallback: true,
        message: "Gemini is temporarily unavailable. Using the local guide.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
