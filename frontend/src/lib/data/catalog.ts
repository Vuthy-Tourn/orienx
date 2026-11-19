import universitiesJson from "@/data/static/universities.json";
import majorsJson from "@/data/static/majors.json";
import majorFitsJson from "@/data/static/major-fits.json";
import offeringsJson from "@/data/static/offerings.json";
import careersJson from "@/data/static/careers.json";
import scholarshipsJson from "@/data/static/scholarships.json";
import metaJson from "@/data/static/meta.json";

export interface LocalizedText {
  en: string;
  km: string;
}

export interface StaticOffering {
  id: string;
  university_id: string;
  university_slug: string;
  university_name: LocalizedText;
  university_acronym: LocalizedText;
  university_type: string;
  university_province: string;
  university_logo_url: string | null;
  major_id: string;
  major_slug: string;
  major_name: LocalizedText;
  major_category: string;
  major_image_url: string | null;
  degree_level: string;
  duration_years: number;
  tuition_annual_usd: number | null;
  is_tuition_verified: boolean;
  language_of_instruction: string;
  min_bacii_grade: string | null;
  required_subjects: string[] | null;
  is_admission_verified: boolean;
  admission_source_url: string | null;
  admission_notes: string | null;
}

export interface StaticUniversity {
  id: string;
  slug: string;
  name: LocalizedText;
  acronym: LocalizedText;
  description: LocalizedText;
  university_type: string;
  logo_url: string | null;
  cover_image_url: string | null;
  province: string;
  website_url: string;
  tuition_range_min_usd: number | null;
  tuition_range_max_usd: number | null;
  is_tuition_verified: boolean;
  is_verified: boolean;
  majors_count: number;
  address: LocalizedText;
  contact_email: string | null;
  contact_phone: string | null;
  established_year: number | null;
  admission_requirements: unknown;
  facilities: unknown;
  scholarship_summary: unknown;
  offerings: StaticOffering[];
}

export interface StaticMajorUniversity {
  university_id: string;
  university_slug: string;
  university_name: LocalizedText;
  university_acronym: LocalizedText;
  university_type: string;
  province: string;
  tuition_annual_usd: number | null;
  is_tuition_verified: boolean;
  duration_years: number;
  degree_level: string;
  logo_url: string | null;
}

export interface StaticCareerSummary {
  id: string;
  slug: string;
  title: LocalizedText;
  industry: string;
  description: LocalizedText;
  education_level: string;
  riasec_code: string;
}

export interface StaticCareer extends StaticCareerSummary {
  responsibilities: string[];
  required_skills: string[];
  work_environments: string[];
  career_progression: string[];
  related_majors: Array<{
    id: string;
    slug: string;
    name: LocalizedText;
    category: string;
  }>;
}

export interface StaticMajor {
  id: string;
  slug: string;
  name: LocalizedText;
  category: string;
  description: LocalizedText;
  riasec_primary: string;
  riasec_secondary: string;
  personality_affinity: string | null;
  image_url: string | null;
  is_stem: boolean;
  universities_count: number;
  min_tuition_usd: number | null;
  subjects_studied: string[];
  required_skills: string[];
  potential_challenges: string[];
  universities: StaticMajorUniversity[];
  careers: StaticCareerSummary[];
}

export interface StaticMajorFit {
  slug: string;
  name: LocalizedText;
  category: string;
  riasec_primary: string;
  riasec_secondary: string;
  personality_affinity: string | null;
  is_stem: boolean;
  universities_count: number;
  min_tuition_usd: number | null;
  image_url: string | null;
}

export interface StaticScholarship {
  id: string;
  slug: string;
  title: LocalizedText;
  provider: LocalizedText;
  description: LocalizedText;
  coverage_type: string;
  coverage_percentage: number | null;
  country_or_institution: string;
  application_deadline: string | null;
  official_url: string;
  source_name: string | null;
  last_verified_at: string | null;
  poster_url: string | null;
  is_verified: boolean;
  eligibility_criteria: unknown;
  academic_requirements: unknown;
  application_process: unknown;
  eligible_majors: Array<{
    id: string;
    slug: string;
    name: LocalizedText;
    category: string;
  }>;
}

export interface StaticSearchEntry {
  type: "university" | "major" | "career" | "scholarship";
  id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  keywords: string[];
  href: string;
}

export const STATIC_META = metaJson as {
  schemaVersion: number;
  dataVersion: string;
  generatedAt: string;
  source: string;
  counts: Record<string, number>;
};

export const STATIC_UNIVERSITIES = universitiesJson as StaticUniversity[];
export const STATIC_MAJORS = majorsJson as StaticMajor[];
export const STATIC_MAJOR_FITS = majorFitsJson as StaticMajorFit[];
export const STATIC_OFFERINGS = offeringsJson as StaticOffering[];
export const STATIC_CAREERS = careersJson as StaticCareer[];
export const STATIC_SCHOLARSHIPS = scholarshipsJson as StaticScholarship[];

function textMatches(value: LocalizedText | string | null | undefined, needle: string) {
  if (!needle) return true;
  if (!value) return false;
  if (typeof value === "string") return value.toLowerCase().includes(needle);
  return `${value.en} ${value.km}`.toLowerCase().includes(needle);
}

export function listStaticMajors(params: {
  search?: string;
  category?: string;
  stemOnly?: boolean;
  riasec?: string;
} = {}): StaticMajor[] {
  const needle = (params.search ?? "").trim().toLowerCase();
  return STATIC_MAJORS.filter((major) => {
    if (params.category && major.category !== params.category) return false;
    if (params.stemOnly && !major.is_stem) return false;
    if (params.riasec) {
      const code = params.riasec.toUpperCase();
      if (major.riasec_primary !== code && major.riasec_secondary !== code) {
        return false;
      }
    }
    if (!needle) return true;
    return (
      textMatches(major.name, needle) ||
      major.category.toLowerCase().includes(needle) ||
      major.slug.includes(needle)
    );
  });
}

export function getStaticMajor(slug: string): StaticMajor | undefined {
  return STATIC_MAJORS.find((major) => major.slug === slug);
}

export function listStaticUniversities(params: {
  search?: string;
  province?: string;
  type?: string;
  major?: string;
  maxTuition?: number;
} = {}): StaticUniversity[] {
  const needle = (params.search ?? "").trim().toLowerCase();
  return STATIC_UNIVERSITIES.filter((university) => {
    if (params.province && university.province.toLowerCase() !== params.province.toLowerCase()) {
      return false;
    }
    if (params.type && university.university_type !== params.type.toUpperCase()) {
      return false;
    }
    if (params.major && !university.offerings.some((offering) => offering.major_slug === params.major)) {
      return false;
    }
    if (
      params.maxTuition != null &&
      university.tuition_range_min_usd != null &&
      university.tuition_range_min_usd > params.maxTuition
    ) {
      return false;
    }
    if (!needle) return true;
    return (
      textMatches(university.name, needle) ||
      textMatches(university.acronym, needle) ||
      university.province.toLowerCase().includes(needle)
    );
  });
}

export function getStaticUniversity(slug: string): StaticUniversity | undefined {
  return STATIC_UNIVERSITIES.find((university) => university.slug === slug);
}

export function listStaticCareers(params: {
  search?: string;
  industry?: string;
} = {}): StaticCareer[] {
  const needle = (params.search ?? "").trim().toLowerCase();
  return STATIC_CAREERS.filter((career) => {
    if (params.industry && career.industry !== params.industry) return false;
    if (!needle) return true;
    return (
      textMatches(career.title, needle) ||
      career.industry.toLowerCase().includes(needle) ||
      career.slug.includes(needle)
    );
  });
}

export function getStaticCareer(slug: string): StaticCareer | undefined {
  return STATIC_CAREERS.find((career) => career.slug === slug);
}

export function listStaticScholarships(params: {
  search?: string;
  coverage?: string;
} = {}): StaticScholarship[] {
  const needle = (params.search ?? "").trim().toLowerCase();
  return STATIC_SCHOLARSHIPS.filter((scholarship) => {
    if (params.coverage && scholarship.coverage_type !== params.coverage.toUpperCase()) {
      return false;
    }
    if (!needle) return true;
    return (
      textMatches(scholarship.title, needle) ||
      textMatches(scholarship.provider, needle) ||
      scholarship.country_or_institution.toLowerCase().includes(needle)
    );
  });
}

export function getStaticScholarship(slug: string): StaticScholarship | undefined {
  return STATIC_SCHOLARSHIPS.find((scholarship) => scholarship.slug === slug);
}

export function getStaticMajorCategories(): string[] {
  return Array.from(new Set(STATIC_MAJORS.map((major) => major.category))).sort();
}

export function getStaticProvinces(): string[] {
  return Array.from(new Set(STATIC_UNIVERSITIES.map((university) => university.province))).sort();
}

export interface StaticSearchResults {
  query: string;
  total: number;
  universities: Array<{
    id: string;
    slug: string;
    name: LocalizedText;
    acronym: LocalizedText;
    province: string;
    university_type: string;
    logo_url: string | null;
  }>;
  majors: Array<{
    id: string;
    slug: string;
    name: LocalizedText;
    category: string;
    riasec_primary: string;
    universities_count: number;
  }>;
  careers: Array<{
    id: string;
    slug: string;
    title: LocalizedText;
    industry: string;
    riasec_code: string;
  }>;
  scholarships: Array<{
    id: string;
    slug: string;
    title: LocalizedText;
    provider: LocalizedText;
    coverage_type: string;
    application_deadline: string | null;
    poster_url: string | null;
  }>;
}

export function staticSearch(query: string, limit = 5): StaticSearchResults {
  const needle = query.trim().toLowerCase();
  const empty: StaticSearchResults = {
    query,
    total: 0,
    universities: [],
    majors: [],
    careers: [],
    scholarships: [],
  };
  if (!needle) return empty;

  const universities = STATIC_UNIVERSITIES.filter(
    (university) =>
      textMatches(university.name, needle) ||
      textMatches(university.acronym, needle) ||
      university.province.toLowerCase().includes(needle)
  ).slice(0, limit);
  const majors = STATIC_MAJORS.filter(
    (major) =>
      textMatches(major.name, needle) ||
      major.category.toLowerCase().includes(needle) ||
      major.riasec_primary.toLowerCase() === needle
  ).slice(0, limit);
  const careers = STATIC_CAREERS.filter(
    (career) =>
      textMatches(career.title, needle) ||
      career.industry.toLowerCase().includes(needle) ||
      career.riasec_code.toLowerCase().includes(needle)
  ).slice(0, limit);
  const scholarships = STATIC_SCHOLARSHIPS.filter(
    (scholarship) =>
      textMatches(scholarship.title, needle) ||
      textMatches(scholarship.provider, needle) ||
      scholarship.country_or_institution.toLowerCase().includes(needle)
  ).slice(0, limit);

  return {
    query,
    total: universities.length + majors.length + careers.length + scholarships.length,
    universities: universities.map((university) => ({
      id: university.id,
      slug: university.slug,
      name: university.name,
      acronym: university.acronym,
      province: university.province,
      university_type: university.university_type,
      logo_url: university.logo_url,
    })),
    majors: majors.map((major) => ({
      id: major.id,
      slug: major.slug,
      name: major.name,
      category: major.category,
      riasec_primary: major.riasec_primary,
      universities_count: major.universities_count,
    })),
    careers: careers.map((career) => ({
      id: career.id,
      slug: career.slug,
      title: career.title,
      industry: career.industry,
      riasec_code: career.riasec_code,
    })),
    scholarships: scholarships.map((scholarship) => ({
      id: scholarship.id,
      slug: scholarship.slug,
      title: scholarship.title,
      provider: scholarship.provider,
      coverage_type: scholarship.coverage_type,
      application_deadline: scholarship.application_deadline,
      poster_url: scholarship.poster_url,
    })),
  };
}
