const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist-oss-assets');
const nextStaticDir = path.join(projectRoot, '.next', 'static');
const publicStaticDir = path.join(projectRoot, 'public', 'static');
const publicImagesDir = path.join(projectRoot, 'public', 'images');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function copyFile(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;

  const entries = fs.readdirSync(source, { withFileTypes: true });
  ensureDir(target);

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function main() {
  if (!fs.existsSync(nextStaticDir)) {
    throw new Error('未找到 .next/static，请先运行构建命令');
  }

  resetDir(outputDir);

  copyDir(nextStaticDir, path.join(outputDir, '_next', 'static'));
  copyDir(publicStaticDir, path.join(outputDir, 'static'));
  copyDir(publicImagesDir, path.join(outputDir, 'images'));

  const manifest = {
    generatedAt: new Date().toISOString(),
    outputDir,
    uploadTargets: [
      '/_next/static/*',
      '/static/*',
      '/images/*',
    ],
    note: '这些文件上传到 OSS 后，Vercel 前台可通过 assetPrefix + 绝对静态资源地址访问。',
  };

  fs.writeFileSync(
    path.join(outputDir, 'upload-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`OSS 静态资源已生成：${outputDir}`);
}

main();
