export interface LocalizedSearchText {
  en?: string;
  km?: string;
}

export interface SearchUniversity {
  id: string;
  slug: string;
  name: LocalizedSearchText;
  acronym: LocalizedSearchText;
  province: string;
  university_type: string;
  logo_url?: string | null;
}

export interface SearchMajor {
  id: string;
  slug: string;
  name: LocalizedSearchText;
  category: string;
  riasec_primary: string;
  universities_count: number;
}

export interface SearchCareer {
  id: string;
  slug: string;
  title: LocalizedSearchText;
  industry: string;
  riasec_code: string;
}

export interface SearchScholarship {
  id: string;
  slug: string;
  title: LocalizedSearchText;
  provider: LocalizedSearchText;
  coverage_type: string;
  application_deadline?: string | null;
  poster_url?: string | null;
}

export interface GlobalSearchResults {
  query: string;
  total: number;
  universities: SearchUniversity[];
  majors: SearchMajor[];
  careers: SearchCareer[];
  scholarships: SearchScholarship[];
}
