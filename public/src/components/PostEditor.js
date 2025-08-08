function PostEditor({ post, onSave, onCancel, fixedCategory }) {
  const [formData, setFormData] = React.useState({
    title: post?.title || '',
    content: post?.content || '',
    category: post?.category || '学习',
    tags: post?.tags?.join(', ') || '',
    summary: post?.summary || '',
    contentType: post?.contentType || 'markdown' // 新增：内容类型
  });

  const [errors, setErrors] = React.useState({});
  const [showPreview, setShowPreview] = React.useState(false); // 新增：预览模式
  const [mindMapData, setMindMapData] = React.useState(post?.mindMapData || null); // 新增：思维导图数据

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    // 根据内容类型验证不同的字段
    if (contentType === 'markdown') {
      if (!formData.content.trim()) {
        newErrors.content = '内容不能为空';
      }
    } else if (contentType === 'mindmap') {
      if (!mindMapData || !mindMapData.nodes || mindMapData.nodes.length === 0) {
        newErrors.content = '思维导图不能为空';
      }
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
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      mindMapData: formData.contentType === 'mindmap' ? mindMapData : null
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

  // Markdown 渲染函数（简单实现）
  const renderMarkdown = (text) => {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/gim, '<br>');
  };

  // 思维导图编辑器组件
  const MindMapEditor = () => {
    const [nodes, setNodes] = React.useState(mindMapData?.nodes || [
      { id: '1', text: '中心主题', x: 400, y: 200, level: 0 }
    ]);
    const [draggedNode, setDraggedNode] = React.useState(null);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    
    const addNode = () => {
      const newNode = {
        id: Date.now().toString(),
        text: '新节点',
        x: 200 + Math.random() * 400,
        y: 100 + Math.random() * 300,
        level: 1
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setMindMapData({ nodes: newNodes });
    };
    
    const updateNode = (id, text) => {
      const newNodes = nodes.map(node => 
        node.id === id ? { ...node, text } : node
      );
      setNodes(newNodes);
      setMindMapData({ nodes: newNodes });
    };
    
    const updateNodePosition = (id, x, y) => {
      const newNodes = nodes.map(node => 
        node.id === id ? { ...node, x, y } : node
      );
      setNodes(newNodes);
      setMindMapData({ nodes: newNodes });
    };
    
    const deleteNode = (id) => {
      if (nodes.length > 1) {
        const newNodes = nodes.filter(node => node.id !== id);
        setNodes(newNodes);
        setMindMapData({ nodes: newNodes });
      }
    };
    
    const handleMouseDown = (e, node) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      
      const rect = e.currentTarget.parentElement.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - node.x;
      const offsetY = e.clientY - rect.top - node.y;
      
      setDraggedNode(node.id);
      setDragOffset({ x: offsetX, y: offsetY });
      e.preventDefault();
    };
    
    const containerRef = React.useRef(null);
     
     const handleMouseMove = React.useCallback((e) => {
       if (!draggedNode || !containerRef.current) return;
       
       const rect = containerRef.current.getBoundingClientRect();
       const x = Math.max(0, Math.min(rect.width - 120, e.clientX - rect.left - dragOffset.x));
       const y = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));
       
       updateNodePosition(draggedNode, x, y);
     }, [draggedNode, dragOffset.x, dragOffset.y]);
     
     const handleMouseUp = React.useCallback(() => {
       setDraggedNode(null);
       setDragOffset({ x: 0, y: 0 });
     }, []);
     
     React.useEffect(() => {
       if (draggedNode) {
         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
         return () => {
           document.removeEventListener('mousemove', handleMouseMove);
           document.removeEventListener('mouseup', handleMouseUp);
         };
       }
     }, [draggedNode, handleMouseMove, handleMouseUp]);
    
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px] relative">
        <div className="mb-4">
          <button
            type="button"
            onClick={addNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            添加节点
          </button>
        </div>
        <div 
          ref={containerRef}
          className="relative w-full h-96 overflow-hidden border border-gray-200 rounded bg-white"
        >
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute bg-white border-2 rounded-lg p-2 shadow-md select-none ${
                draggedNode === node.id 
                  ? 'border-blue-500 cursor-grabbing z-10' 
                  : 'border-blue-300 cursor-grab hover:border-blue-400'
              }`}
              style={{ left: node.x, top: node.y, minWidth: '120px' }}
              onMouseDown={(e) => handleMouseDown(e, node)}
            >
              <input
                type="text"
                value={node.text}
                onChange={(e) => updateNode(node.id, e.target.value)}
                className="w-full border-none outline-none text-sm font-medium text-center bg-transparent pointer-events-auto"
                onMouseDown={(e) => e.stopPropagation()}
              />
              {nodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteNode(node.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 pointer-events-auto"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          提示：点击节点可编辑文字，拖拽可移动位置
        </p>
      </div>
    );
  };

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

        {/* 内容类型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            内容格式
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="contentType"
                value="markdown"
                checked={formData.contentType === 'markdown'}
                onChange={(e) => handleChange('contentType', e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">Markdown</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="contentType"
                value="mindmap"
                checked={formData.contentType === 'mindmap'}
                onChange={(e) => handleChange('contentType', e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">思维导图</span>
            </label>
          </div>
        </div>

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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-800">
              内容 *
            </label>
            {formData.contentType === 'markdown' && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                {showPreview ? '编辑' : '预览'}
              </button>
            )}
          </div>
          
          {formData.contentType === 'markdown' ? (
            <div className="grid grid-cols-1 gap-4">
              {!showPreview ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="15"
                  placeholder="在这里写下你的文章内容...\n\n支持Markdown格式：\n# 一级标题\n## 二级标题\n**粗体文字**\n*斜体文字*\n- 列表项\n\n[链接文字](链接地址)"
                />
              ) : (
                <div 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[360px] prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }}
                />
              )}
            </div>
          ) : (
            <MindMapEditor />
          )}
          
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