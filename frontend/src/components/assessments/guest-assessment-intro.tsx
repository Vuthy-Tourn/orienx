"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/layout/logo";
import {
  GUEST_STORAGE_EVENT,
  readLatestResult,
  readPersonalityDraft,
  readRiasecDraft,
} from "@/lib/guest/storage";
import type { PersonalityResult, RiasecResult } from "@/lib/guest/types";
import { cn } from "@/lib/utils";

interface GuestAssessmentIntroProps {
  activeKind: "personality" | "riasec";
  storageAvailable: boolean;
  onStart: () => void;
}

function subscribeGuestStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(GUEST_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(GUEST_STORAGE_EVENT, onStoreChange);
  };
}

function getSummaryKey(): string {
  if (typeof window === "undefined") return "";
  const pRes = readLatestResult("personality");
  const rRes = readLatestResult("riasec");
  const pDraft = readPersonalityDraft();
  const rDraft = readRiasecDraft();
  const pCount = pDraft ? Object.keys(pDraft.answers).length : 0;
  const rCount = rDraft ? Object.keys(rDraft.answers).length : 0;
  return `${pRes?.id ?? "none"}|${rRes?.id ?? "none"}|${pCount}|${rCount}`;
}

export function TestFocusBar({
  title,
  onExit,
}: {
  title: string;
  onExit: () => void;
}) {
  const { getLocalized } = useLanguage();

  return (
    <div className="mx-auto mb-5 flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-[#E6E8F0] bg-white/90 px-4 py-2.5 shadow-2xs backdrop-blur-md dark:border-white/10 dark:bg-[#0D1445]/80">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#68708A] transition-colors hover:bg-slate-100 hover:text-[#111965] dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {getLocalized({ en: "Exit test", km: "ចាកចេញពីតេស្ត" })}
          </span>
        </button>
        <span className="hidden h-4 w-px bg-[#E6E8F0] dark:bg-white/15 sm:block" />
        <span className="hidden truncate text-xs sm:text-sm font-extrabold text-[#111965] sm:block">
          {title}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <Logo size="sm" showText={false} href="/assessments" />
        </div>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}

export function DraftRestoredBanner({
  message,
  progress,
  onDismiss,
}: {
  message: string;
  progress: number;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-900 shadow-2xs dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <span className="leading-relaxed">{message}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs sm:text-sm font-black text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {progress}%
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-emerald-700/80 transition-colors hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-500/20 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function GuestAssessmentIntro({
  activeKind,
  storageAvailable,
  onStart,
}: GuestAssessmentIntroProps) {
  const router = useRouter();
  const { getLocalized } = useLanguage();
  const [selectedKind, setSelectedKind] = useState<"personality" | "riasec">(
    activeKind
  );

  const summaryKey = useSyncExternalStore(
    subscribeGuestStorage,
    getSummaryKey,
    () => ""
  );

  const summary = useMemo(() => {
    if (!summaryKey) {
      return {
        personalityResult: null as PersonalityResult | null,
        riasecResult: null as RiasecResult | null,
        personalityDraftCount: 0,
        riasecDraftCount: 0,
      };
    }
    const pLatest = readLatestResult("personality");
    const rLatest = readLatestResult("riasec");
    const pDraft = readPersonalityDraft();
    const rDraft = readRiasecDraft();
    return {
      personalityResult: (pLatest?.result as PersonalityResult) ?? null,
      riasecResult: (rLatest?.result as RiasecResult) ?? null,
      personalityDraftCount: pDraft ? Object.keys(pDraft.answers).length : 0,
      riasecDraftCount: rDraft ? Object.keys(rDraft.answers).length : 0,
    };
  }, [summaryKey]);

  const hasPersonalityResult = Boolean(summary.personalityResult);
  const hasRiasecResult = Boolean(summary.riasecResult);
  const hasAnyResult = hasPersonalityResult || hasRiasecResult;

  const tests = [
    {
      kind: "personality" as const,
      href: "/assessments/personality/test",
      resultHref: "/assessments/personality/result",
      icon: Sparkles,
      accentBg: "bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-500/15 dark:border-blue-400/30 dark:text-blue-300",
      title: getLocalized({
        en: "16-Personality (MBTI)",
        km: "បុគ្គលិកលក្ខណៈ ១៦",
      }),
      shortName: getLocalized({
        en: "16-Personality",
        km: "បុគ្គលិកលក្ខណៈ ១៦",
      }),
      countLabel: getLocalized({
        en: "12 statements",
        km: "១២ សំណើ",
      }),
      timeLabel: getLocalized({
        en: "~3 min",
        km: "~៣ នាទី",
      }),
      desc: getLocalized({
        en: "Understand your cognitive style, study endurance, and matching academic environments.",
        km: "ស្វែងយល់ពីរបៀបគិត ចំណុចខ្លាំងក្នុងការសិក្សា និងបរិយាកាសសិក្សាដែលត្រូវនឹងអ្នក។",
      }),
      completed: hasPersonalityResult,
      resultCode: summary.personalityResult?.type ?? null,
      draftCount: summary.personalityDraftCount,
    },
    {
      kind: "riasec" as const,
      href: "/assessments/riasec/test",
      resultHref: "/assessments/riasec/result",
      icon: Compass,
      accentBg: "bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-300",
      title: getLocalized({
        en: "Holland RIASEC Interests",
        km: "ចំណាប់អារម្មណ៍ RIASEC",
      }),
      shortName: getLocalized({
        en: "RIASEC Test",
        km: "តេស្ត RIASEC",
      }),
      countLabel: getLocalized({
        en: "18 activities",
        km: "១៨ សកម្មភាព",
      }),
      timeLabel: getLocalized({
        en: "~4 min",
        km: "~៤ នាទី",
      }),
      desc: getLocalized({
        en: "Discover your 3-letter career interest code and matched Cambodian university majors.",
        km: "ស្វែងរកកូដចំណាប់អារម្មណ៍អាជីព ៣ តួអក្សរ និងជំនាញសាកលវិទ្យាល័យដែលត្រូវគ្នា។",
      }),
      completed: hasRiasecResult,
      resultCode: summary.riasecResult?.hollandCode ?? null,
      draftCount: summary.riasecDraftCount,
    },
  ];

  const selectedTest =
    tests.find((item) => item.kind === selectedKind) ?? tests[0];

  const handleLaunchSelected = () => {
    if (selectedKind === activeKind) {
      onStart();
      return;
    }
    router.push(`${selectedTest.href}?autostart=1`);
  };

  const ctaLabel =
    selectedTest.draftCount > 0
      ? getLocalized({
          en: `Resume ${selectedTest.shortName}`,
          km: `បន្តធ្វើ ${selectedTest.shortName}`,
        })
      : selectedTest.completed
      ? getLocalized({
          en: `Retake ${selectedTest.shortName}`,
          km: `ធ្វើ ${selectedTest.shortName} ម្តងទៀត`,
        })
      : getLocalized({
          en: `Start ${selectedTest.shortName}`,
          km: `ចាប់ផ្តើម ${selectedTest.shortName}`,
        });

  return (
    <div className="min-h-screen bg-[#F5F6FA] px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          {hasAnyResult && (
            <Link
              href="/assessments/results"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E6E8F0] bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-[#111965] shadow-2xs transition-colors hover:border-[#111965]/40"
            >
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              {getLocalized({ en: "View my results", km: "មើលលទ្ធផលរបស់ខ្ញុំ" })}
            </Link>
          )}
        </div>

        {/* Clean Editorial Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#111965]/15 bg-white px-3.5 py-1 text-xs font-extrabold text-[#111965] shadow-2xs dark:border-[#F7CE4D]/30 dark:bg-[#0D1445]/70 dark:text-[#F7CE4D]">
            <Sparkles className="h-3.5 w-3.5 text-[#D4A017] dark:text-[#F7CE4D]" />
            {getLocalized({
              en: "Free • No account needed",
              km: "ឥតគិតថ្លៃ • មិនត្រូវការគណនី",
            })}
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#111965] sm:text-4xl">
            {getLocalized({
              en: "Choose an assessment to begin",
              km: "ជ្រើសរើសតេស្តដើម្បីចាប់ផ្តើម",
            })}
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#68708A]">
            {getLocalized({
              en: "Click either test card below to select it. Complete one for instant insights, or take both to unlock combined major recommendations.",
              km: "ចុចលើកាតតេស្តខាងក្រោមដើម្បីជ្រើសរើស។ បំពេញតេស្តមួយដើម្បីមើលលទ្ធផលភ្លាមៗ ឬធ្វើទាំងពីរដើម្បីទទួលបានការណែនាំជំនាញរួមកាន់តែសុក្រឹត។",
            })}
          </p>
        </div>

        {/* Interactive Click-to-Select Bento Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tests.map((item) => {
            const isSelected = item.kind === selectedKind;
            const Icon = item.icon;
            return (
              <div
                key={item.kind}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedKind(item.kind)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedKind(item.kind);
                  }
                }}
                className={cn(
                  "group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]",
                  isSelected
                    ? "border-[#111965] bg-white shadow-lg shadow-[#111965]/10 ring-2 ring-[#111965]/20 dark:border-[#F7CE4D] dark:bg-[#0D1445]/90 dark:ring-[#F7CE4D]/25"
                    : "border-[#E6E8F0] bg-white/85 hover:border-[#111965]/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-[#0D1445]/45 dark:hover:border-white/25"
                )}
              >
                <div>
                  {/* Top Icon + Selection Check / Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105",
                        item.accentBg
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      {item.completed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.resultCode}
                        </span>
                      )}
                      {!item.completed && item.draftCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          {getLocalized({
                            en: `Saved (${item.draftCount})`,
                            km: `រក្សាទុក (${item.draftCount})`,
                          })}
                        </span>
                      )}

                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-[#111965] bg-[#111965] text-white dark:border-[#F7CE4D] dark:text-white"
                            : "border-slate-300 bg-transparent dark:border-white/25"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3] text-white" />}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="mt-4 text-lg sm:text-xl font-black text-[#111965]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#68708A]">
                    {item.desc}
                  </p>
                </div>

                {/* Card Footer: Metadata + Optional Result Link (only if completed) */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10">
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#68708A]">
                    <span>{item.countLabel}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 text-[#D4A017]" />
                      {item.timeLabel}
                    </span>
                  </div>

                  {item.completed && (
                    <Link
                      href={item.resultHref}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
                    >
                      {getLocalized({ en: "View result →", km: "មើលលទ្ធផល →" })}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Storage Warning (only if disabled) */}
        {!storageAvailable && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm leading-relaxed text-amber-900">
            {getLocalized({
              en: "Your device is blocking saved answers. You can still take the test, but your result may disappear when you close this tab.",
              km: "ឧបករណ៍របស់អ្នកបិទការរក្សាទុកចម្លើយ។ អ្នកអាចធ្វើតេស្តបាន ប៉ុន្តែលទ្ធផលអាចបាត់នៅពេលបិទផ្ទាំងនេះ។",
            })}
          </div>
        )}

        {/* Bottom Action Panel */}
        <div className="flex flex-col gap-4 rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10 dark:bg-[#0D1445]/60">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#68708A]">
            <LockKeyhole className="h-4 w-4 shrink-0 text-[#111965] dark:text-[#F7CE4D]" />
            <span>
              {getLocalized({
                en: "Private on this device • Export PDF & reports at the end",
                km: "ឯកជនលើឧបករណ៍នេះ • អាចទាញយករបាយការណ៍ PDF នៅចុងបញ្ចប់",
              })}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center shrink-0">
            {hasAnyResult && (
              <Link
                href="/assessments/results"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] px-5 text-xs sm:text-sm font-bold text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-white"
              >
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                {hasPersonalityResult && hasRiasecResult
                  ? getLocalized({
                      en: "Combined results",
                      km: "លទ្ធផលរួមទាំងពីរ",
                    })
                  : getLocalized({
                      en: "My result",
                      km: "លទ្ធផលរបស់ខ្ញុំ",
                    })}
              </Link>
            )}

            <button
              type="button"
              onClick={handleLaunchSelected}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#F7CE4D] px-6 text-sm sm:text-base font-black text-[#0F1754] shadow-sm transition-all hover:bg-[#F5C430] active:scale-[0.99]"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
