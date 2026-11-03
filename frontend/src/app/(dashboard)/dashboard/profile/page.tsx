"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { User as UserIcon, Save, CheckCircle2, MapPin, GraduationCap } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#111965]">
          {language === "km" ? "ការកំណត់គណនី និងប្រវត្តិរូប" : "Student Profile & Account Settings"}
        </h1>
        <p className="text-xs sm:text-sm text-[#68708A]">
          Manage your student information, province, and educational background.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-xs space-y-6">
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">Full Name (English)</label>
              <input
                type="text"
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">Khmer Name</label>
              <input
                type="text"
                value={fullNameKm}
                onChange={(e) => setFullNameKm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#171A2C]">Email Address (Account Identifier)</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-[#F5F6FA] text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">Province / City</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white"
              >
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Battambang">Battambang</option>
                <option value="Kandal">Kandal</option>
                <option value="Kampong Cham">Kampong Cham</option>
                <option value="Preah Sihanouk">Preah Sihanouk</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white"
              >
                <option value="GRADE_12">Grade 12 (ថ្នាក់ទី១២)</option>
                <option value="GRADE_11">Grade 11 (ថ្នាក់ទី១១)</option>
                <option value="HIGH_SCHOOL_GRADUATE">High School Graduate (ចប់បាក់ឌុប)</option>
                <option value="UNIVERSITY_STUDENT">University Student (និស្សិត)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#171A2C]">High School Name</label>
            <input
              type="text"
              value={highSchool}
              onChange={(e) => setHighSchool(e.target.value)}
              placeholder="e.g. Hun Sen Bak Touk High School"
              className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6E8F0]">
          <button
            onClick={() => updateProfile()}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Profile Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

