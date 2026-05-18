'use client'

const STORAGE_KEY = 'portfolio-scroll-y'

function saveScrollPosition() {
  sessionStorage.setItem(STORAGE_KEY, String(Math.round(window.scrollY)))
}

function resolveScrollTarget(savedY: number): number {
  const hero = document.getElementById('hero')
  const about = document.getElementById('about')
  const work = document.getElementById('work')
  if (!hero || !about || !work) return -1

  const vh = window.innerHeight
  const aboutTop = about.offsetTop
  const workTop = work.offsetTop
  const maxY = Math.max(0, document.documentElement.scrollHeight - vh)

  let targetY = Math.min(Math.max(savedY, 0), maxY)

  // About 全屏区：刷新后对齐模块顶部，避免 Chrome 在懒加载后误恢复到底部
  if (targetY >= aboutTop - vh * 0.5 && targetY < workTop - vh * 0.5) {
    targetY = aboutTop
  } else if (targetY < aboutTop - vh * 0.5) {
    targetY = 0
  }

  return targetY
}

function scrollFromHash(scrollTo: (y: number) => void): boolean {
  const hash = window.location.hash.slice(1)
  if (!hash) return false

  const element = document.getElementById(hash)
  if (!element) return false

  scrollTo(element.offsetTop)
  saveScrollPosition()
  return true
}

function tryRestoreScroll(scrollTo: (y: number) => void): boolean {
  if (scrollFromHash(scrollTo)) return true

  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (raw == null) return true

  const savedY = Number(raw)
  if (!Number.isFinite(savedY)) return true

  const targetY = resolveScrollTarget(savedY)
  if (targetY < 0) return false

  scrollTo(targetY)
  return true
}

/**
 * 绑定滚动位置保存；在 reload 时轮询恢复（需 Lenis 就绪后传入 scrollTo）。
 */
export function setupScrollRestoration(scrollTo: (y: number) => void) {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null
  const onScroll = () => {
    if (scrollSaveTimer) clearTimeout(scrollSaveTimer)
    scrollSaveTimer = setTimeout(saveScrollPosition, 150)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pagehide', saveScrollPosition)

  const navEntry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  const isReload = navEntry?.type === 'reload'

  let restoreAttempts = 0
  const pollRestore = () => {
    if (tryRestoreScroll(scrollTo) || restoreAttempts >= 50) return
    restoreAttempts += 1
    requestAnimationFrame(pollRestore)
  }

  if (isReload) {
    pollRestore()
  } else if (window.location.hash) {
    let hashAttempts = 0
    const pollHash = () => {
      if (scrollFromHash(scrollTo) || hashAttempts >= 50) return
      hashAttempts += 1
      requestAnimationFrame(pollHash)
    }
    pollHash()
  } else {
    scrollTo(0)
    saveScrollPosition()
  }

  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pagehide', saveScrollPosition)
    if (scrollSaveTimer) clearTimeout(scrollSaveTimer)
  }
}
