"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface FuteraMascot3DProps {
  className?: string;
  size?: number; // Canvas size in px
  isCelebrating?: boolean;
  isWaving?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * FuteraMascot3D - Real-Time Interactive Three.js Mascot (Tara)
 * Powered by user's 3D GLB Model (star-mascot-3d-model.glb):
 * - Real 3D PBR mesh loaded directly via Three.js GLTFLoader
 * - Real-time GPU Vertex Shader Hand-Wave: Bends and waves right hand to say hi!
 * - Real Three.js WebGL canvas with 3D perspective and mouse tracking
 * - Energetic spring physics (bouncy idle, squash & stretch)
 * - Celebratory 3D spring jump on answer selection or direct click
 * - Delicate glowing 4-point star sparkles (✦)
 */
export function FuteraMascot3D({
  className = "",
  size = 170,
  isCelebrating = false,
  isWaving = false,
  onClick,
  interactive = true,
}: FuteraMascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Jump animation state refs
  const jumpProgressRef = useRef(0);
  const isJumpingRef = useRef(false);
  const prevCelebratingRef = useRef(isCelebrating);

  // Waving animation state
  const isWavingRef = useRef(isWaving);
  useEffect(() => {
    isWavingRef.current = isWaving;
  }, [isWaving]);

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
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.05, 4.4);

    // --- 2. TRANSPARENT WEBGL RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.replaceChildren(renderer.domElement);

    // --- 3. STUDIO LIGHTING SETUP ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd4a359, 2.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    keyLight.position.set(-2.5, 3.5, 4.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff1cf, 1.3);
    fillLight.position.set(3.0, 1.0, 3.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd56b, 1.8);
    rimLight.position.set(1.2, 2.5, -3.0);
    scene.add(rimLight);

    // --- 4. MASCOT ROOT HIERARCHY ---
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    // Shader uniforms for GPU real-time hand-waving
    const waveUniforms = {
      uWaveTime: { value: 0 },
      uWaveIntensity: { value: 0 },
    };

    // Instant placeholder texture plane (ensures 0ms flicker while 3D mesh loads)
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load("/images/tara-mascot-exact.png");
    const planeGeom = new THREE.PlaneGeometry(2.4, 2.88);
    const planeMat = new THREE.MeshBasicMaterial({
      map: mascotTexture,
      transparent: true,
      depthWrite: false,
    });
    const placeholderMesh = new THREE.Mesh(planeGeom, planeMat);
    mascotRoot.add(placeholderMesh);

    // Load Real 3D GLB Model
    const gltfLoader = new GLTFLoader();
    let mascot3D: THREE.Group | null = null;

    gltfLoader.load(
      "/models/star-mascot-3d-model-opt.glb",
      (gltf) => {
        mascot3D = gltf.scene;

        // Auto-center and frame
        const box = new THREE.Box3().setFromObject(mascot3D);
        const center = box.getCenter(new THREE.Vector3());
        const bSize = box.getSize(new THREE.Vector3());

        mascot3D.position.x = -center.x;
        mascot3D.position.y = -center.y;
        mascot3D.position.z = -center.z;

        const maxDim = Math.max(bSize.x, bSize.y, bSize.z);
        const targetScale = 2.4 / maxDim;
        mascot3D.scale.setScalar(targetScale);

        // Inject GPU Vertex Shader for Hand Waving
        mascot3D.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(mat.roughness, 0.35);

              mat.onBeforeCompile = (shader) => {
                shader.uniforms.uWaveTime = waveUniforms.uWaveTime;
                shader.uniforms.uWaveIntensity = waveUniforms.uWaveIntensity;

                shader.vertexShader = `
                  uniform float uWaveTime;
                  uniform float uWaveIntensity;
                  ${shader.vertexShader}
                `;

                shader.vertexShader = shader.vertexShader.replace(
                  "#include <begin_vertex>",
                  `
                  #include <begin_vertex>
                  // GPU Right Arm & Hand Waving
                  if (transformed.x > 0.12 && transformed.y > 0.05) {
                    float armFactor = clamp((transformed.x - 0.12) / 0.13, 0.0, 1.0);
                    float wave = sin(uWaveTime * 14.0) * armFactor * uWaveIntensity;
                    transformed.y += wave * 0.14;
                    transformed.z += cos(uWaveTime * 14.0) * armFactor * 0.09 * uWaveIntensity;
                    transformed.x += sin(uWaveTime * 14.0 + 0.5) * armFactor * 0.04 * uWaveIntensity;
                  }
                  `
                );
              };
            }
          }
        });

        // Replace 2D plane with real 3D mesh
        mascotRoot.remove(placeholderMesh);
        placeholderMesh.geometry.dispose();
        mascotRoot.add(mascot3D);
      },
      undefined,
      (err) => {
        console.warn("Retaining fallback textured mascot plane:", err);
      }
    );

    // --- 5. TWO DELICATE GLOWING 4-POINT SPARKLE STARS (✦) ---
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 128;
    starCanvas.height = 128;
    const starCtx = starCanvas.getContext("2d");
    if (starCtx) {
      starCtx.clearRect(0, 0, 128, 128);
      const glowGrad = starCtx.createRadialGradient(64, 64, 0, 64, 64, 58);
      glowGrad.addColorStop(0, "rgba(255, 235, 130, 0.95)");
      glowGrad.addColorStop(0.35, "rgba(250, 204, 21, 0.55)");
      glowGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
      starCtx.fillStyle = glowGrad;
      starCtx.fillRect(0, 0, 128, 128);

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

    const leftStar = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), starMaterial);
    leftStar.position.set(-1.38, -0.4, 0.1);
    mascotRoot.add(leftStar);

    const rightStar = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), starMaterial);
    rightStar.position.set(1.32, 0.7, 0.1);
    mascotRoot.add(rightStar);

    // --- 6. MOUSE CURSOR 3D TRACKING ---
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

    // --- 7. ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let currentWaveIntensity = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      waveUniforms.uWaveTime.value = t;

      // Handle waving state
      const targetWave = isWavingRef.current ? 1.0 : 0.0;
      currentWaveIntensity = THREE.MathUtils.lerp(currentWaveIntensity, targetWave, 0.12);
      waveUniforms.uWaveIntensity.value = currentWaveIntensity;

      // Energetic springy idle
      const idleCadence = 3.2;
      let bounce = Math.sin(t * idleCadence) * 0.07;
      let idleSquashY = 1.0 + Math.sin(t * idleCadence * 2) * 0.025;
      let idleStretchX = 1.0 - Math.sin(t * idleCadence * 2) * 0.02;
      let idleTiltZ = Math.sin(t * (idleCadence * 0.5)) * 0.035;

      // When waving, lean playfully and bounce
      if (currentWaveIntensity > 0.05) {
        idleTiltZ = -0.06 + Math.sin(t * 7.0) * 0.08 * currentWaveIntensity;
        bounce += Math.abs(Math.sin(t * 7.0)) * 0.07 * currentWaveIntensity;
      }

      // Handle 3D Celebration Jump
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.045;
        const p = jumpProgressRef.current;

        if (p < 0.2) {
          const sq = p / 0.2;
          mascotRoot.scale.set(1.15, 0.85, 1.0);
          bounce -= 0.14 * sq;
        } else if (p < 0.8) {
          const normP = (p - 0.2) / 0.6;
          const jumpHeight = Math.sin(normP * Math.PI) * 1.15;
          bounce += jumpHeight;

          const stretch = 1.0 + Math.sin(normP * Math.PI) * 0.15;
          mascotRoot.scale.set(1 / stretch, stretch, 1.0);
          mascotRoot.rotation.z = idleTiltZ + Math.sin(normP * Math.PI) * 0.12;
        } else if (p < 1.0) {
          const normP = (p - 0.8) / 0.2;
          const squash = Math.sin(normP * Math.PI);
          bounce -= squash * 0.08;
          mascotRoot.scale.set(1.0 + squash * 0.1, 1.0 - squash * 0.1, 1.0);
        } else {
          isJumpingRef.current = false;
          jumpProgressRef.current = 0;
          mascotRoot.scale.set(idleStretchX, idleSquashY, 1.0);
        }
      } else {
        mascotRoot.scale.set(idleStretchX, idleSquashY, 1.0);
      }

      // Apply transforms
      mascotRoot.position.y = bounce;
      mascotRoot.rotation.z = idleTiltZ;
      mascotRoot.rotation.y = THREE.MathUtils.lerp(
        mascotRoot.rotation.y,
        pointerX + (currentWaveIntensity > 0.1 ? 0.15 : 0),
        0.08
      );
      mascotRoot.rotation.x = THREE.MathUtils.lerp(mascotRoot.rotation.x, pointerY, 0.08);

      // Animate star sparkles
      const starSpeed = currentWaveIntensity > 0.1 ? 7.5 : 4.0;
      const starPulse1 = 0.85 + Math.sin(t * starSpeed) * 0.22;
      leftStar.scale.set(starPulse1, starPulse1, 1);
      leftStar.rotation.z += 0.018;

      const starPulse2 = 0.9 + Math.sin(t * starSpeed + 1.2) * 0.2;
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
      planeMat.dispose();
      starTexture.dispose();
      mascotTexture.dispose();
      container.replaceChildren();
    };
  }, [size, interactive]);

  // Click directly on Tara to wave and say hi!
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
      title="Click Tara to wave and celebrate"
    />
  );
}
