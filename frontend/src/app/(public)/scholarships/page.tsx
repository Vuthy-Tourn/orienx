"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Award,
  Search,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  Building,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  X,
  Clock,
  Layers,
  Percent,
  Check,
  Sliders,
  DollarSign,
  FileCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";

// Map scholarship slugs to local poster assets
const SCHOLARSHIP_POSTERS: Record<string, string> = {
  "techo-digital-talent-scholarship": "/images/scholarships/techo-scholarship-poster.jpg",
  "aupp-merit-scholarship": "/images/scholarships/aupp-scholarship-poster.jpg",
  "moeys-national-scholarship": "/images/scholarships/MoEYS-scholarship.png",
};

export default function ScholarshipsPage() {
  const { t, getLocalized, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [coverageFilter, setCoverageFilter] = useState("");

  // Interactive "Do I Qualify?" criteria state
  const [targetBaciiGrade, setTargetBaciiGrade] = useState<string>("ALL");
  const [targetStudyField, setTargetStudyField] = useState<string>("ALL");

  const { data: scholarships, isLoading } = useQuery({
    queryKey: ["scholarships", searchTerm, coverageFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (coverageFilter) params.append("coverage_type", coverageFilter);
      return apiFetch<any[]>(`/scholarships?${params.toString()}`);
    },
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

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero Header with Magic UI DotPattern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-12 pb-14">
        <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] opacity-35" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t("scholarshipsPage.verifiedBadge")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111965] tracking-tight leading-tight">
              {t("scholarshipsPage.title")}
            </h1>

            <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
              {t("scholarshipsPage.subtitle")}
            </p>
          </div>

          {/* Interactive "Do I Qualify?" Scholarship Eligibility Radar */}
          <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E6E8F0] pb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#111965]">
                  Instant Eligibility Checker (Grade 12 BacII Qualifier)
                </h3>
                <p className="text-xs text-[#68708A]">
                  Select your expected Grade 12 National Exam standing to preview verified funding
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Grade Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider">
                  BacII Exam Grade
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
                      {grade === "ALL" ? "Any" : `Grade ${grade}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Field Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider">
                  Intended Field
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "ALL", label: "Any" },
                    { id: "STEM", label: "STEM/Tech" },
                    { id: "BIZ", label: "Business" },
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
                  <div className="text-[10px] font-bold text-[#68708A] uppercase">
                    Qualified Programs
                  </div>
                  <div className="text-sm font-black text-emerald-700">
                    {targetBaciiGrade === "A" ? "100% Full Tuition + Stipend" : "Full & Partial Tuition Available"}
                  </div>
                  <div className="text-[11px] text-[#68708A]">CADT, MoEYS, AUPP, ITC</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Spotlight Flagship Banner with Magic UI BorderBeam */}
        {spotlightScholarship && !hasActiveFilters && (
          <div className="relative rounded-3xl bg-gradient-to-br from-[#111965] via-[#1E277A] to-[#0A0F3D] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
            <BorderBeam size={250} duration={14} delay={0} borderWidth={2} colorFrom="#F7CE4D" colorTo="#38BDF8" />

            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
              <Award className="w-96 h-96 text-white" />
            </div>

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
                    <span className="text-[10px] uppercase font-bold text-[#F7CE4D] block">Tuition Coverage</span>
                    <span className="font-extrabold text-white">100% 4-Year Full-Ride</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#F7CE4D] block">Living Stipend</span>
                    <span className="font-extrabold text-white">$120 / Month Allowance</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#F7CE4D] block">Hardware Grant</span>
                    <span className="font-extrabold text-white">Free High-Spec Laptop</span>
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
                    href={`/scholarships/${spotlightScholarship.slug}`}
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
                    src={SCHOLARSHIP_POSTERS[spotlightScholarship.slug] || "/images/scholarships/techo-scholarship-poster.jpg"}
                    alt={getLocalized(spotlightScholarship.title) || "Poster"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                placeholder={t("scholarshipsPage.searchPlaceholder")}
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

            {/* Coverage Filter Select */}
            <div className="sm:col-span-4">
              <select
                value={coverageFilter}
                onChange={(e) => setCoverageFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="">{t("scholarshipsPage.allCoverage")}</option>
                <option value="FULL_TUITION">{t("scholarshipsPage.fullTuition")}</option>
                <option value="PARTIAL_TUITION">{t("scholarshipsPage.partialTuition")}</option>
              </select>
            </div>
          </div>

          {/* Quick Segmented Coverage Pills without emojis */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E8F0]/80">
            <button
              onClick={() => setCoverageFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !coverageFilter
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C] hover:bg-slate-200/70"
              }`}
            >
              {t("scholarshipsPage.allCoverage")}
            </button>
            <button
              onClick={() => setCoverageFilter("FULL_TUITION")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                coverageFilter === "FULL_TUITION"
                  ? "bg-amber-500 text-[#111965] font-extrabold shadow-xs"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t("scholarshipsPage.fullTuition")}</span>
            </button>
            <button
              onClick={() => setCoverageFilter("PARTIAL_TUITION")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                coverageFilter === "PARTIAL_TUITION"
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-blue-50 text-blue-900 hover:bg-blue-100"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>{t("scholarshipsPage.partialTuition")}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("scholarshipsPage.resetFilters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scholarships List / Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        ) : scholarships && scholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map((s: any) => {
              const poster = SCHOLARSHIP_POSTERS[s.slug] || "/images/scholarships/techo-scholarship-poster.jpg";
              const isFull = s.coverage_type === "FULL_TUITION";
              const criteria = getLocalized(s.eligibility_criteria) || s.eligibility_criteria?.en || [];
              const criteriaArray = Array.isArray(criteria) ? criteria : [];

              return (
                <div
                  key={s.id}
                  className="group rounded-2xl bg-white border border-[#E6E8F0] hover:border-[#111965]/30 p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Top Badges without emojis */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold ${
                          isFull
                            ? "bg-[#FFF9E6] text-[#111965] border border-[#F7CE4D] shadow-2xs"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isFull ? "100% Full Tuition" : `${s.coverage_percentage || 50}% Partial Coverage`}</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-xs text-[#68708A] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Deadline: {s.application_deadline || "Rolling"}</span>
                      </span>
                    </div>

                    {/* Provider & Title */}
                    <div>
                      <div className="text-[11px] font-bold text-[#68708A] uppercase tracking-wide flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#111965]" />
                        <span>{getLocalized(s.provider)}</span>
                      </div>
                      <Link href={`/scholarships/${s.slug}`} className="hover:underline">
                        <h3 className="text-lg font-extrabold text-[#111965] group-hover:text-[#1E277A] transition-colors leading-snug mt-1">
                          {getLocalized(s.title)}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-xs text-[#68708A] leading-relaxed line-clamp-3">
                      {getLocalized(s.description)}
                    </p>

                    {/* Target Institutions tag */}
                    {s.country_or_institution && (
                      <div className="text-xs text-[#68708A] flex items-center gap-1.5">
                        <span className="font-bold text-[#111965]">Target Campuses:</span>
                        <span className="truncate">{s.country_or_institution}</span>
                      </div>
                    )}

                    {/* Eligibility Checklist preview */}
                    {criteriaArray.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F0F2FA]/70 border border-[#E6E8F0] text-xs space-y-1.5">
                        <div className="font-bold text-[#111965] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t("scholarshipsPage.eligibilityCriteria")}</span>
                        </div>
                        <ul className="space-y-1 text-[#68708A] text-[11px]">
                          {criteriaArray.slice(0, 2).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#111965] font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-2">
                    {user ? (
                      <button
                        type="button"
                        onClick={() => toggleTrack({ id: s.id, status: "SAVED" })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#111965] hover:text-[#1E277A] transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{t("scholarshipsPage.trackScholarship")}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-[#68708A]">Official State & University Grant</span>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/scholarships/${s.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <span>{t("scholarshipsPage.viewGuidelines")}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      {s.official_url && (
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                        >
                          <span>{t("scholarshipsPage.applyNow")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
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
                alt="No scholarships found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("scholarshipsPage.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Try adjusting your search criteria or selecting "All Coverage Types" to view available scholarships.
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
