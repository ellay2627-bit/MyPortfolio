import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const worksDirectory = path.join(process.cwd(), 'content/works');
const draftDirectory = path.join(process.cwd(), 'content/drafts');

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
        fs.writeFileSync(filePath, JSON.stringify(work, null, 2));
      }
      return NextResponse.json({ success: true, message: '排序保存成功' });
    }
    
    // 处理单个作品保存
    const work = data;
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
      fs.unlinkSync(path.join(draftDirectory, fileToDelete));
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
      fs.unlinkSync(path.join(worksDirectory, publishedFileToDelete));
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
    
    // 清空已发布目录（保留data.json，最后更新）
    const publishedFiles = fs.readdirSync(worksDirectory);
    publishedFiles.forEach(file => {
      if (file !== 'data.json') {
        const filePath = path.join(worksDirectory, file);
        try {
          fs.unlinkSync(filePath);
          console.log('已删除旧文件:', file);
        } catch (error) {
          console.error('删除文件失败:', file, error);
        }
      }
    });
    
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
