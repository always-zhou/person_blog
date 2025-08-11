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
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FitnessApp() {
  try {
    const [currentView, setCurrentView] = React.useState('list');
    const [selectedPostId, setSelectedPostId] = React.useState(null);
    const [posts, setPosts] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showEditor, setShowEditor] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState(null);
    const [blogManager] = React.useState(() => new HybridBlogManager());
    
    // 添加统计数据状态
    const [stats, setStats] = React.useState({
      totalWorkouts: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalCalories: 0,
      averageHeartRate: 0,
      workoutTypes: {},
      weeklyProgress: [],
      currentWeight: 0,
      currentBodyFat: 0
    });

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

    // 计算健身统计数据
    const calculateStats = (posts) => {
      const fitnessRecords = posts.filter(post => post.fitnessData);
      const totalWorkouts = fitnessRecords.length;
      
      if (totalWorkouts === 0) {
        setStats({
          totalWorkouts: 0,
          totalDuration: 0,
          averageDuration: 0,
          totalCalories: 0,
          averageHeartRate: 0,
          workoutTypes: {},
          weeklyProgress: [],
          currentWeight: 0,
          currentBodyFat: 0
        });
        return;
      }
      
      const totalDuration = fitnessRecords.reduce((sum, post) => sum + (post.fitnessData.duration || 0), 0);
      const totalCalories = fitnessRecords.reduce((sum, post) => sum + (post.fitnessData.calories || 0), 0);
      const heartRates = fitnessRecords.filter(post => post.fitnessData.heartRate > 0).map(post => post.fitnessData.heartRate);
      const averageHeartRate = heartRates.length > 0 ? Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length) : 0;
      
      // 统计运动类型
      const workoutTypes = {};
      fitnessRecords.forEach(post => {
        const type = post.fitnessData.workoutType || '未分类';
        workoutTypes[type] = (workoutTypes[type] || 0) + 1;
      });
      
      // 获取最新的体重和体脂率
      const latestRecord = fitnessRecords.find(post => post.fitnessData.bodyWeight > 0);
      const latestBodyFatRecord = fitnessRecords.find(post => post.fitnessData.bodyFat > 0);
      
      setStats({
        totalWorkouts,
        totalDuration,
        averageDuration: Math.round(totalDuration / totalWorkouts),
        totalCalories,
        averageHeartRate,
        workoutTypes,
        weeklyProgress: [], // 可以后续添加周进度计算
        currentWeight: latestRecord ? latestRecord.fitnessData.bodyWeight : 0,
        currentBodyFat: latestBodyFatRecord ? latestBodyFatRecord.fitnessData.bodyFat : 0
      });
    };

    const loadPosts = async () => {
      try {
        let filteredPosts;
        
        if (searchTerm.trim()) {
          filteredPosts = await blogManager.searchPosts(searchTerm);
          filteredPosts = filteredPosts.filter(post => post.category === '健身');
        } else {
          filteredPosts = await blogManager.getPosts('健身');
        }
        
        setPosts(filteredPosts);
        calculateStats(filteredPosts);
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
        const fitnessPostData = { ...postData, category: '健身' };
        
        if (editingPost) {
          await blogManager.updatePost(editingPost.id, fitnessPostData);
        } else {
          await blogManager.addPost(fitnessPostData);
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
      try {
        await blogManager.deletePost(postId);
        await loadPosts();
      } catch (error) {
        console.error('删除文章失败:', error);
        alert('删除文章失败，请重试');
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
                <h1 className="text-5xl font-bold text-white mb-6">健身记录</h1>
                <p className="text-xl text-white/80">强健体魄 · 挑战自我 · 持续进步</p>
              </div>

              <div className="mb-12">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onSearch={() => {}} // 搜索功能通过useEffect自动触发
                  placeholder="搜索健身文章..."
                  showCategoryFilter={false} // 隐藏分类筛选
                />
              </div>
              
              {/* 健身统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">总锻炼次数</h3>
                    <span className="text-2xl">🏋️</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-sm text-white/60 mt-1">次训练</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">总锻炼时长</h3>
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <p className="text-3xl font-bold">{Math.floor(stats.totalDuration / 60)}</p>
                  <p className="text-sm text-white/60 mt-1">小时 {stats.totalDuration % 60} 分钟</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">消耗卡路里</h3>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalCalories}</p>
                  <p className="text-sm text-white/60 mt-1">千卡</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">平均心率</h3>
                    <span className="text-2xl">❤️</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.averageHeartRate}</p>
                  <p className="text-sm text-white/60 mt-1">bpm</p>
                </div>
              </div>
              
              {/* 身体数据卡片 */}
              {(stats.currentWeight > 0 || stats.currentBodyFat > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {stats.currentWeight > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/80">当前体重</h3>
                        <span className="text-2xl">⚖️</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.currentWeight}</p>
                      <p className="text-sm text-white/60 mt-1">公斤</p>
                    </div>
                  )}
                  
                  {stats.currentBodyFat > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/80">体脂率</h3>
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.currentBodyFat}%</p>
                      <p className="text-sm text-white/60 mt-1">体脂百分比</p>
                    </div>
                  )}
                  
                  {stats.averageDuration > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/80">平均时长</h3>
                        <span className="text-2xl">📈</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.averageDuration}</p>
                      <p className="text-sm text-white/60 mt-1">分钟/次</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* 运动类型分布 */}
              {Object.keys(stats.workoutTypes).length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white border border-white/20 mb-12">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    运动类型分布
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.workoutTypes).map(([type, count]) => (
                      <div key={type} className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-sm text-white/70">{type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">健身文章</h2>
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="icon-plus text-lg"></span>
                  <span>写新文章</span>
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-white/60 text-lg mb-4">
                    {searchTerm ? '没有找到相关文章' : '还没有健身文章'}
                  </div>
                  {!searchTerm && (
                    <button
                      onClick={handleCreatePost}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      写第一篇文章
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
                      onDelete={(postId) => handleDeletePost(postId)}
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
              fixedCategory="健身" // 固定分类为健身
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('FitnessApp error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">页面加载失败</h1>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-lg">
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
    <FitnessApp />
  </ErrorBoundary>
);