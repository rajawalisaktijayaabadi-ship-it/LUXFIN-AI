import React from 'react';
import { Calendar, SlidersHorizontal, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { TimeFilterPeriod, DateRange } from '../../../utils/analyticsEngine';

interface AnalyticsFilterBarProps {
  period: TimeFilterPeriod;
  onPeriodChange: (p: TimeFilterPeriod) => void;
  customRange: DateRange;
  onCustomRangeChange: (r: DateRange) => void;
  activeDateRangeText: string;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  activeDateRangeText,
}) => {
  return (
    <div className="space-y-3 bg-[#14171E] border border-white/10 p-3.5 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#E2B963]" />
          <span className="text-xs font-bold text-white">Filter Periode Waktu:</span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E2B963]/15 text-[#E2B963] font-mono border border-[#E2B963]/30">
            {activeDateRangeText}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { id: 'WEEK', label: '1 Minggu' },
              { id: 'MONTH', label: 'Bulan Ini' },
              { id: 'QUARTER', label: 'Kuartal (Q)' },
              { id: 'YEAR', label: 'Tahun Ini' },
              { id: 'CUSTOM', label: 'Kustom' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onPeriodChange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                period === item.id
                  ? 'bg-[#E2B963] text-black shadow-md scale-105'
                  : 'bg-[#0B0D10] text-gray-400 border border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Input fields */}
      {period === 'CUSTOM' && (
        <div className="pt-2 border-t border-white/10 flex items-center gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-gray-400 text-[11px]">Dari:</span>
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) => onCustomRangeChange({ ...customRange, startDate: e.target.value })}
              className="bg-[#0B0D10] border border-white/15 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-[#E2B963] text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-gray-400 text-[11px]">Sampai:</span>
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) => onCustomRangeChange({ ...customRange, endDate: e.target.value })}
              className="bg-[#0B0D10] border border-white/15 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-[#E2B963] text-xs w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const DataLegendBadge: React.FC<{ type?: 'all' | 'compact' }> = ({ type = 'all' }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] bg-[#0B0D10] border border-white/5 p-2 rounded-xl">
      <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mr-1">Tipe Data:</span>
      
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
        <CheckCircle2 className="w-3 h-3" />
        Aktual (Real)
      </span>

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
        <Clock className="w-3 h-3" />
        Estimasi (Anggaran)
      </span>

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
        <Sparkles className="w-3 h-3" />
        Forecast (AI Proyeksi)
      </span>
    </div>
  );
};
