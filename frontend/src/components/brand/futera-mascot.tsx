"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

export type MascotEmotion =
  | "happy"
  | "sad"
  | "think"
  | "thinking"
  | "angry"
  | "congratulation"
  | "waiting"
  | "click_on_it";

export interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  emotion?: MascotEmotion;
  scaleLevel?: number | null; // 1-3: happy (agree), 4: think (neutral), 5-6: sad (disagree), 7: angry (strongly disagree)
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  isWaving?: boolean;
  size?: number;
  onClick?: () => void;
}

const VIDEO_EMOTIONS: Array<{
  id: MascotEmotion;
  src: string;
  alt: string;
}> = [
  { id: "think", src: "/images/think.webp", alt: "Tara Thinking & Reflecting" },
  { id: "happy", src: "/images/happy.webp", alt: "Tara Happy Cheerful Jump" },
  { id: "sad", src: "/images/sad.webp", alt: "Tara Sad Sympathetic Pout" },
  { id: "angry", src: "/images/angry.webp", alt: "Tara Disagree Pouting Stomp" },
  { id: "congratulation", src: "/images/Congratulation.webp", alt: "Tara Victory Celebration Jump" },
  { id: "click_on_it", src: "/images/click_on_it.webp", alt: "Tara Playful Interactive Click" },
];

const PLAYFUL_CHEERS = [
  { km: "តោះលេងជាមួយគ្នា! ✨", en: "Let's do this together! ✨" },
  { km: "ឆ្លើយតាមចិត្តគិតណា! 💡", en: "Trust your intuition! 💡" },
  { km: "អ្នកធ្វើបានល្អណាស់! 🌟", en: "You're doing great! 🌟" },
  { km: "បន្តដំណើរទៅមុខទៀត! 🚀", en: "Keep moving forward! 🚀" },
  { km: "ជិតដល់គោលដៅហើយ! 🎯", en: "Almost there! 🎯" },
];

/**
 * OrienX Official Video Mascot: Tara (តារា / Little Star Buddy)
 * Clean Minimal White Speech Bubble — pure white, subtle slate border, crisp navy text, clean pointer tail.
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  emotion,
  scaleLevel,
  speechText,
  showSpeech = true,
  isCelebrating = false,
  size,
  onClick,
}: FuteraMascotProps) {
  const { language } = useLanguage();
  const [clickAction, setClickAction] = useState<"happy" | "click_on_it" | null>(null);
  const [clickSpeech, setClickSpeech] = useState<string | null>(null);

  // Determine active emotion
  let resolvedId: MascotEmotion = "think";

  if (clickAction === "click_on_it") {
    resolvedId = "click_on_it";
  } else if (clickAction === "happy") {
    resolvedId = "happy";
  } else if (isCelebrating) {
    resolvedId = "congratulation";
  } else if (emotion) {
    if ((emotion as string) === "thinking" || (emotion as string) === "waiting") resolvedId = "think";
    else resolvedId = emotion;
  } else if (scaleLevel !== undefined && scaleLevel !== null) {
    if (scaleLevel <= 3) {
      resolvedId = "happy"; // Agree (1-3) -> Happy cheerful bounce!
    } else if (scaleLevel === 7) {
      resolvedId = "angry"; // Strongly Disagree (7) -> Angry stomp!
    } else if (scaleLevel >= 5) {
      resolvedId = "sad"; // Disagree (5-6) -> Sad sympathetic pout!
    } else {
      resolvedId = "think"; // Neutral (4) -> Thoughtful listening sway!
    }
  }

  const handleMascotClick = () => {
    const nextAction: "happy" | "click_on_it" = Math.random() < 0.5 ? "click_on_it" : "happy";
    const randomCheer = PLAYFUL_CHEERS[Math.floor(Math.random() * PLAYFUL_CHEERS.length)];
    const cheerText = language === "km" ? randomCheer.km : randomCheer.en;

    setClickAction(nextAction);
    setClickSpeech(cheerText);

    const durationMs = nextAction === "click_on_it" ? 1800 : 2400;
    setTimeout(() => {
      setClickAction(null);
      setClickSpeech(null);
    }, durationMs);

    if (onClick) onClick();
  };

  // Dimensions calibrated to 1:1 aspect ratio of the 360x360 animation
  const widthPx = size || (variant === "peeking-right" ? 150 : 210);
  const heightPx = widthPx;

  // Default contextual speech text
  const defaultSpeech =
    resolvedId === "click_on_it"
      ? (language === "km" ? "តោះលេងជាមួយគ្នា! ✨" : "Let's do this together! ✨")
      : resolvedId === "happy"
      ? (language === "km" ? "យល់ស្រប! អស្ចារ្យណាស់! ✨" : "Agree! Awesome! ✨")
      : resolvedId === "angry"
      ? (language === "km" ? "មិនយល់ស្របដាច់ខាត! ⚡" : "Strongly Disagree! ⚡")
      : resolvedId === "sad"
      ? (language === "km" ? "មិនយល់ស្របទេ? ខ្ញុំយល់ហើយ... 💡" : "Disagree? I understand... 💡")
      : resolvedId === "congratulation"
      ? (language === "km" ? "អបអរសាទរ! ទទួលបានលទ្ធផលហើយ! 🏆" : "Congratulations! Results are ready! 🏆")
      : (language === "km" ? "តើអ្នកយល់យ៉ាងណាដែរ? 🤔" : "What do you think? 🤔");

  const renderedSpeech = clickSpeech || speechText || defaultSpeech;
  const isSad = resolvedId === "sad";
  const isAngry = resolvedId === "angry";

  if (variant === "peeking-right") {
    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Clean Minimal White Speech Bubble pointing toward Tara */}
        {showSpeech && renderedSpeech && (
          <div
            className="mr-1 sm:mr-2 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleMascotClick}
            title={language === "km" ? "ចុចដើម្បីលេងជាមួយ Tara!" : "Click to interact with Tara!"}
          >
            <div
              key={renderedSpeech}
              className="relative bg-white dark:bg-[#1E293B] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm dark:shadow-md max-w-[calc(100vw-9.5rem)] sm:max-w-[260px] text-right animate-in fade-in zoom-in-95 duration-200"
            >
              <p className="text-xs sm:text-[14px] font-bold text-[#111965] dark:text-[#F8FAFC] leading-snug">
                {renderedSpeech}
              </p>

              {/* Clean Seamless Tail pointing directly to Tara */}
              <div
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-white dark:bg-[#1E293B] border-t border-r border-slate-200/90 dark:border-slate-700"
              />
            </div>
          </div>
        )}

        {/* 100% Borderless Video Mascot Container */}
        <div
          onClick={handleMascotClick}
          className="relative flex-shrink-0 cursor-pointer group transition-transform duration-200 hover:scale-106 active:scale-95"
          style={{ width: widthPx, height: heightPx }}
          title={language === "km" ? "ចុចដើម្បីលេងជាមួយ Tara!" : "Click to interact with Tara!"}
        >
          {/* Floating Sparkles */}
          <span
            className={`absolute -top-1 -right-1 text-sm pointer-events-none transition-colors duration-200 ${
              isAngry
                ? "text-[#EF4444] opacity-80"
                : isSad
                ? "text-[#818CF8] opacity-60"
                : "text-[#F7CE4D] animate-ping opacity-75"
            }`}
          >
            {isSad ? "✧" : "✦"}
          </span>
          <span
            className={`absolute bottom-6 -left-2 text-xs pointer-events-none transition-colors duration-200 ${
              isAngry
                ? "text-[#FCA5A5] opacity-75"
                : isSad
                ? "text-[#A5B4FC] opacity-50"
                : "text-[#F7CE4D] animate-pulse"
            }`}
          >
            {isSad ? "✧" : "✦"}
          </span>

          {/* Glitch-Free Stacked Video Animations */}
          <div className="relative w-full h-full filter drop-shadow-[0_10px_22px_rgba(247,206,77,0.38)]">
            {VIDEO_EMOTIONS.map((item) => {
              const isActive = resolvedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={widthPx}
                    height={heightPx}
                    unoptimized
                    priority
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full-jumping mascot (Results view / Hero)
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Clean Minimal White Speech Bubble directly above Tara */}
      {showSpeech && renderedSpeech && (
        <div
          className="mb-2.5 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleMascotClick}
          title={language === "km" ? "ចុចដើម្បីលេងជាមួយ Tara!" : "Click to interact with Tara!"}
        >
          <div
            key={renderedSpeech}
            className="relative bg-white dark:bg-[#1E293B] px-4 py-2 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm dark:shadow-md whitespace-nowrap leading-tight text-center animate-in fade-in zoom-in-95 duration-200"
          >
            <p className="text-xs sm:text-sm font-bold text-[#111965] dark:text-[#F8FAFC] leading-snug">
              {renderedSpeech}
            </p>

            {/* Clean Tail pointing down */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-[#1E293B] border-r border-b border-slate-200/90 dark:border-slate-700"
            />
          </div>
        </div>
      )}

      {/* 100% Borderless Mascot on Soft Ground Contact Shadow */}
      <div
        onClick={handleMascotClick}
        className="relative cursor-pointer transition-transform duration-200 hover:scale-106 active:scale-95"
        style={{ width: widthPx, height: heightPx }}
        title={language === "km" ? "ចុចដើម្បីលេងជាមួយ Tara!" : "Click to interact with Tara!"}
      >
        {/* Soft Golden Ground Light Aura */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-[#F7CE4D]/25 blur-md rounded-full pointer-events-none" />

        {/* Floating Sparkles */}
        <span
          className={`absolute -top-1 right-2 text-base pointer-events-none transition-colors duration-200 ${
            isAngry
              ? "text-[#EF4444] opacity-80"
              : isSad
              ? "text-[#818CF8] opacity-60"
              : "text-[#F7CE4D] animate-ping opacity-75"
          }`}
        >
          {isSad ? "✧" : "✦"}
        </span>
        <span
          className={`absolute bottom-8 -left-2 text-sm pointer-events-none transition-colors duration-200 ${
            isAngry
              ? "text-[#FCA5A5] opacity-75"
              : isSad
              ? "text-[#A5B4FC] opacity-50"
              : "text-[#F7CE4D] animate-pulse"
          }`}
        >
          {isSad ? "✧" : "✦"}
        </span>

        {/* Glitch-Free Stacked Video Animations */}
        <div className="relative w-full h-full filter drop-shadow-[0_14px_30px_rgba(247,206,77,0.45)]">
          {VIDEO_EMOTIONS.map((item) => {
            const isActive = resolvedId === item.id;
            return (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={widthPx}
                  height={heightPx}
                  unoptimized
                  priority
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
