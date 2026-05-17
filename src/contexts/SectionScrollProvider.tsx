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
  const scroll = useSectionScroll()
  
  return (
    <SectionScrollContext.Provider value={scroll}>
      {children}
    </SectionScrollContext.Provider>
  )
}

export function useSectionScrollContext() {
  const context = useContext(SectionScrollContext)
  if (context === undefined) {
    throw new Error('useSectionScrollContext must be used within a SectionScrollProvider')
  }
  return context
}
