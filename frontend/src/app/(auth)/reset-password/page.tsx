"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
} from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { AuthField } from "@/components/auth/auth-field";
import { AuthButton } from "@/components/auth/auth-button";

function ResetFallback() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-28 animate-pulse rounded-full bg-[#EFE9DE] dark:bg-white/10" />
      <div className="h-12 w-3/4 animate-pulse rounded-xl bg-[#EFE9DE] dark:bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded-md bg-[#EFE9DE] dark:bg-white/10" />
      <div className="h-[52px] w-full animate-pulse rounded-[14px] bg-[#EFE9DE] dark:bg-white/10" />
      <div className="h-[52px] w-full animate-pulse rounded-[14px] bg-[#EFE9DE] dark:bg-white/10" />
    </div>
  );
}

function ResetPasswordContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (!password) {
      errors.password = t("auth.requiredPassword");
    } else if (password.length < 8) {
      errors.password = t("auth.passwordTooShort");
    }
    if (!confirmPassword) {
      errors.confirmPassword = t("auth.requiredPassword");
    } else if (confirmPassword !== password) {
      errors.confirmPassword = t("auth.passwordMismatch");
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      setSucceeded(true);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : null) ||
          "We could not update your password. The reset link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-[#F7CE4D] shadow-[0_16px_30px_-22px_rgba(0,0,0,0.6)] backdrop-blur-sm">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-[2.05rem] font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-[2.35rem]">
          {t("auth.invalidResetLink")}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
          {t("auth.requestNewLink")}.
        </p>
        <Link
          href="/forgot-password"
          className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-[#F7CE4D] px-5 py-3 text-[12px] font-black text-[#111965] transition-all hover:-translate-y-0.5 hover:bg-[#F5C83B]"
        >
          {t("auth.requestNewLink")}
        </Link>
        <div className="mt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-white/65 underline-offset-4 hover:text-white hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-[2.05rem] font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-[2.35rem]">
          {t("auth.passwordUpdated")}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
          {t("auth.passwordUpdatedDescription")}
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-[#F7CE4D] px-5 py-3 text-[12px] font-black text-[#111965] transition-all hover:-translate-y-0.5 hover:bg-[#F5C83B]"
        >
          {t("auth.continueToSignIn")}
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
            {t("auth.resetPasswordKicker")}
          </span>
        </div>
        <h1 className="text-[2.05rem] font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-[2.35rem]">
          {t("auth.resetHeading")}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
          {t("auth.resetDescription")}
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div data-form-anim>
          <AuthField
            label={t("auth.newPasswordLabel")}
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={fieldErrors.password || undefined}
          />
        </div>

        <div data-form-anim>
          <AuthField
            label={t("auth.confirmNewPasswordLabel")}
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder={t("auth.passwordPlaceholder")}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={fieldErrors.confirmPassword || undefined}
          />
        </div>

        <div data-form-anim className="pt-1">
          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel={t("auth.updatingPassword")}
          >
            {t("auth.updatePassword")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
