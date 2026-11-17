"use client";


import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { gsap } from "gsap";

import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const isRegister = pathname === "/register";
  const rootRef = useRef<HTMLDivElement>(null);
  const [showAnimatedBackground, setShowAnimatedBackground] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    const start = () => setShowAnimatedBackground(true);
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timeoutId = win.setTimeout(start, 300);
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) win.clearTimeout(timeoutId);
    };
  }, []);

  // Coordinated entrance for the full-bleed background, brand and form card.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from("[data-auth-illustration]", {
          opacity: 0,
          duration: 0.7,
        })
        .from(
          "[data-auth-decor] > *",
          { opacity: 0, scale: 0.82, duration: 0.8, stagger: 0.09 },
          0.18
        )
        .from(
          "[data-auth-brand]",
          { opacity: 0, y: 12, duration: 0.7 },
          0.22
        )
        .from(
          "[data-auth-copy] > *",
          { opacity: 0, y: 16, duration: 0.8, stagger: 0.09 },
          0.42
        )
        .from(
          "[data-auth-card]",
          { opacity: 0, y: 18, duration: 0.8 },
          0.32
        );
    }, root);

    return () => context.revert();
  }, []);

  // Ambient particles and subtle pointer parallax around the artwork.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-auth-float]")
        .forEach((element, index) => {
          gsap.to(element, {
            y: index % 2 === 0 ? -9 : 9,
            duration: 4.2 + (index % 4) * 0.7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.16,
          });
        });

      gsap.utils
        .toArray<HTMLElement>("[data-auth-pulse]")
        .forEach((element, index) => {
          gsap.to(element, {
            opacity: 0.42,
            duration: 4 + (index % 3) * 0.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.25,
          });
        });
    }, root);

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-depth]")
    ).map((element) => ({
      element,
      depth: Number(element.dataset.depth) || 1,
      x: gsap.quickTo(element, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(element, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      layers.forEach((layer) => {
        layer.x(x * layer.depth);
        layer.y(y * layer.depth);
      });
    };

    if (layers.length > 0 && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", handlePointerMove);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      layers.forEach((layer) => gsap.killTweensOf(layer.element));
      context.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="auth-root relative min-h-screen overflow-x-hidden bg-[#0B124E]"
    >
      {/* Full-page illustration background */}
      <div
        data-auth-illustration
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0B124E]"
      >
        <picture>
          <source
            media="(max-width: 1023px)"
            srcSet="/images/auth/auth-background-mobile.webp"
            type="image/webp"
          />
          <img
            src="/images/auth/auth-background.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="h-full w-full select-none object-cover object-center"
          />
        </picture>

        {showAnimatedBackground && (
          <img
            src="/images/auth/auth-background-animated.webp"
            alt=""
            fetchPriority="low"
            decoding="async"
            draggable={false}
            onLoad={(event) => {
              event.currentTarget.style.opacity = "1";
            }}
            className="pointer-events-none absolute inset-0 hidden h-full w-full select-none object-cover object-center opacity-0 transition-opacity duration-700 lg:block"
          />
        )}

        <div className="absolute inset-0 bg-[#0A0F3D]/20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,10,46,0.88) 0%, rgba(6,10,46,0.48) 32%, rgba(6,10,46,0.08) 62%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(6,10,46,0.62) 0%, transparent 42%)",
          }}
        />
      </div>

      {/* Ambient particles */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <div
          data-auth-decor
          className="pointer-events-none absolute inset-0"
        >
          <span
            data-depth="1.4"
            className="absolute left-[8%] top-[19%] h-2 w-2 rounded-full bg-[#F7CE4D]/80 shadow-[0_0_18px_rgba(247,206,77,0.65)]"
          />
          <span
            data-depth="0.8"
            className="absolute right-[9%] top-[30%] h-24 w-24 rounded-full border border-[#F7CE4D]/10"
          />
          <span
            data-depth="2"
            className="absolute bottom-[25%] right-[7%] h-1.5 w-1.5 rounded-full bg-white/60"
          />
          <span
            data-depth="1"
            className="absolute -left-6 bottom-[30%] h-44 w-44 rounded-full bg-[#F7CE4D]/[0.06] blur-2xl"
          />
          <span
            data-depth="1.7"
            className="absolute left-[18%] top-[38%] h-1 w-1 rounded-full bg-white/50"
          />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <span
            data-auth-float
            className="absolute left-[13%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#FFF8E8]/80 shadow-[0_0_12px_rgba(255,248,232,0.7)]"
          />
          <span
            data-auth-float
            className="absolute right-[18%] top-[42%] h-1 w-1 rounded-full bg-[#FFE59A]/70"
          />
          <span
            data-auth-pulse
            className="absolute right-[12%] top-[62%] h-2 w-2 rounded-full bg-[#F7CE4D]/55"
          />
          <span
            data-auth-pulse
            className="absolute left-[22%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-white/50"
          />
        </div>
      </div>

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <div data-auth-brand>
            <Logo isLight showText size="md" href="/" />
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-[#0A0F3D]/45 px-3.5 py-2 text-[11px] font-bold text-white/75 backdrop-blur-md transition-colors duration-200 hover:border-white/30 hover:bg-[#0A0F3D]/65 hover:text-white lg:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("auth.backHome")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Editorial copy over the artwork */}
      <div
        data-auth-copy
        className="pointer-events-none absolute bottom-10 left-10 z-20 hidden max-w-[400px] lg:block xl:bottom-14 xl:left-14 xl:max-w-[470px]"
      >
        <p
          className={cn(
            "font-black text-[#F7CE4D]/90",
            language === "km"
              ? "text-[11px] tracking-normal"
              : "text-[10px] uppercase tracking-[0.28em]"
          )}
        >
          {t("auth.brandKicker")}
        </p>
        <h2 className="mt-3 text-[clamp(2rem,2.4vw,2.8rem)] font-black leading-[1.04] tracking-[-0.045em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
          {language === "km" ? (
            t("auth.brandTagline")
          ) : (
            <>
              Discover a world of{" "}
              <span className="font-serif italic text-[#F7CE4D]">
                possibilities.
              </span>
            </>
          )}
        </h2>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/70">
          {t("auth.brandDescription")}
        </p>
      </div>

      {/* Floating form card */}
      <main className="relative z-20 flex min-h-screen items-start justify-center px-5 pb-10 pt-24 sm:px-8 lg:justify-end lg:px-[7vw] lg:pb-12 lg:pt-24 xl:px-[9vw]">
        <div
          data-auth-card
          className={cn(
            "auth-glass-card my-auto w-full overflow-hidden rounded-[28px] p-4 sm:p-8",
            isRegister ? "max-w-[480px] xl:max-w-[540px]" : "max-w-[440px]"
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#F7CE4D]/10 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/[0.02] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050814]/75 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="auth-form-stagger" data-auth-form>
              {children}
            </div>

            <div className="mt-4 border-t border-white/10 pt-2.5 sm:mt-5 sm:pt-3 text-center text-[10px] text-white/45">
              © {new Date().getFullYear()} OrienX · {t("auth.secureSession")}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
