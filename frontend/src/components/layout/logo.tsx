import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isLight?: boolean;
  showText?: boolean;
}

export function Logo({ className, isLight = false, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Geometric Compass & Forward-Vector Mark */}
      <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#111965] shadow-sm transition-transform duration-200 group-hover:scale-105 border border-[#1E277A]">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Vertical F Stem / Compass Axis */}
          <path
            d="M10 8C10 7.44772 10.4477 7 11 7H14C14.5523 7 15 7.44772 15 8V28C15 28.5523 14.5523 29 14 29H11C10.4477 29 10 28.5523 10 28V8Z"
            fill="white"
          />
          {/* Upper Directional Forward Chevron */}
          <path
            d="M15 8L24.5 13.5L15 19V8Z"
            fill="#F7CE4D"
          />
          {/* Middle Crossbar */}
          <path
            d="M15 17H21C21.5523 17 22 17.4477 22 18V20C22 20.5523 21.5523 21 21 21H15V17Z"
            fill="white"
            fillOpacity="0.85"
          />
          {/* North-East Discovery Star Pointer */}
          <circle cx="26" cy="10" r="2.5" fill="#F7CE4D" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xl font-bold tracking-tight leading-none",
              isLight ? "text-white" : "text-[#111965]"
            )}
          >
            FUTERA
          </span>
          <span
            className={cn(
              "text-[10px] tracking-wider uppercase font-medium leading-tight mt-0.5",
              isLight ? "text-slate-300" : "text-[#68708A]"
            )}
          >
            Education & Direction
          </span>
        </div>
      )}
    </Link>
  );
}
