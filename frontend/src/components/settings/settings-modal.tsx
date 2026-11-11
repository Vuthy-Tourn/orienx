"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { SettingsPanel } from "./settings-panel";
import { Settings, X } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar bg-white rounded-3xl border border-[#E6E8F0] shadow-2xl p-6 sm:p-7 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111965] text-[#F7CE4D] flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#111965] tracking-tight">
                {t("settings.settingsModalTitle")}
              </h2>
              <p className="text-xs text-[#68708A]">
                {t("settings.settingsModalSubtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Content Body */}
        <SettingsPanel />

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-[#111965] hover:bg-[#1E277A] shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {t("common.done", "រួចរាល់ / Done")}
          </button>
        </div>
      </div>
    </div>
  );
}

