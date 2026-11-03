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
  sizeClass: string;
  svgSizeClass: string;
  labelEn: string;
  labelKm: string;
  emoji: string;
  themeColor: string;
  gradientFrom: string;
  gradientTo: string;
  idleBg: string;
  idleBorder: string;
  activeGlow: string;
  trackPositionPercent: number; // 0 to 100% along the gradient bar
}

const SCALE_STEPS: StepConfig[] = [
  {
    level: 1,
    sizeClass: "w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16",
    svgSizeClass: "w-7 h-7 sm:w-8 sm:h-8",
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    emoji: "🌟",
    themeColor: "#059669",
    gradientFrom: "#10B981",
    gradientTo: "#047857",
    idleBg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    idleBorder: "border-[#10B981]",
    activeGlow: "shadow-[0_8px_25px_rgba(16,185,129,0.55)] ring-4 ring-emerald-300/60",
    trackPositionPercent: 0,
  },
  {
    level: 2,
    sizeClass: "w-11.5 h-11.5 sm:w-13 sm:h-13 md:w-14 md:h-14",
    svgSizeClass: "w-6 h-6 sm:w-7 sm:h-7",
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    emoji: "😊",
    themeColor: "#10B981",
    gradientFrom: "#34D399",
    gradientTo: "#059669",
    idleBg: "bg-emerald-400/10 hover:bg-emerald-400/20",
    idleBorder: "border-[#34D399]",
    activeGlow: "shadow-[0_8px_22px_rgba(52,211,153,0.55)] ring-4 ring-emerald-300/50",
    trackPositionPercent: 16.6,
  },
  {
    level: 3,
    sizeClass: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
    svgSizeClass: "w-5 h-5 sm:w-6 sm:h-6",
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    emoji: "🙂",
    themeColor: "#14B8A6",
    gradientFrom: "#2DD4BF",
    gradientTo: "#0D9488",
    idleBg: "bg-teal-400/10 hover:bg-teal-400/20",
    idleBorder: "border-[#2DD4BF]",
    activeGlow: "shadow-[0_6px_20px_rgba(45,212,191,0.5)] ring-4 ring-teal-300/50",
    trackPositionPercent: 33.3,
  },
  {
    level: 4,
    sizeClass: "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 md:w-10 md:h-10",
    svgSizeClass: "w-4.5 h-4.5 sm:w-5 sm:h-5",
    labelEn: "Neutral",
    labelKm: "កណ្តាល",
    emoji: "🤔",
    themeColor: "#64748B",
    gradientFrom: "#94A3B8",
    gradientTo: "#475569",
    idleBg: "bg-slate-200/60 hover:bg-slate-200",
    idleBorder: "border-slate-300",
    activeGlow: "shadow-[0_6px_18px_rgba(100,116,139,0.5)] ring-4 ring-slate-300/60",
    trackPositionPercent: 50,
  },
  {
    level: 5,
    sizeClass: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
    svgSizeClass: "w-5 h-5 sm:w-6 sm:h-6",
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    emoji: "😕",
    themeColor: "#A855F7",
    gradientFrom: "#C084FC",
    gradientTo: "#9333EA",
    idleBg: "bg-purple-400/10 hover:bg-purple-400/20",
    idleBorder: "border-[#C084FC]",
    activeGlow: "shadow-[0_6px_20px_rgba(192,132,252,0.5)] ring-4 ring-purple-300/50",
    trackPositionPercent: 66.6,
  },
  {
    level: 6,
    sizeClass: "w-11.5 h-11.5 sm:w-13 sm:h-13 md:w-14 md:h-14",
    svgSizeClass: "w-6 h-6 sm:w-7 sm:h-7",
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    emoji: "🥺",
    themeColor: "#9333EA",
    gradientFrom: "#A855F7",
    gradientTo: "#7E22CE",
    idleBg: "bg-purple-500/10 hover:bg-purple-500/20",
    idleBorder: "border-[#A855F7]",
    activeGlow: "shadow-[0_8px_22px_rgba(147,51,234,0.55)] ring-4 ring-purple-300/50",
    trackPositionPercent: 83.3,
  },
  {
    level: 7,
    sizeClass: "w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16",
    svgSizeClass: "w-7 h-7 sm:w-8 sm:h-8",
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    emoji: "😤",
    themeColor: "#7C3AED",
    gradientFrom: "#8B5CF6",
    gradientTo: "#6D28D9",
    idleBg: "bg-purple-600/10 hover:bg-purple-600/20",
    idleBorder: "border-[#8B5CF6]",
    activeGlow: "shadow-[0_8px_25px_rgba(124,58,237,0.55)] ring-4 ring-purple-300/60",
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
    <div className="w-full space-y-6 select-none py-2">
      {/* Top Header Labels with Subdued Indicator Tags */}
      <div className="flex items-center justify-between px-2 sm:px-6">
        {/* Agree Label (Left) */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onChange(1)}>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-sm sm:text-base font-black text-emerald-700 tracking-tight">
              {language === "km" ? agreeLabelKm : agreeLabelEn}
            </span>
            <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest hidden sm:inline">
              Positive
            </span>
          </div>
        </div>

        {/* Disagree Label (Right) */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onChange(7)}>
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm sm:text-base font-black text-purple-700 tracking-tight">
              {language === "km" ? disagreeLabelKm : disagreeLabelEn}
            </span>
            <span className="text-[10px] font-bold text-purple-600/80 uppercase tracking-widest hidden sm:inline">
              Negative
            </span>
          </div>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
          </span>
        </div>
      </div>

      {/* Main Interactive Spectrum Arena */}
      <div className="relative py-6 sm:py-8 px-2 sm:px-6">
        {/* Continuous Color Spectrum Rail with +/- Terminals (Directly inspired by Idea Image) */}
        <div className="absolute top-1/2 left-4 right-4 sm:left-10 sm:right-10 -translate-y-1/2 flex items-center z-0 pointer-events-none">
          <span className="text-emerald-600 font-black text-sm sm:text-base mr-2 select-none opacity-80">+</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden shadow-inner p-0.5 bg-slate-200/90 border border-slate-300/40">
            {/* Multi-stop colorful spectrum gradient matching Idea Image */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 via-slate-400 via-purple-400 to-purple-600 opacity-90" />
          </div>
          <span className="text-purple-600 font-black text-sm sm:text-base ml-2 select-none opacity-80">−</span>
        </div>

        {/* Selected Position Glow Tracker Pip */}
        {selectedStep && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none z-0"
            style={{
              left: `calc(2.5rem + (100% - 5rem) * ${selectedStep.trackPositionPercent / 100})`,
            }}
          >
            <div
              className="w-9 h-9 rounded-full blur-md opacity-70 animate-pulse"
              style={{ backgroundColor: selectedStep.themeColor }}
            />
          </div>
        )}

        {/* 7 Expressive Character Tokens (Row of Squircles / Floating Badges) */}
        <div className="relative z-10 flex items-center justify-between max-w-xl mx-auto">
          {SCALE_STEPS.map((step) => {
            const isSelected = value === step.level;
            const isHovered = hovered === step.level;

            return (
              <div key={step.level} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onChange(step.level)}
                  onMouseEnter={() => setHovered(step.level)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    backgroundColor: isSelected ? undefined : undefined,
                    backgroundImage: isSelected
                      ? `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`
                      : undefined,
                  }}
                  className={`relative rounded-2xl sm:rounded-3xl border-2 sm:border-3 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none active:scale-92 ${
                    step.sizeClass
                  } ${
                    isSelected
                      ? `text-white border-white ${step.activeGlow} -translate-y-2.5 scale-112 shadow-xl`
                      : isHovered
                      ? `${step.idleBg} ${step.idleBorder} -translate-y-1.5 scale-108 shadow-md`
                      : `${step.idleBg} ${step.idleBorder} shadow-2xs hover:shadow-sm`
                  }`}
                  title={`${step.labelEn} (${step.emoji})`}
                  aria-label={`${step.labelEn}`}
                >
                  {/* Inner expressive emoticon SVG */}
                  <div
                    className={`transition-transform duration-200 ${
                      isSelected ? "scale-110 drop-shadow-sm" : isHovered ? "scale-105" : ""
                    }`}
                  >
                    {renderEmotionFace(step.level, isSelected, step.themeColor, step.svgSizeClass)}
                  </div>

                  {/* Corner Pulse Indicator when active */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Dynamic Feedback Pill with Khmer & English contextual status */}
      <div className="h-9 flex items-center justify-center">
        {currentStep ? (
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-black shadow-md border animate-in fade-in zoom-in-95 duration-150 transition-all"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: currentStep.themeColor,
              color: currentStep.themeColor,
            }}
          >
            <span className="text-sm leading-none">{currentStep.emoji}</span>
            <span>
              {language === "km" ? currentStep.labelKm : currentStep.labelEn}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full text-white font-extrabold"
              style={{ backgroundColor: currentStep.themeColor }}
            >
              {language === "km" ? `កម្រិត ${currentStep.level}` : `Level ${currentStep.level}`}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>✨</span>
            <span>
              {language === "km"
                ? "សូមជ្រើសរើសកម្រិតដែលត្រូវនឹងអ្នក"
                : "Choose the level that best reflects you"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 7 Expressive Emoticon Faces directly inspired by Image 2:
 * 1. Strongly Agree: Radiant happy closed-eye smile (^ ‿ ^) with cute open mouth
 * 2. Agree: Warm open smile (· ‿ ·) with friendly dot eyes
 * 3. Slightly Agree: Gentle content smile (· ◡ ·)
 * 4. Neutral: Calm straight-faced observer (· ─ ·)
 * 5. Slightly Disagree: Pensive / skeptical slant (· ╲ ·)
 * 6. Disagree: Downturned sad mouth (· ︵ ·) with sympathetic eyes
 * 7. Strongly Disagree: Determined furrowed brows with deep frown (> ︵ <)
 */
function renderEmotionFace(
  level: number,
  isSelected: boolean,
  themeColor: string,
  svgSizeClass: string
) {
  const stroke = isSelected ? "#FFFFFF" : themeColor;
  const fill = isSelected ? "#FFFFFF" : themeColor;

  switch (level) {
    case 1:
      // Level 1 (Strongly Agree): Joyful laughing closed-eye arch ^ ^ with open laughing mouth!
      return (
        <svg viewBox="0 0 32 32" fill="none" className={svgSizeClass}>
          {/* Happy squinting arched eyes */}
          <path d="M7.5 12.5C9 9.5 12.5 9.5 14 12.5" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18 12.5C19.5 9.5 23 9.5 24.5 12.5" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          {/* Big happy open mouth with cute fill */}
          <path d="M9.5 17C10.5 23 21.5 23 22.5 17C20.5 16.2 11.5 16.2 9.5 17Z" fill={fill} />
        </svg>
      );

    case 2:
      // Level 2 (Agree): Two friendly circular eyes + cheerful smile!
      return (
        <svg viewBox="0 0 28 28" fill="none" className={svgSizeClass}>
          <circle cx="8.5" cy="10" r="2.2" fill={fill} />
          <circle cx="19.5" cy="10" r="2.2" fill={fill} />
          <path d="M8.5 15C10.5 20.5 17.5 20.5 19.5 15" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // Level 3 (Slightly Agree): Gentle polite smile
      return (
        <svg viewBox="0 0 24 24" fill="none" className={svgSizeClass}>
          <circle cx="7.5" cy="9.5" r="1.8" fill={fill} />
          <circle cx="16.5" cy="9.5" r="1.8" fill={fill} />
          <path d="M8 14.5C10 17.5 14 17.5 16 14.5" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 4:
      // Level 4 (Neutral): Two calm dots and straight mouth (· ─ ·)
      return (
        <svg viewBox="0 0 22 22" fill="none" className={svgSizeClass}>
          <circle cx="6.5" cy="9.5" r="1.6" fill={fill} />
          <circle cx="15.5" cy="9.5" r="1.6" fill={fill} />
          <line x1="7.5" y1="14.5" x2="14.5" y2="14.5" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 5:
      // Level 5 (Slightly Disagree): Pensive eyes with slight downward tilt
      return (
        <svg viewBox="0 0 24 24" fill="none" className={svgSizeClass}>
          <circle cx="7.5" cy="9.5" r="1.8" fill={fill} />
          <circle cx="16.5" cy="9.5" r="1.8" fill={fill} />
          <path d="M8 16C10 13.5 14 13.5 16 16" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Level 6 (Disagree): Clear downturned frown
      return (
        <svg viewBox="0 0 28 28" fill="none" className={svgSizeClass}>
          <circle cx="8.5" cy="11" r="2.2" fill={fill} />
          <circle cx="19.5" cy="11" r="2.2" fill={fill} />
          <path d="M8.5 19.5C10.5 14.5 17.5 14.5 19.5 19.5" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // Level 7 (Strongly Disagree): Furrowed angry/determined brows + deep expressive pout!
      return (
        <svg viewBox="0 0 32 32" fill="none" className={svgSizeClass}>
          {/* Slanted furrowed angry brows */}
          <path d="M7 10.5L13 13.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M25 10.5L19 13.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          {/* Eyes underneath */}
          <circle cx="10" cy="15" r="2" fill={fill} />
          <circle cx="22" cy="15" r="2" fill={fill} />
          {/* Deep downturned pout/frown */}
          <path d="M9 22C11.5 17.5 20.5 17.5 23 22" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
