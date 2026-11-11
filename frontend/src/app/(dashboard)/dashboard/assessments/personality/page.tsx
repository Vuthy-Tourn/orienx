"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import { AssessmentStage, AssessmentStepItem } from "@/components/assessments/assessment-stage";
import { AssessmentViewSwitcher } from "@/components/assessments/assessment-view-switcher";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Compass,
  Award,
  Crown,
  CheckCircle2,
  GraduationCap,
  Brain,
  Lightbulb,
  Target,
  Zap,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type DimensionGroup = "EI" | "SN" | "TF" | "JP";

const DIMENSION_TITLES: Record<
  DimensionGroup,
  {
    code: string;
    nameEn: string;
    nameKm: string;
    tipEn: string;
    tipKm: string;
  }
> = {
  EI: {
    code: "E vs I",
    nameEn: "Energy & Social Focus (Extraversion vs Introversion)",
    nameKm: "ថាមពល និងការប្រាស្រ័យទាក់ទង (Extraversion vs Introversion)",
    tipEn: "Where do you naturally recharge your energy?",
    tipKm: "តើអ្នកបញ្ចូលថាមពលដោយវិធីណា?",
  },
  SN: {
    code: "S vs N",
    nameEn: "Information Processing (Sensing vs Intuition)",
    nameKm: "ការទទួលព័ត៌មាន (Sensing vs Intuition)",
    tipEn: "Do you focus on practical facts or big ideas?",
    tipKm: "តើអ្នកផ្តោតលើការអនុវត្តជាក់ស្តែង ឬគំនិតច្នៃប្រឌិត?",
  },
  TF: {
    code: "T vs F",
    nameEn: "Decision Making (Thinking vs Feeling)",
    nameKm: "ការសម្រេចចិត្ត (Thinking vs Feeling)",
    tipEn: "What guides your choices: logic or empathy?",
    tipKm: "តើអ្វីដឹកនាំការសម្រេចចិត្ត៖ តក្កវិជ្ជា ឬអារម្មណ៍?",
  },
  JP: {
    code: "J vs P",
    nameEn: "Lifestyle Structure (Judging vs Perceiving)",
    nameKm: "រចនាសម្ព័ន្ធជីវិត (Judging vs Perceiving)",
    tipEn: "Do you prefer a clear plan or flexible freedom?",
    tipKm: "តើអ្នកចូលចិត្តផែនការរៀបរយ ឬសេរីភាពបត់បែន?",
  },
};

const ARCHETYPE_META: Record<
  string,
  {
    nameKm: string;
    nameEn: string;
    taglineKm: string;
    taglineEn: string;
  }
> = {
  ESTJ: {
    nameKm: "The Executive • អ្នករៀបចំ និងដឹកនាំយុទ្ធសាស្ត្រ",
    nameEn: "The Executive • Dedicated Organizer",
    taglineKm: "អ្នកពូកែរៀបចំរចនាសម្ព័ន្ធ មានភាពជាអ្នកដឹកនាំជាក់ស្តែង និងការសម្រេចចិត្តប្រកបដោយការទទួលខុសត្រូវខ្ពស់។",
    taglineEn: "Practical, organized, and focused on decisive execution with high reliability.",
  },
  ENTJ: {
    nameKm: "The Commander • អ្នកដឹកនាំចក្ខុវិស័យ",
    nameEn: "The Commander • Bold Visionary",
    taglineKm: "មានចក្ខុវិស័យទូលំទូលាយ ពូកែជំរុញ និងដឹកនាំក្រុមសម្រេចគោលដៅយុទ្ធសាស្ត្រធំៗ។",
    taglineEn: "Bold, imaginative, and strong-willed leader finding a way or making one.",
  },
  ISTJ: {
    nameKm: "The Inspector • អ្នកអនុវត្តប្រព័ន្ធ និងវិន័យ",
    nameEn: "The Inspector • Responsible Realist",
    taglineKm: "ផ្តោតលើភាពជាក់លាក់ ការទទួលខុសត្រូវខ្ពស់ និងការប្រកាន់ខ្ជាប់នូវគោលការណ៍ត្រឹមត្រូវ។",
    taglineEn: "Practical and fact-minded individuals, whose reliability cannot be doubted.",
  },
  INTJ: {
    nameKm: "The Architect • អ្នកយុទ្ធសាស្ត្រស៊ីជម្រៅ",
    nameEn: "The Architect • Strategic Thinker",
    taglineKm: "ការគិតបែបវិភាគស៊ីជម្រៅ ស្វែងរកដំណោះស្រាយប្លែក និងប្រកបដោយប្រសិទ្ធភាពខ្ពស់។",
    taglineEn: "Imaginative and strategic thinkers, with a plan for everything.",
  },
};

export default function PersonalityAssessmentPage() {
  const { t, getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { scaleLevel: number; selectedOptionId: string }>
  >({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const DRAFT_STORAGE_KEY = "futera_personality_draft_v1";

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (typeof parsed.currentIndex === "number") {
            setCurrentIndex(parsed.currentIndex);
          }
          setActiveTab("form");
        }
      }
    } catch (e) {
      console.error("Failed to load Personality draft", e);
    }
  }, []);

  // Auto-save draft whenever answers or currentIndex change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ answers, currentIndex, updatedAt: Date.now() })
        );
      } catch (e) {
        console.error("Failed to save Personality draft", e);
      }
    }
  }, [answers, currentIndex]);

  // 1. Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["personality-questions"],
    queryFn: async () => apiFetch<any[]>("/assessments/personality/questions"),
  });

  // 2. Fetch latest result if exists
  const { data: latestResult, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-personality"],
    queryFn: async () => apiFetch<any>("/assessments/personality/latest"),
  });

  // 3. Fetch recommended majors and universities for results view
  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
    enabled: activeTab === "results",
  });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
    let hasDraft = false;
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        hasDraft = parsed.answers && Object.keys(parsed.answers).length > 0;
      }
    } catch {}

    if (latestResult && Object.keys(answers).length === 0 && !hasDraft) {
      setActiveTab("results");
    }
  }, [latestResult]);

  // 3. Submit mutation
  const { mutate: submitAssessment, isPending: submitting } = useMutation({
    mutationFn: async (payload: Array<{ question_id: string; selected_option_id: string }>) => {
      return apiFetch("/assessments/personality/submit", {
        method: "POST",
        body: JSON.stringify({ answers: payload }),
      });
    },
    onSuccess: () => {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["latest-personality"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setAnswers({});
    setCurrentIndex(0);
  };

  const handleScaleChange = (question: any, scaleLevel: number) => {
    const optA = question.options[0];
    const optB = question.options[1];
    const chosenOptionId = scaleLevel <= 3 ? optA?.id : scaleLevel >= 5 ? optB?.id : optA?.id;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        scaleLevel,
        selectedOptionId: chosenOptionId,
      },
    }));

    if (timerRef.current) clearTimeout(timerRef.current);
    if (questions && currentIndex < questions.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 550);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;
    const formatted = Object.entries(answers).map(([qid, val]) => ({
      question_id: qid,
      selected_option_id: val.selectedOptionId,
    }));

    if (formatted.length < questions.length) {
      alert(t("personalityAssessment.answerAllAlert") || "Please answer all questions before submitting.");
      return;
    }
    submitAssessment(formatted);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setActiveTab("form");
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefill: Record<string, { scaleLevel: number; selectedOptionId: string }> = {};
    questions.forEach((q, idx) => {
      const level = idx % 2 === 0 ? 1 : 6;
      const optId = level <= 3 ? q.options[0]?.id : q.options[1]?.id;
      prefill[q.id] = { scaleLevel: level, selectedOptionId: optId };
    });
    setAnswers(prefill);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-24 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#111965] border-t-transparent animate-spin" />
        <span className="font-semibold">Loading assessment questions...</span>
      </div>
    );
  }

  // ========================================================
  // RESULTS VIEW (Redesigned, Engaging & Consistent)
  // ========================================================
  if (activeTab === "results" && latestResult) {
    const pType = latestResult.personality_type || "ESTJ";
    const arch = ARCHETYPE_META[pType] || {
      nameKm: `${pType} • អ្នកដឹកនាំ និងរៀបចំ`,
      nameEn: `${pType} • Profile Archetype`,
      taglineKm: "អ្នកមានបុគ្គលិកលក្ខណៈពិសេសក្នុងការគិត និងការអនុវត្តការងារ។",
      taglineEn: "A distinctive archetype combining analytical focus and practical action.",
    };

    const traitsKm = latestResult.traits_summary_km || {};
    const strengths = traitsKm.strengths || ["ភាពបត់បែនខ្ពស់", "ការផ្តោតលើគោលដៅ", "ការយកចិត្តទុកដាក់"];
    const learningStyle = traitsKm.learning_style || "ការរៀនចម្រុះរវាងទ្រឹស្តី និងការអនុវត្តជាក់ស្តែង";
    const bestFields = traitsKm.best_fields || ["ជំនាញពហុវិស័យ & STEM"];

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
                {t("personalityAssessment.breadcrumb")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {t("personalityAssessment.title")}
            </h1>
          </div>

          {/* View Switcher: Interactive Test vs Results */}
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${pType} Profile`}
            profileIcon={Crown}
            hasResult={!!latestResult}
          />
        </div>

        {/* 1. CELEBRATION HERO BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] via-[#161F7A] to-[#1E277A] text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#111965]" />
                <span>{t("personalityAssessment.resultsBadge") || "លទ្ធផលបុគ្គលិកលក្ខណៈ"}</span>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight drop-shadow-sm">
                  {pType}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {getLocalized({ km: arch.nameKm, en: arch.nameEn })}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                {getLocalized({ km: arch.taglineKm, en: arch.taglineEn })}
              </p>

              <div className="pt-1">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("personalityAssessment.retake") || "ធ្វើតេស្តឡើងវិញ"}</span>
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
                speechText={t("personalityAssessment.mascotCongrats") || "អបអរសាទរ! ទទួលបានលទ្ធផលហើយ!"}
              />
            </div>
          </div>
        </div>

        {/* 2. THREE KEY INSIGHT CARDS (Strengths, Learning Style, Best Fields) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Key Strengths */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                ចំណុចខ្លាំងចម្បង (Strengths)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {strengths.map((s: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-100"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                រចនាប័ទ្មសិក្សា (Learning Style)
              </span>
            </div>
            <p className="text-xs text-[#171A2C] leading-relaxed font-medium pt-1">
              {learningStyle}
            </p>
          </div>

          {/* Ideal Academic Fields */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-purple-700">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Brain className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                វិស័យសិក្សាសាកសម (Best Fields)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bestFields.map((f: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50/80 text-purple-800 border border-purple-100"
                >
                  <Zap className="w-3 h-3 text-purple-600" />
                  <span>{f}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 4 PREFERENCE DIMENSION BREAKDOWN (16Personalities Spectrum Rails) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#111965]">
              {t("personalityAssessment.dimensionBreakdown") || "ពិន្ទុវិមាត្រទាំង ៤ (The 4 Preference Dimensions)"}
            </h3>
            <p className="text-xs text-[#68708A]">
              កម្រិតទំនោរចិត្តរវាងប៉ូលផ្ទុយគ្នានីមួយៗនៃការសម្រេចចិត្ត និងការប្រាស្រ័យទាក់ទង
            </p>
          </div>

          <div className="space-y-5">
            {/* Dimension 1: Extraversion vs Introversion */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0]/70">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-black flex items-center gap-1.5 ${latestResult.extraversion_score >= 50 ? "text-sky-700" : "text-[#68708A]"}`}>
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Extraversion (E) — {latestResult.extraversion_score}%</span>
                </span>
                <span className={`font-black flex items-center gap-1.5 ${latestResult.introversion_score > 50 ? "text-indigo-700" : "text-[#68708A]"}`}>
                  <span>Introversion (I) — {latestResult.introversion_score}%</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                <div
                  style={{ width: `${latestResult.extraversion_score}%` }}
                  className="bg-gradient-to-r from-sky-400 to-sky-600 rounded-l-full h-full"
                />
                <div
                  style={{ width: `${latestResult.introversion_score}%` }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-r-full h-full"
                />
              </div>
              <p className="text-[11px] text-[#68708A]">
                {latestResult.extraversion_score >= 50
                  ? "អ្នកទទួលបានថាមពលពីការធ្វើការងារជាក្រុម ការពិភាក្សាផ្លាស់ប្តូរគំនិត និងបរិស្ថានសង្គមរស់រវើក។"
                  : "អ្នកបញ្ចូលថាមពលនៅកន្លែងស្ងប់ស្ងាត់ និងការផ្តោតអារម្មណ៍ស៊ីជម្រៅតែម្នាក់ឯង។"}
              </p>
            </div>

            {/* Dimension 2: Sensing vs Intuition */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0]/70">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-black flex items-center gap-1.5 ${latestResult.sensing_score >= 50 ? "text-emerald-700" : "text-[#68708A]"}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sensing (S) — {latestResult.sensing_score}%</span>
                </span>
                <span className={`font-black flex items-center gap-1.5 ${latestResult.intuition_score > 50 ? "text-purple-700" : "text-[#68708A]"}`}>
                  <span>Intuition (N) — {latestResult.intuition_score}%</span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                <div
                  style={{ width: `${latestResult.sensing_score}%` }}
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-l-full h-full"
                />
                <div
                  style={{ width: `${latestResult.intuition_score}%` }}
                  className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-r-full h-full"
                />
              </div>
              <p className="text-[11px] text-[#68708A]">
                {latestResult.sensing_score >= 50
                  ? "អ្នកផ្តោតលើទិន្នន័យជាក់ស្តែង ការអនុវត្តជាក់លាក់ និងបទពិសោធន៍ផ្ទាល់ដៃ។"
                  : "អ្នកចាប់អារម្មណ៍លើគំនិតច្នៃប្រឌិតថ្មីៗ ចក្ខុវិស័យអនាគត និងទ្រឹស្តីទូលំទូលាយ។"}
              </p>
            </div>

            {/* Dimension 3: Thinking vs Feeling */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0]/70">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-black flex items-center gap-1.5 ${latestResult.thinking_score >= 50 ? "text-amber-700" : "text-[#68708A]"}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Thinking (T) — {latestResult.thinking_score}%</span>
                </span>
                <span className={`font-black flex items-center gap-1.5 ${latestResult.feeling_score > 50 ? "text-rose-700" : "text-[#68708A]"}`}>
                  <span>Feeling (F) — {latestResult.feeling_score}%</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                <div
                  style={{ width: `${latestResult.thinking_score}%` }}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-l-full h-full"
                />
                <div
                  style={{ width: `${latestResult.feeling_score}%` }}
                  className="bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full h-full"
                />
              </div>
              <p className="text-[11px] text-[#68708A]">
                {latestResult.thinking_score >= 50
                  ? "អ្នកធ្វើការសម្រេចចិត្តដោយផ្អែកលើតក្កវិជ្ជា ការវិភាគមិនលំអៀង និងគោលការណ៍ត្រឹមត្រូវ។"
                  : "អ្នកផ្តល់អាទិភាពលើតម្លៃមនុស្ស ភាពសុខដុមរមនា និងផលប៉ះពាល់ដល់អារម្មណ៍អ្នកដទៃ។"}
              </p>
            </div>

            {/* Dimension 4: Judging vs Perceiving */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0]/70">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-black flex items-center gap-1.5 ${latestResult.judging_score >= 50 ? "text-teal-700" : "text-[#68708A]"}`}>
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Judging (J) — {latestResult.judging_score}%</span>
                </span>
                <span className={`font-black flex items-center gap-1.5 ${latestResult.perceiving_score > 50 ? "text-pink-700" : "text-[#68708A]"}`}>
                  <span>Perceiving (P) — {latestResult.perceiving_score}%</span>
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden p-0.5 relative">
                <div
                  style={{ width: `${latestResult.judging_score}%` }}
                  className="bg-gradient-to-r from-teal-400 to-teal-600 rounded-l-full h-full"
                />
                <div
                  style={{ width: `${latestResult.perceiving_score}%` }}
                  className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-r-full h-full"
                />
              </div>
              <p className="text-[11px] text-[#68708A]">
                {latestResult.judging_score >= 50
                  ? "អ្នកចូលចិត្តផែនការច្បាស់លាស់ កាលវិភាគរៀបរយ និងការសម្រេចកិច្ចការទាន់ពេលវេលា។"
                  : "អ្នកចូលចិត្តភាពបត់បែន រក្សាជម្រើសបើកទូលាយ និងអាចសម្របតាមស្ថានភាពផ្លាស់ប្តូរភ្លាមៗ។"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. RECOMMENDED MAJORS & UNIVERSITIES FOR THIS MBTI */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E8F0] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{t("personalityAssessment.mbtiMatchesBadge") || "អនុសាសន៍ AI ផ្អែកលើបុគ្គលិកលក្ខណៈ"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {t("personalityAssessment.recommendedMajorsTitle") || `មុខជំនាញ និងសាកលវិទ្យាល័យដែលសាកសមនឹង ${pType}`}
              </h3>
              <p className="text-xs text-[#68708A]">
                {t("personalityAssessment.recommendedMajorsSubtitle") || `ជំនាញ និងគ្រឹះស្ថានឧត្តមសិក្សាដែលត្រូវគ្នានឹងទម្រង់ការគិត និងការសម្រេចចិត្តបែប ${pType} របស់អ្នក`}
              </p>
            </div>

            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.viewAllRecommendations") || "មើលអនុសាសន៍ទាំងអស់"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#E6E8F0] space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec: any) => {
                const major = rec.major || {};
                const exp = rec.explanation || {};
                const unis = major.offering_universities || [];

                return (
                  <div
                    key={rec.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#E6E8F0] bg-gradient-to-b from-white to-[#FAFBFD] hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg text-xs font-black bg-[#111965] text-[#F7CE4D] flex items-center justify-center">
                            #{rec.rank_position}
                          </span>
                          <span className="text-[10px] font-bold text-[#68708A] uppercase">
                            {major.category}
                          </span>
                          {major.is_stem && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-50 text-sky-700 border border-sky-200">
                              STEM
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {rec.match_score}% Fit
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-[#111965] leading-snug">
                        {getLocalized(major.name)}
                      </h4>

                      {/* Rationale snippet */}
                      <p className="text-[11px] text-[#4A5568] line-clamp-2 leading-relaxed bg-[#F8FAFD] p-2 rounded-xl border border-[#E6E8F0]/70">
                        {getLocalized({ km: exp.personality_reason_km, en: exp.personality_reason_en }) ||
                          getLocalized({ km: exp.fit_summary_km, en: exp.fit_summary_en })}
                      </p>
                    </div>

                    {/* Offering Universities */}
                    <div className="pt-2 border-t border-[#E6E8F0] space-y-2">
                      <div className="text-[10px] font-bold text-[#68708A] uppercase flex items-center justify-between">
                        <span>{t("personalityAssessment.offeringInstitutions") || "សាកលវិទ្យាល័យដែលបង្រៀន:"}</span>
                        <span className="font-semibold text-slate-500">
                          {unis.length} {t("recommendationsPage.institutions") || "កន្លែង"}
                        </span>
                      </div>

                      {unis.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {unis.slice(0, 3).map((u: any) => (
                            <Link
                              key={u.university_id}
                              href={`/universities/${u.university_slug}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#F0F2FA] text-[#111965] hover:bg-[#111965] hover:text-white transition-colors"
                              title={getLocalized(u.university_name)}
                            >
                              <Building2 className="w-2.5 h-2.5 opacity-60" />
                              <span>{getLocalized(u.university_acronym) || u.university_slug.toUpperCase()}</span>
                              {u.tuition_annual_usd ? (
                                <span className="text-[9px] opacity-75 font-normal">
                                  (${Math.round(u.tuition_annual_usd)})
                                </span>
                              ) : null}
                            </Link>
                          ))}
                          {unis.length > 3 && (
                            <span className="text-[10px] font-semibold text-[#68708A]">
                              +{unis.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#68708A] italic">
                          សាកលវិទ្យាល័យកំពុងត្រូវបានផ្ទៀងផ្ទាត់
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <Link
                          href={`/majors/${major.slug}`}
                          className="text-[11px] font-bold text-[#68708A] hover:text-[#111965] transition-colors"
                        >
                          {t("recommendationsPage.details") || "ព័ត៌មានលម្អិត"}
                        </Link>

                        <Link
                          href={`/universities?major=${major.slug}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
                        >
                          <span>{t("recommendationsPage.universities") || "សាកលវិទ្យាល័យ"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-[#68708A]">
              មិនទាន់មានអនុសាសន៍នៅឡើយទេ
            </div>
          )}
        </div>

        {/* 5. NEXT STEP CTA CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F0F2FA] to-[#E8EBF8] border border-[#111965]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
              ជំហានបន្ទាប់៖ ធ្វើតេស្តចំណាប់អារម្មណ៍អាជីព RIASEC
            </h4>
            <p className="text-xs text-[#68708A]">
              អនុសាសន៍ដំបូងផ្អែកលើបុគ្គលិកលក្ខណៈ {pType} របស់អ្នកបានគណនារួចរាល់! ធ្វើតេស្ត RIASEC ដើម្បីបង្កើនភាពសុក្រឹតបន្ថែមទៀត។
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs text-[#111965] bg-white border border-[#E6E8F0] hover:bg-[#F0F2FA] shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.viewAllRecommendations") || "មើលអនុសាសន៍"}</span>
            </Link>
            <Link
              href="/dashboard/assessments/riasec"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>ធ្វើតេស្ត RIASEC</span>
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

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Format questions for shared AssessmentStage component
  const formattedQuestions: AssessmentStepItem[] = questions.map((q: any) => {
    const dimGroup = (q.dimension || q.category || "EI") as DimensionGroup;
    const dim = DIMENSION_TITLES[dimGroup];
    const stEn = q.options?.[0]?.label_en || q.prompt_en?.replace(/^I\s+/i, "") || q.prompt_en || "";
    const stKm = q.options?.[0]?.label_km || q.prompt_km || "";

    return {
      id: q.id,
      promptKm: q.prompt_km,
      promptEn: q.prompt_en,
      statementKm: stKm,
      statementEn: stEn,
      dimensionCode: dim?.code || dimGroup,
      dimensionNameKm: dim?.nameKm || dimGroup,
      dimensionNameEn: dim?.nameEn || dimGroup,
    };
  });

  return (
    <div className="pb-16">
      <AssessmentStage
        breadcrumbText={`${t("personalityAssessment.dashboard")} / ${t("personalityAssessment.breadcrumb")}`}
        pageTitle={t("personalityAssessment.title")}
        headerAction={
          <AssessmentViewSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
            profileLabel={`${latestResult?.personality_type || "ESTJ"} Profile`}
            profileIcon={Crown}
            hasResult={!!latestResult}
          />
        }
        questions={formattedQuestions}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        answers={answers}
        onAnswer={(qId, level) => {
          const targetQ = questions.find((q: any) => q.id === qId);
          if (targetQ) handleScaleChange(targetQ, level);
        }}
        scaleType="7-point"
        leftAnchorKm="យល់ស្រប"
        leftAnchorEn="Agree"
        rightAnchorKm="មិនយល់ស្រប"
        rightAnchorEn="Disagree"
        mascotSpeech={
          currentAnswer?.scaleLevel !== undefined && currentAnswer?.scaleLevel !== null
            ? currentAnswer.scaleLevel <= 2
              ? getLocalized({
                  km: "យល់ស្របខ្លាំង! ច្បាស់លាស់ណាស់ 🚀✨",
                  en: "Strongly Agree! Crystal clear 🚀✨",
                })
              : currentAnswer.scaleLevel === 3
              ? getLocalized({
                  km: "យល់ស្រប! ត្រូវនឹងចិត្តអ្នក ✨",
                  en: "Agree! True to who you are ✨",
                })
              : currentAnswer.scaleLevel === 4
              ? getLocalized({
                  km: "អព្យាក្រឹត! ថ្លឹងថ្លែងយ៉ាងម៉ត់ចត់ ⚖️",
                  en: "Neutral! Balanced reflection ⚖️",
                })
              : currentAnswer.scaleLevel <= 6
              ? getLocalized({
                  km: "មិនសូវយល់ស្របទេ! យល់ច្បាស់ហើយ 💡",
                  en: "Disagree! Understood 💡",
                })
              : getLocalized({
                  km: "មិនយល់ស្របដាច់ខាត! ដឹងច្បាស់ពីខ្លួនឯង ⚡",
                  en: "Strongly Disagree! Clear boundaries ⚡",
                })
            : currentIndex === 0
            ? getLocalized({
                km: "សួស្តី! តោះចាប់ផ្តើមសំណួរទី ១! 👋",
                en: "Hello! Let's start Q1! 👋",
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
                km: `សំណួរទី ${currentIndex + 1} នៃ ${questions.length} • តើអ្នកយល់យ៉ាងណាដែរ? 🤔`,
                en: `Q${currentIndex + 1} of ${questions.length} • What do you think? 🤔`,
              })
        }
        mascotScaleLevel={currentAnswer?.scaleLevel ?? null}
        onPrefill={handleQuickPrefill}
        onSubmit={handleSubmit}
        onClearDraft={handleClearDraft}
        isSubmitting={submitting}
        submitButtonText={t("personalityAssessment.complete")}
      />
    </div>
  );
}
