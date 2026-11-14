"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Mail } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { AuthField } from "@/components/auth/auth-field";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCheckbox } from "@/components/auth/auth-checkbox";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateEmail = (value: string) => {
    setEmail(value);
    setFieldErrors((prev) => ({ ...prev, email: "" }));
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setFieldErrors((prev) => ({ ...prev, password: "" }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = t("auth.requiredEmail");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t("auth.invalidEmail");
    }
    if (!password) {
      errors.password = t("auth.requiredPassword");
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const signedIn = await login(email.trim(), password, rememberMe);
      const isAdmin = signedIn?.roles?.some(
        (role) => role === "ADMIN" || role === "SUPER_ADMIN"
      );
      router.push(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : null) ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (kind: "student" | "admin") => {
    if (kind === "student") {
      updateEmail("student@futera.edu.kh");
      updatePassword("StudentPass123!");
    } else {
      updateEmail("admin@futera.edu.kh");
      updatePassword("AdminPass123!");
    }
    setError(null);
  };

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
            {t("auth.signInButton")}
          </span>
        </div>
        <h1 className="text-[2.15rem] font-black leading-[1.03] tracking-[-0.05em] text-white sm:text-[2.45rem]">
          {t("auth.signInHeading")}
        </h1>
        <p className="mt-3 max-w-[340px] text-[13.5px] leading-relaxed text-white/65">
          {t("auth.signInDescription")}
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
            onChange={(event) => updateEmail(event.target.value)}
            error={fieldErrors.email || undefined}
          />
        </div>

        <div data-form-anim>
          <AuthField
            label={t("auth.passwordLabel")}
            icon={Lock}
            revealable
            autoComplete="current-password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(event) => updatePassword(event.target.value)}
            error={fieldErrors.password || undefined}
            rightSlot={
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#F7CE4D] underline-offset-4 transition-colors hover:text-[#FFE28A] hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            }
          />
        </div>

        <div data-form-anim>
          <AuthCheckbox checked={rememberMe} onChange={setRememberMe}>
            {t("auth.rememberMe")}
          </AuthCheckbox>
        </div>

        <div data-form-anim>
          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel={t("auth.signingIn")}
          >
            {t("auth.signInButton")}
          </AuthButton>
        </div>
      </form>

      <p
        data-form-anim
        className="mt-7 text-center text-[12.5px] text-white/65"
      >
        {t("auth.noAccountPrompt")}{" "}
        <Link
          href="/register"
          className="font-black text-[#F7CE4D] underline-offset-4 transition-colors hover:text-[#FFE28A] hover:underline"
        >
          {t("auth.createAccountLink")}
        </Link>
      </p>

      <div
        data-form-anim
        className="mt-8 border-t border-[#EAE4D9] pt-4 dark:border-white/10"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[9.5px] font-black uppercase tracking-[0.18em] text-white/50">
            {t("auth.demoAccess")}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo("student")}
              className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10.5px] font-bold text-white/70 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
            >
              {t("auth.demoStudent")}
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10.5px] font-bold text-white/70 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
            >
              {t("auth.demoAdmin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
