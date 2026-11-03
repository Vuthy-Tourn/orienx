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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] text-sm text-[#68708A]">
        {language === "km" ? "កំពុងផ្ទៀងផ្ទាត់គណនី..." : "Authenticating session..."}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sidebarLinks = [
    {
      href: "/dashboard",
      label: language === "km" ? "ផ្ទាំងសង្ខេប" : "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/assessments/personality",
      label: language === "km" ? "តេស្តបុគ្គលិកលក្ខណៈ" : "Personality Assessment",
      icon: BrainCircuit,
    },
    {
      href: "/dashboard/assessments/riasec",
      label: language === "km" ? "តេស្តចំណាប់អារម្មណ៍ RIASEC" : "RIASEC Career Test",
      icon: Compass,
    },
    {
      href: "/dashboard/assessments/preferences",
      label: language === "km" ? "ចំណូលចិត្តការសិក្សា" : "Academic Preferences",
      icon: Sliders,
    },
    {
      href: "/dashboard/recommendations",
      label: language === "km" ? "អនុសាសន៍ជំនាញ" : "Major Recommendations",
      icon: Sparkles,
      highlight: true,
    },
    {
      href: "/dashboard/favorites",
      label: language === "km" ? "ទំព័រដែលបានរក្សាទុក" : "Saved Favorites",
      icon: Bookmark,
    },
    {
      href: "/dashboard/profile",
      label: language === "km" ? "ការកំណត់គណនី" : "Profile & Settings",
      icon: UserIcon,
    },
  ];

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E6E8F0] select-none">
        <div className="p-5 border-b border-[#E6E8F0] flex items-center justify-between">
          <Logo />
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111965] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user.full_name_en?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-[#111965] truncate">
              {language === "km" ? user.full_name_km || user.full_name_en : user.full_name_en || user.email}
            </div>
            <div className="text-[10px] text-[#68708A] truncate">
              {user.province || "Student"} • Grade 12
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-[#111965] text-white shadow-xs"
                    : "text-[#68708A] hover:text-[#171A2C] hover:bg-slate-50",
                  item.highlight && !isActive && "text-[#111965] font-bold"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F7CE4D]" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-[#E6E8F0]">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout bottom */}
        <div className="p-3 border-t border-[#E6E8F0]">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === "km" ? "ចាកចេញពីគណនី" : "Sign Out"}</span>
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
                        ? "bg-[#111965] text-white"
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
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

