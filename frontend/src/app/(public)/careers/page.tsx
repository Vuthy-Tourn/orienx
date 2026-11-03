"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { Briefcase, Search, ArrowRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function CareersPage() {
  const { language, getLocalized } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  const { data: careers, isLoading } = useQuery({
    queryKey: ["careers", searchTerm, industryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (industryFilter) params.append("industry", industryFilter);
      return apiFetch<any[]>(`/careers?${params.toString()}`);
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ទីផ្សារការងារ និងអាជីព" : "Career Opportunities Explorer"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {language === "km" ? "ស្វែងយល់ពីឱកាសការងារ" : "Discover Careers in Cambodia"}
          </h1>
          <p className="text-sm text-[#68708A] max-w-2xl">
            {language === "km"
              ? "ស្វែងយល់ពីតួនាទីភារកិច្ច កម្រិតអប់រំដែលត្រូវការ និងជណ្តើរឡើងនៃអាជីពនីមួយៗ។"
              : "Explore professional responsibilities, education requirements, and career progression."}
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
              placeholder={language === "km" ? "ស្វែងរកអាជីព (វិស្វករ, ហិរញ្ញវត្ថុ...)" : "Search careers (Software, Finance, Civil...)"}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
            >
              <option value="">{language === "km" ? "គ្រប់វិស័យឧស្សាហកម្ម" : "All Industries"}</option>
              <option value="Technology">Technology</option>
              <option value="Finance & Banking">Finance & Banking</option>
              <option value="Engineering & Construction">Engineering & Construction</option>
            </select>
          </div>
        </div>

        {/* Careers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : careers && careers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careers.map((c: any) => (
              <div
                key={c.id}
                className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                      {c.industry}
                    </span>
                    <span className="text-xs font-bold text-[#68708A]">
                      RIASEC: {c.riasec_code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {getLocalized(c.title)}
                  </h3>

                  <p className="text-xs text-[#68708A] line-clamp-3 leading-relaxed">
                    {getLocalized(c.description)}
                  </p>

                  <div className="text-xs text-[#68708A]">
                    🎓 Min Education: <span className="font-semibold text-[#111965]">{c.education_level}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>In-Demand</span>
                  </span>
                  <Link
                    href={`/careers/${c.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#111965] hover:text-[#1E277A]"
                  >
                    <span>{language === "km" ? "មើលព័ត៌មានលម្អិត" : "View Profile"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[#68708A]">
            No careers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

