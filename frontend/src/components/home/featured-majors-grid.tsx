"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Code2,
  BrainCircuit,
  Building2,
  Coins,
  Briefcase,
  Globe2,
  ArrowRight,
  Compass,
  RefreshCw,
  WifiOff,
  AlertCircle,
} from "lucide-react";

/* ==========================================================================
   AUTHENTIC ANIMATED PARTICLE WAVE & HALFTONE GRAPHICS
   (Modeled with precision directly after the reference design)
   ========================================================================== */

/**
 * 1. Software Engineering: Topographic Contour Wave Lines (Violet -> Cyan)
 * Modeled after Card 1 (MSMI Media UX Award)
 */
function ContourWaveGraphic() {
  const paths = [
    { d: "M 25 240 C 65 160 80 195 120 130 C 145 85 185 120 235 50", o: 0.95 },
    { d: "M 40 240 C 78 165 92 200 130 135 C 155 92 192 125 235 70", o: 0.88 },
    { d: "M 55 240 C 90 170 105 205 140 142 C 165 100 200 130 235 90", o: 0.8 },
    { d: "M 70 240 C 102 178 116 210 150 150 C 175 110 206 138 235 110", o: 0.72 },
    { d: "M 85 240 C 115 185 130 215 160 158 C 185 120 214 145 235 130", o: 0.64 },
    { d: "M 100 240 C 128 192 142 220 170 168 C 192 130 220 152 235 148", o: 0.55 },
    { d: "M 115 240 C 140 200 155 225 180 178 C 200 142 226 160 235 165", o: 0.46 },
    { d: "M 130 240 C 152 208 166 230 190 188 C 208 154 230 168 235 180", o: 0.38 },
    { d: "M 145 240 C 165 215 178 235 200 198 C 215 166 232 176 235 195", o: 0.3 },
    { d: "M 160 240 C 178 222 190 238 210 208 C 220 178 234 184 235 210", o: 0.22 },
  ];

  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        className="w-[175px] h-[175px] sm:w-[195px] sm:h-[195px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        <defs>
          <linearGradient id="contourGradLive" x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="url(#contourGradLive)"
            strokeWidth="1.9"
            strokeLinecap="round"
            opacity={p.o}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `contourBreathe 4.5s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.18).toFixed(2)}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// Precomputed static particle strands for Data Science & AI (rounded to 1 decimal place to eliminate SSR/hydration diffs)
const PARTICLE_STRANDS: { cx: number; cy: number; r: number; fill: string; o: number; delay: number }[] = (() => {
  const items = [];
  const rows = 12;
  const cols = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = c / (cols - 1);
      const wave1 = Math.sin(t * Math.PI * 1.5 - 0.5) * 44;
      const wave2 = Math.cos(t * Math.PI * 2.0) * 10;
      const rawCx = 45 + t * 180 + r * 2.6;
      const rawCy = 230 - t * 165 + wave1 + wave2 + r * 6.5;

      const isCore = r >= 3 && r <= 8;
      const rawR = isCore ? 1.7 + ((r + c) % 3) * 0.5 : 1.1 + ((r + c) % 2) * 0.4;

      let fill = "#38BDF8";
      if (r < 3) {
        fill = "#FBBF24"; // golden warm top/outer
      } else if (r < 7) {
        fill = "#34D399"; // emerald/mint mid
      } else if (r < 10) {
        fill = "#38BDF8"; // cyan
      } else {
        fill = "#60A5FA"; // blue
      }

      const rawO = (0.28 + (c / cols) * 0.65) * (isCore ? 1.0 : 0.6);
      const rawDelay = (c * 0.12 + r * 0.08) % 3.0;

      items.push({
        cx: Math.round(rawCx * 10) / 10,
        cy: Math.round(rawCy * 10) / 10,
        r: Math.round(rawR * 10) / 10,
        fill,
        o: Math.round(rawO * 100) / 100,
        delay: Math.round(rawDelay * 100) / 100,
      });
    }
  }
  return items;
})();

/**
 * 2. Data Science & AI: Harmonic Particle Wave / Dot Matrix Wave
 * Modeled after Card 2 (Apple Design Award)
 */
function ParticleDotWaveGraphic() {
  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        suppressHydrationWarning
        className="w-[185px] h-[185px] sm:w-[205px] sm:h-[205px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        {PARTICLE_STRANDS.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={s.fill}
            opacity={s.o}
            suppressHydrationWarning
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `particleWaveGlow 3.5s ease-in-out infinite alternate`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const CHEVRON_PATHS = [
  { d: "M 35 240 L 175 100 L 240 165", delay: 0 },
  { d: "M 72 240 L 175 137 L 240 202", delay: 0.2 },
  { d: "M 110 240 L 175 175 L 235 240", delay: 0.4 },
  { d: "M 148 240 L 175 213 L 202 240", delay: 0.6 },
];

/**
 * 3. Civil Engineering: Architectural Geometric Chevron Beams
 * Modeled after Card 3 (Yellow Dot Design Award)
 */
function ChevronBeamsGraphic() {
  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        className="w-[175px] h-[175px] sm:w-[195px] sm:h-[195px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        <defs>
          <linearGradient id="chevronShine" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <g>
          {CHEVRON_PATHS.map((p, i) => (
            <path
              key={i}
              d={p.d}
              stroke="url(#chevronShine)"
              strokeWidth="11"
              strokeLinecap="square"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `chevronBeamPulse 3.2s ease-in-out infinite alternate`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// Precomputed static halftone dots for Banking & Finance (rounded to 1 decimal place to eliminate SSR/hydration diffs)
const HALFTONE_DOTS: { cx: number; cy: number; r: number; o: number; delay: number }[] = (() => {
  const items = [];
  const rings = 9;

  for (let ring = 1; ring <= rings; ring++) {
    const count = ring * 6 + 2;
    const radius = ring * 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.38;
      const jitterR = (Math.sin(i * 3.7 + ring) * 0.12) * radius;
      const rawCx = 172 + Math.cos(angle) * (radius + jitterR);
      const rawCy = 178 + Math.sin(angle) * (radius + jitterR);

      const normalizedDist = ring / rings;
      const sizeBase = Math.sin(normalizedDist * Math.PI) * 4.2 + 1.3;
      const rawR = Math.max(1.2, sizeBase + ((i % 3) * 0.5));
      const rawO = 0.35 + (1 - normalizedDist * 0.5) * 0.6;
      const rawDelay = (ring * 0.25 + i * 0.05) % 3.0;

      items.push({
        cx: Math.round(rawCx * 10) / 10,
        cy: Math.round(rawCy * 10) / 10,
        r: Math.round(rawR * 10) / 10,
        o: Math.round(rawO * 100) / 100,
        delay: Math.round(rawDelay * 100) / 100,
      });
    }
  }
  return items;
})();

/**
 * 4. Banking & Finance: Radial Halftone / Stippling Dot Cluster
 * Modeled after Card 4 (Indiana's Best Design)
 */
function HalftoneClusterGraphic() {
  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        suppressHydrationWarning
        className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        {HALFTONE_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="#22C55E"
            opacity={d.o}
            suppressHydrationWarning
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `halftoneTwinkle 3.6s ease-in-out infinite alternate`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * 5. Business Administration: Curved Diagonal Line Hatching
 * Modeled after Card 5 (UMO UX India Award)
 */
function DiagonalHatchGraphic() {
  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        className="w-[175px] h-[175px] sm:w-[195px] sm:h-[195px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        <defs>
          <clipPath id="hatchOvalClip">
            <ellipse
              cx="198"
              cy="188"
              rx="92"
              ry="112"
              transform="rotate(-20 198 188)"
            />
          </clipPath>
          <linearGradient id="hatchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
        <g
          clipPath="url(#hatchOvalClip)"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: `hatchFloatPulse 3.8s ease-in-out infinite alternate`,
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const offset = i * 15 - 90;
            return (
              <line
                key={i}
                x1={offset}
                y1={270}
                x2={offset + 190}
                y2={45}
                stroke="url(#hatchGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                opacity={0.92}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: `hatchStripeWave 2.8s ease-in-out infinite alternate`,
                  animationDelay: `${((i * 0.12) % 2.4).toFixed(2)}s`,
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/**
 * 6. International Relations: Dynamic Stippling Dash Constellation
 * Modeled after Card 6 (Best Music Album)
 */
function StipplingDashesGraphic() {
  const dashes = [
    { x1: 145, y1: 120, x2: 158, y2: 134, w: 4.5, o: 0.95 },
    { x1: 174, y1: 110, x2: 190, y2: 126, w: 4.5, o: 0.9 },
    { x1: 196, y1: 104, x2: 204, y2: 122, w: 4.0, o: 0.75 },
    { x1: 135, y1: 144, x2: 150, y2: 154, w: 4.5, o: 0.8 },
    { x1: 162, y1: 138, x2: 178, y2: 147, w: 5.2, o: 0.95 },
    { x1: 190, y1: 134, x2: 206, y2: 150, w: 4.5, o: 0.85 },
    { x1: 216, y1: 132, x2: 228, y2: 148, w: 4.0, o: 0.75 },
    { x1: 118, y1: 168, x2: 130, y2: 180, w: 4.0, o: 0.75 },
    { x1: 142, y1: 165, x2: 160, y2: 175, w: 5.2, o: 0.92 },
    { x1: 176, y1: 162, x2: 194, y2: 178, w: 4.8, o: 0.9 },
    { x1: 206, y1: 158, x2: 222, y2: 172, w: 4.5, o: 0.8 },
    { x1: 125, y1: 198, x2: 140, y2: 212, w: 4.5, o: 0.85 },
    { x1: 154, y1: 194, x2: 172, y2: 205, w: 5.2, o: 0.95 },
    { x1: 184, y1: 192, x2: 200, y2: 208, w: 4.8, o: 0.88 },
    { x1: 214, y1: 188, x2: 228, y2: 204, w: 4.2, o: 0.78 },
    { x1: 138, y1: 228, x2: 152, y2: 238, w: 4.5, o: 0.8 },
    { x1: 168, y1: 224, x2: 184, y2: 236, w: 4.8, o: 0.9 },
    { x1: 196, y1: 222, x2: 212, y2: 235, w: 4.5, o: 0.85 },
    { x1: 224, y1: 218, x2: 236, y2: 230, w: 4.0, o: 0.7 },
    { x1: 130, y1: 114, x2: 140, y2: 126, w: 3.5, o: 0.65 },
    { x1: 210, y1: 114, x2: 220, y2: 128, w: 3.5, o: 0.7 },
    { x1: 108, y1: 188, x2: 118, y2: 200, w: 3.5, o: 0.65 },
    { x1: 228, y1: 220, x2: 238, y2: 230, w: 3.5, o: 0.65 },
  ];

  return (
    <div className="relative w-full h-full flex items-end justify-end overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        className="w-[175px] h-[175px] sm:w-[195px] sm:h-[195px] translate-x-1 translate-y-1 transition-transform duration-700 ease-out group-hover:scale-110"
      >
        {dashes.map((d, i) => (
          <line
            key={i}
            x1={d.x1}
            y1={d.y1}
            x2={d.x2}
            y2={d.y2}
            stroke="#EF4444"
            strokeWidth={d.w}
            strokeLinecap="round"
            opacity={d.o}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `dashFloatDance 3.6s ease-in-out infinite alternate`,
              animationDelay: `${((i * 0.14) % 3.0).toFixed(2)}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ==========================================================================
   FEATURED MAJORS MAPPING & COMPONENT
   ========================================================================== */

const MAJOR_VISUAL_MAP: Record<
  string,
  {
    icon: React.ElementType;
    iconBg: string;
    graphic: React.FC;
  }
> = {
  "software-engineering": {
    icon: Code2,
    iconBg: "bg-[#8B5CF6]",
    graphic: ContourWaveGraphic,
  },
  "data-science-ai": {
    icon: BrainCircuit,
    iconBg: "bg-[#0284C7]",
    graphic: ParticleDotWaveGraphic,
  },
  "civil-engineering": {
    icon: Building2,
    iconBg: "bg-[#EAB308]",
    graphic: ChevronBeamsGraphic,
  },
  "banking-finance": {
    icon: Coins,
    iconBg: "bg-[#22C55E]",
    graphic: HalftoneClusterGraphic,
  },
  "business-administration": {
    icon: Briefcase,
    iconBg: "bg-[#F97316]",
    graphic: DiagonalHatchGraphic,
  },
  "international-relations": {
    icon: Globe2,
    iconBg: "bg-[#EF4444]",
    graphic: StipplingDashesGraphic,
  },
};

export function FeaturedMajorsGrid() {
  const { t, getLocalized, language } = useLanguage();

  const {
    data: majorsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["featured-majors-landing"],
    queryFn: async () => {
      return apiFetch<any[]>("/majors");
    },
    retry: 1,
  });

  const majors = useMemo(() => {
    return (majorsData || []).slice(0, 6);
  }, [majorsData]);

  return (
    <section
      id="featured-majors-section"
      className="py-18 lg:py-24 bg-[#FAFBFD] text-[#111965] border-b border-[#E6E8F0] relative overflow-hidden select-none"
    >
      {/* Dynamic Keyframe Animations for all 6 patterns */}
      <style>{`
        @keyframes contourBreathe {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translateY(-6px) scale(1.03);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.75;
          }
        }
        @keyframes particleWaveGlow {
          0% {
            opacity: 0.3;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.28);
          }
          100% {
            opacity: 0.35;
            transform: scale(0.8);
          }
        }
        @keyframes chevronBeamPulse {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-7px) scale(1.04);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
        }
        @keyframes halftoneTwinkle {
          0% {
            opacity: 0.25;
            transform: scale(0.7);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
          100% {
            opacity: 0.35;
            transform: scale(0.75);
          }
        }
        @keyframes hatchFloatPulse {
          0% {
            transform: translateY(0px) scale(0.97);
            opacity: 0.85;
          }
          50% {
            transform: translateY(-6px) scale(1.03);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(0.97);
            opacity: 0.85;
          }
        }
        @keyframes hatchStripeWave {
          0% {
            opacity: 0.45;
            transform: scaleY(0.9);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.06);
          }
          100% {
            opacity: 0.45;
            transform: scaleY(0.9);
          }
        }
        @keyframes dashFloatDance {
          0% {
            transform: translateY(0px) scale(0.85);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-8px) scale(1.15) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(0.85);
            opacity: 0.5;
          }
        }
      `}</style>

      {/* Subtle Background Radial Aura */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("featuredMajors.badge")}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111965] tracking-tight">
              {t("featuredMajors.title")}
            </h2>

            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
              {t("featuredMajors.subtitle")}
            </p>
          </div>

          <Link
            href="/majors"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] shadow-2xs hover:shadow-sm transition-all duration-200 self-start sm:self-auto hover:translate-x-0.5"
          >
            <span>{t("featuredMajors.viewAll")}</span>
            <ArrowRight className="w-4 h-4 text-[#F69D0D]" />
          </Link>
        </div>

        {/* Loading State with Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-[20px] bg-white dark:bg-[#0c1236]/90 border border-[#E6E8F0] dark:border-white/10 p-6 sm:p-7 min-h-[310px] sm:min-h-[330px] flex flex-col justify-between overflow-hidden shadow-2xs relative"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-12 h-12 rounded-[14px]" />
                  <Skeleton className="w-20 h-5 rounded-full" />
                </div>
                <div className="space-y-3 my-auto py-3">
                  <Skeleton className="w-24 h-4 rounded-md" />
                  <Skeleton className="w-48 h-6 rounded-lg" />
                  <Skeleton className="w-36 h-4 rounded-md" />
                </div>
                <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <Skeleton className="w-28 h-4 rounded-md" />
                  <Skeleton className="w-16 h-4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : isError || !majors || majors.length === 0 ? (
          /* Error / Failed to Fetch State */
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto my-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {language === "km" ? "មិនអាចទាញយកទិន្នន័យជំនាញសិក្សាបានឡើយ" : "Unable to Load University Majors"}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                {language === "km"
                  ? "ប្រព័ន្ធមិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើទិន្នន័យ (API Server) បានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬចុចព្យាយាមម្តងទៀត។"
                  : "We couldn't connect to the academic directory server. Please check your internet connection or try again."}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>{language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}</span>
              </button>
              <Link
                href="/majors"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>{language === "km" ? "មើលបញ្ជីជំនាញទាំងអស់" : "Browse All Majors"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* 2 ROWS x 3 COLUMNS GRID OF CRISP WHITE CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majors.map((m: any) => {
              const visual = MAJOR_VISUAL_MAP[m.slug] || {
                icon: Code2,
                iconBg: "bg-[#8B5CF6]",
                graphic: ContourWaveGraphic,
              };
              const GraphicComponent = visual.graphic;
              const IconComponent = visual.icon;
              const tag = m.riasec_primary && m.riasec_secondary
                ? `RIASEC: ${m.riasec_primary}${m.riasec_secondary}`
                : "RIASEC";
              const categoryLabel = t(`categories.${m.category}`, m.category);
              const title = getLocalized(m.name);
              const campuses = `${m.universities_count || 0} ${t("featuredMajors.campuses")}`;

              return (
                <Link
                  key={m.id}
                  href={`/majors/${m.slug}`}
                  className="group relative rounded-[20px] bg-white hover:bg-slate-50/70 border border-[#E6E8F0] hover:border-slate-300 p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-[0_8px_24px_rgba(17,25,101,0.04)] hover:shadow-[0_16px_36px_rgba(17,25,101,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 min-h-[310px] sm:min-h-[330px] h-full cursor-pointer"
                >
                  {/* Top Row: Icon Badge (Left) & Tag (Right) */}
                  <div className="flex items-center justify-between z-10 relative">
                    <div
                      className={`w-12 h-12 rounded-[14px] ${visual.iconBg} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-108`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-[#68708A] font-mono tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
                      {tag}
                    </span>
                  </div>

                  {/* Middle Area: Clean Category Subtitle, Major Title & Degree */}
                  <div className="z-10 relative space-y-1.5 my-auto py-3 max-w-[70%] sm:max-w-[72%]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#68708A]">
                      {categoryLabel}
                    </div>
                    <h3 className="text-lg sm:text-[22px] font-extrabold text-[#111965] tracking-tight leading-snug group-hover:text-[#0284C7] transition-colors duration-200">
                      {title}
                    </h3>
                    <div className="text-xs sm:text-sm text-[#68708A] font-medium pt-0.5">
                      {t("featuredMajors.bachelor")} {m.is_stem ? "• STEM" : ""}
                    </div>
                  </div>

                  {/* Bottom Row: Campuses / University Info */}
                  <div className="z-10 relative pt-3.5 border-t border-slate-100 flex items-center justify-between max-w-[70%] sm:max-w-[72%]">
                    <span className="text-xs text-[#68708A] font-medium">
                      {campuses}
                    </span>
                  </div>

                  {/* Large Corner Graphic Pattern with Continuous Animation */}
                  <div className="absolute bottom-0 right-0 w-[48%] h-[50%] sm:w-[46%] sm:h-[48%] pointer-events-none overflow-hidden rounded-br-[20px]">
                    <GraphicComponent />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
