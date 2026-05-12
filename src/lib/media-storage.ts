import crypto from 'crypto';

type ResourceType = 'image' | 'video';

export type RemoteAssetRef = {
  provider: 'cloudinary';
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

function buildBasicAuth(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
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

export function isRemoteStorageEnabled() {
  return Boolean(getCloudinaryConfig());
}

export async function uploadAssetToRemoteStorage({
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
    throw new Error(`远端媒体上传失败: ${response.status} ${errorText}`);
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

export async function deleteRemoteAsset(ref: RemoteAssetRef) {
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
    throw new Error(`远端媒体删除失败: ${response.status} ${errorText}`);
  }

  return true;
}
