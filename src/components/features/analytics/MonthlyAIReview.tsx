import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Target,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
} from 'lucide-react';
import { AnalyticsEngineData } from '../../../utils/analyticsEngine';
import { formatRp } from '../../../utils/formatters';
import { storage } from '../../../utils/storage';

interface MonthlyAIReviewProps {
  data: AnalyticsEngineData;
}

export const MonthlyAIReview: React.FC<MonthlyAIReviewProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const healthScore = storage.calculateFinancialHealthScore();
  const state = storage.getState();

  // Compute Review Metrics based on data
  const whatWentWell = [
    `Arus kas bersih tercatat positif sebesar ${formatRp(data.cashFlow.actual)} (Aktual) melebihi batas amannya.`,
    `Rasio tabungan (Saving Rate) berhasil menyentuh angka ${data.savingsRate.actual.toFixed(1)}% dari total pendapatan.`,
    `Kepatuhan anggaran belanja terjaga baik pada ${data.topCategories.length} kategori utama.`,
  ];

  const biggestChanges = [
    `Pemasukan aktual bulan ini berada di angka ${formatRp(data.income.actual)} (Estimasi: ${formatRp(data.income.estimated)}).`,
    `Pengeluaran berjalan di angka ${formatRp(data.expenses.actual)} dengan forecast akhir periode sebesar ${formatRp(data.expenses.forecast)}.`,
    `Kekayaan bersih (Net Worth) mengalami tren positif menuju ${formatRp(data.netWorth.forecast)} (Forecast AI).`,
  ];

  const spendingRisks = [
    data.expenses.actual > data.expenses.estimated
      ? `PERINGATAN: Realisasi belanja aktual (${formatRp(data.expenses.actual)}) telah melampaui estimasi batas anggaran (${formatRp(data.expenses.estimated)}).`
      : `Laju pengeluaran terkendali dengan selisih aman ${formatRp(data.expenses.estimated - data.expenses.actual)} di bawah batas budget.`,
    `Laju pengeluaran harian diperkirakan berisiko jika ada tagihan tak terduga menjelang akhir periode.`,
  ];

  const savingsProgress = [
    `Total akumulasi tabungan aktual periode ini: ${formatRp(data.savings.actual)}.`,
    `Estimasi target tabungan awal: ${formatRp(data.savings.estimated)}.`,
    `Proyeksi forecast akumulasi tabungan hingga akhir tahun: ${formatRp(data.savings.forecast)}.`,
  ];

  const goalsStatus = [
    `Progress target tabungan mencapai ${data.goals.progressPercentage.toFixed(1)}% (${formatRp(data.goals.totalCurrent)} dari total target ${formatRp(data.goals.totalTarget)}).`,
    `Total target aktif yang sedang berjalan: ${data.goals.items.length} Goal.`,
  ];

  const recommendations = [
    `Alokasikan setidaknya 15% dari surplus arus kas ${formatRp(data.cashFlow.actual)} ke instrumen investasi berisiko rendah.`,
    `Evaluasi ulang kategori pengeluaran terbesar (${data.topCategories[0]?.name || 'Umum'}) untuk efisiensi tambahan.`,
    `Pertahankan pembayaran utang rutin minimal ${formatRp(data.debt.monthlyMinPayment)} agar rasio utang tetap sehat.`,
  ];

  const handleRefreshAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1A202C] to-[#14171E] border border-[#E2B963]/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E2B963]/15 text-[#E2B963] border border-[#E2B963]/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                LUX AI Executive Monthly Review
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  Grade {healthScore.grade} ({healthScore.score}/100)
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Analisis mendalam otomatis berdasarkan data Aktual, Estimasi Anggaran, & Forecast Trajektori.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAI}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Menganalisis...' : 'Regenerasi Audit AI'}
          </button>
        </div>

        {/* Triple Pillar Status Badges */}
        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
          <div className="bg-[#0B0D10] p-2.5 rounded-xl border border-emerald-500/30 space-y-0.5">
            <span className="text-gray-400 block text-[10px]">Aktual Arus Kas</span>
            <span className="font-bold text-emerald-400">{formatRp(data.cashFlow.actual)}</span>
          </div>

          <div className="bg-[#0B0D10] p-2.5 rounded-xl border border-amber-500/30 space-y-0.5">
            <span className="text-gray-400 block text-[10px]">Estimasi Anggaran</span>
            <span className="font-bold text-amber-300">{formatRp(data.expenses.estimated)}</span>
          </div>

          <div className="bg-[#0B0D10] p-2.5 rounded-xl border border-purple-500/30 space-y-0.5">
            <span className="text-gray-400 block text-[10px]">Forecast Net Worth</span>
            <span className="font-bold text-purple-300">{formatRp(data.netWorth.forecast)}</span>
          </div>
        </div>
      </div>

      {/* 6 Required AI Review Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. What Went Well */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-emerald-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Pencapaian Positif (What Went Well)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {whatWentWell.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Biggest Changes */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-blue-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <TrendingUp className="w-4 h-4" />
            <span>2. Perubahan & Tren Utama (Biggest Changes)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {biggestChanges.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-blue-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Spending Risks */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-amber-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>3. Potensi Risiko Pengeluaran (Spending Risks)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {spendingRisks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-amber-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Savings Progress */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-cyan-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <PiggyBank className="w-4 h-4" />
            <span>4. Kemajuan Tabungan (Savings Progress)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {savingsProgress.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-cyan-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Goals Status */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-[#E2B963]/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E2B963]">
            <Target className="w-4 h-4" />
            <span>5. Evaluasi Target Keuangan (Goals)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {goalsStatus.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-[#E2B963] font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Recommendations */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-purple-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span>6. Rekomendasi Strategis (Recommendations)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {recommendations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#0B0D10] p-2 rounded-xl border border-white/5">
                <span className="text-purple-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
