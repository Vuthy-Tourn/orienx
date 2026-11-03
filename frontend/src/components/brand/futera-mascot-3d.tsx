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
 * FuteraMascot3D - Real-Time Interactive Procedural Three.js Mascot (Tara)
 * Rebuilt to 100% match the uploaded 3D star-hoodie character:
 * - Puffy 5-pointed star hoodie in warm velvet plush golden yellow
 * - Joyful jumping pose with raised celebratory arms (\ ^ o ^ /) and kicked foot
 * - Chubby peach baby face with arched closed eyes, open smile, and rosy cheeks
 * - White hoodie drawstrings with dangling miniature 3D star pendants
 * - Two delicate floating 4-pointed golden sparkle stars (✦)
 * - Ultra-playful bouncy spring idle (squash & stretch), cursor tracking, and celebration jumps
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
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.05, 7.2);

    // --- 2. TRANSPARENT WEBGL RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setClearColor(0x000000, 0); // 100% transparent
    container.replaceChildren(renderer.domElement);

    // --- 3. WARM PLUSH STUDIO LIGHTING ---
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd4a359, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(-3.5, 4.5, 5.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff3cc, 1.4);
    fillLight.position.set(4, 1.5, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe285, 1.8);
    rimLight.position.set(2, 3, -3.5);
    scene.add(rimLight);

    // --- 4. MATERIALS (Soft clay & plush velvet feel) ---
    const mat = (color: string, roughness = 0.38, metalness = 0.02) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const yellow = mat("#fed049", 0.36);
    const yellowLight = mat("#ffe680", 0.32);
    const yellowShade = mat("#f5be38", 0.42);
    const peach = mat("#ffe2cb", 0.45);
    const blush = new THREE.MeshBasicMaterial({ color: "#f87171", transparent: true, opacity: 0.58 });
    const dark = mat("#3c1e18", 0.6); // Warm cocoa
    const tongueMat = mat("#f43f5e", 0.4);
    const whiteCord = mat("#ffffff", 0.45);
    const starMat = new THREE.MeshStandardMaterial({
      color: "#ffe55a",
      emissive: "#f59e0b",
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.1,
    });

    // --- 5. CHARACTER ROOT HIERARCHY ---
    const mascot = new THREE.Group();
    scene.add(mascot);
    const character = new THREE.Group();
    mascot.add(character);

    // Geometry helpers
    function sphere(
      parent: THREE.Group,
      name: string,
      position: [number, number, number],
      scale: [number, number, number],
      material: THREE.Material,
      segments = 36
    ) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, segments, Math.max(20, Math.floor(segments * 0.7))),
        material
      );
      mesh.name = name;
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      parent.add(mesh);
      return mesh;
    }

    function capsule(
      parent: THREE.Group,
      name: string,
      position: [number, number, number],
      radius: number,
      length: number,
      material: THREE.Material,
      rotation: [number, number, number] = [0, 0, 0]
    ) {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 20), material);
      mesh.name = name;
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      parent.add(mesh);
      return mesh;
    }

    function line(
      parent: THREE.Group,
      points: [number, number, number][],
      radius: number,
      material: THREE.Material
    ) {
      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 8, false), material);
      parent.add(mesh);
      return mesh;
    }

    // --- A. PUFFY 5-POINTED STAR HOODIE & HEAD ---
    const hood = new THREE.Group();
    hood.position.set(0, 0.42, 0);
    character.add(hood);

    // Central Hood Dome
    sphere(hood, "hood-center", [0, 0.05, -0.06], [0.94, 0.90, 0.62], yellow);

    // Point 1: Top Star Point
    sphere(hood, "star-point-top", [0, 0.78, -0.05], [0.46, 0.58, 0.42], yellowLight);

    // Points 2 & 5 upper corners of star hood
    sphere(hood, "star-point-upper-left", [-0.68, 0.48, -0.04], [0.42, 0.46, 0.38], yellow);
    sphere(hood, "star-point-upper-right", [0.68, 0.48, -0.04], [0.42, 0.46, 0.38], yellow);

    // Cheek curves
    sphere(hood, "hood-cheek-left", [-0.72, -0.05, -0.02], [0.40, 0.46, 0.36], yellow);
    sphere(hood, "hood-cheek-right", [0.72, -0.05, -0.02], [0.40, 0.46, 0.36], yellow);

    // Raised padded hood rim
    sphere(hood, "face-rim", [0, 0.05, 0.36], [0.66, 0.64, 0.16], yellowShade);

    // Chubby peach baby face sphere
    sphere(hood, "face", [0, 0.05, 0.44], [0.60, 0.58, 0.22], peach);

    // Rosy glowing cheeks
    sphere(hood, "left-blush", [-0.34, -0.05, 0.55], [0.15, 0.085, 0.015], blush, 24);
    sphere(hood, "right-blush", [0.34, -0.05, 0.55], [0.15, 0.085, 0.015], blush, 24);

    // Joyful arched smiling eyes (^ ^)
    line(
      hood,
      [
        [-0.30, 0.13, 0.56],
        [-0.24, 0.20, 0.58],
        [-0.16, 0.20, 0.58],
        [-0.10, 0.13, 0.56],
      ],
      0.026,
      dark
    );

    line(
      hood,
      [
        [0.10, 0.13, 0.56],
        [0.16, 0.20, 0.58],
        [0.24, 0.20, 0.58],
        [0.30, 0.13, 0.56],
      ],
      0.026,
      dark
    );

    // Open happy mouth with tongue
    sphere(hood, "smile-mouth", [0, -0.12, 0.565], [0.11, 0.13, 0.028], dark, 24);
    sphere(hood, "smile-tongue", [0, -0.19, 0.585], [0.065, 0.045, 0.015], tongueMat, 20);

    // --- B. CHUBBY BELLY & CELEBRATORY RAISED ARMS (\ ^ o ^ /) ---
    sphere(character, "belly", [0, -0.32, 0.02], [0.68, 0.72, 0.54], yellow);

    // Left Arm (Raised up-left in celebration)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.52, 0.12, 0.05);
    character.add(leftArm);
    capsule(leftArm, "left-sleeve", [-0.18, 0.26, 0], 0.24, 0.48, yellow, [0, 0, Math.PI * 0.25]);
    sphere(leftArm, "left-mitten", [-0.34, 0.54, 0.04], [0.22, 0.24, 0.22], yellowLight);

    // Right Arm (Raised up-right in celebration)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.52, 0.12, 0.05);
    character.add(rightArm);
    capsule(rightArm, "right-sleeve", [0.18, 0.26, 0], 0.24, 0.48, yellow, [0, 0, -Math.PI * 0.25]);
    sphere(rightArm, "right-mitten", [0.34, 0.54, 0.04], [0.22, 0.24, 0.22], yellowLight);

    // --- C. JUMPING LEGS & FEET ---
    // Left leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.28, -0.76, 0.0);
    character.add(leftLeg);
    capsule(leftLeg, "left-leg", [-0.08, -0.25, 0], 0.22, 0.42, yellow, [0, 0, 0.18]);
    sphere(leftLeg, "left-foot", [-0.14, -0.52, 0.08], [0.24, 0.26, 0.30], yellowLight);

    // Right leg (kicked forward in mid-jump)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.32, -0.66, 0.12);
    character.add(rightLeg);
    capsule(rightLeg, "right-leg", [0.12, -0.16, 0.12], 0.23, 0.38, yellow, [-0.4, 0, -0.35]);
    sphere(rightLeg, "right-foot", [0.24, -0.35, 0.28], [0.26, 0.28, 0.34], yellowLight);

    // --- D. HOODIE WHITE DRAWSTRINGS & MINI 3D STAR PENDANTS ---
    function createMiniStarGeom() {
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 0.065 : 0.032;
        const a = (i * Math.PI) / 5 + Math.PI / 2;
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false });
    }

    const miniStarGeom = createMiniStarGeom();
    miniStarGeom.center();

    for (const x of [-0.16, 0.16]) {
      line(
        character,
        [
          [x, 0.02, 0.46],
          [x, -0.22, 0.48],
          [x, -0.42, 0.46],
        ],
        0.022,
        whiteCord
      );

      const starMesh = new THREE.Mesh(miniStarGeom, starMat);
      starMesh.position.set(x, -0.46, 0.46);
      character.add(starMesh);
    }

    // --- E. THE TWO FLOATING 4-POINTED GLOWING SPARKLES (✦) ---
    function createSparkleMesh(scale: number) {
      const shape = new THREE.Shape();
      shape.moveTo(0, scale);
      shape.quadraticCurveTo(scale * 0.16, scale * 0.16, scale, 0);
      shape.quadraticCurveTo(scale * 0.16, -scale * 0.16, 0, -scale);
      shape.quadraticCurveTo(-scale * 0.16, -scale * 0.16, -scale, 0);
      shape.quadraticCurveTo(-scale * 0.16, scale * 0.16, 0, scale);
      shape.closePath();
      return new THREE.Mesh(new THREE.ShapeGeometry(shape), starMat);
    }

    const sparkleLeft = createSparkleMesh(0.12);
    sparkleLeft.position.set(-1.35, -0.38, 0.25);
    mascot.add(sparkleLeft);

    const sparkleRight = createSparkleMesh(0.14);
    sparkleRight.position.set(1.30, 0.85, 0.25);
    mascot.add(sparkleRight);

    const sparkles = [
      { mesh: sparkleLeft, baseY: -0.38, speed: 2.2, phase: 0 },
      { mesh: sparkleRight, baseY: 0.85, speed: 2.6, phase: 1.8 },
    ];

    // --- F. MOUSE CURSOR 3D TRACKING ---
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

    // --- G. ULTRA-PLAYFUL ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Energetic springy idle (squash & stretch)
      const idleSpeed = 3.2;
      let bounce = Math.sin(t * idleSpeed) * 0.09;
      let sway = Math.sin(t * (idleSpeed * 0.5)) * 0.05;

      let leftArmRotZ = Math.PI * 0.04 + Math.sin(t * idleSpeed) * 0.08;
      let rightArmRotZ = -Math.PI * 0.04 - Math.sin(t * idleSpeed) * 0.08;
      let rightLegRotX = -0.4 + Math.sin(t * idleSpeed) * 0.08;

      // Handle 3D Celebration Jump
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.045;
        const p = jumpProgressRef.current;

        if (p < 1.0) {
          // Jump curve
          const jumpHeight = Math.sin(p * Math.PI) * 0.85;
          bounce += jumpHeight;

          const stretch = 1.0 + Math.sin(p * Math.PI) * 0.14;
          character.scale.set(1 / stretch, stretch, 1.0);

          leftArmRotZ = 0.25 + Math.sin(p * Math.PI * 4) * 0.25;
          rightArmRotZ = -0.25 - Math.sin(p * Math.PI * 4) * 0.25;
          sway = Math.sin(p * Math.PI * 2) * 0.15;
        } else {
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          character.scale.set(1, 1, 1);
        }
      } else {
        character.scale.set(1, 1, 1);
      }

      // Smooth cursor follow
      mascot.position.y = bounce;
      mascot.rotation.z = sway;
      mascot.rotation.y = THREE.MathUtils.lerp(
        mascot.rotation.y,
        pointerX + Math.sin(t * 0.8) * 0.04,
        0.08
      );
      mascot.rotation.x = THREE.MathUtils.lerp(mascot.rotation.x, pointerY, 0.08);

      leftArm.rotation.z = leftArmRotZ;
      rightArm.rotation.z = rightArmRotZ;
      rightLeg.rotation.x = rightLegRotX;

      // Sparkling star pulses
      sparkles.forEach((s) => {
        s.mesh.rotation.z = Math.sin(t * s.speed + s.phase) * 0.3;
        s.mesh.position.y = s.baseY + Math.sin(t * 3 + s.phase) * 0.08;
        const pulse = 0.9 + Math.sin(t * 4 + s.phase) * 0.2;
        s.mesh.scale.set(pulse, pulse, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      miniStarGeom.dispose();
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
      className={`relative inline-block cursor-pointer select-none filter drop-shadow-[0_12px_24px_rgba(247,206,77,0.35)] transition-transform hover:scale-108 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Click Tara to jump & celebrate! 🌟"
    />
  );
}
