import {
  STATIC_CAREERS,
  STATIC_MAJORS,
  STATIC_OFFERINGS,
  STATIC_SCHOLARSHIPS,
  STATIC_UNIVERSITIES,
  getStaticMajor,
  getStaticUniversity,
  staticSearch,
} from "@/lib/data/catalog";
import { readLatestResult } from "@/lib/guest/storage";
import { recommendMajorMatches } from "@/lib/guest/recommendations";
import type {
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";

export type AssistantLanguage = "en" | "km";

export interface StaticAssistantSource {
  type: string;
  title_en: string;
  title_km: string;
  url: string;
  snippet_en: string;
  snippet_km: string;
}

export interface StaticAssistantAnswer {
  answer: string;
  sources: StaticAssistantSource[];
  suggested_questions: string[];
  tools_used: string[];
}

const GRADE_RANK: Record<string, number> = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  F: 1,
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "about",
  "at",
  "be",
  "can",
  "compare",
  "do",
  "does",
  "for",
  "from",
  "get",
  "hello",
  "help",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "much",
  "my",
  "of",
  "offer",
  "offers",
  "on",
  "or",
  "please",
  "show",
  "tell",
  "the",
  "there",
  "to",
  "universities",
  "university",
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

function pick(language: AssistantLanguage, en: string, km: string): string {
  return language === "km" ? km : en;
}

function getLocalizedText(value: unknown, language: AssistantLanguage): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as { en?: string; km?: string };
    return language === "km"
      ? record.km || record.en || ""
      : record.en || record.km || "";
  }
  return "";
}

function usd(value: number | null | undefined): string {
  if (value == null) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function sourceForMajor(slug: string): StaticAssistantSource | null {
  const major = getStaticMajor(slug);
  if (!major) return null;
  return {
    type: "major",
    title_en: major.name.en,
    title_km: major.name.km,
    url: `/majors/${major.slug}`,
    snippet_en: `${major.category} · ${major.universities_count} universities`,
    snippet_km: `${major.category} · ${major.universities_count} សាកលវិទ្យាល័យ`,
  };
}

function sourceForUniversity(slug: string): StaticAssistantSource | null {
  const university = getStaticUniversity(slug);
  if (!university) return null;
  return {
    type: "university",
    title_en: university.name.en,
    title_km: university.name.km,
    url: `/universities/${university.slug}`,
    snippet_en: `${university.acronym.en} · ${university.province}`,
    snippet_km: `${university.acronym.km} · ${university.province}`,
  };
}

function sourceForScholarship(slug: string): StaticAssistantSource | null {
  const scholarship = STATIC_SCHOLARSHIPS.find((item) => item.slug === slug);
  if (!scholarship) return null;
  return {
    type: "scholarship",
    title_en: scholarship.title.en,
    title_km: scholarship.title.km,
    url: `/scholarships/${scholarship.slug}`,
    snippet_en: scholarship.coverage_type.replaceAll("_", " ").toLowerCase(),
    snippet_km: scholarship.coverage_type.replaceAll("_", " ").toLowerCase(),
  };
}

function suggestions(language: AssistantLanguage): string[] {
  return language === "km"
    ? [
        "តើខ្ញុំគួរធ្វើតេស្តមួយណា?",
        "បង្ហាញជំនាញកំពូលរបស់ខ្ញុំ",
        "តើខ្ញុំនាំចេញលទ្ធផលដោយរបៀបណា?",
        "ថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?",
        "មានអាហារូបករណ៍អ្វីខ្លះ?",
        "តើខ្ញុំអាចចូលរៀនដោយនិទ្ទេស C បានទេ?",
      ]
    : [
        "Which test should I take?",
        "Show my top majors",
        "How do I export my result?",
        "How much is ITC tuition?",
        "What scholarships are available?",
        "Can I get in with a grade C?",
      ];
}

function extractQuery(question: string): string {
  return question
    .toLowerCase()
    .replace(/[?!.,;:()[\]{}"']/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word))
    .join(" ")
    .trim();
}

function has(question: string, terms: string[]): boolean {
  return terms.some((term) => question.includes(term));
}

function resultSources(
  language: AssistantLanguage,
  matches: ReturnType<typeof recommendMajorMatches>
): StaticAssistantSource[] {
  return matches
    .slice(0, 4)
    .map((match) => sourceForMajor(match.slug))
    .filter((item): item is StaticAssistantSource => Boolean(item));
}

function answerEligibility(
  question: string,
  language: AssistantLanguage
): StaticAssistantAnswer | null {
  if (!has(question, ["bacii", "បាក់ឌុប", "grade", "និទ្ទេស"])) {
    return null;
  }
  const match = question.match(/\b([A-F])\b/i);
  if (!match) return null;
  const grade = match[1].toUpperCase();
  const studentRank = GRADE_RANK[grade];
  if (!studentRank) return null;

  const eligible = STATIC_OFFERINGS.filter(
    (offering) =>
      offering.min_bacii_grade &&
      studentRank >= GRADE_RANK[offering.min_bacii_grade]
  );
  const below = STATIC_OFFERINGS.filter(
    (offering) =>
      offering.min_bacii_grade &&
      studentRank < GRADE_RANK[offering.min_bacii_grade]
  );
  const missing = STATIC_OFFERINGS.filter(
    (offering) => !offering.min_bacii_grade
  );
  const eligibleUniversities = Array.from(
    new Set(eligible.map((offering) => offering.university_slug))
  );
  const topUniversities = eligibleUniversities
    .slice(0, 3)
    .map((slug) => {
      const university = getStaticUniversity(slug);
      return university ? pick(language, university.name.en, university.name.km) : slug;
    })
    .filter(Boolean);

  const answer = pick(
    language,
    `With BACII grade ${grade}, ${eligible.length} of ${STATIC_OFFERINGS.length} published programs are within reach. ${below.length} require a higher grade, and ${missing.length} do not have a published minimum yet.\n\nExamples: ${topUniversities.join(", ")}.\n\nEntrance exams, English tests, and program-specific cutoffs may still apply.`,
    `ជាមួយនិទ្ទេស BACII ${grade} អ្នកអាចចូលរៀនបាន ${eligible.length} ក្នុងចំណោម ${STATIC_OFFERINGS.length} កម្មវិធីដែលបានផ្សាយ។ ${below.length} ត្រូវការនិទ្ទេសខ្ពស់ជាង ហើយ ${missing.length} មិនទាន់មានពិន្ទុអប្បបរមាផ្សាយទេ។\n\nឧទាហរណ៍៖ ${topUniversities.join(", ")}។\n\nការប្រឡងចូល តេស្តអង់គ្លេស និងលក្ខខណ្ឌជាក់លាក់របស់កម្មវិធីនៅតែអាចអនុវត្តបាន។`
  );

  return {
    answer,
    sources: [
      {
        type: "page",
        title_en: "BACII guide",
        title_km: "មគ្គុទ្ទេសក៍ BACII",
        url: "/bacii",
        snippet_en: "Official admission requirements",
        snippet_km: "លក្ខខណ្ឌចូលរៀនផ្លូវការ",
      },
    ],
    suggested_questions: suggestions(language).slice(0, 4),
    tools_used: ["check_eligibility"],
  };
}

function answerResults(language: AssistantLanguage): StaticAssistantAnswer {
  const personality = readLatestResult("personality")?.result as
    | PersonalityResult
    | undefined;
  const riasec = readLatestResult("riasec")?.result as RiasecResult | undefined;

  if (!personality && !riasec) {
    return {
      answer: pick(
        language,
        "You have not completed a test on this device yet. Start with the Personality or RIASEC test. Both are free and take only a few minutes.",
        "អ្នកមិនទាន់បានធ្វើតេស្តនៅលើឧបករណ៍នេះទេ។ ចាប់ផ្តើមជាមួយតេស្តបុគ្គលិកលក្ខណៈ ឬ RIASEC។ ទាំងពីរឥតគិតថ្លៃ និងចំណាយពេលតែប៉ុន្មាននាទីប៉ុណ្ណោះ។"
      ),
      sources: [
        {
          type: "page",
          title_en: "Personality test",
          title_km: "តេស្តបុគ្គលិកលក្ខណៈ",
          url: "/assessments/personality/test",
          snippet_en: "12 statements · about 3 minutes",
          snippet_km: "១២ សំណើ · ប្រហែល ៣ នាទី",
        },
        {
          type: "page",
          title_en: "RIASEC test",
          title_km: "តេស្ត RIASEC",
          url: "/assessments/riasec/test",
          snippet_en: "18 activities · about 4 minutes",
          snippet_km: "១៨ សកម្មភាព · ប្រហែល ៤ នាទី",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  const matches = recommendMajorMatches({ personality, riasec, limit: 5 });
  const lines = matches.map(
    (match, index) =>
      `${index + 1}. ${pick(language, match.name.en, match.name.km)} — ${match.fit}% ${pick(language, "interest fit", "ត្រូវគ្នា")}`
  );
  const headline = [
    personality ? `${pick(language, "Personality", "បុគ្គលិកលក្ខណៈ")}: ${personality.type}` : "",
    riasec ? `RIASEC: ${riasec.hollandCode}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    answer: `${headline}\n\n${pick(
      language,
      "Your strongest major matches:",
      "ជំនាញដែលត្រូវគ្នាខ្លាំងបំផុតរបស់អ្នក៖"
    )}\n${lines.join("\n")}\n\n${pick(
      language,
      "This is an interest fit, not an admission decision. Open My results to export or share the full report.",
      "នេះជាភាពត្រូវគ្នានៃចំណាប់អារម្មណ៍ មិនមែនជាការសម្រេចចិត្តចូលរៀនទេ។ បើកលទ្ធផលរបស់ខ្ញុំ ដើម្បីនាំចេញ ឬចែករំលែករបាយការណ៍ពេញលេញ។"
    )}`,
    sources: [
      ...resultSources(language, matches),
      {
        type: "page",
        title_en: "My results",
        title_km: "លទ្ធផលរបស់ខ្ញុំ",
        url: "/assessments/results",
        snippet_en: "Export, share, and compare attempts",
        snippet_km: "នាំចេញ ចែករំលែក និងប្រៀបធៀបការប៉ុនប៉ង",
      },
    ],
    suggested_questions: suggestions(language).slice(0, 4),
    tools_used: [],
  };
}

function answerTuition(
  question: string,
  language: AssistantLanguage
): StaticAssistantAnswer | null {
  if (!has(question, ["tuition", "fee", "cost", "ថ្លៃ", "ចំណាយ"])) {
    return null;
  }
  const query = extractQuery(question)
    .replace(/\b(tuition|fee|cost)\b/g, "")
    .replace(/ថ្លៃ|ចំណាយ/g, "")
    .trim();
  const university = STATIC_UNIVERSITIES.find(
    (item) =>
      item.slug === query ||
      item.acronym.en.toLowerCase() === query ||
      item.acronym.km.toLowerCase() === query ||
      question.includes(item.acronym.en.toLowerCase()) ||
      question.includes(item.acronym.km.toLowerCase()) ||
      item.name.en.toLowerCase().includes(query) ||
      (query.length > 0 && item.name.km.includes(query))
  );
  if (university) {
    const tuitions = university.offerings
      .map((offering) => offering.tuition_annual_usd)
      .filter((value): value is number => value != null);
    const min = tuitions.length ? Math.min(...tuitions) : null;
    const max = tuitions.length ? Math.max(...tuitions) : null;
    return {
      answer: pick(
        language,
        `${university.name.en} (${university.acronym.en}) is in ${university.province}. Published annual tuition across its programs is ${usd(min)} – ${usd(max)}. Always confirm the latest fee with the university.`,
        `${university.name.km} (${university.acronym.km}) ស្ថិតនៅ ${university.province}។ ថ្លៃសិក្សាប្រចាំឆ្នាំដែលបានផ្សាយសម្រាប់កម្មវិធីរបស់ខ្លួនគឺ ${usd(min)} – ${usd(max)}។ សូមផ្ទៀងផ្ទាត់ថ្លៃចុងក្រោយជាមួយសាកលវិទ្យាល័យ។`
      ),
      sources: [sourceForUniversity(university.slug)].filter(
        (item): item is StaticAssistantSource => Boolean(item)
      ),
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: ["search_universities"],
    };
  }

  const cheapest = STATIC_MAJORS.filter(
    (major) => major.min_tuition_usd != null
  )
    .sort(
      (a, b) =>
        (a.min_tuition_usd ?? Number.MAX_SAFE_INTEGER) -
        (b.min_tuition_usd ?? Number.MAX_SAFE_INTEGER)
    )
    .slice(0, 4);

  return {
    answer: `${pick(
      language,
      "Lowest published starting tuition by major:",
      "ថ្លៃសិក្សាចាប់ផ្តើមទាបបំផុតតាមជំនាញ៖"
    )}\n${cheapest
      .map(
        (major) =>
          `• ${pick(language, major.name.en, major.name.km)} — ${pick(
            language,
            "from",
            "ចាប់ពី"
          )} ${usd(major.min_tuition_usd)}/${pick(language, "year", "ឆ្នាំ")}`
      )
      .join("\n")}\n\n${pick(
      language,
      "Ask me about a specific university, for example: How much is ITC tuition?",
      "សួរខ្ញុំអំពីសាកលវិទ្យាល័យជាក់លាក់ ឧទាហរណ៍៖ ថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?"
    )}`,
    sources: cheapest
      .map((major) => sourceForMajor(major.slug))
      .filter((item): item is StaticAssistantSource => Boolean(item)),
    suggested_questions: suggestions(language).slice(0, 4),
    tools_used: [],
  };
}

function answerScholarships(language: AssistantLanguage): StaticAssistantAnswer {
  const rows = STATIC_SCHOLARSHIPS.map((scholarship) => {
    const deadline = scholarship.application_deadline
      ? ` · ${pick(language, "deadline", "ផុតកំណត់")}: ${scholarship.application_deadline}`
      : "";
    return `• ${pick(language, scholarship.title.en, scholarship.title.km)} — ${pick(
      language,
      scholarship.provider.en,
      scholarship.provider.km
    )}${deadline}`;
  });

  return {
    answer: `${pick(
      language,
      "Verified scholarships in the directory:",
      "អាហារូបករណ៍ដែលបានផ្ទៀងផ្ទាត់ក្នុងបញ្ជី៖"
    )}\n${rows.join("\n")}\n\n${pick(
      language,
      "Open a scholarship to see eligibility, the application process, and the official link.",
      "បើកអាហារូបករណ៍ដើម្បីមើលលក្ខខណ្ឌ ដំណើរការដាក់ពាក្យ និងតំណផ្លូវការ។"
    )}`,
    sources: STATIC_SCHOLARSHIPS.map((scholarship) =>
      sourceForScholarship(scholarship.slug)
    ).filter((item): item is StaticAssistantSource => Boolean(item)),
    suggested_questions: suggestions(language).slice(0, 4),
    tools_used: [],
  };
}

function includesEntity(text: string, value: string): boolean {
  const needle = value.toLowerCase().trim();
  if (!needle) return false;
  if (/[\u1780-\u17FF]/.test(needle)) {
    return text.includes(needle);
  }
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function namePrefixScore(text: string, value: string): number {
  const words = value
    .toLowerCase()
    .replace(/[&/,]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
  for (let count = Math.min(words.length, 4); count >= 1; count -= 1) {
    const phrase = words.slice(0, count).join(" ");
    if (phrase.length >= 4 && includesEntity(text, phrase)) {
      return phrase.length;
    }
  }
  return 0;
}

function answerEntityDetail(
  question: string,
  language: AssistantLanguage
): StaticAssistantAnswer | null {
  if (
    !has(question, [
      "what is",
      "what are",
      "tell me about",
      "detail",
      "details",
      "more about",
      "information about",
      "explain",
      "អំពី",
      "លម្អិត",
      "ពន្យល់",
    ])
  ) {
    return null;
  }

  const asksUniversity = has(question, ["university", "សាកលវិទ្យាល័យ"]);

  const universityMatches = STATIC_UNIVERSITIES.map((university) => {
    const values = [
      university.slug,
      university.acronym.en,
      university.acronym.km,
      university.name.en,
      university.name.km,
    ];
    const matched = values.filter((value) => includesEntity(question, value));
    return {
      university,
      score: matched.length
        ? Math.max(...matched.map((value) => value.length))
        : 0,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const university = universityMatches[0]?.university;

  const majorMatches = STATIC_MAJORS.map((major) => {
    const values = [major.slug, major.name.en, major.name.km];
    const matched = values.filter((value) => includesEntity(question, value));
    return {
      major,
      score: Math.max(
        matched.length ? Math.max(...matched.map((value) => value.length)) : 0,
        namePrefixScore(question, major.name.en),
        namePrefixScore(question, major.name.km)
      ),
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const major = majorMatches[0]?.major;

  // Prefer an explicit university question. Otherwise prefer a major match,
  // so "what is law" returns the major, not a university containing "law".
  const chosenUniversity = asksUniversity ? university : major ? null : university;
  const chosenMajor = asksUniversity ? null : major;

  if (chosenUniversity) {
    const description = getLocalizedText(
      chosenUniversity.description,
      language
    );
    const summary = description
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(" ")
      .slice(0, 620);
    const tuitionValues = chosenUniversity.offerings
      .map((offering) => offering.tuition_annual_usd)
      .filter((value): value is number => value != null);
    const minTuition =
      chosenUniversity.tuition_range_min_usd ??
      (tuitionValues.length ? Math.min(...tuitionValues) : null);
    const maxTuition =
      chosenUniversity.tuition_range_max_usd ??
      (tuitionValues.length ? Math.max(...tuitionValues) : null);
    const uniquePrograms = Array.from(
      new Map(
        chosenUniversity.offerings.map((offering) => [
          offering.major_slug,
          offering,
        ])
      ).values()
    );
    const topPrograms = uniquePrograms.slice(0, 5).map((offering) =>
      getLocalizedText(offering.major_name, language)
    );
    const typeLabel =
      chosenUniversity.university_type === "PUBLIC"
        ? pick(language, "public", "សាធារណៈ")
        : pick(language, "private", "ឯកជន");

    return {
      answer: pick(
        language,
        `${chosenUniversity.name.en} (${chosenUniversity.acronym.en}) is a ${typeLabel} university in ${chosenUniversity.province}. ${summary}\n\nPrograms: ${uniquePrograms.length}\nAnnual tuition: ${usd(minTuition)} – ${usd(maxTuition)}\nPopular programs: ${topPrograms.join(", ") || "—"}\nWebsite: ${chosenUniversity.website_url}`,
        `${chosenUniversity.name.km} (${chosenUniversity.acronym.km}) គឺជាសាកលវិទ្យាល័យ${typeLabel} នៅ ${chosenUniversity.province}។ ${summary}\n\nកម្មវិធីសិក្សា៖ ${uniquePrograms.length}\nថ្លៃសិក្សាប្រចាំឆ្នាំ៖ ${usd(minTuition)} – ${usd(maxTuition)}\nកម្មវិធីពេញនិយម៖ ${topPrograms.join(", ") || "—"}\nគេហទំព័រ៖ ${chosenUniversity.website_url}`
      ),
      sources: [
        sourceForUniversity(chosenUniversity.slug),
        ...uniquePrograms
          .slice(0, 2)
          .map((offering) => sourceForMajor(offering.major_slug)),
      ].filter((item): item is StaticAssistantSource => Boolean(item)),
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: ["search_universities"],
    };
  }

  if (chosenMajor) {
    const description = getLocalizedText(chosenMajor.description, language);
    const topUniversities = chosenMajor.universities.slice(0, 5);
    const careers = chosenMajor.careers
      .slice(0, 4)
      .map((career) => getLocalizedText(career.title, language));
    return {
      answer: pick(
        language,
        `${chosenMajor.name.en} is in ${chosenMajor.category}. ${description}\n\nOffered by ${chosenMajor.universities_count} universities. Lowest published annual tuition: ${usd(chosenMajor.min_tuition_usd)}.\nUniversities: ${topUniversities.map((item) => item.university_name.en).join(", ") || "—"}\nRelated careers: ${careers.join(", ") || "—"}`,
        `${chosenMajor.name.km} ស្ថិតក្នុងវិស័យ ${chosenMajor.category}។ ${description}\n\nមាន ${chosenMajor.universities_count} សាកលវិទ្យាល័យបង្រៀន។ ថ្លៃសិក្សាប្រចាំឆ្នាំទាបបំផុតដែលបានផ្សាយ៖ ${usd(chosenMajor.min_tuition_usd)}។\nសាកលវិទ្យាល័យ៖ ${topUniversities.map((item) => item.university_name.km).join(", ") || "—"}\nអាជីពពាក់ព័ន្ធ៖ ${careers.join(", ") || "—"}`
      ),
      sources: [
        sourceForMajor(chosenMajor.slug),
        ...topUniversities
          .slice(0, 2)
          .map((item) => sourceForUniversity(item.university_slug)),
      ].filter((item): item is StaticAssistantSource => Boolean(item)),
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  const career = STATIC_CAREERS.find((item) =>
    includesEntity(question, item.title.en) ||
    includesEntity(question, item.title.km)
  );
  if (career) {
    return {
      answer: pick(
        language,
        `${career.title.en} is a career in ${career.industry}. ${career.description.en || ""}\n\nTypical responsibilities: ${career.responsibilities.slice(0, 4).join(", ")}\nSkills to build: ${career.required_skills.slice(0, 4).join(", ")}\nRelated majors: ${career.related_majors.map((major) => major.name.en).join(", ")}`,
        `${career.title.km} គឺជាអាជីពក្នុងវិស័យ ${career.industry}។ ${career.description.km || ""}\n\nភារកិច្ចសំខាន់៖ ${career.responsibilities.slice(0, 4).join(", ")}\nជំនាញដែលត្រូវបង្កើត៖ ${career.required_skills.slice(0, 4).join(", ")}\nជំនាញសិក្សាពាក់ព័ន្ធ៖ ${career.related_majors.map((major) => major.name.km).join(", ")}`
      ),
      sources: [
        {
          type: "career",
          title_en: career.title.en,
          title_km: career.title.km,
          url: `/careers/${career.slug}`,
          snippet_en: career.industry,
          snippet_km: career.industry,
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  const scholarship = STATIC_SCHOLARSHIPS.find(
    (item) =>
      includesEntity(question, item.title.en) ||
      includesEntity(question, item.title.km) ||
      includesEntity(question, item.provider.en) ||
      includesEntity(question, item.provider.km)
  );
  if (scholarship) {
    const eligibility =
      (scholarship.eligibility_criteria as { en?: string[] } | null)?.en ?? [];
    return {
      answer: pick(
        language,
        `${scholarship.title.en} is provided by ${scholarship.provider.en}. ${scholarship.description.en || ""}\n\nCoverage: ${scholarship.coverage_type.replaceAll("_", " ").toLowerCase()}\nDeadline: ${scholarship.application_deadline || "Not published"}\nEligibility: ${eligibility.slice(0, 4).join("; ") || "See the official page"}\nOfficial link: ${scholarship.official_url}`,
        `${scholarship.title.km} ផ្តល់ដោយ ${scholarship.provider.km}។ ${scholarship.description.km || ""}\n\nកម្រិតជំនួយ៖ ${scholarship.coverage_type.replaceAll("_", " ").toLowerCase()}\nផុតកំណត់៖ ${scholarship.application_deadline || "មិនទាន់ផ្សាយ"}\nលក្ខខណ្ឌ៖ ${eligibility.slice(0, 4).join("; ") || "សូមមើលទំព័រផ្លូវការ"}\nតំណផ្លូវការ៖ ${scholarship.official_url}`
      ),
      sources: [
        sourceForScholarship(scholarship.slug),
      ].filter((item): item is StaticAssistantSource => Boolean(item)),
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  return null;
}

function answerSearch(
  question: string,
  language: AssistantLanguage
): StaticAssistantAnswer | null {
  const query = extractQuery(question) || question;
  const results = staticSearch(query, 5);
  if (results.total === 0) return null;

  const lines: string[] = [];
  if (results.majors.length > 0) {
    const topMajor = getStaticMajor(results.majors[0].slug);
    if (topMajor && topMajor.universities.length > 0) {
      lines.push(
        pick(
          language,
          `Universities offering ${topMajor.name.en}:`,
          `សាកលវិទ្យាល័យដែលបង្រៀន ${topMajor.name.km}៖`
        )
      );
      topMajor.universities.slice(0, 5).forEach((university) => {
        lines.push(
          `• ${pick(language, university.university_name.en, university.university_name.km)} (${university.university_acronym.en})`
        );
      });
      lines.push("");
    }
  }
  if (results.universities.length) {
    lines.push(pick(language, "Universities:", "សាកលវិទ្យាល័យ៖"));
    results.universities.forEach((university) => {
      lines.push(`• ${pick(language, university.name.en, university.name.km)} (${university.acronym.en})`);
    });
  }
  if (results.majors.length) {
    lines.push(pick(language, "Majors:", "ជំនាញ៖"));
    results.majors.forEach((major) => {
      lines.push(
        `• ${pick(language, major.name.en, major.name.km)} — ${major.universities_count} ${pick(
          language,
          "universities",
          "សាកលវិទ្យាល័យ"
        )}`
      );
    });
  }
  if (results.careers.length) {
    lines.push(pick(language, "Careers:", "អាជីព៖"));
    results.careers.forEach((career) => {
      lines.push(`• ${pick(language, career.title.en, career.title.km)}`);
    });
  }
  if (results.scholarships.length) {
    lines.push(pick(language, "Scholarships:", "អាហារូបករណ៍៖"));
    results.scholarships.forEach((scholarship) => {
      lines.push(`• ${pick(language, scholarship.title.en, scholarship.title.km)}`);
    });
  }

  const sources: StaticAssistantSource[] = [];
  results.universities.forEach((university) => {
    const source = sourceForUniversity(university.slug);
    if (source) sources.push(source);
  });
  results.majors.forEach((major) => {
    const source = sourceForMajor(major.slug);
    if (source) sources.push(source);
  });
  results.scholarships.forEach((scholarship) => {
    const source = sourceForScholarship(scholarship.slug);
    if (source) sources.push(source);
  });

  return {
    answer: `${pick(language, "I found these matches:", "ខ្ញុំរកឃើញលទ្ធផលទាំងនេះ៖")}\n${lines.join("\n")}`,
    sources: sources.slice(0, 5),
    suggested_questions: suggestions(language).slice(0, 4),
    tools_used: [],
  };
}

export function detectResponseLanguage(
  question: string,
  fallback: AssistantLanguage
): AssistantLanguage {
  const khmer = (question.match(/[\u1780-\u17FF]/g) || []).length;
  const latin = (question.match(/[A-Za-z]/g) || []).length;
  if (khmer === 0 && latin > 0) return "en";
  if (latin === 0 && khmer > 0) return "km";
  return khmer > latin ? "km" : latin > khmer ? "en" : fallback;
}

export function answerLocalQuestion(
  question: string,
  language: AssistantLanguage
): StaticAssistantAnswer {
  const normalized = question.toLowerCase().trim();

  const eligibility = answerEligibility(normalized, language);
  if (eligibility) return eligibility;

  if (has(normalized, ["export", "download", "pdf", "excel", "csv", "png", "នាំចេញ", "របាយការណ៍"])) {
    return {
      answer: pick(
        language,
        "Open any saved result, then choose Export report. You can download PDF, XLSX, CSV, JSON, Markdown, HTML, TXT, a PNG share card, or copy a read-only share link.\n\nEverything is generated in your browser. Nothing is uploaded.",
        "បើកលទ្ធផលដែលបានរក្សាទុក រួចជ្រើសរើស នាំចេញរបាយការណ៍។ អ្នកអាចទាញយក PDF, XLSX, CSV, JSON, Markdown, HTML, TXT កាតចែករំលែក PNG ឬចម្លងតំណចែករំលែកបែបអានតែ។\n\nអ្វីៗត្រូវបានបង្កើតក្នុងកម្មវិធីរុករករបស់អ្នក។ គ្មានអ្វីត្រូវផ្ញើទៅម៉ាស៊ីនមេទេ។"
      ),
      sources: [
        {
          type: "page",
          title_en: "My results",
          title_km: "លទ្ធផលរបស់ខ្ញុំ",
          url: "/assessments/results",
          snippet_en: "Export and share",
          snippet_km: "នាំចេញ និងចែករំលែក",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  if (has(normalized, ["privacy", "private", "data", "localstorage", "ឯកជនភាព", "ទិន្នន័យ"])) {
    return {
      answer: pick(
        language,
        "Your answers and results stay in this browser's localStorage. They are not sent to a server. Clearing browser data deletes them, so export a copy if you want to keep them. A share link contains the result data inside the link itself.",
        "ចម្លើយ និងលទ្ធផលរបស់អ្នករក្សាទុកក្នុង localStorage របស់កម្មវិធីរុករកនេះ។ ពួកវាមិនត្រូវផ្ញើទៅម៉ាស៊ីនមេទេ។ ការលុបទិន្នន័យកម្មវិធីរុករកនឹងលុបពួកវា ដូច្នេះសូមនាំចេញច្បាប់ចម្លងប្រសិនបើចង់រក្សាទុក។ តំណចែករំលែកមានទិន្នន័យលទ្ធផលនៅក្នុងតំណខ្លួនវា។"
      ),
      sources: [
        {
          type: "page",
          title_en: "Data privacy",
          title_km: "ឯកជនភាពទិន្នន័យ",
          url: "/about#privacy",
          snippet_en: "How OrienX handles data",
          snippet_km: "របៀបដែល OrienX គ្រប់គ្រងទិន្នន័យ",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  if (
    has(normalized, [
      "which test",
      "what test",
      "test should",
      "តេស្តមួយណា",
      "តើខ្ញុំគួរធ្វើតេស្ត",
    ])
  ) {
    return {
      answer: pick(
        language,
        "Start with the RIASEC test if you want major and career direction, or the Personality test if you want to understand how you think and study. You can take both — they are free, take a few minutes, and save only in this browser. Taking both gives the strongest combined major matches.",
        "ចាប់ផ្តើមជាមួយតេស្ត RIASEC ប្រសិនបើចង់រកទិសដៅជំនាញ និងអាជីព ឬតេស្តបុគ្គលិកលក្ខណៈ ប្រសិនបើចង់យល់ពីរបៀបគិត និងការរៀនរបស់អ្នក។ អ្នកអាចធ្វើទាំងពីរ — ឥតគិតថ្លៃ ចំណាយពេលតែប៉ុន្មាននាទី និងរក្សាទុកក្នុងកម្មវិធីរុករកនេះប៉ុណ្ណោះ។ ការធ្វើទាំងពីរផ្តល់ជំនាញត្រូវគ្នាល្អបំផុត។"
      ),
      sources: [
        {
          type: "page",
          title_en: "RIASEC test",
          title_km: "តេស្ត RIASEC",
          url: "/assessments/riasec/test",
          snippet_en: "18 activities · about 4 minutes",
          snippet_km: "១៨ សកម្មភាព · ប្រហែល ៤ នាទី",
        },
        {
          type: "page",
          title_en: "Personality test",
          title_km: "តេស្តបុគ្គលិកលក្ខណៈ",
          url: "/assessments/personality/test",
          snippet_en: "12 statements · about 3 minutes",
          snippet_km: "១២ សំណើ · ប្រហែល ៣ នាទី",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  if (
    has(normalized, [
      "result",
      "recommend",
      "match",
      "top major",
      "strongest major",
      "fit me",
      "លទ្ធផល",
      "ណែនាំ",
      "ជំនាញកំពូល",
      "មុខជំនាញ",
    ])
  ) {
    return answerResults(language);
  }

  if (has(normalized, ["riasec", "holland", "ចំណាប់អារម្មណ៍"])) {
    const saved = readLatestResult("riasec")?.result as RiasecResult | undefined;
    return {
      answer: saved
        ? pick(
            language,
            `Your saved Holland code is ${saved.hollandCode}. The RIASEC test measures six interest areas and your top three letters form that code. You can retake it anytime or view the full result.`,
            `កូដ Holland ដែលបានរក្សាទុករបស់អ្នកគឺ ${saved.hollandCode}។ តេស្ត RIASEC វាស់ចំណាប់អារម្មណ៍ ៦ ផ្នែក ហើយអក្សរកំពូលទាំង ៣ បង្កើតបានជាកូដនោះ។ អ្នកអាចធ្វើឡើងវិញបានគ្រប់ពេល ឬមើលលទ្ធផលពេញលេញ។`
          )
        : pick(
            language,
            "The RIASEC test measures six interest areas: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Your top three letters form your Holland code, such as RIA or IAS. It takes about 4 minutes and does not need an account.",
            "តេស្ត RIASEC វាស់វែងចំណាប់អារម្មណ៍ ៦ ផ្នែក៖ Realistic, Investigative, Artistic, Social, Enterprising និង Conventional។ អក្សរកំពូលទាំង ៣ បង្កើតបានជាកូដ Holland ដូចជា RIA ឬ IAS។ ចំណាយពេលប្រហែល ៤ នាទី និងមិនត្រូវការគណនី។"
          ),
      sources: [
        {
          type: "page",
          title_en: "Take the RIASEC test",
          title_km: "ធ្វើតេស្ត RIASEC",
          url: "/assessments/riasec/test",
          snippet_en: "18 activities · free",
          snippet_km: "១៨ សកម្មភាព · ឥតគិតថ្លៃ",
        },
        {
          type: "page",
          title_en: "RIASEC guide",
          title_km: "មគ្គុទ្ទេសក៍ RIASEC",
          url: "/riasec",
          snippet_en: "How the Holland code works",
          snippet_km: "របៀបដែលកូដ Holland ដំណើរការ",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  if (has(normalized, ["personality", "mbti", "16personalities", "បុគ្គលិកលក្ខណៈ"])) {
    const saved = readLatestResult("personality")?.result as
      | PersonalityResult
      | undefined;
    return {
      answer: saved
        ? pick(
            language,
            `Your saved Personality type is ${saved.type}. The test looks at four preference pairs: E/I, S/N, T/F, and J/P. You can retake it anytime or view the full result with your strengths and learning style.`,
            `ប្រភេទបុគ្គលិកលក្ខណៈដែលបានរក្សាទុករបស់អ្នកគឺ ${saved.type}។ តេស្តពិនិត្យលើគូចំណូលចិត្ត ៤៖ E/I, S/N, T/F និង J/P។ អ្នកអាចធ្វើឡើងវិញបានគ្រប់ពេល ឬមើលលទ្ធផលពេញលេញជាមួយចំណុចខ្លាំង និងរចនាប័ទ្មសិក្សា។`
          )
        : pick(
            language,
            "The Personality test looks at four preference pairs: E/I, S/N, T/F, and J/P. Your four-letter type describes how you recharge, take in information, make decisions, and plan. It takes about 3 minutes and does not need an account.",
            "តេស្តបុគ្គលិកលក្ខណៈពិនិត្យលើគូចំណូលចិត្ត ៤៖ E/I, S/N, T/F និង J/P។ ប្រភេទអក្សរ ៤ ពិពណ៌នាពីរបៀបដែលអ្នកបញ្ចូលថាមពល ទទួលព័ត៌មាន សម្រេចចិត្ត និងរៀបចំផែនការ។ ចំណាយពេលប្រហែល ៣ នាទី និងមិនត្រូវការគណនី។"
          ),
      sources: [
        {
          type: "page",
          title_en: "Take the Personality test",
          title_km: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈ",
          url: "/assessments/personality/test",
          snippet_en: "12 statements · free",
          snippet_km: "១២ សំណើ · ឥតគិតថ្លៃ",
        },
        {
          type: "page",
          title_en: "16-Personality guide",
          title_km: "មគ្គុទ្ទេសក៍បុគ្គលិកលក្ខណៈ ១៦",
          url: "/personality",
          snippet_en: "Explore all 16 types",
          snippet_km: "ស្វែងយល់ពីប្រភេទទាំង ១៦",
        },
      ],
      suggested_questions: suggestions(language).slice(0, 4),
      tools_used: [],
    };
  }

  const tuition = answerTuition(normalized, language);
  if (tuition) return tuition;

  const detail = answerEntityDetail(normalized, language);
  if (detail) return detail;

  if (has(normalized, ["scholarship", "អាហារូបករណ៍"])) {
    return answerScholarships(language);
  }

  const search = answerSearch(question, language);
  if (search) return search;

  return {
    answer: pick(
      language,
      "I can help with majors, universities, tuition, scholarships, admission grades, and your saved test results. Try one of the questions below, or ask about a university or major by name.",
      "ខ្ញុំអាចជួយរកជំនាញ សាកលវិទ្យាល័យ ថ្លៃសិក្សា អាហារូបករណ៍ និទ្ទេសចូលរៀន និងលទ្ធផលតេស្តរបស់អ្នក។ សាកសួរតាមសំណួរខាងក្រោម ឬសួរអំពីសាកលវិទ្យាល័យ ឬជំនាញតាមឈ្មោះ។"
    ),
    sources: [
      {
        type: "page",
        title_en: "Explore majors",
        title_km: "រកមើលជំនាញ",
        url: "/majors",
        snippet_en: "Browse 57 majors",
        snippet_km: "រកមើលជំនាញ ៥៧",
      },
      {
        type: "page",
        title_en: "Explore universities",
        title_km: "រកមើលសាកលវិទ្យាល័យ",
        url: "/universities",
        snippet_en: "Browse 46 universities",
        snippet_km: "រកមើលសាកលវិទ្យាល័យ ៤៦",
      },
    ],
    suggested_questions: suggestions(language),
    tools_used: [],
  };
}
