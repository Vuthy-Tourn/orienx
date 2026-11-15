"use client";

import { ToggleTheme, type ToggleThemeProps } from "@/components/lightswind/toggle-theme";

/**
 * Platform Theme Toggle
 * Powered by Lightswind with View Transitions and smooth `swipe-down` animation.
 */
export function ThemeToggle({
  className,
  animationType = "circle-spread",
  duration = 450,
  ...props
}: ToggleThemeProps) {
  return (
    <ToggleTheme
      animationType={animationType}
      duration={duration}
      className={className}
      {...props}
    />
  );
}
