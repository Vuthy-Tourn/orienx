"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

export default function MajorDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { t, getLocalized } = useLanguage();

  const { data: major, isLoading, error } = useQuery({
    queryKey: ["major", slug],
    queryFn: async () => apiFetch<any>(`/majors/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#68708A]">
        {t("majorDetail.loading")}
      </div>
    );
  }

  if (error || !major) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#111965]">Major Not Found</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#111965]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("majorDetail.back")}</span>
        </button>

        {/* Major Header */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                {t(`categories.${major.category}`, major.category)}
              </span>
              {major.is_stem && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  STEM Discipline
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] leading-snug">
              {getLocalized(major.name)}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#68708A] pt-1">
              <span>
                <strong className="text-[#111965]">Primary RIASEC:</strong> {major.riasec_primary} (Secondary: {major.riasec_secondary})
              </span>
              {major.personality_affinity && (
                <span>
                  • <strong className="text-[#111965]">Personality Affinity:</strong> {major.personality_affinity}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-[#171A2C] leading-relaxed">
            {getLocalized(major.description)}
          </p>
        </div>

        {/* Subjects, Skills & Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core Subjects Studied */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#111965]" />
              <span>{t("majorDetail.coreSubjects")}</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.subjects_studied?.map((sub: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Foundational Skills */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#111965]" />
              <span>{t("majorDetail.requiredSkills")}</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.required_skills?.map((sk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Potential Challenges (Honest guidance) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t("majorDetail.challenges")}</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.potential_challenges?.map((ch: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cambodian Universities Offering This Program */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {t("majorDetail.universitiesOffering")}
            </h2>
            <span className="text-xs font-semibold text-[#68708A]">
              {major.universities?.length || 0} {t("majorDetail.institutionsCount")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {major.universities?.map((u: any) => (
              <div
                key={u.university_id}
                className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#68708A] uppercase">
                      {getLocalized(u.university_acronym)}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {u.tuition_annual_usd ? `$${Math.round(u.tuition_annual_usd)} / yr` : "Tuition N/A"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111965] leading-snug">
                    {getLocalized(u.university_name)}
                  </h4>

                  <div className="text-xs text-[#68708A]">
                    📍 {u.province} • {u.duration_years} Years ({u.degree_level})
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E8F0]">
                  <Link
                    href={`/universities/${u.university_slug}`}
                    className="text-xs font-bold text-[#111965] hover:underline"
                  >
                    {t("majorDetail.viewUni")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Careers */}
        {major.careers && major.careers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {t("majorDetail.relatedCareers")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {major.careers.map((car: any) => (
                <div
                  key={car.id}
                  className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F6FA] text-[#111965]">
                      {car.industry}
                    </span>
                    <span className="text-xs font-bold text-[#68708A]">RIASEC: {car.riasec_code}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#111965]">
                    {getLocalized(car.title)}
                  </h4>
                  <p className="text-xs text-[#68708A] line-clamp-2">
                    {getLocalized(car.description)}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/careers/${car.slug}`}
                      className="text-xs font-bold text-[#111965] hover:underline"
                    >
                      {t("majorDetail.exploreCareer")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
