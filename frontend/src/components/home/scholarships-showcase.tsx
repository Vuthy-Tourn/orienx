"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import CardSwap, { Card, CardSwapHandle } from "@/components/ui/card-swap";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShieldCheck,
  Award,
  CheckCircle2,
  Hand,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Official poster mappings for verified scholarships
const POSTER_MAP: Record<string, string> = {
  "techo-digital-talent-scholarship": "/images/scholarships/techo-scholarship-poster.jpg",
  "aupp-merit-scholarship": "/images/scholarships/aupp-scholarship-poster.jpg",
  "moeys-national-scholarship": "/images/scholarships/MoEYS-scholarship.png",
};

interface ScholarshipApiItem {
  id: string;
  slug: string;
  title: { en?: string; km?: string };
  provider: { en?: string; km?: string };
  description: { en?: string; km?: string };
  coverage_type: string;
  coverage_percentage: number | null;
  country_or_institution: string;
  application_deadline: string | null;
  official_url: string;
  is_verified: boolean;
}

export function ScholarshipsShowcase() {
  const { t, getLocalized, language } = useLanguage();
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fetch real verified scholarships directly from PostgreSQL backend API
  const {
    data: rawScholarships,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<ScholarshipApiItem[]>({
    queryKey: ["scholarships-showcase"],
    queryFn: async () => apiFetch<ScholarshipApiItem[]>("/scholarships"),
    retry: 1,
  });

  // Sort and prioritize featured scholarships (Techo -> AUPP -> MoEYS)
  const scholarships = useMemo(() => {
    if (!rawScholarships || !Array.isArray(rawScholarships)) return [];
    const priority = [
      "techo-digital-talent-scholarship",
      "aupp-merit-scholarship",
      "moeys-national-scholarship",
    ];
    return [...rawScholarships].sort((a, b) => {
      const idxA = priority.indexOf(a.slug);
      const idxB = priority.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [rawScholarships]);

  // Current active scholarship driven dynamically by 3D CardSwap index
  const current = scholarships[activeIndex] || scholarships[0];

  const handleNext = () => {
    cardSwapRef.current?.next();
  };

  const handlePrev = () => {
    cardSwapRef.current?.prev();
  };

  // Dynamic benefit, badge, and deadline text purely using i18n and real item data
  const getScholarshipMetadata = (item?: ScholarshipApiItem) => {
    if (!item) {
      return {
        badgeText: "",
        badgeColor: "bg-[#0284C7] text-white",
        benefitText: "",
        deadlineText: "",
        scopeText: "",
        posterImage: "/images/scholarships/techo-scholarship-poster.jpg",
      };
    }

    const poster = POSTER_MAP[item.slug] || "/images/scholarships/MoEYS-scholarship.png";

    if (item.slug === "techo-digital-talent-scholarship") {
      return {
        badgeText: t("scholarshipsShowcase.techoBadge"),
        badgeColor: "bg-[#0284C7] text-white",
        benefitText: t("scholarshipsShowcase.techoBenefit"),
        deadlineText: t("scholarshipsShowcase.techoDeadline"),
        scopeText: item.country_or_institution || "CADT, RUPP, ITC, NUM, Paragon, AUPP",
        posterImage: poster,
      };
    }

    if (item.slug === "aupp-merit-scholarship") {
      return {
        badgeText: t("scholarshipsShowcase.auppBadge"),
        badgeColor: "bg-rose-600 text-white",
        benefitText: t("scholarshipsShowcase.auppBenefit"),
        deadlineText: t("scholarshipsShowcase.auppDeadline"),
        scopeText: item.country_or_institution || "AUPP • Univ of Arizona • Fort Hays State",
        posterImage: poster,
      };
    }

    if (item.slug === "moeys-national-scholarship") {
      return {
        badgeText: t("scholarshipsShowcase.moeysBadge"),
        badgeColor: "bg-[#111965] text-[#F7CE4D]",
        benefitText: t("scholarshipsShowcase.moeysBenefit"),
        deadlineText: t("scholarshipsShowcase.moeysDeadline"),
        scopeText: item.country_or_institution || "RUPP, ITC (តិចណូ), NUM, UHS, RULE",
        posterImage: poster,
      };
    }

    // Generic fallback for any other dynamic database scholarship
    return {
      badgeText:
        item.coverage_percentage === 100
          ? t("scholarshipsShowcase.fullCoverageBadge")
          : `${item.coverage_percentage || 50}% ${t("scholarshipsShowcase.partialCoverageBadge")}`,
      badgeColor: "bg-[#0284C7] text-white",
      benefitText:
        item.coverage_percentage === 100
          ? t("scholarshipsShowcase.fullCoverage")
          : `${item.coverage_percentage}% ${t("scholarshipsShowcase.partialCoverage")}`,
      deadlineText: item.application_deadline || t("scholarshipsShowcase.annual"),
      scopeText: item.country_or_institution || "Cambodia",
      posterImage: poster,
    };
  };

  const meta = getScholarshipMetadata(current);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-[#F8F9FC] dark:bg-[#070B1E] border-b border-[#E6E8F0] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-6 flex flex-col justify-between min-h-[420px] space-y-6">
              <div className="space-y-4">
                <Skeleton className="w-48 h-7 rounded-full" />
                <Skeleton className="w-3/4 h-10 rounded-xl" />
                <Skeleton className="w-full h-14 rounded-xl" />
              </div>
              <div className="rounded-2xl bg-white dark:bg-[#0c1236]/90 border border-[#E6E8F0] dark:border-white/10 p-6 space-y-4 shadow-xs">
                <Skeleton className="w-full h-12 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="w-full h-5 rounded-md" />
                  <Skeleton className="w-full h-5 rounded-md" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="w-36 h-11 rounded-xl" />
                <Skeleton className="w-32 h-11 rounded-xl" />
              </div>
            </div>
            {/* Right Card Stack Skeleton */}
            <div className="lg:col-span-6 flex items-center justify-center min-h-[420px]">
              <div className="relative w-[340px] sm:w-[400px] h-[440px]">
                <div className="absolute inset-0 rounded-3xl bg-slate-200/50 dark:bg-white/5 transform rotate-3 animate-pulse" />
                <Skeleton className="absolute inset-0 rounded-3xl border border-slate-300 dark:border-white/10 shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !scholarships.length) {
    return (
      <section className="py-16 lg:py-24 bg-[#F8F9FC] border-b border-[#E6E8F0]">
        <div className="max-w-xl mx-auto px-4">
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {language === "km"
                  ? "មិនអាចទាញយកទិន្នន័យអាហារូបករណ៍បានឡើយ"
                  : "Unable to Load Scholarships"}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                {language === "km"
                  ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យអាហារូបករណ៍បានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                  : "We couldn't connect to the scholarships directory server. Please check your internet connection or try again."}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>{language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
              </button>
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>{language === "km" ? "មើលបញ្ជីអាហារូបករណ៍" : "Browse Scholarships"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="scholarships-section"
      className="py-16 lg:py-24 bg-[#F8F9FC] text-[#111965] border-b border-[#E6E8F0] relative overflow-hidden select-none"
    >
      {/* =====================================================================
          ATMOSPHERIC LIGHTING & SUBTLE TECH GRID BACKDROP
          ===================================================================== */}
      <div className="absolute inset-0 bg-[radial-gradient(#111965_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-blue-400/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-[550px] h-[450px] bg-[#F7CE4D]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(17,25,101,0.035),transparent_75%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* =================================================================
              LEFT SIDE: EDITORIAL SPOTLIGHT (SMOOTH SYNCED ANIMATIONS & TRUST PROOFS)
              ================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between min-h-[460px] space-y-6">
            <div className="space-y-3.5">
              {/* Category Eyebrow Badge with Pulsing Live Status */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E6E8F0] shadow-2xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[12.5px] sm:text-[12px] font-black uppercase tracking-widest text-[#111965]">
                  {language === "km" ? "អាហារូបករណ៍ផ្លូវការដែលបានផ្ទៀងផ្ទាត់" : "VERIFIED SCHOLARSHIPS 2026"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                <span className="text-[12.5px] sm:text-[12px] font-bold text-emerald-700">
                  {scholarships.length} {language === "km" ? "កម្មវិធីសកម្ម" : "Active Programs"}
                </span>
              </div>

              {/* Dynamic Headline & Description (Smooth Slide-Fade on Change) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current?.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-[#111965] tracking-tight leading-[1.25]">
                    {getLocalized(current?.title)}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed line-clamp-2">
                    {getLocalized(current?.description)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ===============================================================
                BENEFIT SPOTLIGHT CARD
                =============================================================== */}
            <div className="rounded-2xl bg-white border border-[#E6E8F0] p-4 sm:p-5 shadow-xs space-y-3.5 min-h-[156px] flex flex-col justify-between relative overflow-hidden group">
              {/* Highlight Ribbon: Coverage & Badge */}
              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-[#F7CE4D]/15 to-transparent border border-[#F7CE4D]/45 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[12.5px] sm:text-[12px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{t("scholarshipsShowcase.verifiedBenefit")}</span>
                  </span>
                  <div className="min-h-[26px] flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={meta.benefitText}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm sm:text-base font-black text-[#111965] leading-snug"
                      >
                        {meta.benefitText}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {meta.badgeText && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-2xs self-start sm:self-auto shrink-0 ${meta.badgeColor}`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{meta.badgeText}</span>
                  </span>
                )}
              </div>

              {/* Key Details Row: Deadline & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-0.5">
                <div className="flex items-center gap-2 text-[#68708A]">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">
                    <strong className="text-[#111965]">
                      {t("scholarshipsShowcase.deadline")}{" "}
                    </strong>
                    {meta.deadlineText}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#68708A]">
                  <Building2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span className="truncate">
                    <strong className="text-[#111965]">{t("scholarshipsShowcase.scope")} </strong>
                    {meta.scopeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row + Sleek 3D Swap Animation Controls */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Primary CTA: Dedicated Scholarship Detail Page */}
                <Link
                  href={`/scholarships/${current?.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#111965] hover:bg-[#1E277A] shadow-xs hover:shadow-sm transition-all hover:translate-x-0.5 active:scale-98"
                >
                  <span>{t("scholarshipsShowcase.viewDetails")}</span>
                  <ArrowRight className="w-4 h-4 text-[#F7CE4D]" />
                </Link>

                {/* Secondary CTA: Apply Online */}
                {current?.official_url && (
                  <a
                    href={current.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs hover:shadow-xs transition-all active:scale-98"
                  >
                    <span>{t("scholarshipsShowcase.applyOnline")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Directory Link */}
                <Link
                  href="/scholarships"
                  className="text-xs sm:text-sm font-bold text-[#68708A] hover:text-[#111965] hover:underline px-1 py-1"
                >
                  {t("scholarshipsShowcase.allScholarships")}
                </Link>
              </div>

              {/* 3D Swap Arrows & Dynamic Page Counter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#111965] tracking-widest tabular-nums mr-1">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(scholarships.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous scholarship card"
                  className="w-8 h-8 rounded-full border border-[#E6E8F0] bg-white text-[#111965] hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next scholarship card"
                  className="w-8 h-8 rounded-full border border-[#E6E8F0] bg-white text-[#111965] hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Proof Micro-Badges */}
            <div className="pt-2 border-t border-[#E6E8F0]/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-[12px] text-[#68708A] font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === "km" ? "ទិន្នន័យផ្លូវការពីក្រសួង និងដៃគូ" : "Verified Admissions Data"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{language === "km" ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្ស" : "100% Free For Students"}</span>
              </span>
            </div>
          </div>

          {/* =================================================================
              RIGHT SIDE: 3D CARDSWAP DECK WITH STAGE LIGHTING & INTERACTIVE CUE
              ================================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">

            <div className="w-full max-w-[620px] h-[400px] sm:h-[440px] lg:h-[460px] relative flex items-center justify-center">
              {/* Radial Pedestal Shadow Under 3D Stack */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[480px] h-[40px] bg-[#111965]/18 blur-2xl rounded-full pointer-events-none" />

              <CardSwap
                ref={cardSwapRef}
                width={560}
                height={380}
                cardDistance={52}
                verticalDistance={40}
                depth={85}
                skewAmount={5}
                visibleCards={Math.min(3, scholarships.length)}
                delay={4200}
                autoplay={true}
                pauseOnHover={true}
                draggable={true}
                theme="light"
                cardRadius={24}
                onChange={(idx) => {
                  if (typeof idx === "number" && idx >= 0 && idx < scholarships.length) {
                    setActiveIndex(idx);
                  }
                }}
                className="w-full h-full"
              >
                {scholarships.map((s, i) => {
                  const sMeta = getScholarshipMetadata(s);
                  return (
                    <Card
                      key={s.id || s.slug}
                      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden border border-[#E6E8F0] bg-white shadow-xl group select-none touch-none"
                    >
                      <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none pointer-events-none">
                        <Image
                          src={sMeta.posterImage}
                          alt={getLocalized(s.title)}
                          fill
                          draggable={false}
                          className="object-cover group-hover:scale-103 transition-transform duration-500 pointer-events-none select-none [-webkit-user-drag:none]"
                          priority={i === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none select-none" />

                        {/* Top Floating Badge */}
                        {sMeta.badgeText && (
                          <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md ${sMeta.badgeColor}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{sMeta.badgeText}</span>
                            </span>
                          </div>
                        )}

                        {/* Bottom Banner on Card */}
                        <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1.5 pointer-events-none">
                          <div className="text-xs font-bold text-[#F7CE4D] uppercase tracking-wider truncate">
                            {getLocalized(s.provider)}
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                            {getLocalized(s.title)}
                          </h4>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
