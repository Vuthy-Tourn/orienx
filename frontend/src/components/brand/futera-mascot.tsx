"use client";

import React from "react";
import { FuteraMascot3D } from "./futera-mascot-3d";

interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  size?: number; // Canvas size in px
}

/**
 * Futera Official Platform Mascot: "Tara" (តារា / Little Star Buddy)
 * Powered by real-time interactive Three.js 3D canvas rendering!
 * Features:
 * - 3D Puffy star hoodie with soft pastel golden yellow shader
 * - Real-time mouse cursor head tracking & breathing float
 * - Dynamic 3D celebration jumps & spin upon selecting answers
 * - Orbiting twinkling 3D star sparkles
 * - Interactive click-to-play in 3D
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  speechText,
  showSpeech = true,
  isCelebrating = false,
  size,
}: FuteraMascotProps) {
  if (variant === "peeking-right") {
    const canvasPx = size || 130;

    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble pointing left towards the question */}
        {showSpeech && speechText && (
          <div className="mr-1 sm:mr-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-3.5 py-2 rounded-2xl shadow-lg border border-[#F7CE4D]/50 max-w-[190px] sm:max-w-[240px] text-right leading-tight">
              {speechText}
              {/* Bubble Tail pointing Right towards Tara */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#111965] rotate-45 border-t border-r border-[#F7CE4D]/50" />
            </div>
          </div>
        )}

        {/* Real-Time Three.js 3D Mascot Canvas */}
        <div className="relative flex-shrink-0">
          <FuteraMascot3D
            size={canvasPx}
            isCelebrating={isCelebrating}
            interactive={true}
          />
        </div>
      </div>
    );
  }

  // Full body jumping mascot (e.g. in Results view or Hero)
  const fullSize = size || 180;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Dynamic Speech Bubble above */}
      {showSpeech && speechText && (
        <div className="absolute -top-10 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg border border-[#F7CE4D]/50 whitespace-nowrap">
            {speechText}
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/50" />
          </div>
        </div>
      )}

      {/* Real-Time Three.js 3D Mascot Canvas */}
      <div className="relative">
        <FuteraMascot3D
          size={fullSize}
          isCelebrating={isCelebrating}
          interactive={true}
        />
      </div>
    </div>
  );
}
