'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words';
  from?: { opacity?: number; y?: number };
  to?: { opacity?: number; y?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedOnce = useRef(false);

  const animateChars = useCallback((isHover = false) => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');
    
    if (isHover) {
      gsap.set(chars, { ...from });
    }
    
    gsap.to(chars, {
      ...to,
      duration: duration,
      stagger: delay / 1000,
      ease: ease,
      onComplete: () => {
        if (!isHover && onLetterAnimationComplete && showCallback) {
          onLetterAnimationComplete();
        }
      },
    });
  }, [delay, duration, ease, from, to, onLetterAnimationComplete, showCallback]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedOnce.current) {
          hasAnimatedOnce.current = true;
          setTimeout(() => animateChars(), 100);
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [threshold, rootMargin, animateChars]);

  const handleMouseEnter = () => {
    animateChars(true);
  };

  const splitContent = () => {
    if (splitType === 'words') {
      return text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="word inline-block whitespace-nowrap mr-1">
          {word.split('').map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className="char inline-block"
              style={{ display: 'inline-block' }}
            >
              {char}
            </span>
          ))}
        </span>
      ));
    }

    return text.split('').map((char, index) => (
      <span
        key={index}
        className="char inline-block"
        style={{ display: 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  useEffect(() => {
    if (containerRef.current) {
      const chars = containerRef.current.querySelectorAll('.char');
      gsap.set(chars, { ...from });
    }
  }, [from]);

  return (
    <div
      ref={containerRef}
      className={`split-text ${className}`}
      style={{ textAlign, display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
    >
      {splitContent()}
    </div>
  );
}
