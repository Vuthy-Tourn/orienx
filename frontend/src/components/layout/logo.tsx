import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isLight?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * CompassStarLogoMark - Official OrienX brand emblem mark (Transparent / No background)
 * Featuring:
 * - Directional compass dial with cardinal points
 * - Forward 3D needle pointing North-East to the radiant North Star
 * - Perspective education runway
 * - 100% transparent background
 */
export function CompassStarLogoMark({
  className = "w-full h-full",
  isLight = false,
}: {
  className?: string;
  isLight?: boolean;
}) {
  return (
    <Image
      src={isLight ? "/images/orienx-mark-dark.png" : "/images/orienx-mark.png"}
      alt={isLight ? "OrienX Logo Mark (Light for dark backgrounds)" : "OrienX Logo Mark"}
      width={120}
      height={135}
      className={cn("w-full h-full object-contain select-none", className)}
      priority
    />
  );
}

/**
 * OrienXWordmark - Rendered in clean typography/text (no subtitle)
 * - "Orien" in deep brand navy (#101965) or white (dark background)
 * - "X" in vibrant gold/amber (#F69D0D)
 */
export function OrienXWordmark({
  className,
  isLight = false,
  size = "md",
}: {
  className?: string;
  isLight?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <span
      className={cn(
        "font-extrabold tracking-[-0.03em] leading-none inline-flex items-center select-none",
        textSizes[size],
        isLight ? "text-white" : "text-[#101965]",
        className
      )}
    >
      <span>Orien</span>
      <span className="text-[#F69D0D]">X</span>
    </span>
  );
}

export function Logo({
  className,
  isLight = false,
  showText = true,
  size = "md",
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group select-none", className)}
    >
      {/* Brand Icon Mark - Clean, Transparent, No Background */}
      <div
        className={cn(
          "relative flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
          iconSizes[size]
        )}
      >
        <CompassStarLogoMark isLight={isLight} />
      </div>

      {showText && <OrienXWordmark isLight={isLight} size={size} />}
    </Link>
  );
}
