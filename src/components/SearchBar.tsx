import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onSortChange: (sort: string) => void;
  categories: string[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedSort: string;
}

export default function SearchBar({
  onSearch,
  onCategoryChange,
  onBrandChange,
  onSortChange,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedSort,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const hasActiveFilters = selectedCategory || selectedBrand;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); onSearch(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-all shadow-sm ${
              hasActiveFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => onBrandChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="savings">Best Savings</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { onCategoryChange(''); onBrandChange(''); }}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
