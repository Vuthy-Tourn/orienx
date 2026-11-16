"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  /** Optional second line, shown in the menu only. */
  description?: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  /** Accessible name for the trigger and the list. */
  label: string;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  /** Which edge the menu aligns to. Use "end" near the right side of a layout. */
  align?: "start" | "end";
  size?: "sm" | "md";
  disabled?: boolean;
  /** Show a search field inside the menu. Recommended for long option lists. */
  searchable?: boolean;
  id?: string;
}

/**
 * Custom listbox in the app's control language. Replaces the native <select>
 * so the open menu matches the rest of the interface instead of the OS popup.
 *
 * The menu is portalled and fixed-positioned so it is never clipped by a
 * scrollable dialog or card.
 *
 * Keyboard: Enter/Space/Arrows open, Arrows move, Enter selects, Escape closes.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder,
  className,
  menuClassName,
  align = "start",
  size = "md",
  disabled = false,
  searchable = false,
  id,
}: SelectProps<T>) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const filteredOptions = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      `${option.label} ${option.description ?? ""}`.toLowerCase().includes(needle)
    );
  }, [options, query]);

  const openMenu = (index = selectedIndex) => {
    if (disabled) return;
    setQuery("");
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) triggerRef.current?.focus();
  };

  React.useEffect(() => {
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
      const menuHeight = Math.min(menu.offsetHeight || 280, 300);
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      const availableWidth =
        align === "end"
          ? rect.right - viewportPadding
          : window.innerWidth - rect.left - viewportPadding;
      const maxWidth = Math.min(360, Math.max(200, availableWidth));

      const next: React.CSSProperties = {
        position: "fixed",
        zIndex: 100,
        minWidth: Math.min(Math.max(rect.width, 190), maxWidth),
        maxWidth,
        maxHeight: openUp ? Math.max(160, spaceAbove - gap) : Math.max(160, spaceBelow - gap),
      };

      if (align === "end") {
        next.right = Math.max(viewportPadding, window.innerWidth - rect.right);
      } else {
        next.left = Math.max(viewportPadding, rect.left);
      }

      if (openUp) next.bottom = window.innerHeight - rect.top + gap;
      else next.top = rect.bottom + gap;

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
  }, [open, align, filteredOptions.length]);

  React.useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      const option = menuRef.current?.querySelector<HTMLElement>(
        `[data-index="${activeIndex}"]`
      );
      option?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, activeIndex, searchable]);

  const commit = (index: number) => {
    const option = filteredOptions[index];
    if (option) onChange(option.value);
    closeMenu();
  };

  const moveActive = (step: number) => {
    if (filteredOptions.length === 0) return;
    setActiveIndex(
      (index) =>
        (index + step + filteredOptions.length) % filteredOptions.length
    );
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openMenu();
          return;
        }
        moveActive(event.key === "ArrowDown" ? 1 : -1);
        break;
      }
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else openMenu();
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          closeMenu();
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Enter":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
    }
  };

  const triggerSize =
    size === "sm"
      ? "h-8 rounded-lg px-2.5 text-[12px]"
      : "h-10 rounded-lg px-3 text-xs";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined
        }
        aria-label={label}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "inline-flex w-full items-center justify-between gap-2 border font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/20 dark:focus-visible:ring-[#F7CE4D]/30",
          triggerSize,
          disabled
            ? "cursor-not-allowed border-[#E6E8F0] bg-[#F5F6FA] text-[#94A3B8] opacity-70 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500"
            : open
            ? "border-[#111965] bg-white text-[#111965] dark:border-[#F7CE4D]/60 dark:bg-[#0B1028] dark:text-white"
            : "border-[#E6E8F0] bg-white text-[#171A2C] hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1028] dark:text-slate-100 dark:hover:border-white/25"
        )}
      >
        <span className={cn("truncate", !selected && "text-[#94A3B8] dark:text-slate-500")}>
          {selected?.label ?? placeholder ?? (isKm ? "ជ្រើសរើស…" : "Select…")}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[#68708A] transition-transform duration-150 dark:text-slate-400",
            open && "rotate-180 text-[#111965] dark:text-[#F7CE4D]"
          )}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className={cn(
              "overflow-y-auto rounded-xl border border-[#E6E8F0] bg-white p-1 shadow-[0_18px_40px_-16px_rgba(17,25,101,0.35)] dark:border-white/10 dark:bg-[#0B1028] dark:shadow-[0_24px_48px_-18px_rgba(0,0,0,0.8)]",
              menuClassName
            )}
          >
            {searchable && (
              <div className="sticky top-0 z-10 mb-1 border-b border-[#F0F2FA] bg-white p-1.5 dark:border-white/10 dark:bg-[#0B1028]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={isKm ? `ស្វែងរក${label}…` : `Search ${label.toLowerCase()}…`}
                    className="h-8 w-full rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] pl-8 pr-2 text-[12px] font-medium text-[#171A2C] outline-none placeholder:text-[#94A3B8] focus:border-[#111965]/40 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/50"
                  />
                </div>
              </div>
            )}

            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="space-y-0.5"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-4 text-center text-[12px] text-[#94A3B8] dark:text-slate-500">
                  {isKm ? "គ្មានលទ្ធផល" : "No matches"}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="none">
                      <button
                        type="button"
                        id={`${baseId}-option-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={-1}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => commit(index)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition-colors",
                          index === activeIndex
                            ? "bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-white"
                            : "text-[#171A2C] dark:text-slate-200",
                          isSelected && "font-bold"
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{option.label}</span>
                          {option.description && (
                            <span className="mt-0.5 block text-[11px] font-normal text-[#68708A] dark:text-slate-400">
                              {option.description}
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#111965] dark:text-[#F7CE4D]" />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
