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
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-pink-600 text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LifeApp() {
  try {
    const [currentView, setCurrentView] = React.useState('list');
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
    }, [searchTerm]);

    const loadPosts = async () => {
      try {
        let filteredPosts;
        
        if (searchTerm.trim()) {
          filteredPosts = await blogManager.searchPosts(searchTerm);
          filteredPosts = filteredPosts.filter(post => post.category === '生活');
        } else {
          filteredPosts = await blogManager.getPosts('生活');
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
        const lifePostData = { ...postData, category: '生活' };
        
        if (editingPost) {
          await blogManager.updatePost(editingPost.id, lifePostData);
        } else {
          await blogManager.addPost(lifePostData);
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
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-red-900">
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
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-red-900">
        <div className="cyber-grid"></div>
        <div className="matrix-rain"></div>
        <div className="enhanced-particle-galaxy"></div>

        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow">
                生活记录
              </h1>
              <p className="text-xl text-white/80">
                分享日常生活的美好瞬间
              </p>
            </div>

            {/* 搜索栏 */}
            <div className="mb-12">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={() => {}} // 搜索功能通过useEffect自动触发
                showCategoryFilter={false}
              />
            </div>

            {/* 标题和操作栏 */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">生活文章</h2>
              <button
                onClick={handleCreatePost}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="icon-plus mr-2"></span>
                写新文章
              </button>
            </div>

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
                    {searchTerm ? '没有找到相关文章' : '还没有生活文章，开始记录美好生活吧！'}
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
            fixedCategory="生活" // 固定分类为生活
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('LifeApp error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">页面加载失败</h1>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-pink-600 text-white rounded-lg">
            重新加载
          </button>
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <LifeApp />
  </ErrorBoundary>
);
