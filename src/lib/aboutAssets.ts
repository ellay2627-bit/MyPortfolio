/** About 模块静态资源（public/images/about） */

export const ABOUT_ME_IMAGES = [
  '/images/about/img/me_01.png',
  '/images/about/img/me_02.png',
  '/images/about/img/me_03.png',
  '/images/about/img/me_04.png',
  '/images/about/img/me_05.png',
] as const

export const ABOUT_DECORATION_IMAGES = [
  '/images/about/img/decorate_pop.png',
  '/images/about/img/decorate_01.png',
  '/images/about/img/decorate_02.png',
  '/images/about/img/decorate_sun.png',
  '/images/about/img/decorate_star.png',
  '/images/about/img/decorate_star2.png',
  '/images/about/img/decorate_flash.png',
  '/images/about/img/decorate_time.png',
  '/images/about/img/decorate_omg.png',
  '/images/about/img/decorate_robot.png',
  '/images/about/img/decorate_figma.png',
  '/images/about/img/decorate_ai.png',
  '/images/about/img/decorate_PS.png',
  '/images/about/img/decorate_kiss.png',
  '/images/about/img/decorate_zxx.png',
  '/images/about/img/decorate_xunzhang.png',
  '/images/about/img/decorate_good.png',
  '/images/about/img/decorate_group.png',
  '/images/about/img/decorate_heart.png',
  '/images/about/img/decorate_star3.png',
  '/images/about/img/decorate_flag.png',
  '/images/about/img/decorate_bravo.png',
] as const

export const ABOUT_BACKGROUND_IMAGE = '/images/about/img/BGdot.png'

export const ABOUT_ICON_IMAGES = [
  '/images/about/icon/arrow-right-long-line.svg',
] as const

/** 首屏进入 About 前优先加载 */
export const ABOUT_PRIORITY_IMAGES = [
  ABOUT_BACKGROUND_IMAGE,
  ...ABOUT_ME_IMAGES,
] as const

export const ABOUT_ALL_IMAGES = [
  ...ABOUT_PRIORITY_IMAGES,
  ...ABOUT_DECORATION_IMAGES,
  ...ABOUT_ICON_IMAGES,
] as const

const loadedUrls = new Set<string>()
let preloadPromise: Promise<void> | null = null
let aboutModulePrefetched = false

function preloadImage(url: string): Promise<void> {
  if (loadedUrls.has(url)) return Promise.resolve()

  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    const finish = () => {
      loadedUrls.add(url)
      resolve()
    }
    img.onload = finish
    img.onerror = finish
    img.src = url
  })
}

async function preloadBatch(urls: readonly string[]): Promise<void> {
  const pending = urls.filter((url) => !loadedUrls.has(url))
  if (pending.length === 0) return
  await Promise.all(pending.map(preloadImage))
}

/** 预加载 About 组件代码（与 page 中 lazy 对应，只执行一次） */
export function prefetchAboutModule(): void {
  if (aboutModulePrefetched) return
  aboutModulePrefetched = true
  void import('@/components/About')
}

/**
 * 预加载 About 图片：优先背景 + 人物，再装饰图。
 * 多次调用共享同一 Promise，不会重复请求。
 */
export function preloadAboutAssets(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    try {
      await preloadBatch(ABOUT_PRIORITY_IMAGES)
      await preloadBatch(ABOUT_DECORATION_IMAGES)
      await preloadBatch(ABOUT_ICON_IMAGES)
    } catch {
      preloadPromise = null
    }
  })()

  return preloadPromise
}

export function isAboutAssetPreloaded(url: string): boolean {
  return loadedUrls.has(url)
}

export function areAboutAssetsReady(): boolean {
  return ABOUT_ALL_IMAGES.every((url) => loadedUrls.has(url))
}
