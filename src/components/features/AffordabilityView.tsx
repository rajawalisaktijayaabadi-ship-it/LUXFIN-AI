import React, { useState } from 'react';
import { HelpCircle, Sparkles, AlertTriangle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';

export const AffordabilityView: React.FC = () => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'SAFE' | 'WARNING' | 'UNSAFE';
    badgeText: string;
    score: number;
    impactSummary: string;
    recoveryMonths: number;
    advicePoints: string[];
  } | null>(null);

  const state = storage.getState();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(itemPrice.replace(/[^0-9]/g, ''));
    if (!itemName || !priceNum) return;

    setIsLoading(true);
    try {
      const { netWorth } = storage.getNetWorth();
      const { income, expense } = storage.getMonthlyCashflow();
      const liquidAssets = state.accounts
        .filter((a) => a.type === 'BANK' || a.type === 'E_WALLET' || a.type === 'CASH')
        .reduce((sum, a) => sum + a.balance, 0);

      const res = await fetch('/api/ai/affordability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          price: priceNum,
          financialContext: {
            netWorth,
            monthlyIncome: income,
            monthlyExpense: expense,
            liquidAssets,
            emergencyFund: 38500000,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#E2B963]" />
          <h2 className="text-lg font-bold text-[#F7F6F2]">Analisis Mampu Beli?</h2>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          Kalkulator AI keputusan pembelian barang berdasarkan dana darurat & kas cair Anda.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#F7F6F2] mb-1">Nama Barang / Keinginan</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Contoh: iPhone 16 Pro, Laptop Gaming, Liburan Bali"
            className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#F7F6F2] mb-1">Harga Barang (Rupiah)</label>
          <input
            type="text"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="Rp 0"
            className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !itemName || !itemPrice}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs flex items-center justify-center gap-2 shadow hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menganalisis Kemampuan Finansial...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Analisis Kelayakan AI
            </>
          )}
        </button>
      </form>

      {/* RESULT DISPLAY */}
      {result && (
        <div className="p-4 rounded-2xl bg-[#14171E] border border-[#E2B963]/30 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-[#F7F6F2]">Hasil Keputusan AI</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                result.status === 'SAFE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : result.status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {result.status === 'SAFE' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : result.status === 'WARNING' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {result.badgeText}
            </span>
          </div>

          <p className="text-xs text-[#9CA3AF] leading-relaxed">{result.impactSummary}</p>

          <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 text-xs text-[#E2B963] font-semibold">
            Estimasi Waktu Mengumpulkan Kembali Dana Ini: {result.recoveryMonths} Bulan
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase">Saran Praktis:</span>
            {result.advicePoints?.map((pt, i) => (
              <p key={i} className="text-xs text-[#F7F6F2] flex items-start gap-1.5">
                <span className="text-[#E2B963]">•</span>
                <span>{pt}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
