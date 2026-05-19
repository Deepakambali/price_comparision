/*
  # Price Comparison Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key) - Unique product identifier
      - `name` (text) - Product name/title
      - `category` (text) - Product category (e.g., Electronics, Clothing)
      - `brand` (text) - Brand name
      - `image_url` (text) - Product image URL
      - `created_at` (timestamptz) - Record creation timestamp

    - `store_prices`
      - `id` (uuid, primary key) - Unique price record identifier
      - `product_id` (uuid, FK to products) - Associated product
      - `store_name` (text) - Store/retailer name
      - `price` (numeric) - Current price at this store
      - `original_price` (numeric) - Original/listed price before discounts
      - `rating` (numeric) - Store rating (0-5)
      - `in_stock` (boolean) - Availability status
      - `url` (text) - Direct link to product at store
      - `fetched_at` (timestamptz) - When this price was fetched

    - `price_history`
      - `id` (uuid, primary key) - Unique history record identifier
      - `product_id` (uuid, FK to products) - Associated product
      - `store_name` (text) - Store name
      - `price` (numeric) - Historical price
      - `recorded_at` (timestamptz) - When this price was recorded

  2. Security
    - Enable RLS on all tables
    - Public read access for products and store_prices (browsing)
    - Authenticated users can read price_history
    - Service role has full access for edge functions

  3. Indexes
    - products: category, brand
    - store_prices: product_id, store_name, price
    - price_history: product_id, recorded_at
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  brand text NOT NULL DEFAULT 'Unknown',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create store_prices table
CREATE TABLE IF NOT EXISTS store_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  original_price numeric(10, 2),
  rating numeric(3, 2) DEFAULT 0,
  in_stock boolean DEFAULT true,
  url text DEFAULT '',
  fetched_at timestamptz DEFAULT now()
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view store prices"
  ON store_prices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can view price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can view price history"
  ON price_history FOR SELECT
  TO anon
  USING (true);

-- Service role full access policies
CREATE POLICY "Service role can insert products"
  ON products FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update products"
  ON products FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert store prices"
  ON store_prices FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update store prices"
  ON store_prices FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete store prices"
  ON store_prices FOR DELETE
  TO authenticated, service_role
  USING (true);

CREATE POLICY "Service role can insert price history"
  ON price_history FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_store_prices_product_id ON store_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_store_prices_price ON store_prices(price);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
