# Personal Blog System

一个现代化的个人博客系统，支持多分类文章管理、本地存储和云端同步。

## 🌟 特性

- **多分类支持**: 学习、健身、生活、摄影四大分类
- **响应式设计**: 完美适配PC和移动端
- **混合存储**: 支持本地存储和Cloudflare KV云端存储
- **实时同步**: 设备间数据自动同步
- **富文本编辑**: 支持Markdown和可视化编辑
- **搜索功能**: 全文搜索和分类筛选
- **PWA支持**: 可安装为原生应用

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd person_blog

# 启动本地服务器
python3 -m http.server 8002

# 访问应用
open http://localhost:8002/public/index.html
```

### 部署选项

#### 1. Cloudflare Workers 部署

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler auth login

# 部署到 Cloudflare Workers
cd deployment
wrangler deploy
```

#### 2. Docker 部署

```bash
# 构建镜像
docker-compose up --build

# 访问应用
open http://localhost:80
```

## 📁 项目结构

```
person_blog/
├── public/                 # 静态文件和HTML页面
│   ├── index.html         # 主页
│   ├── learning.html      # 学习分类页面
│   ├── fitness.html       # 健身分类页面
│   ├── life.html          # 生活分类页面
│   ├── photography.html   # 摄影分类页面
│   └── admin.html         # 管理后台
├── src/                   # 源代码
│   ├── js/                # JavaScript文件
│   ├── css/               # 样式文件
│   └── components/        # React组件
├── deployment/            # 部署配置
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── worker.js          # Cloudflare Worker
│   └── wrangler.toml      # Wrangler配置
├── docs/                  # 文档
├── tests/                 # 测试文件
└── trickle/              # 第三方资源
```

## 🔧 配置

### 环境配置

复制 `src/js/config.js` 并根据需要修改配置：

```javascript
const CONFIG = {
  API_BASE_URL: 'your-api-url',
  CLOUDFLARE_ACCOUNT_ID: 'your-account-id',
  CLOUDFLARE_NAMESPACE_ID: 'your-namespace-id',
  // ... 其他配置
};
```

### Cloudflare KV 设置

1. 创建 KV 命名空间
2. 配置 Worker 绑定
3. 更新 `wrangler.toml` 配置

详细步骤请参考 [docs/CLOUDFLARE_SETUP.md](docs/CLOUDFLARE_SETUP.md)

## 📱 功能模块

### 文章管理
- 创建、编辑、删除文章
- 支持Markdown语法
- 图片上传和管理
- 标签和分类管理

### 数据同步
- 本地存储优先
- 云端备份同步
- 冲突解决机制
- 离线模式支持

### 用户界面
- 现代化设计
- 暗色/亮色主题
- 响应式布局
- 流畅动画效果

## 🛠️ 开发

### 技术栈

- **前端**: React, Tailwind CSS
- **存储**: LocalStorage, Cloudflare KV
- **部署**: Cloudflare Workers, Docker
- **构建**: 原生ES6模块

### 调试工具

访问 `/public/comprehensive-debug.html` 使用综合诊断工具：
- 设备信息检查
- 存储状态对比
- API连接测试
- 数据同步修复

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题，请通过 GitHub Issues 联系。