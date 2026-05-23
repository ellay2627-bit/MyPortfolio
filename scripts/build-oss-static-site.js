const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const nextServerAppDir = path.join(projectRoot, '.next', 'server', 'app');
const nextStaticDir = path.join(projectRoot, '.next', 'static');
const publicDir = path.join(projectRoot, 'public');
const outputDir = path.join(projectRoot, 'dist-oss');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function emptyDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function copyFile(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDir(source, target, filter) {
  if (!fs.existsSync(source)) return;

  const entries = fs.readdirSync(source, { withFileTypes: true });
  ensureDir(target);

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (filter && !filter(srcPath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, filter);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function copyHtmlAsIndex(sourceHtmlPath, destDir) {
  ensureDir(destDir);
  copyFile(sourceHtmlPath, path.join(destDir, 'index.html'));
}

function buildPublicSite() {
  if (!fs.existsSync(nextServerAppDir) || !fs.existsSync(nextStaticDir)) {
    throw new Error('未找到 .next 构建产物，请先运行 npm run build');
  }

  emptyDir(outputDir);

  copyHtmlAsIndex(path.join(nextServerAppDir, 'index.html'), outputDir);
  copyFile(path.join(nextServerAppDir, '_not-found.html'), path.join(outputDir, '404.html'));

  const worksDir = path.join(nextServerAppDir, 'works');
  if (fs.existsSync(worksDir)) {
    const workEntries = fs.readdirSync(worksDir, { withFileTypes: true });

    for (const entry of workEntries) {
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

      const workId = entry.name.replace(/\.html$/, '');
      copyHtmlAsIndex(path.join(worksDir, entry.name), path.join(outputDir, 'works', workId));
    }
  }

  copyDir(nextStaticDir, path.join(outputDir, '_next', 'static'));

  copyDir(path.join(publicDir, 'static'), path.join(outputDir, 'static'));
  copyDir(path.join(publicDir, 'pdf'), path.join(outputDir, 'pdf'));

  const extraPublicFiles = ['favicon.ico', 'robots.txt', 'sitemap.xml'];
  for (const fileName of extraPublicFiles) {
    const sourcePath = path.join(publicDir, fileName);
    if (fs.existsSync(sourcePath)) {
      copyFile(sourcePath, path.join(outputDir, fileName));
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    outputDir,
    notes: [
      'dist-oss 仅包含公开前台站点，不包含本地 admin 后台。',
      '作品图片继续走现有阿里云 OSS 外链，不重复打包上传。',
      '如需国内访问更稳，可先使用 OSS 静态网站托管，后续再按需接 CDN。',
    ],
  };

  fs.writeFileSync(
    path.join(outputDir, 'deploy-manifest.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`OSS 静态站已生成：${outputDir}`);
}

buildPublicSite();
