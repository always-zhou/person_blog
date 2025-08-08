console.log('learning-app.js 开始加载...');
console.log('React 版本:', React.version);
console.log('当前时间:', new Date().toISOString());

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出现了一些问题</h1>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LearningApp() {
  console.log('LearningApp 函数开始执行...');
  
  const [currentView, setCurrentView] = React.useState('list'); // 移除selectedCategory
  const [selectedPostId, setSelectedPostId] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState(null);
  
  console.log('准备创建 HybridBlogManager...');
  const [blogManager] = React.useState(() => {
    try {
      const manager = new HybridBlogManager();
      console.log('HybridBlogManager 创建成功:', manager);
      return manager;
    } catch (error) {
      console.error('创建 HybridBlogManager 失败:', error);
      throw error;
    }
  });

    // 初始化blogManager并加载文章数据
    React.useEffect(() => {
      console.log('useEffect 开始执行, searchTerm:', searchTerm);
      const initializeAndLoadPosts = async () => {
        try {
          console.log('开始初始化 blogManager...');
          await blogManager.initialize(); // 确保初始化
          console.log('blogManager 初始化完成');
          await loadPosts();
          console.log('文章加载完成');
        } catch (error) {
          console.error('Error initializing blog manager:', error);
        }
      };
      initializeAndLoadPosts();
    }, [searchTerm]); // 移除selectedCategory依赖

    const loadPosts = async () => {
      console.log('loadPosts 函数开始执行, searchTerm:', searchTerm);
      try {
        let filteredPosts;
        
        if (searchTerm.trim()) {
          console.log('执行搜索, 关键词:', searchTerm);
          // 只在学习分类中搜索
          filteredPosts = await blogManager.searchPosts(searchTerm);
          console.log('搜索结果:', filteredPosts);
          filteredPosts = filteredPosts.filter(post => post.category === '学习');
          console.log('过滤后的搜索结果:', filteredPosts);
        } else {
          console.log('获取学习分类的所有文章');
          // 只获取学习分类的文章
          filteredPosts = await blogManager.getPosts('学习');
          console.log('获取到的文章:', filteredPosts);
        }
        
        console.log('设置文章数据, 数量:', filteredPosts.length);
        setPosts(filteredPosts);
        console.log('文章数据设置完成');
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    const handleCreatePost = () => {
      setEditingPost(null);
      setShowEditor(true);
    };

    const handleEditPost = (post) => {
      setEditingPost(post);
      setShowEditor(true);
    };

    const handleSavePost = async (postData) => {
      try {
        // 强制设置分类为学习
        const learningPostData = { ...postData, category: '学习' };
        
        if (editingPost) {
          await blogManager.updatePost(editingPost.id, learningPostData);
        } else {
          await blogManager.addPost(learningPostData);
        }
        setShowEditor(false);
        setEditingPost(null);
        await loadPosts();
      } catch (error) {
        console.error('保存文章失败:', error);
        alert('保存文章失败，请重试');
      }
    };

    const handleDeletePost = async (postId) => {
      if (confirm('确定要删除这篇文章吗？')) {
        try {
          await blogManager.deletePost(postId);
          await loadPosts();
        } catch (error) {
          console.error('删除文章失败:', error);
          alert('删除文章失败，请重试');
        }
      }
    };

    const handleViewPost = (postId) => {
    console.log('handleViewPost被调用，参数postId:', postId);
    console.log('当前posts数组:', posts);
    setSelectedPostId(postId);
    console.log('设置selectedPostId为:', postId);
    setCurrentView('detail');
    console.log('设置currentView为: detail');
  };

    const handleBackToList = () => {
      setCurrentView('list');
      setSelectedPostId(null);
    };

    // PostEditor弹窗现在作为覆盖层渲染

    if (currentView === 'detail' && selectedPostId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <Header />
          <div className="pt-20">
            <PostDetail
              postId={selectedPostId}
              onBack={handleBackToList}
              onEdit={(post) => handleEditPost(post)}
              onDelete={(postId) => {
                  handleDeletePost(postId);
                  handleBackToList();
                }}
              />
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="cyber-grid"></div>
        <div className="matrix-rain"></div>
        <div className="enhanced-particle-galaxy"></div>

        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow">
                学习记录
              </h1>
              <p className="text-xl text-white/80">
                记录学习的点点滴滴，分享知识与成长
              </p>
            </div>

            {/* 搜索栏 */}
            <div className="mb-12">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={() => {}} // 搜索功能通过useEffect自动触发
                showCategoryFilter={false} // 隐藏分类筛选
              />
            </div>

            {/* 标题和操作栏 */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">学习文章</h2>
              <button
                onClick={handleCreatePost}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="icon-plus mr-2"></span>
                写新文章
              </button>
            </div>



            {/* 调试信息 */}
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <h3 className="text-red-400 font-bold mb-2">调试信息</h3>
              <div className="text-sm text-red-300">
                <p>文章数量: {posts.length}</p>
                <p>搜索词: "{searchTerm}"</p>
                <p>当前视图: {currentView}</p>
                <p>选中文章ID: {selectedPostId}</p>
                {posts.length > 0 && (
                  <div>
                    <p>文章列表:</p>
                    <ul className="ml-4">
                      {posts.map(p => (
                        <li key={p.id}>ID: {p.id}, 标题: {p.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 文章列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map(post => {
                  console.log('渲染PostCard，文章:', post.id, post.title);
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => {
                        console.log('学习页面 - PostCard点击事件触发，文章ID:', post.id);
                        handleViewPost(post.id);
                      }}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePost(post.id)}
                      showActions={true}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white/60 text-lg">
                    {searchTerm ? '没有找到相关文章' : '还没有学习文章，开始写第一篇吧！'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
        
        {/* PostEditor弹窗 */}
        {showEditor && (
          <PostEditor
            post={editingPost}
            onSave={handleSavePost}
            onCancel={() => {
              setShowEditor(false);
              setEditingPost(null);
            }}
            fixedCategory="学习" // 固定分类为学习
          />
        )}
      </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <LearningApp />
  </ErrorBoundary>
);