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
  const [currentView, setCurrentView] = React.useState('list'); // 移除selectedCategory
  const [selectedPostId, setSelectedPostId] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState(null);
  const [blogManager] = React.useState(() => new HybridBlogManager());

    // 初始化blogManager并加载文章数据
    React.useEffect(() => {
      const initializeAndLoadPosts = async () => {
        try {
          await blogManager.initialize(); // 确保初始化
          await loadPosts();
        } catch (error) {
          console.error('Error initializing blog manager:', error);
        }
      };
      initializeAndLoadPosts();
    }, [searchTerm]); // 移除selectedCategory依赖

    const loadPosts = async () => {
      try {
        let filteredPosts;
        
        if (searchTerm.trim()) {
          // 只在学习分类中搜索
          filteredPosts = await blogManager.searchPosts(searchTerm);
          filteredPosts = filteredPosts.filter(post => post.category === '学习');
        } else {
          // 只获取学习分类的文章
          filteredPosts = await blogManager.getPosts('学习');
        }
        
        setPosts(filteredPosts);
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
      setSelectedPostId(postId);
      setCurrentView('detail');
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





            {/* 文章列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => handleViewPost(post.id)}
                    onEdit={() => handleEditPost(post)}
                    onDelete={handleDeletePost}
                    showActions={true}
                  />
                ))
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