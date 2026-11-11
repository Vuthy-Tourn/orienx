"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Building2,
  HeartHandshake,
  Users,
  Search,
  Scale,
  DollarSign,
  TrendingUp,
  Cpu,
  BarChart3,
  HardHat,
  ChevronDown,
  Layers,
  HelpCircle,
  FileCheck,
  Check,
  Briefcase,
  Target,
  School,
  BadgeCheck,
} from "lucide-react";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";

// 6 Holland RIASEC Framework details for interactive exploration
const RIASEC_DEEP_DATA: Record<string, {
  nameEn: string;
  nameKm: string;
  taglineEn: string;
  taglineKm: string;
  icon: any;
  themeColor: string;
  badgeBg: string;
  borderActive: string;
  strengths: string[];
  sampleMajors: { name: string; slug: string }[];
  sampleCareers: string[];
}> = {
  R: {
    nameEn: "Realistic (The Practical Builder)",
    nameKm: "ជាក់ស្តែង (អ្នកអនុវត្តជាក់ស្តែង)",
    taglineEn: "Tangible problem-solving with tools, infrastructure, mechanics, and physical systems.",
    taglineKm: "ការដោះស្រាយបញ្ហាជាក់ស្តែងលើសម្ភារ រចនាសម្ព័ន្ធ មេកានិច និងប្រព័ន្ធរូបវន្ត។",
    icon: HardHat,
    themeColor: "#D97706",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    borderActive: "border-amber-400",
    strengths: ["Spatial Reasoning", "Practical Troubleshooting", "Physical Precision", "Mechanical Aptitude"],
    sampleMajors: [
      { name: "Civil Engineering", slug: "civil-engineering" },
      { name: "Architecture", slug: "architecture" },
    ],
    sampleCareers: ["Structural Civil Engineer", "BIM Specialist", "Construction Project Lead"],
  },
  I: {
    nameEn: "Investigative (The Analytical Thinker)",
    nameKm: "ស្រាវជ្រាវ (អ្នកវិភាគ និងគិតស៊ីជម្រៅ)",
    taglineEn: "Intellectual inquiry, mathematical modeling, algorithm design, and scientific exploration.",
    taglineKm: "ការស្រាវជ្រាវបែបបញ្ញា ម៉ូដែលគណិតវិទ្យា ក្បួនដោះស្រាយ និងការស្វែងយល់វិទ្យាសាស្ត្រ។",
    icon: BrainCircuit,
    themeColor: "#2563EB",
    badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
    borderActive: "border-blue-400",
    strengths: ["Algorithmic Logic", "Data Analysis", "Abstract Modeling", "Hypothesis Testing"],
    sampleMajors: [
      { name: "Software Engineering & Computer Science", slug: "software-engineering" },
      { name: "Data Science & AI", slug: "data-science-ai" },
      { name: "Cybersecurity", slug: "cybersecurity" },
    ],
    sampleCareers: ["Full-Stack Software Engineer", "AI/ML Scientist", "Cyber Defense Analyst"],
  },
  A: {
    nameEn: "Artistic (The Creative Innovator)",
    nameKm: "សិល្បៈ (អ្នកច្នៃប្រឌិត និងការរចនា)",
    taglineEn: "Creative intuition, aesthetic composition, digital product design, and creative media.",
    taglineKm: "ការច្នៃប្រឌិតសោភ័ណភាព ការរចនាផលិតផលឌីជីថល UI/UX និងប្រព័ន្ធផ្សព្វផ្សាយ។",
    icon: Sparkles,
    themeColor: "#9333EA",
    badgeBg: "bg-purple-50 text-purple-900 border-purple-200",
    borderActive: "border-purple-400",
    strengths: ["Visual Aesthetics", "User Empathy", "Conceptual Ideation", "Creative Storytelling"],
    sampleMajors: [
      { name: "Digital Marketing & Media", slug: "digital-marketing" },
      { name: "Architecture & Design", slug: "architecture" },
    ],
    sampleCareers: ["UI/UX Product Designer", "Creative Brand Director", "Digital Media Producer"],
  },
  S: {
    nameEn: "Social (The Empathetic Helper)",
    nameKm: "សង្គម (អ្នកជួយ និងអភិវឌ្ឍមនុស្ស)",
    taglineEn: "Human relationships, educational pedagogy, community development, and collaborative guidance.",
    taglineKm: "ទំនាក់ទំនងរវាងមនុស្ស ការអប់រំ ការអភិវឌ្ឍសហគមន៍ និងការតម្រង់ទិសប្រកបដោយការយល់ចិត្ត។",
    icon: HeartHandshake,
    themeColor: "#059669",
    badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-200",
    borderActive: "border-emerald-400",
    strengths: ["Interpersonal Communication", "Active Listening", "Mentorship", "Community Engagement"],
    sampleMajors: [
      { name: "International Relations", slug: "international-relations" },
      { name: "Education & Psychology", slug: "social-sciences" },
    ],
    sampleCareers: ["Diplomatic Affairs Officer", "University Counselor", "NGO Program Coordinator"],
  },
  E: {
    nameEn: "Enterprising (The Strategic Leader)",
    nameKm: "សហគ្រិន (អ្នកដឹកនាំ និងយុទ្ធសាស្ត្រ)",
    taglineEn: "Organizational vision, startup commercialization, project leadership, and negotiation.",
    taglineKm: "ចក្ខុវិស័យស្ថាប័ន ពាណិជ្ជកម្ម ការដឹកនាំគម្រោង និងការចរចាធុរកិច្ច។",
    icon: Award,
    themeColor: "#EA580C",
    badgeBg: "bg-orange-50 text-orange-900 border-orange-200",
    borderActive: "border-orange-400",
    strengths: ["Strategic Persuasion", "Risk Management", "Public Speaking", "Executive Decision Making"],
    sampleMajors: [
      { name: "Business Administration & Management", slug: "business-administration" },
      { name: "Banking & Finance", slug: "banking-finance" },
    ],
    sampleCareers: ["FinTech Product Manager", "Management Consultant", "Startup Founder"],
  },
  C: {
    nameEn: "Conventional (The Systems Organizer)",
    nameKm: "ការិយាល័យ (អ្នករៀបរយ និងប្រព័ន្ធទិន្នន័យ)",
    taglineEn: "Structured accuracy, institutional compliance, financial accounting, and orderly workflows.",
    taglineKm: "ភាពត្រឹមត្រូវនៃប្រព័ន្ធ ការអនុលោមតាមច្បាប់ គណនេយ្យហិរញ្ញវត្ថុ និងលំហូរការងាររៀបរយ។",
    icon: FileCheck,
    themeColor: "#475569",
    badgeBg: "bg-slate-100 text-slate-900 border-slate-300",
    borderActive: "border-slate-400",
    strengths: ["Data Integrity", "Quality Assurance", "Regulatory Audit", "Systematic Organization"],
    sampleMajors: [
      { name: "Banking & Finance", slug: "banking-finance" },
      { name: "Law & Public Policy", slug: "law" },
    ],
    sampleCareers: ["Financial Compliance Auditor", "Credit Risk Analyst", "Corporate Legal Counsel"],
  },
};

// Conversational Tara mascot advice tips
const TARA_ADVICE_TIPS = [
  {
    km: "ជ្រើសរើសជំនាញសិក្សា ត្រូវផ្អែកលើចំណុចខ្លាំងជាក់ស្តែង និងទីផ្សារការងារ មិនមែនគ្រាន់តែតាមមិត្តភក្តិឡើយ!",
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

export default function AboutPage() {
  const { t, language, getLocalized } = useLanguage();
  const [selectedRiasecCode, setSelectedRiasecCode] = useState<string>("I");
  const [taraTipIndex, setTaraTipIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeRiasec = RIASEC_DEEP_DATA[selectedRiasecCode] || RIASEC_DEEP_DATA["I"];
  const RiasecIcon = activeRiasec.icon;

  const cycleTaraTip = () => {
    setTaraTipIndex((prev) => (prev + 1) % TARA_ADVICE_TIPS.length);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-28">
      {/* ========================================================= */}
      {/* 1. SIGNATURE FUTERA NAVY HERO WITH SUBTLE AMBIENT SKYLINE */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white pt-20 pb-28 sm:pb-36 lg:pb-40 px-4 sm:px-6 lg:px-8 select-none">
        {/* Subtle Starlight / Dot Grid Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#33A474]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[250px] bg-[#88619A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Seamless Cambodian University Campuses Landmark Backdrop */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-10 h-64 sm:h-72 lg:h-80 z-0">
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt="Cambodian University Campuses Backdrop"
            fill
            unoptimized
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F36] via-transparent to-[#080D2B]/80" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#F7CE4D] text-xs font-black border border-white/20 shadow-xs uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>{t("aboutPage.heroBadge", "Empowering Cambodian Higher Education")}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {t("aboutPage.heroTitle", "Empowering Cambodian Students to Discover Their True Direction")}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {t("aboutPage.heroSubtitle", "Futera combines scientific vocational psychology with verified Cambodian university data, transparent tuition, and holistic AI matching to help Grade 12 students choose the right future.")}
              </p>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/dashboard/assessments/personality"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>{t("aboutPage.startAssessment", "Take Free Assessment")}</span>
                  <ArrowRight className="w-4 h-4 text-[#111965]" />
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{t("aboutPage.exploreMajorsBtn", "Explore Majors")}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic Interactive Tara Mascot Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={cycleTaraTip}
                className="relative p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl max-w-sm w-full space-y-4 text-center overflow-hidden cursor-pointer group select-none"
                title="Click Tara for guidance tips"
              >
                <BorderBeam size={200} duration={10} delay={0} borderWidth={1.5} />

                {/* Subtle Mascot Radial Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F7CE4D]/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/images/welcome-hd.webp"
                    alt="Tara Futera Mascot"
                    fill
                    className="object-contain drop-shadow-lg"
                    priority
                  />
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7CE4D] text-[#111965] text-xs font-black shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tara Guidance Tip (Click to Rotate)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed p-3.5 rounded-2xl bg-[#080D2B]/60 border border-white/15 backdrop-blur-sm min-h-[72px] flex items-center justify-center">
                    "{language === "km" ? TARA_ADVICE_TIPS[taraTipIndex].km : TARA_ADVICE_TIPS[taraTipIndex].en}"
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ELEVATED BENTO PLATFORM HIGHLIGHTS */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20 space-y-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Majors */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F2FA] text-[#111965] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-[#111965]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={6} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#171A2C]">
                {t("aboutPage.statMajors", "Curated Cambodian Majors")}
              </div>
              <div className="text-[11px] text-[#68708A] leading-relaxed">
                STEM, Business, and High-Growth Curricula
              </div>
            </div>
          </div>

          {/* Card 2: Universities */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] text-[#B45309] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-[#B45309]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#111965] tracking-tight">
                <NumberTicker value={6} />
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
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
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
                Cross-referenced with MoEYS published notices
              </div>
            </div>
          </div>

          {/* Card 4: Scientific Engine */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
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
                RIASEC + MBTI + Academics + Market demand
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE HOLLAND RIASEC 6-DIMENSION VISUALIZER */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-black">
                <Compass className="w-3.5 h-3.5 text-[#111965]" />
                <span>Interactive Psychological Science Explorer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
                Explore the Holland RIASEC Vocational Dimensions
              </h2>
              <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                Click any of the 6 core vocational work styles to inspect its cognitive profile, matching Cambodian majors, and career outcomes:
              </p>
            </div>

            <Link
              href="/dashboard/assessments/riasec"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs hover:shadow-md transition-all self-start md:self-auto cursor-pointer"
            >
              <span>Take RIASEC Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6 RIASEC Segmented Dock */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.entries(RIASEC_DEEP_DATA).map(([code, info]) => {
              const isSelected = selectedRiasecCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedRiasecCode(code)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "bg-[#111965] text-white border-[#111965] shadow-md ring-2 ring-[#111965]/20 scale-[1.02]"
                      : "bg-[#F8FAFD] text-[#171A2C] border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        isSelected ? "bg-white/20 text-[#F7CE4D]" : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {code}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: info.themeColor }}
                    />
                  </div>

                  <div className="text-sm font-black mt-2 truncate">
                    {language === "km" ? info.nameKm.split(" ")[0] : info.nameEn.split(" ")[0]}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? "text-slate-300" : "text-[#68708A]"
                    }`}
                  >
                    {info.taglineEn.split(",")[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Details Card (Elevated Holo-Pedestal) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRiasecCode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#F8FAFD] border-2 border-slate-200 space-y-6 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs flex-shrink-0"
                    style={{ color: activeRiasec.themeColor }}
                  >
                    <RiasecIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#68708A] uppercase tracking-wider block">
                      RIASEC Dimension Profile • Code {selectedRiasecCode}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#111965]">
                      {language === "km" ? activeRiasec.nameKm : activeRiasec.nameEn}
                    </h3>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${activeRiasec.badgeBg} self-start sm:self-auto`}
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Vocational Psychology Standard</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#171A2C] font-semibold leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                {language === "km" ? activeRiasec.taglineKm : activeRiasec.taglineEn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* 1. Core Cognitive Strengths */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                    Core Cognitive Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#171A2C]">
                    {activeRiasec.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 stroke-[3]" />
                        <span className="font-medium">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Aligned Cambodian Majors */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                    Aligned Cambodian Majors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRiasec.sampleMajors.map((m) => (
                      <Link
                        key={m.slug}
                        href={`/majors/${m.slug}`}
                        className="px-3 py-1.5 rounded-xl bg-[#F0F2FA] text-xs font-bold text-[#111965] hover:bg-[#E2E6F5] hover:translate-x-0.5 transition-all inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>{m.name}</span>
                        <ArrowRight className="w-3 h-3 text-[#111965]" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. Target Career Roles */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-black text-[#111965] uppercase tracking-wider block">
                    Target Career Roles
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#171A2C]">
                    {activeRiasec.sampleCareers.map((car, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                        <span className="font-medium">{car}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* 4. STEP-BY-STEP PATHWAY ("HOW FUTERA WORKS FOR YOU") */}
        {/* ========================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-[#111965]" />
              <span>Step-by-Step Pathway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
              How Futera Works for You
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              From self-discovery to confident enrollment in your dream university program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 relative group">
              <div className="w-11 h-11 rounded-2xl bg-[#111965] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-base font-black text-[#111965]">
                {t("aboutPage.step1Title", "Self-Discovery Diagnostics")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step1Desc", "Complete the RIASEC interest assessment and 16-personality cognitive test designed specifically for Cambodian students.")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 relative group">
              <div className="w-11 h-11 rounded-2xl bg-[#111965] text-[#F7CE4D] flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-base font-black text-[#111965]">
                {t("aboutPage.step2Title", "4-Pillar Algorithmic Matching")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step2Desc", "Our engine integrates your interests (30%), academics (25%), cognitive style (25%), and Cambodian market demand (20%).")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFD] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 relative group">
              <div className="w-11 h-11 rounded-2xl bg-[#111965] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-base font-black text-[#111965]">
                {t("aboutPage.step3Title", "Verified University Enrollment")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step3Desc", "Compare verified 4-year tuition fees, admission requirements, and 100% full-tuition scholarship opportunities across Cambodia.")}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. METHODOLOGY & DATA INTEGRITY FAQ */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-[#111965] tracking-tight">
              Data Authenticity & Ethical FAQ
            </h3>
            <p className="text-xs sm:text-sm text-[#68708A]">
              Full transparency on how we verify Cambodian university fees and ensure unbiased student guidance.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              {
                q: "How does Futera ensure university tuition fees are accurate?",
                a: "We cross-reference every fee schedule directly with official published admission notices from the Ministry of Education, Youth and Sport (MoEYS) and university registrar offices (RUPP, ITC, CADT, AUPP, Paragon IU, and NUM). Any outdated figure is flagged as pending until re-verified.",
              },
              {
                q: "Does Futera favor private universities that sponsor programs?",
                a: "No. Futera does not accept paid placements to bias recommendations. Public state universities and private institutions are assessed with equal objectivity based entirely on academic alignment with the student's self-reported strengths.",
              },
              {
                q: "Can high school teachers and parents use Futera together?",
                a: "Yes! We actively design our diagnostic reports to be shared in conversations between Grade 12 students, school counselors, and parents to guide confident decisions together.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#111965] cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#111965]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 text-xs text-[#68708A] leading-relaxed border-t border-slate-100 bg-[#F8FAFD]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. ETHICAL TRANSPARENCY & DATA INTEGRITY COMMITMENT */}
        {/* ========================================================= */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0A0F3D] via-[#111965] to-[#1E277A] text-white shadow-xl space-y-5 border border-[#111965]/40 relative overflow-hidden">
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t("aboutPage.tryAssessments", "Start Your Journey")}</span>
              <ArrowRight className="w-4 h-4 text-[#111965]" />
            </Link>

            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
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
