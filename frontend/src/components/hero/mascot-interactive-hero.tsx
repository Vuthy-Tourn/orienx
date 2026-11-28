"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import TechText from "@/components/react-bits/tech-text";

function getHeroScrollConfig(vw: number, vh: number) {
  if (vw >= 1024) {
    return {
      activation: 12,
      travelDistance: Math.min(440, Math.max(300, vh * 0.46)),
    };
  }
  return {
    activation: 10,
    travelDistance: Math.min(340, Math.max(220, vh * 0.36)),
  };
}

interface MascotRect {
  left: number;
  top: number;
  width: number;
  height: number;
  vw: number;
  vh: number;
}

export function MascotInteractiveHero() {
  const { t, getLocalized } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [taraBounce, setTaraBounce] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const mascotPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const portalRotateRef = useRef<HTMLDivElement | null>(null);
  const startRectRef = useRef<MascotRect | null>(null);
  const handoffRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [portalBox, setPortalBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const endWidth = 96;
    const endHeight = 104;

    const dispatchHandoff = (active: boolean) => {
      const globalWindow = window as Window & { __orienxHandoff?: boolean };
      globalWindow.__orienxHandoff = active;
      if (handoffRef.current === active) return;
      handoffRef.current = active;
      window.dispatchEvent(
        new CustomEvent("orienx:mascot-handoff", { detail: active })
      );
    };

    const measure = () => {
      const node = mascotPlaceholderRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      const next: MascotRect = {
        left: rect.left,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        vw: window.innerWidth,
        vh: window.innerHeight,
      };
      startRectRef.current = next;
      setPortalBox((prev) =>
        prev && Math.abs(prev.width - next.width) < 1 && Math.abs(prev.height - next.height) < 1
          ? prev
          : { width: next.width, height: next.height }
      );
    };

    const applyTransform = () => {
      rafRef.current = null;
      const box = startRectRef.current;
      const container = portalContainerRef.current;
      const rotator = portalRotateRef.current;
      if (!box) return;

      const scrollY = window.scrollY;
      const { activation, travelDistance } = getHeroScrollConfig(box.vw, box.vh);

      // Re-sync resting origin whenever near top so post-navigation font/layout shifts never leave stale coords
      if (scrollY <= activation) {
        const node = mascotPlaceholderRef.current;
        if (node) {
          const rect = node.getBoundingClientRect();
          if (rect.width >= 10) {
            box.left = rect.left;
            box.top = rect.top + scrollY;
            box.width = rect.width;
            box.height = rect.height;
          }
        }
      }

      const rawT = Math.min(1, Math.max(0, (scrollY - activation) / travelDistance));
      const eased = rawT * rawT * (3 - 2 * rawT);

      const endLeft = box.vw - 20 - endWidth;
      const endTop = box.vh - 20 - endHeight;
      const endScale = endWidth / box.width;

      const naturalTop = box.top - Math.min(scrollY, activation);
      const currentX = box.left + eased * (endLeft - box.left);
      const currentY = naturalTop + eased * (endTop - naturalTop);
      const currentScale = 1 + eased * (endScale - 1);
      const currentRotate = eased * -8;
      const currentOpacity = rawT <= 0.88 ? 1 : Math.max(0, 1 - (rawT - 0.88) / 0.12);

      if (container) {
        container.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(${currentScale.toFixed(4)})`;
        container.style.opacity = currentOpacity.toFixed(3);
      }
      if (rotator) {
        rotator.style.transform = `rotate(${currentRotate.toFixed(2)}deg)`;
      }

      dispatchHandoff(rawT >= 0.96);
    };

    const scheduleFrame = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(applyTransform);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const handleReducedScroll = () => {
        dispatchHandoff(window.scrollY > window.innerHeight * 0.45);
      };
      handleReducedScroll();
      window.addEventListener("scroll", handleReducedScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleReducedScroll);
        dispatchHandoff(false);
      };
    }

    const handleResize = () => {
      measure();
      scheduleFrame();
    };

    // Reset handoff immediately on mount so coming back from another page never flashes stuck state
    dispatchHandoff(false);
    measure();
    scheduleFrame();

    // Re-measure cleanly after Next.js route transition / fonts settle
    const settleTimer1 = window.setTimeout(handleResize, 60);
    const settleTimer2 = window.setTimeout(handleResize, 240);
    document.fonts?.ready?.then(handleResize).catch(() => {});

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mascotPlaceholderRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(mascotPlaceholderRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", scheduleFrame, { passive: true });
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.clearTimeout(settleTimer1);
      window.clearTimeout(settleTimer2);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", scheduleFrame);
      dispatchHandoff(false);
    };
  }, []);

  // Synchronously position the portal node before the first browser paint when portalBox mounts/resizes
  useLayoutEffect(() => {
    const box = startRectRef.current;
    const container = portalContainerRef.current;
    const rotator = portalRotateRef.current;
    if (!portalBox || !box || !container) return;

    const scrollY = window.scrollY;
    const { activation, travelDistance } = getHeroScrollConfig(box.vw, box.vh);
    const rawT = Math.min(1, Math.max(0, (scrollY - activation) / travelDistance));
    const eased = rawT * rawT * (3 - 2 * rawT);

    const endLeft = box.vw - 20 - 96;
    const endTop = box.vh - 20 - 104;
    const endScale = 96 / box.width;
    const naturalTop = box.top - Math.min(scrollY, activation);

    const x = box.left + eased * (endLeft - box.left);
    const y = naturalTop + eased * (endTop - naturalTop);
    const scale = 1 + eased * (endScale - 1);
    const opacity = rawT <= 0.88 ? 1 : Math.max(0, 1 - (rawT - 0.88) / 0.12);

    container.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    container.style.opacity = opacity.toFixed(3);
    if (rotator) {
      rotator.style.transform = `rotate(${(eased * -8).toFixed(2)}deg)`;
    }
  }, [portalBox]);

  useEffect(() => {
    const handler = (event: Event) => {
      setAssistantOpen(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener("orienx:assistant-visibility", handler);
    const globalWindow = window as Window & {
      __orienxAssistantOpen?: boolean;
    };
    if (typeof globalWindow.__orienxAssistantOpen === "boolean") {
      // Hydration-safe: state lives on the client only.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssistantOpen(globalWindow.__orienxAssistantOpen);
    }
    return () =>
      window.removeEventListener("orienx:assistant-visibility", handler);
  }, []);

  // Conversational dialogues from Tara (rotating automatically)
  const greetings = [
    {
      km: "សួស្តី! ខ្ញុំគឺ Tara មកស្វែងរកជំនាញ និងសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុតសម្រាប់អ្នកទាំងអស់គ្នា!",
      en: "Hey! I'm Tara, let's find your dream major and verified university in Cambodia together!",
    },
    {
      km: "ខ្ញុំនឹងជួយវិភាគលើបុគ្គលិកលក្ខណៈ និងចំណូលចិត្ត RIASEC របស់អ្នក ដើម្បីរកជំនាញដែលត្រូវ 100%!",
      en: "I'll analyze your MBTI personality and Holland RIASEC interests to recommend majors that fit you best!",
    },
    {
      km: "ស្វែងរកតម្លៃសិក្សា និងអាហារូបករណ៍ពិតប្រាកដនៅ RUPP, ITC Techno, AUPP, Paragon និង CADT!",
      en: "Explore verified tuition fees and real scholarships directly from official admissions portals!",
    },
    {
      km: "តេស្ត ៥ នាទីប៉ុណ្ណោះ ហើយឥតគិតថ្លៃ ១០០% សម្រាប់សិស្សានុសិស្សកម្ពុជាទាំងអស់! តោះចាប់ផ្តើម!",
      en: "Takes just 5 minutes and is 100% free for all students! Ready to uncover your unique strengths?",
    },
  ];

  const currentDialogue = greetings[currentIdx % greetings.length];
  const targetText = getLocalized(currentDialogue);

  // Smooth typewriter effect
  useEffect(() => {
    if (assistantOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTyping(true);
    setDisplayedSpeech("");

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < targetText.length) {
        setDisplayedSpeech(targetText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 20);

    return () => clearInterval(typeInterval);
  }, [targetText, assistantOpen]);

  // Once typing completes, leave a moment for the user to read (4.2 seconds), then automatically rotate to next message
  useEffect(() => {
    if (isTyping || isPaused || assistantOpen) return;

    const readTimer = setTimeout(() => {
      setTaraBounce(true);
      setTimeout(() => setTaraBounce(false), 450);
      setCurrentIdx((prev) => (prev + 1) % greetings.length);
    }, 4200);

    return () => clearTimeout(readTimer);
  }, [isTyping, isPaused, currentIdx, assistantOpen, greetings.length]);

  // Highlight Tara's name in speech
  const renderFormattedSpeech = (text: string) => {
    if (text.includes("Tara")) {
      const parts = text.split("Tara");
      return (
        <>
          {parts[0]}
          <span className="text-[#F7CE4D] font-bold">Tara</span>
          {parts.slice(1).join("Tara")}
        </>
      );
    }
    return text;
  };

  const advanceDialogue = () => {
    setTaraBounce(true);
    setTimeout(() => setTaraBounce(false), 450);
    setCurrentIdx((prev) => (prev + 1) % greetings.length);
  };

  return (
    <section className="relative w-full min-h-[calc(100svh-4rem)] lg:h-[calc(100vh-4rem)] flex items-center bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white border-b border-white/10 overflow-hidden pt-6 pb-10 sm:py-12 lg:py-0 select-none">
      {/* Subtle Radial Ambient Starlight Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,206,77,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1B6EF3]/12 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[450px] h-[450px] rounded-full bg-[#F7CE4D]/10 blur-[120px] pointer-events-none" />

      {/* Seamless Cambodian University Campuses Skyline Backdrop with Gradient Feather Mask (No Hard Seam!) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden h-[420px] sm:h-[520px] lg:h-[580px] z-0"
        style={{
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Image
          src="/images/cambodia-campuses-skyline-seamless.webp"
          alt="Cambodian University Campuses Backdrop"
          fill
          unoptimized
          priority
          className="object-cover object-bottom opacity-20 sm:opacity-25"
        />
        {/* Soft bottom-up blend to merge into stage bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F36]/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 lg:gap-14 items-center">
          {/* ===================================================================
              LEFT COLUMN: ORIENX TECHTEXT CENTERPIECE + SUBTITLE + CTAS
              =================================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-5 text-center lg:text-left">
            {/* Sleek Editorial Kicker (replaces redundant verified pill) */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase text-[#F7CE4D]/95">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-[#F7CE4D]/60 lg:hidden" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#F7CE4D] shadow-[0_0_8px_rgba(247,206,77,0.85)] shrink-0" />
              <span>
                {getLocalized({
                  en: "Cambodia's Career & University Guide",
                  km: "មគ្គុទ្ទេសក៍ជ្រើសរើសជំនាញ និងសាកលវិទ្យាល័យ",
                })}
              </span>
              <span className="h-px w-5 bg-gradient-to-l from-transparent to-[#F7CE4D]/60 lg:hidden" />
            </div>

            {/* Interactive TechText OrienX Wordmark: centered on mobile/tablet, left-aligned on desktop */}
            <div className="lg:hidden w-full max-w-[300px] sm:max-w-[380px] h-20 sm:h-28 mx-auto">
              <TechText
                text="OrienX"
                fontSize={150}
                fontWeight={800}
                color="#FFFFFF"
                accentColor="#F69D0D"
                align="center"
                lineStyle="dashed"
                labels={true}
                draggable={true}
                clickKick={true}
                intro="none"
                className="w-full h-full"
              />
            </div>

            <div className="hidden lg:block w-full max-w-[400px] h-30 -ml-1">
              <TechText
                text="OrienX"
                fontSize={150}
                fontWeight={800}
                color="#FFFFFF"
                accentColor="#F69D0D"
                align="left"
                lineStyle="dashed"
                labels={true}
                draggable={true}
                clickKick={true}
                intro="none"
                className="w-full h-full"
              />
            </div>

            {/* Subtitle */}
            <p className="text-[13px] sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed pt-0.5">
              {t("hero.subtitle")}
            </p>

            {/* Action CTAs */}
            <div className="pt-1.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <Link
                href="/assessments/riasec/test"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:px-7 sm:py-3.5 sm:text-sm md:text-base text-[#0F1754] dark:text-[#0F1754] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-[0_4px_24px_rgba(247,206,77,0.3)] hover:shadow-[0_6px_28px_rgba(247,206,77,0.45)] transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#0F1754]" />
                <span>{t("mascotHero.startFree")}</span>
                <ArrowRight className="w-4 h-4 text-[#0F1754]" />
              </Link>

              <Link
                href="/universities"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:px-6 sm:py-3.5 sm:text-sm md:text-base text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <Compass className="w-4 h-4 text-[#F7CE4D]" />
                <span>{t("mascotHero.exploreUniversities")}</span>
              </Link>
            </div>

            {/* Quiet, Minimal Trust Indicators */}
            <div className="pt-4 sm:pt-5 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 sm:gap-6 text-[11px] sm:text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.verifiedInfo")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.hollandEngine")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F7CE4D] flex-shrink-0" />
                <span>{t("mascotHero.freeForStudents")}</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: TARA MASCOT + FLOATING SPEECH BUBBLE (Wrapped inside hero bg on mobile)
              =================================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center relative lg:min-h-[480px]">
            <div className="relative w-full max-w-md sm:max-w-lg flex flex-col items-center justify-center">
              {/* Natural Conversational Speech Bubble */}
              {!assistantOpen && (
                <div
                  className="w-full lg:absolute lg:-top-6 lg:-left-6 xl:-left-25 z-50 max-w-sm sm:max-w-[340px] mb-3 lg:mb-0 cursor-pointer"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onClick={advanceDialogue}
                  title={t("mascotHero.nextTip")}
                >
                  <div className="relative rounded-2xl bg-[#0B1038]/90 backdrop-blur-xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-3.5 sm:p-4 transition-all hover:border-[#F7CE4D]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    {/* Subtle Bubble Header with Dialogue Indicator Dots */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white tracking-wide">
                          {t("mascotHero.guideBadge")}
                        </span>
                      </div>

                      {/* Interactive Carousel Progress Dots */}
                      <div className="flex items-center gap-1">
                        {greetings.map((_, i) => (
                          <span
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentIdx(i);
                              setTaraBounce(true);
                              setTimeout(() => setTaraBounce(false), 450);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              i === currentIdx % greetings.length
                                ? "w-4 bg-[#F7CE4D]"
                                : "w-1.5 bg-white/25 hover:bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Speech Message (Auto-types and rotates with read delay) */}
                    <div className="min-h-[44px] sm:min-h-[50px] flex items-center">
                      <p className="text-xs sm:text-[14px] font-medium text-slate-100 leading-relaxed">
                        {renderFormattedSpeech(displayedSpeech)}
                        {isTyping && (
                          <span className="inline-block w-1.5 h-3 ml-1 bg-[#F7CE4D] animate-pulse rounded-full align-middle" />
                        )}
                      </p>
                    </div>

                    {/* Downward tail pointing toward Tara */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8 pointer-events-none">
                      <svg className="w-4 h-2.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" viewBox="0 0 16 10" fill="none">
                        <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0 Z" fill="#0B1038" />
                        <path d="M0 0 C4 0 6 3 8 10 C10 3 12 0 16 0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Tara Mascot: rendered inside the dark hero background on mobile/tablet; desktop uses portal handoff */}
              <div
                onClick={advanceDialogue}
                className="relative flex flex-col items-center group cursor-pointer select-none lg:ml-20 xl:ml-28"
                title="Tap Tara to wave!"
              >
                {/* Soft Contact Ground Shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-64 md:w-72 lg:w-80 h-4 sm:h-5 rounded-[100%] bg-black/40 blur-md pointer-events-none transition-all group-hover:scale-95" />

                <div
                  ref={mascotPlaceholderRef}
                  aria-hidden
                  className="relative z-10 w-52 sm:w-68 md:w-80 lg:w-[350px] xl:w-[380px] aspect-[720/760]"
                >
                  {!portalBox && (
                    <Image
                      src="/images/welcome-hd.webp"
                      alt=""
                      width={720}
                      height={760}
                      priority
                      unoptimized
                      className={`h-full w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
                        taraBounce ? "scale-110 -translate-y-4" : ""
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && portalBox
        ? createPortal(
            <div
              ref={portalContainerRef}
              aria-hidden
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: portalBox.width,
                height: portalBox.height,
                transformOrigin: "top left",
                willChange: "transform, opacity",
                zIndex: 40,
                pointerEvents: "none",
              }}
              className="select-none"
            >
              <div
                ref={portalRotateRef}
                style={{ willChange: "transform" }}
                className="h-full w-full origin-center"
              >
                <Image
                  src="/images/welcome-hd.webp"
                  alt=""
                  width={720}
                  height={760}
                  priority
                  unoptimized
                  className={`h-full w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
                    taraBounce ? "scale-110 -translate-y-4" : ""
                  }`}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
