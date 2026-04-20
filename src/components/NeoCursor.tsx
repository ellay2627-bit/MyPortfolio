'use client';
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function NeoCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // 检测是否是移动端设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    // 初始检测
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    // 如果是移动端，直接返回，不启用自定义鼠标
    if (isMobile) {
      document.body.style.cursor = 'auto';
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }

    // 隐藏默认鼠标
    document.body.style.cursor = 'none';

    // 全局隐藏所有可点击元素的默认鼠标
    const hideDefaultCursor = () => {
      const elements = document.querySelectorAll('a, button, [cursor-pointer], .work-card, .project-card, .pc-contact-btn, [href], [onclick]');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.cursor = 'none';
        }
      });
    };

    // 初始隐藏
    hideDefaultCursor();

    // 监听DOM变化，确保新添加的元素也隐藏默认鼠标
    const observer = new MutationObserver(hideDefaultCursor);
    observer.observe(document.body, { childList: true, subtree: true });

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 确保所有元素都隐藏系统鼠标
      target.style.cursor = 'none';

      // 检查是否是可点击元素，排除联系我部分的文本
      const isContactText = target.textContent === '快来联系我';
      
      if (!isContactText) {
        const interactable = target.closest('a, button, [role="button"], [data-cursor], [href], [onclick], .work-card, .project-card, .pc-contact-btn, .cursor-pointer');
        
        if (interactable) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 检查是否是可点击元素，排除联系我部分的文本
      const isContactText = target.textContent === '快来联系我';
      
      if (!isContactText) {
        const interactable = target.closest('a, button, [role="button"], [data-cursor], [href], [onclick], .work-card, .project-card, .pc-contact-btn, .cursor-pointer');
        
        if (interactable) {
          setIsHovered(false);
        }
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, [mouseX, mouseY, isMobile]);

  // 如果是移动端，不渲染自定义鼠标
  if (isMobile) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[10002] pointer-events-none mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        boxShadow: 'none'
      }}
      animate={{
        width: isHovered ? 60 : 18,
        height: isHovered ? 60 : 18,
        opacity: 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    />
  );
}
