"use client";

import React, { useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  GraduationCap,
  Award,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { Plan } from "@/lib/plan-types";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  planId: string;
  type: "deadline" | "document";
  date: string;
  title: string;
  planTitle: string;
  kind: Plan["kind"];
  status?: Plan["status"];
  isRequired?: boolean;
  isCompleted?: boolean;
}

function daysUntil(value: string) {
  const target = new Date(`${value}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatDay(value: string, isKm: boolean) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    isKm ? "km-KH" : "en-US",
    { day: "2-digit" }
  );
}

function formatMonth(value: string, isKm: boolean) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    isKm ? "km-KH" : "en-US",
    { month: "short" }
  );
}

function formatDate(value: string, isKm: boolean) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    isKm ? "km-KH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

export function PlanTimeline({
  plans,
  getLocalized,
}: {
  plans: Plan[];
  getLocalized: (value?: { en?: string; km?: string } | null) => string;
}) {
  const { t, language } = useLanguage();
  const isKm = language === "km";

  const items = useMemo(() => {
    const next: TimelineItem[] = [];
    plans.forEach((plan) => {
      const planTitle =
        getLocalized(plan.target_title) || plan.target_title?.en || "Application";
      if (plan.deadline) {
        next.push({
          id: `plan-${plan.id}`,
          planId: plan.id,
          type: "deadline",
          date: plan.deadline,
          title: t("planPage.timeline.deadlineEvent"),
          planTitle,
          kind: plan.kind,
          status: plan.status,
        });
      }
      plan.documents.forEach((document) => {
        if (!document.due_date || document.is_completed) return;
        next.push({
          id: `document-${document.id}`,
          planId: plan.id,
          type: "document",
          date: document.due_date,
          title: isKm && document.name_km ? document.name_km : document.name_en,
          planTitle,
          kind: plan.kind,
          isRequired: document.is_required,
          isCompleted: document.is_completed,
        });
      });
    });
    return next.sort((left, right) => left.date.localeCompare(right.date));
  }, [plans, getLocalized, isKm, t]);

  const groups = useMemo(() => {
    const definitions = [
      { key: "overdue", label: t("planPage.timeline.overdue"), test: (days: number) => days < 0 },
      { key: "today", label: t("planPage.timeline.today"), test: (days: number) => days === 0 },
      { key: "week", label: t("planPage.timeline.thisWeek"), test: (days: number) => days > 0 && days <= 7 },
      { key: "month", label: t("planPage.timeline.next30Days"), test: (days: number) => days > 7 && days <= 30 },
      { key: "later", label: t("planPage.timeline.later"), test: (days: number) => days > 30 },
    ];
    return definitions
      .map((definition) => ({
        ...definition,
        items: items.filter((item) =>
          definition.test(daysUntil(item.date))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [items, t]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
          <CalendarDays className="h-5 w-5" />
        </span>
        <h2 className="mt-3 text-sm font-black text-[#111965]">
          {t("planPage.timeline.emptyTitle")}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-[#68708A]">
          {t("planPage.timeline.emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E6E8F0] bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3">
        <div>
          <h2 className="text-sm font-black text-[#111965]">
            {t("planPage.timeline.title")}
          </h2>
          <p className="mt-0.5 text-[11px] text-[#68708A]">
            {t("planPage.timeline.subtitle")}
          </p>
        </div>
        <span className="rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-bold text-[#68708A]">
          {items.length} {t("planPage.timeline.items")}
        </span>
      </div>

      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-[#F0F2FA]" />
              <span className="text-[10px] font-bold text-[#94A3B8]">
                {group.items.length}
              </span>
            </div>

            <div className="space-y-2">
              {group.items.map((item) => {
                const days = daysUntil(item.date);
                const Icon = item.type === "document" ? FileText : CalendarDays;
                const KindIcon =
                  item.kind === "UNIVERSITY" ? GraduationCap : Award;
                const countdown =
                  days < 0
                    ? t("planPage.timeline.overdueBy").replace(
                        "{days}",
                        String(Math.abs(days))
                      )
                    : days === 0
                    ? t("planPage.timeline.today")
                    : t("planPage.timeline.daysLeft").replace(
                        "{days}",
                        String(days)
                      );

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-[#E6E8F0] bg-white px-3 py-2.5 transition-colors hover:border-[#111965]/20 hover:bg-[#F8FAFD]"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border text-center",
                        days < 0
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : days <= 7
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-[#E6E8F0] bg-[#F8FAFD] text-[#111965]"
                      )}
                    >
                      <span className="text-[13px] font-black leading-none">
                        {formatDay(item.date, isKm)}
                      </span>
                      <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider">
                        {formatMonth(item.date, isKm)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[9px] font-bold text-[#68708A]">
                          <Icon className="h-2.5 w-2.5" />
                          {item.type === "document"
                            ? t("planPage.timeline.documentEvent")
                            : t("planPage.timeline.deadlineEvent")}
                        </span>
                        {item.type === "document" && (
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                              item.isRequired
                                ? "border-[#111965]/15 bg-[#F0F2FA] text-[#111965]"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            )}
                          >
                            {item.isRequired
                              ? t("planPage.documents.required")
                              : t("planPage.documents.optional")}
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                            days < 0
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : days <= 7
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}
                        >
                          <Clock3 className="h-2.5 w-2.5" />
                          {countdown}
                        </span>
                      </div>

                      <h3 className="mt-1 line-clamp-1 text-[12px] font-black text-[#111965]">
                        {item.title}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#68708A]">
                        <KindIcon className="h-3 w-3" />
                        <span className="truncate">{item.planTitle}</span>
                        <span className="text-[#D9DEEA]">·</span>
                        <span>{formatDate(item.date, isKm)}</span>
                        {item.type === "deadline" && item.status && (
                          <>
                            <span className="text-[#D9DEEA]">·</span>
                            <span>{t(`planPage.statuses.${item.status}`)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
