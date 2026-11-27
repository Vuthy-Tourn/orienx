"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Compass,
  Download,
  History,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  clearAllGuestData,
  deleteResult,
  getAllResults,
} from "@/lib/guest/storage";
import { recommendMajorMatches } from "@/lib/guest/recommendations";
import type {
  GuestResultRecord,
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";
import { ARCHETYPE_META } from "@/lib/personality-meta";
import { getHollandArchetype } from "@/lib/riasec-meta";
import { buildCombinedReportModel } from "@/lib/guest/combined-report";
import { getCareerIdeasForCodes } from "@/lib/data/career-ideas";
import {
  AssessmentExportDialog,
  PngSaveModal,
} from "@/components/assessments/assessment-export-dialog";
import {
  exportAssessmentReport,
  type AssessmentPngPreview,
  type AssessmentReportFormat,
  type AssessmentReportLabels,
} from "@/lib/assessment-report";

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuestResultsPage() {
  const { t, getLocalized, language } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const isKm = language === "km";
  const locale = isKm ? "km-KH" : "en-US";

  const [rows, setRows] = useState<GuestResultRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [combinedOpen, setCombinedOpen] = useState(false);
  const [combinedExporting, setCombinedExporting] =
    useState<AssessmentReportFormat | null>(null);
  const [pngPreview, setPngPreview] = useState<AssessmentPngPreview | null>(null);
  const resultsRootRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setRows(getAllResults());
    setLoaded(true);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const root = resultsRootRef.current;
    if (!root || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".results-header", {
        opacity: 0,
        y: 16,
        duration: 0.55,
        ease: "power2.out",
      });

      gsap.utils.toArray<HTMLElement>(".results-reveal").forEach((section, index) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: Math.min(index, 3) * 0.04,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              once: true,
            },
            onComplete: () =>
              gsap.set(section, { clearProps: "opacity,transform" }),
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".results-headline").forEach((headline, index) => {
        gsap.from(headline, {
          opacity: 0,
          scale: 0.94,
          y: 8,
          duration: 0.55,
          delay: 0.15 + index * 0.08,
          ease: "back.out(1.4)",
        });
      });

      gsap.utils.toArray<HTMLElement>(".results-history-row").forEach((row, index) => {
        gsap.fromTo(
          row,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.45,
            delay: Math.min(index, 6) * 0.04,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 95%",
              once: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [loaded]);

  const latestPersonality = rows.find((row) => row.kind === "personality");
  const latestRiasec = rows.find((row) => row.kind === "riasec");
  const personalityResult = latestPersonality?.result as
    | PersonalityResult
    | undefined;
  const riasecResult = latestRiasec?.result as RiasecResult | undefined;

  const combinedMajors = useMemo(() => {
    if (!personalityResult && !riasecResult) return [];
    return recommendMajorMatches({
      personality: personalityResult,
      riasec: riasecResult,
      limit: 6,
    });
  }, [personalityResult, riasecResult]);

  const topInterestCodes = useMemo(
    () => riasecResult?.ranked.slice(0, 3).map((item) => item.code) ?? [],
    [riasecResult]
  );
  const careerIdeas = useMemo(
    () => getCareerIdeasForCodes(topInterestCodes, 6),
    [topInterestCodes]
  );

  const combinedLabels: AssessmentReportLabels = {
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

  const handleCombinedExport = async (format: AssessmentReportFormat) => {
    if (!latestPersonality || !latestRiasec || !personalityResult || !riasecResult) {
      return;
    }
    setCombinedExporting(format);
    try {
      const generatedAt = new Date(
        Math.max(
          new Date(latestPersonality.completedAt).getTime(),
          new Date(latestRiasec.completedAt).getTime()
        )
      );
      const model = buildCombinedReportModel({
        personality: personalityResult,
        riasec: riasecResult,
        matches: combinedMajors,
        labels: combinedLabels,
        language: isKm ? "km" : "en",
        generatedAt,
        studentName: getLocalized({ en: "Student", km: "សិស្ស" }),
        characterImageUrl:
          typeof window !== "undefined"
            ? `${window.location.origin}/images/personality-types/${personalityResult.type.toLowerCase()}.svg`
            : undefined,
      });
      const result = await exportAssessmentReport(model, format);
      if (result?.imagePreview) {
        setPngPreview(result.imagePreview);
      } else {
        toast.success(t("assessmentReport.exported"));
      }
      setCombinedOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("popup")) {
        toast.error(t("assessmentReport.pdfBlocked"));
      } else {
        toast.error(t("assessmentReport.failed"));
      }
    } finally {
      setCombinedExporting(null);
    }
  };

  const handleDelete = async (row: GuestResultRecord) => {
    const confirmed = await confirm({
      title: getLocalized({
        en: "Delete this result?",
        km: "លុបលទ្ធផលនេះ?",
      }),
      description: getLocalized({
        en: "This result will be deleted. Your other results will stay.",
        km: "លទ្ធផលនេះនឹងត្រូវលុប។ លទ្ធផលផ្សេងទៀតរបស់អ្នកនឹងនៅដដែល។",
      }),
      confirmLabel: getLocalized({ en: "Delete", km: "លុប" }),
      cancelLabel: getLocalized({ en: "Cancel", km: "បោះបង់" }),
      tone: "danger",
    });
    if (!confirmed) return;
    deleteResult(row.kind, row.id);
    refresh();
    toast.success(
      getLocalized({ en: "Result deleted.", km: "បានលុបលទ្ធផល។" })
    );
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: getLocalized({
        en: "Delete all results?",
        km: "លុបលទ្ធផលទាំងអស់?",
      }),
      description: getLocalized({
        en: "All saved answers and results will be deleted. Download a copy first if you want to keep them.",
        km: "ចម្លើយ និងលទ្ធផលដែលបានរក្សាទុកទាំងអស់នឹងត្រូវលុប។ សូមទាញយកច្បាប់ចម្លងជាមុនប្រសិនបើចង់រក្សាទុក។",
      }),
      confirmLabel: getLocalized({ en: "Delete all", km: "លុបទាំងអស់" }),
      cancelLabel: getLocalized({ en: "Cancel", km: "បោះបង់" }),
      tone: "danger",
    });
    if (!confirmed) return;
    clearAllGuestData();
    refresh();
    toast.success(
      getLocalized({
        en: "All results deleted.",
        km: "បានលុបលទ្ធផលទាំងអស់។",
      })
    );
  };

  return (
    <div
      ref={resultsRootRef}
      className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-8 sm:pt-12"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="results-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#111965] sm:text-3xl">
              {getLocalized({ en: "My results", km: "លទ្ធផលរបស់ខ្ញុំ" })}
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#68708A]">
              {getLocalized({
                en: "See your test results and download a copy.",
                km: "មើលលទ្ធផលតេស្តរបស់អ្នក និងទាញយកច្បាប់ចម្លង។",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {latestPersonality && latestRiasec && (
              <button
                type="button"
                onClick={() => setCombinedOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] px-3 text-xs font-black text-white transition-colors hover:bg-[#1A2580]"
              >
                <Download className="h-3.5 w-3.5 text-[#F7CE4D]" />
                {getLocalized({
                  en: "Download all results",
                  km: "ទាញយកលទ្ធផលទាំងអស់",
                })}
              </button>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 text-xs font-black text-white shadow-xs transition-colors hover:bg-rose-700 dark:bg-rose-600 dark:text-white dark:hover:bg-rose-700 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {getLocalized({ en: "Delete results", km: "លុបលទ្ធផល" })}
            </button>
          </div>
        </div>

        {!loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-3xl border border-[#E6E8F0] bg-white"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="results-reveal rounded-3xl border border-dashed border-[#D9DEEA] bg-white px-6 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
              <Compass className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black text-[#111965]">
              {getLocalized({
                en: "No saved results yet",
                km: "មិនទាន់មានលទ្ធផលរក្សាទុកទេ",
              })}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#68708A]">
              {getLocalized({
                en: "Take one or both free tests. Your result will appear here when you finish.",
                km: "សូមធ្វើតេស្តឥតគិតថ្លៃមួយ ឬទាំងពីរ។ លទ្ធផលរបស់អ្នកនឹងបង្ហាញនៅទីនេះនៅពេលអ្នកបញ្ចប់។",
              })}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href="/assessments/personality/test"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111965] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1A2580]"
              >
                <Brain className="h-4 w-4 text-[#F7CE4D]" />
                {getLocalized({
                  en: "Personality test",
                  km: "តេស្តបុគ្គលិកលក្ខណៈ",
                })}
              </Link>
              <Link
                href="/assessments/riasec/test"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D9DEEA] bg-white px-4 py-2.5 text-xs font-bold text-[#111965] hover:bg-[#F8FAFD]"
              >
                <Compass className="h-4 w-4 text-[#D4A017]" />
                {getLocalized({ en: "RIASEC test", km: "តេស្ត RIASEC" })}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                kind="personality"
                record={latestPersonality}
                locale={locale}
                getLocalized={getLocalized}
              />
              <ResultCard
                kind="riasec"
                record={latestRiasec}
                locale={locale}
                getLocalized={getLocalized}
              />
            </div>

            {combinedMajors.length > 0 && (
              <section className="results-reveal rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">
                      <Trophy className="h-3 w-3" />
                      {getLocalized({
                        en: "Your best matches",
                        km: "ជម្រើសដែលត្រូវគ្នាល្អបំផុត",
                      })}
                    </div>
                    <h2 className="mt-2 text-base font-black text-[#111965] sm:text-lg">
                      {getLocalized({
                        en: "Your strongest major matches",
                        km: "ជំនាញដែលត្រូវគ្នាខ្លាំងបំផុតរបស់អ្នក",
                      })}
                    </h2>
                  </div>
                  <Link
                    href="/majors"
                    className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#111965] hover:underline"
                  >
                    {getLocalized({ en: "Explore majors", km: "រកមើលជំនាញ" })}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {combinedMajors.map((major) => (
                    <Link
                      key={major.slug}
                      href={`/majors/${major.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] px-3.5 py-3 transition-all hover:border-[#111965]/30 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-base font-black text-[#111965]">
                          {getLocalized(major.name)}
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-[#68708A]">
                          {major.category} · {major.universities}{" "}
                          {getLocalized({
                            en: "universities",
                            km: "សាកលវិទ្យាល័យ",
                          })}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-sm font-black text-[#111965] shadow-2xs">
                        {major.fit}%
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {careerIdeas.length > 0 && (
              <section className="results-reveal rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E8F0] bg-[#F8FAFD] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#111965]">
                      <Compass className="h-3 w-3 text-[#D4A017]" />
                      {getLocalized({
                        en: "Career ideas",
                        km: "គំនិតអាជីព",
                      })}
                    </div>
                    <h2 className="mt-2 text-base font-black text-[#111965] sm:text-lg">
                      {getLocalized({
                        en: "Careers that match your interests",
                        km: "អាជីពដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់អ្នក",
                      })}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#68708A]">
                      {getLocalized({
                        en: "These are career profiles. Open one to see the skills and related majors.",
                        km: "ទាំងនេះជាទម្រង់អាជីព។ បើកមួយដើម្បីមើលជំនាញ និងជំនាញសិក្សាពាក់ព័ន្ធ។",
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {careerIdeas.map((career) => (
                    <Link
                      key={career.slug}
                      href={`/careers/${career.slug}`}
                      className="group rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 transition-colors hover:border-[#111965]/30 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">
                            {getLocalized({
                              en: career.industry,
                              km: career.industry_km,
                            })}
                          </div>
                          <h3 className="mt-1 text-sm font-black text-[#111965] group-hover:text-[#1A2580]">
                            {getLocalized(career.title)}
                          </h3>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#111965]" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68708A]">
                        {getLocalized(career.summary)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {career.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.en}
                            className="rounded-lg border border-[#E6E8F0] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569]"
                          >
                            {getLocalized(skill)}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="results-reveal rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0F2FA] text-[#111965]">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-black text-[#111965]">
                    {getLocalized({ en: "Result history", km: "ប្រវត្តិលទ្ធផល" })}
                  </h2>
                  <p className="text-xs font-semibold text-[#68708A]">
                    {getLocalized({
                      en: "Your last 10 attempts are kept here.",
                      km: "ការប៉ុនប៉ង ១០ លើកចុងក្រោយរបស់អ្នកត្រូវបានរក្សាទុកនៅទីនេះ។",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 divide-y divide-[#E6E8F0]">
                {rows.map((row) => {
                  const personality =
                    row.kind === "personality"
                      ? (row.result as PersonalityResult)
                      : null;
                  const riasec =
                    row.kind === "riasec" ? (row.result as RiasecResult) : null;
                  const headline = personality?.type ?? riasec?.hollandCode ?? "—";
                  const label =
                    row.kind === "personality"
                      ? getLocalized({
                          en: "16-Personality",
                          km: "បុគ្គលិកលក្ខណៈ ១៦",
                        })
                      : "RIASEC";
                  return (
                    <div
                      key={row.id}
                      className="results-history-row flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F2FA] text-sm font-black text-[#111965]">
                          {headline.slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-base font-black text-[#111965]">
                              {headline}
                            </span>
                            <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#68708A]">
                              {label}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#94A3B8]">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(row.completedAt, locale)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/assessments/${row.kind}/result?id=${row.id}`}
                          className="inline-flex h-8 items-center rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-xs font-black text-[#111965] hover:bg-[#F8FAFD]"
                        >
                          {getLocalized({ en: "View", km: "មើល" })}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E8F0] bg-white text-[#94A3B8] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={getLocalized({
                            en: "Delete result",
                            km: "លុបលទ្ធផល",
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </>
        )}
      </div>

      <AssessmentExportDialog
        open={combinedOpen}
        onOpenChange={setCombinedOpen}
        title={getLocalized({
          en: "Download all results",
          km: "ទាញយកលទ្ធផលទាំងអស់",
        })}
        subtitle={getLocalized({
          en: "One report with your personality and career interest results.",
          km: "របាយការណ៍មួយដែលរួមមានលទ្ធផលបុគ្គលិកលក្ខណៈ និងចំណាប់អារម្មណ៍អាជីព។",
        })}
        includes={[
          `${personalityResult?.type ?? ""}`,
          `${riasecResult?.hollandCode ?? ""}`,
          `${combinedMajors.length} ${t("assessmentReport.recommendedMajors")}`,
        ].filter(Boolean)}
        exportingFormat={combinedExporting}
        onExport={handleCombinedExport}
        footer={t("assessmentReport.footer")}
        formats={["pdf", "excel", "png"]}
      />

      <PngSaveModal
        preview={pngPreview}
        onClose={() => setPngPreview(null)}
      />
    </div>
  );
}

function ResultCard({
  kind,
  record,
  locale,
  getLocalized,
}: {
  kind: "personality" | "riasec";
  record?: GuestResultRecord;
  locale: string;
  getLocalized: (value?: { en?: string; km?: string } | null) => string;
}) {
  const isPersonality = kind === "personality";
  const personality = isPersonality
    ? (record?.result as PersonalityResult | undefined)
    : undefined;
  const riasec = !isPersonality
    ? (record?.result as RiasecResult | undefined)
    : undefined;
  const headline = personality?.type ?? riasec?.hollandCode;
  const archetype = personality
    ? ARCHETYPE_META[personality.type]
    : riasec
    ? getHollandArchetype(riasec.hollandCode)
    : null;

  return (
    <section className="results-reveal rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cnIcon(isPersonality)}
          >
            {isPersonality ? (
              <Brain className="h-4 w-4" />
            ) : (
              <Compass className="h-4 w-4" />
            )}
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.1em] text-[#94A3B8]">
              {isPersonality
                ? getLocalized({ en: "16-Personality", km: "បុគ្គលិកលក្ខណៈ ១៦" })
                : "RIASEC"}
            </div>
            <div className="text-xs font-semibold text-[#68708A]">
              {record
                ? formatDate(record.completedAt, locale)
                : getLocalized({ en: "Not taken yet", km: "មិនទាន់ធ្វើតេស្ត" })}
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2.5 py-1 text-xs font-bold text-[#68708A]">
          {isPersonality
            ? getLocalized({ en: "12 questions", km: "១២ សំណួរ" })
            : getLocalized({ en: "18 activities", km: "១៨ សកម្មភាព" })}
        </span>
      </div>

      {record && archetype ? (
        <>
          <div className="mt-4 flex items-end gap-3">
            <div className="results-headline text-3xl font-black tracking-tight text-[#111965]">
              {headline}
            </div>
            <div className="pb-1 text-sm font-bold leading-snug text-[#68708A]">
              {isPersonality
                ? getLocalized({
                    en: (archetype as { nameEn?: string }).nameEn,
                    km: (archetype as { nameKm?: string }).nameKm,
                  })
                : getLocalized({
                    en: (archetype as { titleEn?: string }).titleEn,
                    km: (archetype as { titleKm?: string }).titleKm,
                  })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/assessments/${kind}/result?id=${record.id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-xs font-black text-white hover:bg-[#1A2580]"
            >
              {getLocalized({ en: "View result", km: "មើលលទ្ធផល" })}
              <ArrowRight className="h-3 w-3 text-[#F7CE4D]" />
            </Link>
            <Link
              href={`/assessments/${kind}/test?retake=1`}
              className="inline-flex h-8 items-center rounded-lg border border-[#E6E8F0] bg-white px-3 text-xs font-bold text-[#111965] hover:bg-[#F8FAFD]"
            >
              {getLocalized({ en: "Retake", km: "ធ្វើឡើងវិញ" })}
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-xs leading-relaxed text-[#68708A]">
            {isPersonality
              ? getLocalized({
                  en: "Discover your cognitive style, strengths, and matching majors.",
                  km: "ស្វែងយល់ពីរបៀបគិត ចំណុចខ្លាំង និងជំនាញដែលត្រូវគ្នា។",
                })
              : getLocalized({
                  en: "Find your career interest code and the fields that match your interests.",
                  km: "ស្វែងរកកូដចំណាប់អារម្មណ៍អាជីព និងវិស័យដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់អ្នក។",
                })}
          </p>
          <Link
            href={`/assessments/${kind}/test`}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-xs font-black text-white hover:bg-[#1A2580]"
          >
            {getLocalized({ en: "Take the test", km: "ធ្វើតេស្ត" })}
            <ArrowRight className="h-3 w-3 text-[#F7CE4D]" />
          </Link>
        </>
      )}
    </section>
  );
}

function cnIcon(isPersonality: boolean): string {
  return isPersonality
    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
}
