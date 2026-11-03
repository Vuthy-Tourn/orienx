"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { Search, Compass, BookOpen, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MajorsPage() {
  const { language, getLocalized } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stemOnly, setStemOnly] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["major-categories"],
    queryFn: async () => apiFetch<string[]>("/majors/categories"),
  });

  const { data: majors, isLoading } = useQuery({
    queryKey: ["majors", searchTerm, selectedCategory, stemOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (stemOnly) params.append("is_stem", "true");
      return apiFetch<any[]>(`/majors?${params.toString()}`);
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ថតឯកសារជំនាញសិក្សា" : "Academic Programs Directory"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {language === "km" ? "ស្វែងរកជំនាញសាកលវិទ្យាល័យ" : "Explore University Majors"}
          </h1>
          <p className="text-sm text-[#68708A] max-w-2xl">
            {language === "km"
              ? "ស្វែងយល់ពីមុខវិជ្ជាដែលត្រូវរៀន ជំនាញដែលត្រូវការ និងសាកលវិទ្យាល័យនៅកម្ពុជាដែលផ្តល់ការបង្រៀនលើជំនាញនីមួយៗ។"
              : "Discover curriculum requirements, core subjects, and Cambodian institutions offering each degree."}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === "km" ? "ស្វែងរកជំនាញ (ឧ. កុំព្យូទ័រ, សំណង់, ធុរកិច្ច...)" : "Search majors (e.g. Software, Finance, Civil...)"}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#171A2C] cursor-pointer p-2 rounded-xl border border-[#E6E8F0] w-full hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={stemOnly}
                  onChange={(e) => setStemOnly(e.target.checked)}
                  className="rounded text-[#111965]"
                />
                <span>🔬 STEM Majors Only (វិទ្យាសាស្ត្រ/បច្ចេកវិទ្យា)</span>
              </label>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E6E8F0]/70">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                !selectedCategory
                  ? "bg-[#111965] text-white"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C]"
              }`}
            >
              {language === "km" ? "ទាំងអស់" : "All Categories"}
            </button>
            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#111965] text-white"
                    : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Majors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : majors && majors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majors.map((m: any) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                      {m.category}
                    </span>
                    {m.is_stem && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        STEM
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {getLocalized(m.name)}
                  </h3>

                  <p className="text-xs text-[#68708A] line-clamp-3 leading-relaxed">
                    {getLocalized(m.description)}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#68708A] pt-1">
                    <span className="font-semibold text-[#111965]">
                      RIASEC: {m.riasec_primary}-{m.riasec_secondary}
                    </span>
                    {m.personality_affinity && (
                      <span>• MBTI: {m.personality_affinity.split(",")[0]}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#68708A] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#111965]" />
                    <span>{m.universities_count} {language === "km" ? "សាកលវិទ្យាល័យ" : "Institutions"}</span>
                  </span>
                  <Link
                    href={`/majors/${m.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#111965] hover:text-[#1E277A]"
                  >
                    <span>{language === "km" ? "ព័ត៌មានលម្អិត" : "Details"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[#68708A]">
            No majors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

