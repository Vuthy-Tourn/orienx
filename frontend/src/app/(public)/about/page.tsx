"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>{t("aboutPage.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111965]">
            {t("aboutPage.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#68708A] max-w-2xl mx-auto leading-relaxed">
            {t("aboutPage.subtitle")}
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#111965] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {t("aboutPage.p1Title")}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {t("aboutPage.p1Desc")}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {t("aboutPage.p2Title")}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {t("aboutPage.p2Desc")}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111965]">
              {t("aboutPage.p3Title")}
            </h3>
            <p className="text-xs text-[#68708A] leading-relaxed">
              {t("aboutPage.p3Desc")}
            </p>
          </div>
        </div>

        {/* Ethical Transparency Note */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-3">
          <h3 className="text-base font-bold text-[#111965]">
            {t("aboutPage.commitment")}
          </h3>
          <p className="text-xs text-[#68708A] leading-relaxed">
            OrienX assessments represent self-reported preferences and are designed to inspire exploration and informed reflection, not to rigidly dictate a student's destiny. We strongly encourage students to discuss their OrienX recommendations with high school teachers, university counselors, and family members.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/assessments/personality"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B]"
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
