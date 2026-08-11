import React, { useState } from 'react';
import { FileText, Download, Sparkles, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatDateFullID } from '../../utils/formatters';
import { computeAnalyticsData } from '../../utils/analyticsEngine';
import { MonthlyAIReview } from './analytics/MonthlyAIReview';
import { ReportCenter } from './analytics/ReportCenter';

export const MonthlyReviewView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'review' | 'report-center'>('review');
  const analyticsData = computeAnalyticsData('MONTH');

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-[#F7F6F2]">Laporan & Review Eksekutif Bulanan</h2>
          <p className="text-xs text-[#9CA3AF]">
            Review AI Otomatis, Rekomendasi Finansial, & Pusat Laporan
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#14171E] p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
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

          <button
            onClick={() => setActiveTab('report-center')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'report-center'
                ? 'bg-[#E2B963] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Report Center
          </button>
        </div>
      </div>

      {activeTab === 'review' ? (
        <MonthlyAIReview data={analyticsData} />
      ) : (
        <ReportCenter data={analyticsData} />
      )}
    </div>
  );
};
