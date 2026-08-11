import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Target,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { AnalyticsEngineData } from '../../../utils/analyticsEngine';
import { formatRp, formatDateFullID } from '../../../utils/formatters';
import { storage } from '../../../utils/storage';

interface ReportCenterProps {
  data: AnalyticsEngineData;
}

export type ReportTypeId =
  | 'monthly-overview'
  | 'income-report'
  | 'expense-report'
  | 'cashflow-report'
  | 'budget-report'
  | 'goal-report'
  | 'debt-report'
  | 'investment-report'
  | 'networth-report'
  | 'ai-financial-report';

export const ReportCenter: React.FC<ReportCenterProps> = ({ data }) => {
  const [selectedReport, setSelectedReport] = useState<ReportTypeId>('monthly-overview');
  const state = storage.getState();
  const currentUser = state.user;

  const reportList: Array<{ id: ReportTypeId; title: string; desc: string; icon: any }> = [
    { id: 'monthly-overview', title: '1. Ringkasan Eksekutif Bulanan', desc: 'Arus kas, kesehatan finansial, & highlights', icon: FileText },
    { id: 'income-report', title: '2. Laporan Pemasukan (Income)', desc: 'Gaji, deviden, & sumber pendapatan', icon: TrendingUp },
    { id: 'expense-report', title: '3. Laporan Pengeluaran (Expense)', desc: 'Rincian belanja per kategori & merchant', icon: TrendingDown },
    { id: 'cashflow-report', title: '4. Laporan Arus Kas (Cash Flow)', desc: 'Surplus/defisit harian & proyeksi', icon: DollarSign },
    { id: 'budget-report', title: '5. Laporan Kepatuhan Anggaran', desc: 'Batas budget vs realisasi pengeluaran', icon: Receipt },
    { id: 'goal-report', title: '6. Laporan Target Tabungan (Goal)', desc: 'Progress akumulasi dana & estimasi selesai', icon: Target },
    { id: 'debt-report', title: '7. Laporan Utang & Liabilitas', desc: 'Saldo sisa, pembayaran minimal, & jadwal', icon: CreditCard },
    { id: 'investment-report', title: '8. Laporan Portofolio Investasi', desc: 'Saham, reksadana, emas, & yield', icon: TrendingUp },
    { id: 'networth-report', title: '9. Laporan Kekayaan Bersih', desc: 'Total aset dikurangi seluruh utang', icon: Building },
    { id: 'ai-financial-report', title: '10. Laporan Audit AI Strategis', desc: 'Analisis risiko & saran optimasi LUX AI', icon: Sparkles },
  ];

  const activeReportInfo = reportList.find((r) => r.id === selectedReport) || reportList[0];

  const handleExportTextReport = () => {
    const timestamp = new Date().toISOString().substring(0, 10);
    const content = `
==================================================
LUXFIN AI REPORT CENTER — ${activeReportInfo.title.toUpperCase()}
==================================================
Tanggal Laporan : ${formatDateFullID(new Date().toISOString())}
Pemilik Akun     : ${currentUser?.name || 'User'} (${currentUser?.email})
Periode Waktu   : ${data.dateRange.startDate} s/d ${data.dateRange.endDate}

--- DIMENSI DATA LENGKAP ---
1. AKTUAL (Real Recorded Data)  :
   - Pemasukan    : ${formatRp(data.income.actual)}
   - Pengeluaran  : ${formatRp(data.expenses.actual)}
   - Arus Kas     : ${formatRp(data.cashFlow.actual)}
   - Net Worth    : ${formatRp(data.netWorth.actual)}

2. ESTIMASI (Target / Budgeted)  :
   - Target Pemasukan  : ${formatRp(data.income.estimated)}
   - Limit Pengeluaran : ${formatRp(data.expenses.estimated)}
   - Target Arus Kas   : ${formatRp(data.cashFlow.estimated)}

3. FORECAST (AI Proyeksi Trajektori) :
   - Forecast Pemasukan  : ${formatRp(data.income.forecast)}
   - Forecast Belanja    : ${formatRp(data.expenses.forecast)}
   - Forecast Net Worth  : ${formatRp(data.netWorth.forecast)}

==================================================
Disusun secara otomatis oleh LUXFIN AI Operating System
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUXFIN_Report_${selectedReport}_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${activeReportInfo.title} - LUXFIN AI</title>
            <style>
              body { font-family: sans-serif; padding: 30px; color: #111; }
              .header { border-bottom: 2px solid #E2B963; padding-bottom: 10px; margin-bottom: 20px; }
              .title { font-size: 20px; font-weight: bold; }
              .subtitle { font-size: 12px; color: #666; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
              .card { background: #f8f8f8; border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
              .card-title { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
              .card-val { font-size: 16px; font-weight: bold; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #eee; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">LUXFIN AI — ${activeReportInfo.title}</div>
              <div class="subtitle">Pemilik: ${currentUser?.name} | Periode: ${data.dateRange.startDate} - ${data.dateRange.endDate}</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="card-title">Aktual (Real)</div>
                <div class="card-val" style="color: green;">${formatRp(data.income.actual)}</div>
              </div>
              <div class="card">
                <div class="card-title">Estimasi (Anggaran)</div>
                <div class="card-val" style="color: orange;">${formatRp(data.expenses.estimated)}</div>
              </div>
              <div class="card">
                <div class="card-title">Forecast (AI Trajektori)</div>
                <div class="card-val" style="color: purple;">${formatRp(data.cashFlow.forecast)}</div>
              </div>
            </div>

            <h3>Rincian Pengeluaran Utama</h3>
            <table>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Aktual</th>
                  <th>Estimasi</th>
                  <th>Forecast</th>
                </tr>
              </thead>
              <tbody>
                ${data.topCategories
                  .map(
                    (c) => `
                  <tr>
                    <td>${c.name}</td>
                    <td>${formatRp(c.actual)}</td>
                    <td>${formatRp(c.estimated)}</td>
                    <td>${formatRp(c.forecast)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Report Selection Bar */}
      <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E2B963]" />
              Pusat Laporan Keuangan Eksekutif (Report Center)
            </h3>
            <p className="text-[11px] text-gray-400">Pilih dari 10 modul laporan resmi dengan angka Aktual, Estimasi, & Forecast.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTextReport}
              className="px-3 py-1.5 rounded-xl bg-[#0B0D10] border border-white/10 text-gray-200 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#E2B963]" />
              Ekspor TXT
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-xl bg-[#E2B963] text-black text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF
            </button>
          </div>
        </div>

        {/* 10 Report Buttons Horizontal Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10">
          {reportList.map((rep) => {
            const Icon = rep.icon;
            const isSelected = selectedReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#E2B963]/15 border-[#E2B963] text-white shadow-md'
                    : 'bg-[#0B0D10] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E2B963]' : 'text-gray-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E2B963]" />}
                </div>
                <span className="text-[11px] font-bold block leading-tight line-clamp-1">{rep.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Report View Panel */}
      <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#E2B963] block">
              Modul Laporan Terpilih
            </span>
            <h3 className="text-base font-black text-white">{activeReportInfo.title}</h3>
            <p className="text-xs text-gray-400">{activeReportInfo.desc}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Periode Evaluasi</span>
            <span className="text-xs font-mono font-bold text-[#E2B963]">
              {data.dateRange.startDate} - {data.dateRange.endDate}
            </span>
          </div>
        </div>

        {/* Triple Pillar Summary Cards (Aktual, Estimasi, Forecast) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Actual Card */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> AKTUAL (REAL)
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                100% Terverifikasi
              </span>
            </div>
            <p className="text-lg font-black text-white">
              {selectedReport === 'income-report' && formatRp(data.income.actual)}
              {selectedReport === 'expense-report' && formatRp(data.expenses.actual)}
              {selectedReport === 'cashflow-report' && formatRp(data.cashFlow.actual)}
              {selectedReport === 'budget-report' && formatRp(data.expenses.actual)}
              {selectedReport === 'goal-report' && formatRp(data.goals.actualSavedThisPeriod)}
              {selectedReport === 'debt-report' && formatRp(data.debt.actualPaidThisPeriod)}
              {selectedReport === 'networth-report' && formatRp(data.netWorth.actual)}
              {(selectedReport === 'monthly-overview' || selectedReport === 'investment-report' || selectedReport === 'ai-financial-report') &&
                formatRp(data.cashFlow.actual)}
            </p>
            <p className="text-[10px] text-gray-300">Data nyata berdasarkan pencatatan transaksi & akun.</p>
          </div>

          {/* Estimated Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ESTIMASI (TARGET)
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                Patokan Plan
              </span>
            </div>
            <p className="text-lg font-black text-white">
              {selectedReport === 'income-report' && formatRp(data.income.estimated)}
              {selectedReport === 'expense-report' && formatRp(data.expenses.estimated)}
              {selectedReport === 'cashflow-report' && formatRp(data.cashFlow.estimated)}
              {selectedReport === 'budget-report' && formatRp(data.expenses.estimated)}
              {selectedReport === 'goal-report' && formatRp(data.goals.estimatedSavedThisPeriod)}
              {selectedReport === 'debt-report' && formatRp(data.debt.estimatedPaidThisPeriod)}
              {selectedReport === 'networth-report' && formatRp(data.netWorth.estimated)}
              {(selectedReport === 'monthly-overview' || selectedReport === 'investment-report' || selectedReport === 'ai-financial-report') &&
                formatRp(data.cashFlow.estimated)}
            </p>
            <p className="text-[10px] text-gray-300">Target berdasarkan limit anggaran & komitmen rutin.</p>
          </div>

          {/* Forecast Card */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> FORECAST (PROYEKSI)
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                Model AI Velocity
              </span>
            </div>
            <p className="text-lg font-black text-white">
              {selectedReport === 'income-report' && formatRp(data.income.forecast)}
              {selectedReport === 'expense-report' && formatRp(data.expenses.forecast)}
              {selectedReport === 'cashflow-report' && formatRp(data.cashFlow.forecast)}
              {selectedReport === 'budget-report' && formatRp(data.expenses.forecast)}
              {selectedReport === 'goal-report' && formatRp(data.goals.forecastSavedThisPeriod)}
              {selectedReport === 'debt-report' && formatRp(data.debt.forecastPaidThisPeriod)}
              {selectedReport === 'networth-report' && formatRp(data.netWorth.forecast)}
              {(selectedReport === 'monthly-overview' || selectedReport === 'investment-report' || selectedReport === 'ai-financial-report') &&
                formatRp(data.cashFlow.forecast)}
            </p>
            <p className="text-[10px] text-gray-300">Proyeksi matematika akhir periode berdasarkan laju harian.</p>
          </div>
        </div>

        {/* Detailed Content Table/Breakdown based on active report */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Rincian Detail Transaksional & Sub-Modul
          </h4>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0B0D10] text-[11px] font-bold text-gray-400 uppercase border-b border-white/10">
                <tr>
                  <th className="p-3">Komponen / Item</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-emerald-400">Aktual (Real)</th>
                  <th className="p-3 text-amber-400">Estimasi (Plan)</th>
                  <th className="p-3 text-purple-400">Forecast (AI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#14171E]">
                {data.topCategories.slice(0, 6).map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-white">{cat.name}</td>
                    <td className="p-3 text-gray-400">Pengeluaran Utama</td>
                    <td className="p-3 font-bold text-emerald-400">{formatRp(cat.actual)}</td>
                    <td className="p-3 font-medium text-amber-300">{formatRp(cat.estimated)}</td>
                    <td className="p-3 font-medium text-purple-300">{formatRp(cat.forecast)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
