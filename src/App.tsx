import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Loader2, RefreshCw, AlertTriangle, Plus, X, ExternalLink, Trophy } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import StatsBar from './components/StatsBar';
import PredictionModal from './components/PredictionModal';
import LiveSearch from './components/LiveSearch';
import { getFallbackPrediction, getFallbackProducts, getFallbackSearchResults, shouldUseFallback } from './lib/fallbackData';
import { getFunctionUrl, getSupabaseHeaders, readJsonResponse } from './lib/api';
import { formatINR } from './lib/utils';
import type { ProductWithPrices, PricePrediction } from './lib/types';

interface LiveSearchResult {
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

interface FetchProductsResponse {
  products?: ProductWithPrices[];
  categories?: string[];
  brands?: string[];
}

interface SearchProductsResponse {
  results?: LiveSearchResult[];
  source?: 'serpapi' | 'generated';
}

export default function App() {
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSort, setSelectedSort] = useState('savings');
  const [predictions, setPredictions] = useState<Record<string, PricePrediction>>({});
  const [loadingPrediction, setLoadingPrediction] = useState<string | null>(null);
  const [modalPrediction, setModalPrediction] = useState<{
    prediction: PricePrediction;
    productName: string;
  } | null>(null);
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<LiveSearchResult[]>([]);
  const [liveSearchStatus, setLiveSearchStatus] = useState<{
    source: 'serpapi' | 'generated' | 'fallback' | null;
    lastUpdated: Date | null;
  }>({ source: null, lastUpdated: null });
  const [loadingLiveSearch, setLoadingLiveSearch] = useState(false);
  const [trackingProducts, setTrackingProducts] = useState(false);

  const toTrackedProduct = useCallback((
    product: ProductWithPrices,
    results: LiveSearchResult[]
  ): ProductWithPrices => {
    const validResults = results.filter((result) => result.price > 0);
    if (validResults.length === 0) return product;

    const storePrices = validResults.map((result, index) => ({
      id: `${product.id}-tracked-${index}`,
      product_id: product.id,
      store_name: result.store,
      price: result.price,
      original_price: result.original_price || null,
      rating: result.rating,
      in_stock: true,
      url: result.link,
      fetched_at: new Date().toISOString(),
    }));
    const prices = storePrices.map((storePrice) => storePrice.price);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const bestStore = storePrices.find((storePrice) => storePrice.price === lowest)?.store_name || product.best_store;
    const imageUrl = validResults.find((result) => result.image)?.image || product.image_url;

    return {
      ...product,
      image_url: imageUrl,
      store_prices: storePrices,
      lowest_price: lowest,
      highest_price: highest,
      average_price: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
      savings_percent: highest > 0 ? Math.round(((highest - lowest) / highest) * 1000) / 10 : 0,
      best_store: bestStore,
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);

      const response = await fetch(getFunctionUrl('fetch-prices', params), {
        headers: getSupabaseHeaders(),
      });

      const data = await readJsonResponse<FetchProductsResponse>(response, 'Failed to fetch products');
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
    } catch (err) {
      if (shouldUseFallback(err)) {
        const fallback = getFallbackProducts(searchQuery, selectedCategory, selectedBrand);
        setProducts(fallback.products);
        setCategories(fallback.categories);
        setBrands(fallback.brands);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand]);

  const trackVisibleProducts = useCallback(async () => {
    if (products.length === 0 || trackingProducts) return;

    setTrackingProducts(true);
    setError(null);
    try {
      const trackedProducts = await Promise.all(products.map(async (product) => {
        const params = new URLSearchParams({ q: product.name });
        const response = await fetch(getFunctionUrl('search-products', params), {
          headers: getSupabaseHeaders(),
        });
        const data = await readJsonResponse<SearchProductsResponse>(response, 'Tracking failed');
        return toTrackedProduct(product, data.results || []);
      }));

      setProducts(trackedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track live prices');
    } finally {
      setTrackingProducts(false);
    }
  }, [products, toTrackedProduct, trackingProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchPrediction = useCallback(async (productId: string) => {
    if (predictions[productId] || loadingPrediction) return;

    setLoadingPrediction(productId);
    try {
      const params = new URLSearchParams({ product_id: productId });
      const response = await fetch(getFunctionUrl('predict-price', params), {
        headers: getSupabaseHeaders(),
      });

      const data = await readJsonResponse<PricePrediction>(response, 'Prediction failed');
      setPredictions((prev) => ({ ...prev, [productId]: data }));

      const product = products.find((p) => p.id === productId);
      if (product) {
        setModalPrediction({ prediction: data, productName: product.name });
      }
    } catch (err) {
      if (shouldUseFallback(err)) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          const prediction = getFallbackPrediction(product);
          setPredictions((prev) => ({ ...prev, [productId]: prediction }));
          setModalPrediction({ prediction, productName: product.name });
        }
      } else {
        setError('Failed to get price prediction');
      }
    } finally {
      setLoadingPrediction(null);
    }
  }, [predictions, loadingPrediction, products]);

  const handleLiveSearchSelect = async (result: LiveSearchResult) => {
    setShowLiveSearch(false);
    setLoadingLiveSearch(true);
    setError(null);

    try {
      // Save the search result to the database and get full comparison
      const params = new URLSearchParams({ q: result.title, save: 'true' });
      const response = await fetch(getFunctionUrl('search-products', params), {
        headers: getSupabaseHeaders(),
      });

      const data = await readJsonResponse<SearchProductsResponse>(response, 'Failed to save product');
      setLiveSearchResults(data.results || []);

      // Refresh products from database to include the new one
      await fetchProducts();
    } catch (err) {
      if (shouldUseFallback(err)) {
        const results = getFallbackSearchResults(result.title);
        setLiveSearchResults(results);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search product');
      }
    } finally {
      setLoadingLiveSearch(false);
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (selectedSort) {
      case 'price_low':
        return a.lowest_price - b.lowest_price;
      case 'price_high':
        return b.lowest_price - a.lowest_price;
      case 'rating':
        return (b.store_prices[0]?.rating ?? 0) - (a.store_prices[0]?.rating ?? 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'savings':
      default:
        return b.savings_percent - a.savings_percent;
    }
  });

  // Find best deal (highest savings percent)
  const bestDealId = products.length > 0
    ? products.reduce((best, p) => p.savings_percent > best.savings_percent ? p : best, products[0]).id
    : null;

  // Stats
  const totalSavings = products.reduce((sum, p) => sum + (p.highest_price - p.lowest_price), 0);
  const avgSavingsPercent = products.length > 0
    ? products.reduce((sum, p) => sum + p.savings_percent, 0) / products.length
    : 0;
  const bestDealProduct = products.find((p) => p.id === bestDealId);
  const sortedLiveSearchResults = [...liveSearchResults]
    .filter((result) => result.price > 0)
    .sort((a, b) => a.price - b.price);
  const lowestLivePrice = sortedLiveSearchResults[0]?.price ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">PriceScope</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Smart Price Comparison & Prediction</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLiveSearch(!showLiveSearch)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-emerald-200/50"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Compare New</span>
              </button>
              <button
                onClick={() => {
                  if (showLiveSearch) {
                    void fetchProducts();
                  } else {
                    void trackVisibleProducts();
                  }
                }}
                disabled={loading || trackingProducts}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading || trackingProducts ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{trackingProducts ? 'Tracking...' : 'Track Prices'}</span>
              </button>
            </div>
          </div>

          {/* Live search bar */}
          {showLiveSearch && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <LiveSearch
                onSelect={handleLiveSearchSelect}
                onResults={setLiveSearchResults}
                showDropdownResults={false}
                autoRefreshMs={60000}
                onStatusChange={setLiveSearchStatus}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Search any product to compare prices across Amazon India, Flipkart, Myntra, Croma, and more
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Live search results panel */}
        {liveSearchResults.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Price Comparison Table</h2>
                <p className="text-xs text-slate-400">
                  Lowest price is shown first with direct shopping links. Auto-refreshes every 60 seconds.
                  {liveSearchStatus.lastUpdated && (
                    <span> Last updated {liveSearchStatus.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>
                  )}
                </p>
              </div>
              {liveSearchStatus.source && (
                <span className={`mr-2 hidden rounded-full border px-2.5 py-1 text-xs font-bold sm:inline-flex ${
                  liveSearchStatus.source === 'serpapi'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}>
                  {liveSearchStatus.source === 'serpapi' ? 'Live tracking' : 'Demo tracking'}
                </span>
              )}
              <button
                onClick={() => { setLiveSearchResults([]); setLiveSearchStatus({ source: null, lastUpdated: null }); }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Website</th>
                    <th className="px-5 py-3 text-right">Lowest Price</th>
                    <th className="px-5 py-3 text-right">MRP</th>
                    <th className="px-5 py-3 text-right">Savings</th>
                    <th className="px-5 py-3 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedLiveSearchResults.map((result, i) => {
                    const isLowest = result.price === lowestLivePrice;
                    const savings = result.original_price && result.original_price > result.price
                      ? result.original_price - result.price
                      : 0;

                    return (
                      <tr
                        key={`${result.product_id}-${i}`}
                        className={isLowest ? 'bg-emerald-50/70' : 'bg-white hover:bg-slate-50'}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                              {result.image ? (
                                <img src={result.image} alt="" className="w-full h-full object-contain p-1.5" />
                              ) : (
                                <span className="text-xs font-bold text-slate-500">{result.store.charAt(0)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-md truncate text-sm font-semibold text-slate-800">{result.title}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                {result.rating > 0 && <span>{result.rating}/5</span>}
                                {isLowest && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">
                                    <Trophy className="w-3 h-3" />
                                    Best price
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{result.store}</td>
                        <td className="px-5 py-4 text-right text-sm font-black text-slate-900">{formatINR(result.price)}</td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">
                          {result.original_price && result.original_price > result.price ? (
                            <span className="line-through">{formatINR(result.original_price)}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-bold text-emerald-600">
                          {savings > 0 ? formatINR(savings) : '-'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                            title={`Open on ${result.store}`}
                          >
                            Shop
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading overlay for live search */}
        {loadingLiveSearch && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="ml-2 text-sm text-slate-400">Searching across Indian stores...</span>
          </div>
        )}

        {/* Search & Filters */}
        <SearchBar
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onBrandChange={setSelectedBrand}
          onSortChange={setSelectedSort}
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          selectedSort={selectedSort}
        />

        {/* Stats */}
        {!loading && !error && products.length > 0 && (
          <StatsBar
            totalProducts={products.length}
            totalSavings={totalSavings}
            avgSavingsPercent={avgSavingsPercent}
            bestDealName={bestDealProduct?.name || ''}
            bestDealSavings={bestDealProduct ? bestDealProduct.highest_price - bestDealProduct.lowest_price : 0}
          />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button onClick={fetchProducts} className="text-xs text-red-500 hover:text-red-700 mt-1">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="mt-3 text-sm text-slate-400">Comparing prices across stores...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                prediction={predictions[product.id] || null}
                onPredict={fetchPrediction}
                isBestDeal={product.id === bestDealId}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-400">No products found</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-xs text-slate-400">
            PriceScope uses historical data and regression models to predict future prices. Predictions are estimates and not guaranteed.
          </p>
        </div>
      </footer>

      {/* Prediction Modal */}
      {modalPrediction && (
        <PredictionModal
          prediction={modalPrediction.prediction}
          productName={modalPrediction.productName}
          onClose={() => setModalPrediction(null)}
        />
      )}
    </div>
  );
}
