"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface FuteraMascot3DProps {
  className?: string;
  size?: number; // Size in px (e.g. 180, 240, 320)
  isCelebrating?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * FuteraMascot3D - Real-time Interactive Three.js 3D Platform Mascot (Tara)
 * Recreated with precision 3D geometries based on Pic 3:
 * - Puffy 5-pointed star hoodie in warm golden pastel yellow
 * - Chubby peach face with closed arched smiling eyes and rosy cheeks
 * - White hoodie drawstrings with dangling mini golden star toggles
 * - Chubby raised celebrating arms and jumping feet
 * - Orbiting twinkling 3D star sparkles
 * - Mouse cursor tracking, idle breathing float, and dynamic 3D celebratory jumps
 */
export function FuteraMascot3D({
  className = "",
  size = 200,
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

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    // --- 2. RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent
    renderer.shadowMap.enabled = false;
    container.replaceChildren(renderer.domElement);

    // --- 3. LIGHTING ---
    // Warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 1.2);
    scene.add(ambientLight);

    // Main key light (Warm sunny light from top-left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Fill light (Soft golden fill from right)
    const fillLight = new THREE.DirectionalLight(0xfde68a, 1.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Back rim light (Sky blue back-rim like Pic 3)
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // --- 4. ROOT MASCOT HIERARCHY ---
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    // --- 5. MATERIALS ---
    // Star Hoodie Material (Pastel Golden Yellow with soft clearcoat)
    const hoodieMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.32,
      metalness: 0.05,
    });

    // Face Skin Material (Soft warm peach cream)
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffebd9,
      roughness: 0.28,
      metalness: 0.02,
    });

    // Dark Warm Cocoa for eyes and mouth
    const featureMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d1c16,
      roughness: 0.4,
    });

    // Rosy Pink Cheeks
    const blushMaterial = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.5,
      transparent: true,
      opacity: 0.75,
    });

    // Bright Sparkle Gold
    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.15,
      metalness: 0.1,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
    });

    // --- 6. GEOMETRIES ---

    // A. Puffy 5-Pointed Star Hoodie Body
    const starShape = new THREE.Shape();
    const starPoints = 5;
    const outerR = 1.75;
    const innerR = 0.95;
    const step = (Math.PI * 2) / (starPoints * 2);

    const starCoords: THREE.Vector2[] = [];
    for (let i = 0; i < starPoints * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step + Math.PI / 2; // Point vertex upwards
      starCoords.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }

    starShape.moveTo(starCoords[0].x, starCoords[0].y);
    for (let i = 0; i < starCoords.length; i++) {
      const curr = starCoords[i];
      const next = starCoords[(i + 1) % starCoords.length];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      starShape.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }
    starShape.closePath();

    const starExtrudeSettings = {
      steps: 2,
      depth: 0.85,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.4,
      bevelSegments: 8,
    };
    const starGeom = new THREE.ExtrudeGeometry(starShape, starExtrudeSettings);
    starGeom.center();
    const starHoodMesh = new THREE.Mesh(starGeom, hoodieMaterial);
    starHoodMesh.position.set(0, 0, -0.2);
    mascotRoot.add(starHoodMesh);

    // B. Chubby Peach Face Sphere
    const faceGeom = new THREE.SphereGeometry(0.85, 32, 32);
    faceGeom.scale(1.05, 0.98, 0.75);
    const faceMesh = new THREE.Mesh(faceGeom, skinMaterial);
    faceMesh.position.set(0, 0, 0.38);
    mascotRoot.add(faceMesh);

    // C. Hoodie Face Opening Rim (Gold trim around face)
    const rimGeom = new THREE.TorusGeometry(0.88, 0.1, 16, 36);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMaterial);
    rimMesh.position.set(0, 0, 0.42);
    mascotRoot.add(rimMesh);

    // D. Arched Closed Smiling Eyes (^ ^)
    const eyeGeom = new THREE.TorusGeometry(0.12, 0.026, 8, 18, Math.PI);
    eyeGeom.rotateZ(Math.PI); // Invert to arch upward

    const leftEye = new THREE.Mesh(eyeGeom, featureMaterial);
    leftEye.position.set(-0.28, 0.12, 0.98);
    mascotRoot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, featureMaterial);
    rightEye.position.set(0.28, 0.12, 0.98);
    mascotRoot.add(rightEye);

    // E. Sweet Open Smiling Mouth
    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.16, 0);
    mouthShape.quadraticCurveTo(0, -0.2, 0.16, 0);
    mouthShape.quadraticCurveTo(0, -0.05, -0.16, 0);
    mouthShape.closePath();

    const mouthGeom = new THREE.ShapeGeometry(mouthShape);
    const mouthMesh = new THREE.Mesh(mouthGeom, featureMaterial);
    mouthMesh.position.set(0, -0.12, 0.98);
    mascotRoot.add(mouthMesh);

    // Tongue accent
    const tongueGeom = new THREE.SphereGeometry(0.07, 12, 12);
    const tongueMaterial = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    const tongueMesh = new THREE.Mesh(tongueGeom, tongueMaterial);
    tongueMesh.position.set(0, -0.18, 0.985);
    mascotRoot.add(tongueMesh);

    // F. Rosy Blushing Cheeks
    const blushGeom = new THREE.SphereGeometry(0.18, 16, 16);
    blushGeom.scale(1.2, 0.65, 0.25);

    const leftBlush = new THREE.Mesh(blushGeom, blushMaterial);
    leftBlush.position.set(-0.48, -0.05, 0.92);
    mascotRoot.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeom, blushMaterial);
    rightBlush.position.set(0.48, -0.05, 0.92);
    mascotRoot.add(rightBlush);

    // G. White Hoodie Drawstrings with Mini Golden Stars
    const stringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
    });
    const stringGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);

    const leftString = new THREE.Mesh(stringGeom, stringMaterial);
    leftString.position.set(-0.2, -0.58, 0.62);
    mascotRoot.add(leftString);

    const rightString = new THREE.Mesh(stringGeom, stringMaterial);
    rightString.position.set(0.2, -0.58, 0.62);
    mascotRoot.add(rightString);

    // Mini Golden Stars at drawstring tips
    const miniStarShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.08 : 0.04;
      const a = (i * Math.PI) / 5 + Math.PI / 2;
      if (i === 0) miniStarShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else miniStarShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    miniStarShape.closePath();
    const miniStarGeom = new THREE.ExtrudeGeometry(miniStarShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    miniStarGeom.center();

    const leftStarTip = new THREE.Mesh(miniStarGeom, sparkleMaterial);
    leftStarTip.position.set(-0.2, -0.83, 0.62);
    mascotRoot.add(leftStarTip);

    const rightStarTip = new THREE.Mesh(miniStarGeom, sparkleMaterial);
    rightStarTip.position.set(0.2, -0.83, 0.62);
    mascotRoot.add(rightStarTip);

    // H. Raised Celebrating Arms
    const armGeom = new THREE.CapsuleGeometry(0.2, 0.55, 8, 16);

    const leftArm = new THREE.Mesh(armGeom, hoodieMaterial);
    leftArm.position.set(-1.15, 0.45, 0.2);
    leftArm.rotation.set(0.2, 0, Math.PI / 3.8);
    mascotRoot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, hoodieMaterial);
    rightArm.position.set(1.15, 0.45, 0.2);
    rightArm.rotation.set(0.2, 0, -Math.PI / 3.8);
    mascotRoot.add(rightArm);

    // I. Stubby Jumping Feet
    const footGeom = new THREE.SphereGeometry(0.25, 16, 16);
    footGeom.scale(1, 1.25, 1.1);

    const leftFoot = new THREE.Mesh(footGeom, hoodieMaterial);
    leftFoot.position.set(-0.55, -1.35, 0.05);
    mascotRoot.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeom, hoodieMaterial);
    rightFoot.position.set(0.55, -1.2, 0.15); // Slightly raised foot like in mid-jump!
    mascotRoot.add(rightFoot);

    // J. Orbiting Twinkling 3D Star Sparkles
    const sparkleStarGeom = new THREE.OctahedronGeometry(0.14, 0);
    sparkleStarGeom.scale(0.8, 1.2, 0.8);

    const sparkles: { mesh: THREE.Mesh; baseAngle: number; speed: number; radius: number; y: number }[] = [];
    const sparkleConfigs = [
      { baseAngle: 0.5, speed: 1.2, radius: 1.8, y: 0.7 },
      { baseAngle: 2.8, speed: 0.9, radius: 1.7, y: -0.5 },
      { baseAngle: 4.6, speed: 1.5, radius: 1.6, y: 0.2 },
    ];

    sparkleConfigs.forEach((cfg) => {
      const spMesh = new THREE.Mesh(sparkleStarGeom, sparkleMaterial);
      mascotRoot.add(spMesh);
      sparkles.push({ mesh: spMesh, ...cfg });
    });

    // --- 7. MOUSE CURSOR TRACKING ---
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - (rect.left + rect.width / 2);
      const clientY = e.clientY - (rect.top + rect.height / 2);

      // Clamp target rotation within gentle bounds (+/- 15 degrees)
      targetRotY = THREE.MathUtils.clamp(clientX / 300, -0.35, 0.35);
      targetRotX = THREE.MathUtils.clamp(-clientY / 300, -0.25, 0.25);
    };

    window.addEventListener("pointermove", handlePointerMove);

    // --- 8. ANIMATION LOOP ---
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow interpolation (slerp-like)
      mascotRoot.rotation.x = THREE.MathUtils.lerp(mascotRoot.rotation.x, targetRotX, 0.08);
      mascotRoot.rotation.y = THREE.MathUtils.lerp(mascotRoot.rotation.y, targetRotY, 0.08);

      // Idle soothing breathing float
      const idleFloatY = Math.sin(elapsedTime * 2.4) * 0.09;
      const idleTiltZ = Math.sin(elapsedTime * 1.8) * 0.04;
      mascotRoot.rotation.z = idleTiltZ;

      // Handle 3D Celebration Jump
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.045;
        const p = jumpProgressRef.current;

        if (p < 1.0) {
          // Jump Arc: sin curve up, with playful 360 spin
          const jumpHeight = Math.sin(p * Math.PI) * 0.9;
          mascotRoot.position.y = idleFloatY + jumpHeight;
          mascotRoot.rotation.y += Math.sin(p * Math.PI) * 0.5;

          // Arms wave excitedly during jump
          leftArm.rotation.z = Math.PI / 3.8 + Math.sin(p * Math.PI * 4) * 0.25;
          rightArm.rotation.z = -Math.PI / 3.8 - Math.sin(p * Math.PI * 4) * 0.25;
        } else {
          // Jump finished
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          mascotRoot.position.y = idleFloatY;
          leftArm.rotation.z = Math.PI / 3.8;
          rightArm.rotation.z = -Math.PI / 3.8;
        }
      } else {
        mascotRoot.position.y = idleFloatY;
      }

      // Animate floating sparkles
      sparkles.forEach((sp) => {
        const curAngle = sp.baseAngle + elapsedTime * sp.speed;
        sp.mesh.position.x = Math.cos(curAngle) * sp.radius;
        sp.mesh.position.z = Math.sin(curAngle) * sp.radius * 0.6 + 0.3;
        sp.mesh.position.y = sp.y + Math.sin(elapsedTime * 3 + sp.baseAngle) * 0.12;

        // Sparkle rotation & pulse
        sp.mesh.rotation.y += 0.04;
        sp.mesh.rotation.z += 0.02;
        const scalePulse = 0.85 + Math.sin(elapsedTime * 4 + sp.baseAngle) * 0.25;
        sp.mesh.scale.set(scalePulse, scalePulse * 1.3, scalePulse);
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      starGeom.dispose();
      faceGeom.dispose();
      rimGeom.dispose();
      eyeGeom.dispose();
      mouthGeom.dispose();
      blushGeom.dispose();
      stringGeom.dispose();
      armGeom.dispose();
      footGeom.dispose();
      sparkleStarGeom.dispose();
      hoodieMaterial.dispose();
      skinMaterial.dispose();
      featureMaterial.dispose();
      blushMaterial.dispose();
      sparkleMaterial.dispose();
      container.replaceChildren();
    };
  }, [size, interactive]);

  const handleMascotClick = () => {
    isJumpingRef.current = true;
    jumpProgressRef.current = 0;
    if (onClick) onClick();
  };

  return (
    <div
      ref={mountRef}
      onClick={handleMascotClick}
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-xl transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Click Tara to play!"
    />
  );
}
