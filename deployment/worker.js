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

      // 检查是否需要密码保护（除了登录页面和静态资源）
      if (env.PASSWORD && !isPublicPath(path)) {
        const authResult = await checkWebAuth(request, env);
        if (authResult) {
          return authResult; // 返回登录页面或重定向
        }
      }

      // --- Route Handling Logic ---
      let targetPath = path;
      
      // Handle root paths
      if (path === '/' || path === '/public/') {
        targetPath = '/index.html';
      }
      // Handle /public/page requests (keep URL as is, serve corresponding HTML)
      else if (path.startsWith('/public/')) {
        const page = path.substring('/public/'.length);
        targetPath = `/${page}.html`;
      }
      // Redirect bare page names to /public/ URLs
      else if (!path.includes('.') && !path.startsWith('/api/')) {
        const redirectUrl = new URL(`/public${path}`, request.url);
        return Response.redirect(redirectUrl.toString(), 302);
      }

      // Create request for the target file
      const newRequest = new Request(new URL(targetPath, request.url), request);
      const response = await env.ASSETS.fetch(newRequest);

      // Return 404 page if file not found
      if (response.status === 404) {
        const notFoundRequest = new Request(new URL('/404.html', request.url), request);
        return env.ASSETS.fetch(notFoundRequest);
      }

      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// 验证密码
function validatePassword(request, env) {
  // 如果没有设置PASSWORD环境变量，则跳过验证
  if (!env.PASSWORD) {
    return true;
  }
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
  return token === env.PASSWORD;
}

// 检查是否为公共路径（不需要密码保护）
function isPublicPath(path) {
  const publicPaths = [
    '/login.html',
    '/src/js/login.js',
    '/src/css/',
    '/favicon.ico',
    '/.well-known/',
    '/robots.txt',
    '/sitemap.xml'
  ];
  
  // 检查是否为公共路径
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

// 检查网站访问认证
async function checkWebAuth(request, env) {
  // 检查Cookie中的认证信息
  const cookies = request.headers.get('Cookie') || '';
  const authCookie = cookies.split(';').find(cookie => 
    cookie.trim().startsWith('blog_auth=')
  );
  
  if (authCookie) {
    const token = authCookie.split('=')[1];
    if (token === env.PASSWORD) {
      return null; // 认证通过，继续处理请求
    }
  }
  
  // 如果是POST请求到登录接口，处理登录
  if (request.method === 'POST' && request.url.includes('/login')) {
    return await handleLogin(request, env);
  }
  
  // 未认证，返回登录页面
  return new Response(getLoginPage(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    }
  });
}

// 处理登录请求
async function handleLogin(request, env) {
  try {
    const formData = await request.formData();
    const password = formData.get('password');
    
    if (password === env.PASSWORD) {
      // 登录成功，设置Cookie并重定向
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `blog_auth=${env.PASSWORD}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
          ...corsHeaders
        }
      });
    } else {
      // 登录失败
      return new Response(getLoginPage(true), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    return new Response(getLoginPage(true), {
      status: 400,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders
      }
    });
  }
}

// 生成登录页面HTML
function getLoginPage(hasError = false) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网站访问验证</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .submit-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        
        .error-message {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .footer {
            margin-top: 30px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🔐</div>
        <h1>网站访问验证</h1>
        <p class="subtitle">请输入访问密码继续浏览</p>
        
        ${hasError ? '<div class="error-message">密码错误，请重试</div>' : ''}
        
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="password">访问密码</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required 
                    autocomplete="current-password"
                    placeholder="请输入密码"
                >
            </div>
            
            <button type="submit" class="submit-btn">进入网站</button>
        </form>
        
        <div class="footer">
            <p>此网站受密码保护</p>
        </div>
    </div>
    
    <script>
        // 自动聚焦到密码输入框
        document.getElementById('password').focus();
    </script>
</body>
</html>
  `;
}

// 处理 API 请求
async function handleAPI(request, env, path, method) {
  // 验证密码（除了健康检查接口）
  if (path !== '/api/health' && !validatePassword(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const segments = path.split('/').filter(Boolean);
  
  if (segments[1] === 'posts') {
    return await handlePostsAPI(request, env, segments, method);
  }
  
  if (segments[1] === 'stats') {
    return await handleStatsAPI(request, env, method);
  }
  
  if (segments[1] === 'health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  if (segments[1] === 'logout') {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Set-Cookie': 'blog_auth=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
      },
    });
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