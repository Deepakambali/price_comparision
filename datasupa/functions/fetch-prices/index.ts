import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category") || "";
    const brand = url.searchParams.get("brand") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let productQuery = supabase
      .from("products")
      .select("id, name, category, brand, image_url, created_at");

    if (searchQuery) {
      productQuery = productQuery.ilike("name", `%${searchQuery}%`);
    }
    if (category) {
      productQuery = productQuery.eq("category", category);
    }
    if (brand) {
      productQuery = productQuery.eq("brand", brand);
    }

    const { data: products, error: productError } = await productQuery;

    if (productError) {
      throw new Error(`Product query failed: ${productError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ products: [], categories: [], brands: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const productIds = products.map((p: { id: string }) => p.id);
    const { data: storePrices, error: priceError } = await supabase
      .from("store_prices")
      .select("*")
      .in("product_id", productIds)
      .order("price", { ascending: true });

    if (priceError) {
      throw new Error(`Price query failed: ${priceError.message}`);
    }

    const pricesByProduct: Record<string, typeof storePrices> = {};
    for (const sp of storePrices || []) {
      if (!pricesByProduct[sp.product_id]) {
        pricesByProduct[sp.product_id] = [];
      }
      pricesByProduct[sp.product_id].push(sp);
    }

    const enrichedProducts = products.map((product: { id: string; name: string; category: string; brand: string; image_url: string; created_at: string }) => {
      const prices = pricesByProduct[product.id] || [];
      const priceValues = prices.map((p: { price: number }) => Number(p.price));
      const lowest = priceValues.length > 0 ? Math.min(...priceValues) : 0;
      const highest = priceValues.length > 0 ? Math.max(...priceValues) : 0;
      const avg = priceValues.length > 0 ? priceValues.reduce((a: number, b: number) => a + b, 0) / priceValues.length : 0;
      const bestStore = prices.length > 0 ? prices[0].store_name : "";
      const originalPrice = prices.length > 0 && prices[0].original_price ? Number(prices[0].original_price) : highest;
      const savingsPercent = originalPrice > 0 ? ((originalPrice - lowest) / originalPrice) * 100 : 0;

      return {
        ...product,
        store_prices: prices,
        lowest_price: Math.round(lowest * 100) / 100,
        highest_price: Math.round(highest * 100) / 100,
        average_price: Math.round(avg * 100) / 100,
        best_store: bestStore,
        savings_percent: Math.round(savingsPercent * 10) / 10,
      };
    });

    const { data: categoryData } = await supabase
      .from("products")
      .select("category")
      .order("category");
    const { data: brandData } = await supabase
      .from("products")
      .select("brand")
      .order("brand");

    const categories = [...new Set((categoryData || []).map((c: { category: string }) => c.category))];
    const brands = [...new Set((brandData || []).map((b: { brand: string }) => b.brand))];

    return new Response(
      JSON.stringify({ products: enrichedProducts, categories, brands }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
