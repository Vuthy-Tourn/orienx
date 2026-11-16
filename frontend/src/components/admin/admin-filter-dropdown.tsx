"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  count?: number;
  icon?: LucideIcon;
  badgeClass?: string;
  indicator?: React.ReactNode;
}

interface AdminFilterDropdownProps<T extends string = string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly FilterOption<T>[];
  allValue?: T;
  icon?: LucideIcon;
  align?: "start" | "end";
  className?: string;
  menuWidth?: string;
}

export function AdminFilterDropdown<T extends string = string>({
  label,
  value,
  onChange,
  options,
  allValue = "" as T,
  icon: DefaultIcon,
  align = "start",
  className,
  menuWidth = "w-64",
}: AdminFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const isFiltered = value !== allValue;
  const currentOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(Math.max(0, options.findIndex((opt) => opt.value === value)));
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          onChange(options[activeIndex].value);
          setOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const handleSelect = (val: T) => {
    onChange(val);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(allValue);
  };

  const ActiveIcon = currentOption?.icon || DefaultIcon;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            setActiveIndex(Math.max(0, options.findIndex((opt) => opt.value === value)));
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        className={cn(
          "group flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/25 dark:focus-visible:ring-indigo-400/30",
          isFiltered
            ? "border-[#111965]/30 bg-[#F0F2FA] text-[#111965] shadow-xs dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-200"
            : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 hover:bg-[#F9FAFC] hover:text-[#171A2C] dark:border-slate-800 dark:bg-[#0B1028] dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
        )}
      >
        {/* Left Indicator or Icon */}
        <span className="flex shrink-0 items-center">
          {currentOption?.indicator ? (
            currentOption.indicator
          ) : ActiveIcon ? (
            <ActiveIcon
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isFiltered
                  ? "text-[#111965] dark:text-indigo-300"
                  : "text-[#68708A] group-hover:text-[#171A2C] dark:text-slate-400 dark:group-hover:text-slate-200"
              )}
            />
          ) : null}
        </span>

        {/* Filter Title & Current Value */}
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-[11px] font-medium text-[#68708A] dark:text-slate-400">
            {label}:
          </span>
          <span className={cn("truncate font-bold", isFiltered ? "text-[#111965] dark:text-indigo-200" : "text-[#171A2C] dark:text-slate-200")}>
            {currentOption?.label || "All"}
          </span>
        </span>

        {/* Clear Button when filtered */}
        {isFiltered && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClear(e as any);
              }
            }}
            title={`Reset ${label} filter`}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-[#111965]/10 text-[#111965] transition-colors hover:bg-[#111965]/20 dark:bg-indigo-500/20 dark:text-indigo-200 dark:hover:bg-indigo-500/30"
          >
            <X className="h-2.5 w-2.5" />
          </span>
        )}

        {/* Animated Chevron */}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[#68708A] transition-transform duration-200 dark:text-slate-400",
            open && "rotate-180 text-[#111965] dark:text-indigo-300"
          )}
        />
      </button>

      {/* Dropdown Floating Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white p-1.5 shadow-[0_16px_36px_-8px_rgba(17,25,101,0.2),0_4px_16px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-[#0B1028] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]",
              menuWidth,
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {/* Header info */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#F0F2FA] dark:border-slate-800/80 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                Filter by {label}
              </span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => handleSelect(allValue)}
                  className="text-[10px] font-bold text-[#111965] hover:underline dark:text-indigo-300"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Options List */}
            <ul ref={listRef} role="listbox" aria-label={label} className="max-h-72 space-y-0.5 overflow-y-auto">
              {options.map((opt, index) => {
                const isSelected = opt.value === value;
                const isFocused = index === activeIndex;
                const OptIcon = opt.icon;

                return (
                  <li key={opt.value} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "group/item flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-100",
                        isSelected
                          ? "bg-[#F0F2FA] text-[#111965] dark:bg-indigo-950/50 dark:text-indigo-200"
                          : isFocused
                          ? "bg-slate-50 text-[#171A2C] dark:bg-slate-900 dark:text-white"
                          : "text-[#171A2C] hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Indicator / Icon */}
                        <div className="flex shrink-0 items-center justify-center">
                          {opt.indicator ? (
                            opt.indicator
                          ) : OptIcon ? (
                            <div
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                                opt.badgeClass
                                  ? opt.badgeClass
                                  : isSelected
                                  ? "bg-[#111965]/10 text-[#111965] dark:bg-indigo-500/20 dark:text-indigo-200"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              <OptIcon className="h-3.5 w-3.5" />
                            </div>
                          ) : null}
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "truncate text-xs",
                                isSelected ? "font-bold text-[#111965] dark:text-indigo-200" : "font-semibold"
                              )}
                            >
                              {opt.label}
                            </span>
                          </div>
                          {opt.description && (
                            <p className="truncate text-[10px] text-[#68708A] dark:text-slate-400">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side: Count & Checkmark */}
                      <div className="flex items-center gap-2 shrink-0">
                        {typeof opt.count === "number" && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              isSelected
                                ? "bg-[#111965]/10 text-[#111965] dark:bg-indigo-500/20 dark:text-indigo-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            {opt.count}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-[#111965] dark:text-indigo-300 stroke-[2.5]" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
