"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface FuteraMascot3DProps {
  className?: string;
  size?: number; // Size in px (e.g. 150, 180, 220)
  isCelebrating?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * FuteraMascot3D - Real-Time Interactive Three.js 3D Platform Mascot (Tara)
 * 100% Visual Match to Picture + High-Energy 3D WebGL Physics:
 * - High-res alpha texture mapped onto a 3D responsive WebGL mesh
 * - Dynamic 3D lighting (key light, warm fill light, rim light)
 * - Orbiting 3D golden star particles with real-time twinkle & burst physics
 * - Ultra-playful bouncy squash-and-stretch idle animation
 * - Real-time mouse cursor head-tracking
 * - Dynamic celebratory spring jump with mid-air wobble & landing bounce
 * - Dynamic 3D shadow on the ground plane that fades/expands with jump height
 * - Interactive click-to-play with celebration audio-visual feel
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
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // --- 2. TRANSPARENT WEBGL RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas
    container.replaceChildren(renderer.domElement);

    // --- 3. DYNAMIC 3D LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfef08a, 1.0);
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // --- 4. MASCOT HIERARCHY ---
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    // Mascot Body Plane (Contains the mascot artwork with 100% visual match)
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load("/images/mascot-star-tight.png");
    mascotTexture.generateMipmaps = true;
    mascotTexture.minFilter = THREE.LinearMipmapLinearFilter;
    mascotTexture.magFilter = THREE.LinearFilter;

    // Aspect ratio: 553 / 668 = ~0.828
    const meshWidth = 2.45;
    const meshHeight = 2.96;
    const planeGeom = new THREE.PlaneGeometry(meshWidth, meshHeight, 16, 16);

    const planeMaterial = new THREE.MeshStandardMaterial({
      map: mascotTexture,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.3,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const mascotMesh = new THREE.Mesh(planeGeom, planeMaterial);
    mascotMesh.position.set(0, 0.1, 0);
    mascotRoot.add(mascotMesh);

    // --- 5. DYNAMIC 3D GROUND SHADOW ---
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(17, 25, 101, 0.35)");
      grad.addColorStop(0.5, "rgba(17, 25, 101, 0.12)");
      grad.addColorStop(1, "rgba(17, 25, 101, 0)");
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(1.9, 0.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.position.set(0, -1.35, -0.1);
    scene.add(shadowMesh);

    // --- 6. ORBITING 3D GOLDEN STAR SPARKLES ---
    // Genuine 3D Golden Octahedron Stars orbiting around Tara
    const sparkleStarGeom = new THREE.OctahedronGeometry(0.13, 0);
    sparkleStarGeom.scale(0.85, 1.25, 0.85);

    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.25,
    });

    interface SparkleData {
      mesh: THREE.Mesh;
      baseAngle: number;
      speed: number;
      radiusX: number;
      radiusZ: number;
      y: number;
      baseScale: number;
    }

    const sparkles: SparkleData[] = [];
    const sparkleConfigs = [
      { baseAngle: 0.4, speed: 1.6, radiusX: 1.6, radiusZ: 0.9, y: 0.8, baseScale: 1.1 },
      { baseAngle: 2.5, speed: 1.2, radiusX: 1.5, radiusZ: 0.8, y: -0.4, baseScale: 0.85 },
      { baseAngle: 4.8, speed: 1.9, radiusX: 1.4, radiusZ: 1.0, y: 0.2, baseScale: 1.0 },
      { baseAngle: 1.8, speed: 1.4, radiusX: 1.7, radiusZ: 0.7, y: 1.2, baseScale: 0.75 },
    ];

    sparkleConfigs.forEach((cfg) => {
      const spMesh = new THREE.Mesh(sparkleStarGeom, sparkleMaterial);
      mascotRoot.add(spMesh);
      sparkles.push({ mesh: spMesh, ...cfg });
    });

    // --- 7. MOUSE CURSOR 3D TRACKING ---
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Playful responsive 3D tilt towards cursor
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = THREE.MathUtils.clamp(dx * 0.4, -0.35, 0.35);
      targetRotX = THREE.MathUtils.clamp(-dy * 0.3, -0.25, 0.25);
    };

    window.addEventListener("pointermove", handlePointerMove);

    // --- 8. HIGH-ENERGY ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor follow
      mascotRoot.rotation.x = THREE.MathUtils.lerp(mascotRoot.rotation.x, targetRotX, 0.1);
      mascotRoot.rotation.y = THREE.MathUtils.lerp(mascotRoot.rotation.y, targetRotY, 0.1);

      // Energetic springy idle bobbing & squash
      const idleSpeed = 3.6; // Energetic cadence
      const idleFloatY = Math.sin(elapsedTime * idleSpeed) * 0.08;
      const idleSquashY = 1.0 + Math.sin(elapsedTime * idleSpeed * 2) * 0.035;
      const idleStretchX = 1.0 - Math.sin(elapsedTime * idleSpeed * 2) * 0.025;
      const idleTiltZ = Math.sin(elapsedTime * (idleSpeed * 0.6)) * 0.05;

      mascotRoot.rotation.z = idleTiltZ;

      // --- HIGH-ENERGY CELEBRATION JUMP ---
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.048; // Jump cycle speed
        const p = jumpProgressRef.current;

        if (p < 0.2) {
          // Phase 1: Anticipation Squash
          const sq = p / 0.2;
          mascotMesh.scale.set(1.15, 0.85, 1.0);
          mascotRoot.position.y = idleFloatY - 0.15 * sq;
          shadowMesh.scale.set(1.2, 1.2, 1.0);
          shadowMat.opacity = 0.95;
        } else if (p < 0.8) {
          // Phase 2: Launch, High Jump & Mid-Air Spin
          const normP = (p - 0.2) / 0.6; // 0 to 1
          const jumpHeight = Math.sin(normP * Math.PI) * 1.35; // High explosive jump
          mascotRoot.position.y = idleFloatY + jumpHeight;

          // Stretch during ascent, normal at peak
          const stretchFactor = 1.0 + Math.sin(normP * Math.PI) * 0.18;
          mascotMesh.scale.set(1 / stretchFactor, stretchFactor, 1.0);

          // Playful 3D spin / wobble
          mascotRoot.rotation.y = targetRotY + Math.sin(normP * Math.PI * 2) * 0.45;
          mascotRoot.rotation.z = idleTiltZ + Math.sin(normP * Math.PI) * 0.15;

          // Shadow fades and shrinks as mascot jumps high
          const shadowScale = Math.max(0.45, 1.0 - jumpHeight * 0.45);
          shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
          shadowMat.opacity = Math.max(0.18, 0.8 - jumpHeight * 0.4);
        } else if (p < 1.0) {
          // Phase 3: Landing Squash & Rebound
          const normP = (p - 0.8) / 0.2;
          const squash = Math.sin(normP * Math.PI);
          mascotRoot.position.y = idleFloatY - squash * 0.12;
          mascotMesh.scale.set(1.0 + squash * 0.15, 1.0 - squash * 0.15, 1.0);
          shadowMesh.scale.set(1.0 + squash * 0.2, 1.0 + squash * 0.2, 1.0);
          shadowMat.opacity = 0.85;
        } else {
          // Jump finished - return to idle
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          mascotRoot.position.y = idleFloatY;
          mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
          shadowMesh.scale.set(1.0, 1.0, 1.0);
          shadowMat.opacity = 0.8;
        }
      } else {
        // Idle animation state
        mascotRoot.position.y = idleFloatY;
        mascotMesh.scale.set(idleStretchX, idleSquashY, 1.0);
        shadowMesh.scale.set(1.0, 1.0, 1.0);
        shadowMat.opacity = 0.8 - Math.abs(idleFloatY) * 0.5;
      }

      // --- ANIMATE 3D FLOATING SPARKLE STARS ---
      sparkles.forEach((sp) => {
        const isCelebratingBurst = isJumpingRef.current;
        const speedMultiplier = isCelebratingBurst ? 3.0 : 1.0;
        const radiusMultiplier = isCelebratingBurst ? 1.35 : 1.0;

        const curAngle = sp.baseAngle + elapsedTime * sp.speed * speedMultiplier;
        sp.mesh.position.x = Math.cos(curAngle) * sp.radiusX * radiusMultiplier;
        sp.mesh.position.z = Math.sin(curAngle) * sp.radiusZ * radiusMultiplier + 0.2;
        sp.mesh.position.y =
          sp.y + Math.sin(elapsedTime * 4 + sp.baseAngle) * 0.15 + (isCelebratingBurst ? 0.4 : 0);

        sp.mesh.rotation.y += 0.05 * speedMultiplier;
        sp.mesh.rotation.z += 0.03 * speedMultiplier;

        // Twinkle pulse
        const pulse = sp.baseScale * (0.85 + Math.sin(elapsedTime * 5 + sp.baseAngle) * 0.28);
        sp.mesh.scale.set(pulse, pulse * 1.35, pulse);
      });

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
      shadowGeom.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      sparkleStarGeom.dispose();
      sparkleMaterial.dispose();
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
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-xl transition-transform hover:scale-108 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Click Tara to jump & celebrate! 🌟"
    />
  );
}
