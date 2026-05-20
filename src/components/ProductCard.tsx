import {
  TrendingDown,
  TrendingUp,
  Minus,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
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
  'Nike India': { label: 'N', className: 'bg-[#111111] text-white' },
  'Apple India': { label: '', className: 'bg-[#1d1d1f] text-white' },
  'Samsung India': { label: 'S', className: 'bg-[#1428a0] text-white' },
  'Milton India': { label: 'M', className: 'bg-[#005baa] text-white' },
  'Xiaomi India': { label: 'Mi', className: 'bg-[#ff6900] text-white' },
  'boAt Lifestyle': { label: 'b', className: 'bg-[#ed1c24] text-white' },
  Meesho: { label: 'M', className: 'bg-[#9f2089] text-white' },
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

function ProductImage({ src, name, brand }: { src: string; name: string; brand: string }) {
  const [failed, setFailed] = useState(false);
  const isPhone = /galaxy|iphone|phone/i.test(name);
  const isLaptop = /macbook|laptop/i.test(name);

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white">
          {isLaptop ? (
            <div className="flex flex-col items-center">
              <div className="h-11 w-16 rounded-t-lg border-[3px] border-slate-700 bg-gradient-to-br from-slate-100 to-slate-300 shadow-sm">
                <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-slate-500" />
                <div className="mx-auto mt-2 h-4 w-9 rounded bg-white/60" />
              </div>
              <div className="h-1.5 w-20 rounded-b-full bg-slate-700" />
              <div className="mt-1 text-[9px] font-bold uppercase text-slate-500">MacBook Air</div>
            </div>
          ) : isPhone ? (
            <div className="relative h-16 w-9 rounded-[10px] border-[3px] border-slate-800 bg-gradient-to-br from-slate-100 to-slate-300 shadow-sm">
              <div className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-slate-600" />
              <div className="absolute left-1 top-4 h-2 w-2 rounded-full bg-slate-500" />
              <div className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-slate-500" />
              <div className="absolute inset-x-2 bottom-2 h-6 rounded bg-white/60" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase text-slate-500">
                Phone
              </div>
            </div>
          ) : (
            <div className="text-center text-[10px] font-semibold text-slate-400">{brand || 'Product'}</div>
          )}
        </div>
      )}
      <div className="absolute left-2 bottom-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
        {brand}
      </div>
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
    ? { label: 'Buy Now', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', panel: 'from-emerald-50 to-white border-emerald-200' }
    : prediction?.recommendation === 'wait'
    ? { label: 'Wait for Drop', color: 'bg-amber-100 text-amber-700 border-amber-200', panel: 'from-amber-50 to-white border-amber-200' }
    : prediction
    ? { label: 'Good Deal', color: 'bg-sky-100 text-sky-700 border-sky-200', panel: 'from-sky-50 to-white border-sky-200' }
    : null;
  const confidencePercent = prediction ? Math.round(prediction.confidence * 100) : 0;
  const predictionChangeLabel = prediction
    ? `${prediction.predicted_change > 0 ? '+' : ''}${prediction.predicted_change_percent}%`
    : '';
  const predictionTone = prediction?.predicted_change && prediction.predicted_change > 0
    ? 'text-red-500'
    : 'text-emerald-600';

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
          <ProductImage src={product.image_url} name={product.name} brand={product.brand} />

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
              <div className={`rounded-xl border bg-gradient-to-br ${recBadge?.panel || 'from-slate-50 to-white border-slate-200'} p-4`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Forecast for next month
                    </div>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {formatINR(prediction.predicted_price)}
                      </span>
                      <span className={`pb-1 text-sm font-bold ${predictionTone}`}>
                        {predictionChangeLabel}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Current best price is {formatINR(prediction.current_best_price)}
                    </div>
                  </div>
                  {recBadge && (
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${recBadge.color}`}>
                      {recBadge.label}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/75 p-3 ring-1 ring-white">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">Trend</div>
                    <div className="mt-1 flex items-center gap-1 text-sm font-bold capitalize text-slate-700">
                      {trendIcon}
                      {prediction.trend}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/75 p-3 ring-1 ring-white">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">Confidence</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">{confidencePercent}%</div>
                  </div>
                  <div className="rounded-lg bg-white/75 p-3 ring-1 ring-white">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">Change</div>
                    <div className={`mt-1 text-sm font-bold ${predictionTone}`}>{predictionChangeLabel}</div>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
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
