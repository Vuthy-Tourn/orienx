"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const WEEKDAYS = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  km: ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"],
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIso(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function fromIso(value?: string | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function sameDay(left: Date | null, right: Date | null) {
  return Boolean(
    left &&
    right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  min?: string;
  max?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  className,
  disabled = false,
  id,
  min,
  max,
}: DatePickerProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const locale = isKm ? "km-KH" : "en-GB";
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => fromIso(value) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [focusIso, setFocusIso] = useState(value || "");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const triggerId = id ?? generatedId;

  const selectedDate = useMemo(() => fromIso(value), [value]);
  const today = useMemo(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, []);
  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(viewMonth),
    [locale, viewMonth]
  );

  const displayValue = useMemo(() => {
    if (!selectedDate) return "";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(selectedDate);
  }, [locale, selectedDate]);

  const isDisabled = (date: Date) => {
    const iso = toIso(date);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const openMenu = () => {
    if (disabled) return;
    const initial = selectedDate ?? today;
    setViewMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    setFocusIso(toIso(initial));
    setOpen(true);
  };

  const selectDate = (date: Date) => {
    if (isDisabled(date)) return;
    onChange(toIso(date));
    closeMenu();
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const gap = 6;
      const width = Math.min(320, window.innerWidth - viewportPadding * 2);
      const menuHeight = menu.offsetHeight || 350;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      const next: React.CSSProperties = {
        position: "fixed",
        zIndex: 130,
        width,
        left: Math.max(
          viewportPadding,
          Math.min(rect.left, window.innerWidth - width - viewportPadding)
        ),
      };

      if (openUp) {
        next.bottom = window.innerHeight - rect.top + gap;
      } else {
        next.top = rect.bottom + gap;
      }

      setMenuStyle(next);
    };

    positionMenu();
    const frame = window.requestAnimationFrame(positionMenu);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, viewMonth]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('[data-focus="true"]')
        ?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, focusIso, viewMonth]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const moveFocus = (nextDate: Date) => {
    setFocusIso(toIso(nextDate));
    setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const current = fromIso(focusIso) ?? selectedDate ?? today;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(addDays(current, -1));
        break;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(addDays(current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(addDays(current, -7));
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(addDays(current, 7));
        break;
      case "PageUp":
        event.preventDefault();
        moveFocus(
          new Date(
            current.getFullYear(),
            current.getMonth() - (event.shiftKey ? 12 : 1),
            Math.min(current.getDate(), 28)
          )
        );
        break;
      case "PageDown":
        event.preventDefault();
        moveFocus(
          new Date(
            current.getFullYear(),
            current.getMonth() + (event.shiftKey ? 12 : 1),
            Math.min(current.getDate(), 28)
          )
        );
        break;
      case "Enter":
        event.preventDefault();
        if (!isDisabled(current)) selectDate(current);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-xs outline-none transition-colors",
          disabled
            ? "cursor-not-allowed border-[#E6E8F0] bg-[#F5F6FA] text-[#94A3B8] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500"
            : open
              ? "border-[#111965] bg-white text-[#111965] ring-2 ring-[#111965]/10 dark:border-[#F7CE4D]/60 dark:bg-[#0B1028] dark:text-white dark:ring-[#F7CE4D]/10"
              : "border-[#E6E8F0] bg-[#F8FAFD] text-[#171A2C] hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:border-white/25"
        )}
      >
        <span
          className={cn(
            "truncate",
            !displayValue && "text-[#94A3B8] dark:text-slate-500"
          )}
        >
          {displayValue ||
            placeholder ||
            (isKm ? "ជ្រើសរើសកាលបរិច្ឆេទ…" : "Select a date…")}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-[#68708A] dark:text-slate-400" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={label}
            style={menuStyle}
            onKeyDown={handleMenuKeyDown}
            className="rounded-2xl border border-[#E6E8F0] bg-white p-3 shadow-[0_20px_50px_-18px_rgba(17,25,101,0.35)] outline-none dark:border-white/10 dark:bg-[#0B1028] dark:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, -12))}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={isKm ? "ឆ្នាំមុន" : "Previous year"}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={isKm ? "ខែមុន" : "Previous month"}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <span className="text-xs font-black text-[#111965] dark:text-white">
                {monthLabel}
              </span>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={isKm ? "ខែបន្ទាប់" : "Next month"}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 12))}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={isKm ? "ឆ្នាំបន្ទាប់" : "Next year"}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {WEEKDAYS[isKm ? "km" : "en"].map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className="flex h-7 items-center justify-center text-[10px] font-black uppercase text-[#94A3B8] dark:text-slate-500"
                >
                  {day}
                </span>
              ))}
              {days.map((date) => {
                const iso = toIso(date);
                const inMonth = date.getMonth() === viewMonth.getMonth();
                const isSelected = sameDay(date, selectedDate);
                const isToday = sameDay(date, today);
                const disabledDay = isDisabled(date);
                const focused = iso === focusIso;
                return (
                  <button
                    key={iso}
                    type="button"
                    tabIndex={focused ? 0 : -1}
                    data-focus={focused ? "true" : undefined}
                    disabled={disabledDay}
                    onClick={() => selectDate(date)}
                    onFocus={() => setFocusIso(iso)}
                    aria-label={new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(date)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex h-8 w-full items-center justify-center rounded-lg text-[11px] font-semibold transition-colors",
                      !inMonth && "text-[#B8C0D0] dark:text-slate-600",
                      isSelected
                        ? "bg-[#111965] text-white shadow-xs dark:bg-[#F7CE4D] dark:text-white"
                        : isToday
                          ? "border border-[#F7CE4D] bg-[#FFF9E6] text-[#111965] dark:border-[#F7CE4D]/60 dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]"
                          : "text-[#475569] hover:bg-[#F0F2FA] dark:text-slate-300 dark:hover:bg-white/10",
                      disabledDay && "cursor-not-allowed opacity-30"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#F0F2FA] pt-2.5 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  closeMenu();
                }}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {isKm ? "សម្អាត" : "Clear"}
              </button>
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#111965] hover:bg-[#F0F2FA] dark:text-[#F7CE4D] dark:hover:bg-white/10"
              >
                {isKm ? "ថ្ងៃនេះ" : "Today"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
