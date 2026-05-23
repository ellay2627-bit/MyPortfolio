'use client'
import { useState } from 'react'

export type Section = 'hero' | 'about' | 'work' | 'awards' | 'stats' | 'contact'

// 完全禁用滚动控制，只保留状态，防止首屏卡住
export function useSectionScroll() {
  const [currentSection] = useState<Section>('hero')
  const [aboutTab] = useState(0)

  // 所有滚动控制函数都为空实现
  const goToSection = () => {}
  const changeAboutTab = () => {}

  return {
    currentSection,
    aboutTab,
    goToSection,
    changeAboutTab,
    scrollToSection: goToSection
  }
}
