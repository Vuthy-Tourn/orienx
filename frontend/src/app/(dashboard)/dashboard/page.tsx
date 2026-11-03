"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  BrainCircuit,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Bookmark,
  Award,
  Scale,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { language, getLocalized } = useLanguage();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => apiFetch<any>("/students/dashboard-summary"),
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
  });

  const status = summary?.assessments_status;
  const favorites = summary?.favorites_count;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111965] to-[#1E277A] text-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F7CE4D] text-[#111965] uppercase tracking-wider">
              {language === "km" ? "ផ្ទាំងតម្រង់ទិសផ្ទាល់ខ្លួន" : "Personalized Guidance Dashboard"}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white">
              {language === "km" ? "សួស្តី" : "Welcome back"},{" "}
              {user?.full_name_km || user?.full_name_en || user?.email.split("@")[0]}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.province} • Grade 12 Graduate Candidate
            </p>
          </div>

          <Link
            href="/dashboard/recommendations"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors self-start sm:self-auto shadow-2xs"
          >
            {language === "km" ? "មើលអនុសាសន៍ជំនាញ" : "View Recommendations"}
          </Link>
        </div>
      </div>

      {/* Progress & Completion Strip */}
      <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#111965]">
              {language === "km" ? "វឌ្ឍនភាពនៃការតម្រង់ទិសរបស់អ្នក" : "Your Guidance Milestone Progress"}
            </h2>
            <p className="text-xs text-[#68708A]">
              {language === "km"
                ? "បំពេញជំហានទាំង ៣ ដើម្បីទទួលបានអនុសាសន៍ជំនាញដែលសុក្រឹតបំផុត"
                : "Complete all 3 assessments for the highest matching accuracy"}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965]">
            {Math.round(status?.overall_progress_percent || 0)}% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Personality Check */}
          <Link
            href="/dashboard/assessments/personality"
            className={`p-4 rounded-2xl border transition-all ${
              status?.personality_completed
                ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-400"
                : "bg-[#F5F6FA] border-[#E6E8F0] hover:border-[#111965]"
            }`}
          >
            <div className="flex items-center justify-between">
              <BrainCircuit className="w-5 h-5 text-[#111965]" />
              {status?.personality_completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-[#111965]">
                1. Personality Assessment
              </div>
              <div className="text-[11px] text-[#68708A] mt-0.5">
                {status?.personality_type ? `Result: ${status.personality_type}` : "12 Questions (MBTI)"}
              </div>
            </div>
          </Link>

          {/* RIASEC Check */}
          <Link
            href="/dashboard/assessments/riasec"
            className={`p-4 rounded-2xl border transition-all ${
              status?.riasec_completed
                ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-400"
                : "bg-[#F5F6FA] border-[#E6E8F0] hover:border-[#111965]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Compass className="w-5 h-5 text-[#111965]" />
              {status?.riasec_completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-[#111965]">
                2. RIASEC Career Interests
              </div>
              <div className="text-[11px] text-[#68708A] mt-0.5">
                {status?.holland_code ? `Holland Code: ${status.holland_code}` : "18 Items (Holland Code)"}
              </div>
            </div>
          </Link>

          {/* Academic Preferences Check */}
          <Link
            href="/dashboard/assessments/preferences"
            className={`p-4 rounded-2xl border transition-all ${
              status?.preferences_completed
                ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-400"
                : "bg-[#F5F6FA] border-[#E6E8F0] hover:border-[#111965]"
            }`}
          >
            <div className="flex items-center justify-between">
              <GraduationCap className="w-5 h-5 text-[#111965]" />
              {status?.preferences_completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-[#111965]">
                3. Academic Preferences
              </div>
              <div className="text-[11px] text-[#68708A] mt-0.5">
                Subjects, Budget & Location
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Top 3 Recommended Majors Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-[#111965]">
              {language === "km" ? "ជំនាញដែលសមស្របបំផុតសម្រាប់អ្នក" : "Top Recommended Majors for You"}
            </h2>
            <p className="text-xs text-[#68708A]">
              {language === "km"
                ? "ផ្អែកលើការវិភាគបុគ្គលិកលក្ខណៈ កូដ Holland និងចំណុចខ្លាំងនៃការសិក្សារបស់អ្នក"
                : "Calculated with explainable rule-based scoring"}
            </p>
          </div>
          <Link
            href="/dashboard/recommendations"
            className="text-xs font-bold text-[#111965] hover:underline"
          >
            {language === "km" ? "មើលទាំងអស់ →" : "View All Recommendations →"}
          </Link>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((rec: any) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#111965] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965]">
                      Rank #{rec.rank_position}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rec.match_score}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111965] leading-snug">
                    {getLocalized(rec.major?.name)}
                  </h3>

                  <p className="text-xs text-[#68708A] line-clamp-2">
                    {language === "km" ? rec.explanation?.fit_summary_km : rec.explanation?.fit_summary_en}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E6E8F0] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#68708A]">
                    {rec.explanation?.universities_count || 0} Universities
                  </span>
                  <Link
                    href={`/majors/${rec.major?.slug}`}
                    className="text-xs font-bold text-[#111965] hover:underline"
                  >
                    Explore →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-[#E6E8F0] text-center space-y-3">
            <Compass className="w-8 h-8 text-[#111965] mx-auto opacity-75" />
            <h3 className="text-sm font-bold text-[#111965]">
              {language === "km" ? "មិនទាន់មានអនុសាសន៍នៅឡើយទេ" : "No recommendations generated yet"}
            </h3>
            <p className="text-xs text-[#68708A] max-w-md mx-auto">
              Complete your Personality or RIASEC assessment to calculate personalized major recommendations.
            </p>
            <Link
              href="/dashboard/assessments/personality"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B]"
            >
              Start Personality Assessment
            </Link>
          </div>
        )}
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/universities/compare?ids=rupp,itc,aupp"
          className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:border-[#111965] transition-colors flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#111965]">Compare Universities</div>
            <div className="text-[11px] text-[#68708A]">Side-by-side pricing</div>
          </div>
        </Link>

        <Link
          href="/scholarships"
          className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:border-[#111965] transition-colors flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#111965]">Track Scholarships</div>
            <div className="text-[11px] text-[#68708A]">Deadlines & coverage</div>
          </div>
        </Link>

        <Link
          href="/dashboard/favorites"
          className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs hover:border-[#111965] transition-colors flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-800">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#111965]">Saved Bookmarks</div>
            <div className="text-[11px] text-[#68708A]">{favorites?.total || 0} items saved</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
