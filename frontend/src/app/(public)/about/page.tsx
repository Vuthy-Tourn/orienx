"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Building2,
  HeartHandshake,
  Users,
  Search,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { FuteraMascot } from "@/components/brand/futera-mascot";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0F2FA] border-b border-[#E6E8F0] pt-12 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(#111965_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111965]/10 text-[#111965] text-xs font-bold border border-[#111965]/15">
                <Compass className="w-3.5 h-3.5 text-[#111965]" />
                <span>{t("aboutPage.heroBadge")}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111965] tracking-tight leading-tight">
                {t("aboutPage.heroTitle")}
              </h1>

              <p className="text-sm sm:text-base text-[#68708A] leading-relaxed max-w-2xl">
                {t("aboutPage.heroSubtitle")}
              </p>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/assessments/personality"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("aboutPage.startAssessment")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-white hover:bg-slate-50 border border-[#E6E8F0] transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#111965]" />
                  <span>{t("aboutPage.exploreMajorsBtn")}</span>
                </Link>
              </div>
            </div>

            {/* Right Mascot & Welcome Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-lg max-w-sm w-full space-y-4 text-center">
                <div className="relative w-40 h-40 mx-auto">
                  <Image
                    src="/images/welcome-hd.webp"
                    alt="Tara Futera Mascot"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] text-[#111965] text-xs font-bold border border-[#F7CE4D]">
                    <span>⭐ Tara (តារា)</span>
                    <span className="text-[#68708A]">• Futera Guide</span>
                  </div>
                  <h3 className="text-base font-bold text-[#111965]">
                    {language === "km" ? "ដៃគូតម្រង់ទិសដ៏ស្មោះត្រង់របស់អ្នក" : "Your Authentic Career Companion"}
                  </h3>
                  <p className="text-xs text-[#68708A] leading-relaxed">
                    {language === "km"
                      ? "ជួយអ្នកស្វែងយល់ពីខ្លួនឯង ជ្រើសរើសជំនាញដែលត្រូវនឹងសមត្ថភាព និងស្វែងរកសាកលវិទ្យាល័យដែលស័ក្តិសមបំផុត។"
                      : "Helping you discover your strengths, compare real tuition fee schedules, and make confident career choices."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Platform Highlights & Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#111965] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111965]">6+</div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statMajors")}</div>
            <div className="text-[11px] text-[#68708A]">Curricula & career pathways in Cambodia</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111965]">6</div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statUniversities")}</div>
            <div className="text-[11px] text-[#68708A]">RUPP, ITC, CADT, AUPP, Paragon, NUM</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">100%</div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statTuition")}</div>
            <div className="text-[11px] text-[#68708A]">Cross-referenced with MoEYS & admissions</div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111965]">RIASEC</div>
            <div className="text-xs font-bold text-[#171A2C]">{t("aboutPage.statScience")}</div>
            <div className="text-[11px] text-[#68708A]">Psychologically validated career guidance</div>
          </div>
        </div>

        {/* Core Principles & Methodology */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Core Foundations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              {t("aboutPage.whyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              We built Futera specifically to replace unverified rumors with authentic, student-first guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#111965] flex items-center justify-center font-bold">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("aboutPage.p1Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.p1Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("aboutPage.p2Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.p2Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111965]">
                {t("aboutPage.p3Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.p3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Student Journey */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#111965] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Pathway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              How Futera Works for You
            </h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              From self-discovery to enrolling in your dream university program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step1Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step1Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step2Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step2Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111965] text-white flex items-center justify-center font-extrabold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-[#111965]">
                {t("aboutPage.step3Title")}
              </h3>
              <p className="text-xs text-[#68708A] leading-relaxed">
                {t("aboutPage.step3Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Ethical Transparency & Data Integrity Commitment */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111965] via-[#1E277A] to-[#0A0F3D] text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F7CE4D]">
            <HeartHandshake className="w-4 h-4" />
            <span>Ethical Guidance Commitment</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {t("aboutPage.commitment")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
            {language === "km"
              ? "ការធ្វើតេស្តនៅលើ Futera ត្រូវបានរចនាឡើងដើម្បីជំរុញការស្វែងយល់ និងការពិចារណាដោយផ្អែកលើព័ត៌មានជាក់ស្តែង មិនមែនជាការបង្ខិតបង្ខំវាសនាជីវិតរបស់សិស្សឡើយ។ យើងលើកទឹកចិត្តយ៉ាងមុតមាំឱ្យសិស្សានុសិស្សយកលទ្ធផលណែនាំរបស់ Futera ទៅពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូវិទ្យាល័យ ទីប្រឹក្សាអាជីព និងសមាជិកគ្រួសារ ដើម្បីធ្វើការសម្រេចចិត្តរួមគ្នាប្រកបដោយទំនុកចិត្ត។"
              : "Futera assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their Futera recommendations with high school teachers, university counselors, and family members to make confident, well-rounded decisions."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all shadow-md"
            >
              <span>{t("aboutPage.tryAssessments")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
