"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  ExternalLink,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  Unplug,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PlanChecklist } from "@/components/plan/plan-checklist";
import { PlanTimeline } from "@/components/plan/plan-timeline";
import {
  PLAN_STATUSES,
  REMINDER_OPTIONS,
  type Plan,
  type PlanKind,
  type PlanStatus,
  type ScholarshipOption,
  type UniversityOption,
} from "@/lib/plan-types";
import { cn, getErrorMessage } from "@/lib/utils";

interface NotificationSettings {
  bot_username: string;
  telegram_connected: boolean;
  telegram_username?: string | null;
  reminders_enabled: boolean;
}

interface TelegramLink {
  deep_link: string;
  bot_username: string;
  expires_at: string;
}

const STATUSES = PLAN_STATUSES;

const STATUS_STYLES: Record<PlanStatus, string> = {
  RESEARCHING: "border-slate-200 bg-slate-50 text-slate-600",
  PREPARING: "border-sky-200 bg-sky-50 text-sky-700",
  SUBMITTED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  INTERVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  WAITLISTED: "border-orange-200 bg-orange-50 text-orange-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const inputClass =
  "h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-[#F7CE4D]/60";

const TODAY = () => {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
};

function daysUntil(deadline?: string | null) {
  if (!deadline) return null;
  const target = new Date(`${deadline}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - TODAY().getTime()) / 86400000);
}

function formatDate(value: string | null | undefined, isKm: boolean) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    isKm ? "km-KH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function dateToIcs(value: string) {
  return value.replace(/-/g, "");
}

function nextDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function ApplicationPlanPage() {
  const { t, language, getLocalized } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<"ALL" | PlanKind>("ALL");
  const [view, setView] = useState<"cards" | "timeline">("cards");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [kind, setKind] = useState<PlanKind>("UNIVERSITY");
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState<PlanStatus>("RESEARCHING");
  const [deadline, setDeadline] = useState("");
  const [reminderDays, setReminderDays] = useState("7");
  const [nextAction, setNextAction] = useState("");
  const [notes, setNotes] = useState("");
  const [telegramLink, setTelegramLink] = useState<TelegramLink | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["application-plans"],
    queryFn: async () => apiFetch<Plan[]>("/plans"),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ["plan-university-options"],
    queryFn: async () =>
      apiFetch<UniversityOption[]>("/universities?limit=100"),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ["plan-scholarship-options"],
    queryFn: async () =>
      apiFetch<ScholarshipOption[]>("/scholarships?limit=100"),
  });

  const { data: notificationSettings, refetch: refetchNotificationSettings } =
    useQuery({
      queryKey: ["notification-settings"],
      queryFn: async () =>
        apiFetch<NotificationSettings>("/notifications/settings"),
      refetchInterval: telegramLink ? 3000 : false,
    });

  const { mutate: connectTelegram, isPending: linkingTelegram } = useMutation({
    mutationFn: async () =>
      apiFetch<TelegramLink>("/notifications/telegram/link", {
        method: "POST",
      }),
    onSuccess: (data) => {
      setTelegramLink(data);
      refetchNotificationSettings();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("planPage.linkError"))),
  });

  const { mutate: updateNotifications, isPending: updatingNotifications } =
    useMutation({
      mutationFn: async (enabled: boolean) =>
        apiFetch<NotificationSettings>("/notifications/settings", {
          method: "PATCH",
          body: JSON.stringify({ reminders_enabled: enabled }),
        }),
      onSuccess: () => {
        refetchNotificationSettings();
      },
      onError: (error: unknown) =>
        toast.error(getErrorMessage(error, t("planPage.settingsError"))),
    });

  const { mutate: disconnectTelegram, isPending: disconnectingTelegram } =
    useMutation({
      mutationFn: async () =>
        apiFetch<NotificationSettings>("/notifications/telegram", {
          method: "DELETE",
        }),
      onSuccess: () => {
        setTelegramLink(null);
        refetchNotificationSettings();
        toast.success(t("planPage.telegramDisconnected"));
      },
      onError: (error: unknown) =>
        toast.error(getErrorMessage(error, t("planPage.settingsError"))),
    });

  const { mutate: sendTelegramTest, isPending: sendingTelegramTest } =
    useMutation({
      mutationFn: async () =>
        apiFetch("/notifications/telegram/test", { method: "POST" }),
      onSuccess: () => toast.success(t("planPage.testSent")),
      onError: (error: unknown) =>
        toast.error(getErrorMessage(error, t("planPage.testError"))),
    });

  const handleDisconnectTelegram = async () => {
    const confirmed = await confirm({
      title: t("planPage.disconnectConfirmTitle"),
      description: t("planPage.disconnectConfirmBody"),
      confirmLabel: t("planPage.disconnectConfirm"),
      cancelLabel: t("planPage.cancel"),
      tone: "danger",
    });
    if (confirmed) disconnectTelegram();
  };

  useEffect(() => {
    if (telegramLink && notificationSettings?.telegram_connected) {
      setTelegramLink(null);
    }
  }, [telegramLink, notificationSettings?.telegram_connected]);

  const filtered = useMemo(
    () => (filter === "ALL" ? plans : plans.filter((plan) => plan.kind === filter)),
    [plans, filter]
  );

  const dueSoon = plans.filter((plan) => {
    const days = daysUntil(plan.deadline);
    return days !== null && days >= 0 && days <= 14;
  }).length;
  const submitted = plans.filter((plan) =>
    ["SUBMITTED", "INTERVIEW", "WAITLISTED"].includes(plan.status)
  ).length;
  const accepted = plans.filter((plan) => plan.status === "ACCEPTED").length;

  const statusLabel = (value: PlanStatus) => t(`planPage.statuses.${value}`);
  const kindLabel = (value: PlanKind) => t(`planPage.kindLabels.${value}`);
  const targetOptions =
    kind === "UNIVERSITY"
      ? universities.map((university) => ({
          value: university.id,
          label: getLocalized(university.name) || university.name?.en || "",
          description: [university.acronym?.en, university.province]
            .filter(Boolean)
            .join(" · "),
        }))
      : scholarships.map((scholarship) => ({
          value: scholarship.id,
          label: getLocalized(scholarship.title) || scholarship.title?.en || "",
          description: [
            getLocalized(scholarship.provider),
            scholarship.country_or_institution,
          ]
            .filter(Boolean)
            .join(" · "),
        }));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["application-plans"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const { mutate: savePlan, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!editing) {
        if (!targetId) throw new Error(t("planPage.requiredTarget"));
        return apiFetch("/plans", {
          method: "POST",
          body: JSON.stringify({
            kind,
            target_id: targetId,
            status,
            deadline: deadline || null,
            reminder_days: Number(reminderDays),
            notes: notes.trim() || null,
            next_action: nextAction.trim() || null,
          }),
        });
      }
      return apiFetch(`/plans/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          deadline: deadline || null,
          reminder_days: Number(reminderDays),
          notes: notes.trim() || null,
          next_action: nextAction.trim() || null,
        }),
      });
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(editing ? t("planPage.updated") : t("planPage.created"));
    },
    onError: (error: unknown) =>
      toast.error(
        getErrorMessage(
          error,
          editing ? t("planPage.updateError") : t("planPage.addError")
        )
      ),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: PlanStatus }) =>
      apiFetch(`/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success(t("planPage.updated"));
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("planPage.updateError"))),
  });

  const { mutate: removePlan, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast.success(t("planPage.deleted"));
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("planPage.deleteError"))),
  });

  const openCreate = () => {
    setEditing(null);
    setKind("UNIVERSITY");
    setTargetId("");
    setStatus("RESEARCHING");
    setDeadline("");
    setReminderDays("7");
    setNextAction("");
    setNotes("");
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setKind(plan.kind);
    setTargetId(plan.target_id);
    setStatus(plan.status);
    setDeadline(plan.deadline || "");
    setReminderDays(String(plan.reminder_days ?? 7));
    setNextAction(plan.next_action || "");
    setNotes(plan.notes || "");
    setDialogOpen(true);
  };

  const handleDelete = async (plan: Plan) => {
    const title = getLocalized(plan.target_title) || "";
    const confirmed = await confirm({
      title: title
        ? isKm
          ? `ដក ${title} ចេញ?`
          : `Remove ${title}?`
        : t("planPage.deleteTitle"),
      description: t("planPage.deleteBody"),
      confirmLabel: t("planPage.confirmDelete"),
      cancelLabel: t("planPage.cancel"),
      tone: "danger",
    });
    if (confirmed) removePlan(plan.id);
  };

  const exportCalendar = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const events: string[][] = [];

    plans.forEach((plan) => {
      const title =
        getLocalized(plan.target_title) || plan.target_title?.en || "Application";
      const kind = kindLabel(plan.kind);
      const planDescription = [kind, plan.next_action, plan.notes]
        .filter(Boolean)
        .join(" - ");

      if (plan.deadline) {
        events.push([
          "BEGIN:VEVENT",
          `UID:plan-${plan.id}@orienx`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${dateToIcs(plan.deadline)}`,
          `DTEND;VALUE=DATE:${dateToIcs(nextDay(plan.deadline))}`,
          `SUMMARY:${escapeIcs(title)}`,
          `DESCRIPTION:${escapeIcs(planDescription)}`,
          ...(plan.target_url ? [`URL:${escapeIcs(plan.target_url)}`] : []),
          "BEGIN:VALARM",
          `TRIGGER:-P${plan.reminder_days || 7}D`,
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcs(title)}`,
          "END:VALARM",
          "END:VEVENT",
        ]);
      }

      (plan.documents || []).forEach((document) => {
        if (!document.due_date || document.is_completed) return;
        const documentName =
          isKm && document.name_km ? document.name_km : document.name_en;
        const requirement = document.is_required
          ? isKm
            ? "ឯកសារចាំបាច់"
            : "Required document"
          : isKm
          ? "ឯកសារស្រេចចិត្ត"
          : "Optional document";
        const description = [
          title,
          kind,
          requirement,
          document.notes,
        ]
          .filter(Boolean)
          .join(" - ");
        events.push([
          "BEGIN:VEVENT",
          `UID:plan-doc-${document.id}@orienx`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${dateToIcs(document.due_date)}`,
          `DTEND;VALUE=DATE:${dateToIcs(nextDay(document.due_date))}`,
          `SUMMARY:${escapeIcs(
            `${isKm ? "ឯកសារ" : "Document"}: ${documentName} — ${title}`
          )}`,
          `DESCRIPTION:${escapeIcs(description)}`,
          ...(plan.target_url ? [`URL:${escapeIcs(plan.target_url)}`] : []),
          "BEGIN:VALARM",
          `TRIGGER:-P${plan.reminder_days || 7}D`,
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcs(documentName)}`,
          "END:VALARM",
          "END:VEVENT",
        ]);
      });
    });

    if (events.length === 0) {
      toast.warning(t("planPage.noDeadlineToExport"));
      return;
    }

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//OrienX//Application Plan//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events.flat(),
      "END:VCALENDAR",
    ];

    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orienx-application-plan.ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(t("planPage.calendarExported"));
  };

  const countdown = (plan: Plan) => {
    const days = daysUntil(plan.deadline);
    if (days === null) return null;
    if (days < 0) {
      return {
        label: t("planPage.overdue"),
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }
    if (days === 0) {
      return {
        label: t("planPage.dueToday"),
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
    if (days === 1) {
      return {
        label: t("planPage.dueTomorrow"),
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
    return {
      label: t("planPage.daysLeft").replace("{days}", String(days)),
      className:
        days <= 14
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
    };
  };

  return (
    <div data-dashboard-page="sections" className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#111965]">
            <ClipboardList className="h-5 w-5 text-[#F69D0D]" />
            <h1 className="text-xl font-black tracking-tight sm:text-3xl">
              {t("planPage.title")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#68708A] sm:text-sm">
            {t("planPage.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCalendar}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-white px-3.5 text-xs font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA]"
          >
            <Download className="h-3.5 w-3.5" />
            {t("planPage.exportCalendar")}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#111965] px-4 text-xs font-black text-white transition-colors hover:bg-[#1E277A]"
          >
            <Plus className="h-4 w-4" />
            {t("planPage.addApplication")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/10 text-[#229ED9]">
              <Send className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-black text-[#111965]">
                  {t("planPage.telegramTitle")}
                </h2>
                {notificationSettings?.telegram_connected && (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                      notificationSettings.reminders_enabled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    )}
                  >
                    {notificationSettings.reminders_enabled
                      ? t("planPage.remindersEnabled")
                      : t("planPage.remindersPaused")}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-[#68708A]">
                {t("planPage.telegramSubtitle")}
              </p>
              {notificationSettings?.telegram_connected && (
                <p className="mt-1 text-[10px] font-semibold text-[#229ED9]">
                  {t("planPage.telegramConnectedAs").replace(
                    "{username}",
                    notificationSettings.telegram_username || "Telegram"
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {notificationSettings?.telegram_connected ? (
              <>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationSettings.reminders_enabled}
                  disabled={updatingNotifications}
                  onClick={() =>
                    updateNotifications(!notificationSettings.reminders_enabled)
                  }
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-bold transition-colors disabled:opacity-60",
                    notificationSettings.reminders_enabled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  <BellRing className="h-3.5 w-3.5" />
                  {notificationSettings.reminders_enabled
                    ? t("planPage.remindersEnabled")
                    : t("planPage.remindersPaused")}
                </button>
                <button
                  type="button"
                  onClick={() => sendTelegramTest()}
                  disabled={sendingTelegramTest}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E6E8F0] px-3 text-[11px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] disabled:opacity-60"
                >
                  {sendingTelegramTest ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {t("planPage.testMessage")}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectTelegram}
                  disabled={disconnectingTelegram}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E6E8F0] px-3 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  {t("planPage.disconnectTelegram")}
                </button>
              </>
            ) : telegramLink ? (
              <div className="flex flex-col items-start gap-1.5 lg:items-end">
                <p className="text-[11px] font-semibold text-[#475569]">
                  {t("planPage.telegramInstructions")}
                </p>
                <a
                  href={telegramLink.deep_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#229ED9] px-3.5 text-[11px] font-black text-white transition-colors hover:bg-[#1E8FC4]"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t("planPage.openTelegram")}
                </a>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("planPage.waitingTelegram")}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => connectTelegram()}
                disabled={linkingTelegram}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#229ED9] px-3.5 text-[11px] font-black text-white transition-colors hover:bg-[#1E8FC4] disabled:opacity-60"
              >
                {linkingTelegram ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {t("planPage.connectTelegram")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t("planPage.totalTracked"), value: plans.length, icon: ClipboardList, color: "bg-[#F0F2FA] text-[#111965]" },
          { label: t("planPage.dueSoon"), value: dueSoon, icon: Clock3, color: "bg-amber-50 text-amber-600" },
          { label: t("planPage.submitted"), value: submitted, icon: CheckCircle2, color: "bg-indigo-50 text-indigo-600" },
          { label: t("planPage.accepted"), value: accepted, icon: Award, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs"
            >
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", stat.color)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="mt-2 text-2xl font-black tabular-nums text-[#111965]">
                {stat.value}
              </div>
              <div className="text-[11px] font-semibold text-[#68708A]">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E8F0] pb-3">
        {[
          { value: "ALL" as const, label: t("planPage.all") },
          { value: "UNIVERSITY" as const, label: t("planPage.universities") },
          { value: "SCHOLARSHIP" as const, label: t("planPage.scholarships") },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold transition-colors",
              filter === option.value
                ? "bg-[#111965] text-white"
                : "border border-[#E6E8F0] bg-white text-[#68708A] hover:text-[#111965]"
            )}
          >
            {option.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-[#E6E8F0] bg-white p-1">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10.5px] font-bold transition-colors",
              view === "cards"
                ? "bg-[#111965] text-white"
                : "text-[#68708A] hover:text-[#111965]"
            )}
          >
            <LayoutGrid className="h-3 w-3" />
            {t("planPage.timeline.cards")}
          </button>
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10.5px] font-bold transition-colors",
              view === "timeline"
                ? "bg-[#111965] text-white"
                : "text-[#68708A] hover:text-[#111965]"
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {t("planPage.timeline.timeline")}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-xs text-[#68708A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading", "Loading...")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
            <ClipboardList className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-black text-[#111965]">
            {t("planPage.emptyTitle")}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#68708A]">
            {t("planPage.emptyBody")}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] hover:bg-[#E5BD3B]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("planPage.addFirst")}
          </button>
        </div>
      ) : view === "timeline" ? (
        <PlanTimeline plans={filtered} getLocalized={getLocalized} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((plan) => {
            const title = getLocalized(plan.target_title) || plan.target_title?.en || "";
            const remaining = countdown(plan);
            const KindIcon = plan.kind === "UNIVERSITY" ? GraduationCap : Award;
            return (
              <article
                key={plan.id}
                className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] text-[#111965]">
                    {plan.target_image_url ? (
                      <img
                        src={plan.target_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <KindIcon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[10px] font-black text-[#68708A]">
                        {kindLabel(plan.kind)}
                      </span>
                      {remaining && (
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", remaining.className)}>
                          {remaining.label}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 line-clamp-1 text-sm font-black text-[#111965]">
                      {title}
                    </h3>
                    {plan.target_subtitle && (
                      <p className="truncate text-[11px] text-[#68708A]">
                        {plan.target_subtitle}
                      </p>
                    )}
                  </div>
                  {plan.target_url && (
                    <a
                      href={plan.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965]"
                      aria-label={t("planPage.officialPage")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#68708A]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {plan.deadline
                    ? formatDate(plan.deadline, isKm)
                    : t("planPage.noDeadline")}
                  <span className="mx-1 text-[#D9DEEA]">·</span>
                  <Clock3 className="h-3.5 w-3.5" />
                  {t("planPage.reminder")}:{" "}
                  {t(`planPage.reminders.${plan.reminder_days}`)}
                </div>

                {plan.next_action && (
                  <p className="mt-3 rounded-xl bg-[#F8FAFD] px-3 py-2 text-[11px] font-semibold text-[#475569]">
                    {plan.next_action}
                  </p>
                )}
                {plan.notes && (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#68708A]">
                    {plan.notes}
                  </p>
                )}

                <PlanChecklist plan={plan} onChanged={invalidate} />

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F0F2FA] pt-3">
                  <div className="w-[170px]">
                    <Select
                      value={plan.status}
                      onChange={(value) =>
                        updateStatus({ id: plan.id, value: value as PlanStatus })
                      }
                      options={STATUSES.map((value) => ({
                        value,
                        label: statusLabel(value),
                      }))}
                      label={t("planPage.status")}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965]"
                      aria-label={t("planPage.edit")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan)}
                      disabled={deleting}
                      className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                      aria-label={t("planPage.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050814]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? t("planPage.editTitle") : t("planPage.addTitle")}
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  {editing ? t("planPage.editTitle") : t("planPage.addTitle")}
                </div>
                <h3 className="mt-1 text-lg font-black text-[#111965]">
                  {editing
                    ? getLocalized(editing.target_title) || editing.target_title?.en
                    : t("planPage.addApplication")}
                </h3>
                <p className="mt-0.5 text-xs text-[#68708A]">
                  {editing ? t("planPage.editSubtitle") : t("planPage.addSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA]"
                aria-label={t("planPage.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                savePlan();
              }}
              className="space-y-4"
            >
              {!editing && (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                      {t("planPage.kind")}
                    </span>
                    <Select
                      value={kind}
                      onChange={(value) => {
                        setKind(value as PlanKind);
                        setTargetId("");
                      }}
                      options={[
                        { value: "UNIVERSITY", label: t("planPage.universities") },
                        { value: "SCHOLARSHIP", label: t("planPage.scholarships") },
                      ]}
                      label={t("planPage.kind")}
                      className="w-full"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                      {t("planPage.target")}
                    </span>
                    <Select
                      value={targetId}
                      onChange={setTargetId}
                      options={targetOptions}
                      label={t("planPage.target")}
                      placeholder={
                        kind === "UNIVERSITY"
                          ? t("planPage.chooseUniversity")
                          : t("planPage.chooseScholarship")
                      }
                      searchable
                      className="w-full"
                      menuClassName="min-w-[300px]"
                    />
                  </label>
                </>
              )}

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                  {t("planPage.status")}
                </span>
                <Select
                  value={status}
                  onChange={(value) => setStatus(value as PlanStatus)}
                  options={STATUSES.map((value) => ({
                    value,
                    label: statusLabel(value),
                  }))}
                  label={t("planPage.status")}
                  className="w-full"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                    {t("planPage.deadline")}
                  </span>
                  <DatePicker
                    value={deadline}
                    onChange={setDeadline}
                    label={t("planPage.deadline")}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                    {t("planPage.reminder")}
                  </span>
                  <Select
                    value={reminderDays}
                    onChange={setReminderDays}
                    options={REMINDER_OPTIONS.map((value) => ({
                      value,
                      label: t(`planPage.reminders.${value}`),
                    }))}
                    label={t("planPage.reminder")}
                    className="w-full"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                  {t("planPage.nextAction")}
                </span>
                <input
                  value={nextAction}
                  onChange={(event) => setNextAction(event.target.value)}
                  maxLength={255}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                  {t("planPage.notes")}
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2.5 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white"
                />
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="h-10 rounded-xl border border-[#E6E8F0] px-4 text-xs font-bold text-[#475569] hover:bg-[#F8FAFD]"
                >
                  {t("planPage.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#111965] px-5 text-xs font-black text-white hover:bg-[#1E277A] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving
                    ? editing
                      ? t("planPage.saving")
                      : t("planPage.creating")
                    : editing
                    ? t("planPage.save")
                    : t("planPage.addApplication")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
