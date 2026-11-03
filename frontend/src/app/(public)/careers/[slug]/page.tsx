"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Compass,
  GraduationCap,
  Building,
} from "lucide-react";

export default function CareerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { language, getLocalized } = useLanguage();

  const { data: career, isLoading, error } = useQuery({
    queryKey: ["career", slug],
    queryFn: async () => apiFetch<any>(`/careers/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#68708A]">
        {language === "km" ? "កំពុងទាញយកទិន្នន័យអាជីព..." : "Loading career details..."}
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#111965]">Career Not Found</h2>
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
          <span>{language === "km" ? "ត្រឡប់ក្រោយ" : "Back to Careers"}</span>
        </button>

        {/* Career Header */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                {career.industry}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                In-Demand Growth
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] leading-snug">
              {getLocalized(career.title)}
            </h1>

            <div className="flex items-center gap-4 text-xs font-medium text-[#68708A] pt-1">
              <span>
                <strong className="text-[#111965]">Holland RIASEC Code:</strong> {career.riasec_code}
              </span>
              <span>•</span>
              <span>
                <strong className="text-[#111965]">Minimum Education:</strong> {career.education_level}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#171A2C] leading-relaxed">
            {getLocalized(career.description)}
          </p>
        </div>

        {/* Responsibilities & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#111965]" />
              <span>{language === "km" ? "ការទទួលខុសត្រូវក្នុងការងារ" : "Key Responsibilities"}</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {career.responsibilities?.map((resp: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#111965]" />
              <span>{language === "km" ? "ជំនាញបច្ចេកទេសដែលត្រូវការ" : "Required Core Skills"}</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {career.required_skills?.map((sk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career Progression Pathway */}
        <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#111965]" />
            <span>{language === "km" ? "ជណ្តើរឡើងនៃអាជីព (Career Progression Ladder)" : "Career Progression Ladder"}</span>
          </h3>
          <div className="p-4 rounded-xl bg-[#F5F6FA] border border-[#E6E8F0] text-xs font-semibold text-[#111965]">
            {career.career_progression?.join(" → ")}
          </div>
        </div>

        {/* University Majors Leading to this Career */}
        {career.related_majors && career.related_majors.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {language === "km" ? "ជំនាញសាកលវិទ្យាល័យដែលនាំទៅរកអាជីពនេះ" : "University Majors Leading to This Career"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {career.related_majors.map((m: any) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#68708A] uppercase">
                      {m.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#111965]">
                      {getLocalized(m.name)}
                    </h4>
                  </div>
                  <Link
                    href={`/majors/${m.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#111965] bg-[#F0F2FA] hover:bg-[#E6E8F0]"
                  >
                    {language === "km" ? "មើលជំនាញ" : "View Major"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

