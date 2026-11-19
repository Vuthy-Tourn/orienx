"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  UserRound,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  clearAllGuestData,
  deleteResult,
  exportGuestBackup,
  getAllResults,
  readProfile,
  saveProfile,
} from "@/lib/guest/storage";
import { recommendMajorMatches } from "@/lib/guest/recommendations";
import type {
  GuestResultRecord,
  PersonalityResult,
  RiasecResult,
} from "@/lib/guest/types";
import { ARCHETYPE_META } from "@/lib/personality-meta";
import { getHollandArchetype } from "@/lib/riasec-meta";
import { STATIC_META } from "@/lib/data/catalog";

function downloadText(content: string, fileName: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
  const { getLocalized, language } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const isKm = language === "km";
  const locale = isKm ? "km-KH" : "en-US";

  const [rows, setRows] = useState<GuestResultRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");

  const refresh = () => {
    setRows(getAllResults());
    setLoaded(true);
  };

  useEffect(() => {
    const profile = readProfile();
    const name = profile?.displayName ?? "";
    setDisplayName(name);
    setSavedName(name);
    refresh();
  }, []);

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

  const handleDelete = async (row: GuestResultRecord) => {
    const confirmed = await confirm({
      title: getLocalized({
        en: "Delete this result?",
        km: "លុបលទ្ធផលនេះ?",
      }),
      description: getLocalized({
        en: "The result will be removed from this browser. Other saved results are not affected.",
        km: "លទ្ធផលនេះនឹងត្រូវលុបចេញពីកម្មវិធីរុករកនេះ។ លទ្ធផលផ្សេងទៀតមិនរងផលប៉ះពាល់ទេ។",
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
        en: "Clear all local data?",
        km: "លុបទិន្នន័យមូលដ្ឋានទាំងអស់?",
      }),
      description: getLocalized({
        en: "All drafts, results, and history in this browser will be deleted. Download a backup first if you want to keep them.",
        km: "សេចក្តីព្រាង លទ្ធផល និងប្រវត្តិទាំងអស់ក្នុងកម្មវិធីរុករកនេះនឹងត្រូវលុប។ សូមទាញយកច្បាប់ចម្លងបម្រុងទុកជាមុនប្រសិនបើចង់រក្សាទុក។",
      }),
      confirmLabel: getLocalized({ en: "Clear everything", km: "លុបទាំងអស់" }),
      cancelLabel: getLocalized({ en: "Cancel", km: "បោះបង់" }),
      tone: "danger",
    });
    if (!confirmed) return;
    clearAllGuestData();
    refresh();
    toast.success(
      getLocalized({
        en: "All local data cleared.",
        km: "បានលុបទិន្នន័យមូលដ្ឋានទាំងអស់។",
      })
    );
  };

  const handleBackup = () => {
    downloadText(
      exportGuestBackup(),
      `OrienX-Guest-Backup-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8;"
    );
    toast.success(
      getLocalized({
        en: "Backup downloaded.",
        km: "បានទាញយកច្បាប់ចម្លងបម្រុងទុក។",
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E8F0] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#111965]">
              <Sparkles className="h-3 w-3 text-[#D4A017]" />
              {getLocalized({
                en: "No account needed",
                km: "មិនត្រូវការគណនី",
              })}
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#111965] sm:text-3xl">
              {getLocalized({ en: "My results", km: "លទ្ធផលរបស់ខ្ញុំ" })}
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#68708A]">
              {getLocalized({
                en: "Your drafts and results are stored only in this browser. Nothing is sent to a server.",
                km: "សេចក្តីព្រាង និងលទ្ធផលរបស់អ្នករក្សាទុកក្នុងកម្មវិធីរុករកនេះប៉ុណ្ណោះ។ គ្មានអ្វីត្រូវផ្ញើទៅម៉ាស៊ីនមេទេ។",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBackup}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#D9DEEA] bg-white px-3 text-[11px] font-black text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-[#F8FAFD]"
            >
              <Download className="h-3.5 w-3.5" />
              {getLocalized({ en: "Backup JSON", km: "បម្រុងទុក JSON" })}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-[11px] font-black text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {getLocalized({ en: "Clear data", km: "លុបទិន្នន័យ" })}
            </button>
          </div>
        </div>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-4 shadow-xs sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F2FA] text-[#111965]">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs font-black text-[#111965]">
                  {getLocalized({
                    en: "Name on your reports",
                    km: "ឈ្មោះនៅលើរបាយការណ៍របស់អ្នក",
                  })}
                </div>
                <div className="text-[10px] font-semibold text-[#68708A]">
                  {getLocalized({
                    en: "Optional. Stored only in this browser.",
                    km: "ស្រេចចិត្ត។ រក្សាទុកក្នុងកម្មវិធីរុករកនេះប៉ុណ្ណោះ។",
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={getLocalized({
                  en: "Your name (optional)",
                  km: "ឈ្មោះរបស់អ្នក (ស្រេចចិត្ត)",
                })}
                maxLength={80}
                className="h-9 w-full min-w-0 rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-[11px] font-semibold text-[#111965] outline-none focus:border-[#111965]/40 sm:w-56"
              />
              <button
                type="button"
                onClick={() => {
                  saveProfile({ displayName: displayName.trim() });
                  setSavedName(displayName.trim());
                  toast.success(
                    getLocalized({
                      en: "Report name saved.",
                      km: "បានរក្សាទុកឈ្មោះរបាយការណ៍។",
                    })
                  );
                }}
                className="inline-flex h-9 shrink-0 items-center rounded-xl bg-[#111965] px-3 text-[10.5px] font-black text-white hover:bg-[#1A2580]"
              >
                {savedName.length > 0 && displayName.trim() === savedName
                  ? getLocalized({ en: "Saved", km: "បានរក្សាទុក" })
                  : getLocalized({ en: "Save", km: "រក្សាទុក" })}
              </button>
            </div>
          </div>
        </section>

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
          <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white px-6 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
              <Compass className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black text-[#111965]">
              {getLocalized({
                en: "No saved results yet",
                km: "មិនទាន់មានលទ្ធផលរក្សាទុកទេ",
              })}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#68708A]">
              {getLocalized({
                en: "Take one or both free tests. Your result will appear here immediately and stay available on this device.",
                km: "សូមធ្វើតេស្តឥតគិតថ្លៃមួយ ឬទាំងពីរ។ លទ្ធផលរបស់អ្នកនឹងបង្ហាញនៅទីនេះភ្លាមៗ និងអាចប្រើបាននៅលើឧបករណ៍នេះ។",
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
              <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-800">
                      <Trophy className="h-3 w-3" />
                      {getLocalized({
                        en: "Combined interest fit",
                        km: "ភាពត្រូវគ្នារួមបញ្ចូល",
                      })}
                    </div>
                    <h2 className="mt-2 text-sm font-black text-[#111965] sm:text-base">
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
                        <div className="line-clamp-1 text-xs font-black text-[#111965]">
                          {getLocalized(major.name)}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-[#68708A]">
                          {major.category} · {major.universities}{" "}
                          {getLocalized({
                            en: "universities",
                            km: "សាកលវិទ្យាល័យ",
                          })}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-[#111965] shadow-2xs">
                        {major.fit}%
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0F2FA] text-[#111965]">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#111965]">
                    {getLocalized({ en: "Result history", km: "ប្រវត្តិលទ្ធផល" })}
                  </h2>
                  <p className="text-[10px] font-semibold text-[#68708A]">
                    {getLocalized({
                      en: "Up to 10 attempts per test are kept on this device.",
                      km: "រក្សាទុករហូតដល់ ១០ ការប៉ុនប៉ងក្នុងមួយតេស្ត នៅលើឧបករណ៍នេះ។",
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
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F2FA] text-xs font-black text-[#111965]">
                          {headline.slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-black text-[#111965]">
                              {headline}
                            </span>
                            <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#68708A]">
                              {label}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#94A3B8]">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(row.completedAt, locale)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/assessments/${row.kind}/result?id=${row.id}`}
                          className="inline-flex h-8 items-center rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-[10px] font-black text-[#111965] hover:bg-[#F8FAFD]"
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

            <p className="text-center text-[10px] font-semibold text-[#94A3B8]">
              {getLocalized({
                en: `Data version ${STATIC_META.dataVersion} · Stored locally in this browser`,
                km: `កំណែទិន្នន័យ ${STATIC_META.dataVersion} · រក្សាទុកក្នុងកម្មវិធីរុករកនេះ`,
              })}
            </p>
          </>
        )}
      </div>
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
    <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs">
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
            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
              {isPersonality
                ? getLocalized({ en: "16-Personality", km: "បុគ្គលិកលក្ខណៈ ១៦" })
                : "RIASEC"}
            </div>
            <div className="text-[10px] font-semibold text-[#68708A]">
              {record
                ? formatDate(record.completedAt, locale)
                : getLocalized({ en: "Not taken yet", km: "មិនទាន់ធ្វើតេស្ត" })}
            </div>
          </div>
        </div>
        <span className="rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[9px] font-bold text-[#68708A]">
          {isPersonality
            ? getLocalized({ en: "12 questions", km: "១២ សំណួរ" })
            : getLocalized({ en: "18 activities", km: "១៨ សកម្មភាព" })}
        </span>
      </div>

      {record && archetype ? (
        <>
          <div className="mt-4 flex items-end gap-3">
            <div className="text-3xl font-black tracking-tight text-[#111965]">
              {headline}
            </div>
            <div className="pb-1 text-[11px] font-bold leading-snug text-[#68708A]">
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
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-[10px] font-black text-white hover:bg-[#1A2580]"
            >
              {getLocalized({ en: "View result", km: "មើលលទ្ធផល" })}
              <ArrowRight className="h-3 w-3 text-[#F7CE4D]" />
            </Link>
            <Link
              href={`/assessments/${kind}/test?retake=1`}
              className="inline-flex h-8 items-center rounded-lg border border-[#E6E8F0] bg-white px-3 text-[10px] font-bold text-[#111965] hover:bg-[#F8FAFD]"
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
                  en: "Find your Holland code and the fields that match your interests.",
                  km: "ស្វែងរកកូដ Holland និងវិស័យដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់អ្នក។",
                })}
          </p>
          <Link
            href={`/assessments/${kind}/test`}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-[10px] font-black text-white hover:bg-[#1A2580]"
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
    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#111965]"
    : "flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700";
}
