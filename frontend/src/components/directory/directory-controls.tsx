"use client";

import * as React from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DirectoryChip {
  value: string;
  label: string;
  count?: number;
}

export interface DirectorySelectConfig {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption<string>[];
  label: string;
  className?: string;
}

interface DirectoryControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  clearSearchLabel: string;
  chips: readonly DirectoryChip[];
  activeChip: string;
  onChipChange: (value: string) => void;
  selects?: readonly DirectorySelectConfig[];
  sort?: {
    value: string;
    onChange: (value: string) => void;
    options: readonly SelectOption<string>[];
    label: string;
  };
  view?: {
    mode: "grid" | "list";
    onChange: (mode: "grid" | "list") => void;
    gridLabel: string;
    listLabel: string;
  };
  extra?: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
  resetLabel?: string;
}

/**
 * One sticky control surface for every directory page.
 *
 * Row 1: search + optional toggles/selects/sort/view.
 * Row 2: one segmented chip group for the page's primary facet.
 */
export function DirectoryControls({
  search,
  onSearchChange,
  searchPlaceholder,
  clearSearchLabel,
  chips,
  activeChip,
  onChipChange,
  selects = [],
  sort,
  view,
  extra,
  onReset,
  hasActiveFilters = false,
  resetLabel,
}: DirectoryControlsProps) {
  return (
    <div className="z-30 border-b border-[#E6E8F0] bg-white/95 backdrop-blur sm:sticky sm:top-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A]" />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-full rounded-lg border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-10 pr-9 text-sm text-[#171A2C] transition-colors placeholder:text-[#68708A]/80 focus:border-[#111965] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111965]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] transition-colors hover:text-[#171A2C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
                aria-label={clearSearchLabel}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
            {extra}

            {selects.map((select) => (
              <Select
                key={select.key}
                value={select.value}
                onChange={select.onChange}
                options={select.options}
                label={select.label}
                align="start"
                className={cn(
                  "w-[150px] flex-1 shrink-0 sm:w-[172px] sm:flex-none",
                  select.className
                )}
                menuClassName="min-w-[190px]"
              />
            ))}

            {sort && (
              <Select
                value={sort.value}
                onChange={sort.onChange}
                options={sort.options}
                label={sort.label}
                align="end"
                className="w-[164px] flex-1 shrink-0 sm:w-[188px] sm:flex-none"
                menuClassName="min-w-[196px]"
              />
            )}

            {view && (
              <div className="hidden items-center rounded-lg border border-[#E6E8F0] p-0.5 md:flex">
                {(
                  [
                    { mode: "grid", Icon: LayoutGrid, label: view.gridLabel },
                    { mode: "list", Icon: List, label: view.listLabel },
                  ] as const
                ).map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={view.mode === mode}
                    aria-label={label}
                    title={label}
                    onClick={() => view.onChange(mode)}
                    className={cn(
                      "rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                      view.mode === mode
                        ? "bg-[#F0F2FA] text-[#111965]"
                        : "text-[#68708A] hover:text-[#171A2C]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((chip) => {
            const isActive = activeChip === chip.value;
            return (
              <button
                key={chip.value || "all"}
                type="button"
                onClick={() => onChipChange(chip.value)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30",
                  isActive
                    ? "bg-[#111965] text-white"
                    : "bg-[#F5F6FA] text-[#5A6482] hover:bg-[#ECEFF7] hover:text-[#171A2C]"
                )}
              >
                <span>{chip.label}</span>
                {chip.count != null && (
                  <span
                    className={cn(
                      "tabular-nums",
                      isActive ? "text-white/60" : "text-[#68708A]"
                    )}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}

          {hasActiveFilters && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <X className="h-3.5 w-3.5" />
              <span>{resetLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
