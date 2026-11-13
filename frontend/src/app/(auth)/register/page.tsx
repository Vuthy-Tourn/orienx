"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { BorderBeam } from "@/components/magicui/border-beam";
import { DotPattern } from "@/components/magicui/dot-pattern";
import {
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building2,
  BookOpen,
  Award,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  Compass,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, language } = useLanguage();

  const [fullNameEn, setFullNameEn] = useState("");
  const [fullNameKm, setFullNameKm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const educationLevels = [
    {
      id: "GRADE_12",
      title: "Grade 12",
      titleKm: "ថ្នាក់ទី១២ (បាក់ឌុប)",
      desc: "Preparing for Bac II examination",
      descKm: "ត្រៀមប្រលងសញ្ញាបត្របាក់ឌុប",
      icon: GraduationCap,
    },
    {
      id: "GRADE_11",
      title: "Grade 10 - 11",
      titleKm: "ថ្នាក់ទី១០ - ១១",
      desc: "Early major & stream planning",
      descKm: "ស្វែងយល់មុខវិជ្ជា និងទិសដៅសិក្សា",
      icon: BookOpen,
    },
    {
      id: "HIGH_SCHOOL_GRADUATE",
      title: "High School Grad",
      titleKm: "ចប់បាក់ឌុបរួចរាល់",
      desc: "Looking for university admissions",
      descKm: "កំពុងស្វែងរកសាកលវិទ្យាល័យ",
      icon: Award,
    },
    {
      id: "UNIVERSITY_STUDENT",
      title: "University Student",
      titleKm: "និស្សិតសាកលវិទ្យាល័យ",
      desc: "Exploring career progression",
      descKm: "ពង្រឹងជំនាញ និងរៀបចំអាជីព",
      icon: Building2,
    },
  ];

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasNumberOrSymbol: /[\d\W]/.test(password),
      hasMixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordCriteria.hasLength) score++;
    if (passwordCriteria.hasNumberOrSymbol) score++;
    if (passwordCriteria.hasMixedCase) score++;
    if (password.length >= 12) score++;
    return score;
  }, [password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (passwordScore === 0) return { text: "Too short", textKm: "ខ្លីពេក", color: "bg-slate-200" };
    if (passwordScore === 1) return { text: "Weak", textKm: "ខ្សោយ", color: "bg-rose-500" };
    if (passwordScore === 2) return { text: "Fair", textKm: "មធ្យម", color: "bg-amber-500" };
    if (passwordScore === 3) return { text: "Good", textKm: "ល្អ", color: "bg-blue-500" };
    return { text: "Strong", textKm: "រឹងមាំ", color: "bg-emerald-500" };
  }, [passwordScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(
        language === "km"
          ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។"
          : "Password must be at least 8 characters long."
      );
      return;
    }

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
      setError(err?.message || "Registration failed. Please verify your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#F5F6FA] overflow-hidden py-8 sm:py-12">
      {/* Dot Pattern Background */}
      <DotPattern
        width={24}
        height={24}
        cx={1.5}
        cy={1.5}
        cr={1.5}
        className="text-slate-300/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-4">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors py-1.5 px-3 rounded-xl bg-white/70 hover:bg-white border border-[#E6E8F0] shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Registration Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
            
            {/* Header & Badges */}
            <div className="flex items-center justify-between">
              <Logo showText={true} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[12px] font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === "km" ? "ឥតគិតថ្លៃ ១០០%" : "100% Free for Students"}</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] tracking-tight">
                {t("auth.registerTitle", "Create Your Free Account")}
              </h1>
              <p className="text-sm text-[#68708A]">
                {t(
                  "auth.registerSubtitle",
                  "Start your journey to discover the best university majors and career pathways"
                )}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Persona / Education Level Card Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#171A2C] flex items-center justify-between">
                  <span>{t("auth.educationLabel", "Current Education Level")}</span>
                  <span className="text-[12px] font-normal text-[#68708A]">
                    {language === "km" ? "ជ្រើសរើសដើម្បីសម្រួលអនុសាសន៍" : "Tailors recommendation criteria"}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {educationLevels.map((lvl) => {
                    const Icon = lvl.icon;
                    const isSelected = currentLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCurrentLevel(lvl.id)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? "bg-[#111965]/5 border-[#111965] ring-2 ring-[#111965]/10 shadow-xs"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-[#111965] text-white"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111965]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111965] leading-tight">
                            {language === "km" ? lvl.titleKm : lvl.title}
                          </div>
                          <div className="text-[12.5px] text-[#68708A] line-clamp-1 mt-0.5">
                            {language === "km" ? lvl.descKm : lvl.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name (Latin & Khmer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171A2C]">
                    {t("auth.nameLatinLabel", "Full Name (English)")}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullNameEn}
                      onChange={(e) => setFullNameEn(e.target.value)}
                      placeholder="e.g. Sokha Chan"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171A2C]">
                    {t("auth.nameKmLabel", "Khmer Name (Optional)")}
                  </label>
                  <input
                    type="text"
                    value={fullNameKm}
                    onChange={(e) => setFullNameKm(e.target.value)}
                    placeholder="ឧ. ចាន់ សុខា"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.emailLabel", "Email Address")}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.passwordLabel", "Password")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      language === "km"
                        ? "យ៉ាងតិច ៨ តួអក្សរ"
                        : "At least 8 characters"
                    }
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#68708A] hover:text-[#111965] transition-colors p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Visual Meter */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#68708A]">
                        {language === "km" ? "កម្រិតសុវត្ថិភាព:" : "Strength:"}
                      </span>
                      <span className="font-bold text-[#111965]">
                        {language === "km" ? strengthLabel.textKm : strengthLabel.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            passwordScore >= step
                              ? strengthLabel.color
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[12.5px] text-[#68708A]">
                      <div className="flex items-center gap-1">
                        <Check
                          className={`w-3 h-3 ${
                            passwordCriteria.hasLength
                              ? "text-emerald-600 font-bold"
                              : "text-slate-300"
                          }`}
                        />
                        <span>{language === "km" ? "៨+ តួអក្សរ" : "8+ characters"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`w-3 h-3 ${
                            passwordCriteria.hasNumberOrSymbol
                              ? "text-emerald-600 font-bold"
                              : "text-slate-300"
                          }`}
                        />
                        <span>{language === "km" ? "លេខ ឬនិមិត្តសញ្ញា" : "Number/symbol"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`w-3 h-3 ${
                            passwordCriteria.hasMixedCase
                              ? "text-emerald-600 font-bold"
                              : "text-slate-300"
                          }`}
                        />
                        <span>{language === "km" ? "អក្សរធំ/តូច" : "Mixed case"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Province & High School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171A2C]">
                    {t("auth.provinceLabel", "Province / City")}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C]"
                    >
                      {cambodianProvinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171A2C]">
                    {t("auth.schoolLabel", "High School Name (Optional)")}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={highSchool}
                      onChange={(e) => setHighSchool(e.target.value)}
                      placeholder="e.g. Hun Sen Bak Touk High School"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-[0.99] shadow-md shadow-amber-300/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#111965]/30 border-t-[#111965] rounded-full animate-spin" />
                    <span>{t("auth.creatingAccount", "Creating Account...")}</span>
                  </div>
                ) : (
                  <>
                    <span>{t("auth.registerButton", "Register & Start Journey")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[12px] text-[#68708A] text-center">
                {language === "km"
                  ? "តាមរយៈការចុះឈ្មោះ អ្នកយល់ព្រមតាមលក្ខខណ្ឌប្រើប្រាស់របស់ OrienX។ ទិន្នន័យរបស់អ្នកត្រូវបានការពារយ៉ាងតឹងរ៉ឹង។"
                  : "By creating an account, you agree to OrienX Terms. Your student profile data is private and encrypted."}
              </p>
            </form>

            {/* Bottom Footer & Login Link */}
            <div className="pt-5 border-t border-[#E6E8F0] text-center text-xs text-[#68708A]">
              <span>{t("auth.hasAccountPrompt", "Already have an account?")} </span>
              <Link href="/login" className="font-bold text-[#111965] hover:underline">
                {t("auth.signInLink", "Sign In")}
              </Link>
            </div>
          </div>

          {/* Right Column: Branded Value Showcase with BorderBeam */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1038] via-[#111965] to-[#1C2582] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <BorderBeam
              size={260}
              duration={14}
              colorFrom="#F7CE4D"
              colorTo="#60A5FA"
              borderWidth={2}
            />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === "km"
                    ? "ដំណាក់កាលឆ្ពោះទៅកាន់សាកលវិទ្យាល័យ"
                    : "Your 3-Step Pathway to Success"}
                </span>
              </div>

              {/* Pitch Title */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {language === "km"
                    ? "រៀបចំអនាគតសិក្សា ដោយទំនុកចិត្ត និងទិន្នន័យច្បាស់លាស់"
                    : "Everything You Need to Choose the Right University"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === "km"
                    ? "ចូលរួមជាមួយសិស្ស-និស្សិតកម្ពុជាជាង ៣៥,០០០ នាក់ ដែលបានស្វែងយល់ពីជំនាញ និងសាកលវិទ្យាល័យសមស្របបំផុត។"
                    : "Join 35,000+ Cambodian students getting transparent tuition rates, Holland RIASEC interest profiles, and scholarship alerts."}
                </p>
              </div>

              {/* 3 Step Roadmap Preview Cards */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#F7CE4D] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {language === "km" ? "ធ្វើតេស្តចំណាប់អារម្មណ៍ RIASEC" : "Take Holland RIASEC Test"}
                    </div>
                    <div className="text-[12px] text-slate-300 mt-0.5 leading-snug">
                      {language === "km"
                        ? "១៥ នាទីដើម្បីស្វែងរកប្រភេទចំណាប់អារម្មណ៍ និងមុខវិជ្ជាខ្លាំង"
                        : "Discover your cognitive strengths across Realistic, Investigative, and 4 other dimensions"}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {language === "km" ? "ផ្គូផ្គង ៥០+ សាកលវិទ្យាល័យ" : "Match 50+ Cambodian Universities"}
                    </div>
                    <div className="text-[12px] text-slate-300 mt-0.5 leading-snug">
                      {language === "km"
                        ? "ទទួលបានពិន្ទុផ្គូផ្គង និងហេតុផលតម្លាភាពសម្រាប់គ្រប់ដេប៉ាតឺម៉ង់"
                        : "Transparent percentage match scores for RUPP, ITC, CADT, AUPP, and more"}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {language === "km" ? "គណនាតម្លៃសិក្សា ៤ ឆ្នាំ និងអាហារូបករណ៍" : "Estimate 4-Year Tuition & Aid"}
                    </div>
                    <div className="text-[12px] text-slate-300 mt-0.5 leading-snug">
                      {language === "km"
                        ? "ដឹងច្បាស់ពីថ្លៃសិក្សាផ្លូវការ កន្លែងស្នាក់នៅ និងលក្ខខណ្ឌអាហារូបករណ៍"
                        : "Verify official tuition per year, living allowance budgets, and application deadlines"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === "km" ? "ទិន្នន័យឯកជនភាព" : "Zero Data Selling"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{language === "km" ? "ក្រសួងអប់រំ MoEYS" : "MoEYS Aligned"}</span>
                </span>
              </div>
            </div>

            {/* Bottom Metric Badges */}
            <div className="relative z-10 pt-4 mt-6 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base sm:text-lg font-black text-white">35,000+</div>
                <div className="text-[12.5px] text-slate-300">
                  {language === "km" ? "សិស្សបានទទួលការណែនាំ" : "Students Guided"}
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-amber-300">300+</div>
                <div className="text-[12.5px] text-slate-300">
                  {language === "km" ? "ជំនាញសិក្សាផ្ទៀងផ្ទាត់" : "Mapped Majors"}
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-emerald-400">$0</div>
                <div className="text-[12.5px] text-slate-300">
                  {language === "km" ? "ឥតគិតថ្លៃជានិច្ច" : "Always Free"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
