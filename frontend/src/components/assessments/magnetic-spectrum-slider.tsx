"use client";

import React, { useState } from "react";
import { ArchetypeGlyph } from "@/components/assessments/archetype-glyph";
import { CheckCircle2, Sparkles, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface OptionData {
  id: string;
  label_en: string;
  label_km: string;
  target_trait: string;
}

interface MagneticSpectrumSliderProps {
  optionA: OptionData;
  optionB: OptionData;
  value: number | null; // 1 to 5 (1: Def A, 2: Lean A, 3: Pivot, 4: Lean B, 5: Def B)
  onChange: (value: number, selectedOptionId: string) => void;
  language?: "en" | "km";
}

const TRAIT_METADATA: Record<
  string,
  {
    archetypeEn: string;
    archetypeKm: string;
    auraGradient: string;
  }
> = {
  E: {
    archetypeEn: "Outward Social Beacon",
    archetypeKm: "កិច្ចសហការ និងថាមពលខាងក្រៅ",
    auraGradient: "from-blue-600/15 via-blue-500/5 to-transparent",
  },
  I: {
    archetypeEn: "Deep Focus Sanctuary",
    archetypeKm: "ការផ្តោតអារម្មណ៍ស៊ីជម្រៅម្នាក់ឯង",
    auraGradient: "from-indigo-900/15 via-indigo-600/5 to-transparent",
  },
  S: {
    archetypeEn: "Empirical Reality & Facts",
    archetypeKm: "ការពិត និងការអនុវត្តជាក់ស្តែង",
    auraGradient: "from-amber-500/15 via-amber-400/5 to-transparent",
  },
  N: {
    archetypeEn: "Cosmic Future Vision",
    archetypeKm: "ទ្រឹស្តី និងទស្សនវិស័យអនាគត",
    auraGradient: "from-purple-600/15 via-purple-500/5 to-transparent",
  },
  T: {
    archetypeEn: "Objective Logic & Principles",
    archetypeKm: "តក្កវិជ្ជា និងគោលការណ៍សុក្រឹត",
    auraGradient: "from-emerald-600/15 via-emerald-500/5 to-transparent",
  },
  F: {
    archetypeEn: "Human Empathy & Values",
    archetypeKm: "តម្លៃមនុស្សធម៌ និងការយល់ចិត្ត",
    auraGradient: "from-rose-500/15 via-rose-400/5 to-transparent",
  },
  J: {
    archetypeEn: "Structured Milestone Plan",
    archetypeKm: "កាលវិភាគ និងផែនការច្បាស់លាស់",
    auraGradient: "from-indigo-600/15 via-blue-500/5 to-transparent",
  },
  P: {
    archetypeEn: "Adaptive Spontaneous Flow",
    archetypeKm: "ភាពបត់បែនតាមកាលៈទេសៈជាក់ស្តែង",
    auraGradient: "from-orange-500/15 via-amber-400/5 to-transparent",
  },
};

const SNAP_STANCES = [
  {
    pos: 1,
    weight: "100% Left",
    bias: "left",
    labelEn: "Strongly Resonates with Left",
    labelKm: "ត្រូវគ្នាយ៉ាងខ្លាំងជាមួយជម្រើសឆ្វេង",
  },
  {
    pos: 2,
    weight: "75% Left",
    bias: "left",
    labelEn: "Slightly Leans Left",
    labelKm: "លំអៀងបន្តិចទៅជម្រើសឆ្វេង",
  },
  {
    pos: 3,
    weight: "50 / 50 Balance",
    bias: "center",
    labelEn: "Balanced Equilibrium (Both)",
    labelKm: "តុល្យភាពស្មើគ្នា (ទាំងសងខាង)",
  },
  {
    pos: 4,
    weight: "75% Right",
    bias: "right",
    labelEn: "Slightly Leans Right",
    labelKm: "លំអៀងបន្តិចទៅជម្រើសស្តាំ",
  },
  {
    pos: 5,
    weight: "100% Right",
    bias: "right",
    labelEn: "Strongly Resonates with Right",
    labelKm: "ត្រូវគ្នាយ៉ាងខ្លាំងជាមួយជម្រើសស្តាំ",
  },
];

export function MagneticSpectrumSlider({
  optionA,
  optionB,
  value,
  onChange,
}: MagneticSpectrumSliderProps) {
  const { t, getLocalized } = useLanguage();
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  const activePos = hoveredPos ?? value ?? 3;
  const isSelected = value !== null;

  const metaA = TRAIT_METADATA[optionA.target_trait] || {
    archetypeEn: "Stance A",
    archetypeKm: "ជម្រើស A",
    auraGradient: "from-blue-500/10 to-transparent",
  };

  const metaB = TRAIT_METADATA[optionB.target_trait] || {
    archetypeEn: "Stance B",
    archetypeKm: "ជម្រើស B",
    auraGradient: "from-purple-500/10 to-transparent",
  };

  const handleSnap = (pos: number) => {
    // Determine which option id to record
    let chosenId = optionA.id;
    if (pos >= 4) {
      chosenId = optionB.id;
    } else if (pos <= 2) {
      chosenId = optionA.id;
    } else {
      // At position 3 (balanced): default to optionA or preserve existing
      chosenId = value && value >= 4 ? optionB.id : optionA.id;
    }
    onChange(pos, chosenId);
  };

  // Percentage for needle position: 1 -> 0%, 2 -> 25%, 3 -> 50%, 4 -> 75%, 5 -> 100%
  const needlePercent = ((activePos - 1) / 4) * 100;

  // Stance intensity states
  const leftIntensity =
    value === 1
      ? "peak"
      : value === 2
      ? "lean"
      : value === 3
      ? "balanced"
      : value === 4
      ? "dim"
      : value === 5
      ? "fade"
      : "neutral";

  const rightIntensity =
    value === 5
      ? "peak"
      : value === 4
      ? "lean"
      : value === 3
      ? "balanced"
      : value === 2
      ? "dim"
      : value === 1
      ? "fade"
      : "neutral";

  return (
    <div className="w-full space-y-8 select-none">
      {/* ===================================================================
          1. DYNAMIC FLOATING STANCE SHIELDS (Left vs Right)
          =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* LEFT SHIELD (Option A) */}
        <div
          onClick={() => handleSnap(1)}
          className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-4 ${
            leftIntensity === "peak"
              ? "border-[#111965] bg-gradient-to-br from-white via-[#F0F2FA] to-[#FFF9E6] shadow-xl ring-4 ring-[#F7CE4D]/70 scale-[1.02]"
              : leftIntensity === "lean"
              ? "border-[#111965]/80 bg-white shadow-md ring-2 ring-[#111965]/15 scale-[1.01]"
              : leftIntensity === "fade"
              ? "border-[#E6E8F0] bg-slate-50/60 opacity-40 grayscale-[40%] scale-[0.98]"
              : leftIntensity === "dim"
              ? "border-[#E6E8F0] bg-white opacity-60 scale-[0.99]"
              : "border-[#E6E8F0] bg-white hover:border-slate-300 shadow-2xs hover:shadow-sm"
          }`}
        >
          {/* Background Ambient Gravity Aura */}
          {leftIntensity === "peak" && (
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#111965]/10 rounded-full blur-2xl pointer-events-none" />
          )}

          {/* Header Row with Archetype Glyph */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  leftIntensity === "peak"
                    ? "bg-[#111965] text-[#F7CE4D] shadow-md shadow-[#111965]/30 scale-105"
                    : leftIntensity === "lean"
                    ? "bg-[#111965]/90 text-[#F7CE4D]"
                    : "bg-[#F0F2FA] text-[#111965]"
                }`}
              >
                <ArchetypeGlyph
                  trait={optionA.target_trait}
                  className="w-7 h-7"
                  isSelected={leftIntensity === "peak" || leftIntensity === "lean"}
                />
              </div>

              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#68708A]">
                  Trait {optionA.target_trait} Pole
                </span>
                <span className="block text-sm font-bold text-[#111965]">
                  {getLocalized({ km: metaA.archetypeKm, en: metaA.archetypeEn })}
                </span>
              </div>
            </div>

            {/* Gravity Pull Badge */}
            {leftIntensity === "peak" && (
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#F7CE4D] text-[#111965] shadow-xs flex items-center gap-1 animate-in zoom-in-95">
                <Sparkles className="w-3 h-3 text-[#111965]" />
                <span>{t("magneticSpectrum.dominant")}</span>
              </span>
            )}
            {leftIntensity === "lean" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965] border border-[#111965]/20">
                <span>{t("magneticSpectrum.lean")}</span>
              </span>
            )}
          </div>

          {/* Narrative Content */}
          <div className="z-10 pt-1">
            <p className="text-sm sm:text-base font-semibold text-[#171A2C] leading-relaxed">
              {getLocalized({ km: optionA.label_km, en: optionA.label_en })}
            </p>
          </div>

          {/* Click to Gravitate Hint */}
          <div className="z-10 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#68708A]">
            <span className="text-[11px] font-medium">
              {t("magneticSpectrum.clickToPull")}
            </span>
            <span className="text-xs font-bold text-[#111965]">Pole A ◄</span>
          </div>
        </div>

        {/* RIGHT SHIELD (Option B) */}
        <div
          onClick={() => handleSnap(5)}
          className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-4 ${
            rightIntensity === "peak"
              ? "border-[#111965] bg-gradient-to-br from-white via-[#F0F2FA] to-[#FFF9E6] shadow-xl ring-4 ring-[#F7CE4D]/70 scale-[1.02]"
              : rightIntensity === "lean"
              ? "border-[#111965]/80 bg-white shadow-md ring-2 ring-[#111965]/15 scale-[1.01]"
              : rightIntensity === "fade"
              ? "border-[#E6E8F0] bg-slate-50/60 opacity-40 grayscale-[40%] scale-[0.98]"
              : rightIntensity === "dim"
              ? "border-[#E6E8F0] bg-white opacity-60 scale-[0.99]"
              : "border-[#E6E8F0] bg-white hover:border-slate-300 shadow-2xs hover:shadow-sm"
          }`}
        >
          {/* Background Ambient Gravity Aura */}
          {rightIntensity === "peak" && (
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#111965]/10 rounded-full blur-2xl pointer-events-none" />
          )}

          {/* Header Row with Archetype Glyph */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  rightIntensity === "peak"
                    ? "bg-[#111965] text-[#F7CE4D] shadow-md shadow-[#111965]/30 scale-105"
                    : rightIntensity === "lean"
                    ? "bg-[#111965]/90 text-[#F7CE4D]"
                    : "bg-[#F0F2FA] text-[#111965]"
                }`}
              >
                <ArchetypeGlyph
                  trait={optionB.target_trait}
                  className="w-7 h-7"
                  isSelected={rightIntensity === "peak" || rightIntensity === "lean"}
                />
              </div>

              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#68708A]">
                  Trait {optionB.target_trait} Pole
                </span>
                <span className="block text-sm font-bold text-[#111965]">
                  {getLocalized({ km: metaB.archetypeKm, en: metaB.archetypeEn })}
                </span>
              </div>
            </div>

            {/* Gravity Pull Badge */}
            {rightIntensity === "peak" && (
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#F7CE4D] text-[#111965] shadow-xs flex items-center gap-1 animate-in zoom-in-95">
                <Sparkles className="w-3 h-3 text-[#111965]" />
                <span>{t("magneticSpectrum.dominant")}</span>
              </span>
            )}
            {rightIntensity === "lean" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965] border border-[#111965]/20">
                <span>{t("magneticSpectrum.lean")}</span>
              </span>
            )}
          </div>

          {/* Narrative Content */}
          <div className="z-10 pt-1">
            <p className="text-sm sm:text-base font-semibold text-[#171A2C] leading-relaxed">
              {getLocalized({ km: optionB.label_km, en: optionB.label_en })}
            </p>
          </div>

          {/* Click to Gravitate Hint */}
          <div className="z-10 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#68708A]">
            <span className="text-xs font-bold text-[#111965]">► Pole B</span>
            <span className="text-[11px] font-medium">
              {t("magneticSpectrum.clickToPull")}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. PRECISION MAGNETIC SPECTRUM GAUGE
          =================================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] shadow-md space-y-6">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#111965]" />
            <span className="font-extrabold text-[#111965] uppercase tracking-wider text-[11px]">
              {t("magneticSpectrum.spectrumTitle")}
            </span>
          </div>

          <span className="text-[11px] font-bold text-[#68708A]">
            {t("magneticSpectrum.tapAnchor")}
          </span>
        </div>

        {/* The Track with Floating Needle */}
        <div className="relative pt-6 pb-2 px-3 sm:px-6">
          {/* Continuous Baseline Track */}
          <div className="absolute top-[38px] left-6 right-6 h-2 rounded-full bg-slate-200 overflow-hidden">
            {/* Dynamic Energy Beam that stretches from center to active needle position */}
            {value && (
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  value < 3
                    ? "bg-gradient-to-r from-[#111965] to-blue-400"
                    : value > 3
                    ? "bg-gradient-to-r from-blue-400 to-[#F7CE4D]"
                    : "bg-[#111965]"
                }`}
                style={{
                  width: `${needlePercent}%`,
                }}
              />
            )}
          </div>

          {/* 5 Tactile Magnetic Snap Anchor Nodes */}
          <div className="relative z-10 flex items-center justify-between">
            {SNAP_STANCES.map((step) => {
              const isAnchorActive = activePos === step.pos;
              const isAnchorSelected = value === step.pos;

              return (
                <div
                  key={step.pos}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => handleSnap(step.pos)}
                  onMouseEnter={() => setHoveredPos(step.pos)}
                  onMouseLeave={() => setHoveredPos(null)}
                >
                  {/* Floating Magnetic Node */}
                  <div
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                      isAnchorSelected
                        ? "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D] ring-4 ring-[#F7CE4D]/30 scale-125 shadow-md"
                        : isAnchorActive
                        ? "bg-white text-[#111965] border-[#111965] scale-110 shadow-sm"
                        : "bg-white text-slate-400 border-slate-300 group-hover:border-slate-400"
                    }`}
                  >
                    {step.pos === 3 ? (
                      // Equilibrium Center Diamond
                      <span className="text-xs font-bold">◇</span>
                    ) : step.pos === 1 || step.pos === 5 ? (
                      // Polar Anchors
                      <span className="text-[11px] font-black">
                        {step.pos === 1 ? "◄" : "►"}
                      </span>
                    ) : (
                      // Intermediate Leaning Ticks
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Step Descriptor Label */}
                  <span
                    className={`mt-3 text-[10px] font-bold transition-colors hidden sm:block ${
                      isAnchorSelected
                        ? "text-[#111965]"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    {step.weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Contextual Feedback Banner */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isSelected
              ? "bg-[#FFF9E6] border-[#F7CE4D]/60 text-[#111965]"
              : "bg-[#F5F6FA] border-[#E6E8F0] text-slate-500"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                isSelected ? "bg-[#111965] text-[#F7CE4D]" : "bg-slate-200 text-slate-600"
              }`}
            >
              {isSelected ? "✓" : "?"}
            </div>

            <div>
              <span className="block text-xs font-extrabold text-[#111965]">
                {isSelected
                  ? getLocalized({ km: SNAP_STANCES[value - 1]?.labelKm, en: SNAP_STANCES[value - 1]?.labelEn })
                  : t("magneticSpectrum.positionNeedle")}
              </span>
              <span className="block text-[11px] text-[#68708A]">
                {isSelected
                  ? value === 1
                    ? `${t("magneticSpectrum.stronglyAligned")} ${getLocalized({ km: optionA.label_km, en: optionA.label_en })}`
                    : value === 2
                    ? `${t("magneticSpectrum.moderateLean")} ${getLocalized({ km: optionA.label_km, en: optionA.label_en })}`
                    : value === 3
                    ? t("magneticSpectrum.balanced")
                    : value === 4
                    ? `${t("magneticSpectrum.moderateLean")} ${getLocalized({ km: optionB.label_km, en: optionB.label_en })}`
                    : `${t("magneticSpectrum.stronglyAligned")} ${getLocalized({ km: optionB.label_km, en: optionB.label_en })}`
                  : t("magneticSpectrum.choosePoint")}
              </span>
            </div>
          </div>

          {isSelected && (
            <span className="px-3 py-1 rounded-xl font-extrabold text-xs bg-white text-[#111965] border border-amber-300 shadow-2xs whitespace-nowrap self-end sm:self-auto">
              {SNAP_STANCES[value - 1]?.weight}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

