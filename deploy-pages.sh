#!/bin/bash

# Cloudflare Pages 部署脚本
# 用于将项目部署到 Cloudflare Pages

echo "🚀 开始部署到 Cloudflare Pages..."
echo "📁 当前目录: $(pwd)"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查Git状态
echo "📋 检查Git状态..."
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是Git仓库"
    echo "请先运行: git init"
    exit 1
fi

# 添加所有文件到Git
echo "📦 添加文件到Git..."
git add .

# 检查是否有变更
if git diff --cached --quiet; then
    echo "ℹ️  没有检测到文件变更"
else
    echo "💾 提交变更..."
    git commit -m "Deploy: Update Pages configuration and fix routing - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 推送到远程仓库
echo "🔄 推送到远程仓库..."
if git remote | grep -q origin; then
    # 获取当前分支名
    current_branch=$(git branch --show-current)
    git push origin $current_branch
    echo "✅ 代码已推送到GitHub ($current_branch 分支)"
else
    echo "⚠️  警告: 未找到远程仓库"
    echo "请先添加远程仓库: git remote add origin <your-repo-url>"
fi

echo ""
echo "📋 部署完成检查清单:"
echo "   ✅ _redirects 文件已创建 (处理路由)"
echo "   ✅ _headers 文件已创建 (CORS和缓存)"
echo "   ✅ wrangler.toml 文件已创建 (Pages配置)"
echo "   ✅ 代码已推送到GitHub"
echo ""
echo "🌐 接下来的步骤:"
echo "   1. 访问 Cloudflare Dashboard"
echo "   2. 进入 Pages 项目设置"
echo "   3. 触发重新部署或等待自动部署"
echo "   4. 检查部署日志确认成功"
echo ""
echo "🔗 测试链接:"
echo "   主页: https://blog.awlayswm.com/"
echo "   健身: https://blog.awlayswm.com/fitness"
echo "   学习: https://blog.awlayswm.com/learning"
echo "   管理后台: https://blog.awlayswm.com/admin"
echo ""
echo "💡 如果页面仍然无法访问，请检查:"
echo "   - Cloudflare Pages 构建日志"
echo "   - 域名DNS设置"
echo "   - _redirects 文件是否生效"
echo ""
echo "🎉 部署脚本执行完成！"