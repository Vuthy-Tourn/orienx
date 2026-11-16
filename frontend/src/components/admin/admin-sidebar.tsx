"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award,
  BarChart3,
  BookOpen,
  ListChecks,
  Briefcase,
  Building2,
  GraduationCap,
  History,
  LogOut,
  Sliders,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export type AdminTab =
  | "overview"
  | "users"
  | "universities"
  | "majors"
  | "offerings"
  | "questions"
  | "careers"
  | "scholarships"
  | "engine"
  | "audit";

export const ADMIN_TABS: {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  group: "Workspace" | "Directories" | "System";
}[] = [
  { id: "overview", label: "Overview", icon: BarChart3, group: "Workspace" },
  { id: "users", label: "Users & Access", icon: Users, group: "Workspace" },
  { id: "universities", label: "Universities", icon: Building2, group: "Directories" },
  { id: "majors", label: "Majors", icon: BookOpen, group: "Directories" },
  { id: "offerings", label: "University Programs", icon: GraduationCap, group: "Directories" },
  { id: "questions", label: "Assessment Questions", icon: ListChecks, group: "System" },
  { id: "careers", label: "Careers", icon: Briefcase, group: "Directories" },
  { id: "scholarships", label: "Scholarships", icon: Award, group: "Directories" },
  { id: "engine", label: "Recommendation Engine", icon: Sliders, group: "System" },
  { id: "audit", label: "Audit Log", icon: History, group: "System" },
];

const GROUPS = ["Workspace", "Directories", "System"] as const;

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const reduceMotion = useReducedMotion();

  const displayName =
    user?.full_name_en || user?.full_name_km || user?.email?.split("@")[0] || "Administrator";
  const primaryRole =
    user?.roles?.find((role) => role === "SUPER_ADMIN") ||
    user?.roles?.find((role) => role === "ADMIN") ||
    "ADMIN";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-[#0A0F3D]/50 backdrop-blur-xs lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E6E8F0] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-white/10 dark:bg-[#090D24]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-[#E6E8F0] px-5 dark:border-white/10">
          <Logo href="/admin" />
        </div>

        <div className="border-b border-[#E6E8F0] px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#F8FAFD] p-2.5 dark:bg-white/5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-xs font-black text-[#F7CE4D] dark:bg-white/10">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-black text-[#111965] dark:text-white">{displayName}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                {primaryRole.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group} className="mb-4">
              <div className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8] dark:text-slate-500">
                {group}
              </div>
              <div className="space-y-1">
                {ADMIN_TABS.filter((tab) => tab.group === group).map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onTabChange(tab.id);
                        onCloseMobile();
                      }}
                      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors",
                        active
                          ? "text-white"
                          : "text-[#64748B] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="admin-sidebar-active-tab"
                          className="absolute inset-0 rounded-xl bg-[#111965] shadow-xs dark:bg-blue-600"
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
                      <Icon
                        className={cn(
                          "relative z-10 h-4 w-4 shrink-0 transition-colors",
                          active ? "text-[#F7CE4D]" : "text-[#94A3B8] dark:text-slate-400"
                        )}
                      />
                      <span className="relative z-10 truncate">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E6E8F0] p-3 space-y-1 dark:border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#64748B] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <GraduationCap className="h-4 w-4 text-[#94A3B8] dark:text-slate-400" />
            Student view
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#64748B] transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <LogOut className="h-4 w-4 text-[#94A3B8] dark:text-slate-400" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
