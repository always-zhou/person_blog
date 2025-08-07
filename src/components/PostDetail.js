function PostDetail({ postId, onBack, onEdit, onDelete }) {
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPost = async () => {
      try {
        const blogManager = new HybridBlogManager();
        const foundPost = await blogManager.getPost(postId);
        setPost(foundPost);
      } catch (error) {
        console.error('Error loading post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [postId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      '学习': 'from-blue-500 to-purple-600',
      '健身': 'from-green-500 to-teal-600',
      '生活': 'from-pink-500 to-rose-600',
      '摄影': 'from-yellow-500 to-orange-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">文章不存在</div>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={onBack}
              className="text-white/80 hover:text-white flex items-center gap-2 transition-colors"
            >
              <span className="icon-arrow-left"></span> 返回列表
            </button>
            
            {(onEdit || onDelete) && (
              <div className="flex gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="icon-edit"></span> 编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(post.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span className="icon-trash"></span> 删除
                  </button>
                )}
              </div>
            )}
          </div>
          
          <article className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <header className="mb-8">
              {/* 分类标签 */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
                  {post.category}
                </span>
                <span className="text-white/60">{post.readTime}</span>
              </div>

              {/* 标题 */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* 元信息 */}
              <div className="flex flex-wrap gap-4 text-white/70 mb-6">
                <span>发布于 {formatDate(post.createdAt)}</span>
                {post.updatedAt !== post.createdAt && (
                  <span>更新于 {formatDate(post.updatedAt)}</span>
                )}
              </div>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                    #{tag}
                  </span>
                ))}
              </div>
            </header>
            
            {/* 文章内容 */}
            <div className="prose prose-invert max-w-none">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </div>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
}