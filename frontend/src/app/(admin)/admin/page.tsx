"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Crown,
  GraduationCap,
  Loader2,
  Menu,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContentManager,
  type AdminColumn,
  type AdminField,
  type AdminFilterConfig,
} from "@/components/admin/content-manager";
import { UsersManager } from "@/components/admin/users-manager";
import { OfferingsManager } from "@/components/admin/offerings-manager";
import { AdmissionsCoverageManager } from "@/components/admin/admissions-coverage-manager";
import { QuestionsManager } from "@/components/admin/questions-manager";
import { AdminFilterDropdown } from "@/components/admin/admin-filter-dropdown";
import { SearchTrigger } from "@/components/search/search-trigger";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  AdminSidebar,
  ADMIN_TABS,
  type AdminTab,
} from "@/components/admin/admin-sidebar";

const RIASEC_OPTIONS = ["R", "I", "A", "S", "E", "C"].map((code) => ({
  value: code,
  label: code,
}));

const UNIVERSITY_TYPE_OPTIONS = [
  { value: "PUBLIC", label: "Public", labelKm: "សាធារណៈ" },
  { value: "PRIVATE", label: "Private", labelKm: "ឯកជន" },
];

const EDUCATION_LEVEL_OPTIONS = [
  { value: "BACHELOR", label: "Bachelor", labelKm: "បរិញ្ញាបត្រ" },
  { value: "ASSOCIATE", label: "Associate", labelKm: "បរិញ្ញាបត្ររង" },
  { value: "MASTER", label: "Master", labelKm: "អនុបណ្ឌិត" },
  { value: "DOCTORATE", label: "Doctorate", labelKm: "បណ្ឌិត" },
  { value: "DIPLOMA", label: "Diploma", labelKm: "សញ្ញាបត្របច្ចេកទេស" },
];

const COVERAGE_OPTIONS = [
  { value: "FULL_TUITION", label: "Full tuition", labelKm: "ថ្លៃសិក្សាពេញ" },
  { value: "PARTIAL_TUITION", label: "Partial tuition", labelKm: "ថ្លៃសិក្សាមួយផ្នែក" },
  { value: "STIPEND_ONLY", label: "Stipend only", labelKm: "ប្រាក់ឧបត្ថម្ភប៉ុណ្ណោះ" },
  { value: "FULL_RIDE", label: "Full ride", labelKm: "អាហារូបករណ៍ពេញលេញ" },
];

const UNIVERSITY_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", labelKm: "ស្លាក", placeholder: "auto-generated if blank", placeholderKm: "បង្កើតដោយស្វ័យប្រវត្តិប្រសិនបើទទេ" },
  { key: "name_en", label: "Name (English)", labelKm: "ឈ្មោះ (អង់គ្លេស)", required: true },
  { key: "name_km", label: "Name (Khmer)", labelKm: "ឈ្មោះ (ខ្មែរ)" },
  { key: "acronym_en", label: "Acronym (English)", labelKm: "អក្សរកាត់ (អង់គ្លេស)", required: true },
  { key: "acronym_km", label: "Acronym (Khmer)", labelKm: "អក្សរកាត់ (ខ្មែរ)" },
  {
    key: "university_type",
    label: "Type",
    labelKm: "ប្រភេទ",
    type: "select",
    options: UNIVERSITY_TYPE_OPTIONS,
    defaultValue: "PUBLIC",
    required: true,
  },
  { key: "province", label: "Province", labelKm: "រាជធានី/ខេត្ត", defaultValue: "Phnom Penh", required: true },
  { key: "website_url", label: "Website", labelKm: "គេហទំព័រ" },
  { key: "contact_email", label: "Contact email", labelKm: "អ៊ីមែលទំនាក់ទំនង" },
  { key: "contact_phone", label: "Contact phone", labelKm: "ទូរស័ព្ទទំនាក់ទំនង" },
  { key: "logo_url", label: "Logo", labelKm: "រូបសញ្ញា", type: "image", imageShape: "square" },
  { key: "cover_image_url", label: "Cover image", labelKm: "រូបភាពគម្រប", type: "image", imageShape: "wide" },
  { key: "established_year", label: "Established year", labelKm: "ឆ្នាំបង្កើត", type: "number", min: 1900, max: 2100 },
  { key: "tuition_range_min_usd", label: "Min tuition (USD)", labelKm: "តម្លៃសិក្សាអប្បបរមា (USD)", type: "number", min: 0 },
  { key: "tuition_range_max_usd", label: "Max tuition (USD)", labelKm: "តម្លៃសិក្សាអតិបរមា (USD)", type: "number", min: 0 },
  { key: "is_tuition_verified", label: "Tuition verified", labelKm: "តម្លៃសិក្សាបានផ្ទៀងផ្ទាត់", type: "checkbox" },
  { key: "is_verified", label: "University verified", labelKm: "សាកលវិទ្យាល័យបានផ្ទៀងផ្ទាត់", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", labelKm: "ការពិពណ៌នា (អង់គ្លេស)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", labelKm: "ការពិពណ៌នា (ខ្មែរ)", type: "textarea", wide: true },
];

const UNIVERSITY_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    labelKm: "មើលជាមុន",
    render: (row) => <PreviewCell src={row.cover_image_url || row.logo_url} label={row.name_en} />,
  },
  {
    key: "name_en",
    label: "University",
    labelKm: "សាកលវិទ្យាល័យ",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">
          <LocalizedText en={row.name_en} km={row.name_km} />
        </div>
        <div className="text-[11px] text-[#68708A]">
          {row.acronym_en} · {row.province}
        </div>
      </div>
    ),
  },
  {
    key: "university_type",
    label: "Type",
    labelKm: "ប្រភេទ",
    render: (row) => <UniversityTypeBadge value={row.university_type} />,
  },
  {
    key: "tuition_range_min_usd",
    label: "Tuition",
    labelKm: "តម្លៃសិក្សា",
    render: (row) =>
      row.tuition_range_min_usd
        ? `$${row.tuition_range_min_usd}–$${row.tuition_range_max_usd ?? row.tuition_range_min_usd}`
        : "—",
  },
  {
    key: "is_verified",
    label: "Verified",
    labelKm: "បានផ្ទៀងផ្ទាត់",
    render: (row) => <BoolBadge value={row.is_verified} />,
  },
];

const MAJOR_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", labelKm: "ស្លាក", placeholder: "auto-generated if blank", placeholderKm: "បង្កើតដោយស្វ័យប្រវត្តិប្រសិនបើទទេ" },
  { key: "name_en", label: "Name (English)", labelKm: "ឈ្មោះ (អង់គ្លេស)", required: true },
  { key: "name_km", label: "Name (Khmer)", labelKm: "ឈ្មោះ (ខ្មែរ)" },
  { key: "category", label: "Category", labelKm: "ប្រភេទ", required: true },
  { key: "riasec_primary", label: "RIASEC primary", labelKm: "RIASEC ចម្បង", type: "select", options: RIASEC_OPTIONS, defaultValue: "I", required: true },
  { key: "riasec_secondary", label: "RIASEC secondary", labelKm: "RIASEC បន្ទាប់បន្សំ", type: "select", options: RIASEC_OPTIONS, defaultValue: "R", required: true },
  { key: "personality_affinity", label: "MBTI affinity", labelKm: "ភាពស៊ីគ្នា MBTI", placeholder: "INTJ,INTP" },
  { key: "is_stem", label: "STEM major", labelKm: "មុខជំនាញ STEM", type: "checkbox" },
  { key: "image_url", label: "Major image", labelKm: "រូបភាពមុខជំនាញ", type: "image", imageShape: "wide" },
  { key: "description_en", label: "Description (English)", labelKm: "ការពិពណ៌នា (អង់គ្លេស)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", labelKm: "ការពិពណ៌នា (ខ្មែរ)", type: "textarea", wide: true },
];

const MAJOR_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    labelKm: "មើលជាមុន",
    render: (row) => <PreviewCell src={row.image_url} label={row.name_en} />,
  },
  {
    key: "name_en",
    label: "Major",
    labelKm: "មុខជំនាញ",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">
          <LocalizedText en={row.name_en} km={row.name_km} />
        </div>
        <div className="text-[11px] text-[#68708A]">{row.category}</div>
      </div>
    ),
  },
  {
    key: "riasec_primary",
    label: "RIASEC",
    labelKm: "RIASEC",
    render: (row) => `${row.riasec_primary}${row.riasec_secondary}`,
  },
  {
    key: "is_stem",
    label: "STEM",
    labelKm: "STEM",
    render: (row) => <BoolBadge value={row.is_stem} />,
  },
];

const CAREER_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", labelKm: "ស្លាក", placeholder: "auto-generated if blank", placeholderKm: "បង្កើតដោយស្វ័យប្រវត្តិប្រសិនបើទទេ" },
  { key: "title_en", label: "Title (English)", labelKm: "ចំណងជើង (អង់គ្លេស)", required: true },
  { key: "title_km", label: "Title (Khmer)", labelKm: "ចំណងជើង (ខ្មែរ)" },
  { key: "industry", label: "Industry", labelKm: "ឧស្សាហកម្ម", required: true },
  {
    key: "education_level",
    label: "Education level",
    labelKm: "កម្រិតអប់រំ",
    type: "select",
    options: EDUCATION_LEVEL_OPTIONS,
    defaultValue: "BACHELOR",
  },
  { key: "riasec_code", label: "RIASEC code", labelKm: "កូដ RIASEC", placeholder: "IRE", required: true },
  { key: "description_en", label: "Description (English)", labelKm: "ការពិពណ៌នា (អង់គ្លេស)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", labelKm: "ការពិពណ៌នា (ខ្មែរ)", type: "textarea", wide: true },
];

const CAREER_COLUMNS: AdminColumn[] = [
  {
    key: "title_en",
    label: "Career",
    labelKm: "អាជីព",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">
          <LocalizedText en={row.title_en} km={row.title_km} />
        </div>
        <div className="text-[11px] text-[#68708A]">{row.industry}</div>
      </div>
    ),
  },
  {
    key: "education_level",
    label: "Education",
    labelKm: "ការអប់រំ",
    render: (row) => <EducationBadge value={row.education_level} />,
  },
  { key: "riasec_code", label: "RIASEC", labelKm: "RIASEC" },
];

const SCHOLARSHIP_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", labelKm: "ស្លាក", placeholder: "auto-generated if blank", placeholderKm: "បង្កើតដោយស្វ័យប្រវត្តិប្រសិនបើទទេ" },
  { key: "title_en", label: "Title (English)", labelKm: "ចំណងជើង (អង់គ្លេស)", required: true },
  { key: "title_km", label: "Title (Khmer)", labelKm: "ចំណងជើង (ខ្មែរ)" },
  { key: "provider_en", label: "Provider (English)", labelKm: "អ្នកផ្តល់ (អង់គ្លេស)", required: true },
  { key: "provider_km", label: "Provider (Khmer)", labelKm: "អ្នកផ្តល់ (ខ្មែរ)" },
  {
    key: "coverage_type",
    label: "Coverage type",
    labelKm: "ប្រភេទហិរញ្ញប្បទាន",
    type: "select",
    options: COVERAGE_OPTIONS,
    defaultValue: "FULL_TUITION",
    required: true,
  },
  { key: "coverage_percentage", label: "Coverage %", labelKm: "ភាគរយហិរញ្ញប្បទាន", type: "number", min: 0, max: 100 },
  { key: "country_or_institution", label: "Country / institution", labelKm: "ប្រទេស / គ្រឹះស្ថាន", required: true },
  { key: "application_deadline", label: "Deadline", labelKm: "កាលកំណត់", type: "date" },
  { key: "official_url", label: "Official URL", labelKm: "URL ផ្លូវការ", required: true },
  { key: "source_name", label: "Source name", labelKm: "ឈ្មោះប្រភព" },
  { key: "poster_url", label: "Poster image", labelKm: "រូបភាពផ្ទាំងព័ត៌មាន", type: "image", imageShape: "poster" },
  { key: "is_verified", label: "Verified", labelKm: "បានផ្ទៀងផ្ទាត់", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", labelKm: "ការពិពណ៌នា (អង់គ្លេស)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", labelKm: "ការពិពណ៌នា (ខ្មែរ)", type: "textarea", wide: true },
];

const SCHOLARSHIP_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    labelKm: "មើលជាមុន",
    render: (row) => <PreviewCell src={row.poster_url} label={row.title_en} />,
  },
  {
    key: "title_en",
    label: "Scholarship",
    labelKm: "អាហារូបករណ៍",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">
          <LocalizedText en={row.title_en} km={row.title_km} />
        </div>
        <div className="text-[11px] text-[#68708A]">
          <LocalizedText en={row.provider_en} km={row.provider_km} />
        </div>
      </div>
    ),
  },
  {
    key: "coverage_type",
    label: "Coverage",
    labelKm: "ហិរញ្ញប្បទាន",
    render: (row) => <CoverageBadge row={row} />,
  },
  {
    key: "application_deadline",
    label: "Deadline",
    labelKm: "កាលកំណត់",
    render: (row) => <DeadlineCell value={row.application_deadline} />,
  },
  {
    key: "is_verified",
    label: "Verified",
    labelKm: "បានផ្ទៀងផ្ទាត់",
    render: (row) => <BoolBadge value={row.is_verified} />,
  },
];

const UNIVERSITY_FILTERS: AdminFilterConfig[] = [
  {
    key: "university_type",
    label: "Type",
    labelKm: "ប្រភេទ",
    options: UNIVERSITY_TYPE_OPTIONS,
  },
  {
    key: "is_verified",
    label: "Verification",
    labelKm: "ការផ្ទៀងផ្ទាត់",
    type: "boolean",
    trueLabel: "Verified",
    falseLabel: "Unverified",
    trueLabelKm: "បានផ្ទៀងផ្ទាត់",
    falseLabelKm: "មិនបានផ្ទៀងផ្ទាត់",
  },
];

const MAJOR_FILTERS: AdminFilterConfig[] = [
  { key: "category", label: "Category", labelKm: "ប្រភេទ" },
  {
    key: "is_stem",
    label: "STEM",
    labelKm: "STEM",
    type: "boolean",
    trueLabel: "STEM",
    falseLabel: "Non-STEM",
    trueLabelKm: "STEM",
    falseLabelKm: "មិនមែន STEM",
  },
];

const CAREER_FILTERS: AdminFilterConfig[] = [
  { key: "industry", label: "Industry", labelKm: "ឧស្សាហកម្ម" },
  {
    key: "education_level",
    label: "Education",
    labelKm: "ការអប់រំ",
    options: EDUCATION_LEVEL_OPTIONS,
  },
];

const SCHOLARSHIP_FILTERS: AdminFilterConfig[] = [
  {
    key: "coverage_type",
    label: "Coverage",
    labelKm: "ហិរញ្ញប្បទាន",
    options: COVERAGE_OPTIONS,
  },
  {
    key: "is_verified",
    label: "Verification",
    labelKm: "ការផ្ទៀងផ្ទាត់",
    type: "boolean",
    trueLabel: "Verified",
    falseLabel: "Unverified",
    trueLabelKm: "បានផ្ទៀងផ្ទាត់",
    falseLabelKm: "មិនបានផ្ទៀងផ្ទាត់",
  },
];

function LocalizedText({ en, km }: { en?: string | null; km?: string | null }) {
  const { language } = useLanguage();
  return <>{language === "km" && km ? km : en}</>;
}

function PreviewCell({ src, label }: { src?: string | null; label?: string }) {
  if (!src) {
    return <span className="text-[10px] text-[#94A3B8]">—</span>;
  }
  return (
    <div className="h-8 w-12 overflow-hidden rounded-md border border-[#E6E8F0] bg-slate-100">
      <img
        src={src}
        alt={label || ""}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  const { language } = useLanguage();
  const isKm = language === "km";
  return value ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      {isKm ? "បាទ/ចាស" : "Yes"}
    </span>
  ) : (
    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
      {isKm ? "ទេ" : "No"}
    </span>
  );
}

function UniversityTypeBadge({ value }: { value: string }) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const option = UNIVERSITY_TYPE_OPTIONS.find((item) => item.value === value);
  return (
    <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
      {option ? (isKm ? option.labelKm : option.label) : value}
    </span>
  );
}

function EducationBadge({ value }: { value: string }) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const option = EDUCATION_LEVEL_OPTIONS.find((item) => item.value === value);
  return <>{option ? (isKm ? option.labelKm : option.label) : value}</>;
}

function CoverageBadge({ row }: { row: Record<string, any> }) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const option = COVERAGE_OPTIONS.find((item) => item.value === row.coverage_type);
  const label = option ? (isKm ? option.labelKm : option.label) : row.coverage_type;
  return (
    <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
      {row.coverage_percentage ? `${row.coverage_percentage}%` : label}
    </span>
  );
}

function DeadlineCell({ value }: { value?: string | null }) {
  const { language } = useLanguage();
  const isKm = language === "km";
  return (
    <>
      {value
        ? new Date(value).toLocaleDateString(isKm ? "km-KH" : "en-US")
        : isKm
        ? "រហូត"
        : "Rolling"}
    </>
  );
}

export default function AdminConsolePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isKm = language === "km";
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeTabObj = ADMIN_TABS.find((tab) => tab.id === activeTab);
  const activeTabLabel = isKm
    ? (activeTab === "overview"
        ? "ទិដ្ឋភាពទូទៅ"
        : activeTab === "users"
        ? "អ្នកប្រើប្រាស់ & សិទ្ធិ"
        : activeTab === "universities"
        ? "សាកលវិទ្យាល័យ"
        : activeTab === "majors"
        ? "មុខជំនាញ"
        : activeTab === "offerings"
        ? "កម្មវិធីសិក្សា"
        : activeTab === "admissions"
        ? "គម្របទិន្នន័យចូលរៀន"
        : activeTab === "questions"
        ? "សំណួរវាយតម្លៃ"
        : activeTab === "careers"
        ? "អាជីពការងារ"
        : activeTab === "scholarships"
        ? "អាហារូបករណ៍"
        : activeTab === "engine"
        ? "ក្បួនផ្គូផ្គង"
        : "កំណត់ហេតុសកម្មភាព")
    : (activeTabObj?.label || "Overview");
  const isAdmin = user?.roles?.some(
    (role) => role === "ADMIN" || role === "SUPER_ADMIN"
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] dark:bg-[#070B1E] text-sm text-[#68708A] dark:text-slate-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#F7CE4D]" />
        {isKm ? "កំពុងផ្ទៀងផ្ទាត់សិទ្ធិអភិបាល…" : "Checking administrator session…"}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] dark:bg-[#070B1E] p-4">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto h-12 w-12 text-rose-600 dark:text-rose-400" />
          <h2 className="text-xl font-bold text-[#111965] dark:text-white">
            {isKm ? "មិនមានសិទ្ធិចូលប្រើ" : "Access denied"}
          </h2>
          <p className="text-xs text-[#68708A] dark:text-slate-400">
            {isKm
              ? "អ្នកត្រូវការសិទ្ធិជាអភិបាលដើម្បីបើកផ្ទាំងគ្រប់គ្រង OrienX។"
              : "You need administrator privileges to open the OrienX control panel."}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#111965] dark:bg-[#F7CE4D] dark:text-white px-5 py-2 text-xs font-bold text-white shadow-xs"
          >
            {isKm ? "ចូលគណនីជាអភិបាល" : "Sign in as an administrator"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FC] dark:bg-[#070B1E]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E6E8F0] bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#090D24]/90">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F0F2FA] dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
                aria-label={isKm ? "បើកម៉ឺនុយអ្នកគ្រប់គ្រង" : "Open admin menu"}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8] dark:text-slate-400">
                  {isKm ? "ផ្ទាំងគ្រប់គ្រងអភិបាល" : "Admin console"}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTab}
                      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.18,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="truncate text-sm font-black text-[#111965] dark:text-white"
                    >
                      {activeTabLabel}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="hidden text-[11px] font-semibold text-[#68708A] dark:text-slate-400 md:inline">
                {user?.email}
              </span>
              <SearchTrigger />
              <LanguageSwitcher />
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isKm ? "ទម្រង់សិស្ស" : "Student view"}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              key={activeTab}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="space-y-4"
            >
          {activeTab === "overview" && <OverviewPanel onNavigate={setActiveTab} />}
          {activeTab === "users" && <UsersManager />}
          {activeTab === "universities" && (
            <ContentManager
              resource="universities"
              title={isKm ? "សាកលវិទ្យាល័យ" : "Universities"}
              description={
                isKm
                  ? "គ្រឹះស្ថានសាធារណៈ និងឯកជននៅក្នុងបញ្ជីទិន្នន័យ។"
                  : "Public and private institutions in the directory."
              }
              fields={UNIVERSITY_FIELDS}
              columns={UNIVERSITY_COLUMNS}
              searchKeys={["name_en", "name_km", "acronym_en", "slug", "province"]}
              filters={UNIVERSITY_FILTERS}
            />
          )}
          {activeTab === "majors" && (
            <ContentManager
              resource="majors"
              title={isKm ? "មុខជំនាញ" : "Majors"}
              description={
                isKm
                  ? "កម្មវិធីសិក្សា និងលក្ខណៈ RIASEC / MBTI របស់វា។"
                  : "Academic programs and their RIASEC / MBTI attributes."
              }
              fields={MAJOR_FIELDS}
              columns={MAJOR_COLUMNS}
              searchKeys={["name_en", "name_km", "category", "slug"]}
              filters={MAJOR_FILTERS}
            />
          )}
          {activeTab === "offerings" && <OfferingsManager />}
          {activeTab === "admissions" && <AdmissionsCoverageManager />}
          {activeTab === "questions" && <QuestionsManager />}
          {activeTab === "careers" && (
            <ContentManager
              resource="careers"
              title={isKm ? "អាជីពការងារ" : "Careers"}
              description={
                isKm
                  ? "ប្រវត្តិអាជីព ឧស្សាហកម្ម និងគុណវុឌ្ឍិដែលត្រូវការ។"
                  : "Career profiles, industries, and required qualifications."
              }
              fields={CAREER_FIELDS}
              columns={CAREER_COLUMNS}
              searchKeys={["title_en", "title_km", "industry", "slug"]}
              filters={CAREER_FILTERS}
            />
          )}
          {activeTab === "scholarships" && (
            <ContentManager
              resource="scholarships"
              title={isKm ? "អាហារូបករណ៍" : "Scholarships"}
              description={
                isKm
                  ? "ឱកាសហិរញ្ញប្បទាន ហិរញ្ញប្បទាន កាលកំណត់ និងការផ្ទៀងផ្ទាត់។"
                  : "Funding opportunities, coverage, deadlines, and verification."
              }
              fields={SCHOLARSHIP_FIELDS}
              columns={SCHOLARSHIP_COLUMNS}
              searchKeys={["title_en", "title_km", "provider_en", "country_or_institution", "slug"]}
              filters={SCHOLARSHIP_FILTERS}
            />
          )}
          {activeTab === "engine" && <RulesPanel />}
          {activeTab === "audit" && <AuditLogPanel />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ChartCardHeader({
  icon: Icon,
  title,
  subtitle,
  accent,
  chip,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: string;
  chip?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105",
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-[#111965] dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs font-medium text-[#68708A] dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
      {chip && (
        <span className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10.5px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {chip}
        </span>
      )}
    </div>
  );
}

function ActivityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-xs text-[#111965] shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#0B102B]/95 dark:text-white">
      <p className="mb-2 font-black text-[#111965] dark:text-[#F7CE4D]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-[11px]">
            <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-black tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ADMIN_EASE = [0.22, 1, 0.36, 1] as const;
const ADMIN_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.03 } },
};
const ADMIN_STAGGER_ITEM = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: ADMIN_EASE },
  },
};

function OverviewPanel({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { getLocalized, language } = useLanguage();
  const isKm = language === "km";
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const firstName =
    user?.full_name_en?.split(" ")[0] ||
    user?.full_name_km ||
    user?.email?.split("@")[0] ||
    "Admin";
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => apiFetch<any>("/admin/analytics"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      id: "students",
      label: isKm ? "សិស្សសរុប" : "Students",
      hint: isKm ? "គណនីបានចុះឈ្មោះ" : "Registered profiles",
      badge: isKm ? "សកម្ម" : "Active",
      value: analytics?.total_students ?? 0,
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      borderAccent: "hover:border-blue-400/50 dark:hover:border-blue-500/50",
      tab: "users" as AdminTab,
    },
    {
      id: "universities",
      label: isKm ? "សាកលវិទ្យាល័យ" : "Universities",
      hint: isKm ? "គ្រឹះស្ថានឧត្តមសិក្សា" : "Directory institutions",
      badge: isKm ? "បញ្ជីទិន្នន័យ" : "Directory",
      value: analytics?.total_universities ?? 0,
      icon: Building2,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      borderAccent: "hover:border-amber-400/50 dark:hover:border-amber-500/50",
      tab: "universities" as AdminTab,
    },
    {
      id: "majors",
      label: isKm ? "មុខជំនាញ" : "Majors",
      hint: isKm ? "កម្មវិធីសិក្សា & ឯកទេស" : "Academic programs",
      badge: isKm ? "កម្មវិធីសិក្សា" : "120+ Curricula",
      value: analytics?.total_majors ?? 0,
      icon: BookOpen,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      borderAccent: "hover:border-emerald-400/50 dark:hover:border-emerald-500/50",
      tab: "majors" as AdminTab,
    },
    {
      id: "careers",
      label: isKm ? "អាជីពការងារ" : "Careers",
      hint: isKm ? "ទីផ្សារការងារ NEA" : "Career profiles",
      badge: isKm ? "ទីផ្សារការងារ" : "Job Market",
      value: analytics?.total_careers ?? 0,
      icon: Briefcase,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
      borderAccent: "hover:border-indigo-400/50 dark:hover:border-indigo-500/50",
      tab: "careers" as AdminTab,
    },
    {
      id: "scholarships",
      label: isKm ? "អាហារូបករណ៍" : "Scholarships",
      hint: isKm ? "ឱកាសជំនួយហិរញ្ញវត្ថុ" : "Funding opportunities",
      badge: isKm ? "កូតារដ្ឋ" : "Funding",
      value: analytics?.total_scholarships ?? 0,
      icon: Award,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      borderAccent: "hover:border-purple-400/50 dark:hover:border-purple-500/50",
      tab: "scholarships" as AdminTab,
    },
    {
      id: "recommendations",
      label: isKm ? "ការផ្គូផ្គងជំនាញ" : "Recommendations",
      hint: isKm ? "លទ្ធផលបង្កើតដោយ AI" : "Generated matches",
      badge: isKm ? "ផ្គូផ្គង AI" : "AI Matches",
      value: analytics?.generated_recommendations_count ?? 0,
      icon: TrendingUp,
      iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
      borderAccent: "hover:border-rose-400/50 dark:hover:border-rose-500/50",
      tab: "engine" as AdminTab,
    },
    {
      id: "16p",
      label: isKm ? "បញ្ចប់តេស្ត 16P" : "16P Completed",
      hint: isKm ? "ការបញ្ចប់តេស្ត MBTI" : "Personality completions",
      badge: isKm ? "ការគិត" : "MBTI",
      value: analytics?.completed_personality_assessments ?? 0,
      icon: CheckCircle2,
      iconBg: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
      borderAccent: "hover:border-fuchsia-400/50 dark:hover:border-fuchsia-500/50",
      tab: "overview" as AdminTab,
    },
    {
      id: "riasec",
      label: isKm ? "បញ្ចប់តេស្ត RIASEC" : "RIASEC Completed",
      hint: isKm ? "ការបញ្ចប់តេស្តហូឡង់" : "Interest completions",
      badge: isKm ? "ចំណាប់អារម្មណ៍" : "Holland",
      value: analytics?.completed_riasec_assessments ?? 0,
      icon: Compass,
      iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      borderAccent: "hover:border-cyan-400/50 dark:hover:border-cyan-500/50",
      tab: "overview" as AdminTab,
    },
  ];

  const monthLabel = (value: string) => {
    const [year, month] = value.split("-");
    const monthIndex = Number(month) - 1;
    if (isKm) {
      const khmerMonths = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ];
      return khmerMonths[monthIndex] || value;
    }
    return new Date(Number(year), monthIndex, 1).toLocaleString("en", {
      month: "short",
    });
  };

  const activityData = (analytics?.registrations_by_month || []).map(
    (row: any, index: number) => ({
      month: monthLabel(row.month),
      registrations: row.count,
      assessments: analytics?.assessments_by_month?.[index]?.count ?? 0,
      recommendations: analytics?.recommendations_by_month?.[index]?.count ?? 0,
    })
  );

  const roleData = analytics?.users_by_role || [];
  const popularData = (analytics?.popular_majors || [])
    .slice(0, 5)
    .map((major: any) => {
      const label =
        typeof major.name === "object" ? getLocalized(major.name) : major.name;
      return {
        name: String(label),
        count: major.count,
      };
    });

  const maxMajorCount = Math.max(...popularData.map((m: any) => m.count), 1);

  const contentMix = [
    { name: isKm ? "មុខជំនាញ" : "Majors", value: analytics?.total_majors ?? 0, tab: "majors" as AdminTab },
    { name: isKm ? "សាកលវិទ្យាល័យ" : "Universities", value: analytics?.total_universities ?? 0, tab: "universities" as AdminTab },
    { name: isKm ? "អាជីពការងារ" : "Careers", value: analytics?.total_careers ?? 0, tab: "careers" as AdminTab },
    { name: isKm ? "អាហារូបករណ៍" : "Scholarships", value: analytics?.total_scholarships ?? 0, tab: "scholarships" as AdminTab },
  ].filter((item) => item.value > 0);

  const chartColors = ["#6366F1", "#F7CE4D", "#10B981", "#8B5CF6", "#0EA5E9"];

  const activityTotals = {
    registrations: activityData.reduce((sum: number, row: any) => sum + row.registrations, 0),
    assessments: activityData.reduce((sum: number, row: any) => sum + row.assessments, 0),
    recommendations: activityData.reduce((sum: number, row: any) => sum + row.recommendations, 0),
  };
  const roleTotal = roleData.reduce((sum: number, row: any) => sum + row.count, 0);
  const totalContent = contentMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      className="space-y-6"
      variants={ADMIN_STAGGER}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={ADMIN_STAGGER_ITEM}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A0F3D] via-[#111965] to-[#1E277A] p-6 text-white sm:p-7 shadow-xl border border-white/10 dark:from-[#050818] dark:via-[#090D26] dark:to-[#12194D]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt=""
            fill
            unoptimized
            className="object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2.5 pr-16 sm:pr-40">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#F7CE4D]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isKm ? "ផ្ទាំងគ្រប់គ្រងអភិបាល OrienX" : "OrienX Admin Workspace"}
            </span>
            <h2 className="text-xl font-black leading-tight sm:text-2xl">
              {isKm ? "សូមស្វាគមន៍ការត្រឡប់មកវិញ, " : "Welcome back, "}
              <span className="text-[#F7CE4D]">{firstName}!</span>
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              {isKm
                ? "នេះជាទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ OrienX ថ្ងៃនេះ។ តាមដានទិន្នន័យសិស្ស សាកលវិទ្យាល័យ និងដំណើរការផ្គូផ្គងជំនាញ។"
                : "Here is the latest pulse across the platform. Keep the directory accurate and the guidance engine healthy for every student."}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-slate-200">
              <Sparkles className="h-3 w-3 text-[#F7CE4D] shrink-0" />
              <span>
                {isKm
                  ? "គន្លឹះ៖ ផ្ទៀងផ្ទាត់តម្លៃសិក្សា និងកាលបរិច្ឆេទអាហារូបករណ៍ជាប្រចាំមុនរដូវកាលចុះឈ្មោះថ្មី។"
                  : "Tara's tip: re-verify tuition and scholarship deadlines before each intake."}
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute right-2 top-2 h-20 w-20 shrink-0 sm:bottom-0 sm:top-auto sm:right-6 sm:h-36 sm:w-36 md:h-40 md:w-40">
            <Image
              src="/images/welcome-hd.webp"
              alt="Tara, the OrienX mascot"
              fill
              priority
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </motion.div>

      {/* 8 Stat Cards */}
      <motion.div
        variants={ADMIN_STAGGER_ITEM}
        className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.tab)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#0B102B] dark:hover:border-white/20 dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)]",
                card.borderAccent
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover:scale-105",
                    card.iconBg
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    {card.badge}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-[#111965] dark:text-white">
                {card.value}
              </div>
              <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-[#F7CE4D] transition-colors">
                {card.label}
              </div>
              <div className="text-[10.5px] text-[#94A3B8] dark:text-slate-400 truncate">
                {card.hint}
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        variants={ADMIN_STAGGER_ITEM}
        className="grid gap-5 xl:grid-cols-3"
      >
        {/* Platform Activity */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-[#0B102B] xl:col-span-2 flex flex-col justify-between">
          <div>
            <ChartCardHeader
              icon={TrendingUp}
              title={isKm ? "សកម្មភាពលើផ្លាតហ្វម" : "Platform activity"}
              subtitle={isKm ? "ការចុះឈ្មោះ តេស្តវាយតម្លៃ និងការផ្គូផ្គងប្រចាំខែ" : "Monthly registrations, assessments, and matches"}
              accent="bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300"
              chip={isKm ? "៦ ខែចុងក្រោយ" : "Last 6 months"}
            />

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: isKm ? "ការចុះឈ្មោះ" : "Registrations", total: activityTotals.registrations, color: "#6366F1" },
                { label: isKm ? "តេស្តវាយតម្លៃ" : "Assessments", total: activityTotals.assessments, color: "#F7CE4D" },
                { label: isKm ? "ការផ្គូផ្គង" : "Recommendations", total: activityTotals.recommendations, color: "#10B981" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200/70 bg-[#F8FAFD] p-3 dark:border-white/10 dark:bg-white/[0.03] transition-all hover:bg-slate-100/60 dark:hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#68708A] dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: metric.color }} />
                    <span className="truncate">{metric.label}</span>
                  </div>
                  <div className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-[#111965] dark:text-white">
                    {metric.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRegGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminAssessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7CE4D" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#F7CE4D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminRecGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#64748B" strokeOpacity={0.12} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={34}
                />
                <Tooltip content={<ActivityTooltip />} cursor={{ stroke: "#94A3B8", strokeDasharray: "3 3", strokeOpacity: 0.3 }} />
                <Area type="monotone" dataKey="registrations" name={isKm ? "ការចុះឈ្មោះ" : "Registrations"} stroke="#6366F1" strokeWidth={2.4} fill="url(#adminRegGradient)" dot={false} activeDot={{ r: 5, fill: "#6366F1" }} animationDuration={900} animationBegin={120} />
                <Area type="monotone" dataKey="assessments" name={isKm ? "តេស្តវាយតម្លៃ" : "Assessments"} stroke="#F7CE4D" strokeWidth={2.4} fill="url(#adminAssessGradient)" dot={false} activeDot={{ r: 5, fill: "#F7CE4D" }} animationDuration={900} animationBegin={220} />
                <Area type="monotone" dataKey="recommendations" name={isKm ? "ការផ្គូផ្គង" : "Recommendations"} stroke="#10B981" strokeWidth={2.4} fill="url(#adminRecGradient)" dot={false} activeDot={{ r: 5, fill: "#10B981" }} animationDuration={900} animationBegin={320} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-[#0B102B] flex flex-col justify-between">
          <div>
            <ChartCardHeader
              icon={Users}
              title={isKm ? "ការបែងចែកតាមតួនាទី" : "Users by role"}
              subtitle={isKm ? "សមាមាត្រអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ" : "Account distribution"}
              accent="bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
              chip={`${roleTotal} ${isKm ? "គណនី" : "users"}`}
            />
            <div className="relative mt-4 h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="count"
                    nameKey="role"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    stroke="none"
                    animationDuration={800}
                    animationBegin={180}
                  >
                    {roleData.map((entry: any, index: number) => (
                      <Cell key={entry.role} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B102B",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 14,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#111965] dark:text-white tabular-nums tracking-tight">{roleTotal}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] dark:text-slate-400">
                  {isKm ? "អ្នកប្រើ" : "Users"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {roleData.map((entry: any, index: number) => {
              const share = roleTotal ? Math.round((entry.count / roleTotal) * 100) : 0;
              const roleName = entry.role === "STUDENT"
                ? (isKm ? "សិស្ស" : "Student")
                : entry.role === "SUPER_ADMIN"
                ? (isKm ? "អភិបាលជាន់ខ្ពស់" : "Super Admin")
                : (isKm ? "អភិបាល" : "Admin");

              return (
                <div key={entry.role} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      {roleName}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                      <strong className="text-[#111965] dark:text-white">{entry.count}</strong> · {share}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="dashboard-progress-bar h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${share}%`,
                        backgroundColor: chartColors[index % chartColors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        variants={ADMIN_STAGGER_ITEM}
        className="grid gap-5 xl:grid-cols-3"
      >
        {/* Top Recommended Majors */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-[#0B102B] xl:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-2xs">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#111965] dark:text-white tracking-tight">
                    {isKm ? "ជំនាញដែលផ្គូផ្គងច្រើនជាងគេ" : "Top recommended majors"}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-medium text-[#68708A] dark:text-slate-400">
                    {isKm ? "ជំនាញដែលសិស្សទទួលបានច្រើនបំផុតពីការធ្វើតេស្ត" : "Most matched programs by student assessments"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10.5px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {popularData.length} {isKm ? "ជំនាញ" : "majors"}
              </span>
            </div>

            {popularData.length === 0 ? (
              <p className="py-12 text-center text-xs text-[#68708A] dark:text-slate-400">
                {isKm ? "មិនទាន់មានទិន្នន័យផ្គូផ្គងជំនាញនៅឡើយទេ។" : "No recommendation activity yet."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {popularData.map((major: any, index: number) => {
                  const percent = Math.round((major.count / maxMajorCount) * 100);
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;

                  return (
                    <div
                      key={major.name}
                      onClick={() => onNavigate("majors")}
                      className="group cursor-pointer rounded-2xl border border-slate-100 bg-[#FBFBFE] p-3 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-2xs",
                            isFirst
                              ? "bg-[#F7CE4D] text-[#111965] ring-2 ring-[#F7CE4D]/30"
                              : isSecond
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                              : isThird
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
                              : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="truncate text-xs sm:text-sm font-bold text-[#111965] dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#F7CE4D] transition-colors">
                              {major.name}
                            </span>
                            <span className="shrink-0 rounded-full border border-slate-200/60 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                              {major.count} {isKm ? "ការផ្គូផ្គង" : (major.count === 1 ? "match" : "matches")}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {isKm ? "ផ្អែកលើការបញ្ចប់តេស្ត RIASEC & MBTI" : "Calculated from completed student assessments"}
            </span>
            <button
              type="button"
              onClick={() => onNavigate("majors")}
              className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-[#F7CE4D] hover:underline text-[11px]"
            >
              <span>{isKm ? "គ្រប់គ្រងមុខជំនាញទាំងអស់" : "Manage all majors"}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Directory Mix */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-[#0B102B] flex flex-col justify-between">
          <div>
            <ChartCardHeader
              icon={Building2}
              title={isKm ? "សមាសភាពទិន្នន័យ" : "Directory mix"}
              subtitle={isKm ? "ទិន្នន័យផ្សាយផ្ទាល់លើផ្លាតហ្វម" : "Live catalogue records"}
              accent="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              chip={`${totalContent} ${isKm ? "កំណត់ត្រា" : "records"}`}
            />

            <div className="mt-5 flex h-4 w-full gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 p-0.5">
              {contentMix.map((item, index) => (
                <div
                  key={item.name}
                  className="dashboard-progress-bar h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / Math.max(totalContent, 1)) * 100}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                  title={`${item.name}: ${item.value}`}
                />
              ))}
            </div>

            <div className="mt-5 space-y-2.5">
              {contentMix.map((item, index) => {
                const share = totalContent ? Math.round((item.value / totalContent) * 100) : 0;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onNavigate(item.tab)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2.5 font-bold text-xs text-slate-700 dark:text-slate-200">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span className="group-hover:text-blue-600 dark:group-hover:text-[#F7CE4D] transition-colors">{item.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {share}%
                      </span>
                      <strong className="rounded-lg border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-xs font-black text-[#111965] dark:border-white/10 dark:bg-white/5 dark:text-white">
                        {item.value}
                      </strong>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>{isKm ? "ទិន្នន័យផ្ទៀងផ្ទាត់ផ្លូវការ" : "100% verified directory"}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {isKm ? "ទាន់សម័យ" : "Up to date"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Shortcuts */}
      <motion.div
        variants={ADMIN_STAGGER_ITEM}
        className="grid grid-cols-2 gap-3.5 sm:grid-cols-4"
      >
        {[
          {
            label: isKm ? "បន្ថែមសាកលវិទ្យាល័យ" : "Add university",
            hint: isKm ? "គ្រប់គ្រងគ្រឹះស្ថានសិក្សា" : "Manage institutions",
            icon: Building2,
            iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
            tab: "universities" as AdminTab,
          },
          {
            label: isKm ? "បន្ថែមអាហារូបករណ៍" : "Add scholarship",
            hint: isKm ? "បញ្ជីជំនួយហិរញ្ញវត្ថុ" : "Funding directory",
            icon: Award,
            iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
            tab: "scholarships" as AdminTab,
          },
          {
            label: isKm ? "គ្រប់គ្រងអ្នកប្រើប្រាស់" : "Manage users",
            hint: isKm ? "តួនាទី & សិទ្ធិចូលប្រើ" : "Roles & access",
            icon: Users,
            iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
            tab: "users" as AdminTab,
          },
          {
            label: isKm ? "កែសម្រួលក្បួនផ្គូផ្គង" : "Tune engine",
            hint: isKm ? "ទម្ងន់ពិន្ទុ AI" : "Match weights",
            icon: Sliders,
            iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
            tab: "engine" as AdminTab,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => onNavigate(action.tab)}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-[#0B102B] dark:hover:border-white/20 dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
            >
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105", action.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-[#111965] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-[#F7CE4D] transition-colors">{action.label}</div>
                <div className="text-[10.5px] text-[#94A3B8] dark:text-slate-400 truncate">{action.hint}</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function RulesPanel() {
  const { data: rules } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: async () => apiFetch<any[]>("/admin/rules"),
  });
  const { language } = useLanguage();
  const isKm = language === "km";
  const activeRule = rules?.[0];

  if (!activeRule) {
    return (
      <div className="mx-auto max-w-5xl py-16 text-center text-xs text-[#68708A]">
        {isKm
          ? "មិនទាន់មានច្បាប់ណែនាំដែលបានកំណត់ទេ។"
          : "No recommendation rule is configured yet."}
      </div>
    );
  }

  return (
    <RuleEditor key={activeRule.id} rule={activeRule} />
  );
}

function RuleEditor({ rule }: { rule: Record<string, any> }) {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isKm = language === "km";
  const [weights, setWeights] = useState({
    weight_personality: Number(rule.weight_personality),
    weight_riasec: Number(rule.weight_riasec),
    weight_academic_strengths: Number(rule.weight_academic_strengths),
    weight_career_alignment: Number(rule.weight_career_alignment),
  });
  const [isActive, setIsActive] = useState(Boolean(rule.is_active));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const total = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalPercent = Math.round(total * 100);
  const isBalanced = Math.abs(total - 1) < 0.001;
  const difference = 100 - totalPercent;

  const { mutate: saveWeights, isPending } = useMutation({
    mutationFn: async () => {
      return apiFetch(`/admin/rules/${rule.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...weights, is_active: isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rules"] });
      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error: any) => {
      setSaved(false);
      setSaveError(
        error?.message ||
          (isKm
            ? "មិនអាចរក្សាទុកទម្ងន់ទាំងនេះបានទេ។"
            : "Could not save these weights.")
      );
    },
  });

  const pillars = [
    {
      key: "weight_personality",
      label: isKm ? "១៦ បុគ្គលិកលក្ខណៈ" : "16-Personality",
      hint: isKm ? "ចំណាប់អារម្មណ៍ និងរបៀបធ្វើការ" : "Interests and working style",
      color: "#8B5CF6",
      tint: "bg-[#F5F3FF] text-[#6D28D9]",
    },
    {
      key: "weight_riasec",
      label: "RIASEC",
      hint: isKm ? "ប្រវត្តិចំណាប់អារម្មណ៍អាជីព" : "Career interest profile",
      color: "#0EA5E9",
      tint: "bg-[#F0F9FF] text-[#0369A1]",
    },
    {
      key: "weight_academic_strengths",
      label: isKm ? "ភាពខ្លាំងសិក្សា" : "Academic strengths",
      hint: isKm ? "ពិន្ទុ និងភាពស៊ីគ្នានៃមុខវិជ្ជា" : "Grades and subject fit",
      color: "#10B981",
      tint: "bg-[#ECFDF5] text-[#047857]",
    },
    {
      key: "weight_career_alignment",
      label: isKm ? "ភាពស៊ីគ្នានឹងអាជីព" : "Career alignment",
      hint: isKm ? "ទិសដៅអាជីពរយៈពេលវែង" : "Long-term career direction",
      color: "#F59E0B",
      tint: "bg-[#FFFBEB] text-[#B45309]",
    },
  ] as const;

  const updateWeight = (
    key: (typeof pillars)[number]["key"],
    value: number
  ) => {
    setSaved(false);
    setSaveError(null);
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs">
      <div className="border-b border-[#E6E8F0] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#111965]/10 bg-[#F0F2FA] text-[#111965]">
            <Sliders className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#111965]">
              {isKm ? "ក្បួនផ្គូផ្គង" : "Recommendation engine"}
            </h2>
            <p className="mt-0.5 text-xs text-[#68708A]">
              {isKm
                ? "គ្រប់គ្រងរបៀបដែលសសរស្តម្ភទាំងបួនរួមចំណែកដល់ពិន្ទុផ្គូផ្គងមុខជំនាញចុងក្រោយ។"
                : "Control how the four pillars contribute to the final major match score."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {pillars.map((pillar) => {
            const percent = Math.round(Number(weights[pillar.key]) * 100);
            return (
              <div key={pillar.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <label
                        htmlFor={`rule-${pillar.key}`}
                        className="text-xs font-bold text-[#111965]"
                      >
                        {pillar.label}
                      </label>
                    </div>
                    <p className="mt-0.5 pl-4 text-[10px] text-[#94A3B8]">
                      {pillar.hint}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-black tabular-nums",
                      pillar.tint
                    )}
                  >
                    {percent}%
                  </span>
                </div>

                <input
                  id={`rule-${pillar.key}`}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={weights[pillar.key]}
                  onChange={(event) =>
                    updateWeight(pillar.key, Number(event.target.value))
                  }
                  aria-label={`${pillar.label} ${isKm ? "ទម្ងន់" : "weight"}`}
                  aria-valuetext={`${percent}%`}
                  style={{
                    background: `linear-gradient(to right, ${pillar.color} 0%, ${pillar.color} ${percent}%, #EEF2F7 ${percent}%, #EEF2F7 100%)`,
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#111965]/20 focus-visible:ring-offset-2 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#111965] [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#111965] [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>
            );
          })}
        </div>

        <aside className="space-y-3 lg:border-l lg:border-[#EEF2F7] lg:pl-6">
          <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                {isKm ? "ការបែងចែកសរុប" : "Total allocation"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                  isBalanced
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {totalPercent}%
              </span>
            </div>

            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-[#E8ECF4]">
              {pillars.map((pillar) => {
                const width = Number(weights[pillar.key]) * 100;
                if (width <= 0) return null;
                return (
                  <span
                    key={pillar.key}
                    className="h-full transition-[width] duration-150"
                    style={{
                      width: `${width}%`,
                      backgroundColor: pillar.color,
                    }}
                  />
                );
              })}
            </div>

            <p
              className={cn(
                "mt-2 text-[11px] leading-relaxed",
                isBalanced ? "text-emerald-700" : "text-amber-700"
              )}
            >
              {isBalanced
                ? isKm
                  ? "មានតុល្យភាព។ សសរស្តម្ភទាំងបួនសរុបបាន 100%។"
                  : "Balanced. All four pillars add up to 100%."
                : difference > 0
                ? isKm
                  ? `${difference}% មិនទាន់បានបែងចែក។ សូមកែសម្រួលដើម្បីឈានដល់ 100%។`
                  : `${difference}% unallocated. Adjust the sliders to reach 100%.`
                : isKm
                ? `${Math.abs(difference)}% លើស។ សូមកែសម្រួលដើម្បីឈានដល់ 100%។`
                : `${Math.abs(difference)}% over. Adjust the sliders to reach 100%.`}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => {
              setSaved(false);
              setSaveError(null);
              setIsActive((prev) => !prev);
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
              isActive
                ? "border-[#111965]/15 bg-[#F8FAFD]"
                : "border-[#E6E8F0] bg-white"
            )}
          >
            <span className="min-w-0">
              <span className="block text-xs font-bold text-[#111965]">
                {isKm ? "ច្បាប់សកម្ម" : "Rule active"}
              </span>
              <span className="mt-0.5 block text-[10px] text-[#94A3B8]">
                {isActive
                  ? isKm
                    ? "ការផ្គូផ្គងថ្មីប្រើទម្ងន់ទាំងនេះ។"
                    : "New matches use these weights."
                  : isKm
                  ? "ការផ្គូផ្គងថ្មីមិនគិតច្បាប់នេះទេ។"
                  : "New matches ignore this rule."}
              </span>
            </span>
            <span
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                isActive ? "bg-[#111965]" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  isActive ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => saveWeights()}
            disabled={isPending || !isBalanced}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] transition-colors hover:bg-[#E5BD3B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isPending
              ? isKm
                ? "កំពុងរក្សាទុក…"
                : "Saving…"
              : saved
              ? isKm
                ? "បានរក្សាទុកទម្ងន់"
                : "Weights saved"
              : isKm
              ? "រក្សាទុកទម្ងន់"
              : "Save weights"}
          </button>

          {saveError && (
            <p className="text-center text-[10px] font-semibold text-rose-600">
              {saveError}
            </p>
          )}
          <p className="text-center text-[10px] text-[#94A3B8]">
            {isKm
              ? "ការផ្លាស់ប្តូរអនុវត្តចំពោះអនុសាសន៍ដែលបង្កើតថ្មី។"
              : "Changes apply to newly generated recommendations."}
          </p>
        </aside>
      </div>
    </div>
  );
}

const AUDIT_PAGE_SIZE = 15;

const AUDIT_ACTION_LABELS_KM: Record<string, string> = {
  create: "បង្កើត",
  update: "ធ្វើបច្ចុប្បន្នភាព",
  delete: "លុប",
  login: "ចូលប្រើ",
  logout: "ចាកចេញ",
  suspend: "ផ្អាក",
  upload: "ផ្ទុកឡើង",
};

const AUDIT_RESOURCE_LABELS_KM: Record<string, string> = {
  university: "សាកលវិទ្យាល័យ",
  major: "មុខជំនាញ",
  career: "អាជីពការងារ",
  scholarship: "អាហារូបករណ៍",
  university_offering: "កម្មវិធីសិក្សា",
  offering: "កម្មវិធីសិក្សា",
  personality_question: "សំណួរបុគ្គលិកលក្ខណៈ",
  riasec_question: "សំណួរវាយតម្លៃ RIASEC",
  user: "អ្នកប្រើប្រាស់",
  rule: "ច្បាប់ផ្គូផ្គង",
};

function AuditLogPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => apiFetch<any[]>("/admin/audit-logs?limit=100"),
  });
  const { language } = useLanguage();
  const isKm = language === "km";
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [page, setPage] = useState(1);

  const allLogs = useMemo(() => logs ?? [], [logs]);

  const actionFilterOptions = useMemo(() => {
    const values = Array.from(
      new Set(allLogs.map((log) => String(log.action ?? "")).filter(Boolean))
    ).sort((left, right) => left.localeCompare(right));
    return [
      { value: "", label: isKm ? "ទាំងអស់" : "All", count: allLogs.length },
      ...values.map((value) => ({
        value,
        label: isKm
          ? AUDIT_ACTION_LABELS_KM[value.toLowerCase()] ??
            value.replace(/_/g, " ")
          : value.replace(/_/g, " "),
        count: allLogs.filter((log) => String(log.action ?? "") === value).length,
      })),
    ];
  }, [allLogs, isKm]);

  const resourceFilterOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        allLogs.map((log) => String(log.target_resource ?? "")).filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));
    return [
      { value: "", label: isKm ? "ទាំងអស់" : "All", count: allLogs.length },
      ...values.map((value) => ({
        value,
        label: isKm
          ? AUDIT_RESOURCE_LABELS_KM[value.toLowerCase()] ??
            value.replace(/_/g, " ")
          : value.replace(/_/g, " "),
        count: allLogs.filter(
          (log) => String(log.target_resource ?? "") === value
        ).length,
      })),
    ];
  }, [allLogs, isKm]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return allLogs.filter((log) => {
      if (actionFilter && String(log.action ?? "") !== actionFilter) return false;
      if (
        resourceFilter &&
        String(log.target_resource ?? "") !== resourceFilter
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        log.actor_email,
        log.action,
        log.target_resource,
        log.target_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [allLogs, search, actionFilter, resourceFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / AUDIT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * AUDIT_PAGE_SIZE,
    currentPage * AUDIT_PAGE_SIZE
  );
  const hasActiveFilters = Boolean(search || actionFilter || resourceFilter);

  const actionLabel = (value: string) => {
    const raw = String(value ?? "");
    if (!isKm) return raw.replace(/_/g, " ");
    return AUDIT_ACTION_LABELS_KM[raw.toLowerCase()] ?? raw.replace(/_/g, " ");
  };

  const resourceLabel = (value: string) => {
    const raw = String(value ?? "");
    if (!isKm) return raw.replace(/_/g, " ");
    return AUDIT_RESOURCE_LABELS_KM[raw.toLowerCase()] ?? raw.replace(/_/g, " ");
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("");
    setResourceFilter("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#111965] dark:text-white">
          {isKm ? "កំណត់ហេតុសកម្មភាព" : "Audit log"}
        </h2>
        <p className="text-xs text-[#68708A] dark:text-slate-400">
          {isKm
            ? "សកម្មភាពអ្នកគ្រប់គ្រងថ្មីៗលើខ្លឹមសារ និងគណនី។"
            : "Recent administrator actions across content and accounts."}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 py-2 last:border-b-0 dark:border-white/10">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white dark:border-white/10 dark:bg-[#090D24]">
          <div className="flex flex-col gap-2.5 border-b border-[#E6E8F0] p-3 dark:border-white/10 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A] dark:text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={isKm ? "ស្វែងរកអ្នកធ្វើសកម្មភាព សកម្មភាព ធនធាន…" : "Search actor, action, resource…"}
                className="h-9 w-full rounded-xl border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-8 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
                  title={isKm ? "សម្អាតការស្វែងរក" : "Clear search"}
                >
                  <span className="text-xs font-bold">×</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdminFilterDropdown
                label={isKm ? "សកម្មភាព" : "Action"}
                value={actionFilter}
                onChange={(value) => {
                  setActionFilter(value);
                  setPage(1);
                }}
                options={actionFilterOptions}
                menuWidth="w-60"
              />

              <AdminFilterDropdown
                label={isKm ? "ធនធាន" : "Resource"}
                value={resourceFilter}
                onChange={(value) => {
                  setResourceFilter(value);
                  setPage(1);
                }}
                options={resourceFilterOptions}
                menuWidth="w-60"
                align="end"
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-[#E6E8F0] px-2.5 text-xs font-bold text-[#68708A] transition-colors hover:border-slate-400 hover:text-[#111965] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
                  title={isKm ? "កំណត់តម្រងសកម្មទាំងអស់ឡើងវិញ" : "Reset all active filters"}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isKm ? "កំណត់ឡើងវិញ" : "Reset"}</span>
                </button>
              )}

              <span className="border-l border-[#E6E8F0] pl-2 text-[11px] font-semibold text-[#68708A] dark:border-slate-800 dark:text-slate-400">
                {isKm ? "បង្ហាញ" : "Showing"}{" "}
                <strong className="text-[#111965] dark:text-slate-200">
                  {filtered.length}
                </strong>{" "}
                {isKm ? "ក្នុងចំណោម" : "of"} {allLogs.length}
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-xs text-[#68708A] dark:text-slate-400">
              <span>
                {allLogs.length === 0
                  ? isKm
                    ? "មិនទាន់មានសកម្មភាពអ្នកគ្រប់គ្រងត្រូវបានកត់ត្រាទេ។"
                    : "No admin actions have been recorded yet."
                  : isKm
                  ? "គ្មានកំណត់ហេតុត្រូវនឹងតម្រងទាំងនេះទេ។"
                  : "No audit entries match these filters."}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {isKm ? "កំណត់តម្រងទាំងអស់ឡើងវិញ" : "Reset all filters"}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                    <th className="px-4 py-3 font-bold">{isKm ? "ពេលវេលា" : "When"}</th>
                    <th className="px-4 py-3 font-bold">{isKm ? "អ្នកធ្វើសកម្មភាព" : "Actor"}</th>
                    <th className="px-4 py-3 font-bold">{isKm ? "សកម្មភាព" : "Action"}</th>
                    <th className="px-4 py-3 font-bold">{isKm ? "ធនធាន" : "Resource"}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((log, index) => (
                    <tr
                      key={log.id}
                      className="admin-table-row border-b border-[#E6E8F0] last:border-b-0 hover:bg-[#F8FAFD]/70 dark:border-white/10 dark:hover:bg-white/[0.03]"
                      style={{ animationDelay: `${Math.min(index, 12) * 22}ms` }}
                    >
                      <td className="px-4 py-3 text-[11px] text-[#68708A] dark:text-slate-400">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString(
                              isKm ? "km-KH" : "en-US"
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#171A2C] dark:text-slate-200">
                        {log.actor_email || (isKm ? "ប្រព័ន្ធ" : "System")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                          {actionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#111965] dark:text-[#F7CE4D]">
                        {resourceLabel(log.target_resource)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={filtered.length}
            pageSize={AUDIT_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel={isKm ? "កំណត់ហេតុ" : "entries"}
            itemSingular={isKm ? "កំណត់ហេតុ" : "entry"}
          />
        </div>
      )}
    </div>
  );
}
