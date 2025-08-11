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

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
      onClick={handleClick}
    >
      <div>
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

        {/* 健身数据显示 */}
        {post.category === '健身' && post.fitnessData && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 border border-white/20">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {post.fitnessData.workoutType && (
                <div className="text-white/90">
                  <span className="text-white/60">运动：</span>
                  {post.fitnessData.workoutType}
                </div>
              )}
              {post.fitnessData.duration && (
                <div className="text-white/90">
                  <span className="text-white/60">时长：</span>
                  {post.fitnessData.duration}分钟
                </div>
              )}
              {post.fitnessData.calories && (
                <div className="text-white/90">
                  <span className="text-white/60">卡路里：</span>
                  {post.fitnessData.calories}kcal
                </div>
              )}
              {post.fitnessData.intensity && (
                <div className="text-white/90">
                  <span className="text-white/60">强度：</span>
                  {post.fitnessData.intensity}
                </div>
              )}
              {post.fitnessData.weight && (
                <div className="text-white/90">
                  <span className="text-white/60">体重：</span>
                  {post.fitnessData.weight}kg
                </div>
              )}
              {post.fitnessData.heartRate && (
                <div className="text-white/90">
                  <span className="text-white/60">心率：</span>
                  {post.fitnessData.heartRate}bpm
                </div>
              )}
            </div>
          </div>
        )}

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
              console.log('删除按钮被点击，post.id:', post.id);
              e.stopPropagation();
              console.log('准备显示确认对话框');
              if (confirm('确定要删除这篇文章吗？')) {
                console.log('用户确认删除，调用onDelete');
                onDelete(post.id);
              } else {
                console.log('用户取消删除');
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