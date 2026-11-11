"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function MascotInteractiveHero() {
  const { t, language, getLocalized } = useLanguage();
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
          <span className="text-[#F7CE4D] font-bold">Tara</span>
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
    <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white border-b border-white/10 overflow-hidden py-14 lg:py-20 select-none">
      {/* Subtle Radial Ambient Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,206,77,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1B6EF3]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[450px] h-[450px] rounded-full bg-[#F7CE4D]/8 blur-[120px] pointer-events-none" />

      {/* Embedded Cambodia University Campuses Skyline Watermark */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden opacity-18 h-72 sm:h-80 lg:h-96 z-0">
        <Image
          src="/images/cambodia-campuses-skyline-seamless.webp"
          alt="Cambodian University Campuses Backdrop"
          fill
          unoptimized
          priority
          className="object-cover object-bottom"
        />
        {/* Soft Upward Gradient Overlay so buildings seamlessly emerge from the dark navy */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F36] via-[#080D2B]/75 to-[#080D2B]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ===================================================================
              LEFT COLUMN: CLEAN, CONFIDENT EDITORIAL HEADLINE & ACTIONS
              =================================================================== */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Category Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#F7CE4D] text-xs font-bold tracking-wide backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] fill-current" />
              <span>
                {language === "km"
                  ? "រចនាឡើងសម្រាប់សិស្សវិទ្យាល័យ និងនិស្សិតកម្ពុជា"
                  : "DESIGNED FOR CAMBODIAN STUDENTS"}
              </span>
            </div>

            {/* Main Editorial Headline with Futera Gold accent */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.18]">
              {language === "km" ? (
                <>
                  អនាគតរបស់អ្នកចាប់ផ្តើមពីការ{" "}
                  <span className="text-[#F7CE4D] drop-shadow-[0_2px_14px_rgba(247,206,77,0.35)]">
                    ស្វែងយល់ពីខ្លួនឯង
                  </span>
                </>
              ) : (
                <>
                  Your Future Starts With{" "}
                  <span className="text-[#F7CE4D] drop-shadow-[0_2px_14px_rgba(247,206,77,0.35)]">
                    Understanding Yourself
                  </span>
                  .
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/dashboard/assessments/personality"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm sm:text-base text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-[0_4px_24px_rgba(247,206,77,0.3)] hover:shadow-[0_6px_28px_rgba(247,206,77,0.45)] transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#111965]" />
                <span>{t("mascotHero.startFree")}</span>
                <ArrowRight className="w-4 h-4 text-[#111965]" />
              </Link>

              <Link
                href="/universities"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <Compass className="w-4 h-4 text-[#F7CE4D]" />
                <span>{t("mascotHero.exploreUniversities")}</span>
              </Link>
            </div>

            {/* Quiet, Minimal Trust Indicators */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-5 sm:gap-6 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.verifiedInfo")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.hollandEngine")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.freeForStudents")}</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: TARA MASCOT WITH FROSTED GLASS CONVERSATIONAL BUBBLE
              =================================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[440px] sm:min-h-[480px]">
            <div className="relative w-full max-w-md sm:max-w-lg flex flex-col items-center justify-center">
              {/* Natural Conversational Speech Bubble (Floating to the upper-left of Tara) */}
              <div
                className="w-full lg:absolute lg:-top-6 lg:-left-6 xl:-left-12 z-20 max-w-sm sm:max-w-[350px] mb-4 lg:mb-0 cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={advanceDialogue}
                title={t("mascotHero.nextTip")}
              >
                <div className="relative rounded-2xl bg-[#0B1038]/90 backdrop-blur-xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-4 transition-all hover:border-[#F7CE4D]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  {/* Subtle Bubble Header with Dialogue Indicator Dots */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white tracking-wide">
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
                              ? "w-4 bg-[#F7CE4D]"
                              : "w-1.5 bg-white/25 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Speech Message (Auto-types and rotates with read delay) */}
                  <div className="min-h-[52px] flex items-center">
                    <p className="text-xs sm:text-[13px] font-medium text-slate-100 leading-relaxed">
                      {renderFormattedSpeech(displayedSpeech)}
                      {isTyping && (
                        <span className="inline-block w-1.5 h-3 ml-1 bg-[#F7CE4D] animate-pulse rounded-full align-middle" />
                      )}
                    </p>
                  </div>

                  {/* Downward-Right Tail pointing toward Tara's shoulder/face */}
                  <div className="hidden lg:block absolute -bottom-2.5 right-8 pointer-events-none">
                    <svg className="w-4 h-2.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" viewBox="0 0 16 10" fill="none">
                      <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0 Z" fill="#0B1038" />
                      <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
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
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 sm:w-72 md:w-80 h-5 rounded-[100%] bg-black/45 blur-md pointer-events-none transition-all group-hover:scale-95" />

                {/* Big High-Definition Crisp Tara Mascot */}
                <Image
                  src="/images/welcome-hd.webp"
                  alt="Tara Futera Mascot"
                  width={720}
                  height={760}
                  priority
                  className={`relative z-10 w-72 sm:w-80 md:w-88 lg:w-[350px] xl:w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out group-hover:scale-105 active:scale-95 ${
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
