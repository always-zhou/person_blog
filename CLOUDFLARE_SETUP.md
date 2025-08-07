# Cloudflare KV 数据存储配置指南

## 问题诊断

如果你的数据没有存储到 Cloudflare KV 数据库中，可能是以下原因：

### 1. Worker URL 配置问题

**解决方案：**

1. 打开 `config.js` 文件
2. 将 `WORKER_URL` 替换为你的实际 Cloudflare Worker 域名

```javascript
window.BLOG_CONFIG = {
  // 替换为你的实际 Worker 域名
  WORKER_URL: 'https://your-actual-worker-name.your-subdomain.workers.dev',
};
```

**如何获取你的 Worker 域名：**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Workers & Pages" 部分
3. 找到你创建的 Worker
4. 复制显示的域名（格式：`https://worker-name.subdomain.workers.dev`）

### 2. KV 命名空间绑定问题

**检查步骤：**

1. 在 Cloudflare Dashboard 中进入你的 Worker
2. 点击 "Settings" → "Variables"
3. 确认 "KV Namespace Bindings" 中有：
   - **Variable name**: `BLOG_KV`
   - **KV namespace**: `BLOG_DATA`（或你创建的命名空间名称）

### 3. Worker 代码部署问题

**检查步骤：**

1. 确认 `worker.js` 已正确部署到 Cloudflare Workers
2. 测试 Worker 是否正常工作：
   ```bash
   curl https://your-worker-domain.workers.dev/api/posts
   ```

### 4. CORS 配置问题

如果在浏览器控制台看到 CORS 错误，检查：

1. Worker 代码中的 CORS 头部设置
2. 确认 `corsHeaders` 配置正确

## 测试配置

### 方法 1：浏览器控制台测试

1. 打开你的博客网站
2. 按 F12 打开开发者工具
3. 在控制台中运行：

```javascript
// 检查配置
console.log('Worker URL:', window.WORKER_URL);

// 测试 API 连接
fetch(window.WORKER_URL + '/api/posts')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));
```

### 方法 2：网络面板检查

1. 打开开发者工具的 "Network" 面板
2. 尝试创建或编辑一篇文章
3. 查看是否有发送到 Worker 域名的请求
4. 检查请求状态码和响应内容

## 常见错误及解决方案

### 错误 1："Failed to fetch"
- **原因**：Worker URL 配置错误或 Worker 未部署
- **解决**：检查 Worker URL 和部署状态

### 错误 2："CORS error"
- **原因**：跨域请求被阻止
- **解决**：确认 Worker 中的 CORS 配置正确

### 错误 3："KV namespace not found"
- **原因**：KV 命名空间绑定配置错误
- **解决**：检查 Worker 的环境变量配置

### 错误 4：数据保存后刷新页面丢失
- **原因**：数据只保存在本地，未同步到 KV
- **解决**：检查 API 连接和 Worker 配置

## 调试模式

启用调试模式来获取更多信息：

1. 在 `config.js` 中设置：
```javascript
window.BLOG_CONFIG = {
  WORKER_URL: 'your-worker-url',
  ENABLE_DEBUG: true, // 启用调试
};
```

2. 查看浏览器控制台的详细日志

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 浏览器控制台的错误信息
2. Network 面板中的请求详情
3. 你的 Worker 域名（可以隐藏敏感部分）
4. KV 命名空间配置截图