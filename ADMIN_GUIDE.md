# 后台管理系统使用指南

## 系统概览

这是一个用于管理个人作品集的后台管理系统，包含以下功能：

- ✅ 作品管理：添加、编辑、删除作品
- ✅ 作品排序：通过拖拽或上下移动调整作品顺序
- ✅ 标签管理：支持 UX设计、视觉设计、品牌设计、动态设计、其他
- ✅ 媒体管理：支持图片（常规和GIF）和视频（bilibili、YouTube等）
- ✅ 用户认证：通过 Supabase Auth 进行登录认证

## 快速开始

### 1. 设置 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建一个新项目
2. 创建后，进入项目设置 -> API，获取以下信息：
   - Project URL
   - anon/public key

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`，填入你的 Supabase 信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 设置数据库

在 Supabase SQL Editor 中运行 `supabase-schema.sql` 文件中的内容，这将：

- 创建 `works` 表
- 设置正确的权限策略
- 插入示例数据

### 4. 创建管理员账户

在 Supabase 后台的 Authentication -> Users 中添加新用户，或者通过注册页面创建。

### 5. 启动开发服务器

```bash
npm run dev
```

## 使用说明

### 访问后台

- 后台首页：`http://localhost:3000/admin`
- 登录页面：`http://localhost:3000/admin/login`
- 作品管理：`http://localhost:3000/admin/works`

### 作品管理功能

#### 添加作品

1. 点击「添加作品」按钮
2. 填写基本信息：
   - 作品标题（必填）
   - 简介（必填）
   - 详细描述（必填）
   - 分类标签（可多选）
   - 图片比例（16:9 或 4:3）
   - 封面图片URL（必填）
3. 添加作品图片（可选，可多个）
4. 添加视频链接（可选，可多个，支持 bilibili、YouTube 等）
5. 点击「保存作品」

#### 编辑作品

1. 在作品列表中找到要编辑的作品
2. 点击「编辑」按钮
3. 修改需要更新的内容
4. 点击「保存作品」

#### 删除作品

1. 在作品列表中找到要删除的作品
2. 点击「删除」按钮
3. 确认删除操作

#### 调整作品顺序

1. 在作品列表中找到要调整顺序的作品
2. 点击向上或向下箭头按钮
3. 顺序会自动保存

## 数据库结构

### works 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| title | text | 作品标题 |
| brief | text | 作品简介 |
| description | text | 详细描述 |
| category | text[] | 分类标签数组 |
| cover | text | 封面图片URL |
| ratio | text | 图片比例（16:9/4:3） |
| order | int | 显示顺序 |
| images | text[] | 作品图片URL数组 |
| videos | text[] | 视频URL数组 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## 前端集成

前端作品展示组件（`src/components/Work.tsx`）已经与 Supabase 集成：

- 自动从数据库获取作品数据
- 按 `order` 字段排序
- 如果数据库连接失败，会使用硬编码的默认数据作为后备方案
- 支持分类筛选

## 安全策略

数据库已配置以下安全策略：

- ✅ 任何人都可以读取作品数据（用于前端展示）
- ✅ 只有认证用户可以添加、编辑、删除作品
- ✅ 使用 Supabase Auth 进行身份认证

## 常见问题

### 如何上传图片到 Supabase Storage？

当前版本使用 URL 方式添加图片。如需使用 Supabase Storage 上传：

1. 在 Supabase 后台创建名为 `portfolio-images` 的存储桶
2. 设置存储桶权限为公开读取
3. 上传图片后获取 URL 填入后台

### 视频链接格式要求？

- Bilibili：使用嵌入链接格式，如 `https://player.bilibili.com/player.html?bvid=xxx`
- YouTube：使用嵌入链接格式，如 `https://www.youtube.com/embed/xxx`
- 其他视频平台：请使用支持 iframe 嵌入的链接

### 如何重置数据库？

在 Supabase SQL Editor 中运行：

```sql
DROP TABLE IF EXISTS works CASCADE;
```

然后重新运行 `supabase-schema.sql` 中的内容。
