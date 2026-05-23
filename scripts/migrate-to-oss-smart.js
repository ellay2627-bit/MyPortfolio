const fs = require('fs');
const path = require('path');

const OSS_BASE_URL = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// 获取实际存在的文件映射
function buildFileMap() {
  const fileMap = new Map();
  
  function traverse(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath, path.join(basePath, file));
      } else {
        const relativePath = path.join('/images', basePath, file);
        const nameWithoutExt = path.basename(file, path.extname(file));
        const ext = path.extname(file);
        const key = path.join('/images', basePath, nameWithoutExt);
        fileMap.set(key.toLowerCase(), { path: relativePath, ext });
      }
    }
  }
  
  traverse(PUBLIC_IMAGES_DIR);
  return fileMap;
}

function findActualPath(imagePath, fileMap) {
  if (!imagePath) return imagePath;
  
  // 已经是完整 URL 了
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (!imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // 尝试找到正确的扩展名
  const parsed = path.parse(imagePath);
  const key = path.join(parsed.dir, parsed.name).toLowerCase();
  
  const matched = fileMap.get(key);
  if (matched) {
    return `${OSS_BASE_URL}${matched.path}`;
  }
  
  // 如果没找到，就用原始路径但加上 OSS 前缀
  return `${OSS_BASE_URL}${imagePath}`;
}

function replaceImagePathsInFile(filePath, fileMap) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 匹配带引号的 /images/ 开头的路径
    const quotedRegex = /(["'])(\/images\/[^\s"'<>]+)\1/g;
    
    content = content.replace(quotedRegex, (match, quote, imagePath) => {
      const newPath = findActualPath(imagePath, fileMap);
      if (newPath !== imagePath) {
        modified = true;
        return `${quote}${newPath}${quote}`;
      }
      return match;
    });
    
    // 也处理没有引号的情况（在 JS/TS 中的字符串字面量）
    const noQuoteRegex = /(?<!['"])(\/images\/[^\s,)\]}>]+)(?!['"])/g;
    
    content = content.replace(noQuoteRegex, (match) => {
      if (match.startsWith('http')) return match;
      const newPath = findActualPath(match, fileMap);
      if (newPath !== match) {
        modified = true;
        return newPath;
      }
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function processDirectory(dirPath, fileMap) {
  let updatedCount = 0;
  
  function traverse(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === '.next') {
          continue;
        }
        traverse(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          if (replaceImagePathsInFile(fullPath, fileMap)) {
            updatedCount++;
          }
        }
      }
    }
  }
  
  traverse(dirPath);
  return updatedCount;
}

console.log('开始智能迁移图片路径到阿里云 OSS...\n');

console.log('扫描本地图片文件...');
const fileMap = buildFileMap();
console.log(`找到 ${fileMap.size} 个图片文件\n`);

const dirsToProcess = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'content'),
  path.join(__dirname, '..', 'public', 'static')
];

let totalUpdated = 0;

for (const dir of dirsToProcess) {
  console.log(`处理目录: ${dir}`);
  totalUpdated += processDirectory(dir, fileMap);
}

console.log(`\n迁移完成！共更新了 ${totalUpdated} 个文件。`);
