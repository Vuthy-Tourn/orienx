"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmTone = "danger" | "primary";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const confirm = useCallback<ConfirmFn>((nextOptions) => {
    resolverRef.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {portalTarget
        ? createPortal(
            <AnimatePresence>
              {options ? (
                <ConfirmDialog
                  options={options}
                  onCancel={() => close(false)}
                  onConfirm={() => close(true)}
                />
              ) : null}
            </AnimatePresence>,
            portalTarget
          )
        : null}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  options,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const tone = options.tone ?? "danger";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-[#050814]/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={options.description ? descriptionId : undefined}
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-[0_30px_80px_-24px_rgba(5,8,20,0.55)] dark:border-white/10 dark:bg-[#090D24] sm:p-6"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Close confirmation dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              tone === "danger"
                ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                : "border-[#F7CE4D]/40 bg-[#F7CE4D]/20 text-[#111965] dark:text-[#F7CE4D]"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-base font-black leading-snug text-[#111965] dark:text-white"
            >
              {options.title}
            </h2>
            {options.description ? (
              <p
                id={descriptionId}
                className="mt-1.5 text-xs leading-relaxed text-[#68708A] dark:text-slate-400"
              >
                {options.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E6E8F0] px-4 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {options.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black text-white transition-colors",
              tone === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#111965]/100 hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
            )}
          >
            {options.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context;
}
