"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TestimonialItem {
  id: number;
  text: string;
  author: string;
  role: string;
}

export function TestimonialsCarousel() {
  const { t } = useLanguage();
  const [[activeIndex, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      text: t("homeTestimonials.t1"),
      author: t("homeTestimonials.t1Author"),
      role: t("homeTestimonials.t1Role"),
    },
    {
      id: 2,
      text: t("homeTestimonials.t2"),
      author: t("homeTestimonials.t2Author"),
      role: t("homeTestimonials.t2Role"),
    },
    {
      id: 3,
      text: t("homeTestimonials.t3"),
      author: t("homeTestimonials.t3Author"),
      role: t("homeTestimonials.t3Role"),
    },
    {
      id: 4,
      text: t("homeTestimonials.t4"),
      author: t("homeTestimonials.t4Author"),
      role: t("homeTestimonials.t4Role"),
    },
    {
      id: 5,
      text: t("homeTestimonials.t5"),
      author: t("homeTestimonials.t5Author"),
      role: t("homeTestimonials.t5Role"),
    },
  ];

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    setSlide(([prev]) => [(prev + 1) % total, 1]);
  }, [total]);

  const prevSlide = useCallback(() => {
    setSlide(([prev]) => [(prev - 1 + total) % total, -1]);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setSlide(([prev]) => [index, index >= prev ? 1 : -1]);
  }, []);

  // Auto-slide effect (changes every 5.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const currentItem = testimonials[activeIndex];
  const prevItem = testimonials[prevIndex];
  const nextItem = testimonials[nextIndex];

  return (
    <section
      id="testimonials-section"
      className="py-20 lg:py-28 bg-[#F8F9FC] border-b border-[#E6E8F0] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[11px] sm:text-xs font-bold text-[#68708A] tracking-[0.2em] uppercase block">
            {t("homeTestimonials.eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {t("homeTestimonials.title")}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
            {t("homeTestimonials.subtitle")}
          </p>
        </div>

        {/* 3-Card Stage: Stable Anchored Cards with Smooth Inside Content Transition */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* Left Flanking Card (Previous) */}
            <div
              onClick={prevSlide}
              className="hidden md:flex md:col-span-3 flex-col items-center cursor-pointer opacity-50 hover:opacity-90 transition-all duration-300 transform hover:-translate-x-1"
            >
              <div className="w-full bg-white border border-[#E6E8F0] rounded-2xl sm:rounded-3xl p-6 shadow-xs min-h-[230px] flex flex-col justify-between text-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`prev-content-${prevItem.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col justify-between h-full flex-1"
                  >
                    <div className="text-slate-300 flex justify-center mb-2">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#68708A] line-clamp-4 italic leading-relaxed my-auto">
                      &ldquo;{prevItem.text}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-0.5 text-[#F7CE4D]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Author Info Below Left Card */}
              <div className="mt-4 text-center min-h-[42px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`prev-author-${prevItem.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h4 className="text-sm font-bold text-[#111965]">{prevItem.author}</h4>
                    <p className="text-[11px] text-[#68708A]">{prevItem.role}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Active Center Card: Firmly Anchored Navy Card with Smooth Inside Transitions */}
            <div className="md:col-span-6 flex flex-col items-center z-10 w-full">
              <div className="w-full bg-gradient-to-br from-[#111965] via-[#151F75] to-[#1E277A] text-white rounded-3xl p-8 sm:p-10 shadow-[0_22px_55px_rgba(17,25,101,0.38)] min-h-[270px] sm:min-h-[300px] flex flex-col justify-between text-center relative border border-[#F7CE4D]/25 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`center-quote-${currentItem.id}`}
                    initial={{
                      opacity: 0,
                      y: direction > 0 ? 12 : -12,
                      filter: "blur(3px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: direction > 0 ? -12 : 12,
                      filter: "blur(3px)",
                    }}
                    transition={{
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="w-full flex flex-col justify-between items-center h-full min-h-[210px] flex-1"
                  >
                    {/* Brand Gold Ambient Quotation Mark */}
                    <div className="text-[#F7CE4D]/40 flex justify-center mb-2 shrink-0">
                      <svg className="w-12 h-10 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Main Quote Text */}
                    <p className="text-sm sm:text-base md:text-lg font-medium text-white leading-relaxed italic max-w-lg mx-auto my-auto">
                      &ldquo;{currentItem.text}&rdquo;
                    </p>

                    {/* Rating Stars (Brand Accent Yellow #F7CE4D) */}
                    <div className="mt-5 flex items-center justify-center gap-1 text-[#F7CE4D] shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Author Info Underneath Center Card */}
              <div className="mt-5 text-center min-h-[50px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`center-author-${currentItem.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="space-y-0.5"
                  >
                    <h3 className="text-base sm:text-lg font-black text-[#111965] tracking-tight">
                      {currentItem.author}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#68708A]">
                      {currentItem.role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Flanking Card (Next) */}
            <div
              onClick={nextSlide}
              className="hidden md:flex md:col-span-3 flex-col items-center cursor-pointer opacity-50 hover:opacity-90 transition-all duration-300 transform hover:translate-x-1"
            >
              <div className="w-full bg-white border border-[#E6E8F0] rounded-2xl sm:rounded-3xl p-6 shadow-xs min-h-[230px] flex flex-col justify-between text-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`next-content-${nextItem.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col justify-between h-full flex-1"
                  >
                    <div className="text-slate-300 flex justify-center mb-2">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#68708A] line-clamp-4 italic leading-relaxed my-auto">
                      &ldquo;{nextItem.text}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-0.5 text-[#F7CE4D]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Author Info Below Right Card */}
              <div className="mt-4 text-center min-h-[42px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`next-author-${nextItem.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h4 className="text-sm font-bold text-[#111965]">{nextItem.author}</h4>
                    <p className="text-[11px] text-[#68708A]">{nextItem.role}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Controls & Dot Indicators */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonial"
              className="w-9 h-9 rounded-full bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] hover:bg-[#111965] hover:text-white hover:border-[#111965] shadow-2xs transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots with Smooth Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`relative rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? "w-8 h-2.5 bg-[#111965] shadow-xs"
                        : "w-2.5 h-2.5 bg-slate-300 hover:bg-[#111965]/50"
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={nextSlide}
              aria-label="Next Testimonial"
              className="w-9 h-9 rounded-full bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] hover:bg-[#111965] hover:text-white hover:border-[#111965] shadow-2xs transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
