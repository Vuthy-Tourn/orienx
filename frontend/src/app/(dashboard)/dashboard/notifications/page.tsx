"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Inbox,
  Info,
  Loader2,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  InAppNotification,
  NotificationCategory,
  NotificationList,
  NotificationStatusFilter,
} from "@/lib/notification-types";
import {
  formatNotificationTime,
  markAllNotificationCacheRead,
  notificationCategoryLabel,
  notificationHref,
  notificationMessage,
  notificationTitle,
  patchNotificationCache,
} from "@/lib/notification-utils";

const PAGE_SIZE = 10;

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  DEADLINE: CalendarClock,
  DOCUMENT: FileText,
  SCHOLARSHIP: Award,
  SYSTEM: Info,
};

const CATEGORY_CLASSES: Record<NotificationCategory, string> = {
  DEADLINE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  DOCUMENT:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  SCHOLARSHIP:
    "border-[#F7CE4D]/50 bg-[#FFF8E1] text-[#8A5A00] dark:border-[#F7CE4D]/30 dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]",
  SYSTEM:
    "border-[#E6E8F0] bg-[#F0F2FA] text-[#111965] dark:border-white/10 dark:bg-white/10 dark:text-slate-200",
};

export default function NotificationsPage() {
  const { language } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const [status, setStatus] = useState<NotificationStatusFilter>("all");
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [, bumpRender] = useState(0);

  const copy = {
    title: isKm ? "មជ្ឈមណ្ឌលជូនដំណឹង" : "Notification center",
    subtitle: isKm
      ? "ការរំលឹកកាលកំណត់ ឯកសារ និងព័ត៌មានសំខាន់ៗសម្រាប់ផែនការដាក់ពាក្យរបស់អ្នក។"
      : "Deadline, document, and scholarship updates for your application plans.",
    markAll: isKm ? "អានទាំងអស់" : "Mark all read",
    all: isKm ? "ទាំងអស់" : "All",
    unread: isKm ? "មិនបានអាន" : "Unread",
    read: isKm ? "បានអាន" : "Read",
    allCategories: isKm ? "ប្រភេទទាំងអស់" : "All categories",
    empty: isKm ? "មិនមានការជូនដំណឹងទេ។" : "No notifications yet.",
    emptyHint: isKm
      ? "នៅពេលអ្នកបន្ថែមផែនការដាក់ពាក្យ ឬកាលកំណត់ឯកសារ ការរំលឹកនឹងបង្ហាញនៅទីនេះ។"
      : "Add application plans or document due dates and reminders will appear here.",
    markRead: isKm ? "សម្គាល់ថាបានអាន" : "Mark as read",
    markUnread: isKm ? "សម្គាល់ថាមិនបានអាន" : "Mark as unread",
    open: isKm ? "បើក" : "Open",
    delete: isKm ? "លុប" : "Delete",
    deleteTitle: isKm ? "លុបការជូនដំណឹង?" : "Delete notification?",
    deleteBody: isKm
      ? "ការជូនដំណឹងនេះនឹងត្រូវលុប ហើយមិនអាចយកមកវិញបានទេ។"
      : "This notification will be removed and cannot be recovered.",
    cancel: isKm ? "បោះបង់" : "Cancel",
    deleted: isKm ? "បានលុបការជូនដំណឹង។" : "Notification deleted.",
    markedAll: isKm ? "បានសម្គាល់ថាអានទាំងអស់។" : "All notifications marked as read.",
    showing: isKm ? "បង្ហាញ" : "Showing",
    of: isKm ? "ក្នុង" : "of",
    previous: isKm ? "មុន" : "Previous",
    next: isKm ? "បន្ទាប់" : "Next",
  };

  const params = new URLSearchParams({
    status,
    page: String(page),
    page_size: String(PAGE_SIZE),
  });
  if (category !== "all") params.set("category", category);

  const queryKey = ["notifications", "list", status, category, page] as const;
  const { data: queryData, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => apiFetch<NotificationList>(`/notifications?${params.toString()}`),
  });
  const data = queryClient.getQueryData<NotificationList>(queryKey) ?? queryData;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unread_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const handleMarkRead = async (notification: InAppNotification) => {
    if (pendingId) return;
    const isRead = !notification.is_read;
    setPendingId(notification.id);
    patchNotificationCache(queryClient, notification, isRead);
    bumpRender((value) => value + 1);
    try {
      await apiFetch(`/notifications/${notification.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: isRead }),
      });
      await invalidate();
      bumpRender((value) => value + 1);
    } catch (error) {
      patchNotificationCache(queryClient, notification, !isRead);
      bumpRender((value) => value + 1);
      toast.error(
        getErrorMessage(
          error,
          isKm ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ។" : "Could not update notification."
        )
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    markAllNotificationCacheRead(queryClient);
    bumpRender((value) => value + 1);
    try {
      await apiFetch<{ updated: number }>("/notifications/read-all", {
        method: "POST",
      });
      await invalidate();
      bumpRender((value) => value + 1);
      toast.success(copy.markedAll);
    } catch (error) {
      await invalidate();
      bumpRender((value) => value + 1);
      toast.error(
        getErrorMessage(
          error,
          isKm ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ។" : "Could not update notifications."
        )
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notification: InAppNotification) => {
    const confirmed = await confirm({
      title: copy.deleteTitle,
      description: copy.deleteBody,
      confirmLabel: copy.delete,
      cancelLabel: copy.cancel,
      tone: "danger",
    });
    if (!confirmed) return;
    setPendingId(notification.id);
    try {
      await apiFetch(`/notifications/${notification.id}`, { method: "DELETE" });
      toast.success(copy.deleted);
      if (items.length <= 1 && page > 1) {
        setPage((value) => Math.max(1, value - 1));
      }
      await invalidate();
      bumpRender((value) => value + 1);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isKm ? "មិនអាចលុបបានទេ។" : "Could not delete notification."
        )
      );
    } finally {
      setPendingId(null);
    }
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#111965] dark:text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-[#F7CE4D]">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                {copy.title}
              </h1>
              <p className="mt-0.5 max-w-2xl text-[11px] text-[#68708A] dark:text-slate-400 sm:text-xs">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleMarkAll()}
          disabled={unreadCount === 0 || markingAll}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#111965] px-4 text-[11px] font-black text-white transition-colors hover:bg-[#1E277A] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          {markingAll ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" />
          )}
          {copy.markAll}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-2xl font-black tabular-nums text-[#111965] dark:text-white">
            {unreadCount}
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#68708A] dark:text-slate-400">
            {copy.unread}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-2xl font-black tabular-nums text-[#111965] dark:text-white">
            {total}
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#68708A] dark:text-slate-400">
            {copy.all}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-2xl font-black tabular-nums text-[#111965] dark:text-white">
            {totalPages}
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#68708A] dark:text-slate-400">
            {isKm ? "ទំព័រ" : "Pages"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#F8FAFD] p-1 dark:bg-white/[0.04]">
            {(
              [
                ["all", copy.all],
                ["unread", copy.unread],
                ["read", copy.read],
              ] as Array<[NotificationStatusFilter, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatus(value);
                  resetPage();
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[10.5px] font-bold transition-colors",
                  status === value
                    ? "bg-white text-[#111965] shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-[#68708A] hover:text-[#111965] dark:text-slate-400 dark:hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                resetPage();
              }}
              className={cn(
                "inline-flex h-8 items-center rounded-lg border px-2.5 text-[10.5px] font-bold transition-colors",
                category === "all"
                  ? "border-[#111965] bg-[#111965] text-white dark:border-indigo-600 dark:bg-indigo-600"
                  : "border-[#E6E8F0] bg-white text-[#68708A] hover:text-[#111965] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {copy.allCategories}
            </button>
            {(["DEADLINE", "DOCUMENT", "SCHOLARSHIP", "SYSTEM"] as NotificationCategory[]).map(
              (value) => {
                const Icon = CATEGORY_ICONS[value];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setCategory(value);
                      resetPage();
                    }}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-bold transition-colors",
                      category === value
                        ? "border-[#111965] bg-[#111965] text-white dark:border-indigo-600 dark:bg-indigo-600"
                        : "border-[#E6E8F0] bg-white text-[#68708A] hover:text-[#111965] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {notificationCategoryLabel(value, language)}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="relative mt-4">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/50 pt-6 backdrop-blur-[1px] dark:bg-[#090D24]/50">
              <Loader2 className="h-4 w-4 animate-spin text-[#111965] dark:text-[#F7CE4D]" />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A] dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isKm ? "កំពុងផ្ទុក…" : "Loading…"}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9DEEA] px-6 py-14 text-center dark:border-white/10">
              <Inbox className="mx-auto h-8 w-8 text-[#94A3B8] dark:text-slate-500" />
              <p className="mt-3 text-sm font-black text-[#111965] dark:text-white">
                {copy.empty}
              </p>
              <p className="mx-auto mt-1 max-w-md text-[11px] text-[#68708A] dark:text-slate-400">
                {copy.emptyHint}
              </p>
              <Link
                href="/dashboard/plan"
                className="mt-4 inline-flex h-9 items-center rounded-xl bg-[#111965] px-4 text-[11px] font-black text-white hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                {isKm ? "ទៅកាន់ផែនការ" : "Go to My Plan"}
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>
                {items.map((notification, index) => {
                  const Icon = CATEGORY_ICONS[notification.category];
                  return (
                    <motion.li
                      key={notification.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.2,
                        delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.2),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn(
                        "group rounded-2xl border p-3.5 transition-colors sm:p-4",
                        notification.is_read
                          ? "border-[#E6E8F0] bg-white dark:border-white/10 dark:bg-white/[0.02]"
                          : "border-[#111965]/15 bg-[#F8FAFD] dark:border-[#F7CE4D]/20 dark:bg-[#F7CE4D]/[0.04]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            CATEGORY_CLASSES[notification.category]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              {!notification.is_read && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F7CE4D]" />
                              )}
                              <h2 className="text-[12px] font-black leading-snug text-[#111965] dark:text-white">
                                {notificationTitle(notification, language)}
                              </h2>
                            </div>
                            <span
                              className={cn(
                                "rounded-md border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider",
                                CATEGORY_CLASSES[notification.category]
                              )}
                            >
                              {notificationCategoryLabel(notification.category, language)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#68708A] dark:text-slate-400">
                            {notificationMessage(notification, language)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[9.5px] font-semibold text-[#94A3B8] dark:text-slate-500">
                              {formatNotificationTime(notification.created_at, language)}
                            </span>
                            <span className="text-[#D9DEEA] dark:text-white/10">·</span>
                            <Link
                              href={notificationHref(notification)}
                              onClick={() => {
                                if (!notification.is_read) {
                                  void handleMarkRead(notification);
                                }
                              }}
                              className="text-[10px] font-bold text-[#111965] hover:underline dark:text-[#F7CE4D]"
                            >
                              {copy.open}
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleMarkRead(notification)}
                              disabled={pendingId === notification.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#68708A] transition-colors hover:text-[#111965] disabled:opacity-50 dark:text-slate-400 dark:hover:text-white"
                            >
                              {pendingId === notification.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : notification.is_read ? (
                                <Mail className="h-3 w-3" />
                              ) : (
                                <MailOpen className="h-3 w-3" />
                              )}
                              {notification.is_read ? copy.markUnread : copy.markRead}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(notification)}
                              disabled={pendingId === notification.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#94A3B8] transition-colors hover:text-rose-600 disabled:opacity-50 dark:text-slate-500 dark:hover:text-rose-400"
                            >
                              <Trash2 className="h-3 w-3" />
                              {copy.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F2FA] pt-3 text-[10.5px] text-[#68708A] dark:border-white/10 dark:text-slate-400">
            <span>
              {copy.showing} {from}–{to} {copy.of} {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E6E8F0] bg-white px-2.5 font-bold text-[#111965] disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                <ChevronLeft className="h-3 w-3" />
                {copy.previous}
              </button>
              <span className="font-bold text-[#475569] dark:text-slate-300">
                {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E6E8F0] bg-white px-2.5 font-bold text-[#111965] disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                {copy.next}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
