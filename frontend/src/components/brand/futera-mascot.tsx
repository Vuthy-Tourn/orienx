"use client";

import React, { useState } from "react";
import Image from "next/image";

export type MascotEmotion = "greeting" | "thinking" | "celebrating" | "completed";

interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  emotion?: MascotEmotion;
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  isWaving?: boolean;
  size?: number;
  onClick?: () => void;
}

const EMOTION_ASSETS: Record<MascotEmotion, { src: string; defaultSpeechKm: string; defaultSpeechEn: string }> = {
  greeting: {
    src: "/images/tara-emotion-wave.webp",
    defaultSpeechKm: "សួស្តី! រីករាយដែលបានជួបអ្នក! 👋",
    defaultSpeechEn: "Hello! Great to meet you! 👋",
  },
  thinking: {
    src: "/images/tara-emotion-think.webp",
    defaultSpeechKm: "តើអ្នកយល់យ៉ាងណាដែរ? 🤔",
    defaultSpeechEn: "What do you think? 🤔",
  },
  celebrating: {
    src: "/images/tara-emotion-jump.webp",
    defaultSpeechKm: "ចម្លើយល្អណាស់! 🌟",
    defaultSpeechEn: "Great answer! 🌟",
  },
  completed: {
    src: "/images/tara-emotion-cheer.webp",
    defaultSpeechKm: "អបអរសាទរ! អ្នកពិតជាអស្ចារ្យ! 🎉",
    defaultSpeechEn: "Congratulations! You did it! 🎉",
  },
};

/**
 * Futera Official Mascot: Tara (តារា / Little Star Buddy)
 * Separated by condition & emotion:
 * 1. "greeting": Waving right hand to say hi (idle/welcome)
 * 2. "thinking": Thoughtful listening sway (reading question)
 * 3. "celebrating": Joyful spring jump & cheer (answer selected)
 * 4. "completed": Victory celebration jump (assessment finished)
 *
 * 100% Borderless, transparent, pixel-aligned across all 4 emotions.
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  emotion,
  speechText,
  showSpeech = true,
  isCelebrating = false,
  isWaving = false,
  size,
  onClick,
}: FuteraMascotProps) {
  const [clickedEmotion, setClickedEmotion] = useState<MascotEmotion | null>(null);

  // Determine current active emotion based on condition
  let activeEmotion: MascotEmotion = "thinking";
  if (clickedEmotion) {
    activeEmotion = clickedEmotion;
  } else if (emotion) {
    activeEmotion = emotion;
  } else if (isCelebrating) {
    activeEmotion = "celebrating";
  } else if (isWaving) {
    activeEmotion = "greeting";
  }

  const asset = EMOTION_ASSETS[activeEmotion] || EMOTION_ASSETS.thinking;
  const currentSpeech = speechText ?? asset.defaultSpeechKm;

  // On direct click, trigger celebratory jump & cheer
  const handleMascotClick = () => {
    setClickedEmotion("celebrating");
    setTimeout(() => {
      setClickedEmotion(null);
    }, 2400);
    if (onClick) onClick();
  };

  // Dimensions calibrated to 470x550 aspect ratio (~0.854)
  const widthPx = size || (variant === "peeking-right" ? 145 : 210);
  const heightPx = Math.round(widthPx * (550 / 470));

  if (variant === "peeking-right") {
    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble pointing toward Tara's head */}
        {showSpeech && currentSpeech && (
          <div className="mr-1 sm:mr-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="relative bg-[#111965] text-[#F7CE4D] text-[11px] sm:text-xs font-black px-3.5 py-2 rounded-2xl shadow-xl border border-[#F7CE4D]/50 max-w-[190px] sm:max-w-[250px] text-right leading-tight">
              {currentSpeech}
              {/* Bubble Tail pointing directly to Tara */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#111965] rotate-45 border-t border-r border-[#F7CE4D]/50" />
            </div>
          </div>
        )}

        {/* Borderless Mascot Container */}
        <div
          onClick={handleMascotClick}
          className="relative flex-shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-106 active:scale-95"
          style={{ width: widthPx, height: heightPx }}
          title="Click Tara to play! 🌟"
        >
          {/* Floating 4-Point Golden Sparkle Stars (✦) */}
          <span className="absolute -top-1 -right-1 text-sm text-[#F7CE4D] animate-ping opacity-75 pointer-events-none">✦</span>
          <span className="absolute bottom-6 -left-2 text-xs text-[#F7CE4D] animate-pulse pointer-events-none">✦</span>

          {/* Transparent Emotion Mascot Animation */}
          <Image
            key={asset.src}
            src={asset.src}
            alt={`Tara Mascot (${activeEmotion})`}
            width={widthPx}
            height={heightPx}
            unoptimized
            priority
            className="w-full h-full object-contain filter drop-shadow-[0_10px_22px_rgba(247,206,77,0.4)] pointer-events-none select-none transition-opacity duration-200"
          />
        </div>
      </div>
    );
  }

  // Full-jumping mascot (Results view / Hero)
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Dynamic Speech Bubble directly above Tara with down-pointing tail */}
      {showSpeech && currentSpeech && (
        <div className="mb-2 z-20 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-2xl border border-[#F7CE4D]/60 whitespace-nowrap">
            {currentSpeech}
            {/* Bubble Tail pointing straight down to Tara's head */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/60" />
          </div>
        </div>
      )}

      {/* Borderless Mascot on Soft Ground Contact Shadow */}
      <div
        onClick={handleMascotClick}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-106 active:scale-95"
        style={{ width: widthPx, height: heightPx }}
        title="Click Tara to play! 🌟"
      >
        {/* Soft Golden Ground Light Aura */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-[#F7CE4D]/25 blur-md rounded-full pointer-events-none" />

        {/* Floating Sparkles */}
        <span className="absolute -top-1 right-2 text-base text-[#F7CE4D] animate-ping opacity-75 pointer-events-none">✦</span>
        <span className="absolute bottom-8 -left-2 text-sm text-[#F7CE4D] animate-pulse pointer-events-none">✦</span>

        {/* Transparent Emotion Animation */}
        <Image
          key={asset.src}
          src={asset.src}
          alt={`Tara Mascot (${activeEmotion})`}
          width={widthPx}
          height={heightPx}
          unoptimized
          priority
          className="w-full h-full object-contain filter drop-shadow-[0_14px_30px_rgba(247,206,77,0.45)] pointer-events-none select-none"
        />
      </div>
    </div>
  );
}
