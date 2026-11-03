"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { ArchetypeGlyph } from "@/components/assessments/archetype-glyph";
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  ListOrdered,
  Layers,
  HelpCircle,
  Award,
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
    color: string;
  }
> = {
  EI: {
    code: "E vs I",
    name_en: "Energy & Social Focus (Extraversion vs Introversion)",
    name_km: "ថាមពល និងការប្រាស្រ័យទាក់ទង (Extraversion vs Introversion)",
    desc_en: "Where you draw energy from: social interaction and group work vs quiet solitude and deep reflection.",
    desc_km: "ប្រភពនៃថាមពលផ្លូវចិត្ត៖ ការធ្វើការជាក្រុម និងការប្រាស្រ័យទាក់ទង ឬភាពស្ងប់ស្ងាត់ដើម្បីផ្តោតអារម្មណ៍ស៊ីជម្រៅ។",
    color: "from-blue-600 to-indigo-700",
  },
  SN: {
    code: "S vs N",
    name_en: "Information Processing (Sensing vs Intuition)",
    name_km: "ការទទួលព័ត៌មាន (Sensing vs Intuition)",
    desc_en: "How you take in information: concrete facts and hands-on reality vs patterns, theories, and future possibilities.",
    desc_km: "របៀបទទួល និងយល់ដឹងព័ត៌មាន៖ ការពិតជាក់ស្តែង ភស្តុតាងជាក់លាក់ ឬការស្រមើស្រមៃ ទស្សនវិស័យ និងលទ្ធភាពអនាគត។",
    color: "from-amber-500 to-orange-600",
  },
  TF: {
    code: "T vs F",
    name_en: "Decision Making (Thinking vs Feeling)",
    name_km: "ការសម្រេចចិត្ត (Thinking vs Feeling)",
    desc_en: "How you make choices: objective logic and principles vs human empathy, values, and harmonious impact.",
    desc_km: "របៀបធ្វើការសម្រេចចិត្ត៖ ផ្អែកលើតក្កវិជ្ជា គោលការណ៍ត្រឹមត្រូវ ឬផ្អែកលើអារម្មណ៍ តម្លៃមនុស្សធម៌ និងភាពសុខដុម។",
    color: "from-emerald-600 to-teal-700",
  },
  JP: {
    code: "J vs P",
    name_en: "Lifestyle & Structure (Judging vs Perceiving)",
    name_km: "រចនាសម្ព័ន្ធជីវិត (Judging vs Perceiving)",
    desc_en: "How you approach daily tasks: structured planning and firm closure vs flexibility, spontaneity, and open options.",
    desc_km: "របៀបរៀបចំជីវិត និងការងារ៖ ផែនការច្បាស់លាស់ កាលវិភាគ ឬភាពបត់បែន ធ្វើតាមកាលៈទេសៈជាក់ស្តែង។",
    color: "from-purple-600 to-pink-600",
  },
};

const TRAIT_TITLES: Record<string, { en: string; km: string }> = {
  E: { en: "Outward Collaboration", km: "កិច្ចសហការ និងថាមពលខាងក្រៅ" },
  I: { en: "Deep Solo Focus", km: "ការផ្តោតអារម្មណ៍ស៊ីជម្រៅម្នាក់ឯង" },
  S: { en: "Concrete Facts & Reality", km: "ការពិត និងការអនុវត្តជាក់ស្តែង" },
  N: { en: "Theories & Future Vision", km: "ទ្រឹស្តី និងទស្សនវិស័យអនាគត" },
  T: { en: "Objective Logic & Principles", km: "តក្កវិជ្ជា និងគោលការណ៍ត្រឹមត្រូវ" },
  F: { en: "Human Values & Empathy", km: "តម្លៃមនុស្សធម៌ និងការយល់ចិត្ត" },
  J: { en: "Structured Schedule & Deadlines", km: "កាលវិភាគ និងផែនការច្បាស់លាស់" },
  P: { en: "Spontaneous & Adaptable Flow", km: "ភាពបត់បែនតាមកាលៈទេសៈជាក់ស្តែង" },
};

export default function PersonalityAssessmentPage() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Mode: "results" or "form"
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [formLayout, setFormLayout] = useState<"grouped" | "stepper">("grouped");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

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

  // Set default tab to results if student already has a completed test
  useEffect(() => {
    if (latestResult && Object.keys(selectedAnswers).length === 0) {
      setActiveTab("results");
    }
  }, [latestResult]);

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
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
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
    setSelectedAnswers({});
    setCurrentIndex(0);
    setActiveTab("form");
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefill: Record<string, string> = {};
    questions.forEach((q, idx) => {
      // Pick first option for even index, second for odd
      const optIdx = idx % 2 === 0 ? 0 : 1;
      prefill[q.id] = q.options[optIdx]?.id;
    });
    setSelectedAnswers(prefill);
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-20 text-center text-sm text-[#68708A] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#111965] border-t-transparent animate-spin" />
        <span>{language === "km" ? "កំពុងទាញយកសំណួរតេស្ត MBTI..." : "Loading MBTI assessment questions..."}</span>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions?.length || 12;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  // Group questions by dimension
  const groupedQuestions: Record<DimensionGroup, any[]> = {
    EI: [],
    SN: [],
    TF: [],
    JP: [],
  };

  questions?.forEach((q) => {
    const dim = (q.dimension as DimensionGroup) || "EI";
    if (groupedQuestions[dim]) {
      groupedQuestions[dim].push(q);
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-16">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#68708A] mb-1">
            <Link href="/dashboard" className="hover:text-[#111965]">
              {language === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[#111965]">
              {language === "km" ? "តេស្តបុគ្គលិកលក្ខណៈ MBTI" : "MBTI Assessment"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] tracking-tight">
            {language === "km" ? "តេស្តស្វែងយល់បុគ្គលិកលក្ខណៈ (MBTI ៤ វិមាត្រ)" : "Personality Assessment (MBTI 4-Dimensions)"}
          </h1>
          <p className="text-xs sm:text-sm text-[#68708A] mt-1">
            {language === "km"
              ? "សំណួរដើម ១២ សំណួរដែលចែកជា ៤ ក្រុមវិមាត្រ ដើម្បីរកឃើញទម្រង់នៃការគិត និងការរៀនសូត្ររបស់អ្នក។"
              : "12 original psychometric questions grouped across 4 dimensions to reveal your cognitive and learning style."}
          </p>
        </div>

        {/* View Switcher: Test Form vs Results */}
        <div className="flex items-center bg-[#F0F2FA] p-1 rounded-2xl border border-[#E6E8F0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-[#111965] text-white shadow-2xs"
                : "text-[#68708A] hover:text-[#171A2C]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ទម្រង់ធ្វើតេស្ត (១២ សំណួរ)" : "Assessment Form"}</span>
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
              <span>{latestResult.personality_type} Results</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RESULTS VIEW                                             */}
      {/* ======================================================== */}
      {activeTab === "results" && latestResult && (
        <div className="space-y-8 animate-in fade-in">
          {/* Result Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider self-start">
                {language === "km" ? "លទ្ធផលបុគ្គលិកលក្ខណៈរបស់អ្នក" : "Your Personality Type Profile"}
              </span>

              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors self-start sm:self-auto"
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

          {/* 4 Dimension Breakdown with visual meters */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#111965]">
                {language === "km"
                  ? "ពិន្ទុវិមាត្រទាំង ៤ (The 4 Preference Dimensions)"
                  : "The 4 Preference Dimension Breakdown"}
              </h3>
              <span className="text-xs text-[#68708A]">100% Self-Reported</span>
            </div>

            <div className="space-y-6">
              {/* 1. E vs I */}
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

              {/* 2. S vs N */}
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

              {/* 3. T vs F */}
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

              {/* 4. J vs P */}
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

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === "km" ? "ចំណុចខ្លាំងសំខាន់ៗ" : "Core Strengths"}</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#171A2C]">
                {(
                  (language === "km"
                    ? latestResult.traits_summary_km?.strengths
                    : latestResult.traits_summary_en?.strengths) || [
                    "Strong analytical structure",
                    "Decisive project execution",
                  ]
                ).map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === "km" ? "បរិយាកាសសិក្សាដែលសមស្រប" : "Preferred Learning Environment"}</span>
              </h4>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {language === "km"
                  ? latestResult.traits_summary_km?.learning_style || "ចូលចិត្តការរៀនសូត្រដែលមានរចនាសម្ព័ន្ធ និងការអនុវត្តជាក់ស្តែង"
                  : latestResult.traits_summary_en?.learning_style || "Thrives in structured, goal-oriented coursework with measurable milestones."}
              </p>
            </div>
          </div>

          {/* Next Assessment CTA */}
          <div className="p-6 rounded-3xl bg-[#F0F2FA] border border-[#111965]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#111965]">
                {language === "km" ? "ជំហានបន្ទាប់៖ តេស្តចំណាប់អារម្មណ៍អាជីព RIASEC" : "Next Step: RIASEC Career Interest Test"}
              </h4>
              <p className="text-xs text-[#68708A]">
                Discover your Holland interest code to connect your personality with suitable university majors.
              </p>
            </div>
            <Link
              href="/dashboard/assessments/riasec"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-2 whitespace-nowrap"
            >
              <span>{language === "km" ? "បន្តទៅតេស្ត RIASEC" : "Take RIASEC Test"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ASSESSMENT FORM VIEW (GROUPED OR STEPPER)                */}
      {/* ======================================================== */}
      {activeTab === "form" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Progress Header & Quick Actions */}
          <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111965]">
                    {answeredCount} of {totalCount} Questions Answered
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7CE4D]/30 text-[#111965] font-bold">
                    {progressPercent}%
                  </span>
                </div>
                <p className="text-xs text-[#68708A]">
                  {language === "km"
                    ? "ជ្រើសរើសចម្លើយដែលឆ្លុះបញ្ចាំងពីចំណូលចិត្តធម្មជាតិរបស់អ្នកបំផុត។"
                    : "Select the option that feels most natural to how you typically study and collaborate."}
                </p>
              </div>

              {/* Layout Switcher: Grouped by Dimension vs Step-by-Step */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickPrefill}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] transition-colors"
                  title="Prefill sample answers for rapid testing"
                >
                  ⚡ Demo Autofill
                </button>

                <div className="flex items-center bg-[#F5F6FA] p-0.5 rounded-xl border border-[#E6E8F0]">
                  <button
                    onClick={() => setFormLayout("grouped")}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      formLayout === "grouped" ? "bg-white text-[#111965] shadow-2xs" : "text-[#68708A]"
                    }`}
                    title="Grouped by Dimensions"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFormLayout("stepper")}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      formLayout === "stepper" ? "bg-white text-[#111965] shadow-2xs" : "text-[#68708A]"
                    }`}
                    title="Step-by-Step"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#111965] to-[#F7CE4D] transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* LAYOUT A: GROUPED BY THE 4 MBTI DIMENSIONS           */}
          {/* ---------------------------------------------------- */}
          {formLayout === "grouped" && (
            <div className="space-y-10">
              {(["EI", "SN", "TF", "JP"] as DimensionGroup[]).map((dimCode, groupIdx) => {
                const info = DIMENSION_INFO[dimCode];
                const dimQuestions = groupedQuestions[dimCode];

                return (
                  <div
                    key={dimCode}
                    className="rounded-3xl bg-white border border-[#E6E8F0] shadow-sm overflow-hidden"
                  >
                    {/* Dimension Group Banner */}
                    <div className="p-5 sm:p-6 bg-gradient-to-r from-[#111965] to-[#1E277A] text-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
                          Group {groupIdx + 1} of 4 • {info.code}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          {dimQuestions.filter((q) => !!selectedAnswers[q.id]).length} / {dimQuestions.length} answered
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {language === "km" ? info.name_km : info.name_en}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-2xl">
                        {language === "km" ? info.desc_km : info.desc_en}
                      </p>
                    </div>

                    {/* Questions in this group */}
                    <div className="p-5 sm:p-6 space-y-8 divide-y divide-[#E6E8F0]">
                      {dimQuestions.map((q, qIndex) => {
                        const isAnswered = !!selectedAnswers[q.id];

                        return (
                          <div
                            key={q.id}
                            className={`pt-6 first:pt-0 space-y-4 transition-all ${
                              isAnswered ? "opacity-100" : "opacity-95"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                  isAnswered
                                    ? "bg-[#111965] text-white"
                                    : "bg-slate-100 text-[#68708A] border border-slate-300"
                                }`}
                              >
                                {q.order_index}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-[#171A2C] leading-snug">
                                {language === "km" ? q.prompt_km : q.prompt_en}
                              </h4>
                            </div>

                            {/* 2 Options for this MBTI Question — Architectural Stance Tiles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-9">
                              {q.options.map((opt: any) => {
                                const isSelected = selectedAnswers[q.id] === opt.id;
                                const traitInfo = TRAIT_TITLES[opt.target_trait] || { en: `Trait ${opt.target_trait}`, km: `លក្ខណៈ ${opt.target_trait}` };

                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectOption(q.id, opt.id)}
                                    className={`p-5 rounded-3xl text-left border-2 transition-all duration-200 flex flex-col justify-between gap-4 group relative overflow-hidden ${
                                      isSelected
                                        ? "border-[#111965] bg-gradient-to-br from-[#F0F2FA] to-white ring-2 ring-[#F7CE4D] shadow-md"
                                        : "border-[#E6E8F0] hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-2xs"
                                    }`}
                                  >
                                    {/* Top Metadata Header */}
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                                            isSelected
                                              ? "bg-[#111965] text-[#F7CE4D] shadow-xs"
                                              : "bg-[#F5F6FA] text-slate-500 group-hover:text-[#111965]"
                                          }`}
                                        >
                                          <ArchetypeGlyph
                                            trait={opt.target_trait}
                                            className="w-5 h-5"
                                            isSelected={isSelected}
                                          />
                                        </div>
                                        <div>
                                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#68708A]">
                                            Trait {opt.target_trait} Stance
                                          </span>
                                          <span className="block text-xs font-bold text-[#111965]">
                                            {language === "km" ? traitInfo.km : traitInfo.en}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Interactive Selection Pill */}
                                      <div
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                                          isSelected
                                            ? "bg-[#F7CE4D] text-[#111965]"
                                            : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                                        }`}
                                      >
                                        {isSelected ? (
                                          <>
                                            <span>✓</span>
                                            <span>{language === "km" ? "ជ្រើសរើស" : "Chosen Stance"}</span>
                                          </>
                                        ) : (
                                          <span>{language === "km" ? "ចុចជ្រើសរើស" : "Select"}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Scenario Text */}
                                    <div className="text-xs sm:text-sm font-medium text-[#171A2C] leading-relaxed pt-1">
                                      {language === "km" ? opt.label_km : opt.label_en}
                                    </div>

                                    {/* Bottom subtle accent line */}
                                    <div
                                      className={`h-1 w-full rounded-full transition-all duration-300 ${
                                        isSelected ? "bg-[#111965]" : "bg-transparent group-hover:bg-slate-200"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit Button at Bottom of Grouped View */}
              <div className="sticky bottom-6 p-4 rounded-3xl bg-white/95 backdrop-blur border border-[#E6E8F0] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#68708A]">
                  <span className="font-bold text-[#111965]">{answeredCount}</span> of{" "}
                  <span className="font-bold text-[#111965]">{totalCount}</span> questions answered
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={answeredCount < totalCount || submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] disabled:opacity-40 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#111965]" />
                  <span>
                    {submitting
                      ? "Evaluating Dimensions..."
                      : language === "km"
                      ? "បញ្ចប់ និងវិភាគលទ្ធផល MBTI"
                      : "Submit & Evaluate MBTI Dimensions"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* LAYOUT B: STEP-BY-STEP QUESTION RUNNER               */}
          {/* ---------------------------------------------------- */}
          {formLayout === "stepper" && questions && questions.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-6">
              {(() => {
                const currentQ = questions[currentIndex];
                const isCurrentAnswered = !!selectedAnswers[currentQ.id];
                const isLastQuestion = currentIndex === questions.length - 1;
                const groupInfo = DIMENSION_INFO[currentQ.dimension as DimensionGroup] || DIMENSION_INFO.EI;

                return (
                  <>
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965] uppercase">
                            Dimension: {currentQ.dimension} ({groupInfo.code})
                          </span>
                          <span className="text-xs font-semibold text-[#68708A]">
                            Question {currentIndex + 1} of {questions.length}
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-[#111965] leading-relaxed pt-2">
                          {language === "km" ? currentQ.prompt_km : currentQ.prompt_en}
                        </h2>
                      </div>

                      {/* Options — Architectural Stance Tiles */}
                      <div className="space-y-4">
                        {currentQ.options.map((opt: any) => {
                          const isSelected = selectedAnswers[currentQ.id] === opt.id;
                          const traitInfo = TRAIT_TITLES[opt.target_trait] || { en: `Trait ${opt.target_trait}`, km: `លក្ខណៈ ${opt.target_trait}` };

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(currentQ.id, opt.id)}
                              className={`w-full p-5 rounded-3xl text-left border-2 transition-all duration-200 flex flex-col gap-3 group relative overflow-hidden ${
                                isSelected
                                  ? "border-[#111965] bg-gradient-to-br from-[#F0F2FA] to-white ring-2 ring-[#F7CE4D] shadow-md"
                                  : "border-[#E6E8F0] hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-2xs"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-[#111965] text-[#F7CE4D] shadow-xs"
                                        : "bg-[#F5F6FA] text-slate-500 group-hover:text-[#111965]"
                                    }`}
                                  >
                                    <ArchetypeGlyph
                                      trait={opt.target_trait}
                                      className="w-5 h-5"
                                      isSelected={isSelected}
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#68708A]">
                                      Trait {opt.target_trait} Stance
                                    </span>
                                    <span className="block text-xs font-bold text-[#111965]">
                                      {language === "km" ? traitInfo.km : traitInfo.en}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    isSelected
                                      ? "bg-[#F7CE4D] text-[#111965]"
                                      : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <span>✓</span>
                                      <span>{language === "km" ? "ជ្រើសរើស" : "Chosen Stance"}</span>
                                    </>
                                  ) : (
                                    <span>{language === "km" ? "ចុចជ្រើសរើស" : "Select"}</span>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs sm:text-sm font-medium text-[#171A2C] leading-relaxed pt-1">
                                {language === "km" ? opt.label_km : opt.label_en}
                              </div>

                              <div
                                className={`h-1 w-full rounded-full transition-all duration-300 ${
                                  isSelected ? "bg-[#111965]" : "bg-transparent group-hover:bg-slate-200"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#68708A] hover:text-[#111965] disabled:opacity-40"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{language === "km" ? "ថយក្រោយ" : "Previous"}</span>
                      </button>

                      {isLastQuestion ? (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isCurrentAnswered || submitting}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs disabled:opacity-40"
                        >
                          <span>{submitting ? "Evaluating..." : language === "km" ? "បញ្ចប់ និងមើលលទ្ធផល" : "Submit Assessment"}</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!isCurrentAnswered}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-40 shadow-2xs"
                        >
                          <span>{language === "km" ? "បន្ទាប់" : "Next"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
