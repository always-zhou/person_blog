class CloudflareKVManager {
  constructor() {
    this.isCloudflareWorker = typeof KV !== 'undefined';
    this.fallbackToLocalStorage = !this.isCloudflareWorker;
    
    // 如果不在Cloudflare Workers环境中，提供一个模拟的KV接口
    if (!this.isCloudflareWorker) {
      console.warn('Cloudflare KV not available, falling back to localStorage');
    }
  }

  // 从KV存储获取数据
  async get(key) {
    try {
      if (this.isCloudflareWorker) {
        const value = await KV.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // 本地开发环境回退到localStorage
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('Error getting data from KV:', error);
      return null;
    }
  }

  // 向KV存储保存数据
  async put(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      
      if (this.isCloudflareWorker) {
        await KV.put(key, jsonValue);
        return true;
      } else {
        // 本地开发环境回退到localStorage
        localStorage.setItem(key, jsonValue);
        return true;
      }
    } catch (error) {
      console.error('Error saving data to KV:', error);
      return false;
    }
  }

  // 从KV存储删除数据
  async delete(key) {
    try {
      if (this.isCloudflareWorker) {
        await KV.delete(key);
        return true;
      } else {
        // 本地开发环境回退到localStorage
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.error('Error deleting data from KV:', error);
      return false;
    }
  }

  // 列出所有键（仅在Cloudflare Workers中可用）
  async list(prefix = '') {
    try {
      if (this.isCloudflareWorker) {
        const result = await KV.list({ prefix });
        return result.keys.map(key => key.name);
      } else {
        // 本地环境模拟
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keys.push(key);
          }
        }
        return keys;
      }
    } catch (error) {
      console.error('Error listing keys from KV:', error);
      return [];
    }
  }

  // 检查是否在Cloudflare Workers环境中
  isWorkerEnvironment() {
    return this.isCloudflareWorker;
  }

  // 获取存储状态信息
  getStorageInfo() {
    return {
      type: this.isCloudflareWorker ? 'Cloudflare KV' : 'localStorage',
      available: this.isCloudflareWorker || typeof localStorage !== 'undefined',
      fallback: this.fallbackToLocalStorage
    };
  }
}