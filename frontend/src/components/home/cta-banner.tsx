"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Clock,
  GraduationCap,
  Target,
  Star,
  User,
} from "lucide-react";

export function CtaBanner() {
  const { t, language } = useLanguage();

  return (
    <section className="py-16 sm:py-24 bg-[#F8F9FC] border-b border-[#E6E8F0] relative overflow-hidden select-none">
      {/* Background Subtle Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(#111965_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#F7CE4D]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1445] via-[#111965] to-[#0A0F3D] border border-white/15 shadow-[0_25px_60px_-15px_rgba(17,25,101,0.5)] text-white p-8 sm:p-12 lg:p-14">
          {/* Ambient Warm Gold Radial Spotlight behind Mascot */}
          <div className="absolute -top-10 -right-10 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(247,206,77,0.18),transparent_65%)] pointer-events-none" />

          {/* Subtle Decorative Star Accent in corner */}
          <div className="absolute -bottom-10 -left-10 text-white/[0.02] pointer-events-none">
            <Sparkles className="w-64 h-64" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            {/* =================================================================
                LEFT COLUMN: PUNCHY COPY, TRUST METRICS & CALL TO ACTIONS
                ================================================================= */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Category Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7CE4D]/15 border border-[#F7CE4D]/30 backdrop-blur-xs text-[#F7CE4D] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] fill-current" />
                <span>
                  {language === "km"
                    ? "ឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សានុសិស្សកម្ពុជា"
                    : "100% Free For All Cambodian Students"}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight leading-[1.22] text-white">
                {t("homeCta.title")}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {t("homeCta.subtitle")}
              </p>

              {/* Three Clean Value Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-xs text-xs text-slate-200 font-semibold">
                  <Clock className="w-4 h-4 text-[#F7CE4D] shrink-0" />
                  <span>
                    {language === "km" ? "តេស្តត្រឹម ៥ នាទី" : "5-Min Assessment"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-xs text-xs text-slate-200 font-semibold">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === "km" ? "៤០+ សាកលវិទ្យាល័យ" : "40+ Universities"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-xs text-xs text-slate-200 font-semibold">
                  <Target className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    {language === "km" ? "ជំនាញត្រូវសមត្ថភាព" : "Personalized Fit"}
                  </span>
                </div>
              </div>

              {/* Student Trust Proof Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                <div className="flex -space-x-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-[#111965] flex items-center justify-center text-[10px] font-bold text-[#111965] shadow-xs">
                    ST
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-400 to-sky-200 border-2 border-[#111965] flex items-center justify-center text-[10px] font-bold text-[#111965] shadow-xs">
                    KH
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-200 border-2 border-[#111965] flex items-center justify-center text-[10px] font-bold text-[#111965] shadow-xs">
                    TC
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-200 border-2 border-[#111965] flex items-center justify-center text-[10px] font-bold text-[#111965] shadow-xs">
                    ED
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-extrabold text-white">10,000+</span>{" "}
                  {language === "km"
                    ? "សិស្សានុសិស្សបានស្វែងរកទិសដៅរួចរាល់"
                    : "students already guided nationwide"}
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[#F7CE4D] text-xs font-bold pl-2 sm:border-l sm:border-white/15">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-white font-extrabold">4.9</span>
                  <span className="text-slate-400 text-[11px]">/ 5.0</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl font-black text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#F3C432] shadow-[0_12px_28px_rgba(247,206,77,0.35)] hover:shadow-[0_16px_36px_rgba(247,206,77,0.45)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t("homeCta.button")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/universities"
                  className="px-6 py-4 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#F7CE4D]" />
                  <span>{t("homeCta.exploreUnis")}</span>
                </Link>
              </div>
            </div>

            {/* =================================================================
                RIGHT COLUMN: TARA MASCOT HERO PRESENTATION (CLEAN & PROMINENT)
                ================================================================= */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-4 lg:pt-0">
              {/* Tara's Friendly Speech Bubble */}
              <div className="relative mb-2 z-20 animate-bounce-subtle">
                <div className="relative rounded-2xl bg-white text-[#111965] shadow-xl px-4 py-2 border border-amber-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-xs font-black whitespace-nowrap">
                    {language === "km"
                      ? "តោះស្វែងរកអនាគតជាមួយគ្នា!"
                      : "Let's discover your future together!"}
                  </p>
                </div>
                {/* Downward Speech Tail pointing directly to Tara */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-2 pointer-events-none">
                  <svg className="w-3.5 h-2 fill-white filter drop-shadow-xs" viewBox="0 0 16 8">
                    <path d="M0 0 C4 0 6 2 8 8 C10 2 12 0 16 0 Z" />
                  </svg>
                </div>
              </div>

              {/* Tara Mascot Stage (Prominent, Grounded, No Cluttered Stickers) */}
              <div className="relative flex items-center justify-center group w-full">
                {/* Golden Radial Halo Behind Tara */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#F7CE4D]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Soft Contact Ground Shadow Beneath Tara */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-6 rounded-[100%] bg-black/45 blur-lg pointer-events-none transition-all group-hover:scale-95 group-hover:opacity-75" />

                {/* High Definition Tara Mascot WebP */}
                <Image
                  src="/images/welcome-hd.webp"
                  alt="Tara OrienX Mascot"
                  width={380}
                  height={400}
                  priority
                  className="relative z-10 w-60 sm:w-72 lg:w-80 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
