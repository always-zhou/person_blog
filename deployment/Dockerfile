FROM nginx:alpine

# 复制项目文件到nginx默认目录
COPY . /usr/share/nginx/html/

# 复制自定义nginx配置（可选）
# COPY nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]