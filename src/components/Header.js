function Header() {
  try {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

        const navItems = [
      { name: "首页", href: "/index.html" },
      { name: "学习", href: "/learning.html" },
      { name: "健身", href: "/fitness.html" },
      { name: "生活", href: "/life.html" },
      { name: "摄影", href: "/photography.html" },
      { name: "关于我", href: "/about.html" }
    ];

    return (
      <header className="fixed top-0 w-full bg-white/10 backdrop-blur-md z-50 border-b border-white/20" data-name="header" data-file="components/Header.js">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <div className="icon-user text-white text-lg"></div>
              </div>
              <span className="text-xl font-bold text-white">Always-zhou的博客</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item, index) => (
                                                <a
                  key={index}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <div className={`icon-${isMenuOpen ? 'x' : 'menu'} text-xl`}></div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-white/20">
              <div className="flex flex-col space-y-3 pt-4">
                {navItems.map((item, index) => (
                                                      <a
                    key={index}
                    href={item.href}
                    className="text-white/90 hover:text-white transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}