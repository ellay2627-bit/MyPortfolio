'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface TrueFullPageScrollContextType {
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
}

const TrueFullPageScrollContext = createContext<TrueFullPageScrollContextType | undefined>(undefined)

export function TrueFullPageScrollProvider({ children }: { children: ReactNode }) {
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const lastScrollTimeRef = useRef(0)
  const currentSectionRef = useRef<'hero' | 'about' | 'other'>('hero')

  // 检测当前所在 section
  useEffect(() => {
    const checkSection = () => {
      const hero = document.getElementById('hero')
      const about = document.getElementById('about')
      const work = document.getElementById('work')

      if (!hero || !about || !work) return

      const heroRect = hero.getBoundingClientRect()
      const aboutRect = about.getBoundingClientRect()
      const workRect = work.getBoundingClientRect()

      if (heroRect.top >= -200 && heroRect.top <= 200) {
        currentSectionRef.current = 'hero'
      } else if (aboutRect.top >= -200 && aboutRect.top <= 200) {
        currentSectionRef.current = 'about'
      } else {
        currentSectionRef.current = 'other'
      }
    }

    checkSection()
    window.addEventListener('scroll', checkSection)
    return () => window.removeEventListener('scroll', checkSection)
  }, [])

  // 完全接管滚动
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTimeRef.current < 800) {
        e.preventDefault()
        return
      }

      const isScrollingDown = e.deltaY > 0

      if (currentSectionRef.current === 'hero') {
        if (isScrollingDown) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          const about = document.getElementById('about')
          if (about) {
            about.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      } else if (currentSectionRef.current === 'about') {
        if (isScrollingDown) {
          if (aboutTabIndex < 4) {
            e.preventDefault()
            lastScrollTimeRef.current = now
            setAboutTabIndex(aboutTabIndex + 1)
          }
          // 最后一个 tab 不阻止，允许正常滚动
        } else {
          if (aboutTabIndex > 0) {
            e.preventDefault()
            lastScrollTimeRef.current = now
            setAboutTabIndex(aboutTabIndex - 1)
          }
          // 第一个 tab 不阻止，允许正常滚动
        }
      }
      // work 及以后不做任何处理
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [aboutTabIndex])

  return (
    <TrueFullPageScrollContext.Provider
      value={{
        aboutTabIndex,
        setAboutTabIndex
      }}
    >
      {children}
    </TrueFullPageScrollContext.Provider>
  )
}

export function useTrueFullPageScroll() {
  const context = useContext(TrueFullPageScrollContext)
  if (context === undefined) {
    throw new Error('useTrueFullPageScroll must be used within a TrueFullPageScrollProvider')
  }
  return context
}
