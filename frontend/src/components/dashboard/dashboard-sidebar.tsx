"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import { SettingsModal } from "@/components/settings/settings-modal";
import {
  LayoutDashboard,
  Bell,
  BrainCircuit,
  Compass,
  Sliders,
  Sparkles,
  Bookmark,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ mobileOpen, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, getLocalized } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!user) return null;

  const sidebarLinks = [
    {
      href: "/dashboard",
      label: t("dashboardLayout.home"),
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/assessments/personality",
      label: t("dashboardLayout.learnQuizzes"),
      icon: BrainCircuit,
    },
    {
      href: "/dashboard/assessments/riasec",
      label: t("dashboardLayout.practiceFit"),
      icon: Compass,
    },
    {
      href: "/dashboard/assessments/preferences",
      label: t("dashboardLayout.preferences") || "Academic Preferences",
      icon: Sliders,
    },
    {
      href: "/dashboard/recommendations",
      label: t("dashboardLayout.progressFit"),
      icon: Sparkles,
    },
    {
      href: "/dashboard/advisor",
      label: t("dashboardLayout.aiAdvisor", "AI Advisor"),
      icon: Bot,
    },
    {
      href: "/dashboard/favorites",
      label: t("dashboardLayout.librarySaved"),
      icon: Bookmark,
    },
    {
      href: "/dashboard/plan",
      label: t("dashboardLayout.myPlan", "My Plan"),
      icon: ClipboardList,
    },
    {
      href: "/dashboard/eligibility",
      label: t("dashboardLayout.eligibility", "BACII Checker"),
      icon: GraduationCap,
    },
    {
      href: "/dashboard/notifications",
      label: t("dashboardLayout.notifications", "Notifications"),
      icon: Bell,
    },
  ];

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");
  const displayName =
    getLocalized({ en: user.full_name_en, km: user.full_name_km }) ||
    user.full_name_km ||
    user.full_name_en ||
    user.email?.split("@")[0] ||
    "Alex";

  const renderNavItems = (isMobile = false) => (
    <>
      {sidebarLinks.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <motion.div
            key={item.href}
            className="dashboard-nav-item"
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          >
            <Link
              href={item.href}
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors",
                isActive
                  ? "text-white font-black"
                  : "text-[#64748B] hover:text-[#111965] hover:bg-[#F0F2FA] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={
                    isMobile
                      ? "dashboard-sidebar-active-mobile"
                      : "dashboard-sidebar-active-desktop"
                  }
                  className="absolute inset-0 rounded-2xl bg-[#111965] shadow-xs dark:bg-blue-600"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 38,
                          mass: 0.7,
                        }
                  }
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-[#F7CE4D]" : "text-[#94A3B8] dark:text-slate-400"
                )}
              />
              <span className="relative z-10 truncate">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}

      {isAdmin && (
        <div className="pt-3 mt-3 border-t border-[#E6E8F0]">
          <Link
            href="/admin"
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-700" />
            <span>{t("dashboardLayout.adminPanel")}</span>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Fixed Height Sidebar: Exact h-screen, sticky top-0, does not scroll with page */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E6E8F0] select-none flex-shrink-0 h-screen sticky top-0 z-30">
        {/* Brand Header (Clean & Uncluttered Logo) */}
        <div className="p-5 border-b border-[#E6E8F0] flex items-center justify-between flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation Items (Scrollable internally if screen is short) */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto min-h-0">
          {renderNavItems(false)}
        </nav>

        {/* User Profile Capsule at bottom with Settings Trigger */}
        <div className="p-4 border-t border-[#E6E8F0] flex items-center justify-between gap-2 flex-shrink-0 bg-white">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 overflow-hidden group flex-1 min-w-0"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow-xs ring-2 ring-[#F0F2FA] group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#111965] text-[#F7CE4D] flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs ring-2 ring-[#F0F2FA] group-hover:scale-105 transition-transform">
                {user.full_name_en?.charAt(0) || user.full_name_km?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#111965] transition-colors">
                {displayName}
              </div>
              <div className="text-[12px] text-[#94A3B8] truncate">
                {t("dashboardLayout.levelGrade")}
              </div>
            </div>
          </Link>

          {/* Settings Trigger Icon */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title={t("settings.openSettings", "Settings")}
            className="p-2 rounded-xl text-slate-400 hover:text-[#111965] hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            title={t("dashboardLayout.logout")}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="dashboard-mobile-drawer"
            className="fixed inset-0 z-50 lg:hidden flex"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
              onClick={onCloseMobile}
            />
            <motion.div
              className="relative w-64 max-w-[80%] bg-white p-4 flex flex-col h-full shadow-2xl z-10 dark:bg-[#090D24]"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "-100%" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 36, mass: 0.8 }
              }
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0] dark:border-white/10 flex-shrink-0">
                <Logo />
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t("common.close", "Close")}
                  className="p-1 cursor-pointer rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto min-h-0">
                {renderNavItems(true)}
              </nav>

              <div className="p-2 border-t border-[#E6E8F0] dark:border-white/10 flex items-center justify-between flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    setSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#111965] cursor-pointer dark:text-slate-300 dark:hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t("settings.openSettings", "Settings")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer dark:text-rose-400 dark:hover:text-rose-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("dashboardLayout.logout")}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated Language & Theme Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

