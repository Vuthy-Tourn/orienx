"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import {
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Building,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [fullNameEn, setFullNameEn] = useState("");
  const [fullNameKm, setFullNameKm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("Phnom Penh");
  const [currentLevel, setCurrentLevel] = useState("GRADE_12");
  const [highSchool, setHighSchool] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cambodianProvinces = [
    "Phnom Penh",
    "Banteay Meanchey",
    "Battambang",
    "Kampong Cham",
    "Kampong Chhnang",
    "Kampong Speu",
    "Kampong Thom",
    "Kampot",
    "Kandal",
    "Kep",
    "Koh Kong",
    "Kratie",
    "Mondulkiri",
    "Oddar Meanchey",
    "Pailin",
    "Preah Sihanouk",
    "Preah Vihear",
    "Prey Veng",
    "Pursat",
    "Ratanakiri",
    "Siem Reap",
    "Stung Treng",
    "Svay Rieng",
    "Takeo",
    "Tboung Khmum",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        email,
        password,
        full_name_en: fullNameEn,
        full_name_km: fullNameKm || undefined,
        province,
        current_education_level: currentLevel,
        high_school_name: highSchool || undefined,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F5F6FA] py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo showText={false} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111965]">
            {t("auth.registerTitle")}
          </h1>
          <p className="text-xs text-[#68708A]">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.nameLatinLabel")}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullNameEn}
                    onChange={(e) => setFullNameEn(e.target.value)}
                    placeholder="e.g. Sokha Chan"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.nameKmLabel")}
                </label>
                <input
                  type="text"
                  value={fullNameKm}
                  onChange={(e) => setFullNameKm(e.target.value)}
                  placeholder="ឧ. ចាន់ សុខា"
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">
                {t("auth.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">
                {t("auth.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.provinceLabel")}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
                  >
                    {cambodianProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.educationLabel")}
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] bg-white focus:outline-hidden focus:border-[#111965]"
                  >
                    <option value="GRADE_12">Grade 12 (ថ្នាក់ទី១២)</option>
                    <option value="GRADE_11">Grade 11 (ថ្នាក់ទី១១)</option>
                    <option value="GRADE_10">Grade 10 (ថ្នាក់ទី១០)</option>
                    <option value="HIGH_SCHOOL_GRADUATE">High School Graduate (ចប់បាក់ឌុប)</option>
                    <option value="UNIVERSITY_STUDENT">University Student (និស្សិត)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171A2C]">
                {t("auth.schoolLabel")}
              </label>
              <input
                type="text"
                value={highSchool}
                onChange={(e) => setHighSchool(e.target.value)}
                placeholder="e.g. Hun Sen Bak Touk High School"
                className="w-full px-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>{t("auth.creatingAccount")}</span>
              ) : (
                <>
                  <span>{t("auth.registerButton")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E6E8F0] text-center text-xs text-[#68708A]">
            <span>{t("auth.hasAccountPrompt")} </span>
            <Link href="/login" className="font-bold text-[#111965] hover:underline">
              {t("auth.signInLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
