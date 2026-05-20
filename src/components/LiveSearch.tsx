import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, ExternalLink, X, Sparkles } from 'lucide-react';
import { getFunctionUrl, getSupabaseHeaders, readJsonResponse } from '../lib/api';
import { getFallbackSearchResults, shouldUseFallback } from '../lib/fallbackData';
import { formatINR } from '../lib/utils';

interface SearchResult {
  title: string;
  price: number;
  original_price?: number;
  store: string;
  rating: number;
  reviews: number;
  image: string;
  link: string;
  product_id: string;
}

interface LiveSearchProps {
  onSelect: (result: SearchResult) => void;
  onResults?: (results: SearchResult[]) => void;
  showDropdownResults?: boolean;
  autoRefreshMs?: number;
  onStatusChange?: (status: { source: 'serpapi' | 'generated' | 'fallback' | null; lastUpdated: Date | null }) => void;
}

interface SearchProductsResponse {
  results?: SearchResult[];
  source?: 'serpapi' | 'generated';
}

export default function LiveSearch({
  onSelect,
  onResults,
  showDropdownResults = true,
  autoRefreshMs = 0,
  onStatusChange,
}: LiveSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'serpapi' | 'generated' | 'fallback' | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const updateStatus = useCallback((nextSource: 'serpapi' | 'generated' | 'fallback' | null, nextUpdated: Date | null) => {
    setSource(nextSource);
    setLastUpdated(nextUpdated);
    onStatusChange?.({ source: nextSource, lastUpdated: nextUpdated });
  }, [onStatusChange]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      onResults?.([]);
      updateStatus(null, null);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: searchQuery });
      const response = await fetch(getFunctionUrl('search-products', params), {
        headers: getSupabaseHeaders(),
      });

      const data = await readJsonResponse<SearchProductsResponse>(response, 'Search failed');
      setResults(data.results || []);
      onResults?.(data.results || []);
      updateStatus(data.source || null, new Date());
      setShowDropdown(showDropdownResults);
    } catch (err) {
      if (shouldUseFallback(err)) {
        const fallbackResults = getFallbackSearchResults(searchQuery);
        setResults(fallbackResults);
        onResults?.(fallbackResults);
        updateStatus('fallback', new Date());
        setShowDropdown(showDropdownResults);
      } else {
        setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
        setResults([]);
        onResults?.([]);
        updateStatus(null, null);
      }
    } finally {
      setLoading(false);
    }
  }, [onResults, showDropdownResults, updateStatus]);

  useEffect(() => {
    if (!autoRefreshMs || query.trim().length < 2) return undefined;

    const interval = setInterval(() => {
      searchProducts(query);
    }, autoRefreshMs);

    return () => clearInterval(interval);
  }, [autoRefreshMs, query, searchProducts]);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 400);
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search any product across Indian stores..."
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(''); setResults([]); onResults?.([]); updateStatus(null, null); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (results.length > 0 || error) && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-sm text-red-500">{error}</div>
          )}
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {result.image ? (
                  <img src={result.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">
                    {result.store.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{result.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{result.store}</span>
                  {result.rating > 0 && (
                    <span className="text-xs text-amber-500">{result.rating}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-slate-800">{formatINR(result.price)}</div>
                {result.original_price && result.original_price > result.price && (
                  <div className="text-xs text-slate-400 line-through">{formatINR(result.original_price)}</div>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          ))}
          {results.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-slate-400">
                {source === 'serpapi'
                  ? 'Live Google Shopping results. '
                  : 'Estimated demo results. Add SERPAPI_KEY for real-time prices. '}
                {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. `}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query + ' price india shopping')}&tbm=shop`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  View on Google Shopping
                </a>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
