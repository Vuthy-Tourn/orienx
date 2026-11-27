import type {
  PersonalityAnswers,
  PersonalityQuestion,
  PersonalityResult,
  RiasecAnswers,
  RiasecQuestion,
  RiasecResult,
} from "@/lib/guest/types";

const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function calcPair(
  first: number,
  second: number,
  firstTrait: string,
  secondTrait: string
): { first: number; second: number; dominant: string } {
  const total = first + second;
  if (total <= 0) {
    return { first: 50, second: 50, dominant: firstTrait };
  }
  const firstPercent = round2((first / total) * 100);
  const secondPercent = round2((second / total) * 100);
  return {
    first: firstPercent,
    second: secondPercent,
    dominant: firstPercent >= secondPercent ? firstTrait : secondTrait,
  };
}

const PERSONALITY_SCALE_WEIGHTS: Record<
  number,
  { optionIndex: 0 | 1; multiplier: number }
> = {
  1: { optionIndex: 0, multiplier: 2.0 }, // Strongly Agree
  2: { optionIndex: 0, multiplier: 1.0 }, // Agree
  3: { optionIndex: 0, multiplier: 0.0 }, // Neutral (no bias toward either trait)
  4: { optionIndex: 1, multiplier: 1.0 }, // Disagree
  5: { optionIndex: 1, multiplier: 2.0 }, // Strongly Disagree
};

/**
 * Weighted 5-point Personality scoring:
 * Strongly Agree/Disagree contribute 2x, Agree/Disagree contribute 1x,
 * and Neutral contributes 0 so neither pole is skewed.
 */
export function scorePersonality(
  questions: PersonalityQuestion[],
  answers: PersonalityAnswers
): PersonalityResult {
  const scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;

    const scaleMapping = PERSONALITY_SCALE_WEIGHTS[answer.scaleLevel];
    if (scaleMapping) {
      if (scaleMapping.multiplier <= 0) continue;
      const option = question.options[scaleMapping.optionIndex];
      if (!option) continue;
      const trait = option.target_trait as keyof typeof scores;
      if (trait in scores) {
        scores[trait] += (Number(option.weight) || 1) * scaleMapping.multiplier;
      }
      continue;
    }

    const option = question.options.find((item) => item.id === answer.optionId);
    if (!option) continue;
    const trait = option.target_trait as keyof typeof scores;
    if (trait in scores) {
      scores[trait] += Number(option.weight) || 1;
    }
  }

  const ei = calcPair(scores.E, scores.I, "E", "I");
  const sn = calcPair(scores.S, scores.N, "S", "N");
  const tf = calcPair(scores.T, scores.F, "T", "F");
  const jp = calcPair(scores.J, scores.P, "J", "P");

  return {
    kind: "personality",
    type: `${ei.dominant}${sn.dominant}${tf.dominant}${jp.dominant}`,
    scores: {
      E: ei.first,
      I: ei.second,
      S: sn.first,
      N: sn.second,
      T: tf.first,
      F: tf.second,
      J: jp.first,
      P: jp.second,
    },
    majorMatches: [],
  };
}

/**
 * Port of the backend's RIASEC scoring: average each category, normalize the
 * 1-5 rating to a percentage, then take the top three letters. Ties keep the
 * fixed R, I, A, S, E, C order, matching Python's stable sort.
 */
export function scoreRiasec(
  questions: RiasecQuestion[],
  answers: RiasecAnswers
): RiasecResult {
  const totals: Record<string, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };
  const counts: Record<string, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  for (const question of questions) {
    const rating = Number(answers[question.id]);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    if (!(question.category in totals)) continue;
    totals[question.category] += rating;
    counts[question.category] += 1;
  }

  const scores = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };
  for (const code of RIASEC_ORDER) {
    const count = counts[code] || 1;
    scores[code] = round2((totals[code] / count / 5) * 100);
  }

  const ranked = RIASEC_ORDER.map((code) => ({
    code,
    score: scores[code],
  })).sort((a, b) => b.score - a.score);

  return {
    kind: "riasec",
    hollandCode: ranked
      .slice(0, 3)
      .map((item) => item.code)
      .join(""),
    scores,
    ranked,
    majorMatches: [],
  };
}

export function personalityAnsweredCount(
  questions: PersonalityQuestion[],
  answers: PersonalityAnswers
): number {
  return questions.filter((question) => Boolean(answers[question.id])).length;
}

export function riasecAnsweredCount(
  questions: RiasecQuestion[],
  answers: RiasecAnswers
): number {
  return questions.filter((question) => {
    const rating = Number(answers[question.id]);
    return Number.isFinite(rating) && rating >= 1 && rating <= 5;
  }).length;
}
