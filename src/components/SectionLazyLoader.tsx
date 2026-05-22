'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface SectionLazyLoaderProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string | number;
  className?: string;
  id?: string;
}

export default function SectionLazyLoader({
  children,
  rootMargin = '400px 0px',
  minHeight = '1px',
  className,
  id,
}: SectionLazyLoaderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {isVisible ? (
        children
      ) : (
        <div id={id} aria-hidden="true" style={{ width: '100%', minHeight }} />
      )}
    </div>
  );
}
