"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { getStaticUniversity } from "@/lib/data/catalog";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Share2,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import {
  cn,
  formatTuitionDisplay,
  formatUSD,
  localizeDegreeLevel,
  localizeInstructionLanguage,
  localizeProvince,
} from "@/lib/utils";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Skeleton } from "@/components/ui/skeleton";

function formatEnumLabel(value?: string) {
  if (!value) return "";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function splitLongParagraph(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "." && ch !== "!" && ch !== "?" && ch !== "។") continue;
    const next = text[i + 1];
    if (next && !/\s/.test(next)) continue;

    // Avoid splitting inside initials like "U.S." or "A.E.U."
    const prev = i > 0 ? text[i - 1] : "";
    const prevTwo = i > 1 ? text[i - 2] : "";
    if (ch === "." && /[A-Za-z]/.test(prev) && (i === 1 || prevTwo === "." || /\s/.test(prevTwo))) {
      continue;
    }

    const chunk = text.slice(start, i + 1).trim();
    if (chunk.length > 0) {
      sentences.push(chunk);
      start = i + 1;
    }
  }
  const rest = text.slice(start).trim();
  if (rest.length > 0) sentences.push(rest);
  return sentences.length > 0 ? sentences : [text];
}

function renderHighlightedInline(text: string): React.ReactNode {
  // Highlight acronyms like (ACAC), U.S.-accredited, numbers/years/durations like 2017, 2-year, 21st-century, ២០១៧
  const tokenRegex =
    /(\([A-Z0-9.\s]{2,14}\)|\b(?:19|20)\d{2}\b|\b\d+(?:st|nd|rd|th)?[-–]?(?:year|years|month|months|century)\b|[០-៩]{2,4}(?:\s?(?:ឆ្នាំ|ខែ|នាក់))?|\b\d+(?:,\d+)*(?:\+|%)?|\b(?:STEM|AI|IT|DevOps|Full-stack|MoEYS|CADT|RUPP|ITC|AUPP|ACAC|AEU|AIB|BBU|NUM)\b)/g;

  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (idx % 2 === 1) {
      return (
        <strong
          key={idx}
          className="font-extrabold text-[#0F1754] dark:text-[#F7CE4D]"
        >
          {part}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function UniversityDescription({ text }: { text: string }) {
  const rawBlocks = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let lead = rawBlocks[0] ?? text;
  let highlights: string[] = [];

  if (rawBlocks.length === 1 && rawBlocks[0].length > 240) {
    const sentences = splitLongParagraph(rawBlocks[0]);
    if (sentences.length > 1) {
      lead = sentences[0];
      highlights = sentences.slice(1);
    }
  } else if (rawBlocks.length > 1) {
    // If the first paragraph itself is very long, split off its opening sentence
    if (rawBlocks[0].length > 280) {
      const firstSentences = splitLongParagraph(rawBlocks[0]);
      if (firstSentences.length > 1) {
        lead = firstSentences[0];
        highlights = [...firstSentences.slice(1), ...rawBlocks.slice(1)];
      } else {
        highlights = rawBlocks.slice(1);
      }
    } else {
      highlights = rawBlocks.slice(1);
    }
  }

  return (
    <div className="space-y-3.5">
      <p className="text-sm sm:text-base font-medium leading-relaxed text-[#171A2C] dark:text-slate-100">
        {renderHighlightedInline(lead)}
      </p>

      {highlights.length > 0 && (
        <ul className="space-y-2 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.03]">
          {highlights.map((rawItem, idx) => {
            const isSectionHeader = /^[^:]{2,28}:$/.test(rawItem);
            const cleaned = rawItem.replace(/^[•\-–*]\s*/, "");
            if (isSectionHeader) {
              return (
                <li
                  key={idx}
                  className="pt-1 text-xs font-black uppercase tracking-wider text-[#0F1754] dark:text-[#F7CE4D] list-none"
                >
                  {cleaned}
                </li>
              );
            }
            return (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#475569] dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F1754] dark:bg-[#F7CE4D]" />
                <span>{renderHighlightedInline(cleaned)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#111965] ring-1 ring-[#E6E8F0]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-black uppercase tracking-[0.1em] text-[#68708A]">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-[#171A2C]">
          {value}
        </span>
      </span>
      {href && (
        <ChevronRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
      {content}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "group flex w-full items-center gap-2.5 rounded-xl border border-[#E6E8F0] bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#111965]/25 hover:shadow-xs";
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F2FA] text-[#111965] transition-colors group-hover:bg-[#111965] group-hover:text-[#F7CE4D]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-xs sm:text-sm font-bold text-[#111965]">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { t, getLocalized, language } = useLanguage();
  const [linkCopied, setLinkCopied] = useState(false);

  const uni = getStaticUniversity(slug);
  const isLoading = false;
  const error = uni ? null : new Error("University not found");
  const isFetching = false;
  const refetch = () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] py-6 lg:py-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-7 w-32 rounded-full" />
          <div className="overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white">
            <Skeleton className="h-48 w-full rounded-none sm:h-64 lg:h-72" />
            <div className="space-y-5 p-5 sm:p-7 lg:p-8">
              <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
                <Skeleton className="h-20 w-20 rounded-2xl border-4 border-white dark:border-[#111827] sm:h-24 sm:w-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-2/3 rounded-lg" />
                  <Skeleton className="h-3 w-1/3 rounded-md" />
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <Skeleton className="h-56 w-full rounded-2xl" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] p-4">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-rose-200/80 bg-white p-8 text-center shadow-xs sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
            <WifiOff className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-[#111965]">
              University Not Found
            </h2>
            <p className="text-xs text-[#68708A] sm:text-sm">
              We couldn&apos;t load this university profile. Please check your
              connection or try again.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7CE4D] px-4 py-2 text-xs font-bold text-[#111965] transition-all hover:bg-[#E5BD3B] disabled:opacity-60"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
              />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => router.back()}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const name = getLocalized(uni.name);
  const acronym = uni.acronym?.en || uni.acronym?.km || uni.slug?.toUpperCase();
  const description = getLocalized(uni.description);
  const addressText = getLocalized(uni.address);
  const province = localizeProvince(uni.province, language);
  const isPublic = uni.university_type === "PUBLIC";
  const offerings: any[] = uni.offerings || [];
  const programCount = offerings.length;
  const programLabel =
    language === "km"
      ? t("universityDetail.programs")
      : programCount === 1
      ? "program"
      : "programs";
  const establishedYear = uni.established_year;

  const tuitionText = formatTuitionDisplay({
    min: uni.tuition_range_min_usd,
    max: uni.tuition_range_max_usd,
    isVerified: uni.is_tuition_verified,
    language,
  });

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [addressText || uni.province || "Cambodia", "Cambodia"]
      .filter(Boolean)
      .join(", ")
  )}`;

  const uniqueDegreeLevels = Array.from(
    new Set(
      offerings
        .map((offering) => localizeDegreeLevel(offering.degree_level, language))
        .filter(Boolean)
    )
  );
  const uniqueLanguages = Array.from(
    new Set(
      offerings
        .map((offering) =>
          localizeInstructionLanguage(
            offering.language_of_instruction,
            language
          )
        )
        .filter(Boolean)
    )
  );
  const durations = offerings
    .map((offering) => Number(offering.duration_years))
    .filter((duration) => Number.isFinite(duration));
  const durationText = durations.length
    ? Math.min(...durations) === Math.max(...durations)
      ? `${durations[0]} ${t("universityDetail.years")}`
      : `${Math.min(...durations)}–${Math.max(...durations)} ${t(
          "universityDetail.years"
        )}`
    : "—";

  const admissionRequirements = uni.admission_requirements as
    | { en?: string[]; km?: string[] }
    | null;
  const reqList =
    (language === "km" && admissionRequirements?.km?.length
      ? admissionRequirements.km
      : admissionRequirements?.en) ?? [];
  const facilities = uni.facilities as
    | { en?: string[]; km?: string[] }
    | null;
  const facList =
    (language === "km" && facilities?.km?.length
      ? facilities.km
      : facilities?.en) ?? [];

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description?.slice(0, 140),
          url,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard access can be unavailable; leave the page unchanged.
    }
  };

  const exploreCards = [
    {
      href: "#programs",
      icon: BookOpen,
      title: t("universityDetail.programs"),
      hint: `${programCount} ${programLabel}`,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: "#admissions",
      icon: GraduationCap,
      title: t("universityDetail.admissions"),
      hint: t("universityDetail.admissionsHint"),
      tone: "bg-amber-50 text-amber-700",
    },
    {
      href: "#facilities",
      icon: Building2,
      title: t("universityDetail.campus"),
      hint: t("universityDetail.facilitiesHint"),
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth bg-[#F5F6FA] py-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">
        {/* Back link and breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6E8F0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#68708A] transition-colors hover:border-[#111965]/20 hover:text-[#111965]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("universityDetail.back")}</span>
          </button>

          <div className="hidden items-center gap-1.5 text-[11px] text-[#94A3B8] sm:flex">
            <span>{t("nav.universities")}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[260px] truncate font-bold text-[#68708A]">
              {name}
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white shadow-[0_24px_70px_-48px_rgba(17,25,101,0.45)]">
          <div className="relative h-48 w-full overflow-hidden bg-[#0A0F3D] sm:h-64 lg:h-72">
            {uni.cover_image_url ? (
              <Image
                src={uni.cover_image_url}
                alt={name || "University campus"}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1152px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F3D] via-[#111965] to-[#1E277A]">
                <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#F7CE4D]/15 blur-3xl" />
                <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <Building2
                  className="absolute -bottom-8 right-8 h-44 w-44 text-white/[0.06]"
                  strokeWidth={1}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F3D]/85 via-[#0A0F3D]/20 to-transparent" />

            <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2 sm:inset-x-6 sm:top-5">
              <div className="flex max-w-[75%] flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/45 px-2.5 py-1 text-[10.5px] font-bold text-white shadow-xs backdrop-blur-sm">
                  <Building2 className="h-3 w-3" />
                  <span>
                    {isPublic
                      ? t("universityDetail.publicType")
                      : t("universityDetail.privateType")}
                  </span>
                </span>

                {uni.is_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-950/60 px-2.5 py-1 text-[10.5px] font-bold text-emerald-100 shadow-xs backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-emerald-300" />
                    <span>{t("universityDetail.verifiedInstitution")}</span>
                  </span>
                )}
              </div>

              <BookmarkButton
                entityType="university"
                entityId={uni.id}
                variant="overlay"
                size="sm"
                showText
                textActive={t("universityDetail.saved")}
                textInactive={t("universityDetail.save")}
              />
            </div>
          </div>

          <div className="relative px-5 pb-6 sm:px-7 sm:pb-8 lg:px-8">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
              <div className="-mt-12 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white dark:border-[#111827] bg-white dark:bg-[#111827] shadow-lg sm:-mt-14 sm:h-24 sm:w-24">
                {uni.logo_url ? (
                  <img
                    src={uni.logo_url}
                    alt={`${name} logo`}
                    loading="lazy"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#111965] text-lg font-black tracking-wide text-[#F7CE4D]">
                    {(uni.acronym?.en || uni.slug || "U")
                      .slice(0, 3)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 pt-2 sm:pt-3">
                <h1 className="text-2xl font-black leading-tight text-[#111965] sm:text-3xl lg:text-4xl">
                  {name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#68708A]">
                  {acronym}
                  {establishedYear
                    ? ` • ${t("universityDetail.established")} ${establishedYear}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {province && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-1.5 text-xs font-bold text-[#68708A]">
                  <MapPin className="h-3.5 w-3.5 text-[#111965]" />
                  {province}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-1.5 text-xs font-bold text-[#68708A]">
                <GraduationCap className="h-3.5 w-3.5 text-[#111965]" />
                {programCount} {programLabel}
              </span>
              {uni.is_tuition_verified && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("universityDetail.verifiedTuition")}
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-8">
              <div className="min-w-0">
                {description && <UniversityDescription text={description} />}

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <ActionTile
                    icon={Navigation}
                    label={t("universityDetail.directions")}
                    href={mapsHref}
                  />
                  {uni.contact_phone && (
                    <ActionTile
                      icon={Phone}
                      label={t("universityDetail.callNow")}
                      href={`tel:${uni.contact_phone}`}
                    />
                  )}
                  {uni.website_url && (
                    <ActionTile
                      icon={Globe}
                      label={t("universityDetail.website")}
                      href={uni.website_url}
                    />
                  )}
                  <ActionTile
                    icon={linkCopied ? CheckCircle2 : Share2}
                    label={
                      linkCopied
                        ? t("universityDetail.linkCopied")
                        : t("universityDetail.share")
                    }
                    onClick={handleShare}
                  />
                </div>

                {programCount > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {[
                      {
                        label: t("universityDetail.degree"),
                        value: uniqueDegreeLevels.join(" · ") || "—",
                      },
                      {
                        label: t("universityDetail.language"),
                        value: uniqueLanguages.join(" · ") || "—",
                      },
                      {
                        label: t("universityDetail.duration"),
                        value: durationText,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3.5 py-3"
                      >
                        <div className="text-xs font-black uppercase tracking-[0.08em] text-[#68708A]">
                          {item.label}
                        </div>
                        <div className="mt-1 line-clamp-1 text-sm font-bold text-[#111965]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <aside className="min-w-0">
                <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4 sm:p-5">
                  <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#68708A]">
                    {t("universityDetail.atAGlance")}
                  </h2>

                  <div className="mt-2 divide-y divide-[#E6E8F0]">
                    <FactRow
                      icon={MapPin}
                      label={t("universityDetail.location")}
                      value={addressText || province || "—"}
                      href={mapsHref}
                    />
                    {uni.contact_phone && (
                      <FactRow
                        icon={Phone}
                        label={t("universityDetail.callNow")}
                        value={uni.contact_phone}
                        href={`tel:${uni.contact_phone}`}
                      />
                    )}
                    {uni.contact_email && (
                      <FactRow
                        icon={Mail}
                        label={t("universityDetail.contact")}
                        value={uni.contact_email}
                        href={`mailto:${uni.contact_email}`}
                      />
                    )}
                    <FactRow
                      icon={DollarSign}
                      label={
                        uni.is_tuition_verified
                          ? t("universityDetail.annualTuition")
                          : t("universityDetail.tuitionShort")
                      }
                      value={tuitionText}
                    />
                  </div>

                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Section navigation */}
        <section className="space-y-3">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-[#68708A]">
            {t("universityDetail.exploreSections")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {exploreCards.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.href}
                  href={card.href}
                  className="group flex items-center gap-3.5 rounded-2xl border border-[#E6E8F0] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#111965]/20 hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)]"
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      card.tone
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-[#111965]">
                      {card.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#68708A]">
                      {card.hint}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5" />
                </a>
              );
            })}
          </div>
        </section>

        {/* Programs */}
        <section id="programs" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-black text-[#111965] sm:text-2xl">
                {t("universityDetail.availablePrograms")}
              </h2>
              <p className="mt-0.5 text-sm text-[#68708A]">
                {t("universityDetail.programsSubtitle")}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#E6E8F0] bg-white px-3 py-1 text-xs font-bold text-[#68708A]">
              <BookOpen className="h-3.5 w-3.5" />
              {programCount} {programLabel}
            </span>
          </div>

          {programCount > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {offerings.map((offering: any) => {
                const majorName = getLocalized(offering.major_name);
                const tuition = formatTuitionDisplay({
                  min: offering.tuition_annual_usd,
                  isVerified: offering.is_tuition_verified,
                  language,
                });
                return (
                  <Link
                    key={`${offering.major_id}-${offering.degree_level}-${offering.language_of_instruction}`}
                    href={`/majors/${offering.major_slug}`}
                    className="group flex gap-3.5 rounded-2xl border border-[#E6E8F0] bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#111965]/25 hover:shadow-[0_8px_20px_-16px_rgba(17,25,101,0.22)] sm:gap-4 sm:p-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F0F2FA] sm:h-24 sm:w-24">
                      {offering.major_image_url ? (
                        <Image
                          src={offering.major_image_url}
                          alt={majorName || "Major"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 80px, 96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111965] to-[#1E277A] text-[#F7CE4D]">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate rounded-md bg-[#F0F2FA] px-2.5 py-0.5 text-xs font-bold text-[#111965]">
                            {t(
                              `categories.${offering.major_category}`,
                              formatEnumLabel(offering.major_category)
                            )}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-xs sm:text-sm font-black",
                              offering.is_tuition_verified
                                ? "text-emerald-700"
                                : "text-[#68708A]"
                            )}
                          >
                            {tuition}
                          </span>
                        </div>
                        <h3 className="mt-1.5 line-clamp-2 text-sm sm:text-base font-black leading-snug text-[#111965] transition-colors group-hover:text-[#1E277A]">
                          {majorName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#68708A]">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {localizeDegreeLevel(offering.degree_level, language)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {offering.duration_years}{" "}
                          {language === "km"
                            ? t("universityDetail.years")
                            : offering.duration_years === 1
                            ? "year"
                            : "years"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          {localizeInstructionLanguage(
                            offering.language_of_instruction,
                            language
                          )}
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 text-[#111965] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D8DDEB] bg-white p-8 text-center text-xs text-[#68708A]">
              <BookOpen className="mx-auto mb-2 h-6 w-6 text-[#94A3B8]" />
              {t("universityDetail.noPrograms")}
            </div>
          )}
        </section>

        {/* Admissions and facilities */}
        <div className="grid gap-4 md:grid-cols-2">
          <section
            id="admissions"
            className="scroll-mt-24 rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-black text-[#111965]">
                  {t("universityDetail.admissionRequirements")}
                </h2>
                <p className="mt-0.5 text-xs text-[#68708A]">
                  {t("universityDetail.admissionsHint")}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5">
              {reqList.length > 0 ? (
                reqList.map((requirement: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-[#171A2C]"
                  >
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <span>{requirement}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2.5 text-sm leading-relaxed text-[#171A2C]">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  <span>{t("universityDetail.standardAdmission")}</span>
                </li>
              )}
            </ul>
          </section>

          <section
            id="facilities"
            className="scroll-mt-24 rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-2xs sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-black text-[#111965]">
                  {t("universityDetail.facilities")}
                </h2>
                <p className="mt-0.5 text-xs text-[#68708A]">
                  {t("universityDetail.facilitiesHint")}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5">
              {facList.length > 0 ? (
                facList.map((facility: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-[#171A2C]"
                  >
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <span>{facility}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2.5 text-sm leading-relaxed text-[#171A2C]">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  <span>{t("universityDetail.standardFacilities")}</span>
                </li>
              )}
            </ul>
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-[#F7CE4D]/50 bg-gradient-to-br from-[#FFF9E6] via-white to-[#F8FAFD] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F7CE4D]/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-[#F7CE4D]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#111965]">
                  {t("universityDetail.readyTitle")}
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-[#68708A]">
                  {t("universityDetail.readyHint")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#programs"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs sm:text-sm font-black text-[#0F1754] dark:text-[#0F1754] transition-colors hover:bg-[#E5BD3B]"
              >
                {t("universityDetail.explorePrograms")}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              {uni.website_url && (
                <a
                  href={uni.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E8F0] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#111965] transition-colors hover:border-[#111965]/25"
                >
                  {t("universityDetail.officialWebsite")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
