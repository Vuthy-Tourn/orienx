"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Code2,
  BrainCircuit,
  Building2,
  Coins,
  Briefcase,
  Globe2,
  ArrowRight,
  Compass,
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
              animation: `particleWaveGlow 3.5s ease-in-out infinite alternate`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

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
        <g style={{ animation: `chevronPulse 4s ease-in-out infinite alternate` }}>
          <path
            d="M 35 240 L 175 100 L 240 165"
            stroke="url(#chevronShine)"
            strokeWidth="11"
            strokeLinecap="square"
          />
          <path
            d="M 72 240 L 175 137 L 240 202"
            stroke="url(#chevronShine)"
            strokeWidth="11"
            strokeLinecap="square"
          />
          <path
            d="M 110 240 L 175 175 L 235 240"
            stroke="url(#chevronShine)"
            strokeWidth="11"
            strokeLinecap="square"
          />
          <path
            d="M 148 240 L 175 213 L 202 240"
            stroke="url(#chevronShine)"
            strokeWidth="11"
            strokeLinecap="square"
          />
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
          style={{ animation: `hatchBreath 3.8s ease-in-out infinite alternate` }}
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
                  animation: `hatchLineShimmer 3s ease-in-out infinite alternate`,
                  animationDelay: `${((i * 0.1) % 2.5).toFixed(2)}s`,
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
   FEATURED MAJORS DATA (6 Verified Majors)
   ========================================================================== */

interface MajorCardItem {
  id: string;
  slug: string;
  icon: React.ElementType;
  iconBg: string;
  tag: string;
  categoryEn: string;
  categoryKm: string;
  titleEn: string;
  titleKm: string;
  metaEn: string;
  metaKm: string;
  locationEn: string;
  locationKm: string;
  graphic: React.FC;
}

export function FeaturedMajorsGrid() {
  const { language } = useLanguage();

  const majors: MajorCardItem[] = [
    {
      id: "software-engineering",
      slug: "software-engineering",
      icon: Code2,
      iconBg: "bg-[#8B5CF6]", // Xbox style purple
      tag: "RIASEC: IRE",
      categoryEn: "Information Technology",
      categoryKm: "បច្ចេកវិទ្យាព័ត៌មាន",
      titleEn: "Software Engineering",
      titleKm: "វិស្វកម្មកម្មវិធី",
      metaEn: "B.S. • $500 – $2,500/mo",
      metaKm: "បរិញ្ញាបត្រ • $500 – $2,500",
      locationEn: "Phnom Penh • 4 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៤ ឆ្នាំ",
      graphic: ContourWaveGraphic,
    },
    {
      id: "data-science-ai",
      slug: "data-science-ai",
      icon: BrainCircuit,
      iconBg: "bg-[#0284C7]", // Apple style sky blue
      tag: "RIASEC: IRC",
      categoryEn: "Artificial Intelligence",
      categoryKm: "បញ្ញាសិប្បនិម្មិត & AI",
      titleEn: "Data Science & AI",
      titleKm: "វិទ្យាសាស្ត្រទិន្នន័យ & AI",
      metaEn: "High-Growth • $600 – $3,000/mo",
      metaKm: "តម្រូវការខ្ពស់ • $600 – $3,000",
      locationEn: "Phnom Penh • 4 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៤ ឆ្នាំ",
      graphic: ParticleDotWaveGraphic,
    },
    {
      id: "civil-engineering",
      slug: "civil-engineering",
      icon: Building2,
      iconBg: "bg-[#EAB308]", // Yellow Dot style gold
      tag: "RIASEC: RIC",
      categoryEn: "Engineering & Architecture",
      categoryKm: "វិស្វកម្ម & ស្ថាបត្យកម្ម",
      titleEn: "Civil Engineering",
      titleKm: "វិស្វកម្មសំណង់ស៊ីវិល",
      metaEn: "National CTI • $450 – $2,200/mo",
      metaKm: "វិស្វករ CTI • $450 – $2,200",
      locationEn: "Phnom Penh • 5 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៥ ឆ្នាំ",
      graphic: ChevronBeamsGraphic,
    },
    {
      id: "banking-finance",
      slug: "banking-finance",
      icon: Coins,
      iconBg: "bg-[#22C55E]", // Play style emerald green
      tag: "RIASEC: CEI",
      categoryEn: "Banking & Finance",
      categoryKm: "ធនាគារ & ហិរញ្ញវត្ថុ",
      titleEn: "Banking & Finance",
      titleKm: "ធនាគារ & ហិរញ្ញវត្ថុ",
      metaEn: "FinTech • $450 – $2,200/mo",
      metaKm: "ទីផ្សារទុន • $450 – $2,200",
      locationEn: "Phnom Penh • 4 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៤ ឆ្នាំ",
      graphic: HalftoneClusterGraphic,
    },
    {
      id: "business-administration",
      slug: "business-administration",
      icon: Briefcase,
      iconBg: "bg-[#F97316]", // UMO style amber-orange
      tag: "RIASEC: ECS",
      categoryEn: "Business & Management",
      categoryKm: "ពាណិជ្ជកម្ម & ការគ្រប់គ្រង",
      titleEn: "Business Administration",
      titleKm: "រដ្ឋបាលពាណិជ្ជកម្ម",
      metaEn: "Leadership • $400 – $2,000/mo",
      metaKm: "ភាពជាអ្នកដឹកនាំ • $400 – $2,000",
      locationEn: "Phnom Penh • 4 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៤ ឆ្នាំ",
      graphic: DiagonalHatchGraphic,
    },
    {
      id: "international-relations",
      slug: "international-relations",
      icon: Globe2,
      iconBg: "bg-[#EF4444]", // TikTok style coral red
      tag: "RIASEC: SAE",
      categoryEn: "Global Affairs & Policy",
      categoryKm: "ការទូត & កិច្ចការអន្តរជាតិ",
      titleEn: "International Relations",
      titleKm: "ទំនាក់ទំនងអន្តរជាតិ",
      metaEn: "Diplomacy • $400 – $1,800/mo",
      metaKm: "កិច្ចការបរទេស • $400 – $1,800",
      locationEn: "Phnom Penh • 4 Years",
      locationKm: "រាជធានីភ្នំពេញ • ៤ ឆ្នាំ",
      graphic: StipplingDashesGraphic,
    },
  ];

  return (
    <section
      id="featured-majors-section"
      className="py-18 lg:py-24 bg-[#FAFBFD] text-[#111965] border-b border-[#E6E8F0] relative overflow-hidden select-none"
    >
      {/* Dynamic Keyframe Animations for all 6 patterns */}
      <style jsx global>{`
        @keyframes contourBreathe {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.85;
          }
          100% {
            transform: translateY(-5px) scale(1.02);
            opacity: 1;
          }
        }
        @keyframes particleWaveGlow {
          0% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.22);
          }
          100% {
            opacity: 0.45;
            transform: scale(0.95);
          }
        }
        @keyframes chevronPulse {
          0% {
            opacity: 0.85;
            transform: translateY(0px);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px);
          }
          100% {
            opacity: 0.85;
            transform: translateY(0px);
          }
        }
        @keyframes halftoneTwinkle {
          0% {
            opacity: 0.4;
            transform: scale(0.88);
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
          }
          100% {
            opacity: 0.45;
            transform: scale(0.92);
          }
        }
        @keyframes hatchBreath {
          0% {
            opacity: 0.88;
            transform: translateY(0px);
          }
          100% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }
        @keyframes hatchLineShimmer {
          0% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }
        @keyframes dashFloatDance {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.75;
          }
          50% {
            transform: translateY(-3px) rotate(3deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.75;
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
              <span>
                {language === "km"
                  ? "ជំនាញសិក្សាឆ្នើមនៅកម្ពុជា"
                  : "Verified Academic Pathways"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111965] tracking-tight">
              {language === "km"
                ? "ជំនាញសាកលវិទ្យាល័យដែលពេញនិយម"
                : "Explore University Majors"}
            </h2>

            <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
              {language === "km"
                ? "ស្វែងយល់ពីមុខវិជ្ជាសិក្សា ជំនាញដែលត្រូវការ និងឱកាសការងារជាក់ស្តែងនៅកម្ពុជា"
                : "Discover curricula, foundational skills, and verified career opportunities in Cambodia."}
            </p>
          </div>

          <Link
            href="/majors"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] shadow-2xs hover:shadow-sm transition-all duration-200 self-start sm:self-auto hover:translate-x-0.5"
          >
            <span>{language === "km" ? "មើលជំនាញទាំងអស់" : "View All Majors"}</span>
            <ArrowRight className="w-4 h-4 text-[#F69D0D]" />
          </Link>
        </div>

        {/* ===================================================================
            2 ROWS x 3 COLUMNS GRID OF CRISP WHITE CARDS
            (Matching the exact spacing, typography and graphic size from reference)
            =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {majors.map((m) => {
            const GraphicComponent = m.graphic;
            const IconComponent = m.icon;

            return (
              <Link
                key={m.id}
                href={`/majors/${m.slug}`}
                className="group relative rounded-[20px] bg-white hover:bg-slate-50/70 border border-[#E6E8F0] hover:border-slate-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_8px_24px_rgba(17,25,101,0.04)] hover:shadow-[0_16px_36px_rgba(17,25,101,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 min-h-[300px] sm:min-h-[320px] aspect-[1/0.95] cursor-pointer"
              >
                {/* Top Row: Icon Badge (Left) & Tag/Date (Right) */}
                <div className="flex items-center justify-between z-10 relative">
                  <div
                    className={`w-12 h-12 rounded-[14px] ${m.iconBg} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-108`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-[#68708A] font-mono tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
                    {m.tag}
                  </span>
                </div>

                {/* Middle Area: Clean Category Subtitle, Major Title & Degree */}
                <div className="z-10 relative space-y-1.5 my-auto pt-5 max-w-[62%]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#68708A]">
                    {language === "km" ? m.categoryKm : m.categoryEn}
                  </div>
                  <h3 className="text-xl sm:text-[22px] font-extrabold text-[#111965] tracking-tight leading-snug group-hover:text-[#0284C7] transition-colors duration-200">
                    {language === "km" ? m.titleKm : m.titleEn}
                  </h3>
                  <div className="text-xs sm:text-sm text-[#68708A] font-medium pt-0.5">
                    {language === "km" ? m.metaKm : m.metaEn}
                  </div>
                </div>

                {/* Bottom Row: Location / University Info */}
                <div className="z-10 relative pt-4 border-t border-slate-100 flex items-center justify-between max-w-[62%]">
                  <span className="text-xs text-[#68708A] font-medium">
                    {language === "km" ? m.locationKm : m.locationEn}
                  </span>
                </div>

                {/* Large Corner Graphic Pattern with Continuous Animation */}
                <div className="absolute bottom-0 right-0 w-[55%] h-[58%] pointer-events-none overflow-hidden rounded-br-[20px]">
                  <GraphicComponent />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
