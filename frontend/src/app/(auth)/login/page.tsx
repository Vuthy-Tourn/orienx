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
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail("student@futera.edu.kh");
    setPassword("StudentPass123!");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@futera.edu.kh");
    setPassword("AdminSecure2026!");
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo showText={false} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111965]">
            {t("auth.signInTitle")}
          </h1>
          <p className="text-xs text-[#68708A]">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t("auth.demoTitle")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={fillDemoStudent}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-950 font-semibold hover:bg-amber-100/50 text-left transition-colors"
            >
              👩‍🎓 Demo Student
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-950 font-semibold hover:bg-amber-100/50 text-left transition-colors"
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
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
                  placeholder="student@futera.edu.kh"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965] focus:ring-1 focus:ring-[#111965]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#171A2C]">
                  {t("auth.passwordLabel")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#111965] hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68708A] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-[#E6E8F0] focus:outline-hidden focus:border-[#111965] focus:ring-1 focus:ring-[#111965]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{t("auth.signingIn")}</span>
              ) : (
                <>
                  <span>{t("auth.signInButton")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E6E8F0] text-center text-xs text-[#68708A]">
            <span>{t("auth.noAccountPrompt")} </span>
            <Link href="/register" className="font-bold text-[#111965] hover:underline">
              {t("auth.createAccountLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
