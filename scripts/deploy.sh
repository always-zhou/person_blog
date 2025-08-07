#!/bin/bash

# Personal Blog System - 部署脚本
# 支持多种部署方式

set -e

echo "🚀 Personal Blog System 部署脚本"
echo "================================="
echo ""
echo "请选择部署方式:"
echo "1) Cloudflare Workers"
echo "2) Docker 本地部署"
echo "3) Docker 生产环境"
echo "4) 静态文件部署"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo "📡 部署到 Cloudflare Workers..."
        
        # 检查 wrangler 是否安装
        if ! command -v wrangler &> /dev/null; then
            echo "❌ 错误: 未找到 wrangler CLI"
            echo "请先安装: npm install -g wrangler"
            exit 1
        fi
        
        # 检查是否已登录
        if ! wrangler whoami &> /dev/null; then
            echo "🔐 请先登录 Cloudflare:"
            wrangler auth login
        fi
        
        cd deployment
        echo "🔄 部署中..."
        wrangler deploy
        echo "✅ 部署完成!"
        ;;
        
    2)
        echo "🐳 Docker 本地部署..."
        
        if ! command -v docker &> /dev/null; then
            echo "❌ 错误: 未找到 Docker"
            echo "请先安装 Docker: https://www.docker.com/get-started"
            exit 1
        fi
        
        echo "🔄 构建并启动容器..."
        docker-compose -f deployment/docker-compose.yml up --build -d
        echo "✅ 部署完成! 访问: http://localhost:80"
        ;;
        
    3)
        echo "🐳 Docker 生产环境部署..."
        
        if ! command -v docker &> /dev/null; then
            echo "❌ 错误: 未找到 Docker"
            exit 1
        fi
        
        read -p "请输入服务器IP或域名: " server
        read -p "请输入端口 (默认80): " port
        port=${port:-80}
        
        echo "🔄 构建生产镜像..."
        docker build -f deployment/Dockerfile -t personal-blog:latest .
        
        echo "📦 保存镜像..."
        docker save personal-blog:latest | gzip > personal-blog.tar.gz
        
        echo "📤 上传到服务器..."
        echo "请手动执行以下命令:"
        echo "scp personal-blog.tar.gz user@$server:/tmp/"
        echo "ssh user@$server 'docker load < /tmp/personal-blog.tar.gz && docker run -d -p $port:80 personal-blog:latest'"
        ;;
        
    4)
        echo "📁 静态文件部署..."
        
        # 创建部署目录
        mkdir -p dist
        
        # 复制文件
        echo "📋 复制文件..."
        cp -r public/* dist/
        cp -r src dist/
        
        # 创建部署包
        echo "📦 创建部署包..."
        tar -czf personal-blog-static.tar.gz dist/
        
        echo "✅ 静态文件已准备完成!"
        echo "📁 文件位置: dist/"
        echo "📦 部署包: personal-blog-static.tar.gz"
        echo ""
        echo "💡 部署说明:"
        echo "1. 上传 dist/ 目录到你的 Web 服务器"
        echo "2. 确保服务器支持静态文件服务"
        echo "3. 访问 index.html 开始使用"
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成!"
echo "📚 更多信息请查看 docs/ 目录中的文档"