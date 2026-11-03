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
  iconSize: number;
  labelEn: string;
  labelKm: string;
  themeColor: string; // Hex for active fill
  borderClass: string;
  activeRing: string;
}

const SCALE_STEPS: StepConfig[] = [
  {
    level: 1,
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    iconSize: 32,
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    themeColor: "#10B981", // Emerald Green (16Personalities Agree)
    borderClass: "border-[#10B981] text-[#10B981]",
    activeRing: "ring-4 ring-emerald-300 bg-[#10B981] text-white shadow-emerald-200",
  },
  {
    level: 2,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    iconSize: 26,
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    themeColor: "#34D399",
    borderClass: "border-[#34D399] text-[#34D399]",
    activeRing: "ring-4 ring-emerald-200 bg-[#34D399] text-white shadow-emerald-100",
  },
  {
    level: 3,
    sizeClass: "w-9 h-9 sm:w-10 sm:h-10",
    iconSize: 20,
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    themeColor: "#6EE7B7",
    borderClass: "border-[#6EE7B7] text-[#059669]",
    activeRing: "ring-4 ring-emerald-100 bg-[#6EE7B7] text-[#064E3B]",
  },
  {
    level: 4,
    sizeClass: "w-7 h-7 sm:w-8 sm:h-8",
    iconSize: 16,
    labelEn: "Neutral",
    labelKm: "កណ្តាល / មិនប្រាកដ",
    themeColor: "#94A3B8", // Slate neutral
    borderClass: "border-slate-300 text-slate-400",
    activeRing: "ring-4 ring-slate-200 bg-slate-500 text-white",
  },
  {
    level: 5,
    sizeClass: "w-9 h-9 sm:w-10 sm:h-10",
    iconSize: 20,
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    themeColor: "#C084FC", // Soft Purple
    borderClass: "border-[#C084FC] text-[#7E22CE]",
    activeRing: "ring-4 ring-purple-100 bg-[#C084FC] text-[#3B0764]",
  },
  {
    level: 6,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    iconSize: 26,
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    themeColor: "#A855F7",
    borderClass: "border-[#A855F7] text-[#A855F7]",
    activeRing: "ring-4 ring-purple-200 bg-[#A855F7] text-white shadow-purple-100",
  },
  {
    level: 7,
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    iconSize: 32,
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    themeColor: "#8B5CF6", // Deep Violet (16Personalities Disagree)
    borderClass: "border-[#8B5CF6] text-[#8B5CF6]",
    activeRing: "ring-4 ring-purple-300 bg-[#8B5CF6] text-white shadow-purple-200",
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

  return (
    <div className="w-full space-y-5 select-none">
      {/* 16Personalities-Style Horizontal Track */}
      <div className="relative py-3">
        {/* Connecting Baseline Horizon Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1.5 -translate-y-1/2 bg-slate-200 rounded-full z-0" />

        {/* 7 Circles Container */}
        <div className="relative z-10 flex items-center justify-between px-2 sm:px-6">
          {/* Left Agree Anchor Text */}
          <div className="flex flex-col items-start pr-2 sm:pr-4">
            <span className="text-xs sm:text-sm font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === "km" ? agreeLabelKm : agreeLabelEn}</span>
            </span>
          </div>

          {/* The 7 Scaled Circles */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5 flex-1 max-w-lg mx-auto">
            {SCALE_STEPS.map((step) => {
              const isSelected = value === step.level;
              const isHovered = hovered === step.level;

              return (
                <button
                  key={step.level}
                  type="button"
                  onClick={() => onChange(step.level)}
                  onMouseEnter={() => setHovered(step.level)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative rounded-full border-3 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    step.sizeClass
                  } ${
                    isSelected
                      ? `${step.activeRing} scale-115 shadow-xl`
                      : isHovered
                      ? `${step.borderClass} scale-108 shadow-md bg-white ring-2 ring-slate-200`
                      : `${step.borderClass} bg-white hover:bg-slate-50 shadow-2xs`
                  }`}
                  title={`${step.labelEn} (Level ${step.level})`}
                  aria-label={`${step.labelEn}`}
                >
                  {/* Micro-Face SVG inside each circle inspired by Image 1 */}
                  {renderMicroFace(step.level, isSelected, isHovered)}
                </button>
              );
            })}
          </div>

          {/* Right Disagree Anchor Text */}
          <div className="flex flex-col items-end pl-2 sm:pr-4">
            <span className="text-xs sm:text-sm font-black text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === "km" ? disagreeLabelKm : disagreeLabelEn}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Feedback Pill Beneath the Scale */}
      <div className="h-7 flex items-center justify-center">
        {currentStep ? (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-100 text-xs font-bold text-[#111965] border border-slate-200 animate-in fade-in duration-150">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentStep.themeColor }}
            />
            <span>{language === "km" ? currentStep.labelKm : currentStep.labelEn}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {language === "km"
              ? "ចុចរង្វង់ណាមួយដើម្បីជ្រើសរើស"
              : "Click a circle to select your stance"}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Micro-Face SVGs inside the 7 circles
 * Inspired directly by the "Check-in time" character feelings (Image 1)
 */
function renderMicroFace(level: number, isSelected: boolean, isHovered: boolean) {
  const strokeColor = isSelected ? "#FFFFFF" : "currentColor";
  const fillColor = isSelected ? "#FFFFFF" : "currentColor";

  switch (level) {
    case 1:
      // Level 1: Strongly Agree (Joyful/Hopeful - Arched smiling eyes & beaming open smile)
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7 sm:w-8 sm:h-8">
          {/* Closed Arched Smiling Eyes */}
          <path d="M12 18C13.5 15 16.5 15 18 18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 18C23.5 15 26.5 15 28 18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Big Open Smile */}
          <path
            d="M14 23C14 23 16.5 29 20 29C23.5 29 26 23 26 23"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill={isSelected ? "#FBBF24" : "none"}
          />
        </svg>
      );

    case 2:
      // Level 2: Agree (Cheerful Smile)
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
          <circle cx="11" cy="14" r="2" fill={fillColor} />
          <circle cx="21" cy="14" r="2" fill={fillColor} />
          <path d="M11 20C13 24 19 24 21 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // Level 3: Slightly Agree (Subtle Friendly Smile)
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle cx="8" cy="11" r="1.5" fill={fillColor} />
          <circle cx="16" cy="11" r="1.5" fill={fillColor} />
          <path d="M9 16C10.5 18 13.5 18 15 16" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 4:
      // Level 4: Neutral (Curious cartoon eyes looking straight/up)
      return (
        <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
          <circle cx="7" cy="10" r="1.75" fill={fillColor} />
          <circle cx="13" cy="10" r="1.75" fill={fillColor} />
        </svg>
      );

    case 5:
      // Level 5: Slightly Disagree (Thoughtful Calm Face)
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <line x1="7" y1="11" x2="10" y2="11" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="14" y1="11" x2="17" y2="11" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="16" x2="15" y2="16" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Level 6: Disagree (Firm Resolute Smile)
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
          <circle cx="11" cy="14" r="2" fill={fillColor} />
          <circle cx="21" cy="14" r="2" fill={fillColor} />
          <path d="M12 21C14 19 18 19 20 21" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // Level 7: Strongly Disagree (Bold Expressive Passionate Face)
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7 sm:w-8 sm:h-8">
          {/* Expressive Arched Eyes */}
          <path d="M12 17C13.5 14 16.5 14 18 17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 17C23.5 14 26.5 14 28 17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Confident Smile */}
          <path
            d="M14 24C16 28 24 28 26 24"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill={isSelected ? "#FBBF24" : "none"}
          />
        </svg>
      );

    default:
      return null;
  }
}
