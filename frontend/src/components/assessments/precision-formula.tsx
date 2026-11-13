"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

type Variant = "dark" | "light";

const PILLARS = [
  {
    weight: 30,
    color: "#F59E0B",
    nameEn: "RIASEC interests",
    nameKm: "ចំណាប់អារម្មណ៍ RIASEC",
    noteEn: "Holland code",
    noteKm: "កូដ Holland",
  },
  {
    weight: 25,
    color: "#2563EB",
    nameEn: "16-Personality",
    nameKm: "បុគ្គលិកលក្ខណៈ ១៦",
    noteEn: "Cognitive style",
    noteKm: "របៀបគិត",
  },
  {
    weight: 25,
    color: "#10B981",
    nameEn: "BACII stream",
    nameKm: "ថ្នាក់បាក់ឌុប",
    noteEn: "Grade 12",
    noteKm: "ថ្នាក់ ១២",
  },
  {
    weight: 20,
    color: "#9333EA",
    nameEn: "Labor market",
    nameKm: "ទីផ្សារការងារ",
    noteEn: "NEA data",
    noteKm: "ទិន្នន័យ NEA",
  },
] as const;

/**
 * The 4-pillar weighting, drawn as one stacked bar with the legend aligned
 * under each segment so a label never has to be matched to a colour by eye.
 *
 * `dark` sits on the navy assessment hero; `light` on white sections.
 * The bar and legend animate themselves on first view, so pages just place
 * the component — no external timeline needed.
 */
export function PrecisionFormula({
  variant = "dark",
  className,
  title,
}: {
  variant?: Variant;
  className?: string;
  title?: string;
}) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const isDark = variant === "dark";
  const rootRef = React.useRef<HTMLElement>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => setRevealed(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const segmentClass = cn(
    "h-full rounded-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    revealed ? "scale-x-100" : "scale-x-0"
  );

  const segmentStyle = (index: number) => ({
    transformOrigin: "left center",
    transitionDelay: `${120 + index * 80}ms`,
  });

  const legendClass = cn(
    "transition duration-500 ease-out motion-reduce:transition-none",
    revealed ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
  );

  const legendDelay = (index: number) => ({ transitionDelay: `${380 + index * 60}ms` });

  const heading =
    title ?? (isKm ? "រូបមន្តផ្គូផ្គង ១០០%" : "The 100% matching formula");

  const summary = isKm
    ? "រូបមន្តផ្គូផ្គង៖ RIASEC ៣០%, បុគ្គលិកលក្ខណៈ ២៥%, ថ្នាក់បាក់ឌុប ២៥%, ទីផ្សារការងារ ២០%"
    : "Matching formula: RIASEC 30%, 16-Personality 25%, BACII stream 25%, labor market 20%";

  return (
    <figure
      ref={rootRef}
      aria-label={summary}
      className={cn(
        "rounded-2xl p-4 sm:p-5",
        isDark
          ? "border border-white/12 bg-white/[0.07] backdrop-blur-md"
          : "border border-[#E6E8F0] bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 text-[14px] font-bold",
            isDark ? "text-white" : "text-[#111965]"
          )}
        >
          <BarChart3
            className={cn("h-4 w-4", isDark ? "text-[#F7CE4D]" : "text-[#111965]")}
          />
          {heading}
        </span>

        <span
          className={cn(
            "shrink-0 text-[12px] font-semibold tabular-nums",
            isDark ? "text-white/45" : "text-[#68708A]"
          )}
        >
          {isKm ? "សរុប" : "Total"}{" "}
          <span className={isDark ? "text-white/85" : "text-[#111965]"}>100%</span>
        </span>
      </div>

      <div
        className="mt-3 flex h-9 w-full gap-1.5 sm:h-10"
        aria-hidden="true"
      >
        {PILLARS.map((pillar, index) => (
          <div
            key={pillar.nameEn}
            className={segmentClass}
            style={{
              flexGrow: pillar.weight,
              flexBasis: 0,
              backgroundColor: pillar.color,
              ...segmentStyle(index),
            }}
          />
        ))}
      </div>

      {/* Legend shares the segments' flex ratios, so each label sits exactly
          under its own block. Hidden on small screens, where it would crush. */}
      <div className="mt-3 hidden gap-1.5 sm:flex">
        {PILLARS.map((pillar, index) => (
          <div
            key={pillar.nameEn}
            className={cn("min-w-0", legendClass)}
            style={{
              flexGrow: pillar.weight,
              flexBasis: 0,
              ...legendDelay(index),
            }}
          >
            <p
              className={cn(
                "text-[14px] font-extrabold leading-none tabular-nums",
                isDark ? "text-white" : "text-[#111965]"
              )}
            >
              {pillar.weight}%
            </p>
            <p
              className={cn(
                "mt-1 truncate text-[12.5px] font-semibold leading-snug",
                isDark ? "text-white/70" : "text-[#171A2C]"
              )}
            >
              {isKm ? pillar.nameKm : pillar.nameEn}
            </p>
            <p
              className={cn(
                "truncate text-[12px] leading-snug",
                isDark ? "text-white/40" : "text-[#68708A]"
              )}
            >
              {isKm ? pillar.noteKm : pillar.noteEn}
            </p>
          </div>
        ))}
      </div>

      {/* Small screens: two rows, weight first. */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:hidden">
        {PILLARS.map((pillar, index) => (
          <div
            key={pillar.nameEn}
            className={cn("flex items-start gap-2", legendClass)}
            style={legendDelay(index)}
          >
            <span
              aria-hidden="true"
              className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: pillar.color }}
            />
            <div className="min-w-0">
              <dt
                className={cn(
                  "text-[12.5px] font-bold leading-snug",
                  isDark ? "text-white/85" : "text-[#171A2C]"
                )}
              >
                {isKm ? pillar.nameKm : pillar.nameEn}
              </dt>
              <dd
                className={cn(
                  "text-[12px] leading-snug tabular-nums",
                  isDark ? "text-white/45" : "text-[#68708A]"
                )}
              >
                {pillar.weight}% · {isKm ? pillar.noteKm : pillar.noteEn}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </figure>
  );
}
