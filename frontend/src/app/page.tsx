"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { MascotInteractiveHero } from "@/components/hero/mascot-interactive-hero";
import { HowItWorksFlow } from "@/components/home/how-it-works-flow";
import { FeaturedMajorsGrid } from "@/components/home/featured-majors-grid";
import { ScholarshipsShowcase } from "@/components/home/scholarships-showcase";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";

import {
  Compass,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  DollarSign,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  HelpCircle,
  ShieldCheck,
  BrainCircuit,
  Search,
  MousePointer2,
  Camera,
  Calendar,
  RefreshCw,
  WifiOff,
  AlertCircle,
  Building2,
  ExternalLink,
} from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CircularGallery from "@/components/ui/circular-gallery";
import { useTheme } from "@/contexts/theme-context";

export default function HomePage() {
  const { t, getLocalized, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeUniIndex, setActiveUniIndex] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);
  const quickSelectScrollRef = useRef<HTMLDivElement>(null);
  const quickSelectButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Automatically scroll the active quick select button horizontally inside its container (without scrolling the page)
  useEffect(() => {
    const container = quickSelectScrollRef.current;
    const activeBtn = quickSelectButtonRefs.current[activeUniIndex];
    if (container && activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const scrollOffset =
        btnRect.left - containerRect.left + container.scrollLeft - container.clientWidth / 2 + btnRect.width / 2;
      container.scrollTo({
        left: Math.max(0, scrollOffset),
        behavior: "smooth",
      });
    }
  }, [activeUniIndex]);

  useEffect(() => {
    setMounted(true);
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-uni-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#featured-universities-section",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".gsap-uni-gallery",
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#featured-universities-section",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".gsap-uni-spotlight",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: 0.25,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#featured-universities-section",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Real Cambodian Universities fetched from backend API
  const {
    data: universitiesData,
    isLoading: isUniLoading,
    isError: isUniError,
    error: uniError,
    refetch: refetchUnis,
    isFetching: isUniFetching,
  } = useQuery({
    queryKey: ["landing-universities"],
    queryFn: async () => {
      return apiFetch<any[]>("/universities");
    },
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const featuredUniversities = useMemo(() => {
    const list = universitiesData && universitiesData.length > 0 ? universitiesData : [];
    return list.map((u: any) => {
      const name = getLocalized(u.name);
      const acronym = getLocalized(u.acronym) || u.slug?.toUpperCase();
      const typeLabel =
        u.university_type === "PUBLIC"
          ? t("featuredUniversities.public")
          : t("featuredUniversities.private");
      const tuition =
        u.tuition_range_min_usd && u.tuition_range_max_usd
          ? `$${Math.round(u.tuition_range_min_usd)} – $${Math.round(u.tuition_range_max_usd)} / year`
          : t("common.tuition");
      const location = getLocalized(u.province) || "Phnom Penh";
      const highlight = getLocalized(u.description) || "";
      const majorsCount = `${u.majors_count || 0} Programs`;
      const rawImage =
        u.cover_image_url ||
        (u.slug ? `/images/universities/${u.slug}.jpg` : "/images/universities/rupp.jpg");
      const image =
        rawImage.startsWith("http://") || rawImage.startsWith("https://")
          ? `/api/proxy-image?url=${encodeURIComponent(rawImage)}`
          : rawImage;

      return {
        slug: u.slug,
        name,
        shortName: acronym,
        image,
        type: u.university_type,
        typeLabel,
        tuition,
        location,
        highlight,
        majorsCount,
        logoUrl: u.logo_url,
        websiteUrl: u.website_url,
        isVerified: u.is_verified,
        isTuitionVerified: u.is_tuition_verified,
      };
    });
  }, [universitiesData, getLocalized, t]);

  // Gallery items for CircularGallery WebGL
  const galleryItems = useMemo(() => {
    return featuredUniversities.map((uni) => ({
      image: uni.image,
      text: uni.shortName,
      description: `${uni.name} • ${uni.tuition}`,
      alt: uni.name,
    }));
  }, [featuredUniversities]);

  const activeUni =
    featuredUniversities[activeUniIndex % (featuredUniversities.length || 1)] ||
    featuredUniversities[0];


  return (
    <div className="flex flex-col w-full">
      {/* =====================================================================
          1. MODERN INTERACTIVE MASCOT HERO (DYNAMIC TALKING TARA)
          ===================================================================== */}
      <MascotInteractiveHero />

      {/* =====================================================================
          2. HOW ORIENX WORKS (GSAP STEP-BY-STEP FLOW ANIMATION)
          ===================================================================== */}
      <HowItWorksFlow />

      {/* =====================================================================
          3. FEATURED MAJORS PREVIEW (VIBRANT 3D STAGGERED SHOWCASE)
          ===================================================================== */}
      <FeaturedMajorsGrid />

      {/* =====================================================================
          4. CAMBODIAN UNIVERSITIES (VERIFIED PRICING - FULL WIDTH 3D CIRCULAR GALLERY)
          ===================================================================== */}
      <section
        id="featured-universities-section"
        className="py-16 lg:py-24 bg-white border-b border-[#E6E8F0] overflow-hidden select-none"
      >
        {/* Section Header (Contained in Max-7XL grid) */}
        <div className="gsap-uni-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("universitiesSection.verifiedNotice")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111965] tracking-tight">
                {t("universitiesSection.title")}
              </h2>
              <p className="text-sm sm:text-base text-[#68708A] max-w-2xl font-normal">
                {t("universitiesSection.subtitle")}
              </p>
            </div>

            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] shadow-2xs hover:shadow-sm transition-all self-start sm:self-auto"
            >
              <span>{t("featuredUniversities.viewAll")}</span>
              <ChevronRight className="w-4 h-4 text-[#68708A]" />
            </Link>
          </div>
        </div>

        {/* Skeletons when loading */}
        {isUniLoading || !mounted ? (
          <div className="space-y-6">
            {/* 3D Circular Gallery Skeleton Stage */}
            <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] my-1 flex items-center justify-center overflow-hidden select-none">
              {/* Studio spotlight backdrop */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-white/[0.02] dark:via-transparent dark:to-transparent pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Navigation Arrows Skeleton */}
              <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </div>

              {/* 3D Cards Perspective Mock */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-6xl px-4">
                {/* Left Card */}
                <div className="hidden sm:block w-56 lg:w-64 h-[300px] lg:h-[340px] rounded-3xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/5 shadow-md -rotate-6 scale-90 opacity-40 shrink-0" />

                {/* Center Hero Card */}
                <div className="w-72 sm:w-84 lg:w-96 h-[340px] sm:h-[380px] lg:h-[400px] rounded-3xl bg-slate-200/70 dark:bg-white/10 border border-slate-300/70 dark:border-white/15 shadow-2xl relative overflow-hidden flex flex-col justify-end p-6 space-y-3 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  <Skeleton className="h-7 w-28 rounded-full self-center bg-white/80 dark:bg-white/20" />
                </div>

                {/* Right Card */}
                <div className="hidden sm:block w-56 lg:w-64 h-[300px] lg:h-[340px] rounded-3xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/5 shadow-md rotate-6 scale-90 opacity-40 shrink-0" />
              </div>
            </div>

            {/* Spotlight Card Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 sm:-mt-5 relative z-20">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0c1236]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/40">
                {/* Visual Anchor Notch */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-4 bg-white dark:bg-[#0c1236] border-t border-l border-slate-200/80 dark:border-white/10 rotate-45 rounded-tl-xs shadow-2xs" />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                  {/* Left Identity Skeleton */}
                  <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                    <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0" />
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-7 sm:h-8 w-64 sm:w-80 rounded-xl" />
                        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
                      </div>
                    </div>
                  </div>

                  {/* Right Action & Tuition Skeleton */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end xl:items-center gap-3.5 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                    <Skeleton className="h-[76px] w-full sm:w-[210px] rounded-2xl" />
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-12 w-44 rounded-xl flex-1 sm:flex-initial" />
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Quick Select Rail Skeleton */}
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-3">
                  <Skeleton className="h-5 w-24 rounded-md shrink-0" />
                  <div className="flex items-center gap-2 overflow-hidden flex-1 py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <Skeleton key={i} className="h-8 w-18 sm:w-20 rounded-xl shrink-0" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isUniError || !featuredUniversities || featuredUniversities.length === 0 ? (
          /* Error State when failing to fetch universities */
          <div className="max-w-xl mx-auto my-8 px-4">
            <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                <WifiOff className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-[#111965]">
                  {language === "km"
                    ? "មិនអាចទាញយកទិន្នន័យសាកលវិទ្យាល័យបានឡើយ"
                    : "Unable to Load Cambodian Universities"}
                </h3>
                <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                  {language === "km"
                    ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យសាកលវិទ្យាល័យបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                    : "Unable to connect to the universities directory server. Please check your internet connection or try again."}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => refetchUnis()}
                  disabled={isUniFetching}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isUniFetching ? "animate-spin" : ""}`} />
                  <span>{language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
                </button>
                <Link
                  href="/universities"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span>{language === "km" ? "មើលបញ្ជីសាកលវិទ្យាល័យ" : "View Directory"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* FULL-WIDTH 3D CIRCULAR GALLERY SHOWCASE */}
            <div className="gsap-uni-gallery relative w-full h-[460px] sm:h-[500px] lg:h-[540px] my-1 overflow-hidden select-none group">
              {/* Animated studio spotlight backdrop */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-blue-200/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[320px] bg-[radial-gradient(ellipse_75%_50%_at_50%_45%,rgba(17,25,101,0.04),transparent_75%)] pointer-events-none" />

              {/* Minimal edge fade */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

              {/* Left / Right Interactive Navigation Arrows */}
              <button
                type="button"
                onClick={() =>
                  setActiveUniIndex(
                    (prev) =>
                      (prev - 1 + (featuredUniversities.length || 1)) %
                      (featuredUniversities.length || 1)
                  )
                }
                aria-label="Previous University"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200 shadow-md text-[#111965] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveUniIndex(
                    (prev) => (prev + 1) % (featuredUniversities.length || 1)
                  )
                }
                aria-label="Next University"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200 shadow-md text-[#111965] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {galleryItems.length > 0 && (
                <CircularGallery
                  items={galleryItems}
                  bend={0.85}
                  textColor={isDark ? "#E2E8F0" : "#111965"}
                  borderRadius={0.06}
                  scrollSpeed={2.2}
                  scrollEase={0.07}
                  itemSize={0.92}
                  itemAspect={1.32}
                  gap={0.22}
                  wave={0.0}
                  fadeEdges={0.02}
                  shadow={0.18}
                  grayscale={false}
                  showTitles={true}
                  snap={true}
                  autoScroll={3.8}
                  openOnClick={false}
                  intro={false}
                  enableVerticalWheel={true}
                  activeIndex={activeUniIndex}
                  onActiveChange={(idx) => setActiveUniIndex(idx)}
                  onItemClick={(_item, idx) => setActiveUniIndex(idx)}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Active University Detailed Spotlight Card */}
            <div className="gsap-uni-spotlight max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 sm:-mt-5 relative z-20">
              {activeUni && (
                <div className="relative p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#0c1236]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/40 text-[#111965] dark:text-white transition-all duration-300">
                  {/* Subtle ambient backlight glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-40 pointer-events-none -z-10" />

                  {/* Visual Anchor Indicator pointing up to the 3D card */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 bg-white dark:bg-[#0c1236] border-t border-l border-slate-200/80 dark:border-white/10 rotate-45 rounded-tl-xs shadow-2xs" />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                    {/* Left: Identity (Logo + Badges + Title + Description) */}
                    <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                      {/* University Logo Avatar */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-2 shadow-xs flex items-center justify-center overflow-hidden">
                        {activeUni.logoUrl ? (
                          <img
                            src={activeUni.logoUrl}
                            alt={activeUni.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) (fallback as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full rounded-xl bg-gradient-to-br from-[#111965] to-[#2B3595] text-[#F7CE4D] items-center justify-center font-black text-xs sm:text-sm tracking-wider"
                          style={{ display: activeUni.logoUrl ? "none" : "flex" }}
                        >
                          {activeUni.shortName?.slice(0, 4)}
                        </div>
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Meta Badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${activeUni.type === "PUBLIC"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60"
                                : "bg-purple-50 text-purple-700 border border-purple-200/70 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60"
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            <span>{activeUni.typeLabel}</span>
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-xs text-[#68708A] dark:text-slate-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#111965] dark:text-[#F7CE4D]" />
                            <span>{activeUni.location}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-white/10">
                            <GraduationCap className="w-3.5 h-3.5 text-[#68708A] dark:text-slate-400" />
                            <span>{activeUni.majorsCount}</span>
                          </span>
                        </div>

                        {/* Title & Highlight */}
                        <div>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] dark:text-white tracking-tight">
                            {activeUni.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#68708A] dark:text-slate-300 mt-1 leading-relaxed line-clamp-2 max-w-3xl">
                            {activeUni.highlight}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Tuition Card & Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end xl:items-center gap-3.5 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                      {/* Tuition Capsule */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-[#F5F6FA] dark:from-white/5 dark:to-white/[0.02] border border-[#E6E8F0] dark:border-white/10 min-w-[210px] shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#68708A] dark:text-slate-400 uppercase font-bold tracking-wider">
                            {t("featuredUniversities.tuition")}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            Annual
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-[#111965] dark:text-[#F7CE4D] mt-1 tracking-tight">
                          {activeUni.tuition}
                        </div>
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/universities/${activeUni.slug}`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#111965] hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-white dark:hover:bg-[#E5BD3B] shadow-md shadow-[#111965]/15 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                          <span>{t("featuredUniversities.profile")}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/universities/compare?ids=${activeUni.slug},rupp,itc`}
                          className="inline-flex items-center justify-center p-3.5 rounded-xl text-xs font-semibold text-[#111965] dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
                          title={t("featuredUniversities.compare")}
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        {activeUni.websiteUrl && (
                          <a
                            href={activeUni.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-3.5 rounded-xl text-xs font-semibold text-[#68708A] dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
                            title="Official Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Quick-Select Track */}
                  <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#68708A] dark:text-slate-400 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                      <span className="hidden sm:inline">{t("featuredUniversities.quickSelect")}</span>
                      <span className="sm:hidden">Jump to:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        quickSelectScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" });
                      }}
                      aria-label="Scroll left"
                      className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-[#111965] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div
                      ref={quickSelectScrollRef}
                      className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
                    >
                      {featuredUniversities.map((uni, idx) => {
                        const isActive = activeUniIndex === idx;
                        return (
                          <button
                            key={uni.slug}
                            ref={(el) => {
                              quickSelectButtonRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => setActiveUniIndex(idx)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${isActive
                                ? "bg-[#111965] text-white dark:bg-[#F7CE4D] dark:text-white shadow-sm shadow-[#111965]/20 scale-[1.03]"
                                : "bg-slate-100 dark:bg-white/5 text-[#68708A] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-[#111965] dark:hover:text-white"
                              }`}
                          >
                            {isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F7CE4D] animate-pulse" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                            <span>{uni.shortName}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        quickSelectScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" });
                      }}
                      aria-label="Scroll right"
                      className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-[#111965] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* =====================================================================
          5. SCHOLARSHIPS ANNOUNCEMENT & FINANCIAL AID SHOWCASE
          ===================================================================== */}
      <ScholarshipsShowcase />

      {/* =====================================================================
          6. TESTIMONIALS (AUTO-CHANGING ELEVATED 3-STAGE CAROUSEL)
          ===================================================================== */}
      <TestimonialsCarousel />

      {/* =====================================================================
          7. FAQ ACCORDION (ANIMATED AUTO-ADVANCE & COLLAPSIBLE ACCORDION)
          ===================================================================== */}
      <FaqSection />

      {/* =====================================================================
          8. CALL TO ACTION BANNER (REDESIGNED WITH TARA MASCOT)
          ===================================================================== */}
      <CtaBanner />
    </div>
  );
}
