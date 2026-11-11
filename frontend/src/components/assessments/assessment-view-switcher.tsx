"use client";

import React from "react";
import { Compass, Trophy, BookOpen, LucideIcon } from "lucide-react";

export interface AssessmentViewSwitcherProps {
  activeTab: "form" | "results" | "guide" | string;
  onTabChange: (tab: any) => void;
  questionsLabel?: string;
  profileLabel: string;
  profileIcon?: LucideIcon;
  guideLabel?: string;
  hasResult?: boolean;
}

export function AssessmentViewSwitcher({
  activeTab,
  onTabChange,
  questionsLabel = "ធ្វើតេស្ត",
  profileLabel,
  profileIcon: ProfileIcon = Trophy,
  guideLabel,
  hasResult = true,
}: AssessmentViewSwitcherProps) {
  // If user hasn't completed assessment yet, display static active badge
  if (!hasResult) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#111965] text-white shadow-xs">
        <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
        <span>{questionsLabel}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center bg-[#F0F2FA] p-1 rounded-full border border-[#E6E8F0] shadow-xs self-start sm:self-auto transition-all">
      {/* Mode 1: Questionnaire Test */}
      <button
        type="button"
        onClick={() => onTabChange("form")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          activeTab === "form"
            ? "bg-[#111965] text-white shadow-xs"
            : "text-[#68708A] hover:text-[#111965] hover:bg-white/60"
        }`}
        aria-label={questionsLabel}
      >
        <Compass
          className={`w-3.5 h-3.5 transition-colors ${
            activeTab === "form" ? "text-[#F7CE4D]" : "text-[#68708A]"
          }`}
        />
        <span>{questionsLabel}</span>
      </button>

      {/* Mode 2: Assessment Profile Results */}
      <button
        type="button"
        onClick={() => onTabChange("results")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          activeTab === "results"
            ? "bg-[#111965] text-white shadow-xs"
            : "text-[#68708A] hover:text-[#111965] hover:bg-white/60"
        }`}
        aria-label={profileLabel}
      >
        <ProfileIcon
          className={`w-3.5 h-3.5 transition-colors ${
            activeTab === "results" ? "text-[#F7CE4D]" : "text-[#68708A]"
          }`}
        />
        <span>{profileLabel}</span>
      </button>

      {/* Mode 3: 16 Personalities Guide */}
      {guideLabel && (
        <button
          type="button"
          onClick={() => onTabChange("guide")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "guide"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-white/60"
          }`}
          aria-label={guideLabel}
        >
          <BookOpen
            className={`w-3.5 h-3.5 transition-colors ${
              activeTab === "guide" ? "text-[#F7CE4D]" : "text-[#68708A]"
            }`}
          />
          <span>{guideLabel}</span>
        </button>
      )}
    </div>
  );
}

