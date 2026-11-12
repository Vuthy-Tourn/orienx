"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award,
  Building2,
  HeartHandshake,
  TrendingUp,
  HardHat,
  ChevronDown,
  FileCheck,
  Check,
  Briefcase,
  BadgeCheck,
  Target,
  School,
  ArrowLeftRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";

// Conversational Tara mascot advice tips
const TARA_ADVICE_TIPS = [
  {
    km: "ជ្រើសរើសជំនាញសិក្សា ត្រូវផ្អែកលើចំណុចខ្លាំងពិតប្រាកដ និងតម្រូវការទីផ្សារ មិនមែនគ្រាន់តែតាមមិត្តភក្តិឡើយ!",
    en: "Choose your university major based on your authentic analytical strengths and market demand, not peer pressure!",
  },
  {
    km: "តម្លៃសិក្សានៅសាកលវិទ្យាល័យរដ្ឋ និងឯកជនខុសគ្នាខ្លាំង។ ពិនិត្យថ្លៃសិក្សា ៤ ឆ្នាំពេញ មុននឹងសម្រេចចិត្តចុះឈ្មោះ!",
    en: "Tuition fees vary significantly between public state and private universities. Check the full 4-year cost before enrolling!",
  },
  {
    km: "និស្សិតកម្ពុជាជាច្រើនមិនដឹងថាខ្លួនឯងមានសិទ្ធិទទួលបានអាហារូបករណ៍ ១០០% ទេ! ពិនិត្យបញ្ជីអាហារូបករណ៍រដ្ឋ MoEYS និង CADT ឥឡូវនេះ!",
    en: "Many Cambodian students qualify for 100% full-ride scholarships without realizing it! Check our verified scholarship tracker!",
  },
];

// 4 Scientific Pillars (Clean, Focused Data with Direct Links to Dedicated Pages)
const SCIENTIFIC_PILLARS = [
  {
    number: "01",
    weight: "30%",
    titleEn: "Holland RIASEC Vocational Interests",
    titleKm: "ចំណាប់អារម្មណ៍អាជីព Holland RIASEC",
    categoryEn: "Vocational Psychology Standard",
    categoryKm: "ចិត្តវិទ្យាវិជ្ជាជីវៈស្តង់ដារ",
    descEn: "Anchored in John Holland validated 6-dimensional framework, measuring your authentic natural affinity for real day-to-day vocational tasks to prevent major dropouts.",
    descKm: "ផ្អែកលើទ្រឹស្តីចិត្តវិទ្យាអាជីព ៦ វិមាត្ររបស់លោក John Holland ដែលឆ្លុះបញ្ចាំងពីចំណាប់អារម្មណ៍ពិតប្រាកដ និងការចូលចិត្តការងារប្រចាំថ្ងៃ ដើម្បីការពារកុំឱ្យផ្លាស់ប្តូរជំនាញពាក់កណ្តាលទី។",
    icon: Compass,
    color: "#D97706",
    ctaEn: "Explore RIASEC Guide",
    ctaKm: "ស្វែងយល់ពីតេស្ត RIASEC",
    href: "/riasec",
    proofEn: "6 vocational dimensions • 30 localized question items",
    proofKm: "វិមាត្រ ៦ • ៣០ សំណួរជាក់ស្តែងក្នុងបរិបទកម្ពុជា",
  },
  {
    number: "02",
    weight: "25%",
    titleEn: "16-Personality Cognitive Temperaments",
    titleKm: "បុគ្គលិកលក្ខណៈទាំង ១៦ & របៀបគិត",
    categoryEn: "Myers-Briggs Cognitive Style",
    categoryKm: "រចនាប័ទ្មនៃការគិត & ភាពធន់",
    descEn: "Evaluates cognitive functions, study endurance, and stress resilience across 4 temperament archetypes (Analysts, Diplomats, Sentinels, Explorers).",
    descKm: "វាយតម្លៃលើមុខងារនៃការគិត ៤ ក្រុមធំៗ (អ្នកវិភាគ, អ្នកការទូត, អ្នកការពារ, អ្នករុករក) ដើម្បីយល់ដឹងពីភាពធន់ក្នុងការសិក្សា និងការសហការក្នុងក្រុមការងារ។",
    icon: Sparkles,
    color: "#2563EB",
    ctaEn: "Explore 16 Personalities",
    ctaKm: "ស្វែងយល់បុគ្គលិកលក្ខណៈ",
    href: "/personality",
    proofEn: "4 cognitive temperament clusters • MBTI validated",
    proofKm: "៤ ក្រុមចរិតលក្ខណៈ • ផ្ទៀងផ្ទាត់តាមស្តង់ដារ MBTI",
  },
  {
    number: "03",
    weight: "25%",
    titleEn: "BACII Academic Stream Alignment",
    titleKm: "ភាពត្រូវគ្នានៃថ្នាក់បាក់ឌុប",
    categoryEn: "MoEYS Entrance Prerequisites",
    categoryKm: "លក្ខខណ្ឌតម្រូវសាកលវិទ្យាល័យ",
    descEn: "Cross-validates your Grade 12 Science vs. Social stream against mandatory prerequisite subjects for selective Cambodian university programs.",
    descKm: "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រពិត ឬវិទ្យាសាស្ត្រសង្គម ជាមួយលក្ខខណ្ឌតម្រូវជាកាតព្វកិច្ចនៃមុខវិជ្ជាស្នូលរបស់សាកលវិទ្យាល័យ (RUPP, ITC, CADT)។",
    icon: GraduationCap,
    color: "#059669",
    ctaEn: "Check Stream Prerequisites",
    ctaKm: "ផ្ទៀងផ្ទាត់លក្ខខណ្ឌបាក់ឌុប",
    href: "/bacii",
    proofEn: "Cross-checked with RUPP, ITC Techno & CADT cutoffs",
    proofKm: "ផ្ទៀងផ្ទាត់ពិន្ទុកាត់ និងលក្ខខណ្ឌ RUPP, ITC និង CADT",
  },
  {
    number: "04",
    weight: "20%",
    titleEn: "Cambodian Labor Market Reality",
    titleKm: "ទីផ្សារការងារជាក់ស្តែងនៅកម្ពុជា",
    categoryEn: "Official NEA Salary Data",
    categoryKm: "ទិន្នន័យផ្លូវការពីទីភ្នាក់ងារជាតិមុខរបរ",
    descEn: "Incorporates data from the National Employment Agency (NEA) and growth trends to ensure chosen majors lead to viable, well-compensated employment.",
    descKm: "រួមបញ្ចូលទិន្នន័យពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA) និងកម្រិតប្រាក់ខែជាក់ស្តែង ($600–$2,400+) ដើម្បីធានាឱកាសការងារពិតប្រាកដ។",
    icon: TrendingUp,
    color: "#9333EA",
    ctaEn: "Explore Career Salaries",
    ctaKm: "ពិនិត្យប្រាក់ខែ និងទីផ្សារការងារ",
    href: "/careers",
    proofEn: "Official data from National Employment Agency (NEA)",
    proofKm: "ទិន្នន័យផ្លូវការពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA)",
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    qEn: "How does Futera ensure Cambodian university tuition fees are accurate?",
    qKm: "តើ Futera ធានាភាពត្រឹមត្រូវនៃតម្លៃសិក្សានៅសាកលវិទ្យាល័យដោយរបៀបណា?",
    aEn: "We cross-reference every fee schedule directly with official published admission notices from the Ministry of Education, Youth and Sport (MoEYS) and university registrar offices (RUPP, ITC, CADT, AUPP, Paragon IU, and NUM). Any outdated figure is flagged as pending until re-verified.",
    aKm: "យើងផ្ទៀងផ្ទាត់កាលវិភាគតម្លៃសិក្សាទាំងអស់ដោយផ្ទាល់ជាមួយសេចក្តីជូនដំណឹងផ្លូវការរបស់ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) និងការិយាល័យចុះឈ្មោះរបស់សាកលវិទ្យាល័យ (RUPP, ITC, CADT, AUPP, Paragon IU, និង NUM)។ ទិន្នន័យចាស់ៗត្រូវបានត្រួតពិនិត្យឡើងវិញជានិច្ច។",
  },
  {
    qEn: "Does Futera accept payment to recommend specific universities?",
    qKm: "តើ Futera ទទួលប្រាក់ដើម្បីណែនាំសាកលវិទ្យាល័យណាមួយជាពិសេសឬទេ?",
    aEn: "No, never. Futera operates with strict editorial independence. We do not accept paid placements, sponsored rankings, or promotional sponsorships that influence student recommendations. Recommendations are 100% driven by scientific algorithm fit.",
    aKm: "ដាច់ខាតមិនមានឡើយ! Futera ប្រកាន់ខ្ជាប់នូវភាពឯករាជ្យ និងក្រមសីលធម៌វិជ្ជាជីវៈខ្ពស់បំផុត។ យើងមិនទទួលប្រាក់ឧបត្ថម្ភដើម្បីតម្លើងចំណាត់ថ្នាក់សាកលវិទ្យាល័យណាមួយឡើយ។ ការណែនាំទាំងអស់កើតចេញពីការគណនាបែបវិទ្យាសាស្ត្រសុទ្ធសាធ។",
  },
  {
    qEn: "How can Grade 12 students, teachers, and parents use Futera together?",
    qKm: "តើសិស្សានុសិស្ស លោកគ្រូអ្នកគ្រូ និងអាណាព្យាបាលអាចប្រើប្រាស់ Futera រួមគ្នាដូចម្តេច?",
    aEn: "Futera generates clear, comprehensive diagnostic reports designed to be shared. We encourage students to sit down with high school counselors and parents to review major suitability, 4-year financial budgets, and scholarship opportunities collaboratively.",
    aKm: "Futera បង្កើតរបាយការណ៍លទ្ធផលយ៉ាងច្បាស់លាស់សម្រាប់ចែករំលែក។ យើងលើកទឹកចិត្តឱ្យសិស្សពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូតម្រង់ទិស និងឪពុកម្តាយ ដើម្បីពិនិត្យមើលភាពត្រូវគ្នានៃជំនាញ ថវិកាសិក្សា ៤ ឆ្នាំ និងឱកាសអាហារូបករណ៍រួមគ្នា។",
  },
  {
    qEn: "Is Futera completely free for Cambodian students?",
    qKm: "តើសិស្សានុសិស្សកម្ពុជាអាចប្រើប្រាស់ Futera ដោយឥតគិតថ្លៃពិតប្រាកដមែនទេ?",
    aEn: "Yes, 100% free. All core assessments, personalized recommendations, Cambodian major guides, and university tuition comparison dashboards are freely accessible to every student across all 25 provinces.",
    aKm: "បាទ/ចាស! ឥតគិតថ្លៃ ១០០%។ ការធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង ការណែនាំជំនាញផ្ទាល់ខ្លួន មគ្គុទ្ទេសក៍ជំនាញសិក្សា និងការប្រៀបធៀបតម្លៃសិក្សាសាកលវិទ្យាល័យ គឺបើកចំហសម្រាប់សិស្សានុសិស្សទាំងអស់នៅគ្រប់ខេត្តក្រុងទូទាំងកម្ពុជា។",
  },
];

export default function AboutPage() {
  const { t, language } = useLanguage();
  const [taraTipIndex, setTaraTipIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mascotImgRef = useRef<HTMLDivElement>(null);


  const cycleTaraTip = () => {
    setTaraTipIndex((prev) => (prev + 1) % TARA_ADVICE_TIPS.length);
    if (mascotImgRef.current) {
      gsap.fromTo(
        mascotImgRef.current,
        { scale: 0.9, y: 5 },
        { scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }
      );
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  // GSAP Orchestration with ScrollTrigger + Pinned Horizontal Scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Elements Swift Stagger
      gsap.fromTo(
        ".gsap-hero-anim",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".gsap-hero-mascot-card",
        { scale: 0.94, y: 24, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.75,
          delay: 0.12,
          ease: "back.out(1.5)",
        }
      );

      // Subtle floating mascot breathing loop
      gsap.to(".gsap-mascot-float", {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Bento Stat Cards ScrollTrigger Reveal
      gsap.fromTo(
        ".gsap-stat-card",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-stats-grid",
            start: "top 92%",
            once: true,
          },
        }
      );

      // 3. 4-Pillar Scientific Formula Bar + Staggered Cards Scroll Animation
      const formulaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".gsap-pillars-section",
          start: "top 85%",
          once: true,
        },
      });

      formulaTimeline
        .fromTo(
          ".gsap-formula-bar",
          { y: 24, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        )
        .fromTo(
          ".gsap-formula-seg",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.65, stagger: 0.1, ease: "power2.out" },
          "-=0.25"
        )
        .fromTo(
          ".gsap-pillar-card",
          { y: 30, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .fromTo(
          ".gsap-pillar-cta",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        );

      // 5. FAQ Section ScrollTrigger
      gsap.fromTo(
        ".gsap-faq-container",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-faq-container",
            start: "top 90%",
            once: true,
          },
        }
      );

      // 7. Ethical Commitment Card ScrollTrigger
      gsap.fromTo(
        ".gsap-commitment-card",
        { scale: 0.97, y: 25, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-commitment-card",
            start: "top 92%",
            once: true,
          },
        }
      );

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-28"
    >
      {/* ========================================================= */}
      {/* 1. SIGNATURE FUTERA NAVY HERO WITH SEAMLESS SKYLINE MASK */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white pt-24 pb-32 sm:pb-36 lg:pb-40 px-4 sm:px-6 lg:px-8 select-none">
        {/* Subtle Starlight / Dot Grid Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-32 w-[550px] h-[550px] bg-[#33A474]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-1/3 w-[450px] h-[260px] bg-[#88619A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Seamless Cambodian University Campuses Backdrop (Zero hard cuts) */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-15 h-64 sm:h-72 lg:h-80 z-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt="Cambodian University Campuses Backdrop"
            fill
            unoptimized
            className="object-cover object-bottom"
          />
        </div>

        {/* Soft atmospheric fade at bottom of hero into page canvas */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0F36] to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="gsap-hero-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#F7CE4D] text-xs font-black border border-white/20 shadow-xs uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>{t("aboutPage.heroBadge", "Empowering Cambodian Higher Education")}</span>
              </div>

              {/* Headline */}
              <h1 className="gsap-hero-anim text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] drop-shadow-md">
                {language === "km" ? (
                  <>
                    ជួយសិស្សានុសិស្សកម្ពុជាឱ្យស្វែងយល់ពីខ្លួនឯង និងកំណត់{" "}
                    <span className="text-[#F7CE4D] drop-shadow-sm">អនាគត</span>
                  </>
                ) : (
                  <>
                    Empowering Cambodian Students to Shape Their{" "}
                    <span className="text-[#F7CE4D] drop-shadow-sm">Future</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="gsap-hero-anim text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {t(
                  "aboutPage.heroSubtitle",
                  "Futera bridges high school graduation and higher education with scientific assessments, authentic tuition fees, and transparent career pathways."
                )}
              </p>

              {/* Key Trust Micro-Badges */}
              <div className="gsap-hero-anim flex flex-wrap items-center justify-center lg:justify-start gap-3.5 text-xs font-bold text-slate-200 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free For Students</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F7CE4D]" />
                  <span>Verified MoEYS Data</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                  <span>RIASEC + MBTI Scientific Engine</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="gsap-hero-anim pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/dashboard/assessments/personality"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>{t("aboutPage.startAssessment", "Start Free Assessment")}</span>
                  <ArrowRight className="w-4 h-4 text-[#111965]" />
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 transition-colors duration-200 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{t("aboutPage.exploreMajorsBtn", "Explore University Majors")}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic Interactive Tara Mascot Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="gsap-hero-mascot-card relative p-6 sm:p-8 rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl max-w-sm w-full space-y-4 text-center overflow-hidden cursor-pointer select-none"
                onClick={cycleTaraTip}
                title="Click Tara for guidance advice!"
              >
                <BorderBeam size={220} duration={9} delay={0} borderWidth={1.5} />

                {/* Ambient Golden Radial Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F7CE4D]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Floating Tara Mascot */}
                <div
                  ref={mascotImgRef}
                  className="gsap-mascot-float relative w-36 h-36 sm:w-44 sm:h-44 mx-auto"
                >
                  <Image
                    src="/images/welcome-hd.webp"
                    alt="Tara Futera Mascot"
                    fill
                    sizes="(max-width: 768px) 144px, 176px"
                    className="object-contain drop-shadow-xl"
                    priority
                  />
                </div>

                {/* Interactive Conversational Speech Bubble */}
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7CE4D] text-[#111965] text-xs font-black shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tara Guidance Tip (Click to Rotate)</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed p-4 rounded-2xl bg-[#080D2B]/80 border border-white/15 backdrop-blur-md min-h-[76px] flex items-center justify-center shadow-inner">
                    "{language === "km" ? TARA_ADVICE_TIPS[taraTipIndex].km : TARA_ADVICE_TIPS[taraTipIndex].en}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ELEVATED BENTO PLATFORM METRICS */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20 space-y-16">
        <div className="gsap-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Majors */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F2FA] text-[#111965] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-[#111965]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={50} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statMajors", "Curated Cambodian Majors")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                STEM, AI, Business, & Creative Curricula
              </div>
            </div>
          </div>

          {/* Card 2: Universities */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] text-[#B45309] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6 text-[#B45309]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={6} suffix=" Campuses" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statUniversities", "Verified Universities")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                RUPP, ITC, CADT, AUPP, Paragon, NUM
              </div>
            </div>
          </div>

          {/* Card 3: 100% Tuition Accuracy */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                <NumberTicker value={100} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statTuition", "Verified Tuition Data")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                Cross-referenced with MoEYS admission notices
              </div>
            </div>
          </div>

          {/* Card 4: Scientific Engine */}
          <div className="gsap-stat-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-6 h-6 text-purple-800" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                4 Pillars
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statScience", "Scientific Matching Engine")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                RIASEC + MBTI + Academics + Labor Market
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. THE 4-PILLAR SCIENTIFIC MATCHING ENGINE BREAKDOWN */}
        {/* ========================================================= */}
        <section className="gsap-pillars-section space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-[#111965]" />
              <span>{language === "km" ? "វិធីសាស្ត្រវិទ្យាសាស្ត្រ ៤ សសរស្ដម្ភ" : "The 4-Pillar Scientific Formula"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "ហេតុអ្វីបានជា Futera អាចផ្គូផ្គងជំនាញសិក្សាបានត្រឹមត្រូវ?"
                : "Why Generic Quizzes Fail — And How Futera Solves It"}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed max-w-2xl mx-auto font-medium">
              {language === "km"
                ? "Futera មិនគ្រាន់តែសួរសំណួរទូទៅពីរបីហើយទស្សន៍ទាយនោះទេ។ យើងរួមបញ្ចូល ៤ វិមាត្រវិទ្យាសាស្ត្រផ្សេងៗគ្នា ដើម្បីគណនាភាពស័ក្តិសមបំផុតជាមួយបរិបទកម្ពុជា។"
                : "Most online quizzes ask 5 generic questions and guess. Futera combines 4 distinct scientific dimensions to calculate your genuine academic and career fit with mathematical clarity."}
            </p>
          </div>

          {/* Interactive 100% Mathematical Precision Formula Bar */}
          <div className="gsap-formula-bar max-w-4xl mx-auto p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#111965]">
                <BrainCircuit className="w-4 h-4 text-[#111965]" />
                <span className="text-sm font-black">
                  {language === "km" ? "រូបមន្តផ្គូផ្គង ១០០% បែបវិទ្យាសាស្ត្រ" : "The 100% Scientific Equation"}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-black text-slate-500">
                <span className="text-amber-600">30%</span> + <span className="text-blue-600">25%</span> + <span className="text-emerald-600">25%</span> + <span className="text-purple-600">20%</span> = <span className="text-[#111965] font-black">100% Precision</span>
              </div>
            </div>

            {/* Multi-segment Animated Progress Track */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-1 gap-1.5 shadow-inner">
              <div
                className="gsap-formula-seg h-full bg-amber-500 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 30 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  30% Holland RIASEC Interests
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-blue-600 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 25 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  25% 16-Personality Cognitive Style
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-emerald-500 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 25 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  25% BACII Stream Prerequisite
                </div>
              </div>
              <div
                className="gsap-formula-seg h-full bg-purple-600 rounded-full relative group cursor-pointer transition-transform hover:scale-y-110"
                style={{ flex: 20 }}
              >
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F3D] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                  20% Cambodian Labor Market (NEA)
                </div>
              </div>
            </div>

            {/* Legend Labels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>30% RIASEC</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>25% 16-Personality</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>25% BACII Stream</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>20% NEA Market</span>
              </div>
            </div>
          </div>

          {/* Minimalist 4-Pillar Cards Grid */}
          <div className="gsap-pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {SCIENTIFIC_PILLARS.map((p, idx) => {
              const PillarIcon = p.icon;
              return (
                <div
                  key={idx}
                  className="gsap-pillar-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${p.color}15`, color: p.color }}
                      >
                        <PillarIcon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${p.color}10`,
                          color: p.color,
                          borderColor: `${p.color}30`,
                        }}
                      >
                        {p.weight}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Pillar {p.number} • {language === "km" ? p.categoryKm : p.categoryEn}
                      </span>
                      <h3 className="text-base font-black text-[#111965] leading-snug">
                        {language === "km" ? p.titleKm : p.titleEn}
                      </h3>
                    </div>

                    {/* Concise Summary */}
                    <p className="text-xs text-[#68708A] leading-relaxed font-medium">
                      {language === "km" ? p.descKm : p.descEn}
                    </p>
                  </div>

                  {/* Footer Action Link & Proof */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{language === "km" ? p.proofKm : p.proofEn}</span>
                    </div>

                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold transition-all group-hover:translate-x-1"
                      style={{ color: p.color }}
                    >
                      <span>{language === "km" ? p.ctaKm : p.ctaEn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimalist Diagnostic CTA Banner */}
          <div className="gsap-pillar-cta max-w-4xl mx-auto p-6 sm:p-7 rounded-3xl bg-linear-to-r from-[#111965] to-[#1A2580] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#F7CE4D] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === "km" ? "តេស្តវិទ្យាសាស្ត្រឥតគិតថ្លៃ" : "Free Scientific Assessment"}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {language === "km"
                  ? "ត្រៀមខ្លួនស្វែងរកជំនាញដែលស័ក្តិសមបំផុតហើយឬនៅ?"
                  : "Ready to Discover Your Authentic Academic Fit?"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {language === "km"
                  ? "ចំណាយពេលត្រឹមតែ ១០ នាទី ដើម្បីធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង និងទទួលបានការណែនាំជំនាញសាកលវិទ្យាល័យដែលត្រូវនឹងអ្នក ១០០%។"
                  : "Take our 10-minute validated diagnostic to uncover your RIASEC vocational profile and matched Cambodian university majors."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Link
                href="/assessments"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>{language === "km" ? "មើលតេស្តទាំងអស់" : "View All Assessments"}</span>
              </Link>
              <Link
                href="/dashboard/assessments/riasec"
                className="px-5 py-2.5 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#F5C430] transition-transform active:scale-95 text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{language === "km" ? "ចាប់ផ្តើមធ្វើតេស្ត" : "Start Free Assessment"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE 3D SCROLL STACK (REACT-BITS) */}
      {/* ========================================================= */}
      <section className="w-full relative my-16 lg:my-28 select-none">
        <div className="w-full space-y-10 relative z-20">
          {/* Section Header */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>{language === "km" ? "មាគ៌ា ៥ ជំហានច្បាស់លាស់" : "The 5-Step Pathway"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111965] tracking-tight">
                {t("aboutPage.whyTitle", "How Futera Works for You")}
              </h2>
              <p className="text-sm sm:text-base text-[#68708A] font-medium leading-relaxed">
                {language === "km"
                  ? "ពីការធ្វើតេស្តស្វែងយល់ពីខ្លួនឯង រហូតដល់ការទទួលបានអាហារូបករណ៍ និងការចុះឈ្មោះចូលរៀនដោយទំនុកចិត្ត។"
                  : "A guided journey from authentic self-discovery to confident university enrollment."}
              </p>
            </div>
          </div>

          {/* React-Bits ScrollStack with Window Scroll Binding */}
          <div className="w-full">
            <ScrollStack
              useWindowScroll={true}
              stackPosition="110px"
              itemStackDistance={36}
              itemDistance={380}
              itemScale={0.035}
              baseScale={0.86}
              dimAmount={0.12}
              blurAmount={0}
              tiltAmount={0}
              rotationAmount={0}
              holdDistance={260}
              smoothScroll={false}
              className="w-full max-w-5xl mx-auto"
            >
              {/* Card 01: Self-Discovery Diagnostics */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      01
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ការធ្វើតេស្តវិភាគបុគ្គលិកលក្ខណៈ" : "Diagnostics & Discovery"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Holland RIASEC & 16P</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "១. ធ្វើតេស្តស្វែងយល់ពីខ្លួនឯងតាមបែបវិទ្យាសាស្ត្រ"
                          : "1. Validated Self-Discovery Assessment"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ចំណាយពេលត្រឹម ១០ នាទីដើម្បីស្វែងយល់ពីចំណាប់អារម្មណ៍អាជីព និងបុគ្គលិកលក្ខណៈ ផ្អែកលើស្តង់ដារវិទ្យាសាស្ត្រ RIASEC និង 16P សម្រាប់សិស្សកម្ពុជា។"
                          : "Take a 10-minute validated interest and cognitive evaluation localized specifically for Cambodian students. Uncover your natural thinking style and academic motivation without guesswork."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "សំណួរ ៣០ សម្រិតសម្រាំងជាភាសាខ្មែរ និងអង់គ្លេស" : "30 localized question items in Khmer & English",
                        language === "km" ? "វិភាគចំណាប់អារម្មណ៍ RIASEC និងបុគ្គលិកលក្ខណៈ 16P" : "Validated 6-dimensional vocational psychology",
                        language === "km" ? "ទទួលបានលទ្ធផលភ្លាមៗដោយឥតគិតថ្លៃ" : "100% free with instant personalized archetype"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "លទ្ធផលតេស្តវិជ្ជាជីវៈ" : "Vocational Alignment"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                        {language === "km" ? "ផ្ទៀងផ្ទាត់" : "Verified"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "ស្រាវជ្រាវ (Investigative)" : "Investigative (I)"}</span>
                          <span className="font-mono text-indigo-600 font-bold">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "សិល្បៈ (Artistic)" : "Artistic (A)"}</span>
                          <span className="font-mono text-amber-600 font-bold">78%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{language === "km" ? "សង្គម (Social)" : "Social (S)"}</span>
                          <span className="font-mono text-emerald-600 font-bold">65%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="text-[11px]">
                        <span className="font-bold text-[#111965] block">The Visionary Architect (INTJ)</span>
                        <span className="text-[#68708A] text-[10px]">
                          {language === "km" ? "សមត្ថភាពវិភាគ និងរៀបចំយុទ្ធសាស្ត្រ" : "Analytical & Systems Alignment"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 02: 4-Pillar Algorithmic Matching */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                      02
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ការផ្គូផ្គងជំនាញឆ្លាតវៃ" : "Algorithmic Alignment"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                    <Target className="w-3.5 h-3.5" />
                    <span>4-Pillar Transparent Engine</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "២. វិធីសាស្ត្រផ្គូផ្គងជំនាញ ៤ សសរស្ដម្ភ"
                          : "2. 4-Pillar Algorithmic Matching"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ក្បួនដោះស្រាយគណនាភាពស័ក្តិសម ដោយថ្លឹងថ្លែងរវាងចំណាប់អារម្មណ៍ផ្ទាល់ខ្លួន ថ្នាក់វិទ្យាល័យវិទ្យាសាស្ត្រ/សង្គម បុគ្គលិកលក្ខណៈ និងតម្រូវការទីផ្សារការងារកម្ពុជា។"
                          : "Our engine calculates your genuine academic fit by synthesizing interests (30%), BACII stream (25%), cognitive traits (25%), and real Cambodian economic demand (20%)."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "គណនាទម្ងន់ច្បាស់លាស់ គ្មានការទស្សន៍ទាយលម្អៀង" : "Mathematical formula without black-box guessing",
                        language === "km" ? "ពិនិត្យភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រ/សង្គម និងជំនាញ" : "BACII Science vs. Social stream prerequisite check",
                        language === "km" ? "បង្ហាញពិន្ទុភាពស័ក្តិសមសម្រាប់រាល់ជំនាញ" : "Ranked compatibility scores across all programs"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "រូបមន្តផ្គូផ្គង ៤ សសរស្ដម្ភ" : "Alignment Formula"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        100% Weight
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { label: language === "km" ? "ចំណាប់អារម្មណ៍ RIASEC" : "RIASEC Interests", pct: "30%", color: "bg-amber-500" },
                        { label: language === "km" ? "ថ្នាក់វិទ្យាសាស្ត្រ/សង្គម" : "BACII Stream Prereq", pct: "25%", color: "bg-blue-600" },
                        { label: language === "km" ? "បុគ្គលិកលក្ខណៈ 16P" : "16P Cognitive Style", pct: "25%", color: "bg-indigo-600" },
                        { label: language === "km" ? "តម្រូវការទីផ្សារការងារ NEA" : "Cambodia Market Demand", pct: "20%", color: "bg-emerald-600" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white border border-slate-100">
                          <span className="font-semibold text-slate-700">{item.label}</span>
                          <span className="font-mono font-bold text-[#111965]">{item.pct}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Top Match:</span>
                      <span className="font-bold text-[#111965]">CADT • Computer Science & AI</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 03: Verified Registrar Tuition */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      03
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "សុចរិតភាពទិន្នន័យតម្លៃ" : "Data Integrity & Tuition"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MoEYS & Registrar Portals</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៣. ផ្ទៀងផ្ទាត់សាកលវិទ្យាល័យ និងតម្លៃពិត"
                          : "3. Verified Campus & Real Tuition Data"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ប្រៀបធៀបតម្លៃសិក្សា ៤ ឆ្នាំពេញ និងលក្ខខណ្ឌចូលរៀនផ្លូវការដែលផ្ទៀងផ្ទាត់ផ្ទាល់ពីក្រសួងអប់រំ MoEYS និងការិយាល័យចុះឈ្មោះរបស់សាកលវិទ្យាល័យកំពូលៗ។"
                          : "Directly cross-referenced against official university registrar fee schedules and MoEYS accreditation standards. Compare 4-year total investment costs, laboratory accreditations, and entry cutoffs."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "តម្លៃពិតប្រាកដ គ្មានថ្លៃលាក់បាំង ៤ ឆ្នាំពេញ" : "$0 hidden fees — official 4-year tuition schedules",
                        language === "km" ? "ផ្ទៀងផ្ទាត់ការទទួលស្គាល់ពី MoEYS និងមន្ទីរពិសោធន៍" : "MoEYS accreditation & certified laboratory facilities",
                        language === "km" ? "លក្ខខណ្ឌពិន្ទុ និងនិទ្ទេសបាក់ឌុបជាក់លាក់" : "Grade cutoffs & entry requirements clearly stated"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "កាលវិភាគតម្លៃសិក្សាពិត" : "Verified Campus Tuition"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        2026 Ready
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { name: "RUPP (State)", fee: "$500 - $800 / yr", tag: "State Quota", bg: "bg-blue-50 text-blue-700" },
                        { name: "ITC Techno", fee: "$650 - $900 / yr", tag: "Certified Labs", bg: "bg-amber-50 text-amber-700" },
                        { name: "CADT (Tech)", fee: "$1,200 - $1,800 / yr", tag: "Techo Grants", bg: "bg-indigo-50 text-indigo-700" },
                      ].map((uni, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-[#111965] block">{uni.name}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{uni.fee}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${uni.bg}`}>
                            {uni.tag}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === "km" ? "ផ្ទៀងផ្ទាត់ដោយការិយាល័យចុះឈ្មោះ" : "Cross-referenced with Official Registrar"}</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 04: Scholarship & Financial Aid Tracker */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                      04
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ឱកាសអាហារូបករណ៍រដ្ឋ" : "Financial Support & Grants"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-purple-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>State & Techo Grants</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៤. តាមដានអាហារូបករណ៍រដ្ឋ និងគ្រឹះស្ថាន"
                          : "4. Full-Ride State & Institutional Aid"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ស្វែងរកអាហារូបករណ៍រដ្ឋ ១០០% អាហារូបករណ៍តេជោឌីជីថល CADT និងជំនួយហិរញ្ញវត្ថុផ្លូវការ មុនពេលផុតកំណត់កាលបរិច្ឆេទដាក់ពាក្យ។"
                          : "Identify 100% full-ride state scholarships, CADT Techo Digital Talent awards, and verified institutional grants before deadlines expire. Receive exam guides and checklists."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "ប្រមូលផ្តុំអាហារូបករណ៍ ១០០% និងអាហារូបករណ៍បច្ចេកវិទ្យា" : "100% full-ride state & tech scholarships tracked",
                        language === "km" ? "ការដាស់តឿនកាលបរិច្ឆេទ និងបញ្ជីឯកសារចាំបាច់" : "Real-time deadline countdown & eligibility checks",
                        language === "km" ? "ការណែនាំពីវិញ្ញាសាប្រឡង និងការសម្ភាស" : "Exam preparation guides & past paper tips"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "អាហារូបករណ៍កំពុងបើក" : "Active Scholarships"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                        Live Radar
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111965]">MoEYS National Priority</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            100% Full-Ride
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Grade A/B Priority • 4-Year Full Coverage</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111965]">CADT Techo Digital Talent</span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Tuition + Stipend
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">National Exam Required • Monthly Living Support</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-medium">
                      <span>{language === "km" ? "៣ កម្មវិធីជិតផុតកំណត់:" : "3 Deadlines Closing Soon:"}</span>
                      <span className="font-bold text-amber-900">14 Days Left</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 05: Confident Career Roadmap */}
              <ScrollStackItem itemClassName="min-h-[460px] md:h-[450px] flex flex-col justify-between p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl">
                {/* Top Tab Strip (Visually exposed when stacked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                      05
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {language === "km" ? "ទំនុកចិត្តអនាគត និងគ្រួសារ" : "Future Ready & Family Roadmap"}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>NEA Salary Benchmarks</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 pt-4">
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight leading-snug">
                        {language === "km"
                          ? "៥. កំណត់ទិសដៅអាជីព និងពិភាក្សាជាមួយគ្រួសារ"
                          : "5. NEA Salary Realities & Family Alignment"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed font-medium">
                        {language === "km"
                          ? "ស្វែងយល់ពីកម្រិតប្រាក់បៀវត្សរ៍ជាក់ស្តែងពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ (NEA) និន្នាការទីផ្សារ ៥ ឆ្នាំទៅមុខ និងទាញយករបាយការណ៍ដើម្បីពិភាក្សាជាមួយគ្រួសារ។"
                          : "Review authentic Cambodian salary benchmarks from the National Employment Agency (NEA), 5-year job market forecasts, and generate an executive summary report to share with parents and counselors."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {[
                        language === "km" ? "ទិន្នន័យប្រាក់បៀវត្សរ៍ផ្លូវការពីទីភ្នាក់ងារជាតិ NEA" : "Cambodian NEA official salary range benchmarks",
                        language === "km" ? "ការព្យាករណ៍តម្រូវការទីផ្សារការងាររយៈពេល ៥ ឆ្នាំ" : "5-year sector growth forecasts (AI, Fintech, Engineering)",
                        language === "km" ? "ទាញយករបាយការណ៍សង្ខេបសម្រាប់ពិភាក្សាជាមួយឪពុកម្តាយ" : "One-click shareable diagnostic PDF report for parents"
                      ].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Preview Box */}
                  <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-[#F8FAFD] border border-slate-200/80 rounded-2xl p-5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-[#111965]">
                          {language === "km" ? "ទិន្នន័យប្រាក់បៀវត្សរ៍ NEA" : "NEA Salary Benchmarks"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        Official NEA
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-[#111965] block">Software / AI Engineer</span>
                          <span className="text-slate-500 text-[10px]">High Demand Sector</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">$600 - $2,400+</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-[#111965] block">Data Science & Analytics</span>
                          <span className="text-slate-500 text-[10px]">Rapid Growth Sector</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">$550 - $2,100+</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#111965] to-[#1A2580] text-white flex items-center justify-between text-[11px]">
                      <span className="font-semibold">{language === "km" ? "របាយការណ៍សង្ខេបសម្រាប់គ្រួសារ:" : "Parent Diagnostic Summary:"}</span>
                      <span className="font-mono text-amber-300 font-bold">PDF Ready</span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. METHODOLOGY & DATA INTEGRITY FAQ */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="gsap-faq-container space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
              {language === "km"
                ? "សំណួរញឹកញាប់អំពីទិន្នន័យ និងតម្លាភាព"
                : "Data Authenticity & Ethical FAQ"}
            </h3>
            <p className="text-xs sm:text-sm text-[#68708A]">
              {language === "km"
                ? "តម្លាភាពពេញលេញអំពីរបៀបដែលយើងផ្ទៀងផ្ទាត់តម្លៃសិក្សានៅសាកលវិទ្យាល័យកម្ពុជា និងការណែនាំដោយមិនលម្អៀង។"
                : "Full transparency on how we verify Cambodian university fees and ensure unbiased student guidance."}
            </p>
          </div>

          <div className="space-y-3.5 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#111965] cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span>{language === "km" ? faq.qKm : faq.qEn}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#111965]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#68708A] leading-relaxed border-t border-slate-100 bg-[#F8FAFD]">
                      {language === "km" ? faq.aKm : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. ETHICAL TRANSPARENCY & DATA INTEGRITY COMMITMENT */}
        {/* ========================================================= */}
        <div className="gsap-commitment-card p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#080D2B] via-[#0F1754] to-[#111965] text-white shadow-2xl space-y-6 border border-white/10 relative overflow-hidden">
          <BorderBeam size={300} duration={12} delay={0} borderWidth={1.5} />

          <div className="flex items-center gap-2 text-xs font-black text-[#F7CE4D] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-[#F7CE4D]" />
            <span>Ethical Guidance Commitment</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {t("aboutPage.commitment", "Our Promise to Cambodian Students & Families")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl font-medium">
            {language === "km"
              ? "ការធ្វើតេស្តនៅលើ Futera ត្រូវបានរចនាឡើងដើម្បីជំរុញការស្វែងយល់ និងការពិចារណាដោយផ្អែកលើព័ត៌មានជាក់ស្តែង មិនមែនជាការបង្ខិតបង្ខំវាសនាជីវិតរបស់សិស្សឡើយ។ យើងលើកទឹកចិត្តយ៉ាងមុតមាំឱ្យសិស្សានុសិស្សយកលទ្ធផលណែនាំរបស់ Futera ទៅពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូវិទ្យាល័យ ទីប្រឹក្សាអាជីព និងសមាជិកគ្រួសារ ដើម្បីធ្វើការសម្រេចចិត្តរួមគ្នាប្រកបដោយទំនុកចិត្ត។"
              : "Futera assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their Futera recommendations with high school teachers, university counselors, and family members to make confident, well-rounded decisions."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
            >
              <span>{t("aboutPage.tryAssessments", "Start Your Journey")}</span>
              <ArrowRight className="w-4 h-4 text-[#111965]" />
            </Link>

            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 transition-colors duration-200 cursor-pointer"
            >
              <School className="w-4 h-4 text-[#F7CE4D]" />
              <span>Explore Verified Universities</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
