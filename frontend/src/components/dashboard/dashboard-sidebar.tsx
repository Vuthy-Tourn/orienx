"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import { SettingsModal } from "@/components/settings/settings-modal";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Sliders,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Settings,
  LogOut,
  X,
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
      href: "/dashboard/favorites",
      label: t("dashboardLayout.librarySaved"),
      icon: Bookmark,
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
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className={cn(
              "dashboard-nav-item flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150",
              isActive
                ? "bg-[#111965] text-white shadow-xs font-black"
                : "text-[#64748B] hover:text-[#111965] hover:bg-[#F0F2FA]"
            )}
          >
            <item.icon
              className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-[#F7CE4D]" : "text-[#94A3B8]"
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
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
            <div className="w-9 h-9 rounded-full bg-[#111965] text-[#F7CE4D] flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs ring-2 ring-[#F0F2FA] group-hover:scale-105 transition-transform">
              {user.full_name_en?.charAt(0) || user.full_name_km?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
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
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80%] bg-white p-4 flex flex-col h-full shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0] flex-shrink-0">
              <Logo />
              <button onClick={onCloseMobile} className="p-1 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto min-h-0">
              {renderNavItems(true)}
            </nav>

            <div className="p-2 border-t border-[#E6E8F0] flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  setSettingsOpen(true);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#111965] cursor-pointer"
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
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("dashboardLayout.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Language & Theme Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

