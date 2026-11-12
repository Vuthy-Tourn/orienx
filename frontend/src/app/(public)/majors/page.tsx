"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowRight,
  Sparkles,
  Building2,
  X,
  LayoutGrid,
  List,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Wallet,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Dialog } from "@/components/ui/dialog";

type Major = {
  id: string;
  slug: string;
  name: Record<string, string>;
  category: string;
  description: Record<string, string>;
  riasec_primary?: string;
  riasec_secondary?: string;
  personality_affinity?: string | null;
  is_stem: boolean;
  universities_count?: number;
  min_tuition_usd?: number | null;
};

// Local image lookup for Cambodian majors
const MAJOR_IMAGES: Record<string, string> = {  "software-engineering": "/images/majors/software-engineering.webp",
  "data-science-ai": "/images/majors/data-science-ai.webp",
  "business-administration": "/images/majors/business-administration.webp",
  "banking-finance": "/images/majors/banking-finance.webp",
  "civil-engineering": "/images/majors/civil-engineering.webp",
  "international-relations": "/images/majors/international-relations.webp",
  "cybersecurity": "/images/majors/cybersecurity.webp",
  "digital-marketing": "/images/majors/digital-marketing.webp",
  "architecture": "/images/majors/architecture.webp",
  "law": "/images/majors/law.webp",
};

// Curriculum preview roadmap data for interactive modal
const MAJOR_CURRICULUM_DATA: Record<string, {
  years: { year: number; titleEn: string; titleKm: string; focus: string }[];
  keySkills: string[];
  sampleCareers: string[];
}> = {
  "software-engineering": {
    years: [
      { year: 1, titleEn: "Computer Science Foundations", titleKm: "មូលដ្ឋានគ្រឹះវិទ្យាសាស្ត្រកុំព្យូទ័រ", focus: "Python, C++, Discrete Math, Algorithms" },
      { year: 2, titleEn: "Software Architecture & OOP", titleKm: "ស្ថាបត្យកម្មប្រព័ន្ធ និង OOP", focus: "Java, Data Structures, Relational Databases, Web Tech" },
      { year: 3, titleEn: "Cloud Systems & DevOps", titleKm: "ប្រព័ន្ធក្លោដ និង DevOps", focus: "Distributed Systems, Microservices, CI/CD, Cybersecurity" },
      { year: 4, titleEn: "Capstone & Industry Internship", titleKm: "គម្រោងបញ្ចប់ការសិក្សា និងកម្មសិក្សា", focus: "Full-Stack Production Capstone, Corporate Placement" },
    ],
    keySkills: ["System Design", "Cloud Computing", "Full-Stack Development", "Database Optimization"],
    sampleCareers: ["Full-Stack Software Engineer", "Cloud Solutions Architect", "DevOps Engineer"],
  },
  "data-science-ai": {
    years: [
      { year: 1, titleEn: "Mathematics & Programming", titleKm: "គណិតវិទ្យា និងការសរសេរកូដ", focus: "Linear Algebra, Calculus, Python, Statistics" },
      { year: 2, titleEn: "Data Mining & Databases", titleKm: "ការទាញយកទិន្នន័យ និងមូលដ្ឋានទិន្នន័យ", focus: "SQL, NoSQL, Data Visualization, Exploratory Analysis" },
      { year: 3, titleEn: "Machine Learning & NLP", titleKm: "ការរៀនម៉ាស៊ីន និង NLP", focus: "Supervised Learning, Deep Neural Networks, PyTorch" },
      { year: 4, titleEn: "AI Capstone & Applied Analytics", titleKm: "គម្រោង AI និងការវិភាគអនុវត្តជាក់ស្តែង", focus: "LLM Fine-Tuning, Predictive Modeling, Industry Thesis" },
    ],
    keySkills: ["Machine Learning", "Statistical Modeling", "Python/R", "Big Data Pipelines"],
    sampleCareers: ["AI/ML Engineer", "Data Scientist", "Business Intelligence Lead"],
  },
  "banking-finance": {
    years: [
      { year: 1, titleEn: "Micro & Macro Economics", titleKm: "សេដ្ឋកិច្ចមីក្រូ និងម៉ាក្រូ", focus: "Financial Accounting, Economic Principles, Business Math" },
      { year: 2, titleEn: "Corporate Finance & Banking Law", titleKm: "ហិរញ្ញវត្ថុសាជីវកម្ម និងច្បាប់ធនាគារ", focus: "Commercial Banking, Capital Markets, Valuation" },
      { year: 3, titleEn: "Investment Analysis & FinTech", titleKm: "ការវិភាគការវិនិយោគ និង FinTech", focus: "Portfolio Management, Risk Modeling, Digital Banking" },
      { year: 4, titleEn: "Applied Financial Practicum", titleKm: "ការអនុវត្តហិរញ្ញវត្ថុជាក់ស្តែង", focus: "Commercial Credit Evaluation, Banking Internship" },
    ],
    keySkills: ["Financial Modeling", "Risk Management", "Investment Valuation", "Regulatory Compliance"],
    sampleCareers: ["Investment Banker", "Risk Analyst", "Financial Controller"],
  },
  "civil-engineering": {
    years: [
      { year: 1, titleEn: "Engineering Physics & Mechanics", titleKm: "រូបវិទ្យាវិស្វកម្ម និងមេកានិច", focus: "Statics, Calculus, Engineering Graphics, Chemistry" },
      { year: 2, titleEn: "Structural Mechanics & Materials", titleKm: "មេកានិចសំណង់ និងសម្ភារ", focus: "Strength of Materials, Fluid Mechanics, Surveying" },
      { year: 3, titleEn: "Reinforced Concrete & Geotechnical", titleKm: "បេតុងអាម៉េ និងភូគព្ភសាស្ត្រ", focus: "Foundation Engineering, Structural Analysis, CAD/BIM" },
      { year: 4, titleEn: "Infrastructure Capstone", titleKm: "គម្រោងហេដ្ឋារចនាសម្ព័ន្ធ", focus: "Bridge & Highway Design, Project Management Internship" },
    ],
    keySkills: ["Structural Analysis", "AutoCAD / BIM", "Project Management", "Soil Mechanics"],
    sampleCareers: ["Structural Engineer", "Project Construction Manager", "Site Supervisor"],
  },
};

// Holland RIASEC display helpers without emojis
const RIASEC_NAMES: Record<string, { en: string; km: string; color: string }> = {
  R: { en: "Realistic (Practical)", km: "ជាក់ស្តែង (អនុវត្ត)", color: "bg-amber-50 text-amber-900 border-amber-200" },
  I: { en: "Investigative (Analytical)", km: "ស្រាវជ្រាវ (វិភាគ)", color: "bg-blue-50 text-blue-900 border-blue-200" },
  A: { en: "Artistic (Creative)", km: "សិល្បៈ (ច្នៃប្រឌិត)", color: "bg-purple-50 text-purple-900 border-purple-200" },
  S: { en: "Social (Supportive)", km: "សង្គម (ជួយអ្នកដទៃ)", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  E: { en: "Enterprising (Leadership)", km: "សហគ្រិន (ដឹកនាំ)", color: "bg-orange-50 text-orange-900 border-orange-200" },
  C: { en: "Conventional (Organized)", km: "ការិយាល័យ (រៀបរយ)", color: "bg-slate-50 text-slate-800 border-slate-200" },
};

const formatUsd = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

/** Compact two-letter Holland interest marker. */
function RiasecPair({
  primary,
  secondary,
  label,
}: {
  primary?: string;
  secondary?: string;
  label: string;
}) {
  const codes = [primary, secondary].filter(Boolean) as string[];
  if (codes.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className="sr-only">{label}: </span>
      {codes.map((code) => {
        const meta = RIASEC_NAMES[code];
        if (!meta) return null;
        return (
          <span
            key={code}
            title={meta.en}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold tabular-nums",
              meta.color
            )}
          >
            {code}
          </span>
        );
      })}
    </span>
  );
}

export default function MajorsPage() {
  const { t, getLocalized, language } = useLanguage();
  const isKm = language === "km";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stemOnly, setStemOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name" | "universities">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activePreviewMajor, setActivePreviewMajor] = useState<Major | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["major-categories"],
    queryFn: async () => apiFetch<string[]>("/majors/categories"),
  });

  // Unfiltered catalogue: drives the hero figures and per-category counts, so
  // they stay stable while the user filters the result list.
  const { data: catalog } = useQuery({
    queryKey: ["majors-catalog"],
    queryFn: async () => apiFetch<Major[]>("/majors?limit=100"),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: majors,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["majors", searchTerm, selectedCategory, stemOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (stemOnly) params.append("is_stem", "true");
      return apiFetch<Major[]>(`/majors?${params.toString()}`);
    },
    retry: 1,
  });

  const sortedMajors = useMemo(() => {
    if (!majors) return [];
    const list = [...majors];
    if (sortBy === "name") {
      list.sort((a, b) => {
        const nameA = getLocalized(a.name) || "";
        const nameB = getLocalized(b.name) || "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "universities") {
      list.sort((a, b) => (b.universities_count || 0) - (a.universities_count || 0));
    }
    return list;
  }, [majors, sortBy, getLocalized]);

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || stemOnly);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStemOnly(false);
  };

  const catalogueStats = useMemo(() => {
    if (!catalog || catalog.length === 0) return null;
    const programs = catalog.reduce((sum, m) => sum + (m.universities_count || 0), 0);
    const tuitions = catalog
      .map((m) => m.min_tuition_usd)
      .filter((v): v is number => typeof v === "number" && v > 0);
    return {
      majors: catalog.length,
      programs,
      minTuition: tuitions.length > 0 ? Math.min(...tuitions) : null,
    };
  }, [catalog]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of catalog || []) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, [catalog]);

  const totalMajors = catalogueStats?.majors ?? sortedMajors.length;

  // Featured programme: first entry, real data only (no invented curriculum).
  const featuredMajor = useMemo(() => {
    if (!catalog || catalog.length === 0) return null;
    return catalog.find((m) => m.slug === "software-engineering") || catalog[0];
  }, [catalog]);

  const showFeatured = featuredMajor && !hasActiveFilters;

  const heroStats = [
    {
      label: isKm ? "ជំនាញ" : "Majors",
      value: catalogueStats ? String(catalogueStats.majors) : "—",
    },
    {
      label: isKm ? "កម្មវិធីសាកលវិទ្យាល័យ" : "University programs",
      value: catalogueStats ? String(catalogueStats.programs) : "—",
    },
    {
      label: isKm ? "ថ្លៃសិក្សាចាប់ផ្តើម" : "Tuition from",
      value: catalogueStats?.minTuition ? formatUsd(catalogueStats.minTuition) : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Orientation band: what this directory is, and the one action that
          shortens the list fastest (the interest test). */}
      <section className="relative overflow-hidden bg-[#0A0F3D]">
        <DotPattern className="fill-white/10 [mask-image:radial-gradient(ellipse_at_65%_0%,white,transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <span className="block h-1 w-10 rounded-full bg-[#F7CE4D]" />
              <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-[2.6rem] lg:text-[3.1rem]">
                {t("majorsDirectory.title")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {t("majorsDirectory.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/riasec"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#F7CE4D] px-4 text-sm font-bold text-[#111965] transition-colors hover:bg-[#E5BD3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7CE4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F3D]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isKm ? "រកជំនាញដែលត្រូវនឹងខ្លួនឯង (១០ នាទី)" : "Find my fit in 10 minutes"}
                  </span>
                </Link>
                <Link
                  href="/assessments"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span>{isKm ? "តើយើងផ្គូផ្គងដោយរបៀបណា" : "How we match majors"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 lg:col-span-5 lg:gap-0 lg:divide-x lg:divide-white/10 lg:border-t-0 lg:pt-0">
              {heroStats.map((stat, idx) => (
                <div key={stat.label} className={cn("lg:px-5", idx === 0 && "lg:pl-0")}>
                  <dt className="text-[12px] leading-snug text-white/55">{stat.label}</dt>
                  <dd className="mt-1 text-xl font-extrabold tabular-nums text-white sm:text-2xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* One control surface: search, filtering, sorting, view. */}
      <div className="z-30 border-b border-[#E6E8F0] bg-white/95 backdrop-blur sm:sticky sm:top-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("majorsDirectory.searchPlaceholder")}
                aria-label={t("majorsDirectory.searchPlaceholder")}
                className="h-10 w-full rounded-lg border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-10 pr-9 text-sm text-[#171A2C] transition-colors placeholder:text-[#68708A]/80 focus:border-[#111965] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111965]/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] transition-colors hover:text-[#171A2C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                  aria-label={isKm ? "សម្អាតការស្វែងរក" : "Clear search"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={stemOnly}
                onClick={() => setStemOnly(!stemOnly)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                  stemOnly
                    ? "border-[#111965] bg-[#111965] text-white"
                    : "border-[#E6E8F0] bg-white text-[#171A2C] hover:border-slate-300"
                )}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>{isKm ? "STEM" : "STEM"}</span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "default" | "name" | "universities")}
                  aria-label={t("majorsDirectory.sortBy")}
                  className="h-10 appearance-none rounded-lg border border-[#E6E8F0] bg-white pl-3 pr-8 text-xs font-semibold text-[#171A2C] transition-colors hover:border-slate-300 focus:border-[#111965] focus:outline-none focus:ring-2 focus:ring-[#111965]/10"
                >
                  <option value="default">{isKm ? "លំដាប់ដើម" : "Featured order"}</option>
                  <option value="name">{t("majorsDirectory.sortAlphabetical")}</option>
                  <option value="universities">{t("majorsDirectory.sortPopular")}</option>
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#68708A]"
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="hidden items-center rounded-lg border border-[#E6E8F0] p-0.5 md:flex">
                {([
                  { mode: "list", Icon: List, label: isKm ? "បញ្ជី" : "List view" },
                  { mode: "grid", Icon: LayoutGrid, label: isKm ? "ក្រឡាចត្រង្គ" : "Grid view" },
                ] as const).map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={viewMode === mode}
                    aria-label={label}
                    title={label}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                      viewMode === mode
                        ? "bg-[#F0F2FA] text-[#111965]"
                        : "text-[#68708A] hover:text-[#171A2C]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories: the only category control on the page. */}
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:px-0">
            <button
              onClick={() => setSelectedCategory("")}
              aria-pressed={!selectedCategory}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                !selectedCategory
                  ? "bg-[#111965] text-white"
                  : "bg-[#F5F6FA] text-[#5A6482] hover:bg-[#ECEFF7] hover:text-[#171A2C]"
              )}
            >
              <span>{t("majorsDirectory.allCategories")}</span>
              <span className={cn("tabular-nums", !selectedCategory ? "text-white/60" : "text-[#68708A]")}>
                {catalogueStats?.majors ?? ""}
              </span>
            </button>

            {(categories || []).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                  selectedCategory === cat
                    ? "bg-[#111965] text-white"
                    : "bg-[#F5F6FA] text-[#5A6482] hover:bg-[#ECEFF7] hover:text-[#171A2C]"
                )}
              >
                <span>{t(`categories.${cat}`, cat)}</span>
                {categoryCounts[cat] != null && (
                  <span className={cn("tabular-nums", selectedCategory === cat ? "text-white/60" : "text-[#68708A]")}>
                    {categoryCounts[cat]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFeatured && (
        <section className="border-b border-[#E6E8F0] bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold text-[#68708A]">
                  {isKm ? "ជំនាញដែលគួរស្វែងយល់មុនគេ" : "Start here"}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-[-0.01em] text-[#111965] sm:text-[1.75rem]">
                  {getLocalized(featuredMajor.name)}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#68708A]">
                  {getLocalized(featuredMajor.description)}
                </p>

                <dl className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-[12px] text-[#68708A]">
                      {isKm ? "សាកលវិទ្យាល័យ" : "Universities"}
                    </dt>
                    <dd className="mt-0.5 text-base font-bold tabular-nums text-[#171A2C]">
                      {featuredMajor.universities_count || 0}
                    </dd>
                  </div>
                  {typeof featuredMajor.min_tuition_usd === "number" && (
                    <div>
                      <dt className="text-[12px] text-[#68708A]">
                        {isKm ? "ថ្លៃសិក្សាចាប់ផ្តើម" : "Tuition from"}
                      </dt>
                      <dd className="mt-0.5 text-base font-bold tabular-nums text-[#171A2C]">
                        {formatUsd(featuredMajor.min_tuition_usd)}
                        <span className="ml-1 text-xs font-medium text-[#68708A]">
                          {isKm ? "/ ឆ្នាំ" : "/ year"}
                        </span>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[12px] text-[#68708A]">
                      {t("majorsDirectory.hollandCode")}
                    </dt>
                    <dd className="mt-1">
                      <RiasecPair
                        primary={featuredMajor.riasec_primary}
                        secondary={featuredMajor.riasec_secondary}
                        label={t("majorsDirectory.hollandCode")}
                      />
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/majors/${featuredMajor.slug}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111965] px-4 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2"
                  >
                    <span>{isKm ? "មើលកម្មវិធីសិក្សា" : "View the program"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActivePreviewMajor(featuredMajor)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{isKm ? "មើលកម្មវិធីបួនឆ្នាំ" : "Four-year outline"}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] max-h-[260px] w-full overflow-hidden rounded-xl bg-[#F0F2FA] sm:max-h-[340px] lg:max-h-none">
                  <Image
                    src={MAJOR_IMAGES[featuredMajor.slug] || "/images/majors/software-engineering.webp"}
                    alt={getLocalized(featuredMajor.name) || "Major"}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                </div>
              </div>
            </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Result count belongs to the results, not to a decorative header. */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 py-5">
          <p className="text-sm text-[#68708A]" aria-live="polite">
            <span className="font-bold tabular-nums text-[#111965]">{sortedMajors.length}</span>{" "}
            {isKm ? "ជំនាញ" : sortedMajors.length === 1 ? "major" : "majors"}
            {hasActiveFilters && (
              <span className="text-[#68708A]">
                {" "}
                {isKm ? `ក្នុងចំណោម ${totalMajors}` : `of ${totalMajors}`}
              </span>
            )}
          </p>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded text-xs font-bold text-[#111965] transition-colors hover:text-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t("majorsDirectory.resetFilters")}</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <ul className="overflow-hidden rounded-xl border border-[#E6E8F0] bg-white">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-[#E6E8F0] px-4 py-4 last:border-b-0 sm:px-5">
                <Skeleton className="hidden h-[72px] w-[88px] shrink-0 rounded-lg sm:block" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <WifiOff className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#111965]">
              {isKm ? "មិនអាចភ្ជាប់ទៅបញ្ជីជំនាញបានទេ" : "The majors directory didn't load"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[#68708A]">
              {isKm
                ? "សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។"
                : "Check your connection, then try again. Nothing you saved was lost."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#F7CE4D] px-4 text-sm font-bold text-[#111965] transition-colors hover:bg-[#E5BD3B] disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              <span>{isKm ? "ព្យាយាមម្តងទៀត" : "Try again"}</span>
            </button>
          </div>
        ) : sortedMajors.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="relative mx-auto h-20 w-20 opacity-80">
              <Image src="/images/think.webp" alt="" fill className="object-contain" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-[#111965]">
              {t("majorsDirectory.notFound")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[#68708A]">
              {isKm
                ? "សាកល្បងពាក្យខុសគ្នា ឬដកតម្រងប្រភេទចេញ ដើម្បីមើលជំនាញទាំងអស់។"
                : "Try a different word, or clear the category filter to see every major."}
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#F7CE4D] px-4 text-sm font-bold text-[#111965] transition-colors hover:bg-[#E5BD3B]"
            >
              {t("majorsDirectory.resetFilters")}
            </button>
          </div>
        ) : viewMode === "list" ? (
          <ul className="overflow-hidden rounded-xl border border-[#E6E8F0] bg-white">
            {sortedMajors.map((m) => {
              const coverImage = MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
              const universityCount = m.universities_count || 0;
              const tuition = typeof m.min_tuition_usd === "number" ? m.min_tuition_usd : null;

              return (
                <li
                  key={m.id}
                  className="group border-b border-[#E6E8F0] transition-colors last:border-b-0 hover:bg-[#FAFBFD]"
                >
                  <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 px-4 py-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-5">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-[#F0F2FA] sm:h-[72px] sm:w-[88px]">
                      <Image
                        src={coverImage}
                        alt={getLocalized(m.name) || "Major"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        sizes="(max-width: 640px) 64px, 88px"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="text-[15px] font-bold leading-snug text-[#111965] transition-colors group-hover:text-[#1E277A] sm:text-base">
                          <Link href={`/majors/${m.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30">
                            {getLocalized(m.name)}
                          </Link>
                        </h3>
                        {m.is_stem && (
                          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded bg-[#FFF9E6] px-1.5 py-0.5 text-[11px] font-bold text-[#7A5F00]">
                            <Sparkles className="h-2.5 w-2.5" />
                            STEM
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-[#68708A]">
                        {getLocalized(m.description)}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#68708A] sm:text-[13px]">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {universityCount > 0
                            ? `${universityCount} ${isKm ? "សាកលវិទ្យាល័យ" : universityCount === 1 ? "university" : "universities"}`
                            : isKm ? "មិនទាន់មានកម្មវិធី" : "No program listed yet"}
                        </span>

                        {tuition !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5" />
                            {isKm ? "ចាប់ពី" : "from"} {formatUsd(tuition)}
                            <span className="text-[#68708A]/80">{isKm ? "/ឆ្នាំ" : "/yr"}</span>
                          </span>
                        )}

                        <RiasecPair
                          primary={m.riasec_primary}
                          secondary={m.riasec_secondary}
                          label={t("majorsDirectory.hollandCode")}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between gap-2 pt-1 sm:col-span-1 sm:justify-end sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setActivePreviewMajor(m)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                        aria-label={isKm ? "មើលកម្មវិធីសិក្សា" : "Preview curriculum"}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Curriculum</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <BookmarkButton entityType="major" entityId={m.id} />

                        <Link
                          href={`/majors/${m.slug}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111965] px-3.5 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2"
                        >
                          <span>{t("majorsDirectory.details")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {sortedMajors.map((m) => {
              const coverImage = MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
              const universityCount = m.universities_count || 0;
              const tuition = typeof m.min_tuition_usd === "number" ? m.min_tuition_usd : null;

              return (
                <li key={m.id} className="group flex flex-col">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F0F2FA]">
                    <Image
                      src={coverImage}
                      alt={getLocalized(m.name) || "Major"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {m.is_stem && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-[#7A5F00]">
                        <Sparkles className="h-2.5 w-2.5" />
                        STEM
                      </span>
                    )}
                    <span className="absolute right-3 top-3">
                      <BookmarkButton entityType="major" entityId={m.id} variant="overlay" />
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-[#111965] transition-colors group-hover:text-[#1E277A]">
                    <Link href={`/majors/${m.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30">
                      {getLocalized(m.name)}
                    </Link>
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#68708A]">
                    {getLocalized(m.description)}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#68708A]">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {universityCount > 0
                        ? `${universityCount} ${isKm ? "សាកលវិទ្យាល័យ" : universityCount === 1 ? "university" : "universities"}`
                        : isKm ? "មិនទាន់មានកម្មវិធី" : "No program listed yet"}
                    </span>
                    {tuition !== null && (
                      <span className="inline-flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5" />
                        {isKm ? "ចាប់ពី" : "from"} {formatUsd(tuition)}
                        <span className="text-[#68708A]/80">{isKm ? "/ឆ្នាំ" : "/yr"}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <RiasecPair
                      primary={m.riasec_primary}
                      secondary={m.riasec_secondary}
                      label={t("majorsDirectory.hollandCode")}
                    />
                    <button
                      type="button"
                      onClick={() => setActivePreviewMajor(m)}
                      className="inline-flex items-center gap-1 rounded text-xs font-bold text-[#111965] transition-colors hover:text-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Curriculum</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Curriculum preview */}
      {activePreviewMajor && (
        <Dialog open={!!activePreviewMajor} onOpenChange={(open) => !open && setActivePreviewMajor(null)}>
          <div className="space-y-5">
            <div className="border-b border-[#E6E8F0] pb-4 pr-10">
              <p className="text-xs font-semibold text-[#68708A]">
                {isKm ? "កម្មវិធីសិក្សា" : "Curriculum overview"}
              </p>
              <h3 className="mt-1 text-xl font-bold leading-snug text-[#111965]">
                {getLocalized(activePreviewMajor.name)}
              </h3>
            </div>

            {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug] ? (
              <div className="space-y-4">
                <ol className="space-y-2">
                  {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].years.map((y) => (
                    <li key={y.year} className="flex gap-4 rounded-lg border border-[#E6E8F0] p-3.5">
                      <span className="flex h-6 min-w-[2.6rem] shrink-0 items-center justify-center rounded-md bg-[#F0F2FA] px-1.5 text-[11px] font-bold tabular-nums text-[#111965]">
                        {isKm ? "ឆ្នាំ" : "Year"} {y.year}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-[#171A2C]">
                          {isKm ? y.titleKm : y.titleEn}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#68708A]">{y.focus}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="rounded-lg bg-[#F0F2FA] p-3.5">
                  <p className="text-xs font-bold text-[#111965]">
                    {isKm ? "ជំនាញដែលទទួលបាន" : "Skills you graduate with"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].keySkills.map((s) => (
                      <span key={s} className="rounded border border-[#E6E8F0] bg-white px-2 py-0.5 text-[12px] font-medium text-[#171A2C]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].sampleCareers?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#111965]">
                      {isKm ? "អាជីពដែលអាចបន្ត" : "Roles this leads to"}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[#68708A]">
                      {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].sampleCareers.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-sm leading-relaxed text-[#68708A]">
                {isKm
                  ? "កម្មវិធីសិក្សាលម្អិតកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាពពីសាកលវិទ្យាល័យ។"
                  : "The detailed syllabus is being updated from the university faculty catalogue."}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E8F0] pt-4">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#68708A]">
                <GraduationCap className="h-4 w-4" />
                {activePreviewMajor.universities_count || 0}{" "}
                {isKm ? "សាកលវិទ្យាល័យ" : "universities offer this"}
              </span>
              <Link
                href={`/majors/${activePreviewMajor.slug}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111965] px-3.5 text-xs font-bold text-white transition-colors hover:bg-[#1E277A]"
              >
                <span>{isKm ? "មើលព័ត៌មានពេញលេញ" : "Open full profile"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
