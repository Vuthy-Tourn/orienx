"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  id?: string;
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FaqSection({
  id = "faq-section",
  items,
  eyebrow,
  title,
  subtitle,
  className,
}: FaqSectionProps = {}) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      id: 1,
      question: t("homeFaq.q1"),
      answer: t("homeFaq.a1"),
    },
    {
      id: 2,
      question: t("homeFaq.q2"),
      answer: t("homeFaq.a2"),
    },
    {
      id: 3,
      question: t("homeFaq.q3"),
      answer: t("homeFaq.a3"),
    },
    {
      id: 4,
      question: t("homeFaq.q4"),
      answer: t("homeFaq.a4"),
    },
  ];

  const faqs = items && items.length > 0 ? items : defaultFaqs;
  const resolvedEyebrow = eyebrow || t("homeFaq.eyebrow");
  const resolvedTitle = title || t("homeFaq.title");
  const resolvedSubtitle = subtitle || t("homeFaq.subtitle");

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id={id}
      className={cn("py-16 lg:py-24 bg-white border-b border-[#E6E8F0] relative overflow-hidden select-none", className)}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111965]/5 border border-[#111965]/10 text-[12px] font-bold text-[#111965] tracking-wider uppercase mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#F7CE4D]" />
            <span>{resolvedEyebrow}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {resolvedTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
            {resolvedSubtitle}
          </p>
        </div>

        {/* Accordion List with Silky Smooth Native CSS Grid Height Expansion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id}
                className={cn(
                  "border rounded-2xl bg-white overflow-hidden transition-all duration-300 relative",
                  isOpen
                    ? "border-[#111965]/40 shadow-[0_10px_28px_rgba(17,25,101,0.08)] ring-1 ring-[#111965]/10"
                    : "border-[#E6E8F0] shadow-2xs hover:border-slate-300 hover:shadow-xs"
                )}
              >
                {/* Active Left Indicator Bar in Brand Primary Navy */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#111965] via-[#1E277A] to-[#F7CE4D] rounded-r-full transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                  )}
                />

                {/* FAQ Header Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    {/* Number Badge */}
                    <span
                      className={cn(
                        "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors duration-200",
                        isOpen
                          ? "bg-[#111965] text-white"
                          : "bg-slate-100 text-[#68708A] group-hover:bg-[#111965]/10 group-hover:text-[#111965]"
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-bold text-sm sm:text-base leading-snug transition-colors duration-200",
                        isOpen
                          ? "text-[#111965]"
                          : "text-slate-800 group-hover:text-[#111965]"
                      )}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* Silky Smooth Animated Chevron */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isOpen
                        ? "bg-[#111965] text-[#F7CE4D] rotate-180 shadow-xs"
                        : "bg-slate-100 text-[#68708A] rotate-0 group-hover:bg-slate-200"
                    )}
                  >
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  </div>
                </button>

                {/* Silky Smooth Native CSS Grid Collapsible Answer Container */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-slate-100">
                      <div className="pl-10 relative">
                        <p className="leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
