"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  X,
  ThumbsDown,
  Minus,
  ThumbsUp,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResonanceGaugeProps {
  value?: number; // 1 to 5
  onChange: (value: number) => void;
  language?: "en" | "km";
}

const RESONANCE_STEPS = [
  {
    level: 1,
    icon: ThumbsDown,
    labelEn: "Strongly Dislike",
    labelKm: "មិនត្រូវទាល់តែសោះ",
    descEn: "Completely outside my natural interests",
    descKm: "មិនស្របនឹងចំណូលចិត្តខ្ញុំទាល់តែសោះ",
    idleText: "text-rose-500",
    idleBg: "bg-rose-50",
    idleBorder: "border-rose-100",
    activeBg: "bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200",
    activeCard: "bg-rose-50/50 border-rose-300 ring-1 ring-rose-200",
    badgeColor: "bg-rose-500 text-white",
  },
  {
    level: 2,
    icon: Minus,
    labelEn: "Dislike",
    labelKm: "មិនសូវចូលចិត្ត",
    descEn: "Would rather focus on other tasks",
    descKm: "ចូលចិត្តចំណាយពេលលើកិច្ចការផ្សេងជាង",
    idleText: "text-amber-500",
    idleBg: "bg-amber-50",
    idleBorder: "border-amber-100",
    activeBg: "bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-200",
    activeCard: "bg-amber-50/50 border-amber-300 ring-1 ring-amber-200",
    badgeColor: "bg-amber-500 text-white",
  },
  {
    level: 3,
    icon: X,
    isNeutral: true,
    labelEn: "Neutral",
    labelKm: "កម្រិតមធ្យម",
    descEn: "Open-minded, neither drawn nor opposed",
    descKm: "អាចធ្វើបានធម្មតា មិនសូវរើសអើង",
    idleText: "text-slate-500",
    idleBg: "bg-slate-100",
    idleBorder: "border-slate-200",
    activeBg: "bg-gradient-to-br from-slate-600 to-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-200",
    activeCard: "bg-slate-100/60 border-slate-300 ring-1 ring-slate-200",
    badgeColor: "bg-slate-600 text-white",
  },
  {
    level: 4,
    icon: ThumbsUp,
    labelEn: "Like",
    labelKm: "ចូលចិត្ត",
    descEn: "Brings energy and genuine interest",
    descKm: "មានចំណាប់អារម្មណ៍ និងផ្តល់ថាមពល",
    idleText: "text-emerald-500",
    idleBg: "bg-emerald-50",
    idleBorder: "border-emerald-100",
    activeBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200",
    activeCard: "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200",
    badgeColor: "bg-emerald-500 text-white",
  },
  {
    level: 5,
    icon: Sparkles,
    labelEn: "Love it!",
    labelKm: "ស្រឡាញ់ខ្លាំង!",
    descEn: "Deep intrinsic passion & strength",
    descKm: "ចំណង់ចំណូលចិត្តកំពូល & ទេពកោសល្យ",
    idleText: "text-[#1B6EF3]",
    idleBg: "bg-[#EBF3FE]",
    idleBorder: "border-blue-100",
    activeBg: "bg-gradient-to-br from-[#1B6EF3] to-[#1557C0] text-white border-[#1B6EF3] shadow-md ring-2 ring-blue-300",
    activeCard: "bg-[#EBF3FE]/70 border-[#1B6EF3] ring-1 ring-blue-200",
    badgeColor: "bg-[#1B6EF3] text-white",
  },
];

export function ResonanceGauge({ value, onChange }: ResonanceGaugeProps) {
  const { getLocalized } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full pt-1">
      {/* 5 Distinct Tactile Option Cards in a Clean Responsive Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {RESONANCE_STEPS.map((step) => {
          const isSelected = value === step.level;
          const isHovered = hovered === step.level;
          const IconComponent = step.icon;

          return (
            <button
              key={step.level}
              type="button"
              onClick={() => onChange(step.level)}
              onMouseEnter={() => setHovered(step.level)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "relative rounded-2xl p-2 sm:p-3 border transition-all duration-200 flex flex-col items-center justify-between text-center select-none cursor-pointer group min-h-[82px] sm:min-h-[96px]",
                isSelected
                  ? `${step.activeCard} shadow-xs scale-[1.02]`
                  : isHovered
                  ? "bg-white border-slate-300 shadow-xs -translate-y-0.5"
                  : "bg-[#F8FAFC] border-slate-200/80 hover:bg-white"
              )}
            >
              {/* Top: Icon Bubble with Level Number */}
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 relative flex-shrink-0",
                  isSelected
                    ? step.activeBg
                    : cn(
                        step.idleBg,
                        step.idleText,
                        "border",
                        step.idleBorder,
                        "group-hover:scale-110"
                      )
                )}
              >
                {step.isNeutral ? (
                  <span className="text-xs sm:text-sm font-black leading-none">3</span>
                ) : (
                  <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white text-[#111965] border border-slate-200 flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Bottom: Khmer Label & Level indicator */}
              <div className="space-y-0.5 w-full pt-1.5">
                <div
                  className={cn(
                    "text-[12.5px] sm:text-xs font-bold leading-tight truncate transition-colors",
                    isSelected
                      ? "text-[#111965] font-black"
                      : "text-slate-600 group-hover:text-slate-900"
                  )}
                >
                  {getLocalized({ km: step.labelKm, en: step.labelEn })}
                </div>

                <div
                  className={cn(
                    "text-[12px] font-semibold transition-colors hidden sm:block",
                    isSelected ? "text-slate-500 font-bold" : "text-slate-400"
                  )}
                >
                  Level {step.level}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
