// 配置文件 - 请根据你的实际部署情况修改
window.BLOG_CONFIG = {
  // Cloudflare Worker API 地址
  // 请替换为你的实际 Worker 域名
  WORKER_URL: 'https://your-worker-name.your-subdomain.workers.dev',
  
  // 其他配置选项
  API_TIMEOUT: 10000, // API 请求超时时间（毫秒）
  ENABLE_DEBUG: false, // 是否启用调试模式
};

// 将配置暴露到全局变量
window.WORKER_URL = window.BLOG_CONFIG.WORKER_URL;

// 调试信息
if (window.BLOG_CONFIG.ENABLE_DEBUG) {
  console.log('Blog Config:', window.BLOG_CONFIG);
}