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
 * FuteraMascot3D - Real-Time Interactive Three.js Mascot (Tara)
 * 100% EXACT MATCH to the user's uploaded character image:
 * - Uses the exact high-res artwork texture from the image (zero lumpy spheres)
 * - Beautiful smiling face, rosy blush cheeks, hoodie strings, and cute jumping pose
 * - Real Three.js WebGL canvas with 3D perspective and mouse tracking
 * - Energetic spring physics (bouncy idle, squash & stretch)
 * - Celebratory 3D spring jump on answer selection or direct click
 * - Delicate glowing 4-point star sparkles (✦)
 */
export function FuteraMascot3D({
  className = "",
  size = 170,
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
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    // Camera distance calibrated so Tara fills the frame prominently and crisply
    camera.position.set(0, 0, 4.3);

    // --- 2. TRANSPARENT WEBGL RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent background
    container.replaceChildren(renderer.domElement);

    // --- 3. MASCOT ROOT HIERARCHY ---
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    // Load the EXACT high-resolution mascot artwork from the user's image
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load("/images/tara-mascot-exact.png");
    mascotTexture.generateMipmaps = true;
    mascotTexture.minFilter = THREE.LinearMipmapLinearFilter;
    mascotTexture.magFilter = THREE.LinearFilter;

    // Aspect ratio 281 / 337 = ~0.834
    const meshWidth = 2.45;
    const meshHeight = 2.94;
    const planeGeom = new THREE.PlaneGeometry(meshWidth, meshHeight);

    // MeshBasicMaterial guarantees 100% exact match to original colors, face, and plush hoodie
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: mascotTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mascotMesh = new THREE.Mesh(planeGeom, planeMaterial);
    mascotRoot.add(mascotMesh);

    // --- 4. TWO DELICATE GLOWING 4-POINT SPARKLE STARS (✦) ---
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 128;
    starCanvas.height = 128;
    const starCtx = starCanvas.getContext("2d");
    if (starCtx) {
      starCtx.clearRect(0, 0, 128, 128);
      // Soft radial glow
      const glowGrad = starCtx.createRadialGradient(64, 64, 0, 64, 64, 58);
      glowGrad.addColorStop(0, "rgba(255, 235, 130, 0.95)");
      glowGrad.addColorStop(0.35, "rgba(250, 204, 21, 0.55)");
      glowGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
      starCtx.fillStyle = glowGrad;
      starCtx.fillRect(0, 0, 128, 128);

      // 4-Point Star Diamond
      starCtx.beginPath();
      starCtx.moveTo(64, 14);
      starCtx.quadraticCurveTo(64, 64, 114, 64);
      starCtx.quadraticCurveTo(64, 64, 64, 114);
      starCtx.quadraticCurveTo(64, 64, 14, 64);
      starCtx.quadraticCurveTo(64, 64, 64, 14);
      starCtx.fillStyle = "#FFFFFF";
      starCtx.fill();
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Left Sparkle (near left arm)
    const leftStarGeom = new THREE.PlaneGeometry(0.5, 0.5);
    const leftStar = new THREE.Mesh(leftStarGeom, starMaterial);
    leftStar.position.set(-1.42, -0.42, 0.05);
    mascotRoot.add(leftStar);

    // Right Sparkle (near right star point)
    const rightStarGeom = new THREE.PlaneGeometry(0.58, 0.58);
    const rightStar = new THREE.Mesh(rightStarGeom, starMaterial);
    rightStar.position.set(1.36, 0.72, 0.05);
    mascotRoot.add(rightStar);

    // --- 5. MOUSE CURSOR 3D TRACKING ---
    let pointerX = 0;
    let pointerY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      pointerX = ((e.clientX - centerX) / (window.innerWidth / 2)) * 0.35;
      pointerY = -((e.clientY - centerY) / (window.innerHeight / 2)) * 0.25;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // --- 6. ULTRA-PLAYFUL ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Energetic springy idle: bobbing + squash-and-stretch
      const idleCadence = 3.2;
      let bounce = Math.sin(t * idleCadence) * 0.08;
      const idleSquashY = 1.0 + Math.sin(t * idleCadence * 2) * 0.035;
      const idleStretchX = 1.0 - Math.sin(t * idleCadence * 2) * 0.025;
      const idleTiltZ = Math.sin(t * (idleCadence * 0.5)) * 0.045;

      // Handle 3D Celebration Jump
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.048;
        const p = jumpProgressRef.current;

        if (p < 0.2) {
          // Phase 1: Squash anticipation
          const sq = p / 0.2;
          mascotMesh.scale.set(1.18, 0.82, 1.0);
          bounce -= 0.16 * sq;
        } else if (p < 0.8) {
          // Phase 2: Launch into high spring jump & mid-air wobble
          const normP = (p - 0.2) / 0.6;
          const jumpHeight = Math.sin(normP * Math.PI) * 1.15;
          bounce += jumpHeight;

          const stretch = 1.0 + Math.sin(normP * Math.PI) * 0.16;
          mascotMesh.scale.set(1 / stretch, stretch, 1.0);
          mascotRoot.rotation.y = THREE.MathUtils.lerp(mascotRoot.rotation.y, pointerX + Math.sin(normP * Math.PI * 2) * 0.35, 0.1);
          mascotRoot.rotation.z = idleTiltZ + Math.sin(normP * Math.PI) * 0.12;
        } else if (p < 1.0) {
          // Phase 3: Landing bounce
          const normP = (p - 0.8) / 0.2;
          const squash = Math.sin(normP * Math.PI);
          bounce -= squash * 0.1;
          mascotMesh.scale.set(1.0 + squash * 0.12, 1.0 - squash * 0.12, 1.0);
        } else {
          // Finished jump
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
        }
      } else {
        mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
      }

      // Apply transforms
      mascotRoot.position.y = bounce;
      mascotRoot.rotation.z = idleTiltZ;
      mascotRoot.rotation.y = THREE.MathUtils.lerp(
        mascotRoot.rotation.y,
        pointerX + Math.sin(t * 0.8) * 0.03,
        0.08
      );
      mascotRoot.rotation.x = THREE.MathUtils.lerp(mascotRoot.rotation.x, pointerY, 0.08);

      // Animate star sparkles
      const starPulse1 = 0.85 + Math.sin(t * 4.2) * 0.22;
      leftStar.scale.set(starPulse1, starPulse1, 1);
      leftStar.rotation.z += 0.018;

      const starPulse2 = 0.9 + Math.sin(t * 3.6 + 1.2) * 0.2;
      rightStar.scale.set(starPulse2, starPulse2, 1);
      rightStar.rotation.z -= 0.022;

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

  // Click directly on Tara to trigger celebration jump
  const handleMascotClick = () => {
    isJumpingRef.current = true;
    jumpProgressRef.current = 0;
    if (onClick) onClick();
  };

  return (
    <div
      ref={mountRef}
      onClick={handleMascotClick}
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-[0_10px_20px_rgba(247,206,77,0.3)] transition-transform hover:scale-106 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Click Tara to play! 🌟"
    />
  );
}
