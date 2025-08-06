function PostCard({ post, onClick, showActions = false, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
      <div onClick={onClick}>
        {/* 分类标签 */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
            {post.category}
          </span>
          <span className="text-white/60 text-sm">{post.readTime}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
          {post.title}
        </h3>

        {/* 摘要 */}
        <p className="text-white/80 mb-4 line-clamp-3">
          {post.summary}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/20 rounded-md text-xs text-white/90">
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/20 rounded-md text-xs text-white/70">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* 日期 */}
        <div className="text-white/60 text-sm">
          {formatDate(post.createdAt)}
        </div>
      </div>

      {/* 管理操作按钮 */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            编辑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('确定要删除这篇文章吗？')) {
                onDelete(post.id);
              }
            }}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
}