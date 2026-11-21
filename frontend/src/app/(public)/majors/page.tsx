"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { STATIC_MAJORS, getStaticMajorCategories, listStaticMajors } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  Building2,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Wallet,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { DirectoryControls } from "@/components/directory/directory-controls";
import { DirectoryHeroStats } from "@/components/directory/directory-hero-stats";
import type { SelectOption } from "@/components/ui/select";
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
  image_url?: string | null;
  is_stem: boolean;
  universities_count?: number;
  min_tuition_usd?: number | null;
};

// Local image lookup for Cambodian majors
const MAJOR_IMAGES: Record<string, string> = {
  "software-engineering": "/images/majors/software-engineering.webp",
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

type SortKey = "default" | "name" | "universities";

// Category identity colour. Reuses the same hue language as the assessment
// pillars so a major's field is recognisable across the product.
const CATEGORY_COLOR: Record<string, string> = {
  "Information Technology": "#2563EB",
  Engineering: "#D97706",
  "Business & Economics": "#059669",
  "Social Sciences": "#7C3AED",
};

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
              "inline-flex h-5 w-5 items-center justify-center rounded border text-[12px] font-bold tabular-nums",
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
  const [sortBy, setSortBy] = useState<SortKey>("default");  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activePreviewMajor, setActivePreviewMajor] = useState<Major | null>(null);

  const sortOptions: SelectOption<SortKey>[] = [
    {
      value: "default",
      label: isKm ? "លំដាប់ដើម" : "Featured order",
      description: isKm ? "តាមលំដាប់បញ្ជី" : "Catalogue order",
    },
    {
      value: "name",
      label: t("majorsDirectory.sortAlphabetical"),
    },
    {
      value: "universities",
      label: t("majorsDirectory.sortPopular"),
      description: isKm ? "សាកលវិទ្យាល័យច្រើនមុន" : "Most universities first",
    },
  ];

  const categories = getStaticMajorCategories();

  // The public directory is bundled as static JSON so it works on Vercel
  // without the FastAPI backend.
  const catalog = STATIC_MAJORS as unknown as Major[];
  const majors = listStaticMajors({
    search: searchTerm,
    category: selectedCategory || undefined,
    stemOnly,
  }) as unknown as Major[];
  const isLoading = false;
  const isError = false;
  const isFetching = false;
  const refetch = () => {};

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
      {/* Page header: what this directory is, plus the one action that
          shortens the list fastest (the interest test). */}
      <section className="border-b border-[#E6E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-9 sm:px-6 sm:pt-11 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#111965]/15 bg-[#111965]/5 px-3 py-1 text-[12px] font-bold text-[#111965]">
              <GraduationCap className="h-3.5 w-3.5" />
              {t("majorsDirectory.badge")}
            </span>

            <h1 className="mt-3.5 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#111965] sm:text-[2.5rem]">
              {t("majorsDirectory.title")}
            </h1>

            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[#68708A] sm:text-[16px]">
              {t("majorsDirectory.subtitle")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/riasec"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#F7CE4D] px-4 text-sm font-bold text-[#111965] shadow-[0_1px_2px_rgba(17,25,101,0.08)] transition-colors hover:bg-[#E5BD3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isKm ? "រកជំនាញដែលត្រូវនឹងខ្លួនឯង" : "Find my fit in 10 minutes"}
                </span>
              </Link>

              <Link
                href="/assessments"
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#111965] underline-offset-4 transition-colors hover:text-[#1E277A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
              >
                <span>{isKm ? "តើយើងផ្គូផ្គងដោយរបៀបណា" : "How we match majors"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <DirectoryHeroStats stats={heroStats} />
      </section>

      {/* One control surface: search, filtering, sorting, view. */}
      <DirectoryControls
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t("majorsDirectory.searchPlaceholder")}
        clearSearchLabel={isKm ? "សម្អាតការស្វែងរក" : "Clear search"}
        selects={[
          {
            key: "category",
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: [
              {
                value: "",
                label: t("majorsDirectory.allCategories"),
                count: catalogueStats?.majors ?? catalog.length,
              },
              ...categories.map((cat) => ({
                value: cat,
                label: t(`categories.${cat}`, cat),
                count: categoryCounts[cat],
              })),
            ],
            label: isKm ? "ប្រភេទជំនាញ" : "Category",
            className: "md:w-[210px]",
          },
        ]}
        extra={
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
            <span>STEM</span>
          </button>
        }
        sort={{
          value: sortBy,
          onChange: (value) => setSortBy(value as SortKey),
          options: sortOptions,
          label: t("majorsDirectory.sortBy"),
        }}
        view={{
          mode: viewMode,
          onChange: setViewMode,
          gridLabel: isKm ? "ក្រឡាចត្រង្គ" : "Grid view",
          listLabel: isKm ? "បញ្ជី" : "List view",
        }}
      />

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
              const coverImage =
                m.image_url || MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
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
                        <h3 className="text-[16px] font-bold leading-snug text-[#111965] transition-colors group-hover:text-[#1E277A] sm:text-base">
                          <Link href={`/majors/${m.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30">
                            {getLocalized(m.name)}
                          </Link>
                        </h3>
                        {m.is_stem && (
                          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded bg-[#FFF9E6] px-1.5 py-0.5 text-[12px] font-bold text-[#7A5F00]">
                            <Sparkles className="h-2.5 w-2.5" />
                            STEM
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-[14px] leading-relaxed text-[#68708A]">
                        {getLocalized(m.description)}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#68708A] sm:text-[14px]">
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
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedMajors.map((m) => {
              const coverImage =
                m.image_url || MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
              const universityCount = m.universities_count || 0;
              const tuition = typeof m.min_tuition_usd === "number" ? m.min_tuition_usd : null;
              const categoryColor = CATEGORY_COLOR[m.category] || "#111965";

              return (
                <li
                  key={m.id}
                  data-reveal
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#E6E8F0] transition-shadow duration-200 hover:ring-[#111965]/20 hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F0F2FA]">
                    <Image
                      src={coverImage}
                      alt={getLocalized(m.name) || "Major"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {m.is_stem && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#111965] px-2 py-1 text-[12.5px] font-bold text-white">
                        <Sparkles className="h-2.5 w-2.5 text-[#F7CE4D]" />
                        STEM
                      </span>
                    )}
                    <span className="absolute right-3 top-3">
                      <BookmarkButton entityType="major" entityId={m.id} variant="overlay" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="truncate text-[12px] font-bold text-[#68708A]">
                          {t(`categories.${m.category}`, m.category)}
                        </span>
                      </span>

                      <RiasecPair
                        primary={m.riasec_primary}
                        secondary={m.riasec_secondary}
                        label={t("majorsDirectory.hollandCode")}
                      />
                    </div>

                    <h3 className="mt-2 text-[18px] font-extrabold leading-[1.28] tracking-[-0.01em] text-[#111965] transition-colors group-hover:text-[#1E277A]">
                      <Link
                        href={`/majors/${m.slug}`}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                      >
                        {getLocalized(m.name)}
                      </Link>
                    </h3>

                    <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-[#68708A]">
                      {getLocalized(m.description)}
                    </p>

                    <div className="mt-auto pt-5">
                      <dl className="grid grid-cols-2 gap-3 border-t border-[#E6E8F0] pt-3.5">
                        <div>
                          <dt className="text-[12.5px] font-semibold leading-snug text-[#68708A]">
                            {isKm ? "ថ្លៃសិក្សាចាប់ផ្តើម" : "Tuition from"}
                          </dt>
                          <dd className="mt-1 text-[20px] font-extrabold leading-tight tabular-nums text-[#111965]">
                            {tuition !== null ? (
                              <>
                                {formatUsd(tuition)}
                                <span className="ml-0.5 text-[12px] font-semibold text-[#68708A]">
                                  {isKm ? "/ឆ្នាំ" : "/yr"}
                                </span>
                              </>
                            ) : (
                              <span className="text-[14px] font-semibold text-[#68708A]">—</span>
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-[12.5px] font-semibold leading-snug text-[#68708A]">
                            {isKm ? "សាកលវិទ្យាល័យ" : "Universities"}
                          </dt>
                          <dd className="mt-1 text-[20px] font-extrabold leading-tight tabular-nums text-[#111965]">
                            {universityCount > 0 ? (
                              universityCount
                            ) : (
                              <span className="text-[14px] font-semibold text-[#68708A]">—</span>
                            )}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setActivePreviewMajor(m)}
                          aria-label={isKm ? "មើលកម្មវិធីសិក្សា" : "Preview curriculum"}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Curriculum</span>
                        </button>

                        <Link
                          href={`/majors/${m.slug}`}
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-[#111965] px-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2"
                        >
                          <span>{t("majorsDirectory.details")}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
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
                      <span className="flex h-6 min-w-[2.6rem] shrink-0 items-center justify-center rounded-md bg-[#F0F2FA] px-1.5 text-[12px] font-bold tabular-nums text-[#111965]">
                        {isKm ? "ឆ្នាំ" : "Year"} {y.year}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-[#171A2C]">
                          {isKm ? y.titleKm : y.titleEn}
                        </p>
                        <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#68708A]">{y.focus}</p>
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
                      <span key={s} className="rounded border border-[#E6E8F0] bg-white px-2 py-0.5 text-[13px] font-medium text-[#171A2C]">
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
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[#68708A]">
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
              <span className="inline-flex items-center gap-1.5 text-[13.5px] text-[#68708A]">
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
