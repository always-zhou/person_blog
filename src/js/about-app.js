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
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AboutApp() {
  try {
    return (
      <div className="min-h-screen" data-name="about-app" data-file="about-app.js">
        <Header />
        
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-white mb-6">关于我</h1>
              <p className="text-xl text-white/80">了解我的故事，我的热情，我的梦想</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 mb-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                    <div className="icon-user text-white text-6xl"></div>
                  </div>
                </div>
                
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-6">你好，我是...</h2>
                  <p className="text-lg leading-relaxed mb-6 text-white/90">
                    一个热爱生活、追求进步的普通人。我相信每一天都是成长的机会，
                    每一次经历都是宝贵的财富。
                  </p>
                  <p className="text-lg leading-relaxed text-white/90">
                    通过这个博客，我想与你分享我的学习心得、健身历程、生活感悟，
                    以及用镜头捕捉到的美好瞬间。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <div className="icon-target text-white text-2xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">我的目标</h3>
                <p className="text-white/80 leading-relaxed">
                  持续学习新技术，保持健康的生活方式，记录生活中的美好时刻，
                  通过分享激励更多的人追求更好的自己。
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <div className="icon-heart text-white text-2xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">我的热情</h3>
                <p className="text-white/80 leading-relaxed">
                  对技术的探索、对健康的追求、对生活的热爱、对美的发现。
                  这些热情驱动着我不断前进，也是这个博客存在的意义。
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('AboutApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AboutApp />
  </ErrorBoundary>
);