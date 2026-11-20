import raw from "@/data/career-ideas.json";

export interface CareerIdea {
  slug: string;
  title: { en: string; km: string };
  industry: string;
  industry_km: string;
  riasec_codes: string[];
  summary: { en: string; km: string };
  skills: Array<{ en: string; km: string }>;
  education: { en: string; km: string };
  related_majors: string[];
  source_name: string;
  source_url: string;
  jobnet_openings?: number;
  jobnet_url?: string;
}

export const CAREER_IDEAS = raw as CareerIdea[];

export function getCareerIdeasForCodes(
  codes: string[],
  limit = 4
): CareerIdea[] {
  const normalized = codes.map((code) => code.toUpperCase());
  return CAREER_IDEAS.map((career) => {
    const matches = career.riasec_codes.filter((code) =>
      normalized.includes(code)
    ).length;
    const primaryMatch =
      career.riasec_codes[0] &&
      normalized[0] === career.riasec_codes[0]
        ? 1
        : 0;
    return { career, score: matches * 2 + primaryMatch };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.career);
}

export function getCareerIdea(slug: string): CareerIdea | undefined {
  return CAREER_IDEAS.find((career) => career.slug === slug);
}
