"use client";

import React from "react";
import Image from "next/image";

interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
}

/**
 * Futera Official Platform Mascot: "Tara" (តារា / Little Star Buddy)
 * Extracted with transparent background (no box, no square frame).
 * Supports:
 * - "peeking-right": Peeks over the top-right corner of the card with speech bubble pointing towards the question.
 * - "full-jumping": Full body jumping with celebration on answers.
 * - "head-only": Compact avatar.
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  speechText,
  showSpeech = true,
  isCelebrating = false,
}: FuteraMascotProps) {
  if (variant === "peeking-right") {
    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble pointing to the left toward the question */}
        {showSpeech && speechText && (
          <div className="mr-2 sm:mr-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-3.5 py-2 rounded-2xl shadow-lg border border-[#F7CE4D]/50 max-w-[200px] sm:max-w-[240px] text-right leading-tight">
              {speechText}
              {/* Bubble Tail pointing Right towards Tara */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#111965] rotate-45 border-t border-r border-[#F7CE4D]/50" />
            </div>
          </div>
        )}

        {/* Extracted Mascot Peeking Head & Arms */}
        <div
          className={`relative w-20 h-20 sm:w-26 sm:h-26 flex-shrink-0 transition-transform duration-300 filter drop-shadow-lg ${
            isCelebrating
              ? "scale-115 -translate-y-3 rotate-6 animate-bounce"
              : "hover:scale-105"
          }`}
        >
          <Image
            src="/images/mascot-star-tight.png"
            alt="Tara - Futera Star Mascot"
            width={200}
            height={240}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // Full body jumping mascot
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Dynamic Speech Bubble above */}
      {showSpeech && speechText && (
        <div className="absolute -top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg border border-[#F7CE4D]/50 whitespace-nowrap">
            {speechText}
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/50" />
          </div>
        </div>
      )}

      {/* Extracted Mascot Full Body */}
      <div
        className={`relative w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 filter drop-shadow-xl ${
          isCelebrating
            ? "scale-120 -translate-y-3 animate-bounce"
            : "hover:scale-105"
        }`}
      >
        <Image
          src="/images/mascot-star-tight.png"
          alt="Tara - Futera Star Mascot"
          width={220}
          height={260}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
