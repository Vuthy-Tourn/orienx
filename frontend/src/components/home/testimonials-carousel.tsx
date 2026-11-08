"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "motion/react";

interface TestimonialItem {
  id: number;
  text: string;
  author: string;
  role: string;
}

export function TestimonialsCarousel() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1200);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSlotsRef = useRef<{ [key: number]: number }>({});

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

  // Responsive window tracking
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      setIsDesktop(w >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
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

  // Compute circular slot (-2, -1, 0, 1, 2)
  const getSlot = useCallback(
    (index: number) => {
      let slot = (index - activeIndex) % total;
      if (slot < -Math.floor(total / 2)) slot += total;
      if (slot > Math.floor(total / 2)) slot -= total;
      return slot;
    },
    [activeIndex, total]
  );

  // Synchronize previous slots after each render
  useEffect(() => {
    testimonials.forEach((item, index) => {
      prevSlotsRef.current[item.id] = getSlot(index);
    });
  }, [activeIndex, getSlot, testimonials]);

  // Calculate horizontal position for each slot
  const getSlotX = (slot: number) => {
    if (slot === 0) return 0;
    if (isDesktop) {
      const baseOffset = windowWidth >= 1200 ? 420 : windowWidth >= 1024 ? 370 : 320;
      if (slot === 1) return baseOffset;
      if (slot === -1) return -baseOffset;
      if (slot === 2) return baseOffset * 2;
      return -baseOffset * 2;
    } else {
      if (slot === 1) return "108%";
      if (slot === -1) return "-108%";
      if (slot === 2) return "210%";
      return "-210%";
    }
  };

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

        {/* 3D Kinetic Carousel Stage: Cards Physically Slide and Swap Across Positions */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Stage Stage Container */}
          <div className="relative w-full h-[370px] sm:h-[400px] flex items-center justify-center overflow-visible">
            {testimonials.map((item, index) => {
              const slot = getSlot(index);
              const isCenter = slot === 0;
              const isLeft = slot === -1;
              const isRight = slot === 1;
              const isVisible = isCenter || (isDesktop && (isLeft || isRight));

              // Check if item wrapped around behind the scenes (slot -2 <-> +2)
              const prevSlot = prevSlotsRef.current[item.id] ?? slot;
              const isSeamWrap =
                (prevSlot <= -2 && slot >= 2) || (prevSlot >= 2 && slot <= -2);

              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{
                    x: getSlotX(slot),
                    scale: isCenter ? 1 : Math.abs(slot) === 1 ? 0.86 : 0.7,
                    opacity: isCenter ? 1 : Math.abs(slot) === 1 ? (isDesktop ? 0.65 : 0) : 0,
                    zIndex: isCenter ? 30 : Math.abs(slot) === 1 ? 20 : 10,
                    rotateY: isDesktop
                      ? isCenter
                        ? 0
                        : slot === 1
                        ? -6
                        : slot === -1
                        ? 6
                        : 0
                      : 0,
                  }}
                  transition={
                    isSeamWrap
                      ? { duration: 0 }
                      : {
                          x: { type: "spring", stiffness: 240, damping: 26, mass: 0.85 },
                          scale: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.35 },
                          rotateY: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                        }
                  }
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40 || info.velocity.x < -200) {
                      nextSlide();
                    } else if (info.offset.x > 40 || info.velocity.x > 200) {
                      prevSlide();
                    }
                  }}
                  onClick={() => {
                    if (isLeft) prevSlide();
                    if (isRight) nextSlide();
                  }}
                  className={`absolute w-[92vw] max-w-[420px] sm:max-w-[460px] md:max-w-[480px] lg:max-w-[500px] flex flex-col items-center select-none ${
                    isCenter
                      ? "cursor-grab active:cursor-grabbing"
                      : isLeft || isRight
                      ? "cursor-pointer hover:opacity-95 transition-opacity"
                      : "pointer-events-none"
                  }`}
                  style={{
                    perspective: 1000,
                    visibility: isVisible || !isDesktop ? "visible" : "hidden",
                  }}
                >
                  {/* The Testimonial Card Box with Dynamic Navy/White Crossfade */}
                  <div
                    className={`w-full rounded-3xl p-6 sm:p-8 min-h-[260px] sm:min-h-[280px] flex flex-col justify-between text-center relative overflow-hidden transition-all duration-500 ${
                      isCenter
                        ? "shadow-[0_22px_55px_rgba(17,25,101,0.38)]"
                        : "shadow-xs hover:shadow-md"
                    }`}
                  >
                    {/* Navy Gradient Background Layer (Active) */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-[#111965] via-[#151F75] to-[#1E277A] border border-[#F7CE4D]/30 transition-opacity duration-500 rounded-3xl ${
                        isCenter ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    />

                    {/* White Card Background Layer (Flanking) */}
                    <div
                      className={`absolute inset-0 bg-white border border-[#E6E8F0] transition-opacity duration-500 rounded-3xl ${
                        isCenter ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                    />

                    {/* Card Inner Content */}
                    <div className="relative z-10 w-full flex flex-col justify-between h-full min-h-[200px] flex-1">
                      {/* Quotation Mark Icon */}
                      <div
                        className={`flex justify-center mb-2 shrink-0 transition-colors duration-500 ${
                          isCenter ? "text-[#F7CE4D]/40" : "text-slate-300"
                        }`}
                      >
                        <svg className="w-10 h-8 sm:w-12 sm:h-10 fill-current" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Main Quote Text */}
                      <p
                        className={`text-xs sm:text-sm md:text-base font-medium leading-relaxed italic max-w-md mx-auto my-auto transition-colors duration-500 ${
                          isCenter
                            ? "text-white"
                            : "text-[#68708A] line-clamp-4"
                        }`}
                      >
                        &ldquo;{item.text}&rdquo;
                      </p>

                      {/* 5-Star Rating */}
                      <div className="mt-4 flex items-center justify-center gap-1 text-[#F7CE4D] shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Student Author Information Beneath Card (Slides Together with Card) */}
                  <div className="mt-4 text-center min-h-[46px] flex flex-col items-center justify-center space-y-0.5">
                    <h3
                      className={`font-black text-[#111965] tracking-tight transition-all duration-500 ${
                        isCenter ? "text-base sm:text-lg" : "text-sm text-[#111965]/75"
                      }`}
                    >
                      {item.author}
                    </h3>
                    <p
                      className={`font-semibold transition-all duration-500 ${
                        isCenter ? "text-xs sm:text-sm text-[#68708A]" : "text-[11px] text-[#68708A]/75"
                      }`}
                    >
                      {item.role}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls & Dot Indicators */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonial"
              className="w-9 h-9 rounded-full bg-white border border-[#E6E8F0] flex items-center justify-center text-[#111965] hover:bg-[#111965] hover:text-white hover:border-[#111965] shadow-2xs transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots with Smooth Animated Indicator */}
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
