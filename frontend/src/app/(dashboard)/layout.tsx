"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
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

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex">
      {/* Fixed-Height Dashboard Sidebar Component (Fixed to h-screen, sticky top-0) */}
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

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
          <span className="text-sm font-bold text-[#111965]">
            {t("dashboardLayout.studentDashboard") || "Student Dashboard"}
          </span>
          <div className="w-6" />
        </div>

        {/* Content Body */}
        <div className="flex-1 p-3 sm:p-5 lg:p-7 max-w-[1560px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
