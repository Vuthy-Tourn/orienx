"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { FuteraMascot } from "@/components/brand/futera-mascot";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Check,
  Save,
  AlertCircle,
  RotateCcw,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AssessmentStepItem {
  id: string;
  promptKm: string;
  promptEn: string;
  statementKm?: string;
  statementEn?: string;
  dimensionCode?: string;
  dimensionNameKm: string;
  dimensionNameEn: string;
  optionA?: {
    labelKm: string;
    labelEn: string;
    trait?: string;
  };
  optionB?: {
    labelKm: string;
    labelEn: string;
    trait?: string;
  };
}

export interface AssessmentStageProps {
  breadcrumbText: string;
  pageTitle: string;
  badgeLabel?: string;
  badgeIcon?: any;
  resultProfileBadge?: {
    label: string;
    icon?: any;
    onClick?: () => void;
  };
  headerAction?: React.ReactNode;
  questions: AssessmentStepItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  answers: Record<string, number | { scaleLevel: number; [key: string]: any }>;
  onAnswer: (questionId: string, level: number) => void;
  scaleType: "5-point" | "7-point";
  leftAnchorKm?: string;
  leftAnchorEn?: string;
  rightAnchorKm?: string;
  rightAnchorEn?: string;
  mascotSpeech: string;
  mascotScaleLevel?: number | null;
  onPrefill: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  onClearDraft?: () => void;
}

// 7-Point Likert Config (Standard 16Personalities Agree Green -> Disagree Purple)
const SCALE_STEPS_7 = [
  {
    level: 1,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    borderClass: "border-[3px] sm:border-4",
    checkSize: "w-6 h-6 sm:w-7 sm:h-7 stroke-[3]",
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/15 hover:border-[#33A474]",
    activeGlow: "shadow-[0_8px_24px_rgba(51,164,116,0.45)] ring-4 ring-[#33A474]/30",
  },
  {
    level: 2,
    sizeClass: "w-9 h-9 sm:w-11 sm:h-11",
    borderClass: "border-[2.5px] sm:border-[3px]",
    checkSize: "w-5 h-5 sm:w-6 sm:h-6 stroke-[3]",
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/15 hover:border-[#33A474]",
    activeGlow: "shadow-[0_6px_20px_rgba(51,164,116,0.4)] ring-4 ring-[#33A474]/30",
  },
  {
    level: 3,
    sizeClass: "w-7.5 h-7.5 sm:w-9 sm:h-9",
    borderClass: "border-2 sm:border-[2.5px]",
    checkSize: "w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]",
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/15 hover:border-[#33A474]",
    activeGlow: "shadow-[0_4px_16px_rgba(51,164,116,0.35)] ring-4 ring-[#33A474]/25",
  },
  {
    level: 4,
    sizeClass: "w-6 h-6 sm:w-7 sm:h-7",
    borderClass: "border-2",
    checkSize: "w-2 h-2 rounded-full bg-white",
    labelEn: "Neutral",
    labelKm: "កណ្តាល",
    side: "neutral",
    themeColor: "#94A3B8",
    borderColor: "border-slate-300",
    bgSelected: "bg-slate-400",
    idleHover: "hover:bg-slate-100 hover:border-slate-400",
    activeGlow: "shadow-[0_4px_12px_rgba(148,163,184,0.4)] ring-4 ring-slate-300/40",
  },
  {
    level: 5,
    sizeClass: "w-7.5 h-7.5 sm:w-9 sm:h-9",
    borderClass: "border-2 sm:border-[2.5px]",
    checkSize: "w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]",
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/15 hover:border-[#88619A]",
    activeGlow: "shadow-[0_4px_16px_rgba(136,97,154,0.35)] ring-4 ring-[#88619A]/25",
  },
  {
    level: 6,
    sizeClass: "w-9 h-9 sm:w-11 sm:h-11",
    borderClass: "border-[2.5px] sm:border-[3px]",
    checkSize: "w-5 h-5 sm:w-6 sm:h-6 stroke-[3]",
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/15 hover:border-[#88619A]",
    activeGlow: "shadow-[0_6px_20px_rgba(136,97,154,0.4)] ring-4 ring-[#88619A]/30",
  },
  {
    level: 7,
    sizeClass: "w-11 h-11 sm:w-13 sm:h-13",
    borderClass: "border-[3px] sm:border-4",
    checkSize: "w-6 h-6 sm:w-7 sm:h-7 stroke-[3]",
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/15 hover:border-[#88619A]",
    activeGlow: "shadow-[0_8px_24px_rgba(136,97,154,0.45)] ring-4 ring-[#88619A]/30",
  },
];

// 5-Point Likert Config (Career Fit / RIASEC)
// Maps 1 to 5: 1 (Strong Disconnect) -> 5 (Peak Passion)
const SCALE_STEPS_5 = [
  {
    level: 1,
    faceIndex: 7,
    labelEn: "Strongly Dislike",
    labelKm: "មិនត្រូវទាល់តែសោះ",
    themeColor: "#DC2626",
    gradientFrom: "#F87171",
    gradientTo: "#DC2626",
    idleBg: "bg-[#F87171]/15 hover:bg-[#F87171]/25",
    idleBorder: "border-[#F87171]/70 hover:border-[#F87171]",
    activeGlow: "shadow-[0_10px_28px_rgba(220,38,38,0.55)] ring-4 ring-rose-300/70",
  },
  {
    level: 2,
    faceIndex: 5,
    labelEn: "Dislike",
    labelKm: "មិនសូវចូលចិត្ត",
    themeColor: "#EA580C",
    gradientFrom: "#FB923C",
    gradientTo: "#EA580C",
    idleBg: "bg-[#FB923C]/15 hover:bg-[#FB923C]/25",
    idleBorder: "border-[#FB923C]/70 hover:border-[#FB923C]",
    activeGlow: "shadow-[0_10px_26px_rgba(234,88,12,0.55)] ring-4 ring-orange-300/70",
  },
  {
    level: 3,
    faceIndex: 4,
    labelEn: "Neutral",
    labelKm: "កម្រិតមធ្យម / ធម្មតា",
    themeColor: "#D97706",
    gradientFrom: "#FACC15",
    gradientTo: "#D97706",
    idleBg: "bg-[#FACC15]/20 hover:bg-[#FACC15]/30",
    idleBorder: "border-[#FACC15]/80 hover:border-[#EAB308]",
    activeGlow: "shadow-[0_10px_26px_rgba(217,119,6,0.55)] ring-4 ring-amber-300/70",
  },
  {
    level: 4,
    faceIndex: 2,
    labelEn: "Like",
    labelKm: "ចូលចិត្ត និងចាប់អារម្មណ៍",
    themeColor: "#059669",
    gradientFrom: "#34D399",
    gradientTo: "#059669",
    idleBg: "bg-[#34D399]/15 hover:bg-[#34D399]/25",
    idleBorder: "border-[#34D399]/70 hover:border-[#34D399]",
    activeGlow: "shadow-[0_10px_28px_rgba(5,150,105,0.55)] ring-4 ring-emerald-300/70",
  },
  {
    level: 5,
    faceIndex: 1,
    labelEn: "Love it!",
    labelKm: "ស្រឡាញ់ខ្លាំង និងជាទេពកោសល្យ",
    themeColor: "#0284C7",
    gradientFrom: "#38BDF8",
    gradientTo: "#0284C7",
    idleBg: "bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25",
    idleBorder: "border-[#38BDF8]/70 hover:border-[#38BDF8]",
    activeGlow: "shadow-[0_10px_28px_rgba(2,132,199,0.55)] ring-4 ring-sky-300/70",
  },
];

export function AssessmentStage({
  breadcrumbText,
  pageTitle,
  badgeLabel = "ធ្វើតេស្ត",
  badgeIcon: BadgeIcon = Compass,
  resultProfileBadge,
  headerAction,
  questions,
  currentIndex,
  onIndexChange,
  answers,
  onAnswer,
  scaleType,
  leftAnchorKm = "យល់ស្រប",
  leftAnchorEn = "Agree",
  rightAnchorKm = "មិនយល់ស្រប",
  rightAnchorEn = "Disagree",
  mascotSpeech,
  mascotScaleLevel,
  onPrefill,
  onSubmit,
  isSubmitting = false,
  submitButtonText,
  onClearDraft,
}: AssessmentStageProps) {
  const { t, getLocalized } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const totalCount = questions.length;
  const currentQ = questions[currentIndex] || questions[0];

  // Resolve current value: supports plain number or object with scaleLevel
  const rawAnswer = answers[currentQ?.id];
  const currentValue: number | null =
    typeof rawAnswer === "number"
      ? rawAnswer
      : rawAnswer && typeof rawAnswer === "object" && "scaleLevel" in rawAnswer
      ? (rawAnswer.scaleLevel as number)
      : null;

  const answeredCount = Object.keys(answers).length;
  const unreadyCount = totalCount - answeredCount;
  const unreadyIndices = questions
    .map((q, idx) => {
      const val = answers[q.id];
      return val === undefined || val === null ? idx : -1;
    })
    .filter((idx) => idx !== -1);
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const steps = scaleType === "5-point" ? SCALE_STEPS_5 : SCALE_STEPS_7;
  const totalSteps = steps.length;

  const activeLevel = hovered ?? currentValue;
  const currentStep = steps.find((s) => s.level === activeLevel);
  const thumbLevel = activeLevel ?? Math.ceil(totalSteps / 2);
  const thumbStep = currentStep ?? steps[Math.floor(totalSteps / 2)];
  const thumbPercent = ((thumbLevel - 0.5) / totalSteps) * 100;

  // Track dragging / clicking
  const getLevelFromClientX = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return Math.ceil(totalSteps / 2);
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return Math.ceil(totalSteps / 2);
      const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = clampedX / rect.width;
      const col = Math.min(totalSteps - 1, Math.max(0, Math.floor(ratio * totalSteps)));
      return steps[col].level;
    },
    [steps, totalSteps]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    const newLevel = getLevelFromClientX(e.clientX);
    onAnswer(currentQ.id, newLevel);
    setHovered(newLevel);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const newLevel = getLevelFromClientX(e.clientX);
    if (isDragging) {
      if (newLevel !== currentValue) {
        onAnswer(currentQ.id, newLevel);
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

  const handlePrev = () => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) onIndexChange(currentIndex + 1);
  };

  return (
    <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-7 animate-in fade-in select-none">
      {/* 1. TOP HEADER (Unified with Results View) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#68708A] mb-1">
            {breadcrumbText}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Top Badges / Segmented View Switcher */}
        {headerAction ? (
          headerAction
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#111965] text-white shadow-2xs">
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{badgeLabel}</span>
            </div>

            {resultProfileBadge && (
              <button
                type="button"
                onClick={resultProfileBadge.onClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF9E6] text-[#111965] border border-amber-200/80 hover:bg-[#FEF0C7] shadow-2xs transition-colors cursor-pointer"
              >
                {resultProfileBadge.icon && (
                  <resultProfileBadge.icon className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{resultProfileBadge.label}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. DIMENSION PROGRESS PILL & BAR */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-extrabold text-[#68708A]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-[#111965] text-[#F7CE4D] uppercase tracking-wider">
              {getLocalized({ km: currentQ.dimensionNameKm, en: currentQ.dimensionNameEn })}
            </span>
            <span className="text-[#111965] font-black tracking-wide">
              • {currentIndex + 1} / {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onPrefill && (
              <button
                type="button"
                onClick={onPrefill}
                className="text-[11px] font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-[#E6E8F0]"
                title="Fill sample answers"
              >
                ⚡ {t("assessmentStage.prefillSample")}
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EBF3FE] text-[#1B6EF3]">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Full-width gradient progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-[#111965] via-emerald-500 to-[#F7CE4D] transition-all duration-300 rounded-full"
          />
        </div>

        {/* Draft Auto-Save & Unready Answers Status Toolbar (All on Left - Right side kept clear for Mascot) */}
        <div className="flex items-center justify-start text-xs pt-0.5 flex-wrap gap-2">
          {answeredCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Save className="w-3 h-3 text-emerald-600" />
              <span>
                {t("assessmentStage.draftSaved")} ({answeredCount}/{totalCount} {t("assessmentStage.ready")})
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#68708A] bg-slate-100">
              <FileEdit className="w-3 h-3" />
              <span>{t("assessmentStage.noDraftYet")}</span>
            </span>
          )}

          {unreadyCount > 0 && answeredCount > 0 && (
            <button
              type="button"
              onClick={() => {
                const nextUnready =
                  unreadyIndices.find((i) => i >= currentIndex) ?? unreadyIndices[0];
                onIndexChange(nextUnready);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title={getLocalized({ km: "លោតទៅសំណួរមិនទាន់ឆ្លើយបន្ទាប់", en: "Jump to next unready question" })}
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>
                {t("assessmentStage.remaining")} {unreadyCount} {t("assessmentStage.unreadyQuestionsLeft")}
              </span>
            </button>
          )}

          {answeredCount > 0 && onClearDraft && (
            <button
              type="button"
              onClick={onClearDraft}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title={getLocalized({ km: "សម្អាតចម្លើយព្រាងទាំងអស់", en: "Clear all draft answers" })}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("assessmentStage.clearDraft")}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN CARD WITH OVERHANGING TARA MASCOT (Generous Top Clearance to prevent overlap) */}
      <div className="relative pt-9 sm:pt-11">
        {/* Mascot Peeking in Top-Right Corner */}
        <div className="absolute -top-12 -right-1 sm:-top-14 sm:-right-2 z-20 pointer-events-auto">
          <FuteraMascot
            variant="peeking-right"
            scaleLevel={mascotScaleLevel}
            showSpeech={true}
            speechText={mascotSpeech}
          />
        </div>

        {/* Clean White Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E6E8F0] shadow-sm space-y-8 text-center relative overflow-hidden">
          {/* Main Statement Prompt */}
          <div className="max-w-xl mx-auto space-y-2 pt-2 pb-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#111965] leading-snug">
              {getLocalized({
                km: currentQ.promptKm,
                en: currentQ.promptEn,
              })}
            </h2>
            {currentQ.statementKm && currentQ.statementKm !== currentQ.promptKm && (
              <p className="text-xs sm:text-sm font-semibold text-indigo-900 bg-indigo-50/70 inline-block px-3 py-1 rounded-xl border border-indigo-100">
                {getLocalized({ km: currentQ.statementKm, en: currentQ.statementEn })}
              </p>
            )}
          </div>

          {/* Unified Scale Component */}
          <div className="w-full space-y-6 select-none py-1">
            {scaleType === "7-point" ? (
              /* 16Personalities Official 7-Circle Scale */
              <div className="max-w-xl mx-auto space-y-6">
                {/* Agree / Disagree Anchors Header */}
                <div className="flex items-start justify-between px-2 sm:px-4">
                  <button
                    type="button"
                    className="flex flex-col items-start text-left group cursor-pointer transition-transform hover:scale-102 active:scale-98 select-none max-w-[45%]"
                    onClick={() => onAnswer(currentQ.id, steps[0].level)}
                  >
                    <div className="inline-flex items-center gap-1.5 text-sm sm:text-base font-black text-[#33A474] tracking-tight">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33A474] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#33A474]" />
                      </span>
                      <span>{getLocalized({ km: leftAnchorKm, en: leftAnchorEn })}</span>
                    </div>
                    {currentQ.optionA && (
                      <span className="text-[11px] font-medium text-[#4A5568] line-clamp-1 mt-0.5">
                        {getLocalized({ km: currentQ.optionA.labelKm, en: currentQ.optionA.labelEn })}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="flex flex-col items-end text-right group cursor-pointer transition-transform hover:scale-102 active:scale-98 select-none max-w-[45%]"
                    onClick={() => onAnswer(currentQ.id, steps[steps.length - 1].level)}
                  >
                    <div className="inline-flex items-center gap-1.5 text-sm sm:text-base font-black text-[#88619A] tracking-tight">
                      <span>{getLocalized({ km: rightAnchorKm, en: rightAnchorEn })}</span>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#88619A] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#88619A]" />
                      </span>
                    </div>
                    {currentQ.optionB && (
                      <span className="text-[11px] font-medium text-[#4A5568] line-clamp-1 mt-0.5">
                        {getLocalized({ km: currentQ.optionB.labelKm, en: currentQ.optionB.labelEn })}
                      </span>
                    )}
                  </button>
                </div>

                {/* 7 Circular Buttons with Connecting Center Line */}
                <div className="relative flex items-center justify-between px-2 sm:px-4 py-3">
                  {/* Subtle horizontal connecting line */}
                  <div className="absolute left-6 right-6 sm:left-10 sm:right-10 top-1/2 -translate-y-1/2 h-[2.5px] bg-slate-200 rounded-full z-0 pointer-events-none" />

                  {SCALE_STEPS_7.map((step) => {
                    const isSelected = currentValue === step.level;
                    const isHovered = hovered === step.level;
                    const isNeutral = step.side === "neutral";

                    return (
                      <div key={step.level} className="z-10 relative flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => onAnswer(currentQ.id, step.level)}
                          onMouseEnter={() => setHovered(step.level)}
                          onMouseLeave={() => setHovered(null)}
                          className={cn(
                            "rounded-full flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none active:scale-90 bg-white",
                            step.sizeClass,
                            step.borderClass,
                            isSelected
                              ? cn(
                                  step.bgSelected,
                                  step.borderColor,
                                  "text-white shadow-lg -translate-y-1 scale-110",
                                  step.activeGlow
                                )
                              : isHovered
                              ? cn(step.borderColor, step.idleHover, "-translate-y-0.5 scale-105 shadow-sm")
                              : cn(step.borderColor, "shadow-2xs")
                          )}
                          title={getLocalized({ km: step.labelKm, en: step.labelEn })}
                          aria-label={getLocalized({ km: step.labelKm, en: step.labelEn })}
                        >
                          {isSelected && !isNeutral && (
                            <Check className={cn("text-white drop-shadow-xs", step.checkSize)} />
                          )}
                          {isSelected && isNeutral && (
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-xs" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* 5-Point RIASEC Experience with Cards and Slider Rail */
              <>
                <div className="flex items-center justify-between px-2 sm:px-6">
                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[0].level)}
                  >
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0284C7]" />
                    </span>
                    <span className="text-sm sm:text-base font-black text-sky-800 tracking-tight">
                      {getLocalized({ km: leftAnchorKm, en: leftAnchorEn })}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[steps.length - 1].level)}
                  >
                    <span className="text-sm sm:text-base font-black text-rose-800 tracking-tight">
                      {getLocalized({ km: rightAnchorKm, en: rightAnchorEn })}
                    </span>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC2626]" />
                    </span>
                  </button>
                </div>

                {/* Row of Uniform Emotion Face Cards */}
                <div className="flex items-center justify-between max-w-xl mx-auto gap-2 sm:gap-3 px-2 sm:px-4">
                  {SCALE_STEPS_5.map((step) => {
                    const isSelected = currentValue === step.level;
                    const isHovered = hovered === step.level;

                    return (
                      <div key={step.level} className="flex-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => onAnswer(currentQ.id, step.level)}
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
                          <div
                            className={`transition-transform duration-200 ${
                              isSelected ? "scale-110 drop-shadow-sm" : isHovered ? "scale-105" : ""
                            }`}
                          >
                            {renderEmotionFace(step.faceIndex, isSelected, step.themeColor)}
                          </div>

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

                {/* Slider Rail */}
                <div
                  ref={railRef}
                  className="relative max-w-xl mx-auto px-2 sm:px-4 pt-1.5 group outline-none"
                  tabIndex={0}
                >
                  <div
                    ref={trackRef}
                    className="relative h-7 flex items-center cursor-pointer touch-none select-none py-2"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                  >
                    <div
                      className="absolute h-2.5 sm:h-3 rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.15)] border border-black/5"
                      style={{
                        left: `calc(100% / ${totalSteps * 2} - 11px)`,
                        right: `calc(100% / ${totalSteps * 2} - 11px)`,
                        background:
                          "linear-gradient(to right, #DC2626 0%, #F69649 25%, #FACC15 50%, #34D399 75%, #0284C7 100%)",
                      }}
                    />

                    {/* Slider Knob */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 ease-out z-20"
                      style={{ left: `${thumbPercent}%` }}
                    >
                      <div
                        className={cn(
                          "w-5.5 h-5.5 rounded-full bg-white flex items-center justify-center transition-all duration-150 shadow-md",
                          isDragging ? "scale-115" : "scale-100",
                          currentValue === null && !isDragging && "opacity-80"
                        )}
                        style={{
                          boxShadow: isDragging
                            ? `0 0 0 3px ${thumbStep.themeColor}40, 0 2px 6px rgba(0,0,0,0.22)`
                            : "0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full transition-colors duration-150 shadow-inner"
                          style={{ backgroundColor: thumbStep.themeColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Helper Feedback Label */}
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
                  <span>{getLocalized({ km: currentStep.labelKm, en: currentStep.labelEn })}</span>
                </div>
              ) : (
                <div className="inline-flex items-center text-xs font-semibold text-slate-400">
                  <span>{t("assessmentStage.selectOptionPrompt") || "សូមជ្រើសរើសជម្រើសដែលត្រូវនឹងអ្នក"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION & CHECKPOINT NUMBER DOTS (Strict Single Row) */}
      <div className="pt-3 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-bold text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA] disabled:opacity-25 disabled:pointer-events-none transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{t("personalityAssessment.previous") || "សំណួរមុន"}</span>
        </button>

        {/* Checkpoint Dots (1 to N) - Strictly Single Row Centered */}
        <div className="flex-1 max-w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-center px-1">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap py-1 px-1">
            {questions.map((q, idx) => {
              const isQAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
              const isCurrent = idx === currentIndex;
              const isCompact = questions.length > 12;

              return (
                <button
                  key={q.id}
                  type="button"
                  ref={isCurrent ? activeStepRef : undefined}
                  onClick={() => onIndexChange(idx)}
                  className={`flex-shrink-0 rounded-full font-bold transition-all flex items-center justify-center cursor-pointer select-none ${
                    isCompact
                      ? "w-6 h-6 sm:w-7 sm:h-7 text-[11px] sm:text-xs"
                      : "w-7 h-7 sm:w-8 sm:h-8 text-xs"
                  } ${
                    isCurrent
                      ? "bg-[#111965] text-white shadow-xs scale-105"
                      : isQAnswered
                      ? "bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                      : idx < currentIndex
                      ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold hover:bg-amber-100"
                      : "text-[#68708A] hover:text-[#111965] hover:bg-slate-100 font-medium"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next or Complete Assessment Button */}
        {currentIndex === totalCount - 1 ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={answeredCount < totalCount || isSubmitting}
            className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full font-black text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md disabled:opacity-40 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-[#111965] flex-shrink-0" />
            <span className="whitespace-nowrap">
              {isSubmitting
                ? t("personalityAssessment.evaluating") || "កំពុងគណនា..."
                : submitButtonText || t("personalityAssessment.complete") || "បញ្ចប់ការធ្វើតេស្ត"}
            </span>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-30 transition-all shadow-xs whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
          >
            <span className="whitespace-nowrap">{t("personalityAssessment.next") || "បន្ទាប់"}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Helper Banner for Unready Questions if user reached end */}
      {currentIndex === totalCount - 1 && unreadyCount > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-bold">
              {getLocalized({
                km: `អ្នកនៅសល់ ${unreadyCount} សំណួរមិនទាន់ឆ្លើយ។ សូមឆ្លើយសំណួរទាំងអស់ដើម្បីបញ្ចប់ការធ្វើតេស្ត។`,
                en: `You have ${unreadyCount} unready question(s) left. Please answer all questions before submitting.`,
              })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onIndexChange(unreadyIndices[0])}
            className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 font-extrabold text-[#111965] transition-colors whitespace-nowrap cursor-pointer"
          >
            {getLocalized({ km: "បំពេញសំណួរនៅសល់ →", en: "Answer remaining questions →" })}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 7 Expressive Tara Mascot Faces:
 */
function renderEmotionFace(faceIndex: number, isSelected: boolean, themeColor: string) {
  const stroke = isSelected ? "#FFFFFF" : themeColor;
  const fill = isSelected ? "#FFFFFF" : themeColor;
  const highlight = isSelected ? themeColor : "#FFFFFF";
  const blushFill = isSelected ? "#FFFFFF" : themeColor;
  const blushOpacity = isSelected ? 0.38 : 0.26;

  const rosyCheeks = (
    <>
      <ellipse cx="27" cy="52" rx="8" ry="5" fill={blushFill} fillOpacity={blushOpacity} />
      <ellipse cx="73" cy="52" rx="8" ry="5" fill={blushFill} fillOpacity={blushOpacity} />
    </>
  );

  switch (faceIndex) {
    case 1:
      // Laughing eyes, big happy smile, sparkle star
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <path d="M 26 42 C 31 31, 41 31, 46 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54 42 C 59 31, 69 31, 74 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 38 52 Q 50 72 62 52 Z" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M 82 18 Q 82 23 87 23 Q 82 23 82 28 Q 82 23 77 23 Q 82 23 82 18 Z" fill={fill} />
        </svg>
      );

    case 2:
      // Cheerful shining eyes, warm open smile
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
      // Polite gentle smile, bright calm eyes
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
      // Calm straight mouth line, observant eyes
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
      // Tara's grumpy side-eye & doubtful tilted pout
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <path d="M 28 32 Q 35 31 41 33" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M 59 33 Q 65 31 72 32" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M 27 42 Q 34 39 42 42 C 42 50, 27 50, 27 42 Z" fill={fill} />
          <circle cx="31" cy="44.5" r="2" fill={highlight} />
          <path d="M 58 42 Q 66 39 73 42 C 73 50, 58 50, 58 42 Z" fill={fill} />
          <circle cx="62" cy="44.5" r="2" fill={highlight} />
          <path d="M 41 58 Q 48 55 56 57" stroke={stroke} strokeWidth="3.6" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Sad drooping eyebrows, downturned mouth
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <path d="M 27 31 C 32 34, 38 37, 42 38" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 73 31 C 68 34, 62 37, 58 38" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="34" cy="45" rx="6.2" ry="7.6" fill={fill} />
          <circle cx="32" cy="42.5" r="2" fill={highlight} />
          <ellipse cx="66" cy="45" rx="6.2" ry="7.6" fill={fill} />
          <circle cx="64" cy="42.5" r="2" fill={highlight} />
          <path d="M 40 61 Q 50 53 60 61" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // Distressed weeping face with teardrops
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          <path d="M 26 30 C 32 34, 38 38, 42 40" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 74 30 C 68 34, 62 38, 58 40" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" />
          <ellipse cx="34" cy="44" rx="6.5" ry="7.8" fill={fill} />
          <circle cx="32" cy="41.5" r="2" fill={highlight} />
          <ellipse cx="66" cy="44" rx="6.5" ry="7.8" fill={fill} />
          <circle cx="64" cy="41.5" r="2" fill={highlight} />
          <path d="M 39 65 Q 50 54 61 65 Z" fill={fill} stroke={stroke} strokeWidth="2.4" />
          <path d="M 25 50 C 25 45, 30 45, 30 50 C 30 55, 25 55, 25 50 Z" fill={fill} />
          <path d="M 70 50 C 70 45, 75 45, 75 50 C 75 55, 70 55, 70 50 Z" fill={fill} />
        </svg>
      );

    default:
      return null;
  }
}
