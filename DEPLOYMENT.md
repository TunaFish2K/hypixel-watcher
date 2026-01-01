# Hypixel Watcher - 部署指南

## 📦 项目架构

本项目采用前后端分离架构：

- **前端**: React SPA，部署到 Cloudflare Pages
- **后端**: Elysia.js API，部署到 Cloudflare Workers
- **开发环境**: 前后端合并运行（单服务器）
- **生产环境**: 前后端独立部署

---

## 🚀 本地开发

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

`.env` 文件内容（开发环境默认配置）：

```env
VITE_API_URL=http://localhost:5173
```

> 注意：开发环境下前后端运行在同一服务器 (localhost:5173)，所以 API_URL 指向本地。

### 3. 启动开发服务器

```bash
bun run dev
```

这将启动包含前后端的开发服务器，访问 http://localhost:5173

---

## ☁️ Cloudflare 部署

### 第一步：部署后端 API (Workers)

#### 1.1 安装 Wrangler

```bash
bun add -D wrangler
```

#### 1.2 登录 Cloudflare

```bash
bunx wrangler login
```

#### 1.3 部署 Worker

```bash
bunx wrangler deploy
```

部署成功后，你会得到一个 Worker URL，例如：
```
https://hypixel-watcher-api.your-subdomain.workers.dev
```

**记住这个 URL，稍后配置前端时需要用到！**

---

### 第二步：部署前端 (Cloudflare Pages)

#### 2.1 在 Cloudflare Dashboard 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择你的 GitHub/GitLab 仓库
4. 配置构建设置

#### 2.2 配置构建参数

**重要：Cloudflare Pages 需要使用 Bun 构建！**

在 Cloudflare Pages 项目设置中配置：

| 配置项 | 值 |
|--------|-----|
| **Build command** | `curl -fsSL https://bun.sh/install \| bash && export PATH="$HOME/.bun/bin:$PATH" && bun install && bun run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (留空或填根目录) |

#### 2.3 配置环境变量

在 Cloudflare Pages 项目的 **Settings** → **Environment variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | `https://hypixel-watcher-api.your-subdomain.workers.dev` | 你的 Worker API 地址 |

> ⚠️ 重要：将 URL 替换为你在第一步部署的实际 Worker URL！

#### 2.4 触发部署

配置完成后：
1. 点击 **Save** 保存环境变量
2. 前往 **Deployments** 页面
3. 点击 **Retry deployment** 重新构建（使用新的环境变量）

部署成功后，你会得到一个 Pages URL，例如：
```
https://hypixel-watcher.pages.dev
```

---

## 🔧 开发 vs 生产环境对比

### 开发环境

```bash
bun run dev
```

- 前后端运行在同一服务器 (localhost:5173)
- `VITE_API_URL=http://localhost:5173`
- 热重载 (HMR) 支持
- 自动加载 `.env` 文件

### 生产环境

**前端 (Cloudflare Pages)**
- 独立部署，静态资源托管
- 通过 `VITE_API_URL` 环境变量连接后端
- 构建时注入环境变量

**后端 (Cloudflare Workers)**
- 独立部署，边缘计算
- 纯 API 服务，无静态资源

---

## 📝 常见问题

### Q1: 前端构建失败，提示找不到模块

**原因**: Cloudflare Pages 默认使用 Node.js，但项目需要 Bun。

**解决**: 在构建命令中先安装 Bun：
```bash
curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH" && bun install && bun run build
```

### Q2: 前端部署成功但 API 调用失败

**可能原因**:
1. `VITE_API_URL` 环境变量未正确配置
2. Worker 未部署或 URL 错误
3. CORS 问题

**检查步骤**:
1. 确认 Worker 已成功部署：`bunx wrangler deployments list`
2. 检查 Pages 环境变量中的 `VITE_API_URL` 是否正确
3. 重新部署 Pages 以应用新环境变量

### Q3: 如何查看 Worker 日志？

```bash
bunx wrangler tail
```

### Q4: 如何本地测试 Worker？

```bash
bunx wrangler dev server/worker.ts
```

---

## 🎯 完整部署流程总结

```bash
# 1. 部署后端
bunx wrangler deploy
# 记录 Worker URL: https://your-api.workers.dev

# 2. 在 Cloudflare Pages Dashboard 配置：
#    - Build command: curl -fsSL https://bun.sh/install | bash && ...
#    - Environment variable: VITE_API_URL=https://your-api.workers.dev

# 3. 推送代码到 Git，触发 Pages 自动部署
git add .
git commit -m "Setup Cloudflare deployment"
git push

# 4. 访问你的 Pages URL 测试
```

---

## 🛠️ 更新部署

### 更新后端

```bash
bunx wrangler deploy
```

### 更新前端

直接推送代码到 Git，Cloudflare Pages 会自动构建部署：

```bash
git push
```

或在 Cloudflare Dashboard 手动触发重新部署。

---

## 🌟 最佳实践

1. **环境变量管理**:
   - 本地开发使用 `.env`
   - 生产环境在 Cloudflare Dashboard 配置
   - 不要将 `.env` 提交到 Git（已添加到 `.gitignore`）

2. **前后端版本同步**:
   - 后端 API 变更后，确保前端类型定义同步
   - 使用 `@elysiajs/eden` 的类型推导保证类型安全

3. **域名配置** (可选):
   - Pages: 在 Cloudflare Pages 设置自定义域名
   - Workers: 在 `wrangler.toml` 中配置 routes

---

祝部署顺利！ฅ'ω'ฅ
