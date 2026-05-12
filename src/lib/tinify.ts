const TINYPNG_API_URL = 'https://api.tinify.com/shrink';
const TINYPNG_MAX_BYTES = 5 * 1024 * 1024;
const TINYPNG_TIMEOUT_MS = 45000;
const TINYPNG_MAX_RETRIES = 2;

type CompressResult = {
  base64Data: string;
  compressed: boolean;
  originalBytes: number;
  outputBytes: number;
};

function parseBase64Data(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('无效的 Base64 图片数据');
  }

  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

function toBase64DataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function isCompressibleImage(mimeType: string) {
  return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType);
}

export async function compressImageWithTinyPng(base64Data: string): Promise<CompressResult> {
  const apiKey = process.env.TINYPNG_API_KEY;
  const { mimeType, buffer } = parseBase64Data(base64Data);

  if (!apiKey || !isCompressibleImage(mimeType) || buffer.length > TINYPNG_MAX_BYTES) {
    return {
      base64Data,
      compressed: false,
      originalBytes: buffer.length,
      outputBytes: buffer.length,
    };
  }

  const auth = Buffer.from(`api:${apiKey}`).toString('base64');
  let compressedBuffer: Buffer | null = null;
  let outputMimeType = mimeType;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= TINYPNG_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TINYPNG_TIMEOUT_MS);

    try {
      const shrinkResponse = await fetch(TINYPNG_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!shrinkResponse.ok) {
        const errorText = await shrinkResponse.text();
        throw new Error(`TinyPNG 压缩失败: ${shrinkResponse.status} ${errorText}`);
      }

      const outputUrl = shrinkResponse.headers.get('location');

      if (!outputUrl) {
        throw new Error('TinyPNG 未返回压缩文件地址');
      }

      const outputResponse = await fetch(outputUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!outputResponse.ok) {
        const errorText = await outputResponse.text();
        throw new Error(`TinyPNG 下载失败: ${outputResponse.status} ${errorText}`);
      }

      const compressedArrayBuffer = await outputResponse.arrayBuffer();
      compressedBuffer = Buffer.from(compressedArrayBuffer);
      outputMimeType = outputResponse.headers.get('content-type') || mimeType;
      clearTimeout(timeout);
      break;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === TINYPNG_MAX_RETRIES) {
        throw lastError;
      }
    }
  }

  if (!compressedBuffer) {
    throw lastError || new Error('TinyPNG 压缩失败');
  }

  return {
    base64Data: toBase64DataUrl(compressedBuffer, outputMimeType),
    compressed: true,
    originalBytes: buffer.length,
    outputBytes: compressedBuffer.length,
  };
}

export async function compressWorkAssetBase64(base64Data: string) {
  try {
    return await compressImageWithTinyPng(base64Data);
  } catch (error) {
    console.error('TinyPNG 压缩出错，已回退到原图:', error);
    const { buffer } = parseBase64Data(base64Data);
    return {
      base64Data,
      compressed: false,
      originalBytes: buffer.length,
      outputBytes: buffer.length,
    };
  }
}
