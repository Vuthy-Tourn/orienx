"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { MagneticSpectrumSlider } from "@/components/assessments/magnetic-spectrum-slider";
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Compass,
  Award,
  Layers,
  Zap,
} from "lucide-react";

type DimensionGroup = "EI" | "SN" | "TF" | "JP";

const DIMENSION_INFO: Record<
  DimensionGroup,
  {
    code: string;
    name_en: string;
    name_km: string;
    desc_en: string;
    desc_km: string;
  }
> = {
  EI: {
    code: "E vs I",
    name_en: "Energy & Social Focus (Extraversion vs Introversion)",
    name_km: "ថាមពល និងការប្រាស្រ័យទាក់ទង (Extraversion vs Introversion)",
    desc_en: "Where you draw energy from: group collaboration vs quiet deep reflection.",
    desc_km: "ប្រភពនៃថាមពលផ្លូវចិត្ត៖ ការធ្វើការជាក្រុម ឬភាពស្ងប់ស្ងាត់ដើម្បីផ្តោតអារម្មណ៍ស៊ីជម្រៅ។",
  },
  SN: {
    code: "S vs N",
    name_en: "Information Processing (Sensing vs Intuition)",
    name_km: "ការទទួលព័ត៌មាន (Sensing vs Intuition)",
    desc_en: "How you take in information: concrete facts vs future theories and patterns.",
    desc_km: "របៀបទទួល និងយល់ដឹងព័ត៌មាន៖ ការពិតជាក់ស្តែង ឬការស្រមើស្រមៃ និងទស្សនវិស័យអនាគត។",
  },
  TF: {
    code: "T vs F",
    name_en: "Decision Making (Thinking vs Feeling)",
    name_km: "ការសម្រេចចិត្ត (Thinking vs Feeling)",
    desc_en: "How you make choices: objective logic vs human empathy and values.",
    desc_km: "របៀបធ្វើការសម្រេចចិត្ត៖ ផ្អែកលើតក្កវិជ្ជា និងគោលការណ៍ ឬផ្អែកលើអារម្មណ៍ និងភាពសុខដុម។",
  },
  JP: {
    code: "J vs P",
    name_en: "Lifestyle & Structure (Judging vs Perceiving)",
    name_km: "រចនាសម្ព័ន្ធជីវិត (Judging vs Perceiving)",
    desc_en: "How you organize tasks: structured plans vs open adaptable flexibility.",
    desc_km: "របៀបរៀបចំជីវិត និងការងារ៖ ផែនការច្បាស់លាស់ ឬភាពបត់បែនតាមកាលៈទេសៈជាក់ស្តែង។",
  },
};

export default function PersonalityAssessmentPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { optionId: string; sliderValue: number }>
  >({});
  const [autoAdvance, setAutoAdvance] = useState(true);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

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

  const handleSliderChange = (
    questionId: string,
    sliderValue: number,
    optionId: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { optionId, sliderValue },
    }));

    // Auto-advance with smooth grace period
    if (autoAdvance && questions && currentIndex < questions.length - 1) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
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
      selected_option_id: val.optionId,
    }));

    if (formatted.length < questions.length) {
      alert(
        language === "km"
          ? `សូមឆ្លើយគ្រប់សំណួរទាំង ${questions.length} មុនពេលបញ្ជូន (អ្នកបានឆ្លើយ ${formatted.length}/${questions.length})`
          : `Please answer all ${questions.length} questions before submitting (${formatted.length}/${questions.length} answered).`
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
    const prefill: Record<string, { optionId: string; sliderValue: number }> = {};
    questions.forEach((q, idx) => {
      const sliderVal = idx % 2 === 0 ? 1 : 5;
      const optId = idx % 2 === 0 ? q.options[0]?.id : q.options[1]?.id;
      prefill[q.id] = { optionId: optId, sliderValue: sliderVal };
    });
    setAnswers(prefill);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-24 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#111965] border-t-transparent animate-spin" />
        <span className="font-semibold">
          {language === "km"
            ? "កំពុងផ្ទុកប្រព័ន្ធវាស់វែងបុគ្គលិកលក្ខណៈ..."
            : "Initializing Magnetic Personality Spectrum..."}
        </span>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions?.length || 12;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const currentQ = questions?.[currentIndex];
  const currentDimension = (currentQ?.dimension as DimensionGroup) || "EI";
  const dimInfo = DIMENSION_INFO[currentDimension] || DIMENSION_INFO.EI;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
            <Link href="/dashboard" className="hover:text-[#111965]">
              {language === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[#111965]">
              {language === "km" ? "តេស្តបុគ្គលិកលក្ខណៈ MBTI" : "MBTI Assessment"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
            {language === "km"
              ? "រង្វាស់បុគ្គលិកលក្ខណៈ (Magnetic Spectrum Stage)"
              : "Personality Assessment (Magnetic Spectrum Stage)"}
          </h1>
          <p className="text-xs sm:text-sm text-[#68708A] mt-1">
            {language === "km"
              ? "អូស ឬចុចលើរង្វាស់ដើម្បីកំណត់ទំនោរធម្មជាតិរបស់អ្នករវាងទិសដៅទាំងពីរ។"
              : "Dial the magnetic compass between the two opposing poles to capture your authentic preference."}
          </p>
        </div>

        {/* View Switcher: Interactive Stage vs Results */}
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
            <span>{language === "km" ? "ទម្រង់ធ្វើតេស្ត" : "Spectrum Stage"}</span>
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
          {/* Result Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965] uppercase tracking-wider self-start">
                {language === "km" ? "លទ្ធផលបុគ្គលិកលក្ខណៈរបស់អ្នក" : "Your Personality Type Profile"}
              </span>

              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === "km" ? "ធ្វើតេស្តឡើងវិញ (Retake)" : "Retake Assessment"}</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight">
                {latestResult.personality_type}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {language === "km"
                  ? latestResult.traits_summary_km?.title || "អ្នកដឹកនាំ និងរៀបចំយុទ្ធសាស្ត្រ"
                  : latestResult.traits_summary_en?.title || "Strategic Planner & Organizer"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed mt-2">
                {language === "km"
                  ? latestResult.traits_summary_km?.work_style
                  : latestResult.traits_summary_en?.work_style}
              </p>
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
                    className="bg-blue-600 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.introversion_score}%` }}
                    className="bg-indigo-900 rounded-r-full"
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
                    className="bg-amber-500 rounded-l-full"
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
                    className="bg-emerald-600 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.feeling_score}%` }}
                    className="bg-rose-500 rounded-r-full"
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
                    className="bg-indigo-600 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.perceiving_score}%` }}
                    className="bg-orange-500 rounded-r-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CINEMATIC MAGNETIC SPECTRUM QUESTION STAGE
          ======================================================== */}
      {activeTab === "form" && currentQ && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Progress & Dimension Stage Header */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Dimension Group Breadcrumb */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#F0F2FA] text-[#111965] uppercase tracking-wider">
                    Dimension {currentDimension}: {dimInfo.code}
                  </span>
                  <span className="text-xs font-bold text-[#111965]">
                    Question {currentIndex + 1} of {totalCount}
                  </span>
                </div>

                <p className="text-xs text-[#68708A]">
                  {language === "km" ? dimInfo.name_km : dimInfo.name_en}
                </p>
              </div>

              {/* Quick Controls */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#68708A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded text-[#111965]"
                  />
                  <span>Auto-Advance</span>
                </label>

                <button
                  type="button"
                  onClick={handleQuickPrefill}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] transition-colors"
                >
                  ⚡ Prefill All
                </button>
              </div>
            </div>

            {/* Continuous Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#111965] via-blue-600 to-[#F7CE4D] transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* Central Question Display Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#68708A]">
                Scenario {currentIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111965] leading-snug">
                {language === "km" ? currentQ.prompt_km : currentQ.prompt_en}
              </h2>
            </div>

            {/* The Magnetic Spectrum Slider with Dynamic Floating Shields */}
            <MagneticSpectrumSlider
              optionA={currentQ.options[0]}
              optionB={currentQ.options[1]}
              value={currentAnswer?.sliderValue ?? null}
              onChange={(sliderVal, optionId) =>
                handleSliderChange(currentQ.id, sliderVal, optionId)
              }
              language={language}
            />
          </div>

          {/* Bottom Stage Navigation & 12 Mini Checkpoints */}
          <div className="p-5 rounded-3xl bg-white border border-[#E6E8F0] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "km" ? "សំណួរមុន" : "Previous"}</span>
            </button>

            {/* 12 Interactive Checkpoint Dots */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {questions?.map((q, idx) => {
                const isQAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#111965] text-[#F7CE4D] ring-2 ring-[#F7CE4D] shadow-xs scale-110"
                        : isQAnswered
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Next or Submit Button */}
            {currentIndex === totalCount - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount < totalCount || submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#111965]" />
                <span>
                  {submitting
                    ? "Evaluating..."
                    : language === "km"
                    ? "បញ្ចប់ និងវិភាគលទ្ធផល MBTI"
                    : "Complete & Evaluate MBTI"}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-40 transition-all shadow-xs"
              >
                <span>{language === "km" ? "បន្ទាប់" : "Next Question"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
