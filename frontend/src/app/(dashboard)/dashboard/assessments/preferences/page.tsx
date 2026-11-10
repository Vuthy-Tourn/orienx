"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import {
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  DollarSign,
  MapPin,
  BookOpen,
  Check,
} from "lucide-react";

export default function AcademicPreferencesPage() {
  const router = useRouter();
  const { t, getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [strongestSubjects, setStrongestSubjects] = useState<string[]>([]);
  const [enjoyedActivities, setEnjoyedActivities] = useState<string[]>([]);
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>(["Phnom Penh"]);
  const [budget, setBudget] = useState<number>(1000);
  const [requiresScholarship, setRequiresScholarship] = useState<boolean>(false);

  const availableSubjects = [
    { id: "Mathematics", labelKm: "គណិតវិទ្យា (Math)", labelEn: "Mathematics" },
    { id: "Informatics", labelKm: "ព័ត៌មានវិទ្យា (Informatics)", labelEn: "Informatics" },
    { id: "Physics", labelKm: "រូបវិទ្យា (Physics)", labelEn: "Physics" },
    { id: "Chemistry", labelKm: "គីមីវិទ្យា (Chemistry)", labelEn: "Chemistry" },
    { id: "Biology", labelKm: "ជីវវិទ្យា (Biology)", labelEn: "Biology" },
    { id: "English", labelKm: "ភាសាអង់គ្លេស (English)", labelEn: "English" },
    { id: "Khmer Literature", labelKm: "អក្សរសាស្ត្រខ្មែរ (Khmer)", labelEn: "Khmer Literature" },
    { id: "Economics", labelKm: "សេដ្ឋកិច្ច (Economics)", labelEn: "Economics" },
    { id: "History", labelKm: "ប្រវត្តិវិទ្យា (History)", labelEn: "History" },
    { id: "Geography", labelKm: "ភូមិវិទ្យា (Geography)", labelEn: "Geography" },
  ];

  const availableActivities = [
    "Coding & Building Apps",
    "Robotics & Electronics",
    "Writing & Storytelling",
    "Graphic & UI Design",
    "Scientific Experiments",
    "Public Speaking & Debates",
    "Managing Events & Teams",
    "Analyzing Data & Stocks",
  ];

  const { data: savedPrefs, isLoading } = useQuery({
    queryKey: ["academic-preferences"],
    queryFn: async () => apiFetch<any>("/assessments/preferences"),
  });

  useEffect(() => {
    if (savedPrefs) {
      setFavoriteSubjects(savedPrefs.favorite_subjects || []);
      setStrongestSubjects(savedPrefs.strongest_subjects || []);
      setEnjoyedActivities(savedPrefs.enjoyed_activities || []);
      setCareerInterests(savedPrefs.career_interest_areas || []);
      setLocations(savedPrefs.preferred_locations || ["Phnom Penh"]);
      if (savedPrefs.annual_tuition_budget_usd) {
        setBudget(savedPrefs.annual_tuition_budget_usd);
      }
      setRequiresScholarship(savedPrefs.requires_scholarship || false);
    }
  }, [savedPrefs]);

  const { mutate: savePreferences, isPending: saving } = useMutation({
    mutationFn: async () => {
      await apiFetch("/assessments/preferences", {
        method: "PUT",
        body: JSON.stringify({
          favorite_subjects: favoriteSubjects,
          strongest_subjects: strongestSubjects,
          enjoyed_activities: enjoyedActivities,
          career_interest_areas: careerInterests,
          preferred_locations: locations,
          annual_tuition_budget_usd: budget,
          requires_scholarship: requiresScholarship,
        }),
      });
      // Generate recommendations with fresh preferences
      return apiFetch("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({ recompute: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-majors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      router.push("/dashboard/recommendations");
    },
  });

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F2FA] text-[#111965] text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5" />
          <span>{t("academicPreferences.badge")}</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#111965]">
          {t("academicPreferences.title")}
        </h1>
        <p className="text-xs sm:text-sm text-[#68708A]">
          {t("academicPreferences.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Strongest Subjects */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
          <label className="text-sm font-bold text-[#111965] flex items-center justify-between">
            <span>{t("academicPreferences.strongestSubjects")}</span>
            <span className="text-xs text-[#68708A] font-normal">{t("academicPreferences.select1to4")}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSubjects.map((s) => {
              const isSelected = strongestSubjects.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleItem(strongestSubjects, setStrongestSubjects, s.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border-2 transition-all ${
                    isSelected
                      ? "border-[#111965] bg-[#111965] text-white shadow-xs"
                      : "border-[#E6E8F0] bg-white text-[#171A2C] hover:border-slate-300"
                  }`}
                >
                  {getLocalized({ km: s.labelKm, en: s.labelEn })}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Favorite Subjects */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
          <label className="text-sm font-bold text-[#111965] flex items-center justify-between">
            <span>{t("academicPreferences.favoriteSubjects")}</span>
            <span className="text-xs text-[#68708A] font-normal">{t("academicPreferences.selectAll")}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSubjects.map((s) => {
              const isSelected = favoriteSubjects.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleItem(favoriteSubjects, setFavoriteSubjects, s.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border-2 transition-all ${
                    isSelected
                      ? "border-[#F7CE4D] bg-[#FFF9E6] text-[#111965] font-bold"
                      : "border-[#E6E8F0] bg-white text-[#171A2C] hover:border-slate-300"
                  }`}
                >
                  {getLocalized({ km: s.labelKm, en: s.labelEn })}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Enjoyed Activities */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
          <label className="text-sm font-bold text-[#111965]">
            {t("academicPreferences.activities")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableActivities.map((act) => {
              const isSelected = enjoyedActivities.includes(act);
              return (
                <button
                  key={act}
                  type="button"
                  onClick={() => toggleItem(enjoyedActivities, setEnjoyedActivities, act)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border-2 transition-all ${
                    isSelected
                      ? "border-[#111965] bg-[#F0F2FA] text-[#111965] font-bold"
                      : "border-[#E6E8F0] bg-white text-[#171A2C] hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#111965]" />}
                    <span>{act}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Annual Tuition Budget Slider */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-[#111965]">
                {t("academicPreferences.annualBudget")}
              </label>
              <div className="text-xs text-[#68708A]">
                {t("academicPreferences.budgetHint")}
              </div>
            </div>
            <span className="text-base font-extrabold text-[#111965] bg-[#F0F2FA] px-3 py-1 rounded-xl">
              ${budget} {t("academicPreferences.perYear")}
            </span>
          </div>

          <input
            type="range"
            min={200}
            max={9000}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[#111965] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-[#68708A]">
            <span>{t("academicPreferences.stateSubsidized")}</span>
            <span>$1,000 / yr</span>
            <span>$3,000 / yr</span>
            <span>{t("academicPreferences.international")}</span>
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-[#171A2C] cursor-pointer">
            <input
              type="checkbox"
              checked={requiresScholarship}
              onChange={(e) => setRequiresScholarship(e.target.checked)}
              className="rounded text-[#111965]"
            />
            <span>{t("academicPreferences.requiresScholarship")}</span>
          </label>
        </div>

        {/* Save & Generate CTA */}
        <div className="p-6 rounded-3xl bg-[#111965] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-white">
              {t("academicPreferences.readyTitle")}
            </h4>
            <p className="text-xs text-slate-300">
              {t("academicPreferences.readySubtitle")}
            </p>
          </div>

          <button
            onClick={() => savePreferences()}
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-2 whitespace-nowrap"
          >
            <span>{saving ? t("academicPreferences.generating") : t("academicPreferences.generateBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

