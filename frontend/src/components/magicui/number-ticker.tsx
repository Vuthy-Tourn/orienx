"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1800; // 1.8 seconds

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out expo
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(easeOut * value);
        setDisplayValue(current);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
