'use client'
import { useState, useCallback } from 'react'

export type Section = 'hero' | 'about' | 'work' | 'awards' | 'stats' | 'contact'

// 恢复 About Tab 切换功能，只禁用滚动控制
export function useSectionScroll() {
  const [currentSection] = useState<Section>('hero')
  const [aboutTab, setAboutTab] = useState(0)

  const goToSection = () => {}

  const changeAboutTab = useCallback((tab: number) => {
    setAboutTab(tab)
  }, [])

  return {
    currentSection,
    aboutTab,
    goToSection,
    changeAboutTab,
    scrollToSection: goToSection
  }
}
