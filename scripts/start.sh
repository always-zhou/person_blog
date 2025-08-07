#!/bin/bash

# Personal Blog System - 启动脚本
# 用于快速启动本地开发服务器

echo "🚀 启动 Personal Blog System..."
echo "📁 项目目录: $(pwd)"
echo "🌐 服务地址: http://localhost:8002"
echo "📱 移动端访问: http://[你的IP]:8002"
echo ""
echo "📋 可用页面:"
echo "   主页: http://localhost:8002/public/index.html"
echo "   学习: http://localhost:8002/public/learning.html"
echo "   健身: http://localhost:8002/public/fitness.html"
echo "   生活: http://localhost:8002/public/life.html"
echo "   摄影: http://localhost:8002/public/photography.html"
echo "   管理: http://localhost:8002/public/admin.html"
echo "   调试: http://localhost:8002/public/comprehensive-debug.html"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo "" 

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python 3"
    echo "请先安装 Python 3: https://www.python.org/downloads/"
    exit 1
fi

# 启动HTTP服务器
echo "🔄 启动服务器..."
python3 -m http.server 8002