"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Sparkles,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Building2,
  ArrowRight,
  RotateCcw,
  Info,
  Scale,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function RecommendationsPage() {
  const { language, getLocalized } = useLanguage();
  const queryClient = useQueryClient();
  const [activeExplainId, setActiveExplainId] = useState<string | null>(null);

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ["recommended-majors"],
    queryFn: async () => apiFetch<any[]>("/recommendations/majors"),
  });

  const { mutate: recomputeRecs, isPending: recomputing } = useMutation({
    mutationFn: async () => {
      return apiFetch("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({ recompute: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
    },
  });

  const { mutate: toggleFav } = useMutation({
    mutationFn: async (majorId: string) => {
      return apiFetch("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ entity_type: "major", entity_id: majorId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      alert(language === "km" ? "បានកែប្រែទំព័រដែលបានរក្សាទុក" : "Updated favorites");
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] text-[#111965] border border-[#F7CE4D] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Major Recommendations</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#111965]">
            {language === "km" ? "អនុសាសន៍ជំនាញសាកលវិទ្យាល័យផ្ទាល់ខ្លួន" : "Your Personalized Major Matches"}
          </h1>
          <p className="text-xs sm:text-sm text-[#68708A]">
            {language === "km"
              ? "ចំណាត់ថ្នាក់ជំនាញដោយផ្អែកលើការរួមបញ្ចូលគ្នានៃបុគ្គលិកលក្ខណៈ កូដ Holland និងចំណុចខ្លាំងនៃការសិក្សា។"
              : "Ranked based on your RIASEC Holland code, personality preference dimensions, and academic prerequisites."}
          </p>
        </div>

        <button
          onClick={() => recomputeRecs()}
          disabled={recomputing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-white border border-[#E6E8F0] hover:bg-slate-50 transition-colors self-start shadow-2xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${recomputing ? "animate-spin" : ""}`} />
          <span>{recomputing ? "Recalculating..." : language === "km" ? "គណនាឡើងវិញ" : "Recalculate"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E8F0] space-y-4 shadow-2xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-xl" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-24 w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-rose-600">
          Failed to load recommendations. Please complete your assessments first.
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((rec: any) => {
            const major = rec.major;
            const exp = rec.explanation;
            const isTopMatch = rec.rank_position === 1;

            return (
              <div
                key={rec.id}
                className={`p-6 sm:p-7 rounded-3xl border transition-all relative overflow-hidden ${
                  isTopMatch
                    ? "bg-white border-2 border-[#111965] shadow-lg ring-4 ring-[#111965]/5"
                    : "bg-white border-[#E6E8F0] shadow-2xs hover:border-slate-300"
                }`}
              >
                {/* Border Beam on Top Ranked Major Match */}
                {isTopMatch && (
                  <BorderBeam size={240} duration={14} colorFrom="#F7CE4D" colorTo="#111965" />
                )}
                <div className="space-y-4">
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          isTopMatch
                            ? "bg-[#111965] text-[#F7CE4D]"
                            : "bg-[#F0F2FA] text-[#111965]"
                        }`}
                      >
                        #{rec.rank_position}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-[#68708A] uppercase tracking-wider">
                          {major.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-[#111965] leading-snug">
                          {getLocalized(major.name)}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rec.match_score}% Match Fit
                      </div>
                      <button
                        onClick={() => toggleFav(rec.major_id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#111965] hover:bg-[#F0F2FA] transition-colors"
                        title="Save to Favorites"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Explainable Rationale Box */}
                  <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#111965]">
                      <Info className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{language === "km" ? "ហេតុអ្វីជំនាញនេះត្រូវនឹងអ្នក?" : "Why This Major Fits Your Profile:"}</span>
                    </div>

                    <p className="text-xs text-[#171A2C] font-medium leading-relaxed">
                      {language === "km" ? exp?.fit_summary_km : exp?.fit_summary_en}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#68708A] pt-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{language === "km" ? exp?.riasec_reason_km : exp?.riasec_reason_en}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>{language === "km" ? exp?.personality_reason_km : exp?.personality_reason_en}</span>
                      </div>
                    </div>

                    {/* Constraint Alerts if any */}
                    {exp?.constraints_notes_en?.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2 text-xs text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{language === "km" ? exp?.constraints_notes_km?.[0] : exp?.constraints_notes_en?.[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Multi-attribute Score Breakdown Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-bold">RIASEC Fit</div>
                      <div className="text-xs font-extrabold text-[#111965] mt-0.5">{rec.riasec_match_score}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-bold">Academic Fit</div>
                      <div className="text-xs font-extrabold text-[#111965] mt-0.5">{rec.academic_match_score}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-bold">Personality Fit</div>
                      <div className="text-xs font-extrabold text-[#111965] mt-0.5">{rec.personality_match_score}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E8F0]">
                      <div className="text-[10px] text-[#68708A] uppercase font-bold">Career Align</div>
                      <div className="text-xs font-extrabold text-[#111965] mt-0.5">{rec.career_match_score}%</div>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-[#68708A]">
                      <Building2 className="w-3.5 h-3.5 text-[#111965]" />
                      <span>{exp?.universities_count || 0} Cambodian institutions offer this degree</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Link
                        href={`/majors/${major.slug}`}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-colors w-full sm:w-auto shadow-2xs"
                      >
                        <span>{language === "km" ? "ស្វែងយល់សាកលវិទ្យាល័យដែលបង្រៀន" : "Explore Curricula & Universities"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-[#E6E8F0] text-center space-y-4">
          <Sparkles className="w-10 h-10 text-[#111965] mx-auto opacity-75" />
          <h3 className="text-base font-bold text-[#111965]">
            {language === "km" ? "មិនទាន់មានអនុសាសន៍នៅឡើយទេ" : "No recommendations generated yet"}
          </h3>
          <p className="text-xs text-[#68708A] max-w-md mx-auto">
            Please complete your Personality Assessment and RIASEC Career Interest test to compute personalized rankings.
          </p>
          <Link
            href="/dashboard/assessments/personality"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B]"
          >
            Start Personality Test
          </Link>
        </div>
      )}
    </div>
  );
}

