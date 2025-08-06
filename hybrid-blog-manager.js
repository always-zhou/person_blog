class HybridBlogManager {
  constructor() {
    this.apiClient = new APIClient();
    this.localManager = new BlogManager(); // 原有的localStorage管理器
    this.kvManager = new BlogManagerKV(); // KV存储管理器
    this.categories = ['学习', '健身', '生活', '摄影'];
    this.useAPI = false;
    this.initialized = false;
  }

  // 初始化管理器
  async initialize() {
    if (this.initialized) return;

    try {
      // 检查API是否可用
      this.useAPI = await this.apiClient.checkAPIHealth();
      
      if (this.useAPI) {
        console.log('Using Cloudflare KV API for data storage');
        await this.kvManager.initialize();
      } else {
        console.log('Using localStorage for data storage');
        // localStorage管理器不需要异步初始化
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing HybridBlogManager:', error);
      // 回退到localStorage
      this.useAPI = false;
      this.initialized = true;
    }
  }

  // 获取当前使用的存储类型
  getStorageInfo() {
    return {
      type: this.useAPI ? 'Cloudflare KV API' : 'localStorage',
      apiInfo: this.apiClient.getAPIInfo(),
      initialized: this.initialized
    };
  }

  // 添加文章
  async addPost(post) {
    await this.initialize();
    
    if (this.useAPI) {
      const result = await this.apiClient.createPost(post);
      if (result) {
        return result;
      } else {
        // API失败，回退到本地存储
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.addPost(post);
      }
    } else {
      return this.localManager.addPost(post);
    }
  }

  // 更新文章
  async updatePost(id, updatedPost) {
    await this.initialize();
    
    if (this.useAPI) {
      const result = await this.apiClient.updatePost(id, updatedPost);
      if (result) {
        return result;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.updatePost(id, updatedPost);
      }
    } else {
      return this.localManager.updatePost(id, updatedPost);
    }
  }

  // 删除文章
  async deletePost(id) {
    await this.initialize();
    
    if (this.useAPI) {
      const success = await this.apiClient.deletePost(id);
      if (success) {
        return;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.deletePost(id);
      }
    } else {
      return this.localManager.deletePost(id);
    }
  }

  // 获取文章列表
  async getPosts(category = 'all', limit = null) {
    await this.initialize();
    
    if (this.useAPI) {
      const posts = await this.apiClient.getPosts({ category, limit });
      if (posts !== null) {
        return posts;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.getPosts(category, limit);
      }
    } else {
      return this.localManager.getPosts(category, limit);
    }
  }

  // 获取单篇文章
  async getPost(id) {
    await this.initialize();
    
    if (this.useAPI) {
      const post = await this.apiClient.getPost(id);
      if (post !== null) {
        return post;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.getPost(id);
      }
    } else {
      return this.localManager.getPost(id);
    }
  }

  // 搜索文章
  async searchPosts(keyword) {
    await this.initialize();
    
    if (this.useAPI) {
      const posts = await this.apiClient.getPosts({ search: keyword });
      if (posts !== null) {
        return posts;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.searchPosts(keyword);
      }
    } else {
      return this.localManager.searchPosts(keyword);
    }
  }

  // 获取统计信息
  async getStats() {
    await this.initialize();
    
    if (this.useAPI) {
      const stats = await this.apiClient.getStats();
      if (stats !== null) {
        return stats;
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.getStats();
      }
    } else {
      return this.localManager.getStats();
    }
  }

  // 导出数据
  async exportData() {
    await this.initialize();
    
    if (this.useAPI) {
      // 从API获取所有数据
      const posts = await this.apiClient.getPosts();
      if (posts !== null) {
        return {
          posts: posts,
          exportDate: new Date().toISOString(),
          storageInfo: this.getStorageInfo()
        };
      } else {
        console.warn('API failed, falling back to localStorage');
        this.useAPI = false;
        return this.localManager.exportData();
      }
    } else {
      return this.localManager.exportData();
    }
  }

  // 导入数据
  async importData(data) {
    await this.initialize();
    
    if (this.useAPI) {
      // 需要逐个创建文章，因为API不支持批量导入
      try {
        if (data.posts && Array.isArray(data.posts)) {
          // 先清空现有数据（可选）
          const confirmClear = confirm('导入数据将替换现有所有文章，是否继续？');
          if (!confirmClear) return false;
          
          // 获取现有文章并删除
          const existingPosts = await this.apiClient.getPosts();
          if (existingPosts) {
            for (const post of existingPosts) {
              await this.apiClient.deletePost(post.id);
            }
          }
          
          // 导入新文章
          for (const post of data.posts) {
            const { id, createdAt, updatedAt, ...postData } = post;
            await this.apiClient.createPost(postData);
          }
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('API import failed, falling back to localStorage:', error);
        this.useAPI = false;
        return this.localManager.importData(data);
      }
    } else {
      return this.localManager.importData(data);
    }
  }

  // 同步数据（从localStorage到KV或反之）
  async syncData(direction = 'auto') {
    await this.initialize();
    
    try {
      if (direction === 'auto') {
        // 自动判断同步方向
        if (this.useAPI) {
          // 当前使用API，检查localStorage是否有更新的数据
          const localData = this.localManager.exportData();
          const apiPosts = await this.apiClient.getPosts();
          
          if (localData.posts.length > (apiPosts ? apiPosts.length : 0)) {
            direction = 'toAPI';
          } else {
            direction = 'toLocal';
          }
        } else {
          direction = 'toAPI';
        }
      }
      
      if (direction === 'toAPI' && this.useAPI) {
        // 从localStorage同步到API
        const localData = this.localManager.exportData();
        await this.importData(localData);
        console.log('Data synced from localStorage to API');
        return true;
      } else if (direction === 'toLocal') {
        // 从API同步到localStorage
        const apiData = await this.exportData();
        this.localManager.importData(apiData);
        console.log('Data synced from API to localStorage');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Data sync failed:', error);
      return false;
    }
  }

  // 强制切换存储方式
  async switchStorage(useAPI = null) {
    if (useAPI !== null) {
      this.useAPI = useAPI;
    } else {
      this.useAPI = !this.useAPI;
    }
    
    if (this.useAPI) {
      const apiAvailable = await this.apiClient.checkAPIHealth();
      if (!apiAvailable) {
        console.warn('API not available, cannot switch to API storage');
        this.useAPI = false;
        return false;
      }
    }
    
    console.log(`Switched to ${this.useAPI ? 'API' : 'localStorage'} storage`);
    return true;
  }
}