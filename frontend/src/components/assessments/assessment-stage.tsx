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
    sizeClass: "w-12 h-12 sm:w-14 sm:h-14",
    borderClass: "border-[2.5px] sm:border-[3px]",
    checkSize: "w-6 h-6 sm:w-7 sm:h-7 stroke-[3]",
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំងបំផុត",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/10 hover:border-[#33A474]",
    activeGlow: "shadow-[0_8px_24px_rgba(51,164,116,0.4)] ring-8 ring-[#33A474]/20",
  },
  {
    level: 2,
    sizeClass: "w-10 h-10 sm:w-11 sm:h-11",
    borderClass: "border-[2px] sm:border-[2.5px]",
    checkSize: "w-5 h-5 sm:w-6 sm:h-6 stroke-[3]",
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/10 hover:border-[#33A474]",
    activeGlow: "shadow-[0_6px_20px_rgba(51,164,116,0.35)] ring-8 ring-[#33A474]/20",
  },
  {
    level: 3,
    sizeClass: "w-8 h-8 sm:w-9 sm:h-9",
    borderClass: "border-[2px]",
    checkSize: "w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]",
    labelEn: "Slightly Agree",
    labelKm: "យល់ស្របបន្តិច",
    side: "agree",
    themeColor: "#33A474",
    borderColor: "border-[#33A474]",
    bgSelected: "bg-[#33A474]",
    idleHover: "hover:bg-[#33A474]/10 hover:border-[#33A474]",
    activeGlow: "shadow-[0_4px_16px_rgba(51,164,116,0.3)] ring-6 ring-[#33A474]/20",
  },
  {
    level: 4,
    sizeClass: "w-6 h-6 sm:w-7 sm:h-7",
    borderClass: "border-[2px]",
    checkSize: "w-2 h-2 rounded-full bg-white",
    labelEn: "Neutral",
    labelKm: "កណ្តាល",
    side: "neutral",
    themeColor: "#94A3B8",
    borderColor: "border-slate-300",
    bgSelected: "bg-slate-400",
    idleHover: "hover:bg-slate-100 hover:border-slate-400",
    activeGlow: "shadow-[0_4px_12px_rgba(148,163,184,0.3)] ring-6 ring-slate-300/40",
  },
  {
    level: 5,
    sizeClass: "w-8 h-8 sm:w-9 sm:h-9",
    borderClass: "border-[2px]",
    checkSize: "w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]",
    labelEn: "Slightly Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/10 hover:border-[#88619A]",
    activeGlow: "shadow-[0_4px_16px_rgba(136,97,154,0.3)] ring-6 ring-[#88619A]/20",
  },
  {
    level: 6,
    sizeClass: "w-10 h-10 sm:w-11 sm:h-11",
    borderClass: "border-[2px] sm:border-[2.5px]",
    checkSize: "w-5 h-5 sm:w-6 sm:h-6 stroke-[3]",
    labelEn: "Disagree",
    labelKm: "មិនយល់ស្រប",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/10 hover:border-[#88619A]",
    activeGlow: "shadow-[0_6px_20px_rgba(136,97,154,0.35)] ring-8 ring-[#88619A]/20",
  },
  {
    level: 7,
    sizeClass: "w-12 h-12 sm:w-14 sm:h-14",
    borderClass: "border-[2.5px] sm:border-[3px]",
    checkSize: "w-6 h-6 sm:w-7 sm:h-7 stroke-[3]",
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របទាល់តែសោះ",
    side: "disagree",
    themeColor: "#88619A",
    borderColor: "border-[#88619A]",
    bgSelected: "bg-[#88619A]",
    idleHover: "hover:bg-[#88619A]/10 hover:border-[#88619A]",
    activeGlow: "shadow-[0_8px_24px_rgba(136,97,154,0.4)] ring-8 ring-[#88619A]/20",
  },
];

// 5-Point Agree-to-Disagree Config (Official 16Personalities standard: Left = Agree, Right = Disagree)
export const AGREE_TO_DISAGREE_5 = [
  {
    level: 1,
    faceIndex: 1, // Sparkle happy face
    labelEn: "Strongly Agree",
    labelKm: "យល់ស្របខ្លាំង",
    themeColor: "#10B981",
    idleBg: "bg-[#E6F9F0]",
    idleBorder: "border-[#63D69E]",
    activeGlow: "shadow-[0_8px_24px_rgba(16,185,129,0.35)] ring-4 ring-[#63D69E]/50",
  },
  {
    level: 2,
    faceIndex: 2, // Smile face
    labelEn: "Agree",
    labelKm: "យល់ស្រប",
    themeColor: "#059669",
    idleBg: "bg-[#ECFDF5]",
    idleBorder: "border-[#A7F3D0]",
    activeGlow: "shadow-[0_8px_24px_rgba(5,150,105,0.35)] ring-4 ring-[#A7F3D0]/50",
  },
  {
    level: 3,
    faceIndex: 4, // Neutral face
    labelEn: "Neutral",
    labelKm: "កណ្តាល / អព្យាក្រឹត",
    themeColor: "#D97706",
    idleBg: "bg-[#FEF9E7]",
    idleBorder: "border-[#FFD043]",
    activeGlow: "shadow-[0_8px_24px_rgba(217,119,6,0.35)] ring-4 ring-[#FFD043]/50",
  },
  {
    level: 4,
    faceIndex: 5, // Side-eye face
    labelEn: "Disagree",
    labelKm: "មិនសូវយល់ស្រប",
    themeColor: "#F76808",
    idleBg: "bg-[#FFF0E6]",
    idleBorder: "border-[#FFA767]",
    activeGlow: "shadow-[0_8px_24px_rgba(247,104,8,0.35)] ring-4 ring-[#FFA767]/50",
  },
  {
    level: 5,
    faceIndex: 7, // Angry chibi face
    labelEn: "Strongly Disagree",
    labelKm: "មិនយល់ស្របដាច់ខាត",
    themeColor: "#E5484D",
    idleBg: "bg-[#FFEBEF]",
    idleBorder: "border-[#FF8A96]",
    activeGlow: "shadow-[0_8px_24px_rgba(229,72,77,0.35)] ring-4 ring-[#FF8A96]/50",
  },
];

// 5-Point Enjoy-to-Dislike Config (Unified Positive-Left -> Negative-Right direction matching Agree-to-Disagree)
export const DISLIKE_TO_ENJOY_5 = [
  {
    level: 5,
    faceIndex: 1,
    labelEn: "Highly Enjoy",
    labelKm: "ចូលចិត្តខ្លាំង",
    themeColor: "#10B981",
    idleBg: "bg-[#E6F9F0]",
    idleBorder: "border-[#63D69E]",
    activeGlow: "shadow-[0_8px_24px_rgba(16,185,129,0.35)] ring-4 ring-[#63D69E]/50",
  },
  {
    level: 4,
    faceIndex: 2,
    labelEn: "Enjoy",
    labelKm: "ចូលចិត្ត",
    themeColor: "#059669",
    idleBg: "bg-[#ECFDF5]",
    idleBorder: "border-[#A7F3D0]",
    activeGlow: "shadow-[0_8px_24px_rgba(5,150,105,0.35)] ring-4 ring-[#A7F3D0]/50",
  },
  {
    level: 3,
    faceIndex: 4,
    labelEn: "Neutral",
    labelKm: "កម្រិតមធ្យម / ធម្មតា",
    themeColor: "#D97706",
    idleBg: "bg-[#FEF9E7]",
    idleBorder: "border-[#FFD043]",
    activeGlow: "shadow-[0_8px_24px_rgba(217,119,6,0.35)] ring-4 ring-[#FFD043]/50",
  },
  {
    level: 2,
    faceIndex: 5,
    labelEn: "Slight Dislike",
    labelKm: "មិនសូវចូលចិត្ត",
    themeColor: "#F76808",
    idleBg: "bg-[#FFF0E6]",
    idleBorder: "border-[#FFA767]",
    activeGlow: "shadow-[0_8px_24px_rgba(247,104,8,0.35)] ring-4 ring-[#FFA767]/50",
  },
  {
    level: 1,
    faceIndex: 7,
    labelEn: "Dislike",
    labelKm: "មិនចូលចិត្ត",
    themeColor: "#E5484D",
    idleBg: "bg-[#FFEBEF]",
    idleBorder: "border-[#FF8A96]",
    activeGlow: "shadow-[0_8px_24px_rgba(229,72,77,0.35)] ring-4 ring-[#FF8A96]/50",
  },
];

const SCALE_STEPS_5 = AGREE_TO_DISAGREE_5;

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
  const [dragLevel, setDragLevel] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const dotsScrollRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stepEl = activeStepRef.current;
    const container = dotsScrollRef.current;
    if (!stepEl || !container) return;
    const rafId = window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const stepRect = stepEl.getBoundingClientRect();
      const stepCenter =
        stepRect.left - containerRect.left + container.scrollLeft + stepRect.width / 2;
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      const targetLeft = Math.max(
        0,
        Math.min(maxScroll, stepCenter - container.clientWidth / 2)
      );
      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [currentIndex, questions.length]);

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

  const isAgreeToDisagree = leftAnchorEn?.toLowerCase().includes("agree");
  const steps5 = isAgreeToDisagree ? AGREE_TO_DISAGREE_5 : DISLIKE_TO_ENJOY_5;
  const steps = scaleType === "5-point" ? steps5 : SCALE_STEPS_7;
  const totalSteps = steps.length;

  useEffect(() => {
    if (!currentQ) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }
      const value = Number(event.key);
      if (Number.isInteger(value) && value >= 1 && value <= totalSteps) {
        event.preventDefault();
        const chosen = steps[value - 1];
        if (chosen) onAnswer(currentQ.id, chosen.level);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQ, onAnswer, steps, totalSteps]);

  const activeLevel = isDragging ? dragLevel : hovered ?? currentValue;
  const currentStep = steps.find((s) => s.level === activeLevel);
  const foundIndex = activeLevel !== null ? steps.findIndex((s) => s.level === activeLevel) : -1;
  const thumbStepIndex = foundIndex >= 0 ? foundIndex : Math.floor(totalSteps / 2);
  const thumbStep = steps[thumbStepIndex] ?? steps[Math.floor(totalSteps / 2)];
  const thumbPercent = ((thumbStepIndex + 0.5) / totalSteps) * 100;

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
    const newLevel = getLevelFromClientX(e.clientX);
    setIsDragging(true);
    setDragLevel(newLevel);
    setHovered(newLevel);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const newLevel = getLevelFromClientX(e.clientX);
    if (isDragging) {
      setDragLevel(newLevel);
    }
    setHovered(newLevel);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      const finalLevel = getLevelFromClientX(e.clientX);
      setIsDragging(false);
      setDragLevel(null);
      setHovered(null);
      if (currentQ) {
        onAnswer(currentQ.id, finalLevel);
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      setDragLevel(null);
      setHovered(null);
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
            <span className="px-3 py-1 rounded-full text-[12.5px] sm:text-[12px] font-black bg-[#111965] text-[#F7CE4D] uppercase tracking-wider">
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
                className="text-[12px] font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-[#E6E8F0]"
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Save className="w-3 h-3 text-emerald-600" />
              <span>
                {t("assessmentStage.draftSaved")} ({answeredCount}/{totalCount} {t("assessmentStage.ready")})
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium text-[#68708A] bg-slate-100">
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
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
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
          <div
            key={`prompt-${currentQ.id}`}
            className="assessment-question-enter max-w-xl mx-auto space-y-3 pt-2 pb-1 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-[#111965] leading-snug tracking-tight">
              {getLocalized({
                km: currentQ.promptKm,
                en: currentQ.promptEn,
              })}
            </h2>
            {currentQ.statementKm && currentQ.statementKm !== currentQ.promptKm && (
              <div className="pt-1">
                <span className="inline-block px-5 py-2.5 rounded-2xl bg-[#EEF2FF] text-[#1E293B] font-bold text-xs sm:text-sm border border-[#E0E7FF] shadow-2xs">
                  {getLocalized({ km: currentQ.statementKm, en: currentQ.statementEn })}
                </span>
              </div>
            )}
          </div>

          {/* Unified Scale Component */}
          <div
            key={`scale-${currentQ.id}`}
            className="assessment-question-enter w-full space-y-6 select-none py-1"
          >
            {scaleType === "7-point" ? (
              /* 16Personalities Official 7-Circle Scale */
              <div className="max-w-xl mx-auto space-y-6">
                {/* Agree / Disagree Anchors Header (16Personalities Official Style) */}
                <div className="flex items-center justify-between px-2 sm:px-6">
                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[0].level)}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#33A474] flex-shrink-0" />
                    <span className="text-sm sm:text-base font-black text-[#33A474] tracking-tight">
                      {getLocalized({ km: leftAnchorKm, en: leftAnchorEn })}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[steps.length - 1].level)}
                  >
                    <span className="text-sm sm:text-base font-black text-[#88619A] tracking-tight">
                      {getLocalized({ km: rightAnchorKm, en: rightAnchorEn })}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#88619A] flex-shrink-0" />
                  </button>
                </div>

                {/* 7 Circular Buttons with Connecting Center Line */}
                <div className="relative flex items-center justify-between px-2 sm:px-4 py-4">
                  {/* Subtle horizontal connecting line */}
                  <div className="absolute left-6 right-6 sm:left-10 sm:right-10 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 rounded-full z-0 pointer-events-none" />

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
                            "rounded-full flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none active:scale-95 bg-white",
                            step.sizeClass,
                            step.borderClass,
                            isSelected
                              ? cn(
                                  step.bgSelected,
                                  step.borderColor,
                                  "text-white shadow-md scale-105",
                                  step.activeGlow
                                )
                              : isHovered
                              ? cn(step.borderColor, step.idleHover, "scale-105 shadow-2xs")
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

                {/* Bottom Helper Instruction */}
                <p className="text-xs text-[#8F95B2] font-medium text-center pt-1">
                  {getLocalized({
                    km: "សូមជ្រើសរើសជម្រើសដែលពិពណ៌នាអំពីអ្នកបានល្អបំផុត",
                    en: "Please select the option that best describes you",
                  })}
                </p>
              </div>
            ) : (
              /* 5-Point RIASEC & Personality Experience with Mascot Cards and Gradient Slider Rail */
              <>
                <div className="flex items-center justify-between px-2 sm:px-6">
                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[0].level)}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#10B981]" />
                    <span className="text-sm sm:text-base font-black tracking-tight text-emerald-700">
                      {getLocalized({ km: leftAnchorKm, en: leftAnchorEn })}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
                    onClick={() => onAnswer(currentQ.id, steps[steps.length - 1].level)}
                  >
                    <span className="text-sm sm:text-base font-black tracking-tight text-rose-700">
                      {getLocalized({ km: rightAnchorKm, en: rightAnchorEn })}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#DC2626]" />
                  </button>
                </div>

                {/* Row of Uniform Emotion Face Cards */}
                <div className="flex items-center justify-between max-w-xl mx-auto gap-2 sm:gap-3 px-2 sm:px-4">
                  {steps5.map((step) => {
                    const isSelected = activeLevel === step.level;
                    const isHovered = hovered === step.level;

                    return (
                      <div key={step.level} className="flex-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => onAnswer(currentQ.id, step.level)}
                          onMouseEnter={() => setHovered(step.level)}
                          onMouseLeave={() => setHovered(null)}
                          className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 aspect-square rounded-2xl sm:rounded-[22px] border-2 sm:border-[2.5px] flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none active:scale-95",
                            step.idleBg,
                            step.idleBorder,
                            isSelected
                              ? cn(step.activeGlow, "-translate-y-1 scale-105 z-10")
                              : isHovered
                              ? "-translate-y-0.5 scale-105 shadow-xs z-0"
                              : "shadow-2xs z-0"
                          )}
                          title={getLocalized({ km: step.labelKm, en: step.labelEn })}
                          aria-label={getLocalized({ km: step.labelKm, en: step.labelEn })}
                        >
                          <div
                            className={cn(
                              "transition-transform duration-200",
                              isSelected ? "scale-105" : isHovered ? "scale-105" : ""
                            )}
                          >
                            {renderEmotionFace(step.faceIndex, isSelected, step.themeColor)}
                          </div>
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
                    onPointerCancel={handlePointerCancel}
                    onPointerLeave={handlePointerLeave}
                  >
                    <div
                      className="absolute h-2.5 sm:h-3 rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.15)] border border-black/5"
                      style={{
                        left: `calc(100% / ${totalSteps * 2} - 11px)`,
                        right: `calc(100% / ${totalSteps * 2} - 11px)`,
                        background:
                          "linear-gradient(to right, #10B981 0%, #34D399 25%, #FFD043 50%, #F76808 75%, #E5484D 100%)",
                      }}
                    />

                    {/* Slider Knob */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 ease-out z-20"
                      style={{ left: `${thumbPercent}%` }}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full bg-white flex items-center justify-center transition-all duration-150 shadow-md border border-slate-200/90",
                          isDragging ? "scale-115 shadow-lg" : "scale-100",
                          currentValue === null && !isDragging && "opacity-80"
                        )}
                        style={{
                          boxShadow: isDragging
                            ? `0 0 0 3px ${thumbStep.themeColor}40, 0 2px 6px rgba(0,0,0,0.22)`
                            : "0 1px 3px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
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

                {/* Bottom Helper Instruction matching reference screenshot */}
                <p className="text-xs sm:text-sm text-[#7C84A3] font-medium text-center pt-2 select-none">
                  {getLocalized({
                    km: "សូមជ្រើសរើសជម្រើសដែលពិពណ៌នាអំពីអ្នកបានល្អបំផុត",
                    en: "Please select the option that best describes you",
                  })}
                </p>
              </>
            )}

            {/* Helper Feedback Label (shows active emotion label when selected) */}
            <div className="min-h-[28px] flex items-center justify-center">
              {currentStep ? (
                <div
                  className="inline-flex items-center px-4 py-1 rounded-full text-xs font-extrabold shadow-2xs border animate-in fade-in zoom-in-95 duration-150 transition-all"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: currentStep.themeColor,
                    color: currentStep.themeColor,
                  }}
                >
                  <span>{getLocalized({ km: currentStep.labelKm, en: currentStep.labelEn })}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION & CHECKPOINT NUMBER DOTS */}
      <div className="pt-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="order-2 sm:order-1 inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-bold text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA] disabled:opacity-25 disabled:pointer-events-none transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{t("personalityAssessment.previous") || "សំណួរមុន"}</span>
        </button>

        {/* Checkpoint Dots (1 to N) - Unclipped scrollable row */}
        <div
          ref={dotsScrollRef}
          className="relative order-1 sm:order-2 w-full sm:w-auto sm:min-w-0 sm:flex-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <div className="mx-auto flex w-max items-center gap-1 sm:gap-1.5 flex-nowrap py-1.5 px-3">
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
                      ? "w-6 h-6 sm:w-7 sm:h-7 text-[12px] sm:text-xs"
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
            className="order-3 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full font-black text-xs sm:text-sm text-[#0F1754] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md disabled:opacity-40 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-[#0F1754] flex-shrink-0" />
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
            className="order-3 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] disabled:opacity-30 transition-all shadow-xs whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
          >
            <span className="whitespace-nowrap">{t("personalityAssessment.next") || "បន្ទាប់"}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Helper Banner for Unready Questions if user reached end */}
      {currentIndex === totalCount - 1 && unreadyCount > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm animate-in fade-in">
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
            className="px-3.5 py-1.5 rounded-xl bg-[#F7CE4D] hover:bg-[#F5C430] font-extrabold text-[#0F1754] shadow-xs transition-colors whitespace-nowrap cursor-pointer"
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
  const stroke = themeColor;
  const fill = themeColor;
  const highlight = "#FFFFFF";
  const blushFill = themeColor;
  const blushOpacity = 0.25;

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
      // Cute angry/determined chibi face matching Pic 2
      return (
        <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
          {rosyCheeks}
          {/* Angled furrowed angry eyebrows */}
          <path d="M 23 34 L 43 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 77 34 L 57 42" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
          {/* Cute angled angry eyes > < */}
          <path d="M 28 47 L 38 43 L 34 53" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 72 47 L 62 43 L 66 53" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Small determined pout / frown */}
          <path d="M 43 63 L 50 56 L 57 63" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    default:
      return null;
  }
}
