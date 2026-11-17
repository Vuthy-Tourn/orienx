export type PlanKind = "UNIVERSITY" | "SCHOLARSHIP";

export type PlanStatus =
  | "RESEARCHING"
  | "PREPARING"
  | "SUBMITTED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "WAITLISTED"
  | "REJECTED";

export type PlanDocumentType =
  | "TRANSCRIPT"
  | "BACII_CERTIFICATE"
  | "NATIONAL_ID"
  | "PHOTOS"
  | "APPLICATION_FORM"
  | "ESSAY"
  | "RECOMMENDATION"
  | "FEE_RECEIPT"
  | "ENGLISH_TEST"
  | "PORTFOLIO"
  | "OTHER";

export interface PlanDocument {
  id: string;
  plan_id: string;
  document_type: PlanDocumentType;
  name_en: string;
  name_km?: string | null;
  is_required: boolean;
  is_completed: boolean;
  completed_at?: string | null;
  due_date?: string | null;
  notes?: string | null;
  sort_order: number;
}

export interface Plan {
  id: string;
  kind: PlanKind;
  target_id: string;
  target_title: Record<string, string>;
  target_subtitle?: string | null;
  target_slug?: string | null;
  target_image_url?: string | null;
  target_url?: string | null;
  status: PlanStatus;
  deadline?: string | null;
  reminder_days: number;
  notes?: string | null;
  next_action?: string | null;
  documents: PlanDocument[];
  documents_total: number;
  documents_completed: number;
  required_documents_total: number;
  required_documents_completed: number;
  next_document_due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniversityOption {
  id: string;
  slug: string;
  name: Record<string, string>;
  acronym?: Record<string, string> | null;
  province?: string;
  logo_url?: string | null;
}

export interface ScholarshipOption {
  id: string;
  slug: string;
  title: Record<string, string>;
  provider: Record<string, string>;
  country_or_institution?: string;
  poster_url?: string | null;
  application_deadline?: string | null;
}

export const PLAN_STATUSES: PlanStatus[] = [
  "RESEARCHING",
  "PREPARING",
  "SUBMITTED",
  "INTERVIEW",
  "ACCEPTED",
  "WAITLISTED",
  "REJECTED",
];

export const REMINDER_OPTIONS = ["3", "7", "14", "30"];

export const PLAN_DOCUMENT_TYPES: PlanDocumentType[] = [
  "TRANSCRIPT",
  "BACII_CERTIFICATE",
  "NATIONAL_ID",
  "PHOTOS",
  "APPLICATION_FORM",
  "ESSAY",
  "RECOMMENDATION",
  "FEE_RECEIPT",
  "ENGLISH_TEST",
  "PORTFOLIO",
  "OTHER",
];
