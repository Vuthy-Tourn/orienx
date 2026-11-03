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
} from "lucide-react";

export default function ScholarshipsPage() {
  const { language, getLocalized } = useLanguage();
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
      alert(language === "km" ? "បានរក្សាទុកក្នុងផ្ទាំងតាមដានអាហារូបករណ៍របស់អ្នក!" : "Saved to your scholarship tracker!");
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === "km" ? "អាហារូបករណ៍ផ្លូវការដែលបានផ្ទៀងផ្ទាត់" : "Verified Official Scholarships"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {language === "km" ? "ស្វែងរកអាហារូបករណ៍សាកលវិទ្យាល័យ" : "University Scholarship Discovery"}
          </h1>
          <p className="text-sm text-[#68708A] max-w-2xl">
            {language === "km"
              ? "ស្វែងរកអាហារូបករណ៍រដ្ឋ MoEYS និងអាហារូបករណ៍ពីសាកលវិទ្យាល័យដៃគូ ពិនិត្យលក្ខខណ្ឌ និងតាមដានកាលបរិច្ឆេទផុតកំណត់។"
              : "Find verified state scholarships and merit-based grants for Cambodian students with official application links."}
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
              placeholder={language === "km" ? "ស្វែងរកអាហារូបករណ៍ (ក្រសួងអប់រំ, AUPP, Paragon...)" : "Search by keyword or provider..."}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
            >
              <option value="">{language === "km" ? "គ្រប់កម្រិតជំនួយ" : "All Coverage Types"}</option>
              <option value="FULL_TUITION">{language === "km" ? "ពេញលេញ ១០០% (Full Tuition)" : "100% Full Tuition"}</option>
              <option value="PARTIAL_TUITION">{language === "km" ? "មួយផ្នែក ២៥% - ៥០% (Partial)" : "Partial Tuition"}</option>
            </select>
          </div>
        </div>

        {/* Scholarships List */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-[#68708A]">
            {language === "km" ? "កំពុងទាញយកទិន្នន័យអាហារូបករណ៍..." : "Loading scholarships..."}
          </div>
        ) : scholarships && scholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map((s: any) => (
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
                    <h3 className="text-base font-bold text-[#111965] leading-snug mt-0.5">
                      {getLocalized(s.title)}
                    </h3>
                  </div>

                  <p className="text-xs text-[#68708A] leading-relaxed line-clamp-3">
                    {getLocalized(s.description)}
                  </p>

                  <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] text-xs space-y-1">
                    <div className="font-semibold text-[#111965]">
                      {language === "km" ? "លក្ខខណ្ឌចម្បង:" : "Eligibility Criteria:"}
                    </div>
                    <div className="text-[#68708A]">
                      {((language === "km" ? s.eligibility_criteria?.km : s.eligibility_criteria?.en) || s.eligibility_criteria?.en || []).slice(0, 2).join(" • ")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                  {user && (
                    <button
                      onClick={() => toggleTrack({ id: s.id, status: "SAVED" })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#111965] hover:underline"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{language === "km" ? "តាមដានអាហារូបករណ៍" : "Track Scholarship"}</span>
                    </button>
                  )}

                  {s.official_url && (
                    <a
                      href={s.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors ml-auto shadow-2xs"
                    >
                      <span>{language === "km" ? "ដាក់ពាក្យផ្លូវការ" : "Official Link"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[#68708A]">
            No scholarships found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
