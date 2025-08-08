function PostDetail({ postId, onBack, onEdit, onDelete }) {
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // 简单的 Markdown 渲染函数
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  };

  // 思维导图查看器组件
  const MindMapViewer = ({ data }) => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      return (
        <div className="text-center py-8 text-white/60">
          暂无思维导图内容
        </div>
      );
    }

    return (
      <div className="mind-map-viewer bg-white/5 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">思维导图</h3>
        </div>
        <div className="space-y-4">
          {data.nodes.map((node, index) => (
            <div 
              key={node.id || index}
              className="bg-white/10 rounded-lg p-4 border border-white/20"
              style={{
                marginLeft: `${(node.level || 0) * 20}px`
              }}
            >
              <div className="text-white font-medium">
                {node.text || `节点 ${index + 1}`}
              </div>
              {node.description && (
                <div className="text-white/70 text-sm mt-2">
                  {node.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    const loadPost = async () => {
      try {
        const blogManager = new HybridBlogManager();
        await blogManager.initialize(); // 确保初始化
        const foundPost = await blogManager.getPost(postId);
        console.log('PostDetail loaded post:', foundPost); // 添加调试日志
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
              {post.contentType === 'mindmap' ? (
                <MindMapViewer data={post.mindMapData} />
              ) : (
                <div 
                  className="text-white/90 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: post.contentType === 'markdown' ? renderMarkdown(post.content) : post.content.replace(/\n/g, '<br>') 
                  }}
                />
              )}
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
}