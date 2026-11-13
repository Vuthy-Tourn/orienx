"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
  menuClassName?: string;
  /** Which edge the menu aligns to. Use "end" near the right side of a layout. */
  align?: "start" | "end";
}

/**
 * Small listbox in the app's control language. Replaces the native <select>
 * so the open menu matches the rest of the interface instead of the OS popup.
 *
 * Keyboard: Enter/Space/Arrows open, Arrows move, Enter selects, Escape closes.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  className,
  menuClassName,
  align = "start",
}: SelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const openMenu = (index = selectedIndex) => {
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const commit = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    closeMenu();
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
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) => (index + step + options.length) % options.length);
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined
        }
        aria-label={label}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-xs font-semibold text-[#171A2C] transition-colors hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/15",
          open ? "border-[#111965]" : "border-[#E6E8F0]"
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[#68708A] transition-transform duration-150",
            open && "rotate-180 text-[#111965]"
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          className={cn(
            "absolute top-[calc(100%+6px)] z-50 min-w-full overflow-y-auto rounded-xl border border-[#E6E8F0] bg-white p-1 shadow-[0_18px_40px_-16px_rgba(17,25,101,0.35)]",
            align === "end" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {options.map((option, index) => {
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
                    "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] leading-snug transition-colors",
                    index === activeIndex
                      ? "bg-[#F0F2FA] text-[#111965]"
                      : "text-[#171A2C]",
                    isSelected && "font-bold"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block text-[12px] font-normal text-[#68708A]">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#111965]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
