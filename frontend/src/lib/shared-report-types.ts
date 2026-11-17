export type ReportAudience = "PARENT" | "COUNSELOR" | "OTHER";

export type ReportSection =
  | "profile"
  | "assessments"
  | "recommendations"
  | "plans"
  | "eligibility";

export interface ReportShare {
  id: string;
  token: string;
  url: string;
  audience: ReportAudience;
  language: "en" | "km";
  sections: ReportSection[];
  note?: string | null;
  expires_at: string;
  revoked_at?: string | null;
  view_count: number;
  last_viewed_at?: string | null;
  created_at: string;
}

export interface SharedReportStudent {
  name: string;
  avatar_url?: string | null;
  high_school?: string | null;
  province?: string | null;
  current_education_level?: string | null;
  graduation_year?: number | null;
  bacii_grade?: string | null;
}

export interface SharedReportAssessment {
  personality?: {
    type: string;
    summary?: {
      role?: string;
      title?: string;
      tagline?: string;
      strengths?: string[];
      best_fields?: string[];
      growth_areas?: string[];
      learning_style?: string;
    };
  } | null;
  riasec?: {
    code: string;
    summary?: {
      interpretation?: string;
      primary_domain?: string;
      top_categories?: Array<{ code: string; percentage: number }>;
    };
    scores?: Record<string, number>;
  } | null;
  preferences?: {
    favorite_subjects?: string[];
    strongest_subjects?: string[];
    preferred_locations?: string[];
    annual_tuition_budget_usd?: number | null;
    requires_scholarship?: boolean;
  } | null;
}

export interface SharedReportRecommendation {
  major: string;
  category: string;
  fit: number;
  universities: number;
  summary?: string;
}

export interface SharedReportPlan {
  id: string;
  kind: "UNIVERSITY" | "SCHOLARSHIP";
  title: string;
  status: string;
  deadline?: string | null;
  next_action?: string | null;
  documents_total: number;
  documents_completed: number;
  required_total: number;
  required_completed: number;
  next_document_due_date?: string | null;
}

export interface SharedReportEligibility {
  available: boolean;
  grade?: string | null;
  message?: string;
  verified_programs?: number;
  within_reach?: number;
  higher_requirement?: number;
  associate_within_reach?: number;
  bachelor_within_reach?: number;
  note?: string;
}

export interface SharedReport {
  token: string;
  audience: ReportAudience;
  language: "en" | "km";
  note?: string | null;
  generated_at: string;
  expires_at: string;
  student: SharedReportStudent;
  assessments?: SharedReportAssessment | null;
  recommendations?: SharedReportRecommendation[] | null;
  plans?: SharedReportPlan[] | null;
  eligibility?: SharedReportEligibility | null;
}
