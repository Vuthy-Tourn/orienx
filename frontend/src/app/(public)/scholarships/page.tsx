"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Award,
  Search,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Building,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function ScholarshipsPage() {
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [coverageFilter, setCoverageFilter] = useState("");

  const { data: scholarships, isLoading } = useQuery({
    queryKey: ["scholarships", searchTerm, coverageFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (coverageFilter) params.append("coverage_type", coverageFilter);
      return apiFetch<any[]>(`/scholarships?${params.toString()}`);
    },
  });

  const { mutate: toggleTrack } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/scholarships/${id}/track`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      alert(t("scholarshipsPage.savedAlert"));
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("scholarshipsPage.verifiedBadge")}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {t("scholarshipsPage.title")}
          </h1>
          <p className="text-sm text-[#68708A] max-w-2xl">
            {t("scholarshipsPage.subtitle")}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("scholarshipsPage.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
            >
              <option value="">{t("scholarshipsPage.allCoverage")}</option>
              <option value="FULL_TUITION">{t("scholarshipsPage.fullTuition")}</option>
              <option value="PARTIAL_TUITION">{t("scholarshipsPage.partialTuition")}</option>
            </select>
          </div>
        </div>

        {/* Scholarships List */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-[#68708A]">
            {t("scholarshipsPage.loading")}
          </div>
        ) : scholarships && scholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map((s: any) => {
              const criteria = getLocalized(s.eligibility_criteria) || s.eligibility_criteria?.en || [];
              const criteriaArray = Array.isArray(criteria) ? criteria : [];

              return (
                <div
                  key={s.id}
                  className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF9E6] text-[#111965] border border-[#F7CE4D]">
                        {s.coverage_percentage ? `${s.coverage_percentage}% Coverage` : s.coverage_type}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#68708A]">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Deadline: {s.application_deadline || "Rolling"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#68708A] uppercase">
                        {getLocalized(s.provider)}
                      </span>
                      <Link href={`/scholarships/${s.slug}`} className="hover:underline">
                        <h3 className="text-base font-bold text-[#111965] leading-snug mt-0.5 hover:text-[#0284C7] transition-colors">
                          {getLocalized(s.title)}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-xs text-[#68708A] leading-relaxed line-clamp-3">
                      {getLocalized(s.description)}
                    </p>

                    {criteriaArray.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] text-xs space-y-1">
                        <div className="font-semibold text-[#111965]">
                          {t("scholarshipsPage.eligibilityCriteria")}
                        </div>
                        <div className="text-[#68708A]">
                          {criteriaArray.slice(0, 2).join(" • ")}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-3">
                    {user && (
                      <button
                        onClick={() => toggleTrack({ id: s.id, status: "SAVED" })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#111965] hover:underline"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{t("scholarshipsPage.trackScholarship")}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <Link
                        href={`/scholarships/${s.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <span>{t("scholarshipsShowcase.viewDetails")}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      {s.official_url && (
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                        >
                          <span>{t("scholarshipsPage.officialLink")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[#68708A]">
            {t("scholarshipsPage.notFound")}
          </div>
        )}
      </div>
    </div>
  );
}
