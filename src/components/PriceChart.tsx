import { useMemo } from 'react';
import { formatINRShort } from '../lib/utils';

interface PriceChartProps {
  data: { date: string; price: number }[];
  predictedPrice: number;
}

export default function PriceChart({ data }: PriceChartProps) {
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotW = chartWidth - padding.left - padding.right;
  const plotH = chartHeight - padding.top - padding.bottom;

  const { minPrice, maxPrice, points, predictedPoint } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 0, points: [], predictedPoint: null };

    const prices = data.map((d) => d.price);
    const min = Math.min(...prices) * 0.95;
    const max = Math.max(...prices) * 1.05;
    const range = max - min || 1;

    const pts = data.slice(0, -1).map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 2, 1)) * plotW,
      y: padding.top + plotH - ((d.price - min) / range) * plotH,
      price: d.price,
      date: d.date,
    }));

    const lastIdx = data.length - 1;
    const predPt = data.length > 1
      ? {
          x: padding.left + (lastIdx / Math.max(data.length - 1, 1)) * plotW,
          y: padding.top + plotH - ((data[lastIdx].price - min) / range) * plotH,
          price: data[lastIdx].price,
          date: data[lastIdx].date,
        }
      : null;

    return { minPrice: min, maxPrice: max, points: pts, predictedPoint: predPt };
  }, [data, plotW, plotH]);

  if (data.length < 2) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        Not enough historical data for a chart
      </div>
    );
  }

  const allPoints = [...points];
  if (predictedPoint) allPoints.push(predictedPoint);

  const linePath = allPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L ${allPoints[allPoints.length - 1].x} ${padding.top + plotH} L ${allPoints[0].x} ${padding.top + plotH} Z`;

  // Grid lines
  const gridLines = 4;
  const gridY = Array.from({ length: gridLines + 1 }, (_, i) => {
    const y = padding.top + (i / gridLines) * plotH;
    const price = maxPrice - (i / gridLines) * (maxPrice - minPrice);
    return { y, price };
  });

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Trend</span>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-500 rounded" /> Historical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-500 rounded border-dashed" style={{ borderTop: '2px dashed #f59e0b', width: 12, height: 0 }} /> Predicted
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '200px' }}
      >
        {/* Grid */}
        {gridY.map((g) => (
          <g key={g.y}>
            <line
              x1={padding.left}
              y1={g.y}
              x2={chartWidth - padding.right}
              y2={g.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={g.y + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-400"
            >
              {formatINRShort(g.price)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" opacity="0.3" />

        {/* Historical line */}
        {points.length > 1 && (
          <path
            d={points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dashed prediction line */}
        {predictedPoint && points.length > 0 && (
          <line
            x1={points[points.length - 1].x}
            y1={points[points.length - 1].y}
            x2={predictedPoint.x}
            y2={predictedPoint.y}
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" strokeWidth="2" />
          </g>
        ))}

        {/* Predicted point */}
        {predictedPoint && (
          <g>
            <circle cx={predictedPoint.x} cy={predictedPoint.y} r="5" fill="white" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx={predictedPoint.x} cy={predictedPoint.y} r="8" fill="#f59e0b" opacity="0.15" />
          </g>
        )}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotW;
          const isLast = i === data.length - 1;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[9px] fill-slate-400"
            >
              {isLast ? 'Next' : d.date.slice(5)}
            </text>
          );
        })}

        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
