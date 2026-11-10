"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Search,
  Compass,
  ArrowRight,
  Sparkles,
  Building2,
  X,
  LayoutGrid,
  List,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Zap,
  FlaskConical,
  Layers,
  BookOpen,
  Cpu,
  BarChart3,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Award,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Dialog } from "@/components/ui/dialog";

// Local image lookup for Cambodian majors
const MAJOR_IMAGES: Record<string, string> = {
  "software-engineering": "/images/majors/software-engineering.webp",
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

// Curriculum preview roadmap data for interactive modal
const MAJOR_CURRICULUM_DATA: Record<string, {
  years: { year: number; titleEn: string; titleKm: string; focus: string }[];
  keySkills: string[];
  sampleCareers: string[];
}> = {
  "software-engineering": {
    years: [
      { year: 1, titleEn: "Computer Science Foundations", titleKm: "មូលដ្ឋានគ្រឹះវិទ្យាសាស្ត្រកុំព្យូទ័រ", focus: "Python, C++, Discrete Math, Algorithms" },
      { year: 2, titleEn: "Software Architecture & OOP", titleKm: "ស្ថាបត្យកម្មប្រព័ន្ធ និង OOP", focus: "Java, Data Structures, Relational Databases, Web Tech" },
      { year: 3, titleEn: "Cloud Systems & DevOps", titleKm: "ប្រព័ន្ធក្លោដ និង DevOps", focus: "Distributed Systems, Microservices, CI/CD, Cybersecurity" },
      { year: 4, titleEn: "Capstone & Industry Internship", titleKm: "គម្រោងបញ្ចប់ការសិក្សា និងកម្មសិក្សា", focus: "Full-Stack Production Capstone, Corporate Placement" },
    ],
    keySkills: ["System Design", "Cloud Computing", "Full-Stack Development", "Database Optimization"],
    sampleCareers: ["Full-Stack Software Engineer", "Cloud Solutions Architect", "DevOps Engineer"],
  },
  "data-science-ai": {
    years: [
      { year: 1, titleEn: "Mathematics & Programming", titleKm: "គណិតវិទ្យា និងការសរសេរកូដ", focus: "Linear Algebra, Calculus, Python, Statistics" },
      { year: 2, titleEn: "Data Mining & Databases", titleKm: "ការទាញយកទិន្នន័យ និងមូលដ្ឋានទិន្នន័យ", focus: "SQL, NoSQL, Data Visualization, Exploratory Analysis" },
      { year: 3, titleEn: "Machine Learning & NLP", titleKm: "ការរៀនម៉ាស៊ីន និង NLP", focus: "Supervised Learning, Deep Neural Networks, PyTorch" },
      { year: 4, titleEn: "AI Capstone & Applied Analytics", titleKm: "គម្រោង AI និងការវិភាគអនុវត្តជាក់ស្តែង", focus: "LLM Fine-Tuning, Predictive Modeling, Industry Thesis" },
    ],
    keySkills: ["Machine Learning", "Statistical Modeling", "Python/R", "Big Data Pipelines"],
    sampleCareers: ["AI/ML Engineer", "Data Scientist", "Business Intelligence Lead"],
  },
  "banking-finance": {
    years: [
      { year: 1, titleEn: "Micro & Macro Economics", titleKm: "សេដ្ឋកិច្ចមីក្រូ និងម៉ាក្រូ", focus: "Financial Accounting, Economic Principles, Business Math" },
      { year: 2, titleEn: "Corporate Finance & Banking Law", titleKm: "ហិរញ្ញវត្ថុសាជីវកម្ម និងច្បាប់ធនាគារ", focus: "Commercial Banking, Capital Markets, Valuation" },
      { year: 3, titleEn: "Investment Analysis & FinTech", titleKm: "ការវិភាគការវិនិយោគ និង FinTech", focus: "Portfolio Management, Risk Modeling, Digital Banking" },
      { year: 4, titleEn: "Applied Financial Practicum", titleKm: "ការអនុវត្តហិរញ្ញវត្ថុជាក់ស្តែង", focus: "Commercial Credit Evaluation, Banking Internship" },
    ],
    keySkills: ["Financial Modeling", "Risk Management", "Investment Valuation", "Regulatory Compliance"],
    sampleCareers: ["Investment Banker", "Risk Analyst", "Financial Controller"],
  },
  "civil-engineering": {
    years: [
      { year: 1, titleEn: "Engineering Physics & Mechanics", titleKm: "រូបវិទ្យាវិស្វកម្ម និងមេកានិច", focus: "Statics, Calculus, Engineering Graphics, Chemistry" },
      { year: 2, titleEn: "Structural Mechanics & Materials", titleKm: "មេកានិចសំណង់ និងសម្ភារ", focus: "Strength of Materials, Fluid Mechanics, Surveying" },
      { year: 3, titleEn: "Reinforced Concrete & Geotechnical", titleKm: "បេតុងអាម៉េ និងភូគព្ភសាស្ត្រ", focus: "Foundation Engineering, Structural Analysis, CAD/BIM" },
      { year: 4, titleEn: "Infrastructure Capstone", titleKm: "គម្រោងហេដ្ឋារចនាសម្ព័ន្ធ", focus: "Bridge & Highway Design, Project Management Internship" },
    ],
    keySkills: ["Structural Analysis", "AutoCAD / BIM", "Project Management", "Soil Mechanics"],
    sampleCareers: ["Structural Engineer", "Project Construction Manager", "Site Supervisor"],
  },
};

// Holland RIASEC display helpers without emojis
const RIASEC_NAMES: Record<string, { en: string; km: string; color: string }> = {
  R: { en: "Realistic (Practical)", km: "ជាក់ស្តែង (អនុវត្ត)", color: "bg-amber-50 text-amber-900 border-amber-200" },
  I: { en: "Investigative (Analytical)", km: "ស្រាវជ្រាវ (វិភាគ)", color: "bg-blue-50 text-blue-900 border-blue-200" },
  A: { en: "Artistic (Creative)", km: "សិល្បៈ (ច្នៃប្រឌិត)", color: "bg-purple-50 text-purple-900 border-purple-200" },
  S: { en: "Social (Supportive)", km: "សង្គម (ជួយអ្នកដទៃ)", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  E: { en: "Enterprising (Leadership)", km: "សហគ្រិន (ដឹកនាំ)", color: "bg-orange-50 text-orange-900 border-orange-200" },
  C: { en: "Conventional (Organized)", km: "ការិយាល័យ (រៀបរយ)", color: "bg-slate-50 text-slate-800 border-slate-200" },
};

export default function MajorsPage() {
  const { t, getLocalized, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stemOnly, setStemOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "name" | "universities">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activePreviewMajor, setActivePreviewMajor] = useState<any | null>(null);

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

  // Sorting
  const sortedMajors = useMemo(() => {
    if (!majors) return [];
    const list = [...majors];
    if (sortBy === "name") {
      list.sort((a, b) => {
        const nameA = getLocalized(a.name) || "";
        const nameB = getLocalized(b.name) || "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "universities") {
      list.sort((a, b) => (b.universities_count || 0) - (a.universities_count || 0));
    }
    return list;
  }, [majors, sortBy, getLocalized]);

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || stemOnly);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStemOnly(false);
  };

  // Featured flagship major (Software Engineering)
  const flagshipMajor = useMemo(() => {
    if (!majors || majors.length === 0) return null;
    return majors.find((m) => m.slug === "software-engineering") || majors[0];
  }, [majors]);

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero Section with Magic UI DotPattern */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-12 pb-14">
        <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-bold border border-[#111965]/15">
              <Compass className="w-3.5 h-3.5 text-[#111965]" />
              <span>{t("majorsDirectory.badge")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111965] tracking-tight leading-tight">
              {t("majorsDirectory.title")}
            </h1>

            <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
              {t("majorsDirectory.subtitle")}
            </p>
          </div>

          {/* Interactive Category Barometer Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                !selectedCategory
                  ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                  : "bg-white text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
              }`}
            >
              <div className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">All Fields</div>
              <div className="text-lg font-black mt-0.5">{majors?.length || 6}+ Majors</div>
              <div className="text-[11px] opacity-75 mt-0.5">Explore Complete Catalog</div>
            </button>

            <button
              onClick={() => setSelectedCategory("Information Technology")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedCategory === "Information Technology"
                  ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                  : "bg-white text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Tech & AI</span>
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-lg font-black mt-0.5">IT & Software</div>
              <div className="text-[11px] opacity-75 mt-0.5">4-Year Degree • High Demand</div>
            </button>

            <button
              onClick={() => setSelectedCategory("Engineering")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedCategory === "Engineering"
                  ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                  : "bg-white text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Infrastructure</span>
                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-black mt-0.5">Engineering</div>
              <div className="text-[11px] opacity-75 mt-0.5">5-Year Diplôme d'Ingénieur / B.Eng</div>
            </button>

            <button
              onClick={() => setSelectedCategory("Business & Economics")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedCategory === "Business & Economics"
                  ? "bg-[#111965] text-white border-[#111965] shadow-sm"
                  : "bg-white text-[#171A2C] border-[#E6E8F0] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Commerce</span>
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-lg font-black mt-0.5">Finance & Banking</div>
              <div className="text-[11px] opacity-75 mt-0.5">FinTech & Corporate Strategy</div>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Asymmetrical Magazine-Style Flagship Spotlight Card */}
        {flagshipMajor && !hasActiveFilters && (
          <div className="relative rounded-3xl bg-white border border-[#E6E8F0] shadow-sm overflow-hidden p-6 sm:p-8">
            <BorderBeam size={220} duration={14} delay={0} borderWidth={1.5} colorFrom="#F7CE4D" colorTo="#111965" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Major Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#111965] text-white">
                    Featured Curriculum
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Top Choice in Cambodia</span>
                  </span>
                  <span className="text-xs font-mono text-[#68708A]">
                    RIASEC: {flagshipMajor.riasec_primary}-{flagshipMajor.riasec_secondary}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#111965] leading-snug">
                  {getLocalized(flagshipMajor.name)}
                </h2>

                <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed line-clamp-3">
                  {getLocalized(flagshipMajor.description)}
                </p>

                {/* 4-Year Academic Progression preview */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-[#111965] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#111965]" />
                    <span>4-Year Academic Milestone Pathway</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="text-[10px] font-bold text-[#111965]">Year 1</div>
                      <div className="text-[11px] font-semibold text-[#171A2C] leading-tight">Foundations</div>
                      <div className="text-[10px] text-[#68708A]">Algorithms & OOP</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="text-[10px] font-bold text-[#111965]">Year 2</div>
                      <div className="text-[11px] font-semibold text-[#171A2C] leading-tight">Architecture</div>
                      <div className="text-[10px] text-[#68708A]">Databases & APIs</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="text-[10px] font-bold text-[#111965]">Year 3</div>
                      <div className="text-[11px] font-semibold text-[#171A2C] leading-tight">Cloud & Systems</div>
                      <div className="text-[10px] text-[#68708A]">DevOps & Security</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="text-[10px] font-bold text-[#111965]">Year 4</div>
                      <div className="text-[11px] font-semibold text-[#171A2C] leading-tight">Capstone</div>
                      <div className="text-[10px] text-[#68708A]">Internship Placement</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActivePreviewMajor(flagshipMajor)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Quick Curriculum Breakdown</span>
                  </button>

                  <Link
                    href={`/majors/${flagshipMajor.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span>{t("majorsDirectory.details")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Artwork */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md border border-[#E6E8F0] bg-slate-100">
                  <Image
                    src={MAJOR_IMAGES[flagshipMajor.slug] || "/images/majors/software-engineering.webp"}
                    alt={getLocalized(flagshipMajor.name) || "Major"}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#F7CE4D] tracking-wider block">
                      Accredited Cambodian Institutions
                    </span>
                    <div className="text-xs font-semibold text-white">
                      RUPP, ITC, CADT, Paragon IU & AUPP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Filter Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#68708A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("majorsDirectory.searchPlaceholder")}
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

            {/* STEM Toggle */}
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => setStemOnly(!stemOnly)}
                className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  stemOnly
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                    : "bg-[#F5F6FA]/60 border-[#E6E8F0] text-[#171A2C] hover:bg-slate-100"
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-blue-700" />
                <span>{t("majorsDirectory.filterStem")}</span>
                {stemOnly && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            </div>

            {/* Sort & View Mode */}
            <div className="sm:col-span-3 flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-[#E6E8F0] bg-white text-[#171A2C] focus:outline-hidden focus:border-[#111965]"
              >
                <option value="default">{t("majorsDirectory.sortBy")}</option>
                <option value="name">{t("majorsDirectory.sortAlphabetical")}</option>
                <option value="universities">{t("majorsDirectory.sortPopular")}</option>
              </select>

              {/* Grid / List View Toggle */}
              <div className="hidden md:flex items-center border border-[#E6E8F0] rounded-xl p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-[#111965] shadow-2xs font-bold"
                      : "text-[#68708A] hover:text-[#171A2C]"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#111965] shadow-2xs font-bold"
                      : "text-[#68708A] hover:text-[#171A2C]"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E8F0]/80">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !selectedCategory
                  ? "bg-[#111965] text-white shadow-xs"
                  : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C] hover:bg-slate-200/70"
              }`}
            >
              {t("majorsDirectory.allCategories")}
            </button>
            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#111965] text-white shadow-xs"
                    : "bg-[#F5F6FA] text-[#68708A] hover:text-[#171A2C] hover:bg-slate-200/70"
                }`}
              >
                {t(`categories.${cat}`, cat)}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("majorsDirectory.resetFilters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E6E8F0] p-6 space-y-4 shadow-2xs">
                <Skeleton className="h-44 w-full rounded-xl" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : sortedMajors && sortedMajors.length > 0 ? (
          viewMode === "grid" ? (
            /* Modern Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMajors.map((m: any) => {
                const coverImage = MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
                const priHolland = m.riasec_primary ? RIASEC_NAMES[m.riasec_primary] : null;
                const secHolland = m.riasec_secondary ? RIASEC_NAMES[m.riasec_secondary] : null;

                return (
                  <div
                    key={m.id}
                    className="group rounded-2xl bg-white border border-[#E6E8F0] hover:border-[#111965]/30 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Major Cover Thumbnail */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <Image
                          src={coverImage}
                          alt={getLocalized(m.name) || "Major"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-[#111965] shadow-xs backdrop-blur-xs">
                            {t(`categories.${m.category}`, m.category)}
                          </span>

                          {m.is_stem && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#F7CE4D] text-[#111965] shadow-xs">
                              <Sparkles className="w-3 h-3" />
                              <span>STEM</span>
                            </span>
                          )}
                        </div>

                        {/* Holland RIASEC indicator at bottom of image */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-mono text-[11px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md font-bold">
                            RIASEC: {m.riasec_primary}{m.riasec_secondary ? `-${m.riasec_secondary}` : ""}
                          </span>
                          <span className="text-[11px] font-medium bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#F7CE4D]" />
                            <span>{m.universities_count || 0} {t("majorsDirectory.institutions")}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-extrabold text-[#111965] group-hover:text-[#1E277A] transition-colors leading-snug">
                          {getLocalized(m.name)}
                        </h3>

                        <p className="text-xs text-[#68708A] line-clamp-3 leading-relaxed">
                          {getLocalized(m.description)}
                        </p>

                        {/* Personality & RIASEC Tag Pills */}
                        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                          {priHolland && (
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${priHolland.color}`}
                              title={priHolland.en}
                            >
                              {language === "km" ? priHolland.km : priHolland.en}
                            </span>
                          )}
                          {secHolland && (
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${secHolland.color}`}
                              title={secHolland.en}
                            >
                              {language === "km" ? secHolland.km : secHolland.en}
                            </span>
                          )}
                          {m.personality_affinity && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F0F2FA] text-[#111965] text-[11px] font-bold border border-[#E6E8F0]">
                              MBTI: {m.personality_affinity.split(",").slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-[#E6E8F0] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActivePreviewMajor(m)}
                        className="text-xs font-bold text-[#111965] hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Curriculum</span>
                      </button>

                      <Link
                        href={`/majors/${m.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-2xs group-hover:shadow-xs"
                      >
                        <span>{t("majorsDirectory.details")}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Modern List Layout */
            <div className="space-y-3">
              {sortedMajors.map((m: any) => {
                const coverImage = MAJOR_IMAGES[m.slug] || "/images/majors/software-engineering.webp";
                return (
                  <div
                    key={m.id}
                    className="group rounded-2xl bg-white border border-[#E6E8F0] hover:border-[#111965]/30 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={coverImage}
                          alt={getLocalized(m.name) || "Major"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0F2FA] text-[#111965]">
                            {t(`categories.${m.category}`, m.category)}
                          </span>
                          {m.is_stem && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                              STEM
                            </span>
                          )}
                          <span className="text-xs text-[#68708A] font-mono">
                            RIASEC: {m.riasec_primary}-{m.riasec_secondary}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#111965] group-hover:text-[#1E277A]">
                          {getLocalized(m.name)}
                        </h3>

                        <p className="text-xs text-[#68708A] line-clamp-1 max-w-xl">
                          {getLocalized(m.description)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#E6E8F0]">
                      <button
                        type="button"
                        onClick={() => setActivePreviewMajor(m)}
                        className="text-xs font-bold text-[#111965] hover:underline"
                      >
                        Curriculum
                      </button>

                      <Link
                        href={`/majors/${m.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
                      >
                        <span>{t("majorsDirectory.details")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white border border-[#E6E8F0] p-8 space-y-4">
            <div className="relative w-24 h-24 mx-auto opacity-80">
              <Image
                src="/images/think.webp"
                alt="No majors found"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-[#111965]">
              {t("majorsDirectory.notFound")}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Try adjusting your search terms or clearing the category filter to view all available university majors.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
            >
              {t("majorsDirectory.resetFilters")}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Curriculum Preview Dialog / Modal */}
      {activePreviewMajor && (
        <Dialog open={!!activePreviewMajor} onOpenChange={(open) => !open && setActivePreviewMajor(null)}>
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-[#E6E8F0] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#68708A]">
                  Academic Curriculum Overview
                </span>
                <h3 className="text-xl font-black text-[#111965] mt-1">
                  {getLocalized(activePreviewMajor.name)}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewMajor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curriculum Roadmap */}
            {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug] ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].years.map((y) => (
                    <div key={y.year} className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#111965]">Year {y.year}</span>
                        <span className="text-[10px] font-bold text-[#68708A]">Core Program</span>
                      </div>
                      <div className="text-xs font-bold text-[#171A2C]">
                        {language === "km" ? y.titleKm : y.titleEn}
                      </div>
                      <div className="text-[11px] text-[#68708A]">{y.focus}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-2">
                  <div className="text-xs font-bold text-[#111965] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Key Competencies Upon Graduation:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MAJOR_CURRICULUM_DATA[activePreviewMajor.slug].keySkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-xs font-medium text-[#111965]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#68708A]">
                Detailed syllabus information is being updated from the respective Cambodian university faculty catalogs.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E6E8F0]">
              <span className="text-xs text-[#68708A]">
                {activePreviewMajor.universities_count || 0} Universities Offering This Program
              </span>
              <Link
                href={`/majors/${activePreviewMajor.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors"
              >
                <span>View Full Major Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
