"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  GraduationCap,
  Lightbulb,
  Link2,
  ListChecks,
  RotateCcw,
  Share2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AssessmentExportDialog,
  PngSaveModal,
} from "@/components/assessments/assessment-export-dialog";
import {
  exportAssessmentReport,
  type AssessmentPngPreview,
  type AssessmentReportFormat,
  type AssessmentReportLabels,
  type AssessmentReportModel,
} from "@/lib/assessment-report";
import {
  ARCHETYPE_META,
  getCognitiveDimensions,
} from "@/lib/personality-meta";
import {
  RIASEC_DIMENSIONS,
  getHollandArchetype,
} from "@/lib/riasec-meta";
import type {
  GuestResultRecord,
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";
import { readProfile } from "@/lib/guest/storage";
import { getCareerIdeasForCodes } from "@/lib/data/career-ideas";
import { getStaticMajor } from "@/lib/data/catalog";

function percent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function currency(value: number | null): string {
  if (value == null) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function GuestResultView({ record }: { record: GuestResultRecord }) {
  const { t, getLocalized, language } = useLanguage();
  const toast = useToast();
  const isKm = language === "km";
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingFormat, setExportingFormat] =
    useState<AssessmentReportFormat | null>(null);
  const [studentName, setStudentName] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [pngPreview, setPngPreview] = useState<AssessmentPngPreview | null>(null);
  const resultRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = resultRootRef.current;
    if (!root || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>(".result-content > section, .result-content > .grid")
        .forEach((section) => {
          gsap.fromTo(
            section,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 88%",
                once: true,
              },
              onComplete: () =>
                gsap.set(section, { clearProps: "opacity,transform" }),
            }
          );
        });

      gsap.utils.toArray<HTMLElement>(".result-score-bar").forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 92%",
              once: true,
            },
          }
        );
      });

      gsap.from(".result-hero-code", {
        opacity: 0,
        scale: 0.9,
        y: 12,
        duration: 0.7,
        delay: 0.15,
        ease: "back.out(1.5)",
      });
    }, root);

    return () => ctx.revert();
  }, [record.id]);

  useEffect(() => {
    const profile = readProfile();
    setStudentName(
      profile?.displayName?.trim() ||
        getLocalized({ en: "Guest", km: "ភ្ញៀវ" })
    );
  }, [getLocalized]);

  const personality =
    record.kind === "personality"
      ? (record.result as PersonalityResult)
      : null;
  const riasec = record.kind === "riasec" ? (record.result as RiasecResult) : null;

  const archetype = personality
    ? ARCHETYPE_META[personality.type]
    : null;
  const holland = riasec ? getHollandArchetype(riasec.hollandCode) : null;

  const headline = personality?.type ?? riasec?.hollandCode ?? "";
  const archetypeName = personality
    ? getLocalized({ en: archetype?.nameEn, km: archetype?.nameKm })
    : getLocalized({ en: holland?.titleEn, km: holland?.titleKm });
  const roleName = personality
    ? getLocalized({ en: archetype?.roleNameEn, km: archetype?.roleNameKm })
    : getLocalized({ en: holland?.subtitleEn, km: holland?.subtitleKm });
  const tagline = personality
    ? getLocalized({ en: archetype?.taglineEn, km: archetype?.taglineKm })
    : getLocalized({ en: holland?.taglineEn, km: holland?.taglineKm });

  const dimensions = personality
    ? [
        {
          label: isKm ? "ចិត្ត & ថាមពល" : "Mind",
          value: Math.max(
            personality.scores.E,
            personality.scores.I
          ),
          detail: `E ${percent(personality.scores.E)}% · I ${percent(
            personality.scores.I
          )}%`,
        },
        {
          label: isKm ? "ការទទួលព័ត៌មាន" : "Energy",
          value: Math.max(
            personality.scores.S,
            personality.scores.N
          ),
          detail: `S ${percent(personality.scores.S)}% · N ${percent(
            personality.scores.N
          )}%`,
        },
        {
          label: isKm ? "ការសម្រេចចិត្ត" : "Nature",
          value: Math.max(
            personality.scores.T,
            personality.scores.F
          ),
          detail: `T ${percent(personality.scores.T)}% · F ${percent(
            personality.scores.F
          )}%`,
        },
        {
          label: isKm ? "យុទ្ធសាស្ត្រជីវិត" : "Tactics",
          value: Math.max(
            personality.scores.J,
            personality.scores.P
          ),
          detail: `J ${percent(personality.scores.J)}% · P ${percent(
            personality.scores.P
          )}%`,
        },
      ]
    : Object.entries(RIASEC_DIMENSIONS).map(([code, meta]) => ({
        label: `${code} — ${getLocalized({
          en: meta.shortNameEn,
          km: meta.shortNameKm,
        })}`,
        value: riasec?.scores[code as keyof typeof riasec.scores] ?? 0,
        detail: riasec?.hollandCode.includes(code)
          ? isKm
            ? "ចំណាប់អារម្មណ៍កំពូល"
            : "Top interest"
          : "",
      }));

  const highlights = personality && archetype
    ? [
        {
          title: isKm ? "ចំណុចខ្លាំងចម្បង" : "Key strengths",
          items: (isKm ? archetype.strengthsKm : archetype.strengthsEn) ?? [],
        },
        {
          title: isKm ? "រចនាប័ទ្មសិក្សា" : "Learning style",
          items: [
            getLocalized({
              en: archetype.learningStyleEn,
              km: archetype.learningStyleKm,
            }),
          ].filter(Boolean),
        },
        {
          title: isKm ? "វិស័យសិក្សាសាកសម" : "Best fields",
          items: (isKm ? archetype.bestFieldsKm : archetype.bestFieldsEn) ?? [],
        },
      ]
    : holland
    ? [
        {
          title: isKm ? "ចំណុចខ្លាំង" : "Key strengths",
          items: (isKm ? holland.strengths : holland.strengthsEn) ?? [],
        },
        {
          title: isKm ? "បរិស្ថានការងារ" : "Work environment",
          items: [
            getLocalized({
              en: holland.optimalWorkEnvironmentEn,
              km: holland.optimalWorkEnvironmentKm,
            }),
          ].filter(Boolean),
        },
        {
          title: isKm ? "វិស័យការងារគោលដៅ" : "Target industries",
          items:
            (isKm ? holland.targetIndustriesKm : holland.targetIndustriesEn) ??
            [],
        },
      ]
    : [];

  const recommendations = (record.result.majorMatches ?? []).slice(0, 6);

  const overview =
    personality && archetype
      ? getLocalized({
          en: archetype.overviewEn,
          km: archetype.overviewKm,
        }) || tagline
      : riasec && holland
        ? getLocalized({
            en: holland.taglineEn,
            km: holland.taglineKm,
          }) || tagline
        : tagline;

  const growthAreas =
    personality && archetype
      ? ((isKm ? archetype.growthAreasKm : archetype.growthAreasEn) ?? [])
      : [];

  const personalityCareers =
    personality && archetype
      ? ((isKm ? archetype.careersKm : archetype.careersEn) ?? [])
      : [];

  const cognitiveDimensions = personality
    ? getCognitiveDimensions(personality.type)
    : [];

  const topCodes = riasec
    ? riasec.ranked.slice(0, 3).map((item) => item.code)
    : [];
  const topRiasecMeta = topCodes
    .map((code) => RIASEC_DIMENSIONS[code])
    .filter((meta): meta is NonNullable<typeof meta> => Boolean(meta));
  const riasecStrengths = Array.from(
    new Set(
      topRiasecMeta.flatMap((meta) =>
        meta.strengths.map((item) => (isKm ? item.km : item.en))
      )
    )
  ).slice(0, 6);
  const riasecCareers = Array.from(
    new Set(
      topRiasecMeta.flatMap((meta) =>
        meta.sampleCareers.map((item) => (isKm ? item.km : item.en))
      )
    )
  ).slice(0, 6);
  const primaryRiasec = topCodes[0] ? RIASEC_DIMENSIONS[topCodes[0]] : null;
  const careerIdeas = riasec ? getCareerIdeasForCodes(topCodes, 6) : [];
  const riasecWorkEnvironment = holland
    ? getLocalized({
        en: holland.optimalWorkEnvironmentEn,
        km: holland.optimalWorkEnvironmentKm,
      })
    : "";
  const riasecIndustries = holland
    ? isKm
      ? holland.targetIndustriesKm
      : holland.targetIndustriesEn
    : [];
  const displayCareers =
    personalityCareers.length > 0
      ? personalityCareers
      : riasecCareers.length > 0
        ? riasecCareers
        : personality && archetype
          ? ((isKm ? archetype.bestFieldsKm : archetype.bestFieldsEn) ?? [])
          : riasecIndustries;

  const personalityStrengths =
    personality && archetype
      ? ((isKm ? archetype.strengthsKm : archetype.strengthsEn) ?? [])
      : [];
  const personalityLearningStyle =
    personality && archetype
      ? getLocalized({
          en: archetype.learningStyleEn,
          km: archetype.learningStyleKm,
        })
      : "";
  const profileChips =
    personality && archetype
      ? personalityStrengths.slice(0, 4)
      : topRiasecMeta.map((meta) =>
          isKm ? meta.shortNameKm : meta.shortNameEn
        );
  const topRiasecActivities =
    topRiasecMeta[0]?.keyActivities.slice(0, 2).map((activity) =>
      isKm ? activity.km : activity.en
    ) ?? [];
  const cleanTopActivities = topRiasecActivities.map(
    (activity) => activity.charAt(0).toLowerCase() + activity.slice(1)
  );
  const profileNarrative =
    personality && archetype
      ? isKm
        ? `${archetypeName} — ${tagline} ${overview} អ្នករៀនបានល្អបំផុតតាមរយៈ ${personalityLearningStyle}។ ចំណុចខ្លាំងរបស់អ្នករួមមាន ${personalityStrengths
            .slice(0, 3)
            .join(", ")}។ ចំណុចដែលគួរអភិវឌ្ឍគឺ ${
            growthAreas[0] ?? (isKm ? "ការស្វែងយល់បន្ថែម" : "continued exploration")
          }។`
        : `${archetypeName} — ${tagline} ${overview} You learn best through ${personalityLearningStyle}. Your strengths include ${personalityStrengths.slice(0, 3).join(", ")}. A growth area to keep in mind is ${growthAreas[0] ?? "continued exploration"}.`
      : riasec && holland
        ? isKm
          ? `${headline} — ${archetypeName}។ ${tagline} ចំណាប់អារម្មណ៍កំពូលរបស់អ្នកគឺ ${topRiasecMeta
              .map((meta) => meta.shortNameKm)
              .join(", ")}។ អ្នកមានថាមពលពី ${topRiasecActivities.join(" និង ")}។ អ្នកធ្វើការបានល្អបំផុតក្នុង ${riasecWorkEnvironment}។`
          : `${headline} — ${archetypeName}. ${tagline} Your strongest interests are ${topRiasecMeta
              .map((meta) => meta.shortNameEn)
              .join(", ")}. You are energized by ${cleanTopActivities.join(" and ")}. You do your best work in ${riasecWorkEnvironment}.`
        : tagline;

  const reflectionPrompts = personality
    ? [
        isKm
          ? "តើចំណុចខ្លាំងមួយណាដែលអ្នកឃើញច្បាស់ក្នុងខ្លួនអ្នក?"
          : "Which of these strengths do you recognize in yourself?",
        isKm
          ? "តើចំណុចណាមួយដែលអ្នកចង់អភិវឌ្ឍឆ្នាំនេះ?"
          : "Which growth area would you like to work on this year?",
        isKm
          ? "តើបរិយាកាសសិក្សាបែបណាដែលជួយឱ្យអ្នកផ្តោតអារម្មណ៍បានល្អ?"
          : "What study environment helps you focus best?",
      ]
    : [
        isKm
          ? "តើចំណាប់អារម្មណ៍កំពូលមួយណាដែលមានអារម្មណ៍ដូចអ្នកបំផុត?"
          : "Which top interest feels most like you?",
        isKm
          ? "តើបរិស្ថានការងារបែបណាដែលធ្វើឱ្យអ្នកមានថាមពល?"
          : "Which work environment sounds most energizing?",
        isKm
          ? "តើជំនាញណាមួយដែលអ្នកចង់ស្វែងយល់មុនគេ?"
          : "Which suggested major would you like to explore first?",
      ];

  const labels: AssessmentReportLabels = {
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

  const buildReport = (): AssessmentReportModel => {
    const generatedAt = new Date(record.completedAt);
    return {
      kind: record.kind,
      title: t(
        record.kind === "personality"
          ? "assessmentReport.personalityTitle"
          : "assessmentReport.riasecTitle"
      ),
      subtitle: t(
        record.kind === "personality"
          ? "assessmentReport.personalitySubtitle"
          : "assessmentReport.riasecSubtitle"
      ),
      studentName,
      generatedAt,
      generatedLabel: generatedAt.toLocaleString(
        language === "km" ? "km-KH" : "en-US"
      ),
      locale: language === "km" ? "km-KH" : "en-US",
      headline,
      headlineLabel: t(
        record.kind === "personality"
          ? "assessmentReport.personalityType"
          : "assessmentReport.hollandCode"
      ),
      archetype: archetypeName,
      role: roleName,
      tagline,
      characterImageUrl:
        typeof window !== "undefined"
          ? personality
            ? `${window.location.origin}/images/personality-types/${personality.type.toLowerCase()}.svg`
            : `${window.location.origin}/images/tara-result-jump.webp`
          : undefined,
      dimensions,
      highlights,
      recommendations: recommendations.map((item) => ({
        major: getLocalized(item.name),
        fit: item.fit,
        universities: item.universities,
      })),
      labels,
    };
  };

  const handleExport = async (format: AssessmentReportFormat) => {
    setExportingFormat(format);
    try {
      const model = buildReport();
      const result = await exportAssessmentReport(model, format);
      if (result?.imagePreview) {
        setPngPreview(result.imagePreview);
      } else if (format === "share" && result?.shareUrl) {
        setShareUrl(result.shareUrl);
        setShareOpen(true);
        try {
          await navigator.clipboard.writeText(result.shareUrl);
          toast.success(t("assessmentReport.shareCopied"));
        } catch {
          // The dialog shows the link for manual copying when the clipboard
          // permission is unavailable.
        }
      } else {
        toast.success(t("assessmentReport.exported"));
      }
      setExportOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("popup")) {
        toast.error(t("assessmentReport.pdfBlocked"));
      } else {
        toast.error(t("assessmentReport.failed"));
      }
    } finally {
      setExportingFormat(null);
    }
  };

  const exportIncludes = (
    record.kind === "personality"
      ? [
          personality?.type,
          t("assessmentReport.personalityType"),
          `${recommendations.length} ${t("assessmentReport.recommendedMajors")}`,
        ]
      : [
          riasec?.hollandCode,
          t("assessmentReport.hollandCode"),
          `${recommendations.length} ${t("assessmentReport.recommendedMajors")}`,
        ]
  ).filter((item): item is string => Boolean(item));

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("assessmentReport.shareCopied"));
    } catch {
      toast.error(t("assessmentReport.shareFailed"));
    }
  };

  return (
    <div
      ref={resultRootRef}
      className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-6 sm:pt-10"
    >
      <div className="result-content mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/assessments/results"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#68708A] transition-colors hover:text-[#111965]"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            {getLocalized({ en: "All assessments", km: "ការវាយតម្លៃទាំងអស់" })}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/assessments/results"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#D9DEEA] bg-white px-3 text-sm font-black text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-[#F8FAFD]"
            >
              <Trophy className="h-3.5 w-3.5" />
              {getLocalized({ en: "My results", km: "លទ្ធផលរបស់ខ្ញុំ" })}
            </Link>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] px-3 text-sm font-black text-white transition-colors hover:bg-[#1A2580]"
            >
              <Download className="h-3.5 w-3.5 text-[#F7CE4D]" />
              {t("assessmentReport.exportReport")}
            </button>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-[#111965]/40 bg-gradient-to-br from-[#111965] via-[#1A2580] to-[#0D134E] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F7CE4D]/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#F7CE4D]">
                <Sparkles className="h-3.5 w-3.5" />
                {record.kind === "personality"
                  ? getLocalized({
                      en: "16-Personality result",
                      km: "លទ្ធផលបុគ្គលិកលក្ខណៈ ១៦",
                    })
                  : getLocalized({
                      en: "RIASEC result",
                      km: "លទ្ធផល RIASEC",
                    })}
              </div>
              <div>
                <div className="result-hero-code text-4xl font-black tracking-tight text-[#F7CE4D] sm:text-6xl">
                  {headline}
                </div>
                <h1 className="mt-1 text-xl font-extrabold leading-snug sm:text-2xl">
                  {archetypeName}
                </h1>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white/60">
                  {roleName}
                </p>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                {tagline}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExportOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-3.5 py-2 text-sm font-black text-[#111965] transition-transform hover:bg-[#F5C430] active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("assessmentReport.exportReport")}
                </button>
                <Link
                  href={`/assessments/${record.kind}/test?retake=1`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#F7CE4D]" />
                  {getLocalized({ en: "Retake", km: "ធ្វើតេស្តឡើងវិញ" })}
                </Link>
                <Link
                  href={
                    record.kind === "personality"
                      ? "/assessments/riasec/test"
                      : "/assessments/personality/test"
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Compass className="h-3.5 w-3.5 text-[#F7CE4D]" />
                  {record.kind === "personality"
                    ? getLocalized({ en: "Take RIASEC", km: "ធ្វើតេស្ត RIASEC" })
                    : getLocalized({
                        en: "Take Personality",
                        km: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈ",
                      })}
                </Link>
              </div>
            </div>

            {personality && (
              <div className="relative flex shrink-0 items-center justify-center self-center sm:self-auto">
                <div
                  className="absolute inset-0 scale-125 rounded-full opacity-30 blur-3xl"
                  style={{ backgroundColor: archetype?.roleColor ?? "#F7CE4D" }}
                />
                <Image
                  src={`/images/personality-types/${personality.type.toLowerCase()}.svg`}
                  alt={`${personality.type} character`}
                  width={180}
                  height={230}
                  priority
                  className="relative z-10 h-44 w-32 object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)] sm:h-56 sm:w-44"
                />
              </div>
            )}
            {riasec && (
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border border-white/20 bg-white/10 text-center backdrop-blur-md sm:h-40 sm:w-40">
                <div>
                  <Trophy className="mx-auto h-6 w-6 text-[#F7CE4D]" />
                  <div className="mt-1 text-2xl font-black text-white">
                    {riasec.hollandCode}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-white/60">
                    Holland
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Profile at a glance */}
        <section className="rounded-3xl border border-[#E6E8F0] bg-gradient-to-br from-[#FFFDF5] via-white to-[#F8FAFD] p-5 shadow-xs sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F7CE4D]/15 text-[#B45309]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-[#111965] sm:text-lg">
                {isKm
                  ? "ទម្រង់របស់អ្នកក្នុងមួយនាទី"
                  : "Your profile in one minute"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#94A3B8]">
                {isKm
                  ? "សេចក្តីសង្ខេបខ្លីមុនពេលអានលម្អិត។"
                  : "A quick summary before the detailed sections."}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-[#475569]">
            {profileNarrative}
          </p>

          {profileChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profileChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-xl border border-[#E6E8F0] bg-white px-3 py-1.5 text-xs font-bold text-[#111965] shadow-2xs"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
              {personality ? (
                <Brain className="h-5 w-5" />
              ) : (
                <Compass className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 className="text-base font-black text-[#111965] sm:text-lg">
                {personality
                  ? getLocalized({
                      en: "About your personality type",
                      km: "អំពីប្រភេទបុគ្គលិកលក្ខណៈរបស់អ្នក",
                    })
                  : getLocalized({
                      en: "About your career interest code",
                      km: "អំពីកូដចំណាប់អារម្មណ៍អាជីពរបស់អ្នក",
                    })}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#94A3B8]">
                {roleName}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#475569]">
            {overview}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {personality ? (
              <>
                <InfoTile
                  label={getLocalized({ en: "Role", km: "តួនាទី" })}
                  value={roleName}
                />
                <InfoTile
                  label={getLocalized({
                    en: "Learning style",
                    km: "រចនាប័ទ្មសិក្សា",
                  })}
                  value={
                    getLocalized({
                      en: archetype?.learningStyleEn,
                      km: archetype?.learningStyleKm,
                    }) || "—"
                  }
                />
                <InfoTile
                  label={getLocalized({
                    en: "Best fields",
                    km: "វិស័យសាកសម",
                  })}
                  value={
                    (isKm
                      ? archetype?.bestFieldsKm
                      : archetype?.bestFieldsEn
                    )?.join(", ") || "—"
                  }
                />
              </>
            ) : (
              <>
                <InfoTile
                  label={getLocalized({
                    en: "Primary interest",
                    km: "ចំណាប់អារម្មណ៍ចម្បង",
                  })}
                  value={
                    primaryRiasec
                      ? getLocalized({
                          en: primaryRiasec.shortNameEn,
                          km: primaryRiasec.shortNameKm,
                        })
                      : "—"
                  }
                />
                <InfoTile
                  label={getLocalized({
                    en: "Work environment",
                    km: "បរិស្ថានការងារ",
                  })}
                  value={riasecWorkEnvironment || "—"}
                />
                <InfoTile
                  label={getLocalized({
                    en: "Target industries",
                    km: "វិស័យការងារគោលដៅ",
                  })}
                  value={riasecIndustries.slice(0, 3).join(", ") || "—"}
                />
              </>
            )}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailList
            title={getLocalized({
              en: "Your strengths",
              km: "ចំណុចខ្លាំងរបស់អ្នក",
            })}
            items={highlights[0]?.items ?? []}
            icon={CheckCircle2}
            tone="emerald"
          />
          {personality ? (
            <DetailList
              title={getLocalized({
                en: "Growth areas",
                km: "ចំណុចដែលគួរអភិវឌ្ឍ",
              })}
              items={growthAreas}
              icon={AlertTriangle}
              tone="amber"
            />
          ) : (
            <DetailList
              title={getLocalized({
                en: "How to thrive",
                km: "របៀបរីកចម្រើន",
              })}
              items={[riasecWorkEnvironment, ...riasecIndustries.slice(0, 3)].filter(
                Boolean
              )}
              icon={Lightbulb}
              tone="amber"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
            <h3 className="text-base font-black text-[#111965] sm:text-lg">
              {personality
                ? getLocalized({
                    en: "How you learn best",
                    km: "របៀបដែលអ្នករៀនបានល្អបំផុត",
                  })
                : getLocalized({
                    en: "Your strongest interest",
                    km: "ចំណាប់អារម្មណ៍ខ្លាំងបំផុតរបស់អ្នក",
                  })}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              {personality
                ? getLocalized({
                    en: archetype?.learningStyleEn,
                    km: archetype?.learningStyleKm,
                  }) || "—"
                : primaryRiasec
                  ? getLocalized({
                      en: primaryRiasec.descEn,
                      km: primaryRiasec.descKm,
                    })
                  : "—"}
            </p>
          </section>
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
            <h3 className="text-base font-black text-[#111965] sm:text-lg">
              {personality
                ? getLocalized({
                    en: "Where you can thrive",
                    km: "កន្លែងដែលអ្នកអាចរីកចម្រើន",
                  })
                : getLocalized({
                    en: "Your work environment",
                    km: "បរិស្ថានការងាររបស់អ្នក",
                  })}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              {personality
                ? (isKm
                    ? archetype?.bestFieldsKm
                    : archetype?.bestFieldsEn
                  )?.join(" · ") || "—"
                : riasecWorkEnvironment || "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(personality
                ? (isKm ? archetype?.bestFieldsKm : archetype?.bestFieldsEn) ?? []
                : riasecIndustries
              )
                .slice(0, 4)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2.5 py-1 text-xs font-semibold text-[#475569]"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[#111965] sm:text-lg">
                {record.kind === "personality"
                  ? getLocalized({
                      en: "What your answers mean",
                      km: "អត្ថន័យនៃចម្លើយរបស់អ្នក",
                    })
                  : getLocalized({
                      en: "Your career interest scores",
                      km: "ពិន្ទុចំណាប់អារម្មណ៍អាជីពរបស់អ្នក",
                    })}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#68708A]">
                {record.kind === "personality"
                  ? getLocalized({
                      en: "Each pair shows your stronger side and how the two traits balance.",
                      km: "គូនីមួយៗបង្ហាញពីផ្នែកខ្លាំង និងតុល្យភាពរវាងលក្ខណៈទាំងពីរ។",
                    })
                  : getLocalized({
                      en: "Your top three letters form your career interest code.",
                      km: "អក្សរកំពូលទាំង ៣ បង្កើតបានជាកូដចំណាប់អារម្មណ៍អាជីពរបស់អ្នក។",
                    })}
              </p>
            </div>
            {record.kind === "personality" && (
              <div className="flex flex-wrap gap-1.5">
                {getCognitiveDimensions(personality?.type ?? "INTJ")
                  .slice(0, 4)
                  .map((dimension) => (
                    <span
                      key={dimension.code}
                      className="rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-xs font-bold text-[#111965]"
                    >
                      {dimension.letter} · {dimension.dimension}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {dimensions.map((dimension) => (
              <div key={dimension.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
                  <span className="text-[#111965]">{dimension.label}</span>
                  <span className="text-[#68708A]">
                    {percent(dimension.value)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F7]">
                  <div
                    className="result-score-bar h-full rounded-full bg-gradient-to-r from-[#111965] via-[#26338F] to-[#F7CE4D]"
                    style={{ width: `${percent(dimension.value)}%` }}
                  />
                </div>
                {dimension.detail && (
                  <div className="mt-1 text-sm font-semibold text-[#94A3B8]">
                    {dimension.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

                {personality && (
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-7">
            <SectionHeading
              icon={Brain}
              title={getLocalized({
                en: "What each part means",
                km: "អត្ថន័យនៃផ្នែកនីមួយៗ",
              })}
              subtitle={getLocalized({
                en: "Each preference pair shapes how you study, communicate, and make decisions.",
                km: "គូចំណូលចិត្តនីមួយៗកំណត់របៀបដែលអ្នករៀន ប្រាស្រ័យទាក់ទង និងសម្រេចចិត្ត។",
              })}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {cognitiveDimensions.map((dimension) => {
                const score =
                  personality.scores[
                    dimension.letter as keyof typeof personality.scores
                  ] ?? 0;
                return (
                  <div
                    key={dimension.code}
                    className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111965] text-xs font-black text-[#F7CE4D]">
                          {dimension.letter}
                        </span>
                        <h3 className="text-sm font-black leading-snug text-[#111965]">
                          {getLocalized({
                            en: dimension.nameEn,
                            km: dimension.nameKm,
                          })}
                        </h3>
                      </div>
                      <span className="shrink-0 text-xs font-black text-[#111965]">
                        {percent(score)}%
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-6 text-[#475569]">
                      {getLocalized({
                        en: dimension.traitEn,
                        km: dimension.traitKm,
                      })}
                    </p>
                    <div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                      {dimension.scoreLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {riasec && (
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-7">
            <SectionHeading
              icon={Compass}
              title={getLocalized({
                en: "What your career interest code means",
                km: "អត្ថន័យនៃកូដចំណាប់អារម្មណ៍អាជីពរបស់អ្នក",
              })}
              subtitle={getLocalized({
                en: "Your top three interest areas, in order. The first one is strongest.",
                km: "វិស័យចំណាប់អារម្មណ៍កំពូលទាំង ៣ តាមលំដាប់។ ផ្នែកទីមួយខ្លាំងបំផុត។",
              })}
            />
            <div className="mt-5 space-y-3">
              {topRiasecMeta.map((meta, index) => (
                <div
                  key={meta.code}
                  className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111965] text-xs font-black text-[#F7CE4D]">
                        {meta.code}
                      </span>
                      <h3 className="text-base font-black text-[#111965]">
                        {getLocalized({
                          en: meta.shortNameEn,
                          km: meta.shortNameKm,
                        })}
                      </h3>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-6 text-[#475569]">
                    {getLocalized({ en: meta.descEn, km: meta.descKm })}
                  </p>
                  {meta.strengths.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                        {isKm ? "ចំណុចខ្លាំង" : "Strengths"}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {meta.strengths.slice(0, 4).map((strength) => (
                          <span
                            key={strength.en}
                            className="rounded-lg border border-[#E6E8F0] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569]"
                          >
                            {getLocalized(strength)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {meta.keyActivities.map((activity) => (
                      <li
                        key={activity.en}
                        className="flex items-start gap-2 text-sm leading-6 text-[#475569]"
                      >
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{getLocalized(activity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-relaxed text-[#68708A]">
                    <strong className="text-[#111965]">
                      {getLocalized({
                        en: "Work environment:",
                        km: "បរិស្ថានការងារ៖",
                      })}
                    </strong>{" "}
                    {getLocalized(meta.workEnvironment)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {careerIdeas.length > 0 ? (
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-7">
            <SectionHeading
              icon={Briefcase}
              title={getLocalized({
                en: "Career ideas for you",
                km: "អាជីពដែលសាកសមសម្រាប់អ្នក",
              })}
              subtitle={getLocalized({
                en: "Real career profiles that match your top interests. Use them to explore, not as a fixed path.",
                km: "ទម្រង់អាជីពពិតប្រាកដដែលត្រូវនឹងចំណាប់អារម្មណ៍កំពូលរបស់អ្នក។ ប្រើពួកវាដើម្បីស្វែងយល់ មិនមែនជាផ្លូវកំណត់តែមួយទេ។",
              })}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {careerIdeas.map((career) => (
                <article
                  key={career.slug}
                  className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">
                        {getLocalized({ en: career.industry, km: career.industry_km })}
                      </div>
                      <h3 className="mt-1 text-base font-black leading-snug text-[#111965]">
                        {getLocalized(career.title)}
                      </h3>
                    </div>
                    <span className="rounded-lg border border-[#E6E8F0] bg-white px-2 py-1 text-[10px] font-bold text-[#68708A]">
                      {career.riasec_codes.join(" · ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#475569]">
                    {getLocalized(career.summary)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {career.skills.map((skill) => (
                      <span
                        key={skill.en}
                        className="rounded-lg border border-[#E6E8F0] bg-white px-2 py-1 text-xs font-semibold text-[#475569]"
                      >
                        {getLocalized(skill)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-[#E6E8F0] pt-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                      {getLocalized({
                        en: "Related majors",
                        km: "ជំនាញពាក់ព័ន្ធ",
                      })}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {career.related_majors.slice(0, 3).map((slug) => {
                        const major = getStaticMajor(slug);
                        if (!major) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/majors/${slug}`}
                            className="text-xs font-bold text-[#111965] hover:underline"
                          >
                            {getLocalized(major.name)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#68708A]">
                      {getLocalized(career.education)}
                    </span>
                    <Link
                      href={`/careers/${career.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#111965] hover:underline"
                    >
                      {getLocalized({
                        en: "View career",
                        km: "មើលអាជីព",
                      })}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : displayCareers.length > 0 ? (
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
            <SectionHeading
              icon={Briefcase}
              title={getLocalized({
                en: "Career ideas",
                km: "គំនិតអាជីព",
              })}
              subtitle={getLocalized({
                en: "Take the career interest test to see career profiles that match your interests.",
                km: "ធ្វើតេស្តចំណាប់អារម្មណ៍អាជីព ដើម្បីមើលទម្រង់អាជីពដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់អ្នក។",
              })}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {displayCareers.slice(0, 8).map((career) => (
                <span
                  key={career}
                  className="rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-1.5 text-sm font-semibold text-[#475569]"
                >
                  {career}
                </span>
              ))}
            </div>
          </section>
        ) : null}

<section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-black uppercase tracking-[0.12em] text-amber-800">
                <Target className="h-3 w-3" />
                {getLocalized({ en: "Match score", km: "ពិន្ទុត្រូវគ្នា" })}
              </div>
              <h2 className="mt-2 text-base font-black text-[#111965] sm:text-lg">
                {getLocalized({
                  en: "Majors that match your profile",
                  km: "ជំនាញដែលត្រូវនឹងប្រវត្តិរូបរបស់អ្នក",
                })}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#68708A]">
                {getLocalized({
                  en: "This score shows how well each major matches your interests and personality. It does not promise admission.",
                  km: "ពិន្ទុនេះបង្ហាញថាជំនាញនីមួយៗត្រូវនឹងចំណាប់អារម្មណ៍ និងបុគ្គលិកលក្ខណៈរបស់អ្នកកម្រិតណា។ វាមិនមែនជាការធានាចូលរៀនទេ។",
                })}
              </p>
            </div>
            <Link
              href="/majors"
              className="inline-flex items-center gap-1.5 text-sm font-black text-[#111965] hover:underline"
            >
              {getLocalized({ en: "Explore all majors", km: "រកមើលជំនាញទាំងអស់" })}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommendations.map((major) => (
              <Link
                key={major.slug}
                href={`/majors/${major.slug}`}
                className="group rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 transition-all hover:-translate-y-0.5 hover:border-[#111965]/30 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-[0.1em] text-[#D4A017]">
                      {major.fit}% {getLocalized({ en: "fit", km: "ត្រូវគ្នា" })}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-[#111965] group-hover:text-[#1A2580]">
                      {getLocalized(major.name)}
                    </h3>
                    <div className="mt-1.5 text-xs font-semibold text-[#68708A]">
                      {major.category}
                    </div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#111965] shadow-2xs">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#E6E8F0] pt-2 text-sm font-bold text-[#68708A]">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {major.universities}{" "}
                    {getLocalized({ en: "universities", km: "សាកលវិទ្យាល័យ" })}
                  </span>
                  <span>RIASEC {major.riasecPrimary}{major.riasecSecondary}</span>
                  {major.minTuitionUsd != null && (
                    <span>
                      {getLocalized({ en: "from", km: "ចាប់ពី" })}{" "}
                      {currency(major.minTuitionUsd)}/{getLocalized({ en: "yr", km: "ឆ្នាំ" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <SectionHeading
            icon={ListChecks}
            title={getLocalized({
              en: "How to use this result",
              km: "របៀបប្រើលទ្ធផលនេះ",
            })}
            subtitle={getLocalized({
              en: "Turn the profile into a shortlist, then compare the facts before you apply.",
              km: "បំប្លែងប្រវត្តិរូបទៅជាបញ្ជីជម្រើស រួចប្រៀបធៀបព័ត៌មានជាក់ស្តែងមុនពេលដាក់ពាក្យ។",
            })}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StepCard
              number="01"
              title={getLocalized({
                en: "Shortlist majors",
                km: "ជ្រើសរើសជំនាញ",
              })}
              body={getLocalized({
                en: "Open your top matches and read the subjects, skills, and tuition.",
                km: "បើកជំនាញកំពូល ហើយអានមុខវិជ្ជា ជំនាញ និងថ្លៃសិក្សា។",
              })}
              href="/majors"
            />
            <StepCard
              number="02"
              title={getLocalized({
                en: "Compare universities",
                km: "ប្រៀបធៀបសាកលវិទ្យាល័យ",
              })}
              body={getLocalized({
                en: "Check location, tuition, and the programs offered by each university.",
                km: "ពិនិត្យទីតាំង ថ្លៃសិក្សា និងកម្មវិធីដែលសាកលវិទ្យាល័យនីមួយៗផ្តល់ជូន។",
              })}
              href="/universities"
            />
            <StepCard
              number="03"
              title={getLocalized({
                en: "Save or share",
                km: "រក្សាទុក ឬចែករំលែក",
              })}
              body={getLocalized({
                en: "Export a PDF, spreadsheet, or share card to discuss with family or a counselor.",
                km: "នាំចេញ PDF តារាង ឬកាតចែករំលែក ដើម្បីពិភាក្សាជាមួយគ្រួសារ ឬអ្នកប្រឹក្សា។",
              })}
              onClick={() => setExportOpen(true)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <SectionHeading
            icon={Lightbulb}
            title={getLocalized({
              en: "Reflect on this",
              km: "សញ្ជឹងគិតអំពីរឿងនេះ",
            })}
            subtitle={getLocalized({
              en: "Use these questions to turn the result into a next step.",
              km: "ប្រើសំណួរទាំងនេះដើម្បីបំប្លែងលទ្ធផលទៅជាជំហានបន្ទាប់។",
            })}
          />
          <div className="mt-4 space-y-3">
            {reflectionPrompts.map((prompt, index) => (
              <div
                key={prompt}
                className="flex items-start gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-3.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#111965] text-xs font-black text-[#F7CE4D]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-[#475569]">
                  {prompt}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E8F0] bg-white px-4 py-3 text-xs font-semibold text-[#68708A]">
          <span>
            {getLocalized({
              en: "Keep a copy of this result by downloading it.",
              km: "រក្សាទុកលទ្ធផលនេះដោយទាញយកច្បាប់ចម្លង។",
            })}
          </span>
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1.5 font-black text-[#111965] hover:underline"
          >
            <Share2 className="h-3.5 w-3.5" />
            {getLocalized({ en: "Export or share", km: "នាំចេញ ឬចែករំលែក" })}
          </button>
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
        formats={["pdf", "excel", "png"]}
      />

      <PngSaveModal
        preview={pngPreview}
        onClose={() => setPngPreview(null)}
      />

      <Dialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        className="max-w-xl"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
              <Link2 className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>
                {getLocalized({
                  en: "Share this result",
                  km: "ចែករំលែកលទ្ធផលនេះ",
                })}
              </DialogTitle>
              <DialogDescription>
                {getLocalized({
                  en: "Anyone with this link can view a copy of this result.",
                  km: "អ្នកណាមានតំណនេះអាចមើលច្បាប់ចម្លងនៃលទ្ធផលនេះ។",
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#111965] outline-none focus:border-[#111965]/40"
            aria-label={getLocalized({
              en: "Share link",
              km: "តំណចែករំលែក",
            })}
          />
          <button
            type="button"
            onClick={handleCopyShare}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white hover:bg-[#1A2580]"
          >
            <Copy className="h-3.5 w-3.5 text-[#F7CE4D]" />
            {getLocalized({ en: "Copy link", km: "ចម្លងតំណ" })}
          </button>
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
            {getLocalized({
              en: "Privacy note: the result is encoded inside the link. Do not share it publicly if you do not want others to see your scores.",
              km: "ចំណាំឯកជនភាព៖ លទ្ធផលត្រូវបានអ៊ិនកូដក្នុងតំណ។ សូមកុំចែករំលែកជាសាធារណៈ ប្រសិនបើអ្នកមិនចង់ឱ្យអ្នកដទៃឃើញពិន្ទុរបស់អ្នក។",
            })}
          </p>
        </div>
      </Dialog>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-3.5">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold leading-relaxed text-[#111965]">
        {value}
      </div>
    </div>
  );
}

function DetailList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  tone: "emerald" | "amber";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";
  const bulletClass =
    tone === "emerald" ? "text-emerald-500" : "text-amber-500";
  return (
    <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-black text-[#111965]">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-6 text-[#475569]"
          >
            <CheckCircle2 className={`mt-1 h-4 w-4 shrink-0 ${bulletClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-base font-black text-[#111965] sm:text-lg">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-[#68708A]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  body,
  href,
  onClick,
}: {
  number: string;
  title: string;
  body: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
          {number}
        </span>
        <ArrowRight className="h-4 w-4 text-[#111965]" />
      </div>
      <h3 className="mt-2 text-base font-black text-[#111965]">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#68708A]">{body}</p>
    </>
  );
  const className =
    "block rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 text-left transition-colors hover:border-[#111965]/30 hover:bg-white";
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
