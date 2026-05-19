import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GoogleShoppingResult {
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

interface SerpApiShoppingResult {
  title?: string;
  price?: string;
  extracted_price?: number;
  original_price?: string;
  extracted_original_price?: number;
  store?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  link?: string;
  product_id?: string;
}

interface SerpApiResponse {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const saveToDb = url.searchParams.get("save") === "true";

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Search query 'q' is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let results: GoogleShoppingResult[] = [];

    if (serpApiKey) {
      // Use SerpAPI for real Google Shopping results from India
      const serpUrl = new URL("https://serpapi.com/search");
      serpUrl.searchParams.set("engine", "google_shopping");
      serpUrl.searchParams.set("q", query);
      serpUrl.searchParams.set("gl", "in");
      serpUrl.searchParams.set("hl", "en");
      serpUrl.searchParams.set("api_key", serpApiKey);

      const serpResponse = await fetch(serpUrl.toString());
      const serpData: SerpApiResponse = await serpResponse.json();

      if (serpData.error) {
        throw new Error(`SerpAPI error: ${serpData.error}`);
      }

      results = (serpData.shopping_results || []).slice(0, 15).map((item: SerpApiShoppingResult) => ({
        title: item.title || "Unknown Product",
        price: item.extracted_price || 0,
        original_price: item.extracted_original_price || undefined,
        store: item.store || "Unknown Store",
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        image: item.thumbnail || "",
        link: item.link || "#",
        product_id: item.product_id || crypto.randomUUID(),
      }));
    } else {
      // Fallback: Generate realistic Indian market results with real store URLs
      results = generateIndianMarketResults(query);
    }

    // Optionally save results to database
    if (saveToDb && results.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Create a product entry
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: query,
          category: detectCategory(query),
          brand: detectBrand(query),
          image_url: results[0]?.image || "",
        })
        .select()
        .single();

      if (!productError && product) {
        // Insert store prices
        const priceInserts = results
          .filter((r) => r.price > 0)
          .map((r) => ({
            product_id: product.id,
            store_name: r.store,
            price: r.price,
            original_price: r.original_price || null,
            rating: r.rating,
            in_stock: true,
            url: r.link,
          }));

        if (priceInserts.length > 0) {
          await supabase.from("store_prices").insert(priceInserts);
        }
      }
    }

    return new Response(
      JSON.stringify({ results, source: serpApiKey ? "serpapi" : "generated", query }),
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

function detectCategory(query: string): string {
  const q = query.toLowerCase();
  if (/phone|mobile|iphone|samsung|oneplus|pixel|galaxy/i.test(q)) return "Electronics";
  if (/laptop|macbook|ipad|tablet|computer/i.test(q)) return "Electronics";
  if (/headphone|earphone|earbuds|speaker|soundbar/i.test(q)) return "Electronics";
  if (/tv|television|monitor/i.test(q)) return "Electronics";
  if (/shoe|sneaker|boot|sandal|footwear/i.test(q)) return "Footwear";
  if (/jeans|shirt|tshirt|dress|jacket|kurta|saree/i.test(q)) return "Clothing";
  if (/vacuum|mixer|grinder|washing|refrigerator|ac|air conditioner/i.test(q)) return "Home";
  if (/watch|ring|necklace|jewellery/i.test(q)) return "Accessories";
  return "General";
}

function detectBrand(query: string): string {
  const q = query.toLowerCase();
  const brands: Record<string, string> = {
    "samsung": "Samsung", "apple": "Apple", "iphone": "Apple", "macbook": "Apple", "ipad": "Apple",
    "oneplus": "OnePlus", "sony": "Sony", "nike": "Nike", "adidas": "Adidas",
    "dyson": "Dyson", "levi": "Levi's", "preethi": "Preethi", "bata": "Bata",
    "boat": "Boat", "realme": "Realme", "xiaomi": "Xiaomi", "redmi": "Xiaomi",
    "puma": "Puma", "philips": "Philips", "lg": "LG", "whirlpool": "Whirlpool",
  };
  for (const [key, brand] of Object.entries(brands)) {
    if (q.includes(key)) return brand;
  }
  return "Unknown";
}

function generateIndianMarketResults(query: string): GoogleShoppingResult[] {
  const q = query.toLowerCase();
  const stores = [
    { name: "Amazon India", domain: "https://www.amazon.in/s?k=" },
    { name: "Flipkart", domain: "https://www.flipkart.com/search?q=" },
    { name: "Myntra", domain: "https://www.myntra.com/" },
    { name: "Croma", domain: "https://www.croma.com/searchB?q=" },
    { name: "Reliance Digital", domain: "https://www.reliancedigital.in/search?q=" },
    { name: "Vijay Sales", domain: "https://www.vijaysales.com/search?q=" },
    { name: "Ajio", domain: "https://www.ajio.com/search/?text=" },
    { name: "Tata CLiQ", domain: "https://www.tatacliq.com/search/?searchTerm=" },
  ];

  // Base price estimation based on product keywords
  let basePrice = 999;
  if (/iphone|macbook|galaxy s24|galaxy s25/i.test(q)) basePrice = 79999;
  else if (/samsung.*ultra|iphone.*pro/i.test(q)) basePrice = 109999;
  else if (/laptop|macbook air/i.test(q)) basePrice = 69999;
  else if (/ipad|tablet/i.test(q)) basePrice = 49999;
  else if (/oneplus 12|oneplus 13|pixel/i.test(q)) basePrice = 49999;
  else if (/phone|mobile/i.test(q)) basePrice = 19999;
  else if (/headphone|earbuds|earphone/i.test(q)) basePrice = 4999;
  else if (/sony.*xm5|sony.*1000/i.test(q)) basePrice = 24990;
  else if (/tv|television/i.test(q)) basePrice = 29999;
  else if (/shoe|sneaker|nike|adidas/i.test(q)) basePrice = 7999;
  else if (/jeans|shirt|clothing/i.test(q)) basePrice = 2499;
  else if (/vacuum|dyson/i.test(q)) basePrice = 39999;
  else if (/mixer|grinder|preethi/i.test(q)) basePrice = 7999;
  else if (/watch/i.test(q)) basePrice = 4999;
  else if (/refrigerator|fridge/i.test(q)) basePrice = 24999;
  else if (/washing machine/i.test(q)) basePrice = 19999;
  else if (/ac|air conditioner/i.test(q)) basePrice = 29999;

  const encodedQuery = encodeURIComponent(query);

  return stores.map((store, i) => {
    // Vary price per store (some cheaper, some more expensive)
    const variation = 1 + (Math.sin(i * 1.5) * 0.12);
    const price = Math.round(basePrice * variation);
    const originalPrice = Math.round(price * (1.1 + Math.random() * 0.25));
    const rating = Math.round((3.8 + Math.random() * 1.1) * 10) / 10;

    return {
      title: query,
      price,
      original_price: originalPrice > price ? originalPrice : undefined,
      store: store.name,
      rating: Math.min(5, rating),
      reviews: Math.round(100 + Math.random() * 5000),
      image: "",
      link: `${store.domain}${encodedQuery}`,
      product_id: crypto.randomUUID(),
    };
  });
}
