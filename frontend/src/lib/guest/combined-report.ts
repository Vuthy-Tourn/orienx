import { ARCHETYPE_META } from "@/lib/personality-meta";
import { RIASEC_DIMENSIONS } from "@/lib/riasec-meta";
import type {
  AssessmentDimension,
  AssessmentHighlight,
  AssessmentReportLabels,
  AssessmentReportModel,
} from "@/lib/assessment-report";
import type {
  MajorMatch,
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";

function percent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

export function buildCombinedReportModel(input: {
  personality: PersonalityResult;
  riasec: RiasecResult;
  matches: MajorMatch[];
  labels: AssessmentReportLabels;
  language: "en" | "km";
  generatedAt: Date;
  studentName?: string;
  characterImageUrl?: string;
}): AssessmentReportModel {
  const {
    personality,
    riasec,
    matches,
    labels,
    language,
    generatedAt,
    studentName,
    characterImageUrl,
  } = input;
  const isKm = language === "km";
  const archetype = ARCHETYPE_META[personality.type];
  const topCodes = riasec.ranked.slice(0, 3).map((item) => item.code);
  const topNames = topCodes.map((code) => {
    const meta = RIASEC_DIMENSIONS[code];
    return meta
      ? isKm
        ? meta.shortNameKm
        : meta.shortNameEn
      : code;
  });

  const personalityDimensions: AssessmentDimension[] = [
    {
      label: isKm ? "បុគ្គលិកលក្ខណៈ · ចិត្ត & ថាមពល" : "Personality · Mind",
      value: Math.max(personality.scores.E, personality.scores.I),
      detail: `E ${percent(personality.scores.E)}% · I ${percent(
        personality.scores.I
      )}%`,
    },
    {
      label: isKm
        ? "បុគ្គលិកលក្ខណៈ · ការទទួលព័ត៌មាន"
        : "Personality · Energy",
      value: Math.max(personality.scores.S, personality.scores.N),
      detail: `S ${percent(personality.scores.S)}% · N ${percent(
        personality.scores.N
      )}%`,
    },
    {
      label: isKm
        ? "បុគ្គលិកលក្ខណៈ · ការសម្រេចចិត្ត"
        : "Personality · Nature",
      value: Math.max(personality.scores.T, personality.scores.F),
      detail: `T ${percent(personality.scores.T)}% · F ${percent(
        personality.scores.F
      )}%`,
    },
    {
      label: isKm
        ? "បុគ្គលិកលក្ខណៈ · យុទ្ធសាស្ត្រជីវិត"
        : "Personality · Tactics",
      value: Math.max(personality.scores.J, personality.scores.P),
      detail: `J ${percent(personality.scores.J)}% · P ${percent(
        personality.scores.P
      )}%`,
    },
  ];

  const interestDimensions: AssessmentDimension[] = Object.entries(
    RIASEC_DIMENSIONS
  ).map(([code, meta]) => ({
    label: `${isKm ? "ចំណាប់អារម្មណ៍" : "Career interest"} · ${code} — ${
      isKm ? meta.shortNameKm : meta.shortNameEn
    }`,
    value: riasec.scores[code as keyof typeof riasec.scores] ?? 0,
    detail: topCodes.includes(code)
      ? isKm
        ? "ចំណាប់អារម្មណ៍កំពូល"
        : "Top interest"
      : "",
  }));

  const highlights: AssessmentHighlight[] = [
    {
      title: isKm ? "ចំណុចខ្លាំងផ្នែកបុគ្គលិកលក្ខណៈ" : "Personality strengths",
      items: (isKm ? archetype.strengthsKm : archetype.strengthsEn) ?? [],
    },
    {
      title: isKm ? "ចំណុចដែលគួរអភិវឌ្ឍ" : "Growth areas",
      items: (isKm ? archetype.growthAreasKm : archetype.growthAreasEn) ?? [],
    },
    {
      title: isKm ? "ចំណាប់អារម្មណ៍អាជីពកំពូល" : "Top career interests",
      items: topNames,
    },
    {
      title: isKm ? "របៀបដែលអ្នករៀនបានល្អបំផុត" : "How you learn best",
      items: [
        isKm
          ? archetype.learningStyleKm || ""
          : archetype.learningStyleEn || "",
      ].filter(Boolean),
    },
  ];

  return {
    kind: "combined",
    title: isKm ? "លទ្ធផលរួមរបស់អ្នក" : "Your Combined Results",
    subtitle: isKm
      ? "របាយការណ៍បុគ្គលិកលក្ខណៈ និងចំណាប់អារម្មណ៍អាជីព"
      : "Personality and career interest report",
    studentName: studentName || (isKm ? "សិស្ស" : "Student"),
    generatedAt,
    generatedLabel: generatedAt.toLocaleString(isKm ? "km-KH" : "en-US"),
    locale: isKm ? "km-KH" : "en-US",
    headline: `${personality.type} · ${riasec.hollandCode}`,
    headlineLabel: isKm ? "លទ្ធផលរួម" : "Combined result",
    archetype: isKm ? archetype.nameKm : archetype.nameEn,
    role: isKm ? "បុគ្គលិកលក្ខណៈ + ចំណាប់អារម្មណ៍អាជីព" : "Personality + career interests",
    tagline: isKm
      ? "របាយការណ៍នេះរួមបញ្ចូលបុគ្គលិកលក្ខណៈ និងចំណាប់អារម្មណ៍អាជីពរបស់អ្នក ដើម្បីជួយអ្នកជ្រើសរើសជំនាញ។"
      : "This report brings your personality and career interests together to help you choose a major.",
    characterImageUrl,
    dimensions: [...personalityDimensions, ...interestDimensions],
    highlights,
    recommendations: matches.map((match) => ({
      major: isKm ? match.name.km : match.name.en,
      fit: match.fit,
      universities: match.universities,
    })),
    labels,
  };
}
