# Vercel + OSS 混合发布说明

这个方案保留：
- 页面 HTML 继续部署在 Vercel
- 大的静态资源改走阿里云 OSS

改走 OSS 的资源包括：
- `/_next/static/*`
- `/static/*.json`
- `/images/*`

## 适合你的原因

- 不改你的域名 `ellay.top`
- 不要求你现在备案
- 比“全部资源都在 Vercel”更适合大陆访问
- 你可以接受手动发布

## 每次更新公开站的步骤

1. 本地后台发布作品
2. 生成要上传 OSS 的静态资源：

```bash
npm run build:oss-assets
```

3. 生成后会得到：

```bash
dist-oss-assets/
```

4. 把 `dist-oss-assets/` 里的内容上传到 OSS bucket 根目录

5. 在 Vercel 项目里配置环境变量：

```bash
NEXT_PUBLIC_USE_OSS_STATIC=true
```

6. 再把当前项目正常部署到 Vercel

## 你上传到 OSS 的内容

- `_next/static/*`
- `static/*`
- `images/*`

## 你部署到 Vercel 的内容

- 正常的 Next 项目代码
- Vercel 继续负责页面 HTML 和路由
- 但需要开启环境变量 `NEXT_PUBLIC_USE_OSS_STATIC=true`

## 访问时的效果

- `https://ellay.top/` 还是 Vercel 页面
- 但页面里引用的 JS/CSS 会改从 OSS 拉
- 作品 JSON 也从 OSS 拉
- 图片继续从 OSS 拉

## 注意

如果你漏传 OSS 资源，前台会出现样式或脚本加载失败。
所以每次正式上线前，建议按顺序执行：

1. `npm run build:oss-assets`
2. 上传 OSS
3. 再部署 Vercel
