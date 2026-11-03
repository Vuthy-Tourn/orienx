"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export default function PersonalityAssessmentPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

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

  // 3. Submit mutation
  const { mutate: submitAssessment, isPending: submitting } = useMutation({
    mutationFn: async (answers: Array<{ question_id: string; selected_option_id: string }>) => {
      return apiFetch("/assessments/personality/submit", {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["latest-personality"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setShowResults(true);
    },
  });

  const activeResult = latestResult || (showResults ? latestResult : null);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!questions) return;
    const formatted = Object.entries(selectedAnswers).map(([qid, oid]) => ({
      question_id: qid,
      selected_option_id: oid,
    }));
    if (formatted.length < questions.length) {
      alert(language === "km" ? "សូមឆ្លើយគ្រប់សំណួរទាំងអស់មុនពេលបញ្ចប់" : "Please answer all questions before submitting");
      return;
    }
    submitAssessment(formatted);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-20 text-center text-sm text-[#68708A]">
        {language === "km" ? "កំពុងទាញយកសំណួរតេស្ត..." : "Loading assessment questions..."}
      </div>
    );
  }

  // If user already completed or just submitted, show results view
  if ((latestResult && !selectedAnswers[questions?.[0]?.id] && !showResults) || showResults) {
    const res = latestResult;
    const summary = language === "km" ? res?.traits_summary_km : res?.traits_summary_en;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        {/* Result Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
              Personality Dimension Result
            </span>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === "km" ? "ធ្វើតេស្តឡើងវិញ" : "Retake Test"}</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-[#F7CE4D] tracking-tight">
              {res?.personality_type}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {summary?.title || "Strategic Thinker"}
            </h2>
          </div>
        </div>

        {/* 4 Dimension Meters */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-6">
          <h3 className="text-base font-extrabold text-[#111965]">
            {language === "km" ? "ពិន្ទុវិមាត្រទាំង ៤ (Four Preference Dimensions)" : "The Four Preference Dimensions"}
          </h3>

          <div className="space-y-5 text-xs">
            {/* Dimension 1: E vs I */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#171A2C]">
                <span>Extraversion (E) — {res?.extraversion_score}%</span>
                <span>Introversion (I) — {res?.introversion_score}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: `${res?.extraversion_score}%` }} className="bg-blue-500" />
                <div style={{ width: `${res?.introversion_score}%` }} className="bg-[#111965]" />
              </div>
            </div>

            {/* Dimension 2: S vs N */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#171A2C]">
                <span>Sensing (S) — {res?.sensing_score}%</span>
                <span>Intuition (N) — {res?.intuition_score}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: `${res?.sensing_score}%` }} className="bg-amber-500" />
                <div style={{ width: `${res?.intuition_score}%` }} className="bg-purple-600" />
              </div>
            </div>

            {/* Dimension 3: T vs F */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#171A2C]">
                <span>Thinking (T) — {res?.thinking_score}%</span>
                <span>Feeling (F) — {res?.feeling_score}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: `${res?.thinking_score}%` }} className="bg-emerald-600" />
                <div style={{ width: `${res?.feeling_score}%` }} className="bg-rose-500" />
              </div>
            </div>

            {/* Dimension 4: J vs P */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#171A2C]">
                <span>Judging (J) — {res?.judging_score}%</span>
                <span>Perceiving (P) — {res?.perceiving_score}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: `${res?.judging_score}%` }} className="bg-indigo-600" />
                <div style={{ width: `${res?.perceiving_score}%` }} className="bg-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{language === "km" ? "ចំណុចខ្លាំងសំខាន់ៗ" : "Core Strengths"}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#171A2C]">
              {summary?.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{language === "km" ? "ឱកាសអភិវឌ្ឍន៍" : "Growth Opportunities"}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#171A2C]">
              {summary?.growth_areas?.map((g: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Step CTA */}
        <div className="p-6 rounded-2xl bg-[#F0F2FA] border border-[#111965]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#111965]">
              {language === "km" ? "ជំហានបន្ទាប់៖ តេស្តចំណាប់អារម្មណ៍អាជីព RIASEC" : "Next Step: RIASEC Career Interest Test"}
            </h4>
            <p className="text-xs text-[#68708A]">
              Discover your Holland interest code to connect with suitable majors.
            </p>
          </div>
          <Link
            href="/dashboard/assessments/riasec"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{language === "km" ? "បន្តទៅតេស្ត RIASEC" : "Take RIASEC Test"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Questionnaire Runner View
  if (!questions || questions.length === 0) {
    return <div className="py-20 text-center text-sm text-[#68708A]">No questions available.</div>;
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isCurrentAnswered = !!selectedAnswers[currentQ.id];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#68708A]">
          <span>
            {language === "km" ? "សំណួរទី" : "Question"} {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-bold text-[#111965]">{progressPercent}% Completed</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#111965] transition-all duration-300 rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965] uppercase">
            Dimension: {currentQ.dimension}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#111965] leading-relaxed">
            {language === "km" ? currentQ.prompt_km : currentQ.prompt_en}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt: any) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 flex items-start gap-3 ${
                  isSelected
                    ? "border-[#111965] bg-[#F0F2FA] shadow-xs"
                    : "border-[#E6E8F0] hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "border-[#111965] bg-[#111965]" : "border-slate-300"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#F7CE4D]" />}
                </div>

                <div className="text-xs sm:text-sm font-medium text-[#171A2C] leading-relaxed">
                  {language === "km" ? opt.label_km : opt.label_en}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#68708A] hover:text-[#111965] disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "km" ? "ថយក្រោយ" : "Previous"}</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentAnswered || submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs disabled:opacity-40"
          >
            <span>{submitting ? "Evaluating..." : language === "km" ? "បញ្ចប់ និងមើលលទ្ធផល" : "Submit Assessment"}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-40 shadow-2xs"
          >
            <span>{language === "km" ? "បន្ទាប់" : "Next"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

