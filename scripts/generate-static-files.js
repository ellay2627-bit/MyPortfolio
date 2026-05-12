const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'works');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'works');
const STATIC_DIR = path.join(__dirname, '..', 'public', 'static');

[PUBLIC_IMAGES_DIR, STATIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

function getExtensionFromMimeType(mimeType) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('quicktime')) return 'mov';
  if (mimeType.includes('webm')) return 'webm';
  return 'bin';
}

function writeBase64Asset(dataUrl, filePath) {
  const parsed = parseBase64Data(dataUrl);
  if (!parsed) {
    return false;
  }

  fs.writeFileSync(filePath, parsed.buffer);
  return true;
}

function buildListItem(work) {
  return {
    id: work.id,
    title: work.title,
    brief: work.brief,
    category: work.category,
    cover: work.cover,
    ratio: work.ratio,
    order: work.order,
  };
}

function stripInternalFields(work) {
  const sanitizedWork = {
    ...work,
  };

  delete sanitizedWork.coverAsset;

  if (Array.isArray(sanitizedWork.media)) {
    sanitizedWork.media = sanitizedWork.media.map((item) => {
      const nextItem = { ...item };
      delete nextItem.asset;
      delete nextItem.source;
      return nextItem;
    });
  }

  return sanitizedWork;
}

function processWork(work, workId, usedLocalFiles) {
  const processedWork = stripInternalFields(work);

  if (typeof processedWork.cover === 'string') {
    const parsedCover = parseBase64Data(processedWork.cover);
    if (parsedCover) {
      const coverExt = getExtensionFromMimeType(parsedCover.mimeType);
      const coverFileName = `work-${workId}-cover.${coverExt}`;
      const coverPath = path.join(PUBLIC_IMAGES_DIR, coverFileName);
      if (writeBase64Asset(processedWork.cover, coverPath)) {
        processedWork.cover = `/images/works/${coverFileName}`;
        usedLocalFiles.add(coverFileName);
      }
    } else if (processedWork.cover.startsWith('/images/works/')) {
      usedLocalFiles.add(processedWork.cover.replace('/images/works/', ''));
    }
  }

  if (Array.isArray(processedWork.media)) {
    processedWork.media = processedWork.media.map((mediaItem, index) => {
      if (!mediaItem || typeof mediaItem.url !== 'string') {
        return mediaItem;
      }

      const parsedMedia = parseBase64Data(mediaItem.url);
      if (!parsedMedia) {
        if (mediaItem.url.startsWith('/images/works/')) {
          usedLocalFiles.add(mediaItem.url.replace('/images/works/', ''));
        }
        return mediaItem;
      }

      const mediaExt = getExtensionFromMimeType(parsedMedia.mimeType);
      const mediaFileName = `work-${workId}-media-${index}.${mediaExt}`;
      const mediaPath = path.join(PUBLIC_IMAGES_DIR, mediaFileName);

      if (writeBase64Asset(mediaItem.url, mediaPath)) {
        usedLocalFiles.add(mediaFileName);
        return {
          ...mediaItem,
          url: `/images/works/${mediaFileName}`,
        };
      }

      return mediaItem;
    });
  }

  return processedWork;
}

function removeUnusedLocalFiles(usedLocalFiles) {
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    return;
  }

  fs.readdirSync(PUBLIC_IMAGES_DIR).forEach((file) => {
    if (file.startsWith('work-') && !usedLocalFiles.has(file)) {
      fs.unlinkSync(path.join(PUBLIC_IMAGES_DIR, file));
    }
  });
}

function removeUnusedStaticDetails(activeWorkIds) {
  if (!fs.existsSync(STATIC_DIR)) {
    return;
  }

  fs.readdirSync(STATIC_DIR).forEach((file) => {
    if (!file.startsWith('work-') || !file.endsWith('.json')) {
      return;
    }

    const workId = file.replace(/^work-/, '').replace(/\.json$/, '');
    if (!activeWorkIds.has(workId)) {
      fs.unlinkSync(path.join(STATIC_DIR, file));
    }
  });
}

function main() {
  console.log('=== 开始生成静态文件 ===\n');

  const files = fs.readdirSync(CONTENT_DIR).filter((file) =>
    file.endsWith('.json') &&
    !['data.json', 'list.json', 'works-list.json'].includes(file) &&
    !file.startsWith('work-')
  );

  const works = [];
  const usedLocalFiles = new Set();
  const activeWorkIds = new Set();

  for (const file of files) {
    const workId = file.replace('.json', '');
    const filePath = path.join(CONTENT_DIR, file);

    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const work = JSON.parse(rawData);
      const processedWork = processWork(work, workId, usedLocalFiles);
      works.push(processedWork);
      activeWorkIds.add(String(processedWork.id));
      fs.writeFileSync(filePath, JSON.stringify(processedWork, null, 2));
      console.log(`处理完成: ${processedWork.title || workId}`);
    } catch (error) {
      console.error(`处理作品失败 ${file}:`, error);
    }
  }

  works.sort((a, b) => (a.order || 0) - (b.order || 0));

  const dataJsonPath = path.join(CONTENT_DIR, 'data.json');
  fs.writeFileSync(dataJsonPath, JSON.stringify(works, null, 2));

  const worksListPath = path.join(STATIC_DIR, 'works-list.json');
  fs.writeFileSync(worksListPath, JSON.stringify(works.map(buildListItem), null, 2));

  works.forEach((work) => {
    const workFilePath = path.join(STATIC_DIR, `work-${work.id}.json`);
    fs.writeFileSync(workFilePath, JSON.stringify(stripInternalFields(work), null, 2));
  });

  removeUnusedLocalFiles(usedLocalFiles);
  removeUnusedStaticDetails(activeWorkIds);

  console.log(`处理完成，共 ${works.length} 个作品`);
  console.log('=== 完成 ===');
}

main();
