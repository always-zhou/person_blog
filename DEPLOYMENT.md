# 部署指南

本项目已集成 Cloudflare Workers KV 存储，支持数据持久化。以下是部署步骤：

## 前提条件

1. 拥有 Cloudflare 账户
2. 安装 Node.js 和 npm
3. 安装 Wrangler CLI：`npm install -g wrangler`

## 部署步骤

### 1. 登录 Cloudflare

```bash
wrangler login
```

### 2. 创建 KV 命名空间

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "BLOG_DATA"

# 创建预览环境 KV 命名空间
wrangler kv:namespace create "BLOG_DATA" --preview
```

### 3. 更新 wrangler.toml

将创建的 KV 命名空间 ID 更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "BLOG_DATA"
id = "your-production-namespace-id"
preview_id = "your-preview-namespace-id"
```

### 4. 部署 Worker

```bash
wrangler deploy
```

### 5. 部署静态文件到 Cloudflare Pages

1. 将项目推送到 GitHub
2. 在 Cloudflare Dashboard 中创建 Pages 项目
3. 连接 GitHub 仓库
4. 设置构建配置：
   - 构建命令：留空（静态文件）
   - 构建输出目录：`/`

### 6. 配置环境变量

在 Cloudflare Pages 设置中添加环境变量：

- `WORKER_URL`: 你的 Worker 域名（例如：`https://your-worker.your-subdomain.workers.dev`）

## 数据迁移

如果你已有本地数据，可以通过以下方式迁移：

1. 在管理页面使用"导出数据"功能
2. 部署完成后，在新环境中使用"导入数据"功能

## 功能特性

- **自动环境检测**：系统会自动检测是否在 Cloudflare 环境中运行
- **降级支持**：如果 API 不可用，会自动降级到 localStorage
- **数据同步**：支持导入/导出功能进行数据迁移
- **跨设备访问**：部署后可在任何设备上访问和管理数据

## 故障排除

### Worker 部署失败
- 检查 `wrangler.toml` 配置是否正确
- 确认 KV 命名空间 ID 是否正确
- 检查 Cloudflare 账户权限

### 数据无法保存
- 检查 Worker 是否正常运行
- 查看浏览器控制台错误信息
- 确认 CORS 设置是否正确

### API 连接失败
- 检查 Worker URL 是否正确
- 确认网络连接正常
- 系统会自动降级到本地存储

## 本地开发

在本地开发时，系统会自动使用 localStorage，无需额外配置。如需测试 Worker 功能：

```bash
wrangler dev
```

这将启动本地 Worker 开发服务器。