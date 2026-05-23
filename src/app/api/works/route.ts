import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { compressWorkAssetBase64 } from '@/lib/tinify';
import {
  buildHashSuffix,
  buildStableAssetId,
  deleteRemoteAsset,
  getBase64ByteSize,
  getRemoteStorageThresholdBytes,
  isBase64DataUrl,
  isRemoteStorageEnabled,
  isRemoteUrl,
  uploadAssetToRemoteStorage,
} from '@/lib/media-storage';

const worksDirectory = path.join(process.cwd(), 'content/works');
const draftDirectory = path.join(process.cwd(), 'content/drafts');
// 改成 data/images/works，这样部署时不包含！
const publicImagesDirectory = path.join(process.cwd(), 'data', 'images', 'works');
const publicStaticDirectory = path.join(process.cwd(), 'public', 'static');

// 确保目录存在
if (!fs.existsSync(worksDirectory)) {
  fs.mkdirSync(worksDirectory, { recursive: true });
}

if (!fs.existsSync(draftDirectory)) {
  fs.mkdirSync(draftDirectory, { recursive: true });
}

// 添加内存缓存
let worksCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

function normalizeRemoteAssetRef(asset: any) {
  if (!asset || typeof asset !== 'object') {
    return null;
  }

  if (
    asset.provider === 'cloudinary' &&
    (asset.resourceType === 'image' || asset.resourceType === 'video') &&
    typeof asset.publicId === 'string' &&
    typeof asset.secureUrl === 'string'
  ) {
    return asset;
  }

  return null;
}

function collectRemoteAssets(work: any) {
  const assets = [];

  const coverAsset = normalizeRemoteAssetRef(work?.coverAsset);
  if (coverAsset) {
    assets.push(coverAsset);
  }

  if (Array.isArray(work?.media)) {
    work.media.forEach((item: any) => {
      const asset = normalizeRemoteAssetRef(item?.asset);
      if (asset) {
        assets.push(asset);
      }
    });
  }

  return assets;
}

async function deleteRemoteAssetsFromWork(work: any) {
  const assets = collectRemoteAssets(work);

  for (const asset of assets) {
    try {
      await deleteRemoteAsset(asset);
    } catch (error) {
      console.error('删除远端资源失败:', asset.publicId, error);
    }
  }
}

function deleteLocalStaticArtifacts(workId: string | number) {
  const normalizedId = String(workId);

  if (fs.existsSync(publicImagesDirectory)) {
    const imageFiles = fs.readdirSync(publicImagesDirectory);
    imageFiles.forEach((file) => {
      if (file.startsWith(`work-${normalizedId}-`)) {
        try {
          fs.unlinkSync(path.join(publicImagesDirectory, file));
        } catch (error) {
          console.error('删除本地图片失败:', file, error);
        }
      }
    });
  }

  const staticWorkFile = path.join(publicStaticDirectory, `work-${normalizedId}.json`);
  if (fs.existsSync(staticWorkFile)) {
    try {
      fs.unlinkSync(staticWorkFile);
    } catch (error) {
      console.error('删除静态详情文件失败:', staticWorkFile, error);
    }
  }
}

function listPublishedWorkFiles() {
  if (!fs.existsSync(worksDirectory)) {
    return [];
  }

  return fs.readdirSync(worksDirectory).filter((file) =>
    file.endsWith('.json') &&
    !['data.json', 'list.json', 'works-list.json'].includes(file) &&
    !file.startsWith('work-')
  );
}

async function optimizeCoverAsset(cover: string, workId: string) {
  if (!isBase64DataUrl(cover)) {
    return {
      cover,
      coverAsset: null,
    };
  }

  const compressed = await compressWorkAssetBase64(cover);
  return {
    cover: compressed.base64Data,
    coverAsset: null,
  };
}

async function optimizeMediaItem(item: any, workId: string, index: number) {
  if (!item || typeof item !== 'object' || typeof item.url !== 'string') {
    return item;
  }

  if (item.type === 'image' && isBase64DataUrl(item.url)) {
    const compressed = await compressWorkAssetBase64(item.url);
    const thresholdBytes = getRemoteStorageThresholdBytes();
    const contentHash = buildHashSuffix(compressed.base64Data);

    if (isRemoteStorageEnabled() && compressed.outputBytes > thresholdBytes) {
      const remoteAsset = await uploadAssetToRemoteStorage({
        base64Data: compressed.base64Data,
        resourceType: 'image',
        publicId: buildStableAssetId(['works', workId, 'media', index, contentHash]),
      });

      if (remoteAsset) {
        return {
          ...item,
          url: remoteAsset.secureUrl,
          asset: remoteAsset,
          source: 'remote',
        };
      }
    }

    return {
      ...item,
      url: compressed.base64Data,
      asset: null,
      source: 'local',
    };
  }

  if (item.type === 'video' && isBase64DataUrl(item.url) && isRemoteStorageEnabled()) {
    const contentHash = buildHashSuffix(item.url);
    const remoteAsset = await uploadAssetToRemoteStorage({
      base64Data: item.url,
      resourceType: 'video',
      publicId: buildStableAssetId(['works', workId, 'media', index, contentHash]),
    });

    if (remoteAsset) {
      return {
        ...item,
        url: remoteAsset.secureUrl,
        asset: remoteAsset,
        source: 'remote',
      };
    }
  }

  if (item.type === 'video' && isBase64DataUrl(item.url)) {
    return {
      ...item,
      source: 'local',
    };
  }

  if (isRemoteUrl(item.url)) {
    return {
      ...item,
      source: item.source || 'remote',
    };
  }

  return item;
}

async function optimizeWorkPayload(work: any) {
  const optimizedWork = {
    ...work,
    media: Array.isArray(work.media) ? [...work.media] : work.media,
  };

  const normalizedWorkId = String(optimizedWork.id || Date.now());

  if (typeof optimizedWork.cover === 'string') {
    const coverResult = await optimizeCoverAsset(optimizedWork.cover, normalizedWorkId);
    optimizedWork.cover = coverResult.cover;
    optimizedWork.coverAsset = coverResult.coverAsset;
  }

  if (Array.isArray(optimizedWork.media)) {
    optimizedWork.media = await Promise.all(
      optimizedWork.media.map((item: any, index: number) => optimizeMediaItem(item, normalizedWorkId, index))
    );
  }

  return optimizedWork;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draft = searchParams.get('draft') === 'true';
    
    // 检查缓存
    const now = Date.now();
    if (!draft && worksCache && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(worksCache, { status: 200 });
    }
    
    // 读取对应的目录
    const targetDirectory = draft ? draftDirectory : worksDirectory;
    
    // 确保目录存在
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }
    
    // 读取文件
    const files = fs.readdirSync(targetDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // 读取并解析JSON文件
      const works = jsonFiles.map(file => {
        try {
          const filePath = path.join(targetDirectory, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const parsedContent = JSON.parse(fileContent);
          console.log('Parsed file', file, ':', parsedContent.title || 'No title');
          return parsedContent;
        } catch (fileError) {
          console.error('Error parsing file', file, ':', fileError);
          return null;
        }
      }).filter(Boolean);
      
      console.log('Total works found:', works.length);
    
    // 按order字段排序
    works.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    // 缓存结果（非草稿）
    if (!draft) {
      worksCache = works;
      cacheTimestamp = now;
    }

    return NextResponse.json(works, { status: 200 });
  } catch (error) {
    console.error('获取作品数据失败:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  // 清除缓存
  worksCache = null;
  try {
    const data = await request.json();
    
    // 确保草稿目录存在
    if (!fs.existsSync(draftDirectory)) {
      fs.mkdirSync(draftDirectory, { recursive: true });
    }
    
    // 处理批量保存排序
    if (data.works && Array.isArray(data.works)) {
      for (const work of data.works) {
        const fileName = `${work.id || Date.now()}.json`;
        const filePath = path.join(draftDirectory, fileName);
        const optimizedWork = await optimizeWorkPayload(work);
        fs.writeFileSync(filePath, JSON.stringify(optimizedWork, null, 2));
      }
      return NextResponse.json({ success: true, message: '排序保存成功' });
    }
    
    // 处理单个作品保存
    const work = await optimizeWorkPayload(data);
    const fileName = `${work.id || Date.now()}.json`;
    const filePath = path.join(draftDirectory, fileName);
    
    // 写入草稿文件
    fs.writeFileSync(filePath, JSON.stringify(work, null, 2));
    
    return NextResponse.json({ success: true, message: '作品保存成功' });
  } catch (error) {
    console.error('保存作品失败:', error);
    return NextResponse.json({ success: false, message: '保存作品失败' });
  }
}

export async function DELETE(request: NextRequest) {
  // 清除缓存
  worksCache = null;
  try {
    const { id } = await request.json();
    
    // 查找并删除草稿文件
    const files = fs.readdirSync(draftDirectory);
    const fileToDelete = files.find(file => {
      try {
        const filePath = path.join(draftDirectory, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return content.id === id;
      } catch {
        return false;
      }
    });
    
    if (fileToDelete) {
      const filePath = path.join(draftDirectory, fileToDelete);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await deleteRemoteAssetsFromWork(content);
      fs.unlinkSync(filePath);
      deleteLocalStaticArtifacts(id);
      return NextResponse.json({ success: true, message: '作品删除成功' });
    }
    
    // 也尝试删除已发布的文件
    const publishedFiles = fs.readdirSync(worksDirectory);
    const publishedFileToDelete = publishedFiles.find(file => {
      try {
        const filePath = path.join(worksDirectory, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return content.id === id;
      } catch {
        return false;
      }
    });
    
    if (publishedFileToDelete) {
      const filePath = path.join(worksDirectory, publishedFileToDelete);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await deleteRemoteAssetsFromWork(content);
      fs.unlinkSync(filePath);
      deleteLocalStaticArtifacts(id);
      return NextResponse.json({ success: true, message: '作品删除成功' });
    }
    
    return NextResponse.json({ success: false, message: '作品不存在' });
  } catch (error) {
    console.error('删除作品失败:', error);
    return NextResponse.json({ success: false, message: '删除作品失败' });
  }
}

// 发布功能
export async function PUT(request: NextRequest) {
  // 清除缓存
  worksCache = null;
  try {
    console.log('开始发布作品...');
    
    // 确保目录存在
    if (!fs.existsSync(draftDirectory)) {
      fs.mkdirSync(draftDirectory, { recursive: true });
      console.log('草稿目录不存在，已创建:', draftDirectory);
    }
    
    if (!fs.existsSync(worksDirectory)) {
      fs.mkdirSync(worksDirectory, { recursive: true });
      console.log('发布目录不存在，已创建:', worksDirectory);
    }
    
    // 读取所有草稿文件
    const draftFiles = fs.readdirSync(draftDirectory).filter(file => file.endsWith('.json') && file !== 'data.json');
    
    if (draftFiles.length === 0) {
      console.log('没有待发布的作品');
      return NextResponse.json({ success: false, message: '没有待发布的作品' });
    }
    
    console.log('找到', draftFiles.length, '个待发布作品');
    const currentDraftFileSet = new Set(draftFiles);
    
    // 复制草稿到发布目录
    const works: any[] = [];
    draftFiles.forEach(file => {
      try {
        const draftPath = path.join(draftDirectory, file);
        const publishPath = path.join(worksDirectory, file);
        fs.copyFileSync(draftPath, publishPath);
        
        // 同时读取用于生成data.json
        const fileContent = fs.readFileSync(draftPath, 'utf8');
        const work = JSON.parse(fileContent);
        works.push(work);
        console.log('已复制作品:', work.title || file);
      } catch (error) {
        console.error('处理草稿文件失败:', file, error);
      }
    });

    // 删除已发布目录中不再存在的旧作品文件
    const publishedFiles = listPublishedWorkFiles();
    publishedFiles.forEach((file) => {
      if (!currentDraftFileSet.has(file)) {
        const filePath = path.join(worksDirectory, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          fs.unlinkSync(filePath);
          deleteLocalStaticArtifacts(content.id || file.replace('.json', ''));
          console.log('已删除失效作品文件:', file);
        } catch (error) {
          console.error('删除失效作品文件失败:', file, error);
        }
      }
    });
    
    // 按 order 字段排序
    works.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    console.log('作品排序完成');
    
    // 生成静态数据文件 data.json
    const dataJsonPath = path.join(worksDirectory, 'data.json');
    fs.writeFileSync(dataJsonPath, JSON.stringify(works, null, 2));
    console.log('✅ 生成静态数据文件成功:', dataJsonPath);
    
    console.log('✅ 发布完成，共', works.length, '个作品');
    
    // 生成静态文件（包括提取图片）
    console.log('开始生成静态文件...');
    try {
      const { execSync } = require('child_process');
      const scriptPath = path.join(process.cwd(), 'scripts/generate-static-files.js');
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      console.log('✅ 静态文件生成完成');
    } catch (scriptError) {
      console.error('生成静态文件失败:', scriptError);
      // 不阻塞发布流程
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '发布成功',
      count: works.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ 发布失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '发布失败: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// 获取草稿数量
export async function PATCH(request: NextRequest) {
  try {
    const draftFiles = fs.readdirSync(draftDirectory);
    return NextResponse.json({ success: true, draftCount: draftFiles.length });
  } catch (error) {
    console.error('获取草稿数量失败:', error);
    return NextResponse.json({ success: false, draftCount: 0 });
  }
}
