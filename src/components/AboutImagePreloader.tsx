'use client'

import { useEffect } from 'react'
import {
  ABOUT_PRIORITY_IMAGES,
  prefetchAboutModule,
  preloadAboutAssets,
} from '@/lib/aboutAssets'

function shouldPreloadAbout(): boolean {
  if (typeof window === 'undefined') return false
  // 只有在网速较快时才预加载
  const connection = (navigator as any).connection
  if (connection) {
    // 如果是 2G/3G 或者慢速连接，完全不预加载
    if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === '3g') {
      return false
    }
  }
  return window.matchMedia('(min-width: 768px)').matches
}

function injectLinkPreloads(urls: readonly string[], limit = 1) {
  // 更保守，只预加载 1 张
  urls.slice(0, limit).forEach((href) => {
    if (document.querySelector(`link[data-about-preload="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = href
    link.setAttribute('data-about-preload', href)
    document.head.appendChild(link)
  })
}

/**
 * 首页加载后空闲时预取 About 代码与图片，刷新后依赖 HTTP 缓存 + 内存去重。
 * 保守策略：只有高速网络才预加载，且只预加载极少图片。
 */
export function AboutImagePreloader() {
  useEffect(() => {
    if (!shouldPreloadAbout()) return

    prefetchAboutModule()
    injectLinkPreloads(ABOUT_PRIORITY_IMAGES, 1)

    const startPreload = () => {
      void preloadAboutAssets()
    }

    if (typeof window.requestIdleCallback === 'function') {
      // 延长超时时间，更保守
      const idleId = window.requestIdleCallback(startPreload, { timeout: 10000 })
      return () => window.cancelIdleCallback(idleId)
    }

    // 大幅延长到更晚才加载
    const timerId = setTimeout(startPreload, 5000)
    return () => clearTimeout(timerId)
  }, [])

  return null
}
