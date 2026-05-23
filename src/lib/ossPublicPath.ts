const OSS_BASE_URL = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com'

export function getOssPublicUrl(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${OSS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function getStaticDataUrl(path: string): string {
  return getOssPublicUrl(path)
}

export { OSS_BASE_URL }
