"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  Loader2,
  Menu,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import {
  ContentManager,
  type AdminColumn,
  type AdminField,
} from "@/components/admin/content-manager";
import { UsersManager } from "@/components/admin/users-manager";
import {
  AdminSidebar,
  ADMIN_TABS,
  type AdminTab,
} from "@/components/admin/admin-sidebar";

const RIASEC_OPTIONS = ["R", "I", "A", "S", "E", "C"].map((code) => ({
  value: code,
  label: code,
}));

const UNIVERSITY_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  { key: "name_en", label: "Name (English)", required: true },
  { key: "name_km", label: "Name (Khmer)" },
  { key: "acronym_en", label: "Acronym (English)", required: true },
  { key: "acronym_km", label: "Acronym (Khmer)" },
  {
    key: "university_type",
    label: "Type",
    type: "select",
    options: [
      { value: "PUBLIC", label: "Public" },
      { value: "PRIVATE", label: "Private" },
    ],
    defaultValue: "PUBLIC",
    required: true,
  },
  { key: "province", label: "Province", defaultValue: "Phnom Penh", required: true },
  { key: "website_url", label: "Website" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "logo_url", label: "Logo", type: "image", imageShape: "square", placeholder: "Paste a URL or upload from your laptop" },
  { key: "cover_image_url", label: "Cover image", type: "image", imageShape: "wide", placeholder: "Paste a URL or upload from your laptop" },
  { key: "established_year", label: "Established year", type: "number", min: 1900, max: 2100 },
  { key: "tuition_range_min_usd", label: "Min tuition (USD)", type: "number", min: 0 },
  { key: "tuition_range_max_usd", label: "Max tuition (USD)", type: "number", min: 0 },
  { key: "is_tuition_verified", label: "Tuition verified", type: "checkbox" },
  { key: "is_verified", label: "University verified", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const UNIVERSITY_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    render: (row) => <PreviewCell src={row.cover_image_url || row.logo_url} label={row.name_en} />,
  },
  {
    key: "name_en",
    label: "University",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">{row.name_en}</div>
        <div className="text-[11px] text-[#68708A]">
          {row.acronym_en} · {row.province}
        </div>
      </div>
    ),
  },
  {
    key: "university_type",
    label: "Type",
    render: (row) => (
      <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
        {row.university_type}
      </span>
    ),
  },
  {
    key: "tuition_range_min_usd",
    label: "Tuition",
    render: (row) =>
      row.tuition_range_min_usd
        ? `$${row.tuition_range_min_usd}–$${row.tuition_range_max_usd ?? row.tuition_range_min_usd}`
        : "—",
  },
  {
    key: "is_verified",
    label: "Verified",
    render: (row) => <BoolBadge value={row.is_verified} />,
  },
];

const MAJOR_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  { key: "name_en", label: "Name (English)", required: true },
  { key: "name_km", label: "Name (Khmer)" },
  { key: "category", label: "Category", required: true },
  { key: "riasec_primary", label: "RIASEC primary", type: "select", options: RIASEC_OPTIONS, defaultValue: "I", required: true },
  { key: "riasec_secondary", label: "RIASEC secondary", type: "select", options: RIASEC_OPTIONS, defaultValue: "R", required: true },
  { key: "personality_affinity", label: "MBTI affinity", placeholder: "INTJ,INTP" },
  { key: "is_stem", label: "STEM major", type: "checkbox" },
  { key: "image_url", label: "Major image", type: "image", imageShape: "wide", placeholder: "Paste a URL or upload from your laptop" },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const MAJOR_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    render: (row) => <PreviewCell src={row.image_url} label={row.name_en} />,
  },
  {
    key: "name_en",
    label: "Major",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">{row.name_en}</div>
        <div className="text-[11px] text-[#68708A]">{row.category}</div>
      </div>
    ),
  },
  {
    key: "riasec_primary",
    label: "RIASEC",
    render: (row) => `${row.riasec_primary}${row.riasec_secondary}`,
  },
  {
    key: "is_stem",
    label: "STEM",
    render: (row) => <BoolBadge value={row.is_stem} />,
  },
];

const CAREER_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  { key: "title_en", label: "Title (English)", required: true },
  { key: "title_km", label: "Title (Khmer)" },
  { key: "industry", label: "Industry", required: true },
  {
    key: "education_level",
    label: "Education level",
    type: "select",
    options: [
      { value: "BACHELOR", label: "Bachelor" },
      { value: "ASSOCIATE", label: "Associate" },
      { value: "MASTER", label: "Master" },
      { value: "DOCTORATE", label: "Doctorate" },
      { value: "DIPLOMA", label: "Diploma" },
    ],
    defaultValue: "BACHELOR",
  },
  { key: "riasec_code", label: "RIASEC code", placeholder: "IRE", required: true },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const CAREER_COLUMNS: AdminColumn[] = [
  {
    key: "title_en",
    label: "Career",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">{row.title_en}</div>
        <div className="text-[11px] text-[#68708A]">{row.industry}</div>
      </div>
    ),
  },
  { key: "education_level", label: "Education" },
  { key: "riasec_code", label: "RIASEC" },
];

const SCHOLARSHIP_FIELDS: AdminField[] = [
  { key: "slug", label: "Slug", placeholder: "auto-generated if blank" },
  { key: "title_en", label: "Title (English)", required: true },
  { key: "title_km", label: "Title (Khmer)" },
  { key: "provider_en", label: "Provider (English)", required: true },
  { key: "provider_km", label: "Provider (Khmer)" },
  {
    key: "coverage_type",
    label: "Coverage type",
    type: "select",
    options: [
      { value: "FULL_TUITION", label: "Full tuition" },
      { value: "PARTIAL_TUITION", label: "Partial tuition" },
      { value: "STIPEND_ONLY", label: "Stipend only" },
      { value: "FULL_RIDE", label: "Full ride" },
    ],
    defaultValue: "FULL_TUITION",
    required: true,
  },
  { key: "coverage_percentage", label: "Coverage %", type: "number", min: 0, max: 100 },
  { key: "country_or_institution", label: "Country / institution", required: true },
  { key: "application_deadline", label: "Deadline", type: "date" },
  { key: "official_url", label: "Official URL", required: true },
  { key: "source_name", label: "Source name" },
  { key: "poster_url", label: "Poster image", type: "image", imageShape: "poster", placeholder: "Paste a URL or upload from your laptop" },
  { key: "is_verified", label: "Verified", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const SCHOLARSHIP_COLUMNS: AdminColumn[] = [
  {
    key: "preview",
    label: "Preview",
    render: (row) => <PreviewCell src={row.poster_url} label={row.title_en} />,
  },
  {
    key: "title_en",
    label: "Scholarship",
    render: (row) => (
      <div>
        <div className="font-bold text-[#111965]">{row.title_en}</div>
        <div className="text-[11px] text-[#68708A]">{row.provider_en}</div>
      </div>
    ),
  },
  {
    key: "coverage_type",
    label: "Coverage",
    render: (row) => (
      <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
        {row.coverage_percentage ? `${row.coverage_percentage}%` : row.coverage_type?.replace("_", " ")}
      </span>
    ),
  },
  {
    key: "application_deadline",
    label: "Deadline",
    render: (row) =>
      row.application_deadline ? new Date(row.application_deadline).toLocaleDateString() : "Rolling",
  },
  {
    key: "is_verified",
    label: "Verified",
    render: (row) => <BoolBadge value={row.is_verified} />,
  },
];

function PreviewCell({ src, label }: { src?: string | null; label?: string }) {
  if (!src) {
    return <span className="text-[10px] text-[#94A3B8]">—</span>;
  }
  return (
    <div className="h-8 w-12 overflow-hidden rounded-md border border-[#E6E8F0] bg-slate-100">
      <img
        src={src}
        alt={label || ""}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      Yes
    </span>
  ) : (
    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
      No
    </span>
  );
}

export default function AdminConsolePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeTabLabel =
    ADMIN_TABS.find((tab) => tab.id === activeTab)?.label || "Overview";
  const isAdmin = user?.roles?.some(
    (role) => role === "ADMIN" || role === "SUPER_ADMIN"
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] text-sm text-[#68708A]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking administrator session…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] p-4">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-[#E6E8F0] bg-white p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-rose-600" />
          <h2 className="text-xl font-bold text-[#111965]">Access denied</h2>
          <p className="text-xs text-[#68708A]">
            You need administrator privileges to open the OrienX control panel.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#111965] px-5 py-2 text-xs font-bold text-white"
          >
            Sign in as an administrator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FC]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#E6E8F0] bg-white/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F0F2FA] lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  Admin console
                </div>
                <div className="truncate text-sm font-black text-[#111965]">
                  {activeTabLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] font-semibold text-[#68708A] sm:inline">
                {user?.email}
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA]"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Student view
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-4">
          {activeTab === "overview" && <OverviewPanel onNavigate={setActiveTab} />}
          {activeTab === "users" && <UsersManager />}
          {activeTab === "universities" && (
            <ContentManager
              resource="universities"
              title="Universities"
              description="Public and private institutions in the directory."
              fields={UNIVERSITY_FIELDS}
              columns={UNIVERSITY_COLUMNS}
              searchKeys={["name_en", "name_km", "acronym_en", "slug", "province"]}
            />
          )}
          {activeTab === "majors" && (
            <ContentManager
              resource="majors"
              title="Majors"
              description="Academic programs and their RIASEC / MBTI attributes."
              fields={MAJOR_FIELDS}
              columns={MAJOR_COLUMNS}
              searchKeys={["name_en", "name_km", "category", "slug"]}
            />
          )}
          {activeTab === "careers" && (
            <ContentManager
              resource="careers"
              title="Careers"
              description="Career profiles, industries, and required qualifications."
              fields={CAREER_FIELDS}
              columns={CAREER_COLUMNS}
              searchKeys={["title_en", "title_km", "industry", "slug"]}
            />
          )}
          {activeTab === "scholarships" && (
            <ContentManager
              resource="scholarships"
              title="Scholarships"
              description="Funding opportunities, coverage, deadlines, and verification."
              fields={SCHOLARSHIP_FIELDS}
              columns={SCHOLARSHIP_COLUMNS}
              searchKeys={["title_en", "title_km", "provider_en", "country_or_institution", "slug"]}
            />
          )}
          {activeTab === "engine" && <RulesPanel />}
          {activeTab === "audit" && <AuditLogPanel />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ChartCardHeader({
  icon: Icon,
  title,
  subtitle,
  accent,
  chip,
  dark = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: string;
  chip?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            dark ? "border border-white/15 bg-white/10 text-[#F7CE4D]" : accent
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className={cn("text-sm font-black", dark ? "text-white" : "text-[#111965]")}>
            {title}
          </h3>
          <p className={cn("text-[11px]", dark ? "text-slate-300" : "text-[#94A3B8]")}>
            {subtitle}
          </p>
        </div>
      </div>
      {chip && (
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold",
            dark
              ? "border-white/15 bg-white/10 text-slate-200"
              : "border-[#E6E8F0] bg-[#F8FAFD] text-[#94A3B8]"
          )}
        >
          {chip}
        </span>
      )}
    </div>
  );
}

function ActivityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#111965] px-3 py-2 text-[11px] text-white shadow-xl">
      <p className="mb-1 font-black text-[#F7CE4D]">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-black tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewPanel({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { getLocalized } = useLanguage();
  const { user } = useAuth();
  const firstName =
    user?.full_name_en?.split(" ")[0] ||
    user?.full_name_km ||
    user?.email?.split("@")[0] ||
    "Admin";
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => apiFetch<any>("/admin/analytics"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading analytics…
      </div>
    );
  }

  const cards = [
    { label: "Students", hint: "Registered profiles", value: analytics?.total_students ?? 0, icon: Users, tone: "bg-sky-50 text-sky-700", primary: true },
    { label: "Universities", hint: "Directory institutions", value: analytics?.total_universities ?? 0, icon: Building2, tone: "bg-amber-50 text-amber-700" },
    { label: "Majors", hint: "Academic programs", value: analytics?.total_majors ?? 0, icon: BookOpen, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Careers", hint: "Career profiles", value: analytics?.total_careers ?? 0, icon: Briefcase, tone: "bg-indigo-50 text-indigo-700" },
    { label: "Scholarships", hint: "Funding opportunities", value: analytics?.total_scholarships ?? 0, icon: Award, tone: "bg-purple-50 text-purple-700" },
    { label: "Recommendations", hint: "Generated matches", value: analytics?.generated_recommendations_count ?? 0, icon: TrendingUp, tone: "bg-rose-50 text-rose-700" },
    { label: "16P Completed", hint: "Personality completions", value: analytics?.completed_personality_assessments ?? 0, icon: CheckCircle2, tone: "bg-fuchsia-50 text-fuchsia-700" },
    { label: "RIASEC Completed", hint: "Interest completions", value: analytics?.completed_riasec_assessments ?? 0, icon: Compass, tone: "bg-cyan-50 text-cyan-700" },
  ];

  const monthLabel = (value: string) => {
    const [year, month] = value.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString("en", {
      month: "short",
    });
  };

  const activityData = (analytics?.registrations_by_month || []).map(
    (row: any, index: number) => ({
      month: monthLabel(row.month),
      registrations: row.count,
      assessments: analytics?.assessments_by_month?.[index]?.count ?? 0,
      recommendations: analytics?.recommendations_by_month?.[index]?.count ?? 0,
    })
  );

  const roleData = analytics?.users_by_role || [];
  const popularData = (analytics?.popular_majors || [])
    .slice(0, 5)
    .map((major: any) => {
      const label =
        typeof major.name === "object" ? getLocalized(major.name) : major.name;
      return {
        name: String(label),
        count: major.count,
      };
    });
  const contentMix = [
    { name: "Majors", value: analytics?.total_majors ?? 0 },
    { name: "Universities", value: analytics?.total_universities ?? 0 },
    { name: "Careers", value: analytics?.total_careers ?? 0 },
    { name: "Scholarships", value: analytics?.total_scholarships ?? 0 },
  ].filter((item) => item.value > 0);
  const chartColors = ["#6366F1", "#F7CE4D", "#10B981", "#8B5CF6", "#0EA5E9"];
  const activityTotals = {
    registrations: activityData.reduce((sum: number, row: any) => sum + row.registrations, 0),
    assessments: activityData.reduce((sum: number, row: any) => sum + row.assessments, 0),
    recommendations: activityData.reduce((sum: number, row: any) => sum + row.recommendations, 0),
  };
  const roleTotal = roleData.reduce((sum: number, row: any) => sum + row.count, 0);
  const totalContent = contentMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A0F3D] via-[#111965] to-[#1E277A] p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <Image
            src="/images/cambodia-campuses-skyline-seamless.webp"
            alt=""
            fill
            unoptimized
            className="object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="max-w-xl space-y-2.5 pr-20 sm:pr-44">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F7CE4D]">
              <ShieldCheck className="h-3 w-3" />
              Admin workspace
            </span>
            <h2 className="text-xl font-black leading-tight sm:text-2xl">
              Welcome back,{" "}
              <span className="text-[#F7CE4D]">{firstName}!</span>
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Here is the latest pulse across the platform. Keep the directory
              accurate and the guidance engine healthy for every student.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-200">
              <Sparkles className="h-3 w-3 text-[#F7CE4D]" />
              Tara&apos;s tip: re-verify tuition and scholarship deadlines before each intake.
            </div>
          </div>

          <div className="pointer-events-none absolute right-2 top-2 h-20 w-20 shrink-0 sm:bottom-0 sm:top-auto sm:right-5 sm:h-36 sm:w-36 md:h-40 md:w-40">
            <Image
              src="/images/welcome-hd.webp"
              alt="Tara, the OrienX mascot"
              fill
              priority
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
                card.primary
                  ? "border-[#F7CE4D]/60 bg-gradient-to-br from-white to-[#FFF9E6]"
                  : "border-[#E6E8F0] bg-white"
              )}
            >
              <div
                className={cn(
                  "mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl",
                  card.primary ? "bg-[#FFF9E6] text-[#B45309]" : card.tone
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black tabular-nums text-[#111965]">
                {card.value}
              </div>
              <div className="text-[11px] font-bold text-[#111965]">{card.label}</div>
              <div className="text-[10px] text-[#94A3B8]">{card.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs xl:col-span-2">
          <ChartCardHeader
            icon={TrendingUp}
            title="Platform activity"
            subtitle="Monthly registrations, assessments, and matches"
            accent="bg-sky-50 text-sky-700"
            chip="Last 6 months"
          />

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Registrations", total: activityTotals.registrations, color: "#6366F1" },
              { label: "Assessments", total: activityTotals.assessments, color: "#F7CE4D" },
              { label: "Recommendations", total: activityTotals.recommendations, color: "#10B981" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#68708A]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="truncate">{metric.label}</span>
                </div>
                <div className="mt-0.5 text-lg font-black tabular-nums text-[#111965]">
                  {metric.total}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRegGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminAssessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7CE4D" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#F7CE4D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminRecGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#94A3B8" strokeOpacity={0.15} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={34}
                />
                <Tooltip content={<ActivityTooltip />} cursor={{ stroke: "#94A3B8", strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#6366F1" strokeWidth={2.4} fill="url(#adminRegGradient)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="assessments" name="Assessments" stroke="#F7CE4D" strokeWidth={2.4} fill="url(#adminAssessGradient)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="recommendations" name="Recommendations" stroke="#10B981" strokeWidth={2.4} fill="url(#adminRecGradient)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs">
          <ChartCardHeader
            icon={Users}
            title="Users by role"
            subtitle="Account distribution"
            accent="bg-purple-50 text-purple-700"
          />
          <div className="relative mt-3 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="count"
                  nameKey="role"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {roleData.map((entry: any, index: number) => (
                    <Cell key={entry.role} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111965",
                    border: "1px solid #1E277A",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#111965]">{roleTotal}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Users</span>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            {roleData.map((entry: any, index: number) => {
              const share = roleTotal ? Math.round((entry.count / roleTotal) * 100) : 0;
              return (
                <div key={entry.role} className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="flex items-center gap-2 font-semibold text-[#64748B]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    {entry.role.replace("_", " ")}
                  </span>
                  <span className="text-[#94A3B8]">
                    <strong className="text-[#111965]">{entry.count}</strong> · {share}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs xl:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#111965]">Top recommended majors</h3>
              <p className="text-[11px] text-[#94A3B8]">Most matched programs</p>
            </div>
            <span className="text-[11px] font-bold text-[#94A3B8]">
              {popularData.length} majors
            </span>
          </div>

          {popularData.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#68708A]">
              No recommendation activity yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-[#EEF2F7]">
              {popularData.map((major: any, index: number) => (
                <div
                  key={major.name}
                  className="flex items-center gap-3 py-2.5 transition-colors hover:bg-[#F8FAFD]"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                      index === 0
                        ? "bg-[#F7CE4D] text-[#111965]"
                        : "bg-[#F5F6FA] text-[#68708A]"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#171A2C]">
                    {major.name}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-[#94A3B8]">
                    {major.count} {major.count === 1 ? "match" : "matches"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs">
          <ChartCardHeader
            icon={Building2}
            title="Directory mix"
            subtitle="Live catalogue records"
            accent="bg-emerald-50 text-emerald-700"
            chip={`${totalContent} records`}
          />
          <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-[#F0F2FA]">
            {contentMix.map((item, index) => (
              <div
                key={item.name}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(item.value / Math.max(totalContent, 1)) * 100}%`,
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              />
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {contentMix.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-2 font-semibold text-[#64748B]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  {item.name}
                </span>
                <strong className="text-[#111965]">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Add university",
            hint: "Manage institutions",
            icon: Building2,
            tone: "bg-amber-50 text-amber-700",
            tab: "universities",
          },
          {
            label: "Add scholarship",
            hint: "Funding directory",
            icon: Award,
            tone: "bg-purple-50 text-purple-700",
            tab: "scholarships",
          },
          {
            label: "Manage users",
            hint: "Roles & access",
            icon: Users,
            tone: "bg-sky-50 text-sky-700",
            tab: "users",
          },
          {
            label: "Tune engine",
            hint: "Match weights",
            icon: Sliders,
            tone: "bg-emerald-50 text-emerald-700",
            tab: "engine",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => onNavigate(action.tab as AdminTab)}
              className="group flex items-center gap-3 rounded-2xl border border-[#E6E8F0] bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#111965]/20 hover:shadow-sm"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", action.tone)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-[#111965]">{action.label}</div>
                <div className="text-[10px] text-[#94A3B8]">{action.hint}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RulesPanel() {
  const { data: rules } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: async () => apiFetch<any[]>("/admin/rules"),
  });
  const activeRule = rules?.[0];

  if (!activeRule) {
    return (
      <div className="mx-auto max-w-5xl py-16 text-center text-xs text-[#68708A]">
        No recommendation rule is configured yet.
      </div>
    );
  }

  return (
    <RuleEditor key={activeRule.id} rule={activeRule} />
  );
}

function RuleEditor({ rule }: { rule: Record<string, any> }) {
  const queryClient = useQueryClient();
  const [weights, setWeights] = useState({
    weight_personality: Number(rule.weight_personality),
    weight_riasec: Number(rule.weight_riasec),
    weight_academic_strengths: Number(rule.weight_academic_strengths),
    weight_career_alignment: Number(rule.weight_career_alignment),
  });
  const [isActive, setIsActive] = useState(Boolean(rule.is_active));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const total = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalPercent = Math.round(total * 100);
  const isBalanced = Math.abs(total - 1) < 0.001;
  const difference = 100 - totalPercent;

  const { mutate: saveWeights, isPending } = useMutation({
    mutationFn: async () => {
      return apiFetch(`/admin/rules/${rule.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...weights, is_active: isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rules"] });
      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error: any) => {
      setSaved(false);
      setSaveError(error?.message || "Could not save these weights.");
    },
  });

  const pillars = [
    {
      key: "weight_personality",
      label: "16-Personality",
      hint: "Interests and working style",
      color: "#8B5CF6",
      tint: "bg-[#F5F3FF] text-[#6D28D9]",
    },
    {
      key: "weight_riasec",
      label: "RIASEC",
      hint: "Career interest profile",
      color: "#0EA5E9",
      tint: "bg-[#F0F9FF] text-[#0369A1]",
    },
    {
      key: "weight_academic_strengths",
      label: "Academic strengths",
      hint: "Grades and subject fit",
      color: "#10B981",
      tint: "bg-[#ECFDF5] text-[#047857]",
    },
    {
      key: "weight_career_alignment",
      label: "Career alignment",
      hint: "Long-term career direction",
      color: "#F59E0B",
      tint: "bg-[#FFFBEB] text-[#B45309]",
    },
  ] as const;

  const updateWeight = (
    key: (typeof pillars)[number]["key"],
    value: number
  ) => {
    setSaved(false);
    setSaveError(null);
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs">
      <div className="border-b border-[#E6E8F0] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#111965]/10 bg-[#F0F2FA] text-[#111965]">
            <Sliders className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#111965]">
              Recommendation engine
            </h2>
            <p className="mt-0.5 text-xs text-[#68708A]">
              Control how the four pillars contribute to the final major match
              score.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {pillars.map((pillar) => {
            const percent = Math.round(Number(weights[pillar.key]) * 100);
            return (
              <div key={pillar.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <label
                        htmlFor={`rule-${pillar.key}`}
                        className="text-xs font-bold text-[#111965]"
                      >
                        {pillar.label}
                      </label>
                    </div>
                    <p className="mt-0.5 pl-4 text-[10px] text-[#94A3B8]">
                      {pillar.hint}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-black tabular-nums",
                      pillar.tint
                    )}
                  >
                    {percent}%
                  </span>
                </div>

                <input
                  id={`rule-${pillar.key}`}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={weights[pillar.key]}
                  onChange={(event) =>
                    updateWeight(pillar.key, Number(event.target.value))
                  }
                  aria-label={`${pillar.label} weight`}
                  aria-valuetext={`${percent}%`}
                  style={{
                    background: `linear-gradient(to right, ${pillar.color} 0%, ${pillar.color} ${percent}%, #EEF2F7 ${percent}%, #EEF2F7 100%)`,
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#111965]/20 focus-visible:ring-offset-2 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#111965] [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#111965] [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>
            );
          })}
        </div>

        <aside className="space-y-3 lg:border-l lg:border-[#EEF2F7] lg:pl-6">
          <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                Total allocation
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                  isBalanced
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {totalPercent}%
              </span>
            </div>

            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-[#E8ECF4]">
              {pillars.map((pillar) => {
                const width = Number(weights[pillar.key]) * 100;
                if (width <= 0) return null;
                return (
                  <span
                    key={pillar.key}
                    className="h-full transition-[width] duration-150"
                    style={{
                      width: `${width}%`,
                      backgroundColor: pillar.color,
                    }}
                  />
                );
              })}
            </div>

            <p
              className={cn(
                "mt-2 text-[11px] leading-relaxed",
                isBalanced ? "text-emerald-700" : "text-amber-700"
              )}
            >
              {isBalanced
                ? "Balanced. All four pillars add up to 100%."
                : difference > 0
                ? `${difference}% unallocated. Adjust the sliders to reach 100%.`
                : `${Math.abs(difference)}% over. Adjust the sliders to reach 100%.`}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => {
              setSaved(false);
              setSaveError(null);
              setIsActive((prev) => !prev);
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
              isActive
                ? "border-[#111965]/15 bg-[#F8FAFD]"
                : "border-[#E6E8F0] bg-white"
            )}
          >
            <span className="min-w-0">
              <span className="block text-xs font-bold text-[#111965]">
                Rule active
              </span>
              <span className="mt-0.5 block text-[10px] text-[#94A3B8]">
                {isActive
                  ? "New matches use these weights."
                  : "New matches ignore this rule."}
              </span>
            </span>
            <span
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                isActive ? "bg-[#111965]" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  isActive ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => saveWeights()}
            disabled={isPending || !isBalanced}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] transition-colors hover:bg-[#E5BD3B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isPending ? "Saving…" : saved ? "Weights saved" : "Save weights"}
          </button>

          {saveError && (
            <p className="text-center text-[10px] font-semibold text-rose-600">
              {saveError}
            </p>
          )}
          <p className="text-center text-[10px] text-[#94A3B8]">
            Changes apply to newly generated recommendations.
          </p>
        </aside>
      </div>
    </div>
  );
}

function AuditLogPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => apiFetch<any[]>("/admin/audit-logs?limit=100"),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#111965]">Audit log</h2>
        <p className="text-xs text-[#68708A]">
          Recent administrator actions across content and accounts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading audit log…
        </div>
      ) : (logs || []).length === 0 ? (
        <div className="py-16 text-center text-xs text-[#68708A]">
          No admin actions have been recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E6E8F0]">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A]">
                <th className="px-4 py-3 font-bold">When</th>
                <th className="px-4 py-3 font-bold">Actor</th>
                <th className="px-4 py-3 font-bold">Action</th>
                <th className="px-4 py-3 font-bold">Resource</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log) => (
                <tr key={log.id} className="border-b border-[#E6E8F0] last:border-b-0">
                  <td className="px-4 py-3 text-[11px] text-[#68708A]">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#171A2C]">
                    {log.actor_email || "System"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-slate-600">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#111965]">
                    {log.target_resource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
