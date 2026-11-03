"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  GraduationCap,
  MapPin,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  DollarSign,
  Building2,
  ExternalLink,
} from "lucide-react";
import { formatUSD } from "@/lib/utils";

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { language, getLocalized } = useLanguage();

  const { data: uni, isLoading, error } = useQuery({
    queryKey: ["university", slug],
    queryFn: async () => apiFetch<any>(`/universities/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#68708A]">
        {language === "km" ? "កំពុងទាញយកព័ត៌មានសាកលវិទ្យាល័យ..." : "Loading university details..."}
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#111965]">University Not Found</h2>
        <p className="text-sm text-[#68708A]">The requested university profile could not be loaded.</p>
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
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "km" ? "ត្រឡប់ក្រោយ" : "Back to Directory"}</span>
        </button>

        {/* Institution Header Card */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    uni.university_type === "PUBLIC"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-purple-50 text-purple-800 border border-purple-200"
                  }`}
                >
                  {uni.university_type === "PUBLIC" ? (language === "km" ? "សាកលវិទ្យាល័យរដ្ឋ" : "Public State University") : (language === "km" ? "សាកលវិទ្យាល័យឯកជន" : "Private International")}
                </span>

                {uni.is_tuition_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === "km" ? "តម្លៃផ្ទៀងផ្ទាត់ផ្លូវការ" : "Verified Tuition"}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] leading-snug">
                {getLocalized(uni.name)}
              </h1>
              <div className="text-sm font-bold text-[#68708A] uppercase tracking-wider">
                {getLocalized(uni.acronym)} • Established {uni.established_year || "1960"}
              </div>
            </div>

            {uni.website_url && (
              <a
                href={uni.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors self-start shadow-2xs"
              >
                <span>{language === "km" ? "គេហទំព័រផ្លូវការ" : "Official Website"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <p className="text-sm text-[#171A2C] leading-relaxed">
            {getLocalized(uni.description)}
          </p>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {language === "km" ? "តម្លៃសិក្សាប្រចាំឆ្នាំ (ផ្ទៀងផ្ទាត់)" : "Verified Annual Tuition"}
              </div>
              <div className="text-base font-extrabold text-[#111965] mt-0.5">
                {uni.tuition_range_min_usd !== null
                  ? `$${Math.round(uni.tuition_range_min_usd)} – $${Math.round(uni.tuition_range_max_usd || uni.tuition_range_min_usd)} / yr`
                  : "Information not available"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {language === "km" ? "ទីតាំង និងអាសយដ្ឋាន" : "Location"}
              </div>
              <div className="text-sm font-semibold text-[#171A2C] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#111965]" />
                <span>{uni.province}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0]">
              <div className="text-[10px] text-[#68708A] uppercase font-bold">
                {language === "km" ? "ទំនាក់ទំនងចុះឈ្មោះ" : "Admissions Contact"}
              </div>
              <div className="text-xs font-medium text-[#171A2C] mt-0.5 space-y-0.5">
                {uni.contact_phone && <div>📞 {uni.contact_phone}</div>}
                {uni.contact_email && <div>✉️ {uni.contact_email}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Available Majors & Programs Offered */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {language === "km" ? "កម្មវិធីសិក្សា និងជំនាញដែលផ្តល់ការបង្រៀន" : "Available Programs & Curricula"}
            </h2>
            <span className="text-xs font-semibold text-[#68708A]">
              {uni.offerings?.length || 0} {language === "km" ? "ជំនាញ" : "Programs"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uni.offerings?.map((um: any) => (
              <div
                key={um.major_id}
                className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F2FA] text-[#111965]">
                      {um.major_category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {um.tuition_annual_usd ? `$${Math.round(um.tuition_annual_usd)} / yr` : "Tuition N/A"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111965] leading-snug">
                    {getLocalized(um.major_name)}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#68708A] pt-1">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{um.degree_level}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{um.duration_years} Years</span>
                    </span>
                    <span>🌐 {um.language_of_instruction}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E8F0]">
                  <Link
                    href={`/majors/${um.major_slug}`}
                    className="text-xs font-bold text-[#111965] hover:underline"
                  >
                    {language === "km" ? "មើលព័ត៌មានលម្អិតនៃជំនាញនេះ →" : "View Major Overview & Careers →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Requirements & Facilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admission requirements */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#111965]" />
              <span>{language === "km" ? "លក្ខខណ្ឌនៃការចុះឈ្មោះចូលរៀន" : "Admission Requirements"}</span>
            </h3>
            {uni.admission_requirements ? (
              <ul className="space-y-2 text-xs text-[#171A2C]">
                {((language === "km" ? uni.admission_requirements.km : uni.admission_requirements.en) || uni.admission_requirements.en || []).map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#68708A]">Standard High School Diploma (BacII) required.</p>
            )}
          </div>

          {/* Learning Facilities */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-[#111965] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#111965]" />
              <span>{language === "km" ? "បរិក្ខារ និងមន្ទីរពិសោធន៍សិក្សា" : "Campus Facilities & Labs"}</span>
            </h3>
            {uni.facilities ? (
              <ul className="space-y-2 text-xs text-[#171A2C]">
                {((language === "km" ? uni.facilities.km : uni.facilities.en) || uni.facilities.en || []).map((fac: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#68708A]">Campus libraries, STEM laboratories, and student study centers.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
