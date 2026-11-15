"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

export type AnimationType =
    | "none"
    | "circle-spread"
    | "round-morph"
    | "swipe-left"
    | "swipe-up"
    | "diag-down-right"
    | "fade-in-out"
    | "shrink-grow"
    | "flip-x-in"
    | "split-vertical"
    | "swipe-right"
    | "swipe-down"
    | "wave-ripple";

export interface ToggleThemeProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number;
    animationType?: AnimationType;
}

const subscribe = () => () => {};

export const ToggleTheme = ({
    className,
    duration = 450,
    animationType = "swipe-down",
    onClick,
    ...props
}: ToggleThemeProps) => {
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const buttonRef = useRef<HTMLButtonElement>(null);
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        if (typeof document === "undefined") return;
        if (animationType === "flip-x-in") return;

        let styleElement = document.getElementById("toggle-theme-vt-override") as HTMLStyleElement | null;
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "toggle-theme-vt-override";
            styleElement.textContent = `
                ::view-transition-old(root),
                ::view-transition-new(root) {
                    animation: none;
                    mix-blend-mode: normal;
                }
                ::view-transition-old(root) {
                    z-index: 1;
                }
                ::view-transition-new(root) {
                    z-index: 2;
                }
            `;
            document.head.appendChild(styleElement);
        }
    }, [animationType]);

    const toggleTheme = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (isTransitioningRef.current) return;

            const nextTheme = isDark ? "light" : "dark";

            const prefersReducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            const hasViewTransition =
                typeof document !== "undefined" &&
                "startViewTransition" in document &&
                typeof (document as any).startViewTransition === "function";

            if (!hasViewTransition || prefersReducedMotion || animationType === "none") {
                setTheme(nextTheme);
                return;
            }

            try {
                isTransitioningRef.current = true;

                const transition = (document as any).startViewTransition(() => {
                    flushSync(() => {
                        setTheme(nextTheme);
                        document.documentElement.classList.toggle("dark", nextTheme === "dark");
                        try {
                            localStorage.setItem("futera_theme", nextTheme);
                            localStorage.setItem("theme", nextTheme);
                        } catch {
                            // ignore
                        }
                    });
                });

                await transition.ready;

                const buttonRect = buttonRef.current?.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const left = buttonRect ? buttonRect.left : viewportWidth / 2;
                const top = buttonRect ? buttonRect.top : 0;
                const width = buttonRect ? buttonRect.width : 0;
                const height = buttonRect ? buttonRect.height : 0;
                const x = left + width / 2;
                const y = top + height / 2;
                const maxRadius = Math.hypot(
                    Math.max(left, viewportWidth - left),
                    Math.max(top, viewportHeight - top)
                );

                switch (animationType) {
                    case "swipe-down": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `inset(0 0 ${viewportHeight}px 0)`,
                                    `inset(0 0 0 0)`,
                                ],
                            },
                            {
                                duration,
                                easing: "cubic-bezier(0.2, 0, 0, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "swipe-up": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `inset(${viewportHeight}px 0 0 0)`,
                                    `inset(0 0 0 0)`,
                                ],
                            },
                            {
                                duration,
                                easing: "cubic-bezier(0.2, 0, 0, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "swipe-left": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `inset(0 0 0 ${viewportWidth}px)`,
                                    `inset(0 0 0 0)`,
                                ],
                            },
                            {
                                duration,
                                easing: "cubic-bezier(0.2, 0, 0, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "swipe-right": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `inset(0 ${viewportWidth}px 0 0)`,
                                    `inset(0 0 0 0)`,
                                ],
                            },
                            {
                                duration,
                                easing: "cubic-bezier(0.2, 0, 0, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "circle-spread": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `circle(0px at ${x}px ${y}px)`,
                                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                                ],
                            },
                            {
                                duration,
                                easing: "ease-in-out",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "round-morph": {
                        const anim = document.documentElement.animate(
                            [
                                { opacity: 0, transform: "scale(0.8) rotate(5deg)" },
                                { opacity: 1, transform: "scale(1) rotate(0deg)" },
                            ],
                            {
                                duration: duration * 1.2,
                                easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "diag-down-right": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `polygon(0 0, 0 0, 0 0, 0 0)`,
                                    `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                                ],
                            },
                            {
                                duration: duration * 1.3,
                                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "fade-in-out": {
                        const anim = document.documentElement.animate(
                            {
                                opacity: [0, 1],
                            },
                            {
                                duration: duration * 0.7,
                                easing: "ease-in-out",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "shrink-grow": {
                        document.documentElement.animate(
                            [
                                { transform: "scale(0.9)", opacity: 0 },
                                { transform: "scale(1)", opacity: 1 },
                            ],
                            {
                                duration: duration * 1.1,
                                easing: "cubic-bezier(0.19, 1, 0.22, 1)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        const anim = document.documentElement.animate(
                            [
                                { transform: "scale(1)", opacity: 1 },
                                { transform: "scale(1.05)", opacity: 0 },
                            ],
                            {
                                duration: duration * 1.1,
                                easing: "cubic-bezier(0.19, 1, 0.22, 1)",
                                pseudoElement: "::view-transition-old(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "wave-ripple": {
                        const anim = document.documentElement.animate(
                            {
                                clipPath: [
                                    `circle(0% at 50% 50%)`,
                                    `circle(${maxRadius}px at 50% 50%)`,
                                ],
                            },
                            {
                                duration: duration * 1.3,
                                easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                    case "flip-x-in": {
                        const styleElem = document.createElement("style");
                        styleElem.textContent = `
                            ::view-transition-group(root) { perspective: 1000px; }
                            ::view-transition-old(root) { transform-origin: center; animation: flip-out 400ms forwards; }
                            ::view-transition-new(root) { transform-origin: center; animation: flip-in 400ms forwards; }
                            @keyframes flip-out { from { transform: rotateY(0deg); opacity: 1; } to { transform: rotateY(-90deg); opacity: 0; } }
                            @keyframes flip-in { from { transform: rotateY(90deg); opacity: 0; } to { transform: rotateY(0deg); opacity: 1; } }
                        `;
                        document.head.appendChild(styleElem);
                        setTimeout(() => styleElem.remove(), 1000);
                        break;
                    }

                    case "split-vertical": {
                        document.documentElement.animate(
                            [{ opacity: 0 }, { opacity: 1 }],
                            {
                                duration: duration * 0.75,
                                easing: "ease-in",
                                pseudoElement: "::view-transition-new(root)",
                            }
                        );
                        const anim = document.documentElement.animate(
                            [
                                { clipPath: "inset(0 0 0 0)", transform: "none" },
                                { clipPath: "inset(0 40% 0 40%)", transform: "scale(1.2)" },
                                { clipPath: "inset(0 50% 0 50%)", transform: "scale(1)" },
                            ],
                            {
                                duration: duration * 1.4,
                                easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                                pseudoElement: "::view-transition-old(root)",
                            }
                        );
                        await anim.finished.catch(() => {});
                        break;
                    }

                }

                await transition.finished.catch(() => {});
            } catch {
                setTheme(nextTheme);
            } finally {
                isTransitioningRef.current = false;
            }
        },
        [isDark, setTheme, animationType, duration, onClick]
    );

    const showSun = mounted && isDark;

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={toggleTheme}
            aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle colour theme"}
            title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle colour theme"}
            aria-pressed={mounted ? isDark : undefined}
            className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E6E8F0] bg-white text-[#5A6482] transition-all hover:bg-slate-50 hover:text-[#111965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965]/30 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-[#F7CE4D]/40",
                className
            )}
            {...props}
        >
            {showSun ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
                <Moon className="h-4 w-4 text-[#5A6482] dark:text-slate-300 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
        </button>
    );
};
