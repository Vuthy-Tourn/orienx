"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import MagicBento, { type MagicBentoItem } from "@/components/MagicBento";
import { useLanguage } from "@/contexts/language-context";

export type ScientificPillar = {
  number: string;
  weight: string;
  titleEn: string;
  titleKm: string;
  categoryEn: string;
  categoryKm: string;
  descEn: string;
  descKm: string;
  proofEn: string;
  proofKm: string;
  ctaEn: string;
  ctaKm: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

/**
 * The 4-pillar grid, rendered through React Bits' MagicBento shell so each
 * card gets the spotlight, border glow, tilt and ripple.
 *
 * MagicBento only takes a numeric column count, so `.bento-pillars` in
 * globals.css collapses 4 → 2 → 1 at the sm/lg breakpoints.
 */
export function PillarsBento({ pillars }: { pillars: ScientificPillar[] }) {
  const { language } = useLanguage();
  const isKm = language === "km";

  const items: MagicBentoItem[] = pillars.map((pillar) => {
    const Icon = pillar.icon;

    return {
      id: pillar.number,
      content: (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span
              className="rounded-full border px-2.5 py-0.5 text-[12px] font-bold tabular-nums"
              style={{
                backgroundColor: `${pillar.color}10`,
                color: pillar.color,
                borderColor: `${pillar.color}33`,
              }}
            >
              {pillar.weight}
            </span>
          </div>

          <p className="mt-4 text-[11.5px] font-semibold leading-snug text-[#68708A]">
            <span className="font-bold text-[#111965]/70">
              {isKm ? `សសរ ${pillar.number}` : `Pillar ${pillar.number}`}
            </span>
            <span className="mx-1 text-[#68708A]/60">·</span>
            {isKm ? pillar.categoryKm : pillar.categoryEn}
          </p>

          <h3 className="mt-1.5 text-[15px] font-extrabold leading-snug text-[#111965]">
            {isKm ? pillar.titleKm : pillar.titleEn}
          </h3>

          <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-[#68708A]">
            {isKm ? pillar.descKm : pillar.descEn}
          </p>

          <div className="mt-auto pt-4">
            <div className="flex items-start gap-1.5 border-t border-[#E6E8F0] pt-3 text-[11.5px] font-semibold leading-snug text-[#68708A]">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="line-clamp-2">
                {isKm ? pillar.proofKm : pillar.proofEn}
              </span>
            </div>

            <Link
              href={pillar.href}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-transform hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
              style={{ color: pillar.color }}
            >
              <span>{isKm ? pillar.ctaKm : pillar.ctaEn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <MagicBento
        items={items}
        columns={4}
        rowHeight={400}
        gap={20}
        radius={24}
        theme="light"
        glowColor="#111965"
        spotlightRadius={300}
        enableBorderGlow
        enableSpotlight
        enableStars={false}
        enableTilt
        enableMagnetism={false}
        clickEffect
        intro
        textAutoHide={false}
        className="bento-pillars"
        style={
          {
            "--mb-ink": "#111965",
            "--mb-muted": "#68708A",
            "--mb-faint": "rgba(104, 112, 138, 0.45)",
            "--mb-surface": "#ffffff",
            "--mb-edge": "rgba(17, 25, 101, 0.10)",
            "--mb-highlight": "#ffffff",
            "--mb-shadow": "0 1px 2px rgba(17, 25, 101, 0.06)",
            "--mb-focus": "rgba(17, 25, 101, 0.45)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
