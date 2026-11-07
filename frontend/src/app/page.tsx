"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { MascotInteractiveHero } from "@/components/hero/mascot-interactive-hero";
import { HowItWorksFlow } from "@/components/home/how-it-works-flow";
import { FeaturedMajorsGrid } from "@/components/home/featured-majors-grid";

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
} from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CircularGallery from "@/components/ui/circular-gallery";

export default function HomePage() {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeUniIndex, setActiveUniIndex] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verified Cambodian Universities featured on landing with real building photographs
  const featuredUniversities = [
    {
      slug: "rupp",
      nameEn: "Royal University of Phnom Penh (RUPP)",
      nameKm: "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ (RUPP)",
      shortName: "RUPP",
      image: "/images/universities/rupp.jpg",
      type: "PUBLIC",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ" : "Public State University",
      tuition: "$250 – $500 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "ផ្តល់អាហារូបករណ៍រដ្ឋ ១០០% សម្រាប់សិស្សបាក់ឌុបឆ្នើម" : "100% State Scholarships for top BacII rankers",
      majorsCount: "35+ Majors",
    },
    {
      slug: "itc",
      nameEn: "Institute of Technology of Cambodia (ITC Techno)",
      nameKm: "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)",
      shortName: "ITC (Techno)",
      image: "/images/universities/itc.jpg",
      type: "PUBLIC",
      typeLabel: language === "km" ? "វិទ្យាស្ថានវិស្វកម្មរដ្ឋ" : "Public Premier Engineering",
      tuition: "$600 – $800 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "សញ្ញាបត្រវិស្វករជាតិ និងស្តង់ដារអន្តរជាតិ CTI" : "National Engineer & CTI International Accreditation",
      majorsCount: "20+ Engineering Programs",
    },
    {
      slug: "aupp",
      nameEn: "American University of Phnom Penh (AUPP)",
      nameKm: "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ (AUPP)",
      shortName: "AUPP",
      image: "/images/universities/aupp.jpg",
      type: "PRIVATE",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យឯកជនអន្តរជាតិ" : "Private International",
      tuition: "$6,000 / year (Single) • $9,000 / year (Dual US)",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "សញ្ញាបត្រទ្វេភាគីជាមួយសាកលវិទ្យាល័យនៅអាមេរិក (Univ of Arizona)" : "Dual Degree with University of Arizona (US-Accredited)",
      majorsCount: "12+ Programs",
    },
    {
      slug: "paragoniu",
      nameEn: "Paragon International University",
      nameKm: "សាកលវិទ្យាល័យអន្តរជាតិផារ៉ាហ្គន",
      shortName: "Paragon IU",
      image: "/images/universities/paragoniu.jpg",
      type: "PRIVATE",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យឯកជន" : "Private International",
      tuition: "$2,500 – $3,500 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "កម្មវិធីបង្រៀនជាភាសាអង់គ្លេស ១០០% លើវិស្វកម្ម ស្ថាបត្យកម្ម និងកុំព្យូទ័រ" : "100% English medium Engineering, Architecture & CS",
      majorsCount: "15+ Majors",
    },
    {
      slug: "cadt",
      nameEn: "Cambodia Academy of Digital Technology (CADT)",
      nameKm: "បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT)",
      shortName: "CADT",
      image: "/images/universities/cadt.jpg",
      type: "PUBLIC",
      typeLabel: language === "km" ? "បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលជាតិ" : "Public Digital Academy",
      tuition: "$1,000 – $1,500 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "អាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ (Techo Digital Talent)" : "Techo Digital Talent Scholarships for AI, Data & Cybersecurity",
      majorsCount: "8+ Tech Majors",
    },
  ];

  // Gallery items for CircularGallery WebGL
  const galleryItems = featuredUniversities.map((uni) => ({
    image: uni.image,
    text: uni.shortName,
    description: `${uni.nameEn} • ${uni.tuition}`,
    alt: uni.nameEn,
  }));

  const activeUni = featuredUniversities[activeUniIndex % featuredUniversities.length] || featuredUniversities[0];

  const faqs = [
    {
      qEn: "How does OrienX recommend majors without just guessing?",
      qKm: "តើ OrienX ផ្តល់អនុសាសន៍ជំនាញសិក្សាដោយរបៀបណា ដោយមិនមែនជាការទស្សន៍ទាយ?",
      aEn: "OrienX combines 4 distinct data points: your original MBTI-inspired personality preferences, your RIASEC Holland interest codes, your strongest school subjects (e.g. Mathematics, Physics, English), and your practical budget constraints. Every recommendation comes with an explainable match breakdown showing exactly why the major fits your profile.",
      aKm: "OrienX វិភាគលើទិន្នន័យ ៤ ចំណុច៖ បុគ្គលិកលក្ខណៈ ៤ វិមាត្រ, កូដចំណាប់អារម្មណ៍អាជីព RIASEC, មុខវិជ្ជាដែលអ្នកពូកែ និងចូលចិត្ត និងលក្ខខណ្ឌថវិកាជាក់ស្តែង។ អនុសាសន៍នីមួយៗមានរបាយការណ៍ពន្យល់ពីមូលហេតុយ៉ាងច្បាស់លាស់។"
    },
    {
      qEn: "Is the university tuition information accurate and verified?",
      qKm: "តើព័ត៌មានតម្លៃសិក្សារបស់សាកលវិទ្យាល័យពិតជាត្រឹមត្រូវ និងផ្ទៀងផ្ទាត់ដែរឬទេ?",
      aEn: "Yes. We source institutional pricing directly from verified university admissions portals and partner sources like Sala.co. Where fees vary or are unconfirmed, we clearly label them as 'Information not available' or 'Tuition pending verification' rather than inventing data.",
      aKm: "ពិតប្រាកដណាស់។ យើងប្រមូលព័ត៌មានពីការិយាល័យចុះឈ្មោះផ្លូវការរបស់សាកលវិទ្យាល័យ និងគេហទំព័រដៃគូស្រាវជ្រាវ (Sala.co)។ ប្រសិនបើព័ត៌មានណាមិនទាន់មានការបញ្ជាក់ យើងនឹងបង្ហាញយ៉ាងច្បាស់ថា «ព័ត៌មានមិនទាន់មាន» ដោយមិនបង្កើតទិន្នន័យក្លែងក្លាយឡើយ។"
    },
    {
      qEn: "Can I take the assessment again if my interests change?",
      qKm: "តើខ្ញុំអាចធ្វើតេស្តឡើងវិញបានទេ ប្រសិនបើចំណាប់អារម្មណ៍របស់ខ្ញុំផ្លាស់ប្តូរ?",
      aEn: "Absolutely. Students can retake both the Personality Assessment and RIASEC Career Interest test at any time from their dashboard. Your recommendations will instantly update based on your latest responses.",
      aKm: "បានយ៉ាងពិតប្រាកដ។ សិស្សនិស្សិតអាចធ្វើតេស្តបុគ្គលិកលក្ខណៈ និងតេស្ត RIASEC ម្តងទៀតនៅពេលណាក៏បានពីផ្ទាំងគ្រប់គ្រង (Dashboard)។ ប្រព័ន្ធនឹងគណនាអនុសាសន៍ថ្មីភ្លាមៗ។"
    },
    {
      qEn: "Is OrienX free for Cambodian students?",
      qKm: "តើ OrienX ឥតគិតថ្លៃសម្រាប់សិស្សានុសិស្សកម្ពុជាដែរឬទេ?",
      aEn: "Yes, taking assessments, exploring university directories, comparing programs, and receiving personalized major recommendations is 100% free for students.",
      aKm: "បាទ/ចាស! ការធ្វើតេស្ត ការស្វែងរកសាកលវិទ្យាល័យ ការប្រៀបធៀបតម្លៃ និងការទទួលបានការតម្រង់ទិសគឺឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សានុសិស្ស។"
    }
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
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
              <span>{language === "km" ? "មើលសាកលវិទ្យាល័យទាំងអស់" : "View All Universities"}</span>
              <ChevronRight className="w-4 h-4 text-[#68708A]" />
            </Link>
          </div>
        </div>

        {/* FULL-WIDTH 3D CIRCULAR GALLERY SHOWCASE (Flows from Laptop Screen Edges) */}
        <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] my-1 overflow-hidden select-none group">
          {/* Animated studio spotlight backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-blue-200/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[320px] bg-[radial-gradient(ellipse_75%_50%_at_50%_45%,rgba(17,25,101,0.04),transparent_75%)] pointer-events-none" />

          {/* Minimal edge fade so cards visibly emerge directly from laptop bezel */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Left / Right Interactive Navigation Arrows */}
          <button
            type="button"
            onClick={() => setActiveUniIndex((prev) => (prev - 1 + featuredUniversities.length) % featuredUniversities.length)}
            aria-label="Previous University"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200 shadow-md text-[#111965] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => setActiveUniIndex((prev) => (prev + 1) % featuredUniversities.length)}
            aria-label="Next University"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200 shadow-md text-[#111965] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {mounted ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50/50">
              <div className="w-9 h-9 border-3 border-[#111965] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Active University Detailed Spotlight Card (Contained in Max-7XL grid, visually anchored to gallery) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 sm:-mt-5 relative z-20">
          {activeUni && (
            <div
              className="relative p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E8F0] shadow-sm text-[#111965] transition-all duration-300"
            >
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
                      {language === "km" ? activeUni.nameKm : activeUni.nameEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68708A] mt-1 leading-relaxed">
                      {activeUni.highlight}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4 shrink-0">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] min-w-[210px]">
                    <div className="text-[10px] text-[#68708A] uppercase font-bold tracking-wider">
                      {language === "km" ? "តម្លៃសិក្សាប្រចាំឆ្នាំ (ផ្ទៀងផ្ទាត់)" : "Verified Annual Tuition"}
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
                      <span>{language === "km" ? "មើលព័ត៌មានលម្អិត" : "View University Profile"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/universities/compare?ids=${activeUni.slug},rupp,itc`}
                      className="inline-flex items-center justify-center p-3 rounded-xl text-xs font-semibold text-[#111965] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      title={language === "km" ? "ប្រៀបធៀប" : "Compare"}
                    >
                      <Layers className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Selector Thumbnails */}
              <div className="mt-6 pt-5 border-t border-[#E6E8F0]/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-[#68708A] mr-1">
                  {language === "km" ? "ជ្រើសរើសរហ័ស៖" : "Quick select:"}
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
      </section>

      {/* =====================================================================
          5. SCHOLARSHIPS TEASER
          ===================================================================== */}
      <section className="py-16 bg-gradient-to-r from-[#111965] to-[#1E277A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
                Financial Aid & Scholarships
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {language === "km"
                  ? "ស្វែងរកអាហារូបករណ៍ថ្នាក់រដ្ឋ និងឯកជននៅកម្ពុជា"
                  : "Discover Verified Scholarships & Tuition Coverage"}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {language === "km"
                  ? "តាមដានកាលបរិច្ឆេទផុតកំណត់នៃអាហារូបករណ៍រដ្ឋ MoEYS និងអាហារូបករណ៍ ៥០% ទៅ ១០០% ពីសាកលវិទ្យាល័យដៃគូនានា ជាមួយតំណភ្ជាប់ដាក់ពាក្យផ្លូវការ។"
                  : "Track deadlines, GPA eligibility requirements, and official application links for MoEYS state scholarships and merit-based university grants."}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href="/scholarships"
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-sm transition-all"
              >
                {language === "km" ? "ស្វែងរកអាហារូបករណ៍ឥឡូវនេះ" : "Explore Scholarships"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. TESTIMONIALS
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#F5F6FA] border-b border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {language === "km" ? "មតិពីសិស្សានុសិស្សដែលបានប្រើប្រាស់ OrienX" : "Empowering Cambodian Students"}
            </h2>
            <p className="text-sm text-[#68708A]">
              {language === "km"
                ? "ការតម្រង់ទិសច្បាស់លាស់ជួយឱ្យសិស្សានុសិស្សជ្រើសរើសជំនាញដោយទំនុកចិត្ត។"
                : "Real feedback from students who discovered their university direction with OrienX."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] space-y-4 shadow-2xs">
              <div className="flex items-center gap-1 text-[#F7CE4D]">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#171A2C] leading-relaxed italic">
                {language === "km"
                  ? "«កាលពីប្រឡងបាក់ឌុបរួច ខ្ញុំមិនដឹងថាគួររៀន IT ឬវិស្វកម្មសំណង់ទេ។ តេស្ត RIASEC របស់ OrienX បានពន្យល់ពីចំណុចខ្លាំងរបស់ខ្ញុំច្បាស់លាស់ ឥឡូវខ្ញុំកំពុងរៀនវិស្វកម្មកម្មវិធីនៅតិចណូដោយក្តីសង្ឃឹម។»"
                  : "\"After Grade 12 exams, I was torn between IT and Civil Engineering. OrienX's RIASEC assessment clearly broke down my analytical strengths. I'm now confidently studying Software Engineering at ITC.\""}
              </p>
              <div className="pt-2 border-t border-[#E6E8F0] flex items-center justify-between text-xs">
                <span className="font-bold text-[#111965]">Chea Sokheng</span>
                <span className="text-[#68708A]">RUPP / Phnom Penh</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] space-y-4 shadow-2xs">
              <div className="flex items-center gap-1 text-[#F7CE4D]">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#171A2C] leading-relaxed italic">
                {language === "km"
                  ? "«អ្វីដែលខ្ញុំពេញចិត្តបំផុតគឺព័ត៌មានតម្លៃសិក្សានៅសាកលវិទ្យាល័យនីមួយៗគឺជាក់ស្តែង។ ខ្ញុំបានប្រៀបធៀប NUM និង Paragon រួចរកឃើញអាហារូបករណ៍ដែលសមរម្យ។»"
                  : "\"What I loved most is the real verified tuition fees. I was able to compare NUM and Paragon side-by-side and discovered a merit scholarship that fits my family's budget perfectly.\""}
              </p>
              <div className="pt-2 border-t border-[#E6E8F0] flex items-center justify-between text-xs">
                <span className="font-bold text-[#111965]">Khemara Pich</span>
                <span className="text-[#68708A]">Battambang Graduate</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] space-y-4 shadow-2xs">
              <div className="flex items-center gap-1 text-[#F7CE4D]">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#171A2C] leading-relaxed italic">
                {language === "km"
                  ? "«តេស្តបុគ្គលិកលក្ខណៈមិនមែនគ្រាន់តែប្រាប់ប្រភេទអក្សរ ៤ នោះទេ ប៉ុន្តែបានពន្យល់ពីរបៀបរៀន និងបរិស្ថានការងារដែលខ្ញុំអាចរីកចម្រើនបានល្អបំផុត។»"
                  : "\"The personality test didn't just give 4 letters — it explained my learning style and the exact work environments where I can thrive. A must-have for all Grade 12 students!\""}
              </p>
              <div className="pt-2 border-t border-[#E6E8F0] flex items-center justify-between text-xs">
                <span className="font-bold text-[#111965]">Sreynich Heng</span>
                <span className="text-[#68708A]">Siem Reap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. FAQ ACCORDION
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-white border-b border-[#E6E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {language === "km" ? "សំណួរដែលសួរញឹកញាប់ (FAQ)" : "Frequently Asked Questions"}
            </h2>
            <p className="text-sm text-[#68708A]">
              {language === "km"
                ? "ស្វែងយល់បន្ថែមអំពីរបៀបដែល OrienX ដំណើរការ និងវិធីសាស្ត្រតម្រង់ទិសរបស់យើង។"
                : "Learn more about our methodology, data sources, and guidance approach."}
            </p>
          </div>

          <Accordion className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                title={language === "km" ? faq.qKm : faq.qEn}
                defaultOpen={idx === 0}
              >
                {language === "km" ? faq.aKm : faq.aEn}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* =====================================================================
          8. CALL TO ACTION BANNER
          ===================================================================== */}
      <section className="py-16 bg-[#F5F6FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#111965] text-white p-8 sm:p-12 text-center space-y-6 shadow-lg border border-[#1E277A]">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === "km"
                ? "ត្រៀមខ្លួនស្វែងរកទិសដៅអនាគតរបស់អ្នកហើយឬនៅ?"
                : "Ready to Discover Your True Educational Direction?"}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              {language === "km"
                ? "ចូលរួមជាមួយសិស្សានុសិស្សកម្ពុជារាប់ពាន់នាក់ ដើម្បីធ្វើការសម្រេចចិត្តលើជំនាញសាកលវិទ្យាល័យដោយទំនុកចិត្ត។"
                : "Join thousands of Cambodian students using OrienX to make confident, informed decisions about university and future careers."}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-sm transition-all"
              >
                {t("hero.ctaPrimary")}
              </Link>
              <Link
                href="/universities"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                {t("nav.universities")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
