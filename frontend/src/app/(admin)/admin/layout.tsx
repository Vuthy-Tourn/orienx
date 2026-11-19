"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { IS_STATIC_MODE } from "@/lib/app-mode";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();

  if (IS_STATIC_MODE) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-black text-[#111965] dark:text-white">
          {language === "km" ? "ផ្ទាំងអភិបាលមិនអាចប្រើបានទេ" : "Admin panel is unavailable"}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#68708A] dark:text-slate-400">
          {language === "km"
            ? "កំណែសាធារណៈនេះមិនភ្ជាប់ទៅមូលដ្ឋានទិន្នន័យ ឬគណនីអភិបាលទេ។"
            : "This public build is not connected to the database or administrator accounts."}
        </p>
        <Link
          href="/assessments"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1A2580]"
        >
          {language === "km" ? "ត្រឡប់ទៅការវាយតម្លៃ" : "Back to assessments"}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
