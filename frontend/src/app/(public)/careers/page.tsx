"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Briefcase,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  GraduationCap,
  X,
  Compass,
  CheckCircle2,
  Layers,
  ChevronRight,
  Award,
  Cpu,
  BarChart3,
  HardHat,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";

// Career metadata without emojis - uses Lucide icon components
const CAREER_METADATA: Record<string, {
  salaryJunior: string;
  salarySenior: string;
  iconName: "cpu" | "chart" | "construction";
  colorTheme: { bg: string; text: string; border: string };
  recommendedMajors: { en: string; km: string; slug: string }[];
}> = {
  "software-engineer": {
    salaryJunior: "$450 – $900",
    salarySenior: "$1,500 – $3,000+",
    iconName: "cpu",
    colorTheme: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
    recommendedMajors: [
      { en: "Software Engineering", km: "វិស្វកម្មកម្មវិធី", slug: "software-engineering" },
      { en: "Data Science & AI", km: "វិទ្យាសាស្ត្រទិន្នន័យ & AI", slug: "data-science-ai" },
    ],
  },
  "financial-analyst": {
    salaryJunior: "$400 – $750",
    salarySenior: "$1,200 – $2,500+",
    iconName: "chart",
    colorTheme: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
    recommendedMajors: [
      { en: "Banking & Finance", km: "ធនាគារ និងហិរញ្ញវត្ថុ", slug: "banking-finance" },
      { en: "Business Administration", km: "គ្រប់គ្រងធុរកិច្ច", slug: "business-administration" },
    ],
  },
  "civil-engineer": {
    salaryJunior: "$350 – $700",
    salarySenior: "$1,100 – $2,200+",
    iconName: "construction",
    colorTheme: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
    recommendedMajors: [
      { en: "Civil Engineering", km: "វិស្វកម្មសំណង់ស៊ីវិល", slug: "civil-engineering" },
    ],
  },
};

const RIASEC_MAP: Record<string, { titleEn: string; titleKm: string; color: string }> = {
  R: { titleEn: "Realistic (Practical / Doers)", titleKm: "ជាក់ស្តែង (អនុវត្ត)", color: "bg-amber-100 text-amber-900" },
  I: { titleEn: "Investigative (Analytical / Thinkers)", titleKm: "ស្រាវជ្រាវ (វិភាគ)", color: "bg-blue-100 text-blue-900" },
  A: { titleEn: "Artistic (Creative / Creators)", titleKm: "សិល្បៈ (ច្នៃប្រឌិត)", color: "bg-purple-100 text-purple-900" },
  S: { titleEn: "Social (Supportive / Helpers)", titleKm: "សង្គម (ជួយអ្នកដទៃ)", color: "bg-emerald-100 text-emerald-900" },
  E: { titleEn: "Enterprising (Ambitious / Leaders)", titleKm: "សហគ្រិន (ដឹកនាំ)", color: "bg-orange-100 text-orange-900" },
  C: { titleEn: "Conventional (Organized / Detail)", titleKm: "ការិយាល័យ (រៀបរយ)", color: "bg-slate-100 text-slate-900" },
};

export default function CareersPage() {
  const { t, getLocalized, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  const { data: careers, isLoading } = useQuery({
    queryKey: ["careers", searchTerm, industryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (industryFilter) params.append("industry", industryFilter);
      return apiFetch<any[]>(`/careers?${params.toString()}`);
    },
  });

  const hasActiveFilters = Boolean(searchTerm || industryFilter);

  const resetFilters = () => {
    setSearchTerm("");
    setIndustryFilter("");
  };

  const renderIcon = (name: "cpu" | "chart" | "construction") => {
    switch (name) {
      case "cpu":
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case "chart":
        return <BarChart3 className="w-4 h-4 text-emerald-600" />;
      case "construction":
        return <HardHat className="w-4 h-4 text-amber-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-[#111965]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero Header with Magic UI DotPattern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-10 pb-12">
        <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] opacity-35" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-bold border border-[#111965]/15">
              <Briefcase className="w-3.5 h-3.5 text-[#111965]" />
              <span>{t("careersDirectory.badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111965] tracking-tight leading-tight">
              {t("careersDirectory.title")}
            </h1>

            <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
              {t("careersDirectory.subtitle")}
            </p>

            {/* Quick Stat Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-[#171A2C] font-semibold shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>High-Demand Cambodian Sectors</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-[#171A2C] font-semibold shadow-2xs">
                <DollarSign className="w-3.5 h-3.5 text-[#111965]" />
                <span>Verified Salary Benchmarks</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-[#171A2C] font-semibold shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Connected Degree Pathways</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("careersDirectory.searchPlaceholder")}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-[#F5F6FA]/50 focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/10 transition-all placeholder:text-[#68708A]/70"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68708A] hover:text-[#171A2C] p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Industry Selector */}
            <div className="sm:col-span-4">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="">{t("careersDirectory.allIndustries")}</option>
                <option value="Technology">Technology (បច្ចេកវិទ្យា)</option>
                <option value="Finance & Banking">Finance & Banking (ហិរញ្ញវត្ថុ & ធនាគារ)</option>
                <option value="Engineering & Construction">Engineering & Construction (វិស្វកម្ម & សំណង់)</option>
              </select>
            </div>
          </div>

          {/* Quick Industry Filter Tabs without emojis */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E8F0]/80">
            <button
              onClick={() => setIndustryFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !industryFilter
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C] hover:bg-slate-200/70"
              }`}
            >
              {t("careersDirectory.allIndustries")}
            </button>
            <button
              onClick={() => setIndustryFilter("Technology")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                industryFilter === "Technology"
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Technology</span>
            </button>
            <button
              onClick={() => setIndustryFilter("Finance & Banking")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                industryFilter === "Finance & Banking"
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Finance & Banking</span>
            </button>
            <button
              onClick={() => setIndustryFilter("Engineering & Construction")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                industryFilter === "Engineering & Construction"
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C]"
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Engineering & Construction</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("careersDirectory.resetFilters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Careers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : careers && careers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((c: any, index: number) => {
              const meta = CAREER_METADATA[c.slug] || {
                salaryJunior: "$350 – $700",
                salarySenior: "$1,000 – $2,000+",
                iconName: "cpu" as const,
                colorTheme: { bg: "bg-slate-50", text: "text-slate-900", border: "border-slate-200" },
                recommendedMajors: [],
              };
              const isFirst = index === 0;

              return (
                <div
                  key={c.id}
                  className="group relative rounded-2xl bg-white border border-[#E6E8F0] hover:border-[#111965]/30 p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5"
                >
                  {isFirst && <BorderBeam size={180} duration={12} delay={1} borderWidth={1.5} />}

                  <div className="space-y-4">
                    {/* Top Industry & RIASEC Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-slate-100 text-[#111965]">
                          {renderIcon(meta.iconName)}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.colorTheme.bg} ${meta.colorTheme.text} ${meta.colorTheme.border}`}>
                          {c.industry}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>In-Demand</span>
                      </span>
                    </div>

                    {/* Career Title */}
                    <div>
                      <h3 className="text-lg font-extrabold text-[#111965] group-hover:text-[#1E277A] transition-colors leading-snug">
                        {getLocalized(c.title)}
                      </h3>
                      <div className="text-xs text-[#68708A] font-mono mt-1 flex items-center gap-1.5">
                        <span className="font-bold text-[#111965]">RIASEC: {c.riasec_code}</span>
                        <span>•</span>
                        <span>Min: {c.education_level || "Bachelor"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#68708A] line-clamp-3 leading-relaxed">
                      {getLocalized(c.description)}
                    </p>

                    {/* Salary Benchmark Card */}
                    <div className="p-3.5 rounded-xl bg-[#F0F2FA]/70 border border-[#E6E8F0] space-y-1.5">
                      <div className="text-[11px] text-[#68708A] font-bold flex items-center justify-between">
                        <span>{t("careersDirectory.typicalSalary")}</span>
                        <span className="text-xs font-semibold text-[#111965]">USD / Month</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-[#68708A] block">Entry Level:</span>
                          <span className="font-bold text-[#111965]">{meta.salaryJunior}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#68708A] block">Senior / Lead:</span>
                          <span className="font-extrabold text-emerald-800">{meta.salarySenior}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Academic Majors */}
                    {meta.recommendedMajors.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-[#68708A] flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#111965]" />
                          <span>{t("careersDirectory.degreePathways")}:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.recommendedMajors.map((m) => (
                            <Link
                              key={m.slug}
                              href={`/majors/${m.slug}`}
                              className="px-2 py-0.5 rounded-md bg-[#F5F6FA] hover:bg-[#F0F2FA] text-[11px] font-semibold text-[#111965] border border-[#E6E8F0] hover:border-[#111965]/30 transition-colors"
                            >
                              {language === "km" ? m.km : m.en}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer CTA */}
                  <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                    <span className="text-xs text-[#68708A]">
                      Cambodia Market
                    </span>

                    <Link
                      href={`/careers/${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-2xs group-hover:shadow-xs"
                    >
                      <span>{t("careersDirectory.viewProfile")}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white border border-[#E6E8F0] p-8 space-y-4">
            <div className="relative w-24 h-24 mx-auto opacity-80">
              <Image
                src="/images/think.webp"
                alt="No careers found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("careersDirectory.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Try choosing "All Industries" or clearing your search term to see the complete list of career opportunities in Cambodia.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("careersDirectory.resetFilters")}
            </button>
          </div>
        )}

        {/* Informative Holland RIASEC Guide Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111965] to-[#1E277A] text-white shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F7CE4D] text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>Holland RIASEC Vocational Framework</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                How Career Compatibility Works in Futera
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Rather than guessing, we evaluate careers across Holland's 6 psychological work environments:
              </p>
            </div>

            <Link
              href="/dashboard/assessments/riasec"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md shrink-0 self-start sm:self-auto"
            >
              <span>Take RIASEC Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            {Object.entries(RIASEC_MAP).map(([key, info]) => (
              <div key={key} className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                <div className="text-sm font-extrabold text-[#F7CE4D]">{key}</div>
                <div className="text-xs font-bold text-white">
                  {language === "km" ? info.titleKm : info.titleEn.split(" ")[0]}
                </div>
                <div className="text-[10px] text-slate-300 line-clamp-1">
                  {info.titleEn.split("(")[1]?.replace(")", "") || ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
