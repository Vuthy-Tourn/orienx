"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Star,
} from "lucide-react";

export function CtaBanner() {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-[#F8F9FC] border-b border-[#E6E8F0] relative overflow-hidden select-none">
      {/* Background Studio Lighting Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(#111965_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-[#F7CE4D]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111965] via-[#141C6E] to-[#0A0F3D] border border-[#F7CE4D]/30 shadow-[0_25px_60px_-15px_rgba(17,25,101,0.45)] text-white p-8 sm:p-12 lg:p-14">
          {/* Ambient Gold Radial Flare Behind Mascot */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(ellipse_at_top_right,rgba(247,206,77,0.2),transparent_70%)] pointer-events-none" />
          {/* Subtle Watermark Stars in Background */}
          <div className="absolute bottom-4 left-6 text-white/[0.03] pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
            {/* =================================================================
                LEFT COLUMN: COMPELLING EDITORIAL COPY & CALL TO ACTIONS
                ================================================================= */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-[#F7CE4D] text-xs font-black tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] fill-current" />
                <span className="uppercase tracking-widest text-[10px] sm:text-[11px]">
                  {language === "km"
                    ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សានុសិស្សកម្ពុជា"
                    : "100% FREE FOR ALL CAMBODIAN STUDENTS"}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.2] text-white">
                {t("homeCta.title")}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                {t("homeCta.subtitle")}
              </p>

              {/* Micro Trust Proof Checklist */}
              <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-200 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === "km"
                      ? "មិនបាច់ចុះឈ្មោះមុន"
                      : "No Account Required"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F7CE4D] shrink-0" />
                  <span>
                    {language === "km"
                      ? "តេស្តវិភាគចំណាយពេលតែ ៥ នាទី"
                      : "5-Minute Quick Assessment"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#F7CE4D] fill-current shrink-0" />
                  <span>
                    {language === "km"
                      ? "ទិន្នន័យតម្លៃសិក្សាផ្លូវការ"
                      : "Verified University Tuition"}
                  </span>
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl font-black text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-[0_12px_24px_rgba(247,206,77,0.3)] hover:shadow-[0_16px_32px_rgba(247,206,77,0.4)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t("homeCta.button")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/universities"
                  className="px-6 py-4 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{t("homeCta.exploreUnis")}</span>
                </Link>
              </div>
            </div>

            {/* =================================================================
                RIGHT COLUMN: TARA MASCOT WITH INTERACTIVE SPEECH & FLOATING BADGES
                ================================================================= */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-4 lg:pt-0">
              {/* Tara's Friendly Speech Bubble */}
              <div className="relative mb-3 z-20 animate-bounce-subtle">
                <div className="relative rounded-2xl bg-white text-[#111965] shadow-lg px-4 py-2.5 border border-amber-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-xs font-bold whitespace-nowrap">
                    {language === "km"
                      ? "តោះស្វែងរកអនាគតជាមួយគ្នា! 🌟"
                      : "Let's find your dream path together! 🌟"}
                  </p>
                </div>
                {/* Downward Speech Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 pointer-events-none">
                  <svg className="w-4 h-2 fill-white filter drop-shadow-xs" viewBox="0 0 16 8">
                    <path d="M0 0 C4 0 6 2 8 8 C10 2 12 0 16 0 Z" />
                  </svg>
                </div>
              </div>

              {/* Tara Mascot Stage */}
              <div className="relative flex items-center justify-center group">
                {/* Soft Contact Shadow Beneath Tara */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-5 rounded-[100%] bg-black/40 blur-md pointer-events-none transition-all group-hover:scale-95" />

                {/* Floating Metric Badge on Left of Mascot */}
                <div className="hidden sm:flex absolute -left-4 top-1/3 z-20 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-[#111965] shadow-md border border-white/20 text-xs font-extrabold backdrop-blur-xs hover:scale-105 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>96% Match</span>
                </div>

                {/* Floating Rating Badge on Right of Mascot */}
                <div className="hidden sm:flex absolute -right-4 bottom-1/4 z-20 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-[#111965] shadow-md border border-white/20 text-xs font-extrabold backdrop-blur-xs hover:scale-105 transition-transform">
                  <Star className="w-3.5 h-3.5 text-[#F7CE4D] fill-current" />
                  <span>4.9 / 5.0</span>
                </div>

                {/* High Definition Tara Mascot WebP */}
                <Image
                  src="/images/welcome-hd.webp"
                  alt="Tara OrienX Mascot"
                  width={340}
                  height={360}
                  priority
                  className="relative z-10 w-52 sm:w-60 lg:w-68 h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
