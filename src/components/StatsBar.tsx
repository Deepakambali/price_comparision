import { TrendingDown, BarChart3, IndianRupee, Package } from 'lucide-react';
import { formatINRShort } from '../lib/utils';

interface StatsBarProps {
  totalProducts: number;
  totalSavings: number;
  avgSavingsPercent: number;
  bestDealName: string;
  bestDealSavings: number;
}

export default function StatsBar({
  totalProducts,
  totalSavings,
  avgSavingsPercent,
  bestDealName,
  bestDealSavings,
}: StatsBarProps) {
  const stats = [
    {
      icon: Package,
      label: 'Products Tracked',
      value: totalProducts.toString(),
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      icon: IndianRupee,
      label: 'Total Savings Available',
      value: formatINRShort(totalSavings),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: TrendingDown,
      label: 'Avg. Savings',
      value: `${avgSavingsPercent.toFixed(1)}%`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: BarChart3,
      label: 'Best Deal',
      value: bestDealName ? `${formatINRShort(bestDealSavings)} off` : '--',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 truncate">{stat.label}</div>
            <div className="text-lg font-bold text-slate-800 truncate">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
