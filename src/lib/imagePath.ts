const OSS_BASE_URL = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';

export function getImageUrl(localPath: string): string {
  if (!localPath) {
    return localPath;
  }
  
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  
  if (localPath.startsWith('/images/')) {
    return `${OSS_BASE_URL}${localPath}`;
  }
  
  return localPath;
}

export function getOssUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${OSS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
