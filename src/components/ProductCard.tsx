import { TrendingDown, TrendingUp, Minus, Star, ShoppingCart, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ProductWithPrices, PricePrediction } from '../lib/types';
import { formatINR } from '../lib/utils';
import PriceChart from './PriceChart';

interface ProductCardProps {
  product: ProductWithPrices;
  prediction: PricePrediction | null;
  onPredict: (productId: string) => void;
  isBestDeal: boolean;
}

const storeLogos: Record<string, { label: string; className: string }> = {
  'Amazon India': { label: 'a', className: 'bg-[#ff9900] text-slate-950' },
  Flipkart: { label: 'F', className: 'bg-[#2874f0] text-white' },
  Croma: { label: 'C', className: 'bg-[#8edccf] text-slate-900' },
  'Reliance Digital': { label: 'R', className: 'bg-[#003380] text-white' },
  'Tata CLiQ': { label: 'T', className: 'bg-[#1d1d1f] text-white' },
};

function StoreLogo({ storeName, isBest }: { storeName: string; isBest?: boolean }) {
  const logo = storeLogos[storeName] || {
    label: storeName.charAt(0),
    className: isBest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
  };

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${logo.className}`}>
      {logo.label}
    </div>
  );
}

export default function ProductCard({ product, prediction, onPredict, isBestDeal }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  const savingsAmount = product.highest_price - product.lowest_price;

  const trendIcon = prediction?.trend === 'declining'
    ? <TrendingDown className="w-4 h-4 text-emerald-500" />
    : prediction?.trend === 'rising'
    ? <TrendingUp className="w-4 h-4 text-red-500" />
    : <Minus className="w-4 h-4 text-slate-400" />;

  const recBadge = prediction?.recommendation === 'buy_now'
    ? { label: 'Buy Now', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    : prediction?.recommendation === 'wait'
    ? { label: 'Wait for Drop', color: 'bg-amber-100 text-amber-700 border-amber-200' }
    : prediction
    ? { label: 'Good Deal', color: 'bg-sky-100 text-sky-700 border-sky-200' }
    : null;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg ${
      isBestDeal
        ? 'border-emerald-300 shadow-emerald-100/50 shadow-md ring-1 ring-emerald-200'
        : 'border-slate-200 shadow-sm hover:border-slate-300'
    }`}>
      {isBestDeal && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 rounded-t-2xl border-b border-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Best Deal</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingCart className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-800 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-xs text-slate-400">by {product.brand}</span>
                </div>
              </div>
              {product.savings_percent > 0 && (
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-emerald-600">
                    -{product.savings_percent}%
                  </div>
                  <div className="text-xs text-slate-400">save {formatINR(savingsAmount)}</div>
                </div>
              )}
            </div>

            <div className="flex items-end gap-3 mt-3">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Best Price</div>
                <div className="text-2xl font-bold text-slate-900">{formatINR(product.lowest_price)}</div>
              </div>
              {product.highest_price > product.lowest_price && (
                <div className="pb-1">
                  <span className="text-sm text-slate-400 line-through">{formatINR(product.highest_price)}</span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-1.5 text-sm text-slate-500">
                <StoreLogo storeName={product.best_store} isBest />
                <span className="font-medium text-emerald-600">{product.best_store}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction section */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (!prediction) onPredict(product.id);
                setShowPrediction(!showPrediction);
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {prediction ? 'Price Prediction' : 'Get Price Prediction'}
              {showPrediction ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {prediction && recBadge && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${recBadge.color}`}>
                {recBadge.label}
              </span>
            )}
          </div>

          {showPrediction && prediction && (
            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">Predicted</div>
                  <div className="text-lg font-bold text-slate-800">{formatINR(prediction.predicted_price)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">Change</div>
                  <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                    prediction.predicted_change < 0 ? 'text-emerald-600' : prediction.predicted_change > 0 ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    {trendIcon}
                    {prediction.predicted_change_percent > 0 ? '+' : ''}{prediction.predicted_change_percent}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-slate-800">{Math.round(prediction.confidence * 100)}%</div>
                </div>
              </div>

              {prediction.trend_data.length > 0 && (
                <PriceChart data={prediction.trend_data} predictedPrice={prediction.predicted_price} />
              )}
            </div>
          )}
        </div>

        {/* Store prices toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {expanded ? 'Hide' : 'Show'} {product.store_prices.length} store prices
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
            {product.store_prices.map((sp) => (
              <div
                key={sp.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  sp.store_name === product.best_store
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <StoreLogo storeName={sp.store_name} isBest={sp.store_name === product.best_store} />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{sp.store_name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-400">{sp.rating}</span>
                      {!sp.in_stock && (
                        <span className="text-xs text-red-500 ml-2">Out of stock</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      sp.store_name === product.best_store ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {formatINR(Number(sp.price))}
                    </div>
                    {sp.original_price && Number(sp.original_price) > Number(sp.price) && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatINR(Number(sp.original_price))}
                      </div>
                    )}
                  </div>
                  <a
                    href={sp.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title={`Open on ${sp.store_name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
