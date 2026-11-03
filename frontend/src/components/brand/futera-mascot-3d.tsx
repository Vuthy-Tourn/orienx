"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface FuteraMascot3DProps {
  className?: string;
  size?: number; // Canvas size in px
  isCelebrating?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * FuteraMascot3D - Real-Time Interactive Three.js 3D Platform Mascot (Tara)
 * 100% Exact Match to Original Character Artwork:
 * - Clean HD cut-out texture with zero edge fringing
 * - True, vibrant golden yellow & peachy skin tones (no lighting wash-out)
 * - Two delicate glowing 4-point star sparkles (✦) matching the picture exactly
 * - Ultra-playful energetic squash-and-stretch spring idle
 * - Real-time 3D mouse cursor head-tracking
 * - High-energy celebration spring jump on answer / click
 * - Interactive click-to-play with celebration bounce
 */
export function FuteraMascot3D({
  className = "",
  size = 180,
  isCelebrating = false,
  onClick,
  interactive = true,
}: FuteraMascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Jump animation state refs
  const jumpProgressRef = useRef(0);
  const isJumpingRef = useRef(false);
  const prevCelebratingRef = useRef(isCelebrating);

  // Trigger jump when isCelebrating changes from false to true
  useEffect(() => {
    if (isCelebrating && !prevCelebratingRef.current) {
      isJumpingRef.current = true;
      jumpProgressRef.current = 0;
    }
    prevCelebratingRef.current = isCelebrating;
  }, [isCelebrating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. THREE.JS SCENE & CAMERA ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Camera distance calibrated so Tara fills 88% of canvas height prominently & crisply!
    camera.position.set(0, 0, 4.4);

    // --- 2. TRANSPARENT WEBGL RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent
    container.replaceChildren(renderer.domElement);

    // --- 3. MASCOT HIERARCHY ---
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    // HD Mascot Artwork Plane (Aspect ratio 296 / 331 = 0.894)
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load("/images/mascot-star-tight.png");
    mascotTexture.generateMipmaps = true;
    mascotTexture.minFilter = THREE.LinearMipmapLinearFilter;
    mascotTexture.magFilter = THREE.LinearFilter;

    const meshWidth = 2.68;
    const meshHeight = 3.0;
    const planeGeom = new THREE.PlaneGeometry(meshWidth, meshHeight);

    // MeshBasicMaterial preserves 100% of original artist colors, warm yellows, and peach blush!
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: mascotTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mascotMesh = new THREE.Mesh(planeGeom, planeMaterial);
    mascotRoot.add(mascotMesh);

    // --- 4. DELICATE GLOWING 4-POINT STAR SPARKLES (✦) MATCHING THE PICTURE ---
    // Generate soft glowing 4-point star texture dynamically
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 128;
    starCanvas.height = 128;
    const starCtx = starCanvas.getContext("2d");
    if (starCtx) {
      starCtx.clearRect(0, 0, 128, 128);
      // Soft radial glow
      const glowGrad = starCtx.createRadialGradient(64, 64, 0, 64, 64, 56);
      glowGrad.addColorStop(0, "rgba(255, 230, 120, 0.95)");
      glowGrad.addColorStop(0.3, "rgba(250, 204, 21, 0.6)");
      glowGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
      starCtx.fillStyle = glowGrad;
      starCtx.fillRect(0, 0, 128, 128);

      // 4-Point Star Diamond Shape
      starCtx.beginPath();
      starCtx.moveTo(64, 12);
      starCtx.quadraticCurveTo(64, 64, 116, 64);
      starCtx.quadraticCurveTo(64, 64, 64, 116);
      starCtx.quadraticCurveTo(64, 64, 12, 64);
      starCtx.quadraticCurveTo(64, 64, 64, 12);
      starCtx.fillStyle = "#FFFFFF";
      starCtx.fill();

      // Outer golden tint
      starCtx.lineWidth = 4;
      starCtx.strokeStyle = "rgba(253, 224, 71, 0.85)";
      starCtx.stroke();
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Left Sparkle (near left arm)
    const leftStarGeom = new THREE.PlaneGeometry(0.55, 0.55);
    const leftStar = new THREE.Mesh(leftStarGeom, starMaterial);
    leftStar.position.set(-1.45, -0.45, 0.1);
    mascotRoot.add(leftStar);

    // Right Sparkle (near right top star point)
    const rightStarGeom = new THREE.PlaneGeometry(0.65, 0.65);
    const rightStar = new THREE.Mesh(rightStarGeom, starMaterial);
    rightStar.position.set(1.4, 0.75, 0.1);
    mascotRoot.add(rightStar);

    // --- 5. MOUSE CURSOR 3D TRACKING ---
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = THREE.MathUtils.clamp(dx * 0.45, -0.3, 0.3);
      targetRotX = THREE.MathUtils.clamp(-dy * 0.35, -0.22, 0.22);
    };

    window.addEventListener("pointermove", handlePointerMove);

    // --- 6. ULTRA-PLAYFUL ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor follow
      mascotRoot.rotation.x = THREE.MathUtils.lerp(mascotRoot.rotation.x, targetRotX, 0.1);
      mascotRoot.rotation.y = THREE.MathUtils.lerp(mascotRoot.rotation.y, targetRotY, 0.1);

      // Energetic springy idle: bobbing + squash-and-stretch
      const idleCadence = 3.4;
      const idleFloatY = Math.sin(elapsedTime * idleCadence) * 0.08;
      const idleSquashY = 1.0 + Math.sin(elapsedTime * idleCadence * 2) * 0.035;
      const idleStretchX = 1.0 - Math.sin(elapsedTime * idleCadence * 2) * 0.025;
      const idleTiltZ = Math.sin(elapsedTime * (idleCadence * 0.6)) * 0.045;

      mascotRoot.rotation.z = idleTiltZ;

      // --- HIGH-ENERGY CELEBRATION JUMP ---
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.048;
        const p = jumpProgressRef.current;

        if (p < 0.2) {
          // Phase 1: Anticipation Squash
          const sq = p / 0.2;
          mascotMesh.scale.set(1.18, 0.82, 1.0);
          mascotRoot.position.y = idleFloatY - 0.18 * sq;
        } else if (p < 0.8) {
          // Phase 2: High Jump & Mid-Air Wobble
          const normP = (p - 0.2) / 0.6;
          const jumpHeight = Math.sin(normP * Math.PI) * 1.25;
          mascotRoot.position.y = idleFloatY + jumpHeight;

          // Stretch during ascent, wobble in mid-air
          const stretch = 1.0 + Math.sin(normP * Math.PI) * 0.16;
          mascotMesh.scale.set(1 / stretch, stretch, 1.0);
          mascotRoot.rotation.y = targetRotY + Math.sin(normP * Math.PI * 2) * 0.4;
          mascotRoot.rotation.z = idleTiltZ + Math.sin(normP * Math.PI) * 0.15;
        } else if (p < 1.0) {
          // Phase 3: Landing Rebound
          const normP = (p - 0.8) / 0.2;
          const squash = Math.sin(normP * Math.PI);
          mascotRoot.position.y = idleFloatY - squash * 0.12;
          mascotMesh.scale.set(1.0 + squash * 0.14, 1.0 - squash * 0.14, 1.0);
        } else {
          // Jump finished
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          mascotRoot.position.y = idleFloatY;
          mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
        }
      } else {
        mascotRoot.position.y = idleFloatY;
        mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
      }

      // Animate the two delicate glowing star sparkles
      const starPulse1 = 0.85 + Math.sin(elapsedTime * 4.2) * 0.25;
      leftStar.scale.set(starPulse1, starPulse1, 1);
      leftStar.rotation.z += 0.02;

      const starPulse2 = 0.9 + Math.sin(elapsedTime * 3.6 + 1.2) * 0.22;
      rightStar.scale.set(starPulse2, starPulse2, 1);
      rightStar.rotation.z -= 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      planeGeom.dispose();
      planeMaterial.dispose();
      leftStarGeom.dispose();
      rightStarGeom.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      mascotTexture.dispose();
      container.replaceChildren();
    };
  }, [size, interactive]);

  // Click to trigger joyful celebration jump
  const handleMascotClick = () => {
    isJumpingRef.current = true;
    jumpProgressRef.current = 0;
    if (onClick) onClick();
  };

  return (
    <div
      ref={mountRef}
      onClick={handleMascotClick}
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-[0_12px_24px_rgba(247,206,77,0.35)] transition-transform hover:scale-108 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Click Tara to jump & celebrate! 🌟"
    />
  );
}
