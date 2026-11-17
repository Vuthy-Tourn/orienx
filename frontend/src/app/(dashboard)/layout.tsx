"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchTrigger } from "@/components/search/search-trigger";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_TITLES: Record<string, { en: string; km: string }> = {
  "/dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
  "/dashboard/assessments/personality": {
    en: "Personality assessment",
    km: "ការវាយតម្លៃបុគ្គលិកលក្ខណៈ",
  },
  "/dashboard/assessments/riasec": {
    en: "RIASEC assessment",
    km: "ការវាយតម្លៃ RIASEC",
  },
  "/dashboard/assessments/preferences": {
    en: "Academic preferences",
    km: "ចំណូលចិត្តសិក្សា",
  },
  "/dashboard/recommendations": {
    en: "Recommendations",
    km: "ការណែនាំ",
  },
  "/dashboard/favorites": { en: "Favorites", km: "ចំណូលចិត្ត" },
  "/dashboard/plan": { en: "My plan", km: "ផែនការរបស់ខ្ញុំ" },
  "/dashboard/eligibility": { en: "BACII checker", km: "ការពិនិត្យ BACII" },
  "/dashboard/notifications": {
    en: "Notifications",
    km: "ការជូនដំណឹង",
  },
  "/dashboard/profile": { en: "Profile", km: "ប្រវត្តិរូប" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/dashboard";
  const reduceMotion = useReducedMotion();
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const isKm = language === "km";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FC] flex animate-pulse select-none">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex w-64 flex-col border-r border-[#E6E8F0] bg-white p-5 space-y-6 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
          <div className="space-y-2.5 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
        {/* Main Content Area Skeleton */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1560px] mx-auto w-full">
          <Skeleton className="h-48 w-full rounded-[28px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.roles?.some(
    (role) => role === "ADMIN" || role === "SUPER_ADMIN"
  );
  const pageTitle = PAGE_TITLES[pathname] || {
    en: "Student dashboard",
    km: "ផ្ទាំងគ្រប់គ្រងសិស្ស",
  };
  const activeTitle = isKm ? pageTitle.km : pageTitle.en;
  const profileHref = isAdmin ? "/admin" : "/dashboard/profile";
  const profileLabel = isAdmin
    ? isKm
      ? "ផ្ទាំងអភិបាល"
      : "Admin panel"
    : isKm
      ? "ប្រវត្តិរូប"
      : "My profile";
  const ProfileIcon = isAdmin ? ShieldCheck : UserRound;

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex">
      {/* Fixed-Height Dashboard Sidebar Component (Fixed to h-screen, sticky top-0) */}
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-[#E6E8F0] bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-[#090D24]/90">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F0F2FA] dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
                aria-label={isKm ? "បើកម៉ឺនុយសិស្ស" : "Open student menu"}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8] dark:text-slate-400">
                  {isKm ? "កន្លែងធ្វើការសិស្ស" : "Student workspace"}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={pathname}
                      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.18,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="truncate text-sm font-black text-[#111965] dark:text-white"
                    >
                      {activeTitle}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <span className="hidden text-[11px] font-semibold text-[#68708A] dark:text-slate-400 md:inline">
                {user.email}
              </span>
              <SearchTrigger />
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggle />
              <NotificationBell />
              <Link
                href={profileHref}
                aria-label={profileLabel}
                title={profileLabel}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <ProfileIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{profileLabel}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-3 sm:p-5 lg:p-7 max-w-[1560px] w-full mx-auto">
          {reduceMotion ? (
            children
          ) : (
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
