function Footer() {
  try {
    return (
      <footer className="bg-black/20 backdrop-blur-md py-12 px-4 border-t border-white/20" data-name="footer" data-file="components/Footer.js">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">关于博客</h3>
              <p className="text-white/70 leading-relaxed">
                记录生活点滴，分享成长历程。在这里，每一个瞬间都值得被珍藏。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-4">快速导航</h3>
              <div className="space-y-2">
                <a href="/learning" className="block text-white/70 hover:text-white transition-colors">学习记录</a>
                <a href="/fitness" className="block text-white/70 hover:text-white transition-colors">健身日志</a>
                <a href="/life" className="block text-white/70 hover:text-white transition-colors">生活分享</a>
                <a href="/photography" className="block text-white/70 hover:text-white transition-colors">摄影作品</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-4">联系方式</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="icon-mail text-white"></div>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="icon-github text-white"></div>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="icon-instagram text-white"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60">
              © 2025 Always-zhou的个人博客. 用心记录，用爱分享.
            </p>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}