"use client";

import React, { useState } from "react";

interface ResonanceGaugeProps {
  value?: number; // 1 to 5
  onChange: (value: number) => void;
  language: "en" | "km";
}

const RESONANCE_STEPS = [
  {
    level: 1,
    glyph: "⊘",
    labelEn: "Strong Disconnect",
    labelKm: "មិនត្រូវនឹងខ្ញុំទាល់តែសោះ",
    descEn: "Completely outside my natural interests",
    descKm: "មិនស្របនឹងចំណូលចិត្តរបស់ខ្ញុំទាល់តែសោះ",
    bars: 1,
    color: "from-slate-400 to-rose-400",
    activeBg: "bg-slate-700 text-white border-slate-700 shadow-slate-300",
  },
  {
    level: 2,
    glyph: "❙❙",
    labelEn: "Mild Reluctance",
    labelKm: "មិនសូវចូលចិត្ត",
    descEn: "Would rather focus elsewhere",
    descKm: "ចូលចិត្តចំណាយពេលលើកិច្ចការផ្សេងច្រើនជាង",
    bars: 2,
    color: "from-slate-400 to-slate-500",
    activeBg: "bg-slate-600 text-white border-slate-600 shadow-slate-200",
  },
  {
    level: 3,
    glyph: "◇",
    labelEn: "Balanced Equilibrium",
    labelKm: "កម្រិតមធ្យម / ធម្មតា",
    descEn: "Open-minded, neither drawn nor opposed",
    descKm: "អាចធ្វើបានធម្មតា មិនសូវរើសអើង",
    bars: 3,
    color: "from-slate-300 to-indigo-300",
    activeBg: "bg-[#1E277A] text-white border-[#1E277A] shadow-indigo-200",
  },
  {
    level: 4,
    glyph: "❙❙❙❙",
    labelEn: "Clear Affinity",
    labelKm: "ចូលចិត្ត និងចាប់អារម្មណ៍",
    descEn: "Brings strong energy and genuine engagement",
    descKm: "មានចំណាប់អារម្មណ៍ខ្លាំង និងផ្តល់ថាមពលវិជ្ជមាន",
    bars: 4,
    color: "from-indigo-500 to-[#111965]",
    activeBg: "bg-[#111965] text-white border-[#111965] shadow-blue-200",
  },
  {
    level: 5,
    glyph: "✦",
    labelEn: "Peak Calling",
    labelKm: "ស្រឡាញ់ខ្លាំង និងជាទេពកោសល្យ",
    descEn: "Deep intrinsic passion — I naturally thrive here",
    descKm: "ចំណង់ចំណូលចិត្តកំពូល និងត្រូវនឹងទេពកោសល្យពីកំណើត",
    bars: 5,
    color: "from-[#111965] to-[#F7CE4D]",
    activeBg: "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D] ring-4 ring-[#F7CE4D]/30 shadow-amber-200",
  },
];

export function ResonanceGauge({ value, onChange, language }: ResonanceGaugeProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeStep = RESONANCE_STEPS.find((s) => s.level === (hovered ?? value));

  return (
    <div className="w-full space-y-3 pt-2">
      {/* Precision Instrument Horizon Bar */}
      <div className="relative py-3">
        {/* Continuous Datum Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-200 rounded-full overflow-hidden">
          {/* Active Illuminated Beam */}
          {value && (
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                value <= 2
                  ? "bg-gradient-to-r from-rose-400 to-slate-300"
                  : value === 3
                  ? "bg-indigo-300"
                  : "bg-gradient-to-r from-[#111965] to-[#F7CE4D]"
              }`}
              style={{
                width: `${((value - 1) / 4) * 100}%`,
              }}
            />
          )}
        </div>

        {/* 5 Distinct Resonance Nodes */}
        <div className="relative flex items-center justify-between z-10 px-1 sm:px-3">
          {RESONANCE_STEPS.map((step) => {
            const isSelected = value === step.level;
            const isHovered = hovered === step.level;

            return (
              <div key={step.level} className="flex flex-col items-center group">
                <button
                  type="button"
                  onClick={() => onChange(step.level)}
                  onMouseEnter={() => setHovered(step.level)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative flex items-center justify-center transition-all duration-200 rounded-2xl border-2 ${
                    isSelected
                      ? `${step.activeBg} scale-110 shadow-lg`
                      : isHovered
                      ? "border-[#111965] bg-white text-[#111965] scale-105 shadow-md"
                      : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
                  } ${
                    step.level === 5
                      ? "w-11 h-11 sm:w-12 sm:h-12"
                      : step.level === 1
                      ? "w-10 h-10 sm:w-11 sm:h-11"
                      : "w-9 h-9 sm:w-10 sm:h-10"
                  }`}
                  title={`${step.labelEn} (${step.level})`}
                >
                  {/* Custom Vector Glyphs */}
                  {step.level === 5 ? (
                    // The Futera Compass Star
                    <svg
                      viewBox="0 0 24 24"
                      fill={isSelected ? "#F7CE4D" : "currentColor"}
                      className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
                    >
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  ) : step.level === 3 ? (
                    // Equilibrium Diamond Pivot
                    <svg
                      viewBox="0 0 24 24"
                      fill={isSelected ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="w-4 h-4"
                    >
                      <rect x="12" y="2" width="14" height="14" transform="rotate(45 12 2)" rx="2" />
                    </svg>
                  ) : step.level === 1 ? (
                    // Divergent Anchor
                    <span className="text-sm font-black font-mono">⊘</span>
                  ) : (
                    // Tactile Resonance Equalizer Bars
                    <div className="flex items-end gap-0.5 h-3.5">
                      {Array.from({ length: step.bars }).map((_, barIdx) => (
                        <div
                          key={barIdx}
                          style={{ height: `${((barIdx + 1) / step.bars) * 100}%` }}
                          className={`w-1 rounded-full ${
                            isSelected ? "bg-white" : "bg-slate-400 group-hover:bg-[#111965]"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Level indicator pill floating on top */}
                  {isSelected && (
                    <span className="absolute -top-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#F7CE4D] text-[#111965] border border-white shadow-2xs">
                      {step.level}
                    </span>
                  )}
                </button>

                {/* Sub-label below node */}
                <span
                  className={`mt-2 text-[10px] font-bold transition-colors hidden sm:block ${
                    isSelected ? "text-[#111965]" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {language === "km" ? step.labelKm : step.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tactile Feedback Banner */}
      <div
        className={`px-3.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between border ${
          value
            ? value === 5
              ? "bg-[#FFF9E6] border-[#F7CE4D]/50 text-[#111965]"
              : value === 1
              ? "bg-slate-50 border-slate-200 text-slate-700"
              : "bg-[#F0F2FA] border-[#111965]/15 text-[#111965]"
            : "bg-slate-50 border-dashed border-slate-200 text-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-bold text-xs flex-shrink-0">
            {activeStep ? (language === "km" ? activeStep.labelKm : activeStep.labelEn) : "Select Your Stance"}
          </span>
          <span className="text-[11px] opacity-75 truncate hidden sm:inline">
            — {activeStep ? (language === "km" ? activeStep.descKm : activeStep.descEn) : "Click a point along your resonance spectrum"}
          </span>
        </div>

        {value && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-2xs border border-slate-200 text-[#111965] flex-shrink-0">
            Level {value} / 5
          </span>
        )}
      </div>
    </div>
  );
}

