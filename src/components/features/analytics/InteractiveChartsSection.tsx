import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { AnalyticsEngineData } from '../../../utils/analyticsEngine';
import { formatRp } from '../../../utils/formatters';
import { DataLegendBadge } from './AnalyticsFilterBar';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, SlidersHorizontal } from 'lucide-react';

interface InteractiveChartsSectionProps {
  data: AnalyticsEngineData;
}

export const InteractiveChartsSection: React.FC<InteractiveChartsSectionProps> = ({ data }) => {
  const [activeChartTab, setActiveChartTab] = useState<'line' | 'bar' | 'area' | 'donut' | 'comparison'>('line');

  const {
    timelineChartData,
    categoryChartData,
    areaNetWorthData,
    donutAssetData,
    donutCategoryData,
    comparisonChartData,
  } = data;

  // Custom Tooltip Formatter
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return formatRp(value);
    }
    return value;
  };

  return (
    <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-4 shadow-xl">
      {/* Chart Navigation Tabs & Data Type Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            Visualisasi Grafik Analytics Interaktif
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2B963]/15 text-[#E2B963] font-mono border border-[#E2B963]/30">
              5 Tipe Visual
            </span>
          </h3>
          <p className="text-[11px] text-gray-400">Pilih mode tampilan chart yang dioptimalkan untuk mobile & tablet.</p>
        </div>

        {/* Chart Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0B0D10] p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveChartTab('line')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeChartTab === 'line' ? 'bg-[#E2B963] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            1. Line
          </button>

          <button
            onClick={() => setActiveChartTab('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeChartTab === 'bar' ? 'bg-[#E2B963] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            2. Bar
          </button>

          <button
            onClick={() => setActiveChartTab('area')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeChartTab === 'area' ? 'bg-[#E2B963] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <AreaChartIcon className="w-3.5 h-3.5" />
            3. Area
          </button>

          <button
            onClick={() => setActiveChartTab('donut')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeChartTab === 'donut' ? 'bg-[#E2B963] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            4. Donut
          </button>

          <button
            onClick={() => setActiveChartTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeChartTab === 'comparison' ? 'bg-[#E2B963] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            5. Komparasi
          </button>
        </div>
      </div>

      <DataLegendBadge />

      {/* Chart Canvas Area */}
      <div className="w-full h-64 sm:h-72 bg-[#0B0D10] p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
        {/* 1. LINE CHART */}
        {activeChartTab === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{ backgroundColor: '#14171E', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line name="Pemasukan (Aktual)" type="monotone" dataKey="actualIncome" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line name="Pengeluaran (Aktual)" type="monotone" dataKey="actualExpense" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line name="Anggaran (Estimasi)" type="monotone" dataKey="estimatedExpense" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              <Line name="Forecast Laju Belanja" type="monotone" dataKey="forecastExpense" stroke="#A855F7" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* 2. BAR CHART */}
        {activeChartTab === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{ backgroundColor: '#14171E', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar name="Pengeluaran (Aktual)" dataKey="actual" fill="#E2B963" radius={[6, 6, 0, 0]} />
              <Bar name="Limit (Estimasi)" dataKey="estimated" fill="#3B82F6" radius={[6, 6, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 3. AREA CHART */}
        {activeChartTab === 'area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaNetWorthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E2B963" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E2B963" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="period" stroke="#888" fontSize={10} tickLine={false} />
              <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${v / 1000000}M`} tickLine={false} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{ backgroundColor: '#14171E', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area name="Total Aset (Aktual & Proyeksi)" type="monotone" dataKey="assets" stroke="#10B981" fillOpacity={1} fill="url(#colorAssets)" />
              <Area name="Kekayaan Bersih (Net Worth)" type="monotone" dataKey="netWorth" stroke="#E2B963" fillOpacity={1} fill="url(#colorNetWorth)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 4. DONUT CHART */}
        {activeChartTab === 'donut' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-full items-center">
            {/* Donut 1: Assets */}
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-gray-300 mb-1">Distribusi Aset (Aktual)</span>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={donutAssetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutAssetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={customTooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Donut 2: Categories */}
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-gray-300 mb-1">Pengeluaran per Kategori</span>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={donutCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={customTooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. COMPARISON CHART (Actual vs Estimated vs Forecast) */}
        {activeChartTab === 'comparison' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="metric" stroke="#888" fontSize={10} tickLine={false} />
              <YAxis stroke="#888" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} />
              <Tooltip
                formatter={customTooltipFormatter}
                contentStyle={{ backgroundColor: '#14171E', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar name="Aktual (Real)" dataKey="actual" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar name="Estimasi (Anggaran)" dataKey="estimated" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar name="Forecast (AI Proyeksi)" dataKey="forecast" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
