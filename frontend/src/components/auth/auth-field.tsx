"use client";

import React, { useId, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  revealable?: boolean;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

export function AuthField({
  label,
  icon: Icon,
  error,
  hint,
  revealable = false,
  rightSlot,
  containerClassName,
  type = "text",
  className,
  id,
  ...inputProps
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  const { t, language } = useLanguage();
  const describedBy = [
    error ? `${inputId}-error` : null,
    hint ? `${inputId}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("group space-y-2", containerClassName)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className={cn(
            "font-black text-white/55 transition-colors duration-200 group-focus-within:text-[#F7CE4D]",
            language === "km"
              ? "text-[11.5px] tracking-normal"
              : "text-[10.5px] uppercase tracking-[0.16em]"
          )}
        >
          {label}
        </label>
        {rightSlot}
      </div>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 transition-colors duration-200",
            error
              ? "text-rose-300"
              : "text-white/40 group-focus-within:text-[#F7CE4D]"
          )}
        />

        <input
          {...inputProps}
          id={inputId}
          type={revealable ? (visible ? "text" : "password") : type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "h-[52px] w-full rounded-[14px] border bg-white/[0.07] pl-11 text-[14px] font-medium text-white caret-[#F7CE4D] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-white/35 hover:bg-white/[0.1] focus:bg-white/[0.12]",
            revealable ? "pr-12" : "pr-4",
            error
              ? "border-rose-400/50 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
              : "border-white/15 focus:border-[#F7CE4D]/80 focus:ring-4 focus:ring-[#F7CE4D]/10",
            className
          )}
        />

        {revealable && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={
              visible
                ? t("auth.hidePassword")
                : t("auth.showPassword")
            }
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7CE4D]/30"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="animate-in fade-in slide-in-from-top-1 text-[11.5px] font-medium text-rose-300 duration-200"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${inputId}-hint`}
          className="text-[11px] text-white/40"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
