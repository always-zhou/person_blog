class BlogManager {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem('blogPosts')) || this.getDefaultPosts();
    this.categories = ['学习', '健身', '生活', '摄影'];
  }

  // 获取默认示例文章
  getDefaultPosts() {
    return [
      {
        id: 1,
        title: "React 18 新特性深度解析",
        category: "学习",
        content: "React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、新的 Suspense 功能等。\n\n## 并发渲染\n\n并发渲染是 React 18 最重要的特性之一。它允许 React 在渲染过程中暂停和恢复工作，从而提供更好的用户体验。\n\n## 自动批处理\n\n在 React 18 中，所有的状态更新都会自动批处理，无论它们发生在哪里。这意味着更少的重新渲染和更好的性能。\n\n## 新的 Suspense 功能\n\nSuspense 现在支持服务端渲染，并且可以与并发特性完美配合。",
        summary: "深入了解React 18的并发特性、Suspense改进和新的Hooks",
        tags: ["React", "JavaScript", "前端"],
        readTime: "8分钟",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z"
      },
      {
        id: 2,
        title: "我的健身之路：从零基础到马拉松",
        category: "健身",
        content: "回想起两年前的自己，完全是一个运动小白。那时候爬三层楼梯都会气喘吁吁，更别说跑步了。\n\n## 起步阶段\n\n最开始我只是想减肥，每天晚上在小区里慢走30分钟。虽然很简单，但坚持下来确实有效果。\n\n## 进阶训练\n\n随着体能的提升，我开始尝试慢跑。从最初的跑5分钟就累得不行，到后来能够连续跑30分钟，这个过程充满了挑战和成就感。\n\n## 马拉松挑战\n\n经过一年半的训练，我终于完成了人生第一个马拉松。那种冲过终点线的感觉，至今难忘。",
        summary: "记录从运动小白到完成马拉松的成长历程，分享训练心得和体会",
        tags: ["跑步", "马拉松", "健身", "成长"],
        readTime: "6分钟",
        createdAt: "2024-01-14T09:30:00.000Z",
        updatedAt: "2024-01-14T09:30:00.000Z"
      },
      {
        id: 3,
        title: "春日里的小确幸",
        category: "生活",
        content: "春天来了，万物复苏，生活中处处都是小确幸。\n\n## 晨光中的咖啡\n\n每天早晨，阳光透过窗帘洒在桌上，一杯热腾腾的咖啡，一本好书，这就是最简单的幸福。\n\n## 路边的花朵\n\n上班路上，发现路边开了许多小花，粉色的、白色的、黄色的，它们静静地绽放着，为这个城市增添了一抹温柔的色彩。\n\n## 朋友的问候\n\n收到老朋友的微信，简单的几句话，却让人感到温暖。原来，被人惦记着，是这样美好的事情。",
        summary: "记录生活中的美好瞬间，感受平凡日子里的小确幸",
        tags: ["生活", "感悟", "幸福", "春天"],
        readTime: "4分钟",
        createdAt: "2024-01-13T16:20:00.000Z",
        updatedAt: "2024-01-13T16:20:00.000Z"
      },
      {
        id: 4,
        title: "城市夜景摄影技巧分享",
        category: "摄影",
        content: "夜晚的城市有着独特的魅力，霓虹灯、车流、建筑物的轮廓，都是很好的拍摄素材。\n\n## 器材准备\n\n拍摄夜景需要准备三脚架、快门线或遥控器，相机最好有较好的高感性能。\n\n## 拍摄技巧\n\n1. **使用三脚架**：夜景拍摄通常需要较长的曝光时间，三脚架是必需品\n2. **手动对焦**：在光线不足的情况下，手动对焦往往比自动对焦更可靠\n3. **RAW格式**：RAW格式能够保留更多的细节，便于后期调整\n\n## 后期处理\n\n适当提升阴影，压低高光，增加对比度，可以让夜景照片更加出彩。",
        summary: "分享城市夜景摄影的实用技巧，从器材准备到后期处理",
        tags: ["摄影", "夜景", "技巧", "后期"],
        readTime: "7分钟",
        createdAt: "2024-01-12T20:15:00.000Z",
        updatedAt: "2024-01-12T20:15:00.000Z"
      }
    ];
  }

  // 添加文章
  addPost(post) {
    const newPost = {
      id: Date.now(),
      ...post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 为健身分类添加专门的记录字段
    if (post.category === '健身') {
      newPost.fitnessData = {
        workoutType: post.workoutType || '', // 运动类型
        duration: post.duration || 0, // 运动时长(分钟)
        intensity: post.intensity || '中等', // 强度等级
        bodyWeight: post.bodyWeight || 0, // 体重记录
        exercises: post.exercises || [], // 具体运动项目
        mood: post.mood || '良好', // 运动后心情
        notes: post.notes || '', // 额外备注
        calories: post.calories || 0, // 消耗卡路里
        heartRate: post.heartRate || 0, // 平均心率
        bodyFat: post.bodyFat || 0, // 体脂率
        muscleMass: post.muscleMass || 0 // 肌肉量
      };
    }
    
    this.posts.unshift(newPost);
    this.savePosts();
    return newPost;
  }

  // 更新文章
  updatePost(id, updatedPost) {
    const index = this.posts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.posts[index] = {
        ...this.posts[index],
        ...updatedPost,
        updatedAt: new Date().toISOString()
      };
      this.savePosts();
      return this.posts[index];
    }
    return null;
  }

  // 删除文章
  deletePost(id) {
    this.posts = this.posts.filter(post => post.id !== id);
    this.savePosts();
  }

  // 获取文章列表
  getPosts(category = 'all', limit = null) {
    let filteredPosts = category === 'all' 
      ? this.posts 
      : this.posts.filter(post => post.category === category);
    
    return limit ? filteredPosts.slice(0, limit) : filteredPosts;
  }

  // 获取单篇文章
  getPost(id) {
    // 支持多种ID格式的匹配
    return this.posts.find(post => {
      // 直接匹配
      if (post.id === id) return true;
      // 字符串匹配
      if (String(post.id) === String(id)) return true;
      // 数字匹配
      if (parseInt(post.id) === parseInt(id)) return true;
      return false;
    });
  }

  // 搜索文章
  searchPosts(keyword) {
    if (!keyword.trim()) return this.posts;
    
    const lowerKeyword = keyword.toLowerCase();
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(lowerKeyword) ||
      post.content.toLowerCase().includes(lowerKeyword) ||
      post.summary.toLowerCase().includes(lowerKeyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  // 获取统计信息
  getStats() {
    const stats = {
      total: this.posts.length,
      categories: {}
    };
    
    this.categories.forEach(category => {
      stats.categories[category] = this.posts.filter(post => post.category === category).length;
    });
    
    return stats;
  }

  // 保存到本地存储
  savePosts() {
    localStorage.setItem('blogPosts', JSON.stringify(this.posts));
  }

  // 导出数据
  exportData() {
    return {
      posts: this.posts,
      exportDate: new Date().toISOString()
    };
  }

  // 导入数据
  importData(data) {
    if (data.posts && Array.isArray(data.posts)) {
      this.posts = data.posts;
      this.savePosts();
      return true;
    }
    return false;
  }
}