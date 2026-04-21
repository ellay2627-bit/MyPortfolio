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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draft = searchParams.get('draft') === 'true';
    
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

    console.log('Returning works:', works.length);
    return NextResponse.json(works, { status: 200 });
  } catch (error) {
    console.error('获取作品数据失败:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
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
  try {
    // 读取所有草稿文件
    const draftFiles = fs.readdirSync(draftDirectory);
    
    if (draftFiles.length === 0) {
      return NextResponse.json({ success: false, message: '没有待发布的作品' });
    }
    
    // 清空已发布目录
    const publishedFiles = fs.readdirSync(worksDirectory);
    publishedFiles.forEach(file => {
      fs.unlinkSync(path.join(worksDirectory, file));
    });
    
    // 复制草稿到发布目录
    draftFiles.forEach(file => {
      const draftPath = path.join(draftDirectory, file);
      const publishPath = path.join(worksDirectory, file);
      fs.copyFileSync(draftPath, publishPath);
    });
    
    return NextResponse.json({ success: true, message: '发布成功' });
  } catch (error) {
    console.error('发布失败:', error);
    return NextResponse.json({ success: false, message: '发布失败' });
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
