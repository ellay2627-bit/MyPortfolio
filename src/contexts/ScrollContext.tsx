'use client';
import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';

type ScrollState = 'hero' | 'about' | 'work' | 'other';

interface ScrollContextType {
  currentState: ScrollState;
  setCurrentState: (state: ScrollState) => void;
  isScrollLocked: boolean;
  setIsScrollLocked: (locked: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  scrollToSection: (sectionId: string) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [currentState, setCurrentState] = useState<ScrollState>('hero');
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastScrollTimeRef = useRef(0);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setIsAnimating(true);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // 动画完成后解锁
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        currentState,
        setCurrentState,
        isScrollLocked,
        setIsScrollLocked,
        isAnimating,
        setIsAnimating,
        scrollToSection,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
}
