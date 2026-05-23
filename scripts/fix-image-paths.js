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
        const relativePath = path.join('/images', basePath, file).replace(/\\/g, '/');
        const nameWithoutExt = path.basename(file, path.extname(file));
        const key = path.join('/images', basePath, nameWithoutExt).replace(/\\/g, '/').toLowerCase();
        fileMap.set(key, relativePath);
      }
    }
  }
  
  traverse(PUBLIC_IMAGES_DIR);
  return fileMap;
}

function processFile(filePath, fileMap) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 查找所有 /images/ 开头的路径
    const imagePaths = content.match(/\/images\/[^\s"'<>]+/g) || [];
    
    for (const imagePath of imagePaths) {
      if (imagePath.startsWith('http')) continue;
      
      // 尝试找到正确的文件
      const parsed = path.parse(imagePath);
      const key = path.join(parsed.dir, parsed.name).toLowerCase();
      const actualPath = fileMap.get(key);
      
      if (actualPath && actualPath !== imagePath) {
        const ossPath = `${OSS_BASE_URL}${actualPath}`;
        content = content.split(imagePath).join(ossPath);
        modified = true;
        console.log(`  ${imagePath} -> ${ossPath}`);
      } else if (actualPath === imagePath) {
        const ossPath = `${OSS_BASE_URL}${actualPath}`;
        content = content.split(imagePath).join(ossPath);
        modified = true;
        console.log(`  ${imagePath} -> ${ossPath}`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
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
          console.log(`\nProcessing: ${fullPath}`);
          if (processFile(fullPath, fileMap)) {
            updatedCount++;
          }
        }
      }
    }
  }
  
  traverse(dirPath);
  return updatedCount;
}

console.log('🔧 开始修复图片路径...\n');

console.log('📸 扫描本地图片文件...');
const fileMap = buildFileMap();
console.log(`找到 ${fileMap.size} 个图片文件\n`);

// 显示一些找到的文件
console.log('📂 找到的文件示例:');
let count = 0;
for (const [key, value] of fileMap) {
  if (count >= 10) break;
  console.log(`  ${key} -> ${value}`);
  count++;
}
console.log('...\n');

const dirsToProcess = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'content'),
  path.join(__dirname, '..', 'public', 'static')
];

let totalUpdated = 0;

for (const dir of dirsToProcess) {
  console.log(`\n📁 处理目录: ${dir}`);
  totalUpdated += processDirectory(dir, fileMap);
}

console.log(`\n✅ 完成！共更新了 ${totalUpdated} 个文件。`);
