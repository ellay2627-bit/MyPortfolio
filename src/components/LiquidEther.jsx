'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  mouseForce = 23,
  cursorSize = 100,
  isViscous = true,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.7,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6,
  color0 = '#4ec80c',
  color1 = '#1fc79e',
  color2 = '#00ECB2',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const autoDemoRef = useRef({ x: 0, y: 0, direction: { x: 1, y: 1 } });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 0, 1000
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.backgroundColor = '#000E0C';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_color0: { value: new THREE.Color(color0) },
        u_color1: { value: new THREE.Color(color1) },
        u_color2: { value: new THREE.Color(color2) },
        u_mouseForce: { value: mouseForce },
        u_cursorSize: { value: cursorSize },
        u_autoIntensity: { value: autoIntensity },
        u_resolutionScale: { value: resolution },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform vec2 u_resolution;
        uniform vec3 u_color0;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform float u_mouseForce;
        uniform float u_cursorSize;
        uniform float u_autoIntensity;
        uniform float u_resolutionScale;

        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 mouse = u_mouse / u_resolution;
          
          float distance = length(uv - mouse);
          float force = 0.0;
          if (distance < u_cursorSize / u_resolution.x) {
            force = (u_cursorSize / u_resolution.x - distance) / (u_cursorSize / u_resolution.x) * u_mouseForce * u_autoIntensity;
          }

          vec2 flow = vec2(
            sin(uv.x * 3.0 + u_time * 0.1),
            cos(uv.y * 3.0 + u_time * 0.1 + 100.0)
          ) * 2.0 - 1.0;
          
          vec2 mouseDirection = uv - mouse;
          if (distance < u_cursorSize / u_resolution.x) {
            flow += normalize(mouseDirection) * force * 0.01;
          }

          vec2 distortedUv = uv + flow * 0.1;

          vec3 bgGradient = mix(
            mix(u_color0, u_color1, distortedUv.x),
            mix(u_color1, u_color2, distortedUv.y),
            (distortedUv.x + distortedUv.y) * 0.5
          );

          vec3 finalColor = bgGradient;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    const updateAutoDemo = () => {
      if (!autoDemo) return;

      const auto = autoDemoRef.current;
      auto.x += auto.direction.x * autoSpeed * 0.01;
      auto.y += auto.direction.y * autoSpeed * 0.01;

      if (auto.x < 0 || auto.x > 1) {
        auto.direction.x *= -1;
      }
      if (auto.y < 0 || auto.y > 1) {
        auto.direction.y *= -1;
      }

      mouseRef.current.x = auto.x * width;
      mouseRef.current.y = (1 - auto.y) * height;
    };

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      updateAutoDemo();

      time += 0.01;

      if (material.uniforms.u_time) {
        material.uniforms.u_time.value = time;
      }

      if (material.uniforms.u_mouse) {
        material.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
      }

      renderer.render(scene, camera);
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!container) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      if (camera) {
        camera.left = newWidth / -2;
        camera.right = newWidth / 2;
        camera.top = newHeight / 2;
        camera.bottom = newHeight / -2;
        camera.updateProjectionMatrix();
      }

      if (renderer) {
        renderer.setSize(newWidth, newHeight);
      }

      if (material.uniforms.u_resolution) {
        material.uniforms.u_resolution.value.set(newWidth, newHeight);
      }

      if (geometry) {
        geometry.dispose();
        const newGeometry = new THREE.PlaneGeometry(newWidth, newHeight);
        if (mesh) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          const newMesh = new THREE.Mesh(newGeometry, material);
          scene.add(newMesh);
          meshRef.current = newMesh;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer) {
        container.removeChild(renderer.domElement);
      }

      if (renderer) {
        renderer.dispose();
      }

      if (material) {
        material.dispose();
      }

      if (geometry) {
        geometry.dispose();
      }
    };
  }, [colors, mouseForce, cursorSize, isViscous, viscous, iterationsViscous, iterationsPoisson, resolution, isBounce, autoDemo, autoSpeed, autoIntensity, takeoverDuration, autoResumeDelay, autoRampDuration, color0, color1, color2]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, backgroundColor: '#000E0C', ...style }}
    />
  );
}
