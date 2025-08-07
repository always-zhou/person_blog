// Cloudflare Worker 脚本
// 用于处理博客数据的API请求

// CORS 头部设置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 CORS 预检请求
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

// 主要的请求处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      if (path.startsWith('/api/')) {
        return await handleAPI(request, env, path, method);
      }

      // Manual rewrite logic to handle clean URLs
      const rewrites = {
        '/learning': '/learning.html',
        '/fitness': '/fitness.html',
        '/life': '/life.html',
        '/photography': '/photography.html',
        '/about': '/about.html',
        '/': '/index.html'
      };

      if (rewrites[path]) {
        const newUrl = new URL(rewrites[path], request.url);
        const newRequest = new Request(newUrl, request);
        return env.ASSETS.fetch(newRequest);
      }

      // Fallback for other static assets (like CSS, images) and 404
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// 处理 API 请求
async function handleAPI(request, env, path, method) {
  const segments = path.split('/').filter(Boolean);
  
  if (segments[1] === 'posts') {
    return await handlePostsAPI(request, env, segments, method);
  }
  
  if (segments[1] === 'stats') {
    return await handleStatsAPI(request, env, method);
  }
  
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 处理文章相关的 API
async function handlePostsAPI(request, env, segments, method) {
  const KV = env.BLOG_KV; // KV 命名空间
  
  switch (method) {
    case 'GET':
      if (segments.length === 2) {
        // GET /api/posts - 获取所有文章
        return await getAllPosts(KV, request);
      } else if (segments.length === 3) {
        // GET /api/posts/{id} - 获取单篇文章
        return await getPost(KV, segments[2]);
      }
      break;
      
    case 'POST':
      if (segments.length === 2) {
        // POST /api/posts - 创建新文章
        return await createPost(KV, request);
      }
      break;
      
    case 'PUT':
      if (segments.length === 3) {
        // PUT /api/posts/{id} - 更新文章
        return await updatePost(KV, segments[2], request);
      }
      break;
      
    case 'DELETE':
      if (segments.length === 3) {
        // DELETE /api/posts/{id} - 删除文章
        return await deletePost(KV, segments[2]);
      }
      break;
  }
  
  return new Response(JSON.stringify({ error: 'Invalid API request' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 获取所有文章
async function getAllPosts(KV, request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit');
    const search = url.searchParams.get('search');
    
    const postsData = await KV.get('blogPosts');
    let posts = postsData ? JSON.parse(postsData) : [];
    
    // 按分类筛选
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category);
    }
    
    // 搜索功能
    if (search) {
      const lowerSearch = search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) ||
        post.content.toLowerCase().includes(lowerSearch) ||
        post.summary.toLowerCase().includes(lowerSearch) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }
    
    // 限制数量
    if (limit) {
      posts = posts.slice(0, parseInt(limit));
    }
    
    return new Response(JSON.stringify({ posts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to get posts' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 获取单篇文章
async function getPost(KV, id) {
  try {
    const postsData = await KV.get('blogPosts');
    const posts = postsData ? JSON.parse(postsData) : [];
    const post = posts.find(p => p.id === parseInt(id));
    
    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ post }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting post:', error);
    return new Response(JSON.stringify({ error: 'Failed to get post' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 创建新文章
async function createPost(KV, request) {
  try {
    const postData = await request.json();
    const postsData = await KV.get('blogPosts');
    const posts = postsData ? JSON.parse(postsData) : [];
    
    const newPost = {
      id: Date.now(),
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    await KV.put('blogPosts', JSON.stringify(posts));
    
    return new Response(JSON.stringify({ post: newPost }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 更新文章
async function updatePost(KV, id, request) {
  try {
    const updateData = await request.json();
    const postsData = await KV.get('blogPosts');
    const posts = postsData ? JSON.parse(postsData) : [];
    
    const index = posts.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    posts[index] = {
      ...posts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await KV.put('blogPosts', JSON.stringify(posts));
    
    return new Response(JSON.stringify({ post: posts[index] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 删除文章
async function deletePost(KV, id) {
  try {
    const postsData = await KV.get('blogPosts');
    const posts = postsData ? JSON.parse(postsData) : [];
    
    const filteredPosts = posts.filter(p => p.id !== parseInt(id));
    
    if (filteredPosts.length === posts.length) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    await KV.put('blogPosts', JSON.stringify(filteredPosts));
    
    return new Response(JSON.stringify({ message: 'Post deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete post' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 处理统计信息 API
async function handleStatsAPI(request, env, method) {
  if (method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const KV = env.BLOG_KV;
    const postsData = await KV.get('blogPosts');
    const posts = postsData ? JSON.parse(postsData) : [];
    
    const categories = ['学习', '健身', '生活', '摄影'];
    const stats = {
      total: posts.length,
      categories: {}
    };
    
    categories.forEach(category => {
      stats.categories[category] = posts.filter(post => post.category === category).length;
    });
    
    return new Response(JSON.stringify({ stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}