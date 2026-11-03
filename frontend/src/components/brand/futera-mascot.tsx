"use client";

import React from "react";
import { FuteraMascotDynamic, MascotEmotion } from "./futera-mascot-dynamic";

export type { MascotEmotion };

export interface FuteraMascotProps {
  className?: string;
  variant?: "peeking-right" | "full-jumping" | "head-only";
  emotion?: MascotEmotion;
  scaleLevel?: number | null;
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  isWaving?: boolean;
  size?: number;
  onClick?: () => void;
}

/**
 * Futera Official Mascot: Tara (តារា / Little Star Buddy)
 * - 100% Borderless & Seamless (zero background residue or dark halo outlines)
 * - 100% Glitch-free instant emotional transitions
 * - Dynamic reactions based on user selection:
 *   - Agree (1-3, Green): Happy laughing eyes + celebration spring jump!
 *   - Disagree (5-7, Purple): Sad drooping eyes + cute pouting mouth & teardrop!
 *   - Neutral (4, Grey): Thoughtful listening & cursor eye tracking!
 * - Speech bubble connects directly to Tara's head with matching colors
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
  const finalSize = size || (variant === "peeking-right" ? 155 : 210);

  return (
    <FuteraMascotDynamic
      className={className}
      variant={variant}
      emotion={emotion}
      scaleLevel={scaleLevel}
      speechText={speechText}
      showSpeech={showSpeech}
      isCelebrating={isCelebrating}
      size={finalSize}
      onClick={onClick}
      interactive={true}
    />
  );
}
