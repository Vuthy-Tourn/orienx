"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import CardSwap, { Card, CardSwapHandle } from "@/components/ui/card-swap";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
  Award,
  GraduationCap,
  MapPin,
  Hand,
} from "lucide-react";

interface TestimonialItem {
  id: number;
  text: string;
  author: string;
  role: string;
  initials: string;
  gradient: string;
  major: string;
}

export function TestimonialsCarousel() {
  const { t, language } = useLanguage();
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState(true);

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      text: t("homeTestimonials.t1"),
      author: t("homeTestimonials.t1Author"),
      role: t("homeTestimonials.t1Role"),
      initials: "CS",
      gradient: "from-blue-600 to-indigo-700",
      major: "Software Engineering",
    },
    {
      id: 2,
      text: t("homeTestimonials.t2"),
      author: t("homeTestimonials.t2Author"),
      role: t("homeTestimonials.t2Role"),
      initials: "KP",
      gradient: "from-amber-500 to-orange-600",
      major: "Business & Management",
    },
    {
      id: 3,
      text: t("homeTestimonials.t3"),
      author: t("homeTestimonials.t3Author"),
      role: t("homeTestimonials.t3Role"),
      initials: "SH",
      gradient: "from-purple-600 to-pink-600",
      major: "Architecture & Design",
    },
    {
      id: 4,
      text: t("homeTestimonials.t4"),
      author: t("homeTestimonials.t4Author"),
      role: t("homeTestimonials.t4Role"),
      initials: "VR",
      gradient: "from-emerald-600 to-teal-700",
      major: "Data Science & AI",
    },
    {
      id: 5,
      text: t("homeTestimonials.t5"),
      author: t("homeTestimonials.t5Author"),
      role: t("homeTestimonials.t5Role"),
      initials: "DS",
      gradient: "from-rose-600 to-red-700",
      major: "Cybersecurity",
    },
  ];

  // Track viewport size for 3D card deck dimensions
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = () => {
    cardSwapRef.current?.next();
  };

  const handlePrev = () => {
    cardSwapRef.current?.prev();
  };

  const handleSelect = (idx: number) => {
    cardSwapRef.current?.goTo(idx);
    setActiveIndex(idx);
  };

  return (
    <section
      id="testimonials-section"
      className="py-20 lg:py-28 bg-[#F8F9FC] border-b border-[#E6E8F0] relative overflow-hidden select-none"
    >
      {/* =====================================================================
          ATMOSPHERIC STUDIO LIGHTING & RADIAL BACKDROP
          ===================================================================== */}
      <div className="absolute inset-0 bg-[radial-gradient(#111965_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-28 left-1/4 w-[500px] h-[500px] bg-blue-400/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-1/4 w-[500px] h-[500px] bg-[#F7CE4D]/18 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* =====================================================================
            SECTION HEADER
            ===================================================================== */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E6E8F0] shadow-2xs backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#111965]">
              {t("homeTestimonials.eyebrow")}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {t("homeTestimonials.title")}
          </h2>

          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed max-w-xl mx-auto">
            {t("homeTestimonials.subtitle")}
          </p>
        </div>

        {/* =====================================================================
            3D STACKED CARD SWAP STAGE (TACTILE DEPTH, DRAG & SPRING PHYSICS)
            ===================================================================== */}
        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          {/* Floating Drag/Swipe Cue */}
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E6E8F0] text-[11px] font-bold text-[#68708A] shadow-2xs backdrop-blur-xs animate-pulse">
            <Hand className="w-3 h-3 text-[#111965]" />
            <span>
              {language === "km"
                ? "អូស ឬចុចលើកាតដើម្បីប្តូរ"
                : "Drag or swipe cards to shuffle"}
            </span>
          </div>

          {/* 3D Stack Stage Container */}
          <div className="w-full max-w-[580px] h-[350px] sm:h-[370px] relative flex items-center justify-center">
            {/* Ambient Radial Pedestal Shadow Beneath Deck */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[440px] h-[38px] bg-[#111965]/18 blur-xl rounded-full pointer-events-none" />

            <CardSwap
              ref={cardSwapRef}
              width={isDesktop ? 510 : 330}
              height={isDesktop ? 300 : 320}
              cardDistance={isDesktop ? 46 : 22}
              verticalDistance={isDesktop ? 32 : 18}
              depth={75}
              skewAmount={isDesktop ? 5 : 2}
              visibleCards={3}
              delay={5000}
              autoplay={true}
              pauseOnHover={true}
              draggable={true}
              theme="dark"
              cardRadius={24}
              onChange={(idx) => {
                if (typeof idx === "number" && idx >= 0 && idx < testimonials.length) {
                  setActiveIndex(idx);
                }
              }}
              className="w-full h-full"
            >
              {testimonials.map((item) => {
                return (
                  <Card
                    key={item.id}
                    className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl border border-[#F7CE4D]/35 shadow-[0_22px_55px_rgba(17,25,101,0.38)] bg-gradient-to-br from-[#111965] via-[#151F75] to-[#1E277A] text-white p-6 sm:p-8 flex flex-col justify-between select-none touch-none group"
                  >
                    {/* Ambient Gold Radial Flare in Top Corner */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(ellipse_at_top_right,rgba(247,206,77,0.18),transparent_70%)] pointer-events-none" />

                    {/* Watermark Quote Icon in Background */}
                    <div className="absolute -bottom-8 -right-4 text-white/[0.04] pointer-events-none group-hover:scale-105 transition-transform duration-500">
                      <svg className="w-40 h-40 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Top Row: 5 Gold Stars & Verified Student Badge */}
                    <div className="relative z-10 flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-[#F7CE4D]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
                        ))}
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[11px] font-bold text-[#F7CE4D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === "km" ? "និស្សិតពិតប្រាកដ" : "Verified Student"}</span>
                      </span>
                    </div>

                    {/* Middle: The Inspiring Student Quote */}
                    <div className="relative z-10 my-auto py-2">
                      <p className="text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed italic text-white/95 line-clamp-4">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    {/* Bottom Row: Student Avatar, Name, University Role */}
                    <div className="relative z-10 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Student Initials Avatar with Gradient Ring */}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-[#F7CE4D]/50 shrink-0`}
                        >
                          {item.initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                            {item.author}
                          </h4>
                          <p className="text-xs text-[#F7CE4D] font-medium truncate">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      {/* Major Tag */}
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-semibold text-slate-200 shrink-0 border border-white/10">
                        <GraduationCap className="w-3 h-3 text-[#F7CE4D]" />
                        <span>{item.major}</span>
                      </span>
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </div>

          {/* =====================================================================
              INTERACTIVE CONTROLS & STUDENT SELECTOR PILLS
              ===================================================================== */}
          <div className="mt-8 flex flex-col items-center gap-5 w-full">
            {/* Clickable Student Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
              {testimonials.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#111965] text-white shadow-sm scale-105 ring-2 ring-[#F7CE4D]/60"
                        : "bg-white text-[#68708A] hover:bg-slate-100 hover:text-[#111965] border border-[#E6E8F0]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isActive
                          ? "bg-[#F7CE4D] text-[#111965]"
                          : "bg-slate-200 text-[#68708A]"
                      }`}
                    >
                      {item.initials}
                    </span>
                    <span>{item.author.split(" ")[0]}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F7CE4D] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls & Numbered Counter */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Testimonial"
                className="w-9 h-9 rounded-full bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] hover:bg-[#111965] hover:text-white hover:border-[#111965] shadow-2xs transition-all duration-300 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black text-[#111965] tracking-widest tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Testimonial"
                className="w-9 h-9 rounded-full bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] hover:bg-[#111965] hover:text-white hover:border-[#111965] shadow-2xs transition-all duration-300 cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =====================================================================
              TRUST & IMPACT PROOF BANNER
              ===================================================================== */}
          <div className="mt-10 pt-6 border-t border-[#E6E8F0]/80 w-full max-w-2xl flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs font-semibold text-[#68708A]">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#F7CE4D] fill-current" />
              <strong className="text-[#111965]">4.9 / 5.0</strong>
              <span>{language === "km" ? "ការវាយតម្លៃពីសិស្ស" : "Average Student Rating"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#111965]" />
              <strong className="text-[#111965]">12,000+</strong>
              <span>{language === "km" ? "សិស្សបានទទួលការតម្រង់ទិស" : "Students Guided"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <strong className="text-[#111965]">25</strong>
              <span>{language === "km" ? "រាជធានី-ខេត្តទូទាំងប្រទេស" : "Provinces Covered"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
