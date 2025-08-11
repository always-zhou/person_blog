// 网站认证管理器
class SiteAuthManager {
  constructor() {
    this.checkInterval = null;
  }

  // 初始化
  async init() {
    // 先隐藏页面内容，等待认证完成
    this.hidePageContent();
    
    // 检查当前页面是否需要认证
    await this.checkAuthStatus();
    
    // 定期检查认证状态（每5分钟）
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 5 * 60 * 1000);
  }

  // 检查认证状态
  async checkAuthStatus() {
    try {
      // 检查配置是否禁用认证
      if (window.BLOG_CONFIG && window.BLOG_CONFIG.DISABLE_AUTH) {
        return;
      }
      
      // 在本地开发环境中跳过API调用
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }
      
      // 使用 AuthManager 检查认证状态
      if (window.authManager) {
        const isAuthenticated = await window.authManager.checkAuth();
        if (!isAuthenticated) {
          // 认证失败，用户取消了认证，隐藏页面内容
          this.hidePageContent();
          return;
        } else {
          // 认证成功，显示页面内容
          this.showPageContent();
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }
  }

  // 隐藏页面内容
  hidePageContent() {
    // 隐藏主要内容
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'none';
    }
    
    // 显示认证提示
    this.showAuthPrompt();
  }
  
  // 显示页面内容
  showPageContent() {
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
    }
    
    // 隐藏认证提示
    this.hideAuthPrompt();
  }
  
  // 显示认证提示
  showAuthPrompt() {
    // 检查是否已经有提示
    if (document.getElementById('auth-prompt')) {
      return;
    }
    
    const promptHTML = `
      <div id="auth-prompt" class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div class="mb-6">
            <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0V7m0 2h2m-2 0H10"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">需要认证</h2>
            <p class="text-gray-600">您需要通过密码验证才能访问此网站</p>
          </div>
          <button id="retry-auth-btn" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            重新认证
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', promptHTML);
    
    // 添加重新认证按钮事件
    const retryBtn = document.getElementById('retry-auth-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.hideAuthPrompt();
        this.checkAuthStatus();
      });
    }
  }
  
  // 隐藏认证提示
  hideAuthPrompt() {
    const prompt = document.getElementById('auth-prompt');
    if (prompt) {
      prompt.remove();
    }
  }
  
  // 重定向到登录页面
  redirectToLogin() {
    // 如果当前不在登录页面，则重定向
    if (!window.location.pathname.includes('/login')) {
      window.location.reload();
    }
  }

  // 退出登录
  async logout() {
    try {
      // 使用 AuthManager 进行登出
      if (window.authManager) {
        window.authManager.logout();
      } else {
        // 清除本地存储
        sessionStorage.clear();
        localStorage.removeItem('blog_password');
        
        // 重新加载页面
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使出错，也要重新加载页面
      window.location.reload();
    }
  }

  // 添加退出按钮到页面
  addLogoutButton() {
    // 检查是否已经有退出按钮
    if (document.getElementById('site-logout-btn')) {
      return;
    }

    // 创建退出按钮
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'site-logout-btn';
    logoutBtn.innerHTML = '🔓 退出';
    logoutBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;
    
    // 悬停效果
    logoutBtn.addEventListener('mouseenter', () => {
      logoutBtn.style.background = 'rgba(220, 38, 38, 0.9)';
      logoutBtn.style.transform = 'translateY(-2px)';
    });
    
    logoutBtn.addEventListener('mouseleave', () => {
      logoutBtn.style.background = 'rgba(239, 68, 68, 0.9)';
      logoutBtn.style.transform = 'translateY(0)';
    });
    
    // 点击事件
    logoutBtn.addEventListener('click', () => {
      if (confirm('确定要退出登录吗？')) {
        this.logout();
      }
    });
    
    // 添加到页面
    document.body.appendChild(logoutBtn);
  }

  // 销毁
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    const logoutBtn = document.getElementById('site-logout-btn');
    if (logoutBtn) {
      logoutBtn.remove();
    }
  }
}

// 自动初始化（仅在非管理页面）
if (!window.location.pathname.includes('/admin.html')) {
  let siteAuthManager;
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      siteAuthManager = new SiteAuthManager();
      await siteAuthManager.init();
      siteAuthManager.addLogoutButton();
    });
  } else {
    siteAuthManager = new SiteAuthManager();
    siteAuthManager.init().then(() => {
      siteAuthManager.addLogoutButton();
    });
  }
  
  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    if (siteAuthManager) {
      siteAuthManager.destroy();
    }
  });
}

// 导出给其他脚本使用
window.SiteAuthManager = SiteAuthManager;