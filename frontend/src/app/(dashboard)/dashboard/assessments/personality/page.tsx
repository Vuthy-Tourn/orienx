"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import { Scale16p } from "@/components/assessments/scale-16p";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Compass,
  Award,
} from "lucide-react";

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
    tipEn: "Where do you naturally recharge your energy? 🌟",
    tipKm: "តើអ្នកបញ្ចូលថាមពលដោយវិធីណា? 🌟",
  },
  SN: {
    code: "S vs N",
    nameEn: "Information Processing (Sensing vs Intuition)",
    nameKm: "ការទទួលព័ត៌មាន (Sensing vs Intuition)",
    tipEn: "Do you focus on practical facts or big ideas? 🧱✨",
    tipKm: "តើអ្នកផ្តោតលើការអនុវត្តជាក់ស្តែង ឬគំនិតច្នៃប្រឌិត? 🧱✨",
  },
  TF: {
    code: "T vs F",
    nameEn: "Decision Making (Thinking vs Feeling)",
    nameKm: "ការសម្រេចចិត្ត (Thinking vs Feeling)",
    tipEn: "What guides your choices: logic or empathy? 💎🌸",
    tipKm: "តើអ្វីដឹកនាំការសម្រេចចិត្ត៖ តក្កវិជ្ជា ឬអារម្មណ៍? 💎🌸",
  },
  JP: {
    code: "J vs P",
    nameEn: "Lifestyle Structure (Judging vs Perceiving)",
    nameKm: "រចនាសម្ព័ន្ធជីវិត (Judging vs Perceiving)",
    tipEn: "Do you prefer a clear plan or flexible freedom? 📋🌊",
    tipKm: "តើអ្នកចូលចិត្តផែនការរៀបរយ ឬសេរីភាពបត់បែន? 📋🌊",
  },
};

export default function PersonalityAssessmentPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { scaleLevel: number; selectedOptionId: string }>
  >({});
  const [autoAdvance, setAutoAdvance] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (latestResult && Object.keys(answers).length === 0) {
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
      queryClient.invalidateQueries({ queryKey: ["latest-personality"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

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

    // Smooth auto-advance
    if (autoAdvance && questions && currentIndex < questions.length - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 550);
    }
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;
    const formatted = Object.entries(answers).map(([qid, val]) => ({
      question_id: qid,
      selected_option_id: val.selectedOptionId,
    }));

    if (formatted.length < questions.length) {
      alert(
        language === "km"
          ? `សូមឆ្លើយគ្រប់សំណួរទាំង ${questions.length} មុនពេលបញ្ចប់`
          : `Please answer all ${questions.length} questions before submitting.`
      );
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

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions?.length || 12;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const currentQ = questions?.[currentIndex];
  const dimGroup = (currentQ?.dimension as DimensionGroup) || "EI";
  const dimMeta = DIMENSION_TITLES[dimGroup] || DIMENSION_TITLES.EI;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Declarative statement
  const statementEn = currentQ?.options[0]?.label_en || currentQ?.prompt_en;
  const statementKm = currentQ?.options[0]?.label_km || currentQ?.prompt_km;

  // Mascot dynamic speech: greeting tip when idle vs enthusiastic cheer when answered
  const isAnswered = !!currentAnswer;
  const speechText = isAnswered
    ? language === "km"
      ? "ចម្លើយល្អណាស់! បន្តទៀត! ✨"
      : "Awesome choice! Keep shining! ✨"
    : language === "km"
    ? dimMeta.tipKm
    : dimMeta.tipEn;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in pb-20 select-none">
      {/* Top Breadcrumb & Minimal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
            <Link href="/dashboard" className="hover:text-[#111965]">
              {language === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[#111965]">
              {language === "km" ? "តេស្តបុគ្គលិកលក្ខណៈ" : "Personality Assessment"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
            {language === "km" ? "ស្វែងយល់បុគ្គលិកលក្ខណៈរបស់អ្នក" : "Discover Your Personality"}
          </h1>
        </div>

        {/* View Switcher: Interactive Test vs Results */}
        <div className="flex items-center bg-[#F0F2FA] p-1 rounded-2xl border border-[#E6E8F0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-[#111965] text-white shadow-2xs"
                : "text-[#68708A] hover:text-[#171A2C]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ធ្វើតេស្ត" : "Questions"}</span>
          </button>

          {latestResult && (
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "results"
                  ? "bg-[#111965] text-white shadow-2xs"
                  : "text-[#68708A] hover:text-[#171A2C]"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#F7CE4D]" />
              <span>{latestResult.personality_type} Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          RESULTS VIEW
          ======================================================== */}
      {activeTab === "results" && latestResult && (
        <div className="space-y-8 animate-in fade-in">
          {/* Result Banner with Platform Mascot Celebrating */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965] uppercase tracking-wider inline-block">
                  {language === "km" ? "លទ្ធផលបុគ្គលិកលក្ខណៈរបស់អ្នក" : "Your Personality Type Profile"}
                </span>

                <div className="text-5xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight">
                  {latestResult.personality_type}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {language === "km"
                    ? latestResult.traits_summary_km?.title || "អ្នកដឹកនាំ និងរៀបចំយុទ្ធសាស្ត្រ"
                    : latestResult.traits_summary_en?.title || "Strategic Planner & Organizer"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {language === "km"
                    ? latestResult.traits_summary_km?.work_style
                    : latestResult.traits_summary_en?.work_style}
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleRetake}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === "km" ? "ធ្វើតេស្តឡើងវិញ (Retake)" : "Retake Assessment"}</span>
                  </button>
                </div>
              </div>

              {/* Celebrating Mascot Tara - Borderless & Dynamic */}
              <div className="flex-shrink-0 self-center sm:self-auto relative pt-8 pb-2">
                <FuteraMascot
                  variant="full-jumping"
                  emotion="congratulation"
                  showSpeech={true}
                  size={210}
                  speechText={language === "km" ? "អបអរសាទរ! 🌟" : "Congratulations! 🌟"}
                />
              </div>
            </div>
          </div>

          {/* 4 Dimension Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-6">
            <h3 className="text-base sm:text-lg font-black text-[#111965]">
              {language === "km"
                ? "ពិន្ទុវិមាត្រទាំង ៤ (The 4 Preference Dimensions)"
                : "The 4 Preference Dimension Breakdown"}
            </h3>

            <div className="space-y-6">
              {/* E vs I */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171A2C]">
                  <span>Extraversion (E) — {latestResult.extraversion_score}%</span>
                  <span>Introversion (I) — {latestResult.introversion_score}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                  <div
                    style={{ width: `${latestResult.extraversion_score}%` }}
                    className="bg-emerald-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.introversion_score}%` }}
                    className="bg-purple-600 rounded-r-full"
                  />
                </div>
              </div>

              {/* S vs N */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171A2C]">
                  <span>Sensing (S) — {latestResult.sensing_score}%</span>
                  <span>Intuition (N) — {latestResult.intuition_score}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                  <div
                    style={{ width: `${latestResult.sensing_score}%` }}
                    className="bg-emerald-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.intuition_score}%` }}
                    className="bg-purple-600 rounded-r-full"
                  />
                </div>
              </div>

              {/* T vs F */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171A2C]">
                  <span>Thinking (T) — {latestResult.thinking_score}%</span>
                  <span>Feeling (F) — {latestResult.feeling_score}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                  <div
                    style={{ width: `${latestResult.thinking_score}%` }}
                    className="bg-emerald-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.feeling_score}%` }}
                    className="bg-purple-600 rounded-r-full"
                  />
                </div>
              </div>

              {/* J vs P */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171A2C]">
                  <span>Judging (J) — {latestResult.judging_score}%</span>
                  <span>Perceiving (P) — {latestResult.perceiving_score}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                  <div
                    style={{ width: `${latestResult.judging_score}%` }}
                    className="bg-emerald-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.perceiving_score}%` }}
                    className="bg-purple-600 rounded-r-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CLEAN 16PERSONALITIES STYLE WITH EXTRACTED TARA MASCOT
          ======================================================== */}
      {activeTab === "form" && currentQ && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Progress & Navigation Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#68708A]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#111965] text-[#F7CE4D] uppercase tracking-wider">
                  {language === "km" ? dimMeta.nameKm : dimMeta.nameEn}
                </span>
                <span className="text-[#111965] font-black tracking-wide hidden sm:inline">
                  • {currentIndex + 1} / {totalCount}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickPrefill}
                  className="text-[11px] font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Prefill answers to test completion instantly"
                >
                  ⚡ Prefill
                </button>
                <span className="text-[#111965] font-bold">{progressPercent}%</span>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#111965] via-emerald-500 to-[#F7CE4D] transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* Main Stage Card with 3D Overhanging Mascot on Right Side */}
          <div className="relative pt-6">
            {/* Overhanging Extracted Mascot Peeking on Top-Right Corner */}
            <div className="absolute -top-14 -right-1 sm:-top-16 sm:-right-4 z-20 pointer-events-auto">
              <FuteraMascot
                variant="peeking-right"
                scaleLevel={currentAnswer?.scaleLevel ?? null}
                showSpeech={true}
                speechText={
                  currentAnswer?.scaleLevel !== undefined && currentAnswer?.scaleLevel !== null
                    ? currentAnswer.scaleLevel <= 3
                      ? language === "km"
                        ? "យល់ស្រប! អស្ចារ្យណាស់! 🌟"
                        : "Agree! Awesome! 🌟"
                      : currentAnswer.scaleLevel === 7
                      ? language === "km"
                        ? "មិនយល់ស្របដាច់ខាត! 😤"
                        : "Strongly Disagree! 😤"
                      : currentAnswer.scaleLevel >= 5
                      ? language === "km"
                        ? "មិនយល់ស្របទេ? ខ្ញុំយល់ហើយ... 🥺"
                        : "Disagree? I understand... 🥺"
                      : language === "km"
                      ? "អព្យាក្រឹត... កំពុងគិត 🤔"
                      : "Neutral... Thinking 🤔"
                    : currentIndex === 0
                    ? language === "km"
                      ? "សួស្តី! ចាប់ផ្តើមសំណួរដំបូង! 👋"
                      : "Hello! Let's start Q1! 👋"
                    : language === "km"
                    ? "តើអ្នកយល់យ៉ាងណាដែរ? 🤔"
                    : "What do you think? 🤔"
                }
              />
            </div>

            {/* Clean White Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-8 text-center relative overflow-hidden">
              {/* Declarative Statement (16Personalities style) */}
              <div className="max-w-xl mx-auto space-y-2 pt-2 pb-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#111965] leading-snug">
                  {language === "km" ? statementKm : statementEn}
                </h2>
                <p className="text-xs text-[#68708A]">
                  {language === "km"
                    ? currentQ?.prompt_km
                    : currentQ?.prompt_en}
                </p>
              </div>

              {/* Clean 7-Circle Likert Scale exactly matching Pic 1 */}
              <div className="pt-2">
                <Scale16p
                  value={currentAnswer?.scaleLevel ?? null}
                  onChange={(level) => handleScaleChange(currentQ, level)}
                  language={language}
                />
              </div>
            </div>
          </div>

          {/* Clean Bottom Navigation & Question Dots */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "km" ? "សំណួរមុន" : "Previous"}</span>
            </button>

            {/* Checkpoint Dots (1 to 12) */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {questions?.map((q, idx) => {
                const isQAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "bg-[#111965] text-[#F7CE4D] ring-2 ring-[#F7CE4D] scale-110 shadow-xs"
                        : isQAnswered
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Next or Complete Assessment Button */}
            {currentIndex === totalCount - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount < totalCount || submitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md disabled:opacity-40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#111965]" />
                <span>
                  {submitting
                    ? "Evaluating..."
                    : language === "km"
                    ? "បញ្ចប់ និងវិភាគលទ្ធផល"
                    : "Complete Assessment"}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-30 transition-all shadow-xs cursor-pointer"
              >
                <span>{language === "km" ? "បន្ទាប់" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
