"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Bookmark,
  Building2,
  Compass,
  Briefcase,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function FavoritesPage() {
  const { language, getLocalized } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"majors" | "universities" | "careers" | "scholarships">("majors");

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => apiFetch<any>("/favorites"),
  });

  const { mutate: removeFavorite } = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      return apiFetch("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ entity_type: type, entity_id: id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const { mutate: updateScholarshipStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/scholarships/${id}/track`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#111965]">
          {language === "km" ? "ទំព័រ និងជំនាញដែលបានរក្សាទុក" : "Saved Bookmarks & Tracking"}
        </h1>
        <p className="text-xs sm:text-sm text-[#68708A]">
          {language === "km"
            ? "គ្រប់គ្រងជំនាញ សាកលវិទ្យាល័យ និងអាហារូបករណ៍ដែលអ្នកបានចំណាំទុក។"
            : "Keep track of your favorite majors, universities, career pathways, and applications."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E8F0] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("majors")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "majors"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Majors ({favorites?.majors?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("universities")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "universities"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Universities ({favorites?.universities?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("careers")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "careers"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Careers ({favorites?.careers?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("scholarships")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "scholarships"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Scholarships ({favorites?.scholarships?.length || 0})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-[#68708A]">Loading saved bookmarks...</div>
      ) : (
        <div>
          {/* Majors Tab */}
          {activeTab === "majors" && (
            <div className="space-y-4">
              {favorites?.majors?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.majors.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#68708A] uppercase">{m.category}</span>
                        <h4 className="text-base font-bold text-[#111965]">{getLocalized(m.name)}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E8F0] text-xs">
                        <button
                          onClick={() => removeFavorite({ type: "major", id: m.id })}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                        <Link href={`/majors/${m.slug}`} className="font-bold text-[#111965] hover:underline">
                          View Program →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#68708A] bg-white rounded-2xl border border-[#E6E8F0]">
                  No majors bookmarked yet. Explore majors and click the bookmark icon!
                </div>
              )}
            </div>
          )}

          {/* Universities Tab */}
          {activeTab === "universities" && (
            <div className="space-y-4">
              {favorites?.universities?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.universities.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#68708A] uppercase">{u.province} • {u.university_type}</span>
                        <h4 className="text-base font-bold text-[#111965]">{getLocalized(u.name)}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E8F0] text-xs">
                        <button
                          onClick={() => removeFavorite({ type: "university", id: u.id })}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                        <Link href={`/universities/${u.slug}`} className="font-bold text-[#111965] hover:underline">
                          View University →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#68708A] bg-white rounded-2xl border border-[#E6E8F0]">
                  No universities saved yet.
                </div>
              )}
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === "careers" && (
            <div className="space-y-4">
              {favorites?.careers?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.careers.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#68708A] uppercase">{c.industry}</span>
                        <h4 className="text-base font-bold text-[#111965]">{getLocalized(c.title)}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E8F0] text-xs">
                        <button
                          onClick={() => removeFavorite({ type: "career", id: c.id })}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                        <Link href={`/careers/${c.slug}`} className="font-bold text-[#111965] hover:underline">
                          View Career →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#68708A] bg-white rounded-2xl border border-[#E6E8F0]">
                  No careers saved yet.
                </div>
              )}
            </div>
          )}

          {/* Scholarships Tab */}
          {activeTab === "scholarships" && (
            <div className="space-y-4">
              {favorites?.scholarships?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.scholarships.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#68708A] uppercase">{s.coverage_type}</span>
                          <select
                            value={s.status}
                            onChange={(e) => updateScholarshipStatus({ id: s.id, status: e.target.value })}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-[#E6E8F0] bg-[#F5F6FA] text-[#111965]"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="PLANNING_TO_APPLY">Planning to Apply</option>
                            <option value="APPLIED">Applied</option>
                            <option value="WON">Scholarship Awarded</option>
                          </select>
                        </div>
                        <h4 className="text-base font-bold text-[#111965]">{getLocalized(s.title)}</h4>
                        <div className="text-xs text-[#68708A]">Deadline: {s.deadline || "Rolling"}</div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E8F0] text-xs">
                        <button
                          onClick={() => removeFavorite({ type: "scholarship", id: s.id })}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                        <Link href={`/scholarships/${s.slug}`} className="font-bold text-[#111965] hover:underline">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#68708A] bg-white rounded-2xl border border-[#E6E8F0]">
                  No scholarships saved yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

