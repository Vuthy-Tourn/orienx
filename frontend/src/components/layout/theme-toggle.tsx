"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

/**
 * The resolved theme is only knowable on the client (localStorage / OS), so the
 * server and the first client paint both render the neutral state. That keeps
 * hydration stable, then the real icon swaps in on the next tick.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const showSun = mounted && isDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle colour theme"}
      title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle colour theme"}
      aria-pressed={mounted ? isDark : undefined}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E6E8F0] bg-white text-[#5A6482] transition-colors hover:bg-slate-50 hover:text-[#111965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
        className
      )}
    >
      {showSun ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
