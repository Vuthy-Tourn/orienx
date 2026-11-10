"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { AccordionItem } from "@/components/ui/accordion";

// 6 Holland RIASEC Framework details for interactive exploration
const RIASEC_DEEP_DATA: Record<string, {
  nameEn: string;
  nameKm: string;
  taglineEn: string;
  taglineKm: string;
  icon: any;
  color: { badge: string; border: string; bg: string };
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
    color: { badge: "bg-amber-100 text-amber-950", border: "border-amber-300", bg: "bg-amber-50/50" },
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
    color: { badge: "bg-blue-100 text-blue-950", border: "border-blue-300", bg: "bg-blue-50/50" },
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
    color: { badge: "bg-purple-100 text-purple-950", border: "border-purple-300", bg: "bg-purple-50/50" },
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
    color: { badge: "bg-emerald-100 text-emerald-950", border: "border-emerald-300", bg: "bg-emerald-50/50" },
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
    color: { badge: "bg-orange-100 text-orange-950", border: "border-orange-300", bg: "bg-orange-50/50" },
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
    color: { badge: "bg-slate-100 text-slate-950", border: "border-slate-300", bg: "bg-slate-50/50" },
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
  const { t, language } = useLanguage();
  const [selectedRiasecCode, setSelectedRiasecCode] = useState<string>("I");
  const [taraTipIndex, setTaraTipIndex] = useState(0);

  const activeRiasec = RIASEC_DEEP_DATA[selectedRiasecCode] || RIASEC_DEEP_DATA["I"];
  const RiasecIcon = activeRiasec.icon;

  const cycleTaraTip = () => {
    setTaraTipIndex((prev) => (prev + 1) % TARA_ADVICE_TIPS.length);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-28">
      {/* Hero Section with Magic UI DotPattern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-12 pb-16">
        <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] opacity-35" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-bold border border-[#111965]/15">
                <Compass className="w-3.5 h-3.5 text-[#111965]" />
                <span>{t("aboutPage.heroBadge")}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#111965] tracking-tight leading-tight">
                {t("aboutPage.heroTitle")}
              </h1>

              <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
                {t("aboutPage.heroSubtitle")}
              </p>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/assessments/personality"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("aboutPage.startAssessment")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#111965]" />
                  <span>{t("aboutPage.exploreMajorsBtn")}</span>
                </Link>
              </div>
            </div>

            {/* Right Mascot with Interactive Speech Advice */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={cycleTaraTip}
                className="relative p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-lg max-w-sm w-full space-y-4 text-center overflow-hidden cursor-pointer group"
                title="Click Tara for advice"
              >
                <BorderBeam size={180} duration={12} delay={0} borderWidth={1.5} />

                <div className="relative w-40 h-40 mx-auto group-hover:scale-105 transition-transform">
                  <Image
                    src="/images/welcome-hd.webp"
                    alt="Tara Futera Mascot"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] text-[#111965] text-xs font-bold border border-[#F7CE4D]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                    <span>Tara Guidance Tip (Click to Rotate)</span>
                  </div>
                  <p className="text-xs text-[#171A2C] font-semibold leading-relaxed p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0]">
                    "{language === "km" ? TARA_ADVICE_TIPS[taraTipIndex].km : TARA_ADVICE_TIPS[taraTipIndex].en}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Animated Platform Highlights & Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#111965] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#111965]">
              <NumberTicker value={6} suffix="+" />
            </div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statMajors")}</div>
            <div className="text-[11px] text-[#68708A]">Curricula & career pathways in Cambodia</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#111965]">
              <NumberTicker value={6} />
            </div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statUniversities")}</div>
            <div className="text-[11px] text-[#68708A]">RUPP, ITC, CADT, AUPP, Paragon, NUM</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              <NumberTicker value={100} suffix="%" />
            </div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statTuition")}</div>
            <div className="text-[11px] text-[#68708A]">Cross-referenced with MoEYS & admissions</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#111965]">RIASEC</div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statScience")}</div>
            <div className="text-[11px] text-[#68708A]">Holland vocational psychology model</div>
          </div>
        </div>

        {/* Interactive Holland RIASEC 6-Dimension Visualizer */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#111965] text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Psychological Science Explorer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111965]">
              Experience the Holland RIASEC Vocational Dimensions
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              Click any of the 6 core vocational work styles below to inspect its cognitive profile, matching Cambodian majors, and career outcomes:
            </p>
          </div>

          {/* 6 RIASEC Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(RIASEC_DEEP_DATA).map(([code, info]) => {
              const isSelected = selectedRiasecCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedRiasecCode(code)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                      : "bg-[#F8FAFC] text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-black tracking-wider uppercase opacity-80">{code}</div>
                  <div className="text-sm font-black mt-1">
                    {language === "km" ? info.nameKm.split(" ")[0] : info.nameEn.split(" ")[0]}
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                    {info.taglineEn.split(",")[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Details Card */}
          <div className={`p-6 rounded-2xl border ${activeRiasec.color.border} ${activeRiasec.color.bg} space-y-5 animate-in fade-in duration-200`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] shadow-xs">
                  <RiasecIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#68708A] uppercase tracking-wider">
                    RIASEC Dimension Profile: Code {selectedRiasecCode}
                  </span>
                  <h3 className="text-xl font-black text-[#111965]">
                    {language === "km" ? activeRiasec.nameKm : activeRiasec.nameEn}
                  </h3>
                </div>
              </div>

              <Link
                href="/dashboard/assessments/riasec"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs self-start sm:self-auto"
              >
                <span>Take the Full Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-[#171A2C] font-medium leading-relaxed">
              {language === "km" ? activeRiasec.taglineKm : activeRiasec.taglineEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-[#E6E8F0] space-y-2">
                <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider block">
                  Core Cognitive Strengths
                </span>
                <ul className="space-y-1 text-xs text-[#171A2C]">
                  {activeRiasec.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E6E8F0] space-y-2">
                <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider block">
                  Aligned Cambodian Majors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeRiasec.sampleMajors.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/majors/${m.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-[#F0F2FA] text-xs font-bold text-[#111965] hover:bg-[#E6E8F0] transition-colors"
                    >
                      {m.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E6E8F0] space-y-2">
                <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider block">
                  Target Career Roles
                </span>
                <ul className="space-y-1 text-xs text-[#171A2C]">
                  {activeRiasec.sampleCareers.map((car, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{car}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Student Journey */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#111965] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Pathway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111965]">
              How Futera Works for You
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              From self-discovery to enrolling in your dream university program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step1Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step1Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step2Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step2Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step3Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Methodology & Data Integrity FAQ Accordion */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-xl font-black text-[#111965]">
              Data Authenticity & Ethical FAQ
            </h3>
            <p className="text-xs text-[#68708A]">
              Transparency on how we verify Cambodian university fees and avoid commercial sponsorship bias
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <AccordionItem title="How does Futera ensure university tuition fees are accurate?">
              <p className="text-xs text-[#68708A] leading-relaxed">
                We cross-reference every fee schedule directly with official published admission notices from the Ministry of Education, Youth and Sport (MoEYS) and university registrar offices (RUPP, ITC, CADT, AUPP, Paragon IU, and NUM). Any outdated figure is flagged as pending until re-verified.
              </p>
            </AccordionItem>

            <AccordionItem title="Does Futera favor private universities that sponsor programs?">
              <p className="text-xs text-[#68708A] leading-relaxed">
                No. Futera does not accept paid placements to bias recommendations. Public state universities and private institutions are assessed with equal objectivity based entirely on academic alignment with the student's self-reported strengths.
              </p>
            </AccordionItem>

            <AccordionItem title="Can high school teachers and parents use Futera together?">
              <p className="text-xs text-[#68708A] leading-relaxed">
                Yes! We actively design our diagnostic reports to be shared in conversations between Grade 12 students, school counselors, and parents to guide confident decisions together.
              </p>
            </AccordionItem>
          </div>
        </div>

        {/* Ethical Transparency & Data Integrity Commitment */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111965] via-[#1E277A] to-[#0A0F3D] text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F7CE4D]">
            <HeartHandshake className="w-4 h-4" />
            <span>Ethical Guidance Commitment</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {t("aboutPage.commitment")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
            {language === "km"
              ? "ការធ្វើតេស្តនៅលើ Futera ត្រូវបានរចនាឡើងដើម្បីជំរុញការស្វែងយល់ និងការពិចារណាដោយផ្អែកលើព័ត៌មានជាក់ស្តែង មិនមែនជាការបង្ខិតបង្ខំវាសនាជីវិតរបស់សិស្សឡើយ។ យើងលើកទឹកចិត្តយ៉ាងមុតមាំឱ្យសិស្សានុសិស្សយកលទ្ធផលណែនាំរបស់ Futera ទៅពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូវិទ្យាល័យ ទីប្រឹក្សាអាជីព និងសមាជិកគ្រួសារ ដើម្បីធ្វើការសម្រេចចិត្តរួមគ្នាប្រកបដោយទំនុកចិត្ត។"
              : "Futera assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their Futera recommendations with high school teachers, university counselors, and family members to make confident, well-rounded decisions."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md"
            >
              <span>{t("aboutPage.tryAssessments")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
