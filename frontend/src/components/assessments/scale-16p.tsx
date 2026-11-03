"use client";

import React, { useState } from "react";

interface Scale16pProps {
  value: number | null; // 1 to 7 (1: Strong Agree ... 4: Neutral ... 7: Strong Disagree)
  onChange: (value: number) => void;
  language: "en" | "km";
  agreeLabelEn?: string;
  agreeLabelKm?: string;
  disagreeLabelEn?: string;
  disagreeLabelKm?: string;
}

interface StepConfig {
  level: number;
  labelEn: string;
  labelKm: string;
  themeColor: string;
  gradientFrom: string;
  gradientTo: string;
  idleBg: string;
  idleBorder: string;
  activeGlow: string;
  trackPositionPercent: number; // 0 to 100%
}

// 7 Steps matching the exact squircle aesthetic and color sequence from the reference image:
// Blue (Strong Agree) -> Mint (Agree) -> Lime (Slightly Agree) -> Yellow (Neutral) ->
// Orange (Slightly Disagree) -> Coral (Disagree) -> Crimson (Strongly Disagree)
const SCALE_STEPS: StepConfig[] = [
  {
    level: 1,
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    themeColor: "#0284C7",
    gradientFrom: "#38BDF8",
    gradientTo: "#0284C7",
    idleBg: "bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25",
    idleBorder: "border-[#38BDF8]/70 hover:border-[#38BDF8]",
    activeGlow: "shadow-[0_10px_28px_rgba(2,132,199,0.55)] ring-4 ring-sky-300/70",
    trackPositionPercent: 0,
  },
  {
    level: 2,
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    themeColor: "#059669",
    gradientFrom: "#34D399",
    gradientTo: "#059669",
    idleBg: "bg-[#34D399]/15 hover:bg-[#34D399]/25",
    idleBorder: "border-[#34D399]/70 hover:border-[#34D399]",
    activeGlow: "shadow-[0_10px_28px_rgba(5,150,105,0.55)] ring-4 ring-emerald-300/70",
    trackPositionPercent: 16.66,
  },
  {
    level: 3,
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    themeColor: "#65A30D",
    gradientFrom: "#A3E635",
    gradientTo: "#65A30D",
    idleBg: "bg-[#A3E635]/15 hover:bg-[#A3E635]/25",
    idleBorder: "border-[#84CC16]/70 hover:border-[#84CC16]",
    activeGlow: "shadow-[0_10px_26px_rgba(101,163,13,0.55)] ring-4 ring-lime-300/70",
    trackPositionPercent: 33.33,
  },
  {
    level: 4,
    labelEn: "Neutral",
    labelKm: "កណ្តាល",
    themeColor: "#D97706",
    gradientFrom: "#FACC15",
    gradientTo: "#D97706",
    idleBg: "bg-[#FACC15]/20 hover:bg-[#FACC15]/30",
    idleBorder: "border-[#FACC15]/80 hover:border-[#EAB308]",
    activeGlow: "shadow-[0_10px_26px_rgba(217,119,6,0.55)] ring-4 ring-amber-300/70",
    trackPositionPercent: 50,
  },
  {
    level: 5,
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    themeColor: "#EA580C",
    gradientFrom: "#FB923C",
    gradientTo: "#EA580C",
    idleBg: "bg-[#FB923C]/15 hover:bg-[#FB923C]/25",
    idleBorder: "border-[#FB923C]/70 hover:border-[#FB923C]",
    activeGlow: "shadow-[0_10px_26px_rgba(234,88,12,0.55)] ring-4 ring-orange-300/70",
    trackPositionPercent: 66.66,
  },
  {
    level: 6,
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    themeColor: "#DC2626",
    gradientFrom: "#F87171",
    gradientTo: "#DC2626",
    idleBg: "bg-[#F87171]/15 hover:bg-[#F87171]/25",
    idleBorder: "border-[#F87171]/70 hover:border-[#F87171]",
    activeGlow: "shadow-[0_10px_28px_rgba(220,38,38,0.55)] ring-4 ring-rose-300/70",
    trackPositionPercent: 83.33,
  },
  {
    level: 7,
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    themeColor: "#B91C1C",
    gradientFrom: "#EF4444",
    gradientTo: "#991B1B",
    idleBg: "bg-[#EF4444]/15 hover:bg-[#EF4444]/25",
    idleBorder: "border-[#EF4444]/70 hover:border-[#EF4444]",
    activeGlow: "shadow-[0_10px_28px_rgba(185,28,28,0.55)] ring-4 ring-red-300/70",
    trackPositionPercent: 100,
  },
];

export function Scale16p({
  value,
  onChange,
  language,
  agreeLabelEn = "Agree",
  agreeLabelKm = "យល់ស្រប",
  disagreeLabelEn = "Disagree",
  disagreeLabelKm = "មិនយល់ស្រប",
}: Scale16pProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeLevel = hovered ?? value;
  const currentStep = SCALE_STEPS.find((s) => s.level === activeLevel);
  const selectedStep = SCALE_STEPS.find((s) => s.level === value);

  return (
    <div className="w-full space-y-6 select-none py-1">
      {/* 1. Top Header Labels (Positive / Negative Indicators) */}
      <div className="flex items-center justify-between px-2 sm:px-6">
        {/* Agree Label (Left - Positive Blue/Emerald) */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onChange(1)}
        >
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0284C7]" />
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-sm sm:text-base font-black text-sky-800 tracking-tight">
              {language === "km" ? agreeLabelKm : agreeLabelEn}
            </span>
            <span className="text-[10px] font-bold text-sky-600/80 uppercase tracking-widest hidden sm:inline">
              + Positive
            </span>
          </div>
        </div>

        {/* Disagree Label (Right - Negative Coral/Red) */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onChange(7)}
        >
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm sm:text-base font-black text-rose-800 tracking-tight">
              {language === "km" ? disagreeLabelKm : disagreeLabelEn}
            </span>
            <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-widest hidden sm:inline">
              − Negative
            </span>
          </div>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC2626]" />
          </span>
        </div>
      </div>

      {/* 2. Row of 7 Uniform Squircle Emotion Cards (Clean, Untangled) */}
      <div className="flex items-center justify-between max-w-xl mx-auto gap-2 sm:gap-3 px-2 sm:px-4">
        {SCALE_STEPS.map((step) => {
          const isSelected = value === step.level;
          const isHovered = hovered === step.level;

          return (
            <div key={step.level} className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => onChange(step.level)}
                onMouseEnter={() => setHovered(step.level)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  backgroundImage: isSelected
                    ? `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`
                    : undefined,
                }}
                className={`w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 aspect-square rounded-2xl sm:rounded-[22px] border-2 sm:border-3 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none active:scale-92 ${
                  isSelected
                    ? `text-white border-white ${step.activeGlow} -translate-y-2 scale-110 shadow-xl z-10`
                    : isHovered
                    ? `${step.idleBg} ${step.idleBorder} -translate-y-1 scale-105 shadow-md z-0`
                    : `${step.idleBg} ${step.idleBorder} shadow-2xs hover:shadow-sm z-0`
                }`}
                title={language === "km" ? step.labelKm : step.labelEn}
                aria-label={language === "km" ? step.labelKm : step.labelEn}
              >
                {/* Expressive Emoticon matching the reference cards */}
                <div
                  className={`transition-transform duration-200 ${
                    isSelected ? "scale-110 drop-shadow-sm" : isHovered ? "scale-105" : ""
                  }`}
                >
                  {renderEmotionFace(step.level, isSelected, step.themeColor)}
                </div>

                {/* Subtle active pulse corner marker */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-xs" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Spectrum Slider Rail (Strictly UNDERNEATH the cards with ZERO overlap!) */}
      <div className="relative max-w-xl mx-auto px-2 sm:px-4 pt-1">
        <div className="flex items-center gap-3">
          {/* Left (+) Marker */}
          <span className="text-[#0284C7] font-black text-base sm:text-lg select-none leading-none">
            +
          </span>

          {/* Continuous Spectrum Track */}
          <div className="flex-1 relative py-2">
            <div className="h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner bg-slate-200/90 border border-slate-300/40">
              {/* Colorful gradient matching the exact card sequence */}
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#38BDF8] via-[#34D399] via-[#84CC16] via-[#FACC15] via-[#FB923C] via-[#F87171] to-[#EF4444] opacity-95" />
            </div>

            {/* Glowing Tracker Pip Following Selection */}
            {selectedStep && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none"
                style={{
                  left: `${selectedStep.trackPositionPercent}%`,
                }}
              >
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-md ring-2 ring-black/10 scale-110"
                  style={{ backgroundColor: selectedStep.themeColor }}
                />
              </div>
            )}
          </div>

          {/* Right (−) Marker */}
          <span className="text-[#DC2626] font-black text-base sm:text-lg select-none leading-none">
            −
          </span>
        </div>
      </div>

      {/* 4. Dynamic Feedback Text (Clean text label without emojis or level tags, matching pic 2) */}
      <div className="h-8 flex items-center justify-center">
        {currentStep ? (
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold shadow-xs border animate-in fade-in zoom-in-95 duration-150 transition-all"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: currentStep.themeColor,
              color: currentStep.themeColor,
            }}
          >
            <span>
              {language === "km" ? currentStep.labelKm : currentStep.labelEn}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center text-xs font-semibold text-slate-400">
            <span>
              {language === "km"
                ? "សូមជ្រើសរើសជម្រើសដែលត្រូវនឹងអ្នក"
                : "Choose the option that best reflects you"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 7 Expressive Emoticons matching the reference card row:
 * 1. Strongly Agree (Sky Blue): Big happy laughing open mouth
 * 2. Agree (Mint): Warm friendly smile
 * 3. Slightly Agree (Lime): Polite gentle smile
 * 4. Neutral (Yellow): Calm straight line
 * 5. Slightly Disagree (Orange): Slight downturned frown
 * 6. Disagree (Coral): Downturned sad frown
 * 7. Strongly Disagree (Crimson): Wide open distressed mouth
 */
function renderEmotionFace(level: number, isSelected: boolean, themeColor: string) {
  // When selected: crisp white strokes/fills; When idle: high-contrast dark theme color
  const stroke = isSelected ? "#FFFFFF" : themeColor;
  const fill = isSelected ? "#FFFFFF" : themeColor;

  switch (level) {
    case 1:
      // Level 1: Two round eyes + big open happy smile
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="10" r="2.2" fill={fill} />
          <circle cx="19.5" cy="10" r="2.2" fill={fill} />
          {/* Big happy open mouth */}
          <path
            d="M8 14.5 H20 C19.5 21 8.5 21 8 14.5 Z"
            fill={fill}
          />
        </svg>
      );

    case 2:
      // Level 2: Two round eyes + cheerful curved smile
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="10.5" r="2.2" fill={fill} />
          <circle cx="19.5" cy="10.5" r="2.2" fill={fill} />
          <path
            d="M8.5 15 C10.5 20.5 17.5 20.5 19.5 15"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 3:
      // Level 3: Two round eyes + gentle polite smile
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="10.5" r="2" fill={fill} />
          <circle cx="19.5" cy="10.5" r="2" fill={fill} />
          <path
            d="M9.5 16 C11.5 19.5 16.5 19.5 18.5 16"
            stroke={stroke}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 4:
      // Level 4: Two round eyes + straight calm line
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="11" r="2.2" fill={fill} />
          <circle cx="19.5" cy="11" r="2.2" fill={fill} />
          <line
            x1="8.5"
            y1="17"
            x2="19.5"
            y2="17"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 5:
      // Level 5: Two round eyes + slight downturned frown
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="11" r="2" fill={fill} />
          <circle cx="19.5" cy="11" r="2" fill={fill} />
          <path
            d="M9.5 18 C11.5 15.5 16.5 15.5 18.5 18"
            stroke={stroke}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case 6:
      // Level 6: Two round eyes + clear sad frown
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="11" r="2.2" fill={fill} />
          <circle cx="19.5" cy="11" r="2.2" fill={fill} />
          <path
            d="M8.5 19.5 C10.5 14.5 17.5 14.5 19.5 19.5"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 7:
      // Level 7: Two round eyes + wide open distressed / upset mouth
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <circle cx="8.5" cy="10" r="2.2" fill={fill} />
          <circle cx="19.5" cy="10" r="2.2" fill={fill} />
          {/* Distressed open frown mouth */}
          <path
            d="M8.5 20.5 C8.5 14.5 19.5 14.5 19.5 20.5 C17.5 21.5 10.5 21.5 8.5 20.5 Z"
            fill={fill}
          />
        </svg>
      );

    default:
      return null;
  }
}
