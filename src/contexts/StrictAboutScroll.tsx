'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface StrictAboutScrollContextType {
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
  isAboutLocked: boolean
}

const StrictAboutScrollContext = createContext<StrictAboutScrollContextType | undefined>(undefined)

export function StrictAboutScrollProvider({ children }: { children: ReactNode }) {
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const [isAboutLocked, setIsAboutLocked] = useState(false)
  const lastScrollTimeRef = useRef(0)
  const SCROLL_COOLDOWN = 500

  // 检测 About 是否在视口中
  useEffect(() => {
    const checkAboutInView = () => {
      const about = document.getElementById('about')
      if (!about) return

      const rect = about.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // 当 About 占据视口大部分时锁定
      const isAboutInFullView = rect.top >= -100 && rect.top <= 100
      setIsAboutLocked(isAboutInFullView)
    }

    checkAboutInView()
    window.addEventListener('scroll', checkAboutInView)
    return () => window.removeEventListener('scroll', checkAboutInView)
  }, [])

  // 完全接管滚动
  useEffect(() => {
    if (!isAboutLocked) return

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTimeRef.current < SCROLL_COOLDOWN) {
        e.preventDefault()
        return
      }

      const isScrollingDown = e.deltaY > 0

      if (isScrollingDown) {
        if (aboutTabIndex < 4) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          setAboutTabIndex(aboutTabIndex + 1)
        } else {
          // 最后一个 tab，解锁并允许滚动
          setIsAboutLocked(false)
        }
      } else {
        if (aboutTabIndex > 0) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          setAboutTabIndex(aboutTabIndex - 1)
        } else {
          // 第一个 tab，解锁并允许滚动
          setIsAboutLocked(false)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isAboutLocked, aboutTabIndex])

  return (
    <StrictAboutScrollContext.Provider
      value={{
        aboutTabIndex,
        setAboutTabIndex,
        isAboutLocked
      }}
    >
      {children}
    </StrictAboutScrollContext.Provider>
  )
}

export function useStrictAboutScroll() {
  const context = useContext(StrictAboutScrollContext)
  if (context === undefined) {
    throw new Error('useStrictAboutScroll must be used within a StrictAboutScrollProvider')
  }
  return context
}
