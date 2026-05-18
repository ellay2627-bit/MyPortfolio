'use client';
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Lenis from 'lenis';
import { setupScrollRestoration } from '@/hooks/useScrollRestoration';

export default function NavbarWrapper() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });

    const scrollToY = (y: number) => {
      lenis.scrollTo(y, { immediate: true });
    };

    const teardownRestoration = setupScrollRestoration(scrollToY);

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.body.classList.remove('light');

    return () => {
      teardownRestoration();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Navbar />
    </>
  );
}
