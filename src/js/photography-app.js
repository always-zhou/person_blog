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
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-600 text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PhotographyApp() {
  try {
    const [currentView, setCurrentView] = React.useState('list');
    const [selectedPostId, setSelectedPostId] = React.useState(null);
    const [posts, setPosts] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showEditor, setShowEditor] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState(null);
    const [blogManager] = React.useState(() => new HybridBlogManager());

    React.useEffect(() => {
      loadPosts();
    }, [searchTerm]);

    const loadPosts = async () => {
      try {
        let filteredPosts;
        
        if (searchTerm.trim()) {
          filteredPosts = await blogManager.searchPosts(searchTerm);
          filteredPosts = filteredPosts.filter(post => post.category === '摄影');
        } else {
          filteredPosts = await blogManager.getPosts('摄影');
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
        const photographyPostData = { ...postData, category: '摄影' };
        
        if (editingPost) {
          await blogManager.updatePost(editingPost.id, photographyPostData);
        } else {
          await blogManager.addPost(photographyPostData);
        }
        setShowEditor(false);
        setEditingPost(null);
        await loadPosts();
      } catch (error) {
        console.error('保存合集失败:', error);
        alert('保存合集失败，请重试');
      }
    };

    const handleDeletePost = async (postId) => {
      if (confirm('确定要删除这个照片合集吗？')) {
        try {
          await blogManager.deletePost(postId);
          await loadPosts();
        } catch (error) {
          console.error('删除合集失败:', error);
          alert('删除合集失败，请重试');
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
        <div className="min-h-screen gradient-shift relative">
          <div className="relative z-10">
            <Header />
            <main className="pt-32 pb-20 px-4">
              <div className="max-w-4xl mx-auto">
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
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen gradient-shift relative">
        <div className="relative z-10">
          <Header />
          
          <main className="pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-white mb-6">摄影作品</h1>
                <p className="text-xl text-white/80">用镜头记录世界的美好</p>
              </div>

              <div className="mb-12">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onSearch={() => {}} // 搜索功能通过useEffect自动触发
                  placeholder="搜索照片合集..."
                  showCategoryFilter={false} // 隐藏分类筛选
                />
              </div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">照片合集</h2>
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="icon-plus text-lg"></span>
                  <span>创建合集</span>
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-white/60 text-lg mb-4">
                    {searchTerm ? '没有找到相关合集' : '还没有照片合集'}
                  </div>
                  {!searchTerm && (
                    <button
                      onClick={handleCreatePost}
                      className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      创建第一个合集
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => handleViewPost(post.id)}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePost(post.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
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
              fixedCategory="摄影" // 固定分类为摄影
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('PhotographyApp error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">页面加载失败</h1>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-600 text-white rounded-lg">
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
    <PhotographyApp />
  </ErrorBoundary>
);