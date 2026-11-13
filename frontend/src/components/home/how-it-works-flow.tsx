"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Flag,
  BarChart3,
  Sparkles,
  GraduationCap,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HowItWorksFlow() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const primaryPathRef = useRef<SVGPathElement>(null);
  const secondaryPathRef = useRef<SVGPathElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const textBlocksRef = useRef<(HTMLDivElement | null)[]>([]);
  const watermarksRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Helper to remove redundant leading numbers for clean editorial typography
  const cleanTitle = (raw: string) => {
    return raw.replace(/^[0-9១-៩]+[\.\s\:\-]+\s*/, "");
  };

  // 4 Steps alternating: UP -> DOWN -> UP -> DOWN
  // Symmetrically spaced across 1200px: 12.5%, 37.5%, 62.5%, 87.5%
  const steps = [
    {
      num: "01",
      watermark: "1",
      title: cleanTitle(t("howItWorks.step1Title")),
      desc: t("howItWorks.step1Desc"),
      icon: Flag,
      iconFill: true,
      position: "above" as const, // UP
      nodeX: 150,
      nodeY: 300,
      href: "/dashboard/assessments/personality",
    },
    {
      num: "02",
      watermark: "2",
      title: cleanTitle(t("howItWorks.step2Title")),
      desc: t("howItWorks.step2Desc"),
      icon: BarChart3,
      iconFill: false,
      position: "below" as const, // DOWN
      nodeX: 450,
      nodeY: 180,
      href: "/dashboard/assessments/preferences",
    },
    {
      num: "03",
      watermark: "3",
      title: cleanTitle(t("howItWorks.step3Title")),
      desc: t("howItWorks.step3Desc"),
      icon: Sparkles,
      iconFill: true,
      position: "above" as const, // UP
      nodeX: 750,
      nodeY: 300,
      href: "/dashboard/recommendations",
    },
    {
      num: "04",
      watermark: "4",
      title: cleanTitle(t("howItWorks.step4Title")),
      desc: t("howItWorks.step4Desc"),
      icon: GraduationCap,
      iconFill: false,
      position: "below" as const, // DOWN
      nodeX: 1050,
      nodeY: 180,
      href: "/universities",
    },
  ];

  // Mathematical Bezier Wave alternating through the 4 nodes (viewBox 0 0 1200 520)
  // Continuous horizontal tangents at every node crest and trough
  const mainWaveD =
    "M 0 280 C 65 285, 105 300, 150 300 C 270 300, 330 180, 450 180 C 570 180, 630 300, 750 300 C 870 300, 930 180, 1050 180 C 1110 180, 1155 195, 1200 205";

  // Echo blueprint curve offset downward for visual depth
  const echoWaveD =
    "M 0 292 C 65 297, 105 312, 150 312 C 270 312, 330 192, 450 192 C 570 192, 630 312, 750 312 C 870 312, 930 192, 1050 192 C 1110 192, 1155 207, 1200 217";

  const runAnimation = () => {
    if (!primaryPathRef.current) return;

    const path = primaryPathRef.current;
    const echoPath = secondaryPathRef.current;
    const totalLength = path.getTotalLength();

    // Prepare path dash offsets
    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;
    if (echoPath) {
      const echoLen = echoPath.getTotalLength();
      echoPath.style.strokeDasharray = `${echoLen}`;
      echoPath.style.strokeDashoffset = `${echoLen}`;
    }

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setAnimationCompleted(true),
      });
      timelineRef.current = tl;

      // Set initial states with explicit xPercent / yPercent so GSAP preserves exact centering
      nodesRef.current.forEach((node) => {
        if (node) gsap.set(node, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
      });
      textBlocksRef.current.forEach((block, idx) => {
        const isAbove = steps[idx].position === "above";
        if (block) gsap.set(block, { xPercent: -50, opacity: 0, y: isAbove ? -14 : 14 });
      });
      watermarksRef.current.forEach((wm) => {
        if (wm) gsap.set(wm, { opacity: 0, scale: 0.8, y: 12 });
      });

      // 4 Sequential GSAP Steps (1:1 with each icon node):
      // ==========================================
      // STEP 1: Path reaches Node 1 (UP: x=150, y=300)
      // ==========================================
      tl.to(
        path,
        {
          strokeDashoffset: totalLength * 0.77,
          duration: 0.7,
          ease: "power2.inOut",
        },
        0
      );
      if (echoPath) {
        tl.to(
          echoPath,
          {
            strokeDashoffset: totalLength * 0.77,
            duration: 0.7,
            ease: "power2.inOut",
          },
          0.04
        );
      }
      tl.to(
        nodesRef.current[0],
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2.2)",
        },
        0.58
      );
      tl.to(
        watermarksRef.current[0],
        {
          opacity: 0.85,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.65
      );
      tl.to(
        textBlocksRef.current[0],
        {
          xPercent: -50,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        0.7
      );

      // ==========================================
      // STEP 2: Path reaches Node 2 (DOWN: x=450, y=180)
      // ==========================================
      tl.to(
        path,
        {
          strokeDashoffset: totalLength * 0.52,
          duration: 0.7,
          ease: "power2.inOut",
        },
        1.1
      );
      if (echoPath) {
        tl.to(
          echoPath,
          {
            strokeDashoffset: totalLength * 0.52,
            duration: 0.7,
            ease: "power2.inOut",
          },
          1.14
        );
      }
      tl.to(
        nodesRef.current[1],
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2.2)",
        },
        1.68
      );
      tl.to(
        watermarksRef.current[1],
        {
          opacity: 0.85,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        1.75
      );
      tl.to(
        textBlocksRef.current[1],
        {
          xPercent: -50,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        1.8
      );

      // ==========================================
      // STEP 3: Path reaches Node 3 (UP: x=750, y=300)
      // ==========================================
      tl.to(
        path,
        {
          strokeDashoffset: totalLength * 0.26,
          duration: 0.7,
          ease: "power2.inOut",
        },
        2.2
      );
      if (echoPath) {
        tl.to(
          echoPath,
          {
            strokeDashoffset: totalLength * 0.26,
            duration: 0.7,
            ease: "power2.inOut",
          },
          2.24
        );
      }
      tl.to(
        nodesRef.current[2],
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2.2)",
        },
        2.78
      );
      tl.to(
        watermarksRef.current[2],
        {
          opacity: 0.85,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        2.85
      );
      tl.to(
        textBlocksRef.current[2],
        {
          xPercent: -50,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        2.9
      );

      // ==========================================
      // STEP 4: Path reaches Node 4 (DOWN: x=1050, y=180) & Exits
      // ==========================================
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.inOut",
        },
        3.3
      );
      if (echoPath) {
        tl.to(
          echoPath,
          {
            strokeDashoffset: 0,
            duration: 0.7,
            ease: "power2.inOut",
          },
          3.34
        );
      }
      tl.to(
        nodesRef.current[3],
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2.2)",
        },
        3.88
      );
      tl.to(
        watermarksRef.current[3],
        {
          opacity: 0.85,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        3.95
      );
      tl.to(
        textBlocksRef.current[3],
        {
          xPercent: -50,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        4.0
      );
    }, sectionRef);

    return () => ctx.revert();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const path = primaryPathRef.current;
    const echoPath = secondaryPathRef.current;
    if (path) {
      const totalLength = path.getTotalLength();
      path.style.strokeDasharray = `${totalLength}`;
      path.style.strokeDashoffset = `${totalLength}`;
    }
    if (echoPath) {
      const echoLen = echoPath.getTotalLength();
      echoPath.style.strokeDasharray = `${echoLen}`;
      echoPath.style.strokeDashoffset = `${echoLen}`;
    }

    // Pre-hide all elements with exact xPercent/yPercent so GSAP preserves exact centering
    nodesRef.current.forEach((node) => {
      if (node) gsap.set(node, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    });
    textBlocksRef.current.forEach((block, idx) => {
      const isAbove = steps[idx].position === "above";
      if (block) gsap.set(block, { xPercent: -50, opacity: 0, y: isAbove ? -14 : 14 });
    });
    watermarksRef.current.forEach((wm) => {
      if (wm) gsap.set(wm, { opacity: 0, scale: 0.8, y: 12 });
    });

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 55%", // Wait until the user scrolls down and this section enters the active viewport
      onEnter: () => {
        runAnimation();
      },
      once: true,
    });

    return () => {
      trigger.kill();
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 py-20 lg:py-28 bg-[#FAFBFD] text-[#111965] border-b border-[#E6E8F0] overflow-hidden select-none"
    >
      {/* Background Ambient Glow & Corner Watermark */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-blue-500/[0.035] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-amber-500/[0.035] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* =====================================================================
            TOP HEADER: Styled exactly like Picture 1 (— category — + Bold Title)
            ===================================================================== */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3 mb-14 lg:mb-16">
          {/* Subtle Category Pill with Dashes */}
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.25em] text-[#0284C7] font-bold uppercase">
            <span className="w-7 h-[1.5px] bg-[#0284C7]/40 rounded-full" />
            <span>{t("howItWorks.badge")}</span>
            <span className="w-7 h-[1.5px] bg-[#0284C7]/40 rounded-full" />
          </div>

          {/* Clean Main Title with Cyan/Blue Accent Dot */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111965] tracking-tight">
            {t("howItWorks.title")}
            <span className="text-[#0284C7]">.</span>
          </h2>

          {/* Refined Subtitle */}
          <p className="text-sm sm:text-base text-[#68708A] max-w-xl font-normal leading-relaxed">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* =====================================================================
            DESKTOP VIEW: Continuous Wave with UP-DOWN-UP-DOWN Pattern
            ===================================================================== */}
        <div className="hidden lg:block relative w-full h-[520px] my-4">
          {/* SVG Canvas with Fluid Dual-Stroke Sine Wave */}
          <svg
            ref={svgRef}
            viewBox="0 0 1200 520"
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Vibrant Cyan to Royal Blue Gradient */}
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="35%" stopColor="#0284C7" />
                <stop offset="70%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#111965" />
              </linearGradient>

              {/* Echo Path Gradient */}
              <linearGradient id="echoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.2" />
              </linearGradient>

              {/* Soft Ambient Node Glow Filter */}
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ghost / Echo Wave Line (Secondary Accent) */}
            <path
              ref={secondaryPathRef}
              d={echoWaveD}
              fill="none"
              stroke="url(#echoGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1450"
              strokeDashoffset="1450"
            />

            {/* Primary Fluid Wave Line */}
            <path
              ref={primaryPathRef}
              d={mainWaveD}
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="1450"
              strokeDashoffset="1450"
            />

            {/* Traveling Light Pulse Bead along the path */}
            {animationCompleted && (
              <circle r="4" fill="#00B4D8" filter="url(#softGlow)">
                <animateMotion
                  path={mainWaveD}
                  dur="7s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            )}
          </svg>

          {/* ===================================================================
              4 COLUMNS: UP -> DOWN -> UP -> DOWN (NO HOVER EFFECTS)
              =================================================================== */}
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const leftPct = (step.nodeX / 1200) * 100;
            const nodeTopPct = (step.nodeY / 520) * 100;
            const isAbove = step.position === "above";

            return (
              <React.Fragment key={idx}>
                {/* 1. FLOATING GLOWING NODE BADGE (Stable, No Hover Pop) */}
                <div
                  ref={(el) => {
                    nodesRef.current[idx] = el;
                  }}
                  style={{
                    left: `${leftPct}%`,
                    top: `${nodeTopPct}%`,
                  }}
                  className="absolute z-20"
                >
                  {/* Ambient Soft Blue Halo Glow */}
                  <div className="absolute -inset-4 rounded-full bg-cyan-400/25 blur-xl pointer-events-none opacity-80" />

                  {/* High-End Floating White Badge */}
                  <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-[0_12px_28px_rgba(2,132,199,0.22),0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center">
                    <IconComponent
                      className={`w-6 h-6 text-[#0284C7] ${
                        step.iconFill ? "fill-[#0284C7]/20" : ""
                      }`}
                    />

                    {/* Step Number Tag Pill: '01', '02', '03', '04' */}
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#111965] text-white text-[12.5px] font-black tracking-tight shadow-md border-2 border-white select-none">
                      {step.num}
                    </span>

                    {/* Bottom Progress Dot */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                  </div>
                </div>

                {/* 2. DEDICATED CONNECTOR STEM LINKING NODE DIRECTLY TO CARD */}
                <div
                  style={{
                    left: `${leftPct}%`,
                    ...(isAbove
                      ? {
                          bottom: `calc(${100 - nodeTopPct}% + 18px)`,
                          height: "40px",
                        }
                      : {
                          top: `calc(${nodeTopPct}% + 18px)`,
                          height: "40px",
                        }),
                  }}
                  className="absolute -translate-x-1/2 w-0.5 border-l-2 border-dashed border-sky-300/80 pointer-events-none"
                />

                {/* 3. STEP CONTENT BLOCK (UP or DOWN directly anchored to node) */}
                <div
                  ref={(el) => {
                    textBlocksRef.current[idx] = el;
                  }}
                  style={{
                    left: `${leftPct}%`,
                    ...(isAbove
                      ? { bottom: `calc(${100 - nodeTopPct}% + 58px)` } // UP: above node
                      : { top: `calc(${nodeTopPct}% + 58px)` }), // DOWN: below node
                  }}
                  className="absolute w-64 xl:w-72 z-10"
                >
                  {/* Clean Editorial Content Card (Number fully visible, never overridden) */}
                  <div className="relative p-5 rounded-2xl bg-white border border-slate-100/90 shadow-[0_4px_20px_rgba(2,132,199,0.04)] overflow-hidden">
                    {/* Step Watermark Number - INSIDE card on top of background so it is never overridden */}
                    <div
                      ref={(el) => {
                        watermarksRef.current[idx] = el;
                      }}
                      className="absolute top-3 right-4 text-4xl lg:text-5xl font-black text-slate-300 select-none pointer-events-none leading-none tracking-tight"
                    >
                      {step.watermark}
                    </div>

                    <div className="relative z-10">
                      {/* Step Pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/60 text-[#0284C7] text-[12px] font-bold tracking-wide mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                        <span>STEP {step.num}</span>
                      </div>

                      {/* Clean Title */}
                      <h3 className="text-base font-bold tracking-tight text-[#111965] pr-10 leading-snug">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#68708A] leading-relaxed mt-1.5 font-normal">
                        {step.desc}
                      </p>

                      {/* Subtle Action Link */}
                      <Link
                        href={step.href}
                        className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#0284C7] mt-3 transition-colors hover:text-[#2563EB]"
                      >
                        <span>{t("howItWorks.learnMore")}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* =====================================================================
            MOBILE / TABLET VIEW: Responsive Staggered Flow Timeline (< lg)
            ===================================================================== */}
        <div className="lg:hidden relative space-y-6 pt-4">
          {/* Vertical Connecting Line */}
          <div className="absolute top-8 bottom-8 left-7 w-0.5 bg-gradient-to-b from-[#00B4D8] via-[#0284C7] to-[#111965] -translate-x-1/2" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={idx}
                className="relative flex items-start gap-5 pl-2"
              >
                {/* Mobile Floating Node Badge */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-md" />
                  <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-[0_8px_20px_rgba(2,132,199,0.2)] flex items-center justify-center">
                    <IconComponent
                      className={`w-5 h-5 text-[#0284C7] ${
                        step.iconFill ? "fill-[#0284C7]/20" : ""
                      }`}
                    />
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-[#111965] text-white text-[12px] font-black border border-white">
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-2 relative overflow-hidden">
                  {/* Faint Watermark Number */}
                  <div className="absolute -top-3 -right-1 text-5xl font-black text-slate-100 select-none pointer-events-none">
                    {step.watermark}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] text-[12px] font-bold">
                    <span>STEP {step.num}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965]">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#68708A] leading-relaxed">
                    {step.desc}
                  </p>

                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] pt-1"
                  >
                    <span>{t("howItWorks.learnMore")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
