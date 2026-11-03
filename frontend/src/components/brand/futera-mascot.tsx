"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FuteraMascot3D } from "./futera-mascot-3d";

interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  isWaving?: boolean;
  size?: number;
  mode?: "video-action" | "3d-webgl";
}

/**
 * Futera Official Platform Mascot: "Tara" (តារា / Little Star Buddy)
 * Supports both:
 * 1. "video-action" (Default): Fluid transparent animation extracted directly from user's video clip:
 *    - Idle: Fluid right-hand waving to say hi! (/images/tara-wave-action.webp)
 *    - Answer/Celebrate: High spring jump & cheer! (/images/tara-jump-action.webp)
 *    - Zero loading lag, perfectly transparent, mobile friendly.
 * 2. "3d-webgl": Real-time Three.js WebGL canvas with 3D model & cursor tracking.
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  speechText,
  showSpeech = true,
  isCelebrating = false,
  isWaving = false,
  size,
  mode = "video-action",
}: FuteraMascotProps) {
  const [clickedJump, setClickedJump] = useState(false);

  const handleMascotClick = () => {
    setClickedJump(true);
    setTimeout(() => setClickedJump(false), 2400);
  };

  const isJumping = isCelebrating || clickedJump;

  // Render Video Action Mode (Transparent Fluid Mascot from Video Clip)
  if (mode === "video-action") {
    const widthPx = size || (variant === "peeking-right" ? 145 : 220);
    const heightPx = Math.round(widthPx * 1.29); // 470x610 ratio ~ 1.298

    if (variant === "peeking-right") {
      return (
        <div className={`relative flex items-center select-none ${className}`}>
          {/* Dynamic Speech Bubble pointing left towards the statement */}
          {showSpeech && speechText && (
            <div className="mr-1 sm:mr-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative bg-[#111965] text-[#F7CE4D] text-[11px] sm:text-xs font-black px-3.5 py-2 rounded-2xl shadow-lg border border-[#F7CE4D]/50 max-w-[180px] sm:max-w-[240px] text-right leading-tight">
                {speechText}
                {/* Bubble Tail pointing Right towards Tara */}
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#111965] rotate-45 border-t border-r border-[#F7CE4D]/50" />
              </div>
            </div>
          )}

          {/* Transparent Fluid Mascot from Video Clip (Right Edge) */}
          <div
            onClick={handleMascotClick}
            className="relative flex-shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-106 active:scale-95"
            style={{ width: widthPx, height: heightPx }}
            title="Click Tara to jump and celebrate! 🌟"
          >
            {/* Floating 4-Point Golden Sparkle Stars (✦) */}
            <span className="absolute -top-1 -right-1 text-sm text-[#F7CE4D] animate-ping opacity-75">✦</span>
            <span className="absolute bottom-6 -left-2 text-xs text-[#F7CE4D] animate-pulse">✦</span>

            <Image
              src={isJumping ? "/images/tara-jump-action.webp" : "/images/tara-wave-action.webp"}
              alt="Tara Mascot (Wave & Jump Action)"
              width={widthPx}
              height={heightPx}
              unoptimized
              priority
              className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(247,206,77,0.35)]"
            />
          </div>
        </div>
      );
    }

    // Full jumping mascot (Results view / Hero)
    return (
      <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
        {/* Dynamic Speech Bubble above */}
        {showSpeech && speechText && (
          <div className="absolute -top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-[#F7CE4D]/60 whitespace-nowrap">
              {speechText}
              {/* Bubble Tail */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/60" />
            </div>
          </div>
        )}

        <div
          onClick={handleMascotClick}
          className="relative cursor-pointer transition-transform duration-300 hover:scale-106 active:scale-95"
          style={{ width: widthPx, height: heightPx }}
        >
          <span className="absolute -top-2 right-2 text-base text-[#F7CE4D] animate-ping opacity-75">✦</span>
          <span className="absolute bottom-8 left-0 text-sm text-[#F7CE4D] animate-pulse">✦</span>

          <Image
            src={isJumping ? "/images/tara-jump-action.webp" : "/images/tara-wave-action.webp"}
            alt="Tara Mascot"
            width={widthPx}
            height={heightPx}
            unoptimized
            priority
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(247,206,77,0.4)]"
          />
        </div>
      </div>
    );
  }

  // Fallback to 3D WebGL mode
  if (variant === "peeking-right") {
    const canvasPx = size || 155;

    return (
      <div className={`relative flex items-center select-none ${className}`}>
        {showSpeech && speechText && (
          <div className="mr-1 sm:mr-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-[#111965] text-[#F7CE4D] text-[11px] sm:text-xs font-black px-3.5 py-2 rounded-2xl shadow-lg border border-[#F7CE4D]/50 max-w-[180px] sm:max-w-[240px] text-right leading-tight">
              {speechText}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#111965] rotate-45 border-t border-r border-[#F7CE4D]/50" />
            </div>
          </div>
        )}

        <div className="relative flex-shrink-0">
          <FuteraMascot3D
            size={canvasPx}
            isCelebrating={isCelebrating}
            isWaving={isWaving}
            interactive={true}
          />
        </div>
      </div>
    );
  }

  const fullSize = size || 240;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {showSpeech && speechText && (
        <div className="absolute -top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-[#F7CE4D]/60 whitespace-nowrap">
            {speechText}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/60" />
          </div>
        </div>
      )}

      <div className="relative">
        <FuteraMascot3D
          size={fullSize}
          isCelebrating={isCelebrating}
          isWaving={isWaving}
          interactive={true}
        />
      </div>
    </div>
  );
}
