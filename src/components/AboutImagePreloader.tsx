'use client'

import { useEffect } from 'react'
import {
  ABOUT_PRIORITY_IMAGES,
  prefetchAboutModule,
  preloadAboutAssets,
} from '@/lib/aboutAssets'

function shouldPreloadAbout(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(min-width: 768px)').matches
}

function injectLinkPreloads(urls: readonly string[], limit = 3) {
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
 */
export function AboutImagePreloader() {
  useEffect(() => {
    if (!shouldPreloadAbout()) return

    prefetchAboutModule()
    injectLinkPreloads(ABOUT_PRIORITY_IMAGES, 2)

    const startPreload = () => {
      void preloadAboutAssets()
    }

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(startPreload, { timeout: 2500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timerId = setTimeout(startPreload, 400)
    return () => clearTimeout(timerId)
  }, [])

  return null
}
