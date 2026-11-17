"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  CornerDownLeft,
  FileSearch,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import type { GlobalSearchResults } from "@/lib/global-search-types";

type GroupKey =
  | "universities"
  | "majors"
  | "careers"
  | "scholarships"
  | "pages";

interface ResultItem {
  id: string;
  group: GroupKey;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
}

interface ResultGroup {
  key: GroupKey;
  label: string;
  items: ResultItem[];
}

const QUICK_LINKS = [
  {
    id: "dashboard",
    href: "/dashboard",
    labelEn: "Dashboard",
    labelKm: "ផ្ទាំងគ្រប់គ្រង",
    descriptionEn: "Your guidance overview",
    descriptionKm: "ទិដ្ឋភាពទូទៅនៃការណែនាំ",
    icon: LayoutDashboard,
  },
  {
    id: "plan",
    href: "/dashboard/plan",
    labelEn: "My Plan",
    labelKm: "ផែនការរបស់ខ្ញុំ",
    descriptionEn: "Applications, deadlines and documents",
    descriptionKm: "ការដាក់ពាក្យ កាលកំណត់ និងឯកសារ",
    icon: ClipboardList,
  },
  {
    id: "notifications",
    href: "/dashboard/notifications",
    labelEn: "Notifications",
    labelKm: "ការជូនដំណឹង",
    descriptionEn: "Reminders and updates",
    descriptionKm: "ការរំលឹក និងព័ត៌មានថ្មី",
    icon: Bell,
  },
  {
    id: "eligibility",
    href: "/dashboard/eligibility",
    labelEn: "BACII Checker",
    labelKm: "ការពិនិត្យ BACII",
    descriptionEn: "See programs within reach",
    descriptionKm: "មើលកម្មវិធីដែលស្ថិតក្នុងលទ្ធភាព",
    icon: GraduationCap,
  },
  {
    id: "universities",
    href: "/universities",
    labelEn: "Universities",
    labelKm: "សាកលវិទ្យាល័យ",
    descriptionEn: "Browse the university directory",
    descriptionKm: "រកមើលបញ្ជីសាកលវិទ្យាល័យ",
    icon: Building2,
  },
  {
    id: "majors",
    href: "/majors",
    labelEn: "Majors",
    labelKm: "មុខជំនាញ",
    descriptionEn: "Explore academic programs",
    descriptionKm: "ស្វែងយល់ពីកម្មវិធីសិក្សា",
    icon: BookOpen,
  },
  {
    id: "careers",
    href: "/careers",
    labelEn: "Careers",
    labelKm: "អាជីពការងារ",
    descriptionEn: "Discover career pathways",
    descriptionKm: "ស្វែងយល់ពីផ្លូវអាជីព",
    icon: Briefcase,
  },
  {
    id: "scholarships",
    href: "/scholarships",
    labelEn: "Scholarships",
    labelKm: "អាហារូបករណ៍",
    descriptionEn: "Find funding opportunities",
    descriptionKm: "ស្វែងរកឱកាសហិរញ្ញប្បទាន",
    icon: Award,
  },
];

const GROUP_ICONS: Record<GroupKey, React.ElementType> = {
  universities: Building2,
  majors: BookOpen,
  careers: Briefcase,
  scholarships: Award,
  pages: Sparkles,
};

const GROUP_CLASSES: Record<GroupKey, string> = {
  universities:
    "bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-slate-200",
  majors: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  careers:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  scholarships:
    "bg-[#FFF8E1] text-[#8A5A00] dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]",
  pages: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export function GlobalSearch() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === "km";
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDebounced("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else setOpen(true);
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("orienx:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("orienx:open-search", onOpen);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 220);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: async () =>
      apiFetch<GlobalSearchResults>(
        `/search?q=${encodeURIComponent(debounced)}&limit=5`
      ),
    enabled: open && debounced.length > 0,
    staleTime: 60_000,
  });

  const localize = useCallback(
    (value?: { en?: string; km?: string } | null) =>
      (isKm ? value?.km || value?.en : value?.en || value?.km) || "",
    [isKm]
  );

  const quickItems = useMemo<ResultItem[]>(
    () =>
      QUICK_LINKS.map((link) => ({
        id: `page:${link.id}`,
        group: "pages",
        title: isKm ? link.labelKm : link.labelEn,
        subtitle: isKm ? link.descriptionKm : link.descriptionEn,
        href: link.href,
        icon: link.icon,
      })),
    [isKm]
  );

  const groups = useMemo<ResultGroup[]>(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return [
        {
          key: "pages",
          label: isKm ? "ផ្លូវកាត់" : "Quick links",
          items: quickItems,
        },
      ];
    }

    const resultData =
      data?.query?.trim().toLowerCase() === needle ? data : null;
    const resultGroups: ResultGroup[] = [];
    if (resultData?.universities?.length) {
      resultGroups.push({
        key: "universities",
        label: isKm ? "សាកលវិទ្យាល័យ" : "Universities",
        items: resultData.universities.map((item) => ({
          id: `university:${item.id}`,
          group: "universities",
          title: localize(item.name),
          subtitle: [
            localize(item.acronym),
            item.province,
          ]
            .filter(Boolean)
            .join(" · "),
          href: `/universities/${item.slug}`,
          icon: GROUP_ICONS.universities,
        })),
      });
    }
    if (resultData?.majors?.length) {
      resultGroups.push({
        key: "majors",
        label: isKm ? "មុខជំនាញ" : "Majors",
        items: resultData.majors.map((item) => ({
          id: `major:${item.id}`,
          group: "majors",
          title: localize(item.name),
          subtitle: `${item.category} · ${item.universities_count} ${
            isKm ? "សាកលវិទ្យាល័យ" : "universities"
          }`,
          href: `/majors/${item.slug}`,
          icon: GROUP_ICONS.majors,
        })),
      });
    }
    if (resultData?.careers?.length) {
      resultGroups.push({
        key: "careers",
        label: isKm ? "អាជីពការងារ" : "Careers",
        items: resultData.careers.map((item) => ({
          id: `career:${item.id}`,
          group: "careers",
          title: localize(item.title),
          subtitle: `${item.industry} · RIASEC ${item.riasec_code}`,
          href: `/careers/${item.slug}`,
          icon: GROUP_ICONS.careers,
        })),
      });
    }
    if (resultData?.scholarships?.length) {
      resultGroups.push({
        key: "scholarships",
        label: isKm ? "អាហារូបករណ៍" : "Scholarships",
        items: resultData.scholarships.map((item) => ({
          id: `scholarship:${item.id}`,
          group: "scholarships",
          title: localize(item.title),
          subtitle: [localize(item.provider), item.coverage_type]
            .filter(Boolean)
            .join(" · "),
          href: `/scholarships/${item.slug}`,
          icon: GROUP_ICONS.scholarships,
        })),
      });
    }

    const matchingPages = quickItems.filter((item) =>
      `${item.title} ${item.subtitle}`.toLowerCase().includes(needle)
    );
    if (matchingPages.length) {
      resultGroups.push({
        key: "pages",
        label: isKm ? "ទំព័រ" : "Pages",
        items: matchingPages,
      });
    }
    return resultGroups;
  }, [query, data, isKm, localize, quickItems]);

  const flatItems = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );
  const indexById = useMemo(
    () => new Map(flatItems.map((item, index) => [item.id, index])),
    [flatItems]
  );
  const effectiveIndex = flatItems.length
    ? Math.min(activeIndex, flatItems.length - 1)
    : -1;

  const go = (item: ResultItem) => {
    close();
    router.push(item.href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((value) => (value + 1) % flatItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex(
        (value) => (value - 1 + flatItems.length) % flatItems.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[effectiveIndex];
      if (item) go(item);
    }
  };

  const isSearching = query.trim().length > 0 && (isFetching || debounced !== query.trim());
  const hasResults = groups.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-[#0A0F3D]/55 p-3 pt-[9vh] backdrop-blur-sm sm:p-6 sm:pt-[10vh]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isKm ? "ស្វែងរកទូទាំងប្រព័ន្ធ" : "Global search"}
            initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white shadow-2xl dark:border-white/10 dark:bg-[#090D24]"
          >
            <div className="flex items-center gap-3 border-b border-[#E6E8F0] px-4 py-3 dark:border-white/10">
              <Search className="h-5 w-5 shrink-0 text-[#94A3B8] dark:text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder={
                  isKm
                    ? "ស្វែងរកសាកលវិទ្យាល័យ មុខជំនាញ អាជីព អាហារូបករណ៍…"
                    : "Search universities, majors, careers, scholarships…"
                }
                aria-label={isKm ? "ស្វែងរក" : "Search"}
                className="h-9 flex-1 bg-transparent text-sm font-semibold text-[#111965] outline-none placeholder:text-[#94A3B8] dark:text-white dark:placeholder:text-slate-500"
              />
              {isSearching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#111965] dark:text-[#F7CE4D]" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={isKm ? "សម្អាត" : "Clear search"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <kbd className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[9px] font-black text-[#94A3B8] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-[58vh] overflow-y-auto overscroll-contain p-2">
              {isSearching && !hasResults ? (
                <div className="flex items-center justify-center gap-2 py-12 text-[11px] text-[#68708A] dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isKm ? "កំពុងស្វែងរក…" : "Searching…"}
                </div>
              ) : hasResults ? (
                groups.map((group) => (
                  <div key={group.key} className="pb-1">
                    <div className="px-2.5 pb-1 pt-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#94A3B8] dark:text-slate-500">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const index = indexById.get(item.id) ?? 0;
                      const active = index === effectiveIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                            active
                              ? "bg-[#F0F2FA] dark:bg-white/10"
                              : "hover:bg-[#F8FAFD] dark:hover:bg-white/5"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                              GROUP_CLASSES[item.group]
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11.5px] font-black text-[#111965] dark:text-white">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-[#68708A] dark:text-slate-400">
                              {item.subtitle}
                            </span>
                          </span>
                          <CornerDownLeft
                            className={cn(
                              "h-3 w-3 shrink-0",
                              active
                                ? "text-[#111965] dark:text-[#F7CE4D]"
                                : "text-[#D9DEEA] dark:text-white/20"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : query.trim() ? (
                <div className="px-5 py-12 text-center">
                  <FileSearch className="mx-auto h-7 w-7 text-[#94A3B8] dark:text-slate-500" />
                  <p className="mt-2 text-sm font-black text-[#111965] dark:text-white">
                    {isKm ? "រកមិនឃើញលទ្ធផលទេ" : "No results found"}
                  </p>
                  <p className="mt-1 text-[10.5px] text-[#68708A] dark:text-slate-400">
                    {isKm
                      ? "សាកល្បងពាក្យខ្លី ឬឈ្មោះផ្សេង។"
                      : "Try a shorter keyword or a different spelling."}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <Search className="mx-auto h-7 w-7 text-[#94A3B8] dark:text-slate-500" />
                  <p className="mt-2 text-sm font-black text-[#111965] dark:text-white">
                    {isKm ? "ចាប់ផ្តើមស្វែងរក" : "Start searching"}
                  </p>
                  <p className="mt-1 text-[10.5px] text-[#68708A] dark:text-slate-400">
                    {isKm
                      ? "វាយឈ្មោះសាកលវិទ្យាល័យ មុខជំនាញ ឬអាហារូបករណ៍។"
                      : "Type a university, major, career, or scholarship."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E8F0] bg-[#F8FAFD] px-4 py-2 text-[9px] font-semibold text-[#94A3B8] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
              <span>
                ↑↓ {isKm ? "ផ្លាស់ទី" : "navigate"} · ↵{" "}
                {isKm ? "បើក" : "open"} · esc {isKm ? "បិទ" : "close"}
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[#E6E8F0] bg-white px-1 py-0.5 text-[8px] font-black dark:border-white/10 dark:bg-white/5">
                  ⌘K
                </kbd>
                {isKm ? "ស្វែងរកគ្រប់ពេល" : "search anytime"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
