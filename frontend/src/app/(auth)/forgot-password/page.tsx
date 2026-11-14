"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowUpRight, Mail, MailCheck } from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { AuthField } from "@/components/auth/auth-field";
import { AuthButton } from "@/components/auth/auth-button";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setFieldError(t("auth.requiredEmail"));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFieldError(t("auth.invalidEmail"));
      return;
    }

    setFieldError("");
    setLoading(true);
    try {
      const result = await apiFetch<{
        sent: boolean;
        reset_url?: string | null;
      }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setResetUrl(result?.reset_url || null);
      setSent(true);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : null) ||
          "We could not send the reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-[#F7CE4D] shadow-[0_16px_30px_-22px_rgba(0,0,0,0.6)] backdrop-blur-sm">
          <MailCheck className="h-6 w-6" />
        </div>

        <h1 className="text-[2.05rem] font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-[2.35rem]">
          {t("auth.checkYourEmail")}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
          {t("auth.resetSentDescription")}
        </p>

        <div className="mt-5 flex items-center gap-2.5 rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3 text-[12px] font-bold text-white/80 backdrop-blur-sm">
          <Mail className="h-4 w-4 shrink-0 text-white/50" />
          <span className="truncate">{email.trim()}</span>
        </div>

        {resetUrl && (
          <div className="mt-4 rounded-[14px] border border-dashed border-white/15 bg-white/[0.04] p-3.5 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              Local development
            </p>
            <a
              href={resetUrl}
              className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#F7CE4D] underline-offset-4 hover:text-[#FFE28A] hover:underline"
            >
              {t("auth.devResetLink")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 text-[12px] font-black text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div data-form-anim className="mb-8">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-px w-7 bg-[#F7CE4D]" />
          <span
            className={`font-black text-white/50 ${
              language === "km"
                ? "text-[11px] tracking-normal"
                : "text-[10px] uppercase tracking-[0.2em]"
            }`}
          >
            {t("auth.accountRecovery")}
          </span>
        </div>
        <h1 className="text-[2.05rem] font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-[2.35rem]">
          {t("auth.forgotHeading")}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
          {t("auth.forgotDescription")}
        </p>
      </div>

      {error && (
        <div
          data-form-anim
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-[14px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[12px] font-medium leading-relaxed text-rose-200 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div data-form-anim>
          <AuthField
            label={t("auth.emailLabel")}
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldError("");
            }}
            error={fieldError || undefined}
          />
        </div>

        <div data-form-anim>
          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel={t("auth.sendingResetLink")}
          >
            {t("auth.sendResetLink")}
          </AuthButton>
        </div>
      </form>

      <Link
        data-form-anim
        href="/login"
        className="mt-7 inline-flex items-center gap-2 text-[12px] font-black text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("auth.backToSignIn")}
      </Link>
    </div>
  );
}
