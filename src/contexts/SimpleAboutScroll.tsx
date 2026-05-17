'use client'
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface SimpleAboutScrollContextType {
  aboutTabIndex: number
  setAboutTabIndex: (index: number) => void
  isInAboutView: boolean
  setIsInAboutView: (inView: boolean) => void
}

const SimpleAboutScrollContext = createContext<SimpleAboutScrollContextType | undefined>(undefined)

export function SimpleAboutScrollProvider({ children }: { children: ReactNode }) {
  const [aboutTabIndex, setAboutTabIndex] = useState(0)
  const [isInAboutView, setIsInAboutView] = useState(false)
  const lastScrollTimeRef = useRef(0)

  // 当About在视图中时，接管滚动
  useEffect(() => {
    if (!isInAboutView) return

    const handleWheel = (e: WheelEvent) => {
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
        // 最后一个tab时，允许正常滚动
      } else {
        if (aboutTabIndex > 0) {
          e.preventDefault()
          lastScrollTimeRef.current = now
          setAboutTabIndex(aboutTabIndex - 1)
        }
        // 第一个tab时，允许正常滚动
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isInAboutView, aboutTabIndex])

  return (
    <SimpleAboutScrollContext.Provider
      value={{
        aboutTabIndex,
        setAboutTabIndex,
        isInAboutView,
        setIsInAboutView
      }}
    >
      {children}
    </SimpleAboutScrollContext.Provider>
  )
}

export function useSimpleAboutScroll() {
  const context = useContext(SimpleAboutScrollContext)
  if (context === undefined) {
    throw new Error('useSimpleAboutScroll must be used within a SimpleAboutScrollProvider')
  }
  return context
}
