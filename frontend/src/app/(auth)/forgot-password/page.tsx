"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { DotPattern } from "@/components/magicui/dot-pattern";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F5F6FA] overflow-hidden py-8 sm:py-12">
      <DotPattern
        width={24}
        height={24}
        cx={1.5}
        cy={1.5}
        cr={1.5}
        className="text-slate-300/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
      />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-4">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors py-1.5 px-3 rounded-xl bg-white/70 hover:bg-white border border-[#E6E8F0] shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === "km" ? "ត្រឡប់ទៅចូលគណនី" : "Back to Sign In"}</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-3xl border border-[#E6E8F0] p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo showText={false} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#111965]">
              {language === "km" ? "កំណត់ពាក្យសម្ងាត់ឡើងវិញ" : "Reset Your Password"}
            </h1>
            <p className="text-xs text-[#68708A]">
              {language === "km"
                ? "បញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នកដើម្បីទទួលតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ"
                : "Enter your registered email address and we'll send you a password reset link"}
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-emerald-900">
                  {language === "km" ? "បានផ្ញើតំណភ្ជាប់រួចរាល់" : "Reset Link Sent"}
                </div>
                <p className="text-xs text-emerald-700">
                  {language === "km"
                    ? `យើងបានផ្ញើការណែនាំទៅកាន់ ${email}។ សូមពិនិត្យប្រអប់សំបុត្រ ឬ Spam របស់អ្នក។`
                    : `We've sent password recovery instructions to ${email}. Please check your inbox or spam folder.`}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111965] hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "km" ? "ត្រឡប់ទៅកាន់ទំព័រចូល" : "Back to Sign In"}</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171A2C]">
                  {language === "km" ? "អ៊ីមែល (Email Address)" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#68708A] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@futera.edu.kh"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-[#E6E8F0] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#111965] focus:ring-2 focus:ring-[#111965]/15 transition-all text-[#171A2C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] active:scale-[0.99] shadow-md shadow-amber-300/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#111965]/30 border-t-[#111965] rounded-full animate-spin" />
                    <span>{language === "km" ? "កំពុងផ្ញើ..." : "Sending link..."}</span>
                  </div>
                ) : (
                  <>
                    <span>
                      {language === "km" ? "ផ្ញើតំណភ្ជាប់កំណត់ឡើងវិញ" : "Send Reset Link"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[12px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {language === "km"
                    ? "សម្រាប់គណនីសាកល្បង Demo អ្នកអាចចូលប្រើប្រាស់បានភ្លាមៗតាមរយៈប៊ូតុង Instant Demo នៅទំព័រ Sign In។"
                    : "For testing demo accounts, you can use the instant one-click demo credentials on the Sign In page."}
                </span>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-[#E6E8F0] text-center text-xs text-[#68708A]">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold text-[#111965] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === "km" ? "ត្រឡប់ទៅកាន់ទំព័រចូល" : "Back to Sign In"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

