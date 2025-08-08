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
      if (!mindMapData || !mindMapData.markdown || !mindMapData.markdown.trim()) {
        newErrors.content = '思维导图内容不能为空';
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

  // 思维导图编辑器组件 - 使用 Markmap 风格
  const MindMapEditor = () => {
    const [mindMapMarkdown, setMindMapMarkdown] = React.useState(
      mindMapData?.markdown || `# 中心主题

## 分支 1
- 子节点 1
- 子节点 2

## 分支 2
- 子节点 3
- 子节点 4

## 分支 3
- 子节点 5
  - 更深层节点
- 子节点 6`
    );
    const [showPreview, setShowPreview] = React.useState(true);
    const markmapRef = React.useRef(null);
    
    // 更新思维导图数据
    React.useEffect(() => {
      setMindMapData({ markdown: mindMapMarkdown });
    }, [mindMapMarkdown]);
    
    // 渲染思维导图预览
    React.useEffect(() => {
      if (showPreview && markmapRef.current && mindMapMarkdown.trim()) {
        // 清空之前的内容
        markmapRef.current.innerHTML = '';
        
        // 创建 SVG 元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '400px';
        markmapRef.current.appendChild(svg);
        
        // 简单的思维导图渲染（模拟 markmap 效果）
        renderSimpleMindMap(svg, mindMapMarkdown);
      }
    }, [mindMapMarkdown, showPreview]);
    
    // 简单的思维导图渲染函数
    const renderSimpleMindMap = (svg, markdown) => {
      const lines = markdown.split('\n').filter(line => line.trim());
      const nodes = [];
      let currentLevel = 0;
      
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
          const level = (trimmed.match(/^#+/) || [''])[0].length;
          const text = trimmed.replace(/^#+\s*/, '');
          nodes.push({ level, text, index, x: 0, y: 0 });
        } else if (trimmed.startsWith('-')) {
          const level = Math.max(1, (line.match(/^\s*/) || [''])[0].length / 2) + 1;
          const text = trimmed.replace(/^-\s*/, '');
          nodes.push({ level, text, index, x: 0, y: 0 });
        }
      });
      
      // 计算节点位置
      const centerX = 400;
      const centerY = 200;
      const levelDistance = 150;
      const nodeHeight = 40;
      
      nodes.forEach((node, i) => {
        if (node.level === 1) {
          node.x = centerX;
          node.y = centerY;
        } else {
          const angle = (i / nodes.length) * 2 * Math.PI;
          node.x = centerX + Math.cos(angle) * levelDistance * (node.level - 1);
          node.y = centerY + Math.sin(angle) * levelDistance * (node.level - 1);
        }
      });
      
      // 绘制连接线
      nodes.forEach((node, i) => {
        if (node.level > 1) {
          const parent = nodes.find(n => n.level === node.level - 1);
          if (parent) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parent.x);
            line.setAttribute('y1', parent.y);
            line.setAttribute('x2', node.x);
            line.setAttribute('y2', node.y);
            line.setAttribute('stroke', '#3b82f6');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
          }
        }
      });
      
      // 绘制节点
      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = node.text.length * 8 + 20;
        rect.setAttribute('x', node.x - textWidth / 2);
        rect.setAttribute('y', node.y - 15);
        rect.setAttribute('width', textWidth);
        rect.setAttribute('height', 30);
        rect.setAttribute('rx', 15);
        rect.setAttribute('fill', node.level === 1 ? '#3b82f6' : '#e5e7eb');
        rect.setAttribute('stroke', '#3b82f6');
        rect.setAttribute('stroke-width', '2');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', node.level === 1 ? 'white' : '#374151');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', node.level === 1 ? 'bold' : 'normal');
        text.textContent = node.text;
        
        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
      });
    };
    
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">思维导图编辑器</h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Markdown 编辑区 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Markdown 格式 (使用 # 表示标题层级，- 表示列表项)
            </label>
            <textarea
              value={mindMapMarkdown}
              onChange={(e) => setMindMapMarkdown(e.target.value)}
              className="w-full h-80 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="# 中心主题&#10;&#10;## 分支 1&#10;- 子节点 1&#10;- 子节点 2&#10;&#10;## 分支 2&#10;- 子节点 3&#10;- 子节点 4"
            />
          </div>
          
          {/* 预览区 */}
          {showPreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                思维导图预览
              </label>
              <div 
                ref={markmapRef}
                className="w-full h-80 border border-gray-300 rounded-lg bg-white overflow-hidden"
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">使用说明：</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 使用 # 表示主题（一个#是中心主题，##是分支，###是子分支）</li>
            <li>• 使用 - 表示列表项（可以通过缩进创建层级）</li>
            <li>• 支持多层嵌套结构</li>
            <li>• 实时预览思维导图效果</li>
          </ul>
        </div>
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