"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Building2,
  Search,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Scale,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  GraduationCap,
  X,
  DollarSign,
  CheckCircle2,
  Building,
  Landmark,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { formatUSD } from "@/lib/utils";

// Cambodian university campus photos mapping
const UNIVERSITY_IMAGES: Record<string, string> = {
  rupp: "/images/universities/rupp.jpg",
  itc: "/images/universities/itc.jpg",
  aupp: "/images/universities/aupp.jpg",
  paragoniu: "/images/universities/paragoniu.jpg",
  cadt: "/images/universities/cadt.jpg",
  num: "/images/universities/rupp.jpg",
};

export default function UniversitiesPage() {
  const { t, getLocalized, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "tuition_asc" | "majors_desc">("default");
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
        alert(t("universitiesDirectory.compareAlert"));
        return;
      }
      setSelectedForCompare([...selectedForCompare, slug]);
    }
  };

  const sortedUniversities = useMemo(() => {
    if (!universities) return [];
    const list = [...universities];
    if (sortBy === "tuition_asc") {
      list.sort((a, b) => {
        const valA = a.tuition_range_min_usd ?? 999999;
        const valB = b.tuition_range_min_usd ?? 999999;
        return valA - valB;
      });
    } else if (sortBy === "majors_desc") {
      list.sort((a, b) => (b.majors_count || 0) - (a.majors_count || 0));
    }
    return list;
  }, [universities, sortBy]);

  const hasActiveFilters = Boolean(searchTerm || typeFilter || provinceFilter);

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setProvinceFilter("");
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero Section with Magic UI DotPattern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-10 pb-12">
        <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] opacity-35" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t("universitiesDirectory.badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111965] tracking-tight leading-tight">
              {t("universitiesDirectory.title")}
            </h1>

            <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
              {t("universitiesDirectory.subtitle")}
            </p>

            {/* Quick Stat Highlights without emojis */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-[#171A2C] font-semibold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#111965]" />
                <span>{universities?.length || 6} Accredited Campuses</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-emerald-800 font-semibold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Verified Tuition Fees</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E6E8F0] text-[#171A2C] font-semibold shadow-2xs">
                <Scale className="w-3.5 h-3.5 text-[#F7CE4D]" />
                <span>Compare up to 4 Side-by-Side</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("universitiesDirectory.searchPlaceholder")}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-[#F5F6FA]/50 focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/10 transition-all placeholder:text-[#68708A]/70"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68708A] hover:text-[#171A2C] p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* University Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="">{t("universitiesDirectory.allTypes")}</option>
                <option value="PUBLIC">{t("universitiesDirectory.publicType")}</option>
                <option value="PRIVATE">{t("universitiesDirectory.privateType")}</option>
              </select>
            </div>

            {/* Province Filter */}
            <div className="sm:col-span-2">
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="">{t("universitiesDirectory.allProvinces")}</option>
                <option value="Phnom Penh">Phnom Penh (ភ្នំពេញ)</option>
                <option value="Battambang">Battambang (បាត់ដំបង)</option>
                <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="default">{t("universitiesDirectory.sortBy")}</option>
                <option value="tuition_asc">{t("universitiesDirectory.sortLowestTuition")}</option>
                <option value="majors_desc">{t("universitiesDirectory.sortMostPrograms")}</option>
              </select>
            </div>
          </div>

          {/* Quick Segmented Types Pills without emojis */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E8F0]/80">
            <button
              onClick={() => setTypeFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !typeFilter
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C] hover:bg-slate-200/70"
              }`}
            >
              {t("universitiesDirectory.filterAllTypes")}
            </button>
            <button
              onClick={() => setTypeFilter("PUBLIC")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === "PUBLIC"
                  ? "bg-blue-800 text-white shadow-xs"
                  : "bg-blue-50 text-blue-900 hover:bg-blue-100"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{t("universitiesDirectory.publicType")}</span>
            </button>
            <button
              onClick={() => setTypeFilter("PRIVATE")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === "PRIVATE"
                  ? "bg-purple-800 text-white shadow-xs"
                  : "bg-purple-50 text-purple-900 hover:bg-purple-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t("universitiesDirectory.privateType")}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("universitiesDirectory.resetFilters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <Skeleton className="h-44 w-full rounded-xl" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-xl" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 text-sm bg-white rounded-3xl border border-rose-200 p-8">
            Failed to load universities. Please refresh and try again.
          </div>
        ) : sortedUniversities && sortedUniversities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUniversities.map((uni: any, index: number) => {
              const isSelected = selectedForCompare.includes(uni.slug);
              const isPublic = uni.university_type === "PUBLIC";
              const coverImage = UNIVERSITY_IMAGES[uni.slug] || "/images/universities/rupp.jpg";
              const isFeatured = index === 0;

              return (
                <div
                  key={uni.id}
                  className={`group relative rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 ${
                    isSelected ? "border-[#111965] ring-2 ring-[#111965]/20" : "border-[#E6E8F0] hover:border-[#111965]/30"
                  }`}
                >
                  {isFeatured && <BorderBeam size={180} duration={12} delay={2} borderWidth={1.5} />}

                  <div>
                    {/* Campus Image Header */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={coverImage}
                        alt={getLocalized(uni.name) || "University"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs backdrop-blur-xs ${
                            isPublic
                              ? "bg-blue-900/90 text-blue-100"
                              : "bg-purple-900/90 text-purple-100"
                          }`}
                        >
                          {isPublic
                            ? t("universitiesDirectory.publicType")
                            : t("universitiesDirectory.privateType")}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleCompare(uni.slug)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs transition-all ${
                            isSelected
                              ? "bg-[#F7CE4D] text-[#111965] ring-1 ring-[#111965]/20"
                              : "bg-white/95 text-[#111965] hover:bg-white"
                          }`}
                          title="Add to comparison"
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isSelected ? t("universitiesDirectory.selected") : t("universitiesDirectory.compare")}</span>
                        </button>
                      </div>

                      {/* Verified & Acronym on Image Bottom */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-mono text-xs bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md font-bold tracking-wider">
                          {getLocalized(uni.acronym) || uni.slug.toUpperCase()}
                        </span>

                        {uni.is_tuition_verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{t("universitiesDirectory.verifiedBadgeShort")}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3.5">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#111965] group-hover:text-[#1E277A] transition-colors leading-snug">
                          {getLocalized(uni.name)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#68708A] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#111965] shrink-0" />
                          <span>{getLocalized(uni.province) || uni.province || "Phnom Penh, Cambodia"}</span>
                        </div>
                      </div>

                      {/* Verified Tuition Fee Box */}
                      <div className="p-3.5 rounded-xl bg-[#F0F2FA]/70 border border-[#E6E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#68708A]">
                          <span className="font-bold">{t("universitiesDirectory.tuitionTitle")}</span>
                          {uni.is_tuition_verified && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <div className="text-base font-extrabold text-[#111965]">
                          {uni.tuition_range_min_usd !== null
                            ? `$${Math.round(uni.tuition_range_min_usd)} – $${Math.round(uni.tuition_range_max_usd || uni.tuition_range_min_usd)} / yr`
                            : t("universitiesDirectory.tuitionPending")}
                        </div>
                      </div>

                      <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                        {getLocalized(uni.description)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-[#E6E8F0] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#68708A] flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{uni.majors_count || 0} {t("universitiesDirectory.programs")}</span>
                    </span>

                    <Link
                      href={`/universities/${uni.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-2xs group-hover:shadow-xs"
                    >
                      <span>{t("universitiesDirectory.viewDetails")}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white border border-[#E6E8F0] p-8 space-y-4">
            <div className="relative w-24 h-24 mx-auto opacity-80">
              <Image
                src="/images/think.webp"
                alt="No universities found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("universitiesDirectory.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Try adjusting your search query or selecting "All University Types" to view the complete list of Cambodian institutions.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("universitiesDirectory.resetFilters")}
            </button>
          </div>
        )}

        {/* Sticky Floating Compare Tray */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40 p-4 rounded-2xl bg-[#111965] text-white shadow-2xl flex items-center justify-between border border-[#1E277A] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7CE4D] text-[#111965] flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white text-sm">
                  <span className="text-[#F7CE4D]">{selectedForCompare.length}</span> / 4 {t("universitiesDirectory.selectedNotice")}
                </div>
                <div className="text-slate-300 font-mono text-[11px] truncate max-w-xs">
                  {selectedForCompare.map((s) => s.toUpperCase()).join(", ")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                {t("universitiesDirectory.clear")}
              </button>
              <Link
                href={`/universities/compare?ids=${selectedForCompare.join(",")}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md"
              >
                <span>{t("universitiesDirectory.compareNow")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
