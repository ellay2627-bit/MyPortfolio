'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

type Section = 'hero' | 'about' | 'work' | 'other'

interface FullPageScrollContextType {
  currentSection: Section
  setCurrentSection: (section: Section) => void
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  scrollToSection: (section: Section) => void
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
}

const FullPageScrollContext = createContext<FullPageScrollContextType | undefined>(undefined)

export function FullPageScrollProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>('hero')
  const [isLocked, setIsLocked] = useState(false)
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const lastScrollTimeRef = useRef(0)
  const SCROLL_THRESHOLD = 1000 // 1秒防抖

  const scrollToSection = (section: Section) => {
    const now = Date.now()
    if (now - lastScrollTimeRef.current < SCROLL_THRESHOLD) return
    lastScrollTimeRef.current = now

    let element: HTMLElement | null = null
    
    switch (section) {
      case 'hero':
        element = document.getElementById('hero')
        if (!element) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        break
      case 'about':
        element = document.getElementById('about')
        break
      case 'work':
        element = document.getElementById('work')
        break
    }

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    setCurrentSection(section)
  }

  return (
    <FullPageScrollContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        isLocked,
        setIsLocked,
        scrollToSection,
        aboutTabIndex,
        setAboutTabIndex
      }}
    >
      {children}
    </FullPageScrollContext.Provider>
  )
}

export function useFullPageScroll() {
  const context = useContext(FullPageScrollContext)
  if (context === undefined) {
    throw new Error('useFullPageScroll must be used within a FullPageScrollProvider')
  }
  return context
}
