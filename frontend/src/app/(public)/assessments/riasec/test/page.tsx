"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Compass,
  Download,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import rawQuestions from "@/data/static/riasec-questions.json";
import { STATIC_META } from "@/lib/data/catalog";
import {
  clearRiasecDraft,
  createResultId,
  isGuestStorageAvailable,
  readRiasecDraft,
  saveResult,
  saveRiasecDraft,
} from "@/lib/guest/storage";
import { scoreRiasec } from "@/lib/guest/scoring";
import { recommendMajorMatches } from "@/lib/guest/recommendations";
import type { RiasecAnswers, RiasecQuestion } from "@/lib/guest/types";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AssessmentStage } from "@/components/assessments/assessment-stage";
import { RIASEC_DIMENSIONS } from "@/lib/riasec-meta";

const QUESTIONS = rawQuestions as RiasecQuestion[];

export default function GuestRiasecTestPage() {
  const router = useRouter();
  const { getLocalized } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<RiasecAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStorageAvailable(isGuestStorageAvailable());
    const retake =
      new URLSearchParams(window.location.search).get("retake") === "1";
    if (retake) {
      clearRiasecDraft();
      return;
    }
    const draft = readRiasecDraft();
    if (draft && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      setCurrentIndex(
        Math.max(0, Math.min(draft.currentIndex, QUESTIONS.length - 1))
      );
      setStarted(true);
      setRestoredDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!started || Object.keys(answers).length === 0) return;
    const timer = setTimeout(() => {
      saveRiasecDraft({ answers, currentIndex });
    }, 350);
    return () => clearTimeout(timer);
  }, [answers, currentIndex, started]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const answeredCount = Object.values(answers).filter(
    (value) => Number(value) >= 1 && Number(value) <= 5
  ).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleAnswer = (questionId: string, level: number) => {
    setAnswers((current) => ({ ...current, [questionId]: level }));
    setRestoredDraft(false);

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (currentIndex < QUESTIONS.length - 1) {
      advanceTimer.current = setTimeout(() => {
        setCurrentIndex((index) => Math.min(index + 1, QUESTIONS.length - 1));
      }, 550);
    }
  };

  const handlePrefill = () => {
    const prefill: RiasecAnswers = {};
    QUESTIONS.forEach((question, index) => {
      prefill[question.id] = (index % 5) + 1;
    });
    setAnswers(prefill);
    setRestoredDraft(false);
  };

  const handleClearDraft = async () => {
    const confirmed = await confirm({
      title: getLocalized({
        en: "Start over?",
        km: "ចាប់ផ្តើមឡើងវិញ?",
      }),
      description: getLocalized({
        en: "Your current ratings will be deleted. This cannot be undone.",
        km: "ការវាយតម្លៃបច្ចុប្បន្ននៅលើឧបករណ៍នេះនឹងត្រូវលុប។ មិនអាចត្រឡប់វិញបានទេ។",
      }),
      confirmLabel: getLocalized({ en: "Start over", km: "ចាប់ផ្តើមឡើងវិញ" }),
      cancelLabel: getLocalized({ en: "Keep answers", km: "រក្សាចម្លើយ" }),
      tone: "danger",
    });
    if (!confirmed) return;
    clearRiasecDraft();
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setRestoredDraft(false);
  };

  const handleSubmit = () => {
    if (answeredCount < QUESTIONS.length) {
      toast.warning(
        getLocalized({
          en: "Please rate every activity before seeing your result.",
          km: "សូមវាយតម្លៃសកម្មភាពទាំងអស់មុនពេលមើលកូដចំណាប់អារម្មណ៍អាជីព របស់អ្នក។",
        })
      );
      return;
    }

    setSubmitting(true);
    try {
      const scored = scoreRiasec(QUESTIONS, answers);
      const result = {
        ...scored,
        majorMatches: recommendMajorMatches({ riasec: scored }),
      };
      const record = {
        id: createResultId(),
        kind: "riasec" as const,
        schemaVersion: 1 as const,
        engineVersion: 1 as const,
        dataVersion: STATIC_META.dataVersion,
        completedAt: new Date().toISOString(),
        answers,
        result,
      };
      saveResult(record);
      clearRiasecDraft();
      router.push(`/assessments/riasec/result?id=${record.id}`);
    } catch {
      toast.error(
        getLocalized({
          en: "Could not save your result. Please try again.",
          km: "មិនអាចរក្សាទុកលទ្ធផលបានទេ។ សូមព្យាយាមម្តងទៀត។",
        })
      );
      setSubmitting(false);
    }
  };

  const formattedQuestions = QUESTIONS.map((question) => {
    const dimension = RIASEC_DIMENSIONS[question.category];
    return {
      id: question.id,
      promptKm: question.prompt.km,
      promptEn: question.prompt.en,
      statementKm: "",
      statementEn: "",
      dimensionCode: question.category,
      dimensionNameKm: dimension?.shortNameKm ?? question.category,
      dimensionNameEn: dimension?.shortNameEn ?? question.category,
    };
  });

  if (!started) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/assessments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68708A] transition-colors hover:text-[#111965]"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            {getLocalized({ en: "All assessments", km: "ការវាយតម្លៃទាំងអស់" })}
          </Link>

          <div className="overflow-hidden rounded-3xl border border-[#E6E8F0] bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#111965] via-[#1A2580] to-[#0D134E] px-6 py-8 text-white sm:px-9 sm:py-10">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#F7CE4D]/15 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#F7CE4D]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {getLocalized({
                    en: "Free • No account needed",
                    km: "ឥតគិតថ្លៃ • មិនត្រូវការគណនី",
                  })}
                </div>
                <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  {getLocalized({
                    en: "RIASEC Interest Assessment",
                    km: "ការវាយតម្លៃចំណាប់អារម្មណ៍ RIASEC",
                  })}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
                  {getLocalized({
                    en: "Rate real work activities to discover your career interest code and the majors that match your interests.",
                    km: "វាយតម្លៃសកម្មភាពការងារពិតប្រាកដ ដើម្បីស្វែងរកកូដចំណាប់អារម្មណ៍អាជីព និងជំនាញដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់អ្នក។",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  {
                    icon: Compass,
                    label: getLocalized({ en: "18 activities", km: "១៨ សកម្មភាព" }),
                  },
                  {
                    icon: Clock3,
                    label: getLocalized({ en: "About 4 minutes", km: "ប្រហែល ៤ នាទី" }),
                  },
                  {
                    icon: Download,
                    label: getLocalized({ en: "Export your report", km: "នាំចេញរបាយការណ៍" }),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2.5 text-[11px] font-bold text-[#111965]"
                  >
                    <item.icon className="h-4 w-4 text-[#D4A017]" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E6E8F0] bg-white px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#111965]" />
                  <p className="text-[11px] leading-relaxed text-[#68708A]">
                    {getLocalized({
                      en: "Your answers are private. You can download a copy of your result at the end.",
                      km: "ចម្លើយរបស់អ្នកគឺឯកជន។ អ្នកអាចទាញយកច្បាប់ចម្លងលទ្ធផលនៅចុងបញ្ចប់។",
                    })}
                  </p>
                </div>
              </div>

              {!storageAvailable && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
                  {getLocalized({
                    en: "Your device is blocking saved answers. You can still take the test, but your result may disappear when you close this tab.",
                    km: "ឧបករណ៍របស់អ្នកបិទការរក្សាទុកចម្លើយ។ អ្នកអាចធ្វើតេស្តបាន ប៉ុន្តែលទ្ធផលអាចបាត់នៅពេលបិទផ្ទាំងនេះ។",
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStarted(true)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#111965] px-5 text-sm font-black text-white shadow-sm transition-all hover:bg-[#1A2580] active:scale-[0.99]"
              >
                {getLocalized({ en: "Start the test", km: "ចាប់ផ្តើមធ្វើតេស្ត" })}
                <ArrowRight className="h-4 w-4 text-[#F7CE4D]" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-[#68708A]">
                <Link href="/assessments/results" className="hover:text-[#111965]">
                  {getLocalized({ en: "My saved results", km: "លទ្ធផលដែលបានរក្សាទុក" })}
                </Link>
                <Link
                  href="/assessments/personality/test"
                  className="hover:text-[#111965]"
                >
                  {getLocalized({ en: "Take Personality instead", km: "ធ្វើតេស្តបុគ្គលិកលក្ខណៈជំនួស" })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-4xl">
        {restoredDraft && (
          <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-semibold text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {getLocalized({
                en: "Your ratings were restored.",
                km: "ស្តារសេចក្តីព្រាងឡើងវិញ។ ការវាយតម្លៃរបស់អ្នកត្រូវបានរក្សាទុកលើឧបករណ៍នេះ។",
              })}
            </span>
            <span className="font-black text-emerald-700">{progress}%</span>
          </div>
        )}

        <AssessmentStage
          breadcrumbText={getLocalized({
            en: "OrienX / Free assessment",
            km: "OrienX / ការវាយតម្លៃឥតគិតថ្លៃ",
          })}
          pageTitle={getLocalized({
            en: "RIASEC Interest Assessment",
            km: "ការវាយតម្លៃចំណាប់អារម្មណ៍ RIASEC",
          })}
          badgeLabel={getLocalized({
            en: "No account needed",
            km: "មិនត្រូវការគណនី",
          })}
          headerAction={
            <Link
              href="/assessments/results"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#D9DEEA] bg-white px-3 text-[11px] font-black text-[#111965] transition-colors hover:border-[#111965]/40 hover:bg-[#F8FAFD]"
            >
              <Download className="h-3.5 w-3.5" />
              {getLocalized({ en: "My results", km: "លទ្ធផលរបស់ខ្ញុំ" })}
            </Link>
          }
          questions={formattedQuestions}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          answers={answers}
          onAnswer={handleAnswer}
          scaleType="5-point"
          leftAnchorKm="មិនចូលចិត្តទាល់តែសោះ"
          leftAnchorEn="Strong Dislike"
          rightAnchorKm="ចូលចិត្តខ្លាំងបំផុត"
          rightAnchorEn="Highly Enjoy"
          mascotSpeech={getLocalized({
            en: "How would you feel about doing this activity? Trust your first reaction.",
            km: "តើអ្នកមានអារម្មណ៍យ៉ាងណាចំពោះសកម្មភាពនេះ? ជឿលើអារម្មណ៍ដំបូងរបស់អ្នក។",
          })}
          mascotScaleLevel={
            answers[QUESTIONS[currentIndex]?.id] != null
              ? answers[QUESTIONS[currentIndex]?.id] <= 2
                ? 6
                : answers[QUESTIONS[currentIndex]?.id] === 3
                ? 4
                : 2
              : null
          }
          onPrefill={handlePrefill}
          onSubmit={handleSubmit}
          onClearDraft={handleClearDraft}
          isSubmitting={submitting}
          submitButtonText={getLocalized({
            en: "See my result",
            km: "មើលកូដចំណាប់អារម្មណ៍អាជីព របស់ខ្ញុំ",
          })}
        />

        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-2 px-1 text-[10.5px] font-semibold text-[#68708A]">
          <span className="inline-flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            {getLocalized({
              en: "Tip: use the 1–5 keys to rate faster.",
              km: "គន្លឹះ៖ ប្រើគ្រាប់ចុច ១–៥ ដើម្បីវាយតម្លៃលឿនជាងមុន។",
            })}
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10.5px] font-bold text-[#68708A] transition-colors hover:bg-white hover:text-rose-600"
          >
            <RotateCcw className="h-3 w-3" />
            {getLocalized({ en: "Start over", km: "ចាប់ផ្តើមឡើងវិញ" })}
          </button>
        </div>
      </div>
    </div>
  );
}
