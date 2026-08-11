import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  PlusCircle, 
  Camera, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  ChevronRight,
  Wallet,
  Zap,
  Activity
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';
import { ActiveTab } from '../common/BottomNav';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSmartAdd: () => void;
  onOpenScanReceipt: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenSmartAdd,
  onOpenScanReceipt,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const state = storage.getState();

  const { totalAssets, totalLiabilities, netWorth } = storage.getNetWorth();
  const { income, expense, netCashflow } = storage.getMonthlyCashflow();
  const healthScore = storage.calculateFinancialHealthScore();
  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <div className="p-4 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Net Worth Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1E2330] to-[#14171E] border border-[#E2B963]/30 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#E2B963]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1">
          <span className="uppercase tracking-wider font-medium text-[10px]">Total Kekayaan Bersih (Net Worth)</span>
          <button 
            onClick={() => setHideBalance(!hideBalance)}
            className="p-1 hover:text-white transition-colors"
          >
            {hideBalance ? <EyeOff className="w-4 h-4 text-[#E2B963]" /> : <Eye className="w-4 h-4 text-[#9CA3AF]" />}
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F7F6F2]">
            {hideBalance ? 'Rp ••••••••••' : formatRp(netWorth)}
          </h1>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +4.2%
          </span>
        </div>

        {/* Assets vs Liabilities Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          <div>
            <p className="text-[10px] text-[#9CA3AF]">Total Aset (Kas + Investasi)</p>
            <p className="font-bold text-[#F7F6F2]">
              {hideBalance ? 'Rp •••••••' : formatRp(totalAssets)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF]">Total Liabilitas (Utang)</p>
            <p className="font-bold text-red-400">
              {hideBalance ? 'Rp •••••••' : formatRp(totalLiabilities)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onOpenSmartAdd}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#14171E] border border-[#E2B963]/20 hover:border-[#E2B963] active:scale-95 transition-all text-center"
        >
          <div className="p-2 rounded-xl bg-[#E2B963]/15 text-[#E2B963]">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-[#F7F6F2]">Smart Input</span>
        </button>

        <button
          onClick={onOpenScanReceipt}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#14171E] border border-white/5 hover:border-white/20 active:scale-95 transition-all text-center"
        >
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-[#F7F6F2]">Scan Struk</span>
        </button>

        <button
          onClick={() => setActiveTab('affordability')}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#14171E] border border-white/5 hover:border-white/20 active:scale-95 transition-all text-center"
        >
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-[#F7F6F2]">Mampu Beli?</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#14171E] border border-emerald-500/20 hover:border-emerald-500 active:scale-95 transition-all text-center"
        >
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-[#F7F6F2]">LUX AI</span>
        </button>
      </div>

      {/* Monthly Cashflow Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF] text-[10px]">
            <span>Pemasukan Bulan Ini</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold text-emerald-400">
            {hideBalance ? 'Rp ••••••' : formatRp(income)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF] text-[10px]">
            <span>Pengeluaran Bulan Ini</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-base font-bold text-red-400">
            {hideBalance ? 'Rp ••••••' : formatRp(expense)}
          </p>
        </div>
      </div>

      {/* AI Financial Health Score Gauge Banner */}
      <div 
        onClick={() => setActiveTab('analytics')}
        className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1A1F2B] to-[#14171E] border border-[#E2B963]/30 hover:border-[#E2B963] transition-all flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center text-[#E2B963] font-black text-sm">
              {healthScore.score}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#F7F6F2]">Skor Kesehatan Finansial</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-black">
                Gred {healthScore.grade}
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] line-clamp-1">{healthScore.summary}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#E2B963]" />
      </div>

      {/* AI Daily Insight Banner */}
      <div className="p-3.5 rounded-2xl bg-[#1A1E27] border border-emerald-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-400">Rekomendasi Pintar Hari Ini</span>
            <span className="text-[9px] text-[#9CA3AF]">LUX AI</span>
          </div>
          <p className="text-[#9CA3AF] text-[11px]">
            {healthScore.recommendations[0]}
          </p>
        </div>
      </div>

      {/* DASHBOARD WIDGETS: UPCOMING BILLS, BUDGET ALERTS, GOAL PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Widget 1: Upcoming Bills & Subscriptions */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#F7F6F2] tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Tagihan & Langganan Jatuh Tempo
            </h4>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-[11px] text-[#E2B963] hover:underline font-semibold"
            >
              Lihat Semua ({state.bills.length})
            </button>
          </div>

          {storage.getUpcomingBills(14).length === 0 && storage.getUpcomingSubscriptions(14).length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">Tidak ada tagihan jatuh tempo dalam 14 hari ke depan.</p>
          ) : (
            <div className="space-y-2">
              {[...storage.getUpcomingBills(14), ...storage.getUpcomingSubscriptions(14)].slice(0, 3).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-gray-400">
                      Jatuh tempo tgl {item.dueDateDay} ({item.daysUntilDue === 0 ? 'Hari ini' : `${item.daysUntilDue} hari lagi`})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#E2B963]">{formatRp(item.amount)}</span>
                    <button
                      onClick={() => {
                        storage.payBill(item.id);
                        alert(`Tagihan "${item.name}" berhasil dibayar!`);
                      }}
                      className="px-2 py-1 rounded bg-emerald-500 text-black font-extrabold text-[10px]"
                    >
                      Bayar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget 2: Goal Progress Snapshot */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#F7F6F2] tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Progres Target Impian
            </h4>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-[11px] text-[#E2B963] hover:underline font-semibold"
            >
              Kelola ({state.goals.length})
            </button>
          </div>

          {state.goals.filter((g) => !g.isArchived).length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">Belum ada target impian aktif.</p>
          ) : (
            <div className="space-y-2.5">
              {state.goals.filter((g) => !g.isArchived).slice(0, 2).map((goal) => {
                const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{goal.title}</span>
                      <span className="text-[#E2B963] font-bold">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0B0D10] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#E2B963] to-emerald-400" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{formatRp(goal.currentAmount)}</span>
                      <span>Target: {formatRp(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F7F6F2] tracking-wider uppercase">Transaksi Terakhir</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#E2B963] hover:underline font-medium"
          >
            Lihat Semua
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => {
            const isExpense = tx.type === 'EXPENSE';
            const isIncome = tx.type === 'INCOME';

            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isExpense
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F7F6F2]">
                      {tx.vendor || tx.notes || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">{tx.date} • {tx.subcategory || tx.type}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      isIncome ? 'text-emerald-400' : isExpense ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''} {formatRp(tx.amount)}
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] uppercase">{tx.accountId.replace('acc_', '')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
