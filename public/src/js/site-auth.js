// 网站认证管理器
class SiteAuthManager {
  constructor() {
    this.checkInterval = null;
    this.init();
  }

  // 初始化
  init() {
    // 检查当前页面是否需要认证
    this.checkAuthStatus();
    
    // 定期检查认证状态（每5分钟）
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 5 * 60 * 1000);
  }

  // 检查认证状态
  async checkAuthStatus() {
    try {
      // 在本地开发环境中跳过API调用
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }
      
      // 尝试访问健康检查接口来验证认证状态
      const response = await fetch('/api/health', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // 未认证，重定向到登录页面
        this.redirectToLogin();
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
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
      // 在本地开发环境中跳过API调用
      if (!(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
      }
      
      // 清除本地存储
      sessionStorage.clear();
      localStorage.removeItem('blog_password');
      
      // 重新加载页面
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使API调用失败，也要重新加载页面
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
    document.addEventListener('DOMContentLoaded', () => {
      siteAuthManager = new SiteAuthManager();
      siteAuthManager.addLogoutButton();
    });
  } else {
    siteAuthManager = new SiteAuthManager();
    siteAuthManager.addLogoutButton();
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