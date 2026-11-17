"use client";

import React, { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkle: number;
  phase: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  length: number;
};

export function AuthStarfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let animationFrame = 0;
    let lastFrame = 0;
    let nextShootingStar = 0;
    let running = true;

    const draw = (time: number, staticOnly = false) => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        const alpha = staticOnly
          ? star.alpha
          : star.alpha *
            (0.55 + 0.45 * Math.sin(time * 0.001 * star.twinkle + star.phase));

        context.beginPath();
        context.fillStyle = `rgba(255, 248, 232, ${alpha})`;
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();

        if (star.radius > 1.35) {
          context.beginPath();
          context.fillStyle = `rgba(247, 206, 77, ${alpha * 0.08})`;
          context.arc(star.x, star.y, star.radius * 3.2, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (!staticOnly) {
        for (const shootingStar of shootingStars) {
          const progress = 1 - shootingStar.life;
          const alpha = Math.sin(progress * Math.PI) * 0.7;
          const tailX = shootingStar.x - shootingStar.vx * shootingStar.length;
          const tailY = shootingStar.y - shootingStar.vy * shootingStar.length;
          const gradient = context.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            tailX,
            tailY
          );
          gradient.addColorStop(0, `rgba(255, 248, 232, ${alpha})`);
          gradient.addColorStop(1, "rgba(255, 248, 232, 0)");
          context.strokeStyle = gradient;
          context.lineWidth = 1.1;
          context.beginPath();
          context.moveTo(shootingStar.x, shootingStar.y);
          context.lineTo(tailX, tailY);
          context.stroke();
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        80,
        Math.max(36, Math.round((width * height) / 30000))
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.55 + Math.random() * 1.35,
        alpha: 0.28 + Math.random() * 0.58,
        twinkle: 0.6 + Math.random() * 1.7,
        phase: Math.random() * Math.PI * 2,
      }));

      if (reduceMotion) draw(0, true);
    };

    const tick = (time: number) => {
      if (!running) return;
      animationFrame = window.requestAnimationFrame(tick);

      if (reduceMotion || document.hidden) return;
      if (time - lastFrame < 16) return;
      lastFrame = time;

      if (time > nextShootingStar) {
        nextShootingStar = time + 2600 + Math.random() * 4200;
        const startX = width * (0.45 + Math.random() * 0.48);
        const startY = height * (0.06 + Math.random() * 0.32);
        const speed = 0.9 + Math.random() * 0.55;
        shootingStars.push({
          x: startX,
          y: startY,
          vx: speed,
          vy: speed * 0.52,
          life: 1,
          length: 85 + Math.random() * 75,
        });
      }

      for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
        const shootingStar = shootingStars[index];
        shootingStar.x += shootingStar.vx * 2.1;
        shootingStar.y += shootingStar.vy * 2.1;
        shootingStar.life -= 0.011;
        if (
          shootingStar.life <= 0 ||
          shootingStar.x > width + 180 ||
          shootingStar.y > height + 180
        ) {
          shootingStars.splice(index, 1);
        }
      }

      draw(time);
    };

    resize();
    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(tick);
    }

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
    />
  );
}
