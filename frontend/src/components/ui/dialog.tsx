"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /** Hide the built-in close button when the caller renders its own. */
  hideClose?: boolean;
}

export function Dialog({ open, onOpenChange, children, className, hideClose = false }: DialogProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);
  const onOpenChangeRef = React.useRef(onOpenChange);

  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChangeRef.current(false);
    };
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    surfaceRef.current?.focus();

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0F3D]/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Surface */}
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn("relative z-50 w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E6E8F0] animate-in zoom-in-95 duration-200 focus:outline-none dark:border-white/10 dark:bg-[#090D24]", className)}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 rounded-xl p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] transition-colors dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg sm:text-xl font-bold text-[#111965] dark:text-white", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs sm:text-sm text-[#68708A] leading-relaxed dark:text-slate-400", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-4 border-t border-[#E6E8F0] dark:border-white/10", className)} {...props} />;
}

