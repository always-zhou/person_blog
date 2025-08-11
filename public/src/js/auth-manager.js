// 认证管理器
class AuthManager {
  constructor() {
    this.apiClient = new APIClient();
    this.isAuthModalShown = false;
  }

  // 检查是否需要认证
  async checkAuth() {
    // 如果已经认证，直接返回true
    if (this.apiClient.isAuthenticated()) {
      return true;
    }

    // 显示密码输入框
    return await this.showPasswordModal();
  }

  // 显示密码输入模态框
  async showPasswordModal() {
    if (this.isAuthModalShown) {
      return false;
    }

    this.isAuthModalShown = true;

    return new Promise((resolve) => {
      // 创建模态框HTML
      const modalHTML = `
        <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h2 class="text-xl font-bold mb-4 text-gray-800">访问验证</h2>
            <p class="text-gray-600 mb-4">请输入访问密码：</p>
            <div class="mb-4">
              <input 
                type="password" 
                id="password-input" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                autocomplete="current-password"
              >
              <div id="error-message" class="text-red-500 text-sm mt-2 hidden">密码错误，请重试</div>
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                id="cancel-btn" 
                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                id="confirm-btn" 
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      `;

      // 添加到页面
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      const modal = document.getElementById('auth-modal');
      const passwordInput = document.getElementById('password-input');
      const errorMessage = document.getElementById('error-message');
      const cancelBtn = document.getElementById('cancel-btn');
      const confirmBtn = document.getElementById('confirm-btn');

      // 聚焦到密码输入框
      setTimeout(() => passwordInput.focus(), 100);

      // 验证密码
      const validatePassword = async () => {
        const password = passwordInput.value.trim();
        if (!password) {
          errorMessage.textContent = '请输入密码';
          errorMessage.classList.remove('hidden');
          return;
        }

        // 设置密码并测试API连接
        this.apiClient.setPassword(password);
        
        try {
          // 尝试调用健康检查API来验证密码
          const response = await this.apiClient.checkAPIHealth();
          if (response && response.status === 'ok') {
            // 密码正确
            this.cleanup(modal);
            resolve(true);
          } else {
            // 密码错误或API不可用
            this.apiClient.setPassword(null);
            errorMessage.textContent = '密码错误或服务不可用';
            errorMessage.classList.remove('hidden');
            passwordInput.select();
          }
        } catch (error) {
          // 如果是401错误，说明密码错误
          if (error.message && error.message.includes('401')) {
            this.apiClient.setPassword(null);
            errorMessage.textContent = '密码错误，请重试';
            errorMessage.classList.remove('hidden');
            passwordInput.select();
          } else {
            // 其他错误，可能是网络问题
            this.apiClient.setPassword(null);
            errorMessage.textContent = '网络错误，请检查连接';
            errorMessage.classList.remove('hidden');
          }
        }
      };

      // 事件监听
      confirmBtn.addEventListener('click', validatePassword);
      
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          validatePassword();
        }
      });

      cancelBtn.addEventListener('click', () => {
        this.cleanup(modal);
        resolve(false);
      });

      // 点击背景关闭
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.cleanup(modal);
          resolve(false);
        }
      });
    });
  }

  // 清理模态框
  cleanup(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    this.isAuthModalShown = false;
  }

  // 登出
  logout() {
    this.apiClient.setPassword(null);
    // 重新加载页面
    window.location.reload();
  }
}

// 创建全局实例
window.authManager = new AuthManager();