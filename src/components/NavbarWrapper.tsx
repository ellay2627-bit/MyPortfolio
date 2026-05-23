'use client';
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { setupScrollRestoration } from '@/hooks/useScrollRestoration';

export default function NavbarWrapper() {
  const [showEnhancements, setShowEnhancements] = useState(false);

  // 快速加载 Lenis 功能
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnhancements(true);
    }, 300); // 0.3秒后就加载
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showEnhancements) return;

    let lenis: any = null;
    let rafId: number = 0;

    const initialize = async () => {
      // 动态导入 Lenis 并初始化
      const LenisModule = await import('lenis');
      const LenisClass = LenisModule.default;
      lenis = new LenisClass({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical'
      });

      const scrollToY = (y: number) => {
        lenis.scrollTo(y, { immediate: true });
      };

      const teardownRestoration = setupScrollRestoration(scrollToY);

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.classList.remove('light');

      return () => {
        teardownRestoration();
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    };

    initialize();
  }, [showEnhancements]);

  return (
    <>
      <Navbar />
    </>
  );
}
