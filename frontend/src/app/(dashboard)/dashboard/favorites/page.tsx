"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Bookmark,
  Building2,
  Compass,
  Briefcase,
  Award,
  ArrowRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Calendar,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { BookmarkButton } from "@/components/ui/bookmark-button";

// Image lookups matching public directory
const MAJOR_IMAGES: Record<string, string> = {
  "software-engineering": "/images/majors/software-engineering.webp",
  "computer-science": "/images/majors/software-engineering.webp",
  "data-science-ai": "/images/majors/data-science-ai.webp",
  "business-administration": "/images/majors/business-administration.webp",
  "banking-finance": "/images/majors/banking-finance.webp",
  "civil-engineering": "/images/majors/civil-engineering.webp",
  "international-relations": "/images/majors/international-relations.webp",
  "cybersecurity": "/images/majors/cybersecurity.webp",
  "digital-marketing": "/images/majors/digital-marketing.webp",
  "architecture": "/images/majors/architecture.webp",
  "law": "/images/majors/law.webp",
};

const UNIVERSITY_IMAGES: Record<string, string> = {
  rupp: "/images/universities/rupp.jpg",
  itc: "/images/universities/itc.jpg",
  cadt: "/images/universities/cadt.jpg",
  aupp: "/images/universities/aupp.jpg",
  paragoniu: "/images/universities/paragoniu.jpg",
  paragon: "/images/universities/paragoniu.jpg",
};

export default function FavoritesPage() {
  const { t, getLocalized, language } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"majors" | "universities" | "careers" | "scholarships">("majors");

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => apiFetch<any>("/favorites"),
  });

  const { mutate: removeFavorite } = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      return apiFetch("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ entity_type: type, entity_id: id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const { mutate: updateScholarshipStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/scholarships/${id}/track`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });

  const formatName = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return getLocalized(val) || val.en || val.km || "";
  };

  const tabs = [
    {
      id: "majors" as const,
      label: t("favoritesPage.tabMajors", "ជំនាញ"),
      icon: Compass,
      count: favorites?.majors?.length || 0,
    },
    {
      id: "universities" as const,
      label: t("favoritesPage.tabUniversities", "សាកលវិទ្យាល័យ"),
      icon: Building2,
      count: favorites?.universities?.length || 0,
    },
    {
      id: "careers" as const,
      label: t("favoritesPage.tabCareers", "អាជីពការងារ"),
      icon: Briefcase,
      count: favorites?.careers?.length || 0,
    },
    {
      id: "scholarships" as const,
      label: t("favoritesPage.tabScholarships", "អាហារូបករណ៍"),
      icon: Award,
      count: favorites?.scholarships?.length || 0,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600 shadow-2xs">
            <Bookmark className="w-5 h-5 fill-amber-400 text-amber-600" />
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111965] tracking-tight">
            {t("favoritesPage.title", "ទំព័រ និងជំនាញដែលបានរក្សាទុក")}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#68708A] pl-11">
          {t("favoritesPage.subtitle", "គ្រប់គ្រងជំនាញ សាកលវិទ្យាល័យ និងអាហារូបករណ៍ដែលអ្នកបានចំណាំទុក។")}
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E6E8F0] no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                isActive
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-white text-[#68708A] border border-[#E6E8F0] hover:text-[#111965] hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[12.5px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      {isLoading ? (
        <div className="py-24 text-center text-sm font-bold text-[#68708A] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#111965] border-t-transparent rounded-full animate-spin" />
          <span>{t("favoritesPage.loading", "កំពុងទាញយកទំព័រដែលបានរក្សាទុក...")}</span>
        </div>
      ) : (
        <div>
          {/* ========================================================= */}
          {/* 1. MAJORS TAB */}
          {/* ========================================================= */}
          {activeTab === "majors" && (
            <div>
              {favorites?.majors?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {favorites.majors.map((m: any) => {
                    const coverImage = MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group relative"
                      >
                        {/* Cover Image Header */}
                        <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={coverImage}
                            alt={formatName(m.name) || "Major"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-[#111965] shadow-xs backdrop-blur-xs truncate max-w-[170px]">
                              {t(`categories.${m.category}`, m.category)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {m.is_stem && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-extrabold bg-[#F7CE4D] text-[#111965] shadow-xs">
                                  <Sparkles className="w-3 h-3" />
                                  <span>STEM</span>
                                </span>
                              )}
                              <BookmarkButton
                                entityType="major"
                                entityId={m.id}
                                variant="overlay"
                              />
                            </div>
                          </div>

                          {/* Bottom Holland Indicator */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-mono text-[12px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md font-bold">
                              RIASEC: {m.riasec_primary ? `${m.riasec_primary}${m.riasec_secondary ? `-${m.riasec_secondary}` : ""}` : "RIA"}
                            </span>
                            {m.personality_affinity && (
                              <span className="font-mono text-[12.5px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-amber-300 font-bold">
                                {m.personality_affinity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h3 className="text-base sm:text-lg font-black text-[#111965] group-hover:text-[#B45309] transition-colors leading-snug line-clamp-1">
                              {formatName(m.name)}
                            </h3>
                            {m.description && (
                              <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                                {formatName(m.description)}
                              </p>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => removeFavorite({ type: "major", id: m.id })}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer py-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t("favoritesPage.remove", "លុបចេញ")}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <Link
                                href={`/universities?major=${m.slug}`}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Building2 className="w-3.5 h-3.5 text-[#111965]" />
                                <span>{t("recommendationsPage.universities", "សាកលវិទ្យាល័យ")}</span>
                              </Link>
                              <Link
                                href={`/majors/${m.slug}`}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>{t("favoritesPage.viewProgram", "មើលមុខជំនាញ")}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-[#E6E8F0] shadow-2xs max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#111965]">
                      {t("favoritesPage.noMajors", "មិនទាន់មានជំនាញដែលបានចំណាំនៅឡើយទេ")}
                    </h3>
                    <p className="text-xs text-[#68708A] max-w-sm mx-auto">
                      រុករកបញ្ជីមុខជំនាញ ឬពិនិត្យមើលអនុសាសន៍ឆ្លាតវៃ ហើយចុចលើរូបចំណាំដើម្បីរក្សាទុកនៅទីនេះ។
                    </p>
                  </div>
                  <Link
                    href="/majors"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                  >
                    <span>រុករកមុខជំនាញ (Explore Majors)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. UNIVERSITIES TAB */}
          {/* ========================================================= */}
          {activeTab === "universities" && (
            <div>
              {favorites?.universities?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {favorites.universities.map((u: any) => {
                    const coverImage = UNIVERSITY_IMAGES[u.slug] || "/images/universities/rupp.jpg";
                    const isPublic = u.university_type === "PUBLIC";
                    return (
                      <div
                        key={u.id}
                        className="rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group relative"
                      >
                        {/* Campus Image Header */}
                        <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={coverImage}
                            alt={formatName(u.name) || "University"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

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
                                ? t("universitiesDirectory.publicType", "រដ្ឋ (Public)")
                                : t("universitiesDirectory.privateType", "ឯកជន (Private)")}
                            </span>

                            <BookmarkButton
                              entityType="university"
                              entityId={u.id}
                              variant="overlay"
                            />
                          </div>

                          {/* Bottom Acronym & Province */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-mono text-[12px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md font-bold">
                              {formatName(u.acronym) || "CAMBODIA"}
                            </span>
                            <span className="text-[12px] font-medium bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#F7CE4D]" />
                              <span>{u.province || "Phnom Penh"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h3 className="text-base sm:text-lg font-black text-[#111965] group-hover:text-[#B45309] transition-colors leading-snug line-clamp-1">
                              {formatName(u.name)}
                            </h3>
                            {u.tuition_range_min_usd && (
                              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <span>${u.tuition_range_min_usd} – ${u.tuition_range_max_usd || u.tuition_range_min_usd} / ឆ្នាំ</span>
                              </div>
                            )}
                            {u.description && (
                              <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                                {formatName(u.description)}
                              </p>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => removeFavorite({ type: "university", id: u.id })}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer py-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t("favoritesPage.remove", "លុបចេញ")}</span>
                            </button>

                            <Link
                              href={`/universities/${u.slug}`}
                              className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>{t("favoritesPage.viewUniversity", "មើលសាកលវិទ្យាល័យ")}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-[#E6E8F0] shadow-2xs max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#111965]">
                      {t("favoritesPage.noUniversities", "មិនទាន់មានសាកលវិទ្យាល័យដែលបានរក្សាទុកនៅឡើយទេ")}
                    </h3>
                    <p className="text-xs text-[#68708A] max-w-sm mx-auto">
                      រុករកសាកលវិទ្យាល័យល្បីៗនៅកម្ពុជា ហើយចុចលើរូបចំណាំដើម្បីរក្សាទុកងាយស្រួលប្រៀបធៀប។
                    </p>
                  </div>
                  <Link
                    href="/universities"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                  >
                    <span>រុករកសាកលវិទ្យាល័យ (Explore Universities)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CAREERS TAB */}
          {/* ========================================================= */}
          {activeTab === "careers" && (
            <div>
              {favorites?.careers?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {favorites.careers.map((c: any) => (
                    <div
                      key={c.id}
                      className="rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group relative"
                    >
                      <div className="space-y-3">
                        {/* Industry & Bookmark */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#111965] flex items-center justify-center shadow-2xs">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {c.industry || "Technology"}
                            </span>
                          </div>

                          <BookmarkButton entityType="career" entityId={c.id} />
                        </div>

                        {/* Title & Metadata */}
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-[#111965] group-hover:text-[#B45309] transition-colors leading-snug">
                            {formatName(c.title)}
                          </h3>
                          <div className="text-xs text-[#68708A] font-mono flex items-center gap-2">
                            {c.riasec_code && (
                              <span className="font-bold text-[#111965] bg-[#F0F2FA] px-2 py-0.5 rounded-md">
                                RIASEC: {c.riasec_code}
                              </span>
                            )}
                            <span>•</span>
                            <span>{c.education_level || "បរិញ្ញាបត្រ (Bachelor)"}</span>
                          </div>
                        </div>

                        {c.description && (
                          <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                            {formatName(c.description)}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => removeFavorite({ type: "career", id: c.id })}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer py-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("favoritesPage.remove", "លុបចេញ")}</span>
                        </button>

                        <Link
                          href={`/careers/${c.slug}`}
                          className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>{t("favoritesPage.viewCareer", "មើលអាជីព")}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-[#E6E8F0] shadow-2xs max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#111965]">
                      {t("favoritesPage.noCareers", "មិនទាន់មានអាជីពដែលបានរក្សាទុកនៅឡើយទេ")}
                    </h3>
                    <p className="text-xs text-[#68708A] max-w-sm mx-auto">
                      ស្វែងយល់ពីអាជីពការងារដែលត្រូវនឹងបុគ្គលិកលក្ខណៈរបស់អ្នក ហើយរក្សាទុកសម្រាប់តាមដាន។
                    </p>
                  </div>
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                  >
                    <span>រុករកអាជីពការងារ (Explore Careers)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SCHOLARSHIPS TAB */}
          {/* ========================================================= */}
          {activeTab === "scholarships" && (
            <div>
              {favorites?.scholarships?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {favorites.scholarships.map((s: any) => {
                    const isFull = s.coverage_type === "FULL_TUITION" || s.coverage_type === "FULL_RIDE";
                    const coverageLabel = isFull
                      ? "100% Full Tuition"
                      : s.coverage_percentage
                      ? `${s.coverage_percentage}% Partial Coverage`
                      : s.coverage_type || "Scholarship";

                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group relative"
                      >
                        <div className="space-y-3">
                          {/* Coverage & Status & Bookmark */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                                  isFull
                                    ? "bg-[#FFF9E6] text-[#111965] border border-[#F7CE4D] shadow-2xs"
                                    : "bg-blue-50 text-blue-900 border border-blue-200"
                                }`}
                              >
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>{coverageLabel}</span>
                              </span>
                              {/* Tracking Status Dropdown */}
                              <select
                                value={s.status}
                                onChange={(e) => updateScholarshipStatus({ id: s.id, status: e.target.value })}
                                className="text-[12px] font-bold px-2 py-1 rounded-lg border border-[#E6E8F0] bg-[#F5F6FA] text-[#111965] cursor-pointer"
                              >
                                <option value="SAVED">{t("favoritesPage.statusSaved", "បានរក្សាទុក")}</option>
                                <option value="PLANNING_TO_APPLY">{t("favoritesPage.statusPlanning", "គ្រោងនឹងដាក់ពាក្យ")}</option>
                                <option value="APPLIED">{t("favoritesPage.statusApplied", "បានដាក់ពាក្យរួច")}</option>
                                <option value="WON">{t("favoritesPage.statusAwarded", "ទទួលបានអាហារូបករណ៍")}</option>
                              </select>
                            </div>

                            <BookmarkButton entityType="scholarship" entityId={s.id} className="flex-shrink-0" />
                          </div>

                          {/* Title & Provider */}
                          <div className="space-y-1">
                            <h3 className="text-base sm:text-lg font-black text-[#111965] group-hover:text-[#B45309] transition-colors leading-snug">
                              {formatName(s.title)}
                            </h3>
                            {s.provider && (
                              <div className="text-xs font-bold text-[#111965]">
                                {formatName(s.provider)}
                              </div>
                            )}
                          </div>

                          {/* Deadline */}
                          <div className="flex items-center gap-1.5 text-xs text-[#68708A]">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span>Deadline: {s.deadline || "Rolling / Ongoing"}</span>
                          </div>

                          {s.description && (
                            <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed">
                              {formatName(s.description)}
                            </p>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3 border-t border-[#E6E8F0] flex items-center justify-between gap-2 text-xs">
                          <button
                            onClick={() => removeFavorite({ type: "scholarship", id: s.id })}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer py-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t("favoritesPage.remove", "លុបចេញ")}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/scholarships/${s.slug}`}
                              className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>{t("favoritesPage.viewDetails", "ព័ត៌មានលម្អិត")}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            {s.official_url && (
                              <a
                                href={s.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111965] transition-colors cursor-pointer"
                                title="Official Website"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-[#E6E8F0] shadow-2xs max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#111965]">
                      {t("favoritesPage.noScholarships", "មិនទាន់មានអាហារូបករណ៍ដែលបានរក្សាទុកនៅឡើយទេ")}
                    </h3>
                    <p className="text-xs text-[#68708A] max-w-sm mx-auto">
                      តាមដានឱកាសអាហារូបករណ៍ ១០០% និងជំនួយហិរញ្ញវត្ថុដើម្បីកុំឱ្យខកខានកាលបរិច្ឆេទផុតកំណត់។
                    </p>
                  </div>
                  <Link
                    href="/scholarships"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                  >
                    <span>រុករកអាហារូបករណ៍ (Explore Scholarships)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
