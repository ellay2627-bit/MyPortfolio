const fs = require('fs');
const path = require('path');

// 创建 data 文件夹，存放 works 图片，这样 Next.js 不打包部署！
const srcDir = path.join(__dirname, '..', 'public', 'images', 'works');
const destDir = path.join(__dirname, '..', 'data', 'images', 'works');
const aboutBackupDir = path.join(__dirname, '..', 'data', 'images', 'about');

console.log('正在把图片移动到 data/，这样部署时不包含！');

// 确保目标目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(destDir);
ensureDir(aboutBackupDir);

// 只在第一次运行时移动，如果 data/ 已经有内容，就跳过
if (fs.existsSync(srcDir) && fs.readdirSync(srcDir).length > 0 && !fs.existsSync(path.join(destDir, '._done'))) {
  console.log('正在移动 public/images/works → data/images/works...');
  
  // 复制所有内容
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  // 备份 about 图片到 data/
  const aboutSrc = path.join(__dirname, '..', 'public', 'images', 'about');
  if (fs.existsSync(aboutSrc)) {
    console.log('正在备份 public/images/about → data/images/about...');
    fs.cpSync(aboutSrc, aboutBackupDir, { recursive: true });
  }
  
  // 标记完成
  fs.writeFileSync(path.join(destDir, '._done'), 'done');
  
  console.log('✅ 完成！图片已移动到 data/ 文件夹！');
  console.log('📦 现在部署时，Vercel 不会打包 works 里几百MB的图片了！');
} else {
  console.log('ℹ️ 已经处理过了，跳过移动！');
}
