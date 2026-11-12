"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  ArrowLeft,
  Scale,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  Building,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function UniversityCompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") || "";
  const { t, getLocalized } = useLanguage();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["universities-compare", ids],
    queryFn: async () => {
      if (!ids) return { universities: [] };
      return apiFetch<{ universities: any[] }>(`/universities/compare?ids=${ids}`);
    },
    enabled: !!ids,
    retry: 1,
  });

  const universities = data?.universities || [];

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("universitiesCompare.back")}</span>
          </button>
          <div className="text-xs text-[#68708A]">
            {t("universitiesCompare.factBased")}
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>{t("universitiesCompare.badge")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
            {t("universitiesCompare.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[#68708A]">
            {t("universitiesCompare.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-[#E6E8F0] bg-white p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-4 gap-4 pb-4 border-b border-slate-100">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-100/60">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : error || universities.length === 0 ? (
          <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <WifiOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#111965]">
                {t("universitiesCompare.failed")}
              </h3>
              <p className="text-xs sm:text-sm text-[#68708A] max-w-md mx-auto leading-relaxed">
                Could not retrieve comparison criteria. Please check connection and try again.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-[#E6E8F0] bg-white shadow-xs">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E6E8F0] bg-[#F5F6FA]">
                  <th className="p-5 text-xs font-bold text-[#68708A] uppercase tracking-wider w-1/4">
                    {t("universitiesCompare.criteria")}
                  </th>
                  {universities.map((u: any) => (
                    <th key={u.id} className="p-5 text-left border-l border-[#E6E8F0] w-1/4">
                      <div className="text-[11px] font-bold text-[#68708A] uppercase">
                        {getLocalized(u.acronym)}
                      </div>
                      <div className="text-sm font-bold text-[#111965] mt-0.5 leading-snug">
                        {getLocalized(u.name)}
                      </div>
                      <Link
                        href={`/universities/${u.slug}`}
                        className="inline-block mt-2 text-xs font-semibold text-[#111965] hover:underline"
                      >
                        {t("universitiesCompare.viewProfile")}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8F0] text-xs sm:text-sm">
                {/* 1. Type */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.institutionType")}
                  </td>
                  {universities.map((u: any) => (
                    <td key={u.id} className="p-5 border-l border-[#E6E8F0]">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.university_type === "PUBLIC"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-purple-50 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {u.university_type === "PUBLIC"
                          ? t("universitiesCompare.publicType")
                          : t("universitiesCompare.privateType")}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. Annual Tuition */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.annualTuition")}
                  </td>
                  {universities.map((u: any) => (
                    <td key={u.id} className="p-5 border-l border-[#E6E8F0]">
                      <div className="font-extrabold text-[#111965] text-sm sm:text-base">
                        {u.tuition_range_min_usd !== null
                          ? `$${Math.round(u.tuition_range_min_usd)} – $${Math.round(
                              u.tuition_range_max_usd || u.tuition_range_min_usd
                            )} / yr`
                          : t("universitiesCompare.tuitionNotAvailable")}
                      </div>
                      {u.is_tuition_verified && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          {t("universitiesCompare.verifiedFee")}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 3. Location */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.location")}
                  </td>
                  {universities.map((u: any) => (
                    <td key={u.id} className="p-5 border-l border-[#E6E8F0] text-[#171A2C]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#111965]" />
                        <span>{getLocalized(u.province) || u.province}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. Total Programs */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.availablePrograms")}
                  </td>
                  {universities.map((u: any) => (
                    <td key={u.id} className="p-5 border-l border-[#E6E8F0]">
                      <div className="font-bold text-[#111965]">
                        {u.offerings?.length || u.majors_count} {t("universitiesCompare.programs")}
                      </div>
                      <div className="text-[11px] text-[#68708A] mt-1 space-y-0.5">
                        {u.offerings?.slice(0, 3).map((um: any) => (
                          <div key={um.major_id}>• {getLocalized(um.major_name)}</div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. Admission Criteria */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.admissionCriteria")}
                  </td>
                  {universities.map((u: any) => {
                    const reqs = getLocalized(u.admission_requirements) || u.admission_requirements?.en || [];
                    const reqList = Array.isArray(reqs) ? reqs : [];
                    return (
                      <td key={u.id} className="p-5 border-l border-[#E6E8F0] text-xs text-[#68708A]">
                        {reqList.length > 0 ? (
                          <ul className="space-y-1">
                            {reqList.map((req: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>{t("universitiesCompare.admissionFallback")}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Official Link */}
                <tr>
                  <td className="p-5 font-bold text-[#171A2C] bg-[#FAFAFC]">
                    {t("universitiesCompare.officialPortal")}
                  </td>
                  {universities.map((u: any) => (
                    <td key={u.id} className="p-5 border-l border-[#E6E8F0]">
                      {u.website_url ? (
                        <a
                          href={u.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#111965] hover:underline"
                        >
                          <span>{u.website_url.replace("https://", "").replace("http://", "")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UniversityComparePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center text-sm text-[#68708A]">
          Loading...
        </div>
      }
    >
      <UniversityCompareContent />
    </React.Suspense>
  );
}
