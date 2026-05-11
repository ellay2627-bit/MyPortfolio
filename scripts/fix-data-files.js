const fs = require('fs');
const path = require('path');

// 路径配置
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'works');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'works');
const STATIC_DIR = path.join(__dirname, '..', 'public', 'static');

// 确保目录存在
[PUBLIC_IMAGES_DIR, STATIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 从 base64 数据中提取图片
function saveBase64Image(base64Data, filePath) {
  if (!base64Data || typeof base64Data !== 'string') {
    return null;
  }

  // 检查是否是 base64 格式
  const base64Match = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (base64Match) {
    const mimeType = base64Match[1];
    const data = base64Match[2];
    
    // 根据 MIME 类型确定扩展名
    let ext = 'bin';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('webp')) ext = 'webp';

    // 写入文件
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return true;
  }
  
  return false;
}

// 处理单个作品文件
function processWorkFile(filePath, workId) {
  console.log(`Processing work file: ${filePath}`);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const work = JSON.parse(rawData);

    // 处理封面
    if (work.cover) {
      const coverFileName = `work-${workId}-cover.${work.cover.includes('png') ? 'png' : work.cover.includes('gif') ? 'gif' : 'jpg'}`;
      const coverPath = path.join(PUBLIC_IMAGES_DIR, coverFileName);
      
      if (saveBase64Image(work.cover, coverPath)) {
        work.cover = `/images/works/${coverFileName}`;
        console.log(`  Saved cover: ${coverFileName}`);
      }
    }

    // 处理媒体
    if (work.media && Array.isArray(work.media)) {
      work.media.forEach((mediaItem, index) => {
        if (mediaItem.url) {
          const mediaFileName = `work-${workId}-media-${index}.${mediaItem.url.includes('png') ? 'png' : mediaItem.url.includes('gif') ? 'gif' : mediaItem.url.includes('webp') ? 'webp' : 'jpg'}`;
          const mediaPath = path.join(PUBLIC_IMAGES_DIR, mediaFileName);
          
          if (saveBase64Image(mediaItem.url, mediaPath)) {
            mediaItem.url = `/images/works/${mediaFileName}`;
            console.log(`  Saved media ${index}: ${mediaFileName}`);
          }
        }
      });
    }

    return work;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// 主函数
function main() {
  console.log('=== 开始修复数据文件 ===\n');

  // 获取所有作品文件（排除 data.json, list.json, work-*.json）
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(file => 
      file.endsWith('.json') && 
      !['data.json', 'list.json', 'works-list.json'].includes(file) &&
      !file.startsWith('work-')
    );

  console.log(`找到 ${files.length} 个作品文件\n`);

  const works = [];

  // 处理每个文件
  for (const file of files) {
    const workId = file.replace('.json', '');
    const filePath = path.join(CONTENT_DIR, file);
    const processedWork = processWorkFile(filePath, workId);
    
    if (processedWork) {
      works.push(processedWork);
      
      // 同时也更新原来的单个作品文件
      fs.writeFileSync(filePath, JSON.stringify(processedWork, null, 2));
    }
  }

  // 按 order 排序
  works.sort((a, b) => (a.order || 0) - (b.order || 0));

  console.log(`\n成功处理了 ${works.length} 个作品`);

  // 1. 生成新的精简 data.json（不含 base64）
  const dataJsonPath = path.join(CONTENT_DIR, 'data.json');
  fs.writeFileSync(dataJsonPath, JSON.stringify(works, null, 2));
  console.log(`\n生成精简的 data.json: ${Math.round(fs.statSync(dataJsonPath).size / 1024)} KB`);

  // 2. 生成 works-list.json（仅用于列表的精简数据）
  const worksList = works.map(work => ({
    id: work.id,
    title: work.title,
    brief: work.brief,
    category: work.category,
    cover: work.cover,
    ratio: work.ratio,
    order: work.order
  }));
  
  const worksListPath = path.join(STATIC_DIR, 'works-list.json');
  fs.writeFileSync(worksListPath, JSON.stringify(worksList, null, 2));
  console.log(`生成 works-list.json: ${Math.round(fs.statSync(worksListPath).size / 1024)} KB`);

  // 3. 为每个作品生成单独的 work-*.json
  works.forEach(work => {
    const workFilePath = path.join(STATIC_DIR, `work-${work.id}.json`);
    fs.writeFileSync(workFilePath, JSON.stringify(work, null, 2));
  });
  
  console.log(`生成 ${works.length} 个作品详情文件`);

  console.log('\n=== 完成 ===');
  console.log(`\n现在 data.json 只有 ${Math.round(fs.statSync(dataJsonPath).size / 1024)} KB，不会被 GitHub 拒绝了！`);
}

main();
