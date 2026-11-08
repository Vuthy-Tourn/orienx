"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import CardSwap, { Card, CardSwapHandle } from "@/components/ui/card-swap";
import {
  Sparkles,
  Calendar,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
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
  const { t, getLocalized } = useLanguage();
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fetch real verified scholarships directly from PostgreSQL backend API
  const { data: rawScholarships, isLoading } = useQuery<ScholarshipApiItem[]>({
    queryKey: ["scholarships-showcase"],
    queryFn: async () => apiFetch<ScholarshipApiItem[]>("/scholarships"),
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
      <section className="py-16 lg:py-24 bg-[#F8F9FC] border-b border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[460px] flex items-center justify-center text-sm text-[#68708A]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-[#111965] border-t-transparent rounded-full animate-spin" />
              <span>{t("scholarshipsShowcase.loading")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!scholarships.length) {
    return null;
  }

  return (
    <section
      id="scholarships-section"
      className="py-16 lg:py-24 bg-[#F8F9FC] text-[#111965] border-b border-[#E6E8F0] relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* =================================================================
              LEFT SIDE: CLEAN EDITORIAL OVERVIEW (NO CLUTTER, ZERO HEIGHT JITTER)
              ================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between min-h-[440px] sm:min-h-[460px] space-y-6">
            {/* Dynamic Headline & Description */}
            <div className="space-y-2.5">
              <div className="min-h-[64px] sm:min-h-[72px] flex items-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965] tracking-tight leading-[1.25] transition-opacity duration-300">
                  {getLocalized(current?.title)}
                </h2>
              </div>

              <div className="min-h-[44px] sm:min-h-[48px] flex items-start">
                <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed line-clamp-2 transition-opacity duration-300">
                  {getLocalized(current?.description)}
                </p>
              </div>
            </div>

            {/* ===============================================================
                BENEFIT SPOTLIGHT CARD (EXACTLY MATCHING USER SCREENSHOT)
                =============================================================== */}
            <div className="rounded-2xl bg-white border border-[#E6E8F0] p-4 sm:p-5 shadow-xs space-y-3.5 min-h-[156px] flex flex-col justify-between">
              {/* Highlight Ribbon: Coverage & Badge */}
              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-[#F7CE4D]/15 to-transparent border border-[#F7CE4D]/40 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{t("scholarshipsShowcase.verifiedBenefit")}</span>
                  </span>
                  <div className="min-h-[26px] flex items-center">
                    <div className="text-sm sm:text-base font-black text-[#111965] leading-snug">
                      {meta.benefitText}
                    </div>
                  </div>
                </div>

                {meta.badgeText && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-2xs self-start sm:self-auto shrink-0 ${meta.badgeColor}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
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

              {/* 3D Swap Arrows: Lets User Trigger the 3D Physics Animation On Demand */}
              <div className="flex items-center gap-1.5">
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
          </div>

          {/* =================================================================
              RIGHT SIDE: 3D CARDSWAP DECK (RESPONSIVE DRAG & FLING ANIMATION)
              ================================================================= */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] h-[350px] sm:h-[370px] relative flex items-center justify-center">
              <CardSwap
                ref={cardSwapRef}
                width={470}
                height={320}
                cardDistance={48}
                verticalDistance={36}
                depth={80}
                skewAmount={5}
                visibleCards={Math.min(3, scholarships.length)}
                delay={4200}
                autoplay={true}
                pauseOnHover={true}
                draggable={true}
                theme="light"
                cardRadius={22}
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
                      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden border border-[#E6E8F0] bg-white shadow-lg group select-none touch-none"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none select-none" />

                        {/* Top Floating Badge */}
                        {sMeta.badgeText && (
                          <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md ${sMeta.badgeColor}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{sMeta.badgeText}</span>
                            </span>
                          </div>
                        )}

                        {/* Bottom Banner on Card */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white space-y-1 pointer-events-none">
                          <div className="text-[11px] font-bold text-[#F7CE4D] uppercase tracking-wider truncate">
                            {getLocalized(s.provider)}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-white leading-tight truncate">
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
