"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { cn, getErrorMessage } from "@/lib/utils";

interface EligibilityOffering {
  id: string;
  university_id: string;
  university_slug: string;
  university_name: Record<string, string>;
  university_acronym: Record<string, string>;
  university_logo_url?: string | null;
  university_province: string;
  major_id: string;
  major_slug: string;
  major_name: Record<string, string>;
  major_category: string;
  major_image_url?: string | null;
  degree_level: string;
  duration_years: number;
  tuition_annual_usd?: number | null;
  language_of_instruction: string;
  min_bacii_grade?: string | null;
  required_subjects?: string[] | null;
  is_admission_verified: boolean;
  admission_source_url?: string | null;
  admission_notes?: string | null;
  status: string;
  reason: string;
}

interface EligibilityData {
  grade: string;
  total_with_requirements: number;
  eligible: EligibilityOffering[];
  below_requirements: EligibilityOffering[];
  unverified_requirements: EligibilityOffering[];
  unverified_programs_count: number;
}

const GRADES = ["A", "B", "C", "D", "E", "F"];

function EligibilityCard({
  offering,
  tone,
  isKm,
  t,
  getLocalized,
}: {
  offering: EligibilityOffering;
  tone: "eligible" | "below" | "unverified";
  isKm: boolean;
  t: (path: string, fallback?: string) => string;
  getLocalized: (value?: { en?: string; km?: string } | null) => string;
}) {
  const Icon =
    tone === "eligible" ? BadgeCheck : tone === "below" ? ShieldAlert : AlertTriangle;
  const toneClass =
    tone === "eligible"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "below"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-600";
  const acceptsF = offering.min_bacii_grade === "F";
  const degreeLabel =
    offering.degree_level === "ASSOCIATE"
      ? t("eligibilityPage.associate")
      : offering.degree_level === "BACHELOR"
      ? t("eligibilityPage.bachelor")
      : offering.degree_level;

  return (
    <article className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] text-[#111965]">
          <GraduationCap className="h-5 w-5" />
          {offering.university_logo_url && (
            <img
              src={offering.university_logo_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
                acceptsF
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : toneClass
              )}
            >
              <Icon className="h-3 w-3" />
              {offering.min_bacii_grade
                ? acceptsF
                  ? t("eligibilityPage.acceptsF")
                  : `${t("eligibilityPage.minGrade")}: ${offering.min_bacii_grade}`
                : t("eligibilityPage.program")}
            </span>
            {!offering.is_admission_verified && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {t("eligibilityPage.unverifiedNote")}
              </span>
            )}
            <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[10px] font-bold text-[#68708A]">
              {degreeLabel}
            </span>
          </div>
          <h3 className="mt-1.5 line-clamp-1 text-sm font-black text-[#111965]">
            {getLocalized(offering.major_name)}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#68708A]">
            <Link
              href={`/universities/${offering.university_slug}`}
              className="font-semibold hover:text-[#111965] hover:underline"
            >
              {getLocalized(offering.university_name)}
            </Link>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {offering.university_province}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] font-semibold leading-relaxed text-[#475569]">
        {offering.reason}
      </p>

      {offering.admission_notes && (
        <p className="mt-2 rounded-xl bg-[#F8FAFD] px-3 py-2 text-[11px] leading-relaxed text-[#68708A]">
          {offering.admission_notes}
        </p>
      )}

      {offering.required_subjects?.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {offering.required_subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-md border border-[#E6E8F0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#475569]"
            >
              {subject}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#F0F2FA] pt-3 text-[11px] text-[#68708A]">
        <span>
          {t("eligibilityPage.duration")}:{" "}
          <strong className="text-[#111965]">
            {isKm ? `${offering.duration_years} ឆ្នាំ` : `${offering.duration_years} yrs`}
          </strong>
        </span>
        <span>
          {t("eligibilityPage.tuition")}:{" "}
          <strong className="text-[#111965]">
            {offering.tuition_annual_usd == null
              ? "—"
              : `$${Math.round(offering.tuition_annual_usd).toLocaleString("en-US")}`}
          </strong>
        </span>
        <Link
          href={`/universities/${offering.university_slug}`}
          className="ml-auto inline-flex items-center gap-1 font-bold text-[#111965] hover:underline"
        >
          {t("eligibilityPage.viewUniversity")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {offering.admission_source_url && (
        <a
          href={offering.admission_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline"
        >
          <ShieldCheck className="h-3 w-3" />
          {t("eligibilityPage.officialSource")}
        </a>
      )}
    </article>
  );
}

export default function EligibilityPage() {
  const { t, language, getLocalized } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState("");
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<
    "ALL" | "BACHELOR" | "ASSOCIATE" | "F"
  >("ALL");
  const didInitialize = useRef(false);

  const { data: profile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => apiFetch<any>("/students/profile"),
  });

  useEffect(() => {
    if (!didInitialize.current && profile) {
      setGrade(profile.bacii_grade || "");
      didInitialize.current = true;
    }
  }, [profile]);

  const { data, isLoading } = useQuery({
    queryKey: ["bacii-eligibility", grade],
    queryFn: async () =>
      apiFetch<EligibilityData>(`/admissions/eligibility?grade=${grade}`),
    enabled: Boolean(grade),
  });

  const { mutate: saveGrade, isPending: savingGrade } = useMutation({
    mutationFn: async () =>
      apiFetch("/students/profile", {
        method: "PUT",
        body: JSON.stringify({ bacii_grade: grade || null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["bacii-eligibility"] });
      toast.success(t("eligibilityPage.gradeSaved"));
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("eligibilityPage.gradeSaveError"))),
  });

  const eligible = data?.eligible ?? [];
  const below = data?.below_requirements ?? [];
  const unverified = data?.unverified_requirements ?? [];
  const needle = search.trim().toLowerCase();
  const matches = (offering: EligibilityOffering) => {
    if (!needle) return true;
    return [
      getLocalized(offering.university_name),
      getLocalized(offering.university_acronym),
      offering.university_slug,
      getLocalized(offering.major_name),
      offering.university_province,
      offering.major_category,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  };
  const matchesDegree = (offering: EligibilityOffering) => {
    if (degreeFilter === "ALL") return true;
    if (degreeFilter === "F") return offering.min_bacii_grade === "F";
    return offering.degree_level === degreeFilter;
  };
  const filteredEligible = eligible.filter(
    (offering) => matches(offering) && matchesDegree(offering)
  );
  const filteredBelow = below.filter(
    (offering) => matches(offering) && matchesDegree(offering)
  );
  const filteredUnverified = unverified.filter(
    (offering) => matches(offering) && matchesDegree(offering)
  );
  const allPrograms = [...eligible, ...below, ...unverified];
  const degreeCounts = {
    ALL: allPrograms.length,
    BACHELOR: allPrograms.filter(
      (offering) => offering.degree_level === "BACHELOR"
    ).length,
    ASSOCIATE: allPrograms.filter(
      (offering) => offering.degree_level === "ASSOCIATE"
    ).length,
    F: allPrograms.filter((offering) => offering.min_bacii_grade === "F")
      .length,
  };
  const eligibleBachelor = eligible.filter(
    (offering) => offering.degree_level === "BACHELOR"
  ).length;
  const eligibleAssociate = eligible.filter(
    (offering) => offering.degree_level === "ASSOCIATE"
  ).length;

  const handleExportReport = () => {
    if (!data || !grade) return;

    const rows: string[][] = [];
    const addRow = (
      ...cells: Array<string | number | null | undefined>
    ) => {
      rows.push(cells.map((cell) => (cell == null ? "" : String(cell))));
    };
    const csvCell = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const generatedAt = new Date();
    const scopeLabel =
      degreeFilter === "ALL"
        ? t("eligibilityPage.allLevels")
        : degreeFilter === "F"
        ? t("eligibilityPage.acceptsF")
        : degreeFilter === "BACHELOR"
        ? t("eligibilityPage.bachelor")
        : t("eligibilityPage.associate");
    const tableHeader = [
      t("eligibilityPage.reportStatus"),
      t("eligibilityPage.reportUniversity"),
      t("eligibilityPage.reportAcronym"),
      t("eligibilityPage.reportMajor"),
      t("eligibilityPage.reportDegree"),
      t("eligibilityPage.reportDuration"),
      t("eligibilityPage.reportTuition"),
      t("eligibilityPage.reportMinGrade"),
      t("eligibilityPage.reportNotes"),
      t("eligibilityPage.reportSource"),
    ];
    const degreeLabel = (level: string) =>
      level === "ASSOCIATE"
        ? t("eligibilityPage.associate")
        : level === "BACHELOR"
        ? t("eligibilityPage.bachelor")
        : level;

    addRow(t("eligibilityPage.reportTitle"));
    addRow(t("eligibilityPage.reportGrade"), grade);
    addRow(
      t("eligibilityPage.reportGenerated"),
      generatedAt.toLocaleString(isKm ? "km-KH" : "en-US")
    );
    addRow(t("eligibilityPage.reportScope"), scopeLabel);
    if (search.trim()) {
      addRow(t("eligibilityPage.reportSearch"), search.trim());
    }
    addRow("");
    addRow(t("eligibilityPage.reportSummary"));
    addRow(t("eligibilityPage.reportEligible"), filteredEligible.length);
    addRow(t("eligibilityPage.reportBelow"), filteredBelow.length);
    addRow(t("eligibilityPage.reportUnverified"), filteredUnverified.length);
    addRow(
      t("eligibilityPage.reportMissing"),
      data.unverified_programs_count
    );
    addRow("");
    addRow(t("eligibilityPage.degreeNote"));
    addRow("");

    const addSection = (
      title: string,
      items: EligibilityOffering[],
      status: string
    ) => {
      if (items.length === 0) return;
      addRow(title);
      addRow(...tableHeader);
      items.forEach((offering) => {
        addRow(
          status,
          getLocalized(offering.university_name),
          getLocalized(offering.university_acronym),
          getLocalized(offering.major_name),
          degreeLabel(offering.degree_level),
          offering.duration_years,
          offering.tuition_annual_usd ?? "",
          offering.min_bacii_grade ?? "",
          offering.admission_notes ?? "",
          offering.admission_source_url ?? ""
        );
      });
      addRow("");
    };

    addSection(
      t("eligibilityPage.reportEligible"),
      filteredEligible,
      t("eligibilityPage.reportStatusEligible")
    );
    addSection(
      t("eligibilityPage.reportBelow"),
      filteredBelow,
      t("eligibilityPage.reportStatusBelow")
    );
    addSection(
      t("eligibilityPage.reportUnverified"),
      filteredUnverified,
      t("eligibilityPage.reportStatusUnverified")
    );

    if (
      filteredEligible.length === 0 &&
      filteredBelow.length === 0 &&
      filteredUnverified.length === 0
    ) {
      addRow(t("eligibilityPage.noMatches"));
    }

    const csv = `\uFEFF${rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orienx-bacii-report-${grade}-${generatedAt
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(t("eligibilityPage.reportExported"));
  };

  return (
    <div data-dashboard-page="sections" className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[#111965]">
          <GraduationCap className="h-5 w-5 text-[#F69D0D]" />
          <h1 className="text-xl font-black tracking-tight sm:text-3xl">
            {t("eligibilityPage.title")}
          </h1>
        </div>
        <p className="mt-1 text-xs text-[#68708A] sm:text-sm">
          {t("eligibilityPage.subtitle")}
        </p>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          {t("eligibilityPage.disclaimer")}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <div className="text-xs font-black text-[#111965]">
              {t("eligibilityPage.gradeLabel")}
            </div>
            <p className="mt-0.5 text-[11px] text-[#68708A]">
              {t("eligibilityPage.gradeHint")}
            </p>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={grade}
                onChange={setGrade}
                options={[
                  { value: "", label: t("eligibilityPage.gradeNotSet") },
                  ...GRADES.map((value) => ({ value, label: value })),
                ]}
                label={t("eligibilityPage.gradeLabel")}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => saveGrade()}
              disabled={!grade || savingGrade}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#111965] px-4 text-xs font-black text-white transition-colors hover:bg-[#1E277A] disabled:opacity-50"
            >
              {savingGrade ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {savingGrade
                ? t("eligibilityPage.savingGrade")
                : t("eligibilityPage.saveGrade")}
            </button>
            <button
              type="button"
              onClick={handleExportReport}
              disabled={!data || !grade}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEEA] bg-white px-4 text-xs font-black text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-[#F8FAFD] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t("eligibilityPage.exportReport")}
            </button>
          </div>
        </div>
      </div>

      {!grade ? (
        <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965]">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-black text-[#111965]">
            {t("eligibilityPage.noGradeTitle")}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#68708A]">
            {t("eligibilityPage.noGradeBody")}
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-xs text-[#68708A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading", "Loading...")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: t("eligibilityPage.eligible"),
                value: eligible.length,
                icon: CheckCircle2,
                className: "bg-emerald-50 text-emerald-600",
                hint: `${eligibleBachelor} ${t(
                  "eligibilityPage.bachelor"
                ).toLowerCase()} · ${eligibleAssociate} ${t(
                  "eligibilityPage.associate"
                ).toLowerCase()}`,
              },
              {
                label: t("eligibilityPage.below"),
                value: below.length,
                icon: ShieldAlert,
                className: "bg-amber-50 text-amber-600",
                hint: "",
              },
              {
                label: t("eligibilityPage.unverified"),
                value: unverified.length,
                icon: AlertTriangle,
                className: "bg-slate-100 text-slate-600",
                hint: "",
              },
              {
                label: t("eligibilityPage.missing"),
                value: data?.unverified_programs_count ?? 0,
                icon: BookOpen,
                className: "bg-[#F0F2FA] text-[#111965]",
                hint: "",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-2xs"
                >
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", stat.className)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="mt-2 text-2xl font-black tabular-nums text-[#111965]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-semibold text-[#68708A]">
                    {stat.label}
                  </div>
                  {stat.hint ? (
                    <div className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">
                      {stat.hint}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-[#E6E8F0] bg-white px-4 py-3 text-[11px] leading-relaxed text-[#68708A]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#111965]" />
            <p>{t("eligibilityPage.degreeNote")}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("eligibilityPage.searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-white pl-9 pr-3 text-xs text-[#171A2C] outline-none focus:border-[#111965]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["ALL", "BACHELOR", "ASSOCIATE", "F"] as const).map((level) => {
                const label =
                  level === "ALL"
                    ? t("eligibilityPage.allLevels")
                    : level === "BACHELOR"
                    ? t("eligibilityPage.bachelor")
                    : level === "ASSOCIATE"
                    ? t("eligibilityPage.associate")
                    : t("eligibilityPage.acceptsF");
                const active = degreeFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDegreeFilter(level)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-colors",
                      active
                        ? "border-[#111965] bg-[#111965] text-white"
                        : "border-[#E6E8F0] bg-white text-[#475569] hover:border-[#111965]/40 hover:text-[#111965]"
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-[#F0F2FA] text-[#68708A]"
                      )}
                    >
                      {degreeCounts[level]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {data && data.total_with_requirements === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h2 className="mt-3 text-base font-black text-[#111965]">
                {t("eligibilityPage.noRequirementsTitle")}
              </h2>
              <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-[#68708A]">
                {t("eligibilityPage.noRequirementsBody")}
              </p>
              <p className="mt-3 text-[11px] font-semibold text-[#94A3B8]">
                {t("eligibilityPage.missingDesc").replace(
                  "{count}",
                  String(data.unverified_programs_count)
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEligible.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-base font-black text-[#111965]">
                      {t("eligibilityPage.eligible")}
                    </h2>
                    <p className="text-[11px] text-[#68708A]">
                      {t("eligibilityPage.eligibleDesc")}
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredEligible.map((offering) => (
                      <EligibilityCard
                        key={offering.id}
                        offering={offering}
                        tone="eligible"
                        isKm={isKm}
                        t={t}
                        getLocalized={getLocalized}
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredBelow.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-base font-black text-[#111965]">
                      {t("eligibilityPage.below")}
                    </h2>
                    <p className="text-[11px] text-[#68708A]">
                      {t("eligibilityPage.belowDesc")}
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredBelow.map((offering) => (
                      <EligibilityCard
                        key={offering.id}
                        offering={offering}
                        tone="below"
                        isKm={isKm}
                        t={t}
                        getLocalized={getLocalized}
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredUnverified.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-base font-black text-[#111965]">
                      {t("eligibilityPage.unverified")}
                    </h2>
                    <p className="text-[11px] text-[#68708A]">
                      {t("eligibilityPage.unverifiedDesc")}
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredUnverified.map((offering) => (
                      <EligibilityCard
                        key={offering.id}
                        offering={offering}
                        tone="unverified"
                        isKm={isKm}
                        t={t}
                        getLocalized={getLocalized}
                      />
                    ))}
                  </div>
                </section>
              )}

              {(needle || degreeFilter !== "ALL") &&
                filteredEligible.length === 0 &&
                filteredBelow.length === 0 &&
                filteredUnverified.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#D9DEEA] bg-white px-4 py-10 text-center text-xs text-[#68708A]">
                    {t("eligibilityPage.noMatches")}
                  </div>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
