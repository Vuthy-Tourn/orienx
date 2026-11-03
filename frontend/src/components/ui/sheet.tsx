"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

export function Sheet({ open, onOpenChange, children, side = "right", className }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideAnimations = {
    left: "inset-y-0 left-0 w-full max-w-sm border-r border-[#E6E8F0] animate-in slide-in-from-left duration-250",
    right: "inset-y-0 right-0 w-full max-w-sm border-l border-[#E6E8F0] animate-in slide-in-from-right duration-250",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-[#E6E8F0] animate-in slide-in-from-bottom duration-250",
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0F3D]/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Content Surface */}
      <div
        className={cn(
          "fixed z-50 bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between",
          sideAnimations[side],
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 rounded-xl p-2 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] transition-colors"
          aria-label="Close sheet"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 mb-6 pr-8", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-bold text-[#111965]", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-[#68708A]", className)} {...props} />;
}
