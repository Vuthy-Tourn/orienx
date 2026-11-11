"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import TechText from "@/components/react-bits/tech-text";
import { BorderBeam } from "@/components/magicui/border-beam";

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
      en: "Choose your university major based on your authentic analytical strengths and market demand, not peer pressure!",
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
    }, 18);

    return () => clearInterval(typeInterval);
  }, [targetText]);

  // Once typing completes, leave a moment for the user to read (4.5s), then automatically rotate
  useEffect(() => {
    if (isTyping || isPaused) return;

    const readTimer = setTimeout(() => {
      setTaraBounce(true);
      setTimeout(() => setTaraBounce(false), 450);
      setCurrentIdx((prev) => (prev + 1) % greetings.length);
    }, 4500);

    return () => clearTimeout(readTimer);
  }, [isTyping, isPaused, currentIdx]);

  const advanceDialogue = () => {
    setTaraBounce(true);
    setTimeout(() => setTaraBounce(false), 450);
    setCurrentIdx((prev) => (prev + 1) % greetings.length);
  };

  return (
    <section className="relative w-full min-h-[88vh] lg:min-h-[92vh] flex items-center bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white border-b border-white/10 overflow-hidden py-14 lg:py-20 select-none">
      {/* Subtle Radial Ambient Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,206,77,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1B6EF3]/12 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[450px] h-[450px] rounded-full bg-[#F7CE4D]/10 blur-[120px] pointer-events-none" />

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
        {/* Soft Upward Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F36] via-[#080D2B]/75 to-[#080D2B]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ===================================================================
              LEFT COLUMN: PIC 2 TECHTEXT + EDITORIAL HEADLINE + ACTIONS
              =================================================================== */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Verified Badge Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{t("universitiesSection.verifiedNotice")}</span>
            </div>

            {/* PIC 2: Interactive TechText Wordmark (Restored & Preserved per user request) */}
            <div className="w-full max-w-[320px] sm:max-w-[360px] h-20 sm:h-24 -ml-1">
              <TechText
                text="OrienX"
                fontSize={110}
                fontWeight={800}
                color="#FFFFFF"
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

            {/* Main Editorial Headline with Futera Gold accent */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.18]">
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
              RIGHT COLUMN: HIGH-END FROSTED GLASS TARA CARD (MATCHING ABOUT HERO)
              =================================================================== */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={advanceDialogue}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm w-full space-y-4 text-center overflow-hidden cursor-pointer group transition-all hover:border-[#F7CE4D]/40"
              title="Click Tara for guidance"
            >
              {/* BorderBeam Ambient Lighting */}
              <BorderBeam
                size={180}
                duration={12}
                delay={0}
                borderWidth={1.5}
                colorFrom="#F7CE4D"
                colorTo="#38BDF8"
              />

              {/* Tara Mascot */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/welcome-hd.webp"
                  alt="Tara Futera Mascot"
                  fill
                  priority
                  className={`object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] transition-transform ${
                    taraBounce ? "scale-110 -translate-y-2" : ""
                  }`}
                />
              </div>

              {/* Interactive Tip Header Pill */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7CE4D]/15 text-[#F7CE4D] text-xs font-bold border border-[#F7CE4D]/30 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] fill-current" />
                  <span>Tara Guidance Tip (Click to Rotate)</span>
                </div>

                {/* Rotating Dialogue Quote Box */}
                <div className="p-4 rounded-2xl bg-[#080D2B]/85 border border-white/10 text-xs sm:text-[13px] text-slate-100 leading-relaxed min-h-[64px] flex items-center justify-center text-center">
                  <p>
                    &ldquo;{displayedSpeech}&rdquo;
                    {isTyping && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-[#F7CE4D] animate-pulse rounded-full align-middle" />
                    )}
                  </p>
                </div>

                {/* Dialogue Progress Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {greetings.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentIdx % greetings.length
                          ? "w-4 bg-[#F7CE4D]"
                          : "w-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
