import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isLight?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * CompassStarLogoMark - Precision SVG reproduction of the Futera brand logo (Pic 4)
 * Featuring:
 * - Circular compass ring with direction points (W, S, E) in deep midnight navy & royal blue
 * - Educational pathway / road leading forward in perspective
 * - Dynamic compass needle pointing North-East with dual-tone 3D golden facets
 * - Radiant 5-point future star bursting with dynamic spark droplets
 */
export function CompassStarLogoMark({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="compassRingGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        <linearGradient id="needleLightGold" x1="45" y1="58" x2="78" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        <linearGradient id="needleDarkGold" x1="48" y1="62" x2="80" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="starGlowGrad" x1="68" y1="12" x2="94" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <filter id="starGlow" x="50" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* --- COMPASS OUTER RING & DIRECTION POINTS --- */}
      {/* West Direction Point (9 o'clock) */}
      <polygon points="18,62 30,58 30,66" fill="#1E3A8A" />

      {/* South Direction Point (6 o'clock) */}
      <polygon points="56,102 52,90 60,90" fill="#1E3A8A" />

      {/* East Direction Point (3 o'clock) */}
      <polygon points="94,62 82,58 82,66" fill="#2563EB" />

      {/* Main Outer Compass Ring */}
      <circle
        cx="56"
        cy="62"
        r="30"
        stroke="url(#compassRingGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Inner Compass Frame Ring */}
      <circle
        cx="56"
        cy="62"
        r="23"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeDasharray="2 3"
      />

      {/* --- ROAD / PATHWAY IN PERSPECTIVE (Education Direction) --- */}
      {/* Road Trapeze Surface */}
      <path
        d="M49 88L53 66H59L63 88C60 90 52 90 49 88Z"
        fill="#0F172A"
        opacity="0.9"
      />
      {/* Road Lane Dashes */}
      <line x1="56" y1="84" x2="56" y2="79" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="75" x2="56" y2="71" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="56" y1="68" x2="56" y2="66" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

      {/* --- COMPASS NEEDLE --- */}
      {/* South-West Rear Needle (Navy/Indigo) */}
      <polygon points="56,62 38,78 52,66" fill="#1E293B" />
      <polygon points="56,62 38,78 56,66" fill="#0F172A" />

      {/* North-East Forward Needle (Golden 3D Facets) */}
      {/* Upper Facet (Light Gold) */}
      <polygon
        points="56,62 76,26 62,56"
        fill="url(#needleLightGold)"
      />
      {/* Lower Facet (Warm Amber Gold) */}
      <polygon
        points="56,62 76,26 68,66"
        fill="url(#needleDarkGold)"
      />

      {/* Central Needle Pivot */}
      <circle cx="56" cy="62" r="4.5" fill="#0B132B" stroke="#FBBF24" strokeWidth="1.5" />
      <circle cx="56" cy="62" r="1.5" fill="#FEF08A" />

      {/* --- RADIANT GOLDEN FUTURE STAR (Tip of Needle) --- */}
      <g filter="url(#starGlow)">
        {/* 5-Pointed Star at ~ (76, 26) */}
        <polygon
          points="76,14 80,23 90,23 82,29 85,38 76,32 67,38 70,29 62,23 72,23"
          fill="url(#starGlowGrad)"
        />

        {/* Dynamic Light Droplets / Sparks Shooting Outward */}
        {/* Top-Right Spark */}
        <path d="M88 16C90 14 93 12 94 11C94 13 92 16 90 18Z" fill="#FDE047" />
        {/* Top Spark */}
        <path d="M76 8C77 6 78 4 79 3C78 6 77 8 76 8Z" fill="#FDE047" />
        {/* Right Spark */}
        <path d="M93 28C95 29 98 30 100 30C97 31 94 30 92 29Z" fill="#FDE047" />
        {/* Upper-Left Accent Sparkle */}
        <circle cx="70" cy="14" r="1.5" fill="#FEF08A" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  isLight = false,
  showText = true,
  size = "md",
}: LogoProps) {
  const boxSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group select-none", className)}
    >
      {/* Brand Icon Badge with Compass-Star Mark */}
      <div
        className={cn(
          "relative flex-shrink-0 flex items-center justify-center rounded-xl bg-[#0B132B] shadow-sm transition-transform duration-200 group-hover:scale-105 border border-[#1E293B] p-1 overflow-hidden",
          boxSizes[size]
        )}
      >
        <CompassStarLogoMark className="w-full h-full" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-black tracking-tight leading-none",
              size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl",
              isLight ? "text-white" : "text-[#111965]"
            )}
          >
            FUTERA
          </span>
          <span
            className={cn(
              "text-[10px] tracking-wider uppercase font-semibold leading-tight mt-0.5",
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
