"use client";

import React from "react";

export type TraitCode = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

interface FuteraBlobCharacterProps {
  trait: TraitCode;
  className?: string;
  size?: number; // size in px
  expression?: "idle" | "happy" | "excited" | "curious" | "peaceful";
  showSpeech?: boolean;
  speechText?: string;
}

/**
 * Bespoke Futera Geometric Blob Characters
 * Inspired by playful geometric feeling shapes:
 * - Sol (E - Extraversion): Golden Sun Flower, joyful arched eyes, rosy cheeks
 * - Luna (I - Introversion): Lavender Squircle with headphones, peaceful smile
 * - Geo (S - Sensing): Coral-Orange Rounded Hexagon, big observant cartoon eyes
 * - Nova (N - Intuition): Sky-Blue Dreamy Cloud with starry sparkle eyes
 * - Prism (T - Thinking): Mint-Teal Diamond with cute glasses & clever grin
 * - Hearty (F - Feeling): Rosy-Pink 4-Petal Clover Bloom, loving curved eyes
 * - Checky (J - Judging): Emerald Dome Arch with star antenna flag, proud smile
 * - Wavey (P - Perceiving): Tangerine Jelly Triangle, quirky googly eyes & wavy smile
 */
export function FuteraBlobCharacter({
  trait,
  className = "w-28 h-28",
  size = 110,
  expression = "idle",
  showSpeech = false,
  speechText,
}: FuteraBlobCharacterProps) {
  const isExcited = expression === "excited" || expression === "happy";

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeech && speechText && (
        <div className="absolute -top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#111965] text-[#F7CE4D] text-[12px] font-black px-3 py-1.5 rounded-2xl shadow-lg border border-[#F7CE4D]/40 whitespace-nowrap">
            {speechText}
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111965] rotate-45 border-r border-b border-[#F7CE4D]/40" />
          </div>
        </div>
      )}

      {/* SVG Character Avatar */}
      <div
        className={`w-full h-full transition-all duration-300 transform ${
          isExcited ? "scale-110 -translate-y-2 drop-shadow-xl" : "hover:scale-105 drop-shadow-md"
        }`}
      >
        {renderCharacterSvg(trait, isExcited)}
      </div>
    </div>
  );
}

function renderCharacterSvg(trait: TraitCode, isExcited: boolean) {
  switch (trait) {
    case "E":
      // Sol ️: Golden Sun Flower Blob (Extraversion)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Flower Petals */}
          <g className={isExcited ? "animate-spin-slow origin-center" : ""}>
            <circle cx="60" cy="20" r="16" fill="#FBBF24" />
            <circle cx="95" cy="40" r="16" fill="#FBBF24" />
            <circle cx="95" cy="80" r="16" fill="#FBBF24" />
            <circle cx="60" cy="100" r="16" fill="#FBBF24" />
            <circle cx="25" cy="80" r="16" fill="#FBBF24" />
            <circle cx="25" cy="40" r="16" fill="#FBBF24" />
          </g>

          {/* Center Sun Face */}
          <circle cx="60" cy="60" r="36" fill="#F59E0B" />
          <circle cx="60" cy="60" r="34" fill="#FBBF24" />

          {/* Rosy Cheeks */}
          <circle cx="42" cy="67" r="5" fill="#FB923C" opacity="0.8" />
          <circle cx="78" cy="67" r="5" fill="#FB923C" opacity="0.8" />

          {/* Eyes */}
          {isExcited ? (
            // Joyful arched closed eyes
            <>
              <path d="M44 56C47 50 53 50 56 56" stroke="#111965" strokeWidth="4" strokeLinecap="round" />
              <path d="M64 56C67 50 73 50 76 56" stroke="#111965" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            // Cheerful smiling eyes
            <>
              <ellipse cx="50" cy="56" rx="4" ry="5.5" fill="#111965" />
              <circle cx="52" cy="54" r="1.5" fill="#FFFFFF" />
              <ellipse cx="70" cy="56" rx="4" ry="5.5" fill="#111965" />
              <circle cx="72" cy="54" r="1.5" fill="#FFFFFF" />
            </>
          )}

          {/* Open Joyful Smile */}
          <path
            d={isExcited ? "M48 68C48 68 53 79 60 79C67 79 72 68 72 68" : "M50 68C53 73 67 73 70 68"}
            stroke="#111965"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={isExcited ? "#E11D48" : "none"}
          />
        </svg>
      );

    case "I":
      // Luna : Lavender Squircle with Headphones (Introversion)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Headphone Headband */}
          <path
            d="M26 62C26 36 41 22 60 22C79 22 94 36 94 62"
            stroke="#111965"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Squircle Body (Soft Violet/Purple) */}
          <rect x="26" y="32" width="68" height="68" rx="26" fill="#8B5CF6" />
          <rect x="28" y="34" width="64" height="64" rx="24" fill="#A78BFA" />

          {/* Ear Cushions */}
          <rect x="20" y="52" width="12" height="24" rx="6" fill="#FBBF24" stroke="#111965" strokeWidth="3" />
          <rect x="88" y="52" width="12" height="24" rx="6" fill="#FBBF24" stroke="#111965" strokeWidth="3" />

          {/* Rosy Lavender Cheeks */}
          <circle cx="43" cy="72" r="5" fill="#C4B5FD" />
          <circle cx="77" cy="72" r="5" fill="#C4B5FD" />

          {/* Peaceful Closed Curved Eyes (Meditation) */}
          <path d="M43 62C46 58 52 58 55 62" stroke="#111965" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M65 62C68 58 74 58 77 62" stroke="#111965" strokeWidth="3.5" strokeLinecap="round" />

          {/* Sweet Content Smile */}
          <path d="M54 72C56 76 64 76 66 72" stroke="#111965" strokeWidth="3" strokeLinecap="round" />

          {/* Musical Notes if Excited */}
          {isExcited && (
            <g className="animate-bounce">
              <circle cx="102" cy="32" r="3" fill="#FBBF24" />
              <line x1="105" y1="32" x2="105" y2="20" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );

    case "S":
      // Geo : Coral-Orange Rounded Hexagon (Sensing)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Rounded Hexagon Body */}
          <polygon
            points="60,18 96,38 96,82 60,102 24,82 24,38"
            fill="#F97316"
            stroke="#EA580C"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Observant Cartoon Eyes (Big white circles with pupils) */}
          <circle cx="48" cy="55" r="9" fill="#FFFFFF" stroke="#111965" strokeWidth="2.5" />
          <circle cx={isExcited ? "50" : "48"} cy="55" r="4.5" fill="#111965" />
          <circle cx="51" cy="53" r="1.5" fill="#FFFFFF" />

          <circle cx="72" cy="55" r="9" fill="#FFFFFF" stroke="#111965" strokeWidth="2.5" />
          <circle cx={isExcited ? "74" : "72"} cy="55" r="4.5" fill="#111965" />
          <circle cx="75" cy="53" r="1.5" fill="#FFFFFF" />

          {/* Cheeks */}
          <circle cx="37" cy="67" r="4.5" fill="#FDBA74" />
          <circle cx="83" cy="67" r="4.5" fill="#FDBA74" />

          {/* Friendly Practical Smile */}
          <path
            d={isExcited ? "M49 72C52 79 68 79 71 72" : "M51 72C54 76 66 76 69 72"}
            stroke="#111965"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={isExcited ? "#FFFFFF" : "none"}
          />
        </svg>
      );

    case "N":
      // Nova ️: Sky-Blue Dreamy Cloud with Sparkle Eyes (Intuition)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Cloud Silhouette */}
          <path
            d="M38 82C28 82 22 75 22 66C22 58 28 51 36 50C37 38 48 28 60 28C72 28 81 35 84 44C87 42 91 42 94 42C104 42 112 50 112 60C112 62 111 65 110 67C114 70 116 75 116 80C116 89 108 96 98 96H38C28 96 22 89 22 82"
            fill="#38BDF8"
          />
          <path
            d="M40 80C32 80 26 74 26 66C26 59 31 53 38 52C39 42 49 32 60 32C71 32 79 38 82 46C85 44 88 44 92 44C100 44 107 51 107 60C107 62 106 64 105 66C109 69 111 73 111 78C111 86 104 92 95 92H40C32 92 26 86 26 80"
            fill="#7DD3FC"
          />

          {/* Starry Sparkle Eyes */}
          <path d="M48 57L50 62L55 64L50 66L48 71L46 66L41 64L46 62Z" fill="#FBBF24" />
          <path d="M72 57L74 62L79 64L74 66L72 71L70 66L65 64L70 62Z" fill="#FBBF24" />

          {/* Dreamy Soft Smile */}
          <path d="M54 75C57 79 63 79 66 75" stroke="#111965" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "T":
      // Prism / Logic : Mint Diamond Squircle with Glasses (Thinking)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Diamond Body */}
          <polygon
            points="60,16 102,60 60,104 18,60"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Smart Round Glasses */}
          <circle cx="45" cy="58" r="10" fill="#FFFFFF" stroke="#111965" strokeWidth="2.5" />
          <circle cx="75" cy="58" r="10" fill="#FFFFFF" stroke="#111965" strokeWidth="2.5" />
          <line x1="55" y1="58" x2="65" y2="58" stroke="#111965" strokeWidth="2.5" />

          {/* Smart Pupils */}
          <circle cx="46" cy="58" r="4" fill="#111965" />
          <circle cx="48" cy="56" r="1.5" fill="#FFFFFF" />
          <circle cx="76" cy="58" r="4" fill="#111965" />
          <circle cx="78" cy="56" r="1.5" fill="#FFFFFF" />

          {/* Clever Grin */}
          <path d="M52 75C56 79 64 79 68 75" stroke="#111965" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "F":
      // Hearty / Bloom : Rosy-Pink 4-Petal Flower (Feeling)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* 4 Petals */}
          <circle cx="46" cy="46" r="22" fill="#F472B6" />
          <circle cx="74" cy="46" r="22" fill="#F472B6" />
          <circle cx="46" cy="74" r="22" fill="#F472B6" />
          <circle cx="74" cy="74" r="22" fill="#F472B6" />
          <circle cx="60" cy="60" r="24" fill="#EC4899" />

          {/* Happy Closed Arched Eyes */}
          <path d="M46 54C48 50 54 50 56 54" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M64 54C66 50 72 50 74 54" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rosy Cheeks */}
          <circle cx="39" cy="64" r="5" fill="#FBBF24" />
          <circle cx="81" cy="64" r="5" fill="#FBBF24" />

          {/* Big Warm Joyful Smile */}
          <path
            d={isExcited ? "M48 66C48 66 53 77 60 77C67 77 72 66 72 66" : "M51 66C54 71 66 71 69 66"}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill={isExcited ? "#FFFFFF" : "none"}
          />
        </svg>
      );

    case "J":
      // Checky : Emerald Green Dome Arch with Star Antenna (Judging)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Antenna with Star Flag */}
          <line x1="60" y1="20" x2="60" y2="34" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="18" r="5" fill="#FBBF24" />

          {/* Dome Arch Body */}
          <path
            d="M32 94V58C32 42.5 44.5 30 60 30C75.5 30 88 42.5 88 58V94C88 97 85.5 100 82 100H38C34.5 100 32 97 32 94Z"
            fill="#059669"
          />
          <path
            d="M36 94V58C36 44.5 46.5 34 60 34C73.5 34 84 44.5 84 58V94C84 96 82 98 79 98H41C38 98 36 96 36 94Z"
            fill="#10B981"
          />

          {/* Observant Alert Eyes */}
          <circle cx="48" cy="58" r="7" fill="#FFFFFF" />
          <circle cx="50" cy="58" r="4" fill="#111965" />
          <circle cx="51" cy="56" r="1.5" fill="#FFFFFF" />

          <circle cx="72" cy="58" r="7" fill="#FFFFFF" />
          <circle cx="74" cy="58" r="4" fill="#111965" />
          <circle cx="75" cy="56" r="1.5" fill="#FFFFFF" />

          {/* Cute Checkmark on Forehead */}
          <path d="M55 46L58 49L65 42" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Proud Confident Smile */}
          <path d="M50 74C54 78 66 78 70 74" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "P":
      // Wavey : Tangerine Jelly Triangle with Quirky Eyes (Perceiving)
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Rounded Triangle / Jelly Silhouette */}
          <path
            d="M60 22C66 22 72 26 76 32L102 78C106 86 100 96 90 96H30C20 96 14 86 18 78L44 32C48 26 54 22 60 22Z"
            fill="#EA580C"
          />
          <path
            d="M60 26C64 26 69 30 72 35L96 79C99 85 95 92 88 92H32C25 92 21 85 24 79L48 35C51 30 56 26 60 26Z"
            fill="#FB923C"
          />

          {/* Quirky Googly Eyes */}
          <circle cx="48" cy="58" r="8" fill="#FFFFFF" stroke="#111965" strokeWidth="2" />
          <circle cx="49" cy="56" r="4" fill="#111965" />

          <circle cx="72" cy="60" r="9" fill="#FFFFFF" stroke="#111965" strokeWidth="2" />
          <circle cx="75" cy="58" r="4.5" fill="#111965" />

          {/* Wavy Fun Grin */}
          <path
            d="M47 75C51 72 55 78 59 75C63 72 67 78 71 75"
            stroke="#111965"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
}
