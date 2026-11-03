"use client";

import React, { useState } from "react";
import Image from "next/image";

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

/**
 * Futera Official Video Mascot: Tara (តារា / Little Star Buddy)
 * 1. 100% Video-driven directly converted from user's .mov files:
 *    - happy.webp: Joyful bouncy spring jump on sunny sky (Agree, 1-3)
 *    - think.webp: Calm thoughtful gaze (Neutral, 4)
 *    - sad.webp: Sympathetic drooping pout (Disagree, 5-6)
 *    - angry.webp: Determined stomping pout (Strongly Disagree, 7)
 *    - Congratulation.webp: High celebratory victory jump (Assessment finished)
 *    - click_on_it.webp: Interactive playful click animation (Interactive click reaction)
 * 2. Interactive Clicks: Alternates/randomizes between the current jump and the new click_on_it action!
 * 3. 100% Borderless & No Background: Clean 2px morphological erosion eliminates halo fringe.
 * 4. 100% Glitch-Free: All animations persistent in DOM with CSS opacity transitions.
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
  const [clickAction, setClickAction] = useState<"happy" | "click_on_it" | null>(null);

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
    // Sometime display current action ("happy"), sometime display new action ("click_on_it")
    const nextAction: "happy" | "click_on_it" = Math.random() < 0.5 ? "click_on_it" : "happy";
    setClickAction(nextAction);
    const durationMs = nextAction === "click_on_it" ? 1400 : 2400;
    setTimeout(() => setClickAction(null), durationMs);
    if (onClick) onClick();
  };

  // Dimensions calibrated to 1:1 aspect ratio of the 360x360 animation
  const widthPx = size || (variant === "peeking-right" ? 150 : 210);
  const heightPx = widthPx;

  // Default contextual speech text
  const defaultSpeech =
    resolvedId === "click_on_it"
      ? "តោះលេងជាមួយគ្នា! ✨"
      : resolvedId === "happy"
      ? "យល់ស្រប! អស្ចារ្យណាស់! 🌟"
      : resolvedId === "angry"
      ? "មិនយល់ស្របដាច់ខាត! 😤"
      : resolvedId === "sad"
      ? "មិនយល់ស្របទេ? ខ្ញុំយល់ហើយ... 🥺"
      : resolvedId === "congratulation"
      ? "អបអរសាទរ! អ្នកពិតជាអស្ចារ្យ! 🌟"
      : "តើអ្នកយល់យ៉ាងណាដែរ? 🤔";

  const renderedSpeech = speechText ?? defaultSpeech;
  const isSad = resolvedId === "sad";
  const isAngry = resolvedId === "angry";

  if (variant === "peeking-right") {
    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble pointing toward Tara */}
        {showSpeech && renderedSpeech && (
          <div className="mr-1 sm:mr-2 animate-in fade-in slide-in-from-right-3 duration-200">
            <div
              className={`relative text-[11px] sm:text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-xl border max-w-[190px] sm:max-w-[250px] text-right leading-tight transition-colors duration-200 ${
                isAngry
                  ? "bg-[#3B1115] text-[#FCA5A5] border-[#EF4444]/60"
                  : isSad
                  ? "bg-[#1E1B4B] text-[#A5B4FC] border-[#818CF8]/60"
                  : "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D]/60"
              }`}
            >
              {renderedSpeech}
              {/* Bubble Tail pointing directly to Tara's head */}
              <div
                className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 border-t border-r ${
                  isAngry
                    ? "bg-[#3B1115] border-[#EF4444]/60"
                    : isSad
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
          title={isAngry ? "Tara is angry! 😤" : isSad ? "Click to cheer up Tara! 🥺" : "Click Tara to play! 🌟"}
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
            {isAngry ? "💢" : isSad ? "✧" : "✦"}
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
            {isAngry ? "💢" : isSad ? "✧" : "✦"}
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
      {/* Speech Bubble directly above Tara */}
      {showSpeech && renderedSpeech && (
        <div className="mb-2 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`relative text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-2xl border whitespace-nowrap leading-tight text-center transition-colors duration-200 ${
              isAngry
                ? "bg-[#3B1115] text-[#FCA5A5] border-[#EF4444]/60"
                : isSad
                ? "bg-[#1E1B4B] text-[#A5B4FC] border-[#818CF8]/60"
                : "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D]/60"
            }`}
          >
            {renderedSpeech}
            {/* Bubble Tail pointing straight down to Tara's head */}
            <div
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                isAngry
                  ? "bg-[#3B1115] border-[#EF4444]/60"
                  : isSad
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
            isAngry
              ? "text-[#EF4444] opacity-80"
              : isSad
              ? "text-[#818CF8] opacity-60"
              : "text-[#F7CE4D] animate-ping opacity-75"
          }`}
        >
          {isAngry ? "💢" : isSad ? "✧" : "✦"}
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
          {isAngry ? "💢" : isSad ? "✧" : "✦"}
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
