import React, { useState } from 'react';
import {
  PieChart,
  FileText,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { TimeFilterPeriod, DateRange, computeAnalyticsData } from '../../utils/analyticsEngine';
import { AnalyticsFilterBar } from './analytics/AnalyticsFilterBar';
import { DashboardAnalyticsCards } from './analytics/DashboardAnalyticsCards';
import { InteractiveChartsSection } from './analytics/InteractiveChartsSection';
import { ReportCenter } from './analytics/ReportCenter';
import { MonthlyAIReview } from './analytics/MonthlyAIReview';

export const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'review'>('dashboard');
  const [period, setPeriod] = useState<TimeFilterPeriod>('MONTH');
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
  });

  // Calculate reactive analytics data
  const analyticsData = computeAnalyticsData(period, customRange);

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* View Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#F7F6F2]">Analisis & Laporan Keuangan</h2>
          <p className="text-xs text-[#9CA3AF]">
            Dashboard Analytics, Report Center (10 Laporan), & Review AI Bulanan
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#14171E] p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#E2B963] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Dashboard & Chart
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#E2B963] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Report Center (10)
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-[#E2B963] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Review
          </button>
        </div>
      </div>

      {/* Filter Bar (Period & Date Range) */}
      <AnalyticsFilterBar
        period={period}
        onPeriodChange={setPeriod}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        activeDateRangeText={`${analyticsData.dateRange.startDate} ~ ${analyticsData.dateRange.endDate}`}
      />

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* 11 Required Metrics Dashboard Cards */}
          <DashboardAnalyticsCards data={analyticsData} />

          {/* 5 Interactive Recharts Section */}
          <InteractiveChartsSection data={analyticsData} />
        </div>
      )}

      {activeTab === 'reports' && (
        <ReportCenter data={analyticsData} />
      )}

      {activeTab === 'review' && (
        <MonthlyAIReview data={analyticsData} />
      )}
    </div>
  );
};
