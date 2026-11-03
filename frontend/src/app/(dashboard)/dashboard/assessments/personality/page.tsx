"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraCharacter } from "@/components/assessments/futera-character";
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

const CHARACTER_TITLES: Record<
  string,
  {
    nameEn: string;
    nameKm: string;
    archetypeEn: string;
    archetypeKm: string;
  }
> = {
  E: {
    nameEn: "Sol — The Outward Spark",
    nameKm: "Sol — ថាមពលសហការ",
    archetypeEn: "Energized by teamwork, debate & social connection",
    archetypeKm: "ស្រស់ស្រាយ និងមានកម្លាំងចិត្តពេលធ្វើការជាក្រុម",
  },
  I: {
    nameEn: "Luna — The Deep Sanctuary",
    nameKm: "Luna — ភាពស្ងប់ស្ងាត់ស៊ីជម្រៅ",
    archetypeEn: "Recharges in peaceful solitude & deep focus",
    archetypeKm: "បញ្ចូលថាមពលឡើងវិញតាមរយៈភាពស្ងប់ស្ងាត់ម្នាក់ឯង",
  },
  S: {
    nameEn: "Geo — The Practical Builder",
    nameKm: "Geo — អ្នកអនុវត្តជាក់ស្តែង",
    archetypeEn: "Grounded in concrete facts, evidence & reality",
    archetypeKm: "ផ្តោតលើការពិត ភស្តុតាង និងការអនុវត្តជាក់ស្តែង",
  },
  N: {
    nameEn: "Nova — The Future Visionary",
    nameKm: "Nova — អ្នកស្រមៃអនាគត",
    archetypeEn: "Drawn to theories, cosmic patterns & possibilities",
    archetypeKm: "ចាប់អារម្មណ៍លើទ្រឹស្តី គំរូ និងទស្សនវិស័យអនាគត",
  },
  T: {
    nameEn: "Logic — The Analytical Mind",
    nameKm: "Logic — តក្កវិជ្ជាសុក្រឹត",
    archetypeEn: "Guided by objective truth, principles & reason",
    archetypeKm: "សម្រេចចិត្តផ្អែកលើហេតុផល និងគោលការណ៍ត្រឹមត្រូវ",
  },
  F: {
    nameEn: "Hearty — The Empathetic Heart",
    nameKm: "Hearty — បេះដូងមនុស្សធម៌",
    archetypeEn: "Guided by human warmth, empathy & harmony",
    archetypeKm: "សម្រេចចិត្តផ្អែកលើការយល់ចិត្ត និងសុខដុមរមនា",
  },
  J: {
    nameEn: "Checky — The Structured Planner",
    nameKm: "Checky — អ្នករៀបចំផែនការ",
    archetypeEn: "Thrives with deadlines, checklists & clear closure",
    archetypeKm: "ពេញចិត្តនឹងកាលវិភាគ ផែនការ និងការបញ្ចប់ច្បាស់លាស់",
  },
  P: {
    nameEn: "Wavey — The Adaptable Free Flow",
    nameKm: "Wavey — ភាពបត់បែនសេរី",
    archetypeEn: "Thrives with spontaneity, open options & flexibility",
    archetypeKm: "ពេញចិត្តនឹងភាពបត់បែន ធ្វើតាមកាលៈទេសៈជាក់ស្តែង",
  },
};

export default function PersonalityAssessmentPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
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
    if (latestResult && Object.keys(selectedAnswers).length === 0) {
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

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Smooth playful auto-advance to next question
    if (autoAdvance && questions && currentIndex < questions.length - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 450);
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
    const formatted = Object.entries(selectedAnswers).map(([qid, oid]) => ({
      question_id: qid,
      selected_option_id: oid,
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
    setSelectedAnswers({});
    setCurrentIndex(0);
    setActiveTab("form");
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefill: Record<string, string> = {};
    questions.forEach((q, idx) => {
      prefill[q.id] = idx % 2 === 0 ? q.options[0]?.id : q.options[1]?.id;
    });
    setSelectedAnswers(prefill);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-24 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#111965] border-t-transparent animate-spin" />
        <span className="font-semibold">Loading questions...</span>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions?.length || 12;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const currentQ = questions?.[currentIndex];
  const selectedOptionId = currentQ ? selectedAnswers[currentQ.id] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20 select-none">
      {/* Top Breadcrumb & Minimal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
            <Link href="/dashboard" className="hover:text-[#111965]">
              {language === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[#111965]">
              {language === "km" ? "តេស្តស្វែងយល់បុគ្គលិកលក្ខណៈ" : "Personality Discovery"}
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
          RADICALLY CLEAN & PLAYFUL CHARACTER STAGE
          ======================================================== */}
      {activeTab === "form" && currentQ && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Progress Bar & Counter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#68708A]">
              <span className="text-[#111965] font-black tracking-wide">
                QUESTION {currentIndex + 1} OF {totalCount}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickPrefill}
                  className="text-[11px] font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] px-2.5 py-1 rounded-lg transition-colors"
                >
                  ⚡ Prefill
                </button>
                <span className="text-[#111965] font-bold">{progressPercent}%</span>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#111965] to-[#F7CE4D] transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* Question Prompt */}
          <div className="text-center max-w-2xl mx-auto py-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#111965] leading-snug">
              {language === "km" ? currentQ.prompt_km : currentQ.prompt_en}
            </h2>
          </div>

          {/* TWO PLAYFUL CHARACTER CARDS (SIDE BY SIDE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
            {currentQ.options.map((opt: any, idx: number) => {
              const isSelected = selectedOptionId === opt.id;
              const meta = CHARACTER_TITLES[opt.target_trait] || {
                nameEn: `Character ${opt.target_trait}`,
                nameKm: `តួអង្គ ${opt.target_trait}`,
                archetypeEn: "Personal Preference",
                archetypeKm: "ចំណូលចិត្តផ្ទាល់ខ្លួន",
              };

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`group cursor-pointer rounded-3xl p-7 sm:p-8 border-3 transition-all duration-300 flex flex-col items-center text-center justify-between gap-6 relative overflow-hidden ${
                    isSelected
                      ? "border-[#111965] bg-gradient-to-b from-[#FFF9E6] via-white to-[#F0F2FA] shadow-2xl ring-4 ring-[#F7CE4D] scale-[1.03] -translate-y-1"
                      : "border-[#E6E8F0] bg-white hover:border-[#111965]/40 hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {/* Floating Selection Star Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965] shadow-xs flex items-center gap-1 animate-in zoom-in-95">
                      <Sparkles className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{language === "km" ? "បានជ្រើសរើស" : "Chosen!"}</span>
                    </div>
                  )}

                  {/* Character Illustration */}
                  <div className="pt-2">
                    <FuteraCharacter
                      trait={opt.target_trait}
                      className="w-32 h-32 sm:w-36 sm:h-36"
                      isSelected={isSelected}
                    />
                  </div>

                  {/* Character Name & Narrative */}
                  <div className="space-y-2">
                    <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#68708A]">
                      {language === "km" ? meta.nameKm : meta.nameEn}
                    </span>

                    <h3 className="text-base sm:text-lg font-bold text-[#171A2C] leading-snug">
                      {language === "km" ? opt.label_km : opt.label_en}
                    </h3>

                    <p className="text-xs text-[#68708A] pt-1">
                      {language === "km" ? meta.archetypeKm : meta.archetypeEn}
                    </p>
                  </div>

                  {/* Playful Tap Button */}
                  <button
                    type="button"
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-[#111965] text-[#F7CE4D] shadow-md"
                        : "bg-[#F0F2FA] text-[#111965] group-hover:bg-[#111965] group-hover:text-white"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#F7CE4D]" />
                        <span>{language === "km" ? "នេះជាខ្ញុំ! ✓" : "This is Me! ✓"}</span>
                      </>
                    ) : (
                      <span>{language === "km" ? "ជ្រើសរើសមួយនេះ" : "Choose This"}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Clean Bottom Navigation & Question Dots */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA] disabled:opacity-25 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "km" ? "សំណួរមុន" : "Previous"}</span>
            </button>

            {/* Checkpoint Dots (1 to 12) */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {questions?.map((q, idx) => {
                const isQAnswered = !!selectedAnswers[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center ${
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
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md disabled:opacity-40 transition-all"
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
                disabled={!selectedOptionId}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-30 transition-all shadow-xs"
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
