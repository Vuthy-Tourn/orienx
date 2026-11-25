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
          "inline-flex h-9 w-9 items-center justify-center gap-2 rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-0 text-xs xl:text-sm font-semibold text-[#94A3B8] transition-colors hover:border-[#111965]/30 hover:bg-white hover:text-[#111965] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white xl:w-56 xl:justify-start xl:px-3",
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate text-left xl:inline">
          {isKm ? "ស្វែងរក OrienX…" : "Search OrienX…"}
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-[#E6E8F0] bg-white px-1.5 py-0.5 text-[11px] font-bold leading-none text-[#94A3B8] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 xl:inline">
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
