import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "accent" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#111965] text-white",
    secondary: "bg-[#F0F2FA] text-[#111965]",
    accent: "bg-[#F7CE4D] text-[#111965] font-bold",
    outline: "border border-[#E6E8F0] text-[#171A2C] bg-white",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

