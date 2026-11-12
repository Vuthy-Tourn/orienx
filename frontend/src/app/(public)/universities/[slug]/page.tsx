"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  DollarSign,
  Building2,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { t, getLocalized } = useLanguage();

  const {
    data: uni,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["university", slug],
    queryFn: async () => apiFetch<any>(`/universities/${slug}`),
    enabled: !!slug,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="bg-white rounded-3xl p-8 border border-[#E6E8F0] space-y-6">
            <div className="flex gap-4 items-center">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
            <WifiOff className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-[#111965]">University Not Found</h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              We couldn't load this university profile. Please check your connection or try again.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reqs = getLocalized(uni.admission_requirements) || uni.admission_requirements?.en || [];
  const reqList = Array.isArray(reqs) ? reqs : [];
  const facs = getLocalized(uni.facilities) || uni.facilities?.en || [];
  const facList = Array.isArray(facs) ? facs : [];

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("universityDetail.back")}</span>
        </button>

        {/* Institution Header Card */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    uni.university_type === "PUBLIC"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-purple-50 text-purple-800 border border-purple-200"
                  }`}
                >
                  {uni.university_type === "PUBLIC"
                    ? t("universityDetail.publicType")
                    : t("universityDetail.privateType")}
                </span>

                {uni.is_tuition_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t("universityDetail.verifiedTuition")}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] leading-snug">
                {getLocalized(uni.name)}
              </h1>
              <div className="text-sm font-bold text-[#68708A] uppercase tracking-wider">
                {getLocalized(uni.acronym)} • Established {uni.established_year || "1960"}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start flex-wrap">
              <BookmarkButton
                entityType="university"
                entityId={uni.id}
                variant="pill"
                size="md"
                showText
                textActive="បានរក្សាទុក (Saved)"
                textInactive="រក្សាទុកសាកលវិទ្យាល័យ"
              />

              {uni.website_url && (
                <a
                  href={uni.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs cursor-pointer"
                >
                  <span>{t("universityDetail.officialWebsite")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-[#171A2C] leading-relaxed">
            {getLocalized(uni.description)}
          </p>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {t("universityDetail.annualTuition")}
              </div>
              <div className="text-base font-extrabold text-[#111965] mt-0.5">
                {uni.tuition_range_min_usd !== null
                  ? `$${Math.round(uni.tuition_range_min_usd)} – $${Math.round(
                      uni.tuition_range_max_usd || uni.tuition_range_min_usd
                    )} / yr`
                  : "Information not available"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {t("universityDetail.location")}
              </div>
              <div className="text-sm font-semibold text-[#171A2C] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#111965]" />
                <span>{getLocalized(uni.province) || uni.province}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {t("universityDetail.contact")}
              </div>
              <div className="text-xs font-medium text-[#171A2C] mt-0.5 space-y-1">
                {uni.contact_phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#111965]" />
                    <span>{uni.contact_phone}</span>
                  </div>
                )}
                {uni.contact_email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#111965]" />
                    <span>{uni.contact_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Majors & Programs Offered */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {t("universityDetail.availablePrograms")}
            </h2>
            <span className="text-xs font-semibold text-[#68708A]">
              {uni.offerings?.length || 0} {t("universityDetail.programsCount")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uni.offerings?.map((um: any) => (
              <div
                key={um.major_id}
                className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F2FA] text-[#111965]">
                      {t(`categories.${um.major_category}`, um.major_category)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {um.tuition_annual_usd ? `$${Math.round(um.tuition_annual_usd)} / yr` : "Tuition N/A"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {getLocalized(um.major_name)}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#68708A] pt-1">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{um.degree_level}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{um.duration_years} Years</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{um.language_of_instruction}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E8F0]">
                  <Link
                    href={`/majors/${um.major_slug}`}
                    className="text-xs font-bold text-[#111965] hover:underline"
                  >
                    {t("universityDetail.viewMajor")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Requirements & Facilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admission requirements */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#111965]" />
              <span>{t("universityDetail.admissionRequirements")}</span>
            </h3>
            {reqList.length > 0 ? (
              <ul className="space-y-2 text-xs text-[#171A2C]">
                {reqList.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#68708A]">Standard High School Diploma (BacII) required.</p>
            )}
          </div>

          {/* Learning Facilities */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#111965]" />
              <span>{t("universityDetail.facilities")}</span>
            </h3>
            {facList.length > 0 ? (
              <ul className="space-y-2 text-xs text-[#171A2C]">
                {facList.map((fac: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#68708A]">Campus libraries, STEM laboratories, and student study centers.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
