const fs = require('fs');
const path = require('path');

const OSS_BASE_URL = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';

function replaceImagePathsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;
    
    content = content.replace(/\/images\/([^\s"'<>]+)/g, `${OSS_BASE_URL}/images/$1`);
    
    if (content !== originalContent) {
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

function processDirectory(dirPath) {
  let updatedCount = 0;
  
  function traverse(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git') {
          continue;
        }
        traverse(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          if (replaceImagePathsInFile(fullPath)) {
            updatedCount++;
          }
        }
      }
    }
  }
  
  traverse(dirPath);
  return updatedCount;
}

console.log('开始迁移图片路径到阿里云 OSS...\n');

const dirsToProcess = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../content'),
  path.join(__dirname, '../public/static')
];

let totalUpdated = 0;

for (const dir of dirsToProcess) {
  if (fs.existsSync(dir)) {
    console.log(`处理目录: ${dir}`);
    totalUpdated += processDirectory(dir);
  }
}

console.log(`\n迁移完成！共更新了 ${totalUpdated} 个文件。`);
