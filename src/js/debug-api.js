// API 调试脚本
// 在浏览器控制台中运行此脚本来诊断问题

async function debugAPI() {
    console.log('🔍 开始 API 调试...');
    
    // 1. 检查配置
    console.log('📋 配置信息:');
    console.log('CONFIG:', window.CONFIG);
    console.log('当前域名:', window.location.hostname);
    console.log('当前协议:', window.location.protocol);
    
    // 2. 测试 API 客户端
    console.log('\n🌐 测试 API 客户端...');
    try {
        const apiClient = new APIClient();
        console.log('API Base URL:', apiClient.baseURL);
        
        // 测试健康检查
        const isHealthy = await apiClient.checkAPIHealth();
        console.log('API 健康状态:', isHealthy);
        
        if (isHealthy) {
            // 测试获取统计信息
            const stats = await apiClient.getStats();
            console.log('统计信息:', stats);
            
            // 测试获取文章
            const posts = await apiClient.getPosts();
            console.log('文章列表:', posts);
        }
    } catch (error) {
        console.error('API 客户端测试失败:', error);
    }
    
    // 3. 测试混合管理器
    console.log('\n🔄 测试混合管理器...');
    try {
        const hybridManager = new HybridBlogManager();
        await hybridManager.initialize();
        
        const storageInfo = hybridManager.getStorageInfo();
        console.log('存储信息:', storageInfo);
        
        // 测试获取文章
        const posts = await hybridManager.getPosts();
        console.log('混合管理器 - 文章列表:', posts);
        
        // 测试创建文章
        const testPost = {
            title: '调试测试文章 - ' + new Date().toLocaleString(),
            content: '这是一篇用于调试的测试文章。',
            summary: '调试测试',
            category: '测试',
            tags: ['调试', 'API']
        };
        
        console.log('\n📝 创建测试文章...');
        const result = await hybridManager.addPost(testPost);
        console.log('创建结果:', result);
        
        // 再次获取文章列表
        const updatedPosts = await hybridManager.getPosts();
        console.log('更新后的文章列表:', updatedPosts);
        
    } catch (error) {
        console.error('混合管理器测试失败:', error);
    }
    
    console.log('\n✅ API 调试完成');
}

// 直接调用 API 测试
async function testDirectAPI() {
    console.log('🚀 直接 API 测试...');
    
    const workerUrl = 'https://personal-blog-api.alwaysgototop.workers.dev';
    
    try {
        // 测试统计接口
        console.log('测试 /api/stats...');
        const statsResponse = await fetch(workerUrl + '/api/stats');
        const stats = await statsResponse.json();
        console.log('统计结果:', stats);
        
        // 测试获取文章接口
        console.log('\n测试 /api/posts...');
        const postsResponse = await fetch(workerUrl + '/api/posts');
        const posts = await postsResponse.json();
        console.log('文章结果:', posts);
        
        // 测试创建文章接口
        console.log('\n测试创建文章...');
        const testPost = {
            title: '直接API测试文章 - ' + new Date().toLocaleString(),
            content: '这是通过直接API调用创建的测试文章。',
            summary: '直接API测试',
            category: '测试',
            tags: ['直接API', '测试']
        };
        
        const createResponse = await fetch(workerUrl + '/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPost)
        });
        
        const createResult = await createResponse.json();
        console.log('创建结果:', createResult);
        
        // 再次获取文章列表
        console.log('\n再次获取文章列表...');
        const updatedPostsResponse = await fetch(workerUrl + '/api/posts');
        const updatedPosts = await updatedPostsResponse.json();
        console.log('更新后的文章列表:', updatedPosts);
        
    } catch (error) {
        console.error('直接 API 测试失败:', error);
    }
}

// 导出函数供控制台使用
window.debugAPI = debugAPI;
window.testDirectAPI = testDirectAPI;

console.log('🔧 调试脚本已加载！');
console.log('运行 debugAPI() 来测试完整流程');
console.log('运行 testDirectAPI() 来直接测试 API');