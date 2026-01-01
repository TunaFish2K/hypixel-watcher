# Hypixel Watcher

一个用于监控 Hypixel 玩家在线状态的纯前端应用。

## 📦 项目架构

本项目是**纯前端应用**：

- **前端**: React SPA
- **API**: 直接调用公共 API（PlayerDB.co + Hypixel API）
- **部署**: 仅需部署到 Cloudflare Pages（或任何静态托管）
- **无后端**: 不需要 Cloudflare Workers 或其他后端服务

### 架构特点

- ✨ **零后端成本**: 无需服务器或 Serverless 函数
- 🚀 **极致简化**: 纯静态文件，部署简单
- 🌍 **CORS 友好**: 所有 API 支持跨域访问
- 📡 **API 直连**:
  - [PlayerDB.co API](https://playerdb.co) - 获取玩家 UUID
  - [Hypixel API](https://api.hypixel.net) - 查询玩家状态

---

## 🚀 本地开发

### 1. 安装依赖

```bash
bun install
```

### 2. 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:5173

---

## ☁️ 部署到 Cloudflare Pages

> ⚠️ **重要**:
> - 这是**纯静态项目**，选择 **Pages** 而不是 Workers
> - `wrangler.toml` 只配置 Pages 输出目录，不包含 Workers 配置
> - Cloudflare Pages 会自动处理静态文件托管

### 方法 1: Git 自动部署（推荐）

#### 1.1 推送代码到 Git

```bash
git add .
git commit -m "Deploy Hypixel Watcher"
git push
```

#### 1.2 在 Cloudflare Dashboard 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签页（不是 Workers！）
5. 点击 **Connect to Git**
6. 选择你的 GitHub/GitLab 仓库
7. 配置构建设置

#### 1.3 配置构建参数

**重要提示**：
- ✅ 只配置 **Build command** 和 **Build output directory**
- ❌ **不要配置** Deploy command（留空，让 wrangler.toml 自动处理）

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | None（选择无框架）|
| **Build command** | `curl -fsSL https://bun.sh/install \| bash && export PATH="$HOME/.bun/bin:$PATH" && bun install && bun run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (留空) |
| **Deploy command** | (留空，wrangler.toml 会自动指定) |

#### 1.4 部署

点击 **Save and Deploy**，Cloudflare 会自动构建并部署你的应用！

> 💡 **常见错误排查**:
> - ❌ "Worker name undefined" → 确保 wrangler.toml 只有 `name` 和 `pages_build_output_dir`
> - ❌ "Must specify a directory" → 确保 wrangler.toml 包含 `pages_build_output_dir = "dist"`
> - ✅ 正确的 wrangler.toml 应该只有 2-3 行配置

部署成功后，你会得到一个 URL，例如：
```
https://hypixel-watcher.pages.dev
```

---

### 方法 2: 使用 Wrangler CLI 部署

#### 2.1 本地构建

```bash
bun run build
```

这会在 `dist/` 目录生成静态文件。

#### 2.2 使用 Wrangler 部署到 Pages

```bash
bunx wrangler pages deploy dist --project-name hypixel-watcher
```

> 注意：使用 `wrangler pages deploy`（不是 `wrangler deploy`），这样会部署为 Pages 而不是 Workers。

---

## 🌟 其他部署选项

由于这是纯静态前端应用，你可以部署到任何静态托管服务：

- **Cloudflare Pages** (推荐，免费 + CDN)
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **任何支持静态文件的服务器**

只需运行 `bun run build` 然后上传 `dist/` 目录即可！

---

## 🔧 开发说明

### 项目结构

```
hypixel-watcher/
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── utils/
│   │   └── uuid.ts          # API 调用函数（PlayerDB + Hypixel）
│   ├── index.html           # HTML 入口
│   ├── index.tsx            # React 入口
│   ├── index.css            # 全局样式
│   └── App.css              # 应用样式
├── dist/                    # 构建输出（自动生成）
└── package.json
```

### 极简开发流程

感谢 Bun 的强大功能，开发超级简单喵～

**开发**：
```bash
bun --hot src/index.html
```
直接运行 HTML 文件，支持热重载！

**构建**：
```bash
bun build src/index.html --outdir dist --minify
```
一条命令搞定构建！

### 使用的 API

#### PlayerDB.co API
```
GET https://playerdb.co/api/player/minecraft/{playerName}
```
用于获取玩家的 UUID。

#### Hypixel API
```
GET https://api.hypixel.net/status?key={apiKey}&uuid={uuid}
```
用于查询玩家在线状态。需要 [Hypixel API Key](https://developer.hypixel.net/)。

---

## 🎯 使用方法

1. 访问部署的应用
2. 输入你的 **Hypixel API Key**（[获取方式](https://developer.hypixel.net/)）
3. 输入要监控的 **玩家名**
4. 选择通知模式（始终通知 / 仅上线时通知）
5. 点击 **Watch** 开始监控
6. 应用会每 15 秒检查一次玩家状态，并在浏览器通知你

---

## 📝 常见问题

### Q1: 为什么需要 API Key？

Hypixel API 需要 API Key 才能查询玩家状态。你可以：
1. 在 Hypixel 服务器内执行 `/api new`
2. 或访问 [Hypixel Developer Dashboard](https://developer.hypixel.net/)

### Q2: 这个应用安全吗？API Key 会被泄露吗？

- ✅ API Key 仅存储在你的浏览器本地
- ✅ 不会发送到任何第三方服务器（除了 Hypixel API 本身）
- ✅ 完全开源，可以自己部署

### Q3: 支持哪些浏览器？

需要支持以下特性的现代浏览器：
- Web Crypto API（用于 UUID 计算）
- Notification API（用于浏览器通知）
- 推荐：Chrome、Firefox、Edge、Safari（最新版本）

### Q4: 可以同时监控多个玩家吗？

当前版本仅支持监控一个玩家。如果需要监控多个玩家，可以打开多个浏览器标签页。

---

## 📄 许可证

本项目使用 Bun 创建。Built with [Bun](https://bun.com) - a fast all-in-one JavaScript runtime.
