const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'works');
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'content', 'works'),
  path.join(ROOT_DIR, 'content', 'drafts'),
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseBase64Data(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

function extFromMimeType(mimeType) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('quicktime')) return 'mov';
  if (mimeType.includes('webm')) return 'webm';
  return 'bin';
}

function materializeAsset(dataUrl, fileName) {
  const parsed = parseBase64Data(dataUrl);
  if (!parsed) {
    return null;
  }

  ensureDir(PUBLIC_IMAGES_DIR);
  const outputPath = path.join(PUBLIC_IMAGES_DIR, fileName);
  fs.writeFileSync(outputPath, parsed.buffer);
  return `/images/works/${fileName}`;
}

function sanitizeWork(work, workId) {
  let changed = false;
  const nextWork = { ...work };

  if (typeof nextWork.cover === 'string') {
    const parsedCover = parseBase64Data(nextWork.cover);
    if (parsedCover) {
      const coverFileName = `work-${workId}-cover.${extFromMimeType(parsedCover.mimeType)}`;
      const coverUrl = materializeAsset(nextWork.cover, coverFileName);
      if (coverUrl) {
        nextWork.cover = coverUrl;
        changed = true;
      }
    }
  }

  if (Array.isArray(nextWork.media)) {
    nextWork.media = nextWork.media.map((item, index) => {
      if (!item || typeof item.url !== 'string') {
        return item;
      }

      const parsedMedia = parseBase64Data(item.url);
      if (!parsedMedia) {
        return item;
      }

      const mediaFileName = `work-${workId}-media-${index}.${extFromMimeType(parsedMedia.mimeType)}`;
      const mediaUrl = materializeAsset(item.url, mediaFileName);
      if (!mediaUrl) {
        return item;
      }

      changed = true;
      return {
        ...item,
        url: mediaUrl,
      };
    });
  }

  return { nextWork, changed };
}

function sanitizeDirectory(dirPath) {
  const files = fs.readdirSync(dirPath).filter((file) =>
    file.endsWith('.json') &&
    !['data.json', 'list.json', 'works-list.json'].includes(file) &&
    !file.startsWith('work-')
  );

  let changedCount = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const workId = file.replace('.json', '');
    const raw = fs.readFileSync(filePath, 'utf8');
    const work = JSON.parse(raw);
    const { nextWork, changed } = sanitizeWork(work, workId);

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(nextWork, null, 2));
      changedCount += 1;
      console.log(`已清洗: ${path.relative(ROOT_DIR, filePath)}`);
    }
  }

  return changedCount;
}

function main() {
  let totalChanged = 0;
  TARGET_DIRS.forEach((dirPath) => {
    if (fs.existsSync(dirPath)) {
      totalChanged += sanitizeDirectory(dirPath);
    }
  });

  console.log(`清洗完成，共更新 ${totalChanged} 个 JSON 文件`);
}

main();
