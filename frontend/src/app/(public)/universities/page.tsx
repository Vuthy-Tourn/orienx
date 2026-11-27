"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { getStaticMajor, listStaticUniversities } from "@/lib/data/catalog";
import { DirectoryControls } from "@/components/directory/directory-controls";
import { DirectoryHeroStats } from "@/components/directory/directory-hero-stats";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Scale,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  GraduationCap,
  X,
  CheckCircle2,
  Landmark,
  Calculator,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Dialog } from "@/components/ui/dialog";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { useToast } from "@/components/ui/toast";
import { localizeProvince } from "@/lib/utils";

// Cambodian university campus photos mapping
const UNIVERSITY_IMAGES: Record<string, string> = {
  rupp: "/images/universities/rupp.jpg",
  itc: "/images/universities/itc.jpg",
  aupp: "/images/universities/aupp.jpg",
  paragoniu: "/images/universities/paragoniu.jpg",
  cadt: "/images/universities/cadt.jpg",
  num: "/images/universities/rupp.jpg",
};

function UniversitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const majorSlug = searchParams.get("major") || "";
  const { t, getLocalized, language } = useLanguage();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "tuition_asc" | "majors_desc">("default");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Estimator track state
  const [estimatorType, setEstimatorType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const majorInfo = majorSlug ? getStaticMajor(majorSlug) : null;
  const universities = listStaticUniversities({
    search: searchTerm,
    type: typeFilter || undefined,
    province: provinceFilter || undefined,
    major: majorSlug || undefined,
  });
  const isLoading = false;
  const error = null;
  const isFetching = false;
  const refetch = () => {};

  const toggleCompare = (slug: string) => {
    if (selectedForCompare.includes(slug)) {
      setSelectedForCompare(selectedForCompare.filter((s) => s !== slug));
    } else {
      if (selectedForCompare.length >= 4) {
        toast.warning(t("universitiesDirectory.compareAlert"));
        return;
      }
      setSelectedForCompare([...selectedForCompare, slug]);
    }
  };

  const sortedUniversities = useMemo(() => {
    if (!universities) return [];
    const list = [...universities];
    if (sortBy === "tuition_asc") {
      list.sort((a, b) => {
        const valA = a.tuition_range_min_usd ?? 999999;
        const valB = b.tuition_range_min_usd ?? 999999;
        return valA - valB;
      });
    } else if (sortBy === "majors_desc") {
      list.sort((a, b) => (b.majors_count || 0) - (a.majors_count || 0));
    }
    return list;
  }, [universities, sortBy]);

  // Notify FloatingAssistant when the sticky compare tray is visible so the mascot never overlaps it
  useEffect(() => {
    const isActive = selectedForCompare.length > 0;
    window.dispatchEvent(
      new CustomEvent("orienx:compare-tray", { detail: isActive })
    );
  }, [selectedForCompare.length]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("orienx:compare-tray", { detail: false })
      );
    };
  }, []);

  // Selected universities for quick comparison modal
  const comparedUniversities = useMemo(() => {
    if (!universities || selectedForCompare.length === 0) return [];
    return universities.filter((u) => selectedForCompare.includes(u.slug));
  }, [universities, selectedForCompare]);

  const hasActiveFilters = Boolean(searchTerm || typeFilter || provinceFilter || majorSlug);

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setProvinceFilter("");
    if (majorSlug) router.push("/universities");
  };

  // Convert USD to KHR (1 USD = 4,100 KHR)
  const formatMoney = (usdVal?: number | null) => {
    if (usdVal === undefined || usdVal === null) return "Pending";
    if (currency === "KHR") {
      const khrVal = Math.round(usdVal * 4100);
      return `${(khrVal / 1000000).toFixed(1)}M KHR`;
    }
    return `$${Math.round(usdVal)}`;
  };

  const statsSource = universities || [];
  const programCount = statsSource.reduce(
    (sum: number, u: any) => sum + (u.majors_count || 0),
    0
  );
  const minTuition = statsSource
    .map((u: any) => u.tuition_range_min_usd)
    .filter((v: any): v is number => typeof v === "number" && v > 0)
    .sort((a: number, b: number) => a - b)[0];
  const heroStats = [
    {
      label: language === "km" ? "សាកលវិទ្យាល័យ" : "Universities",
      value: universities ? String(statsSource.length) : "—",
    },
    {
      label: language === "km" ? "កម្មវិធីសិក្សា" : "Programs",
      value: universities ? String(programCount) : "—",
    },
    {
      label: language === "km" ? "ថ្លៃសិក្សាចាប់ផ្តើម" : "Tuition from",
      value: minTuition ? formatMoney(minTuition) : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-28">
      {/* Hero */}
      <section className="border-b border-[#E6E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-9 sm:px-6 sm:pt-11 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#111965]/15 bg-[#111965]/5 px-3 py-1 text-[12px] font-bold text-[#111965]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("universitiesDirectory.badge")}
            </span>

            <h1 className="mt-3.5 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#111965] sm:text-[2.5rem]">
              {t("universitiesDirectory.title")}
            </h1>

            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[#68708A] sm:text-[16px]">
              {t("universitiesDirectory.subtitle")}
            </p>
          </div>
        </div>

        <DirectoryHeroStats stats={heroStats} />
      </section>

      {/* One control surface: search, filtering, sorting. */}
      <DirectoryControls
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t("universitiesDirectory.searchPlaceholder")}
        clearSearchLabel={language === "km" ? "សម្អាតការស្វែងរក" : "Clear search"}
        chips={[
          { value: "", label: t("universitiesDirectory.allTypes") },
          { value: "PUBLIC", label: t("universitiesDirectory.publicType") },
          { value: "PRIVATE", label: t("universitiesDirectory.privateType") },
        ]}
        activeChip={typeFilter}
        onChipChange={setTypeFilter}
        selects={[
          {
            key: "province",
            value: provinceFilter,
            onChange: setProvinceFilter,
            label: t("universitiesDirectory.allProvinces"),
            options: [
              { value: "", label: t("universitiesDirectory.allProvinces") },
              { value: "Phnom Penh", label: language === "km" ? "ភ្នំពេញ" : "Phnom Penh" },
              { value: "Battambang", label: language === "km" ? "បាត់ដំបង" : "Battambang" },
              { value: "Siem Reap", label: language === "km" ? "សៀមរាប" : "Siem Reap" },
            ],
          },
        ]}
        sort={{
          value: sortBy,
          onChange: (value) => setSortBy(value as typeof sortBy),
          options: [
            { value: "default", label: language === "km" ? "លំដាប់ដើម" : "Featured order" },
            { value: "tuition_asc", label: t("universitiesDirectory.sortLowestTuition") },
            { value: "majors_desc", label: t("universitiesDirectory.sortMostPrograms") },
          ],
          label: t("universitiesDirectory.sortBy"),
        }}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        resetLabel={t("universitiesDirectory.resetFilters")}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Active Major Filter Banner */}
        {majorSlug && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#F7CE4D]" />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-black uppercase tracking-wider text-blue-900">
                  {language === "km" ? "តម្រងតាមមុខជំនាញដែលបានណែនាំ" : "Filtered by Recommended Major"}
                </div>
                <div className="text-sm sm:text-base font-black text-[#111965] truncate">
                  {majorInfo ? getLocalized(majorInfo.name) : majorSlug}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/universities")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#111965] hover:bg-slate-100 border border-blue-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === "km" ? "បង្ហាញទាំងអស់" : "Show all"}</span>
            </button>
          </div>
        )}

        {/* Result count */}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[#68708A]" aria-live="polite">
            <span className="font-bold tabular-nums text-[#111965]">
              {sortedUniversities?.length || 0}
            </span>{" "}
            {language === "km" ? "សាកលវិទ្យាល័យ" : "universities"}
          </p>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <Skeleton className="h-44 w-full rounded-xl" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-xl" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {language === "km" ? "មិនអាចទាញយកទិន្នន័យសាកលវិទ្យាល័យបានឡើយ" : "Unable to Load Universities"}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                {language === "km"
                  ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                  : "We couldn't connect to the university directory server. Please check your internet connection or try again."}
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
        ) : sortedUniversities && sortedUniversities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUniversities.map((uni: any, index: number) => {
              const isSelected = selectedForCompare.includes(uni.slug);
              const isPublic = uni.university_type === "PUBLIC";
              const coverImage =
                uni.cover_image_url ||
                UNIVERSITY_IMAGES[uni.slug] ||
                "/images/cambodia-campuses-skyline-clean.png";
              const isFeatured = index === 0;

              return (
                <div
                  key={uni.id}
                  data-reveal
                  onClick={() => router.push(`/universities/${uni.slug}`)}
                  className={`group relative cursor-pointer rounded-2xl bg-white border transition-shadow duration-200 flex flex-col justify-between overflow-hidden hover:ring-[#111965]/20 hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] ${
                    isSelected ? "border-[#111965] ring-2 ring-[#111965]/20" : "border-[#E6E8F0] hover:border-[#111965]/30"
                  }`}
                >
                  {isFeatured && <BorderBeam size={180} duration={12} delay={2} borderWidth={1.5} />}

                  <div>
                    {/* Campus Image Header */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={coverImage}
                        alt={getLocalized(uni.name) || "University"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs backdrop-blur-xs ${
                            isPublic
                              ? "bg-blue-900/90 text-blue-100"
                              : "bg-purple-900/90 text-purple-100"
                          }`}
                        >
                          {isPublic
                            ? t("universitiesDirectory.publicType")
                            : t("universitiesDirectory.privateType")}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <BookmarkButton
                            entityType="university"
                            entityId={uni.id}
                            variant="overlay"
                          />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleCompare(uni.slug);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#F7CE4D] text-[#111965] ring-1 ring-[#111965]/20"
                                : "bg-white/95 text-[#111965] hover:bg-white"
                            }`}
                            title="Add to comparison"
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{isSelected ? t("universitiesDirectory.selected") : t("universitiesDirectory.compare")}</span>
                          </button>
                        </div>
                      </div>

                      {/* Verified & Acronym on Image Bottom */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-mono text-xs bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md font-bold tracking-wider">
                          {uni.acronym?.en || uni.acronym?.km || uni.slug.toUpperCase()}
                        </span>

                        {uni.is_tuition_verified && (
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{t("universitiesDirectory.verifiedBadgeShort")}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3.5">
                      <div>
                        <div className="flex items-start gap-2.5">
                          {uni.logo_url ? (
                            <img
                              src={uni.logo_url}
                              alt=""
                              loading="lazy"
                              className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-[#E6E8F0] bg-white object-contain p-1"
                            />
                          ) : (
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#111965] text-[10px] font-black tracking-wide text-[#F7CE4D]">
                              {(uni.acronym?.en || uni.slug || "U").slice(0, 3).toUpperCase()}
                            </span>
                          )}
                          <h3 className="text-lg font-extrabold text-[#111965] group-hover:text-[#1E277A] transition-colors leading-snug">
                            {getLocalized(uni.name)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#68708A] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#111965] shrink-0" />
                          <span>
                            {localizeProvince(
                              getLocalized(uni.province) || uni.province,
                              language
                            ) ||
                              (language === "km"
                                ? "ភ្នំពេញ, កម្ពុជា"
                                : "Phnom Penh, Cambodia")}
                          </span>
                        </div>
                      </div>

                      {/* Verified Tuition Fee Box */}
                      <div className="p-3.5 rounded-xl bg-[#F0F2FA]/70 border border-[#E6E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[12px] text-[#68708A]">
                          <span className="font-bold">{t("universitiesDirectory.tuitionTitle")}</span>
                          {uni.is_tuition_verified && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{language === "km" ? "ផ្ទៀងផ្ទាត់" : "Verified"}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-base font-extrabold text-[#111965]">
                          {uni.tuition_range_min_usd !== null
                            ? `${formatMoney(uni.tuition_range_min_usd)} – ${formatMoney(uni.tuition_range_max_usd || uni.tuition_range_min_usd)} ${language === "km" ? "/ ឆ្នាំ" : "/ yr"}`
                            : t("universitiesDirectory.tuitionPending")}
                        </div>
                      </div>

                      <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                        {getLocalized(uni.description)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-[#E6E8F0] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#68708A] flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{uni.majors_count || 0} {t("universitiesDirectory.programs")}</span>
                    </span>

                    <Link
                      href={`/universities/${uni.slug}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-2xs group-hover:shadow-xs"
                    >
                      <span>{t("universitiesDirectory.viewDetails")}</span>
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
                alt="No universities found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("universitiesDirectory.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Try adjusting your search query or selecting &quot;All University Types&quot; to view the complete list of Cambodian institutions.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("universitiesDirectory.resetFilters")}
            </button>
          </div>
        )}

        {/* Sticky Floating Compare Tray */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-4 max-w-3xl mx-auto z-40 p-3.5 sm:p-4 rounded-2xl bg-[#111965]/95 backdrop-blur-md text-white shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Selection summary & chips */}
              <div className="flex items-start justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-[#F7CE4D] text-[#111965] flex items-center justify-center font-bold shadow-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-black text-[#F7CE4D]">
                        {selectedForCompare.length} / 4
                      </span>
                      <span className="truncate">{t("universitiesDirectory.selectedNotice")}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedForCompare.map((slug) => (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => toggleCompare(slug)}
                          className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-100 transition-colors cursor-pointer"
                          title={t("universitiesDirectory.compareRemove")}
                        >
                          <span>{slug.toUpperCase()}</span>
                          <X className="w-3 h-3 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Clear shortcut */}
                <button
                  type="button"
                  onClick={() => setSelectedForCompare([])}
                  className="sm:hidden shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t("universitiesDirectory.clear")}
                </button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedForCompare([])}
                  className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t("universitiesDirectory.clear")}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Quick Preview
                </button>

                <Link
                  href={`/universities/compare?ids=${selectedForCompare.join(",")}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-[#0F1754] dark:text-[#0F1754] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md whitespace-nowrap"
                >
                  <span>Full Comparison</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Comparison Modal Dialog */}
      {isCompareModalOpen && (
        <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen} hideClose>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3.5">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#68708A]">
                  <Scale className="w-3.5 h-3.5 text-[#D4A017]" />
                  {getLocalized({ en: "Direct Comparison", km: "ការប្រៀបធៀបផ្ទាល់" })}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#111965] mt-1 leading-snug">
                  {getLocalized({
                    en: "Side-by-Side Institutional Analysis",
                    km: "ការវិភាគប្រៀបធៀបសាកលវិទ្យាល័យ",
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                aria-label="Close"
                className="shrink-0 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive University Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto pr-0.5">
              {comparedUniversities.map((uni) => {
                const isPublic = uni.university_type === "PUBLIC";
                const minUsd = Math.round(uni.tuition_range_min_usd || 0);
                const maxUsd = Math.round(uni.tuition_range_max_usd || minUsd);
                return (
                  <div
                    key={uni.id}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-lg bg-white dark:bg-white/10 border border-[#E6E8F0] px-2 py-0.5 font-mono text-[11px] font-black text-[#111965] uppercase">
                          {uni.acronym?.en || uni.acronym?.km || uni.slug.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${
                              isPublic
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {isPublic
                              ? getLocalized({ en: "Public", km: "រដ្ឋ" })
                              : getLocalized({ en: "Private", km: "ឯកជន" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCompare(uni.slug)}
                            aria-label={t("universitiesDirectory.compareRemove")}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-[#111965] leading-snug line-clamp-2">
                        {getLocalized(uni.name)}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white border border-[#E6E8F0] p-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#68708A]">
                          {getLocalized({ en: "Tuition / yr", km: "ថ្លៃសិក្សា / ឆ្នាំ" })}
                        </div>
                        <div className="mt-0.5 font-black text-[#111965] whitespace-nowrap">
                          {minUsd > 0 ? `$${minUsd}–$${maxUsd}` : "—"}
                        </div>
                      </div>
                      <div className="min-w-0 border-l border-[#E6E8F0] pl-2.5">
                        <div className="text-[11px] font-semibold text-[#68708A]">
                          {getLocalized({ en: "Programs", km: "ជំនាញ" })}
                        </div>
                        <div className="mt-0.5 font-black text-[#111965] whitespace-nowrap">
                          {uni.majors_count || 0}{" "}
                          {getLocalized({ en: "majors", km: "ជំនាញ" })}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/universities/${uni.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#111965] hover:underline whitespace-nowrap"
                    >
                      <span>
                        {getLocalized({
                          en: "View Campus Profile",
                          km: "មើលព័ត៌មានសាកលវិទ្យាល័យ",
                        })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-[#E6E8F0]">
              <button
                type="button"
                onClick={() => {
                  setSelectedForCompare([]);
                  setIsCompareModalOpen(false);
                }}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                {getLocalized({ en: "Clear Selected", km: "លុបការជ្រើសរើស" })}
              </button>
              <Link
                href={`/universities/compare?ids=${selectedForCompare.join(",")}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-[#0F1754] dark:text-[#0F1754] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-sm whitespace-nowrap"
              >
                <span>
                  {getLocalized({
                    en: "Full Comparison Matrix",
                    km: "បើកតារាងប្រៀបធៀបពេញលេញ",
                  })}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center text-sm text-[#68708A]">
          <div className="w-8 h-8 rounded-full border-3 border-[#111965] border-t-transparent animate-spin mr-3" />
          <span>Loading universities...</span>
        </div>
      }
    >
      <UniversitiesContent />
    </React.Suspense>
  );
}
