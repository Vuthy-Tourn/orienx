"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Wand2 } from "lucide-react";
import rawQuestions from "@/data/static/personality-questions.json";
import { STATIC_META } from "@/lib/data/catalog";
import {
  createResultId,
  isGuestStorageAvailable,
  readPersonalityDraft,
  savePersonalityDraft,
  saveResult,
  clearPersonalityDraft,
} from "@/lib/guest/storage";
import { scorePersonality } from "@/lib/guest/scoring";
import { recommendMajorMatches } from "@/lib/guest/recommendations";
import type {
  PersonalityAnswers,
  PersonalityQuestion,
} from "@/lib/guest/types";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AssessmentStage } from "@/components/assessments/assessment-stage";
import {
  DraftRestoredBanner,
  GuestAssessmentIntro,
  TestFocusBar,
} from "@/components/assessments/guest-assessment-intro";
import { getPersonalityMascotSpeech } from "@/components/assessments/mascot-speech";
import { useSyncTestFocus } from "@/lib/test-focus";
import { DIMENSION_TITLES, type DimensionGroup } from "@/lib/personality-meta";

const QUESTIONS = rawQuestions as PersonalityQuestion[];

export default function GuestPersonalityTestPage() {
  const router = useRouter();
  const { getLocalized } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<PersonalityAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useSyncTestFocus(started);

  useEffect(() => {
    setStorageAvailable(isGuestStorageAvailable());
    const params = new URLSearchParams(window.location.search);
    const retake = params.get("retake") === "1";
    const autostart = params.get("autostart") === "1";
    if (retake) {
      clearPersonalityDraft();
      if (autostart) setStarted(true);
      return;
    }
    const draft = readPersonalityDraft();
    if (draft && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      setCurrentIndex(
        Math.max(0, Math.min(draft.currentIndex, QUESTIONS.length - 1))
      );
      setStarted(true);
      setRestoredDraft(true);
      return;
    }
    if (autostart) {
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    if (!started || Object.keys(answers).length === 0) return;
    const timer = setTimeout(() => {
      savePersonalityDraft({ answers, currentIndex });
    }, 350);
    return () => clearTimeout(timer);
  }, [answers, currentIndex, started]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleAnswer = (questionId: string, scaleLevel: number) => {
    const question = QUESTIONS.find((item) => item.id === questionId);
    if (!question) return;
    const option =
      scaleLevel === 3
        ? null
        : scaleLevel >= 4
        ? question.options[1]
        : question.options[0];
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        scaleLevel,
        optionId: option?.id ?? "",
      },
    }));
    setRestoredDraft(false);

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (currentIndex < QUESTIONS.length - 1) {
      advanceTimer.current = setTimeout(() => {
        setCurrentIndex((index) => Math.min(index + 1, QUESTIONS.length - 1));
      }, 550);
    }
  };

  const handlePrefill = () => {
    const prefill: PersonalityAnswers = {};
    QUESTIONS.forEach((question, index) => {
      const scaleLevel = index % 2 === 0 ? 1 : 5;
      const option =
        scaleLevel >= 4 ? question.options[1] : question.options[0];
      prefill[question.id] = {
        scaleLevel,
        optionId: option?.id ?? "",
      };
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
        en: "Your current answers will be deleted. This cannot be undone.",
        km: "ចម្លើយបច្ចុប្បន្ននៅលើឧបករណ៍នេះនឹងត្រូវលុប។ មិនអាចត្រឡប់វិញបានទេ។",
      }),
      confirmLabel: getLocalized({ en: "Start over", km: "ចាប់ផ្តើមឡើងវិញ" }),
      cancelLabel: getLocalized({ en: "Keep answers", km: "រក្សាចម្លើយ" }),
      tone: "danger",
    });
    if (!confirmed) return;
    clearPersonalityDraft();
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setRestoredDraft(false);
  };

  const handleSubmit = () => {
    if (answeredCount < QUESTIONS.length) {
      toast.warning(
        getLocalized({
          en: "Please answer every statement before seeing your result.",
          km: "សូមឆ្លើយសំណើទាំងអស់មុនពេលមើលលទ្ធផលរបស់អ្នក។",
        })
      );
      return;
    }

    setSubmitting(true);
    try {
      const scored = scorePersonality(QUESTIONS, answers);
      const result = {
        ...scored,
        majorMatches: recommendMajorMatches({ personality: scored }),
      };
      const completedAt = new Date().toISOString();
      const record = {
        id: createResultId(),
        kind: "personality" as const,
        schemaVersion: 1 as const,
        engineVersion: 1 as const,
        dataVersion: STATIC_META.dataVersion,
        completedAt,
        answers,
        result,
      };
      saveResult(record);
      clearPersonalityDraft();
      router.push(`/assessments/personality/result?id=${record.id}`);
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
    const dimension = DIMENSION_TITLES[question.dimension as DimensionGroup];
    return {
      id: question.id,
      promptKm: question.prompt.km,
      promptEn: question.prompt.en,
      statementKm: "",
      statementEn: "",
      dimensionCode: dimension?.code ?? question.dimension,
      dimensionNameKm: dimension?.nameKm ?? question.dimension,
      dimensionNameEn: dimension?.nameEn ?? question.dimension,
    };
  });

  const handleExitTest = () => {
    if (Object.keys(answers).length > 0) {
      savePersonalityDraft({ answers, currentIndex });
    }
    setStarted(false);
  };

  if (!started) {
    return (
      <GuestAssessmentIntro
        activeKind="personality"
        storageAvailable={storageAvailable}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] px-4 pb-16 pt-6 sm:pt-8">
      <TestFocusBar
        title={getLocalized({
          en: "16-Personality Assessment",
          km: "ការវាយតម្លៃបុគ្គលិកលក្ខណៈ ១៦",
        })}
        onExit={handleExitTest}
      />
      <div className="mx-auto max-w-4xl">
        <AssessmentStage
          breadcrumbText={getLocalized({
            en: "OrienX / Free assessment",
            km: "OrienX / ការវាយតម្លៃឥតគិតថ្លៃ",
          })}
          pageTitle={getLocalized({
            en: "16-Personality Assessment",
            km: "ការវាយតម្លៃបុគ្គលិកលក្ខណៈ ១៦",
          })}
          questions={formattedQuestions}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          answers={answers}
          onAnswer={handleAnswer}
          scaleType="5-point"
          leftAnchorKm="យល់ស្រប"
          leftAnchorEn="Agree"
          rightAnchorKm="មិនយល់ស្រប"
          rightAnchorEn="Disagree"
          mascotSpeech={getLocalized(
            getPersonalityMascotSpeech({
              scaleLevel: answers[QUESTIONS[currentIndex]?.id]?.scaleLevel ?? null,
              dimension: QUESTIONS[currentIndex]?.dimension,
              currentIndex,
              totalCount: QUESTIONS.length,
            })
          )}
          mascotScaleLevel={answers[QUESTIONS[currentIndex]?.id]?.scaleLevel ?? null}
          onPrefill={handlePrefill}
          onSubmit={handleSubmit}
          onClearDraft={handleClearDraft}
          isSubmitting={submitting}
          submitButtonText={getLocalized({
            en: "See my result",
            km: "មើលលទ្ធផលរបស់ខ្ញុំ",
          })}
        />

        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-2 px-1 text-xs sm:text-sm font-semibold text-[#68708A]">
          <span className="inline-flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            {getLocalized({
              en: "Tip: use the 1–5 keys to answer faster.",
              km: "គន្លឹះ៖ ប្រើគ្រាប់ចុច ១–៥ ដើម្បីឆ្លើយលឿនជាងមុន។",
            })}
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#68708A] transition-colors hover:bg-white hover:text-rose-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {getLocalized({ en: "Start over", km: "ចាប់ផ្តើមឡើងវិញ" })}
          </button>
        </div>

        {restoredDraft && (
          <DraftRestoredBanner
            message={getLocalized({
              en: "Your previous answers were restored on this device.",
              km: "ស្តារសេចក្តីព្រាងឡើងវិញ។ ចម្លើយរបស់អ្នកត្រូវបានរក្សាទុកលើឧបករណ៍នេះ។",
            })}
            progress={progress}
            onDismiss={() => setRestoredDraft(false)}
          />
        )}
      </div>
    </div>
  );
}
