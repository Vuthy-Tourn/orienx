"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface Scale16pProps {
  value: number | null; // 1 to 7 (1: Strong Agree ... 4: Neutral ... 7: Strong Disagree)
  onChange: (value: number) => void;
  language?: "en" | "km";
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
  agreeLabelEn = "Agree",
  agreeLabelKm = "យល់ស្រប",
  disagreeLabelEn = "Disagree",
  disagreeLabelKm = "មិនយល់ស្រប",
}: Scale16pProps) {
  const { t, getLocalized } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const currentValueRef = useRef<number | null>(value);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // Scrollable / Wheel interaction to select options on the bar
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    let lastWheelTime = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 130) {
        e.preventDefault();
        return;
      }
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 8) return;

      e.preventDefault();
      lastWheelTime = now;

      const curr = currentValueRef.current ?? 4;
      if (delta > 0 && curr < 7) {
        onChange(curr + 1);
        setHovered(curr + 1);
      } else if (delta < 0 && curr > 1) {
        onChange(curr - 1);
        setHovered(curr - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [onChange]);

  // Calculate corresponding option level (1 to 7) from clientX across 7 even columns (matching each card)
  const getLevelFromClientX = useCallback((clientX: number): number => {
    if (!trackRef.current) return 4;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 4;
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = clampedX / rect.width; // 0.0 to 1.0
    const col = Math.min(6, Math.max(0, Math.floor(ratio * 7)));
    return col + 1; // 1 to 7
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    const newLevel = getLevelFromClientX(e.clientX);
    onChange(newLevel);
    setHovered(newLevel);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const newLevel = getLevelFromClientX(e.clientX);
    if (isDragging) {
      if (newLevel !== value) {
        onChange(newLevel);
      }
      setHovered(newLevel);
    } else {
      setHovered(newLevel);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHovered(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const curr = value ?? 4;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      if (curr > 1) onChange(curr - 1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      if (curr < 7) onChange(curr + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(7);
    }
  };

  const activeLevel = hovered ?? value;
  const currentStep = SCALE_STEPS.find((s) => s.level === activeLevel);
  const selectedStep = SCALE_STEPS.find((s) => s.level === value);
  const thumbLevel = activeLevel ?? 4;
  const thumbStep = currentStep ?? SCALE_STEPS[3];
  // Calculate position: ((thumbLevel - 0.5) / 7) aligns 100% directly below the middle of Card (thumbLevel):
  const thumbPercent = ((thumbLevel - 0.5) / 7) * 100;

  return (
    <div className="w-full space-y-6 select-none py-1">
      {/* 1. Top Header Labels (Clean Agree / Disagree without +Positive / -Negative) */}
      <div className="flex items-center justify-between px-2 sm:px-6">
        {/* Agree Label (Left) */}
        <button
          type="button"
          className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
          onClick={() => onChange(1)}
        >
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0284C7]" />
          </span>
          <span className="text-sm sm:text-base font-black text-sky-800 tracking-tight">
            {getLocalized({ km: agreeLabelKm, en: agreeLabelEn })}
          </span>
        </button>

        {/* Disagree Label (Right) */}
        <button
          type="button"
          className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
          onClick={() => onChange(7)}
        >
          <span className="text-sm sm:text-base font-black text-rose-800 tracking-tight">
            {getLocalized({ km: disagreeLabelKm, en: disagreeLabelEn })}
          </span>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC2626]" />
          </span>
        </button>
      </div>

      {/* 2. Row of 7 Uniform Squircle Emotion Cards */}
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
                title={getLocalized({ km: step.labelKm, en: step.labelEn })}
                aria-label={getLocalized({ km: step.labelKm, en: step.labelEn })}
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

      {/* 3. Interactive Spectrum Slider Rail (Scrollable, Draggable & Clickable) */}
      <div
        ref={railRef}
        className="relative max-w-xl mx-auto px-2 sm:px-4 pt-1.5 group outline-none"
        tabIndex={0}
        role="slider"
        aria-label="Agreement Scale"
        aria-valuemin={1}
        aria-valuemax={7}
        aria-valuenow={value ?? 4}
        aria-valuetext={
          currentStep
            ? getLocalized({ km: currentStep.labelKm, en: currentStep.labelEn })
            : undefined
        }
        onKeyDown={handleKeyDown}
      >
        {/* Track container matching the cards row */}
        <div
          ref={trackRef}
          className="relative h-7 flex items-center cursor-pointer touch-none select-none py-2"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {/* Continuous gradient spectrum bar starting at Card 1 edge and ending at Card 7 edge */}
          <div
            className="absolute h-2.5 sm:h-3 rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.15)] border border-black/5"
            style={{
              left: "calc(100% / 14 - 11px)",
              right: "calc(100% / 14 - 11px)",
              background:
                "linear-gradient(to right, #2787B9 0%, #6CAED7 20%, #C4A999 40%, #F69649 55%, #F87F4D 75%, #DC2626 100%)",
            }}
          />

          {/* Refined Slider Knob (Directly below the middle of each active card; scrolls right to the bar edges) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 ease-out z-20"
            style={{
              left: `${thumbPercent}%`,
            }}
          >
            <div
              className={cn(
                "w-5.5 h-5.5 sm:w-5.5 sm:h-5.5 rounded-full bg-white flex items-center justify-center transition-all duration-150",
                isDragging ? "scale-115" : "scale-100",
                value === null && !isDragging && "opacity-80"
              )}
              style={{
                boxShadow: isDragging
                  ? `0 0 0 3px ${thumbStep.themeColor}40, 0 2px 6px rgba(0,0,0,0.22)`
                  : "0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
              }}
            >
              {/* Inner vibrant colored core */}
              <div
                className="w-2.5 h-2.5 rounded-full transition-colors duration-150 shadow-inner"
                style={{
                  backgroundColor: thumbStep.themeColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Feedback Text */}
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
              {getLocalized({ km: currentStep.labelKm, en: currentStep.labelEn })}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center text-xs font-semibold text-slate-400">
            <span>
              {t("scale16p.chooseOption")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 7 Expressive Tara Mascot Faces (OrienX's Official Platform Buddy):
 * 1. Strongly Agree (Sky Blue): Joyful laughing eyes, big happy smile, rosy cheeks & sparkle star
 * 2. Agree (Mint): Warm cheerful shining eyes, open curved smile & rosy cheeks
 * 3. Slightly Agree (Lime): Polite gentle smile, bright calm eyes & rosy cheeks
 * 4. Neutral (Yellow): Calm straight mouth, attentive observant eyes & soft blush
 * 5. Slightly Disagree (Orange): Tara's iconic grumpy side-eye glance, tilted pout & soft blush
 * 6. Disagree (Coral): Sad drooping eyebrows, downturned mouth & gentle blush
 * 7. Strongly Disagree (Crimson): Distressed eyebrows, open weeping mouth & teardrops streaming down rosy cheeks
 */
function renderEmotionFace(level: number, isSelected: boolean, themeColor: string) {
  // When selected: crisp white strokes/fills on top of vibrant gradient background; When idle: themeColor
  const stroke = isSelected ? "#FFFFFF" : themeColor;
  const fill = isSelected ? "#FFFFFF" : themeColor;
  const highlight = isSelected ? themeColor : "#FFFFFF";
  const blushFill = isSelected ? "#FFFFFF" : themeColor;
  const blushOpacity = isSelected ? 0.38 : 0.26;

  // Common rosy cheeks present on all Tara faces for signature mascot cuteness
  const rosyCheeks = (
    <>
      <ellipse cx="27" cy="52" rx="8" ry="5" fill={blushFill} fillOpacity={blushOpacity} />
      <ellipse cx="73" cy="52" rx="8" ry="5" fill={blushFill} fillOpacity={blushOpacity} />
    </>
  );

  switch (level) {
    case 1:
      // Level 1: Strongly Agree (Sky Blue) - Laughing eyes, open joyful mouth, sparkle star
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          {/* Laughing curved eye arches */}
          <path d="M 26 42 C 31 31, 41 31, 46 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54 42 C 59 31, 69 31, 74 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          {/* Big happy open mouth */}
          <path d="M 38 52 Q 50 72 62 52 Z" fill={fill} stroke={stroke} strokeWidth="2.5" />
          {/* Sparkle star at top right */}
          <path d="M 82 18 Q 82 23 87 23 Q 82 23 82 28 Q 82 23 77 23 Q 82 23 82 18 Z" fill={fill} />
        </svg>
      );

    case 2:
      // Level 2: Agree (Mint) - Cheerful round shining eyes, warm open smile
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <ellipse cx="34" cy="42" rx="6.8" ry="8.6" fill={fill} />
          <circle cx="31.5" cy="38.5" r="2.5" fill={highlight} />
          <ellipse cx="66" cy="42" rx="6.8" ry="8.6" fill={fill} />
          <circle cx="63.5" cy="38.5" r="2.5" fill={highlight} />
          <path d="M 39 53 Q 50 67 61 53" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // Level 3: Slightly Agree (Lime) - Bright calm eyes, gentle friendly smile
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <ellipse cx="34" cy="43" rx="6.2" ry="7.8" fill={fill} />
          <circle cx="32" cy="40" r="2.2" fill={highlight} />
          <ellipse cx="66" cy="43" rx="6.2" ry="7.8" fill={fill} />
          <circle cx="64" cy="40" r="2.2" fill={highlight} />
          <path d="M 40 55 Q 50 64 60 55" stroke={stroke} strokeWidth="3.6" strokeLinecap="round" />
        </svg>
      );

    case 4:
      // Level 4: Neutral (Yellow) - Observant eyes, calm straight mouth line
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <ellipse cx="34" cy="43" rx="6" ry="7.5" fill={fill} />
          <circle cx="32" cy="40.5" r="2" fill={highlight} />
          <ellipse cx="66" cy="43" rx="6.2" ry="7.5" fill={fill} />
          <circle cx="64" cy="40.5" r="2" fill={highlight} />
          <line x1="41" y1="57" x2="59" y2="57" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
        </svg>
      );

    case 5:
      // Level 5: Slightly Disagree (Orange) - Tara's iconic grumpy side-eye & doubtful tilted pout
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          {/* Eyebrows */}
          <path d="M 28 32 Q 35 31 41 33" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M 59 33 Q 65 31 72 32" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          {/* Half-lidded side-glancing eyes */}
          <path d="M 27 42 Q 34 39 42 42 C 42 50, 27 50, 27 42 Z" fill={fill} />
          <circle cx="31" cy="44.5" r="2" fill={highlight} />
          <path d="M 58 42 Q 66 39 73 42 C 73 50, 58 50, 58 42 Z" fill={fill} />
          <circle cx="62" cy="44.5" r="2" fill={highlight} />
          {/* Slightly tilted pout */}
          <path d="M 41 58 Q 48 55 56 57" stroke={stroke} strokeWidth="3.6" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Level 6: Disagree (Coral) - Sad drooping eyebrows, downturned mouth
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          {/* Sad drooping eyebrows */}
          <path d="M 27 31 C 32 34, 38 37, 42 38" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 73 31 C 68 34, 62 37, 58 38" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="34" cy="45" rx="6.2" ry="7.6" fill={fill} />
          <circle cx="32" cy="42.5" r="2" fill={highlight} />
          <ellipse cx="66" cy="45" rx="6.2" ry="7.6" fill={fill} />
          <circle cx="64" cy="42.5" r="2" fill={highlight} />
          {/* Downturned sad mouth */}
          <path d="M 40 61 Q 50 53 60 61" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // Level 7: Strongly Disagree (Crimson) - Distressed weeping face with teardrops streaming down
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          {/* Distressed furrowed eyebrows */}
          <path d="M 26 30 C 32 34, 38 38, 42 40" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 74 30 C 68 34, 62 38, 58 40" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" />
          <ellipse cx="34" cy="44" rx="6.5" ry="7.8" fill={fill} />
          <circle cx="32" cy="41.5" r="2" fill={highlight} />
          <ellipse cx="66" cy="44" rx="6.5" ry="7.8" fill={fill} />
          <circle cx="64" cy="41.5" r="2" fill={highlight} />
          {/* Open crying mouth */}
          <path d="M 39 65 Q 50 54 61 65 Z" fill={fill} stroke={stroke} strokeWidth="2.4" />
          {/* Teardrops streaming down cheeks */}
          <path d="M 25 50 C 25 45, 30 45, 30 50 C 30 55, 25 55, 25 50 Z" fill={fill} />
          <path d="M 70 50 C 70 45, 75 45, 75 50 C 75 55, 70 55, 70 50 Z" fill={fill} />
        </svg>
      );

    default:
      return null;
  }
}
