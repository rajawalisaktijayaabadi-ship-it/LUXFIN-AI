import React from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Target,
  ArrowRight,
  HelpCircle,
  MessageSquarePlus,
  PieChart,
  CreditCard,
  DollarSign,
  Briefcase,
  AlertTriangle,
  History,
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { FinancialContextBuilder } from '../../services/financialContextBuilder';

interface AILandingScreenProps {
  onSelectPrompt: (promptText: string) => void;
  onNewChat: () => void;
  onOpenHistory: () => void;
}

export const AILandingScreen: React.FC<AILandingScreenProps> = ({
  onSelectPrompt,
  onNewChat,
  onOpenHistory,
}) => {
  const context = FinancialContextBuilder.buildContext();
  const healthScore = storage.calculateFinancialHealthScore();

  const suggestedQuestions = [
    {
      category: '💸 Analisis Pengeluaran',
      items: [
        'Kenapa pengeluaran saya naik?',
        'Apakah saya terlalu boros?',
        'Berapa budget makanan saya?',
      ],
    },
    {
      category: '🎯 Tabungan & Dana Darurat',
      items: [
        'Saya ingin menabung Rp20 juta dalam 8 bulan.',
        'Berapa dana darurat ideal saya?',
      ],
    },
    {
      category: '💻 Kelayakan Pembelian',
      items: [
        'Apakah saya mampu membeli laptop Rp15 juta?',
      ],
    },
    {
      category: '💳 Utang & Evaluasi Bulanan',
      items: [
        'Bagaimana cara melunasi utang saya?',
        'Analisis keuangan saya bulan ini.',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161B26] via-[#12151D] to-[#0D0F14] border border-[#E2B963]/30 p-6 text-white shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2B963]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] flex items-center justify-center text-black font-black text-sm shadow-md">
                LX
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#F7F6F2]">
                  LUX AI Money Copilot
                </h1>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 3.6 Flash • Asisten Keuangan Personal Realtime
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenHistory}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-colors"
                title="Riwayat Percakapan"
              >
                <History className="w-4 h-4 text-[#E2B963]" />
                <span className="hidden sm:inline">Riwayat</span>
              </button>

              <button
                onClick={onNewChat}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Chat Baru</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
            Tanyakan analisis arus kas, simulasi kelayakan pembelian, rekomendasi strategi utang, hingga pembuatan budget otomatis menggunakan bahasa Indonesia alami.
          </p>

          {/* Context Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-[#1C202B]/80 border border-white/10">
              <span className="text-[10px] text-gray-400 block mb-0.5">Skor Kesehatan</span>
              <div className="text-sm font-black text-[#E2B963] flex items-center gap-1">
                {healthScore.score}/100 <span className="text-[10px] text-emerald-400 font-bold">({healthScore.grade})</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1C202B]/80 border border-white/10">
              <span className="text-[10px] text-gray-400 block mb-0.5">Net Worth</span>
              <div className="text-xs font-bold text-white truncate">
                Rp {context.netWorthSummary.netWorth.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1C202B]/80 border border-white/10">
              <span className="text-[10px] text-gray-400 block mb-0.5">Cashflow Bulanan</span>
              <div className={`text-xs font-bold truncate ${context.cashflowSummary.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rp {context.cashflowSummary.netCashflow.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#E2B963] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Kartu Wawasan & Analisis Cepat AI
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onSelectPrompt('Analisis keuangan saya bulan ini.')}
            className="p-4 rounded-2xl bg-[#14171E] border border-white/10 hover:border-[#E2B963]/50 text-left transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#E2B963]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#E2B963] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#E2B963]">Review Keuangan Bulanan</h3>
              <p className="text-[11px] text-gray-400 mt-1">Evaluasi arus kas, rasio tabungan, dan top 3 pengeluaran terbesar.</p>
            </div>
          </button>

          <button
            onClick={() => onSelectPrompt('Berapa dana darurat ideal saya?')}
            className="p-4 rounded-2xl bg-[#14171E] border border-white/10 hover:border-[#E2B963]/50 text-left transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400">Kebutuhan Dana Darurat</h3>
              <p className="text-[11px] text-gray-400 mt-1">Kalkulasi simulasi tabungan 6x pengeluaran bulanan berdasarkan data Anda.</p>
            </div>
          </button>

          <button
            onClick={() => onSelectPrompt('Bagaimana cara melunasi utang saya?')}
            className="p-4 rounded-2xl bg-[#14171E] border border-white/10 hover:border-[#E2B963]/50 text-left transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-400">Strategi Pelunasan Utang</h3>
              <p className="text-[11px] text-gray-400 mt-1">Analisis perbandingan metode Avalanche vs Snowball untuk efisiensi beban bunga.</p>
            </div>
          </button>

          <button
            onClick={() => onSelectPrompt('Kenapa pengeluaran saya naik?')}
            className="p-4 rounded-2xl bg-[#14171E] border border-white/10 hover:border-[#E2B963]/50 text-left transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <PieChart className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400">Deteksi Lonjakan Pengeluaran</h3>
              <p className="text-[11px] text-gray-400 mt-1">Identifikasi kategori yang membengkak dibanding bulan sebelumnya.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#E2B963]" /> Rekomendasi Pertanyaan Finansial
        </h2>

        <div className="space-y-4">
          {suggestedQuestions.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-300">{cat.category}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => onSelectPrompt(q)}
                    className="px-3.5 py-2 rounded-2xl bg-[#14171E] border border-white/10 hover:border-[#E2B963] text-xs font-medium text-gray-200 hover:text-white hover:bg-[#1A1F2B] transition-all text-left flex items-center gap-2 group"
                  >
                    <span>"{q}"</span>
                    <ArrowRight className="w-3 h-3 text-[#E2B963] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
