"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";

const AUTH_OR_ADMIN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/admin",
];

const PRIVATE_PREFIXES = [...AUTH_OR_ADMIN_PREFIXES, "/dashboard"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isPrivatePath(pathname: string) {
  return matchesPrefix(pathname, PRIVATE_PREFIXES);
}

function isAuthOrAdminPath(pathname: string) {
  return matchesPrefix(pathname, AUTH_OR_ADMIN_PREFIXES);
}

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/**
 * A quiet fade between public pages. Opacity-only so fixed and sticky
 * elements inside pages are not affected by a transformed ancestor.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();

  if (isPrivatePath(pathname) || reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Smooth same-page anchor navigation without making route changes animate
 * their scroll position. Cross-page anchors and reduced-motion users keep
 * native behavior.
 */
export function SmoothAnchors() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const section = document.getElementById(hash.slice(1));
      if (!section) return;

      event.preventDefault();
      const top =
        section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      history.pushState(null, "", hash);
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

/** Slim gold reading-progress line, fixed above the sticky navbar. */
export function ScrollProgress() {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.2,
  });

  if (isPrivatePath(pathname) || reduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#F7CE4D] via-[#F5C430] to-[#F69D0D] shadow-[0_0_14px_rgba(247,206,77,0.45)]"
      style={{ scaleX }}
    />
  );
}

/**
 * Adds a small, consistent reveal to public-page headings and cards.
 * Pages that already own their motion with GSAP are left untouched, as are
 * auth/dashboard screens. Elements can opt in explicitly with data-reveal,
 * or out with data-no-reveal.
 */
export function ScrollReveal() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      isAuthOrAdminPath(pathname)
    ) {
      return;
    }

    const main = document.querySelector("main");
    if (!main || main.querySelector('[class*="gsap-"]')) return;

    // Dashboard pages have their own roots. Tag the visible section blocks
    // so they join the same reveal pass without adding attributes everywhere.
    const tagDashboardTargets = () => {
      if (!isDashboard) return;
      const dashboardRoot = main.querySelector<HTMLElement>(
        "[data-dashboard-page]"
      );
      if (!dashboardRoot) return;
      const isHome = dashboardRoot.dataset.dashboardPage === "home";
      const targets = isHome
        ? Array.from(dashboardRoot.children).flatMap((column) =>
            Array.from(column.children)
          )
        : Array.from(dashboardRoot.children);
      targets.forEach((target) => {
        if (target instanceof HTMLElement) {
          target.setAttribute("data-reveal", "");
        }
      });
    };

    let observer: IntersectionObserver | null = null;
    const timers = new Set<number>();
    const processed = new WeakSet<HTMLElement>();

    const isDashboard = isDashboardPath(pathname);

    const cleanupElement = (el: HTMLElement) => {
      el.classList.remove("reveal-prep", "reveal-in", "dashboard-reveal");
      el.style.removeProperty("--reveal-delay");
    };

    const withinRevealParent = (el: HTMLElement) => {
      const parent = el.parentElement;
      return Boolean(parent?.closest("[data-reveal], article"));
    };

    const isEligible = (el: HTMLElement) => {
      if (processed.has(el)) return false;
      if (el.closest("[data-no-reveal], [role='dialog']")) return false;
      if (withinRevealParent(el)) return false;

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.position === "fixed" ||
        style.position === "sticky"
      ) {
        return false;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;

      // Public pages use the page-level fade for already-visible content.
      // Dashboard screens intentionally stagger their whole surface on mount.
      if (isDashboardPath(pathname)) return true;

      const visibleThreshold = window.innerHeight * 0.82;
      return !(rect.top < visibleThreshold && rect.bottom > 0);
    };

    const reveal = (el: HTMLElement) => {
      processed.add(el);
      if (!isDashboard) el.classList.add("reveal-prep");
      observer?.observe(el);
    };

    const scan = (root: ParentNode = main) => {
      const nodes: HTMLElement[] = [];
      if (
        root instanceof HTMLElement &&
        root.matches("[data-reveal], article, h2")
      ) {
        nodes.push(root);
      }
      root
        .querySelectorAll<HTMLElement>("[data-reveal], article, h2")
        .forEach((el) => nodes.push(el));

      nodes.forEach((el) => {
        if (isEligible(el)) reveal(el);
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting);
        entering.forEach((entry, index) => {
          const el = entry.target as HTMLElement;
          el.style.setProperty(
            "--reveal-delay",
            `${Math.min(index, 5) * 70}ms`
          );
          el.classList.add(isDashboard ? "dashboard-reveal" : "reveal-in");
          observer?.unobserve(el);

          const timer = window.setTimeout(() => {
            cleanupElement(el);
            timers.delete(timer);
          }, 1200);
          timers.add(timer);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const mutationObserver = new MutationObserver((mutations) => {
      tagDashboardTargets();
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });

    // Wait for the page tree to finish hydrating before touching server-rendered
    // class names. Mutating them earlier makes React report a hydration mismatch
    // on pages that render their cards inside a Suspense boundary.
    let startTimer: number | null = window.setTimeout(() => {
      startTimer = null;
      tagDashboardTargets();
      scan();
      mutationObserver.observe(main, { childList: true, subtree: true });
    }, 300);

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
      if (startTimer !== null) window.clearTimeout(startTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      main
        .querySelectorAll<HTMLElement>(
          ".reveal-prep, .reveal-in, .dashboard-reveal, [style*='--reveal-delay']"
        )
        .forEach(cleanupElement);
    };
  }, [pathname]);

  return null;
}
