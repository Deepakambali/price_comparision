export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  image_url: string;
  created_at: string;
}

export interface StorePrice {
  id: string;
  product_id: string;
  store_name: string;
  price: number;
  original_price: number | null;
  rating: number;
  in_stock: boolean;
  url: string;
  fetched_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  store_name: string;
  price: number;
  recorded_at: string;
}

export interface ProductWithPrices extends Product {
  store_prices: StorePrice[];
  lowest_price: number;
  highest_price: number;
  average_price: number;
  savings_percent: number;
  best_store: string;
}

export interface PricePrediction {
  product_id: string;
  current_best_price: number;
  predicted_price: number;
  predicted_change: number;
  predicted_change_percent: number;
  recommendation: 'buy_now' | 'wait' | 'good_deal';
  confidence: number;
  trend: 'declining' | 'stable' | 'rising';
  trend_data: { date: string; price: number }[];
}
