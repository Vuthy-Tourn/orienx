"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export type MascotEmotion = "greeting" | "thinking" | "happy" | "sad" | "completed";

interface FuteraMascotDynamicProps {
  className?: string;
  size?: number; // Base width in px (default 160)
  variant?: "peeking-right" | "full-jumping" | "head-only";
  emotion?: MascotEmotion;
  scaleLevel?: number | null; // 1-3: agree (happy), 4: neutral (thinking), 5-7: disagree (sad)
  speechText?: string;
  showSpeech?: boolean;
  isCelebrating?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

type EyeState = "happy" | "blink" | "wink" | "look" | "sad";
type MouthState = "smile" | "talk" | "laugh" | "sad";

/**
 * FuteraMascotDynamic — 100% Borderless, Reactive, Multi-Emotion Mascot (Tara)
 * - Zero black borders, zero background residue (pristine golden anti-aliasing)
 * - Zero glitching (smooth, flicker-free SVG/Canvas state transitions)
 * - Automatically reacts to Option Selection:
 *   - Agree (Scale 1-3, Green): Happy laughing face, celebration spring jump!
 *   - Disagree (Scale 5-7, Purple): Sad drooping eyes, cute pouting mouth & teardrop!
 *   - Neutral (Scale 4, Grey): Thoughtful listening & cursor eye tracking!
 * - Blinks naturally every 3-4s, winks occasionally, and breathes with physics
 */
export function FuteraMascotDynamic({
  className = "",
  size = 160,
  variant = "peeking-right",
  emotion,
  scaleLevel,
  speechText,
  showSpeech = true,
  isCelebrating = false,
  onClick,
  interactive = true,
}: FuteraMascotDynamicProps) {
  // Determine effective emotion based on scaleLevel, emotion prop, or isCelebrating
  let effectiveEmotion: MascotEmotion = "thinking";
  if (isCelebrating) {
    effectiveEmotion = "happy";
  } else if (scaleLevel !== undefined && scaleLevel !== null) {
    if (scaleLevel <= 3) {
      effectiveEmotion = "happy"; // Agree -> Happy!
    } else if (scaleLevel >= 5) {
      effectiveEmotion = "sad"; // Disagree -> Sad!
    } else {
      effectiveEmotion = "thinking"; // Neutral
    }
  } else if (emotion) {
    effectiveEmotion = emotion;
  }

  // Facial animation states
  const [eyeState, setEyeState] = useState<EyeState>("happy");
  const [mouthState, setMouthState] = useState<MouthState>("smile");
  const [blushPulse, setBlushPulse] = useState(false);

  // Jump animation state
  const [isJumping, setIsJumping] = useState(false);
  const jumpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tracking parallax
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync animation states when effectiveEmotion changes
  useEffect(() => {
    if (effectiveEmotion === "happy") {
      setIsJumping(true);
      setEyeState("happy");
      setMouthState("laugh");
      setBlushPulse(true);

      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = setTimeout(() => {
        setIsJumping(false);
        setMouthState("smile");
        setBlushPulse(false);
      }, 1600);
    } else if (effectiveEmotion === "sad") {
      setIsJumping(false);
      setEyeState("sad");
      setMouthState("sad");
      setBlushPulse(false);
    } else if (effectiveEmotion === "completed") {
      setIsJumping(true);
      setEyeState("happy");
      setMouthState("laugh");
      setBlushPulse(true);
    } else {
      // thinking / greeting
      setIsJumping(false);
      setEyeState("happy");
      setMouthState("smile");
      setBlushPulse(false);
    }
  }, [effectiveEmotion]);

  const handleClick = () => {
    if (effectiveEmotion === "sad") {
      // Comforting Tara when clicked during sad state
      setEyeState("happy");
      setMouthState("smile");
      setTimeout(() => {
        setEyeState("sad");
        setMouthState("sad");
      }, 1800);
    } else {
      setIsJumping(true);
      setMouthState("laugh");
      setBlushPulse(true);
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = setTimeout(() => {
        setIsJumping(false);
        setMouthState("smile");
        setBlushPulse(false);
      }, 1600);
    }
    if (onClick) onClick();
  };

  // --- 1. NATURAL BLINKING & WINKING ENGINE (Only during non-sad states) ---
  useEffect(() => {
    if (effectiveEmotion === "sad") return; // Keep sad eyes stable

    let blinkTimeout: NodeJS.Timeout;
    let isMounted = true;

    const scheduleNextBlink = () => {
      const nextDelay = 2600 + Math.random() * 2400; // 2.6s - 5.0s
      blinkTimeout = setTimeout(() => {
        if (!isMounted) return;

        // 15% chance to wink instead of regular blink
        const shouldWink = Math.random() < 0.15;
        setEyeState(shouldWink ? "wink" : "blink");

        setTimeout(() => {
          if (!isMounted) return;
          setEyeState("happy");
          scheduleNextBlink();
        }, shouldWink ? 220 : 130);
      }, nextDelay);
    };

    scheduleNextBlink();

    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
    };
  }, [effectiveEmotion]);

  // --- 2. TALKING MOUTH ANIMATION (When speech text changes) ---
  useEffect(() => {
    if (speechText && showSpeech && !isJumping && effectiveEmotion !== "sad") {
      setMouthState("talk");
      const talkTimer = setTimeout(() => {
        setMouthState("smile");
      }, 1400);
      return () => clearTimeout(talkTimer);
    }
  }, [speechText, showSpeech, isJumping, effectiveEmotion]);

  // --- 3. MOUSE CURSOR 3D PARALLAX TRACKING ---
  useEffect(() => {
    if (!interactive) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      setMouseOffset({
        x: Math.max(-1, Math.min(1, deltaX)),
        y: Math.max(-1, Math.min(1, deltaY)),
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [interactive]);

  // Scaled dimensions based on original 281 x 337 aspect ratio (~0.834)
  const widthPx = size;
  const heightPx = Math.round(size * (337 / 281));

  // Gaze offset
  const eyeGazeX = mouseOffset.x * 2.2;
  const eyeGazeY = mouseOffset.y * 1.8;

  // 3D tilt angles (sad has a sympathetic gentle droop)
  const tiltY = mouseOffset.x * 12;
  const tiltX = -mouseOffset.y * 8 + (effectiveEmotion === "sad" ? 4 : 0);
  const tiltZ = mouseOffset.x * 4 + (effectiveEmotion === "sad" ? -3 : 0);

  // Contextual fallback speech if none provided
  const defaultSpeech =
    effectiveEmotion === "happy"
      ? "យល់ស្រប! អស្ចារ្យណាស់!"
      : effectiveEmotion === "sad"
      ? "មិនយល់ស្របទេ? ខ្ញុំយល់ហើយ..."
      : effectiveEmotion === "completed"
      ? "អបអរសាទរ! អ្នកពិតជាអស្ចារ្យ!"
      : effectiveEmotion === "greeting"
      ? "សួស្តី! ចាប់ផ្តើមសំណួរដំបូង!"
      : "តើអ្នកយល់យ៉ាងណាដែរ?";

  const renderedSpeech = speechText ?? defaultSpeech;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center select-none ${
        variant === "peeking-right" ? "flex-row" : "flex-col items-center"
      } ${className}`}
    >
      {/* Dynamic Speech Bubble pointing toward Tara */}
      {showSpeech && renderedSpeech && (
        <div
          className={`${
            variant === "peeking-right"
              ? "mr-2 sm:mr-3 animate-in fade-in slide-in-from-right-4 duration-300"
              : "absolute -top-14 z-30 animate-in fade-in zoom-in-95 duration-300"
          }`}
        >
          <div
            className={`relative text-[12px] sm:text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl border whitespace-nowrap leading-tight text-center transition-colors duration-300 ${
              effectiveEmotion === "sad"
                ? "bg-[#1E1B4B] text-[#A5B4FC] border-[#818CF8]/50"
                : "bg-[#111965] text-[#F7CE4D] border-[#F7CE4D]/60"
            }`}
          >
            {renderedSpeech}
            {/* Bubble Tail pointing directly at Tara's head */}
            {variant === "peeking-right" ? (
              <div
                className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 border-t border-r ${
                  effectiveEmotion === "sad"
                    ? "bg-[#1E1B4B] border-[#818CF8]/50"
                    : "bg-[#111965] border-[#F7CE4D]/60"
                }`}
              />
            ) : (
              <div
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                  effectiveEmotion === "sad"
                    ? "bg-[#1E1B4B] border-[#818CF8]/50"
                    : "bg-[#111965] border-[#F7CE4D]/60"
                }`}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Living Character Hierarchy (100% Borderless, Zero Box) */}
      <div
        onClick={handleClick}
        style={{
          width: widthPx,
          height: heightPx,
          perspective: 600,
        }}
        className="relative flex-shrink-0 cursor-pointer group"
        title={effectiveEmotion === "sad" ? "Click to comfort Tara" : "Click Tara to play"}
      >
        {/* Soft Dynamic Contact Shadow beneath Tara */}
        <div
          style={{
            transform: `scale(${
              isJumping ? 0.45 : effectiveEmotion === "sad" ? 1.05 : 1.0 - Math.abs(mouseOffset.y) * 0.1
            })`,
            opacity: isJumping ? 0.25 : 0.65,
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-[#111965]/20 blur-md rounded-full transition-all duration-300 pointer-events-none"
        />

        {/* Floating Sparkles (Gold when happy/neutral, soft blue/silver when sad) */}
        <span
          style={{
            transform: `translate(${mouseOffset.x * 6}px, ${mouseOffset.y * 6}px)`,
          }}
          className={`absolute -top-1 -right-2 text-base transition-colors duration-300 pointer-events-none ${
            effectiveEmotion === "sad"
              ? "text-[#818CF8] animate-pulse opacity-60"
              : "text-[#F7CE4D] animate-ping opacity-75"
          }`}
        >
          {effectiveEmotion === "sad" ? "✧" : "✦"}
        </span>
        <span
          style={{
            transform: `translate(${-mouseOffset.x * 5}px, ${-mouseOffset.y * 5}px)`,
          }}
          className={`absolute bottom-8 -left-3 text-sm transition-colors duration-300 pointer-events-none ${
            effectiveEmotion === "sad" ? "text-[#A5B4FC] animate-pulse opacity-50" : "text-[#F7CE4D] animate-pulse"
          }`}
        >
          {effectiveEmotion === "sad" ? "✧" : "✦"}
        </span>

        {/* Mascot Transform Root with Spring Physics & 3D Tilt */}
        <div
          style={{
            transform: `
              translate3d(0, ${isJumping ? "-42px" : effectiveEmotion === "sad" ? "5px" : "0px"}, 0)
              rotateX(${tiltX}deg)
              rotateY(${tiltY}deg)
              rotateZ(${tiltZ}deg)
              scale(${isJumping ? "1.06, 1.12" : effectiveEmotion === "sad" ? "0.98, 0.98" : "1, 1"})
            `,
            transition: isJumping
              ? "transform 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.28)"
              : "transform 0.25s ease-out",
          }}
          className={`relative w-full h-full filter drop-shadow-[0_10px_22px_rgba(247,206,77,0.38)] transition-filter ${
            !isJumping && effectiveEmotion !== "sad" ? "animate-[bounce_3.2s_ease-in-out_infinite]" : ""
          }`}
        >
          {/* Base Character: Pristine Plush Star Hoodie with Clean Peach Face (100% De-matted, Zero Fringe) */}
          <Image
            src="/images/tara-body-clean.png"
            alt="Tara Mascot"
            width={281}
            height={337}
            priority
            unoptimized
            className="w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Dynamic SVG Live Facial Expressions Overlay */}
          <svg
            viewBox="0 0 100 55"
            className="absolute top-[25.2%] left-[35.2%] w-[35.6%] h-[16.3%] pointer-events-none select-none overflow-visible"
          >
            <defs>
              {/* Soft rosy blush radial gradient */}
              <radialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FB7185" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#F87171" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
              </radialGradient>

              {/* Dark warm cocoa eye gradient */}
              <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3C1E18" />
                <stop offset="100%" stopColor="#25100B" />
              </linearGradient>
            </defs>

            {/* Rosy Blush Cheeks (hidden/subdued when sad) */}
            <circle
              cx="12"
              cy="34"
              r={blushPulse ? "13" : "10"}
              fill="url(#blushGlow)"
              opacity={effectiveEmotion === "sad" ? 0.25 : 1}
              className="transition-all duration-300"
            />
            <circle
              cx="88"
              cy="34"
              r={blushPulse ? "13" : "10"}
              fill="url(#blushGlow)"
              opacity={effectiveEmotion === "sad" ? 0.25 : 1}
              className="transition-all duration-300"
            />

            {/* --- SAD EXPRESSIONS (Disagree) --- */}
            {effectiveEmotion === "sad" ? (
              <>
                {/* Left Sad Drooping Eye */}
                <path
                  d="M 18 16 Q 27 24 36 16"
                  fill="none"
                  stroke="url(#eyeGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                {/* Right Sad Drooping Eye */}
                <path
                  d="M 64 16 Q 73 24 82 16"
                  fill="none"
                  stroke="url(#eyeGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />

                {/* Cute Shiny Teardrop beneath Right Eye */}
                <g className="animate-pulse" style={{ animationDuration: "1.6s" }}>
                  <path
                    d="M 76 26 C 76 24 79 20 79 20 C 79 20 82 24 82 26 C 82 28.5 79 29.5 79 29.5 C 79 29.5 76 28.5 76 26 Z"
                    fill="#38BDF8"
                  />
                  <circle cx="78" cy="25" r="0.8" fill="#FFFFFF" />
                </g>

                {/* Sweet Pouting Mouth Curve (︵) */}
                <path
                  d="M 44 40 Q 50 34 56 40"
                  fill="none"
                  stroke="#4A120E"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              </>
            ) : (
              /* --- HAPPY / NEUTRAL / GREETING EXPRESSIONS --- */
              <>
                {/* Left Eye States */}
                {eyeState === "happy" || eyeState === "wink" ? (
                  // Joyful arched closed smiling eye (^ ^)
                  <path
                    d="M 18 20 Q 27 12 36 20"
                    fill="none"
                    stroke="url(#eyeGrad)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    className="transition-all duration-150"
                  />
                ) : eyeState === "blink" ? (
                  // Soft closed blink line (—)
                  <path
                    d="M 18 19 L 36 19"
                    fill="none"
                    stroke="url(#eyeGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                ) : (
                  // Open curious eye tracking cursor
                  <g transform={`translate(${eyeGazeX}, ${eyeGazeY})`}>
                    <circle cx="27" cy="18" r="6.5" fill="#3C1E18" />
                    <circle cx="29" cy="16" r="2.2" fill="#FFFFFF" />
                  </g>
                )}

                {/* Right Eye States */}
                {eyeState === "happy" ? (
                  // Joyful arched closed smiling eye (^ ^)
                  <path
                    d="M 64 20 Q 73 12 82 20"
                    fill="none"
                    stroke="url(#eyeGrad)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    className="transition-all duration-150"
                  />
                ) : eyeState === "blink" || eyeState === "wink" ? (
                  // Wink line (— ~)
                  <path
                    d="M 64 19 Q 73 21 82 19"
                    fill="none"
                    stroke="url(#eyeGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                ) : (
                  // Open curious eye tracking cursor
                  <g transform={`translate(${eyeGazeX}, ${eyeGazeY})`}>
                    <circle cx="73" cy="18" r="6.5" fill="#3C1E18" />
                    <circle cx="75" cy="16" r="2.2" fill="#FFFFFF" />
                  </g>
                )}

                {/* Mouth States */}
                {mouthState === "laugh" ? (
                  // Wide celebratory laugh with tongue
                  <g>
                    <path
                      d="M 40 31 Q 50 27 60 31 Q 61 47 50 47 Q 39 47 40 31 Z"
                      fill="#4A120E"
                    />
                    <ellipse cx="50" cy="41" rx="6.5" ry="4.5" fill="#FB7185" />
                  </g>
                ) : mouthState === "talk" ? (
                  // Talking mouth
                  <g className="animate-pulse">
                    <path
                      d="M 43 31 Q 50 28 57 31 Q 58 41 50 41 Q 42 41 43 31 Z"
                      fill="#4A120E"
                    />
                    <ellipse cx="50" cy="38" rx="4.5" ry="3" fill="#F43F5E" />
                  </g>
                ) : (
                  // Sweet cheerful open smile
                  <g>
                    <path
                      d="M 42 32 Q 50 29 58 32 Q 58 43 50 43 Q 42 43 42 32 Z"
                      fill="#4A120E"
                    />
                    <ellipse cx="50" cy="39" rx="5" ry="3.5" fill="#F43F5E" />
                  </g>
                )}
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
