function SearchBar({ onSearch, onCategoryChange, selectedCategory, searchTerm, setSearchTerm, showCategoryFilter = true }) {
  const categories = ['all', '学习', '健身', '生活', '摄影'];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文章标题、内容或标签..."
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        
        {showCategoryFilter && (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 min-w-[120px]"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800 text-white">
                {category === 'all' ? '全部分类' : category}
              </option>
            ))}
          </select>
        )}
        
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
        >
          <span className="icon-search"></span>
          搜索
        </button>
      </form>
    </div>
  );
}