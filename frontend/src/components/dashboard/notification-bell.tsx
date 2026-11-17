"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  Bell,
  CalendarClock,
  CheckCheck,
  FileText,
  Info,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import type {
  InAppNotification,
  NotificationCategory,
  NotificationSummary,
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

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  DEADLINE: CalendarClock,
  DOCUMENT: FileText,
  SCHOLARSHIP: Award,
  SYSTEM: Info,
};

const CATEGORY_CLASSES: Record<NotificationCategory, string> = {
  DEADLINE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  DOCUMENT: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  SCHOLARSHIP:
    "bg-[#FFF8E1] text-[#8A5A00] dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]",
  SYSTEM: "bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-slate-200",
};

export function NotificationBell() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === "km";
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", "summary"],
    queryFn: async () => apiFetch<NotificationSummary>("/notifications/summary"),
    refetchInterval: 60_000,
    staleTime: 20_000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: async (notification: InAppNotification) => {
      const isRead = !notification.is_read;
      await apiFetch(`/notifications/${notification.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: isRead }),
      });
      return { notification, isRead };
    },
    onSuccess: ({ notification, isRead }) => {
      patchNotificationCache(queryClient, notification, isRead);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: async () =>
      apiFetch<{ updated: number }>("/notifications/read-all", {
        method: "POST",
      }),
    onSuccess: () => {
      markAllNotificationCacheRead(queryClient);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    if (!open) return;
    void refetch();
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, refetch]);

  const unread = data?.unread_count ?? 0;
  const items = data?.items ?? [];

  const openNotification = (notification: InAppNotification) => {
    if (!notification.is_read) markRead(notification);
    setOpen(false);
    router.push(notificationHref(notification));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={isKm ? "ការជូនដំណឹង" : "Notifications"}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E8F0] bg-white text-[#111965] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="absolute -right-1.5 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#F7CE4D] px-1 text-[9px] font-black leading-[18px] text-[#111965] shadow-sm"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-11 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white shadow-2xl dark:border-white/10 dark:bg-[#090D24]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#E6E8F0] px-4 py-3 dark:border-white/10">
              <div>
                <p className="text-xs font-black text-[#111965] dark:text-white">
                  {isKm ? "ការជូនដំណឹង" : "Notifications"}
                </p>
                <p className="text-[10px] font-semibold text-[#94A3B8] dark:text-slate-500">
                  {unread > 0
                    ? isKm
                      ? `${unread} មិនបានអាន`
                      : `${unread} unread`
                    : isKm
                      ? "បានអានទាំងអស់"
                      : "All caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={unread === 0 || markingAll}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] disabled:opacity-40 dark:text-[#F7CE4D] dark:hover:bg-white/10"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                {isKm ? "អានទាំងអស់" : "Mark all read"}
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-[#68708A] dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isKm ? "កំពុងផ្ទុក…" : "Loading…"}
                </div>
              ) : items.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto h-6 w-6 text-[#94A3B8] dark:text-slate-500" />
                  <p className="mt-2 text-[11px] font-semibold text-[#68708A] dark:text-slate-400">
                    {isKm ? "មិនមានការជូនដំណឹងទេ។" : "No notifications yet."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F0F2FA] dark:divide-white/10">
                  {items.map((notification) => {
                    const Icon = CATEGORY_ICONS[notification.category];
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFD] dark:hover:bg-white/5",
                            !notification.is_read && "bg-[#F8FAFD]/70 dark:bg-white/[0.02]"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                              CATEGORY_CLASSES[notification.category]
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-black leading-snug text-[#111965] dark:text-white">
                                {notificationTitle(notification, language)}
                              </span>
                              {!notification.is_read && (
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F7CE4D]" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] leading-relaxed text-[#68708A] dark:text-slate-400">
                              {notificationMessage(notification, language)}
                            </span>
                            <span className="mt-1 block text-[9.5px] font-semibold text-[#94A3B8] dark:text-slate-500">
                              {notificationCategoryLabel(notification.category, language)} ·{" "}
                              {formatNotificationTime(notification.created_at, language)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center border-t border-[#E6E8F0] px-4 py-2.5 text-[10.5px] font-black text-[#111965] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:text-[#F7CE4D] dark:hover:bg-white/5"
            >
              {isKm ? "មើលការជូនដំណឹងទាំងអស់" : "View all notifications"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
