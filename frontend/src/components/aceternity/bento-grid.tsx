import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition-all duration-300 p-6 bg-white border border-[#E6E8F0] justify-between flex flex-col space-y-4 hover:border-[#111965]/30 relative overflow-hidden",
        className
      )}
    >
      {/* Subtle cursor highlight gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F2FA]/50 via-transparent to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity pointer-events-none" />

      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 z-10 space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-[#F0F2FA] text-[#111965] flex items-center justify-center mb-2 shadow-2xs">
          {icon}
        </div>
        <div className="font-bold text-[#111965] text-base leading-snug">
          {title}
        </div>
        <div className="font-normal text-[#68708A] text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}

