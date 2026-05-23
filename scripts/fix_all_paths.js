const fs = require('fs');
const path = require('path');

const OSS_BASE = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';

// 扫描目录
const contentDir = path.join(__dirname, '..', 'content', 'works');
const staticDir = path.join(__dirname, '..', 'public', 'static');

// 获取本地图片列表
const localImagesDir = path.join(__dirname, '..', 'data', 'images');

// 获取本地图片路径到扩展名映射
function getLocalImages() {
    const images = {};
    
    function scanDir(dir, basePath = '') {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const relativePath = path.join(basePath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath, relativePath);
            } else {
                const key = relativePath.replace(/\\/g, '/');
                images[key] = key;
            }
        }
    }
    
    scanDir(localImagesDir);
    return images;
}

const localImages = getLocalImages();

console.log('本地图片数:', Object.keys(localImages).length);

// 查找文件内容
function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 替换本地图片路径
    content = content.replace(/(["'])(\/images\/[^"'\\]+\.(webp|png|jpg|jpeg|gif))(["'])/gi, (match, start, imgPath, ext, end) => {
        // 先去掉开头的 /
        let actualPath = imgPath.substring(1);
        if (localImages[actualPath]) {
            hasChanges = true;
            return `${start}${OSS_BASE}/${actualPath}${end}`;
        }
        return match;
    });
    
    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('已更新:', filePath);
        return true;
    }
    
    return false;
}

// 扫描 content/works 目录下所有 JSON
const contentFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
let contentUpdated = 0;
for (const file of contentFiles) {
    if (updateFile(path.join(contentDir, file))) {
        contentUpdated++;
    }
}

console.log(`\ncontent/works 目录更新: ${contentUpdated} 个文件\n`);

// 扫描 public/static 目录下所有 JSON
const staticFiles = fs.readdirSync(staticDir).filter(f => f.endsWith('.json'));
let staticUpdated = 0;
for (const file of staticFiles) {
    if (updateFile(path.join(staticDir, file))) {
        staticUpdated++;
    }
}

console.log(`public/static 目录更新: ${staticUpdated} 个文件\n`);

console.log('总共更新:', contentUpdated + staticUpdated, '个文件');
