import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowDown, ArrowUp, Info, X, Tag, ChevronRight, Sliders, RotateCcw } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface ShopProps {
  products: Product[];
  setView: (view: string) => void;
  setSelectedProductId: (id: string | null) => void;
  isLoading: boolean;
}

export default function Shop({ products, setView, setSelectedProductId, isLoading }: ShopProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dynamically compute existing categories in current Firestore data
  const dynamicCategories = useMemo(() => {
    const cats = new Map<string, number>();
    
    // Count occurrences of each category from live product data
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        const catName = p.category.trim();
        cats.set(catName, (cats.get(catName) || 0) + 1);
      }
    });

    const categoriesList = Array.from(cats.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => a.name.localeCompare(b.name));

    return [
      { name: 'All', count: products.length },
      ...categoriesList
    ];
  }, [products]);

  // Handle filtering processes
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter matching description/title/category
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category?.trim().toLowerCase() === selectedCategory.toLowerCase());
    }

    // Custom sorting modes
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setView('detail');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  // Render sidebar inner content to make it modular and dry
  const renderSidebarContent = () => (
    <div className="space-y-6">
      {/* 1. Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            Refine Catalog
          </span>
        </div>
        {(selectedCategory !== 'All' || search.trim() !== '' || sortBy !== 'newest') && (
          <button
            onClick={clearFilters}
            className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 2. Keyword Search */}
      <div className="space-y-2">
        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-750 transition-all font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Dynamic Categories Filter list */}
      <div className="space-y-2.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5">
          Categories
        </label>
        <div className="space-y-1">
          {dynamicCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setMobileSidebarOpen(false); // Close responsive popover upon select
                }}
                className={`w-full group px-3 py-2 rounded text-xs transition-all flex items-center justify-between text-left cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Tag className={`w-3 h-3 shrink-0 ${isSelected ? 'text-black' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected 
                    ? 'bg-zinc-250 text-black font-semibold' 
                    : 'bg-zinc-950 text-zinc-500 group-hover:text-zinc-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Sort selection */}
      <div className="space-y-2">
        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          Sort Layout
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-zinc-700 cursor-pointer"
        >
          <option value="newest">Recently Released</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* 5. Minimal information badge */}
      <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
        <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase block">Instant Delivery</span>
        <p className="text-[10px] text-zinc-500 leading-normal font-sans font-light">
          All downloads are authenticated. Purchase enables lifetime access codes securely.
        </p>
      </div>
    </div>
  );

  return (
    <div id="shop-view" className="space-y-8 py-6 pb-12 animate-fadeIn">
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-serif font-medium text-2xl tracking-tight text-white mb-1">
            Explore Digital Assets
          </h1>
          <p className="text-xs text-zinc-400 font-light max-w-xl leading-relaxed">
            Browse our full catalog of premium design themes, hand-crafted presets, icon packages, eBooks, and templates hosted on secure delivery servers.
          </p>
        </div>

        {/* Counter statistic badge */}
        <div className="flex items-center gap-3 self-start md:self-end">
          {/* Mobile filter toggle switch button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center gap-1.5 px-3.5 h-9 rounded bg-white text-black text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters ({filteredProducts.length})</span>
          </button>

          <div className="inline-flex h-9 px-3.5 items-center rounded bg-[#0F0F11] border border-zinc-900 text-[10px] font-semibold text-zinc-400 font-mono tracking-wider uppercase">
            <span>{filteredProducts.length} Assets Found</span>
          </div>
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar - Persistent on desktop / lg screens */}
        <aside className="lg:col-span-3 bg-[#0F0F11] border border-zinc-900 rounded p-5 hidden lg:block shadow-sm">
          {renderSidebarContent()}
        </aside>

        {/* Right Digital Product list Showcase Grid */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Active query stats feedback if filtering */}
          {(selectedCategory !== 'All' || search.trim() !== '') && (
            <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 border border-zinc-900 rounded px-4 py-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold uppercase text-[9px] text-zinc-550 tracking-wider">Active select:</span>
                {selectedCategory !== 'All' && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-white font-medium">
                    Category: {selectedCategory}
                  </span>
                )}
                {search.trim() !== '' && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-white font-medium truncate max-w-[150px]">
                    Query: "{search}"
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-xs hover:text-white underline cursor-pointer font-medium font-sans ml-2 shrink-0"
              >
                Clear all filters
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 w-full animate-pulse rounded border border-zinc-905 bg-zinc-950" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 py-16 border border-dashed border-zinc-900 rounded bg-[#0F0F11] max-w-lg mx-auto space-y-4 shadow-sm">
              <Info className="w-8 h-8 text-zinc-650" />
              <div className="space-y-1.5">
                <h3 className="font-serif font-medium text-sm text-white">No digital matches found</h3>
                <p className="text-xs text-zinc-450 max-w-xs leading-relaxed font-light">
                  We couldn't locate assets fitting your selected parameters. Try selecting a different category or refining keywords.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="px-4.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
              >
                Clear All Filter Options
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Responsive Filter Popover Drawer for Mobile Screen sizes */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-full max-w-xs h-full bg-[#0F0F11] border-l border-zinc-900 p-6 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl animate-slideOver">
            <div className="space-y-6">
              {/* Close Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Filter Library</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-950 text-zinc-400 hover:text-white cursor-pointer"
                  title="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderSidebarContent()}
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-900">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded shadow"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
