import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type ResourceType = 'image' | 'video';

export type RemoteAssetRef = {
  provider: 'cloudinary' | 'aliyun-oss';
  resourceType: ResourceType;
  publicId: string;
  bytes?: number;
  secureUrl: string;
};

type UploadAssetOptions = {
  base64Data: string;
  resourceType: ResourceType;
  publicId: string;
  folder?: string;
};

type UploadAssetResult = RemoteAssetRef | null;

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || 'portfolio';

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function getAliyunOSSConfig() {
  const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.ALIYUN_OSS_BUCKET;
  const endpoint = process.env.ALIYUN_OSS_ENDPOINT || 'oss-cn-beijing.aliyuncs.com';

  if (!accessKeyId || !accessKeySecret || !bucket) {
    return null;
  }

  return { accessKeyId, accessKeySecret, bucket, endpoint };
}

function buildBasicAuth(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
}

function computeOSSAuthorization(
  accessKeyId: string,
  accessKeySecret: string,
  method: string,
  contentType: string,
  date: string,
  resource: string
) {
  const stringToSign = `${method}\n\n${contentType}\n${date}\n${resource}`;
  const hmac = crypto.createHmac('sha1', accessKeySecret);
  hmac.update(stringToSign);
  const signature = hmac.digest('base64');
  return `OSS ${accessKeyId}:${signature}`;
}

export function parseBase64Data(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('无效的 Base64 数据');
  }

  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

export function getBase64ByteSize(dataUrl: string) {
  return parseBase64Data(dataUrl).buffer.length;
}

export function isBase64DataUrl(value: string) {
  return /^data:[^;]+;base64,/.test(value);
}

export function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function buildStableAssetId(parts: Array<string | number>) {
  const normalized = parts
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join('-')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/');

  return normalized.toLowerCase();
}

export function buildHashSuffix(input: string | Buffer) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 10);
}

export function getRemoteStorageThresholdBytes() {
  const rawValue = Number(process.env.MEDIA_INLINE_MAX_BYTES || 2 * 1024 * 1024);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 2 * 1024 * 1024;
}

export function getRemoteStorageProvider() {
  if (!process.env.USE_REMOTE_STORAGE || process.env.USE_REMOTE_STORAGE !== 'true') {
    return null;
  }

  if (getAliyunOSSConfig()) {
    return 'aliyun-oss' as const;
  }

  if (getCloudinaryConfig()) {
    return 'cloudinary' as const;
  }

  return null;
}

export function isRemoteStorageEnabled() {
  return getRemoteStorageProvider() !== null;
}

export function isLocalStorageEnabled() {
  return !isRemoteStorageEnabled();
}

export async function uploadAssetToRemoteStorage({
  base64Data,
  resourceType,
  publicId,
  folder,
}: UploadAssetOptions): Promise<UploadAssetResult> {
  const provider = getRemoteStorageProvider();

  if (!provider) {
    return null;
  }

  if (provider === 'aliyun-oss') {
    return uploadToAliyunOSS({ base64Data, resourceType, publicId, folder });
  }

  if (provider === 'cloudinary') {
    return uploadToCloudinary({ base64Data, resourceType, publicId, folder });
  }

  return null;
}

async function uploadToCloudinary({
  base64Data,
  resourceType,
  publicId,
  folder,
}: UploadAssetOptions): Promise<UploadAssetResult> {
  const config = getCloudinaryConfig();

  if (!config) {
    return null;
  }

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('public_id', publicId);
  formData.append('folder', folder || config.folder);
  formData.append('overwrite', 'true');
  formData.append('invalidate', 'true');
  formData.append('unique_filename', 'false');
  formData.append('use_filename', 'false');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      headers: {
        Authorization: buildBasicAuth(config.apiKey, config.apiSecret),
      },
      body: formData,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary 上传失败: ${response.status} ${errorText}`);
  }

  const payload = await response.json();

  return {
    provider: 'cloudinary',
    resourceType,
    publicId: payload.public_id,
    bytes: payload.bytes,
    secureUrl: payload.secure_url,
  };
}

async function uploadToAliyunOSS({
  base64Data,
  resourceType,
  publicId,
}: UploadAssetOptions): Promise<UploadAssetResult> {
  const config = getAliyunOSSConfig();

  if (!config) {
    return null;
  }

  const { buffer, mimeType } = parseBase64Data(base64Data);
  const fileExtension = mimeType.split('/')[1] || 'jpg';
  const fileName = `${publicId.replace(/\//g, '-')}.${fileExtension}`;
  const objectKey = `images/works/${fileName}`;

  const date = new Date().toUTCString();
  const resource = `/${config.bucket}/${objectKey}`;
  const authorization = computeOSSAuthorization(
    config.accessKeyId,
    config.accessKeySecret,
    'PUT',
    mimeType,
    date,
    resource
  );

  const url = `https://${config.bucket}.${config.endpoint}/${objectKey}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Date': date,
      'Authorization': authorization,
      'Content-Length': buffer.length.toString(),
    },
    body: buffer,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`阿里云 OSS 上传失败: ${response.status} ${errorText}`);
  }

  return {
    provider: 'aliyun-oss',
    resourceType,
    publicId: objectKey,
    bytes: buffer.length,
    secureUrl: url,
  };
}

export async function uploadAssetToLocalStorage({
  base64Data,
  publicId,
}: {
  base64Data: string;
  publicId: string;
}): Promise<{ localPath: string; url: string } | null> {
  try {
    const { buffer, mimeType } = parseBase64Data(base64Data);
    
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'works');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${publicId.replace(/\//g, '-')}.${mimeType.split('/')[1] || 'jpg'}`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    const url = `/images/works/${fileName}`;
    
    console.log(`✅ 本地存储成功: ${url}`);
    
    return {
      localPath: filePath,
      url,
    };
  } catch (error) {
    console.error('❌ 本地存储失败:', error);
    return null;
  }
}

export async function deleteRemoteAsset(ref: RemoteAssetRef) {
  const provider = getRemoteStorageProvider();

  if (!provider) {
    return false;
  }

  if (provider === 'aliyun-oss') {
    return deleteFromAliyunOSS(ref);
  }

  if (provider === 'cloudinary') {
    return deleteFromCloudinary(ref);
  }

  return false;
}

async function deleteFromCloudinary(ref: RemoteAssetRef) {
  const config = getCloudinaryConfig();

  if (!config) {
    return false;
  }

  const params = new URLSearchParams();
  params.append('public_ids[]', ref.publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/${ref.resourceType}/upload`,
    {
      method: 'DELETE',
      headers: {
        Authorization: buildBasicAuth(config.apiKey, config.apiSecret),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary 删除失败: ${response.status} ${errorText}`);
  }

  return true;
}

async function deleteFromAliyunOSS(ref: RemoteAssetRef) {
  const config = getAliyunOSSConfig();

  if (!config) {
    return false;
  }

  const date = new Date().toUTCString();
  const resource = `/${config.bucket}/${ref.publicId}`;
  const authorization = computeOSSAuthorization(
    config.accessKeyId,
    config.accessKeySecret,
    'DELETE',
    '',
    date,
    resource
  );

  const url = `https://${config.bucket}.${config.endpoint}/${ref.publicId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Date': date,
      'Authorization': authorization,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`阿里云 OSS 删除失败: ${response.status} ${errorText}`);
  }

  return true;
}

export async function deleteLocalAsset(localPath: string) {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`✅ 本地文件删除成功: ${localPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ 本地文件删除失败:', error);
    return false;
  }
}
