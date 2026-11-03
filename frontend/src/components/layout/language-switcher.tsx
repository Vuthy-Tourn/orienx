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
        "inline-flex items-center p-0.5 rounded-lg border border-[#E6E8F0] bg-white text-xs font-medium shadow-xs",
        className
      )}
    >
      <button
        onClick={() => setLanguage("km")}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5",
          language === "km"
            ? "bg-[#111965] text-white font-semibold shadow-xs"
            : "text-[#68708A] hover:text-[#171A2C]"
        )}
      >
        <span>🇰🇭</span>
        <span>ខ្មែរ</span>
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5",
          language === "en"
            ? "bg-[#111965] text-white font-semibold shadow-xs"
            : "text-[#68708A] hover:text-[#171A2C]"
        )}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
