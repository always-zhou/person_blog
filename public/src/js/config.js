// 配置文件 - Cloudflare Worker + KV 数据库配置
window.BLOG_CONFIG = {
  // Cloudflare Worker API URL - 支持 KV 数据库存储
  WORKER_URL: 'https://awlayswm.com', // Worker API 地址
  
  // 其他配置选项
  API_TIMEOUT: 5000, // API 请求超时时间（毫秒）
  ENABLE_DEBUG: true, // 启用调试模式以便排查问题
  ENABLE_PRELOAD: true, // 启用资源预加载
  
  // Worker + KV 部署配置
  USE_LOCAL_STORAGE: false, // 使用 KV 数据库存储
  DISABLE_AUTH: false, // 启用密码认证
};

// 将配置暴露到全局变量
window.WORKER_URL = window.BLOG_CONFIG.WORKER_URL;
window.CONFIG = window.BLOG_CONFIG; // 为了兼容api-client.js

// 调试信息
if (window.BLOG_CONFIG.ENABLE_DEBUG) {
  console.log('Blog Config:', window.BLOG_CONFIG);
}