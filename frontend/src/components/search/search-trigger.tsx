"use client";

import React from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
  variant?: "compact" | "full";
  className?: string;
}

export function openGlobalSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orienx:open-search"));
  }
}

export function SearchTrigger({
  variant = "compact",
  className,
}: SearchTriggerProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const label = isKm ? "ស្វែងរក" : "Search";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={openGlobalSearch}
        aria-label={label}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-xl border border-[#E6E8F0] bg-white px-3 text-[11px] font-semibold text-[#68708A] transition-colors hover:border-[#111965]/30 hover:text-[#111965] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white",
          className
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">{label}</span>
        <kbd className="hidden rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[9px] font-bold text-[#94A3B8] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 xl:inline">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      aria-label={label}
      title={`${label} (⌘K)`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E8F0] bg-white text-[#111965] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        className
      )}
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
