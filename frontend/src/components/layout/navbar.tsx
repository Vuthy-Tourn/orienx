"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Info,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { t, getLocalized, language } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [assessmentsOpen, setAssessmentsOpen] = useState(false);
  const [mobileAssessmentsOpen, setMobileAssessmentsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAssessmentsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAssessmentsOpen(false);
    }, 150);
  };

  // Auto-close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAssessmentsOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setAssessmentsOpen(false);
      }
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

  // The three things a student actually *takes*. Each entry is an instrument.
  const diagnosticTests = [
    {
      href: "/riasec",
      labelEn: "Holland RIASEC Test",
      labelKm: "តេស្តចំណាប់អារម្មណ៍ RIASEC",
      descEn: "Measure 6 vocational interest dimensions to discover matched careers",
      descKm: "វាស់វែងចំណាប់អារម្មណ៍ការងារ ៦ វិមាត្រដើម្បីស្វែងរកជំនាញត្រូវគ្នា",
      badgeEn: "30 Questions",
      badgeKm: "៣០ សំណួរ",
      icon: Compass,
      color: "#D97706",
      bgClass: "bg-amber-500",
      tagClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      isOutcome: false,
    },
    {
      href: "/personality",
      labelEn: "16 Personalities (MBTI)",
      labelKm: "បុគ្គលិកលក្ខណៈទាំង ១៦",
      descEn: "Explore cognitive style, study endurance, and career archetypes",
      descKm: "ស្វែងយល់ពីចរិតលក្ខណៈ របៀបគិត និងការងារត្រូវគ្នានៅកម្ពុជា",
      badgeEn: "16 Types",
      badgeKm: "១៦ ប្រភេទ",
      icon: Sparkles,
      color: "#2563EB",
      bgClass: "bg-blue-600",
      tagClass: "bg-blue-50 text-blue-700 border-blue-200/80",
      isOutcome: false,
    },
    {
      href: "/bacii",
      labelEn: "BACII Stream & Preferences",
      labelKm: "ចំណូលចិត្តមុខវិជ្ជា & សាកលវិទ្យាល័យ",
      descEn: "Verify Grade 12 stream fit and budget alignment for universities",
      descKm: "ផ្ទៀងផ្ទាត់ថ្នាក់វិទ្យាសាស្ត្រ ឬសង្គម និងថវិកាសិក្សា",
      badgeEn: "Prerequisites",
      badgeKm: "លក្ខខណ្ឌសិក្សា",
      icon: GraduationCap,
      color: "#059669",
      bgClass: "bg-emerald-600",
      tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      isOutcome: false,
    },
  ];

  // The Match Hub is the *output* of the three tests, not a fourth test.
  // Signed-in students go straight to their ranked matches; everyone else
  // lands on the explainer page, where the unlock condition is obvious.
  const resultHub = {
    href: user ? "/dashboard/recommendations" : "/assessments",
    labelEn: "AI Major & Career Matching Hub",
    labelKm: "លទ្ធផលផ្គូផ្គងជំនាញ & អាជីព",
    descEn: "See your ranked major matches and why each one fits you",
    descKm: "មើលលទ្ធផលផ្គូផ្គងជំនាញ និងហេតុផលដែលត្រូវនឹងអ្នក",
    badgeEn: user ? "Your Report" : "After 3 Tests",
    badgeKm: user ? "របាយការណ៍" : "ក្រោយតេស្ត ៣",
    icon: BrainCircuit,
    color: "#9333EA",
    bgClass: "bg-purple-600",
    tagClass: "bg-purple-50 text-purple-700 border-purple-200/80",
    isOutcome: true,
  };

  const assessmentSubItems = [...diagnosticTests, resultHub];

  const navLinks = [
    {
      href: "/majors",
      label: t("nav.majors", "ស្វែងរកមុខជំនាញ"),
      icon: Compass,
      descKm: "រុករកជំនាញសាកលវិទ្យាល័យ និងឱកាសការងារ",
      descEn: "Explore university majors & career outlooks",
    },
    {
      href: "/universities",
      label: t("nav.universities", "សាកលវិទ្យាល័យ"),
      icon: GraduationCap,
      descKm: "ព័ត៌មានគ្រឹះស្ថានឧត្តមសិក្សា និងថ្លៃសិក្សា",
      descEn: "Institutions, campus life & tuition fees",
    },
    {
      href: "/careers",
      label: t("nav.careers", "អាជីពការងារ"),
      icon: Briefcase,
      descKm: "ទិដ្ឋភាពទីផ្សារការងារ និងកម្រិតប្រាក់បៀវត្ស",
      descEn: "Job market trends & salary projections",
    },
    {
      href: "/scholarships",
      label: t("nav.scholarships", "អាហារូបករណ៍"),
      icon: Award,
      descKm: "ឱកាសអាហារូបករណ៍ក្នុង និងក្រៅប្រទេស",
      descEn: "Local & international grant opportunities",
    },
    {
      isDropdown: true,
      label: language === "km" ? "តេស្តវាយតម្លៃ" : "Assessments",
      icon: Sparkles,
      highlight: true,
      descKm: "តេស្តស្វែងយល់ពីខ្លួនឯង RIASEC, 16P និងបាក់ឌុប",
      descEn: "RIASEC, 16-Personality & Academic diagnostic tests",
      subItems: assessmentSubItems,
    },
    {
      href: "/about",
      label: t("nav.about", "អំពីយើង"),
      icon: Info,
      descKm: "បេសកកម្មតម្រង់ទិសអប់រំ និងក្រុមការងារ",
      descEn: "Our guidance mission and values",
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
          {navLinks.map((item, idx) => {
            if (item.isDropdown && item.subItems) {
              const isAnySubActive = item.subItems.some(
                (sub) =>
                  pathname === sub.href ||
                  (sub.href !== "/" && pathname?.startsWith(sub.href))
              );
              return (
                <div
                  key="assessments-nav-item"
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setAssessmentsOpen((prev) => !prev)}
                    className={cn(
                      "relative px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      isAnySubActive || assessmentsOpen
                        ? "bg-[#111965]/8 text-[#111965] font-bold shadow-2xs"
                        : "text-[#5A6482] hover:text-[#111965] hover:bg-slate-100/70"
                    )}
                    aria-expanded={assessmentsOpen}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200 text-slate-400",
                        assessmentsOpen && "rotate-180 text-[#111965]"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {assessmentsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-50 w-[420px]"
                      >
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-1.5 backdrop-blur-md">
                          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[12px] font-black uppercase tracking-wider text-[#111965]">
                              {language === "km"
                                ? "តេស្តវាយតម្លៃលើផ្លាតហ្វម"
                                : "Platform Diagnostic Tests"}
                            </span>
                            <span className="text-[12.5px] font-bold text-slate-400">
                              {language === "km"
                                ? "៣ តេស្ត • ១ លទ្ធផល"
                                : "3 Tests · 1 Report"}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1">
                            {item.subItems
                              .filter((test) => !test.isOutcome)
                              .map((test) => {
                              const TestIcon = test.icon;
                              const isSubActive =
                                pathname === test.href ||
                                (test.href !== "/" && pathname?.startsWith(test.href));
                              return (
                                <Link
                                  key={test.href}
                                  href={test.href}
                                  onClick={() => setAssessmentsOpen(false)}
                                  className={cn(
                                    "flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group",
                                    isSubActive
                                      ? "bg-slate-50 border border-slate-200"
                                      : "hover:bg-slate-50 border border-transparent"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                                      test.bgClass
                                    )}
                                  >
                                    <TestIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-bold text-[#111965] group-hover:text-blue-600 transition-colors truncate">
                                        {language === "km" ? test.labelKm : test.labelEn}
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[12.5px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 border",
                                          test.tagClass
                                        )}
                                      >
                                        {language === "km" ? test.badgeKm : test.badgeEn}
                                      </span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                      {language === "km" ? test.descKm : test.descEn}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Outcome hub: visually separated so it never reads as a 4th test */}
                          {item.subItems
                            .filter((outcome) => outcome.isOutcome)
                            .map((outcome) => {
                              const OutcomeIcon = outcome.icon;
                              const isOutcomeActive =
                                pathname === outcome.href ||
                                (outcome.href !== "/" &&
                                  pathname?.startsWith(outcome.href));
                              return (
                                <div
                                  key={outcome.href}
                                  className="pt-1.5 mt-0.5 border-t border-slate-100"
                                >
                                  <div className="px-3 pt-2 pb-1.5 flex items-center justify-between gap-2">
                                    <span className="text-[12.5px] font-black uppercase tracking-wider text-purple-700/80">
                                      {language === "km"
                                        ? "លទ្ធផលរបស់អ្នក"
                                        : "Your Outcome"}
                                    </span>
                                    <span className="text-[12.5px] font-semibold text-slate-400 whitespace-nowrap">
                                      {language === "km"
                                        ? "តេស្ត ៣ + ទីផ្សារការងារ"
                                        : "3 tests + job market"}
                                    </span>
                                  </div>
                                  <Link
                                    href={outcome.href}
                                    onClick={() => setAssessmentsOpen(false)}
                                    className={cn(
                                      "flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 group",
                                      isOutcomeActive
                                        ? "bg-purple-50 border-purple-300"
                                        : "bg-purple-50/40 border-purple-100/80 hover:bg-purple-50 hover:border-purple-200"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                                        outcome.bgClass
                                      )}
                                    >
                                      <OutcomeIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-[#111965] group-hover:text-purple-700 transition-colors truncate">
                                          {language === "km"
                                            ? outcome.labelKm
                                            : outcome.labelEn}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-[12.5px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 border",
                                            outcome.tagClass
                                          )}
                                        >
                                          {language === "km"
                                            ? outcome.badgeKm
                                            : outcome.badgeEn}
                                        </span>
                                      </div>
                                      <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                        {language === "km"
                                          ? outcome.descKm
                                          : outcome.descEn}
                                      </p>
                                    </div>
                                  </Link>
                                </div>
                              );
                            })}

                          {/* Quick action footer */}
                          <div className="pt-2 border-t border-slate-100 px-1">
                            <Link
                              href="/dashboard/assessments/riasec"
                              onClick={() => setAssessmentsOpen(false)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 transition-colors text-xs font-bold"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>
                                  {language === "km"
                                    ? "ធ្វើតេស្តស្វែងយល់ពីខ្លួនឯងឥតគិតថ្លៃ"
                                    : "Start Free Assessment"}
                                </span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive =
              Boolean(item.href) &&
              (pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href!)));
            return (
              <Link
                key={item.href || idx}
                href={item.href || "#"}
                className={cn(
                  "relative px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-[#111965]/8 text-[#111965] font-bold shadow-2xs"
                    : "text-[#5A6482] hover:text-[#111965] hover:bg-slate-100/70"
                )}
              >
                <span>{item.label}</span>
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
                  {navLinks.map((item, idx) => {
                    if (item.isDropdown && item.subItems) {
                      const isAnySubActive = item.subItems.some(
                        (sub) =>
                          pathname === sub.href ||
                          (sub.href !== "/" && pathname?.startsWith(sub.href))
                      );
                      return (
                        <div
                          key="mobile-assessments"
                          className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMobileAssessmentsOpen((prev) => !prev)
                            }
                            className={cn(
                              "w-full flex items-center justify-between p-3 text-left font-bold text-sm transition-colors cursor-pointer",
                              isAnySubActive
                                ? "bg-[#111965]/8 text-[#111965]"
                                : "text-[#171A2C] hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-[#111965]">
                                  {item.label}
                                </div>
                                <div className="text-[12px] text-[#68708A] font-normal line-clamp-1">
                                  {language === "km"
                                    ? item.descKm
                                    : item.descEn}
                                </div>
                              </div>
                            </div>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
                                mobileAssessmentsOpen && "rotate-180 text-[#111965]"
                              )}
                            />
                          </button>

                          {mobileAssessmentsOpen && (
                            <div className="p-2 bg-slate-50/80 border-t border-slate-100 space-y-1.5">
                              {item.subItems
                                .filter((test) => !test.isOutcome)
                                .map((test) => {
                                const TestIcon = test.icon;
                                const isSubActive =
                                  pathname === test.href ||
                                  (test.href !== "/" && pathname?.startsWith(test.href));
                                return (
                                  <Link
                                    key={test.href}
                                    href={test.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                      "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                                      isSubActive
                                        ? "bg-white border-slate-300 shadow-2xs font-bold"
                                        : "bg-white/80 border-slate-200/70 hover:bg-white"
                                    )}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={cn(
                                          "w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0",
                                          test.bgClass
                                        )}
                                      >
                                        <TestIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-[#111965] block">
                                          {language === "km"
                                            ? test.labelKm
                                            : test.labelEn}
                                        </span>
                                      </div>
                                    </div>
                                    <span
                                      className={cn(
                                        "text-[12.5px] font-mono font-bold px-1.5 py-0.5 rounded-md border",
                                        test.tagClass
                                      )}
                                    >
                                      {language === "km"
                                        ? test.badgeKm
                                        : test.badgeEn}
                                    </span>
                                  </Link>
                                );
                              })}

                              {/* Outcome hub: separated from the tests it is built from */}
                              {item.subItems
                                .filter((outcome) => outcome.isOutcome)
                                .map((outcome) => {
                                  const OutcomeIcon = outcome.icon;
                                  const isOutcomeActive =
                                    pathname === outcome.href ||
                                    (outcome.href !== "/" &&
                                      pathname?.startsWith(outcome.href));
                                  return (
                                    <div
                                      key={outcome.href}
                                      className="pt-1.5 mt-1 border-t border-slate-200/80"
                                    >
                                      <div className="px-1 pt-2 pb-1.5 flex items-center justify-between gap-2">
                                        <span className="text-[12.5px] font-black uppercase tracking-wider text-purple-700/80">
                                          {language === "km"
                                            ? "លទ្ធផលរបស់អ្នក"
                                            : "Your Outcome"}
                                        </span>
                                        <span className="text-[12.5px] font-semibold text-slate-400 whitespace-nowrap">
                                          {language === "km"
                                            ? "តេស្ត ៣ + ទីផ្សារការងារ"
                                            : "3 tests + job market"}
                                        </span>
                                      </div>
                                      <Link
                                        href={outcome.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                          "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                                          isOutcomeActive
                                            ? "bg-purple-50 border-purple-300 shadow-2xs"
                                            : "bg-purple-50/50 border-purple-200/70 hover:bg-purple-50"
                                        )}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div
                                            className={cn(
                                              "w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0",
                                              outcome.bgClass
                                            )}
                                          >
                                            <OutcomeIcon className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold text-[#111965] block truncate">
                                              {language === "km"
                                                ? outcome.labelKm
                                                : outcome.labelEn}
                                            </span>
                                            <span className="text-[12.5px] text-slate-500 block leading-tight mt-0.5 line-clamp-1">
                                              {language === "km"
                                                ? outcome.descKm
                                                : outcome.descEn}
                                            </span>
                                          </div>
                                        </div>
                                        <span
                                          className={cn(
                                            "text-[12.5px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ml-2",
                                            outcome.tagClass
                                          )}
                                        >
                                          {language === "km"
                                            ? outcome.badgeKm
                                            : outcome.badgeEn}
                                        </span>
                                      </Link>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isActive =
                      Boolean(item.href) &&
                      (pathname === item.href ||
                        (item.href !== "/" && pathname?.startsWith(item.href!)));
                    return (
                      <Link
                        key={item.href || idx}
                        href={item.href || "#"}
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
                            <div className="text-[12px] text-[#68708A] font-normal leading-tight mt-0.5 line-clamp-1">
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
