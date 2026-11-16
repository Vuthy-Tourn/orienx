"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface AdminPaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  itemSingular?: string;
}

type PageItem = number | "ellipsis";

function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push("ellipsis");
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);

  return items;
}

export function AdminPagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "records",
  itemSingular,
}: AdminPaginationProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const safePageCount = Math.max(1, pageCount);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageItems = getPageItems(page, safePageCount);
  const noun = totalItems === 1 ? itemSingular ?? itemLabel : itemLabel;

  const baseButton =
    "inline-flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-[11px] font-bold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-2 border-t border-[#E6E8F0] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] font-medium text-[#68708A] dark:text-slate-400">
        {isKm ? "បង្ហាញ" : "Showing"}{" "}
        <strong className="font-bold text-[#111965] dark:text-white">
          {start}–{end}
        </strong>{" "}
        {isKm ? "ក្នុងចំណោម" : "of"}{" "}
        <strong className="font-bold text-[#111965] dark:text-white">{totalItems}</strong>{" "}
        {noun}
      </span>

      <nav className="flex items-center gap-1" aria-label={isKm ? "ទំព័រតារាង" : "Table pagination"}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={isKm ? "ទំព័រមុន" : "Previous page"}
          className={cn(
            baseButton,
            "border-[#E6E8F0] text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965]",
            "dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-7 w-5 items-center justify-center text-[11px] font-bold text-[#94A3B8]"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={isKm ? `ទំព័រ ${item}` : `Page ${item}`}
              className={cn(
                baseButton,
                item === page
                  ? "border-[#111965] bg-[#111965]/100 text-white dark:border-[#F7CE4D] dark:bg-[#F7CE4D] dark:text-[#111965]"
                  : "border-[#E6E8F0] bg-white text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safePageCount}
          aria-label={isKm ? "ទំព័របន្ទាប់" : "Next page"}
          className={cn(
            baseButton,
            "border-[#E6E8F0] text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965]",
            "dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}
