'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isBot } from '@/libs/isBot';
// @ts-expect-error - glslify-loader is not supported by TS
import starVertexShader from './starField.vert.glsl';
// @ts-expect-error - glslify-loader is not supported by TS
import starFragmentShader from './starField.frag.glsl';

const BG_COLOR = '#10131a';

function createStarMaterial(
  renderer: THREE.WebGLRenderer,
  size: number,
  spin: number,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    uniforms: {
      uSize: { value: size },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uTime: { value: 0 },
      uSpin: { value: spin },
    },
  });
}

function fillSpiralGalaxy(
  count: number,
  radius: number,
): {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  twinkles: Float32Array;
  seeds: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const twinkles = new Float32Array(count);
  const seeds = new Float32Array(count);

  const inner = new THREE.Color('#fff4e4');
  const warm = new THREE.Color('#ffc48a');
  const cool = new THREE.Color('#d4e4ff');
  const outer = new THREE.Color('#8eb4ff');
  const white = new THREE.Color('#f5f8ff');
  const branches = 2;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const rNorm = Math.pow(Math.random(), 0.52);
    const r = rNorm * radius;
    const arm = (i % branches) / branches;
    const spin = r * 0.92;
    const spread = Math.pow(Math.random(), 1.7) * (0.18 + rNorm * 0.55);
    const sign = Math.random() < 0.5 ? -1 : 1;
    const angle = arm * Math.PI * 2 + spin + sign * spread;

    positions[i3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.06;
    positions[i3 + 1] = (Math.random() - 0.5) * 0.2 * (0.25 + rNorm);
    positions[i3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.06;

    const color = white.clone();
    if (rNorm < 0.22) {
      color.copy(inner).lerp(warm, Math.random() * 0.8);
    } else if (Math.random() > 0.58) {
      color.copy(outer).lerp(cool, Math.random());
    } else {
      color.copy(warm).lerp(cool, Math.random() * 0.7);
    }

    const dim = 0.32 + Math.random() * 0.48;
    colors[i3] = color.r * dim;
    colors[i3 + 1] = color.g * dim;
    colors[i3 + 2] = color.b * dim;

    scales[i] = Math.pow(Math.random(), 2.9) * 1.55 + 0.12;
    if (rNorm < 0.1) {
      scales[i] *= 1.4;
    }
    if (Math.random() > 0.993) {
      scales[i] *= 2.2;
    }

    twinkles[i] = 0.12 + Math.random() * 0.5;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  return { positions, colors, scales, twinkles, seeds };
}

function fillBackgroundStars(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const twinkles = new Float32Array(count);
  const seeds = new Float32Array(count);

  const cool = new THREE.Color('#c9d8ff');
  const white = new THREE.Color('#f4f7ff');
  const warm = new THREE.Color('#ffe6c4');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * (0.35 + Math.random() * 0.65);

    positions[i3] = Math.sin(phi) * Math.cos(theta) * r;
    positions[i3 + 1] = Math.cos(phi) * r * 0.72;
    positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

    const color = Math.random() > 0.88 ? warm : Math.random() > 0.45 ? cool : white;
    const dim = 0.28 + Math.random() * 0.5;
    colors[i3] = color.r * dim;
    colors[i3 + 1] = color.g * dim;
    colors[i3 + 2] = color.b * dim;

    scales[i] = Math.pow(Math.random(), 3.4) * 0.85 + 0.08;
    if (Math.random() > 0.985) {
      scales[i] *= 2.4;
    }
    twinkles[i] = 0.2 + Math.random() * 0.7;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  return { positions, colors, scales, twinkles, seeds };
}

function makePoints(
  data: ReturnType<typeof fillSpiralGalaxy>,
  material: THREE.ShaderMaterial,
): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(data.scales, 1));
  geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(data.twinkles, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(data.seeds, 1));
  return new THREE.Points(geometry, material);
}

function makeGlowTexture(inner: string, mid: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.28, mid);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const StarFieldBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === 'undefined') return;
    if (isBot(navigator.userAgent)) return;

    const canvasProbe = document.createElement('canvas');
    const gl =
      canvasProbe.getContext('webgl2') ||
      canvasProbe.getContext('webgl') ||
      canvasProbe.getContext('experimental-webgl');
    if (!gl) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    const isNarrow = window.innerWidth < 1100;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
    const cameraX = isNarrow ? 0 : 0.35;
    const cameraY = isNarrow ? 2.1 : 2.55;
    const cameraZ = isNarrow ? 9.6 : 11.2;
    const lookX = isNarrow ? 0.2 : 2.4;
    const lookY = isNarrow ? -0.45 : -0.7;
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(lookX, lookY, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(new THREE.Color(BG_COLOR));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.75));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1.4s ease';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const galaxyCount = isMobile ? 6500 : 16000;
    const fieldCount = isMobile ? 1800 : 3200;

    const galaxyMaterial = createStarMaterial(renderer, isMobile ? 52 : 68, 0.042);
    const fieldMaterial = createStarMaterial(renderer, isMobile ? 28 : 36, 0);

    const galaxy = makePoints(fillSpiralGalaxy(galaxyCount, 5.8), galaxyMaterial);
    galaxy.rotation.x = -0.16;
    galaxy.rotation.z = 0.06;
    galaxy.position.set(isNarrow ? 0.35 : 2.9, isNarrow ? -0.7 : -1.05, -0.2);

    const field = makePoints(fillBackgroundStars(fieldCount, 18), fieldMaterial);

    const galaxyGroup = new THREE.Group();
    galaxyGroup.add(galaxy);

    const coreWarm = makeGlowTexture('rgba(255, 236, 210, 0.55)', 'rgba(255, 176, 110, 0.14)');
    const coreCool = makeGlowTexture('rgba(210, 228, 255, 0.28)', 'rgba(90, 130, 200, 0.08)');

    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreWarm,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.7,
      }),
    );
    core.scale.set(2.1, 2.1, 1);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreCool,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.32,
      }),
    );
    halo.scale.set(4.8, 3.6, 1);

    galaxyGroup.add(core);
    galaxyGroup.add(halo);
    scene.add(galaxyGroup);
    scene.add(field);

    const setSize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || 800;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.75);
      renderer.setPixelRatio(pixelRatio);
      galaxyMaterial.uniforms.uPixelRatio.value = pixelRatio;
      fieldMaterial.uniforms.uPixelRatio.value = pixelRatio;
    };
    setSize();

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(mount);

    const clock = new THREE.Clock();
    let frame = 0;
    let visible = true;
    let revealed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.02 },
    );
    observer.observe(mount);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const time = reduceMotion ? 0 : elapsed;

      galaxyMaterial.uniforms.uTime.value = time;
      fieldMaterial.uniforms.uTime.value = time;

      if (!reduceMotion) {
        galaxyGroup.rotation.y = elapsed * 0.01;
        field.rotation.y = elapsed * 0.0035;
        camera.position.x = cameraX + Math.sin(elapsed * 0.04) * 0.1;
        camera.position.y = cameraY + Math.cos(elapsed * 0.032) * 0.06;
        camera.lookAt(lookX, lookY, 0);
      }

      renderer.render(scene, camera);

      if (!revealed) {
        revealed = true;
        renderer.domElement.style.opacity = '1';
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      galaxy.geometry.dispose();
      field.geometry.dispose();
      galaxyMaterial.dispose();
      fieldMaterial.dispose();
      coreWarm.dispose();
      coreCool.dispose();
      (core.material as THREE.SpriteMaterial).dispose();
      (halo.material as THREE.SpriteMaterial).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
};
