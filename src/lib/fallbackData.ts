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
  'Apple iPhone 15 (Black, 128 GB)',
  'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)',
  'Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)',
  'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)',
  'Nike Downshifter 14 Men\'s Road Running Shoe',
  'Milton Flip Lid Thermosteel Bottle 1000 ml',
  'Cello Butterflow Ball Pen Pack of 100 Blue',
  'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN',
  'boAt Airdopes 141 Gen 2 Wireless Earbuds',
];

const productImages: Record<string, string> = {
  'Apple iPhone 15 (Black, 128 GB)': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=640&hei=640&fmt=jpeg&qlt=90&.v=1692923777972',
  'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)': 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s921ezawins/gallery/in-galaxy-s24-s921-sm-s921ezawins-thumb-539482099?$650_519_PNG$',
  'Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)': 'https://www.sony.co.in/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=640&bgcolor=FFFFFF&bgc=FFFFFF',
  'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-spacegray-select-202402?wid=640&hei=640&fmt=jpeg&qlt=90&.v=1707259289595',
  'Nike Downshifter 14 Men\'s Road Running Shoe': 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-IB1895-002_1.jpg?rnd=20200526195200&tr=w-640',
  'Milton Flip Lid Thermosteel Bottle 1000 ml': 'https://www.milton.in/cdn/shop/files/FlipLidThermosteelBottle_1000ml_Silver_1.jpg?v=1707292228&width=640',
  'Cello Butterflow Ball Pen Pack of 100 Blue': 'https://m.media-amazon.com/images/I/61NeSFuV2QL._SL1200_.jpg',
  'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN': 'https://m.media-amazon.com/images/I/71S8U9VzLTL._SL1500_.jpg',
  'boAt Airdopes 141 Gen 2 Wireless Earbuds': 'https://m.media-amazon.com/images/I/51HBom8xz7L._SL1500_.jpg',
};

const genericProductImages: Record<string, string> = {
  bottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=480&q=80',
  pen: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=480&q=80',
  notebook: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=480&q=80',
};

const knownProducts: Record<string, LiveSearchResult[]> = {
  'Apple iPhone 15 (Black, 128 GB)': [
    {
      title: 'Apple iPhone 15 (Black, 128 GB)',
      price: 59900,
      original_price: 59900,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 9219,
      image: productImages['Apple iPhone 15 (Black, 128 GB)'],
      link: 'https://www.flipkart.com/search?q=Apple%20iPhone%2015%20Black%20128%20GB',
      product_id: 'apple-iphone-15-black-128-gb-flipkart',
    },
    {
      title: 'Apple iPhone 15 (Black, 128 GB)',
      price: 59900,
      original_price: 59900,
      store: 'Apple India',
      rating: 4.8,
      reviews: 1200,
      image: productImages['Apple iPhone 15 (Black, 128 GB)'],
      link: 'https://www.apple.com/in/shop/buy-iphone/iphone-15',
      product_id: 'apple-iphone-15-black-128-gb-apple-india',
    },
    {
      title: 'Apple iPhone 15 (Black, 128 GB)',
      price: 47999,
      original_price: 59900,
      store: 'Amazon India',
      rating: 4.5,
      reviews: 8400,
      image: productImages['Apple iPhone 15 (Black, 128 GB)'],
      link: 'https://www.amazon.in/s?k=Apple+iPhone+15+Black+128GB',
      product_id: 'apple-iphone-15-black-128-gb-amazon-india',
    },
  ],
  'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)': [
    {
      title: 'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)',
      price: 55999,
      original_price: 79999,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 258,
      image: productImages['Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)'],
      link: 'https://www.flipkart.com/search?q=Samsung%20Galaxy%20S24%205G%20Snapdragon%20Marble%20Gray%20256%20GB',
      product_id: 'samsung-galaxy-s24-5g-snapdragon-marble-gray-256-gb-flipkart',
    },
    {
      title: 'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)',
      price: 45998,
      original_price: 79999,
      store: 'Amazon India',
      rating: 4.3,
      reviews: 1800,
      image: productImages['Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)'],
      link: 'https://www.amazon.in/s?k=Samsung+Galaxy+S24+5G+Marble+Gray+256GB',
      product_id: 'samsung-galaxy-s24-5g-snapdragon-marble-gray-256-gb-amazon-india',
    },
    {
      title: 'Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)',
      price: 79999,
      original_price: 79999,
      store: 'Samsung India',
      rating: 4.6,
      reviews: 900,
      image: productImages['Samsung Galaxy S24 5G Snapdragon (Marble Gray, 256 GB)'],
      link: 'https://www.samsung.com/in/smartphones/galaxy-s24/buy/',
      product_id: 'samsung-galaxy-s24-5g-snapdragon-marble-gray-256-gb-samsung-india',
    },
  ],
  'Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)': [
    {
      title: 'Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)',
      price: 29194,
      original_price: 34990,
      store: 'Amazon India',
      rating: 4.6,
      reviews: 550,
      image: productImages['Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)'],
      link: 'https://www.amazon.in/s?k=Sony+WH-1000XM5+Noise+Cancelling+Wireless+Headphones+Black',
      product_id: 'sony-wh-1000xm5-black-amazon-india',
    },
    {
      title: 'Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)',
      price: 28938,
      original_price: 34990,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 550,
      image: productImages['Sony WH-1000XM5 Noise Cancelling Wireless Headphones (Black)'],
      link: 'https://www.flipkart.com/search?q=Sony%20WH-1000XM5%20Noise%20Cancelling%20Wireless%20Headphones%20Black',
      product_id: 'sony-wh-1000xm5-black-flipkart',
    },
  ],
  'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)': [
    {
      title: 'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)',
      price: 99990,
      original_price: 104900,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 635,
      image: productImages['Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)'],
      link: 'https://www.flipkart.com/search?q=Apple%20MacBook%20Air%20M3%20MRXN3HN%2FA%208GB%20256GB%20Space%20Grey',
      product_id: 'apple-macbook-air-m3-mrxn3hna-space-grey-flipkart',
    },
    {
      title: 'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)',
      price: 104900,
      original_price: 104900,
      store: 'Apple India',
      rating: 4.8,
      reviews: 770,
      image: productImages['Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)'],
      link: 'https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-m3',
      product_id: 'apple-macbook-air-m3-mrxn3hna-space-grey-apple-india',
    },
    {
      title: 'Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)',
      price: 99990,
      original_price: 104900,
      store: 'Amazon India',
      rating: 4.5,
      reviews: 635,
      image: productImages['Apple MacBook Air M3 MRXN3HN/A (8 GB RAM, 256 GB SSD, Space Grey)'],
      link: 'https://www.amazon.in/s?k=Apple+MacBook+Air+M3+MRXN3HN%2FA+8GB+256GB+Space+Grey',
      product_id: 'apple-macbook-air-m3-mrxn3hna-space-grey-amazon-india',
    },
  ],
  'Nike Downshifter 14 Men\'s Road Running Shoe': [
    {
      title: 'Nike Downshifter 14 Men\'s Road Running Shoe',
      price: 3916,
      original_price: 4895,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 41,
      image: productImages['Nike Downshifter 14 Men\'s Road Running Shoe'],
      link: 'https://www.flipkart.com/search?q=Nike%20Downshifter%2014%20Men%20Running%20Shoe',
      product_id: 'nike-downshifter-14-running-shoes-men-flipkart',
    },
    {
      title: 'Nike Downshifter 14 Men\'s Road Running Shoe',
      price: 4895,
      original_price: 4895,
      store: 'Nike India',
      rating: 4.5,
      reviews: 10,
      image: productImages['Nike Downshifter 14 Men\'s Road Running Shoe'],
      link: 'https://www.nike.in/nike-downshifter-14-men-s-road-running-shoe/p/24928857',
      product_id: 'nike-downshifter-14-running-shoes-men-nike-india',
    },
    {
      title: 'Nike Downshifter 14 Men\'s Road Running Shoe',
      price: 4895,
      original_price: 4895,
      store: 'Amazon India',
      rating: 4.0,
      reviews: 28,
      image: productImages['Nike Downshifter 14 Men\'s Road Running Shoe'],
      link: 'https://www.amazon.in/s?k=Nike+Mens+Downshifter+14+Running+Shoes',
      product_id: 'nike-downshifter-14-running-shoes-men-amazon-india',
    },
  ],
  'Milton Flip Lid Thermosteel Bottle 1000 ml': [
    {
      title: 'Milton Flip Lid Thermosteel Bottle 1000 ml',
      price: 610,
      original_price: 720,
      store: 'Milton India',
      rating: 4.6,
      reviews: 285,
      image: productImages['Milton Flip Lid Thermosteel Bottle 1000 ml'],
      link: 'https://www.milton.in/products/flip-lid-thermosteel-bottle',
      product_id: 'milton-flip-lid-thermosteel-bottle-1000-ml-milton-india',
    },
    {
      title: 'Milton Flip Lid Thermosteel Bottle 1000 ml',
      price: 989,
      original_price: 1205,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 799,
      image: productImages['Milton Flip Lid Thermosteel Bottle 1000 ml'],
      link: 'https://www.flipkart.com/search?q=Milton%20Flip%20Lid%20Thermosteel%20Bottle%201000%20ml',
      product_id: 'milton-flip-lid-thermosteel-bottle-1000-ml-flipkart',
    },
    {
      title: 'Milton Flip Lid Thermosteel Bottle 1000 ml',
      price: 610,
      original_price: 720,
      store: 'Amazon India',
      rating: 4.3,
      reviews: 1200,
      image: productImages['Milton Flip Lid Thermosteel Bottle 1000 ml'],
      link: 'https://www.amazon.in/s?k=Milton+Flip+Lid+Thermosteel+Bottle+1000+ml',
      product_id: 'milton-flip-lid-thermosteel-bottle-1000-ml-amazon-india',
    },
  ],
  'Cello Butterflow Ball Pen Pack of 100 Blue': [
    {
      title: 'Cello Butterflow Ball Pen Pack of 100 Blue',
      price: 945,
      original_price: 1000,
      store: 'Amazon India',
      rating: 4.2,
      reviews: 2746,
      image: productImages['Cello Butterflow Ball Pen Pack of 100 Blue'],
      link: 'https://www.amazon.in/s?k=Cello+Butterflow+Ball+Pen+Pack+of+100+Blue',
      product_id: 'cello-butterflow-ball-pen-pack-100-blue-amazon-india',
    },
    {
      title: 'Cello Butterflow Ball Pen Pack of 100 Blue',
      price: 999,
      original_price: 1000,
      store: 'Flipkart',
      rating: 4.1,
      reviews: 980,
      image: productImages['Cello Butterflow Ball Pen Pack of 100 Blue'],
      link: 'https://www.flipkart.com/search?q=Cello%20Butterflow%20Ball%20Pen%20Pack%20of%20100%20Blue',
      product_id: 'cello-butterflow-ball-pen-pack-100-blue-flipkart',
    },
    {
      title: 'Cello Butterflow Ball Pen Pack of 100 Blue',
      price: 950,
      original_price: 1000,
      store: 'Meesho',
      rating: 4.0,
      reviews: 420,
      image: productImages['Cello Butterflow Ball Pen Pack of 100 Blue'],
      link: 'https://www.meesho.com/search?q=Cello%20Butterflow%20Ball%20Pen%20Pack%20of%20100%20Blue',
      product_id: 'cello-butterflow-ball-pen-pack-100-blue-meesho',
    },
  ],
  'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN': [
    {
      title: 'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN',
      price: 9499,
      original_price: 24999,
      store: 'Amazon India',
      rating: 4.2,
      reviews: 3100,
      image: productImages['Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN'],
      link: 'https://www.amazon.in/s?k=Xiaomi+80+cm+F+Series+HD+Ready+Smart+LED+Fire+TV+L32MB-FIN',
      product_id: 'xiaomi-80-cm-f-series-fire-tv-l32mb-fin-amazon-india',
    },
    {
      title: 'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN',
      price: 9699,
      original_price: 24999,
      store: 'Flipkart',
      rating: 4.1,
      reviews: 2700,
      image: productImages['Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN'],
      link: 'https://www.flipkart.com/search?q=Xiaomi%2080%20cm%20F%20Series%20HD%20Ready%20Smart%20LED%20Fire%20TV%20L32MB-FIN',
      product_id: 'xiaomi-80-cm-f-series-fire-tv-l32mb-fin-flipkart',
    },
    {
      title: 'Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN',
      price: 13999,
      original_price: 24999,
      store: 'Xiaomi India',
      rating: 4.3,
      reviews: 900,
      image: productImages['Xiaomi 80 cm F Series HD Ready Smart LED Fire TV L32MB-FIN'],
      link: 'https://www.mi.com/in/search?keyword=Fire%20TV%2032',
      product_id: 'xiaomi-80-cm-f-series-fire-tv-l32mb-fin-xiaomi-india',
    },
  ],
  'boAt Airdopes 141 Gen 2 Wireless Earbuds': [
    {
      title: 'boAt Airdopes 141 Gen 2 Wireless Earbuds',
      price: 799,
      original_price: 4490,
      store: 'Amazon India',
      rating: 4.1,
      reviews: 88000,
      image: productImages['boAt Airdopes 141 Gen 2 Wireless Earbuds'],
      link: 'https://www.amazon.in/s?k=boAt+Airdopes+141+Gen+2',
      product_id: 'boat-airdopes-141-gen-2-amazon-india',
    },
    {
      title: 'boAt Airdopes 141 Gen 2 Wireless Earbuds',
      price: 899,
      original_price: 4490,
      store: 'Flipkart',
      rating: 4.0,
      reviews: 5200,
      image: productImages['boAt Airdopes 141 Gen 2 Wireless Earbuds'],
      link: 'https://www.flipkart.com/search?q=boAt%20Airdopes%20141%20Gen%202',
      product_id: 'boat-airdopes-141-gen-2-flipkart',
    },
    {
      title: 'boAt Airdopes 141 Gen 2 Wireless Earbuds',
      price: 999,
      original_price: 4490,
      store: 'boAt Lifestyle',
      rating: 4.2,
      reviews: 6400,
      image: productImages['boAt Airdopes 141 Gen 2 Wireless Earbuds'],
      link: 'https://www.boat-lifestyle.com/search?q=airdopes%20141',
      product_id: 'boat-airdopes-141-gen-2-boat-lifestyle',
    },
  ],
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
  const knownResults = getKnownProductResults(query);
  if (knownResults) return knownResults;

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

function getKnownProductResults(query: string): LiveSearchResult[] | null {
  const normalizedQuery = query.toLowerCase();
  const match = Object.entries(knownProducts).find(([name]) => {
    const normalizedName = name.toLowerCase();
    return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
  });

  return match?.[1] || null;
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
  if (/phone|iphone|samsung|galaxy|macbook|headphone|sony|tv|airdropes|earbuds|boat|xiaomi/i.test(query)) return 'Electronics';
  if (/shoe|nike|adidas/i.test(query)) return 'Footwear';
  if (/bottle|flask|water bottle|coconut oil|oil/i.test(query)) return 'Home';
  if (/pen|pencil|notebook|stationery|marker/i.test(query)) return 'Stationery';
  return 'General';
}

function detectBrand(query: string): string {
  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Milton', 'Cello', 'Xiaomi', 'boAt'];
  return brands.find((brand) => query.toLowerCase().includes(brand.toLowerCase())) || 'Unknown';
}

function estimatePrice(query: string): number {
  const knownResults = getKnownProductResults(query);
  if (knownResults) return Math.min(...knownResults.map((result) => result.price));

  if (/coconut oil|hair oil|cooking oil/i.test(query)) return 399;
  if (/bottle|water bottle|flask|sipper/i.test(query)) return 499;
  if (/pen|pens|ball pen|gel pen|marker/i.test(query)) return 149;
  if (/pencil|notebook|stationery/i.test(query)) return 199;
  if (/iphone/i.test(query)) return 74999;
  if (/galaxy|samsung/i.test(query)) return 64999;
  if (/macbook/i.test(query)) return 104999;
  if (/sony|headphone/i.test(query)) return 24990;
  if (/downshifter|nike/i.test(query)) return 4895;
  if (/shoe|nike|adidas/i.test(query)) return 7999;
  return 12999;
}

function findProductImage(query: string): string {
  const match = Object.entries(productImages).find(([name]) =>
    query.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(query.toLowerCase())
  );
  const genericMatch = Object.entries(genericProductImages).find(([name]) =>
    query.toLowerCase().includes(name) || (name === 'pen' && /pen|pens|marker/i.test(query))
  );

  return match?.[1] || genericMatch?.[1] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=480&q=80';
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
