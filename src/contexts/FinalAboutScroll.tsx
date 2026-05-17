'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface FinalAboutScrollContextType {
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
}

const FinalAboutScrollContext = createContext<FinalAboutScrollContextType | undefined>(undefined)

export function FinalAboutScrollProvider({ children }: { children: ReactNode }) {
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const lastScrollTimeRef = useRef(0)
  const isAboutInViewRef = useRef(false)

  // 检测 About 是否在视口中
  useEffect(() => {
    const checkAboutInView = () => {
      const about = document.getElementById('about')
      if (!about) return

      const rect = about.getBoundingClientRect()
      isAboutInViewRef.current = rect.top >= -100 && rect.top <= 100
    }

    checkAboutInView()
    window.addEventListener('scroll', checkAboutInView)
    return () => window.removeEventListener('scroll', checkAboutInView)
  }, [])

  // 完全接管滚动
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isAboutInViewRef.current) return

      const now = Date.now()
      if (now - lastScrollTimeRef.current < 500) {
        e.preventDefault()
        return
      }

      const isScrollingDown = e.deltaY > 0

      if (isScrollingDown) {
        if (aboutTabIndex < 4) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          setAboutTabIndex(aboutTabIndex + 1)
        }
        // 最后一个tab不阻止，允许正常滚动
      } else {
        if (aboutTabIndex > 0) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          setAboutTabIndex(aboutTabIndex - 1)
        }
        // 第一个tab不阻止，允许正常滚动
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [aboutTabIndex])

  return (
    <FinalAboutScrollContext.Provider
      value={{
        aboutTabIndex,
        setAboutTabIndex
      }}
    >
      {children}
    </FinalAboutScrollContext.Provider>
  )
}

export function useFinalAboutScroll() {
  const context = useContext(FinalAboutScrollContext)
  if (context === undefined) {
    throw new Error('useFinalAboutScroll must be used within a FinalAboutScrollProvider')
  }
  return context
}
