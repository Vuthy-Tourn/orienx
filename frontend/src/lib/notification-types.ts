export type NotificationCategory =
  | "DEADLINE"
  | "DOCUMENT"
  | "SCHOLARSHIP"
  | "SYSTEM";

export type NotificationStatusFilter = "all" | "unread" | "read";

export interface InAppNotification {
  id: string;
  category: NotificationCategory;
  title_en: string;
  title_km?: string | null;
  message_en: string;
  message_km?: string | null;
  href?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationList {
  items: InAppNotification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface NotificationSummary {
  unread_count: number;
  items: InAppNotification[];
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "DEADLINE",
  "DOCUMENT",
  "SCHOLARSHIP",
  "SYSTEM",
];
