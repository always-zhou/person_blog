# 开发指南

本文档为开发者提供项目结构说明、开发环境设置和贡献指南。

## 📁 项目结构

```
personal-blog-system/
├── public/                    # 静态文件和HTML页面
│   ├── index.html            # 主页
│   ├── learning.html         # 学习分类页面
│   ├── fitness.html          # 健身分类页面
│   ├── life.html             # 生活分类页面
│   ├── photography.html      # 摄影分类页面
│   ├── admin.html            # 管理后台
│   ├── about.html            # 关于页面
│   ├── comprehensive-debug.html # 调试工具
│   ├── sync-test.html        # 同步测试
│   └── test-api.html         # API测试
├── src/                      # 源代码
│   ├── js/                   # JavaScript文件
│   │   ├── config.js         # 配置文件
│   │   ├── app.js            # 主应用
│   │   ├── *-app.js          # 各分类应用
│   │   ├── blog-manager.js   # 本地博客管理器
│   │   ├── blog-manager-kv.js # KV存储管理器
│   │   ├── hybrid-blog-manager.js # 混合存储管理器
│   │   ├── api-client.js     # API客户端
│   │   ├── cloudflare-kv-manager.js # Cloudflare KV管理
│   │   └── debug-api.js      # 调试API
│   ├── css/                  # 样式文件（预留）
│   └── components/           # React组件
│       ├── Header.js         # 页面头部
│       ├── Footer.js         # 页面底部
│       ├── Hero.js           # 英雄区域
│       ├── CategoryCard.js   # 分类卡片
│       ├── PostCard.js       # 文章卡片
│       ├── PostDetail.js     # 文章详情
│       ├── PostEditor.js     # 文章编辑器
│       └── SearchBar.js      # 搜索栏
├── deployment/               # 部署配置
│   ├── Dockerfile           # Docker镜像配置
│   ├── docker-compose.yml   # Docker Compose配置
│   ├── nginx.conf           # Nginx配置
│   ├── worker.js            # Cloudflare Worker
│   ├── wrangler.toml        # Wrangler配置
│   └── .dockerignore        # Docker忽略文件
├── docs/                    # 文档
│   ├── DEVELOPMENT.md       # 开发指南（本文件）
│   ├── DEPLOYMENT.md        # 部署指南
│   ├── CLOUDFLARE_SETUP.md  # Cloudflare设置
│   └── WORKER_DEPLOYMENT_GUIDE.md # Worker部署指南
├── scripts/                 # 脚本文件
│   ├── start.sh            # 启动脚本
│   └── deploy.sh           # 部署脚本
├── tests/                   # 测试文件（预留）
├── trickle/                 # 第三方资源
├── .gitignore              # Git忽略文件
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 🛠️ 技术栈

### 前端技术
- **React 18**: 用于构建用户界面
- **Babel Standalone**: 浏览器端JSX转换
- **Tailwind CSS**: 实用优先的CSS框架
- **Lucide Icons**: 现代图标库

### 存储方案
- **LocalStorage**: 本地数据存储
- **Cloudflare KV**: 云端键值存储
- **混合存储**: 本地优先，云端同步

### 部署平台
- **Cloudflare Workers**: 边缘计算平台
- **Docker**: 容器化部署
- **静态托管**: 支持任何静态文件服务器

## 🚀 开发环境设置

### 前置要求
- Python 3.6+ (用于本地HTTP服务器)
- Node.js 14+ (可选，用于包管理)
- Git (版本控制)

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd personal-blog-system
   ```

2. **启动开发服务器**
   ```bash
   # 使用脚本启动
   ./scripts/start.sh
   
   # 或手动启动
   python3 -m http.server 8002
   ```

3. **访问应用**
   ```
   主页: http://localhost:8002/public/index.html
   调试: http://localhost:8002/public/comprehensive-debug.html
   ```

## 🔧 开发工作流

### 添加新功能

1. **创建功能分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **开发和测试**
   - 修改相关文件
   - 在浏览器中测试功能
   - 使用调试工具验证

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### 修复Bug

1. **创建修复分支**
   ```bash
   git checkout -b fix/bug-description
   ```

2. **定位和修复**
   - 使用浏览器开发者工具
   - 查看控制台错误信息
   - 使用综合调试工具

3. **验证修复**
   - 测试修复的功能
   - 确保没有引入新问题

## 📝 代码规范

### JavaScript
- 使用ES6+语法
- 优先使用const和let
- 函数命名使用驼峰命名法
- 类名使用帕斯卡命名法

### React组件
- 使用函数组件和Hooks
- 组件名使用帕斯卡命名法
- Props解构赋值
- 合理使用useEffect和useState

### CSS
- 优先使用Tailwind CSS类
- 自定义样式放在style标签中
- 响应式设计优先

### 文件组织
- 相关功能放在同一目录
- 组件文件以.js结尾
- 配置文件放在根目录或config目录

## 🧪 测试

### 手动测试
1. **功能测试**
   - 测试所有页面加载
   - 验证CRUD操作
   - 检查响应式布局

2. **兼容性测试**
   - 不同浏览器测试
   - 移动设备测试
   - 不同屏幕尺寸测试

3. **性能测试**
   - 页面加载速度
   - 大量数据处理
   - 内存使用情况

### 调试工具
- 使用`comprehensive-debug.html`进行全面诊断
- 浏览器开发者工具
- React Developer Tools

## 🚀 部署

### 本地部署
```bash
./scripts/deploy.sh
# 选择选项 2 (Docker 本地部署)
```

### 生产部署
```bash
./scripts/deploy.sh
# 选择相应的部署选项
```

详细部署说明请参考 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 贡献指南

### 提交Issue
1. 搜索现有Issue避免重复
2. 使用清晰的标题描述问题
3. 提供复现步骤和环境信息
4. 添加相关标签

### 提交Pull Request
1. Fork项目到个人仓库
2. 创建功能分支
3. 完成开发和测试
4. 提交PR并描述更改内容
5. 等待代码审查

### 代码审查
- 检查代码质量和规范
- 验证功能完整性
- 确保向后兼容性
- 检查文档更新

## 📚 学习资源

### 技术文档
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

### 项目相关
- [项目README](../README.md)
- [部署指南](DEPLOYMENT.md)
- [Cloudflare设置](CLOUDFLARE_SETUP.md)

## ❓ 常见问题

### Q: 如何添加新的分类页面？
A: 
1. 复制现有的HTML文件（如learning.html）
2. 修改页面标题和元数据
3. 创建对应的*-app.js文件
4. 更新导航链接

### Q: 如何自定义样式？
A: 
1. 优先使用Tailwind CSS类
2. 在HTML的style标签中添加自定义CSS
3. 使用CSS变量保持一致性

### Q: 如何调试数据同步问题？
A: 
1. 访问comprehensive-debug.html
2. 检查存储状态
3. 测试API连接
4. 使用修复工具

### Q: 如何配置Cloudflare KV？
A: 参考 [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) 详细说明

## 📞 获取帮助

- 提交GitHub Issue
- 查看项目文档
- 参考代码注释
- 使用调试工具

---

感谢你对项目的贡献！🎉