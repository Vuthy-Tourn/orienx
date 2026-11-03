"use client";

import React from "react";
import Image from "next/image";

interface FuteraMascotProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
}

/**
 * Futera Official Platform Mascot: "Tara" (តារា / Little Star Buddy)
 * Based on Pic 3:
 * A joyful baby star wearing a yellow star-shaped hoodie, jumping with open arms,
 * blushing pink cheeks, and cheerful star sparkles.
 */
export function FuteraMascot({
  className = "",
  size = "md",
  speechText,
  showSpeech = false,
  isCelebrating = false,
}: FuteraMascotProps) {
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  const imagePx = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160,
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Dynamic Speech Bubble */}
      {showSpeech && speechText && (
        <div className="absolute -top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg border border-[#F7CE4D]/40 whitespace-nowrap">
            {speechText}
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/40" />
          </div>
        </div>
      )}

      {/* Mascot Card Avatar */}
      <div
        className={`relative ${sizeMap[size]} rounded-3xl overflow-hidden shadow-md border-2 border-amber-200 bg-gradient-to-b from-sky-200 via-amber-100 to-amber-200 transition-all duration-300 ${
          isCelebrating ? "scale-110 -translate-y-2 ring-4 ring-[#F7CE4D] shadow-xl" : "hover:scale-105"
        }`}
      >
        <Image
          src="/images/mascot-star.jpg"
          alt="Tara - Futera Star Mascot"
          width={imagePx[size]}
          height={imagePx[size]}
          className="w-full h-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
