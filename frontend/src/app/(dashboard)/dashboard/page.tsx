"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  BrainCircuit,
  Compass,
  ArrowRight,
  GraduationCap,
  Play,
  Check,
  Crown,
  Sliders,
  ChevronRight,
  Target,
  Trophy,
  Star,
  School,
  Code2,
  Building2,
  Briefcase,
  Landmark,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { t, language, getLocalized } = useLanguage();
  const [taraCheer, setTaraCheer] = useState(false);

  // 1. REAL Student Dashboard Summary
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => apiFetch<any>("/students/dashboard-summary"),
  });

  // 2. REAL Student Profile
  const { data: profile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => apiFetch<any>("/students/profile"),
  });

  // 3. REAL AI Major Recommendations
  const { data: recommendations, isLoading: isRecsLoading } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // 4. REAL Scholarships
  const { data: scholarships } = useQuery({
    queryKey: ["featured-scholarships-preview"],
    queryFn: async () => apiFetch<any[]>("/scholarships?limit=2"),
  });

  const status = summary?.assessments_status;
  const pDone = Boolean(status?.personality_completed);
  const rDone = Boolean(status?.riasec_completed);
  const prefDone = Boolean(status?.preferences_completed);
  const completedCount = Number(pDone) + Number(rDone) + Number(prefDone);
  const progressPercent = Math.min(100, Math.round((completedCount / 3) * 100));

  // Student details
  const userName =
    getLocalized({ en: user?.full_name_en, km: user?.full_name_km }) ||
    user?.full_name_km ||
    user?.full_name_en ||
    user?.email?.split("@")[0] ||
    "Student";

  const highSchool = profile?.high_school || t("dashboardPage.schoolFallback", "Hun Sen Bak Touk High School");

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t("dashboardPage.goodMorning")
      : currentHour < 18
      ? t("dashboardPage.goodAfternoon")
      : t("dashboardPage.goodEvening");

  // Interactive cheer trigger when user clicks Tara
  const handleTaraClick = () => {
    setTaraCheer(true);
    setTimeout(() => setTaraCheer(false), 800);
  };

  // Top recommendation
  const topRec = Array.isArray(recommendations) && recommendations.length > 0
    ? recommendations[0]
    : null;
  const topMajorName = topRec
    ? getLocalized(topRec?.major?.name) || topRec?.major?.name?.en || ""
    : "";
  const topScore = topRec ? Math.round(topRec.match_score || 0) : 0;

  // Top 4 recommendations for right leaderboard
  const topRankedList = Array.isArray(recommendations)
    ? recommendations.slice(0, 4)
    : [];

  // Featured scholarship
  const featuredScholarship = Array.isArray(scholarships) && scholarships.length > 0
    ? scholarships[0]
    : null;

  // Redesigned Popular Majors (Pic 2 Redesign): Clean capsules matching reference layout
  const isKhmer = language === "km";
  const popularMajorCapsules = [
    {
      slug: "software-engineering",
      name: isKhmer ? "វិស្វកម្មកុំព្យូទ័រ" : "Software Eng",
      score: "4.9",
      matchPercent: "96%",
      icon: Code2,
      iconBg: "bg-[#F0F2FA] text-[#111965]",
    },
    {
      slug: "data-science-ai",
      name: isKhmer ? "វិទ្យាសាស្ត្រទិន្នន័យ" : "Data Science & AI",
      score: "4.9",
      matchPercent: "89%",
      icon: Bot,
      iconBg: "bg-purple-100 text-purple-600",
    },
    {
      slug: "civil-engineering",
      name: isKhmer ? "សំណង់ស៊ីវិល" : "Civil Engineering",
      score: "4.8",
      matchPercent: "92%",
      icon: Building2,
      iconBg: "bg-[#FFF9E6] text-[#B45309]",
    },
    {
      slug: "business-administration",
      name: isKhmer ? "គ្រប់គ្រងពាណិជ្ជកម្ម" : "Business Admin",
      score: "4.8",
      matchPercent: "70%",
      icon: Briefcase,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      slug: "banking-finance",
      name: isKhmer ? "ធនាគារ និងហិរញ្ញវត្ថុ" : "Banking & Finance",
      score: "4.8",
      matchPercent: "68%",
      icon: Landmark,
      iconBg: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* ========================================================
          LEFT / CENTER MAIN COLUMN (Span 8 on XL)
      ======================================================== */}
      <div className="xl:col-span-8 space-y-6">
        {/* 1. SCENIC HERO BANNER (Futera Primary Navy + Secondary Gold Accent) */}
        <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-r from-[#0A0F3D] via-[#111965] to-[#1E277A] border border-[#111965]/40 p-7 sm:p-9 shadow-lg min-h-[225px] flex flex-col justify-between text-white">
          {/* Full-width Single Image Backdrop */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10">
            <Image
              src="/images/cambodia-campuses-skyline-seamless.webp"
              alt="Cambodian Skyline Backdrop"
              fill
              priority
              unoptimized
              className="object-cover object-bottom"
            />
          </div>

          {/* Top Row: School Badge cleanly on Left */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F7CE4D] font-bold text-xs border border-white/20 shadow-2xs">
              <School className="w-3.5 h-3.5 text-[#F7CE4D]" />
              <span>{highSchool} • Grade 12</span>
            </div>
          </div>

          {/* Middle / Bottom Content */}
          <div className="relative z-10 pt-4 space-y-2 max-w-sm sm:max-w-md">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {greeting},<br />
              <span className="text-[#F7CE4D]">{userName}!</span> 👋
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed pt-0.5">
              {t("dashboardPage.heroSubtitle")}
            </p>

            <div className="pt-3">
              <Link
                href="/dashboard/recommendations"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs sm:text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-md hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
              >
                <span>{t("dashboardPage.continueJourney")}</span>
                <ArrowRight className="w-4 h-4 text-[#111965] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Mascot Stage on Right (Tara Mascot with Clean Placement) */}
          <div
            onClick={handleTaraClick}
            title={t("dashboardPage.tapTaraCheer")}
            className="absolute right-4 sm:right-8 md:right-12 bottom-0 z-10 cursor-pointer group select-none flex flex-col items-center"
          >
            <div
              className={cn(
                "w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 relative transition-transform duration-200",
                taraCheer ? "scale-110 -translate-y-2" : "group-hover:scale-105"
              )}
            >
              <Image
                src="/images/welcome-hd.webp"
                alt="Tara Futera Mascot"
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-md select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 2. "CONTINUE LEARNING" / ACTIVE PROGRESS CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-[#111965] tracking-tight">
              {t("dashboardPage.continueLearning")}
            </h2>
            <Link
              href="/dashboard/recommendations"
              className="text-xs font-bold text-[#111965] hover:text-[#B45309] hover:underline"
            >
              {t("dashboardPage.seeAll")}
            </Link>
          </div>

          {topRec ? (
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Campus Thumbnail with Aspect Ratio & Subtle Match Badge */}
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-2xs border border-slate-100">
                <Image
                  src="/images/universities/cadt.jpg"
                  alt={topMajorName}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#111965] text-[12px] font-black text-[#F7CE4D] shadow-xs">
                  {topScore}% Match
                </div>
              </div>

              {/* Title, Subtitle & Sleek Progress Bar */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#111965] truncate">
                    {topMajorName}
                  </h3>
                  <p className="text-xs text-[#64748B] truncate">
                    {t("dashboardPage.unit1Desc")}
                  </p>
                </div>

                {/* Progress Bar with Percentage */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#111965] via-[#1E277A] to-[#F7CE4D] transition-all duration-500"
                      style={{ width: `${topScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#64748B] flex-shrink-0">
                    {topScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Primary Navy Pill with Gold Accent Icon */}
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#111965] hover:bg-[#1E277A] shadow-xs hover:shadow-md transition-all active:scale-95 flex-shrink-0 w-full md:w-auto cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#F7CE4D] text-[#F7CE4D]" />
              <span>{t("dashboardPage.resume")}</span>
            </Link>
          </div>
          ) : (
            <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F7CE4D]/20 text-[#B45309] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#111965]">
                    {language === "km" ? "មិនទាន់មានការណែនាំនៅឡើយទេ" : "No recommendation yet"}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {language === "km"
                      ? "បំពេញតេស្តដំបូងដើម្បីបើកការណែនាំជំនាញផ្ទាល់ខ្លួន។"
                      : "Complete your first assessment to unlock your personalized major matches."}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/assessments"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-xs transition-all active:scale-95 shrink-0 w-full sm:w-auto"
              >
                <span>{language === "km" ? "ចាប់ផ្តើមតេស្ត" : "Start assessment"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 3. "BUILD YOUR SKILLS" / 4 CLEAN PASTEL TILES */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-[#111965] tracking-tight px-1">
            {t("dashboardPage.buildSkills")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Purple: Personality */}
            <Link
              href="/dashboard/assessments/personality"
              className="p-4 rounded-[22px] bg-[#F5EFFE] border border-[#E9D5FF] hover:border-[#D8B4FE] hover:shadow-xs transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-[#7E22CE] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                <BrainCircuit className="w-5 h-5 text-[#7E22CE]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-[#1E1B4B] truncate">
                  {t("dashboardPage.skillsPersonality")}
                </div>
                <div className="text-[12px] text-[#6B21A8] font-semibold truncate">
                  {status?.personality_type ? `${status.personality_type} Type` : "12 Questions"}
                </div>
              </div>
            </Link>

            {/* Red/Coral: Career Fit */}
            <Link
              href="/dashboard/assessments/riasec"
              className="p-4 rounded-[22px] bg-[#FEECEC] border border-[#FECDD3] hover:border-[#FDA4AF] hover:shadow-xs transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-[#E11D48] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                <Compass className="w-5 h-5 text-[#E11D48]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-[#4C0519] truncate">
                  {t("dashboardPage.skillsCareer")}
                </div>
                <div className="text-[12px] text-[#9F1239] font-semibold truncate">
                  {status?.holland_code ? `Code: ${status.holland_code}` : "18 Questions"}
                </div>
              </div>
            </Link>

            {/* Green: Preferences */}
            <Link
              href="/dashboard/assessments/preferences"
              className="p-4 rounded-[22px] bg-[#E8FAF0] border border-[#BBF7D0] hover:border-[#86EFAC] hover:shadow-xs transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-[#15803D] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                <Sliders className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-[#052E16] truncate">
                  {t("dashboardPage.skillsPreferences")}
                </div>
                <div className="text-[12px] text-[#166534] font-semibold truncate">
                  Phnom Penh
                </div>
              </div>
            </Link>

            {/* Amber: AI Fit Scores */}
            <Link
              href="/dashboard/recommendations"
              className="p-4 rounded-[22px] bg-[#FEF6E7] border border-[#FDE68A] hover:border-[#FCD34D] hover:shadow-xs transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white text-[#B45309] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#B45309]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-[#451A03] truncate">
                  {t("dashboardPage.skillsAiFit")}
                </div>
                <div className="text-[12px] text-[#92400E] font-semibold truncate">
                  {recommendations && recommendations.length > 0
                    ? `${recommendations.length} ${language === "km" ? "ការផ្គូផ្គង" : "Matches"}`
                    : language === "km" ? "បំពេញតេស្ត" : "Take a test"}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 4. "POPULAR MAJORS IN CAMBODIA" / CAPSULES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-[#111965] tracking-tight">
              {t("dashboardPage.popularMajorsTitle")}
            </h2>
            <Link
              href="/dashboard/recommendations"
              className="text-xs font-bold text-[#111965] hover:text-[#B45309] hover:underline"
            >
              {t("dashboardPage.seeAll")}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularMajorCapsules.slice(0, 4).map((major) => {
              const IconComponent = major.icon;
              return (
                <Link
                  key={major.slug}
                  href="/dashboard/recommendations"
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#111965] hover:shadow-xs transition-all flex items-center gap-3 group"
                >
                  {/* Round Avatar Icon */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                      major.iconBg
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* 2 Lines: Name on Top, Rating with Star on Bottom */}
                  <div className="overflow-hidden min-w-0">
                    <div className="text-xs font-bold text-[#111965] truncate group-hover:text-[#B45309] transition-colors">
                      {major.name}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-semibold text-[#64748B]">
                      <span>{major.score}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT SIDEBAR: THREE CLEAN WIDGETS (Span 4 on XL)
      ======================================================== */}
      <div className="xl:col-span-4 space-y-6">
        {/* 1. "YOUR DAILY GOAL" / GUIDANCE PROGRESS WIDGET */}
        <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-sm font-black text-[#111965] tracking-tight">
            {t("dashboardPage.guidanceGoal")}
          </h2>

          <div className="flex items-center gap-5">
            {/* Radial Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E6E8F0] dark:text-white/10"
                  strokeWidth="3.6"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {progressPercent > 0 && (
                  <path
                    className="text-[#F7CE4D] transition-all duration-700"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Target className={cn(
                  "w-4 h-4",
                  progressPercent > 0 ? "text-[#F7CE4D]" : "text-[#C7CCDA] dark:text-white/30"
                )} />
                <span className="text-[12px] font-black text-[#111965] leading-tight pt-0.5">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Streak Subtitle */}
            <div className="space-y-1">
              <div className="text-xs font-black text-[#111965]">
                {completedCount === 3 ? t("dashboardPage.greatJob") : t("dashboardPage.keepGoing")}
              </div>
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                {completedCount === 3
                  ? t("dashboardPage.allCompletedDesc")
                  : t("dashboardPage.completeAllDesc")}
              </p>
            </div>
          </div>

          {/* 3 Step Circles (Primary Navy & Secondary Gold) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around">
            {/* Step 1: MBTI */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                  pDone ? "bg-[#111965] text-[#F7CE4D] shadow-xs" : "bg-slate-100 text-slate-400"
                )}
              >
                {pDone ? <Check className="w-3.5 h-3.5 stroke-[3] text-[#F7CE4D]" /> : <span className="text-[12.5px] font-bold">1</span>}
              </div>
              <span className="text-[12.5px] font-bold text-[#64748B]">MBTI</span>
            </div>

            {/* Step 2: RIASEC */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                  rDone ? "bg-[#111965] text-[#F7CE4D] shadow-xs" : "bg-slate-100 text-slate-400"
                )}
              >
                {rDone ? <Check className="w-3.5 h-3.5 stroke-[3] text-[#F7CE4D]" /> : <span className="text-[12.5px] font-bold">2</span>}
              </div>
              <span className="text-[12.5px] font-bold text-[#64748B]">RIASEC</span>
            </div>

            {/* Step 3: Prefs */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                  prefDone ? "bg-[#111965] text-[#F7CE4D] shadow-xs" : "bg-slate-100 text-slate-400"
                )}
              >
                {prefDone ? <Check className="w-3.5 h-3.5 stroke-[3] text-[#F7CE4D]" /> : <span className="text-[12.5px] font-bold">3</span>}
              </div>
              <span className="text-[12.5px] font-bold text-[#64748B]">Prefs</span>
            </div>
          </div>
        </div>

        {/* 2. "LEADERBOARD / TOP MAJOR MATCHES" WIDGET */}
        <div className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#111965] tracking-tight">
              {t("dashboardPage.topMajorMatches")}
            </h2>
            <Link
              href="/dashboard/recommendations"
              className="text-[12px] font-bold text-[#111965] hover:text-[#B45309] hover:underline"
            >
              {t("dashboardPage.seeAll")}
            </Link>
          </div>

          <div className="space-y-1.5">
            {isRecsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-2xl bg-slate-100 animate-pulse" />
              ))
            ) : topRankedList.length > 0 ? (
              topRankedList.map((rec: any, idx: number) => {
                const rank = idx + 1;
                const isTop = rank === 1;
                const name =
                  getLocalized(rec.major?.name) ||
                  rec.major?.name?.en ||
                  rec.major?.slug;
                const score = Math.round(rec.match_score || 0);

                return (
                  <Link
                    key={rec.id || idx}
                    href="/dashboard/recommendations"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-2xl transition-all group",
                      isTop
                        ? "bg-[#F0F2FA] text-[#111965] font-black shadow-2xs border border-[#111965]/10"
                        : "hover:bg-slate-50 text-[#171A2C]"
                    )}
                  >
                    {/* Rank Badge */}
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[12.5px] font-black flex-shrink-0",
                        rank === 1
                          ? "bg-[#F7CE4D] text-[#111965]"
                          : rank === 2
                          ? "bg-[#111965] text-white"
                          : rank === 3
                          ? "bg-[#1E277A] text-white"
                          : "text-slate-400 bg-slate-100"
                      )}
                    >
                      {rank}
                    </span>

                    {/* Category Icon */}
                    <span className="text-base flex-shrink-0">
                      {idx === 0 ? "💻" : idx === 1 ? "⚙️" : idx === 2 ? "🤖" : "💼"}
                    </span>

                    {/* Name */}
                    <div className="flex-1 truncate text-xs font-bold group-hover:text-[#111965] transition-colors">
                      {name}
                      {isTop && <span className="ml-1 text-xs">👑</span>}
                    </div>

                    {/* Score: Distinct Accent Gold for #1 */}
                    <span
                      className={cn(
                        "text-[12px] font-extrabold flex-shrink-0 px-2 py-0.5 rounded-full",
                        isTop
                          ? "bg-[#F7CE4D] text-[#111965]"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {score}%
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                {language === "km"
                  ? "បំពេញតេស្តដើម្បីបង្កើតការផ្គូផ្គង។"
                  : "Take assessments to generate matches."}
              </div>
            )}
          </div>
        </div>

        {/* 3. SCHOLARSHIP MILESTONE CARD (Futera Primary & Secondary Gold Accent) */}
        <Link
          href="/dashboard/favorites"
          className="block p-5 rounded-[26px] bg-gradient-to-br from-[#F0F2FA] via-[#FAFBFD] to-[#FFF9E6] border border-[#E6E8F0] hover:border-[#F7CE4D] shadow-xs hover:shadow-md transition-all relative overflow-hidden space-y-3 group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            {/* Award Icon: Accent Gold badge */}
            <div className="w-11 h-11 rounded-2xl bg-[#FFF9E6] border border-[#F7CE4D]/40 text-[#D97706] flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-[#F59E0B]" />
            </div>

            <div className="space-y-1 overflow-hidden">
              <div className="text-xs font-black text-[#111965] leading-tight truncate group-hover:text-[#B45309] transition-colors">
                {featuredScholarship
                  ? getLocalized(featuredScholarship.title) || featuredScholarship.title?.en
                  : "Techo Digital Talent Scholarship"}
              </div>
              <p className="text-[12px] text-[#475569] leading-snug line-clamp-2">
                100% Full Tuition Coverage for digital tech degrees in Cambodia.
              </p>
            </div>
          </div>

          {/* Progress Bar (Matching Reference Layout) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[12.5px] font-bold text-[#111965]">
              <span>Coverage Progress</span>
              <span className="text-[#B45309] font-black group-hover:translate-x-0.5 transition-transform">
                View Saved &rarr;
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D] w-full" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
