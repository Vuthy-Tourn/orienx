"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
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

const HERO_TOP_ARCHETYPES = [
  { code: "ENTJ", nameKm: "The Commander", role: "analysts", color: "#88619A" },
  { code: "ENTP", nameKm: "The Debater", role: "analysts", color: "#88619A" },
  { code: "INTJ", nameKm: "The Architect", role: "analysts", color: "#88619A" },
  { code: "INTP", nameKm: "The Logician", role: "analysts", color: "#88619A" },
  { code: "ENFJ", nameKm: "The Protagonist", role: "diplomats", color: "#33A474" },
  { code: "ENFP", nameKm: "The Campaigner", role: "diplomats", color: "#33A474" },
  { code: "INFJ", nameKm: "The Advocate", role: "diplomats", color: "#33A474" },
];

const HERO_LEFT_ARCHETYPE = { code: "ISTJ", nameKm: "The Logistician", role: "sentinels", color: "#4298B4" };
const HERO_RIGHT_ARCHETYPE = { code: "INFP", nameKm: "The Mediator", role: "diplomats", color: "#33A474" };

const HERO_BOTTOM_ARCHETYPES = [
  { code: "ESTJ", nameKm: "The Executive", role: "sentinels", color: "#4298B4" },
  { code: "ESFJ", nameKm: "The Consul", role: "sentinels", color: "#4298B4" },
  { code: "ISFJ", nameKm: "The Defender", role: "sentinels", color: "#4298B4" },
  { code: "ESTP", nameKm: "The Entrepreneur", role: "explorers", color: "#E4AE3A" },
  { code: "ESFP", nameKm: "The Entertainer", role: "explorers", color: "#E4AE3A" },
  { code: "ISTP", nameKm: "The Virtuoso", role: "explorers", color: "#E4AE3A" },
  { code: "ISFP", nameKm: "The Adventurer", role: "explorers", color: "#E4AE3A" },
];

// Clean, rhythmic floating wave: pure vertical levitation with zero tilt, zero sideways shake, zero distortion
const getWaveProps = (idx: number, isBottom = false) => {
  const delay = isBottom ? (6 - (idx % 7)) * 0.28 : (idx % 7) * 0.28;
  return {
    animate: {
      y: [0, -7, 0],
    },
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay,
    },
  };
};

export default function PublicPersonalityGuidePage() {
  const { t, getLocalized, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArchetypeCode, setActiveArchetypeCode] = useState<string | null>(null);

  // Smooth Mouse Parallax Physics (GPU-accelerated, zero React re-render overhead)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 70, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Layered depth transforms for top row, flanks, and bottom row
  const topRowX = useTransform(smoothMouseX, [-0.5, 0.5], [-14, 14]);
  const topRowY = useTransform(smoothMouseY, [-0.5, 0.5], [-8, 8]);

  const bottomRowX = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const bottomRowY = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);

  const leftFlankX = useTransform(smoothMouseX, [-0.5, 0.5], [-16, 10]);
  const leftFlankY = useTransform(smoothMouseY, [-0.5, 0.5], [-6, 6]);

  const rightFlankX = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 16]);
  const rightFlankY = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);

  // Spotlight coordinates in %
  const spotlightX = useTransform(smoothMouseX, [-0.5, 0.5], [20, 80]);
  const spotlightY = useTransform(smoothMouseY, [-0.5, 0.5], [20, 80]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Content Stagger
      gsap.fromTo(
        ".gsap-mbti-hero-anim",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      // 2. 4 Role Groups Cards
      gsap.fromTo(
        ".gsap-mbti-role-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-mbti-roles-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // 3. Section Header
      gsap.fromTo(
        ".gsap-mbti-section-header",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-mbti-section-header",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // 4. Archetype Grid Cards
      gsap.fromTo(
        ".gsap-mbti-archetype-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-mbti-archetypes-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // 5. CTA Banner
      gsap.fromTo(
        ".gsap-mbti-cta",
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-mbti-cta",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

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
      {/* 1. HERO SECTION WITH 16 ANIMATED VECTOR SVGS AS PURE BACKGROUND */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="hero-screen relative overflow-hidden bg-gradient-to-b from-[#080D2B] via-[#0F1754] to-[#0A0F36] text-white pt-24 pb-32 md:pb-36 lg:pb-40 px-4 sm:px-6 lg:px-8 select-none"
      >
        {/* Dynamic Cursor Spotlight Beam (Subtle Brand Tint) */}
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-30 z-0"
          style={{
            background: useMotionTemplate`radial-gradient(650px circle at ${spotlightX}% ${spotlightY}%, rgba(247, 206, 77, 0.06), transparent 70%)`,
          }}
        />

        {/* Futuristic Subtle Cosmic Grid Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#88619A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#33A474]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-1/4 w-[450px] h-[250px] bg-[#4298B4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-1/4 w-[450px] h-[250px] bg-[#E4AE3A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* LIVING BACKGROUND: 16 Vector Characters in Harmonious Floating Wave + Smooth Parallax */}
        <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none select-none flex flex-col justify-between pt-6 sm:pt-12 pb-24 sm:pb-28 px-1 sm:px-4 md:px-8 z-0">
          {/* TOP ROW: 7 Characters (Analysts & Diplomats) */}
          <motion.div
            style={{ x: topRowX, y: topRowY }}
            className="flex items-end justify-between px-0.5 sm:px-2 will-change-transform"
          >
            {HERO_TOP_ARCHETYPES.map((arch, idx) => {
              const motionProps = getWaveProps(idx, false);
              return (
                <motion.div
                  key={arch.code}
                  animate={motionProps.animate}
                  transition={motionProps.transition}
                  className="flex items-center justify-center shrink-0"
                >
                  <div className="relative h-14 sm:h-22 lg:h-32 w-11 sm:w-16 lg:w-24 flex items-center justify-center">
                    <Image
                      src={`/images/personality-types/${arch.code.toLowerCase()}.svg`}
                      alt={arch.code}
                      width={100}
                      height={120}
                      className="max-h-14 sm:max-h-22 lg:max-h-32 w-auto object-contain"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* MIDDLE FLANKS: Left ISTJ, Right INFP */}
          <div className="flex items-center justify-between px-2 my-2">
            {/* Left Flank: ISTJ */}
            <motion.div
              style={{ x: leftFlankX, y: leftFlankY }}
              className="hidden sm:flex items-center justify-center pl-2 shrink-0 will-change-transform"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="relative h-26 sm:h-30 lg:h-36 w-20 sm:w-24 lg:w-28 flex items-center justify-center"
              >
                <Image
                  src={`/images/personality-types/${HERO_LEFT_ARCHETYPE.code.toLowerCase()}.svg`}
                  alt={HERO_LEFT_ARCHETYPE.code}
                  width={110}
                  height={130}
                  className="max-h-26 sm:max-h-30 lg:max-h-36 object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Right Flank: INFP */}
            <motion.div
              style={{ x: rightFlankX, y: rightFlankY }}
              className="hidden sm:flex items-center justify-center pr-2 shrink-0 will-change-transform"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                className="relative h-26 sm:h-30 lg:h-36 w-20 sm:w-24 lg:w-28 flex items-center justify-center"
              >
                <Image
                  src={`/images/personality-types/${HERO_RIGHT_ARCHETYPE.code.toLowerCase()}.svg`}
                  alt={HERO_RIGHT_ARCHETYPE.code}
                  width={110}
                  height={130}
                  className="max-h-26 sm:max-h-30 lg:max-h-36 object-contain"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* BOTTOM ROW: 7 Characters (Sentinels & Explorers) */}
          <motion.div
            style={{ x: bottomRowX, y: bottomRowY }}
            className="flex items-start justify-between px-0.5 sm:px-2 will-change-transform"
          >
            {HERO_BOTTOM_ARCHETYPES.map((arch, idx) => {
              const motionProps = getWaveProps(idx, true);
              return (
                <motion.div
                  key={arch.code}
                  animate={motionProps.animate}
                  transition={motionProps.transition}
                  className="flex items-center justify-center shrink-0"
                >
                  <div className="relative h-14 sm:h-22 lg:h-32 w-11 sm:w-16 lg:w-24 flex items-center justify-center">
                    <Image
                      src={`/images/personality-types/${arch.code.toLowerCase()}.svg`}
                      alt={arch.code}
                      width={100}
                      height={120}
                      className="max-h-14 sm:max-h-22 lg:max-h-32 w-auto object-contain"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* FOREGROUND HERO CONTENT (Crisp, High-Contrast & Interactive) */}
        <div className="max-w-2xl mx-auto text-center space-y-3 sm:space-y-4 relative z-10 my-6 sm:my-14 lg:my-16 py-2 sm:py-4 px-2 sm:px-4">
          <div className="gsap-mbti-hero-anim inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[12.5px] sm:text-xs font-black bg-white/10 backdrop-blur-md text-[#F7CE4D] border border-white/20 shadow-xs uppercase tracking-wider">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F7CE4D]" />
            <span>NERIS & 16Personalities Standard</span>
          </div>

          <h1 className="gsap-mbti-hero-anim text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {language === "km"
              ? "មគ្គុទ្ទេសក៍បុគ្គលិកលក្ខណៈទាំង ១៦"
              : "The 16 Personality Types Guide"}
          </h1>

          <p className="gsap-mbti-hero-anim text-xs sm:text-sm lg:text-base text-slate-300 font-bold">
            {language === "km"
              ? "The 16 Personality Types Guide"
              : "Discover Your Cognitive Strengths, Temperament & Ideal Majors"}
          </p>

          <p className="gsap-mbti-hero-anim text-xs sm:text-sm text-slate-200/95 max-w-lg mx-auto font-medium leading-relaxed drop-shadow-xs">
            {getLocalized({
              km: "ស្វែងយល់ពីទម្រង់ចិត្តគំនិត ទេពកោសល្យពីកំណើត របៀបសិក្សា និងមុខជំនាញសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុតសម្រាប់បុគ្គលិកលក្ខណៈនីមួយៗ។",
              en: "Explore cognitive strengths, natural tendencies, learning styles, and ideal university majors across all 16 official personality archetypes.",
            })}
          </p>

          <div className="gsap-mbti-hero-anim pt-2 sm:pt-3">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#F7CE4D] hover:bg-[#E5BD3B] text-[#111965] shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gsap-mbti-roles-grid">
          {ROLES_META.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id === selectedRole ? "all" : role.id)}
              type="button"
              className={`gsap-mbti-role-card p-5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
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
                  className="px-2.5 py-0.5 rounded-full text-[12px] font-black uppercase tracking-wider text-white"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-8">
        {/* Modern Header & Live Search */}
        <div className="gsap-mbti-section-header flex flex-col md:flex-row md:items-end justify-between gap-5">
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
                className={`px-1.5 py-0.5 rounded-md text-[12.5px] font-black transition-colors ${
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
                    className="px-1.5 py-0.5 rounded-md text-[12.5px] font-black transition-colors"
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
            key={selectedRole + (searchQuery ? `-${searchQuery}` : "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="gsap-mbti-archetypes-grid grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredArchetypes.map(([code, meta]) => {
              return (
                <div
                  key={code}
                  onClick={() => setActiveArchetypeCode(code)}
                  className="gsap-mbti-archetype-card relative group rounded-3xl bg-white border border-slate-200/90 hover:border-[#111965]/40 p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col sm:flex-row gap-5 cursor-pointer overflow-hidden"
                >
                  {/* LEFT / TOP: Character Showcase Stage Pedestal */}
                  <div
                    className="relative w-full sm:w-44 md:w-48 shrink-0 rounded-2xl flex flex-col items-center justify-between p-3.5 overflow-hidden border border-slate-100 group-hover:border-slate-200 transition-colors"
                    style={{
                      background: `radial-gradient(circle at 50% 60%, ${meta.roleColor}14 0%, transparent 75%), #F8FAFD`,
                    }}
                  >
                    {/* Ghost Watermark Monogram */}
                    <span className="absolute top-2 right-2.5 text-base font-black tracking-widest text-slate-300/60 group-hover:text-slate-400 transition-colors select-none font-mono">
                      {code}
                    </span>

                    {/* Role Pill */}
                    <div
                      className="self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12.5px] font-black uppercase tracking-wider border shadow-2xs"
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

                    {/* Vector Character Image */}
                    <div className="relative w-full h-32 sm:h-36 flex items-center justify-center my-1.5">
                      <Image
                        src={`/images/personality-types/${code.toLowerCase()}.svg`}
                        alt={code}
                        width={110}
                        height={140}
                        className="object-contain max-h-32 transition-transform duration-200 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* 4-Letter Dichotomy Micro-Indicator */}
                    <div className="flex items-center justify-center gap-1 w-full pt-1">
                      {code.split("").map((letter, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-md text-[12px] font-black flex items-center justify-center bg-white text-[#111965] border border-slate-200 shadow-2xs"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Detailed Content, Full Strengths & Fields, Action CTAs */}
                  <div className="flex-1 flex flex-col justify-between space-y-3.5 relative z-10 min-w-0">
                    <div className="space-y-2">
                      {/* Archetype Title & Tagline */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-black text-[#111965] group-hover:text-blue-900 transition-colors">
                            {language === "km" ? meta.nameKm : meta.nameEn}
                          </h3>
                          <span className="text-[12.5px] font-bold text-[#68708A] bg-slate-100 px-2 py-0.5 rounded-md sm:hidden">
                            {code}
                          </span>
                        </div>
                        <p className="text-xs text-[#68708A] leading-relaxed pt-0.5 line-clamp-2">
                          {getLocalized({ km: meta.taglineKm, en: meta.taglineEn })}
                        </p>
                      </div>

                      {/* Key Strengths (Full text, No Truncation!) */}
                      {meta.strengthsKm && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[12px] font-black text-[#68708A] uppercase tracking-wider">
                            {getLocalized({ km: "ចំណុចខ្លាំងចម្បង:", en: "Key Strengths:" })}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {((language === "km" ? meta.strengthsKm : meta.strengthsEn) || meta.strengthsKm || [])
                              .slice(0, 2)
                              .map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-100"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{s}</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Best Academic Fields (Full text, No Truncation!) */}
                      {meta.bestFieldsKm && (
                        <div className="space-y-1 pt-0.5">
                          <span className="text-[12px] font-black text-[#68708A] uppercase tracking-wider">
                            {getLocalized({ km: "វិស័យសិក្សាសាកសម:", en: "Top Fields:" })}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {((language === "km" ? meta.bestFieldsKm : meta.bestFieldsEn) || meta.bestFieldsKm || [])
                              .slice(0, 2)
                              .map((f: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold border"
                                  style={{
                                    backgroundColor: `${meta.roleColor}0E`,
                                    color: meta.roleColor,
                                    borderColor: `${meta.roleColor}30`,
                                  }}
                                >
                                  <Zap className="w-3 h-3 shrink-0" />
                                  <span>{f}</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Interactive Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1 text-xs font-black text-[#111965] group-hover:text-blue-700 transition-colors">
                        <span>{getLocalized({ km: "ស្វែងយល់លម្អិត", en: "Explore Profile" })}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>

                      <Link
                        href="/dashboard/assessments/personality"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#111965] hover:bg-[#1A2580] text-white shadow-2xs transition-colors shrink-0"
                      >
                        <span>{getLocalized({ km: "ធ្វើតេស្ត", en: "Take Test" })}</span>
                        <Sparkles className="w-3 h-3 text-[#F7CE4D]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* 4. BOTTOM CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="gsap-mbti-cta p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111965] via-[#1B277F] to-[#0E1552] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-[#111965]/40">
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
          className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar p-0 sm:p-0"
          hideClose
        >
          {/* Sticky header: stays pinned while the details scroll under it */}
          <div className="sticky top-0 z-20 flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-gradient-to-r from-[#111965] via-[#1A2580] to-[#0F1654] px-5 py-5 sm:px-8 sm:py-6 text-white relative overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveArchetypeCode(null)}
              aria-label={language === "km" ? "បិទ" : "Close"}
              className="absolute right-3 top-3 z-30 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-4 sm:top-4"
            >
              <X className="h-4 w-4" />
            </button>
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

          <div className="space-y-6 p-5 sm:p-8">
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
                          <span className="text-[12.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Top Match
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#111965]" />
                        </div>
                        <h5 className="text-xs sm:text-sm font-black text-[#111965] group-hover:text-blue-700 leading-snug">
                          {language === "km" ? m.titleKm : m.titleEn}
                        </h5>
                        <p className="text-[12px] text-[#68708A] line-clamp-2 mt-1 leading-relaxed">
                          {language === "km" ? m.reasonKm : m.reasonEn}
                        </p>
                      </div>
                      <span className="text-[12px] font-bold text-[#111965] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
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
