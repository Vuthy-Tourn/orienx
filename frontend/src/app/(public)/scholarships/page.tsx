"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { DirectoryControls } from "@/components/directory/directory-controls";
import { DirectoryHeroStats } from "@/components/directory/directory-hero-stats";
import { useAuth } from "@/contexts/auth-context";
import {
  Award,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Check,
  FileCheck,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/ui/bookmark-button";

// Map scholarship slugs to local poster assets
const SCHOLARSHIP_POSTERS: Record<string, string> = {
  "techo-digital-talent-scholarship": "/images/scholarships/techo-scholarship-poster.jpg",
  "aupp-merit-scholarship": "/images/scholarships/aupp-scholarship-poster.jpg",
  "moeys-national-scholarship": "/images/scholarships/MoEYS-scholarship.png",
};

const DEADLINE_MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  km: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
};

function formatScholarshipDeadline(
  value: string | null | undefined,
  language: "en" | "km"
): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;
  return `${Number(day)} ${DEADLINE_MONTHS[language][monthIndex]} ${year}`;
}

export default function ScholarshipsPage() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const linkPrefix = isDashboard ? "/dashboard" : "";
  const { t, getLocalized, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [coverageFilter, setCoverageFilter] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "title">("default");

  // Interactive "Do I Qualify?" criteria state
  const [targetBaciiGrade, setTargetBaciiGrade] = useState<string>("ALL");
  const [targetStudyField, setTargetStudyField] = useState<string>("ALL");

  const {
    data: scholarships,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["scholarships", searchTerm, coverageFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (coverageFilter) params.append("coverage_type", coverageFilter);
      return apiFetch<any[]>(`/scholarships?${params.toString()}`);
    },
    retry: 1,
  });

  const { mutate: toggleTrack } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/scholarships/${id}/track`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      alert(t("scholarshipsPage.savedAlert"));
    },
  });

  const hasActiveFilters = Boolean(searchTerm || coverageFilter);

  const resetFilters = () => {
    setSearchTerm("");
    setCoverageFilter("");
    setTargetBaciiGrade("ALL");
    setTargetStudyField("ALL");
  };

  // Flagship spotlight item
  const spotlightScholarship = useMemo(() => {
    if (!scholarships || scholarships.length === 0) return null;
    return scholarships.find((s) => s.slug === "techo-digital-talent-scholarship") || scholarships[0];
  }, [scholarships]);

  const sortedScholarships = useMemo(() => {
    const list = scholarships ? [...scholarships] : [];
    if (sortBy === "title") {
      list.sort((a, b) => getLocalized(a.title).localeCompare(getLocalized(b.title)));
    }
    return list;
  }, [scholarships, sortBy, getLocalized]);

  const statsSource = scholarships || [];
  const fullCount = statsSource.filter(
    (s: any) => s.coverage_type === "FULL_TUITION"
  ).length;
  const heroStats = [
    {
      label: language === "km" ? "អាហារូបករណ៍" : "Scholarships",
      value: scholarships ? String(statsSource.length) : "—",
    },
    {
      label: language === "km" ? "ពេញ ១០០%" : "Full tuition",
      value: scholarships ? String(fullCount) : "—",
    },
    {
      label: language === "km" ? "មួយផ្នែក" : "Partial",
      value: scholarships ? String(statsSource.length - fullCount) : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero */}
      <section className="border-b border-[#E6E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-9 sm:px-6 sm:pt-11 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#111965]/15 bg-[#111965]/5 px-3 py-1 text-[12px] font-bold text-[#111965]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("scholarshipsPage.verifiedBadge")}
            </span>

            <h1 className="mt-3.5 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#111965] sm:text-[2.5rem]">
              {t("scholarshipsPage.title")}
            </h1>

            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[#68708A] sm:text-[16px]">
              {t("scholarshipsPage.subtitle")}
            </p>
          </div>
        </div>

        <DirectoryHeroStats stats={heroStats} />
      </section>

      {/* One control surface: search, filtering, sorting. */}
      <DirectoryControls
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t("scholarshipsPage.searchPlaceholder")}
        clearSearchLabel={language === "km" ? "សម្អាតការស្វែងរក" : "Clear search"}
        chips={[
          { value: "", label: t("scholarshipsPage.allCoverage") },
          { value: "FULL_TUITION", label: t("scholarshipsPage.fullTuition") },
          { value: "PARTIAL_TUITION", label: t("scholarshipsPage.partialTuition") },
        ]}
        activeChip={coverageFilter}
        onChipChange={setCoverageFilter}
        sort={{
          value: sortBy,
          onChange: (value) => setSortBy(value as typeof sortBy),
          options: [
            { value: "default", label: language === "km" ? "លំដាប់ដើម" : "Featured order" },
            { value: "title", label: language === "km" ? "ឈ្មោះ A–Z" : "Name A–Z" },
          ],
          label: language === "km" ? "តម្រៀបតាម" : "Sort by",
        }}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        resetLabel={t("scholarshipsPage.resetFilters")}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Interactive "Do I Qualify?" Scholarship Eligibility Radar */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E8F0] pb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111965]">
                {language === "km" ? "កម្មវិធីពិនិត្យសិទ្ធិទទួលអាហារូបករណ៍តាមនិទ្ទេសបាក់ឌុប" : "Instant Eligibility Checker"}
              </h3>
              <p className="text-xs text-[#68708A]">
                {language === "km" ? "ជ្រើសរើសនិទ្ទេសបាក់ឌុបដែលអ្នករំពឹង ដើម្បីមើលអាហារូបករណ៍ដែលអាចទទួលបាន" : "Select your expected Grade 12 National Exam standing to preview verified funding"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Grade Selection */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#68708A] uppercase tracking-wider">
                {language === "km" ? "និទ្ទេសបាក់ឌុប" : "BacII Exam Grade"}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["ALL", "A", "B", "C"].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setTargetBaciiGrade(grade)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      targetBaciiGrade === grade
                        ? "bg-[#111965] text-white border-[#111965] shadow-xs"
                        : "bg-[#F8FAFC] text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
                    }`}
                  >
                    {grade === "ALL" ? (language === "km" ? "ទាំងអស់" : "Any") : language === "km" ? `និទ្ទេស ${grade}` : `Grade ${grade}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Field Selection */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#68708A] uppercase tracking-wider">
                {language === "km" ? "វិស័យដែលចង់រៀន" : "Intended Field"}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "ALL", label: language === "km" ? "ទាំងអស់" : "Any" },
                  { id: "STEM", label: language === "km" ? "STEM/បច្ចេកវិទ្យា" : "STEM/Tech" },
                  { id: "BIZ", label: language === "km" ? "ពាណិជ្ជកម្ម" : "Business" },
                ].map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => setTargetStudyField(field.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      targetStudyField === field.id
                        ? "bg-[#111965] text-white border-[#111965] shadow-xs"
                        : "bg-[#F8FAFC] text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
                    }`}
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Eligibility Result Box */}
            <div className="p-3.5 rounded-2xl bg-[#F0F2FA]/80 border border-[#E6E8F0] flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-bold text-[#68708A] uppercase">
                  {language === "km" ? "កម្មវិធីដែលមានសិទ្ធិ" : "Qualified Programs"}
                </div>
                <div className="text-sm font-black text-emerald-700">
                  {targetBaciiGrade === "A" ? (language === "km" ? "អាហារូបករណ៍ពេញ ១០០% + ប្រាក់ឧបត្ថម្ភ" : "100% Full Tuition + Stipend") : (language === "km" ? "មានអាហារូបករណ៍ពេញ និងមួយផ្នែក" : "Full & Partial Tuition Available")}
                </div>
                <div className="text-[12px] text-[#68708A]">CADT, MoEYS, AUPP, ITC</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight Flagship Banner */}
        {spotlightScholarship && !hasActiveFilters && (
          <div className="relative rounded-3xl bg-gradient-to-br from-[#111965] via-[#1E277A] to-[#0A0F3D] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7CE4D] text-[#111965] text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("scholarshipsPage.spotlight")}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {getLocalized(spotlightScholarship.title)}
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed max-w-2xl">
                  {getLocalized(spotlightScholarship.description)}
                </p>

                {/* Benefits Breakdown Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-0.5">
                    <span className="text-[12.5px] uppercase font-bold text-[#F7CE4D] block">{language === "km" ? "ថ្លៃសិក្សា" : "Tuition Coverage"}</span>
                    <span className="font-extrabold text-white">{language === "km" ? "ពេញ ១០០% សម្រាប់ ៤ ឆ្នាំ" : "100% 4-Year Full-Ride"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-0.5">
                    <span className="text-[12.5px] uppercase font-bold text-[#F7CE4D] block">{language === "km" ? "ប្រាក់ឧបត្ថម្ភរស់នៅ" : "Living Stipend"}</span>
                    <span className="font-extrabold text-white">{language === "km" ? "ប្រាក់ឧបត្ថម្ភ $120 / ខែ" : "$120 / Month Allowance"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-0.5">
                    <span className="text-[12.5px] uppercase font-bold text-[#F7CE4D] block">{language === "km" ? "ឧបករណ៍សិក្សា" : "Hardware Grant"}</span>
                    <span className="font-extrabold text-white">{language === "km" ? "កុំព្យូទ័រយួរដៃឥតគិតថ្លៃ" : "Free High-Spec Laptop"}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {spotlightScholarship.official_url && (
                    <a
                      href={spotlightScholarship.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md"
                    >
                      <span>{t("scholarshipsPage.applyNow")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link
                    href={`${linkPrefix}/scholarships/${spotlightScholarship.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    <span>{t("scholarshipsPage.viewGuidelines")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Poster thumbnail preview */}
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="relative w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 group">
                  <Image
                    src={
                      spotlightScholarship.poster_url ||
                      SCHOLARSHIP_POSTERS[spotlightScholarship.slug] ||
                      "/images/scholarships/techo-scholarship-poster.jpg"
                    }
                    alt={getLocalized(spotlightScholarship.title) || "Poster"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result count */}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[#68708A]" aria-live="polite">
            <span className="font-bold tabular-nums text-[#111965]">
              {sortedScholarships.length}
            </span>{" "}
            {language === "km"
              ? "អាហារូបករណ៍"
              : sortedScholarships.length === 1
              ? "scholarship"
              : "scholarships"}
          </p>
        </div>

        {/* Scholarships List / Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {language === "km" ? "មិនអាចទាញយកទិន្នន័យអាហារូបករណ៍បានឡើយ" : "Unable to Load Scholarships"}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                {language === "km"
                  ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                  : "We couldn't connect to the scholarships directory server. Please check your internet connection or try again."}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>{language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
              </button>
            </div>
          </div>
        ) : sortedScholarships.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {sortedScholarships.map((s: any) => {
              const poster =
                s.poster_url ||
                SCHOLARSHIP_POSTERS[s.slug] ||
                "/images/scholarships/scholarship-placeholder.svg";
              const isFull = s.coverage_type === "FULL_TUITION";
              const coverageLabel = isFull
                ? t("scholarshipsPage.fullTuition")
                : `${s.coverage_percentage || 50}% ${t(
                    "scholarshipsPage.partialCoverageSuffix"
                  )}`;
              const deadlineLabel = /rolling/i.test(s.application_deadline || "")
                ? t("scholarshipDetail.rolling")
                : formatScholarshipDeadline(s.application_deadline, language);
              const criteria =
                getLocalized(s.eligibility_criteria) ||
                s.eligibility_criteria?.en ||
                [];
              const criteriaArray = Array.isArray(criteria) ? criteria : [];
              const hasMeta = Boolean(s.country_or_institution) || criteriaArray.length > 0;

              return (
                <article
                  key={s.id}
                  className="group relative flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#E6E8F0] transition-all duration-300 hover:ring-[#111965]/25 hover:shadow-[0_26px_60px_-34px_rgba(17,25,101,0.45)] motion-reduce:transition-none"
                >
                  {/* Coverage + deadline */}
                  <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 pt-4 sm:px-6">
                    <span className="inline-flex items-center gap-1.5">
                      <Award
                        className={`h-[15px] w-[15px] ${
                          isFull ? "text-[#B45309]" : "text-[#68708A]"
                        }`}
                      />
                      <span className="text-[12.5px] font-extrabold tracking-[-0.01em] text-[#111965]">
                        {coverageLabel}
                      </span>
                    </span>

                    <span
                      className="inline-flex items-center gap-1.5"
                      title={`${t("scholarshipsPage.deadline")}: ${
                        deadlineLabel || t("scholarshipDetail.rolling")
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#68708A]" />
                      <span className="sr-only">
                        {t("scholarshipsPage.deadline")}:
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[#68708A] sm:inline"
                      >
                        {t("scholarshipsPage.deadline")}
                      </span>
                      <span className="text-[12px] font-bold tabular-nums text-[#111965]">
                        {deadlineLabel || t("scholarshipDetail.rolling")}
                      </span>
                    </span>
                  </div>

                  {/* Poster + identity */}
                  <div className="grid grid-cols-[82px_minmax(0,1fr)] gap-x-4 gap-y-2.5 px-5 pb-4 pt-4 sm:grid-cols-[94px_minmax(0,1fr)] sm:gap-x-5 sm:px-6 sm:pb-5">
                    <div className="relative row-start-1 h-[112px] w-full overflow-hidden rounded-xl bg-[#F0F2FA] ring-1 ring-[#E6E8F0] sm:row-span-2 sm:h-full sm:min-h-[128px]">
                      <Image
                        src={poster}
                        alt={getLocalized(s.title) || "Scholarship poster"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        sizes="(max-width: 640px) 82px, 94px"
                      />
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`flex items-start gap-1.5 text-[#68708A] text-[10.5px] font-semibold normal-case tracking-normal sm:text-[10px] sm:font-bold sm:uppercase sm:tracking-[0.12em] ${
                          language === "km" ? "sm:normal-case sm:tracking-normal" : ""
                        }`}
                      >
                        <Building className="mt-[2px] h-3 w-3 shrink-0 text-[#68708A]" />
                        <span
                          className="line-clamp-2 sm:line-clamp-1"
                          title={getLocalized(s.provider)}
                        >
                          {getLocalized(s.provider)}
                        </span>
                      </div>

                      <Link
                        href={`${linkPrefix}/scholarships/${s.slug}`}
                        className="mt-1.5 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                      >
                        <h3
                          className={`line-clamp-3 text-[17px] font-extrabold tracking-[-0.015em] text-[#111965] transition-colors group-hover:text-[#1E277A] sm:line-clamp-2 sm:text-[19px] ${
                            language === "km" ? "leading-[1.5]" : "leading-[1.3]"
                          }`}
                        >
                          {getLocalized(s.title)}
                        </h3>
                      </Link>
                    </div>

                    <p
                      className={`col-span-2 line-clamp-3 text-[12.5px] text-[#68708A] sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:text-[13px] ${
                        language === "km" ? "leading-[1.7]" : "leading-[1.6]"
                      }`}
                    >
                      {getLocalized(s.description)}
                    </p>
                  </div>

                  {/* Target institutions + eligibility preview */}
                  {hasMeta && (
                    <div className="mt-4 border-t border-[#E6E8F0] px-5 py-3.5 sm:mt-5 sm:px-6">
                      <div className="space-y-3">
                        {s.country_or_institution && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#68708A]" />
                            <p className="min-w-0 text-[12.5px] leading-[1.55] text-[#68708A]">
                              <span className="font-bold text-[#111965]">
                                {t("scholarshipsPage.eligibleMajors")}
                              </span>
                              <span className="mx-1.5 text-slate-400">/</span>
                              {s.country_or_institution}
                            </p>
                          </div>
                        )}

                        {criteriaArray.length > 0 && (
                          <div className="rounded-xl bg-[#F0F2FA] px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111965]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                              <span>{t("scholarshipsPage.eligibilityCriteria")}</span>
                            </div>
                            <ul className="mt-1.5 space-y-1">
                              {criteriaArray.slice(0, 2).map((item: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1.5 text-[12px] leading-[1.5] text-[#68708A]"
                                >
                                  <Check className="mt-[3px] h-3 w-3 shrink-0 text-[#68708A]" />
                                  <span className="line-clamp-1" title={item}>
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto border-t border-[#E6E8F0] px-5 py-3 sm:px-6">
                    <div className="grid grid-cols-2 items-center gap-2 xl:flex xl:justify-end">
                      <BookmarkButton
                        entityType="scholarship"
                        entityId={s.id}
                        variant="ghost"
                        showText
                        textActive={t("scholarshipsPage.trackedScholarship")}
                        textInactive={t("scholarshipsPage.trackScholarship")}
                        className="justify-self-start text-[12px] font-bold xl:mr-auto"
                      />

                      <Link
                        href={`${linkPrefix}/scholarships/${s.slug}`}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 xl:px-2.5 xl:text-[12px]"
                      >
                        <span className="xl:hidden">
                          {t("majorsDirectory.details")}
                        </span>
                        <span className="hidden xl:inline">
                          {t("scholarshipsPage.viewGuidelines")}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      {s.official_url && (
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#111965] px-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1E277A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 focus-visible:ring-offset-2 xl:col-span-1 xl:text-[12px]"
                        >
                          <span>{t("scholarshipsPage.applyNow")}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-[#F7CE4D]" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white border border-[#E6E8F0] p-8 space-y-4">
            <div className="relative w-24 h-24 mx-auto opacity-80">
              <Image
                src="/images/think.webp"
                alt="No scholarships found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("scholarshipsPage.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              {language === "km" ? "សូមកែលម្អការស្វែងរក ឬជ្រើសរើស “គ្រប់ប្រភេទអាហារូបករណ៍” ដើម្បីមើលអាហារូបករណ៍ដែលមាន។" : "Try adjusting your search criteria or selecting \"All Coverage Types\" to view available scholarships."}
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("scholarshipsPage.resetFilters")}
            </button>
          </div>
        )}

        {/* Essential Scholarship Preparation Guide Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#111965] text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t("scholarshipsPage.tipsTitle")}</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#111965]">
              3 Essential Steps for Grade 12 Graduates & Cambodian Students
            </h3>
            <p className="text-xs text-[#68708A]">
              {t("scholarshipsPage.tipsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-[#111965]">Academic Credentials</h4>
              <p className="text-xs text-[#68708A] leading-relaxed">
                Keep certified copies of your Grade 12 BacII National Examination certificate, Grade 10–12 transcripts, and national ID ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-[#111965]">Motivation Statement</h4>
              <p className="text-xs text-[#68708A] leading-relaxed">
                Explain your personal drive, career vision, and how you will contribute to Cambodia's socioeconomic and digital development.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-[#111965]">Aptitude & Interview Prep</h4>
              <p className="text-xs text-[#68708A] leading-relaxed">
                Prepare for logic, English proficiency, and basic STEM math questions frequently requested by CADT, AUPP, and MoEYS scholarship committees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
