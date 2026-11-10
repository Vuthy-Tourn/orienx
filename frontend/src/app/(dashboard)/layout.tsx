"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Sliders,
  Sparkles,
  Bookmark,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Crown,
  Trophy,
  GraduationCap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { t, getLocalized } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] text-sm text-[#68708A]">
        {t("dashboardLayout.authenticating")}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sidebarLinks = [
    {
      href: "/dashboard",
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/assessments/personality",
      label: "Learn & Quizzes",
      icon: BrainCircuit,
    },
    {
      href: "/dashboard/assessments/riasec",
      label: "Practice & Fit",
      icon: Compass,
    },
    {
      href: "/dashboard/recommendations",
      label: "Progress & AI Fit",
      icon: Sparkles,
      highlight: true,
    },
    {
      href: "/scholarships",
      label: "Challenges & Grants",
      icon: Trophy,
    },
    {
      href: "/universities",
      label: "Universities",
      icon: GraduationCap,
    },
    {
      href: "/dashboard/favorites",
      label: "Library & Saved",
      icon: Bookmark,
    },
  ];

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");
  const displayName =
    getLocalized({ en: user.full_name_en, km: user.full_name_km }) ||
    user.full_name_en ||
    user.email?.split("@")[0] ||
    "Alex";

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex">
      {/* Desktop Sidebar (Lingora / Duolingo modern pill style) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E6E8F0] select-none flex-shrink-0">
        <div className="p-5 border-b border-[#E6E8F0] flex items-center justify-between">
          <Logo />
        </div>

        {/* Navigation Items (Modern Pill Style) */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150",
                  isActive
                    ? "bg-[#EBF3FE] text-[#1B6EF3] shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]",
                  item.highlight && !isActive && "text-[#1B6EF3]"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#1B6EF3]" : "text-[#94A3B8]")} />
                <span className="truncate">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#F7CE4D] ring-2 ring-amber-100" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-[#E6E8F0]">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Futera Plus Upgrade Card (Matching Reference Screenshot) */}
        <div className="px-4 py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EBF3FE] to-[#F3F7FE] border border-[#D5E5FD] space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-xs">
                <Crown className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xs font-black text-[#1E293B]">Futera Plus</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Unlock all universities, roadmap insights &amp; offline learning guides
            </p>
            <Link
              href="/dashboard/recommendations"
              className="block w-full py-2 rounded-xl text-xs font-black text-white text-center bg-[#1B6EF3] hover:bg-[#1557C0] shadow-xs hover:shadow-md transition-all active:scale-98"
            >
              Upgrade
            </Link>
          </div>
        </div>

        {/* User Profile Capsule at bottom */}
        <div className="p-4 border-t border-[#E6E8F0] flex items-center justify-between gap-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 overflow-hidden group flex-1"
          >
            <div className="w-9 h-9 rounded-full bg-[#1B6EF3] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ring-2 ring-sky-100 group-hover:scale-105 transition-transform">
              {user.full_name_en?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#1B6EF3] transition-colors">
                {displayName}
              </div>
              <div className="text-[11px] text-[#94A3B8] truncate">
                Level 12 • Grade 12
              </div>
            </div>
          </Link>

          <button
            onClick={() => logout()}
            title={t("dashboardLayout.logout")}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-[#E6E8F0] p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-[#111965]">Student Dashboard</span>
          <div className="w-6" />
        </div>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-white p-4 flex flex-col h-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0]">
                <Logo />
                <button onClick={() => setSidebarOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1">
                {sidebarLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold",
                      pathname === item.href
                        ? "bg-[#EBF3FE] text-[#1B6EF3]"
                        : "text-[#68708A] hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2 p-2 text-xs font-semibold text-rose-600 border-t border-[#E6E8F0]"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("dashboardLayout.logout")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body (Broad Canvas matching 3-column reference layout) */}
        <div className="flex-1 p-3 sm:p-5 lg:p-7 max-w-[1560px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
