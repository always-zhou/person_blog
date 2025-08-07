class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出现了一些问题</h1>
            <p className="text-gray-600 mb-4">抱歉，发生了意外错误。</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  try {
    const categories = [
      {
        title: "学习记录",
        description: "技术学习、读书笔记、知识总结",
        icon: "book-open",
        color: "from-blue-500 to-purple-600",
        page: "/public/learning.html"
      },
      {
        title: "健身记录",
        description: "运动日志、健身计划、身体变化",
        icon: "dumbbell",
        color: "from-green-500 to-teal-600",
        page: "/public/fitness.html"
      },
      {
        title: "生活记录",
        description: "日常生活、心情随笔、生活感悟",
        icon: "heart",
        color: "from-pink-500 to-rose-600",
        page: "/public/life.html"
      },
      {
        title: "摄影作品",
        description: "风景摄影、人像作品、摄影技巧",
        icon: "camera",
        color: "from-yellow-500 to-orange-600",
        page: "/public/photography.html"
      }
    ];

    return (
      <div className="min-h-screen gradient-shift relative" data-name="app" data-file="app.js">
        {/* Cyber Grid Background */}
        <div className="fixed inset-0 cyber-grid opacity-30 z-0"></div>
        
        {/* Matrix Rain Effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={`matrix-${i}`}
              className="matrix-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>
        
        {/* Enhanced Particle Galaxy */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 3}px`,
                height: `${Math.random() * 8 + 3}px`,
                background: `radial-gradient(circle, ${['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'][Math.floor(Math.random() * 5)]} 0%, transparent 70%)`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${Math.random() * 6 + 8}s`,
                boxShadow: `0 0 ${Math.random() * 20 + 10}px ${['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'][Math.floor(Math.random() * 5)]}`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <Header />
          <Hero />
        
        {/* Categories Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-4">
              探索 Always-zhou 的世界
            </h2>
            <p className="text-xl text-center text-white/80 mb-16">
              记录生活的每一个精彩瞬间
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </div>
        </section>
        
          <Footer />
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);