"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { getStaticMajor } from "@/lib/data/catalog";
import { RIASEC_DIMENSIONS } from "@/lib/riasec-meta";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Clock3,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  MapPin,
  Wallet,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Skeleton } from "@/components/ui/skeleton";
import { localizeDegreeLevel, localizeProvince } from "@/lib/utils";

const UNIVERSITY_PREVIEW_COUNT = 6;

const DEGREE_LEVEL_LABELS: Record<string, { en: string; km: string }> = {
  BACHELOR: { en: "Bachelor", km: "បរិញ្ញាបត្រ" },
  ASSOCIATE: { en: "Associate", km: "បរិញ្ញាបត្ររង" },
};

function formatDegreeLevel(level: string) {
  return (
    DEGREE_LEVEL_LABELS[level] ?? {
      en: level.charAt(0) + level.slice(1).toLowerCase(),
      km: level.charAt(0) + level.slice(1).toLowerCase(),
    }
  );
}

export default function MajorDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { t, getLocalized, language } = useLanguage();
  const [showAllUniversities, setShowAllUniversities] = useState(false);

  const major = getStaticMajor(slug);
  const isLoading = false;
  const error = major ? null : new Error("Major not found");
  const isFetching = false;
  const refetch = () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="bg-white rounded-3xl p-8 border border-[#E6E8F0] space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-8 w-2/3 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !major) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <div className="rounded-3xl bg-white border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
            <WifiOff className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-[#111965]">Major Not Found</h2>
            <p className="text-xs sm:text-sm text-[#68708A]">
              {"We couldn't load this major's details. Please check your connection or try again."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const universities = major.universities ?? [];
  const universityCount = universities.length || major.universities_count || 0;
  const visibleUniversities = showAllUniversities
    ? universities
    : universities.slice(0, UNIVERSITY_PREVIEW_COUNT);
  const hasMoreUniversities = universities.length > UNIVERSITY_PREVIEW_COUNT;
  const tuitionValues = universities
    .map((university) => university.tuition_annual_usd)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const minTuition =
    tuitionValues.length > 0 ? Math.min(...tuitionValues) : major.min_tuition_usd;
  const durationValues = Array.from(
    new Set(
      universities
        .map((university) => university.duration_years)
        .filter((value): value is number => typeof value === "number" && value > 0)
    )
  ).sort((a, b) => a - b);
  const durationLabel =
    durationValues.length === 0
      ? "—"
      : durationValues.length === 1
        ? `${durationValues[0]} ${t("majorDetail.years")}`
        : `${durationValues[0]}–${durationValues[durationValues.length - 1]} ${t("majorDetail.years")}`;
  const degreeLevels = Array.from(
    new Set(universities.map((university) => university.degree_level).filter(Boolean))
  );
  const degreeLabel =
    degreeLevels.length > 0
      ? degreeLevels.map((level) => getLocalized(formatDegreeLevel(level))).join(" · ")
      : "—";
  const personalityTypes =
    major.personality_affinity
      ?.split(",")
      .map((type) => type.trim())
      .filter(Boolean) ?? [];
  const primaryInterest = RIASEC_DIMENSIONS[major.riasec_primary];
  const secondaryInterest = RIASEC_DIMENSIONS[major.riasec_secondary];

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68708A] hover:text-[#111965] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("majorDetail.back")}</span>
        </button>

        {major.image_url && (
          <div className="relative h-40 w-full overflow-hidden rounded-3xl border border-[#E6E8F0] bg-slate-100 shadow-xs sm:h-56">
            <Image
              src={major.image_url}
              alt={getLocalized(major.name) || "Major"}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
        )}

        {/* Major Header */}
        <div className="rounded-3xl bg-white border border-[#E6E8F0] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F2FA] text-[#111965]">
                  {t(`categories.${major.category}`, major.category)}
                </span>
                {major.is_stem && (
                  <span className="px-2 py-0.5 rounded-full text-[12.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    STEM Discipline
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965] leading-snug">
                {getLocalized(major.name)}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#68708A] pt-1">
                <span>
                  <strong className="text-[#111965]">Primary RIASEC:</strong> {major.riasec_primary} (Secondary: {major.riasec_secondary})
                </span>
                {major.personality_affinity && (
                  <span>
                    • <strong className="text-[#111965]">Personality Affinity:</strong> {major.personality_affinity}
                  </span>
                )}
              </div>
            </div>

            <BookmarkButton
              entityType="major"
              entityId={major.id}
              variant="pill"
              size="md"
              showText
              textActive="បានរក្សាទុក (Saved)"
              textInactive="រក្សាទុកមុខជំនាញ"
            />
          </div>

          <p className="text-sm text-[#171A2C] leading-relaxed">
            {getLocalized(major.description)}
          </p>

          <div className="border-t border-[#E6E8F0] pt-5">
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A]">
              {t("majorDetail.overview")}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#68708A]">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{t("majorDetail.universitiesCount")}</span>
                </div>
                <div className="mt-1.5 text-xl font-black text-[#111965]">
                  {universityCount}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#68708A]">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>{t("majorDetail.tuitionFrom")}</span>
                </div>
                <div className="mt-1.5 text-xl font-black text-[#111965]">
                  {minTuition ? `$${Math.round(minTuition)}` : "—"}
                  {minTuition ? (
                    <span className="ml-1 text-[11px] font-semibold text-[#68708A]">
                      / yr
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#68708A]">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{t("majorDetail.duration")}</span>
                </div>
                <div className="mt-1.5 text-lg font-black text-[#111965]">
                  {durationLabel}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#68708A]">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{t("majorDetail.degreeLevel")}</span>
                </div>
                <div className="mt-1.5 text-sm font-black leading-snug text-[#111965]">
                  {degreeLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects, Skills & Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core Subjects Studied */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#111965]" />
              <span>{t("majorDetail.coreSubjects")}</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-[#68708A]">
              {t("majorDetail.coreSubjectsHint")}
            </p>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.subjects_studied?.map((sub: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Foundational Skills */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#111965]" />
              <span>{t("majorDetail.requiredSkills")}</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-[#68708A]">
              {t("majorDetail.requiredSkillsHint")}
            </p>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.required_skills?.map((sk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Potential Challenges (Honest guidance) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111965] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t("majorDetail.challenges")}</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-[#68708A]">
              {t("majorDetail.challengesHint")}
            </p>
            <ul className="space-y-2 text-xs text-[#171A2C]">
              {major.potential_challenges?.map((ch: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interest fit */}
        {(primaryInterest || secondaryInterest) && (
          <section className="rounded-3xl border border-[#E6E8F0] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F2FA] text-[#111965]">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#111965]">
                  {t("majorDetail.fitTitle")}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {primaryInterest && (
                <div
                  className={`rounded-2xl border p-4 ${primaryInterest.lightBg} ${primaryInterest.borderClass}`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[#68708A]">
                    {t("majorDetail.primaryInterest")}
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-[#111965]">
                    {language === "km" ? primaryInterest.nameKm : primaryInterest.nameEn}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                    {language === "km" ? primaryInterest.descKm : primaryInterest.descEn}
                  </p>
                </div>
              )}

              {secondaryInterest && (
                <div
                  className={`rounded-2xl border p-4 ${secondaryInterest.lightBg} ${secondaryInterest.borderClass}`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[#68708A]">
                    {t("majorDetail.secondaryInterest")}
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-[#111965]">
                    {language === "km" ? secondaryInterest.nameKm : secondaryInterest.nameEn}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                    {language === "km" ? secondaryInterest.descKm : secondaryInterest.descEn}
                  </p>
                </div>
              )}
            </div>

            {personalityTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E6E8F0] pt-4">
                <span className="text-[11px] font-semibold text-[#68708A]">
                  {t("majorDetail.personalityAffinity")}:
                </span>
                {personalityTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-md bg-[#F0F2FA] px-2 py-1 text-[11px] font-bold text-[#111965]"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Cambodian Universities Offering This Program */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {t("majorDetail.universitiesOffering")}
            </h2>
            <span className="text-xs font-semibold text-[#68708A]">
              {universityCount} {t("majorDetail.institutionsCount")}
            </span>
          </div>

          <div
            id="major-universities-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {visibleUniversities.map((u) => (
              <div
                key={`${u.university_id}-${u.degree_level}-${u.duration_years}`}
                className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#68708A] uppercase">
                      {u.university_acronym?.en || u.university_acronym?.km || u.university_slug?.toUpperCase()}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {u.tuition_annual_usd ? `$${Math.round(u.tuition_annual_usd)} / yr` : "Tuition N/A"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111965] leading-snug">
                    {getLocalized(u.university_name)}
                  </h4>

                  <div className="text-xs text-[#68708A] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#111965] shrink-0" />
                    <span>
                      {localizeProvince(u.province, language)} • {u.duration_years}{" "}
                      {language === "km"
                        ? "ឆ្នាំ"
                        : u.duration_years === 1
                        ? "Year"
                        : "Years"}{" "}
                      ({localizeDegreeLevel(u.degree_level, language)})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E8F0]">
                  <Link
                    href={`/universities/${u.university_slug}`}
                    className="text-xs font-bold text-[#111965] hover:underline"
                  >
                    {t("majorDetail.viewUni")}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMoreUniversities && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAllUniversities((value) => !value)}
                aria-expanded={showAllUniversities}
                aria-controls="major-universities-grid"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E6E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#111965] transition-colors hover:border-[#111965]/25 hover:bg-[#F8FAFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30"
              >
                <span>
                  {showAllUniversities
                    ? t("majorDetail.showFewerUniversities")
                    : t("majorDetail.showAllUniversities").replace(
                        "{count}",
                        String(universityCount)
                      )}
                </span>
                {showAllUniversities ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {!showAllUniversities && (
                <span className="text-[11px] font-medium text-[#68708A]">
                  {getLocalized({
                    en: `Showing ${visibleUniversities.length} of ${universityCount}`,
                    km: `បង្ហាញ ${visibleUniversities.length} ក្នុងចំណោម ${universityCount}`,
                  })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Related Careers */}
        {major.careers && major.careers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#111965]">
              {t("majorDetail.relatedCareers")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {major.careers.map((car) => (
                <div
                  key={car.id}
                  className="p-5 rounded-2xl bg-white border border-[#E6E8F0] shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[12.5px] font-semibold bg-[#F5F6FA] text-[#111965]">
                      {car.industry}
                    </span>
                    <span className="text-xs font-bold text-[#68708A]">RIASEC: {car.riasec_code}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#111965]">
                    {getLocalized(car.title)}
                  </h4>
                  <p className="text-xs text-[#68708A] line-clamp-2">
                    {getLocalized(car.description)}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/careers/${car.slug}`}
                      className="text-xs font-bold text-[#111965] hover:underline"
                    >
                      {t("majorDetail.exploreCareer")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
