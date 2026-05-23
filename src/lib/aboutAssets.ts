/** About 模块静态资源（public/images/about） */

export const ABOUT_ME_IMAGES = [
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/me_01.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/me_02.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/me_03.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/me_04.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/me_05.webp',
] as const

export const ABOUT_DECORATION_IMAGES = [
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_pop.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_01.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_02.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_sun.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_star.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_star2.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_flash.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_time.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_omg.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_robot.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_figma.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_ai.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_PS.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_kiss.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_zxx.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_xunzhang.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_good.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_group.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_heart.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_star3.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_flag.webp',
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/decorate_bravo.webp',
] as const

export const ABOUT_BACKGROUND_IMAGE = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/img/BGdot.png'

export const ABOUT_ICON_IMAGES = [
  'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com/images/about/icon/arrow-right-long-line.svg',
] as const

/** 首屏进入 About 前优先加载 - 只选最重要的 1-2 张 */
export const ABOUT_PRIORITY_IMAGES = [
  ABOUT_BACKGROUND_IMAGE,
  ABOUT_ME_IMAGES[0], // 只预加载第一张人物图
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

// 每次只加载 1 张图片，避免同时请求太多
async function preloadBatch(urls: readonly string[], batchSize = 1): Promise<void> {
  const pending = urls.filter((url) => !loadedUrls.has(url))
  if (pending.length === 0) return
  
  // 分批加载，一次只加载 batchSize 张
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize)
    await Promise.all(batch.map(preloadImage))
  }
}

/** 预加载 About 组件代码（与 page 中 lazy 对应，只执行一次） */
export function prefetchAboutModule(): void {
  if (aboutModulePrefetched) return
  aboutModulePrefetched = true
  void import('@/components/About')
}

/**
 * 预加载 About 图片：保守策略，只预加载最必要的图片。
 * 多次调用共享同一 Promise，不会重复请求。
 */
export function preloadAboutAssets(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    try {
      // 只预加载优先级最高的图片，装饰图完全不预加载
      await preloadBatch(ABOUT_PRIORITY_IMAGES, 1)
      // 装饰图完全不预加载，按需加载
      // await preloadBatch(ABOUT_DECORATION_IMAGES)
      // await preloadBatch(ABOUT_ICON_IMAGES)
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
