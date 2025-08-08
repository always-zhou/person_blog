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
    const markmapRef = React.useRef(null);
    
    // 检查数据格式
    const hasMarkdownData = data && data.markdown && data.markdown.trim();
    const hasNodesData = data && data.nodes && data.nodes.length > 0;
    
    if (!hasMarkdownData && !hasNodesData) {
      return (
        <div className="text-center py-8 text-white/60">
          暂无思维导图内容
        </div>
      );
    }

    // 渲染思维导图预览
    React.useEffect(() => {
      if (hasMarkdownData && markmapRef.current) {
        // 清空之前的内容
        markmapRef.current.innerHTML = '';
        
        // 创建 SVG 元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '400px';
        markmapRef.current.appendChild(svg);
        
        // 渲染思维导图
        renderMindMapFromMarkdown(svg, data.markdown);
      }
    }, [data, hasMarkdownData]);
    
    // 从 Markdown 渲染思维导图
    const renderMindMapFromMarkdown = (svg, markdown) => {
      const lines = markdown.split('\n').filter(line => line.trim());
      const nodes = [];
      
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
      const centerX = 300;
      const centerY = 200;
      const levelDistance = 120;
      
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
            line.setAttribute('stroke', '#60a5fa');
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
        rect.setAttribute('fill', node.level === 1 ? '#3b82f6' : 'rgba(255,255,255,0.1)');
        rect.setAttribute('stroke', '#60a5fa');
        rect.setAttribute('stroke-width', '2');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', node.level === 1 ? 'white' : '#e5e7eb');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', node.level === 1 ? 'bold' : 'normal');
        text.textContent = node.text;
        
        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
      });
    };

    // 如果是新的 markdown 格式
    if (hasMarkdownData) {
      return (
        <div className="mind-map-viewer bg-white/5 rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">思维导图</h3>
          </div>
          <div 
            ref={markmapRef}
            className="w-full h-96 bg-white/10 rounded-lg overflow-hidden"
          />
        </div>
      );
    }
    
    // 兼容旧的 nodes 格式
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