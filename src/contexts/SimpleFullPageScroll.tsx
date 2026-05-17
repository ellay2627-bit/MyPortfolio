'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

type Section = 'hero' | 'about' | 'work'

interface SimpleFullPageScrollContextType {
  currentSection: Section
  setCurrentSection: (section: Section) => void
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
  scrollToNext: () => void
  scrollToPrev: () => void
  isAnimating: boolean
}

const SimpleFullPageScrollContext = createContext<SimpleFullPageScrollContextType | undefined>(undefined)

export function SimpleFullPageScrollProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>('hero')
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const lastScrollTimeRef = useRef(0)
  const ANIMATION_DURATION = 1000

  const scrollToSection = (section: Section) => {
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToNext = () => {
    if (isAnimating) return

    const now = Date.now()
    if (now - lastScrollTimeRef.current < ANIMATION_DURATION) return
    lastScrollTimeRef.current = now

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION)

    if (currentSection === 'hero') {
      scrollToSection('about')
      setCurrentSection('about')
    } else if (currentSection === 'about') {
      if (aboutTabIndex < 4) {
        setAboutTabIndex(aboutTabIndex + 1)
      } else {
        scrollToSection('work')
        setCurrentSection('work')
      }
    }
    // work 和之后的页面允许正常滚动
  }

  const scrollToPrev = () => {
    if (isAnimating) return

    const now = Date.now()
    if (now - lastScrollTimeRef.current < ANIMATION_DURATION) return
    lastScrollTimeRef.current = now

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION)

    if (currentSection === 'work') {
      setAboutTabIndex(4)
      scrollToSection('about')
      setCurrentSection('about')
    } else if (currentSection === 'about') {
      if (aboutTabIndex > 0) {
        setAboutTabIndex(aboutTabIndex - 1)
      } else {
        scrollToSection('hero')
        setCurrentSection('hero')
      }
    }
  }

  // 监听滚动位置来更新当前 section
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

  // 全局滚轮事件处理
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 只有在 hero 或 about 区域时才接管滚动
      if (currentSection === 'work') return

      e.preventDefault()

      const isScrollingDown = e.deltaY > 0

      if (isScrollingDown) {
        scrollToNext()
      } else {
        scrollToPrev()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentSection, aboutTabIndex, isAnimating])

  return (
    <SimpleFullPageScrollContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        aboutTabIndex,
        setAboutTabIndex,
        scrollToNext,
        scrollToPrev,
        isAnimating
      }}
    >
      {children}
    </SimpleFullPageScrollContext.Provider>
  )
}

export function useSimpleFullPageScroll() {
  const context = useContext(SimpleFullPageScrollContext)
  if (context === undefined) {
    throw new Error('useSimpleFullPageScroll must be used within a SimpleFullPageScrollProvider')
  }
  return context
}
