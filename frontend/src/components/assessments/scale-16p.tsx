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
  labelEn: string;
  labelKm: string;
  themeColor: string; // Base color
  idleBorder: string;
  activeBg: string;
  activeBorder: string;
  activeGlow: string;
}

const SCALE_STEPS: StepConfig[] = [
  {
    level: 1,
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    themeColor: "#10B981",
    idleBorder: "border-[#10B981] text-[#10B981] bg-white hover:bg-emerald-50/50",
    activeBg: "bg-[#10B981] text-white",
    activeBorder: "border-[#065F46]",
    activeGlow: "shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-4 ring-emerald-200",
  },
  {
    level: 2,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    themeColor: "#34D399",
    idleBorder: "border-[#34D399] text-[#10B981] bg-white hover:bg-emerald-50/50",
    activeBg: "bg-[#34D399] text-white",
    activeBorder: "border-[#065F46]",
    activeGlow: "shadow-[0_0_18px_rgba(52,211,153,0.45)] ring-4 ring-emerald-200",
  },
  {
    level: 3,
    sizeClass: "w-9 h-9 sm:w-11 sm:h-11",
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    themeColor: "#6EE7B7",
    idleBorder: "border-[#6EE7B7] text-[#059669] bg-white hover:bg-emerald-50/50",
    activeBg: "bg-[#34D399] text-white",
    activeBorder: "border-[#065F46]",
    activeGlow: "shadow-[0_0_16px_rgba(52,211,153,0.45)] ring-4 ring-emerald-150",
  },
  {
    level: 4,
    sizeClass: "w-7 h-7 sm:w-8 sm:h-8",
    labelEn: "Neutral",
    labelKm: "កណ្តាល",
    themeColor: "#94A3B8",
    idleBorder: "border-slate-300 text-slate-400 bg-[#F8FAFC] hover:bg-slate-100",
    activeBg: "bg-[#64748B] text-white",
    activeBorder: "border-[#334155]",
    activeGlow: "shadow-[0_0_14px_rgba(100,116,139,0.4)] ring-4 ring-slate-200",
  },
  {
    level: 5,
    sizeClass: "w-9 h-9 sm:w-11 sm:h-11",
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    themeColor: "#C084FC",
    idleBorder: "border-[#C084FC] text-[#9333EA] bg-white hover:bg-purple-50/50",
    activeBg: "bg-[#A855F7] text-white",
    activeBorder: "border-[#581C87]",
    activeGlow: "shadow-[0_0_16px_rgba(168,85,247,0.45)] ring-4 ring-purple-150",
  },
  {
    level: 6,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    themeColor: "#A855F7",
    idleBorder: "border-[#A855F7] text-[#7E22CE] bg-white hover:bg-purple-50/50",
    activeBg: "bg-[#9333EA] text-white",
    activeBorder: "border-[#581C87]",
    activeGlow: "shadow-[0_0_18px_rgba(147,51,234,0.45)] ring-4 ring-purple-200",
  },
  {
    level: 7,
    sizeClass: "w-14 h-14 sm:w-16 sm:h-16",
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    themeColor: "#8B5CF6",
    idleBorder: "border-[#8B5CF6] text-[#6D28D9] bg-white hover:bg-purple-50/50",
    activeBg: "bg-[#7C3AED] text-white",
    activeBorder: "border-[#4C1D95]",
    activeGlow: "shadow-[0_0_20px_rgba(124,58,237,0.45)] ring-4 ring-purple-200",
  },
];

export function Scale16p({
  value,
  onChange,
  language,
}: Scale16pProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeLevel = hovered ?? value;
  const currentStep = SCALE_STEPS.find((s) => s.level === activeLevel);

  return (
    <div className="w-full space-y-4 select-none">
      {/* 16Personalities-Style Horizontal Track matching Pic 1 */}
      <div className="relative py-4">
        {/* Baseline Horizon Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-200 rounded-full z-0" />

        {/* Scaled Circles Container */}
        <div className="relative z-10 flex items-center justify-between px-1 sm:px-4">
          {/* Left Agree Stacked Label */}
          <div className="flex flex-col items-start leading-tight pr-2 sm:pr-4 select-none">
            <span className="text-sm sm:text-base font-black text-[#10B981] tracking-wide">
              {language === "km" ? "យល់" : "Agree"}
            </span>
            <span className="text-sm sm:text-base font-black text-[#10B981] tracking-wide">
              {language === "km" ? "ស្រប" : ""}
            </span>
          </div>

          {/* The 7 Scaled Circles with Exact Faces from Pic 1 */}
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
                      ? `${step.activeBg} ${step.activeBorder} ${step.activeGlow} scale-112 shadow-lg`
                      : isHovered
                      ? `${step.idleBorder} scale-108 shadow-md`
                      : `${step.idleBorder} shadow-2xs`
                  }`}
                  title={`${step.labelEn} (Level ${step.level})`}
                  aria-label={`${step.labelEn}`}
                >
                  {/* Micro-Face SVG inside matching Pic 1 exactly */}
                  {renderPic1Face(step.level, isSelected)}
                </button>
              );
            })}
          </div>

          {/* Right Disagree Stacked Label */}
          <div className="flex flex-col items-end leading-tight pl-2 sm:pl-4 select-none">
            <span className="text-sm sm:text-base font-black text-[#8B5CF6] tracking-wide">
              {language === "km" ? "មិនយល់" : "Disagree"}
            </span>
            <span className="text-sm sm:text-base font-black text-[#8B5CF6] tracking-wide">
              {language === "km" ? "ស្រប" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Feedback Pill */}
      <div className="h-6 flex items-center justify-center">
        {currentStep ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-[#111965] border border-slate-200 animate-in fade-in duration-150">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentStep.themeColor }}
            />
            <span>{language === "km" ? currentStep.labelKm : currentStep.labelEn}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {language === "km"
              ? "ចុចរង្វង់ដើម្បីជ្រើសរើសកម្រិតយល់ស្រប"
              : "Select your level of agreement"}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Micro-Faces drawn exactly from Pic 1:
 * - 1: Large green circle with arched smile face (^ v ^)
 * - 2: Medium green circle with simple smile (: ))
 * - 3: Small-medium green circle with happy face (white when selected)
 * - 4: Small slate circle with two dots (..)
 * - 5: Small-medium purple circle with flat line (=)
 * - 6: Medium purple circle with gentle frown (: ()
 * - 7: Large purple circle with expressive curve (^ ^)
 */
function renderPic1Face(level: number, isSelected: boolean) {
  const strokeColor = isSelected ? "#FFFFFF" : "currentColor";
  const fillColor = isSelected ? "#FFFFFF" : "currentColor";

  switch (level) {
    case 1:
      // Pic 1 - Circle 1 (Strong Agree): Arched closed eyes ^ ^ and cute smile curve
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <path d="M9 14C10 12 13 12 14 14" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 14C19 12 22 12 23 14" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 18C13.5 22 18.5 22 20 18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 2:
      // Pic 1 - Circle 2 (Agree): Two dot eyes and happy smile (: ))
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
          <circle cx="10" cy="11" r="1.75" fill={fillColor} />
          <circle cx="18" cy="11" r="1.75" fill={fillColor} />
          <path d="M10 16C11.5 19 16.5 19 18 16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // Pic 1 - Circle 3 (Slightly Agree): Selected state in Pic 1 - white face
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5">
          <circle cx="8" cy="10" r="1.5" fill={fillColor} />
          <circle cx="16" cy="10" r="1.5" fill={fillColor} />
          <path d="M9 14C10 16 14 16 15 14" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 4:
      // Pic 1 - Circle 4 (Neutral): Two horizontal dots (··)
      return (
        <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
          <circle cx="7" cy="10" r="1.5" fill={fillColor} />
          <circle cx="13" cy="10" r="1.5" fill={fillColor} />
        </svg>
      );

    case 5:
      // Pic 1 - Circle 5 (Slightly Disagree): Flat neutral line (=)
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5">
          <line x1="8" y1="11" x2="16" y2="11" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="14" x2="15" y2="14" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Pic 1 - Circle 6 (Disagree): Two dots and gentle downward frown (: ()
      return (
        <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
          <circle cx="10" cy="12" r="1.75" fill={fillColor} />
          <circle cx="18" cy="12" r="1.75" fill={fillColor} />
          <path d="M10 18C11.5 15.5 16.5 15.5 18 18" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // Pic 1 - Circle 7 (Strong Disagree): Inverted expressive curves (^ ^)
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
          <path d="M9 17C10.5 13 14 13 15.5 17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16.5 17C18 13 21.5 13 23 17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
