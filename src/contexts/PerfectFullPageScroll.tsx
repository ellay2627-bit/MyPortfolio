'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

type Section = 'hero' | 'about' | 'work'

interface PerfectFullPageScrollContextType {
  currentSection: Section
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
  isAnimating: boolean
  hasEntered: { [key: string]: boolean }
  markAsEntered: (key: string) => void
}

const PerfectFullPageScrollContext = createContext<PerfectFullPageScrollContextType | undefined>(undefined)

export function PerfectFullPageScrollProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>('hero')
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasEntered, setHasEntered] = useState<{ [key: string]: boolean }>({})
  const lastScrollTimeRef = useRef(0)
  const ANIMATION_DURATION = 800

  const markAsEntered = (key: string) => {
    setHasEntered(prev => ({
      ...prev,
      [key]: true
    }))
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleScroll = (direction: 'up' | 'down') => {
    if (isAnimating) return

    const now = Date.now()
    if (now - lastScrollTimeRef.current < ANIMATION_DURATION) return
    lastScrollTimeRef.current = now

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION)

    if (currentSection === 'hero') {
      if (direction === 'down') {
        scrollToSection('about')
        setCurrentSection('about')
        if (!hasEntered['about-0']) markAsEntered('about-0')
      }
    } else if (currentSection === 'about') {
      if (direction === 'down') {
        if (aboutTabIndex < 4) {
          const newTab = aboutTabIndex + 1
          setAboutTabIndex(newTab)
          if (!hasEntered[`about-${newTab}`]) markAsEntered(`about-${newTab}`)
        } else {
          scrollToSection('work')
          setCurrentSection('work')
        }
      } else {
        if (aboutTabIndex > 0) {
          const newTab = aboutTabIndex - 1
          setAboutTabIndex(newTab)
          if (!hasEntered[`about-${newTab}`]) markAsEntered(`about-${newTab}`)
        } else {
          scrollToSection('hero')
          setCurrentSection('hero')
        }
      }
    }
  }

  // 完全接管滚轮事件
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 只在 hero 或 about 区域时接管
      if (currentSection === 'work') return

      e.preventDefault()

      const isScrollingDown = e.deltaY > 0
      handleScroll(isScrollingDown ? 'down' : 'up')
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentSection, aboutTabIndex, isAnimating, hasEntered])

  // 监听滚动位置更新当前 section
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero')
      const about = document.getElementById('about')
      const work = document.getElementById('work')

      if (!hero || !about || !work) return

      const heroRect = hero.getBoundingClientRect()
      const aboutRect = about.getBoundingClientRect()
      const workRect = work.getBoundingClientRect()

      const windowHeight = window.innerHeight

      if (heroRect.top >= -windowHeight / 2 && heroRect.top <= windowHeight / 2) {
        if (currentSection !== 'hero') {
          setCurrentSection('hero')
        }
      } else if (aboutRect.top >= -windowHeight / 2 && aboutRect.top <= windowHeight / 2) {
        if (currentSection !== 'about') {
          setCurrentSection('about')
        }
      } else if (workRect.top <= windowHeight / 2) {
        if (currentSection !== 'work') {
          setCurrentSection('work')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSection])

  return (
    <PerfectFullPageScrollContext.Provider
      value={{
        currentSection,
        aboutTabIndex,
        setAboutTabIndex,
        isAnimating,
        hasEntered,
        markAsEntered
      }}
    >
      {children}
    </PerfectFullPageScrollContext.Provider>
  )
}

export function usePerfectFullPageScroll() {
  const context = useContext(PerfectFullPageScrollContext)
  if (context === undefined) {
    throw new Error('usePerfectFullPageScroll must be used within a PerfectFullPageScrollProvider')
  }
  return context
}
