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
    
    // 使用水平树形布局
    const levelDistance = 200; // 水平层级间距
    
    // 分配所有节点的位置
    layoutHorizontalTree(nodes, levelDistance);
    
    // 如果没有节点，直接返回
    if (nodes.length === 0) {
      return;
    }
    
    // 绘制曲线连接线
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
          // 使用SVG路径绘制贝塞尔曲线
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const midX = (parent.x + node.x) / 2;
          const pathData = `M ${parent.x} ${parent.y} Q ${midX} ${parent.y} ${node.x} ${node.y}`;
          path.setAttribute('d', pathData);
          path.setAttribute('stroke', '#3b82f6');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('opacity', '0.7');
          path.setAttribute('fill', 'none');
          svg.appendChild(path);
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
    
    // 动态计算SVG尺寸 - 适配水平布局
    if (nodes.length > 0) {
      const maxLevel = Math.max(...nodes.map(n => n.level));
      const maxTextWidth = Math.max(...nodes.map(n => n.text.length * 8 + 40));
      
      // 水平布局：宽度基于层级数，高度固定
      const width = Math.max(800, 50 + maxLevel * 200 + maxTextWidth);
      const height = 450; // 固定高度，稍大于容器高度
      
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.width = '100%';
      svg.style.height = '320px';
      svg.style.maxWidth = `${width}px`;
    }
  };
  
  // 水平树形布局 - 紧凑且完整可见
  function layoutHorizontalTree(nodes, levelDistance) {
    // 按层级分组
    const levelGroups = {};
    nodes.forEach(node => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(node);
    });
    
    // 计算每个层级的垂直间距
    const maxLevel = Math.max(...nodes.map(n => n.level));
    const containerHeight = 400; // 固定容器高度
    const nodeHeight = 30;
    
    // 为每个层级分配节点位置
    Object.keys(levelGroups).forEach(level => {
      const levelNodes = levelGroups[level];
      const levelNum = parseInt(level);
      
      // 水平位置：根据层级
      const x = 50 + (levelNum - 1) * levelDistance;
      
      // 垂直位置：在容器内均匀分布
      const totalHeight = containerHeight - nodeHeight;
      const spacing = levelNodes.length > 1 ? totalHeight / (levelNodes.length - 1) : 0;
      
      levelNodes.forEach((node, index) => {
        node.x = x;
        if (levelNodes.length === 1) {
          node.y = containerHeight / 2; // 单个节点居中
        } else {
          node.y = nodeHeight / 2 + index * spacing;
        }
      });
    });
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
              className="w-full h-80 border border-gray-300 rounded-lg bg-white overflow-auto"
              style={{ height: '320px' }}
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
    category: fixedCategory || post?.category || '',
    contentType: post?.contentType || 'markdown'
  });

  const [errors, setErrors] = React.useState({});
  const [showPreview, setShowPreview] = React.useState(false);
  const [mindMapData, setMindMapData] = React.useState(
    post?.mindMapData || { markdown: '' }
  );
  
  // 添加健身专用状态
  const [fitnessData, setFitnessData] = React.useState({
    workoutType: post?.fitnessData?.workoutType || '',
    duration: post?.fitnessData?.duration || 0,
    intensity: post?.fitnessData?.intensity || '中等',
    bodyWeight: post?.fitnessData?.bodyWeight || 0,
    exercises: post?.fitnessData?.exercises || [],
    mood: post?.fitnessData?.mood || '良好',
    notes: post?.fitnessData?.notes || '',
    calories: post?.fitnessData?.calories || 0,
    heartRate: post?.fitnessData?.heartRate || 0,
    bodyFat: post?.fitnessData?.bodyFat || 0,
    muscleMass: post?.fitnessData?.muscleMass || 0
  });
  
  // 添加摄影专用状态
  const [photographyData, setPhotographyData] = React.useState({
    images: post?.photographyData?.images || [],
    description: post?.photographyData?.description || ''
  });

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
    
    // 如果是健身分类，添加健身数据
    if (formData.category === '健身') {
      postData.fitnessData = fitnessData;
    }
    
    // 如果是摄影分类，添加摄影数据
    if (formData.category === '摄影') {
      postData.photographyData = photographyData;
    }

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
        
        {/* 健身专用字段 */}
        {(formData.category === '健身' || fixedCategory === '健身') && (
          <div className="fitness-fields space-y-4 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">🏋️ 健身记录</h3>
            
            {/* 第一行：运动类型和时长 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  运动类型
                </label>
                <select 
                  value={fitnessData.workoutType}
                  onChange={(e) => setFitnessData({...fitnessData, workoutType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">选择运动类型</option>
                  <option value="有氧运动">有氧运动</option>
                  <option value="力量训练">力量训练</option>
                  <option value="瑜伽">瑜伽</option>
                  <option value="跑步">跑步</option>
                  <option value="游泳">游泳</option>
                  <option value="骑行">骑行</option>
                  <option value="健身操">健身操</option>
                  <option value="拳击">拳击</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  运动时长 (分钟)
                </label>
                <input
                  type="number"
                  value={fitnessData.duration}
                  onChange={(e) => setFitnessData({...fitnessData, duration: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  placeholder="例如：60"
                />
              </div>
            </div>
            
            {/* 第二行：强度和心情 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  运动强度
                </label>
                <select 
                  value={fitnessData.intensity}
                  onChange={(e) => setFitnessData({...fitnessData, intensity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="轻松">轻松</option>
                  <option value="中等">中等</option>
                  <option value="高强度">高强度</option>
                  <option value="极限">极限</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  运动后心情
                </label>
                <select 
                  value={fitnessData.mood}
                  onChange={(e) => setFitnessData({...fitnessData, mood: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="很棒">很棒 😊</option>
                  <option value="良好">良好 😌</option>
                  <option value="一般">一般 😐</option>
                  <option value="疲惫">疲惫 😴</option>
                  <option value="不适">不适 😵</option>
                </select>
              </div>
            </div>
            
            {/* 第三行：体重和卡路里 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体重 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fitnessData.bodyWeight}
                  onChange={(e) => setFitnessData({...fitnessData, bodyWeight: parseFloat(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  placeholder="例如：65.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  消耗卡路里
                </label>
                <input
                  type="number"
                  value={fitnessData.calories}
                  onChange={(e) => setFitnessData({...fitnessData, calories: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  placeholder="例如：300"
                />
              </div>
            </div>
            
            {/* 第四行：心率和体脂率 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  平均心率 (bpm)
                </label>
                <input
                  type="number"
                  value={fitnessData.heartRate}
                  onChange={(e) => setFitnessData({...fitnessData, heartRate: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  placeholder="例如：140"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体脂率 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fitnessData.bodyFat}
                  onChange={(e) => setFitnessData({...fitnessData, bodyFat: parseFloat(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="100"
                  placeholder="例如：15.5"
                />
              </div>
            </div>
            
            {/* 第五行：肌肉量和备注 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  肌肉量 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fitnessData.muscleMass}
                  onChange={(e) => setFitnessData({...fitnessData, muscleMass: parseFloat(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  placeholder="例如：45.2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  额外备注
                </label>
                <input
                  type="text"
                  value={fitnessData.notes}
                  onChange={(e) => setFitnessData({...fitnessData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="例如：今天状态不错"
                />
              </div>
            </div>
          </div>
        )}

        {/* 摄影专用字段 */}
        {(formData.category === '摄影' || fixedCategory === '摄影') && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              📷 照片上传
            </h3>
            
            {/* 图片上传区域 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择照片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const imageUrls = files.map(file => URL.createObjectURL(file));
                    setPhotographyData({
                      ...photographyData,
                      images: [...photographyData.images, ...imageUrls]
                    });
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="text-gray-500">
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-lg">点击选择照片或拖拽到此处</p>
                    <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、GIF 格式</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* 图片预览网格 */}
            {photographyData.images.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  已选择的照片 ({photographyData.images.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photographyData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`照片 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = photographyData.images.filter((_, i) => i !== index);
                          setPhotographyData({
                            ...photographyData,
                            images: newImages
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 照片描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                照片描述
              </label>
              <textarea
                value={photographyData.description}
                onChange={(e) => setPhotographyData({
                  ...photographyData,
                  description: e.target.value
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="描述这些照片的拍摄背景、故事或感受..."
              />
            </div>
          </div>
        )}

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