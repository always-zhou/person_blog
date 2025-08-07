function Hero() {
  try {
    return (
      <section className="pt-32 pb-20 px-4 relative overflow-hidden" data-name="hero" data-file="components/Hero.js">
        {/* Cosmic Wave Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="cosmic-wave absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400/40 to-purple-400/40 rounded-full blur-sm" style={{boxShadow: '0 0 60px #ec4899'}}></div>
          <div className="cosmic-wave absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-2xl blur-sm" style={{animationDelay: '2s', boxShadow: '0 0 40px #06b6d4'}}></div>
          <div className="cosmic-wave absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-xl blur-sm" style={{animationDelay: '4s', boxShadow: '0 0 50px #f59e0b'}}></div>
          <div className="cosmic-wave absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-green-400/40 to-teal-400/40 rounded-full blur-sm" style={{animationDelay: '6s', boxShadow: '0 0 30px #10b981'}}></div>
          <div className="cosmic-wave absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-indigo-400/40 to-purple-400/40 rounded-3xl blur-sm" style={{animationDelay: '1s', boxShadow: '0 0 70px #8b5cf6'}}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto mb-6 relative bounce-in">
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl hologram border-2 border-white/30">
                <div className="icon-user text-white text-5xl cosmic-wave"></div>
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="neon-glow">欢迎来到</span>
            <br />
            <span className="gradient-text bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent glitch-text">
              Always-zhou
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed">
            在这里记录学习的足迹，分享健身的快乐
            <br />
            捕捉生活的美好，展示摄影的艺术
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="about.html"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
            >
              了解更多
            </a>
            <a
              href="#categories"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              开始探索
            </a>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Hero component error:', error);
    return <div>Hero组件加载失败</div>;
  }
}