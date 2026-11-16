"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  description?: string;
  duration: number;
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  message: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_CONFIG: Record<
  ToastTone,
  {
    icon: React.ElementType;
    card: string;
    iconClass: string;
    accent: string;
    role: "status" | "alert";
  }
> = {
  success: {
    icon: CheckCircle2,
    card: "border-emerald-200 bg-white text-[#111965] dark:border-emerald-500/30 dark:bg-[#0B1028] dark:text-white",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-500",
    role: "status",
  },
  error: {
    icon: AlertCircle,
    card: "border-rose-200 bg-white text-[#111965] dark:border-rose-500/30 dark:bg-[#0B1028] dark:text-white",
    iconClass: "text-rose-600 dark:text-rose-400",
    accent: "bg-rose-500",
    role: "alert",
  },
  warning: {
    icon: AlertTriangle,
    card: "border-amber-200 bg-white text-[#111965] dark:border-amber-500/30 dark:bg-[#0B1028] dark:text-white",
    iconClass: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
    role: "alert",
  },
  info: {
    icon: Info,
    card: "border-[#111965]/15 bg-white text-[#111965] dark:border-white/15 dark:bg-[#0B1028] dark:text-white",
    iconClass: "text-[#111965]/70 dark:text-[#F7CE4D]",
    accent: "bg-[#111965] dark:bg-[#F7CE4D]",
    role: "status",
  },
};

function newToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string, options: ToastOptions = {}) => {
      const id = newToastId();
      const duration =
        options.duration ?? (tone === "error" ? 5600 : tone === "warning" ? 4800 : 4000);
      const item: ToastItem = {
        id,
        tone,
        message,
        description: options.description,
        duration,
      };
      setToasts((current) => [...current.slice(-4), item]);
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      warning: (message, options) => push("warning", message, options),
      info: (message, options) => push("info", message, options),
      message: (message, options) => push("info", message, options),
      dismiss,
      clear: () => {
        timers.current.forEach((timer) => window.clearTimeout(timer));
        timers.current.clear();
        setToasts([]);
      },
    }),
    [dismiss, push]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-24"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const config = TONE_CONFIG[toast.tone];
            const Icon = config.icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto"
                role={config.role}
              >
                <div
                  className={cn(
                    "relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 shadow-[0_18px_40px_-18px_rgba(17,25,101,0.35)] backdrop-blur-md dark:shadow-[0_20px_44px_-20px_rgba(0,0,0,0.8)]",
                    config.card
                  )}
                >
                  <span className={cn("absolute inset-y-0 left-0 w-1", config.accent)} />
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F6FA] dark:bg-white/[0.06]">
                    <Icon className={cn("h-4 w-4", config.iconClass)} />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[12.5px] font-bold leading-snug">{toast.message}</p>
                    {toast.description && (
                      <p className="mt-1 text-[11px] leading-relaxed opacity-70">
                        {toast.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="mt-0.5 rounded-md p-1 opacity-45 transition-opacity hover:opacity-100"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
