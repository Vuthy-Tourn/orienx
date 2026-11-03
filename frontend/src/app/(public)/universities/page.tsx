"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Search,
  Filter,
  GraduationCap,
  MapPin,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Plus,
  Check,
  Scale,
} from "lucide-react";

export default function UniversitiesPage() {
  const { language, getLocalized } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const { data: universities, isLoading, error } = useQuery({
    queryKey: ["universities", searchTerm, typeFilter, provinceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (typeFilter) params.append("university_type", typeFilter);
      if (provinceFilter) params.append("province", provinceFilter);
      return apiFetch<any[]>(`/universities?${params.toString()}`);
    },
  });

  const toggleCompare = (slug: string) => {
    if (selectedForCompare.includes(slug)) {
      setSelectedForCompare(selectedForCompare.filter((s) => s !== slug));
    } else {
      if (selectedForCompare.length >= 4) {
        alert(language === "km" ? "អ្នកអាចប្រៀបធៀបបានអតិបរមា ៤ សាកលវិទ្យាល័យ" : "You can compare up to 4 universities at a time");
        return;
      }
      setSelectedForCompare([...selectedForCompare, slug]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ព័ត៌មានផ្ទៀងផ្ទាត់ផ្លូវការ" : "Official Verified Information"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {language === "km" ? "សាកលវិទ្យាល័យនៅកម្ពុជា" : "Cambodian Universities Directory"}
          </h1>
          <p className="text-sm text-[#68708A] max-w-2xl">
            {language === "km"
              ? "ស្វែងរកសាកលវិទ្យាល័យរដ្ឋ និងឯកជន ពិនិត្យតម្លៃសិក្សាជាក់ស្តែងដែលត្រូវបានផ្ទៀងផ្ទាត់ និងប្រៀបធៀបកម្មវិធីសិក្សា។"
              : "Explore verified public state and private universities in Cambodia with verified tuition fee schedules."}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === "km" ? "ស្វែងរកតាមឈ្មោះសាកលវិទ្យាល័យ ឬអក្សរកាត់ (RUPP, ITC...)" : "Search by name or acronym (RUPP, ITC...)"}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
            >
              <option value="">{language === "km" ? "គ្រប់ប្រភេទគ្រឹះស្ថាន" : "All University Types"}</option>
              <option value="PUBLIC">{language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ (Public)" : "Public State University"}</option>
              <option value="PRIVATE">{language === "km" ? "សាកលវិទ្យាល័យឯកជន (Private)" : "Private University"}</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
            >
              <option value="">{language === "km" ? "គ្រប់រាជធានី/ខេត្ត" : "All Provinces"}</option>
              <option value="Phnom Penh">Phnom Penh (រាជធានីភ្នំពេញ)</option>
              <option value="Battambang">Battambang (បាត់ដំបង)</option>
              <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
            </select>
          </div>
        </div>

        {/* Floating Compare Tray */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40 p-4 rounded-2xl bg-[#111965] text-white shadow-xl flex items-center justify-between border border-[#1E277A] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#F7CE4D]" />
              <div className="text-xs">
                <span className="font-bold text-[#F7CE4D]">{selectedForCompare.length}</span>
                <span> {language === "km" ? "សាកលវិទ្យាល័យត្រូវបានជ្រើសរើស" : "universities selected"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white"
              >
                {language === "km" ? "លុបចោល" : "Clear"}
              </button>
              <Link
                href={`/universities/compare?ids=${selectedForCompare.join(",")}`}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs"
              >
                {language === "km" ? "ប្រៀបធៀបឥឡូវនេះ" : "Compare Now"}
              </Link>
            </div>
          </div>
        )}

        {/* Directory Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-[#68708A]">
            {language === "km" ? "កំពុងទាញយកទិន្នន័យសាកលវិទ្យាល័យ..." : "Loading universities..."}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 text-sm">
            Failed to load universities.
          </div>
        ) : universities && universities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni: any) => {
              const isSelected = selectedForCompare.includes(uni.slug);
              return (
                <div
                  key={uni.id}
                  className="rounded-2xl bg-white border border-[#E6E8F0] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          uni.university_type === "PUBLIC"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-purple-50 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {uni.university_type === "PUBLIC" ? (language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ" : "Public State") : (language === "km" ? "សាកលវិទ្យាល័យឯកជន" : "Private")}
                      </span>

                      <button
                        onClick={() => toggleCompare(uni.slug)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-[#111965] text-white"
                            : "bg-slate-100 text-[#171A2C] hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSelected ? (language === "km" ? "បានជ្រើស" : "Selected") : (language === "km" ? "ប្រៀបធៀប" : "Compare")}</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#68708A] uppercase tracking-wider">
                        {getLocalized(uni.acronym)}
                      </span>
                      <h3 className="text-base font-bold text-[#111965] leading-snug mt-0.5">
                        {getLocalized(uni.name)}
                      </h3>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="text-[10px] text-[#68708A] uppercase font-bold">
                        {language === "km" ? "តម្លៃសិក្សាប្រចាំឆ្នាំ (ផ្ទៀងផ្ទាត់)" : "Annual Tuition Range"}
                      </div>
                      <div className="text-sm font-extrabold text-[#111965]">
                        {uni.tuition_range_min_usd !== null
                          ? `$${Math.round(uni.tuition_range_min_usd)} – $${Math.round(uni.tuition_range_max_usd || uni.tuition_range_min_usd)} / yr`
                          : (language === "km" ? "ព័ត៌មានមិនទាន់មាន" : "Information not available")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#68708A]">
                      <MapPin className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{uni.province}</span>
                    </div>

                    <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                      {getLocalized(uni.description)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#68708A]">
                      {uni.majors_count} {language === "km" ? "ជំនាញសិក្សា" : "Programs"}
                    </span>
                    <Link
                      href={`/universities/${uni.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#111965] hover:text-[#1E277A]"
                    >
                      <span>{language === "km" ? "មើលព័ត៌មានលម្អិត" : "View Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[#68708A]">
            {language === "km" ? "រកមិនឃើញសាកលវិទ្យាល័យដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។" : "No universities found matching your filter."}
          </div>
        )}
      </div>
    </div>
  );
}

