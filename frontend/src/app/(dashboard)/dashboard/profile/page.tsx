"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Select } from "@/components/ui/select";
import { User as UserIcon, Save, CheckCircle2, Sliders, Palette, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "preferences" ? "preferences" : "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(initialTab);
  const queryClient = useQueryClient();

  const [fullNameEn, setFullNameEn] = useState("");
  const [fullNameKm, setFullNameKm] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("Phnom Penh");
  const [highSchool, setHighSchool] = useState("");
  const [educationLevel, setEducationLevel] = useState("GRADE_12");
  const [graduationYear, setGraduationYear] = useState(2026);
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => apiFetch<any>("/students/profile"),
  });

  useEffect(() => {
    if (profile) {
      setFullNameEn(profile.full_name_en || "");
      setFullNameKm(profile.full_name_km || "");
      setPhone(profile.phone || "");
      setProvince(profile.province || "Phnom Penh");
      setHighSchool(profile.high_school || "");
      setEducationLevel(profile.current_education_level || "GRADE_12");
      setGraduationYear(profile.graduation_year || 2026);
    }
  }, [profile]);

  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: async () => {
      return apiFetch("/students/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name_en: fullNameEn,
          full_name_km: fullNameKm,
          phone: phone || undefined,
          province,
          high_school: highSchool || undefined,
          current_education_level: educationLevel,
          graduation_year: graduationYear,
        }),
      });
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    },
  });

  return (
    <div data-dashboard-page="sections" className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-16 select-none">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#111965] tracking-tight">
          {t("profileSettings.title")}
        </h1>
        <p className="text-xs sm:text-sm text-[#68708A]">
          {t("profileSettings.subtitle")}
        </p>
      </div>

      {/* Tabs: Profile Info vs Language & Theme */}
      <div className="flex items-center gap-2 border-b border-[#E6E8F0] pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === "profile"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-100"
          )}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t("settings.tabProfile")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === "preferences"
              ? "bg-[#111965] text-white shadow-xs"
              : "text-[#68708A] hover:text-[#111965] hover:bg-slate-100"
          )}
        >
          <Palette className="w-4 h-4" />
          <span>{t("settings.tabPreferences")}</span>
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === "profile" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6 animate-in fade-in">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t("profileSettings.successMsg")}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.fullNameEn")}</label>
                <input
                  type="text"
                  value={fullNameEn}
                  onChange={(e) => setFullNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.fullNameKm")}</label>
                <input
                  type="text"
                  value={fullNameKm}
                  onChange={(e) => setFullNameKm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.email")}</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-[#F5F6FA] text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.province")}</label>
                <Select
                  value={province}
                  onChange={setProvince}
                  options={[
                    "Phnom Penh",
                    "Siem Reap",
                    "Battambang",
                    "Kandal",
                    "Kampong Cham",
                    "Preah Sihanouk",
                  ].map((value) => ({ value, label: value }))}
                  label={t("profileSettings.province")}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.educationLevel")}</label>
                <Select
                  value={educationLevel}
                  onChange={setEducationLevel}
                  options={[
                    { value: "GRADE_12", label: "Grade 12 (ថ្នាក់ទី១២)" },
                    { value: "GRADE_11", label: "Grade 11 (ថ្នាក់ទី១១)" },
                    {
                      value: "HIGH_SCHOOL_GRADUATE",
                      label: "High School Graduate (ចប់បាក់ឌុប)",
                    },
                    {
                      value: "UNIVERSITY_STUDENT",
                      label: "University Student (និស្សិត)",
                    },
                  ]}
                  label={t("profileSettings.educationLevel")}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">{t("profileSettings.highSchool")}</label>
              <input
                type="text"
                value={highSchool}
                onChange={(e) => setHighSchool(e.target.value)}
                placeholder={t("profileSettings.highSchoolPlaceholder")}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E8F0]">
            <button
              onClick={() => updateProfile()}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t("profileSettings.saving") : t("profileSettings.saveBtn")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Language & Theme Settings */}
      {activeTab === "preferences" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6 animate-in fade-in">
          <SettingsPanel />
        </div>
      )}
    </div>
  );
}

