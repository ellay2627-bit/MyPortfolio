# 部署指南 - 方案1：Vercel + 阿里云CDN

## 📋 部署步骤总览

### 阶段1：Vercel部署（5-10分钟）
### 阶段2：阿里云CDN配置（10-15分钟）
### 阶段3：数据管理方案（5分钟）

---

## 🚀 阶段1：Vercel部署

### 1.1 准备工作

确保你的项目已经推送到GitHub（已完成✅）

### 1.2 登录Vercel并导入项目

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "Add New Project"
4. 在Git Repository列表中选择你的Portfolio项目
5. 点击 "Import"

### 1.3 配置项目

**Project Name**: `your-portfolio-name`（可自定义）
**Framework Preset**: Next.js（Vercel会自动识别）
**Root Directory**: `./`
**Build Command**: 保持默认（`npm run build`）
**Output Directory**: 保持默认（`.next`）
**Install Command**: 保持默认（`npm install`）

**Environment Variables（重要）**：
检查项目是否需要配置环境变量（目前项目使用Supabase但主要是文件存储，暂时不需要特殊环境变量）

### 1.4 部署

点击 "Deploy" 按钮，等待2-3分钟部署完成。

部署成功后，你会得到一个Vercel域名，例如：`https://your-portfolio.vercel.app`

---

## 🌐 阶段2：阿里云CDN配置

### 2.1 准备工作

如果你还没有阿里云账号，请先注册：
- 阿里云官网：[https://www.aliyun.com](https://www.aliyun.com)
- 新用户有免费CDN额度

### 2.2 购买/开通CDN服务

1. 登录阿里云控制台
2. 搜索 "CDN" 进入CDN产品页面
3. 点击 "立即开通" 或选择适合的套餐
4. 新用户可以使用免费额度

### 2.3 添加加速域名

1. 在CDN控制台点击 "添加域名"
2. **加速域名**：填写你想使用的域名，例如 `portfolio.yourdomain.com`
3. **业务类型**：静态加速（Web）
4. **源站配置**：
   - 源站类型：源站域名
   - 源站地址：填写Vercel分配的域名，例如 `your-portfolio.vercel.app`
   - 端口：80/443
5. 点击 "下一步" 完成添加

### 2.4 配置CNAME

域名添加后，阿里云会给你一个CNAME地址，你需要：

1. 去你的域名注册商处（阿里云DNS、腾讯云DNSPod等）
2. 添加CNAME记录
   - 主机记录：例如 `portfolio`（如果你的域名是 `yourdomain.com`）
   - 记录类型：CNAME
   - 记录值：阿里云提供的CNAME地址
3. 等待DNS生效（通常几分钟到几小时）

### 2.5 配置HTTPS（推荐）

1. 在CDN控制台 -> HTTPS配置
2. 点击 "配置证书"
3. 可以申请免费证书（由阿里云免费提供）
4. 按照提示完成证书申请和配置

### 2.6 缓存策略配置（可选）

建议配置合理的缓存策略：
- 静态资源（图片、CSS、JS）：缓存7天
- HTML页面：不缓存或短时间缓存

---

## 📂 阶段3：数据管理方案

### 方案A：Git管理（推荐，适合目前项目）

因为你的项目使用文件系统存储作品数据（JSON文件），我们可以用Git管理：

1. **更新作品流程**：
   - 在本地更新 `content/works/` 或 `content/drafts/` 目录下的JSON文件
   - `git add content/`
   - `git commit -m "更新作品：xxx"`
   - `git push`
   - Vercel会自动重新部署

2. **优点**：
   - 版本控制完整
   - 部署自动化
   - 不需要修改代码

### 方案B：Supabase（长期方案，需要修改代码）

如果你想以后使用后台管理系统，可以考虑迁移到Supabase：

1. 注册Supabase账号
2. 创建作品数据表
3. 修改API路由读取Supabase而不是文件系统
4. 保留后台管理功能

---

## ✅ 部署检查清单

- [ ] 项目成功推送到GitHub
- [ ] Vercel导入项目并成功部署
- [ ] 获取Vercel分配的域名
- [ ] 阿里云CDN服务已开通
- [ ] 添加加速域名并配置源站
- [ ] 配置CNAME记录并生效
- [ ] 配置HTTPS证书（可选但推荐）
- [ ] 测试访问CDN域名，确保正常
- [ ] 确定数据管理方案并执行

---

## 🔍 故障排查

### Vercel部署失败
- 检查 `package.json` 中的build命令是否正确
- 查看Vercel的部署日志

### CDN访问异常
- 确认CNAME记录是否生效（可用 `nslookup` 或在线工具检查）
- 检查源站配置是否正确
- 等待DNS传播（最多24小时）

---

## 📞 下一步

准备好了吗？我们可以从阶段1开始！你需要：
1. 先去Vercel部署
2. 然后回来我帮你继续配置CDN

需要我协助你做哪一步吗？
