import type { PricePrediction, ProductWithPrices, StorePrice } from './types';

export interface LiveSearchResult {
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

const stores = [
  { name: 'Amazon India', domain: 'https://www.amazon.in/s?k=' },
  { name: 'Flipkart', domain: 'https://www.flipkart.com/search?q=' },
  { name: 'Croma', domain: 'https://www.croma.com/searchB?q=' },
  { name: 'Reliance Digital', domain: 'https://www.reliancedigital.in/search?q=' },
  { name: 'Tata CLiQ', domain: 'https://www.tatacliq.com/search/?searchTerm=' },
];

const fallbackQueries = [
  'iPhone 15',
  'Samsung Galaxy S24',
  'Sony WH-1000XM5',
  'MacBook Air M3',
  'Nike running shoes',
];

const productImages: Record<string, string> = {
  'iPhone 15': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=480&q=80',
  'Samsung Galaxy S24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=480&q=80',
  'Sony WH-1000XM5': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=480&q=80',
  'MacBook Air M3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=480&q=80',
  'Nike running shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=480&q=80',
};

export function shouldUseFallback(err: unknown): boolean {
  const message = err instanceof Error ? err.message.toLowerCase() : '';
  return message.includes('requested function was not found') || message.includes('failed to fetch');
}

export function getFallbackProducts(
  searchQuery = '',
  selectedCategory = '',
  selectedBrand = ''
): { products: ProductWithPrices[]; categories: string[]; brands: string[] } {
  const products = fallbackQueries.map((query, index) => toProduct(query, index));
  const filtered = products.filter((product) => {
    const matchesQuery = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    return matchesQuery && matchesCategory && matchesBrand;
  });

  return {
    products: filtered,
    categories: [...new Set(products.map((product) => product.category))],
    brands: [...new Set(products.map((product) => product.brand))],
  };
}

export function getFallbackSearchResults(query: string): LiveSearchResult[] {
  const encodedQuery = encodeURIComponent(query);
  const basePrice = estimatePrice(query);

  return stores.map((store, index) => {
    const price = Math.round(basePrice * (0.92 + index * 0.045));
    const originalPrice = Math.round(price * 1.18);

    return {
      title: query,
      price,
      original_price: originalPrice,
      store: store.name,
      rating: Math.round((4.1 + index * 0.12) * 10) / 10,
      reviews: 650 + index * 840,
      image: findProductImage(query),
      link: `${store.domain}${encodedQuery}`,
      product_id: slugify(`${query}-${store.name}`),
    };
  });
}

export function getFallbackPrediction(product: ProductWithPrices): PricePrediction {
  const trendData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      date: date.toISOString().slice(0, 10),
      price: Math.round(product.lowest_price * (1.08 - index * 0.015)),
    };
  });
  const predictedPrice = Math.round(product.lowest_price * 0.96);
  const predictedChange = predictedPrice - product.lowest_price;

  return {
    product_id: product.id,
    current_best_price: product.lowest_price,
    predicted_price: predictedPrice,
    predicted_change: predictedChange,
    predicted_change_percent: Math.round((predictedChange / product.lowest_price) * 1000) / 10,
    recommendation: predictedPrice < product.lowest_price ? 'wait' : 'good_deal',
    confidence: 72,
    trend: 'declining',
    trend_data: trendData,
  };
}

function toProduct(query: string, index: number): ProductWithPrices {
  const id = slugify(query);
  const results = getFallbackSearchResults(query);
  const storePrices: StorePrice[] = results.map((result, priceIndex) => ({
    id: `${id}-${priceIndex}`,
    product_id: id,
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

  return {
    id,
    name: query,
    category: detectCategory(query),
    brand: detectBrand(query),
    image_url: findProductImage(query),
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    store_prices: storePrices,
    lowest_price: lowest,
    highest_price: highest,
    average_price: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
    savings_percent: Math.round(((highest - lowest) / highest) * 1000) / 10,
    best_store: storePrices.find((storePrice) => storePrice.price === lowest)?.store_name || '',
  };
}

function detectCategory(query: string): string {
  if (/phone|iphone|samsung|galaxy|macbook|headphone|sony/i.test(query)) return 'Electronics';
  if (/shoe|nike|adidas/i.test(query)) return 'Footwear';
  return 'General';
}

function detectBrand(query: string): string {
  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas'];
  return brands.find((brand) => query.toLowerCase().includes(brand.toLowerCase())) || 'Unknown';
}

function estimatePrice(query: string): number {
  if (/iphone/i.test(query)) return 74999;
  if (/galaxy|samsung/i.test(query)) return 64999;
  if (/macbook/i.test(query)) return 104999;
  if (/sony|headphone/i.test(query)) return 24990;
  if (/shoe|nike|adidas/i.test(query)) return 7999;
  return 12999;
}

function findProductImage(query: string): string {
  const match = Object.entries(productImages).find(([name]) =>
    query.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(query.toLowerCase())
  );

  return match?.[1] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=480&q=80';
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
