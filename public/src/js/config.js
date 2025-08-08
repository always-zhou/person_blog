// 配置文件 - 请根据你的实际部署情况修改
window.BLOG_CONFIG = {
  // Cloudflare Worker API 地址
  // 请替换为你的实际 Worker 域名
  WORKER_URL: 'https://awlayswm.com',
  
  // 其他配置选项
  API_TIMEOUT: 5000, // API 请求超时时间（毫秒）- 优化为5秒
  ENABLE_DEBUG: false, // 是否启用调试模式
  ENABLE_PRELOAD: true, // 启用资源预加载
};

// 将配置暴露到全局变量
window.WORKER_URL = window.BLOG_CONFIG.WORKER_URL;
window.CONFIG = window.BLOG_CONFIG; // 为了兼容api-client.js

// 调试信息
if (window.BLOG_CONFIG.ENABLE_DEBUG) {
  console.log('Blog Config:', window.BLOG_CONFIG);
}