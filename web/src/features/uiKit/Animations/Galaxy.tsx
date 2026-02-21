'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
// @ts-expect-error - glslify-loader is not supported by TS
import galaxyVertexShader from './vertex.glsl';
// @ts-expect-error - glslify-loader is not supported by TS
import galaxyFragmentShader from './fragment.glsl';
import { isBot } from '@/libs/isBot';

interface GalaxyParameters {
  count: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;
  insideColor: string;
  outsideColor: string;
  bgColor: string;
}

const HEIGHT = 1230;

const Galaxy: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);

  const init = async () => {
    const isServer = typeof window === 'undefined';
    if (isServer) return;

    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      return;
    }

    const isBotUser = isBot(`${navigator.userAgent}`);
    if (!isBotUser) {
      setIsSupported(true);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      init();
    }, 100);
  }, []);

  const mountRef = useRef<HTMLDivElement>(null);
  const [parameters] = useState<GalaxyParameters>({
    count: 50000,
    radius: 5,
    branches: 4,
    spin: 1,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#fa8500',
    outsideColor: '#05acff',
    bgColor: '#0a121e',
  });

  useEffect(() => {
    if (!mountRef.current || !isSupported) return;
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(3, 4.75, 3);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(parameters.bgColor));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Galaxy
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let points: THREE.Points | null = null;

    const generateGalaxy = () => {
      if (points !== null) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
      }

      geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);
      const scales = new Float32Array(parameters.count);
      const randomness = new Float32Array(parameters.count * 3);

      const insideColor = new THREE.Color(parameters.insideColor);
      const outsideColor = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        positions[i3] = Math.cos(branchAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle) * radius;

        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        scales[i] = Math.random();
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 3));

      material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        transparent: true,
        uniforms: {
          uSize: { value: 30 * renderer.getPixelRatio() },
          uTime: { value: 0 },
        },
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    generateGalaxy();

    const isNeedGUI = false;
    let gui: GUI;
    if (isNeedGUI) {
      gui = new GUI();
      gui.add(parameters, 'count', 100, 1000000, 100).onChange(generateGalaxy);
      gui.add(parameters, 'radius', 0.01, 20, 0.01).onChange(generateGalaxy);
      gui.add(parameters, 'branches', 2, 20, 1).onChange(generateGalaxy);
      gui.add(parameters, 'randomness', 0, 2, 0.001).onChange(generateGalaxy);
      gui.add(parameters, 'randomnessPower', 1, 10, 0.001).onChange(generateGalaxy);
      gui.addColor(parameters, 'insideColor').onChange(generateGalaxy);
      gui.addColor(parameters, 'outsideColor').onChange(generateGalaxy);
      gui
        .addColor(parameters, 'bgColor')
        .onChange((value: string) => renderer.setClearColor(new THREE.Color(value)));
    }

    // Resize handler
    const handleResize = () => {
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, HEIGHT);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime() / 10 + 20;

      if (material) {
        material.uniforms.uTime.value = elapsedTime;
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (isNeedGUI && gui) {
        gui.destroy();
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry?.dispose();
      material?.dispose();
      renderer.dispose();
    };
  }, [parameters, isSupported]);

  return <div ref={mountRef} />;
};

export default Galaxy;
