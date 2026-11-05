"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import TechText from "@/components/react-bits/tech-text";
import LightRays from "@/components/react-bits/light-rays";

export function MascotInteractiveHero() {
  const { t, language } = useLanguage();
  const [isTyping, setIsTyping] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [taraBounce, setTaraBounce] = useState(false);

  // Concise, punchy greeting (compact, no clutter)
  const targetSpeech =
    language === "km"
      ? "សួស្តី! ខ្ញុំគឺ Tara, មកស្វែងរកផ្លូវរបស់អ្នកទាំងអស់គ្នា!"
      : "Hey! I'm Tara, Let's discover your path together!";

  // Smooth typewriter effect
  useEffect(() => {
    setIsTyping(true);
    setDisplayedSpeech("");

    let i = 0;
    const interval = setInterval(() => {
      if (i < targetSpeech.length) {
        setDisplayedSpeech(targetSpeech.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [targetSpeech]);

  // Helper to highlight Tara's name with brand amber accent
  const renderFormattedSpeech = (text: string) => {
    if (text.includes("Tara")) {
      const parts = text.split("Tara");
      return (
        <>
          {parts[0]}
          <span className="text-[#F69D0D] font-extrabold drop-shadow-[0_0_10px_rgba(246,157,13,0.45)]">
            Tara
          </span>
          {parts.slice(1).join("Tara")}
        </>
      );
    }
    return text;
  };

  const handleMascotClick = () => {
    setTaraBounce(true);
    setTimeout(() => setTaraBounce(false), 500);
  };

  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] flex items-center bg-[#060A22] text-white overflow-hidden py-12 lg:py-16 select-none">
      {/* ===================================================================
          1. SUBTLE VOLUMETRIC LIGHT RAYS (A GENTLE AMBIENT SHINE, NOT OVERPOWERING)
          =================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#F69D0D"
          raysSpeed={0.6}
          lightSpread={0.7}
          rayLength={2.0}
          rayDensity={0.85}
          raySharpness={0.38}
          intensity={0.75}
          glow={0.35}
          haze={0.14}
          atmosphere={0.85}
          followMouse={true}
          mouseInfluence={0.1}
          opacity={0.38}
          className="w-full h-full"
        />
      </div>

      {/* Soft Ambient Radial Backdrop */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none z-1" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none z-1" />

      {/* ===================================================================
          2. BALANCED HERO: HUGE TECHTEXT "OrienX" + CONTENT & LARGE TARA
          =================================================================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ===================================================================
              LEFT COLUMN: HUGE TECHTEXT "OrienX" & ESSENTIAL GUIDANCE CONTENT
              =================================================================== */}
          <div className="lg:col-span-7 space-y-6 text-left">

            {/* HUGE Interactive TechText: OrienX (X in #F69D0D) */}
            <div className="w-full">
              <div className="h-32 sm:h-40 md:h-48 lg:h-52 w-full max-w-xl">
                <TechText
                  text="OrienX"
                  fontSize={200}
                  fontWeight={800}
                  color="#FFFFFF"
                  accentColor="#F69D0D"
                  align="left"
                  lineStyle="dashed"
                  labels={true}
                  draggable={true}
                  clickKick={true}
                  intro="assemble"
                  introDuration={1.3}
                  className="w-full h-full"
                />
              </div>

              {/* Core Inspiring Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug pt-2">
                {language === "km"
                  ? "អនាគតរបស់អ្នក ចាប់ផ្តើមពីការស្គាល់ខ្លួនឯង។"
                  : "Your Future Starts With Understanding Yourself."}
              </h1>
            </div>

            {/* Clean, Human-Centered Subtitle */}
            <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed max-w-lg font-normal">
              {language === "km"
                ? "ស្វែងយល់ពីចំណាប់អារម្មណ៍ បុគ្គលិកលក្ខណៈ ជំនាញសាកលវិទ្យាល័យ និងឱកាសការងារដែលស័ក្តិសមបំផុតសម្រាប់អ្នកនៅកម្ពុជា។"
                : "Discover your unique strengths, explore verified Cambodian university majors, and find the career path tailored to you."}
            </p>

            {/* Two Clean Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/dashboard/assessments/personality"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-[#F69D0D] to-[#D97706] hover:brightness-105 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all"
              >
                <span>
                  {language === "km" ? "ចាប់ផ្តើមឥតគិតថ្លៃ" : "Start Free Assessment"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/universities"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 backdrop-blur-md transition-all"
              >
                <Compass className="w-4 h-4 text-[#F69D0D]" />
                <span>
                  {language === "km" ? "ស្វែងរកសាកលវិទ្យាល័យ" : "Explore Universities"}
                </span>
              </Link>
            </div>

            {/* Quiet, Minimal Trust Proof */}
            <div className="pt-3 text-xs font-semibold text-slate-300/80 flex items-center gap-5 sm:gap-7 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "km"
                    ? "ព័ត៌មានផ្ទៀងផ្ទាត់ផ្លូវការ"
                    : "Verified Universities"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "km"
                    ? "តេស្ត Holland & MBTI"
                    : "Holland & MBTI Engine"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {language === "km"
                    ? "ឥតគិតថ្លៃ ១០០%"
                    : "100% Free For Students"}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: LARGE TARA MASCOT WITH COMPACT FLOATING SPEECH PILL
              =================================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Ambient Radial Aura Behind Tara */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/12 blur-[90px] pointer-events-none" />

            {/* Stage Container */}
            <div className="relative flex flex-col items-center space-y-3">
              {/* LUMINOUS COSMIC GLASS SPEECH BUBBLE */}
              <div className="relative group/bubble select-none transition-all duration-300 hover:scale-[1.02]">
                {/* Ambient Backlight Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/25 via-blue-500/15 to-amber-500/25 blur-lg opacity-75 group-hover/bubble:opacity-100 transition-opacity pointer-events-none" />

                {/* Glass Card */}
                <div className="relative flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-2xl sm:rounded-[22px] bg-[#0A1033]/85 backdrop-blur-2xl border border-amber-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_24px_rgba(246,157,13,0.18),inset_0_1px_1px_rgba(255,255,255,0.2)] max-w-sm sm:max-w-md">
                  {/* Sparkling Star Accent */}

                  {/* Speech Message */}
                  <p className="text-xs sm:text-[13.5px] font-semibold text-slate-100 leading-snug tracking-tight">
                    {renderFormattedSpeech(displayedSpeech)}
                    {isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#F69D0D] animate-pulse rounded-full align-middle shadow-[0_0_6px_#F69D0D]" />
                    )}
                  </p>

                  {/* Organic Downward Tail */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none text-[#0A1033]">
                    <svg className="w-5 h-2.5 filter drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 20 10" fill="none">
                      <path d="M0 0 C6 0 8 4 10 10 C12 4 14 0 20 0 Z" fill="#0A1033" />
                      <path d="M0 0 C6 0 8 4 10 10 C12 4 14 0 20 0" stroke="rgba(246, 157, 13, 0.4)" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* CRISP LARGE MASCOT (Prominent, High-Definition, Not Small) */}
              <div
                onClick={handleMascotClick}
                className="relative flex flex-col items-center pt-2 group cursor-pointer select-none"
                title="Tap Tara to wave!"
              >
                {/* Luminous Floor Spotlight */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-72 sm:w-80 md:w-96 h-12 rounded-[100%] bg-amber-500/25 blur-lg pointer-events-none" />
                {/* Soft Contact Floor Shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-60 sm:w-72 md:w-80 h-6 rounded-[100%] bg-[#040A28] blur-sm pointer-events-none transition-all group-hover:scale-95" />

                {/* High-Definition Large Crisp Tara Mascot */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/welcome-hd.webp"
                  alt="Tara OrienX Mascot"
                  width={720}
                  height={760}
                  className={`relative z-10 w-64 sm:w-72 md:w-80 lg:w-[350px] xl:w-[380px] h-auto object-contain drop-shadow-[0_24px_45px_rgba(4,12,50,0.65)] transition-all duration-300 ease-out group-hover:scale-105 ${
                    taraBounce ? "scale-110 -translate-y-4" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
