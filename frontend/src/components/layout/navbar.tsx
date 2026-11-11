"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Compass,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/register/") ||
    pathname?.startsWith("/forgot-password/") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin");

  if (isAuthPage) {
    return null;
  }

  const navLinks = [
    { href: "/majors", label: t("nav.majors"), icon: Compass },
    { href: "/universities", label: t("nav.universities"), icon: GraduationCap },
    { href: "/careers", label: t("nav.careers"), icon: Briefcase },
    { href: "/scholarships", label: t("nav.scholarships"), icon: Award },
    { href: "/personality", label: t("nav.personality", "បុគ្គលិកលក្ខណៈ"), icon: Sparkles },
    { href: "/about", label: t("nav.about") },
  ];

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");

  return (
    <header
      className={cn(
        "z-50 w-full transition-all duration-300 ease-in-out",
        isHomePage
          ? cn(
              "fixed top-0",
              !scrolled
                ? "-translate-y-full opacity-0 pointer-events-none"
                : "translate-y-0 opacity-100",
              scrolled
                ? "bg-white/95 backdrop-blur-md border-b border-[#E6E8F0] shadow-xs"
                : "bg-white/90 backdrop-blur-md border-b border-[#E6E8F0]/80"
            )
          : "sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E6E8F0] shadow-xs"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-[#111965]/10 text-[#111965] font-bold shadow-2xs"
                    : "text-[#68708A] hover:text-[#111965] hover:bg-slate-100/70"
                )}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 opacity-75 shrink-0 hidden xl:inline-block" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0] transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t("nav.dashboard")}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={() => logout()}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-[#111965] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="px-3.5 xl:px-4 py-1.5 rounded-lg text-xs xl:text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-colors whitespace-nowrap"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accessible Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} side="right" className="w-[85vw] max-w-sm">
        <div className="space-y-6">
          <SheetHeader>
            <SheetTitle>Futera Navigation</SheetTitle>
            <SheetDescription>Discover Your Direction. Shape Your Future.</SheetDescription>
          </SheetHeader>

          {/* Navigation Links with large touch targets */}
          <div className="space-y-1.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-colors min-h-[48px]",
                    isActive
                      ? "bg-[#F0F2FA] text-[#111965]"
                      : "text-[#171A2C] hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="w-5 h-5 text-[#111965]" />}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[#E6E8F0] space-y-3">
          {user ? (
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-[#111965] shadow-sm min-h-[48px]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t("nav.dashboard")}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-2xl text-sm font-bold text-[#111965] border-2 border-[#E6E8F0] hover:bg-slate-50 min-h-[48px] flex items-center justify-center"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-2xl text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-sm min-h-[48px] flex items-center justify-center"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </Sheet>
    </header>
  );
}

