import React from "react";

interface ArchetypeGlyphProps {
  trait: string; // "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
  className?: string;
  isSelected?: boolean;
}

export function ArchetypeGlyph({ trait, className = "w-6 h-6", isSelected = false }: ArchetypeGlyphProps) {
  const activeColor = isSelected ? "#F7CE4D" : "#111965";
  const activeBg = isSelected ? "#111965" : "#F0F2FA";
  const strokeColor = isSelected ? "#F7CE4D" : "currentColor";

  switch (trait) {
    case "E":
      // Outward Beacon / Solar Vector (Extraversion)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="5" fill={isSelected ? "#F7CE4D" : "#111965"} />
          <path d="M16 3V7M16 25V29M3 16H7M25 16H29M6.8 6.8L9.6 9.6M22.4 22.4L25.2 25.2M6.8 25.2L9.6 22.4M22.4 9.6L25.2 6.8" 
                stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "I":
      // Inward Focus / Sanctuary Pearl (Introversion)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="13" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="16" cy="16" r="8" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="16" cy="16" r="3.5" fill={isSelected ? "#F7CE4D" : "#111965"} />
        </svg>
      );

    case "S":
      // Empirical Cube / Isometric Reality (Sensing)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4L27 10.5V21.5L16 28L5 21.5V10.5L16 4Z" 
                stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M16 4V16M16 16L27 10.5M16 16L5 10.5M16 16V28" 
                stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2.5" fill={isSelected ? "#F7CE4D" : "#111965"} />
        </svg>
      );

    case "N":
      // Cosmic Constellation / Horizon Telescope (Intuition)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z" 
                fill={isSelected ? "#F7CE4D" : "none"} 
                stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="26" cy="6" r="2" fill={isSelected ? "#FFFFFF" : "#1E277A"} />
          <circle cx="7" cy="25" r="1.5" fill={isSelected ? "#FFFFFF" : "#1E277A"} />
        </svg>
      );

    case "T":
      // Precision Logic Prism / Crystalline Fulcrum (Thinking)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" 
                   stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="16" y1="3" x2="16" y2="29" stroke={strokeColor} strokeWidth="1.8" />
          <line x1="4" y1="16" x2="28" y2="16" stroke={strokeColor} strokeWidth="1.8" />
          <circle cx="16" cy="16" r="3" fill={isSelected ? "#F7CE4D" : "#111965"} />
        </svg>
      );

    case "F":
      // Harmonic Empathy Nexus / Intersecting Rings (Feeling)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="16" r="9" stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="20" cy="16" r="9" stroke={strokeColor} strokeWidth="2.2" />
          <path d="M16 10C17.5 12 17.5 20 16 22C14.5 20 14.5 12 16 10Z" 
                fill={isSelected ? "#F7CE4D" : "#111965"} />
        </svg>
      );

    case "J":
      // Calibrated Milestones / Compass Grid (Judging)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="24" height="20" rx="4" stroke={strokeColor} strokeWidth="2.2" />
          <line x1="4" y1="12" x2="28" y2="12" stroke={strokeColor} strokeWidth="1.8" />
          <circle cx="10" cy="9" r="1.5" fill={isSelected ? "#F7CE4D" : "#111965"} />
          <circle cx="16" cy="9" r="1.5" fill={isSelected ? "#F7CE4D" : "#111965"} />
          <circle cx="22" cy="9" r="1.5" fill={isSelected ? "#F7CE4D" : "#111965"} />
          <path d="M9 18L13 22L23 15" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "P":
      // Dynamic Open Horizons / Adaptive Flow Wave (Perceiving)
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11C7 7 13 7 16 11C19 15 25 15 28 11" 
                stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 17C7 13 13 13 16 17C19 21 25 21 28 17" 
                stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 23C7 19 13 19 16 23C19 27 25 27 28 23" 
                stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="12" stroke={strokeColor} strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill={isSelected ? "#F7CE4D" : "#111965"} />
        </svg>
      );
  }
}
