'use client';
import React, { useEffect, useRef, useState } from 'react';

interface BorderGlowProps {
  children: React.ReactNode;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
}

export default function BorderGlow({
  children,
  edgeSensitivity = 30,
  glowColor = '0 236 178',
  backgroundColor = '#000E0C',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#00ECB2'],
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getGlowStyle = () => {
    if (!isHovering || !containerRef.current) {
      return {
        background: backgroundColor,
        borderRadius: `${borderRadius}px`,
        transition: 'all 0.3s ease',
      };
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distanceX = mousePosition.x - centerX;
    const distanceY = mousePosition.y - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const intensity = 1 - Math.min(distance / maxDistance, 1);

    const gradientColors = colors.map((color, index) => {
      const stop = (index / (colors.length - 1)) * 100;
      return `${color} ${stop}%`;
    }).join(', ');

    return {
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, ${glowIntensity * intensity}) 0%, ${backgroundColor} ${glowRadius}px)`,
      borderRadius: `${borderRadius}px`,
      transition: 'all 0.1s ease',
      boxShadow: `0 0 ${glowRadius}px rgba(${glowColor}, ${glowIntensity * intensity * 0.5})`,
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        ...getGlowStyle(),
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}