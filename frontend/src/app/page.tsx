"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Badge } from "@/components/ui/badge";
import CircularGallery from "@/components/ui/circular-gallery";

export default function HomePage() {
  const { t, getLocalized, language } = useLanguage();
  const [activeUniIndex, setActiveUniIndex] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

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
      const image = ["rupp", "itc", "aupp", "paragoniu", "cadt"].includes(u.slug)
        ? `/images/universities/${u.slug}.jpg`
        : "/images/universities/rupp.jpg";

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
            <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] my-1 flex items-center justify-center overflow-hidden">
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-5xl px-4">
                <div className="hidden md:block w-56 h-72 rounded-3xl bg-slate-200/50 animate-pulse opacity-40 shrink-0" />
                <div className="w-72 sm:w-84 h-80 sm:h-96 rounded-3xl bg-slate-200/70 border border-slate-300/80 animate-pulse shadow-md shrink-0 flex flex-col justify-end p-6 space-y-3">
                  <div className="w-24 h-4 bg-slate-300/80 rounded-md" />
                  <div className="w-48 h-6 bg-slate-300/80 rounded-md" />
                  <div className="w-32 h-4 bg-slate-300/60 rounded-md" />
                </div>
                <div className="hidden md:block w-56 h-72 rounded-3xl bg-slate-200/50 animate-pulse opacity-40 shrink-0" />
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 sm:-mt-5">
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E8F0] shadow-sm animate-pulse space-y-4">
                <div className="flex gap-2">
                  <div className="w-24 h-5 rounded-full bg-slate-200" />
                  <div className="w-20 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="w-64 h-8 rounded-lg bg-slate-200" />
                <div className="w-full max-w-2xl h-12 rounded-lg bg-slate-100" />
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
                  textColor="#111965"
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
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E8F0] shadow-sm text-[#111965] transition-all duration-300">
                  {/* Visual Anchor Indicator pointing up to the 3D card */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 bg-white border-t border-l border-[#E6E8F0] rotate-45 rounded-tl-xs shadow-2xs" />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            activeUni.type === "PUBLIC"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-purple-50 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {activeUni.typeLabel}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#68708A] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#111965]" />
                          <span>{activeUni.location}</span>
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
                          {activeUni.majorsCount}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
                          {activeUni.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#68708A] mt-1 leading-relaxed">
                          {activeUni.highlight}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4 shrink-0">
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] min-w-[210px]">
                        <div className="text-[10px] text-[#68708A] uppercase font-bold tracking-wider">
                          {t("featuredUniversities.tuition")}
                        </div>
                        <div className="text-base sm:lg font-black text-[#111965] mt-0.5">
                          {activeUni.tuition}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <Link
                          href={`/universities/${activeUni.slug}`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#111965] hover:bg-[#1E277A] shadow-xs transition-colors"
                        >
                          <span>{t("featuredUniversities.profile")}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/universities/compare?ids=${activeUni.slug},rupp,itc`}
                          className="inline-flex items-center justify-center p-3 rounded-xl text-xs font-semibold text-[#111965] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                          title={t("featuredUniversities.compare")}
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quick Selector Thumbnails */}
                  <div className="mt-6 pt-5 border-t border-[#E6E8F0]/80 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[#68708A] mr-1">
                      {t("featuredUniversities.quickSelect")}
                    </span>
                    {featuredUniversities.map((uni, idx) => {
                      const isActive = activeUniIndex === idx;
                      return (
                        <button
                          key={uni.slug}
                      type="button"
                      onClick={() => setActiveUniIndex(idx)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#111965] text-white shadow-xs scale-105"
                          : "bg-slate-100 text-[#68708A] hover:bg-slate-200 hover:text-[#111965]"
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F7CE4D] animate-pulse" />
                      )}
                      <span>{uni.shortName}</span>
                    </button>
                  );
                })}
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
