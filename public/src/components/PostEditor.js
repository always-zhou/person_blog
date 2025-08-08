// 思维导图编辑器组件 - 独立组件避免重渲染
const MindMapEditor = React.memo(({ mindMapData, setMindMapData }) => {
  const [mindMapMarkdown, setMindMapMarkdown] = React.useState(
    mindMapData?.markdown || `- 中心主题\n  - 分支 1\n    - 子节点 1\n    - 子节点 2\n  - 分支 2\n    - 子节点 3\n    - 子节点 4\n  - 分支 3\n    - 子节点 5\n      - 更深层节点\n    - 子节点 6`
  );
  const [showPreview, setShowPreview] = React.useState(true);
  const markmapRef = React.useRef(null);
  const debounceTimerRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const [isComposing, setIsComposing] = React.useState(false);

  // 防抖更新思维导图数据
  const debouncedUpdateMindMapData = React.useCallback((value, skipIfComposing = true) => {
    // 如果正在中文输入组合且需要跳过，则不更新
    if (skipIfComposing && isComposing) {
      return;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setMindMapData({ markdown: value });
    }, 300); // 300ms 防抖
  }, [isComposing, setMindMapData]);
  
  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // 渲染思维导图预览 - 只在mindMapData变化时更新，避免频繁重渲染
  React.useEffect(() => {
    if (showPreview && markmapRef.current && mindMapData?.markdown?.trim()) {
      // 清空之前的内容
      markmapRef.current.innerHTML = '';
      
      // 创建容器和SVG元素
      const svgContainer = document.createElement('div');
      svgContainer.style.width = '100%';
      svgContainer.style.height = '500px';
      svgContainer.style.overflow = 'auto';
      svgContainer.style.border = '1px solid rgba(255,255,255,0.2)';
      svgContainer.style.borderRadius = '8px';
      svgContainer.style.backgroundColor = 'rgba(255,255,255,0.05)';
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.minHeight = '500px';
      svg.style.cursor = 'grab';
      
      svgContainer.appendChild(svg);
      markmapRef.current.appendChild(svgContainer);
      
      // 简单的思维导图渲染（模拟 markmap 效果）
      renderSimpleMindMap(svg, mindMapData.markdown);
    }
  }, [mindMapData, showPreview]);
  
  // 改进的思维导图渲染函数 - 只支持 - 符号层级
  const renderSimpleMindMap = (svg, markdown) => {
    const lines = markdown.split('\n').filter(line => line.trim());
    const nodes = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        // 计算缩进级别（每2个空格或1个tab为一级）
        const indentMatch = line.match(/^(\s*)/);
        const indentStr = indentMatch ? indentMatch[1] : '';
        // 计算实际缩进级别：tab算4个空格，每2个空格为一级
        const indentLevel = indentStr.replace(/\t/g, '    ').length;
        const level = Math.floor(indentLevel / 2) + 1; // 从1开始计数
        const text = trimmed.replace(/^-\s*/, '');
        nodes.push({ level, text, index, x: 0, y: 0, children: [] });
      }
    });
    
    // 建立父子关系
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const nextNode = nodes[j];
        if (nextNode.level === node.level + 1) {
          node.children.push(nextNode);
        } else if (nextNode.level <= node.level) {
          break;
        }
      }
    }
    
    // 使用全局位置分配算法 - 避免重叠
    const levelDistance = 350; // 水平层级间距
    
    // 分配所有节点的位置
    assignGlobalPositions(nodes, levelDistance);
    
    // 如果没有根节点，使用简单的水平布局
    if (rootNodes.length === 0) {
      nodes.forEach((node, i) => {
        node.x = startX + (node.level - 1) * levelDistance;
        node.y = 50 + i * 40;
      });
    }
    
    // 绘制连接线 - 改进的连接逻辑
    nodes.forEach((node, i) => {
      if (node.level > 1) {
        // 找到正确的父节点
        let parent = null;
        for (let j = i - 1; j >= 0; j--) {
          if (nodes[j].level === node.level - 1) {
            parent = nodes[j];
            break;
          }
        }
        
        if (parent) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', parent.x);
          line.setAttribute('y1', parent.y);
          line.setAttribute('x2', node.x);
          line.setAttribute('y2', node.y);
          line.setAttribute('stroke', '#3b82f6');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('opacity', '0.7');
          svg.appendChild(line);
        }
      }
    });
    
    // 绘制节点 - 改进的样式
    nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const textWidth = Math.max(node.text.length * 8 + 20, 80);
      rect.setAttribute('x', node.x - textWidth / 2);
      rect.setAttribute('y', node.y - 15);
      rect.setAttribute('width', textWidth);
      rect.setAttribute('height', 30);
      rect.setAttribute('rx', 15);
      
      // 根据层级设置不同颜色
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const color = colors[(node.level - 1) % colors.length];
      rect.setAttribute('fill', node.level === 1 ? color : '#ffffff');
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', '2');
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', node.level === 1 ? 'white' : color);
      text.setAttribute('font-size', Math.max(14 - node.level, 10));
      text.setAttribute('font-weight', node.level === 1 ? 'bold' : 'normal');
      text.textContent = node.text;
      
      g.appendChild(rect);
      g.appendChild(text);
      svg.appendChild(g);
    });
    
    // 动态计算SVG尺寸
    if (nodes.length > 0) {
      const maxX = Math.max(...nodes.map(n => n.x + Math.max(n.text.length * 10, 100)));
      const maxY = Math.max(...nodes.map(n => n.y + 40));
      const minY = Math.min(...nodes.map(n => n.y - 40));
      const minX = Math.min(...nodes.map(n => n.x - Math.max(n.text.length * 5, 50)));
      
      const width = Math.max(1500, maxX - minX + 200);
      const height = Math.max(600, maxY - minY + 200);
      
      svg.setAttribute('viewBox', `${minX - 100} ${minY - 100} ${width} ${height}`);
      svg.style.width = `${width}px`;
      svg.style.height = `${height}px`;
    }
  };
  
  // 全局垂直位置分配 - 避免重叠的智能布局
  function assignGlobalPositions(nodes, levelDistance) {
    // 按层级分组
    const levelGroups = {};
    nodes.forEach(node => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(node);
    });
    
    // 为每个节点分配全局垂直位置
    let globalYPosition = 0;
    const nodeSpacing = 100; // 节点间的最小垂直间距
    
    // 深度优先遍历，确保父子关系的垂直顺序
    function assignPositionsDFS(nodeIndex, allNodes) {
      const node = allNodes[nodeIndex];
      if (node.positioned) return;
      
      // 设置水平位置
      node.x = 150 + (node.level - 1) * levelDistance;
      
      // 设置垂直位置
      node.y = globalYPosition;
      node.positioned = true;
      globalYPosition += nodeSpacing;
      
      // 处理直接子节点
      for (let i = nodeIndex + 1; i < allNodes.length; i++) {
        const child = allNodes[i];
        if (child.level === node.level + 1 && !child.positioned) {
          assignPositionsDFS(i, allNodes);
        } else if (child.level <= node.level) {
          break;
        }
      }
    }
    
    // 从根节点开始分配位置
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].level === 1 && !nodes[i].positioned) {
        assignPositionsDFS(i, nodes);
      }
    }
  }
  
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
            思维导图内容（Markdown格式）
          </label>
          <textarea
            ref={textareaRef}
            value={mindMapMarkdown}
            onChange={(e) => {
              const newValue = e.target.value;
              setMindMapMarkdown(newValue);
              debouncedUpdateMindMapData(newValue);
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              // 组合输入结束后立即更新
              debouncedUpdateMindMapData(e.target.value, false);
            }}
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
      
      {/* 使用说明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">使用说明：</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 使用 # 表示主题（一个#是中心主题，##是分支，###是子分支）</li>
          <li>• 使用 - 表示列表项（可以通过缩进创建层级）</li>
          <li>• 支持多层嵌套结构</li>
          <li>• 实时预览思维导图效果</li>
        </ul>
      </div>
    </div>
  );
});

function PostEditor({ post, onSave, onCancel, fixedCategory }) {
  const [formData, setFormData] = React.useState({
    title: post?.title || '',
    content: post?.content || '',
    summary: post?.summary || '',
    tags: post?.tags?.join(', ') || '',
    category: post?.category || fixedCategory || '',
    contentType: post?.contentType || 'markdown'
  });

  const [errors, setErrors] = React.useState({});
  const [showPreview, setShowPreview] = React.useState(false);
  const [mindMapData, setMindMapData] = React.useState(
    post?.mindMapData || { markdown: '' }
  );

  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = '摘要不能为空';
    }
    
    if (formData.contentType === 'markdown' && !formData.content.trim()) {
      newErrors.content = '内容不能为空';
    } else if (formData.contentType === 'mindmap' && !mindMapData?.markdown?.trim()) {
      newErrors.content = '思维导图内容不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const postData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      content: formData.contentType === 'mindmap' ? mindMapData.markdown : formData.content,
      mindMapData: formData.contentType === 'mindmap' ? mindMapData : null,
      contentType: formData.contentType
    };

    try {
      await onSave(postData);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  // Markdown 渲染函数
  const renderMarkdown = (text) => {
    if (!text) return '';
    
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
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="输入文章标题..."
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* 内容格式选择 */}
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
                onChange={(e) => setFormData({...formData, contentType: e.target.value})}
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
                onChange={(e) => setFormData({...formData, contentType: e.target.value})}
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
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
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
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
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
            <MindMapEditor mindMapData={mindMapData} setMindMapData={setMindMapData} />
          )}

          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* 按钮 */}
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