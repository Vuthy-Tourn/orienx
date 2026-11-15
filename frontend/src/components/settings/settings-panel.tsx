"use client";

import React from "react";
import { flushSync } from "react-dom";
import { useLanguage } from "@/contexts/language-context";
import { useTheme, type Theme } from "@/contexts/theme-context";
import { Globe, Sun, Moon, Monitor, Check, Sparkles, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  className?: string;
  onChanged?: () => void;
}

export function SettingsPanel({ className, onChanged }: SettingsPanelProps) {
  const { language, setLanguage, t, getLocalized } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleLanguageChange = (lang: "km" | "en") => {
    setLanguage(lang);
    if (onChanged) onChanged();
  };

  const handleThemeChange = async (newTheme: Theme) => {
    if (newTheme === theme) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function";

    if (!hasViewTransition || prefersReducedMotion) {
      setTheme(newTheme);
      if (onChanged) onChanged();
      return;
    }

    try {
      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });
      await transition.ready;
      const anim = document.documentElement.animate(
        {
          clipPath: [
            `inset(0 0 ${window.innerHeight}px 0)`,
            `inset(0 0 0 0)`,
          ],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
      await anim.finished.catch(() => {});
    } catch {
      setTheme(newTheme);
    }
    if (onChanged) onChanged();
  };

  return (
    <div className={cn("space-y-6 select-none", className)}>
      {/* 1. Language Setting */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1B6EF3] flex items-center justify-center shadow-2xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#111965]">
              {t("settings.languageTitle")}
            </h3>
            <p className="text-[12px] text-[#68708A]">
              {t("settings.languageDesc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {/* Khmer */}
          <button
            type="button"
            onClick={() => handleLanguageChange("km")}
            className={cn(
              "p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group min-h-[76px]",
              language === "km"
                ? "bg-[#EBF3FE] border-2 border-[#1B6EF3] shadow-xs"
                : "bg-white border-[#E6E8F0] hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[12.5px] font-black bg-blue-100 text-blue-800 font-mono">
                  KH
                </span>
                <span className="text-sm font-black text-[#111965] truncate">
                  {t("settings.khmerLang")}
                </span>
              </div>
              <p className="text-[12px] text-[#68708A] truncate leading-tight">
                {t("settings.khmerLangDesc")}
              </p>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                language === "km"
                  ? "bg-[#1B6EF3] text-white shadow-2xs"
                  : "border border-slate-300 text-transparent"
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => handleLanguageChange("en")}
            className={cn(
              "p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group min-h-[76px]",
              language === "en"
                ? "bg-[#EBF3FE] border-2 border-[#1B6EF3] shadow-xs"
                : "bg-white border-[#E6E8F0] hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[12.5px] font-black bg-slate-100 text-slate-700 font-mono">
                  EN
                </span>
                <span className="text-sm font-black text-[#111965] truncate">
                  {t("settings.englishLang")}
                </span>
              </div>
              <p className="text-[12px] text-[#68708A] truncate leading-tight">
                {t("settings.englishLangDesc")}
              </p>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                language === "en"
                  ? "bg-[#1B6EF3] text-white shadow-2xs"
                  : "border border-slate-300 text-transparent"
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Theme Setting (Exact Visual Match to User Picture with Platform Active Color) */}
      <div className="space-y-3 pt-4 border-t border-[#E6E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#111965]">
              {t("settings.themeTitle")}
            </h3>
            <p className="text-[12px] text-[#68708A]">
              {t("settings.themeDesc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
          {/* Card 1: Light Mode */}
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className={cn(
              "p-3 rounded-2xl text-left transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group h-full",
              theme === "light"
                ? "bg-white border-2 border-[#1B6EF3] shadow-xs"
                : "bg-white border border-[#E6E8F0] hover:border-slate-300 hover:shadow-xs"
            )}
          >
            {/* Mockup Window Preview (Light Mode) */}
            <div className="w-full h-24 sm:h-26 rounded-xl bg-[#F1F5F9] border border-slate-200/90 p-2 flex flex-col justify-between overflow-hidden relative shadow-2xs">
              {/* Window Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="w-12 h-1.5 bg-slate-300 rounded-full ml-1" />
                </div>
              </div>

              {/* Active Checkmark Pill (Top Right, matching picture) */}
              {theme === "light" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs ring-2 ring-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Window Content Body */}
              <div className="flex items-stretch gap-1.5 flex-1 mt-1.5">
                {/* Mini Sidebar */}
                <div className="w-9 bg-white/70 rounded-md p-1 space-y-1 flex flex-col justify-center">
                  <span className="w-6 h-1 bg-slate-300 rounded-xs block" />
                  <span className="w-4 h-1 bg-slate-300 rounded-xs block" />
                </div>
                {/* Mini Content Card */}
                <div className="flex-1 bg-white rounded-md p-1.5 shadow-2xs space-y-1 flex flex-col justify-center border border-slate-100">
                  <span className="w-14 h-2 bg-slate-700 rounded-xs block" />
                  <span className="w-20 h-1 bg-slate-200 rounded-xs block" />
                  <span className="w-16 h-1 bg-slate-200 rounded-xs block" />
                </div>
              </div>
            </div>

            {/* Bottom Label: Icon + Title + Description */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Sun className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="text-xs font-black text-[#111965] block leading-tight truncate">
                  {getLocalized({ km: "ទម្រង់ពន្លឺ (Light)", en: "Light" })}
                </span>
                <span className="text-[12.5px] text-[#68708A] block leading-tight truncate">
                  {getLocalized({ km: "ផ្ទៃភ្លឺច្បាស់ ងាយស្រួលមើលពេលថ្ងៃ", en: "Bright & clear daytime look" })}
                </span>
              </div>
            </div>
          </button>

          {/* Card 2: Dark Mode */}
          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={cn(
              "p-3 rounded-2xl text-left transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group h-full",
              theme === "dark"
                ? "bg-white border-2 border-[#1B6EF3] shadow-xs"
                : "bg-white border border-[#E6E8F0] hover:border-slate-300 hover:shadow-xs"
            )}
          >
            {/* Mockup Window Preview (Dark Mode) */}
            <div className="w-full h-24 sm:h-26 rounded-xl bg-[#0F172A] border border-slate-800 p-2 flex flex-col justify-between overflow-hidden relative shadow-2xs">
              {/* Window Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="w-12 h-1.5 bg-slate-700 rounded-full ml-1" />
                </div>
              </div>

              {/* Active Checkmark Pill (Top Right, matching picture) */}
              {theme === "dark" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs ring-2 ring-slate-900">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Window Content Body */}
              <div className="flex items-stretch gap-1.5 flex-1 mt-1.5">
                {/* Mini Dark Sidebar */}
                <div className="w-9 bg-slate-800/80 rounded-md p-1 space-y-1 flex flex-col justify-center">
                  <span className="w-6 h-1 bg-slate-600 rounded-xs block" />
                  <span className="w-4 h-1 bg-slate-600 rounded-xs block" />
                </div>
                {/* Mini Dark Content Card */}
                <div className="flex-1 bg-[#1E293B] rounded-md p-1.5 space-y-1 flex flex-col justify-center border border-slate-700/60 shadow-2xs">
                  <span className="w-14 h-2 bg-slate-400 rounded-xs block" />
                  <span className="w-20 h-1 bg-slate-600 rounded-xs block" />
                  <span className="w-16 h-1 bg-slate-600 rounded-xs block" />
                </div>
              </div>
            </div>

            {/* Bottom Label: Icon + Title + Description */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Moon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="text-xs font-black text-[#111965] block leading-tight truncate">
                  {getLocalized({ km: "ទម្រង់ងងឹត (Dark)", en: "Dark" })}
                </span>
                <span className="text-[12.5px] text-[#68708A] block leading-tight truncate">
                  {getLocalized({ km: "ផ្ទៃងងឹត ជួយការពារភ្នែកពេលយប់", en: "60-30-10 charcoal workspace" })}
                </span>
              </div>
            </div>
          </button>

          {/* Card 3: System Mode (Split Light/Dark, Exact Match to Picture) */}
          <button
            type="button"
            onClick={() => handleThemeChange("system")}
            className={cn(
              "p-3 rounded-2xl text-left transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group h-full",
              theme === "system"
                ? "bg-white border-2 border-[#1B6EF3] shadow-xs"
                : "bg-white border border-[#E6E8F0] hover:border-slate-300 hover:shadow-xs"
            )}
          >
            {/* Mockup Window Preview (Split 50% Light / 50% Dark) */}
            <div className="w-full h-24 sm:h-26 rounded-xl border border-slate-200/90 overflow-hidden relative shadow-2xs flex">
              {/* Left Half: Light Preview */}
              <div className="w-1/2 h-full bg-[#F1F5F9] p-1.5 flex flex-col justify-between border-r border-slate-200">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
                <div className="bg-white rounded-md p-1.5 mt-1 flex-1 space-y-1 flex flex-col justify-center shadow-2xs">
                  <span className="w-10 h-2 bg-slate-700 rounded-xs block" />
                  <span className="w-12 h-1 bg-slate-200 rounded-xs block" />
                </div>
              </div>

              {/* Right Half: Dark Preview */}
              <div className="w-1/2 h-full bg-[#0F172A] p-1.5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="w-8 h-1.5 bg-slate-700 rounded-full" />
                </div>
                <div className="bg-[#1E293B] rounded-md p-1.5 mt-1 flex-1 space-y-1 flex flex-col justify-center border border-slate-700/60 shadow-2xs">
                  <span className="w-10 h-2 bg-slate-400 rounded-xs block" />
                  <span className="w-12 h-1 bg-slate-600 rounded-xs block" />
                </div>
              </div>

              {/* Active Checkmark Pill (Top Right, matching picture) */}
              {theme === "system" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs ring-2 ring-slate-900">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Bottom Label: Icon + Title + Description */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="text-xs font-black text-[#111965] block leading-tight truncate">
                  {getLocalized({ km: `តាមប្រព័ន្ធ (${resolvedTheme === "dark" ? "Dark" : "Light"})`, en: `System (${resolvedTheme === "dark" ? "Dark" : "Light"})` })}
                </span>
                <span className="text-[12.5px] text-[#68708A] block leading-tight truncate">
                  {getLocalized({ km: "កែសម្រួលស្វ័យប្រវត្តិតាមឧបករណ៍", en: "Follows macOS & OS settings" })}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Auto-save notification note */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[12px] text-[#68708A]">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span>{t("settings.savedAutomatically")}</span>
      </div>
    </div>
  );
}
