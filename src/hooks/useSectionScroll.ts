'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

export type Section = 'hero' | 'about' | 'work' | 'awards' | 'stats' | 'contact'

const ANIMATION_DURATION = 600

export function useSectionScroll() {
  const [currentSection, setCurrentSection] = useState<Section>('hero')
  const [aboutTab, setAboutTab] = useState(0)
  
  const isAnimating = useRef(false)
  const animationFrameId = useRef<number | null>(null)
  const aboutTabRef = useRef(0)
  const lastScrollTime = useRef(0)

  const easeInOutQuart = (t: number): number => {
    return t < 0.5 
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  const animateScrollTo = useCallback((targetY: number, duration: number = ANIMATION_DURATION) => {
    if (isAnimating.current) return false
    
    isAnimating.current = true
    
    const startY = window.scrollY
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutQuart(progress)
      
      window.scrollTo(0, startY + (targetY - startY) * easedProgress)
      
      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          isAnimating.current = false
        }, 50)
      }
    }
    
    animationFrameId.current = requestAnimationFrame(animate)
    return true
  }, [])

  const goToSection = useCallback((section: Section, options?: { aboutTab?: number }) => {
    const element = document.getElementById(section)
    if (!element) return
    
    const targetY = element.offsetTop
    const started = animateScrollTo(targetY, ANIMATION_DURATION)
    if (!started) return
    
    setCurrentSection(section)
    
    if (section === 'about') {
      const tab = options?.aboutTab ?? 0
      aboutTabRef.current = tab
      setAboutTab(tab)
    }
  }, [animateScrollTo])

  const changeAboutTab = useCallback((tab: number) => {
    if (isAnimating.current) return
    
    isAnimating.current = true
    aboutTabRef.current = tab
    setAboutTab(tab)
    
    setTimeout(() => {
      isAnimating.current = false
    }, 100)
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      
      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      
      const heroElement = document.getElementById('hero')
      const aboutElement = document.getElementById('about')
      const workElement = document.getElementById('work')
      
      if (!heroElement || !aboutElement || !workElement) return
      
      const aboutTop = aboutElement.offsetTop
      const workTop = workElement.offsetTop
      
      const inAbout = scrollTop >= aboutTop - viewportHeight / 2 && 
                      scrollTop < workTop - viewportHeight / 2
      
      // 只有在Hero和Work区域才使用冷却时间，About区域不使用
      if (!inAbout && (isAnimating.current || now - lastScrollTime.current < 800)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      const isScrollingDown = e.deltaY > 0
      
      // 判断当前在哪个区域
      const inHero = scrollTop < aboutTop - viewportHeight / 2
      const inWork = scrollTop >= workTop - viewportHeight / 2
      
      if (inHero) {
        if (isScrollingDown) {
          e.preventDefault()
          e.stopPropagation()
          lastScrollTime.current = now
          goToSection('about')
        }
        return
      }
      
      if (inAbout) {
        e.preventDefault()
        e.stopPropagation()
        
        const currentTab = aboutTabRef.current
        
        if (isScrollingDown) {
          if (currentTab < 4) {
            changeAboutTab(currentTab + 1)
          } else {
            lastScrollTime.current = now
            goToSection('work')
          }
        } else {
          if (currentTab > 0) {
            changeAboutTab(currentTab - 1)
          } else {
            lastScrollTime.current = now
            goToSection('hero')
          }
        }
        return
      }
      
      if (inWork) {
        if (!isScrollingDown && scrollTop <= workTop + viewportHeight / 2) {
          e.preventDefault()
          e.stopPropagation()
          lastScrollTime.current = now
          goToSection('about', { aboutTab: 4 })
        }
        return
      }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [goToSection, changeAboutTab])

  return {
    currentSection,
    aboutTab,
    goToSection,
    changeAboutTab,
    scrollToSection: goToSection
  }
}
