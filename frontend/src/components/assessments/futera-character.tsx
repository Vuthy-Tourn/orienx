"use client";

import React from "react";

interface FuteraCharacterProps {
  trait: string; // "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
  className?: string;
  isSelected?: boolean;
  size?: number;
}

export function FuteraCharacter({
  trait,
  className = "w-28 h-28",
  isSelected = false,
  size = 110,
}: FuteraCharacterProps) {
  // SVG Characters designed with bespoke personality for Futera
  switch (trait) {
    case "E":
      // "Sol" / "Sparks" — The Outward Solar Buddy (Extraversion)
      // Cheerful yellow & navy flower-sun with happy arched eyes, blushing cheeks, and a joyful smile
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Outer Petals / Sun Rays */}
            <circle cx="60" cy="60" r="48" fill={isSelected ? "#F7CE4D" : "#FFE58F"} />
            <path
              d="M60 4C64 16 64 16 60 4ZM60 116C64 104 64 104 60 116ZM4 60C16 64 16 64 4 60ZM116 60C104 64 104 64 116 60Z"
              stroke="#111965"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Flower Petal Bumps */}
            <circle cx="60" cy="18" r="14" fill="#F7CE4D" />
            <circle cx="60" cy="102" r="14" fill="#F7CE4D" />
            <circle cx="18" cy="60" r="14" fill="#F7CE4D" />
            <circle cx="102" cy="60" r="14" fill="#F7CE4D" />
            <circle cx="30" cy="30" r="14" fill="#F7CE4D" />
            <circle cx="90" cy="30" r="14" fill="#F7CE4D" />
            <circle cx="30" cy="90" r="14" fill="#F7CE4D" />
            <circle cx="90" cy="90" r="14" fill="#F7CE4D" />

            {/* Inner Face Body */}
            <circle cx="60" cy="60" r="38" fill={isSelected ? "#111965" : "#1E277A"} />

            {/* Sparkle Eyes */}
            <ellipse cx="48" cy="54" rx="4.5" ry="6.5" fill="#FFFFFF" />
            <circle cx="50" cy="52" r="2" fill="#F7CE4D" />
            <ellipse cx="72" cy="54" rx="4.5" ry="6.5" fill="#FFFFFF" />
            <circle cx="74" cy="52" r="2" fill="#F7CE4D" />

            {/* Cheerful Blushing Cheeks */}
            <circle cx="38" cy="63" r="5" fill="#F7CE4D" opacity="0.8" />
            <circle cx="82" cy="63" r="5" fill="#F7CE4D" opacity="0.8" />

            {/* Happy Open Smile */}
            <path
              d="M49 67C49 67 54 75 60 75C66 75 71 67 71 67"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill={isSelected ? "#F7CE4D" : "none"}
            />
          </svg>
        </div>
      );

    case "I":
      // "Luna" / "Pea" — The Peaceful Sanctuary Buddy (Introversion)
      // Cozy rounded indigo/lavender squircle with calm happy resting eyes and headphone band
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Headphone Band */}
            <path
              d="M26 62C26 38 41 22 60 22C79 22 94 38 94 62"
              stroke="#F7CE4D"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Main Squircle Body */}
            <rect
              x="25"
              y="32"
              width="70"
              height="70"
              rx="28"
              fill={isSelected ? "#111965" : "#2E3A8C"}
            />

            {/* Headphone Ear Cushions */}
            <rect x="20" y="52" width="10" height="22" rx="5" fill="#F7CE4D" />
            <rect x="90" y="52" width="10" height="22" rx="5" fill="#F7CE4D" />

            {/* Serene Arched Closed Eyes (Peaceful Meditation) */}
            <path
              d="M43 62C46 58 51 58 54 62"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M66 62C69 58 74 58 77 62"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Soft Rosy Cheeks */}
            <ellipse cx="39" cy="70" rx="4.5" ry="3.5" fill="#F7CE4D" opacity="0.85" />
            <ellipse cx="81" cy="70" rx="4.5" ry="3.5" fill="#F7CE4D" opacity="0.85" />

            {/* Gentle Content Smile */}
            <path
              d="M54 71C56 74 64 74 66 71"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "S":
      // "Geo" / "Cube" — The Practical Concrete Builder (Sensing)
      // Cheerful hexagonal/cube character with cute wide curious eyes and a friendly grin
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Hexagon Body */}
            <polygon
              points="60,18 96,38 96,82 60,102 24,82 24,38"
              fill={isSelected ? "#111965" : "#1E277A"}
              stroke="#F7CE4D"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Big Curious Eyes */}
            <circle cx="48" cy="54" r="8" fill="#FFFFFF" />
            <circle cx="50" cy="54" r="4.5" fill="#111965" />
            <circle cx="52" cy="52" r="1.5" fill="#FFFFFF" />

            <circle cx="72" cy="54" r="8" fill="#FFFFFF" />
            <circle cx="74" cy="54" r="4.5" fill="#111965" />
            <circle cx="76" cy="52" r="1.5" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <circle cx="36" cy="65" r="4" fill="#F7CE4D" opacity="0.9" />
            <circle cx="84" cy="65" r="4" fill="#F7CE4D" opacity="0.9" />

            {/* Confident Practical Smile */}
            <path
              d="M50 72C54 77 66 77 70 72"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "N":
      // "Nova" / "Cosmo" — The Dreamy Visionary Cloud (Intuition)
      // Puffy cloud-star character with sparkling starry eyes and visionary smile
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Nebula Cloud Silhouette */}
            <path
              d="M38 78C30 78 24 72 24 64C24 57 29 51 36 50C37 40 46 32 56 32C66 32 74 38 77 46C80 44 83 44 86 44C95 44 102 51 102 60C102 62 101 64 100 66C104 69 106 73 106 78C106 86 99 92 91 92H38C30 92 24 86 24 78"
              fill={isSelected ? "#111965" : "#312E81"}
              stroke="#F7CE4D"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Starry Sparkle Eyes */}
            <path
              d="M48 56L50 61L55 63L50 65L48 70L46 65L41 63L46 61Z"
              fill="#F7CE4D"
            />
            <path
              d="M72 56L74 61L79 63L74 65L72 70L70 65L65 63L70 61Z"
              fill="#F7CE4D"
            />

            {/* Sweet Visionary Smile */}
            <path
              d="M54 75C57 78 63 78 66 75"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "T":
      // "Logic" / "Prism" — The Clever Analytical Diamond (Thinking)
      // Sharp, cute diamond/prism with smart winking eyes and clever grin
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Diamond Body */}
            <polygon
              points="60,16 100,60 60,104 20,60"
              fill={isSelected ? "#111965" : "#064E3B"}
              stroke="#F7CE4D"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Smart Glasses Frame */}
            <rect
              x="36"
              y="48"
              width="18"
              height="16"
              rx="4"
              stroke="#F7CE4D"
              strokeWidth="2.5"
              fill="#FFFFFF"
            />
            <rect
              x="66"
              y="48"
              width="18"
              height="16"
              rx="4"
              stroke="#F7CE4D"
              strokeWidth="2.5"
              fill="#FFFFFF"
            />
            <line x1="54" y1="56" x2="66" y2="56" stroke="#F7CE4D" strokeWidth="2.5" />

            {/* Smart Pupils */}
            <circle cx="45" cy="56" r="3.5" fill="#111965" />
            <circle cx="75" cy="56" r="3.5" fill="#111965" />

            {/* Clever Smile */}
            <path
              d="M52 74C56 78 64 78 68 74"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "F":
      // "Hearty" / "Bloom" — The Empathetic Heart Clover (Feeling)
      // Warm, sweet clover-heart character with loving warm eyes and bright smile
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* 4-Leaf Heart Clover Body */}
            <circle cx="46" cy="46" r="22" fill={isSelected ? "#111965" : "#881337"} />
            <circle cx="74" cy="46" r="22" fill={isSelected ? "#111965" : "#881337"} />
            <circle cx="46" cy="74" r="22" fill={isSelected ? "#111965" : "#881337"} />
            <circle cx="74" cy="74" r="22" fill={isSelected ? "#111965" : "#881337"} />
            <circle cx="60" cy="60" r="24" fill={isSelected ? "#111965" : "#881337"} />

            {/* Happy Curved Loving Eyes */}
            <path
              d="M45 54C47 50 53 50 55 54"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M65 54C67 50 73 50 75 54"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Blushing Heart Cheeks */}
            <circle cx="38" cy="62" r="5" fill="#F7CE4D" />
            <circle cx="82" cy="62" r="5" fill="#F7CE4D" />

            {/* Big Warm Joyful Smile */}
            <path
              d="M50 67C50 67 54 75 60 75C66 75 70 67 70 67"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill={isSelected ? "#F7CE4D" : "none"}
            />
          </svg>
        </div>
      );

    case "J":
      // "Checky" / "Planner" — The Organized Milestone Capsule (Judging)
      // Tall, focused, friendly capsule with little antenna flag, clear eyes, and proud smile
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Top Star Antenna */}
            <line x1="60" y1="22" x2="60" y2="34" stroke="#F7CE4D" strokeWidth="3" />
            <circle cx="60" cy="18" r="5" fill="#F7CE4D" />

            {/* Capsule Body */}
            <rect
              x="32"
              y="32"
              width="56"
              height="72"
              rx="28"
              fill={isSelected ? "#111965" : "#1E277A"}
              stroke="#F7CE4D"
              strokeWidth="3.5"
            />

            {/* Focused Alert Eyes */}
            <circle cx="48" cy="58" r="6" fill="#FFFFFF" />
            <circle cx="50" cy="58" r="3.5" fill="#111965" />
            <circle cx="72" cy="58" r="6" fill="#FFFFFF" />
            <circle cx="74" cy="58" r="3.5" fill="#111965" />

            {/* Cute Checkmark Badge on Forehead */}
            <path
              d="M54 44L58 48L66 40"
              stroke="#F7CE4D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Proud Smile */}
            <path
              d="M50 74C54 78 66 78 70 74"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "P":
      // "Wavey" / "Flex" — The Spontaneous Jelly Wave (Perceiving)
      // Wavy, fluid, playful character with cute rolling eyes and relaxed wavy grin
      return (
        <div
          className={`relative transition-all duration-300 transform ${
            isSelected ? "scale-110 -translate-y-2" : "hover:scale-105"
          } ${className}`}
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Fluid Jelly Silhouette */}
            <path
              d="M60 26C80 26 96 42 96 62C96 82 86 96 74 96C66 96 62 88 56 88C50 88 44 96 34 96C22 96 24 78 24 62C24 42 40 26 60 26Z"
              fill={isSelected ? "#111965" : "#C2410C"}
              stroke="#F7CE4D"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Playful Quirky Eyes */}
            <circle cx="48" cy="52" r="7" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="3.5" fill="#111965" />

            <circle cx="72" cy="54" r="8" fill="#FFFFFF" />
            <circle cx="74" cy="52" r="4.5" fill="#111965" />

            {/* Wavy Spontaneous Smile */}
            <path
              d="M48 72C52 69 56 75 60 72C64 69 68 75 72 72"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    default:
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
            <circle cx="60" cy="60" r="45" fill={isSelected ? "#111965" : "#1E277A"} />
            <circle cx="60" cy="60" r="15" fill="#F7CE4D" />
          </svg>
        </div>
      );
  }
}
