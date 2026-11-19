import { STATIC_MAJOR_FITS } from "@/lib/data/catalog";
import type {
  MajorMatch,
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";

const MBTI_PATTERN = /^[EI][SN][TF][JP]$/;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function personalityFit(type: string, affinity: string | null): number {
  if (!type || !affinity) return 60;
  const candidates = affinity
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter((item) => MBTI_PATTERN.test(item));
  if (candidates.length === 0) return 60;

  let best = 0;
  for (const candidate of candidates) {
    let matches = 0;
    for (let index = 0; index < 4; index += 1) {
      if (candidate[index] === type[index]) matches += 1;
    }
    best = Math.max(best, (matches / 4) * 100);
  }
  return best;
}

function personalityInterestProxy(type: string): Record<string, number> {
  const raw: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const add = (code: string, value: number) => {
    raw[code] += value;
  };
  for (const letter of type) {
    if (letter === "E") {
      add("E", 50);
      add("S", 30);
    } else if (letter === "I") {
      add("I", 50);
      add("R", 30);
    } else if (letter === "S") {
      add("C", 50);
      add("R", 30);
    } else if (letter === "N") {
      add("A", 50);
      add("I", 30);
    } else if (letter === "T") {
      add("I", 50);
      add("C", 30);
    } else if (letter === "F") {
      add("S", 50);
      add("A", 30);
    } else if (letter === "J") {
      add("C", 50);
      add("E", 30);
    } else if (letter === "P") {
      add("A", 50);
      add("R", 30);
    }
  }
  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(
    Object.entries(raw).map(([code, value]) => [code, (value / max) * 100])
  );
}

function proxyFit(
  proxy: Record<string, number>,
  primary: string,
  secondary: string
): number {
  return clamp(0.7 * (proxy[primary] ?? 50) + 0.3 * (proxy[secondary] ?? 50));
}

function riasecFit(result: RiasecResult, primary: string, secondary: string): number {
  const primaryScore = result.scores[primary as keyof typeof result.scores] ?? 50;
  const secondaryScore =
    result.scores[secondary as keyof typeof result.scores] ?? 50;
  let fit = 0.7 * primaryScore + 0.3 * secondaryScore;
  if (result.hollandCode.includes(primary)) fit += 3;
  return clamp(fit);
}

/**
 * Transparent guest-mode fit score. This is intentionally simpler than the
 * account-mode 4-pillar engine: it uses interest and personality affinity only.
 * The UI labels it "Interest fit", never admission chance.
 */
export function recommendMajorMatches(options: {
  personality?: PersonalityResult;
  riasec?: RiasecResult;
  limit?: number;
}): MajorMatch[] {
  const { personality, riasec } = options;
  if (!personality && !riasec) return [];
  const limit = options.limit ?? 6;

  const matches = STATIC_MAJOR_FITS.map((major) => {
    const personalityScore = personality
      ? personalityFit(personality.type, major.personality_affinity)
      : 0;
    const interestScore = riasec
      ? riasecFit(
          riasec,
          major.riasec_primary,
          major.riasec_secondary
        )
      : 0;

    let fit: number;
    if (personality && riasec) {
      fit = 0.55 * interestScore + 0.45 * personalityScore;
    } else if (riasec) {
      fit = interestScore;
    } else if (personality) {
      const proxy = personalityInterestProxy(personality.type);
      fit =
        0.72 * personalityScore +
        0.28 * proxyFit(proxy, major.riasec_primary, major.riasec_secondary);
    } else {
      fit = personalityScore;
    }

    return {
      slug: major.slug,
      name: major.name,
      category: major.category,
      fit: Math.round(clamp(fit)),
      universities: major.universities_count,
      minTuitionUsd: major.min_tuition_usd,
      riasecPrimary: major.riasec_primary,
      riasecSecondary: major.riasec_secondary,
    } satisfies MajorMatch;
  });

  return matches
    .sort((a, b) => {
      if (b.fit !== a.fit) return b.fit - a.fit;
      if (b.universities !== a.universities) {
        return b.universities - a.universities;
      }
      return a.name.en.localeCompare(b.name.en);
    })
    .slice(0, limit);
}
