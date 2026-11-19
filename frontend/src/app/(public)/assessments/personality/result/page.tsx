"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { readResults } from "@/lib/guest/storage";
import type { GuestResultRecord } from "@/lib/guest/types";
import { GuestResultView } from "@/components/assessments/guest-result-view";
import { useLanguage } from "@/contexts/language-context";

function PersonalityResultInner() {
  const searchParams = useSearchParams();
  const { getLocalized } = useLanguage();
  const [record, setRecord] = useState<GuestResultRecord | null | undefined>(
    undefined
  );

  useEffect(() => {
    const id = searchParams.get("id");
    const rows = readResults("personality");
    setRecord(id ? rows.find((row) => row.id === id) ?? null : rows[0] ?? null);
  }, [searchParams]);

  if (record === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E8F0] border-t-[#111965]" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black text-[#111965]">
          {getLocalized({
            en: "No Personality result on this device",
            km: "គ្មានលទ្ធផលបុគ្គលិកលក្ខណៈនៅលើឧបករណ៍នេះទេ",
          })}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#68708A]">
          {getLocalized({
            en: "Take the free test first. Your result will appear here and stay in this browser.",
            km: "សូមធ្វើតេស្តឥតគិតថ្លៃជាមុនសិន។ លទ្ធផលរបស់អ្នកនឹងបង្ហាញនៅទីនេះ និងរក្សាទុកក្នុងកម្មវិធីរុករកនេះ។",
          })}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/assessments/personality/test"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111965] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1A2580]"
          >
            {getLocalized({ en: "Take the test", km: "ធ្វើតេស្ត" })}
            <ArrowRight className="h-4 w-4 text-[#F7CE4D]" />
          </Link>
          <Link
            href="/assessments/results"
            className="inline-flex items-center gap-2 rounded-xl border border-[#D9DEEA] bg-white px-4 py-2.5 text-xs font-bold text-[#111965] hover:bg-[#F8FAFD]"
          >
            {getLocalized({ en: "My results", km: "លទ្ធផលរបស់ខ្ញុំ" })}
          </Link>
        </div>
      </div>
    );
  }

  return <GuestResultView record={record} />;
}

export default function PersonalityResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E8F0] border-t-[#111965]" />
        </div>
      }
    >
      <PersonalityResultInner />
    </Suspense>
  );
}
