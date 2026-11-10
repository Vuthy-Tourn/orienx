"use client";

import React, { useState } from "react";
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
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Compass,
  Award,
  BookOpen,
  Building2,
  TrendingUp,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<"student" | "admin" | null>(null);

  // RIASEC interactive showcase on right panel
  const [activeHolland, setActiveHolland] = useState<"R" | "I" | "A" | "S" | "E" | "C">("I");

  const hollandProfiles = {
    R: {
      code: "Realistic",
      codeKm: "អនុវត្តជាក់ស្តែង",
      major: "Civil & Mechatronics Engineering",
      majorKm: "វិស្វកម្មសំណង់ស៊ីវិល និងមេកាត្រូនិក",
      school: "Institute of Technology of Cambodia (ITC)",
      match: "95% Match",
    },
    I: {
      code: "Investigative",
      codeKm: "ស្រាវជ្រាវ និងវិភាគ",
      major: "Data Science & Artificial Intelligence",
      majorKm: "វិទ្យាសាស្ត្រទិន្នន័យ និងបញ្ញាសិប្បនិម្មិត",
      school: "Cambodia Academy of Digital Technology (CADT)",
      match: "98% Match",
    },
    A: {
      code: "Artistic",
      codeKm: "សិល្បៈ និងការច្នៃប្រឌិត",
      major: "Digital Media & UI/UX Design",
      majorKm: "ប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល និងការរចនា UI/UX",
      school: "SETEC Institute / Royal University of Fine Arts",
      match: "92% Match",
    },
    S: {
      code: "Social",
      codeKm: "ទំនាក់ទំនង និងសង្គម",
      major: "International Relations & Education",
      majorKm: "ទំនាក់ទំនងអន្តរជាតិ និងគរុកោសល្យ",
      school: "Institute of Foreign Languages (IFL / RUPP)",
      match: "94% Match",
    },
    E: {
      code: "Enterprising",
      codeKm: "សហគ្រិន និងដឹកនាំ",
      major: "Fintech & Global Business Management",
      majorKm: "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ និងការគ្រប់គ្រងពាណិជ្ជកម្ម",
      school: "National University of Management (NUM)",
      match: "91% Match",
    },
    C: {
      code: "Conventional",
      codeKm: "រៀបចំ និងប្រព័ន្ធច្បាប់",
      major: "Corporate Law, Banking & Auditing",
      majorKm: "នីតិសាស្រ្តពាណិជ្ជកម្ម និងសវនកម្មគណនេយ្យ",
      school: "Royal University of Law and Economics (RULE)",
      match: "93% Match",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail("student@futera.edu.kh");
    setPassword("StudentPass123!");
    setActiveDemo("student");
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail("admin@futera.edu.kh");
    setPassword("AdminSecure2026!");
    setActiveDemo("admin");
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#F5F6FA] overflow-hidden py-8 sm:py-12">
      {/* Background Dot Pattern */}
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
          
          {/* Left Column: Premium Login Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-10 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              
              {/* Header with Brand Badge */}
              <div className="flex items-center justify-between">
                <Logo showText={true} />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === "km" ? "ច្រកចូលសុវត្ថិភាព" : "Secure Student Portal"}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] tracking-tight">
                  {t("auth.signInTitle", "Sign In to OrienX")}
                </h1>
                <p className="text-sm text-[#68708A]">
                  {t(
                    "auth.signInSubtitle",
                    "Access your personalized Cambodian university and career dashboard"
                  )}
                </p>
              </div>

              {/* Interactive Demo Account Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#111965]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F7CE4D]" />
                    <span>{t("auth.demoTitle", "Instant Demo Login Accounts")}</span>
                  </div>
                  {activeDemo && (
                    <span className="text-[11px] font-medium text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === "km" ? "បានបំពេញរួចរាល់" : "Credentials loaded"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoStudent}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      activeDemo === "student"
                        ? "bg-[#111965]/5 border-[#111965] ring-2 ring-[#111965]/10 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#111965]">
                        {language === "km" ? "គណនីសិស្សគំរូ" : "Demo Student"}
                      </div>
                      <div className="text-[10px] text-[#68708A] truncate">
                        student@futera.edu.kh
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      activeDemo === "admin"
                        ? "bg-[#111965]/5 border-[#111965] ring-2 ring-[#111965]/10 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[#111965] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#111965]">
                        {language === "km" ? "គណនីអ្នកគ្រប់គ្រង" : "Demo Admin"}
                      </div>
                      <div className="text-[10px] text-[#68708A] truncate">
                        admin@futera.edu.kh
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setActiveDemo(null);
                      }}
                      placeholder="student@futera.edu.kh"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C] placeholder:text-[#68708A]/60"
                    />
                  </div>
                </div>

                {/* Password with Visibility Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#171A2C]">
                      {t("auth.passwordLabel", "Password")}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#111965] hover:underline"
                    >
                      {t("auth.forgotPassword", "Forgot password?")}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setActiveDemo(null);
                      }}
                      placeholder="••••••••"
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
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#68708A]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-[#111965] focus:ring-[#111965]/20 cursor-pointer accent-[#111965]"
                    />
                    <span>
                      {language === "km"
                        ? "ចងចាំគណនីខ្ញុំលើឧបករណ៍នេះ"
                        : "Remember this device for 30 days"}
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-[0.99] shadow-md shadow-amber-300/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#111965]/30 border-t-[#111965] rounded-full animate-spin" />
                      <span>{t("auth.signingIn", "Signing In...")}</span>
                    </div>
                  ) : (
                    <>
                      <span>{t("auth.signInButton", "Sign In")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer & Register Link */}
            <div className="pt-6 mt-6 border-t border-[#E6E8F0] space-y-3">
              <div className="text-center text-xs text-[#68708A]">
                <span>{t("auth.noAccountPrompt", "Don't have an account yet?")} </span>
                <Link
                  href="/register"
                  className="font-bold text-[#111965] hover:underline"
                >
                  {t("auth.createAccountLink", "Create Account")}
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#68708A]/80">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit TLS</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>MoEYS Curriculum Aligned</span>
                </span>
              </div>
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
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {language === "km"
                    ? "ប្រព័ន្ធតម្រង់ទិសអាជីព និងសាកលវិទ្យាល័យ"
                    : "Intelligent Higher Education Matching"}
                </span>
              </div>

              {/* Pitch Title */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {language === "km"
                    ? "ស្វែងយល់ពីចំណាប់អារម្មណ៍ពិត និងជ្រើសរើសជំនាញត្រឹមត្រូវ"
                    : "Discover Your True Direction Before Choosing a Major"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === "km"
                    ? "OrienX ជួយសិស្សបាក់ឌុប និងនិស្សិតកម្ពុជាវិភាគ RIASEC និងប្រៀបធៀបថ្លៃសិក្សា ៥០+ សាកលវិទ្យាល័យដោយឥតគិតថ្លៃ។"
                    : "Futera helps Cambodian high school graduates and undergraduates match their cognitive strengths with verified degree programs and scholarships."}
                </p>
              </div>

              {/* Interactive Holland RIASEC Mini Preview */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#F7CE4D]" />
                    {language === "km" ? "គំរូអនុសាសន៍ RIASEC" : "Live Holland Interest Sample"}
                  </span>
                  <span className="text-[11px] text-[#F7CE4D] font-mono font-bold">
                    {hollandProfiles[activeHolland].match}
                  </span>
                </div>

                {/* Holland Type Selector Tabs */}
                <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-black/20">
                  {(["R", "I", "A", "S", "E", "C"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveHolland(code)}
                      className={`py-1 rounded-lg text-xs font-bold transition-all ${
                        activeHolland === code
                          ? "bg-[#F7CE4D] text-[#111965] shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Holland Active Card Info */}
                <div className="pt-1 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <span>
                      {language === "km"
                        ? `${activeHolland} - ${hollandProfiles[activeHolland].codeKm}`
                        : `${activeHolland} - ${hollandProfiles[activeHolland].code}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {language === "km"
                      ? hollandProfiles[activeHolland].majorKm
                      : hollandProfiles[activeHolland].major}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {hollandProfiles[activeHolland].school}
                  </div>
                </div>
              </div>

              {/* Student Testimonial Quote */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                <p className="text-slate-200 italic leading-relaxed">
                  {language === "km"
                    ? "«OrienX បានជួយខ្ញុំប្រៀបធៀបតម្លៃសិក្សានៅ RUPP, ITC និង CADT យ៉ាងច្បាស់លាស់ ព្រមទាំងរកឃើញអាហារូបករណ៍មុនពេលប្រលងបាក់ឌុប។»"
                    : "“Futera allowed me to compare real tuition fees across RUPP, ITC, and CADT, helping me land a computer science scholarship before graduation.”"}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                  <div className="w-6 h-6 rounded-full bg-[#F7CE4D] text-[#111965] flex items-center justify-center font-bold text-[10px]">
                    SC
                  </div>
                  <div className="text-[11px]">
                    <span className="font-bold text-white">Sokha Chan</span>
                    <span className="text-slate-400"> · CADT CS Sophomore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Metric Badges */}
            <div className="relative z-10 pt-4 mt-6 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base sm:text-lg font-black text-white">35,000+</div>
                <div className="text-[10px] text-slate-300">
                  {language === "km" ? "សិស្សបានទទួលការណែនាំ" : "Students Guided"}
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-amber-300">50+</div>
                <div className="text-[10px] text-slate-300">
                  {language === "km" ? "សាកលវិទ្យាល័យផ្លូវការ" : "Verified Universities"}
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-300">
                  {language === "km" ? "ឥតគិតថ្លៃសម្រាប់សិស្ស" : "Free for Students"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
