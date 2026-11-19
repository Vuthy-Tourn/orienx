"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/language-context";
import {
  RIASEC_DIMENSIONS,
  getHollandArchetype,
  getHollandSpelledOut,
  RiasecDimensionMeta,
} from "@/lib/riasec-meta";
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  GraduationCap,
  Target,
  Zap,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  BadgeCheck,
  HelpCircle,
  Building2,
  RotateCcw,
  BookOpen,
  Award,
  X,
  Sliders,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Dialog } from "@/components/ui/dialog";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import { FaqSection, FaqItem } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";

// Presets for the Interactive Live Hero Radar
const SIMULATOR_PRESETS = [
  {
    code: "RIA",
    titleKm: "វិស្វករ & បច្ចេកវិទ្យា (RIA)",
    titleEn: "Tech Innovator (RIA)",
    scores: { R: 92, I: 88, A: 76, S: 42, E: 55, C: 60 },
    matchedMajorKm: "វិស្វកម្មកុំព្យូទ័រ & រ៉ូបូត",
    matchedMajorEn: "Computer & Robotics Engineering",
    matchedMajorSlug: "computer-engineering",
  },
  {
    code: "IAS",
    titleKm: "ស្ថាបត្យករ AI & សូហ្វវែរ (IAS)",
    titleEn: "AI & Software Architect (IAS)",
    scores: { R: 52, I: 95, A: 82, S: 78, E: 45, C: 50 },
    matchedMajorKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ និង AI",
    matchedMajorEn: "Computer Science & AI",
    matchedMajorSlug: "software-engineering",
  },
  {
    code: "AIR",
    titleKm: "ស្ថាបត្យករ UI/UX & មេឌា (AIR)",
    titleEn: "UI/UX & Creative Director (AIR)",
    scores: { R: 65, I: 78, A: 96, S: 60, E: 52, C: 40 },
    matchedMajorKm: "ការរចនាផលិតផល UI/UX",
    matchedMajorEn: "UI/UX & Product Design",
    matchedMajorSlug: "ui-ux-design",
  },
  {
    code: "ESC",
    titleKm: "នាយកប្រតិបត្តិ FinTech (ESC)",
    titleEn: "FinTech & Business Leader (ESC)",
    scores: { R: 40, I: 62, A: 50, S: 80, E: 94, C: 88 },
    matchedMajorKm: "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech)",
    matchedMajorEn: "FinTech & Financial Management",
    matchedMajorSlug: "fintech",
  },
];

// Top 8 Holland 3-Letter Code Combinations in Cambodia
const POPULAR_HOLLAND_ARCHETYPES = [
  {
    code: "IAS",
    titleEn: "Software & AI Architect",
    titleKm: "ស្ថាបត្យករសូហ្វវែរ និង AI",
    taglineEn: "Deep algorithmic logic (I) meets digital design (A) and collaborative teamwork (S).",
    taglineKm: "តក្កវិជ្ជាក្បួនដោះស្រាយ (I) រួមបញ្ចូលជាមួយការរចនាឌីជីថល (A) និងការងារក្រុម (S)។",
    color: "#2563EB",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    code: "RIA",
    titleEn: "The Technical Innovator",
    titleKm: "អ្នកច្នៃប្រឌិតបច្ចេកវិទ្យាជាក់ស្តែង",
    taglineEn: "Hands-on engineering builder (R) driven by scientific research (I) and creative flair (A).",
    taglineKm: "អ្នកសាងសង់ជាក់ស្តែង (R) ដែលជំរុញដោយការស្រាវជ្រាវ (I) និងការច្នៃប្រឌិត (A)។",
    color: "#0284C7",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    code: "RIE",
    titleEn: "Civil & Infrastructure Engineer",
    titleKm: "វិស្វករសំណង់ និងហេដ្ឋារចនាសម្ព័ន្ធ",
    taglineEn: "Physical precision (R) coupled with analytical math (I) and enterprise project leadership (E).",
    taglineKm: "ការអនុវត្តសំណង់ជាក់ស្តែង (R) គួបផ្សំជាមួយគណិតវិទ្យា (I) និងការដឹកនាំគម្រោង (E)។",
    color: "#D97706",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    code: "ESC",
    titleEn: "FinTech & Corporate Executive",
    titleKm: "នាយកប្រតិបត្តិហិរញ្ញវត្ថុ និងធុរកិច្ច",
    taglineEn: "Venture leadership (E) paired with empathetic negotiation (S) and accounting integrity (C).",
    taglineKm: "ភាពជាអ្នកដឹកនាំធុរកិច្ច (E) គួបផ្សំជាមួយការចរចា (S) និងភាពម៉ត់ចត់ផ្នែកគណនេយ្យ (C)។",
    color: "#DC2626",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    code: "AIR",
    titleEn: "UI/UX & Digital Media Architect",
    titleKm: "ស្ថាបត្យកររចនា និងមេឌាឌីជីថល",
    taglineEn: "Aesthetic creativity (A) merged with analytical logic (I) and hands-on tool execution (R).",
    taglineKm: "សោភ័ណភាពសិល្បៈ (A) រួមបញ្ចូលជាមួយការវិភាគ (I) និងការប្រើប្រាស់ឧបករណ៍បច្ចេកវិទ្យា (R)។",
    color: "#9333EA",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    code: "SAE",
    titleEn: "Education & Human Development",
    titleKm: "ការអភិវឌ្ឍធនធានមនុស្ស និងអប់រំ",
    taglineEn: "People-first empathy (S) supported by creative storytelling (A) and strategic advocacy (E).",
    taglineKm: "ការយកចិត្តទុកដាក់លើមនុស្ស (S) គាំទ្រដោយការច្នៃប្រឌិត (A) និងការតស៊ូមតិយុទ្ធសាស្ត្រ (E)។",
    color: "#059669",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    code: "IRC",
    titleEn: "Systems Analyst & Data Scientist",
    titleKm: "អ្នកវិភាគប្រព័ន្ធទិន្នន័យ និងស្ថិតិ",
    taglineEn: "Mathematical rigor (I) combined with hardware systems (R) and database compliance (C).",
    taglineKm: "ភាពម៉ត់ចត់នៃគណិតវិទ្យា (I) រួមជាមួយប្រព័ន្ធផ្នែករឹង (R) និងការរៀបចំទិន្នន័យ (C)។",
    color: "#0D9488",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    code: "EIA",
    titleEn: "Venture Innovator & Tech Strategist",
    titleKm: "ស្ថាបនិកធុរកិច្ចនវានុវត្តន៍ និងយុទ្ធសាស្ត្រ",
    taglineEn: "Entrepreneurial drive (E) guided by data research (I) and creative disruptive models (A).",
    taglineKm: "ភាពជាសហគ្រិន (E) គាំទ្រដោយការស្រាវជ្រាវ (I) និងគំរូធុរកិច្ចច្នៃប្រឌិតថ្មីៗ (A)។",
    color: "#F59E0B",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

export default function RiasecPublicGuidePage() {
  const { language, getLocalized } = useLanguage();
  const [activeArchetypeCode, setActiveArchetypeCode] = useState<string | null>(null);

  // Live Hero Simulator state
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const currentPreset = SIMULATOR_PRESETS[selectedPresetIdx];

  const radarData = useMemo(() => {
    return [
      { subject: "Realistic (R)", code: "R", score: currentPreset.scores.R },
      { subject: "Investigative (I)", code: "I", score: currentPreset.scores.I },
      { subject: "Artistic (A)", code: "A", score: currentPreset.scores.A },
      { subject: "Social (S)", code: "S", score: currentPreset.scores.S },
      { subject: "Enterprising (E)", code: "E", score: currentPreset.scores.E },
      { subject: "Conventional (C)", code: "C", score: currentPreset.scores.C },
    ];
  }, [currentPreset]);

  const activeArchetype = activeArchetypeCode ? getHollandArchetype(activeArchetypeCode) : null;

  // Tailored RIASEC-specific FAQ items (addressing real student vocational doubts)
  const riasecFaqs = useMemo<FaqItem[]>(() => {
    return [
      {
        id: "faq-diff-mbti",
        question:
          language === "km"
            ? "តើ RIASEC ខុសគ្នាពីការធ្វើតេស្តបុគ្គលិកលក្ខណៈ MBTI យ៉ាងដូចម្តេច?"
            : "How does RIASEC differ from the MBTI Personality test?",
        answer:
          language === "km"
            ? "MBTI វាស់ស្ទង់ទម្រង់ចិត្ត របៀបគិត និងរបៀបទំនាក់ទំនងសង្គមរបស់អ្នក។ ចំណែក RIASEC គឺជាស្តង់ដារចិត្តវិទ្យាអាជីព (Vocational Psychology) ដែលផ្តោតលើកិច្ចការជាក់ស្តែង និងបរិស្ថានការងារដែលផ្តល់ថាមពលដល់អ្នក។ នៅលើ OrienX យើងរួមបញ្ចូលទាំងពីរ៖ MBTI បង្ហាញពីរបៀបដែលអ្នកធ្វើការ ចំណែក RIASEC បង្ហាញពីជំនាញសិក្សា និងអាជីពដែលអ្នកនឹងរីកចម្រើនខ្លាំងបំផុត។"
            : "MBTI measures cognitive preferences and how you perceive the world, while RIASEC is a vocational psychology framework measuring what specific tasks, work environments, and academic activities energize you. OrienX combines both: MBTI reveals how you think and communicate, while RIASEC identifies what university majors and careers naturally fit your strengths.",
      },
      {
        id: "faq-holland-calc",
        question:
          language === "km"
            ? "តើកូដ Holland ៣ តួអក្សរមានន័យដូចម្តេច ហើយត្រូវបានគណនាយ៉ាងដូចម្តេច?"
            : "What does the 3-letter Holland Code mean and how is it calculated?",
        answer:
          language === "km"
            ? "ការធ្វើតេស្តនេះវាស់ស្ទង់ពិន្ទុរបស់អ្នកលើ ៦ វិមាត្រស្នូល (R-I-A-S-E-C)។ វិមាត្រ ៣ ដែលទទួលបានពិន្ទុខ្ពស់ជាងគេនឹងបង្កើតបានជាកូដ Holland របស់អ្នក (ឧ. RIA, IAS, ESC)។ តួអក្សរទីមួយតំណាងឱ្យចំណូលចិត្តស្នូល តួអក្សរទីពីរជាទិសដៅគាំទ្រ និងតួអក្សរទីបីជួយកំណត់ភាពច្បាស់លាស់ដើម្បីផ្គូផ្គងជំនាញសិក្សាដែលត្រូវនឹងទេពកោសល្យរបស់អ្នក។"
            : "Your assessment measures your scores across all 6 RIASEC dimensions: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Your top three highest-scoring dimensions form your 3-letter Holland Code (e.g., RIA, IAS, ESC). The first letter represents your core driver, the second your primary support, and the third adds nuance to pinpoint specific majors.",
      },
      {
        id: "faq-cambodia-matching",
        question:
          language === "km"
            ? "តើ OrienX ភ្ជាប់កូដ Holland ទៅកាន់សាកលវិទ្យាល័យ និងជំនាញនៅកម្ពុជាដោយរបៀបណា?"
            : "How does OrienX match my Holland Code to Cambodian universities and majors?",
        answer:
          language === "km"
            ? "កម្មវិធីសិក្សា និងមហាវិទ្យាល័យដែលទទួលស្គាល់នៅកម្ពុជា (ដូចជា ITC, RUPP, CADT, Paragon, AUPP, Norton និងជាង ៤០ គ្រឹះស្ថានផ្សេងទៀត) ត្រូវបានផ្គូផ្គងជាមួយកូដ Holland យ៉ាងម៉ត់ចត់។ ក្បួនដោះស្រាយនឹងផ្គូផ្គងកូដរបស់អ្នកជាមួយមុខវិជ្ជាពិតប្រាកដ លទ្ធផលការងារ និងតម្រូវការទីផ្សារការងារជាក់ស្តែងនៅកម្ពុជា។"
            : "OrienX maps accredited degree programs in Cambodia (at ITC, RUPP, CADT, Paragon, Norton, PUC, and 40+ institutions) to John Holland's occupational themes. When you complete the test, our algorithm compares your scores against real curriculum profiles, career outcomes, and current labor market demand in Cambodia.",
      },
      {
        id: "faq-tied-scores",
        question:
          language === "km"
            ? "ចុះបើពិន្ទុនៃវិមាត្រ RIASEC របស់ខ្ញុំស្មើគ្នា ឬប្រហាក់ប្រហែលគ្នា?"
            : "What if my top Holland scores are tied or very close?",
        answer:
          language === "km"
            ? "ពិន្ទុប្រហាក់ប្រហែលគ្នាមិនមែនជាបញ្ហាទេ វាបង្ហាញថាអ្នកជាមនុស្សមានសក្តានុពលពហុវិស័យ (Multi-potentialite)។ ឧទាហរណ៍ ប្រសិនបើអ្នកមានពិន្ទុ Investigative (I) និង Artistic (A) ខ្ពស់ស្មើគ្នា អ្នកនឹងពូកែខាងជំនាញកាត់គ្នារវាងការវិភាគ និងការរចនាច្នៃប្រឌិត (ដូចជា UI/UX ឬស្ថាបត្យកម្ម)។ ប្រព័ន្ធណែនាំនឹងផ្តល់ជម្រើសជំនាញដែលឆ្លើយតបគ្រប់ជ្រុងជ្រោយ។"
            : "Tied or close scores indicate a versatile 'multi-potentialite' profile. For example, high scores in both Investigative (I) and Artistic (A) mean you excel in hybrid fields like UI/UX Architecture, Game Development, or Creative Tech. Our system analyzes your secondary and tertiary scores so you discover interdisciplinary majors without being boxed in.",
      },
      {
        id: "faq-change-over-time",
        question:
          language === "km"
            ? "តើកូដ RIASEC របស់ខ្ញុំអាចផ្លាស់ប្តូរទៅតាមពេលវេលាដែរឬទេ?"
            : "Can my RIASEC personality profile change over time?",
        answer:
          language === "km"
            ? "ចំណូលចិត្តការងារស្នូលជាធម្មតាចាប់ផ្តើមមានស្ថិរភាពនៅអាយុចន្លោះពី ១៧ ដល់ ២៥ ឆ្នាំ។ ទោះជាយ៉ាងណា ការទទួលបានបទពិសោធន៍ថ្មីៗ ការរៀនជំនាញបច្ចេកវិទ្យា ឬការស្វែងយល់ពីវិស័យថ្មីៗអាចធ្វើឱ្យពិន្ទុវិមាត្ររងវិវត្តខ្លះៗ។ អ្នកអាចធ្វើតេស្តឡើងវិញបានគ្រប់ពេលនៅលើផ្ទាំងគ្រប់គ្រង OrienX ដើម្បីតាមដានការរីកចម្រើនរបស់អ្នក។"
            : "Core vocational interests generally stabilize during late high school and university (ages 17–25). However, as you gain practical project experience, learn technical skills, and explore new industries, secondary dimensions can evolve. You can retake the assessment anytime on your OrienX dashboard to track your professional growth.",
      },
    ];
  }, [language]);

  // Register GSAP ScrollTrigger animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero sequence
      gsap.fromTo(
        ".gsap-riasec-hero-anim",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".gsap-riasec-radar-card",
        { opacity: 0, scale: 0.95, y: 35 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          delay: 0.2,
          ease: "power3.out",
        }
      );

      // Section 2: 6 RIASEC Dimension Cards
      gsap.fromTo(
        ".gsap-dimension-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-dimensions-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 3: Archetypes
      gsap.fromTo(
        ".gsap-archetype-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-archetypes-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Section 4: 4-Pillar AI Intelligence
      gsap.fromTo(
        ".gsap-pillar-card",
        { opacity: 0, y: 34, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: { each: 0.09, from: "start" },
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-pillars-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-24">
      {/* ========================================================
          1. SOPHISTICATED HERO SECTION WITH INTERACTIVE LIVE SIMULATOR
          ======================================================== */}
      <section className="hero-screen relative w-full overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white border-b border-white/10 py-12 sm:py-16 lg:py-20 select-none">
        {/* Subtle Ambient Illumination */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,206,77,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 right-1/6 w-[400px] h-[400px] rounded-full bg-[#1B6EF3]/12 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] rounded-full bg-[#F7CE4D]/10 blur-[120px] pointer-events-none" />

        {/* Seamless Cambodian Campuses Skyline Backdrop */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden h-[380px] sm:h-[450px] lg:h-[500px] z-0"
          style={{
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt="Cambodian University Campuses Backdrop"
            fill
            unoptimized
            priority
            className="object-cover object-bottom opacity-15 sm:opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Credibility Badges & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category / Verified Pill */}
              <div className="gsap-riasec-hero-anim inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "km"
                    ? "ស្តង់ដារចិត្តវិទ្យាអាជីព JOHN HOLLAND កម្រិតសកល"
                    : "John Holland's Global Vocational Standard"}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="gsap-riasec-hero-anim text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {language === "km" ? (
                    <>
                      ស្វែងរកកូដអាជីព <span className="text-[#F7CE4D]">Holland RIASEC</span> <br className="hidden sm:inline" />
                      និងជំនាញត្រូវគ្នា ១០០%
                    </>
                  ) : (
                    <>
                      Discover Your Authentic <br className="hidden sm:inline" />
                      <span className="text-[#F7CE4D]">Holland RIASEC</span> Vocational Profile
                    </>
                  )}
                </h1>
                <p className="gsap-riasec-hero-anim text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed pt-1">
                  {language === "km"
                    ? "ទ្រឹស្តី John Holland ជួយសិស្សស្វែងរកវិស័យការងារដែលត្រូវនឹងចំណង់ចំណូលចិត្តពិតប្រាកដ។ OrienX បានសម្រិតសម្រាំងសំណួរចំនួន ៣០ ស្របតាមបរិបទកម្ពុជា ដើម្បីផ្គូផ្គងជាមួយមុខជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត។"
                    : "The world's most validated vocational guidance framework. OrienX localizes 30 diagnostic activities for Cambodian higher education, computing your mathematical 3-letter Holland code and matching university pathways."}
                </p>
              </div>

              {/* Action CTAs */}
              <div className="gsap-riasec-hero-anim pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/assessments/riasec/test"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-[0_4px_24px_rgba(247,206,77,0.3)] hover:shadow-[0_6px_28px_rgba(247,206,77,0.45)] transition-all active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>{language === "km" ? "ចាប់ផ្តើមធ្វើតេស្ត RIASEC" : "Start Free RIASEC Assessment"}</span>
                  <ArrowRight className="w-4 h-4 text-[#111965]" />
                </Link>

                <a
                  href="#dimensions-grid"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md shadow-sm transition-all text-center cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{language === "km" ? "ស្វែងយល់វិមាត្រទាំង ៦" : "Explore 6 Dimensions"}</span>
                </a>
              </div>

              {/* Trust & Localized Metrics */}
              <div className="gsap-riasec-hero-anim pt-4 border-t border-white/10 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{language === "km" ? "៣០ សំណួរជាក់ស្តែង" : "30 Localized Items"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{language === "km" ? "រយៈពេល ១០ នាទី" : "10–12 Minutes"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{language === "km" ? "ឥតគិតថ្លៃ ១០០%" : "100% Free for Students"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                  <span>{language === "km" ? "ផ្គូផ្គង ១២០+ ជំនាញកម្ពុជា" : "120+ Cambodian Majors"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Holland Radar Simulator Widget */}
            <div className="gsap-riasec-radar-card lg:col-span-5">
              <div className="p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#F7CE4D]/20 text-[#F7CE4D]">
                      <Sliders className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white">
                        {language === "km" ? "គំរូតេស្ត & រ៉ាដាអន្តរកម្ម" : "Interactive Holland Radar Preview"}
                      </h3>
                      <p className="text-[12.5px] text-slate-300">
                        {language === "km" ? "ជ្រើសរើសទម្រង់គំរូខាងក្រោមដើម្បីមើលការប្រែប្រួល" : "Click presets to see radar & major match changes"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12.5px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F7CE4D] text-[#111965]">
                    {currentPreset.code}
                  </span>
                </div>

                {/* Radar Chart Display */}
                <div className="w-full h-56 sm:h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#FFFFFF", fontSize: 10, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9 }}
                      />
                      <Radar
                        name="Holland Fit"
                        dataKey="score"
                        stroke="#F7CE4D"
                        strokeWidth={2.5}
                        fill="#F7CE4D"
                        fillOpacity={0.45}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Presets Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {SIMULATOR_PRESETS.map((preset, pIdx) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setSelectedPresetIdx(pIdx)}
                      className={`p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        selectedPresetIdx === pIdx
                          ? "bg-[#F7CE4D] text-[#111965] shadow-sm font-black scale-[1.02]"
                          : "bg-white/10 hover:bg-white/15 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{preset.code}</span>
                        <span className="text-[12px] opacity-75">Fit</span>
                      </div>
                      <div className="text-[12.5px] truncate opacity-90">
                        {language === "km" ? preset.titleKm.split(" ")[0] : preset.titleEn.split(" ")[0]}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Result Snippet */}
                <div className="p-3 rounded-2xl bg-black/25 border border-white/15 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[12px] text-slate-300">
                    <span>{language === "km" ? "ជំនាញផ្គូផ្គងគំរូ:" : "Matched Cambodian Major:"}</span>
                    <span className="text-[#F7CE4D] font-extrabold">{currentPreset.code} Code</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white text-sm truncate">
                      {language === "km" ? currentPreset.matchedMajorKm : currentPreset.matchedMajorEn}
                    </span>
                    <Link
                      href={`/majors/${currentPreset.matchedMajorSlug}`}
                      className="text-[12.5px] font-black text-[#F7CE4D] hover:underline shrink-0 flex items-center gap-0.5"
                    >
                      <span>{language === "km" ? "មើល" : "View"}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. ALL 6 HOLLAND CAREER CATEGORIES (PREMIUM 6-CARD GRID)
          ======================================================== */}
      <section
        id="dimensions-grid"
        className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === "km" ? "វិមាត្រទាំង ៦ នៃ HOLLAND" : "The 6 Holland Dimensions"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
            {language === "km"
              ? "ស្វែងយល់លម្អិតពីវិស័យទាំង ៦ (R-I-A-S-E-C)"
              : "Explore the 6 Foundational Career Dimensions"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {language === "km"
              ? "វិមាត្រនីមួយៗឆ្លុះបញ្ចាំងពីបរិស្ថានការងារ ចំណុចខ្លាំង និងមុខជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នានៅកម្ពុជា៖"
              : "Each dimension represents a distinct vocational environment, cognitive mindset, and high-demand career track in Cambodia."}
          </p>
        </div>

        {/* 6-Card Responsive Bento Grid */}
        <div className="gsap-dimensions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(RIASEC_DIMENSIONS).map(([code, meta]) => {
            const IconComp = meta.icon;
            return (
              <motion.div
                key={code}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                className="gsap-dimension-card p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs hover:border-slate-300 hover:shadow-xl transition-shadow flex flex-col justify-between space-y-5"
                style={{ borderTopWidth: "4px", borderTopColor: meta.color }}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        {code}
                      </span>
                      <div>
                        <h3 className="text-base font-black text-[#111965] leading-snug">
                          {language === "km" ? meta.shortNameKm : meta.shortNameEn}
                        </h3>
                        <span className="text-[12px] font-bold text-slate-400">
                          Holland Dimension ({code})
                        </span>
                      </div>
                    </div>
                    <span
                      className="p-2 rounded-xl shrink-0"
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Role Title & Description */}
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-[#111965]">
                      {language === "km" ? meta.roleKm : meta.roleEn}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-0.5">
                      {language === "km" ? meta.descKm : meta.descEn}
                    </p>
                  </div>

                  {/* Core Strengths Badges */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[12.5px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === "km" ? "ចំណុចខ្លាំងស្នូល (Core Strengths):" : "Core Strengths:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.strengths.map((str, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-[#F8FAFD] text-[#111965] border border-slate-200/80"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{language === "km" ? str.km : str.en}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matching Cambodian Majors */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[12.5px] font-black text-slate-400 uppercase tracking-wider block">
                      {language === "km" ? "ជំនាញត្រូវគ្នានៅកម្ពុជា (Matching Majors):" : "Matching Cambodian Majors:"}
                    </span>
                    <div className="space-y-1">
                      {meta.sampleMajors.map((m, mIdx) => (
                        <Link
                          key={mIdx}
                          href={`/majors/${m.slug}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-[#F0F2FA] text-xs font-bold text-[#111965] transition-colors group"
                        >
                          <span className="truncate">{language === "km" ? m.nameKm : m.nameEn}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#111965] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Careers */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[12px] text-slate-500 font-medium truncate">
                    {language === "km" ? "អាជីព:" : "Careers:"} {meta.sampleCareers.slice(0, 2).map((c) => (language === "km" ? c.km : c.en)).join(", ")}
                  </div>
                  <Link
                    href="/assessments/riasec/test"
                    className="inline-flex items-center gap-1 text-[12px] font-black text-[#111965] hover:text-[#0284C7] transition-colors shrink-0 ml-2"
                  >
                    <span>{language === "km" ? "ធ្វើតេស្ត" : "Test"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. HOLLAND RIASEC HEXAGON CONGRUENCE EXPLAINER
          ======================================================== */}
      <section className="py-16 lg:py-20 bg-white border-y border-[#E6E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-200">
              <Compass className="w-3.5 h-3.5" />
              <span>Holland Hexagon Theory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "គំរូឆកោន RIASEC (Holland Hexagon Model)"
                : "The RIASEC Hexagon Model of Career Congruence"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {language === "km"
                ? "តាមទ្រឹស្តី John Holland វិមាត្រដែលនៅជាប់គ្នាលើរាងឆកោនមានភាពស៊ីសង្វាក់គ្នាខ្ពស់បំផុត (High Consistency) រីឯវិមាត្រឈមមុខគ្នាផ្តល់តុល្យភាពបំពេញបន្ថែម។"
                : "According to John Holland, adjacent dimensions on the hexagon possess the highest psychological harmony, while opposite dimensions provide complementary cognitive balance."}
            </p>
          </div>

          {/* 3 Pillar Cards for Hexagon Dynamics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center font-black text-sm">
                R-I
              </div>
              <h4 className="text-base font-black text-[#111965]">
                {language === "km" ? "អនុវត្ត + ស្រាវជ្រាវ (Engineering & Tech)" : "Realistic + Investigative"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === "km"
                  ? "ការរួមបញ្ចូលគ្នារវាងការដោះស្រាយបញ្ហាជាក់ស្តែង និងតក្កវិទ្យាសាស្ត្រ បង្កើតបានជាវិស្វករសូហ្វវែរ រ៉ូបូត និងអ្នកស្រាវជ្រាវបច្ចេកវិទ្យា។"
                  : "Combines tangible hardware problem-solving with scientific inquiry, yielding elite software engineers, roboticists, and tech innovators."}
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-sm">
                A-S
              </div>
              <h4 className="text-base font-black text-[#111965]">
                {language === "km" ? "សិល្បៈ + សង្គម (Design & Human Care)" : "Artistic + Social"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === "km"
                  ? "ការរួមបញ្ចូលគ្នារវាងគំនិតច្នៃប្រឌិត និងការយល់ចិត្តមនុស្ស បង្កើតបានជាអ្នករចនា UI/UX អ្នកចិត្តវិទ្យា និងអ្នកដឹកនាំការអប់រំ។"
                  : "Fuses aesthetic originality with deep human empathy, powering human-centered UI/UX designers, counselors, and creative educators."}
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-[#F8FAFD] border border-slate-200 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center font-black text-sm">
                E-C
              </div>
              <h4 className="text-base font-black text-[#111965]">
                {language === "km" ? "សហគ្រិន + រៀបចំប្រព័ន្ធ (Venture & Finance)" : "Enterprising + Conventional"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {language === "km"
                  ? "ការរួមបញ្ចូលគ្នារវាងភាពជាអ្នកដឹកនាំអាជីវកម្ម និងប្រព័ន្ធគណនេយ្យសុក្រឹត បង្កើតបានជានាយកប្រតិបត្តិ FinTech និងសវនករយុទ្ធសាស្ត្រ។"
                  : "Unites ambitious commercial drive with accounting rigor, forming FinTech founders, corporate directors, and statutory leaders."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. POPULAR HOLLAND 3-LETTER CODE COMBINATIONS
          ======================================================== */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>High-Demand Codes in Cambodia</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
            {language === "km"
              ? "កូដ Holland ៣ តួអក្សរពេញនិយមនៅកម្ពុជា"
              : "Popular 3-Letter Holland Codes in Cambodia"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {language === "km"
              ? "ចុចលើកូដណាមួយខាងក្រោមដើម្បីស្វែងយល់ពីចំណុចខ្លាំង បរិស្ថានការងារ និងមុខជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នានៅកម្ពុជា៖"
              : "Click any Holland combination below to inspect its detailed profile, workplace environment, and matching university pathways."}
          </p>
        </div>

        <div className="gsap-archetypes-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_HOLLAND_ARCHETYPES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setActiveArchetypeCode(item.code)}
              className="gsap-archetype-card p-6 rounded-3xl bg-white border border-[#E6E8F0] text-left space-y-3 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <span
                    className="text-lg font-black font-mono px-3 py-1 rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.code}
                  </span>
                  <span className="text-[12.5px] font-black uppercase text-slate-400 group-hover:text-[#111965] transition-colors flex items-center gap-1">
                    <span>{language === "km" ? "មើលលម្អិត" : "Inspect"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#111965] leading-snug">
                    {language === "km" ? item.titleKm : item.titleEn}
                  </h4>
                  <p className="text-[12px] text-slate-400 font-bold mt-0.5">
                    {getHollandSpelledOut(item.code, language === "km" ? "km" : "en")}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                  {language === "km" ? item.taglineKm : item.taglineEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#111965]">
                <span className="text-[12px] text-slate-500">
                  {language === "km" ? "ស្វែងយល់បន្ថែម" : "View Profile"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#111965] group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. 4-PILLAR AI ENGINE TRANSPARENCY SECTION
          ======================================================== */}
      <section className="py-16 lg:py-20 bg-white border-y border-[#E6E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>OrienX 4-Pillar AI Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "របៀបដែល RIASEC ផ្សារភ្ជាប់ក្នុងប្រព័ន្ធ ៤ សសរស្តម្ភ"
                : "How RIASEC Powers OrienX's 4-Pillar Engine"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {language === "km"
                ? "ដើម្បីធានាថាអនុសាសន៍មិនលំអៀង និងអាចជឿទុកចិត្តបាន ១០០% OrienX មិនពឹងផ្អែកតែលើកត្តាមួយមុខនោះទេ។"
                : "To ensure recommendations are 100% reliable, OrienX calculates all university matches by synthesizing 4 holistic dimensions."}
            </p>
          </div>

          <div className="gsap-pillars-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                pct: 30,
                Icon: Compass,
                accent: "#F59E0B",
                titleEn: "RIASEC Interests",
                titleKm: "ចំណាប់អារម្មណ៍ RIASEC",
                descEn:
                  "Measures authentic enthusiasm for tangible, real-world work environments.",
                descKm:
                  "វាស់វែងកម្រិតចំណង់ចំណូលចិត្តពិតប្រាកដចំពោះសកម្មភាពការងារជាក់ស្តែង។",
              },
              {
                pct: 25,
                Icon: BrainCircuit,
                accent: "#9333EA",
                titleEn: "MBTI Personality",
                titleKm: "បុគ្គលិកលក្ខណៈ MBTI",
                descEn:
                  "Identifies cognitive orientation, communication style, and decisions.",
                descKm:
                  "កំណត់ទម្រង់ចិត្ត ស្ទីលទំនាក់ទំនង និងរបៀបសម្រេចចិត្តរបស់អ្នក។",
              },
              {
                pct: 25,
                Icon: GraduationCap,
                accent: "#0284C7",
                titleEn: "Academic Strengths",
                titleKm: "មុខវិជ្ជាពូកែ (Grades)",
                descEn:
                  "Verifies high school grades and subjects where the student shines.",
                descKm:
                  "ផ្ទៀងផ្ទាត់ពិន្ទុបាក់ឌុប ឬមុខវិជ្ជាវិទ្យាល័យដែលសិស្សមានប្រៀបខ្លាំង។",
              },
              {
                pct: 20,
                Icon: TrendingUp,
                accent: "#059669",
                titleEn: "Market Demand",
                titleKm: "ទីផ្សារការងារ (Demand)",
                descEn:
                  "Real-world labor market demand, growth velocity, and salary tracks.",
                descKm:
                  "ទិន្នន័យតម្រូវការការងារជាក់ស្តែងនៅកម្ពុជា និងប្រាក់បៀវត្សរ៍គោលដៅ។",
              },
            ].map(({ pct, Icon, accent, titleEn, titleKm, descEn, descKm }) => {
              const primary = pct === 30;

              return (
                <div
                  key={titleEn}
                  className={
                    primary
                      ? "gsap-pillar-card group relative flex flex-col gap-5 rounded-2xl bg-[#111965] p-5 text-white shadow-[0_20px_45px_-28px_rgba(17,25,101,0.9)] transition-transform duration-300 hover:-translate-y-1"
                      : "gsap-pillar-card group relative flex flex-col gap-5 rounded-2xl border border-[#E6E8F0] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={
                        primary
                          ? "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F7CE4D]"
                          : "inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      }
                      style={
                        primary
                          ? undefined
                          : { backgroundColor: `${accent}1A`, color: accent }
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    <span className="text-right">
                      <span
                        className={
                          primary
                            ? "block text-[24px] font-extrabold leading-none tabular-nums text-[#F7CE4D]"
                            : "block text-[24px] font-extrabold leading-none tabular-nums text-[#111965]"
                        }
                      >
                        {pct}%
                      </span>
                      <span
                        className={
                          primary
                            ? "text-[12px] font-semibold text-white/50"
                            : "text-[12px] font-semibold text-[#68708A]"
                        }
                      >
                        {language === "km" ? "ទម្ងន់" : "weight"}
                      </span>
                    </span>
                  </div>

                  <div>
                    <h4
                      className={
                        primary
                          ? "text-[15px] font-extrabold text-white"
                          : "text-[15px] font-extrabold text-[#111965]"
                      }
                    >
                      {language === "km" ? titleKm : titleEn}
                    </h4>
                    <p
                      className={
                        primary
                          ? "mt-1.5 text-[13px] leading-relaxed text-white/70"
                          : "mt-1.5 text-[13px] leading-relaxed text-[#68708A]"
                      }
                    >
                      {language === "km" ? descKm : descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FREQUENTLY ASKED QUESTIONS (SHARED HOME COMPONENT WITH RIASEC-SPECIFIC CONTENT)
          ======================================================== */}
      <FaqSection
        id="riasec-faq"
        eyebrow={language === "km" ? "ការណែនាំ & សំណួរទាក់ទងនឹង RIASEC" : "RIASEC Guidance & Insights"}
        title={language === "km" ? "សំណួរដែលសួរញឹកញាប់អំពី RIASEC" : "Frequently Asked Questions about RIASEC"}
        subtitle={
          language === "km"
            ? "ស្វែងយល់បន្ថែមអំពីស្តង់ដារ John Holland របៀបគណនាកូដ និងរបៀបដែលកូដនេះជួយអ្នកជ្រើសរើសជំនាញសាកលវិទ្យាល័យ។"
            : "Learn how the John Holland vocational model works, how your 3-letter code is calculated, and how it guides your major selection."
        }
        items={riasecFaqs}
      />

      {/* ========================================================
          7. HIGH-CONVERTING CLOSING BANNER (SHARED HOME COMPONENT WITH RIASEC-SPECIFIC CONTENT)
          ======================================================== */}
      <CtaBanner
        eyebrow={language === "km" ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្ស-និស្សិត" : "100% Free Holland Assessment"}
        title={
          language === "km"
            ? "ត្រៀមខ្លួនស្វែងរកកូដ Holland RIASEC របស់អ្នកហើយឬនៅ?"
            : "Ready to Discover Your 3-Letter Holland Code?"
        }
        subtitle={
          language === "km"
            ? "ចំណាយពេលត្រឹមតែ ១០-១២ នាទីដើម្បីទទួលបានកូដផ្ទាល់ខ្លួន គំនូសតាងរ៉ាដា ៦ វិមាត្រ និងការផ្គូផ្គងជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមនឹងអ្នកបំផុត។"
            : "Takes only 10–12 minutes. Receive your instant personalized Holland Code, 6-dimension radar profile, and verified Cambodian university matches."
        }
        primaryButtonText={language === "km" ? "ចាប់ផ្តើមធ្វើតេស្ត RIASEC" : "Take Assessment Now"}
        primaryButtonHref="/assessments/riasec/test"
        secondaryButtonText={language === "km" ? "ស្វែងយល់ពីវិមាត្រទាំង ៦" : "Explore 6 Dimensions"}
        secondaryButtonHref="#dimensions-grid"
        mascotSpeech={language === "km" ? "តោះស្វែងរកកូដ Holland របស់អ្នក! 🚀" : "Let's find your Holland Code! 🚀"}
        badges={[
          {
            icon: <Clock className="w-4 h-4 text-[#F7CE4D] shrink-0" />,
            label: language === "km" ? "តេស្ត ១០-១២ នាទី" : "10-12 Min Assessment",
          },
          {
            icon: <Target className="w-4 h-4 text-emerald-400 shrink-0" />,
            label: language === "km" ? "កូដ Holland ៣ តួ" : "3-Letter Holland Code",
          },
          {
            icon: <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />,
            label: language === "km" ? "ផ្គូផ្គង ១២០+ ជំនាញ" : "120+ Majors Matched",
          },
        ]}
        trustText={
          language === "km"
            ? "ផ្អែកលើស្តង់ដារចិត្តវិទ្យាអាជីព John Holland និងទិន្នន័យឧត្តមសិក្សាកម្ពុជា"
            : "Based on John Holland's vocational standard & Cambodian university data"
        }
      />

      {/* ========================================================
          8. INTERACTIVE BILINGUAL ARCHETYPE DETAIL MODAL
          ======================================================== */}
      {activeArchetype && activeArchetypeCode && (
        <Dialog
          open={!!activeArchetypeCode}
          onOpenChange={(open) => {
            if (!open) setActiveArchetypeCode(null);
          }}
          className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-8"
          hideClose
        >
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-[#111965] text-[#F7CE4D] font-black text-lg flex items-center justify-center font-mono shadow-md">
                  {activeArchetype.code}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111965]">
                    {language === "km" ? activeArchetype.titleKm : activeArchetype.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    {language === "km" ? activeArchetype.subtitleKm : activeArchetype.subtitleEn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveArchetypeCode(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tagline Box */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-[#F8FAFD] p-4 rounded-2xl border border-slate-200">
              {language === "km" ? activeArchetype.taglineKm : activeArchetype.taglineEn}
            </p>

            {/* Strengths & Work Environment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wide">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>{language === "km" ? "ចំណុចខ្លាំងស្នូល" : "Core Strengths"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeArchetype.strengths.map((str, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{str}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-800 uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{language === "km" ? "បរិស្ថានការងារដែលរីកចម្រើន" : "Optimal Environment"}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === "km"
                    ? activeArchetype.optimalWorkEnvironmentKm
                    : activeArchetype.optimalWorkEnvironmentEn}
                </p>
              </div>
            </div>

            {/* Target Industries */}
            <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-purple-800 uppercase tracking-wide">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span>{language === "km" ? "វិស័យការងារ & ឧស្សាហកម្មគោលដៅ" : "Target Career Clusters"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(language === "km"
                  ? activeArchetype.targetIndustriesKm
                  : activeArchetype.targetIndustriesEn
                ).map((ind, iIdx) => (
                  <span
                    key={iIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200"
                  >
                    <Zap className="w-3 h-3 text-purple-600" />
                    <span>{ind}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {language === "km"
                  ? "ចង់ដឹងថាកូដ Holland របស់អ្នកត្រូវគ្នានឹងកូដនេះដែរឬទេ?"
                  : "Want to see if your Holland code matches this profile?"}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveArchetypeCode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  {language === "km" ? "បិទ" : "Close"}
                </button>
                <Link
                  href="/assessments/riasec/test"
                  className="px-5 py-2.5 rounded-xl bg-[#111965] hover:bg-[#1A2580] text-white text-xs font-black transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto whitespace-nowrap"
                >
                  <span>{language === "km" ? "ធ្វើតេស្ត RIASEC" : "Take Assessment"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F7CE4D]" />
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
