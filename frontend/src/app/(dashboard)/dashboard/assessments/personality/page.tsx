"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { FuteraBlobCharacter, TraitCode } from "@/components/assessments/futera-character";
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

interface MascotMeta {
  traitA: TraitCode;
  traitB: TraitCode;
  nameAEn: string;
  nameAKm: string;
  nameBEn: string;
  nameBKm: string;
  speechAEn: string;
  speechAKm: string;
  speechBEn: string;
  speechBKm: string;
  groupTitleEn: string;
  groupTitleKm: string;
}

const DIMENSION_METAS: Record<DimensionGroup, MascotMeta> = {
  EI: {
    traitA: "E",
    traitB: "I",
    nameAEn: "Sol ☀️ (Extravert)",
    nameAKm: "Sol ☀️ (ថាមពលសង្គម)",
    nameBEn: "Luna 🎧 (Introvert)",
    nameBKm: "Luna 🎧 (ថាមពលស្ងប់ស្ងាត់)",
    speechAEn: "I love social energy! ☀️",
    speechAKm: "ចូលចិត្តជួបជុំមិត្តភក្តិ! ☀️",
    speechBEn: "Quiet space recharges me! 🎧",
    speechBKm: "ភាពស្ងប់ស្ងាត់ជួយផ្ដល់ថាមពល! 🎧",
    groupTitleEn: "Energy & Social Focus (E vs I)",
    groupTitleKm: "ថាមពល និងការប្រាស្រ័យទាក់ទង (E vs I)",
  },
  SN: {
    traitA: "S",
    traitB: "N",
    nameAEn: "Geo 🧱 (Sensing)",
    nameAKm: "Geo 🧱 (ការអនុវត្តជាក់ស្តែង)",
    nameBEn: "Nova ☁️ (Intuition)",
    nameBKm: "Nova ☁️ (ទស្សនវិស័យ)",
    speechAEn: "Real facts & practical details! 🧱",
    speechAKm: "ផ្តោតលើការពិត និងការអនុវត្តផ្ទាល់! 🧱",
    speechBEn: "Big vision & imagination! ☁️",
    speechBKm: "គំនិតច្នៃប្រឌិត និងអនាគត! ☁️",
    groupTitleEn: "Information Processing (S vs N)",
    groupTitleKm: "ការទទួលព័ត៌មាន (S vs N)",
  },
  TF: {
    traitA: "T",
    traitB: "F",
    nameAEn: "Prism 💎 (Thinking)",
    nameAKm: "Prism 💎 (តក្កវិជ្ជា)",
    nameBEn: "Hearty 🌸 (Feeling)",
    nameBKm: "Hearty 🌸 (ការយល់ចិត្ត)",
    speechAEn: "Logic & objective truth! 💎",
    speechAKm: "តក្កវិជ្ជា និងភាពច្បាស់លាស់! 💎",
    speechBEn: "Empathy & harmony! 🌸",
    speechBKm: "អារម្មណ៍ និងការយល់ចិត្ត! 🌸",
    groupTitleEn: "Decision Making (T vs F)",
    groupTitleKm: "ការសម្រេចចិត្ត (T vs F)",
  },
  JP: {
    traitA: "J",
    traitB: "P",
    nameAEn: "Checky 📋 (Judging)",
    nameAKm: "Checky 📋 (ផែនការរៀបរយ)",
    nameBEn: "Wavey 🌊 (Perceiving)",
    nameBKm: "Wavey 🌊 (ភាពបត់បែន)",
    speechAEn: "Clear checklist & plans! 📋",
    speechAKm: "ផែនការច្បាស់លាស់ និងរៀបរយ! 📋",
    speechBEn: "Flow with spontaneous freedom! 🌊",
    speechBKm: "បត់បែនតាមកាលៈទេសៈ! 🌊",
    groupTitleEn: "Lifestyle Structure (J vs P)",
    groupTitleKm: "រចនាសម្ព័ន្ធជីវិត (J vs P)",
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

    // Smooth 16Personalities-style auto-advance
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
  const dimMeta = DIMENSION_METAS[dimGroup] || DIMENSION_METAS.EI;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Declarative statement
  const statementEn = currentQ?.options[0]?.label_en || currentQ?.prompt_en;
  const statementKm = currentQ?.options[0]?.label_km || currentQ?.prompt_km;

  // Dynamic reactions for the two opposing mascots on stage
  const scaleVal = currentAnswer?.scaleLevel;
  const isAgreeLeaning = scaleVal !== undefined && scaleVal <= 3;
  const isDisagreeLeaning = scaleVal !== undefined && scaleVal >= 5;
  const isNeutral = scaleVal === 4;

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
                    className="bg-orange-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.intuition_score}%` }}
                    className="bg-sky-500 rounded-r-full"
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
                    className="bg-teal-500 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.feeling_score}%` }}
                    className="bg-pink-500 rounded-r-full"
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
                    className="bg-emerald-600 rounded-l-full"
                  />
                  <div
                    style={{ width: `${latestResult.perceiving_score}%` }}
                    className="bg-amber-500 rounded-r-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          16PERSONALITIES STYLE WITH BESPOKE FUTERA GEOMETRIC MASCOTS
          ======================================================== */}
      {activeTab === "form" && currentQ && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Progress & Navigation Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#68708A]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#111965] text-[#F7CE4D] uppercase tracking-wider">
                  {language === "km" ? dimMeta.groupTitleKm : dimMeta.groupTitleEn}
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

          {/* Main Stage Card */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-8 text-center relative overflow-hidden">
            {/* Playful Opposing Mascots Arena (Inspired by Image 1) */}
            <div className="flex items-center justify-between px-2 sm:px-8 pt-4">
              {/* Left Mascot (Agree Pole) */}
              <div className="flex flex-col items-center gap-1.5 transition-all">
                <FuteraBlobCharacter
                  trait={dimMeta.traitA}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  expression={isAgreeLeaning ? "excited" : isNeutral ? "curious" : "idle"}
                  showSpeech={isAgreeLeaning}
                  speechText={language === "km" ? dimMeta.speechAKm : dimMeta.speechAEn}
                />
                <span className="text-[11px] sm:text-xs font-black text-emerald-700 max-w-[120px] text-center">
                  {language === "km" ? dimMeta.nameAKm : dimMeta.nameAEn}
                </span>
              </div>

              {/* Central VS Badge */}
              <div className="hidden sm:flex flex-col items-center opacity-60">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                  VS
                </span>
              </div>

              {/* Right Mascot (Disagree Pole) */}
              <div className="flex flex-col items-center gap-1.5 transition-all">
                <FuteraBlobCharacter
                  trait={dimMeta.traitB}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  expression={isDisagreeLeaning ? "excited" : isNeutral ? "curious" : "idle"}
                  showSpeech={isDisagreeLeaning}
                  speechText={language === "km" ? dimMeta.speechBKm : dimMeta.speechBEn}
                />
                <span className="text-[11px] sm:text-xs font-black text-purple-700 max-w-[120px] text-center">
                  {language === "km" ? dimMeta.nameBKm : dimMeta.nameBEn}
                </span>
              </div>
            </div>

            {/* Declarative Statement (16Personalities style) */}
            <div className="max-w-xl mx-auto space-y-2 py-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#111965] leading-snug">
                {language === "km" ? statementKm : statementEn}
              </h2>
              <p className="text-xs text-[#68708A]">
                {language === "km"
                  ? currentQ?.prompt_km
                  : currentQ?.prompt_en}
              </p>
            </div>

            {/* 16Personalities-Style 7 Scaled Circles with Cute Animated Micro-Faces */}
            <div className="pt-2">
              <Scale16p
                value={currentAnswer?.scaleLevel ?? null}
                onChange={(level) => handleScaleChange(currentQ, level)}
                language={language}
                agreeLabelEn="Agree"
                agreeLabelKm="យល់ស្រប"
                disagreeLabelEn="Disagree"
                disagreeLabelKm="មិនយល់ស្រប"
              />
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
