const fs = require('fs');
const path = require('path');

const WORKS_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'works');
const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const TINYPNG_API_URL = 'https://api.tinify.com/shrink';
const COMPRESSIBLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const REQUEST_TIMEOUT_MS = 45000;
const MAX_RETRIES = 2;

function loadEnvFile() {
  if (!fs.existsSync(ENV_LOCAL_PATH)) {
    return;
  }

  const content = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getApiKey() {
  return process.env.TINYPNG_API_KEY;
}

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isCompressibleFile(filePath) {
  return COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function compressFile(filePath, apiKey) {
  const originalBuffer = fs.readFileSync(filePath);
  const auth = Buffer.from(`api:${apiKey}`).toString('base64');

  let lastError = null;
  let compressedBuffer = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const shrinkResponse = await fetch(TINYPNG_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/octet-stream',
        },
        body: originalBuffer,
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!shrinkResponse.ok) {
        const errorText = await shrinkResponse.text();
        throw new Error(`TinyPNG 压缩失败: ${shrinkResponse.status} ${errorText}`);
      }

      const outputUrl = shrinkResponse.headers.get('location');
      if (!outputUrl) {
        throw new Error('TinyPNG 未返回压缩结果地址');
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

      compressedBuffer = Buffer.from(await outputResponse.arrayBuffer());
      clearTimeout(timeout);
      break;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt === MAX_RETRIES) {
        throw lastError;
      }
      console.warn(`重试压缩: ${path.basename(filePath)} 第 ${attempt} 次失败`);
    }
  }

  if (!compressedBuffer) {
    throw lastError || new Error('压缩失败');
  }

  if (compressedBuffer.length >= originalBuffer.length) {
    return {
      changed: false,
      originalBytes: originalBuffer.length,
      outputBytes: compressedBuffer.length,
    };
  }

  fs.writeFileSync(filePath, compressedBuffer);

  return {
    changed: true,
    originalBytes: originalBuffer.length,
    outputBytes: compressedBuffer.length,
  };
}

async function main() {
  loadEnvFile();
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('缺少 TINYPNG_API_KEY，无法执行批量压缩');
  }

  if (!fs.existsSync(WORKS_IMAGES_DIR)) {
    throw new Error(`目录不存在: ${WORKS_IMAGES_DIR}`);
  }

  const allFiles = walkFiles(WORKS_IMAGES_DIR);
  const imageFiles = allFiles.filter(isCompressibleFile);

  let changedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let savedBytes = 0;

  console.log(`找到 ${imageFiles.length} 个可压缩静态图片文件`);

  for (const filePath of imageFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);

    try {
      const result = await compressFile(filePath, apiKey);
      if (result.changed) {
        changedCount += 1;
        savedBytes += result.originalBytes - result.outputBytes;
        console.log(`已压缩: ${relativePath} (${result.originalBytes} -> ${result.outputBytes})`);
      } else {
        skippedCount += 1;
        console.log(`跳过(无收益): ${relativePath}`);
      }
    } catch (error) {
      failedCount += 1;
      console.error(`压缩失败: ${relativePath}`, error.message);
    }
  }

  console.log('\n压缩完成');
  console.log(`成功压缩: ${changedCount}`);
  console.log(`跳过文件: ${skippedCount}`);
  console.log(`失败文件: ${failedCount}`);
  console.log(`节省体积: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error('批量压缩失败:', error);
  process.exit(1);
});
