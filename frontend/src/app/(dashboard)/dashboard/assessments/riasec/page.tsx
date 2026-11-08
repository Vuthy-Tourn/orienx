"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { ResonanceGauge } from "@/components/assessments/resonance-gauge";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  BarChart2,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function RiasecAssessmentPage() {
  const { t, getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // 1. Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["riasec-questions"],
    queryFn: async () => apiFetch<any[]>("/assessments/riasec/questions"),
  });

  // 2. Fetch latest result
  const { data: latestResult, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-riasec"],
    queryFn: async () => apiFetch<any>("/assessments/riasec/latest"),
  });

  React.useEffect(() => {
    if (latestResult && Object.keys(ratings).length === 0) {
      setActiveTab("results");
    }
  }, [latestResult]);

  // 3. Submit mutation
  const { mutate: submitRiasec, isPending: submitting } = useMutation({
    mutationFn: async (answers: Array<{ question_id: string; rating: number }>) => {
      return apiFetch("/assessments/riasec/submit", {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latest-riasec"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      setActiveTab("results");
    },
  });

  const handleRatingChange = (questionId: string, rating: number) => {
    setRatings({
      ...ratings,
      [questionId]: rating,
    });
  };

  const handleQuickPrefill = () => {
    if (!questions) return;
    const prefill: Record<string, number> = {};
    questions.forEach((q, idx) => {
      prefill[q.id] = (idx % 3) + 3; // ratings 3, 4, 5
    });
    setRatings(prefill);
  };

  const handleSubmit = () => {
    if (!questions) return;
    const formatted = Object.entries(ratings).map(([qid, val]) => ({
      question_id: qid,
      rating: val,
    }));
    if (formatted.length < questions.length) {
      alert(t("riasecAssessment.rateAllAlert"));
      return;
    }
    submitRiasec(formatted);
  };

  const handleRetake = () => {
    setRatings({});
    setActiveTab("form");
  };

  if (loadingQuestions || loadingLatest) {
    return (
      <div className="py-20 text-center text-sm text-[#68708A]">
        {t("riasecAssessment.loading")}
      </div>
    );
  }

  // Results View
  if (activeTab === "results" && latestResult) {
    const res = latestResult;

    const radarData = [
      { subject: "Realistic (R)", score: res?.realistic_score || 0, fullMark: 100 },
      { subject: "Investigative (I)", score: res?.investigative_score || 0, fullMark: 100 },
      { subject: "Artistic (A)", score: res?.artistic_score || 0, fullMark: 100 },
      { subject: "Social (S)", score: res?.social_score || 0, fullMark: 100 },
      { subject: "Enterprising (E)", score: res?.enterprising_score || 0, fullMark: 100 },
      { subject: "Conventional (C)", score: res?.conventional_score || 0, fullMark: 100 },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
              {t("riasecAssessment.hollandProfile")}
            </span>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("riasecAssessment.retakeTest")}</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-[#F7CE4D] tracking-tight">
              {res?.holland_code}
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {getLocalized({ km: res?.analysis_km?.interpretation, en: res?.analysis_en?.interpretation })}
            </p>
          </div>
        </div>

        {/* Visual Radar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-[#111965]">
            {t("riasecAssessment.radarTitle")}
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E6E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#111965", fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#68708A", fontSize: 10 }} />
                <Radar name="Student Fit" dataKey="score" stroke="#111965" fill="#F7CE4D" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {radarData.map((item) => (
            <div key={item.subject} className="p-4 rounded-2xl bg-white border border-[#E6E8F0] space-y-1">
              <div className="text-[11px] font-bold text-[#68708A]">{item.subject}</div>
              <div className="text-lg font-extrabold text-[#111965]">{item.score}%</div>
            </div>
          ))}
        </div>

        {/* Next Step */}
        <div className="p-6 rounded-2xl bg-[#F0F2FA] border border-[#111965]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#111965]">
              {t("riasecAssessment.nextStepTitle")}
            </h4>
            <p className="text-xs text-[#68708A]">
              {t("riasecAssessment.nextStepSubtitle")}
            </p>
          </div>
          <Link
            href="/dashboard/assessments/preferences"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{t("riasecAssessment.nextStepBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Questionnaire Likert scale runner
  if (!questions || questions.length === 0) {
    return <div className="py-20 text-center text-sm text-[#68708A]">No questions available.</div>;
  }

  const answeredCount = Object.keys(ratings).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111965]">
              {t("riasecAssessment.title")}
            </h1>
            <p className="text-xs text-[#68708A]">
              {t("riasecAssessment.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickPrefill}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] transition-colors"
            >
              {t("riasecAssessment.demoAutofill")}
            </button>
            <div className="text-xs font-bold text-[#111965] bg-[#F0F2FA] px-3 py-1.5 rounded-full">
              {answeredCount} / {questions.length} {t("riasecAssessment.ratedOf")} ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#111965] transition-all duration-300 rounded-full"
          />
        </div>
      </div>

      {/* Activity Question Cards */}
      <div className="space-y-4">
        {questions.map((q: any, idx: number) => {
          const currentVal = ratings[q.id];
          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                currentVal
                  ? "bg-white border-[#111965]/40 shadow-2xs"
                  : "bg-white border-[#E6E8F0]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#F0F2FA] text-[#111965] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#171A2C] leading-relaxed">
                      {getLocalized({ km: q.prompt_km, en: q.prompt_en })}
                    </span>
                  </div>
                </div>

                {/* Futera Signature Resonance Gauge */}
                <ResonanceGauge
                  value={currentVal}
                  onChange={(val) => handleRatingChange(q.id, val)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] flex items-center justify-between shadow-xs">
        <span className="text-xs text-[#68708A]">
          {answeredCount === questions.length
            ? t("riasecAssessment.readyCalculate")
            : `${questions.length - answeredCount} ${t("riasecAssessment.activitiesLeft")}`}
        </span>

        <button
          onClick={handleSubmit}
          disabled={answeredCount < questions.length || submitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] disabled:opacity-40 shadow-sm"
        >
          <span>{submitting ? t("riasecAssessment.calculating") : t("riasecAssessment.submitBtn")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

