"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  Sparkles,
  GraduationCap,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  Check,
  ShieldCheck,
  BookOpen,
  Briefcase,
  HelpCircle,
  Award,
  ChevronRight,
  Zap,
  BarChart3,
  Sliders,
  FileCheck,
  Share2,
  Users,
} from "lucide-react";

// =========================================================================
// 4 Diagnostic Engines Data
// =========================================================================
const ENGINES = [
  {
    id: "riasec",
    number: "01",
    weight: "30%",
    titleEn: "Holland RIASEC Vocational Test",
    titleKm: "តេស្តចំណាប់អារម្មណ៍អាជីព Holland RIASEC",
    taglineEn: "Vocational Psychology Standard (John Holland)",
    taglineKm: "ចិត្តវិទ្យាវិជ្ជាជីវៈស្តង់ដារអន្តរជាតិ",
    descEn:
      "Measures 6 foundational vocational dimensions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) to identify your authentic affinity for real day-to-day work tasks.",
    descKm:
      "វាស់វែងចំណាប់អារម្មណ៍ការងារ ៦ វិមាត្រ (ជាក់ស្តែង, ស្រាវជ្រាវ, សិល្បៈ, សង្គម, ភាពជាអ្នកដឹកនាំ, ការិយាល័យ) ដើម្បីស្វែងរកការងារដែលអ្នកចូលចិត្តធ្វើពីធម្មជាតិ។",
    metricsEn: "30 Questions • 10-12 Mins • Free",
    metricsKm: "៣០ សំណួរ • ១០-១២ នាទី • ឥតគិតថ្លៃ",
    icon: Compass,
    color: "#D97706",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    primaryLink: "/riasec",
    testLink: "/dashboard/assessments/riasec",
    linkTextEn: "Explore RIASEC Details",
    linkTextKm: "ស្វែងយល់លម្អិតអំពី RIASEC",
    startTextEn: "Start RIASEC Test",
    startTextKm: "ធ្វើតេស្ត RIASEC",
    featuresEn: [
      "Identifies your 3-letter Holland code (e.g. IAS, RIE)",
      "Maps directly to 120+ Cambodian university majors",
      "Prevents career dissatisfaction and major switching",
    ],
    featuresKm: [
      "កំណត់កូដហូឡង់ ៣ តួអក្សរផ្ទាល់ខ្លួន (ឧទាហរណ៍៖ IAS, RIE)",
      "ភ្ជាប់ផ្ទាល់ទៅកាន់ជំនាញសាកលវិទ្យាល័យជាង ១២០ នៅកម្ពុជា",
      "ការពារកុំឱ្យបាក់ទឹកចិត្ត ឬប្តូរជំនាញពាក់កណ្តាលទី",
    ],
  },
  {
    id: "personality",
    number: "02",
    weight: "25%",
    titleEn: "16 Personalities (MBTI Cognitive Style)",
    titleKm: "បុគ្គលិកលក្ខណៈទាំង ១៦ & របៀបគិត",
    taglineEn: "Cognitive Temperament Framework",
    taglineKm: "រចនាប័ទ្មនៃការគិត & ភាពធន់ក្នុងការសិក្សា",
    descEn:
      "Assesses your cognitive information-processing style across 4 temperaments (Analysts, Diplomats, Sentinels, Explorers) to understand study endurance, stress resilience, and team dynamics.",
    descKm:
      "វាយតម្លៃលើមុខងារនៃការគិត ៤ ក្រុមធំៗ (អ្នកវិភាគ, អ្នកការទូត, អ្នកការពារ, អ្នករុករក) ដើម្បីយល់ដឹងពីភាពធន់ក្នុងការរៀនសូត្រ ការដោះស្រាយសម្ពាធ និងការធ្វើការជាក្រុម។",
    metricsEn: "60 Questions • 12-15 Mins • Free",
    metricsKm: "៦០ សំណួរ • ១២-១៥ នាទី • ឥតគិតថ្លៃ",
    icon: Sparkles,
    color: "#2563EB",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    primaryLink: "/personality",
    testLink: "/dashboard/assessments/personality",
    linkTextEn: "Explore 16 Personalities",
    linkTextKm: "ស្វែងយល់បុគ្គលិកលក្ខណៈ",
    startTextEn: "Start Personality Test",
    startTextKm: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈ",
    featuresEn: [
      "Deep analysis of 16 Cambodian student archetypes",
      "Determines ideal learning environments and work styles",
      "Highlights communication strengths and blindspots",
    ],
    featuresKm: [
      "វិភាគស៊ីជម្រៅលើបុគ្គលិកលក្ខណៈទាំង ១៦ របស់សិស្សកម្ពុជា",
      "កំណត់បរិយាកាសសិក្សា និងរបៀបធ្វើការដែលស័ក្តិសមបំផុត",
      "បង្ហាញពីចំណុចខ្លាំងនៃការទំនាក់ទំនង និងចំណុចខ្វះខាត",
    ],
  },
  {
    id: "bacii",
    number: "03",
    weight: "25%",
    titleEn: "BACII Stream & Academic Prerequisites",
    titleKm: "ភាពត្រូវគ្នានៃថ្នាក់បាក់ឌុប & លក្ខខណ្ឌសាកលវិទ្យាល័យ",
    taglineEn: "MoEYS & University Admission Criteria",
    taglineKm: "លក្ខខណ្ឌតម្រូវផ្លូវការនៃក្រសួងអប់រំ និងសាកលវិទ្យាល័យ",
    descEn:
      "Cross-validates your Grade 12 National Exam stream (Science vs. Social stream), strongest high school subjects, and tuition budget against official admission rules across 50+ Cambodian universities.",
    descKm:
      "ផ្ទៀងផ្ទាត់ភាពត្រូវគ្នារវាងថ្នាក់វិទ្យាសាស្ត្រពិត ឬវិទ្យាសាស្ត្រសង្គម មុខវិជ្ជាពូកែ និងកម្រិតថវិកាសិក្សា ជាមួយលក្ខខណ្ឌចូលរៀនផ្លូវការនៃសាកលវិទ្យាល័យជាង ៥០ នៅកម្ពុជា។",
    metricsEn: "10 Criteria • 5 Mins • Verified",
    metricsKm: "១០ លក្ខខណ្ឌ • ៥ នាទី • ផ្ទៀងផ្ទាត់ផ្លូវការ",
    icon: GraduationCap,
    color: "#059669",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    primaryLink: "/bacii",
    testLink: "/dashboard/assessments/preferences",
    linkTextEn: "Explore BACII Prerequisites",
    linkTextKm: "ស្វែងយល់លក្ខខណ្ឌបាក់ឌុប",
    startTextEn: "Set Academic Preferences",
    startTextKm: "កំណត់ចំណូលចិត្តសិក្សា",
    featuresEn: [
      "Checks science vs. social stream entrance eligibility",
      "Filters programs by verified 4-year tuition budgets",
      "Identifies MoEYS & CADT Techo scholarship quotas",
    ],
    featuresKm: [
      "ពិនិត្យសិទ្ធិប្រឡងចូលថ្នាក់វិទ្យាសាស្ត្រ និងសង្គម",
      "ច្រោះជំនាញតាមកម្រិតថវិកាសិក្សាជាក់ស្តែង ៤ ឆ្នាំពេញ",
      "កំណត់កូតាអាហារូបករណ៍រដ្ឋ MoEYS និង CADT តេជោ",
    ],
  },
  {
    id: "labor",
    number: "04",
    weight: "20%",
    titleEn: "Cambodian Labor Market & Salary Realities",
    titleKm: "តម្រូវការទីផ្សារការងារ & ប្រាក់ខែជាក់ស្តែងនៅកម្ពុជា",
    taglineEn: "National Employment Agency (NEA) Data",
    taglineKm: "ទិន្នន័យផ្លូវការពីទីភ្នាក់ងារជាតិមុខរបរ និងការងារ",
    descEn:
      "Weights every recommendation by authentic Cambodian job market realities, entry-to-senior salary benchmarks ($600–$2,400+), and 5-year industry hiring trends in Cambodia's digital economy.",
    descKm:
      "ថ្លឹងថ្លែងរាល់ការណែនាំដោយផ្អែកលើតម្រូវការការងារពិតប្រាកដនៅកម្ពុជា កម្រិតប្រាក់ខែជាក់ស្តែង ($៦០០ ដល់ $២,៤០០+) និងនិន្នាការកំណើនការងារក្នុងសេដ្ឋកិច្ចឌីជីថល ៥ ឆ្នាំទៅមុខ។",
    metricsEn: "Real-time NEA Data • 80+ Careers",
    metricsKm: "ទិន្នន័យ NEA ផ្ទាល់ • ជាង ៨០ អាជីព",
    icon: TrendingUp,
    color: "#9333EA",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    primaryLink: "/careers",
    testLink: "/careers",
    linkTextEn: "Explore Cambodian Salaries",
    linkTextKm: "ពិនិត្យប្រាក់ខែ និងទីផ្សារការងារ",
    startTextEn: "View Labor Data",
    startTextKm: "មើលទិន្នន័យការងារ",
    featuresEn: [
      "Entry, mid, and senior salary ranges verified in USD",
      "High-demand vs saturated Cambodian market classifications",
      "Direct alignment with emerging Tech, FinTech & Green sectors",
    ],
    featuresKm: [
      "កម្រិតប្រាក់ខែដំបូង មធ្យម និងជាន់ខ្ពស់គិតជាប្រាក់ដុល្លារ",
      "បែងចែកវិស័យកំពុងខ្វះកម្លាំងពលកម្ម និងវិស័យដែលឆ្អែត",
      "ត្រូវគ្នានឹងវិស័យបច្ចេកវិទ្យា ហិរញ្ញវត្ថុ និងថាមពលស្អាត",
    ],
  },
];

// =========================================================================
// Comparison Table Data: Futera vs Generic Online Quizzes
// =========================================================================
const COMPARISON_ROWS = [
  {
    featureEn: "Scientific Methodology",
    featureKm: "វិធីសាស្ត្របែបវិទ្យាសាស្ត្រ",
    futeraEn: "4-Pillar Algorithmic Formula (RIASEC + MBTI + BACII + NEA)",
    futeraKm: "រូបមន្ត ៤ វិមាត្រ (RIASEC + MBTI + ថ្នាក់បាក់ឌុប + ទីផ្សារ NEA)",
    genericEn: "Single 5-question pop quiz based on superficial hobbies",
    genericKm: "សំណួរកម្សាន្ត ៥ សំណួរទាយតាមការស្មាន",
  },
  {
    featureEn: "Cambodian Context Localization",
    featureKm: "ការផ្សារភ្ជាប់បរិបទកម្ពុជាពិតប្រាកដ",
    futeraEn: "100% localized for RUPP, ITC, CADT, RULE & MoEYS criteria",
    futeraKm: "ត្រូវគ្នា ១០០% ជាមួយ RUPP, ITC, CADT, RULE និងក្រសួងអប់រំ",
    genericEn: "Generic US/European systems irrelevant to Cambodian universities",
    genericKm: "ប្រើប្រព័ន្ធសហរដ្ឋអាមេរិក ឬអឺរ៉ុប មិនត្រូវនឹងសាកលវិទ្យាល័យខ្មែរ",
  },
  {
    featureEn: "Financial & Tuition Prerequisite",
    featureKm: "ការផ្ទៀងផ្ទាត់តម្លៃសិក្សា និងថវិកា",
    futeraEn: "Filters by verified 4-year tuition ($500 state vs $2,500+ private)",
    futeraKm: "ច្រោះតាមតម្លៃសិក្សា ៤ ឆ្នាំពិតប្រាកដ ($៥០០ រដ្ឋ ទល់ $២,៥០០+ ឯកជន)",
    genericEn: "Zero budget checks; recommends unaffordable programs",
    genericKm: "គ្មានការពិនិត្យថវិកា ណែនាំសាលាដែលលើសពីលទ្ធភាព",
  },
  {
    featureEn: "BACII High School Stream Check",
    featureKm: "ការផ្ទៀងផ្ទាត់ថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម",
    futeraEn: "Validates Science vs. Social stream prerequisite subjects",
    futeraKm: "ផ្ទៀងផ្ទាត់លក្ខខណ្ឌមុខវិជ្ជាថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម",
    genericEn: "Ignores Grade 12 tracks leading to exam disqualification",
    genericKm: "មិនគិតពីថ្នាក់រៀន នាំឱ្យធ្លាក់ការប្រឡងចូលរៀន",
  },
  {
    featureEn: "Parent & Counselor Sharing",
    featureKm: "ការចែករំលែកជាមួយឪពុកម្តាយ ឬគ្រូ",
    futeraEn: "Exportable diagnostic PDF report with clear Cambodian evidence",
    futeraKm: "របាយការណ៍ PDF វិភាគច្បាស់លាស់ អាចផ្ញើជូនឪពុកម្តាយបាន",
    genericEn: "Simple screenshot or buzzfeed-style summary line",
    genericKm: "គ្រាន់តែជាពាក្យសង្ខេបមួយឃ្លា គ្មានទិន្នន័យជាក់ស្តែង",
  },
];

// =========================================================================
// Main Component
// =========================================================================
export default function PublicAssessmentsHubPage() {
  const { language } = useLanguage();
  const isKm = language === "km";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#F7CE4D]/30">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e144a] via-[#111965] to-[#18237c] text-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#F7CE4D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Super Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-[#F7CE4D] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#F7CE4D]" />
              <span>
                {isKm
                  ? "ប្រព័ន្ធតេស្តវាយតម្លៃបែបវិទ្យាសាស្ត្រ ៤ វិមាត្រ"
                  : "Futera Diagnostic Assessment Ecosystem"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
              {isKm ? (
                <>
                  ប្រព័ន្ធតេស្តវាស់ស្ទង់សមត្ថភាព <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7CE4D] to-amber-300">
                    & ផ្គូផ្គងជំនាញសាកលវិទ្យាល័យកម្ពុជា
                  </span>
                </>
              ) : (
                <>
                  Scientific Self-Discovery <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7CE4D] to-amber-300">
                    & AI Major Matching Engine
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal">
              {isKm
                ? "ហេតុអ្វីបានជាសំណួរស្មានធម្មតាមិនអាចជួយអ្នកបាន? Futera រួមបញ្ចូលទ្រឹស្តីចិត្តវិទ្យាអាជីព RIASEC បុគ្គលិកលក្ខណៈទាំង ១៦ ថ្នាក់បាក់ឌុបជាតិ និងទីផ្សារការងារកម្ពុជា ដើម្បីផ្តល់នូវការផ្គូផ្គងដែលត្រឹមត្រូវបំផុត ១០០%។"
                : "Why generic 5-question online quizzes fail Cambodian students: Futera integrates John Holland's vocational psychology, Myers-Briggs cognitive styles, Grade 12 BACII prerequisites, and official NEA labor data into a unified 100% precision formula."}
            </p>

            {/* The 100% Equation Bar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-white">
                  <BarChart3 className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{isKm ? "រូបមន្តវិទ្យាសាស្ត្រ ១០០%" : "The 100% Scientific Precision Formula"}</span>
                </span>
                <span className="text-[#F7CE4D] font-mono">30% + 25% + 25% + 20% = 100%</span>
              </div>
              <div className="h-3.5 w-full bg-black/30 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                <div className="h-full bg-amber-500 rounded-l-full" style={{ width: "30%" }} title="30% RIASEC" />
                <div className="h-full bg-blue-500" style={{ width: "25%" }} title="25% Personality" />
                <div className="h-full bg-emerald-500" style={{ width: "25%" }} title="25% BACII Stream" />
                <div className="h-full bg-purple-500 rounded-r-full" style={{ width: "20%" }} title="20% Labor Market" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> 30% RIASEC</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> 25% Personality</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> 25% BACII Stream</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" /> 20% NEA Market</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/dashboard/assessments/riasec"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#F7CE4D] to-amber-400 text-[#111965] font-extrabold shadow-lg shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isKm ? "ចាប់ផ្តើមធ្វើតេស្តពេញលេញដោយឥតគិតថ្លៃ" : "Start Full Free Assessment"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#engines"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium border border-white/20 transition-all"
              >
                <span>{isKm ? "ស្វែងយល់ពីតេស្តទាំង ៤" : "Explore the 4 Engines"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE 4 DIAGNOSTIC ENGINES CARDS
          ========================================================================= */}
      <section id="engines" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            <span>{isKm ? "ម៉ាស៊ីនវិភាគទាំង ៤ របស់ Futera" : "The 4 Pillars of Precision Matching"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {isKm ? "តេស្តវិភាគលម្អិតសម្រាប់សិស្សកម្ពុជា" : "Dedicated Diagnostic Engines"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isKm
              ? "តេស្តនីមួយៗឆ្លុះបញ្ចាំងពីវិមាត្រសំខាន់ៗដែលចាំបាច់ក្នុងការជ្រើសរើសជំនាញសិក្សា។ ចុចលើតេស្តនីមួយៗដើម្បីស្វែងយល់លម្អិត។"
              : "Each test addresses a distinct diagnostic dimension to ensure a holistic, highly realistic academic and career trajectory."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ENGINES.map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          PILLAR {engine.number}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${engine.badgeClass}`}>
                          Weight: {engine.weight}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#111965] group-hover:text-blue-700 transition-colors">
                        {isKm ? engine.titleKm : engine.titleEn}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {isKm ? engine.taglineKm : engine.taglineEn}
                      </p>
                    </div>

                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md text-white transition-transform group-hover:scale-105"
                      style={{ backgroundColor: engine.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isKm ? engine.descKm : engine.descEn}
                  </p>

                  {/* Metrics Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isKm ? engine.metricsKm : engine.metricsEn}</span>
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {(isKm ? engine.featuresKm : engine.featuresEn).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={engine.primaryLink}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-bold transition-all"
                  >
                    <span>{isKm ? engine.linkTextKm : engine.linkTextEn}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                  <Link
                    href={engine.testLink}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#111965] hover:bg-[#18237c] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                    <span>{isKm ? engine.startTextKm : engine.startTextEn}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STEP-BY-STEP ASSESSMENT JOURNEY
          ========================================================================= */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Sliders className="w-3.5 h-3.5" />
              <span>{isKm ? "ដំណើរការវាយតម្លៃជា ៤ ជំហាន" : "The 4-Step Student Journey"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {isKm ? "របៀបដែល Futera ដំណើរការ" : "How the Assessment Pathway Works"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {isKm
                ? "ចំណាយពេលត្រឹមតែ ២៥-៣០ នាទីដើម្បីទទួលបានផែនទីបង្ហាញផ្លូវសិក្សា និងអាជីពពេញលេញ។"
                : "From authentic self-discovery to confident enrollment in your dream university program."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                1
              </div>
              <h3 className="text-base font-extrabold text-[#111965]">
                {isKm ? "១. តេស្ត RIASEC" : "1. Holland RIASEC"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isKm
                  ? "ឆ្លើយ ៣០ សំណួរជាក់ស្តែងដើម្បីស្វែងរកចំណាប់អារម្មណ៍ការងារពីធម្មជាតិ ៦ វិមាត្រ។"
                  : "Complete 30 localized question items to measure your natural affinity for practical, analytical, or social tasks."}
              </p>
              <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block">
                ~10 Mins • 30 Items
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-600/20">
                2
              </div>
              <h3 className="text-base font-extrabold text-[#111965]">
                {isKm ? "២. តេស្តបុគ្គលិកលក្ខណៈ" : "2. 16 Personalities"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isKm
                  ? "ស្វែងយល់ពីរចនាប័ទ្មនៃការគិត ភាពធន់នឹងសម្ពាធ និងរបៀបធ្វើការងារជាក្រុម។"
                  : "Explore your cognitive information style and study endurance across 4 temperament archetypes."}
              </p>
              <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md inline-block">
                ~12 Mins • 60 Items
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-base font-extrabold text-[#111965]">
                {isKm ? "៣. ចំណូលចិត្ត & ថ្នាក់បាក់ឌុប" : "3. Academic Stream"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isKm
                  ? "កំណត់មុខវិជ្ជាពូកែ ថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម ថវិកាសិក្សា និងទីតាំងសាកលវិទ្យាល័យ។"
                  : "Confirm Grade 12 Science vs. Social stream prerequisites, annual tuition budget, and campus location."}
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                ~5 Mins • 10 Criteria
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-purple-600/20">
                4
              </div>
              <h3 className="text-base font-extrabold text-[#111965]">
                {isKm ? "៤. លទ្ធផលផ្គូផ្គង AI" : "4. AI Recommendations"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isKm
                  ? "ប្រព័ន្ធ AI បញ្ចូលទិន្នន័យទាំង ៤ វិមាត្រដើម្បីបង្កើតបញ្ជីជំនាញ និងសាកលវិទ្យាល័យស័ក្តិសម ១០០%។"
                  : "Receive transparent fit percentage scores, tuition schedules, and parent-shareable counselor PDF reports."}
              </p>
              <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md inline-block">
                Instant • 100% Precision
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: COMPARISON MATRIX: FUTERA VS GENERIC QUIZZES
          ========================================================================= */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? "ភាពខុសគ្នាពីតេស្តទូទៅ" : "Futera vs. Generic Online Quizzes"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {isKm ? "ហេតុអ្វីសិស្ស និងអាណាព្យាបាលជឿទុកចិត្តលើ Futera" : "Why Futera Outperforms Generic Quizzes"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isKm
              ? "ការប្រៀបធៀបរវាងការទាយបែបកម្សាន្ត និងការវិភាគបែបវិទ្យាសាស្ត្រក្នុងបរិបទកម្ពុជា។"
              : "See how multi-factor algorithmic rigor eliminates guesswork, major dropouts, and unrealistic university choices."}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4 sm:p-5 w-1/4">{isKm ? "លក្ខណៈវិនិច្ឆ័យ" : "Criteria"}</th>
                <th className="p-4 sm:p-5 w-5/12 bg-blue-50/70 text-[#111965]">
                  <span className="flex items-center gap-1.5 font-extrabold text-blue-800">
                    <Sparkles className="w-4 h-4 text-[#F7CE4D]" />
                    <span>Futera Assessment Ecosystem</span>
                  </span>
                </th>
                <th className="p-4 sm:p-5 w-1/3 text-slate-400">
                  {isKm ? "តេស្តអនឡាញទូទៅ" : "Generic Online Quizzes"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-800">
                    {isKm ? row.featureKm : row.featureEn}
                  </td>
                  <td className="p-4 sm:p-5 bg-blue-50/30 font-medium text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{isKm ? row.futeraKm : row.futeraEn}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    {isKm ? row.genericKm : row.genericEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FAQ ACCORDION
          ========================================================================= */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKm ? "ចម្ងល់ទូទៅអំពីតេស្ត" : "Assessments FAQ"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {isKm ? "សំណួរដែលសិស្ស និងអាណាព្យាបាលសួរញឹកញាប់" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
              <h3 className="text-base font-bold text-[#111965]">
                {isKm
                  ? "តើតេស្តទាំង ៤ នេះឥតគិតថ្លៃសម្រាប់សិស្សកម្ពុជាឬទេ?"
                  : "Are all 4 assessments 100% free for Cambodian students?"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isKm
                  ? "ឥតគិតថ្លៃ ១០០%! សិស្ស និងអាណាព្យាបាលអាចធ្វើតេស្តទាំងអស់ដោយសេរី និងទទួលបានលទ្ធផលផ្គូផ្គងជំនាញសាកលវិទ្យាល័យដោយមិនមានការទាមទារបង់ប្រាក់ឡើយ។"
                  : "Yes, 100% free! All Cambodian students and parents can complete the assessments, review match percentages, and explore university tuition schedules with zero hidden charges."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
              <h3 className="text-base font-bold text-[#111965]">
                {isKm
                  ? "ចុះប្រសិនបើតេស្ត RIASEC និងបុគ្គលិកលក្ខណៈផ្តល់លទ្ធផលមិនដូចគ្នា?"
                  : "What if my RIASEC score and 16-Personality suggest different fields?"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isKm
                  ? "នេះជាចំណុចពិសេសនៃរូបមន្ត Futera! តេស្ត RIASEC វាស់លើការងារដែលអ្នកចូលចិត្តធ្វើ (Tasks) ខណៈដែលតេស្តបុគ្គលិកលក្ខណៈវាស់លើរបៀបដែលអ្នកធ្វើការជាមួយមនុស្ស និងសម្ពាធ (Work Style)។ ក្បួនដោះស្រាយ AI នឹងស្វែងរកជំនាញដែលបំពេញតម្រូវការទាំងពីរក្នុងពេលតែមួយ (ឧទាហរណ៍៖ ប្រសិនបើចូលចិត្តបច្ចេកវិទ្យា តែចូលចិត្តនិយាយជាមួយមនុស្ស ប្រព័ន្ធនឹងណែនាំ IT Project Management ឬ FinTech Consulting)។"
                  : "This is precisely why Futera uses multi-factor modeling! RIASEC measures the tasks you enjoy doing, while 16-Personalities measures how you collaborate, process information, and handle stress. Our algorithm resolves the overlap (e.g. high tech interest + high social extraversion points to IT Product Management or FinTech Client Consulting)."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2">
              <h3 className="text-base font-bold text-[#111965]">
                {isKm
                  ? "តើខ្ញុំអាចទាញយករបាយការណ៍ចែករំលែកជាមួយឪពុកម្តាយបានទេ?"
                  : "Can I download and share my report with my parents or school counselor?"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isKm
                  ? "បាន! នៅពេលអ្នកបញ្ចប់តេស្តទាំង ៤ អ្នកអាចចុច 'ទាញយករបាយការណ៍ PDF' ដែលមានព័ត៌មានលម្អិតអំពីចំណុចខ្លាំង តម្លៃសិក្សា ៤ ឆ្នាំ និងឱកាសប្រាក់ខែជាក់ស្តែងនៅកម្ពុជា ដើម្បីពិភាក្សាជាមួយក្រុមគ្រួសារប្រកបដោយទំនុកចិត្ត។"
                  : "Yes! Once you complete the diagnostic journey, you can export a comprehensive counselor PDF report with verified Cambodian tuition fee schedules, scholarship criteria, and salary forecasts to discuss with your parents."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: BOTTOM CONVERSION CTA BANNER
          ========================================================================= */}
      <section className="py-16 bg-[#111965] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isKm ? "ស្វែងរកជំនាញក្នុងក្តីស្រមៃរបស់អ្នក" : "Find Your Dream Major in Cambodia"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isKm ? (
              <>
                ត្រៀមខ្លួនស្វែងរកជំនាញ និងសាកលវិទ្យាល័យដែលត្រូវគ្នានឹងអ្នកហើយឬនៅ?
              </>
            ) : (
              <>
                Ready to Discover Your Ideal Cambodian University Major?
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {isKm
              ? "ចាប់ផ្តើមធ្វើតេស្ត Holland RIASEC ជាជំហានដំបូង រួចបន្តទៅកាន់បុគ្គលិកលក្ខណៈទាំង ១៦ និងលក្ខខណ្ឌសិក្សា ដើម្បីទទួលបានលទ្ធផលផ្គូផ្គងភ្លាមៗ។"
              : "Begin with the 10-minute Holland RIASEC assessment, followed by 16 Personalities and BACII stream validation for 100% precision matching."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/assessments/riasec"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#F7CE4D] to-amber-400 text-[#111965] text-sm sm:text-base font-extrabold shadow-lg shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isKm ? "ចាប់ផ្តើមធ្វើតេស្ត RIASEC (១០ នាទី)" : "Start RIASEC Assessment (10 Mins)"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/majors"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-medium border border-white/20 transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-300" />
              <span>{isKm ? "ស្វែងរកជំនាញសាកលវិទ្យាល័យ" : "Explore University Majors"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

