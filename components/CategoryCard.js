function CategoryCard({ title, description, icon, color, page }) {
  try {
    return (
      <div className="card-hover group" data-name="category-card" data-file="components/CategoryCard.js">
        <a href={page} className="block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 h-full border border-white/20 hover:border-purple-400/60 transition-all duration-600 relative overflow-hidden hologram">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-600"></div>
            <div className={`w-20 h-20 bg-gradient-to-r ${color} rounded-3xl flex items-center justify-center mb-6 mx-auto relative z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-600`} style={{boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'}}>
              <div className={`icon-${icon} text-white text-3xl cosmic-wave`}></div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {title}
            </h3>
            
            <p className="text-white/70 text-center leading-relaxed">
              {description}
            </p>
            
            <div className="mt-6 flex justify-center">
              <div className="flex items-center text-white/80 hover:text-white transition-colors">
                <span className="mr-2">探索更多</span>
                <div className="icon-arrow-right text-sm"></div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  } catch (error) {
    console.error('CategoryCard component error:', error);
    return null;
  }
}