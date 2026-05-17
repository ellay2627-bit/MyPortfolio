'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react'

interface UltraSimpleScrollContextType {
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
}

const UltraSimpleScrollContext = createContext<UltraSimpleScrollContextType | undefined>(undefined)

export function UltraSimpleScrollProvider({ children }: { children: ReactNode }) {
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const lastScrollTimeRef = useRef(0)
  const isScrollingRef = useRef(false)
  const tabDataLength = 5

  const setAboutTabIndexWithAnimation = useCallback((index: number) => {
    setAboutTabIndex(Math.max(0, Math.min(tabDataLength - 1, index)))
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      const cooldown = 1200
      
      if (now - lastScrollTimeRef.current < cooldown) {
        e.preventDefault()
        return
      }

      const hero = document.getElementById('hero')
      const about = document.getElementById('about')
      
      if (!hero || !about) return

      const heroRect = hero.getBoundingClientRect()
      const aboutRect = about.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      const heroInView = heroRect.top >= -100 && heroRect.top <= 100
      const aboutInView = aboutRect.top >= -windowHeight/2 && aboutRect.top <= windowHeight/2

      const isScrollingDown = e.deltaY > 0

      if (heroInView) {
        if (isScrollingDown) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          about.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        return
      }

      if (aboutInView) {
        if (isScrollingDown) {
          if (aboutTabIndex < tabDataLength - 1) {
            e.preventDefault()
            lastScrollTimeRef.current = now
            setAboutTabIndexWithAnimation(aboutTabIndex + 1)
          }
        } else {
          if (aboutTabIndex > 0) {
            e.preventDefault()
            lastScrollTimeRef.current = now
            setAboutTabIndexWithAnimation(aboutTabIndex - 1)
          } else {
            e.preventDefault()
            lastScrollTimeRef.current = now
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
        return
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [aboutTabIndex, setAboutTabIndexWithAnimation])

  return (
    <UltraSimpleScrollContext.Provider
      value={{
        aboutTabIndex,
        setAboutTabIndex: setAboutTabIndexWithAnimation
      }}
    >
      {children}
    </UltraSimpleScrollContext.Provider>
  )
}

export function useUltraSimpleScroll() {
  const context = useContext(UltraSimpleScrollContext)
  if (context === undefined) {
    throw new Error('useUltraSimpleScroll must be used within a UltraSimpleScrollProvider')
  }
  return context
}
