# 贡献指南

感谢你对 Personal Blog System 项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、反馈和建议。

## 🤝 如何贡献

### 报告问题

如果你发现了bug或有功能建议，请通过以下方式报告：

1. **搜索现有Issue** - 确保问题尚未被报告
2. **创建新Issue** - 使用清晰的标题和详细描述
3. **提供信息** - 包括复现步骤、环境信息、截图等

#### Issue模板

**Bug报告：**
```
**问题描述**
简要描述遇到的问题

**复现步骤**
1. 访问页面...
2. 点击按钮...
3. 看到错误...

**预期行为**
描述你期望发生的情况

**实际行为**
描述实际发生的情况

**环境信息**
- 浏览器: [Chrome 120.0]
- 操作系统: [macOS 14.0]
- 设备: [Desktop/Mobile]

**截图**
如果适用，添加截图帮助解释问题
```

**功能请求：**
```
**功能描述**
清晰描述你希望添加的功能

**使用场景**
解释为什么需要这个功能

**建议实现**
如果有想法，描述可能的实现方式

**替代方案**
描述你考虑过的其他解决方案
```

### 代码贡献

#### 开发环境设置

1. **Fork项目**
   ```bash
   # 在GitHub上Fork项目到你的账户
   git clone https://github.com/your-username/personal-blog-system.git
   cd personal-blog-system
   ```

2. **设置上游仓库**
   ```bash
   git remote add upstream https://github.com/original-owner/personal-blog-system.git
   ```

3. **安装依赖**
   ```bash
   # 确保有Python 3.6+
   python3 --version
   
   # 启动开发服务器
   ./scripts/start.sh
   ```

#### 开发流程

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/bug-description
   ```

2. **进行开发**
   - 遵循代码规范
   - 添加必要的注释
   - 确保代码可读性

3. **测试更改**
   - 在多个浏览器中测试
   - 验证响应式设计
   - 使用调试工具检查

4. **提交更改**
   ```bash
   git add .
   git commit -m "type: description"
   ```

5. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建Pull Request**
   - 在GitHub上创建PR
   - 填写PR模板
   - 等待代码审查

#### 提交信息规范

使用约定式提交格式：

```
type(scope): description

[optional body]

[optional footer]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例:**
```bash
git commit -m "feat(blog): add search functionality"
git commit -m "fix(ui): resolve mobile layout issue"
git commit -m "docs: update installation guide"
```

### Pull Request指南

#### PR模板

```markdown
## 更改描述
简要描述这个PR的目的和更改内容

## 更改类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 代码重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他: ___________

## 测试
- [ ] 在Chrome中测试
- [ ] 在Firefox中测试
- [ ] 在Safari中测试
- [ ] 移动设备测试
- [ ] 功能测试通过
- [ ] 回归测试通过

## 截图
如果有UI更改，请提供前后对比截图

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自测试通过
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 向后兼容

## 相关Issue
关闭 #issue_number
```

#### 代码审查

所有PR都需要经过代码审查：

1. **自动检查**
   - 代码格式检查
   - 基本功能测试

2. **人工审查**
   - 代码质量
   - 功能完整性
   - 安全性检查
   - 性能影响

3. **审查标准**
   - 代码可读性
   - 遵循项目规范
   - 适当的错误处理
   - 合理的性能表现

## 📋 代码规范

### JavaScript规范

```javascript
// ✅ 好的例子
const getUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

// ❌ 避免的例子
function getUserData(userId) {
  fetch('/api/users/' + userId).then(function(response) {
    return response.json();
  }).then(function(data) {
    return data;
  });
}
```

### React组件规范

```javascript
// ✅ 好的例子
const PostCard = ({ post, onEdit, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEdit = useCallback(() => {
    onEdit(post.id);
  }, [post.id, onEdit]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      <p className="text-gray-600 mb-4">{post.excerpt}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{post.date}</span>
        <div className="space-x-2">
          <button 
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            编辑
          </button>
        </div>
      </div>
    </div>
  );
};
```

### CSS/样式规范

```html
<!-- ✅ 优先使用Tailwind类 -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-semibold text-gray-800">标题</h2>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
    按钮
  </button>
</div>

<!-- ✅ 必要时使用自定义CSS -->
<style>
.custom-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 768px) {
  .custom-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%);
  }
}
</style>
```

## 🧪 测试指南

### 手动测试清单

#### 功能测试
- [ ] 页面正常加载
- [ ] 导航链接工作正常
- [ ] 文章CRUD操作
- [ ] 搜索功能
- [ ] 数据同步
- [ ] 响应式布局

#### 浏览器兼容性
- [ ] Chrome (最新版本)
- [ ] Firefox (最新版本)
- [ ] Safari (最新版本)
- [ ] Edge (最新版本)
- [ ] 移动浏览器

#### 设备测试
- [ ] 桌面 (1920x1080)
- [ ] 笔记本 (1366x768)
- [ ] 平板 (768x1024)
- [ ] 手机 (375x667)

### 调试工具使用

1. **综合调试工具**
   ```
   访问: http://localhost:8002/public/comprehensive-debug.html
   ```

2. **浏览器开发者工具**
   - Console: 查看错误和日志
   - Network: 检查API请求
   - Application: 查看LocalStorage
   - Performance: 性能分析

3. **React Developer Tools**
   - 组件树查看
   - Props和State检查
   - 性能分析

## 📚 文档贡献

### 文档类型

1. **用户文档**
   - README.md
   - 使用指南
   - FAQ

2. **开发者文档**
   - API文档
   - 架构说明
   - 贡献指南

3. **部署文档**
   - 安装指南
   - 配置说明
   - 故障排除

### 文档规范

```markdown
# 标题使用H1

## 主要章节使用H2

### 子章节使用H3

- 使用无序列表展示要点
- 保持列表项简洁明了

1. 使用有序列表展示步骤
2. 每个步骤要清晰具体

```bash
# 代码块要指定语言
command --option value
```

> 💡 使用引用块突出重要信息

⚠️ 使用emoji增强可读性，但要适度
```

## 🏷️ 版本管理

### 分支策略

- `main`: 主分支，稳定版本
- `develop`: 开发分支，最新功能
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `release/*`: 发布分支

### 发布流程

1. **准备发布**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.x.x
   ```

2. **更新版本**
   - 更新package.json版本号
   - 更新CHANGELOG.md
   - 测试发布版本

3. **合并发布**
   ```bash
   git checkout main
   git merge release/v1.x.x
   git tag v1.x.x
   git push origin main --tags
   ```

## 🎯 贡献优先级

### 高优先级
- 🐛 Bug修复
- 🔒 安全问题
- 📱 移动端兼容性
- ♿ 可访问性改进

### 中优先级
- ✨ 新功能
- 🎨 UI/UX改进
- ⚡ 性能优化
- 📚 文档完善

### 低优先级
- 🧹 代码清理
- 📝 注释补充
- 🔧 工具改进
- 🎉 功能增强

## 🏆 贡献者认可

我们重视每一个贡献，会通过以下方式认可贡献者：

- 在README中列出贡献者
- 在发布说明中感谢贡献者
- 为重要贡献者提供推荐信
- 邀请活跃贡献者成为维护者

## 📞 联系方式

如果你有任何问题或建议，可以通过以下方式联系我们：

- 📧 Email: [项目邮箱]
- 💬 GitHub Discussions
- 🐛 GitHub Issues
- 📱 社交媒体: [相关链接]

## 📄 许可证

通过贡献代码，你同意你的贡献将在与项目相同的许可证下发布。

---

再次感谢你的贡献！每一个贡献都让这个项目变得更好。🚀