import type { QueryClient } from "@tanstack/react-query";
import type {
  InAppNotification,
  NotificationCategory,
  NotificationList,
  NotificationSummary,
} from "./notification-types";

export function notificationTitle(
  notification: InAppNotification,
  language: "en" | "km"
) {
  if (language === "km" && notification.title_km) return notification.title_km;
  return notification.title_en || notification.title_km || "";
}

export function notificationMessage(
  notification: InAppNotification,
  language: "en" | "km"
) {
  if (language === "km" && notification.message_km) return notification.message_km;
  return notification.message_en || notification.message_km || "";
}

export function notificationHref(notification: InAppNotification) {
  return notification.href || "/dashboard/plan";
}

export function formatNotificationTime(
  value: string,
  language: "en" | "km"
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const formatter = new Intl.RelativeTimeFormat(language === "km" ? "km" : "en", {
    numeric: "auto",
  });

  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  if (Math.abs(days) < 7) return formatter.format(days, "day");

  return new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function notificationCategoryLabel(
  category: NotificationCategory,
  language: "en" | "km"
) {
  const labels: Record<NotificationCategory, { en: string; km: string }> = {
    DEADLINE: { en: "Deadline", km: "កាលកំណត់" },
    DOCUMENT: { en: "Document", km: "ឯកសារ" },
    SCHOLARSHIP: { en: "Scholarship", km: "អាហារូបករណ៍" },
    SYSTEM: { en: "System", km: "ប្រព័ន្ធ" },
  };
  return labels[category]?.[language] || labels.SYSTEM[language];
}


type CachedNotificationData = NotificationList | NotificationSummary;

export function patchNotificationCache(
  queryClient: QueryClient,
  notification: InAppNotification,
  isRead: boolean
) {
  queryClient.setQueriesData<CachedNotificationData>(
    { queryKey: ["notifications"] },
    (old) => {
      if (!old || !Array.isArray(old.items)) return old;
      const items = old.items.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              is_read: isRead,
              read_at: isRead ? new Date().toISOString() : null,
            }
          : item
      );
      const delta = isRead ? -1 : 1;
      const next = {
        ...old,
        items,
        unread_count: Math.max(0, old.unread_count + delta),
      } as CachedNotificationData;
      return next;
    }
  );
}

export function markAllNotificationCacheRead(queryClient: QueryClient) {
  queryClient.setQueriesData<CachedNotificationData>(
    { queryKey: ["notifications"] },
    (old) => {
      if (!old || !Array.isArray(old.items)) return old;
      const readAt = new Date().toISOString();
      return {
        ...old,
        items: old.items.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || readAt,
        })),
        unread_count: 0,
      } as CachedNotificationData;
    }
  );
}
