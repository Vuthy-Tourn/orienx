"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  showArrow?: boolean;
}

export function AuthButton({
  children,
  loading = false,
  loadingLabel,
  showArrow = true,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-[#F7CE4D] px-5 text-[13.5px] font-black tracking-[-0.01em] text-[#111965] shadow-[0_18px_34px_-20px_rgba(247,206,77,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F5C83B] hover:shadow-[0_22px_40px_-20px_rgba(247,206,77,1)] active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#111965]/15 disabled:pointer-events-none disabled:opacity-60 dark:shadow-[0_18px_34px_-22px_rgba(247,206,77,0.65)]",
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {loading ? (
        <>
          <Loader2 className="relative h-4 w-4 animate-spin" />
          <span className="relative">{loadingLabel ?? children}</span>
        </>
      ) : (
        <span className="relative">{children}</span>
      )}
      {!loading && showArrow && (
        <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
