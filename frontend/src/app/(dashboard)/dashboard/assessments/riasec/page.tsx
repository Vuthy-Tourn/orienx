"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { AssessmentExportDialog } from "@/components/assessments/assessment-export-dialog";
import {
  downloadAssessmentCsv,
  downloadAssessmentExcel,
  downloadAssessmentJson,
  openAssessmentPdf,
  type AssessmentReportFormat,
  type AssessmentReportLabels,
  type AssessmentReportModel,
} from "@/lib/assessment-report";
import { useIsDarkMode } from "@/contexts/theme-context";
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
  Tooltip,
} from "recharts";
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Target,
  Building2,
  Zap,
  Award,
  Briefcase,
  Layers,
  ChevronRight,
  BookOpen,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RIASEC_DIMENSIONS,
  getHollandArchetype,
  getHollandSpelledOut,
} from "@/lib/riasec-meta";

export default function RiasecAssessmentPage() {
  const { t, getLocalized, language } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const isDark = useIsDarkMode();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingFormat, setExportingFormat] =
    useState<AssessmentReportFormat | null>(null);

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

  // 3. Fetch latest Personality result (for cross-pillar journey context)
  const { data: latestPersonality } = useQuery({
    queryKey: ["latest-personality"],
    queryFn: async () => apiFetch<any>("/assessments/personality/latest"),
  });

  // 4. Fetch recommended majors (for unified 4-pillar recommendations)
  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
    enabled: activeTab === "results",
  });

  const unifiedRecs = React.useMemo(() => {
    if (!recommendations) return [];
    return [...recommendations].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  }, [recommendations]);

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

  // Submit mutation
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
      toast.warning(t("riasecAssessment.rateAllAlert") || "Please rate all activities before submitting.");
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
      <div data-dashboard-page="sections" className="max-w-3xl mx-auto space-y-6 animate-pulse select-none">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="rounded-3xl border border-[#E6E8F0] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-7 w-4/5 rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RESULTS VIEW: RADAR CHART + HOLLAND BREAKDOWN
  // ========================================================
  if (activeTab === "results" && latestResult) {
    const res = latestResult;
    const hCode = (res?.holland_code || "RIA").toUpperCase();
    const archetype = getHollandArchetype(hCode);
    const spelledOutEn = getHollandSpelledOut(hCode, "en");
    const spelledOutKm = getHollandSpelledOut(hCode, "km");

    const scoresMap: Record<string, number> = {
      R: Math.round(res?.realistic_score || 0),
      I: Math.round(res?.investigative_score || 0),
      A: Math.round(res?.artistic_score || 0),
      S: Math.round(res?.social_score || 0),
      E: Math.round(res?.enterprising_score || 0),
      C: Math.round(res?.conventional_score || 0),
    };

    const radarData = [
      { code: "R", subject: "Realistic (R)", score: scoresMap.R, fullMark: 100 },
      { code: "I", subject: "Investigative (I)", score: scoresMap.I, fullMark: 100 },
      { code: "A", subject: "Artistic (A)", score: scoresMap.A, fullMark: 100 },
      { code: "S", subject: "Social (S)", score: scoresMap.S, fullMark: 100 },
      { code: "E", subject: "Enterprising (E)", score: scoresMap.E, fullMark: 100 },
      { code: "C", subject: "Conventional (C)", score: scoresMap.C, fullMark: 100 },
    ];

    // Extract top 3 codes from holland_code letters
    const topLetters = hCode.split("").slice(0, 3);

    const studentName =
      getLocalized({ en: user?.full_name_en, km: user?.full_name_km }) ||
      user?.full_name_en ||
      user?.full_name_km ||
      "";
    const reportLabels: AssessmentReportLabels = {
      preparedFor: t("assessmentReport.preparedFor"),
      generated: t("assessmentReport.generated"),
      summary: t("assessmentReport.summary"),
      dimensions: t("assessmentReport.dimensions"),
      highlights: t("assessmentReport.highlights"),
      recommendedMajors: t("assessmentReport.recommendedMajors"),
      archetype: t("assessmentReport.archetype"),
      profile: t("assessmentReport.profile"),
      eyebrow: t("assessmentReport.eyebrow"),
      fitScore: t("assessmentReport.fitScore"),
      universities: t("assessmentReport.universities"),
      print: t("assessmentReport.print"),
      close: t("assessmentReport.close"),
      footer: t("assessmentReport.footer"),
      noResult: t("assessmentReport.noResult"),
    };
    const exportIncludes = [
      hCode,
      t("assessmentReport.hollandCode"),
      `${Math.min(unifiedRecs.length, 5)} ${t(
        "assessmentReport.recommendedMajors"
      )}`,
    ];

    const buildReport = (): AssessmentReportModel => {
      const generatedAt = new Date();
      const dimensions = Object.entries(RIASEC_DIMENSIONS).map(
        ([code, meta]) => ({
          label: `${code} — ${getLocalized({
            en: meta.nameEn,
            km: meta.nameKm,
          })}`,
          value: scoresMap[code] || 0,
          detail: topLetters.includes(code)
            ? language === "km"
              ? "ចំណាប់អារម្មណ៍កំពូល"
              : "Top interest"
            : "",
        })
      );
      const highlights = [
        {
          title: getLocalized({
            en: "Core Motivators & Strengths",
            km: "កម្លាំងជំរុញចិត្ត & ចំណុចខ្លាំង",
          }),
          items:
            language === "km" ? archetype.strengths : archetype.strengthsEn,
        },
        {
          title: getLocalized({
            en: "Optimal Work Environment",
            km: "បរិស្ថានការងារដែលរីកចម្រើន",
          }),
          items: [
            getLocalized({
              en: archetype.optimalWorkEnvironmentEn,
              km: archetype.optimalWorkEnvironmentKm,
            }),
          ],
        },
        {
          title: getLocalized({
            en: "Target Career Clusters",
            km: "វិស័យការងារគោលដៅ",
          }),
          items:
            language === "km"
              ? archetype.targetIndustriesKm
              : archetype.targetIndustriesEn,
        },
      ];
      const recommendations = unifiedRecs.slice(0, 5).map((rec: any) => {
        const major = rec.major || {};
        const majorName =
          getLocalized(major.name) || major.name_en || major.name || "—";
        return {
          major: String(majorName),
          fit: Math.round(rec.match_score || rec.riasec_match_score || 0),
          universities: Array.isArray(major.offering_universities)
            ? major.offering_universities.length
            : 0,
        };
      });
      return {
        kind: "riasec",
        title: t("assessmentReport.riasecTitle"),
        subtitle: t("assessmentReport.riasecSubtitle"),
        studentName,
        generatedAt,
        generatedLabel: generatedAt.toLocaleString(
          language === "km" ? "km-KH" : "en-US"
        ),
        locale: language === "km" ? "km-KH" : "en-US",
        headline: hCode,
        headlineLabel: t("assessmentReport.hollandCode"),
        archetype: getLocalized({
          en: archetype.titleEn,
          km: archetype.titleKm,
        }),
        role: getLocalized({ en: spelledOutEn, km: spelledOutKm }),
        tagline:
          getLocalized({
            en: res?.analysis_en?.interpretation,
            km: res?.analysis_km?.interpretation,
          }) ||
          getLocalized({
            en: archetype.taglineEn,
            km: archetype.taglineKm,
          }),
        dimensions,
        highlights,
        recommendations,
        labels: reportLabels,
      };
    };

    const handleExport = async (format: AssessmentReportFormat) => {
      setExportingFormat(format);
      try {
        const model = buildReport();
        if (format === "pdf") {
          const opened = openAssessmentPdf(model);
          if (!opened) {
            toast.error(t("assessmentReport.pdfBlocked"));
            return;
          }
        } else if (format === "excel") {
          await downloadAssessmentExcel(model);
        } else if (format === "csv") {
          downloadAssessmentCsv(model);
        } else {
          downloadAssessmentJson(model);
        }
        toast.success(t("assessmentReport.exported"));
        setExportOpen(false);
      } catch {
        toast.error(t("assessmentReport.failed"));
      } finally {
        setExportingFormat(null);
      }
    };

    return (
      <div data-dashboard-page="sections" className="max-w-4xl mx-auto space-y-7 animate-in fade-in pb-16 select-none">
        {/* Top Breadcrumb & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
              <Link href="/dashboard" className="hover:text-[#111965] transition-colors">
                {t("personalityAssessment.dashboard")}
              </Link>
              <span>/</span>
              <span className="text-[#111965] font-extrabold">
                {t("riasecAssessment.title")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {t("riasecAssessment.title")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEEA] bg-white px-3.5 text-[11px] font-black text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-[#F8FAFD]"
            >
              <Download className="h-3.5 w-3.5" />
              {t("assessmentReport.exportReport")}
            </button>
            <AssessmentViewSwitcher
              activeTab={activeTab}
              onTabChange={setActiveTab}
              questionsLabel={t("personalityAssessment.questionsTab") || "ធ្វើតេស្ត"}
              profileLabel={`${hCode} Profile`}
              profileIcon={Trophy}
              hasResult={!!latestResult}
            />
          </div>
        </div>

        {/* 1. HERO CELEBRATION BANNER — ORIENX PLATFORM COLORS */}
        <div className="p-6 sm:p-9 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1A2580] to-[#0D134E] text-white shadow-xl relative overflow-hidden border border-[#111965]/40">
          {/* Ambient Platform Brand Glows */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#F7CE4D]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3.5 max-w-xl">
              {/* Holland Archetype Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white/10 backdrop-blur-md text-[#F7CE4D] border border-white/20 uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>
                  {language === "km" ? archetype.titleKm : archetype.titleEn.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black text-[#F7CE4D] tracking-tight drop-shadow-md">
                  {hCode}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {language === "km" ? spelledOutKm : spelledOutEn}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg font-medium">
                {getLocalized({
                  km: res?.analysis_km?.interpretation,
                  en: res?.analysis_en?.interpretation,
                }) || archetype.taglineKm}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 backdrop-blur-sm shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#F7CE4D]" />
                  <span>{t("riasecAssessment.retakeTest") || "ធ្វើតេស្តឡើងវិញ"}</span>
                </button>

                <Link
                  href="/riasec"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{getLocalized({ km: "ស្វែងយល់ទ្រឹស្តី Holland", en: "Holland Guide" })}</span>
                </Link>
              </div>
            </div>

            {/* Celebrating Mascot Tara */}
            <div className="flex-shrink-0 self-center sm:self-auto relative pt-4 sm:pt-0">
              <FuteraMascot
                variant="full-jumping"
                emotion="congratulation"
                showSpeech={true}
                size={195}
                speechText={getLocalized({
                  km: `អបអរសាទរ! កូដ ${hCode} រួចរាល់! 🎯✨`,
                  en: `Congratulations! Your ${hCode} code is ready! 🎯✨`,
                })}
              />
            </div>
          </div>
        </div>

        {/* 2. KEY WORK & CAREER INSIGHTS BENTO CONTAINER (3-Column Framework) */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] shadow-xs p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E6E8F0]">
          {/* Card 1: Core Motivators & Strengths */}
          <div className="space-y-2.5 md:pr-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                {getLocalized({ km: "កម្លាំងជំរុញចិត្ត & ចំណុចខ្លាំង", en: "Core Motivators & Strengths" })}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(language === "km" ? archetype.strengths : archetype.strengthsEn).map((str: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-100"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{str}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Optimal Work Environment */}
          <div className="space-y-2.5 pt-5 md:pt-0 md:px-4">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                {getLocalized({ km: "បរិស្ថានការងារដែលរីកចម្រើន", en: "Optimal Work Environment" })}
              </span>
            </div>
            <p className="text-xs text-[#171A2C] leading-relaxed font-medium pt-1">
              {getLocalized({
                km: archetype.optimalWorkEnvironmentKm,
                en: archetype.optimalWorkEnvironmentEn,
              })}
            </p>
          </div>

          {/* Card 3: Target Career Clusters */}
          <div className="space-y-2.5 pt-5 md:pt-0 md:pl-4">
            <div className="flex items-center gap-2 text-purple-700">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                {getLocalized({ km: "វិស័យការងារគោលដៅ", en: "Target Career Clusters" })}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(language === "km" ? archetype.targetIndustriesKm : archetype.targetIndustriesEn).map(
                (ind: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50/80 text-purple-800 border border-purple-100"
                  >
                    <Zap className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>{ind}</span>
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* 3. HOLLAND RADAR (Clean Centered & Balanced Layout) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-200">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Holland Hexagon Spectrum</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-[#111965]">
              {t("riasecAssessment.radarTitle") || "គំនូសតាងរ៉ាដាចំណាប់អារម្មណ៍អាជីព (Holland Radar Fit)"}
            </h3>
            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
              {getLocalized({
                km: "ប្រៀបធៀបកម្រិតចំណាប់អារម្មណ៍លើវិស័យទាំង ៦ នៃទ្រឹស្តី John Holland",
                en: "Visualizing interest intensity across John Holland's 6 foundational career domains",
              })}
            </p>
          </div>

          <div className="w-full max-w-lg mx-auto h-72 sm:h-84">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke={isDark ? "#334155" : "#E6E8F0"} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: isDark ? "#E2E8F0" : "#111965", fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: isDark ? "#94A3B8" : "#68708A", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const meta = RIASEC_DIMENSIONS[data.code];
                      return (
                        <div className="bg-[#111965] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-md text-white font-black text-[12.5px] flex items-center justify-center shrink-0"
                              style={{ backgroundColor: meta?.color || "#111965" }}
                            >
                              {data.code}
                            </span>
                            <span className="font-bold text-white">
                              {getLocalized({ km: meta?.nameKm, en: meta?.nameEn })}
                            </span>
                          </div>
                          <div className="text-[#F7CE4D] font-black text-sm">
                            {data.score}% Fit
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Student Fit"
                  dataKey="score"
                  stroke={isDark ? "#93C5FD" : "#111965"}
                  strokeWidth={2.5}
                  fill="#F7CE4D"
                  fillOpacity={0.55}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Dimension Badges under Radar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-[#E6E8F0]/70 max-w-2xl mx-auto">
            {Object.entries(RIASEC_DIMENSIONS).map(([k, meta]) => {
              const score = scoresMap[k] || 0;
              const isTop = topLetters.includes(k);
              return (
                <div
                  key={k}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isTop
                      ? "bg-white shadow-2xs font-black text-[#111965]"
                      : "bg-slate-50 text-[#68708A] border-slate-200"
                  }`}
                  style={{ borderColor: isTop ? meta.color : undefined }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{k}:</span>
                  <span>{score}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. ALL 6 HOLLAND DIMENSION CARDS (Educational & Actionable Grid) */}
        <div className="space-y-4">
          <div className="space-y-0.5 px-1">
            <h4 className="text-xs sm:text-sm font-black text-[#111965] uppercase tracking-wide">
              {getLocalized({
                km: "ពិន្ទុវិស័យទាំង ៦ លម្អិត",
                en: "All 6 Holland Career Categories in Detail",
              })}
            </h4>
            <p className="text-[12px] text-[#68708A]">
              {getLocalized({
                km: "ស្វែងយល់ពីអត្ថន័យនៃកូដនីមួយៗ និងកម្រិតចំណាប់អារម្មណ៍របស់អ្នកចំពោះវិស័យការងារទាំង ៦",
                en: "Understand what each RIASEC dimension means and how strongly your interests align",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(RIASEC_DIMENSIONS).map(([key, meta]) => {
              const IconComp = meta.icon;
              const score = scoresMap[key] || 0;
              const isDominant = topLetters.includes(key);

              return (
                <div
                  key={key}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-3.5 hover:shadow-xs ${
                    isDominant
                      ? "border-slate-300 ring-2 ring-indigo-50/60 shadow-2xs"
                      : "border-[#E6E8F0]"
                  }`}
                >
                  <div className="space-y-3">
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
                          <span className="text-[12.5px] font-semibold text-[#68708A]">
                            Holland Dimension ({key})
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
                        className="px-2 py-0.5 rounded-full text-[12.5px] font-extrabold"
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

                    <p className="text-[12px] text-[#4A5568] leading-relaxed pt-1">
                      {getLocalized({ km: meta.descKm, en: meta.descEn })}
                    </p>
                  </div>

                  {/* Sample careers snippet */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[12.5px] font-bold text-[#68708A] uppercase tracking-wider block">
                      {getLocalized({ km: "អាជីពតួយ៉ាង (Sample Careers):", en: "Sample Careers:" })}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {meta.sampleCareers.slice(0, 2).map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-md text-[12.5px] font-semibold bg-[#F0F2FA] text-[#111965]"
                        >
                          {getLocalized({ km: c.km, en: c.en })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. RECOMMENDED MAJORS & UNIVERSITIES FOR THIS HOLLAND CODE */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[12.5px] font-black uppercase tracking-wider border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>
                  {getLocalized({
                    km: "អនុសាសន៍ AI សុក្រឹតកម្រិតខ្ពស់ (៤ សសរស្តម្ភ)",
                    en: "Unified AI Recommendations (4 Pillars)",
                  })}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {getLocalized({
                  km: `មុខជំនាញសាកសមបំផុតសម្រាប់អ្នក និងភាពស៊ីសង្វាក់ជាមួយកូដ ${hCode}`,
                  en: `Top Recommended Majors For You & Your ${hCode} Interests`,
                })}
              </h3>
            </div>

            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer whitespace-nowrap"
            >
              <span>{t("personalityAssessment.viewAllRecommendations", "មើលអនុសាសន៍ពេញលេញ")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#E6E8F0] space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : unifiedRecs && unifiedRecs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {unifiedRecs.slice(0, 3).map((rec: any, idx: number) => {
                const major = rec.major || {};
                const exp = rec.explanation || {};
                const unis = major.offering_universities || [];
                const fitScore = Math.round(rec.match_score || rec.riasec_match_score || 0);

                return (
                  <div
                    key={rec.id || `rec-${idx}`}
                    className="p-4 sm:p-5 rounded-2xl border border-[#E6E8F0] bg-gradient-to-b from-white to-[#FAFBFD] hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg text-xs font-black bg-[#111965] text-[#F7CE4D] flex items-center justify-center shadow-2xs flex-shrink-0">
                            #{idx + 1}
                          </span>
                          {major.is_stem && (
                            <span className="px-1.5 py-0.5 rounded text-[12px] font-black bg-sky-50 text-sky-700 border border-sky-200 flex-shrink-0">
                              STEM
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[12px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs flex-shrink-0">
                            {fitScore}% Fit
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-[#111965] leading-snug">
                        <Link href={`/majors/${major.slug}`} className="hover:text-[#1E277A] transition-colors">
                          {getLocalized(major.name)}
                        </Link>
                      </h4>

                      {/* RIASEC-specific rationale snippet */}
                      <p className="text-[12px] text-[#4A5568] line-clamp-2 leading-relaxed">
                        {getLocalized({ km: exp.riasec_reason_km, en: exp.riasec_reason_en }) ||
                          getLocalized({ km: exp.fit_summary_km, en: exp.fit_summary_en }) ||
                          getLocalized({
                            km: `ជំនាញនេះត្រូវគ្នានឹងកូដចំណាប់អារម្មណ៍អាជីព ${hCode} របស់អ្នកយ៉ាងខ្លាំង។`,
                            en: `This major aligns strongly with your dominant ${hCode} career interest orientation.`,
                          })}
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#E6E8F0]/50">
                      <Link
                        href={`/universities?major=${major.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs whitespace-nowrap"
                      >
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {unis.length > 0
                            ? `${unis.length} ${t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}`
                            : t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-[#68708A]">
              {language === "km" ? "មិនទាន់មានអនុសាសន៍នៅឡើយទេ" : "No recommendations yet"}
            </div>
          )}


        </div>

        {/* 6. NEXT STEP / CROSS-PILLAR JOURNEY CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#F0F2FA] to-[#E8EBF8] border border-[#111965]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-extrabold text-[#111965]">
              {latestPersonality
                ? getLocalized({
                    km: `✨ ការវាយតម្លៃទាំងពីរត្រូវបានក្រិតតាមខ្នាត! (${hCode} + ${latestPersonality.personality_type || "MBTI"})`,
                    en: `✨ Both Core Assessments Calibrated! (${hCode} + ${latestPersonality.personality_type || "MBTI"})`,
                  })
                : getLocalized({
                    km: "ជំហានបន្ទាប់៖ ធ្វើតេស្តបុគ្គលិកលក្ខណៈ ១៦ ប្រភេទ (MBTI)",
                    en: "Next Step: Complete the 16 Personality (MBTI) Assessment",
                  })}
            </h4>
            <p className="text-xs text-[#68708A]">
              {latestPersonality
                ? getLocalized({
                    km: `ប្រព័ន្ធបានបញ្ចូលទម្រង់ ${hCode} ជាមួយបុគ្គលិកលក្ខណៈ ${latestPersonality.personality_type} របស់អ្នកដើម្បីបង្កើតអនុសាសន៍អាជីពដ៏ល្អបំផុត។`,
                    en: `Your ${hCode} interests and ${latestPersonality.personality_type} personality are fully synchronized for optimal recommendations.`,
                  })
                : getLocalized({
                    km: `អនុសាសន៍ផ្អែកលើចំណាប់អារម្មណ៍ ${hCode} របស់អ្នករួចរាល់! ធ្វើតេស្តបុគ្គលិកលក្ខណៈដើម្បីដឹងពីទម្រង់ចិត្ត និងស្ទីលការងាររបស់អ្នក។`,
                    en: `Initial matches based on your ${hCode} interests are ready! Take the MBTI test to complete your psychological profile.`,
                  })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {latestPersonality ? (
              <Link
                href="/dashboard/assessments/personality"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs text-[#111965] bg-white border border-[#E6E8F0] hover:bg-[#F0F2FA] shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{getLocalized({ km: `មើល ${latestPersonality.personality_type} Profile`, en: `View ${latestPersonality.personality_type} Profile` })}</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/assessments/personality"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#111965] hover:bg-[#1A2580] shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{getLocalized({ km: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈ", en: "Take MBTI Test" })}</span>
              </Link>
            )}

            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{getLocalized({ km: "មើលអនុសាសន៍ AI", en: "View AI Matches" })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <AssessmentExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          title={t("assessmentReport.exportTitle")}
          subtitle={t("assessmentReport.exportSubtitle")}
          includes={exportIncludes}
          exportingFormat={exportingFormat}
          onExport={handleExport}
          footer={t("assessmentReport.footer")}
        />
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
    <div className="pb-16 select-none">
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
        leftAnchorKm="ចូលចិត្តខ្លាំងបំផុត"
        leftAnchorEn="Highly Enjoy"
        rightAnchorKm="មិនចូលចិត្តទាល់តែសោះ"
        rightAnchorEn="Strong Dislike"
        mascotSpeech={
          currentVal !== undefined && currentVal !== null
            ? currentVal === 5
              ? getLocalized({
                  km: "អស្ចារ្យណាស់! នេះជាចំណូលចិត្ត និងទេពកោសល្យពិតរបស់អ្នក! 🚀✨",
                  en: "Awesome! This is your natural calling and passion! 🚀✨",
                })
              : currentVal === 4
              ? getLocalized({
                  km: "ល្អណាស់! សកម្មភាពនេះពិតជាគួរឱ្យចាប់អារម្មណ៍ខ្លាំង! 💡",
                  en: "Great! This activity sounds super exciting! 💡",
                })
              : currentVal === 3
              ? getLocalized({
                  km: "យល់ស្រប! រក្សាជម្រើសបើកទូលាយជានិច្ច! ⚖️",
                  en: "Fair! Keeping an open mind is great! ⚖️",
                })
              : currentVal === 2
              ? getLocalized({
                  km: "មិនអីទេ! យើងនឹងផ្តោតលើអ្វីដែលអ្នកស្រឡាញ់ពិតប្រាកដ! 🎯",
                  en: "No worries! We will focus on what you truly enjoy! 🎯",
                })
              : getLocalized({
                  km: "យល់ហើយ! ការដឹងពីអ្វីដែលមិនចូលចិត្តក៏សំខាន់ដូចគ្នា! 🛡️",
                  en: "Understood! Knowing what you dislike is key too! 🛡️",
                })
            : currentIndex === 0
            ? getLocalized({
                km: "សួស្តី! តោះស្វែងរកអាជីព និងមុខជំនាញសាកសមបំផុត! 👋",
                en: "Hi! Let's find your best career & major matches! 👋",
              })
            : currentIndex === Math.floor(questions.length / 2)
            ? getLocalized({
                km: "ដល់ពាក់កណ្តាលផ្លូវហើយ! លឿន និងសុក្រឹតមែន ⚡",
                en: "Halfway mark! Fast & steady ⚡",
              })
            : currentIndex === questions.length - 1
            ? getLocalized({
                km: "សំណួរចុងក្រោយបង្អស់! តោះបញ្ចប់ដើម្បីគណនា Holland Code 🚀",
                en: "Final question! Let's compute your Holland Code 🚀",
              })
            : getLocalized({
                km: `សំណួរទី ${currentIndex + 1} នៃ ${questions.length} • តើអ្នកមានអារម្មណ៍យ៉ាងណាដែរចំពោះសកម្មភាពនេះ? 🤔`,
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
