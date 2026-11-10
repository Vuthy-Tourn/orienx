"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import TechText from "@/components/react-bits/tech-text";

export function MascotInteractiveHero() {
  const { t, getLocalized } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [taraBounce, setTaraBounce] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Conversational dialogues from Tara (rotating automatically)
  const greetings = [
    {
      km: "សួស្តី! ខ្ញុំគឺ Tara មកស្វែងរកជំនាញ និងសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុតសម្រាប់អ្នកទាំងអស់គ្នា!",
      en: "Hey! I'm Tara, let's find your dream major and verified university in Cambodia together!",
    },
    {
      km: "ខ្ញុំនឹងជួយវិភាគលើបុគ្គលិកលក្ខណៈ និងចំណូលចិត្ត RIASEC របស់អ្នក ដើម្បីរកជំនាញដែលត្រូវ 100%!",
      en: "I'll analyze your MBTI personality and Holland RIASEC interests to recommend majors that fit you best!",
    },
    {
      km: "ស្វែងរកតម្លៃសិក្សា និងអាហារូបករណ៍ពិតប្រាកដនៅ RUPP, ITC Techno, AUPP, Paragon និង CADT!",
      en: "Explore verified tuition fees and real scholarships directly from official admissions portals!",
    },
    {
      km: "តេស្ត ៥ នាទីប៉ុណ្ណោះ ហើយឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សានុសិស្សកម្ពុជាទាំងអស់! តោះចាប់ផ្តើម!",
      en: "Takes just 5 minutes and is 100% free for all students! Ready to uncover your unique strengths?",
    },
  ];

  const currentDialogue = greetings[currentIdx % greetings.length];
  const targetText = getLocalized(currentDialogue);

  // Smooth typewriter effect
  useEffect(() => {
    setIsTyping(true);
    setDisplayedSpeech("");

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < targetText.length) {
        setDisplayedSpeech(targetText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 20);

    return () => clearInterval(typeInterval);
  }, [targetText]);

  // Once typing completes, leave a moment for the user to read (4.2 seconds), then automatically rotate to the next message
  useEffect(() => {
    if (isTyping || isPaused) return;

    const readTimer = setTimeout(() => {
      // Gentle Tara bounce when speaking a new message
      setTaraBounce(true);
      setTimeout(() => setTaraBounce(false), 450);
      setCurrentIdx((prev) => (prev + 1) % greetings.length);
    }, 4200);

    return () => clearTimeout(readTimer);
  }, [isTyping, isPaused, currentIdx]);

  // Highlight Tara's name in speech
  const renderFormattedSpeech = (text: string) => {
    if (text.includes("Tara")) {
      const parts = text.split("Tara");
      return (
        <>
          {parts[0]}
          <span className="text-[#D97706] font-bold">Tara</span>
          {parts.slice(1).join("Tara")}
        </>
      );
    }
    return text;
  };

  const advanceDialogue = () => {
    setTaraBounce(true);
    setTimeout(() => setTaraBounce(false), 450);
    setCurrentIdx((prev) => (prev + 1) % greetings.length);
  };

  return (
    <section className="relative w-full min-h-[88vh] flex items-center bg-gradient-to-b from-slate-50/70 via-[#FAFBFD] to-white text-[#111965] border-b border-[#E6E8F0] overflow-hidden py-14 lg:py-20 select-none">
      {/* Subtle Radial Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(17,25,101,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-amber-400/[0.07] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ===================================================================
              LEFT COLUMN: CLEAN, CONFIDENT EDITORIAL HEADLINE & ACTIONS
              =================================================================== */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Verified Badge Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{t("universitiesSection.verifiedNotice")}</span>
            </div>

            {/* Interactive TechText Brand Wordmark */}
            <div className="w-full max-w-[320px] sm:max-w-[360px] h-20 sm:h-24 -ml-1">
              <TechText
                text="OrienX"
                fontSize={110}
                fontWeight={800}
                color="#111965"
                accentColor="#F69D0D"
                align="left"
                lineStyle="dashed"
                labels={true}
                draggable={true}
                clickKick={true}
                intro="assemble"
                introDuration={1.2}
                className="w-full h-full"
              />
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111965] tracking-tight leading-[1.25]">
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#68708A] max-w-xl font-normal leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/dashboard/assessments/personality"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-[#F69D0D] hover:bg-[#E58F0C] shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>{t("mascotHero.startFree")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/universities"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] shadow-2xs hover:shadow-xs transition-all"
              >
                <Compass className="w-4 h-4 text-[#68708A]" />
                <span>{t("mascotHero.exploreUniversities")}</span>
              </Link>
            </div>

            {/* Quiet, Minimal Trust Indicators */}
            <div className="pt-6 border-t border-[#E6E8F0] flex flex-wrap items-center gap-6 text-xs font-medium text-[#68708A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t("mascotHero.verifiedInfo")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t("mascotHero.hollandEngine")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t("mascotHero.freeForStudents")}</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: TARA MASCOT WITH NATURAL, FLOATING CONVERSATIONAL BUBBLE
              =================================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[440px] sm:min-h-[480px]">
            <div className="relative w-full max-w-md sm:max-w-lg flex flex-col items-center justify-center">
              {/* Natural Conversational Speech Bubble (Floating to the upper-left of Tara) */}
              <div
                className="w-full lg:absolute lg:-top-6 lg:-left-6 xl:-left-12 z-20 max-w-sm sm:max-w-[340px] mb-4 lg:mb-0 cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={advanceDialogue}
                title={t("mascotHero.nextTip")}
              >
                <div className="relative rounded-2xl bg-white border border-[#E6E8F0] shadow-[0_12px_28px_rgba(17,25,101,0.06)] p-4 transition-all hover:shadow-md hover:border-amber-200">
                  {/* Subtle Bubble Header with Dialogue Indicator Dots */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#111965]">
                        {t("mascotHero.guideBadge")}
                      </span>
                    </div>

                    {/* Interactive Carousel Progress Dots */}
                    <div className="flex items-center gap-1">
                      {greetings.map((_, i) => (
                        <span
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIdx(i);
                            setTaraBounce(true);
                            setTimeout(() => setTaraBounce(false), 450);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentIdx % greetings.length
                              ? "w-4 bg-[#F69D0D]"
                              : "w-1.5 bg-slate-200 hover:bg-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Speech Message (Auto-types and rotates with read delay) */}
                  <div className="min-h-[50px] flex items-center">
                    <p className="text-xs sm:text-[13px] font-semibold text-[#111965] leading-relaxed">
                      {renderFormattedSpeech(displayedSpeech)}
                      {isTyping && (
                        <span className="inline-block w-1.5 h-3 ml-1 bg-[#F69D0D] animate-pulse rounded-full align-middle" />
                      )}
                    </p>
                  </div>

                  {/* Downward-Right Tail pointing toward Tara's shoulder/face */}
                  <div className="hidden lg:block absolute -bottom-2.5 right-8 pointer-events-none">
                    <svg className="w-4 h-2.5 filter drop-shadow-[0_1px_2px_rgba(17,25,101,0.04)]" viewBox="0 0 16 10" fill="none">
                      <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0 Z" fill="#FFFFFF" />
                      <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0" stroke="#E6E8F0" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Large Crisp Tara Mascot */}
              <div
                onClick={advanceDialogue}
                className="relative flex flex-col items-center group cursor-pointer select-none lg:ml-20 xl:ml-28"
                title="Tap Tara to wave!"
              >
                {/* Soft Contact Ground Shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 sm:w-72 md:w-80 h-5 rounded-[100%] bg-[#111965]/10 blur-sm pointer-events-none transition-all group-hover:scale-95" />

                {/* Big High-Definition Crisp Tara Mascot */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/welcome-hd.webp"
                  alt="Tara OrienX Mascot"
                  width={720}
                  height={760}
                  className={`relative z-10 w-72 sm:w-80 md:w-88 lg:w-[350px] xl:w-[380px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(17,25,101,0.12)] transition-all duration-300 ease-out group-hover:scale-105 active:scale-95 ${
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
