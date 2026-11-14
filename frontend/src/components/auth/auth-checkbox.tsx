"use client";

import React, { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  error?: string;
  className?: string;
  id?: string;
}

export function AuthCheckbox({
  checked,
  onChange,
  children,
  error,
  className,
  id,
}: AuthCheckboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-start gap-2.5">
        <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            data-checked={checked ? "true" : "false"}
            className={cn(
              "auth-checkbox-track flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border bg-white/[0.06] transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#F7CE4D]/20",
              error
                ? "border-rose-400/50"
                : "border-white/25"
            )}
          >
            <Check
              className={cn(
                "h-3 w-3 text-[#111965] transition-opacity duration-150",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
          </span>
        </span>

        <label
          htmlFor={inputId}
          className="cursor-pointer text-[12px] leading-[1.55] text-white/65 transition-colors duration-200 hover:text-white"
        >
          {children}
        </label>
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="animate-in fade-in slide-in-from-top-1 pl-[26px] text-[11.5px] font-medium text-rose-300 duration-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}
