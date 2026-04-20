'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FaultyTerminalProps {
  scale?: number;
  gridMul?: [number, number];
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
}

export default function FaultyTerminal({
  scale = 1,
  gridMul = [2, 2], // 增加默认网格大小减少计算量
  digitSize = 1,
  timeScale = 1,
  pause = false,
  scanlineIntensity = 0.5,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0,
  tint = '#ffffff',
  mouseReact = false,
  mouseStrength = 0.5,
  pageLoadAnimation = false,
  brightness = 1,
}: FaultyTerminalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();

    // 预计算颜色值
    const tintColor = {
      r: parseInt(tint.slice(1, 3), 16),
      g: parseInt(tint.slice(3, 5), 16),
      b: parseInt(tint.slice(5, 7), 16)
    };

    // 优化渲染循环
    let lastTime = 0;
    const render = (timestamp: number) => {
      if (pause || !isActive) return;

      // 控制帧率
      if (timestamp - lastTime < 16) { // 约60fps
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      lastTime = timestamp;

      // 清空画布
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 生成随机噪点和扫描线
      const gridWidth = gridMul[0] * digitSize;
      const gridHeight = gridMul[1] * digitSize;
      const cols = Math.ceil(canvas.width / gridWidth);
      const rows = Math.ceil(canvas.height / gridHeight);

      // 减少绘制操作，使用批量绘制
      ctx.beginPath();
      
      for (let y = 0; y < rows; y++) {
        const canvasY = y * gridHeight;
        
        // 扫描线效果
        if (y % 2 === 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${scanlineIntensity * 0.1})`;
          ctx.fillRect(0, canvasY, canvas.width, 1);
        }

        for (let x = 0; x < cols; x++) {
          const randomValue = Math.random();
          if (randomValue < noiseAmp * 0.1) {
            const intensity = randomValue * 10 * brightness;
            ctx.fillStyle = `rgba(${tintColor.r}, ${tintColor.g}, ${tintColor.b}, ${intensity})`;
            const canvasX = x * gridWidth;
            ctx.fillRect(canvasX, canvasY, gridWidth, gridHeight);
          }
        }
      }

      // 闪烁效果
      if (Math.random() < flickerAmount * 0.01) {
        ctx.fillStyle = `rgba(${tintColor.r}, ${tintColor.g}, ${tintColor.b}, ${Math.random() * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // glitch效果
      if (Math.random() < glitchAmount * 0.005) {
        const glitchWidth = Math.random() * 100 + 50;
        const glitchHeight = Math.random() * canvas.height;
        const glitchY = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(${tintColor.r}, ${tintColor.g}, ${tintColor.b}, ${Math.random() * 0.2})`;
        ctx.fillRect(0, glitchY, glitchWidth, glitchHeight);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // 启动渲染
    animationRef.current = requestAnimationFrame(render);

    // 响应窗口大小变化
    const handleResize = () => {
      updateCanvasSize();
    };

    // 检测页面可见性，减少后台渲染
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pause, scanlineIntensity, glitchAmount, flickerAmount, noiseAmp, tint, brightness, gridMul, digitSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        willChange: 'transform', // 提示浏览器优化
      }}
    />
  );
}