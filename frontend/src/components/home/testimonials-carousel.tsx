"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "motion/react";

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

  // Silky smooth, glitch-free sliding variants for the Center Active Card
  const centerCardVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.8 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.8 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.25 },
      },
    }),
  };

  // Silky smooth, glitch-free sliding variants for the Flanking Preview Cards
  const sideCardVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "40%" : "-40%",
      opacity: 0,
    }),
    center: {
      x: "0%",
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 220, damping: 26 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-40%" : "40%",
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    }),
  };

  return (
    <section
      id="testimonials-section"
      className="py-20 lg:py-28 bg-[#F8F9FC] border-b border-[#E6E8F0] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[12px] sm:text-xs font-bold text-[#68708A] tracking-[0.2em] uppercase block">
            {t("homeTestimonials.eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111965] tracking-tight">
            {t("homeTestimonials.title")}
          </h2>
          <p className="text-xs sm:text-sm text-[#68708A] leading-relaxed">
            {t("homeTestimonials.subtitle")}
          </p>
        </div>

        {/* 3-Card Stage: Previous Flanking Card | Active Center Card | Next Flanking Card */}
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
              {/* Stable Fixed-Height Container with Absolute Stacked Animation (No PopLayout Glitch) */}
              <div className="w-full relative h-[230px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`prev-card-${prevItem.id}`}
                    custom={direction}
                    variants={sideCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full bg-white border border-[#E6E8F0] rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between text-center overflow-hidden"
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
              <div className="mt-4 text-center h-[42px] relative w-full overflow-hidden flex flex-col items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`prev-author-${prevItem.id}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <h4 className="text-sm font-bold text-[#111965] truncate w-full">{prevItem.author}</h4>
                    <p className="text-[12px] text-[#68708A] truncate w-full">{prevItem.role}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Active Center Card: Dynamically Changing Card with Glitch-Free Absolute Slide */}
            <div className="md:col-span-6 flex flex-col items-center z-10 w-full">
              {/* Stable Fixed-Height Container with Absolute Stacked Layers (Zero Glitch / Zero Jump) */}
              <div className="w-full relative h-[280px] sm:h-[300px] rounded-3xl overflow-hidden shadow-[0_22px_55px_rgba(17,25,101,0.38)]">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`center-card-${currentItem.id}`}
                    custom={direction}
                    variants={centerCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -35 || info.velocity.x < -180) {
                        nextSlide();
                      } else if (info.offset.x > 35 || info.velocity.x > 180) {
                        prevSlide();
                      }
                    }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#111965] via-[#151F75] to-[#1E277A] text-white rounded-3xl p-7 sm:p-9 flex flex-col justify-between text-center border border-[#F7CE4D]/25 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                  >
                    {/* Brand Gold Ambient Quotation Mark */}
                    <div className="text-[#F7CE4D]/40 flex justify-center mb-1 shrink-0">
                      <svg className="w-11 h-9 sm:w-12 sm:h-10 fill-current" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Main Quote Text */}
                    <p className="text-sm sm:text-base md:text-lg font-medium text-white leading-relaxed italic max-w-lg mx-auto my-auto line-clamp-4">
                      &ldquo;{currentItem.text}&rdquo;
                    </p>

                    {/* Rating Stars (Brand Accent Yellow #F7CE4D) */}
                    <div className="mt-4 flex items-center justify-center gap-1 text-[#F7CE4D] shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Author Info Underneath Center Card */}
              <div className="mt-5 text-center h-[50px] relative w-full overflow-hidden flex flex-col items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`center-author-${currentItem.id}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5"
                  >
                    <h3 className="text-base sm:text-lg font-black text-[#111965] tracking-tight truncate w-full">
                      {currentItem.author}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#68708A] truncate w-full">
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
              {/* Stable Fixed-Height Container with Absolute Stacked Animation (No PopLayout Glitch) */}
              <div className="w-full relative h-[230px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`next-card-${nextItem.id}`}
                    custom={direction}
                    variants={sideCardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full bg-white border border-[#E6E8F0] rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between text-center overflow-hidden"
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
              <div className="mt-4 text-center h-[42px] relative w-full overflow-hidden flex flex-col items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={`next-author-${nextItem.id}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <h4 className="text-sm font-bold text-[#111965] truncate w-full">{nextItem.author}</h4>
                    <p className="text-[12px] text-[#68708A] truncate w-full">{nextItem.role}</p>
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
