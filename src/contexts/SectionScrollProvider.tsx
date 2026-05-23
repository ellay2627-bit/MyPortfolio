'use client'
import React, { createContext, useContext, ReactNode } from 'react'
import { useSectionScroll, Section } from '@/hooks/useSectionScroll'

interface SectionScrollContextType {
  currentSection: Section
  aboutTab: number
  goToSection: (section: Section, options?: { aboutTab?: number }) => void
  changeAboutTab: (tab: number) => void
  scrollToSection: (section: Section, options?: { aboutTab?: number }) => void
}

const SectionScrollContext = createContext<SectionScrollContextType | undefined>(undefined)

export function SectionScrollProvider({ children }: { children: ReactNode }) {
  // 使用简化的 hook，不添加任何会卡住的逻辑！
  const { currentSection, aboutTab, goToSection, changeAboutTab, scrollToSection } = useSectionScroll()

  return (
    <SectionScrollContext.Provider 
      value={{
        currentSection,
        aboutTab,
        goToSection,
        changeAboutTab,
        scrollToSection,
      }}
    >
      {children}
    </SectionScrollContext.Provider>
  )
}

export function useSectionScrollContext() {
  const context = useContext(SectionScrollContext)
  if (context === undefined) {
    // 返回安全的默认值
    return {
      currentSection: 'hero',
      aboutTab: 0,
      goToSection: () => {},
      changeAboutTab: () => {},
      scrollToSection: () => {},
    }
  }
  return context
}
