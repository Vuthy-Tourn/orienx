"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
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
  ChevronRight,
  ChevronDown,
  Layers,
  HelpCircle,
  ShieldCheck,
  BrainCircuit,
  Search,
} from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Verified Cambodian Universities featured on landing
  const featuredUniversities = [
    {
      slug: "rupp",
      nameEn: "Royal University of Phnom Penh (RUPP)",
      nameKm: "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ",
      type: "PUBLIC",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ" : "Public State University",
      tuition: "$250 – $500 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "ផ្តល់អាហារូបករណ៍រដ្ឋ ១០០% សម្រាប់សិស្សបាក់ឌុបឆ្នើម" : "100% State Scholarships for top BacII rankers",
      majorsCount: "35+ Majors",
    },
    {
      slug: "itc",
      nameEn: "Institute of Technology of Cambodia (Techno)",
      nameKm: "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)",
      type: "PUBLIC",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ" : "Public Premier Engineering",
      tuition: "$600 – $800 / year",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "សញ្ញាបត្រវិស្វករជាតិ និងស្តង់ដារអន្តរជាតិ CTI" : "National Engineer & CTI International Accreditation",
      majorsCount: "20+ Engineering Programs",
    },
    {
      slug: "aupp",
      nameEn: "American University of Phnom Penh (AUPP)",
      nameKm: "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ",
      type: "PRIVATE",
      typeLabel: language === "km" ? "សាកលវិទ្យាល័យឯកជន" : "Private International",
      tuition: "$6,000 / year (Single) • $9,000 / year (Dual US)",
      location: language === "km" ? "រាជធានីភ្នំពេញ" : "Phnom Penh",
      highlight: language === "km" ? "សញ្ញាបត្រទ្វេភាគីជាមួយសាកលវិទ្យាល័យនៅអាមេរិក (Univ of Arizona)" : "Dual Degree with University of Arizona",
      majorsCount: "12+ Programs",
    },
  ];

  const featuredMajors = [
    {
      titleEn: "Software Engineering & Computer Science",
      titleKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ និងវិស្វកម្មកម្មវិធី",
      category: "Information Technology",
      riasec: "IRE",
      personality: "INTJ, INTP",
      descEn: "Build full-stack web and mobile systems, cloud infrastructure, and software applications.",
      descKm: "អភិវឌ្ឍប្រព័ន្ធកម្មវិធីកុំព្យូទ័រ កម្មវិធីទូរស័ព្ទដៃ និងហេដ្ឋារចនាសម្ព័ន្ធពពក។",
      salaryEn: "$500 – $2,500+ / mo",
      slug: "software-engineering",
    },
    {
      titleEn: "Business Administration & Management",
      titleKm: "រដ្ឋបាលពាណិជ្ជកម្ម និងការគ្រប់គ្រង",
      category: "Business & Economics",
      riasec: "ECS",
      personality: "ENTJ, ESTJ",
      descEn: "Develop organizational leadership, corporate strategic planning, and modern enterprise management.",
      descKm: "បណ្តុះបណ្តាលភាពជាអ្នកដឹកនាំស្ថាប័ន យុទ្ធសាស្ត្រធុរកិច្ច និងការគ្រប់គ្រងសហគ្រាសទំនើប។",
      salaryEn: "$400 – $2,000+ / mo",
      slug: "business-administration",
    },
    {
      titleEn: "Civil Engineering & Structural Design",
      titleKm: "វិស្វកម្មសំណង់ស៊ីវិល",
      category: "Engineering",
      riasec: "RIC",
      personality: "ISTP, ESTJ",
      descEn: "Plan, design, and supervise infrastructure: bridges, roads, high-rise buildings, and structural systems.",
      descKm: "រៀបចំផែនការ គណនាគ្រឿងផ្គុំ និងត្រួតពិនិត្យការសាងសង់ស្ពាន ថ្នល់ និងអគារទំនើប។",
      salaryEn: "$450 – $2,200+ / mo",
      slug: "civil-engineering",
    },
  ];

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
          1. HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F2FA] via-[#F5F6FA] to-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E6E8F0]">
        {/* Subtle Architectural Dot Pattern */}
        <DotPattern className="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contextual Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E8F0] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#111965] animate-pulse" />
                <span className="text-xs font-semibold text-[#111965]">
                  {t("hero.badge")}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111965] tracking-tight leading-[1.2]">
                {t("hero.title")}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#68708A] leading-relaxed max-w-2xl">
                {t("hero.subtitle")}
              </p>

              {/* CTAs with Magic UI ShimmerButton */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/register" className="inline-block">
                  <ShimmerButton
                    shimmerColor="#F7CE4D"
                    background="#111965"
                    className="font-bold text-sm sm:text-base text-white shadow-md w-full sm:w-auto"
                  >
                    <span>{t("hero.ctaPrimary")}</span>
                    <ArrowRight className="w-4 h-4 ml-2 inline text-[#F7CE4D]" />
                  </ShimmerButton>
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-[#111965] bg-white hover:bg-slate-50 border-2 border-[#E6E8F0] shadow-2xs transition-all duration-200"
                >
                  <Compass className="w-4 h-4 text-[#111965]" />
                  <span>{t("hero.ctaSecondary")}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E6E8F0]/80 grid grid-cols-3 gap-4 text-xs font-medium text-[#68708A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{language === "km" ? "ផ្ទៀងផ្ទាត់សាកលវិទ្យាល័យ" : "Verified University Info"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{language === "km" ? "តេស្តវិទ្យាសាស្ត្រច្បាស់លាស់" : "Holland & MBTI Engine"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{language === "km" ? "ឥតគិតថ្លៃសម្រាប់សិស្ស" : "100% Free For Students"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Recommendation Preview Card with Aceternity BorderBeam */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background decorative frame */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#111965]/10 via-[#F7CE4D]/20 to-transparent blur-sm" />

                <div className="relative rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-7 shadow-lg space-y-5 overflow-hidden">
                  {/* Magic UI Border Beam */}
                  <BorderBeam size={220} duration={12} delay={9} colorFrom="#F7CE4D" colorTo="#111965" />
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-[#111965] uppercase tracking-wider">
                        {language === "km" ? "លទ្ធផលគំរូរបស់សិស្ស" : "Sample Student Profile"}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      94% Match Fit
                    </span>
                  </div>

                  {/* Sample Personality & RIASEC summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-semibold">Personality</div>
                      <div className="text-base font-bold text-[#111965] mt-0.5">INTJ</div>
                      <div className="text-[11px] text-[#68708A]">{language === "km" ? "ស្ថាបត្យករយុទ្ធសាស្ត្រ" : "Strategic Architect"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-semibold">Holland Code</div>
                      <div className="text-base font-bold text-[#111965] mt-0.5">I - R - E</div>
                      <div className="text-[11px] text-[#68708A]">{language === "km" ? "ស្រាវជ្រាវ និងបច្ចេកទេស" : "Investigative & Realistic"}</div>
                    </div>
                  </div>

                  {/* Top Match Result Card */}
                  <div className="p-4 rounded-xl border-2 border-[#111965] bg-[#F0F2FA] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111965] uppercase tracking-wide">
                        #1 Top Recommendation
                      </span>
                      <span className="text-xs font-bold text-[#111965]">94%</span>
                    </div>
                    <h4 className="text-base font-bold text-[#111965]">
                      {language === "km" ? "វិទ្យាសាស្ត្រកុំព្យូទ័រ និងវិស្វកម្មកម្មវិធី" : "Software Engineering & Computer Science"}
                    </h4>
                    <p className="text-xs text-[#68708A] leading-relaxed">
                      {language === "km"
                        ? "ត្រូវគ្នាយ៉ាងខ្លាំងនឹងចំណុចខ្លាំងផ្នែកគណិតវិទ្យា និងចំណាប់អារម្មណ៍កម្រិតខ្ពស់លើការដោះស្រាយបញ្ហាបច្ចេកវិទ្យា។"
                        : "Direct alignment with your Mathematics strengths and high Investigative interest in technical problem solving."}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-medium text-[#111965]">
                      <span>{language === "km" ? "សាកលវិទ្យាល័យដែលផ្តល់ការបង្រៀន:" : "Available At:"}</span>
                      <span className="font-semibold">RUPP, ITC, AUPP, Paragon</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/assessments/personality"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#111965] hover:bg-[#1E277A] transition-colors"
                  >
                    <span>{language === "km" ? "សាកល្បងធ្វើតេស្តឥតគិតថ្លៃ" : "Try Free Assessment Now"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          IMPACT BENCHMARK NUMBERS (MAGIC UI NUMBER TICKER)
          ===================================================================== */}
      <section className="bg-white py-10 border-b border-[#E6E8F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Stat 1 */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#111965] flex items-center justify-center">
                <NumberTicker value={5} />
                <span className="text-[#F7CE4D]">+</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#171A2C]">
                {language === "km" ? "សាកលវិទ្យាល័យឈានមុខ" : "Verified Universities"}
              </div>
              <p className="text-[11px] text-[#68708A]">RUPP, ITC, AUPP, Paragon, NUM</p>
            </div>

            {/* Stat 2 */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#111965] flex items-center justify-center">
                <NumberTicker value={6} />
                <span className="text-[#F7CE4D]">+</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#171A2C]">
                {language === "km" ? "ជំនាញសិក្សាតម្រូវការខ្ពស់" : "High-Demand Majors"}
              </div>
              <p className="text-[11px] text-[#68708A]">STEM, Business & Diplomacy</p>
            </div>

            {/* Stat 3 */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#111965] flex items-center justify-center">
                <span className="text-[#F7CE4D] mr-0.5">$</span>
                <NumberTicker value={250} />
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#171A2C]">
                {language === "km" ? "តម្លៃសិក្សាចាប់ផ្តើម" : "Starting Tuition / Yr"}
              </div>
              <p className="text-[11px] text-[#68708A]">{language === "km" ? "តម្លៃពិតជាក់ស្តែង" : "Fact-Verified Tuition"}</p>
            </div>

            {/* Stat 4 */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#111965] flex items-center justify-center">
                <NumberTicker value={100} />
                <span className="text-[#F7CE4D]">%</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#171A2C]">
                {language === "km" ? "តម្លាភាពក្នុងការវិភាគ" : "Transparent Logic"}
              </div>
              <p className="text-[11px] text-[#68708A]">{language === "km" ? "គ្មានការលម្អៀង" : "Explainable Guidance"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. HOW FUTERA WORKS (4 STEPS)
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-white border-b border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {t("howItWorks.title")}
            </h2>
            <p className="text-sm sm:text-base text-[#68708A]">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3 relative group hover:border-[#111965] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#111965] text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("howItWorks.step1Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("howItWorks.step1Desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3 relative group hover:border-[#111965] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#111965] text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("howItWorks.step2Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("howItWorks.step2Desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3 relative group hover:border-[#111965] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#111965] text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("howItWorks.step3Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("howItWorks.step3Desc")}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3 relative group hover:border-[#111965] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#111965] text-white flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("howItWorks.step4Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("howItWorks.step4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FEATURED MAJORS PREVIEW
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#F5F6FA] border-b border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
                {language === "km" ? "ជំនាញសាកលវិទ្យាល័យដែលពេញនិយម" : "Explore University Majors"}
              </h2>
              <p className="text-sm text-[#68708A]">
                {language === "km"
                  ? "ស្វែងយល់ពីមុខវិជ្ជាសិក្សា ជំនាញដែលត្រូវការ និងឱកាសការងារជាក់ស្តែងនៅកម្ពុជា។"
                  : "Discover curricula, required foundational skills, and career opportunities in Cambodia."}
              </p>
            </div>
            <Link
              href="/majors"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111965] hover:text-[#1E277A]"
            >
              <span>{language === "km" ? "មើលជំនាញទាំងអស់" : "View All Majors"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMajors.map((m) => (
              <div
                key={m.slug}
                className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                      {m.category}
                    </span>
                    <span className="text-[11px] font-bold text-[#68708A]">
                      RIASEC: {m.riasec}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {language === "km" ? m.titleKm : m.titleEn}
                  </h3>

                  <p className="text-xs text-[#68708A] leading-relaxed">
                    {language === "km" ? m.descKm : m.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#68708A] uppercase font-semibold">
                      {language === "km" ? "កម្រិតប្រាក់បៀវត្ស" : "Salary Range"}
                    </div>
                    <div className="text-xs font-bold text-emerald-700">{m.salaryEn}</div>
                  </div>
                  <Link
                    href={`/majors/${m.slug}`}
                    className="p-2 rounded-lg text-[#111965] hover:bg-[#F0F2FA] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CAMBODIAN UNIVERSITIES (VERIFIED PRICING)
          ===================================================================== */}
      <section className="py-16 lg:py-24 bg-white border-b border-[#E6E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("universitiesSection.verifiedNotice")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
                {t("universitiesSection.title")}
              </h2>
              <p className="text-sm text-[#68708A]">
                {t("universitiesSection.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/universities/compare?ids=rupp,itc,aupp"
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs transition-colors"
              >
                {t("universitiesSection.compare")}
              </Link>
              <Link
                href="/universities"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111965] bg-slate-50 hover:bg-slate-100 border border-[#E6E8F0] transition-colors"
              >
                {t("universitiesSection.viewDirectory")}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredUniversities.map((uni) => (
              <div
                key={uni.slug}
                className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        uni.type === "PUBLIC"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {uni.typeLabel}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#68708A]">
                      <MapPin className="w-3 h-3 text-[#111965]" />
                      <span>{uni.location}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {language === "km" ? uni.nameKm : uni.nameEn}
                  </h3>

                  <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                    <div className="text-[10px] text-[#68708A] uppercase font-bold">
                      {language === "km" ? "តម្លៃសិក្សាប្រចាំឆ្នាំ (ផ្ទៀងផ្ទាត់)" : "Verified Annual Tuition"}
                    </div>
                    <div className="text-sm font-extrabold text-[#111965]">
                      {uni.tuition}
                    </div>
                  </div>

                  <p className="text-xs text-[#68708A] leading-relaxed">
                    {uni.highlight}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111965]">
                    {uni.majorsCount}
                  </span>
                  <Link
                    href={`/universities/${uni.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#111965] hover:text-[#1E277A]"
                  >
                    <span>{t("common.viewDetails")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
