import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Backwards-compatible USD formatter used across the public directory.
export function formatUSD(amount?: number | null): string {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message || fallback;
  }
  if (typeof error === "string" && error) return error;
  return fallback;
}

// Utility function to format a number with currency
export function formatCurrency(
  amount: number,
  currency = "USD",
  options?: Omit<Intl.NumberFormatOptions, "style" | "currency">
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}

// Utility function to generate a unique ID
export function generateUniqueId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Utility function to truncate text
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Utility function to format date
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

const PROVINCE_KM: Record<string, string> = {
  "phnom penh": "ភ្នំពេញ",
  "siem reap": "សៀមរាប",
  "kampong speu": "កំពង់ស្ពឺ",
  "banteay meanchey": "បន្ទាយមានជ័យ",
  "battambang": "បាត់ដំបង",
  "svay rieng": "ស្វាយរៀង",
  "tbong khmum": "ត្បូងឃ្មុំ",
};

const DEGREE_LABELS: Record<string, { en: string; km: string }> = {
  ASSOCIATE: { en: "Associate", km: "បរិញ្ញាបត្ររង" },
  BACHELOR: { en: "Bachelor", km: "បរិញ្ញាបត្រ" },
};

const INSTRUCTION_LANGUAGE_LABELS: Record<string, { en: string; km: string }> = {
  ENGLISH: { en: "English", km: "អង់គ្លេស" },
  KHMER: { en: "Khmer", km: "ខ្មែរ" },
  BILINGUAL: { en: "Bilingual", km: "ពីរភាសា (ខ្មែរ-អង់គ្លេស)" },
  FRENCH: { en: "French", km: "បារាំង" },
};

/** Localizes a Cambodian province name while preserving unknown values. */
export function localizeProvince(
  province?: string | null,
  language: "en" | "km" = "en"
): string {
  const value = province?.trim() ?? "";
  if (!value) return "";
  if (language !== "km") return value;
  return PROVINCE_KM[value.toLowerCase()] ?? value;
}

/** Localizes an academic degree level enum for display. */
export function localizeDegreeLevel(
  level?: string | null,
  language: "en" | "km" = "en"
): string {
  const key = level?.trim().toUpperCase() ?? "";
  if (!key) return "";
  const entry = DEGREE_LABELS[key];
  if (entry) return entry[language];
  return key.charAt(0) + key.slice(1).toLowerCase();
}

/** Localizes a language-of-instruction enum for display. */
export function localizeInstructionLanguage(
  lang?: string | null,
  language: "en" | "km" = "en"
): string {
  const key = lang?.trim().toUpperCase() ?? "";
  if (!key) return "";
  const entry = INSTRUCTION_LANGUAGE_LABELS[key];
  if (entry) return entry[language];
  return key.charAt(0) + key.slice(1).toLowerCase();
}

