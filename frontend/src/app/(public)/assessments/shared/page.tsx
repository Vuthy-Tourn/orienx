"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  LockKeyhole,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  decodeAssessmentShare,
  type SharedAssessmentPayload,
} from "@/lib/assessment-report";
import { useLanguage } from "@/contexts/language-context";

export default function SharedAssessmentPage() {
  const { getLocalized } = useLanguage();
  const [payload, setPayload] = useState<SharedAssessmentPayload | null | undefined>(
    undefined
  );

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    setPayload(decodeAssessmentShare(params.get("r") ?? ""));
  }, []);

  if (payload === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E8F0] border-t-[#111965]" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black text-[#111965]">
          {getLocalized({
            en: "This share link is not valid",
            km: "តំណចែករំលែកនេះមិនត្រឹមត្រូវទេ",
          })}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#68708A]">
          {getLocalized({
            en: "The link may be incomplete or from an older version. Ask the sender to create a new link.",
            km: "តំណអាចខ្វះព័ត៌មាន ឬមកពីកំណែចាស់។ សូមឱ្យអ្នកផ្ញើបង្កើតតំណថ្មី។",
          })}
        </p>
        <Link
          href="/assessments"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#111965] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1A2580]"
        >
          {getLocalized({ en: "Take a free test", km: "ធ្វើតេស្តឥតគិតថ្លៃ" })}
          <ArrowRight className="h-4 w-4 text-[#F7CE4D]" />
        </Link>
      </div>
    );
  }

  const isPersonality = payload.kind === "personality";
  const generatedLabel = new Date(payload.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E8F0] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#111965]">
            <LockKeyhole className="h-3 w-3 text-[#D4A017]" />
            {getLocalized({ en: "Read-only shared result", km: "លទ្ធផលចែករំលែកបែបអានតែ" })}
          </div>
          <Link
            href="/assessments"
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#111965] hover:underline"
          >
            {getLocalized({ en: "Take your own test", km: "ធ្វើតេស្តផ្ទាល់ខ្លួន" })}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-[#111965]/40 bg-gradient-to-br from-[#111965] via-[#1A2580] to-[#0D134E] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F7CE4D]/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#F7CE4D]">
              <Sparkles className="h-3.5 w-3.5" />
              {payload.headlineLabel}
            </div>
            <div className="mt-3 text-5xl font-black tracking-tight text-[#F7CE4D] sm:text-6xl">
              {payload.headline}
            </div>
            <h1 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
              {payload.archetype}
            </h1>
            {payload.role && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                {payload.role}
              </p>
            )}
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/80 sm:text-sm">
              {payload.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-white/60">
              <span>
                {getLocalized({ en: "Prepared for", km: "រៀបចំសម្រាប់" })}{" "}
                <strong className="text-white">{payload.studentName || "—"}</strong>
              </span>
              <span>
                {getLocalized({ en: "Generated", km: "បង្កើតនៅ" })}{" "}
                <strong className="text-white">{generatedLabel}</strong>
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <h2 className="text-sm font-black text-[#111965]">
            {getLocalized({
              en: isPersonality
                ? "Preference dimensions"
                : "Interest dimensions",
              km: isPersonality ? "វិមាត្រចំណូលចិត្ត" : "វិមាត្រចំណាប់អារម្មណ៍",
            })}
          </h2>
          <div className="mt-4 space-y-3">
            {payload.dimensions.map((dimension) => (
              <div key={dimension.label}>
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#111965]">{dimension.label}</span>
                  <span className="text-[#68708A]">
                    {Math.round(dimension.value)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F7]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#111965] via-[#26338F] to-[#F7CE4D]"
                    style={{ width: `${Math.min(100, dimension.value)}%` }}
                  />
                </div>
                {dimension.detail && (
                  <div className="mt-1 text-[9.5px] font-semibold text-[#94A3B8]">
                    {dimension.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {payload.highlights.map((highlight) => (
            <section
              key={highlight.title}
              className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs"
            >
              <h3 className="text-[11px] font-black uppercase tracking-[0.08em] text-[#111965]">
                {highlight.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {highlight.items.slice(0, 4).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#475569]"
                  >
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-[#D4A017]" />
            <h2 className="text-sm font-black text-[#111965]">
              {getLocalized({
                en: "Recommended majors",
                km: "ជំនាញដែលបានណែនាំ",
              })}
            </h2>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {payload.recommendations.map((recommendation) => (
              <div
                key={recommendation.major}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <div className="line-clamp-1 text-xs font-black text-[#111965]">
                    {recommendation.major}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#68708A]">
                    {recommendation.universities}{" "}
                    {getLocalized({
                      en: "universities",
                      km: "សាកលវិទ្យាល័យ",
                    })}
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-[#111965] shadow-2xs">
                  {Math.round(recommendation.fit)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10.5px] leading-relaxed text-amber-900">
          {getLocalized({
            en: "This result was shared through the link itself. Anyone with this link can read it. It is not saved on this device.",
            km: "លទ្ធផលនេះត្រូវបានចែករំលែកតាមរយៈតំណខ្លួនវា។ អ្នកណាមានតំណនេះអាចអានបាន។ វាមិនត្រូវបានរក្សាទុកលើឧបករណ៍នេះទេ។",
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link
            href="/assessments/personality/test"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111965] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1A2580]"
          >
            <Sparkles className="h-4 w-4 text-[#F7CE4D]" />
            {getLocalized({ en: "Personality test", km: "តេស្តបុគ្គលិកលក្ខណៈ" })}
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
    </div>
  );
}
