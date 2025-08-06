function PostEditor({ post, onSave, onCancel, fixedCategory }) {
  const [formData, setFormData] = React.useState({
    title: post?.title || '',
    content: post?.content || '',
    category: post?.category || '学习',
    tags: post?.tags?.join(', ') || '',
    summary: post?.summary || ''
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '内容不能为空';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = '摘要不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const postData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    onSave(postData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 分类由fixedCategory参数直接设置

  React.useEffect(() => {
    if (fixedCategory) {
      setFormData(prev => ({ ...prev, category: fixedCategory }));
    }
  }, [fixedCategory]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-white/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          {post ? (fixedCategory === '摄影' ? '编辑照片合集' : '编辑文章') : (fixedCategory === '摄影' ? '创建照片合集' : '写新文章')}
        </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="输入文章标题..."
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* 分类由fixedCategory自动设置，无需用户选择 */}

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            标签（用逗号分隔）
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="如：React, JavaScript, 前端"
          />
        </div>

        {/* 摘要 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            摘要 *
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all ${
              errors.summary ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="文章简介，建议100字以内..."
          />
          {errors.summary && (
            <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
          )}
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            内容 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="15"
            placeholder="在这里写下你的文章内容...\n\n支持Markdown格式：\n# 一级标题\n## 二级标题\n**粗体文字**\n*斜体文字*\n- 列表项\n\n[链接文字](链接地址)"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-end pt-4 border-t border-gray-300">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
          >
            {post ? (fixedCategory === '摄影' ? '更新合集' : '更新文章') : (fixedCategory === '摄影' ? '发布合集' : '发布文章')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}