'use client';
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Lenis from 'lenis';

export default function NavbarWrapper() {
  useEffect(() => {
    // 初始化Lenis平滑滚动
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 强制设置为dark模式
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }, []);

  return (
    <>
      <Navbar />
    </>
  );
}