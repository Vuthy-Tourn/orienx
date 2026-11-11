"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  GraduationCap,
  Calendar,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Layers,
  Sparkles,
  FileText,
} from "lucide-react";
import { BookmarkButton } from "@/components/ui/bookmark-button";

export default function ScholarshipDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ["scholarship", slug],
    queryFn: async () => apiFetch<any>(`/scholarships/${slug}`),
    enabled: !!slug,
  });

  const { mutate: toggleTrack, isPending: isTracking } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/scholarships/${id}/track`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarship", slug] });
      alert(t("scholarshipDetail.savedAlert"));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center text-sm text-[#68708A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#111965] border-t-transparent rounded-full animate-spin" />
          <span>{t("scholarshipDetail.loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-4 bg-white p-8 rounded-3xl border border-[#E6E8F0] shadow-sm">
          <GraduationCap className="w-12 h-12 text-[#68708A] mx-auto" />
          <h2 className="text-xl font-bold text-[#111965]">
            {t("scholarshipDetail.notFound")}
          </h2>
          <p className="text-xs text-[#68708A]">
            {t("scholarshipDetail.notFoundDesc")}
          </p>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#111965] hover:bg-[#1E277A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("scholarshipDetail.backToScholarships")}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Official poster image lookup
  const posterMap: Record<string, string> = {
    "techo-digital-talent-scholarship": "/images/scholarships/techo-scholarship-poster.jpg",
    "aupp-merit-scholarship": "/images/scholarships/aupp-scholarship-poster.jpg",
    "moeys-national-scholarship": "/images/universities/rupp.jpg",
  };

  const posterImage = posterMap[scholarship.slug];

  const applicationSteps: string[] =
    (getLocalized(scholarship.application_process) as unknown as string[]) ||
    scholarship.application_process?.en ||
    [];

  const eligibilityCriteria: string[] =
    (getLocalized(scholarship.eligibility_criteria) as unknown as string[]) ||
    scholarship.eligibility_criteria?.en ||
    [];

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-8 lg:py-12 text-[#111965]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68708A] hover:text-[#111965] transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("scholarshipDetail.back")}</span>
          </button>

          <div className="text-xs text-[#68708A] flex items-center gap-2">
            <Link href="/" className="hover:underline">
              {t("scholarshipDetail.home")}
            </Link>
            <span>/</span>
            <Link href="/scholarships" className="hover:underline">
              {t("scholarshipDetail.scholarships")}
            </Link>
            <span>/</span>
            <span className="text-[#111965] font-semibold truncate max-w-[200px]">
              {getLocalized(scholarship.title)}
            </span>
          </div>
        </div>

        {/* ===================================================================
            HERO ANNOUNCEMENT BANNER
            =================================================================== */}
        <div className="bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {scholarship.is_verified
                    ? t("scholarshipDetail.verifiedOfficial")
                    : t("scholarshipDetail.unverified")}
                </span>
              </div>

              <div className="text-xs font-bold text-[#68708A] uppercase tracking-wider">
                {getLocalized(scholarship.provider)}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111965] leading-snug">
                {getLocalized(scholarship.title)}
              </h1>
            </div>

            {/* Coverage Tag */}
            <div className="shrink-0 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black bg-[#F7CE4D] text-[#111965] shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#111965]" />
                <span>
                  {scholarship.coverage_percentage
                    ? `${scholarship.coverage_percentage}% ${t("scholarshipDetail.fullCoverageTag")}`
                    : scholarship.coverage_type}
                </span>
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed max-w-3xl">
            {getLocalized(scholarship.description)}
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E6E8F0] space-y-0.5">
              <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider">
                {t("scholarshipDetail.institution")}
              </span>
              <div className="text-xs sm:text-sm font-bold text-[#111965] truncate">
                {scholarship.country_or_institution || "Cambodia"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E6E8F0] space-y-0.5">
              <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("scholarshipDetail.deadline")}</span>
              </span>
              <div className="text-xs sm:text-sm font-bold text-[#111965]">
                {scholarship.application_deadline || t("scholarshipDetail.rolling")}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E6E8F0] space-y-0.5">
              <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider">
                {t("scholarshipDetail.source")}
              </span>
              <div className="text-xs sm:text-sm font-bold text-[#111965] truncate">
                {scholarship.source_name || "Official Admissions"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E6E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {scholarship.official_url && (
                <a
                  href={scholarship.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs transition-all active:scale-98"
                >
                  <span>{t("scholarshipDetail.applyOfficial")}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <BookmarkButton
                entityType="scholarship"
                entityId={scholarship.id}
                variant="pill"
                size="md"
                showText
                textActive="បានរក្សាទុក (Saved)"
                textInactive={t("scholarshipDetail.track") || "រក្សាទុកអាហារូបករណ៍"}
              />
            </div>

            <Link
              href="/scholarships"
              className="text-xs sm:text-sm font-bold text-[#68708A] hover:text-[#111965] hover:underline"
            >
              {t("scholarshipDetail.exploreMore")}
            </Link>
          </div>
        </div>

        {/* ===================================================================
            OFFICIAL POSTER + APPLICATION STEPS GRID
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Poster image preview if available */}
          {posterImage && (
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#68708A] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#F69D0D]" />
                <span>{t("scholarshipDetail.posterTitle")}</span>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#E6E8F0] shadow-sm bg-slate-900 relative">
                <Image
                  src={posterImage}
                  alt={getLocalized(scholarship.title)}
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Right: Steps & Eligibility */}
          <div className={posterImage ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
            {/* 4 Application Steps */}
            {applicationSteps.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F69D0D]" />
                  <span>{t("scholarshipDetail.processTitle")}</span>
                </h3>

                <div className="space-y-3">
                  {applicationSteps.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E6E8F0] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#111965] text-white text-xs font-black grid place-items-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Criteria */}
            {eligibilityCriteria.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("scholarshipDetail.eligibilityTitle")}</span>
                </h3>

                <ul className="space-y-2">
                  {eligibilityCriteria.map((crit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#68708A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
