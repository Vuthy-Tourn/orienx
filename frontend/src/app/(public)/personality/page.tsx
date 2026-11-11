"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  ROLES_META,
  ARCHETYPE_META,
  ArchetypeMetaItem,
  RoleMeta,
} from "@/lib/personality-meta";
import {
  Compass,
  Sparkles,
  ArrowRight,
  Brain,
  GraduationCap,
  Target,
  Zap,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicPersonalityGuidePage() {
  const { t, getLocalized, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

  const filteredArchetypes = Object.entries(ARCHETYPE_META).filter(
    ([_, meta]) => selectedRole === "all" || meta.role === selectedRole
  );

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#111965] selection:bg-[#F7CE4D] selection:text-[#111965] pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#111965] via-[#16217A] to-[#0D144F] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F7CE4D]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 backdrop-blur-md text-[#F7CE4D] border border-white/20 shadow-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>NERIS & 16Personalities Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {getLocalized({
              km: "មគ្គុទ្ទេសក៍បុគ្គលិកលក្ខណៈទាំង ១៦",
              en: "The 16 Personality Types Guide",
            })}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
            {getLocalized({
              km: "ស្វែងយល់ពីទម្រង់ចិត្តគំនិត ទេពកោសល្យពីកំណើត របៀបសិក្សា និងមុខជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុតសម្រាប់បុគ្គលិកលក្ខណៈនីមួយៗ។",
              en: "Explore cognitive strengths, natural tendencies, learning styles, and ideal university majors across all 16 official personality archetypes.",
            })}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black bg-[#F7CE4D] hover:bg-[#E5BD3B] text-[#111965] shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#111965]" />
              <span>
                {getLocalized({
                  km: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈរបស់អ្នក (ឥតគិតថ្លៃ)",
                  en: "Take Free Personality Assessment",
                })}
              </span>
              <ArrowRight className="w-4 h-4 text-[#111965]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE 4 ROLE GROUPS BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES_META.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id === selectedRole ? "all" : role.id)}
              type="button"
              className={`p-5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
                selectedRole === role.id
                  ? "bg-white ring-2 shadow-md"
                  : "bg-white hover:shadow hover:-translate-y-0.5"
              }`}
              style={{
                borderColor: selectedRole === role.id ? role.color : "#E6E8F0",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: role.color }}
                >
                  {role.nameEn}
                </span>
                <span className="text-xs font-bold text-[#68708A]">
                  4 Types
                </span>
              </div>
              <h3 className="text-base font-black text-[#111965]">
                {role.nameKm}
              </h3>
              <p className="text-xs text-[#68708A] line-clamp-2 mt-1 leading-relaxed">
                {getLocalized({ km: role.descriptionKm, en: role.descriptionEn })}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE 16 ARCHETYPES EXPLORER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-8">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E8F0] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111965] tracking-tight">
              {getLocalized({
                km: "តារាងប្រភេទបុគ្គលិកលក្ខណៈទាំង ១៦",
                en: "All 16 Personality Archetypes",
              })}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              {getLocalized({
                km: "ចុចលើប្រភេទនីមួយៗដើម្បីស្វែងយល់លម្អិតអំពីចំណុចខ្លាំង និងមុខជំនាញសិក្សា",
                en: "Select any archetype to explore detailed cognitive profile and recommended study paths",
              })}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedRole("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === "all"
                  ? "bg-[#111965] text-white shadow-2xs"
                  : "bg-white text-[#68708A] hover:bg-[#E6E8F0] border border-[#E6E8F0]"
              }`}
            >
              {getLocalized({ km: "ទាំងអស់ (All 16)", en: "All (16)" })}
            </button>
            {ROLES_META.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRole === r.id
                    ? "bg-[#111965] text-white shadow-2xs"
                    : "bg-white text-[#68708A] hover:bg-[#E6E8F0] border border-[#E6E8F0]"
                }`}
              >
                {r.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* 16 Archetype Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredArchetypes.map(([code, meta]) => {
            const roleData = ROLES_META.find((r) => r.id === meta.role);

            return (
              <div
                key={code}
                className="p-5 rounded-3xl bg-white border border-[#E6E8F0] hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top Role Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                      style={{ backgroundColor: meta.roleColor }}
                    >
                      {meta.roleNameEn}
                    </span>
                    <span className="text-xs font-black text-[#68708A]">
                      {code}
                    </span>
                  </div>

                  {/* Character Illustration */}
                  <div className="relative h-40 flex items-center justify-center py-2 bg-[#F8FAFD] rounded-2xl group-hover:bg-[#F0F2FA] transition-colors">
                    <Image
                      src={`/images/personality-types/${code.toLowerCase()}.svg`}
                      alt={code}
                      width={110}
                      height={140}
                      className="object-contain max-h-36 drop-shadow-sm transition-transform group-hover:scale-108"
                    />
                  </div>

                  {/* Archetype Title & Tagline */}
                  <div>
                    <h3 className="text-base font-black text-[#111965] leading-snug">
                      {getLocalized({ km: meta.nameKm, en: meta.nameEn })}
                    </h3>
                    <p className="text-xs text-[#68708A] line-clamp-2 mt-1 leading-relaxed">
                      {getLocalized({ km: meta.taglineKm, en: meta.taglineEn })}
                    </p>
                  </div>

                  {/* Strengths Chips */}
                  {meta.strengthsKm && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-[#68708A] uppercase tracking-wider">
                        {getLocalized({ km: "ចំណុចខ្លាំង:", en: "Key Strengths:" })}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {((language === "km" ? meta.strengthsKm : meta.strengthsEn) || meta.strengthsKm || []).slice(0, 2).map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F0F2FA] text-[#111965]"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Academic Fields */}
                  {meta.bestFieldsKm && (
                    <div className="space-y-1 pt-1 border-t border-[#E6E8F0]/70">
                      <span className="text-[10px] font-bold text-[#68708A] uppercase tracking-wider">
                        {getLocalized({ km: "វិស័យសិក្សាសាកសម:", en: "Top Fields:" })}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {((language === "km" ? meta.bestFieldsKm : meta.bestFieldsEn) || meta.bestFieldsKm || []).slice(0, 2).map((f: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-100"
                          >
                            <Zap className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-[#E6E8F0]">
                  <Link
                    href={`/dashboard/assessments/personality`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#111965] hover:bg-[#1A2580] text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>{getLocalized({ km: `ធ្វើតេស្តស្វែងរក ${code}`, en: `Test for ${code}` })}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BOTTOM CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1B277F] to-[#0E1552] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-[#111965]/40">
          <div className="space-y-3 max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-[#F7CE4D] border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
              <span>Free Student Career Orientation</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {getLocalized({
                km: "តើអ្នកចង់ដឹងថាខ្លួនឯងត្រូវនឹងបុគ្គលិកលក្ខណៈមួយណា?",
                en: "Curious to find which of the 16 personalities fits you best?",
              })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {getLocalized({
                km: "ចំណាយពេលត្រឹមតែ ៥ ទៅ ១០ នាទី ដើម្បីធ្វើតេស្តបុគ្គលិកលក្ខណៈតាមស្តង់ដារ និងទទួលបានអនុសាសន៍ជំនាញសាកលវិទ្យាល័យដែលត្រូវនឹងអ្នកបំផុត។",
                en: "Take just 5-10 minutes to complete the assessment and receive explainable personalized recommendations for Cambodian universities and majors.",
              })}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black bg-[#F7CE4D] hover:bg-[#E5BD3B] text-[#111965] shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-4 h-4 text-[#111965]" />
              <span>{getLocalized({ km: "ចាប់ផ្តើមធ្វើតេស្តឥឡូវនេះ", en: "Start Free Assessment" })}</span>
              <ArrowRight className="w-4 h-4 text-[#111965]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
