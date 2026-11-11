"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/language-context";
import {
  ROLES_META,
  ARCHETYPE_META,
  ArchetypeMetaItem,
  RoleMeta,
  getCognitiveDimensions,
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
  Info,
  AlertCircle,
  Briefcase,
  BookOpen,
  ExternalLink,
  Layers,
  X,
  Search,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PublicPersonalityGuidePage() {
  const { t, getLocalized, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArchetypeCode, setActiveArchetypeCode] = useState<string | null>(null);

  const filteredArchetypes = Object.entries(ARCHETYPE_META).filter(
    ([code, meta]) => {
      const matchesRole = selectedRole === "all" || meta.role === selectedRole;
      if (!matchesRole) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        code.toLowerCase().includes(q) ||
        meta.nameEn.toLowerCase().includes(q) ||
        meta.nameKm.toLowerCase().includes(q) ||
        meta.taglineEn.toLowerCase().includes(q) ||
        meta.taglineKm.toLowerCase().includes(q) ||
        (meta.bestFieldsEn || []).some((f) => f.toLowerCase().includes(q)) ||
        (meta.bestFieldsKm || []).some((f) => f.toLowerCase().includes(q))
      );
    }
  );

  const activeArchetype: ArchetypeMetaItem | null =
    activeArchetypeCode && ARCHETYPE_META[activeArchetypeCode]
      ? ARCHETYPE_META[activeArchetypeCode]
      : null;

  const cognitiveDimensions = activeArchetypeCode
    ? getCognitiveDimensions(activeArchetypeCode)
    : [];

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
        {/* Modern Header & Live Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111965]/5 border border-[#111965]/10 text-[#111965] text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#111965]" />
              <span>{getLocalized({ km: "ស្វែងយល់តាមក្រុមតួនាទី", en: "Role Archetype Explorer" })}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111965] tracking-tight">
              {getLocalized({
                km: "តារាងប្រភេទបុគ្គលិកលក្ខណៈទាំង ១៦",
                en: "All 16 Personality Archetypes",
              })}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A] max-w-xl font-medium">
              {getLocalized({
                km: "ជ្រើសរើសក្រុមតួនាទី ឬវាយស្វែងរកដើម្បីស្វែងយល់លម្អិតអំពីបុគ្គលិកលក្ខណៈ និងមុខជំនាញសិក្សា",
                en: "Filter by role family or search to discover cognitive patterns, natural strengths, and university majors",
              })}
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getLocalized({
                km: "ស្វែងរក (ឧ. INTJ, Architect, Tech)...",
                en: "Search (e.g. INTJ, Architect, Tech)...",
              })}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-[#111965] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111965]/20 focus:border-[#111965] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modern Segmented Filter Dock (ReactBits Animated Tabs & 21st.dev Style) */}
        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#ECEFF6] border border-slate-200 shadow-inner">
            {/* All 16 Tab */}
            <button
              type="button"
              onClick={() => setSelectedRole("all")}
              className={`relative px-4 py-2 rounded-xl text-xs font-black transition-colors duration-200 cursor-pointer flex items-center gap-2 z-10 whitespace-nowrap select-none ${
                selectedRole === "all" ? "text-[#111965]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {selectedRole === "all" && (
                <motion.div
                  layoutId="activeFilterPill"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm border border-slate-200/80 z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D] fill-[#F7CE4D]/30" />
              <span>{getLocalized({ km: "ទាំងអស់ (All 16)", en: "All (16)" })}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors ${
                  selectedRole === "all" ? "bg-[#111965]/10 text-[#111965]" : "bg-slate-200/80 text-slate-600"
                }`}
              >
                16
              </span>
            </button>

            {/* 4 Role Family Tabs */}
            {ROLES_META.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black transition-colors duration-200 cursor-pointer flex items-center gap-2 z-10 whitespace-nowrap select-none ${
                    isSelected ? "text-[#111965]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-xl bg-white shadow-sm border border-slate-200/80 z-[-1]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs transition-transform"
                    style={{ backgroundColor: r.color }}
                  />
                  <span>{language === "km" ? r.nameKm : r.nameEn}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors"
                    style={{
                      backgroundColor: isSelected ? `${r.color}20` : "#DCE2EE",
                      color: isSelected ? r.color : "#475569",
                    }}
                  >
                    4
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 16 Modern Archetype Cards Grid (ReactBits Spotlight + 21st.dev Bento Style) */}
        {filteredArchetypes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-[#111965]">
              {getLocalized({ km: "រកមិនឃើញបុគ្គលិកលក្ខណៈត្រូវគ្នា", en: "No matching archetypes found" })}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {getLocalized({
                km: `មិនមានទិន្នន័យសម្រាប់ "${searchQuery}"។ សូមព្យាយាមស្វែងរកដោយប្រើពាក្យផ្សេង។`,
                en: `No results matching "${searchQuery}". Try searching by 4-letter code (e.g. INTP) or role.`,
              })}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("all");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#111965] text-white cursor-pointer"
            >
              {getLocalized({ km: "កំណត់ឡើងវិញ", en: "Reset Filters" })}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredArchetypes.map(([code, meta]) => {
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.22 }}
                    key={code}
                    onClick={() => setActiveArchetypeCode(code)}
                    className="relative group rounded-3xl bg-white border border-slate-200/90 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between space-y-4 cursor-pointer overflow-hidden"
                  >
                    {/* Ambient Role Spotlight Glow (ReactBits style) */}
                    <div
                      className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ backgroundColor: `${meta.roleColor}25` }}
                    />

                    <div className="space-y-3 relative z-10">
                      {/* Top Bar: Role Pill Tag + Ghost Monogram Watermark */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs"
                          style={{
                            backgroundColor: `${meta.roleColor}14`,
                            color: meta.roleColor,
                            borderColor: `${meta.roleColor}30`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: meta.roleColor }}
                          />
                          <span>{meta.roleNameEn}</span>
                        </div>

                        {/* Ghost Watermark Monogram */}
                        <span className="text-xl font-black tracking-widest text-slate-300/60 group-hover:text-slate-400/90 transition-colors select-none font-mono">
                          {code}
                        </span>
                      </div>

                      {/* Character Showcase Stage Pedestal (Luminous Spotlight Showcase Pod) */}
                      <div
                        className="relative w-full h-44 rounded-2xl flex flex-col items-center justify-center p-3 overflow-hidden border border-slate-100 group-hover:border-slate-200/80 transition-colors"
                        style={{
                          background: `radial-gradient(circle at 50% 65%, ${meta.roleColor}18 0%, transparent 75%), #F8FAFD`,
                        }}
                      >
                        <Image
                          src={`/images/personality-types/${code.toLowerCase()}.svg`}
                          alt={code}
                          width={115}
                          height={145}
                          className="object-contain max-h-36 drop-shadow-md transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-xl"
                        />

                        {/* 4-Letter Dichotomy Micro-Indicator at bottom of pedestal */}
                        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1">
                          {code.split("").map((letter, i) => (
                            <span
                              key={i}
                              className="w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center bg-white/90 text-[#111965] border border-slate-200/70 shadow-2xs"
                            >
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Archetype Title & Tagline */}
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-[#111965] leading-snug group-hover:text-blue-900 transition-colors">
                          {language === "km" ? meta.nameKm : meta.nameEn}
                        </h3>
                        <p className="text-xs text-[#68708A] line-clamp-2 leading-relaxed pt-0.5">
                          {getLocalized({ km: meta.taglineKm, en: meta.taglineEn })}
                        </p>
                      </div>

                      {/* Key Strengths Chips */}
                      {meta.strengthsKm && (
                        <div className="space-y-1 pt-0.5">
                          <span className="text-[9px] font-black text-[#68708A] uppercase tracking-wider">
                            {getLocalized({ km: "ចំណុចខ្លាំងចម្បង:", en: "Key Strengths:" })}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {((language === "km" ? meta.strengthsKm : meta.strengthsEn) || meta.strengthsKm || [])
                              .slice(0, 2)
                              .map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[120px]">{s}</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Best Academic Fields */}
                      {meta.bestFieldsKm && (
                        <div className="space-y-1 pt-0.5">
                          <span className="text-[9px] font-black text-[#68708A] uppercase tracking-wider">
                            {getLocalized({ km: "វិស័យសិក្សាសាកសម:", en: "Top Fields:" })}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {((language === "km" ? meta.bestFieldsKm : meta.bestFieldsEn) || meta.bestFieldsKm || [])
                              .slice(0, 2)
                              .map((f: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                                  style={{
                                    backgroundColor: `${meta.roleColor}10`,
                                    color: meta.roleColor,
                                    borderColor: `${meta.roleColor}25`,
                                  }}
                                >
                                  <Zap className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate max-w-[120px]">{f}</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Modern 21st.dev Interactive Row */}
                    <div className="pt-3 border-t border-slate-100 relative z-10 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 text-xs font-black text-[#111965] group-hover:text-blue-700 transition-colors">
                        <span>{getLocalized({ km: "ស្វែងយល់លម្អិត", en: "Explore Profile" })}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>

                      <Link
                        href="/dashboard/assessments/personality"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#111965] hover:bg-[#1A2580] text-white shadow-2xs transition-colors shrink-0"
                      >
                        <span>{getLocalized({ km: "តេស្ត", en: "Test" })}</span>
                        <Sparkles className="w-2.5 h-2.5 text-[#F7CE4D]" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
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

      {/* 5. INTERACTIVE BILINGUAL ARCHETYPE DETAIL MODAL */}
      {activeArchetype && activeArchetypeCode && (
        <Dialog
          open={!!activeArchetypeCode}
          onOpenChange={(open) => {
            if (!open) setActiveArchetypeCode(null);
          }}
          className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-8"
        >
          <div className="space-y-6">
            {/* Modal Header Hero */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1A2580] to-[#0F1654] text-white relative overflow-hidden">
              <div className="relative w-28 h-32 sm:w-32 sm:h-36 shrink-0 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-2">
                <Image
                  src={`/images/personality-types/${activeArchetypeCode.toLowerCase()}.svg`}
                  alt={activeArchetypeCode}
                  width={110}
                  height={130}
                  className="object-contain max-h-32 drop-shadow-md"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: activeArchetype.roleColor }}
                  >
                    {activeArchetype.roleNameEn} • {activeArchetype.roleNameKm}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#F7CE4D] text-[#111965]">
                    {activeArchetypeCode}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {language === "km" ? activeArchetype.nameKm : activeArchetype.nameEn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {language === "km" ? activeArchetype.nameEn : activeArchetype.nameKm}
                </p>

                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pt-1">
                  {getLocalized({
                    km: activeArchetype.taglineKm,
                    en: activeArchetype.taglineEn,
                  })}
                </p>
              </div>
            </div>

            {/* In-depth Overview */}
            {(activeArchetype.overviewKm || activeArchetype.overviewEn) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#68708A] uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-[#111965]" />
                  <span>
                    {getLocalized({ km: "អំពីបុគ្គលិកលក្ខណៈនេះ", en: "About This Archetype" })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#171A2C] leading-relaxed">
                  {getLocalized({
                    km: activeArchetype.overviewKm || activeArchetype.taglineKm,
                    en: activeArchetype.overviewEn || activeArchetype.taglineEn,
                  })}
                </p>
                {/* Secondary language snippet for full bilingual context */}
                <p className="text-xs text-[#68708A] italic leading-relaxed pt-1 border-t border-slate-100">
                  {language === "km"
                    ? activeArchetype.overviewEn || activeArchetype.taglineEn
                    : activeArchetype.overviewKm || activeArchetype.taglineKm}
                </p>
              </div>
            )}

            {/* Cognitive Dimensions Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#111965]" />
                <h3 className="text-sm sm:text-base font-black text-[#111965]">
                  {getLocalized({
                    km: `ទម្រង់ចិត្តគំនិតទាំង ៤ របស់ ${activeArchetypeCode}`,
                    en: `The 4 Cognitive Dimensions of ${activeArchetypeCode}`,
                  })}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cognitiveDimensions.map((dim, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6E8F0] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#111965]">
                        {getLocalized({ km: dim.nameKm, en: dim.nameEn })}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-[#111965] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {dim.letter}
                      </span>
                    </div>
                    <p className="text-xs text-[#68708A] leading-relaxed">
                      {getLocalized({ km: dim.traitKm, en: dim.traitEn })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Growth Areas Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {getLocalized({ km: "ចំណុចខ្លាំងសំខាន់ៗ", en: "Key Strengths" })}
                  </h4>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 font-medium">
                  {((language === "km" ? activeArchetype.strengthsKm : activeArchetype.strengthsEn) || activeArchetype.strengthsKm || []).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth Areas & Blindspots */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {getLocalized({ km: "ឱកាសអភិវឌ្ឍន៍ & ចំណុចខ្វះខាត", en: "Growth Areas & Blindspots" })}
                  </h4>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-amber-950 font-medium">
                  {((language === "km" ? activeArchetype.growthAreasKm : activeArchetype.growthAreasEn) || activeArchetype.growthAreasKm || [
                    language === "km" ? "អាចមានភាពតឹងតែងក្នុងកាលៈទេសៈសម្ពាធ" : "Can be rigid under stress",
                  ]).map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Learning Style & Classroom Preferences */}
            {(activeArchetype.learningStyleKm || activeArchetype.learningStyleEn) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F4FF] border border-[#D4DEF8] space-y-2">
                <div className="flex items-center gap-2 text-[#111965]">
                  <GraduationCap className="w-4 h-4 text-[#111965] shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {getLocalized({
                      km: "រចនាប័ទ្មសិក្សា & បរិយាកាសថ្នាក់រៀន",
                      en: "Learning Style & Ideal Study Environment",
                    })}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#171A2C] leading-relaxed">
                  {getLocalized({
                    km: activeArchetype.learningStyleKm || "",
                    en: activeArchetype.learningStyleEn || "",
                  })}
                </p>
              </div>
            )}

            {/* Recommended Cambodian University Majors */}
            {activeArchetype.recommendedMajors && activeArchetype.recommendedMajors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#111965]" />
                    <h4 className="text-xs sm:text-sm font-black text-[#111965] uppercase tracking-wider">
                      {getLocalized({
                        km: "មុខជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមនៅកម្ពុជា",
                        en: "Recommended University Majors in Cambodia",
                      })}
                    </h4>
                  </div>
                  <Link
                    href="/majors"
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>{getLocalized({ km: "មើលជំនាញទាំងអស់", en: "View All Majors" })}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeArchetype.recommendedMajors.map((m, idx) => (
                    <Link
                      key={idx}
                      href={`/majors/${m.slug}`}
                      className="p-3.5 rounded-2xl bg-white border border-[#E6E8F0] hover:border-[#111965] hover:shadow-md transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Top Match
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#111965]" />
                        </div>
                        <h5 className="text-xs sm:text-sm font-black text-[#111965] group-hover:text-blue-700 leading-snug">
                          {language === "km" ? m.titleKm : m.titleEn}
                        </h5>
                        <p className="text-[11px] text-[#68708A] line-clamp-2 mt-1 leading-relaxed">
                          {language === "km" ? m.reasonKm : m.reasonEn}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#111965] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                        <span>{getLocalized({ km: "ស្វែងយល់លម្អិត", en: "Learn More" })}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent Career Paths */}
            {activeArchetype.careersKm && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-2.5">
                <div className="flex items-center gap-2 text-[#111965]">
                  <Briefcase className="w-4 h-4 text-[#111965]" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {getLocalized({ km: "ឱកាសអាជីពការងារដែលត្រូវគ្នា", en: "Aligned Career Horizons" })}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {((language === "km" ? activeArchetype.careersKm : activeArchetype.careersEn) || activeArchetype.careersKm || []).map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#F0F2FA] text-[#111965] border border-[#E6E8F0]"
                    >
                      <Sparkles className="w-3 h-3 text-[#F7CE4D] shrink-0" />
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#E6E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveArchetypeCode(null)}
                className="w-full sm:w-auto rounded-xl text-xs font-bold"
              >
                {getLocalized({ km: "បិទផ្ទាំងនេះ", en: "Close" })}
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/majors"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F0F2FA] hover:bg-[#E6E8F0] text-[#111965] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{getLocalized({ km: "រុករកមុខជំនាញទាំងអស់", en: "Explore All Majors" })}</span>
                </Link>

                <Link
                  href="/dashboard/assessments/personality"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#111965] hover:bg-[#1A2580] text-white shadow-xs transition-all hover:scale-102"
                >
                  <Compass className="w-3.5 h-3.5 text-[#F7CE4D]" />
                  <span>
                    {getLocalized({
                      km: `ធ្វើតេស្តស្វែងរក ${activeArchetypeCode}`,
                      en: `Take Test to Match ${activeArchetypeCode}`,
                    })}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
