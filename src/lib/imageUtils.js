const fs = require('fs');
const path = require('path');

const publicUploadsDir = path.join(process.cwd(), 'public/uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
}

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function getNewFilename(originalFilename) {
  const ext = getFileExtension(originalFilename);
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
}

async function saveUploadedFile(base64Data, originalFilename) {
  ensureUploadsDir();
  
  try {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('无效的 Base64 数据');
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');
    
    const newFilename = getNewFilename(originalFilename);
    const filePath = path.join(publicUploadsDir, newFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${newFilename}`;
  } catch (error) {
    console.error('保存文件失败:', error);
    return null;
  }
}

async function saveBase64Image(base64Data, filename) {
  return await saveUploadedFile(base64Data, filename);
}

async function deleteUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    return false;
  }
  
  try {
    const filename = fileUrl.replace('/uploads/', '');
    const filePath = path.join(publicUploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('删除文件成功:', filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
}

function generateWorksListJson(works) {
  const list = works.map(work => ({
    id: work.id,
    title: work.title,
    brief: work.brief || '',
    category: work.category || [],
    cover: work.cover || '',
    ratio: work.ratio || '4:3',
    order: work.order || 0
  }));
  
  list.sort((a, b) => a.order - b.order);
  return list;
}

function generateWorkDetailJson(work) {
  return {
    id: work.id,
    title: work.title,
    brief: work.brief || '',
    description: work.description || '',
    category: work.category || [],
    cover: work.cover || '',
    ratio: work.ratio || '4:3',
    order: work.order || 0,
    links: work.links || [],
    media: work.media || []
  };
}

module.exports = {
  saveUploadedFile,
  saveBase64Image,
  deleteUploadedFile,
  generateWorksListJson,
  generateWorkDetailJson,
  ensureUploadsDir
};
