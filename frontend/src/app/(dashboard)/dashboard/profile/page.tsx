"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { User as UserIcon, Save, Sliders, Palette, ShieldCheck, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
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
  const [baciiGrade, setBaciiGrade] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      setBaciiGrade(profile.bacii_grade || "");
      setAvatarUrl(profile.avatar_url || "");
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
          bacii_grade: baciiGrade || null,
          avatar_url: avatarUrl || null,
        }),
      });
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success(t("profileSettings.successMsg"));
    },
  });

  const handleAvatarFile = async (file: File) => {
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error(t("profileSettings.photoTypeError"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t("profileSettings.photoSizeError"));
      return;
    }

    setUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await apiFetch<{ url: string }>("/uploads/avatar", {
        method: "POST",
        body,
      });
      if (!uploaded?.url) {
        throw new Error(t("profileSettings.photoUploadError"));
      }
      setAvatarUrl(uploaded.url);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t("profileSettings.photoUploadError")
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

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
          <div className="flex flex-col gap-4 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E6E8F0] bg-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={t("profileSettings.profilePhoto")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-[#94A3B8]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#171A2C]">
                {t("profileSettings.profilePhoto")}
              </div>
              <p className="mt-0.5 text-[11px] text-[#68708A]">
                {t("profileSettings.profilePhotoHint")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:border-[#111965]/30",
                    uploadingAvatar && "pointer-events-none opacity-60"
                  )}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {uploadingAvatar
                    ? t("profileSettings.uploadingPhoto")
                    : avatarUrl
                    ? t("profileSettings.changePhoto")
                    : t("profileSettings.uploadPhoto")}
                  <input
                    type="file"
                    accept={AVATAR_TYPES.join(",")}
                    className="sr-only"
                    disabled={uploadingAvatar}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) handleAvatarFile(file);
                    }}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <X className="h-3 w-3" />
                    {t("profileSettings.removePhoto")}
                  </button>
                )}
              </div>
            </div>
          </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("profileSettings.baciiGrade")}
                </label>
                <Select
                  value={baciiGrade}
                  onChange={setBaciiGrade}
                  options={[
                    { value: "", label: t("profileSettings.baciiNotSet") },
                    ...["A", "B", "C", "D", "E", "F"].map((grade) => ({
                      value: grade,
                      label: grade,
                    })),
                  ]}
                  label={t("profileSettings.baciiGrade")}
                  className="w-full"
                />
                <p className="text-[10px] text-[#94A3B8]">
                  {t("profileSettings.baciiGradeHint")}
                </p>
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

