const fs = require('fs');
const path = require('path');

const {
  uploadAssetToRemoteStorage,
  buildStableAssetId,
  buildHashSuffix,
  getRemoteStorageThresholdBytes,
  isRemoteStorageEnabled,
} = require('../src/lib/media-storage');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'works');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'works');

function isLocalWorksAsset(url) {
  return typeof url === 'string' && url.startsWith('/images/works/');
}

function getLocalAssetPath(url) {
  return path.join(PUBLIC_IMAGES_DIR, url.replace('/images/works/', ''));
}

function getMimeTypeFromExt(ext) {
  const normalized = ext.toLowerCase();
  if (normalized === '.jpg' || normalized === '.jpeg') return 'image/jpeg';
  if (normalized === '.png') return 'image/png';
  if (normalized === '.gif') return 'image/gif';
  if (normalized === '.webp') return 'image/webp';
  if (normalized === '.mp4') return 'video/mp4';
  if (normalized === '.mov') return 'video/quicktime';
  if (normalized === '.webm') return 'video/webm';
  return 'application/octet-stream';
}

function fileToBase64DataUrl(filePath) {
  const ext = path.extname(filePath);
  const mimeType = getMimeTypeFromExt(ext);
  const buffer = fs.readFileSync(filePath);
  return {
    bytes: buffer.length,
    dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
  };
}

async function migrateWorkFile(fileName) {
  const filePath = path.join(CONTENT_DIR, fileName);
  const work = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const thresholdBytes = getRemoteStorageThresholdBytes();
  let changed = false;

  if (Array.isArray(work.media)) {
    for (let index = 0; index < work.media.length; index += 1) {
      const item = work.media[index];
      if (!item || !isLocalWorksAsset(item.url)) {
        continue;
      }

      const localPath = getLocalAssetPath(item.url);
      if (!fs.existsSync(localPath)) {
        continue;
      }

      const { bytes, dataUrl } = fileToBase64DataUrl(localPath);
      const isVideo = item.type === 'video';
      const shouldUpload = isVideo || bytes > thresholdBytes;

      if (!shouldUpload) {
        continue;
      }

      const assetHash = buildHashSuffix(dataUrl);
      const remoteAsset = await uploadAssetToRemoteStorage({
        base64Data: dataUrl,
        resourceType: isVideo ? 'video' : 'image',
        publicId: buildStableAssetId(['works', work.id || fileName.replace('.json', ''), 'media', index, assetHash]),
      });

      if (!remoteAsset) {
        continue;
      }

      item.url = remoteAsset.secureUrl;
      item.asset = remoteAsset;
      item.source = 'remote';
      changed = true;
      console.log(`迁移成功: ${fileName} -> media[${index}] -> ${remoteAsset.secureUrl}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(work, null, 2));
  }

  return changed;
}

async function main() {
  if (!isRemoteStorageEnabled()) {
    console.error('未配置远端图床环境变量，跳过迁移。');
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((file) =>
    file.endsWith('.json') &&
    !['data.json', 'list.json', 'works-list.json'].includes(file) &&
    !file.startsWith('work-')
  );

  let changedCount = 0;
  for (const fileName of files) {
    const changed = await migrateWorkFile(fileName);
    if (changed) {
      changedCount += 1;
    }
  }

  console.log(`迁移完成，更新作品 ${changedCount} 个。`);
}

main().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});
