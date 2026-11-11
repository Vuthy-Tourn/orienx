"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { t, getLocalized, language } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track window scroll for subtle glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    {
      href: "/majors",
      label: t("nav.majors", "ស្វែងរកមុខជំនាញ"),
      descKm: "រុករកជំនាញសាកលវិទ្យាល័យ និងឱកាសការងារ",
      descEn: "Explore university majors & career outlooks",
      icon: Compass,
    },
    {
      href: "/universities",
      label: t("nav.universities", "សាកលវិទ្យាល័យ"),
      descKm: "ព័ត៌មានគ្រឹះស្ថានឧត្តមសិក្សា និងថ្លៃសិក្សា",
      descEn: "Institutions, campus life & tuition fees",
      icon: GraduationCap,
    },
    {
      href: "/careers",
      label: t("nav.careers", "អាជីពការងារ"),
      descKm: "ទិដ្ឋភាពទីផ្សារការងារ និងកម្រិតប្រាក់បៀវត្ស",
      descEn: "Job market trends & salary projections",
      icon: Briefcase,
    },
    {
      href: "/scholarships",
      label: t("nav.scholarships", "អាហារូបករណ៍"),
      descKm: "ឱកាសអាហារូបករណ៍ក្នុង និងក្រៅប្រទេស",
      descEn: "Local & international grant opportunities",
      icon: Award,
    },
    {
      href: "/personality",
      label: t("nav.personality", "បុគ្គលិកលក្ខណៈទាំង ១៦"),
      descKm: "មគ្គុទ្ទេសក៍ចិត្តគំនិតទាំង ១៦ ប្រភេទស្តង់ដារ",
      descEn: "NERIS & 16Personalities guide and matches",
      icon: Sparkles,
      highlight: true,
    },
    {
      href: "/about",
      label: t("nav.about", "អំពីយើង"),
      descKm: "បេសកកម្មតម្រង់ទិសអប់រំ និងក្រុមការងារ",
      descEn: "Our guidance mission and values",
      icon: Info,
    },
  ];

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 ease-in-out border-b",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-[#E6E8F0] shadow-sm"
          : "bg-white/90 backdrop-blur-md border-[#E6E8F0]/80"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="shrink-0 flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-[#111965]/8 text-[#111965] font-bold shadow-2xs"
                    : "text-[#5A6482] hover:text-[#111965] hover:bg-slate-100/70"
                )}
              >
                {item.icon && (
                  <item.icon
                    className={cn(
                      "w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 transition-colors",
                      item.highlight
                        ? "text-amber-500"
                        : isActive
                        ? "text-[#111965]"
                        : "text-[#7B85A1]"
                    )}
                  />
                )}
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden xl:inline-block" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions Cluster */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
          <LanguageSwitcher />

          <div className="h-5 w-px bg-slate-200" />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold text-white bg-[#111965] hover:bg-[#1A2580] shadow-xs transition-all active:scale-95 whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t("nav.dashboard", "ផ្ទាំងគ្រប់គ្រង")}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={() => logout()}
                title="Log Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-[#111965] hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                {t("nav.signIn", "ចូលគណនី")}
              </Link>
              <Link
                href="/register"
                className="px-3.5 xl:px-4 py-1.5 rounded-xl text-xs xl:text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#F5C430] shadow-xs transition-all active:scale-95 whitespace-nowrap"
              >
                {t("nav.getStarted", "ចាប់ផ្តើម")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Buttons (Language + Hamburger) */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#111965] hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#111965]" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Slide-Down Mobile Navigation Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dims Page Below Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-x-0 top-16 bottom-0 bg-[#0A0F3D]/50 backdrop-blur-xs z-40 lg:hidden"
            />

            {/* Seamless Slide-down Navigation Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 w-full bg-white border-b border-[#E6E8F0] shadow-2xl z-50 lg:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
                {/* Navigation Links List */}
                <div className="space-y-1.5">
                  {navLinks.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl transition-all duration-150 min-h-[52px]",
                          isActive
                            ? "bg-[#111965]/8 text-[#111965] font-bold border border-[#111965]/15"
                            : "text-[#171A2C] hover:bg-slate-50 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                              isActive
                                ? "bg-[#111965] text-white"
                                : item.highlight
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-slate-100 text-[#111965]"
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold leading-snug">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-[#68708A] font-normal leading-tight mt-0.5 line-clamp-1">
                              {language === "km" ? item.descKm : item.descEn}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Bottom Actions */}
                <div className="pt-4 border-t border-[#E6E8F0] space-y-2.5">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-[#111965] shadow-xs active:scale-98 transition-transform"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{t("nav.dashboard", "ចូលទៅផ្ទាំងគ្រប់គ្រង")}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("nav.logout", "ចាកចេញពីគណនី")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-3 rounded-2xl text-sm font-bold text-[#111965] border border-[#E6E8F0] hover:bg-slate-50 transition-colors flex items-center justify-center"
                      >
                        {t("nav.signIn", "ចូលគណនី")}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-3 rounded-2xl text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#F5C430] shadow-xs transition-colors flex items-center justify-center"
                      >
                        {t("nav.getStarted", "ចាប់ផ្តើម")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
