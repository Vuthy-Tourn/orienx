"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import { AssessmentStage, AssessmentStepItem } from "@/components/assessments/assessment-stage";
import { AssessmentViewSwitcher } from "@/components/assessments/assessment-view-switcher";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Compass,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Wrench,
  Search,
  Palette,
  Users,
  TrendingUp,
  FileText,
  Award,
  Zap,
} from "lucide-react";

const RIASEC_DIMENSIONS: Record<
  string,
  {
    code: string;
    nameEn: string;
    nameKm: string;
    color: string;
    icon: any;
    descKm: string;
    descEn: string;
  }
> = {
  R: {
    code: "R",
    nameEn: "Realistic (Hands-on & Technical)",
    nameKm: "អនុវត្តជាក់ស្តែង & វិស្វកម្ម (Realistic)",
    color: "#0284C7",
    icon: Wrench,
    descKm: "ចូលចិត្តធ្វើការជាមួយឧបករណ៍ គ្រឿងម៉ាស៊ីន និងការដោះស្រាយបញ្ហាបច្ចេកទេសជាក់ស្តែង។",
    descEn: "Enjoys practical, hands-on work with tools, machinery, and physical problem solving.",
  },
  I: {
    code: "I",
    nameEn: "Investigative (Analytical & Scientific)",
    nameKm: "ស្រាវជ្រាវ & វិភាគទិន្នន័យ (Investigative)",
    color: "#7C3AED",
    icon: Search,
    descKm: "ចូលចិត្តការស្រាវជ្រាវ វិភាគទិន្នន័យ វិទ្យាសាស្ត្រ និងការដោះស្រាយបញ្ហាស្មុគស្មាញ។",
    descEn: "Enjoys intellectual inquiry, scientific exploration, and analytical research.",
  },
  A: {
    code: "A",
    nameEn: "Artistic (Creative & Expressive)",
    nameKm: "សិល្បៈ & ការច្នៃប្រឌិត (Artistic)",
    color: "#E11D48",
    icon: Palette,
    descKm: "ចូលចិត្តការបញ្ចេញគំនិតច្នៃប្រឌិត ការរចនា UI/UX ប្រព័ន្ធផ្សព្វផ្សាយ និងសិល្បៈ។",
    descEn: "Enjoys self-expression, design, visual creation, and unstructured innovation.",
  },
  S: {
    code: "S",
    nameEn: "Social (Collaborative & Helping)",
    nameKm: "សង្គម & ទំនាក់ទំនង (Social)",
    color: "#059669",
    icon: Users,
    descKm: "ចូលចិត្តជួយអ្នកដទៃ ការបង្រៀន ការប្រឹក្សា និងការកសាងទំនាក់ទំនងសង្គម។",
    descEn: "Enjoys teaching, communicating, counseling, and teamwork.",
  },
  E: {
    code: "E",
    nameEn: "Enterprising (Leadership & Persuasion)",
    nameKm: "សហគ្រិន & ភាពជាអ្នកដឹកនាំ (Enterprising)",
    color: "#D97706",
    icon: TrendingUp,
    descKm: "ចូលចិត្តភាពជាអ្នកដឹកនាំ ការបញ្ចុះបញ្ចូល ធុរកិច្ច និងការបង្កើតគម្រោងថ្មីៗ។",
    descEn: "Enjoys leading, motivating others, taking business risks, and driving growth.",
  },
  C: {
    code: "C",
    nameEn: "Conventional (Organized & Detail-Oriented)",
    nameKm: "រៀបចំ & ប្រព័ន្ធច្បាស់លាស់ (Conventional)",
    color: "#0D9488",
    icon: FileText,
    descKm: "ចូលចិត្តការរៀបចំទិន្នន័យ គណនេយ្យ នីតិវិធីច្បាស់លាស់ និងការគ្រប់គ្រងឯកសារ។",
    descEn: "Enjoys structured systems, organizing financial data, and precise procedures.",
  },
};

export default function RiasecAssessmentPage() {
  const { t, getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const DRAFT_STORAGE_KEY = "futera_riasec_draft_v1";

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ratings && Object.keys(parsed.ratings).length > 0) {
          setRatings(parsed.ratings);
          if (typeof parsed.currentIndex === "number") {
            setCurrentIndex(parsed.currentIndex);
          }
          setActiveTab("form");
        }
      }
    } catch (e) {
      console.error("Failed to load RIASEC draft", e);
    }
  }, []);

  // Auto-save draft whenever ratings or currentIndex change
  useEffect(() => {
    if (Object.keys(ratings).length > 0) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ ratings, currentIndex, updatedAt: Date.now() })
        );
      } catch (e) {
        console.error("Failed to save RIASEC draft", e);
      }
    }
  }, [ratings, currentIndex]);

  // 1. Fetch RIASEC questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["riasec-questions"],
    queryFn: async () => apiFetch<any[]>("/assessments/riasec/questions"),
  });

  // 2. Fetch latest RIASEC result
  const { data: latestResult, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-riasec"],
    queryFn: async () => apiFetch<any>("/assessments/riasec/latest"),
  });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
    let hasDraft = false;
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        hasDraft = parsed.ratings && Object.keys(parsed.ratings).length > 0;
      }
    } catch {}

    if (latestResult && Object.keys(ratings).length === 0 && !hasDraft) {
      setActiveTab("results");
    }
  }, [latestResult]);

  // 3. Submit mutation
  const { mutate: submitAssessment, isPending: submitting } = useMutation({
    mutationFn: async (payload: Array<{ question_id: string; rating: number }>) => {
      return apiFetch("/assessments/riasec/submit", {
        method: "POST",
        body: JSON.stringify({ answers: payload }),
      });
    },
    onSuccess: () => {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["latest-riasec"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setRatings({});
    setCurrentIndex(0);
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
    if (questions && currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 450);
    }
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefilled: Record<string, number> = {};
    questions.forEach((q: any) => {
      if (q.category === "R" || q.category === "I") {
        prefilled[q.id] = 5;
      } else if (q.category === "A") {
        prefilled[q.id] = 4;
      } else {
        prefilled[q.id] = 3;
      }
    });
    setRatings(prefilled);
  };

  const handleSubmit = () => {
    if (!questions) return;
    const answersList = Object.entries(ratings).map(([qId, rating]) => ({
      question_id: qId,
      rating,
    }));

    if (answersList.length < questions.length) {
      alert(t("riasecAssessment.rateAllAlert") || "Please rate all activities before submitting.");
      return;
    }
    submitAssessment(answersList);
  };

  const handleRetake = () => {
    setRatings({});
    setCurrentIndex(0);
    setActiveTab("form");
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-24 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#111965] border-t-transparent animate-spin" />
        <span className="font-semibold">{t("riasecAssessment.loading")}</span>
      </div>
    );
  }

  // ========================================================
  // RESULTS VIEW: RADAR CHART + HOLLAND BREAKDOWN
  // ========================================================
  if (activeTab === "results" && latestResult) {
    const res = latestResult;
    const hCode = res?.holland_code || "RIA";

    const radarData = [
      { subject: "Realistic (R)", score: res?.realistic_score || 0, fullMark: 100 },
      { subject: "Investigative (I)", score: res?.investigative_score || 0, fullMark: 100 },
      { subject: "Artistic (A)", score: res?.artistic_score || 0, fullMark: 100 },
      { subject: "Social (S)", score: res?.social_score || 0, fullMark: 100 },
      { subject: "Enterprising (E)", score: res?.enterprising_score || 0, fullMark: 100 },
      { subject: "Conventional (C)", score: res?.conventional_score || 0, fullMark: 100 },
    ];

    // Extract top 3 codes from holland_code letters
    const topLetters = hCode.split("").slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-16 select-none">
        {/* Top Breadcrumb & Minimal Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
              <Link href="/dashboard" className="hover:text-[#111965]">
                {t("personalityAssessment.dashboard")}
              </Link>
              <span>/</span>
              <span className="text-[#111965]">
                {t("riasecAssessment.title")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {t("riasecAssessment.title")}
            </h1>
          </div>

          {/* View Switcher: Interactive Test vs Results */}
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${hCode} Profile`}
            profileIcon={Trophy}
            hasResult={!!latestResult}
          />
        </div>

        {/* 1. CELEBRATION HERO BANNER WITH TARA MASCOT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] via-[#161F7A] to-[#1E277A] text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#111965]" />
                <span>{t("riasecAssessment.hollandProfile") || "ប្រវត្តិរូប HOLLAND RIASEC"}</span>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight drop-shadow-sm">
                  {hCode}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  Realistic • Investigative • Artistic
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                {getLocalized({
                  km: res?.analysis_km?.interpretation,
                  en: res?.analysis_en?.interpretation,
                }) ||
                  `កូដចំណាប់អារម្មណ៍អាជីពចម្បងរបស់អ្នកគឺ ${hCode} ។ អ្នកនឹងរីកចម្រើនខ្លាំងក្នុងបរិស្ថានការងារដែលឆ្លុះបញ្ចាំងពីវិស័យទាំងបីនេះ។`}
              </p>

              <div className="pt-1">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("riasecAssessment.retakeTest") || "ធ្វើតេស្តឡើងវិញ"}</span>
                </button>
              </div>
            </div>

            {/* Celebrating Mascot Tara */}
            <div className="flex-shrink-0 self-center sm:self-auto relative pt-4 sm:pt-0">
              <FuteraMascot
                variant="full-jumping"
                emotion="congratulation"
                showSpeech={true}
                size={195}
                speechText="អបអរសាទរ! កូដ Holland រួចរាល់!"
              />
            </div>
          </div>
        </div>

        {/* 2. HOLLAND RADAR & TOP 3 PILLARS (2-Column Balanced Card) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Radar Chart */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#111965]">
                  {t("riasecAssessment.radarTitle") || "គំនូសតាងរ៉ាដាចំណាប់អារម្មណ៍អាជីព (Holland Radar Fit)"}
                </h3>
                <p className="text-xs text-[#68708A]">
                  គំនូសតាងប្រៀបធៀបចំណាប់អារម្មណ៍លើវិស័យទាំង ៦ នៃទ្រឹស្តី John Holland
                </p>
              </div>

              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#E6E8F0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#111965", fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#68708A", fontSize: 10 }}
                    />
                    <Radar
                      name="Student Fit"
                      dataKey="score"
                      stroke="#111965"
                      strokeWidth={2}
                      fill="#F7CE4D"
                      fillOpacity={0.55}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Top 3 Primary Holland Domains */}
            <div className="lg:col-span-5 space-y-3.5 border-t lg:border-t-0 lg:border-l border-[#E6E8F0] pt-5 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs sm:text-sm font-black text-[#111965] uppercase tracking-wide">
                  វិស័យចម្បងទាំង ៣ (Top 3 Dominant Codes)
                </h4>
              </div>

              <div className="space-y-2.5">
                {topLetters.map((letter: string) => {
                  const meta = RIASEC_DIMENSIONS[letter];
                  if (!meta) return null;
                  const IconComp = meta.icon;
                  const score =
                    letter === "R"
                      ? res.realistic_score
                      : letter === "I"
                      ? res.investigative_score
                      : letter === "A"
                      ? res.artistic_score
                      : letter === "S"
                      ? res.social_score
                      : letter === "E"
                      ? res.enterprising_score
                      : res.conventional_score;

                  return (
                    <div
                      key={letter}
                      className="p-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: meta.color }}
                          >
                            {letter}
                          </span>
                          <span className="text-xs font-bold text-[#111965]">
                            {meta.nameKm}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#111965]">{score}%</span>
                      </div>
                      <p className="text-[11px] text-[#68708A] pl-8 leading-snug">
                        {meta.descKm}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALL 6 HOLLAND DIMENSION CARDS (Educational & Clear for Students) */}
        <div className="space-y-3.5">
          <div className="space-y-0.5 px-1">
            <h4 className="text-xs sm:text-sm font-black text-[#111965] uppercase tracking-wide">
              {getLocalized({
                km: "ពិន្ទុវិស័យទាំង ៦ លម្អិត (All 6 Career Categories)",
                en: "All 6 Holland Career Categories in Detail",
              })}
            </h4>
            <p className="text-[11px] text-[#68708A]">
              {getLocalized({
                km: "ស្វែងយល់ពីអត្ថន័យនៃកូដនីមួយៗ និងកម្រិតចំណាប់អារម្មណ៍របស់អ្នកចំពោះវិស័យការងារទាំង ៦",
                en: "Understand what each RIASEC dimension means and how strongly your interests align",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.entries(RIASEC_DIMENSIONS).map(([key, meta]) => {
              const IconComp = meta.icon;
              const score =
                key === "R"
                  ? res.realistic_score
                  : key === "I"
                  ? res.investigative_score
                  : key === "A"
                  ? res.artistic_score
                  : key === "S"
                  ? res.social_score
                  : key === "E"
                  ? res.enterprising_score
                  : res.conventional_score;

              return (
                <div
                  key={key}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: meta.color }}
                        >
                          {key}
                        </span>
                        <div>
                          <h5 className="font-black text-[#111965] text-xs leading-snug">
                            {getLocalized({ km: meta.nameKm, en: meta.nameEn })}
                          </h5>
                          <span className="text-[10px] font-semibold text-[#68708A]">
                            Holland Code ({key})
                          </span>
                        </div>
                      </div>
                      <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        <IconComp className="w-4 h-4" style={{ color: meta.color }} />
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="text-xl font-black text-[#111965] tracking-tight">{score}%</div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        {score >= 80
                          ? getLocalized({ km: "ត្រូវចិត្តខ្លាំង (High Fit)", en: "High Fit" })
                          : score >= 50
                          ? getLocalized({ km: "កម្រិតមធ្យម (Moderate)", en: "Moderate" })
                          : getLocalized({ km: "កម្រិតទាប (Low)", en: "Low Interest" })}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5">
                      <div
                        style={{ width: `${score}%`, backgroundColor: meta.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#4A5568] leading-relaxed pt-2 border-t border-slate-100">
                    {getLocalized({ km: meta.descKm, en: meta.descEn })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. NEXT STEP CTA CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F0F2FA] to-[#E8EBF8] border border-[#111965]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
              ✨ ការវាយតម្លៃទាំងពីរត្រូវបានក្រិតតាមខ្នាតយ៉ាងពេញលេញ!
            </h4>
            <p className="text-xs text-[#68708A]">
              ស្វែងយល់មុខជំនាញ និងសាកលវិទ្យាល័យដែលផ្គូផ្គងជាមួយកូដ {hCode} និងបុគ្គលិកលក្ខណៈរបស់អ្នក។
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>មើលអនុសាសន៍ AI (View Matches)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // QUESTIONNAIRE RUNNER: SHARED ASSESSMENTSTAGE COMPONENT
  // ========================================================
  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-[#68708A]">
        No questions available.
      </div>
    );
  }

  const formattedQuestions: AssessmentStepItem[] = questions.map((q: any) => {
    const dim = RIASEC_DIMENSIONS[q.category] || RIASEC_DIMENSIONS.R;
    return {
      id: q.id,
      promptKm: q.prompt_km,
      promptEn: q.prompt_en,
      statementKm: q.prompt_km,
      statementEn: q.prompt_en,
      dimensionCode: dim.code,
      dimensionNameKm: dim.nameKm,
      dimensionNameEn: dim.nameEn,
    };
  });

  const currentQ = questions[currentIndex] || questions[0];
  const currentVal = ratings[currentQ.id];

  return (
    <div className="pb-16">
      <AssessmentStage
        breadcrumbText={`${t("personalityAssessment.dashboard")} / ${t("riasecAssessment.title")}`}
        pageTitle={t("riasecAssessment.title")}
        headerAction={
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${latestResult?.holland_code || "RIA"} Profile`}
            profileIcon={Trophy}
            hasResult={!!latestResult}
          />
        }
        questions={formattedQuestions}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        answers={ratings}
        onAnswer={(qId, level) => handleRatingChange(qId, level)}
        scaleType="5-point"
        leftAnchorKm="មិនចូលចិត្តទាល់តែសោះ"
        leftAnchorEn="Strong Dislike"
        rightAnchorKm="ចូលចិត្តខ្លាំងបំផុត"
        rightAnchorEn="Highly Enjoy"
        mascotSpeech={
          currentVal !== undefined && currentVal !== null
            ? currentVal === 5
              ? getLocalized({
                  km: "អស្ចារ្យណាស់! នេះជាទេពកោសល្យពីកំណើត! 🚀✨",
                  en: "Awesome! This is your natural calling! 🚀✨",
                })
              : currentVal === 4
              ? getLocalized({
                  km: "ល្អណាស់! សកម្មភាពនេះពិតជាគួរឱ្យចាប់អារម្មណ៍! 💡",
                  en: "Great! This activity sounds super exciting! 💡",
                })
              : currentVal === 3
              ? getLocalized({
                  km: "យល់ស្រប! រក្សាជម្រើសបើកទូលាយជានិច្ច! ⚖️",
                  en: "Fair! Keeping an open mind is great! ⚖️",
                })
              : currentVal === 2
              ? getLocalized({
                  km: "មិនអីទេ! យើងនឹងផ្តោតលើអ្វីដែលអ្នកស្រឡាញ់! 🎯",
                  en: "No worries! We will focus on what you love! 🎯",
                })
              : getLocalized({
                  km: "យល់ហើយ! ការដឹងពីអ្វីដែលមិនចូលចិត្តក៏សំខាន់ដែរ! 🛡️",
                  en: "Understood! Knowing what you dislike is key too! 🛡️",
                })
            : currentIndex === 0
            ? getLocalized({
                km: "សួស្តី! តោះស្វែងរកអាជីព និងមុខជំនាញសាកសមបំផុត! 👋",
                en: "Hi! Let's find your best career & major matches! 👋",
              })
            : currentIndex === Math.floor(questions.length / 2)
            ? getLocalized({
                km: "ដល់ពាក់កណ្តាលផ្លូវហើយ! លឿនមែន ⚡",
                en: "Halfway mark! Fast & steady ⚡",
              })
            : currentIndex === questions.length - 1
            ? getLocalized({
                km: "សំណួរចុងក្រោយបង្អស់! តោះបញ្ចប់ 🚀",
                en: "Final question! Let's wrap this up 🚀",
              })
            : getLocalized({
                km: `សំណួរទី ${currentIndex + 1} នៃ ${questions.length} • តើអ្នកមានអារម្មណ៍យ៉ាងណាដែរ? 🤔`,
                en: `Q${currentIndex + 1} of ${questions.length} • How do you feel about this activity? 🤔`,
              })
        }
        mascotScaleLevel={
          currentVal !== undefined && currentVal !== null
            ? currentVal <= 2
              ? 6
              : currentVal === 3
              ? 4
              : 2
            : null
        }
        onPrefill={handleQuickPrefill}
        onSubmit={handleSubmit}
        onClearDraft={handleClearDraft}
        isSubmitting={submitting}
        submitButtonText={getLocalized({ km: "គណនា Holland Code 🚀", en: "Compute Holland Code 🚀" })}
      />
    </div>
  );
}
