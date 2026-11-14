"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Mail, User as UserIcon } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { AuthField } from "@/components/auth/auth-field";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCheckbox } from "@/components/auth/auth-checkbox";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (key: string, setter: (value: string) => void) => {
    return (value: string) => {
      setter(value);
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    };
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = t("auth.requiredName");
    } else if (fullName.trim().length < 2) {
      errors.fullName = t("auth.requiredName");
    }

    if (!email.trim()) {
      errors.email = t("auth.requiredEmail");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t("auth.invalidEmail");
    }

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

    if (!acceptedTerms) {
      errors.terms = t("auth.acceptTerms");
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
      await register({
        email: email.trim(),
        password,
        full_name_en: fullName.trim(),
        province: "Phnom Penh",
        current_education_level: "GRADE_12",
        graduation_year: new Date().getFullYear(),
        preferred_language: language,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : null) ||
          "We could not create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div data-form-anim className="mb-4 sm:mb-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-px w-7 bg-[#F7CE4D]" />
          <span
            className={`font-black text-white/50 ${
              language === "km"
                ? "text-[11px] tracking-normal"
                : "text-[10px] uppercase tracking-[0.2em]"
            }`}
          >
            {t("auth.createAccountLink")}
          </span>
        </div>
        <h1 className="text-[2.15rem] font-black leading-[1.03] tracking-[-0.05em] text-white sm:text-[2.45rem]">
          {t("auth.signUpHeading")}
        </h1>
        <p className="mt-3 max-w-[340px] text-[13.5px] leading-relaxed text-white/65">
          {t("auth.signUpDescription")}
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

      <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" data-form-anim>
          <AuthField
            label={t("auth.fullNameLabel")}
            icon={UserIcon}
            autoComplete="name"
            className="h-12 sm:h-[52px]"
            placeholder={t("auth.fullNamePlaceholder")}
            value={fullName}
            onChange={(event) =>
              updateField("fullName", setFullName)(event.target.value)
            }
            error={fieldErrors.fullName || undefined}
          />
          <AuthField
            label={t("auth.emailLabel")}
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="h-12 sm:h-[52px]"
            spellCheck={false}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(event) =>
              updateField("email", setEmail)(event.target.value)
            }
            error={fieldErrors.email || undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" data-form-anim>
          <AuthField
            label={t("auth.passwordLabel")}
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-12 sm:h-[52px]"
            value={password}
            onChange={(event) =>
              updateField("password", setPassword)(event.target.value)
            }
            error={fieldErrors.password || undefined}
          />
          <AuthField
            label={t("auth.confirmPasswordLabel")}
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-12 sm:h-[52px]"
            value={confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", setConfirmPassword)(
                event.target.value
              )
            }
            error={fieldErrors.confirmPassword || undefined}
          />
        </div>

        <div data-form-anim className="pt-0.5">
          <AuthCheckbox
            checked={acceptedTerms}
            onChange={(checked) => {
              setAcceptedTerms(checked);
              setFieldErrors((prev) => ({ ...prev, terms: "" }));
            }}
            error={fieldErrors.terms || undefined}
          >
            {t("auth.termsPrefix")}{" "}
            <Link
              href="/about#terms"
              onClick={(event) => event.stopPropagation()}
              className="font-bold text-[#F7CE4D] underline-offset-4 hover:text-[#FFE28A] hover:underline"
            >
              {t("auth.termsOfService")}
            </Link>{" "}
            {t("auth.termsAnd")}{" "}
            <Link
              href="/about#privacy"
              onClick={(event) => event.stopPropagation()}
              className="font-bold text-[#F7CE4D] underline-offset-4 hover:text-[#FFE28A] hover:underline"
            >
              {t("auth.privacyPolicy")}
            </Link>
            .
          </AuthCheckbox>
        </div>

        <div data-form-anim className="pt-1">
          <AuthButton
            type="submit"
            loading={loading}
            loadingLabel={t("auth.creatingAccount")}
          >
            {t("auth.registerButton")}
          </AuthButton>
        </div>
      </form>

      <p
        data-form-anim
        className="mt-5 text-center text-[12.5px] text-white/65"
      >
        {t("auth.hasAccountPrompt")}{" "}
        <Link
          href="/login"
          className="font-black text-[#F7CE4D] underline-offset-4 transition-colors hover:text-[#FFE28A] hover:underline"
        >
          {t("auth.signInLink")}
        </Link>
      </p>
    </div>
  );
}
