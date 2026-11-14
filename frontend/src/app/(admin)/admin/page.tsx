"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Menu,
  Save,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  { key: "established_year", label: "Established year", type: "number" },
  { key: "tuition_range_min_usd", label: "Min tuition (USD)", type: "number" },
  { key: "tuition_range_max_usd", label: "Max tuition (USD)", type: "number" },
  { key: "is_tuition_verified", label: "Tuition verified", type: "checkbox" },
  { key: "is_verified", label: "University verified", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const UNIVERSITY_COLUMNS: AdminColumn[] = [
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
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const MAJOR_COLUMNS: AdminColumn[] = [
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
  { key: "coverage_percentage", label: "Coverage %", type: "number" },
  { key: "country_or_institution", label: "Country / institution", required: true },
  { key: "application_deadline", label: "Deadline", type: "date" },
  { key: "official_url", label: "Official URL", required: true },
  { key: "source_name", label: "Source name" },
  { key: "is_verified", label: "Verified", type: "checkbox", defaultValue: true },
  { key: "description_en", label: "Description (English)", type: "textarea", wide: true },
  { key: "description_km", label: "Description (Khmer)", type: "textarea", wide: true },
];

const SCHOLARSHIP_COLUMNS: AdminColumn[] = [
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
            <div className="rounded-3xl border border-[#E6E8F0] bg-white p-4 shadow-2xs sm:p-6">
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

function OverviewPanel({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { getLocalized } = useLanguage();
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
    { label: "Students", value: analytics?.total_students ?? 0, icon: Users, tone: "bg-sky-50 text-sky-700" },
    { label: "Universities", value: analytics?.total_universities ?? 0, icon: Building2, tone: "bg-amber-50 text-amber-700" },
    { label: "Majors", value: analytics?.total_majors ?? 0, icon: BookOpen, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Careers", value: analytics?.total_careers ?? 0, icon: Briefcase, tone: "bg-indigo-50 text-indigo-700" },
    { label: "Scholarships", value: analytics?.total_scholarships ?? 0, icon: Award, tone: "bg-purple-50 text-purple-700" },
    { label: "Recommendations", value: analytics?.generated_recommendations_count ?? 0, icon: TrendingUp, tone: "bg-rose-50 text-rose-700" },
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
        name: String(label).length > 26 ? `${String(label).slice(0, 26)}…` : label,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-[#E6E8F0] p-3.5">
              <div className={cn("mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg", card.tone)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-black tabular-nums text-[#111965]">{card.value}</div>
              <div className="text-[11px] font-semibold text-[#68708A]">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] p-4 xl:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-black text-[#111965]">Platform activity</h3>
            <span className="text-[11px] font-semibold text-[#94A3B8]">Last 6 months</span>
          </div>
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRegGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminAssessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7CE4D" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F7CE4D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminRecGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#94A3B8" strokeOpacity={0.18} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111965",
                    border: "1px solid #1E277A",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#F7CE4D", fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: "#94A3B8" }}>{value}</span>} />
                <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#6366F1" strokeWidth={2.2} fill="url(#adminRegGradient)" />
                <Area type="monotone" dataKey="assessments" name="Assessments" stroke="#F7CE4D" strokeWidth={2.2} fill="url(#adminAssessGradient)" />
                <Area type="monotone" dataKey="recommendations" name="Recommendations" stroke="#10B981" strokeWidth={2.2} fill="url(#adminRecGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E8F0] p-4">
          <h3 className="text-sm font-black text-[#111965]">Users by role</h3>
          <div className="mt-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="count" nameKey="role" innerRadius={54} outerRadius={82} paddingAngle={3}>
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
                <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: "#94A3B8" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] p-4 xl:col-span-2">
          <h3 className="text-sm font-black text-[#111965]">Most recommended majors</h3>
          <div className="mt-2 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularData} layout="vertical" margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={190} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111965",
                    border: "1px solid #1E277A",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Matches" radius={[0, 6, 6, 0]} barSize={16}>
                  {popularData.map((entry: any, index: number) => (
                    <Cell key={entry.name} fill={index === 0 ? "#F7CE4D" : "#6366F1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E8F0] p-4">
          <h3 className="text-sm font-black text-[#111965]">Directory mix</h3>
          <div className="mt-2 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contentMix} dataKey="value" nameKey="name" innerRadius={46} outerRadius={76} paddingAngle={3}>
                  {contentMix.map((entry: any, index: number) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
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
                <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: "#94A3B8" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#68708A]">
          <span>
            16-Personality completed:{" "}
            <strong className="text-[#111965]">{analytics?.completed_personality_assessments ?? 0}</strong>
          </span>
          <span>
            RIASEC completed:{" "}
            <strong className="text-[#111965]">{analytics?.completed_riasec_assessments ?? 0}</strong>
          </span>
          <span>
            Recommendations:{" "}
            <strong className="text-[#111965]">{analytics?.generated_recommendations_count ?? 0}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate("users")}
            className="rounded-lg border border-[#E6E8F0] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#111965] hover:bg-[#F0F2FA]"
          >
            Manage users
          </button>
          <button
            type="button"
            onClick={() => onNavigate("engine")}
            className="rounded-lg border border-[#E6E8F0] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#111965] hover:bg-[#F0F2FA]"
          >
            Tune the engine
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesPanel() {
  const queryClient = useQueryClient();
  const { data: rules } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: async () => apiFetch<any[]>("/admin/rules"),
  });
  const activeRule = rules?.[0];
  const [weights, setWeights] = useState({
    weight_personality: 0.25,
    weight_riasec: 0.3,
    weight_academic_strengths: 0.25,
    weight_career_alignment: 0.2,
  });
  const [isActive, setIsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeRule) {
      setWeights({
        weight_personality: Number(activeRule.weight_personality),
        weight_riasec: Number(activeRule.weight_riasec),
        weight_academic_strengths: Number(activeRule.weight_academic_strengths),
        weight_career_alignment: Number(activeRule.weight_career_alignment),
      });
      setIsActive(Boolean(activeRule.is_active));
    }
  }, [activeRule]);

  const total = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);

  const { mutate: saveWeights, isPending } = useMutation({
    mutationFn: async () => {
      if (!activeRule) return;
      return apiFetch(`/admin/rules/${activeRule.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...weights, is_active: isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rules"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!activeRule) {
    return (
      <div className="py-16 text-center text-xs text-[#68708A]">
        No recommendation rule is configured yet.
      </div>
    );
  }

  const pillars = [
    { key: "weight_personality", label: "16-Personality", color: "bg-purple-500" },
    { key: "weight_riasec", label: "RIASEC", color: "bg-sky-500" },
    { key: "weight_academic_strengths", label: "Academic strengths", color: "bg-emerald-500" },
    { key: "weight_career_alignment", label: "Career alignment", color: "bg-amber-500" },
  ] as const;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-black text-[#111965]">Recommendation engine</h2>
        <p className="text-xs text-[#68708A]">
          Control how the four pillars contribute to the final major match score.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
          Weights saved. New recommendations will use this rule.
        </div>
      )}

      <div className="space-y-4">
        {pillars.map((pillar) => (
          <label key={pillar.key} className="block space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111965]">{pillar.label}</span>
              <span className="font-black tabular-nums text-[#111965]">
                {Math.round(Number(weights[pillar.key]) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={weights[pillar.key]}
              onChange={(event) =>
                setWeights((prev) => ({ ...prev, [pillar.key]: Number(event.target.value) }))
              }
              className="w-full accent-[#111965]"
            />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", pillar.color)}
                style={{ width: `${Number(weights[pillar.key]) * 100}%` }}
              />
            </div>
          </label>
        ))}
      </div>

      <div
        className={cn(
          "flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold",
          Math.abs(total - 1) < 0.001
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        )}
      >
        <span>Total weight</span>
        <span className="tabular-nums">{Math.round(total * 100)}%</span>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-[#E6E8F0] px-3 py-2.5 text-xs font-bold text-[#111965]">
        <span>Rule active</span>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4 accent-[#111965]"
        />
      </label>

      <button
        type="button"
        onClick={() => saveWeights()}
        disabled={isPending || Math.abs(total - 1) > 0.001}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] hover:bg-[#E5BD3B] disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {isPending ? "Saving…" : "Save weights"}
      </button>
      {Math.abs(total - 1) > 0.001 && (
        <p className="text-[11px] font-bold text-amber-700">
          Weights must add up to 100% before saving.
        </p>
      )}
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
