# 密码认证设置指南

本指南将帮助您在 Cloudflare Workers 上配置密码认证功能。

## 1. 在 Cloudflare Dashboard 中设置环境变量

### 步骤 1：登录 Cloudflare Dashboard
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录您的账户

### 步骤 2：找到您的 Worker
1. 在左侧菜单中点击 "Workers & Pages"
2. 找到您的博客 Worker（通常名为 `personal-blog-api`）
3. 点击进入 Worker 详情页面

### 步骤 3：配置环境变量
1. 在 Worker 详情页面，点击 "Settings" 标签
2. 向下滚动找到 "Environment Variables" 部分
3. 点击 "Add variable" 按钮
4. 在 "Variable name" 中输入：`PASSWORD`
5. 在 "Value" 中输入您想要设置的密码（建议使用强密码）
6. 选择 "Encrypt" 选项以加密存储密码
7. 点击 "Save" 保存

### 步骤 4：部署更新
1. 返回 Worker 的主页面
2. 点击 "Quick edit" 或重新部署 Worker
3. 确保新的环境变量生效

## 2. 本地开发环境配置

如果您需要在本地测试密码功能，可以创建一个 `.dev.vars` 文件：

```bash
# 在项目根目录创建 .dev.vars 文件
echo "PASSWORD=your_password_here" > .dev.vars
```

**注意：** `.dev.vars` 文件应该添加到 `.gitignore` 中，避免密码泄露。

## 3. 功能说明

### 密码认证流程
1. 用户访问管理页面（`/admin.html`）
2. 系统检查是否已认证
3. 如果未认证，显示密码输入框
4. 用户输入密码后，系统验证密码
5. 验证成功后，用户可以正常使用管理功能

### 安全特性
- 密码在 Cloudflare 中加密存储
- 使用 Bearer Token 方式传输密码
- 密码存储在浏览器的 sessionStorage 中（关闭浏览器后失效）
- 提供退出登录功能

### API 保护
- 所有管理 API 都需要密码认证
- 健康检查接口 `/api/health` 不需要认证
- 读取文章的 API 不需要认证（保持网站正常访问）

## 4. 故障排除

### 问题：密码验证失败
**可能原因：**
- 环境变量未正确设置
- Worker 未重新部署
- 密码输入错误

**解决方案：**
1. 检查 Cloudflare Dashboard 中的环境变量设置
2. 重新部署 Worker
3. 确认密码输入正确

### 问题：无法访问管理页面
**可能原因：**
- JavaScript 文件加载失败
- 网络连接问题

**解决方案：**
1. 检查浏览器控制台是否有错误
2. 确认所有 JavaScript 文件都已正确部署
3. 检查网络连接

### 问题：密码框不显示
**可能原因：**
- `auth-manager.js` 文件未加载
- 环境变量未设置（系统会跳过认证）

**解决方案：**
1. 检查 `admin.html` 中是否正确引入了 `auth-manager.js`
2. 确认 Cloudflare 中已设置 `PASSWORD` 环境变量

## 5. 安全建议

1. **使用强密码**：建议使用至少 12 位包含大小写字母、数字和特殊字符的密码
2. **定期更换密码**：建议定期更换管理密码
3. **限制访问**：只在需要时访问管理页面
4. **及时退出**：使用完毕后及时点击退出登录
5. **HTTPS 访问**：确保始终通过 HTTPS 访问管理页面

## 6. 技术实现细节

### Worker 端验证
```javascript
// 验证密码
function validatePassword(request, env) {
  if (!env.PASSWORD) {
    return true; // 如果未设置密码，跳过验证
  }
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === env.PASSWORD;
}
```

### 前端认证
```javascript
// 设置密码
apiClient.setPassword(password);

// 每个请求都会自动包含认证头
headers['Authorization'] = `Bearer ${password}`;
```

通过以上配置，您的博客管理后台将具备密码保护功能，确保只有授权用户才能访问和修改内容。