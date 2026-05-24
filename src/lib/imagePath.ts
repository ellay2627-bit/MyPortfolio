// 从环境变量读取 OSS 配置（简化版 - 只需手动上传，不需要密钥）
// 默认使用本地图片，设置 NEXT_PUBLIC_USE_OSS=true 可切换到 OSS
const OSS_BASE_URL = process.env.NEXT_PUBLIC_OSS_BASE_URL || 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';
const USE_OSS = process.env.NEXT_PUBLIC_USE_OSS === 'true';

export function getImageUrl(localPath: string): string {
  if (!localPath) {
    return localPath;
  }
  
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  
  // 如果启用了 OSS，且路径是 works 图片，则使用 OSS 路径
  if (USE_OSS && OSS_BASE_URL && localPath.includes('/images/works/')) {
    const fileName = localPath.split('/').pop();
    if (fileName) {
      return `${OSS_BASE_URL}/images/works/${fileName}`;
    }
  }
  
  // 默认使用本地路径
  return localPath;
}

export function getOssUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  if (USE_OSS && OSS_BASE_URL) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${OSS_BASE_URL}/${cleanPath}`;
  }
  
  // 默认使用本地路径
  return path.startsWith('/') ? path : `/${path}`;
}
