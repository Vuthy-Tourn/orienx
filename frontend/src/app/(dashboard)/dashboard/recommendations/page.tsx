"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  Building2,
  ArrowRight,
  RotateCcw,
  Flame,
  Zap,
  LayoutGrid,
  List,
  Compass,
  BrainCircuit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/ui/bookmark-button";

type FilterTab = "top3" | "suitable" | "stem" | "all";
type ViewMode = "grid" | "list";

export default function RecommendationsPage() {
  const { t, getLocalized, language } = useLanguage();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<FilterTab>("top3");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // 1. Fetch recommendations
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Gate the page on the same assessment status the dashboard uses.
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => apiFetch<any>("/students/dashboard-summary"),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const assessmentStatus = summary?.assessments_status;
  const hasAnyTest = Boolean(
    assessmentStatus?.personality_completed || assessmentStatus?.riasec_completed
  );
  const needsAssessment =
    !summaryLoading && Boolean(assessmentStatus) && !hasAnyTest;
  const showRiasecScore = !assessmentStatus || Boolean(assessmentStatus.riasec_completed);
  const showPersonalityScore = !assessmentStatus || Boolean(assessmentStatus.personality_completed);
  const showAcademicScore = !assessmentStatus || Boolean(assessmentStatus.preferences_completed);

  // 2. Fetch user favorites to track active bookmark states
  const { data: favorites } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      try {
        return await apiFetch<any>("/favorites");
      } catch {
        return { majors: [], universities: [], careers: [], scholarships: [] };
      }
    },
  });

  // Sync favorites to local state set
  React.useEffect(() => {
    if (favorites) {
      const majorsList = favorites.majors || (Array.isArray(favorites) ? favorites : []);
      const ids = new Set<string>(
        majorsList.map((m: any) => m.id || m.entity_id)
      );
      setBookmarkedIds(ids);
    }
  }, [favorites]);

  // 3. Recalculate recommendations mutation
  const { mutate: recomputeRecs, isPending: recomputing } = useMutation({
    mutationFn: async () => {
      return apiFetch("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({ recompute: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  // 4. Toggle bookmark mutation
  const { mutate: toggleFav } = useMutation({
    mutationFn: async (majorId: string) => {
      return apiFetch("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ entity_type: "major", entity_id: majorId }),
      });
    },
    onMutate: (majorId: string) => {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(majorId)) {
          next.delete(majorId);
        } else {
          next.add(majorId);
        }
        return next;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });

  // Filter recommendations based on tab: Defaults to Top 3 Matches!
  const filteredRecs = useMemo(() => {
    if (!recommendations) return [];
    if (filterTab === "top3") {
      return recommendations.slice(0, 3);
    }
    if (filterTab === "suitable") {
      return recommendations.filter((r) => r.match_score >= 75);
    }
    if (filterTab === "stem") {
      return recommendations.filter((r) => r.major?.is_stem);
    }
    return recommendations;
  }, [recommendations, filterTab]);

  return (
    <div className="space-y-6 animate-in fade-in pb-16 select-none max-w-7xl mx-auto">
      {/* ========================================================
          PAGE HEADER (Compact & Elegant)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111965] text-[#F7CE4D] text-[12.5px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#F7CE4D]" />
              <span>AI Fit</span>
            </span>
            <span className="text-xs text-[#68708A]">
              {t("recommendationsPage.breadcrumb", "ផ្ទាំងគ្រប់គ្រង / អនុសាសន៍ផ្ទាល់ខ្លួន")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
            {t("recommendationsPage.title", "អនុសាសន៍ជំនាញសាកលវិទ្យាល័យផ្ទាល់ខ្លួន")}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!needsAssessment && (
            <button
              onClick={() => recomputeRecs()}
              disabled={recomputing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-white border border-[#E6E8F0] hover:bg-[#F0F2FA] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recomputing ? "animate-spin" : ""}`} />
              <span>
                {recomputing
                  ? t("recommendationsPage.recalculating", "កំពុងគណនា...")
                  : t("recommendationsPage.recalculate", "គណនាឡើងវិញ")}
              </span>
            </button>
          )}
        </div>
      </div>

      {needsAssessment ? (
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#E6E8F0] bg-white p-6 text-center shadow-xs sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF9E6] text-[#B45309]">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="mt-4 space-y-1.5">
            <h2 className="text-lg font-black text-[#111965] sm:text-xl">
              {language === "km"
                ? "អនុសាសន៍របស់អ្នកនឹងបើកបន្ទាប់ពីតេស្តដំបូង"
                : "Your matches unlock after your first assessment"}
            </h2>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-[#68708A] sm:text-sm">
              {language === "km"
                ? "ធ្វើតេស្ត RIASEC ឬ 16-Personality ដើម្បីឱ្យយើងចាត់ថ្នាក់ជំនាញតាមចំណាប់អារម្មណ៍ និងចំណុចខ្លាំងរបស់អ្នក។"
                : "Take the RIASEC or 16-Personality test so we can rank majors against your interests and strengths."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <Link
              href="/dashboard/assessments/riasec"
              className="group flex items-start gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 transition-colors hover:border-[#111965]/30 hover:bg-white"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-[#F7CE4D]">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-[#111965]">
                  {language === "km" ? "តេស្តចំណាប់អារម្មណ៍ RIASEC" : "RIASEC Interest Test"}
                </div>
                <p className="text-[12px] text-[#68708A]">
                  {language === "km" ? "៣០ សំណួរ · ប្រហែល ៥ នាទី" : "30 questions · about 5 min"}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#68708A] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/dashboard/assessments/personality"
              className="group flex items-start gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 transition-colors hover:border-[#111965]/30 hover:bg-white"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-[#F7CE4D]">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-[#111965]">
                  {language === "km" ? "តេស្ត 16-Personality (MBTI)" : "16-Personality (MBTI)"}
                </div>
                <p className="text-[12px] text-[#68708A]">
                  {language === "km" ? "១២ សំណួរ · ប្រហែល ៤ នាទី" : "12 questions · about 4 min"}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#68708A] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <Link
            href="/dashboard/assessments"
            className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#111965] underline-offset-4 hover:underline"
          >
            <span>{language === "km" ? "មើលតេស្តទាំងអស់" : "View all assessments"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
      {/* ========================================================
          TOOLBAR: FILTER TABS & VIEW TOGGLE
          ======================================================== */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Filter Pills */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F0F2FA] border border-[#E6E8F0]">
          <button
            type="button"
            onClick={() => setFilterTab("top3")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "top3"
                ? "bg-[#111965] text-[#F7CE4D] shadow-xs"
                : "text-[#68708A] hover:text-[#111965]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>{t("recommendationsPage.tabTop3", "សាកសមបំផុតទាំង ៣")}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("suitable")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "suitable"
                ? "bg-[#111965] text-white shadow-xs"
                : "text-[#68708A] hover:text-[#111965]"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>{t("recommendationsPage.tabSuitable", "សាកសម (>75%)")}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("stem")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === "stem"
                ? "bg-[#111965] text-white shadow-xs"
                : "text-[#68708A] hover:text-[#111965]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span>{t("recommendationsPage.tabStem", "STEM")}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-[#111965] text-white shadow-xs"
                : "text-[#68708A] hover:text-[#111965]"
            }`}
          >
            {t("recommendationsPage.tabAll", "ទាំងអស់")} ({recommendations?.length || 0})
          </button>
        </div>

        {/* View Mode Toggle: Grid vs List */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#68708A] hidden sm:inline">
            {filteredRecs.length} {t("recommendationsPage.majorsCount", "មុខជំនាញ")}
          </span>

          <div className="inline-flex items-center p-1 rounded-xl bg-[#F0F2FA] border border-[#E6E8F0]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#111965] text-white shadow-2xs"
                  : "text-[#68708A] hover:text-[#111965]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#111965] text-white shadow-2xs"
                  : "text-[#68708A] hover:text-[#111965]"
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Curated Highlights Banner */}
      {filterTab === "top3" && !isLoading && filteredRecs.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#111965] via-[#17227d] to-[#111965] text-white flex items-center justify-between gap-3 shadow-xs border border-[#111965]/20 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-[#F7CE4D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#F7CE4D]">
                {t("recommendationsPage.top3BannerTitle", "ជំនាញសាកសមបំផុតទាំង ៣ សម្រាប់អ្នក")}
              </h2>
              <p className="text-xs text-white/80 line-clamp-1">
                {language === "km"
                  ? showAcademicScore
                    ? "ជ្រើសរើស និងចាត់ថ្នាក់ដោយ AI ផ្អែកលើបុគ្គលិកលក្ខណៈ ចំណាប់អារម្មណ៍ និងចំណូលចិត្តសិក្សារបស់អ្នក។"
                    : "ចាត់ថ្នាក់ដោយផ្អែកលើតេស្តដែលអ្នកបានបំពេញ។ បន្ថែមតេស្តផ្សេងទៀតដើម្បីបង្កើនភាពសុក្រិត។"
                  : showAcademicScore
                  ? "Specially curated and ranked based on your personality, interests, and academic preferences."
                  : "Ranked from the assessments you've completed. Add the remaining tests to sharpen your matches."}
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[12px] font-bold text-white/90 border border-white/15 flex-shrink-0">
            Top 3 Curated
          </span>
        </div>
      )}

      {/* ========================================================
          RECOMMENDATION CARDS (Compact 2-Column Grid / List)
          ======================================================== */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-3 shadow-2xs">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-1.5">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center space-y-2">
          <p className="text-sm font-bold text-rose-600">
            Failed to load recommendations. Please complete your assessments first.
          </p>
          <Link
            href="/dashboard/assessments/personality"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#111965]"
          >
            Take Assessments
          </Link>
        </div>
      ) : filteredRecs && filteredRecs.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
              : "flex flex-col space-y-3"
          }
        >
          {filteredRecs.map((rec: any) => {
            const major = rec.major || {};
            const exp = rec.explanation || {};
            const isTopMatch = rec.rank_position === 1;
            const isBookmarked = bookmarkedIds.has(rec.major_id);

            // ==========================================
            // COMPACT LIST VIEW ROW
            // ==========================================
            if (viewMode === "list") {
              return (
                <div
                  key={rec.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border bg-white transition-all hover:border-slate-300 hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isTopMatch
                      ? "border-[#111965]/40 shadow-2xs ring-2 ring-[#111965]/5"
                      : "border-[#E6E8F0]"
                  }`}
                >
                  {/* Left: Rank & Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                        isTopMatch
                          ? "bg-[#111965] text-[#F7CE4D]"
                          : "bg-[#F0F2FA] text-[#111965]"
                      }`}
                    >
                      #{rec.rank_position}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12.5px] font-bold text-[#68708A] uppercase">
                          {major.category}
                        </span>
                        {major.is_stem && (
                          <span className="px-1.5 py-0.2 rounded text-[12px] font-black bg-sky-50 text-sky-700 border border-sky-200">
                            STEM
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-[#111965] truncate leading-tight">
                        {getLocalized(major.name)}
                      </h3>
                      {/* Offering Universities in List view */}
                      {major.offering_universities && major.offering_universities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {major.offering_universities.slice(0, 3).map((u: any) => (
                            <Link
                              key={u.university_id}
                              href={`/universities/${u.university_slug}`}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[12px] font-bold bg-[#F0F2FA] text-[#111965] hover:bg-[#111965] hover:text-white transition-colors"
                              title={getLocalized(u.university_name)}
                            >
                              <span>{getLocalized(u.university_acronym) || u.university_slug.toUpperCase()}</span>
                            </Link>
                          ))}
                          {major.offering_universities.length > 3 && (
                            <span className="text-[12px] text-[#68708A]">
                              +{major.offering_universities.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: 4 Mini Scores */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded-lg text-[12.5px] font-black border ${
                        showRiasecScore
                          ? "bg-blue-50 text-blue-800 border-blue-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                      title={showRiasecScore ? "RIASEC Fit" : "Take the RIASEC test to unlock"}
                    >
                      RIA: {showRiasecScore ? `${rec.riasec_match_score}%` : "—"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-[12.5px] font-black border ${
                        showAcademicScore
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                      title={showAcademicScore ? "Academic Fit" : "Complete Academic Preferences to unlock"}
                    >
                      Acad: {showAcademicScore ? `${rec.academic_match_score}%` : "—"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-[12.5px] font-black border ${
                        showPersonalityScore
                          ? "bg-purple-50 text-purple-800 border-purple-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                      title={showPersonalityScore ? "Personality Fit" : "Take the 16-Personality test to unlock"}
                    >
                      MBTI: {showPersonalityScore ? `${rec.personality_match_score}%` : "—"}
                    </span>
                  </div>

                  {/* Right: Match Score Badge & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 justify-between md:justify-end">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rec.match_score}% Fit
                    </span>

                    <BookmarkButton entityType="major" entityId={rec.major_id} />

                    <Link
                      href={`/universities?major=${major.slug}`}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>{t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            }

            // ==========================================
            // COMPACT GRID CARD (Default View)
            // ==========================================
            return (
              <div
                key={rec.id}
                className={`rounded-2xl border bg-white transition-all hover:border-slate-300 hover:shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                  isTopMatch
                    ? "border-[#111965]/40 shadow-xs ring-2 ring-[#111965]/5"
                    : "border-[#E6E8F0]"
                }`}
              >
                {/* 1. Header: Rank, Major Name, Fit Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2.5">
                    {/* Rank & Category */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                          isTopMatch
                            ? "bg-[#111965] text-[#F7CE4D]"
                            : "bg-[#F0F2FA] text-[#111965]"
                        }`}
                      >
                        #{rec.rank_position}
                      </span>
                      <span className="text-[12.5px] font-bold text-[#68708A] uppercase tracking-wide truncate max-w-[220px]">
                        {major.category}
                      </span>
                      {major.is_stem && (
                        <span className="px-1.5 py-0.2 rounded text-[12px] font-black bg-sky-50 text-sky-700 border border-sky-200 flex-shrink-0">
                          STEM
                        </span>
                      )}
                    </div>

                    {/* Fit Score & Bookmark */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rec.match_score}% Fit
                      </span>
                      <BookmarkButton entityType="major" entityId={rec.major_id} />
                    </div>
                  </div>

                  {/* Major Name */}
                  <h3 className="text-base sm:text-lg font-black text-[#111965] leading-snug line-clamp-1">
                    {getLocalized(major.name)}
                  </h3>
                </div>

                {/* 2. Concise AI Fit Summary (1 line) */}
                <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E6E8F0]/80 flex items-start gap-2 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#111965] mt-0.5 flex-shrink-0" />
                  <p className="line-clamp-2 text-[12px] sm:text-xs text-[#4A5568] leading-relaxed">
                    {getLocalized({ km: exp?.fit_summary_km, en: exp?.fit_summary_en })}
                  </p>
                </div>

                {/* 3. 4 Compact Pillars (Mini Badges with Scores) */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div
                    className={`p-1.5 rounded-lg border space-y-0.5 ${
                      showRiasecScore ? "bg-blue-50/60 border-blue-100" : "bg-slate-50 border-slate-200"
                    }`}
                    title={showRiasecScore ? undefined : "Take the RIASEC test to unlock"}
                  >
                    <div className={`text-[12px] font-bold uppercase ${showRiasecScore ? "text-blue-800" : "text-slate-400"}`}>
                      RIASEC
                    </div>
                    <div className={`text-xs font-black ${showRiasecScore ? "text-blue-900" : "text-slate-400"}`}>
                      {showRiasecScore ? `${rec.riasec_match_score}%` : "—"}
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg border space-y-0.5 ${
                      showAcademicScore ? "bg-emerald-50/60 border-emerald-100" : "bg-slate-50 border-slate-200"
                    }`}
                    title={showAcademicScore ? undefined : "Complete Academic Preferences to unlock"}
                  >
                    <div className={`text-[12px] font-bold uppercase ${showAcademicScore ? "text-emerald-800" : "text-slate-400"}`}>
                      {getLocalized({ km: "សិក្សា", en: "Acad" })}
                    </div>
                    <div className={`text-xs font-black ${showAcademicScore ? "text-emerald-900" : "text-slate-400"}`}>
                      {showAcademicScore ? `${rec.academic_match_score}%` : "—"}
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg border space-y-0.5 ${
                      showPersonalityScore ? "bg-purple-50/60 border-purple-100" : "bg-slate-50 border-slate-200"
                    }`}
                    title={showPersonalityScore ? undefined : "Take the 16-Personality test to unlock"}
                  >
                    <div className={`text-[12px] font-bold uppercase ${showPersonalityScore ? "text-purple-800" : "text-slate-400"}`}>
                      {getLocalized({ km: "បុគ្គលិក", en: "MBTI" })}
                    </div>
                    <div className={`text-xs font-black ${showPersonalityScore ? "text-purple-900" : "text-slate-400"}`}>
                      {showPersonalityScore ? `${rec.personality_match_score}%` : "—"}
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg border space-y-0.5 ${
                      showAcademicScore ? "bg-amber-50/60 border-amber-100" : "bg-slate-50 border-slate-200"
                    }`}
                    title={showAcademicScore ? undefined : "Complete Academic Preferences to unlock"}
                  >
                    <div className={`text-[12px] font-bold uppercase ${showAcademicScore ? "text-amber-800" : "text-slate-400"}`}>
                      {getLocalized({ km: "អាជីព", en: "Career" })}
                    </div>
                    <div className={`text-xs font-black ${showAcademicScore ? "text-amber-900" : "text-slate-400"}`}>
                      {showAcademicScore ? `${rec.career_match_score}%` : "—"}
                    </div>
                  </div>
                </div>

                {/* 4. Footer: Campus Count & Action Buttons */}
                <div className="pt-2 border-t border-[#E6E8F0] flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1 text-[12px] font-bold text-[#68708A]">
                    <Building2 className="w-3.5 h-3.5 text-[#111965]" />
                    <span>
                      {major.universities_count || exp?.universities_count || 0} {t("recommendationsPage.institutions", "គ្រឹះស្ថាន")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/majors/${major.slug}`}
                      className="text-[12px] font-bold text-[#68708A] hover:text-[#111965] transition-colors cursor-pointer"
                    >
                      {t("recommendationsPage.details", "ព័ត៌មានលម្អិត")}
                    </Link>

                    <Link
                      href={`/universities?major=${major.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[12px] text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      <span>{t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 rounded-2xl bg-white border border-[#E6E8F0] text-center space-y-3 max-w-md mx-auto shadow-2xs">
          <Sparkles className="w-8 h-8 text-[#111965] mx-auto opacity-75" />
          <h3 className="text-base font-bold text-[#111965]">
            {t("recommendationsPage.noRecsTitle", "មិនទាន់មានអនុសាសន៍នៅឡើយទេ")}
          </h3>
          <p className="text-xs text-[#68708A]">
            {t("recommendationsPage.noRecsSubtitle", "សូមបំពេញតេស្តដើម្បីទទួលបានអនុសាសន៍ជំនាញផ្ទាល់ខ្លួន។")}
          </p>
          <Link
            href="/dashboard/assessments/personality"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D]"
          >
            {t("recommendationsPage.startTest", "ចាប់ផ្តើមធ្វើតេស្ត")}
          </Link>
        </div>
      )}
        </>
      )}
    </div>
  );
}
