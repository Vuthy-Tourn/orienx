"use client";

import React from "react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center p-0.5 rounded-lg border border-[#E6E8F0] bg-white text-xs font-medium shadow-xs dark:border-white/10 dark:bg-white/5",
        className
      )}
    >
      <button
        onClick={() => setLanguage("km")}
        aria-label="Khmer"
        aria-pressed={language === "km"}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5",
          language === "km"
            ? "bg-[#111965] text-white font-semibold shadow-xs dark:bg-[#F7CE4D] dark:text-white"
            : "text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <span>ខ្មែរ</span>
      </button>
      <button
        onClick={() => setLanguage("en")}
        aria-label="English"
        aria-pressed={language === "en"}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5",
          language === "en"
            ? "bg-[#111965] text-white font-semibold shadow-xs dark:bg-[#F7CE4D] dark:text-white"
            : "text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <span className="font-mono text-[12.5px] font-bold">EN</span>
      </button>
    </div>
  );
}

