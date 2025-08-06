function AdminApp() {
  const [posts, setPosts] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState(null);
  const [stats, setStats] = React.useState({});
  const [blogManager] = React.useState(() => new HybridBlogManager());

  React.useEffect(() => {
    loadData();
  }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    try {
      let filteredPosts;
      
      if (searchTerm.trim()) {
        filteredPosts = await blogManager.searchPosts(searchTerm);
        if (selectedCategory !== 'all') {
          filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
        }
      } else {
        filteredPosts = await blogManager.getPosts(selectedCategory);
      }
      
      setPosts(filteredPosts);
      const statsData = await blogManager.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleSavePost = async (postData) => {
    try {
      if (editingPost) {
        await blogManager.updatePost(editingPost.id, postData);
      } else {
        await blogManager.addPost(postData);
      }
      
      setShowEditor(false);
      setEditingPost(null);
      await loadData();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('保存文章时出现错误，请重试');
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm('确定要删除这篇文章吗？')) {
      try {
        await blogManager.deletePost(postId);
        await loadData();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('删除文章时出现错误，请重试');
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingPost(null);
  };

  const handleExport = async () => {
    try {
      const data = await blogManager.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('导出数据时出现错误，请重试');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const success = await blogManager.importData(data);
          if (success) {
            alert('数据导入成功！');
            await loadData();
          } else {
            alert('数据格式错误！');
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('文件解析失败！');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">博客管理后台</h1>
              <a 
                href="index.html" 
                className="text-blue-600 hover:text-blue-800 text-sm"
                target="_blank"
              >
                查看网站 →
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
              >
                导入数据
              </label>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                导出数据
              </button>
              <button
                onClick={handleNewPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                新建文章
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-gray-600">总文章数</div>
          </div>
          {['学习', '健身', '生活', '摄影'].map(category => (
            <div key={category} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {stats.categories?.[category] || 0}
              </div>
              <div className="text-gray-600">{category}文章</div>
            </div>
          ))}
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索文章标题、内容或标签..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="all">全部分类</option>
              <option value="学习">学习</option>
              <option value="健身">健身</option>
              <option value="生活">生活</option>
              <option value="摄影">摄影</option>
            </select>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              文章列表 ({posts.length})
            </h2>
          </div>
          
          {posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {post.summary}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm ? '没有找到相关文章' : '还没有文章'}
              </div>
              <button
                onClick={handleNewPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建第一篇文章
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 文章编辑器 */}
      {showEditor && (
        <PostEditor 
          post={editingPost}
          onSave={handleSavePost}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);