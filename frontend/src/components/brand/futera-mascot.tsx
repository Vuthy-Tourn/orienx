"use client";

import React from "react";
import { FuteraMascotDynamic } from "./futera-mascot-dynamic";

interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  isWaving?: boolean;
  size?: number;
  mode?: "dynamic" | "video-action" | "3d-webgl";
}

/**
 * Futera Official Platform Mascot: "Tara" (តារា / Little Star Buddy)
 * Powered by FuteraMascotDynamic:
 * - 100% Borderless & Seamless (zero video-player boxes or border cuts)
 * - Dynamic Live Facial Expressions: natural blinking, playful winking, cursor eye-tracking, talking mouth
 * - Live Spring Physics: squash & stretch breathing, 3D mouse head tilt, celebration jumps
 * - Floating golden sparkle stars (✦)
 * - Floating speech bubble with dedicated pointing tail
 */
export function FuteraMascot({
  className = "",
  variant = "peeking-right",
  speechText,
  showSpeech = true,
  isCelebrating = false,
  size,
}: FuteraMascotProps) {
  const finalSize = size || (variant === "peeking-right" ? 155 : 210);

  return (
    <FuteraMascotDynamic
      className={className}
      variant={variant}
      speechText={speechText}
      showSpeech={showSpeech}
      isCelebrating={isCelebrating}
      size={finalSize}
      interactive={true}
    />
  );
}
