"use client";

import React, { useState } from "react";
import Image from "next/image";

export type MascotEmotion = "greeting" | "thinking" | "happy" | "sad" | "completed";

export interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  emotion?: MascotEmotion;
  scaleLevel?: number | null; // 1-3: agree (happy), 4: neutral (thinking), 5-7: disagree (sad)
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
  { id: "greeting", src: "/images/tara-video-wave.webp", alt: "Tara Waving Greeting" },
  { id: "happy", src: "/images/tara-video-happy.webp", alt: "Tara Happy Celebration Jump" },
  { id: "sad", src: "/images/tara-video-sad.webp", alt: "Tara Sad Sympathetic Pout" },
  { id: "thinking", src: "/images/tara-video-think.webp", alt: "Tara Thinking Listening Sway" },
  { id: "completed", src: "/images/tara-video-happy.webp", alt: "Tara Victory Celebration" },
];

/**
 * Futera Official Video Mascot: Tara (តារា / Little Star Buddy)
 * 1. 100% Video-driven: Uses exact fluid animations directly from user's video clip!
 * 2. 100% Borderless & Fringe-Free: Anti-aliased 2px erosion removes all black/grey video halo.
 * 3. Reactive to user choices:
 *    - Agree (1-3, Green): Happy celebration jump!
 *    - Disagree (5-7, Purple): Sad drooping pouting face with teardrop!
 *    - Neutral (4, Grey): Thoughtful listening sway!
 * 4. 100% Glitch-Free: All 4 video animations are preloaded and persistent in the DOM.
 *    Transitions use hardware-accelerated opacity fades with 0ms delay and zero blank flashes!
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
  const [clickedHappy, setClickedHappy] = useState(false);

  // Determine active emotion
  let activeEmotion: MascotEmotion = "thinking";
  if (clickedHappy) {
    activeEmotion = "happy";
  } else if (isCelebrating) {
    activeEmotion = "happy";
  } else if (scaleLevel !== undefined && scaleLevel !== null) {
    if (scaleLevel <= 3) {
      activeEmotion = "happy"; // Agree -> Happy jump!
    } else if (scaleLevel >= 5) {
      activeEmotion = "sad"; // Disagree -> Sad pout!
    } else {
      activeEmotion = "thinking"; // Neutral
    }
  } else if (emotion) {
    activeEmotion = emotion;
  }

  const handleMascotClick = () => {
    setClickedHappy(true);
    setTimeout(() => setClickedHappy(false), 2400);
    if (onClick) onClick();
  };

  // Dimensions calibrated to 470x550 aspect ratio (~0.854)
  const widthPx = size || (variant === "peeking-right" ? 150 : 215);
  const heightPx = Math.round(widthPx * (550 / 470));

  // Default contextual speech text
  const defaultSpeech =
    activeEmotion === "happy"
      ? "យល់ស្រប! អស្ចារ្យណាស់! 🌟"
      : activeEmotion === "sad"
      ? "មិនយល់ស្របទេ? ខ្ញុំយល់ហើយ... 🥺"
      : activeEmotion === "completed"
      ? "អបអរសាទរ! អ្នកពិតជាអស្ចារ្យ! 🌟"
      : activeEmotion === "greeting"
      ? "សួស្តី! ចាប់ផ្តើមសំណួរដំបូង! 👋"
      : "តើអ្នកយល់យ៉ាងណាដែរ? 🤔";

  const renderedSpeech = speechText ?? defaultSpeech;
  const isSad = activeEmotion === "sad";

  if (variant === "peeking-right") {
    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble pointing toward Tara */}
        {showSpeech && renderedSpeech && (
          <div className="mr-1 sm:mr-2 animate-in fade-in slide-in-from-right-3 duration-200">
            <div
              className={`relative text-[11px] sm:text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-xl border max-w-[190px] sm:max-w-[250px] text-right leading-tight transition-colors duration-200 ${
                isSad
                  ? "bg-[#1E1B4B] text-[#A5B4FC] border-[#818CF8]/60"
                  : "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D]/60"
              }`}
            >
              {renderedSpeech}
              {/* Bubble Tail pointing directly to Tara's head */}
              <div
                className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 border-t border-r ${
                  isSad
                    ? "bg-[#1E1B4B] border-[#818CF8]/60"
                    : "bg-[#111965] border-[#F7CE4D]/60"
                }`}
              />
            </div>
          </div>
        )}

        {/* 100% Borderless Video Mascot Container */}
        <div
          onClick={handleMascotClick}
          className="relative flex-shrink-0 cursor-pointer group transition-transform duration-200 hover:scale-106 active:scale-95"
          style={{ width: widthPx, height: heightPx }}
          title={isSad ? "Click to cheer up Tara! 🥺" : "Click Tara to play! 🌟"}
        >
          {/* Floating Sparkles */}
          <span
            className={`absolute -top-1 -right-1 text-sm pointer-events-none transition-colors duration-200 ${
              isSad ? "text-[#818CF8] opacity-60" : "text-[#F7CE4D] animate-ping opacity-75"
            }`}
          >
            {isSad ? "✧" : "✦"}
          </span>
          <span
            className={`absolute bottom-6 -left-2 text-xs pointer-events-none transition-colors duration-200 ${
              isSad ? "text-[#A5B4FC] opacity-50" : "text-[#F7CE4D] animate-pulse"
            }`}
          >
            {isSad ? "✧" : "✦"}
          </span>

          {/* Glitch-Free Stacked Video Animations */}
          <div className="relative w-full h-full filter drop-shadow-[0_10px_22px_rgba(247,206,77,0.38)]">
            {VIDEO_EMOTIONS.map((item) => {
              const isActive = activeEmotion === item.id;
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
      {/* Speech Bubble directly above Tara */}
      {showSpeech && renderedSpeech && (
        <div className="mb-2 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`relative text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-2xl border whitespace-nowrap leading-tight text-center transition-colors duration-200 ${
              isSad
                ? "bg-[#1E1B4B] text-[#A5B4FC] border-[#818CF8]/60"
                : "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D]/60"
            }`}
          >
            {renderedSpeech}
            {/* Bubble Tail pointing straight down to Tara's head */}
            <div
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                isSad
                  ? "bg-[#1E1B4B] border-[#818CF8]/60"
                  : "bg-[#111965] border-[#F7CE4D]/60"
              }`}
            />
          </div>
        </div>
      )}

      {/* 100% Borderless Mascot on Soft Ground Contact Shadow */}
      <div
        onClick={handleMascotClick}
        className="relative cursor-pointer transition-transform duration-200 hover:scale-106 active:scale-95"
        style={{ width: widthPx, height: heightPx }}
        title="Click Tara to play! 🌟"
      >
        {/* Soft Golden Ground Light Aura */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-[#F7CE4D]/25 blur-md rounded-full pointer-events-none" />

        {/* Floating Sparkles */}
        <span
          className={`absolute -top-1 right-2 text-base pointer-events-none transition-colors duration-200 ${
            isSad ? "text-[#818CF8] opacity-60" : "text-[#F7CE4D] animate-ping opacity-75"
          }`}
        >
          {isSad ? "✧" : "✦"}
        </span>
        <span
          className={`absolute bottom-8 -left-2 text-sm pointer-events-none transition-colors duration-200 ${
            isSad ? "text-[#A5B4FC] opacity-50" : "text-[#F7CE4D] animate-pulse"
          }`}
        >
          {isSad ? "✧" : "✦"}
        </span>

        {/* Glitch-Free Stacked Video Animations */}
        <div className="relative w-full h-full filter drop-shadow-[0_14px_30px_rgba(247,206,77,0.45)]">
          {VIDEO_EMOTIONS.map((item) => {
            const isActive = activeEmotion === item.id;
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
