import { X, TrendingDown, TrendingUp, Minus, Sparkles, AlertCircle } from 'lucide-react';
import type { PricePrediction } from '../lib/types';
import { formatINR } from '../lib/utils';
import PriceChart from './PriceChart';

interface PredictionModalProps {
  prediction: PricePrediction;
  productName: string;
  onClose: () => void;
}

export default function PredictionModal({ prediction, productName, onClose }: PredictionModalProps) {
  const trendIcon = prediction.trend === 'declining'
    ? <TrendingDown className="w-5 h-5 text-emerald-500" />
    : prediction.trend === 'rising'
    ? <TrendingUp className="w-5 h-5 text-red-500" />
    : <Minus className="w-5 h-5 text-slate-400" />;

  const trendLabel = prediction.trend === 'declining'
    ? 'Prices are trending down'
    : prediction.trend === 'rising'
    ? 'Prices are trending up'
    : 'Prices are stable';

  const recConfig = prediction.recommendation === 'buy_now'
    ? { label: 'Buy Now', desc: 'Prices are rising or this is already a great deal. Purchase soon to lock in the current price.', color: 'bg-emerald-500', textColor: 'text-emerald-600' }
    : prediction.recommendation === 'wait'
    ? { label: 'Wait for Price Drop', desc: 'Our model predicts prices will continue to decline. Consider waiting for a better deal.', color: 'bg-amber-500', textColor: 'text-amber-600' }
    : { label: 'Good Deal - Consider Buying', desc: 'This is a competitive price. The model shows stable or slightly declining trends.', color: 'bg-sky-500', textColor: 'text-sky-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">Price Prediction</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-700">{productName}</h3>
            <div className="flex items-center gap-2 mt-1">
              {trendIcon}
              <span className="text-sm text-slate-500">{trendLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Current Best</div>
              <div className="text-2xl font-bold text-slate-800">{formatINR(prediction.current_best_price)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Predicted (Next Month)</div>
              <div className={`text-2xl font-bold ${
                prediction.predicted_change < 0 ? 'text-emerald-600' : prediction.predicted_change > 0 ? 'text-red-500' : 'text-slate-800'
              }`}>
                {formatINR(prediction.predicted_price)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Change</div>
              <div className={`text-base font-bold ${
                prediction.predicted_change < 0 ? 'text-emerald-600' : prediction.predicted_change > 0 ? 'text-red-500' : 'text-slate-600'
              }`}>
                {prediction.predicted_change > 0 ? '+' : ''}{prediction.predicted_change_percent}%
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Confidence</div>
              <div className="text-base font-bold text-slate-800">{Math.round(prediction.confidence * 100)}%</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Trend</div>
              <div className="text-base font-bold flex items-center justify-center gap-1">
                {trendIcon}
                <span className="capitalize text-slate-700">{prediction.trend}</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl p-4 border ${
            prediction.recommendation === 'buy_now' ? 'bg-emerald-50 border-emerald-200' :
            prediction.recommendation === 'wait' ? 'bg-amber-50 border-amber-200' :
            'bg-sky-50 border-sky-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${recConfig.color}`} />
              <span className={`text-sm font-bold ${recConfig.textColor}`}>{recConfig.label}</span>
            </div>
            <p className="text-sm text-slate-600">{recConfig.desc}</p>
          </div>

          {/* Chart */}
          {prediction.trend_data.length > 1 && (
            <PriceChart data={prediction.trend_data} predictedPrice={prediction.predicted_price} />
          )}

          <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Predictions are based on historical price trends, category analysis, and brand patterns.
              Confidence reflects data quality and trend consistency. Past performance does not guarantee future prices.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
