import type { LocalizedText } from "@/lib/data/catalog";

export type GuestTestKind = "personality" | "riasec";

export interface PersonalityOption {
  id: string;
  label: LocalizedText;
  target_trait: string;
  weight: number;
  order_index: number;
}

export interface PersonalityQuestion {
  id: string;
  dimension: string;
  prompt: LocalizedText;
  order_index: number;
  options: PersonalityOption[];
}

export interface RiasecQuestion {
  id: string;
  category: string;
  prompt: LocalizedText;
  order_index: number;
}

export interface PersonalityAnswer {
  scaleLevel: number;
  optionId: string;
}

export type PersonalityAnswers = Record<string, PersonalityAnswer>;
export type RiasecAnswers = Record<string, number>;

export interface PersonalityDraft {
  version: 1;
  answers: PersonalityAnswers;
  currentIndex: number;
  updatedAt: string;
}

export interface RiasecDraft {
  version: 1;
  answers: RiasecAnswers;
  currentIndex: number;
  updatedAt: string;
}

export interface MajorMatch {
  slug: string;
  name: LocalizedText;
  category: string;
  fit: number;
  universities: number;
  minTuitionUsd: number | null;
  riasecPrimary: string;
  riasecSecondary: string;
}

export interface PersonalityResult {
  kind: "personality";
  type: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  majorMatches: MajorMatch[];
}

export interface RiasecResult {
  kind: "riasec";
  hollandCode: string;
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  ranked: Array<{ code: string; score: number }>;
  majorMatches: MajorMatch[];
}

export interface GuestResultRecord {
  id: string;
  kind: GuestTestKind;
  schemaVersion: 1;
  engineVersion: 1;
  dataVersion: string;
  completedAt: string;
  answers: PersonalityAnswers | RiasecAnswers;
  result: PersonalityResult | RiasecResult;
}

export interface GuestProfile {
  version: 1;
  displayName?: string;
  baciiGrade?: "A" | "B" | "C" | "D" | "E" | "F";
  updatedAt: string;
}
