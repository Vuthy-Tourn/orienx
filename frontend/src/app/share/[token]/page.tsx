"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Printer,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Logo } from "@/components/layout/logo";
import type {
  SharedReport,
  SharedReportPlan,
  SharedReportRecommendation,
} from "@/lib/shared-report-types";

const STATUS_LABELS: Record<string, { en: string; km: string }> = {
  RESEARCHING: { en: "Researching", km: "កំពុងស្រាវជ្រាវ" },
  PREPARING: { en: "Preparing", km: "កំពុងត្រៀម" },
  SUBMITTED: { en: "Submitted", km: "បានដាក់ពាក្យ" },
  INTERVIEW: { en: "Interview", km: "សម្ភាសន៍" },
  ACCEPTED: { en: "Accepted", km: "បានទទួលយក" },
  WAITLISTED: { en: "Waitlisted", km: "បញ្ជីរង់ចាំ" },
  REJECTED: { en: "Rejected", km: "មិនបានទទួលយក" },
};

const DEGREE_LABELS: Record<string, { en: string; km: string }> = {
  GRADE_12: { en: "Grade 12", km: "ថ្នាក់ទី១២" },
  BACHELOR: { en: "Bachelor", km: "បរិញ្ញាបត្រ" },
  ASSOCIATE: { en: "Associate", km: "បរិញ្ញាបត្ររង" },
};

function formatDate(value: string | null | undefined, isKm: boolean) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(isKm ? "km-KH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function SharedReportPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === "string" ? params.token : params.token?.[0];

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["shared-report", token],
    queryFn: async () => apiFetch<SharedReport>(`/reports/shared/${token}`),
    enabled: Boolean(token),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[#E6E8F0] bg-white px-5 py-4 text-xs font-semibold text-[#68708A] shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#111965]" />
          Loading report…
        </div>
      </div>
    );
  }

  if (!report) {
    const message = String((error as Error)?.message || "");
    const expired = message.includes("410") || /expired/i.test(message);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC] px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#E6E8F0] bg-white p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#111965]" />
          <h1 className="mt-3 text-lg font-black text-[#111965]">
            {expired ? "This report link has expired" : "Report link unavailable"}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-[#68708A]">
            {expired
              ? "Ask the student to create a new share link from their OrienX dashboard."
              : "This link may have been revoked or the address is incorrect."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-9 items-center rounded-xl bg-[#111965] px-4 text-[11px] font-black text-white"
          >
            Go to OrienX
          </Link>
        </div>
      </div>
    );
  }

  const isKm = report.language === "km";
  const t = {
    eyebrow: isKm ? "របាយការណ៍ណែនាំ OrienX" : "OrienX guidance report",
    title: isKm
      ? "របាយការណ៍សម្រាប់មាតាបិតា និងទីប្រឹក្សា"
      : "Parent & counselor report",
    preparedFor: isKm ? "រៀបចំសម្រាប់" : "Prepared for",
    parent: isKm ? "មាតាបិតា / អ្នកអាណាព្យាបាល" : "Parent / guardian",
    counselor: isKm ? "ទីប្រឹក្សា" : "Counselor",
    other: isKm ? "អ្នកទទួល" : "Recipient",
    generated: isKm ? "បង្កើតនៅ" : "Generated",
    expires: isKm ? "តំណផុតកំណត់" : "Link expires",
    print: isKm ? "បោះពុម្ព" : "Print",
    student: isKm ? "ប្រវត្តិសិស្ស" : "Student profile",
    school: isKm ? "វិទ្យាល័យ" : "High school",
    province: isKm ? "ខេត្ត/រាជធានី" : "Province",
    grade: isKm ? "កម្រិតសិក្សា" : "Education level",
    bacii: isKm ? "ពិន្ទុ BACII" : "BACII grade",
    assessments: isKm ? "លទ្ធផលវាយតម្លៃ" : "Assessment results",
    personality: isKm ? "បុគ្គលិកលក្ខណៈ MBTI" : "MBTI personality",
    riasec: isKm ? "ចំណាប់អារម្មណ៍ RIASEC" : "RIASEC interests",
    preferences: isKm ? "ចំណូលចិត្តសិក្សា" : "Academic preferences",
    strengths: isKm ? "ចំណុចខ្លាំង" : "Strengths",
    bestFields: isKm ? "វិស័យសាកសម" : "Best-fit fields",
    learningStyle: isKm ? "របៀបរៀន" : "Learning style",
    recommendations: isKm ? "ការណែនាំជំនាញ" : "Major recommendations",
    fit: isKm ? "ភាពស៊ីគ្នា" : "Fit",
    universities: isKm ? "សាកលវិទ្យាល័យ" : "Universities",
    plans: isKm ? "ផែនការដាក់ពាក្យ" : "Application plans",
    deadline: isKm ? "កាលកំណត់" : "Deadline",
    documents: isKm ? "ឯកសារ" : "Documents",
    nextAction: isKm ? "ជំហានបន្ទាប់" : "Next action",
    eligibility: isKm ? "ឱកាសចូលរៀនតាម BACII" : "BACII eligibility",
    withinReach: isKm ? "កម្មវិធីក្នុងលទ្ធភាព" : "Programs within reach",
    higher: isKm ? "ត្រូវការពិន្ទុខ្ពស់ជាង" : "Higher requirement",
    bachelor: isKm ? "បរិញ្ញាបត្រ" : "Bachelor",
    associate: isKm ? "បរិញ្ញាបត្ររង" : "Associate",
    note: isKm ? "សារពីសិស្ស" : "Note from the student",
    noData: isKm ? "មិនមានទិន្នន័យទេ។" : "No data available.",
    footer: isKm
      ? "បង្កើតដោយ OrienX។ តំណនេះជាឯកជន ហើយបង្ហាញតែផ្នែកដែលសិស្សបានជ្រើសរើសប៉ុណ្ណោះ។"
      : "Generated by OrienX. This private link only shows the sections the student chose to share.",
    privacy: isKm
      ? "ព័ត៌មានទំនាក់ទំនង និងគណនីមិនត្រូវបានចែករំលែកទេ។"
      : "Contact details and account information are not shared.",
    noGrade: isKm ? "មិនទាន់បញ្ចូលពិន្ទុ" : "Not provided",
  };

  const audienceLabel =
    report.audience === "COUNSELOR"
      ? t.counselor
      : report.audience === "OTHER"
        ? t.other
        : t.parent;

  const educationLabel =
    DEGREE_LABELS[report.student.current_education_level || ""]?.[
      isKm ? "km" : "en"
    ] || report.student.current_education_level || "—";

  return (
    <div className="min-h-screen bg-[#F4F7FC] px-3 py-5 sm:px-6 sm:py-8 print:bg-white print:p-0">
      <main className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white shadow-xl print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-[#E6E8F0] bg-[#F8FAFD] px-5 py-4 sm:px-8 print:bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Logo />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 text-[10.5px] font-black text-white hover:bg-[#1E277A] print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              {t.print}
            </button>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="border-b border-[#E6E8F0] pb-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#B45309]">
              <Sparkles className="h-3.5 w-3.5" />
              {t.eyebrow}
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#111965] sm:text-3xl">
              {t.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] font-semibold text-[#68708A]">
              <span>
                {t.preparedFor} {audienceLabel}
              </span>
              <span className="text-[#D9DEEA]">·</span>
              <span>
                {t.generated} {formatDate(report.generated_at, isKm)}
              </span>
              <span className="text-[#D9DEEA]">·</span>
              <span>
                {t.expires} {formatDate(report.expires_at, isKm)}
              </span>
            </div>
          </div>

          <section className="mt-5">
            <div className="flex items-center gap-2 text-sm font-black text-[#111965]">
              <GraduationCap className="h-4 w-4 text-[#B45309]" />
              {t.student}
            </div>
            <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 sm:flex-row sm:items-center">
              {report.student.avatar_url ? (
                <img
                  src={report.student.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111965] text-lg font-black text-[#F7CE4D]">
                  {initials(report.student.name) || "S"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-lg font-black text-[#111965]">
                  {report.student.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] font-semibold text-[#68708A]">
                  <span className="inline-flex items-center gap-1">
                    <School className="h-3 w-3" />
                    {report.student.high_school || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.student.province || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    {educationLabel}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-[#F7CE4D]/50 bg-[#FFF9E6] px-4 py-2 text-center">
                <div className="text-[9px] font-black uppercase tracking-wider text-[#8A5A00]">
                  {t.bacii}
                </div>
                <div className="text-xl font-black text-[#B45309]">
                  {report.student.bacii_grade || t.noGrade}
                </div>
              </div>
            </div>
          </section>

          {report.assessments && (
            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-black text-[#111965]">
                <TrendingUp className="h-4 w-4 text-[#B45309]" />
                {t.assessments}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E6E8F0] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                    <Users className="h-3.5 w-3.5" />
                    {t.personality}
                  </div>
                  {report.assessments.personality ? (
                    <>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-black text-[#111965]">
                          {report.assessments.personality.type}
                        </span>
                        <span className="pb-1 text-[11px] font-bold text-[#B45309]">
                          {report.assessments.personality.summary?.title ||
                            report.assessments.personality.summary?.role ||
                            ""}
                        </span>
                      </div>
                      {report.assessments.personality.summary?.tagline && (
                        <p className="mt-1 text-[10.5px] leading-relaxed text-[#68708A]">
                          {report.assessments.personality.summary.tagline}
                        </p>
                      )}
                      <div className="mt-3">
                        <div className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                          {t.strengths}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {(report.assessments.personality.summary?.strengths || [])
                            .slice(0, 5)
                            .map((item) => (
                              <span
                                key={item}
                                className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#475569]"
                              >
                                {item}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-[10.5px] text-[#94A3B8]">{t.noData}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#E6E8F0] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                    <Target className="h-3.5 w-3.5" />
                    {t.riasec}
                  </div>
                  {report.assessments.riasec ? (
                    <>
                      <div className="mt-2 text-3xl font-black tracking-[0.18em] text-[#111965]">
                        {report.assessments.riasec.code}
                      </div>
                      {report.assessments.riasec.summary?.interpretation && (
                        <p className="mt-1 text-[10.5px] leading-relaxed text-[#68708A]">
                          {report.assessments.riasec.summary.interpretation}
                        </p>
                      )}
                      <div className="mt-3 space-y-1.5">
                        {Object.entries(report.assessments.riasec.scores || {}).map(
                          ([code, score]) => (
                            <div key={code} className="flex items-center gap-2">
                              <span className="w-3 text-[9px] font-black text-[#475569]">
                                {code}
                              </span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0F2FA]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D]"
                                  style={{ width: `${Math.min(100, score)}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-[9px] font-bold text-[#68708A]">
                                {Math.round(score)}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-[10.5px] text-[#94A3B8]">{t.noData}</p>
                  )}
                </div>
              </div>

              {report.assessments.preferences && (
                <div className="mt-3 rounded-2xl border border-[#E6E8F0] p-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                    {t.preferences}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      ...(report.assessments.preferences.favorite_subjects || []),
                      ...(report.assessments.preferences.strongest_subjects || []),
                      ...(report.assessments.preferences.preferred_locations || []),
                    ]
                      .filter(Boolean)
                      .slice(0, 12)
                      .map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[9.5px] font-semibold text-[#475569]"
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-black text-[#111965]">
                <Award className="h-4 w-4 text-[#B45309]" />
                {t.recommendations}
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#E6E8F0]">
                <table className="w-full text-left text-[10.5px]">
                  <thead className="bg-[#F8FAFD] text-[9px] font-black uppercase tracking-wider text-[#68708A]">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">{t.recommendations}</th>
                      <th className="px-3 py-2 text-right">{t.fit}</th>
                      <th className="px-3 py-2 text-right">{t.universities}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2FA]">
                    {report.recommendations.map(
                      (item: SharedReportRecommendation, index) => (
                        <tr key={`${item.major}-${index}`}>
                          <td className="px-3 py-2.5 font-black text-[#B45309]">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-black text-[#111965]">
                              {item.major}
                            </div>
                            <div className="text-[9.5px] text-[#68708A]">
                              {item.category}
                            </div>
                            {item.summary && (
                              <div className="mt-0.5 text-[9.5px] leading-relaxed text-[#94A3B8]">
                                {item.summary}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="inline-flex rounded-md bg-[#F7CE4D] px-2 py-0.5 text-[10px] font-black text-[#111965]">
                              {item.fit}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-[#475569]">
                            {item.universities}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {report.plans && report.plans.length > 0 && (
            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-black text-[#111965]">
                <FileText className="h-4 w-4 text-[#B45309]" />
                {t.plans}
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {report.plans.map((plan: SharedReportPlan) => {
                  const progress =
                    plan.required_total > 0
                      ? Math.round(
                          (plan.required_completed / plan.required_total) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-[#E6E8F0] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#B45309]">
                            {plan.kind === "SCHOLARSHIP"
                              ? isKm
                                ? "អាហារូបករណ៍"
                                : "Scholarship"
                              : isKm
                                ? "សាកលវិទ្យាល័យ"
                                : "University"}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] font-black text-[#111965]">
                            {plan.title}
                          </div>
                        </div>
                        <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-1.5 py-0.5 text-[8.5px] font-black uppercase text-[#68708A]">
                          {STATUS_LABELS[plan.status]?.[isKm ? "km" : "en"] ||
                            plan.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] font-semibold text-[#68708A]">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-2.5 w-2.5" />
                          {plan.deadline
                            ? formatDate(plan.deadline, isKm)
                            : isKm
                              ? "គ្មានកាលកំណត់"
                              : "No deadline"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {plan.required_completed}/{plan.required_total}{" "}
                          {t.documents}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0F2FA]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {plan.next_action && (
                        <div className="mt-2 text-[9.5px] text-[#475569]">
                          <span className="font-black text-[#111965]">
                            {t.nextAction}:
                          </span>{" "}
                          {plan.next_action}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {report.eligibility && (
            <section className="mt-7">
              <div className="flex items-center gap-2 text-sm font-black text-[#111965]">
                <ShieldCheck className="h-4 w-4 text-[#B45309]" />
                {t.eligibility}
              </div>
              <div className="mt-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
                {report.eligibility.available ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border border-[#F7CE4D]/50 bg-[#FFF9E6] px-3 py-2 text-center">
                        <div className="text-[9px] font-black uppercase tracking-wider text-[#8A5A00]">
                          {t.bacii}
                        </div>
                        <div className="text-xl font-black text-[#B45309]">
                          {report.eligibility.grade}
                        </div>
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-xl border border-[#E6E8F0] bg-white px-2.5 py-2">
                          <div className="text-lg font-black text-[#111965]">
                            {report.eligibility.within_reach}
                          </div>
                          <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#68708A]">
                            {t.withinReach}
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#E6E8F0] bg-white px-2.5 py-2">
                          <div className="text-lg font-black text-[#111965]">
                            {report.eligibility.higher_requirement}
                          </div>
                          <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#68708A]">
                            {t.higher}
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#E6E8F0] bg-white px-2.5 py-2">
                          <div className="text-lg font-black text-[#111965]">
                            {report.eligibility.bachelor_within_reach}
                          </div>
                          <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#68708A]">
                            {t.bachelor}
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#E6E8F0] bg-white px-2.5 py-2">
                          <div className="text-lg font-black text-[#111965]">
                            {report.eligibility.associate_within_reach}
                          </div>
                          <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#68708A]">
                            {t.associate}
                          </div>
                        </div>
                      </div>
                    </div>
                    {report.eligibility.note && (
                      <p className="mt-2 text-[9.5px] text-[#68708A]">
                        {report.eligibility.note}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-[#68708A]">
                    {report.eligibility.message || t.noData}
                  </p>
                )}
              </div>
            </section>
          )}

          {report.note && (
            <section className="mt-7 rounded-2xl border border-[#F7CE4D]/50 bg-[#FFF9E6] p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#8A5A00]">
                {t.note}
              </div>
              <p className="mt-1.5 whitespace-pre-line text-[11px] leading-relaxed text-[#475569]">
                {report.note}
              </p>
            </section>
          )}

          <footer className="mt-8 border-t border-[#E6E8F0] pt-4 text-[9.5px] leading-relaxed text-[#94A3B8]">
            <p>{t.footer}</p>
            <p className="mt-1">{t.privacy}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
