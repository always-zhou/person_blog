class APIClient {
  constructor() {
    // 根据环境设置API基础URL
    this.baseURL = this.getAPIBaseURL();
    this.timeout = 10000; // 10秒超时
  }

  // 获取API基础URL
  getAPIBaseURL() {
    // 优先使用配置文件中的WORKER_URL
    if (window.CONFIG && window.CONFIG.WORKER_URL) {
      return window.CONFIG.WORKER_URL;
    }
    
    // 从全局变量获取Worker URL
    const workerURL = window.WORKER_URL;
    if (workerURL) {
      return workerURL;
    }
    
    // 无论在什么环境，如果没有配置Worker URL，都回退到本地存储
    // 这确保了PC端和移动端的一致性
    console.warn('No WORKER_URL configured, falling back to localStorage');
    return null;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    // 如果没有API URL，说明在本地环境，返回null让调用者处理
    if (!this.baseURL) {
      return null;
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 获取所有文章
  async getPosts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    
    const endpoint = `/api/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    try {
      const result = await this.request(endpoint);
      return result ? result.posts : null;
    } catch (error) {
      console.error('Failed to get posts:', error);
      return null;
    }
  }

  // 获取单篇文章
  async getPost(id) {
    try {
      const result = await this.request(`/api/posts/${id}`);
      return result ? result.post : null;
    } catch (error) {
      console.error('Failed to get post:', error);
      return null;
    }
  }

  // 创建文章
  async createPost(postData) {
    try {
      const result = await this.request('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      return result ? result.post : null;
    } catch (error) {
      console.error('Failed to create post:', error);
      return null;
    }
  }

  // 更新文章
  async updatePost(id, postData) {
    try {
      const result = await this.request(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
      return result ? result.post : null;
    } catch (error) {
      console.error('Failed to update post:', error);
      return null;
    }
  }

  // 删除文章
  async deletePost(id) {
    try {
      await this.request(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  }

  // 获取统计信息
  async getStats() {
    try {
      const result = await this.request('/api/stats');
      return result ? result.stats : null;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  // 检查API是否可用
  async checkAPIHealth() {
    if (!this.baseURL) {
      return false;
    }
    
    try {
      await this.request('/api/stats');
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // 获取API状态信息
  getAPIInfo() {
    return {
      baseURL: this.baseURL,
      isLocal: !this.baseURL,
      environment: this.baseURL ? 'production' : 'development'
    };
  }
}