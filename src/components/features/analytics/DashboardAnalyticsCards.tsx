import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Percent,
  FolderOpen,
  Store,
  Wallet,
  Building,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsEngineData } from '../../../utils/analyticsEngine';
import { formatRp } from '../../../utils/formatters';

interface DashboardAnalyticsCardsProps {
  data: AnalyticsEngineData;
}

export const DashboardAnalyticsCards: React.FC<DashboardAnalyticsCardsProps> = ({ data }) => {
  const {
    income,
    expenses,
    cashFlow,
    savings,
    savingsRate,
    topCategories,
    topMerchants,
    accountBalances,
    netWorth,
    debt,
    goals,
  } = data;

  return (
    <div className="space-y-4">
      {/* Top 5 Key Metric Pillars (Income, Expenses, Cash Flow, Savings, Savings Rate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Income */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-emerald-500/30 space-y-2.5 shadow-md hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">1. Pemasukan (Income)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Aktual: {formatRp(income.actual)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Aktual Terlibat:
              </span>
              <span className="font-bold text-white">{formatRp(income.actual)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                Estimasi Rutin:
              </span>
              <span className="font-semibold text-amber-300">{formatRp(income.estimated)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Forecast Akhir Periode:
              </span>
              <span className="font-semibold text-purple-300">{formatRp(income.forecast)}</span>
            </div>
          </div>
        </div>

        {/* 2. Expenses */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-red-500/30 space-y-2.5 shadow-md hover:border-red-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">2. Pengeluaran (Expenses)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              Aktual: {formatRp(expenses.actual)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Aktual Terjadi:
              </span>
              <span className="font-bold text-white">{formatRp(expenses.actual)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                Estimasi Limit Anggaran:
              </span>
              <span className="font-semibold text-amber-300">{formatRp(expenses.estimated)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Forecast Laju Belanja:
              </span>
              <span className="font-semibold text-purple-300">{formatRp(expenses.forecast)}</span>
            </div>
          </div>
        </div>

        {/* 3. Cash Flow */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-blue-500/30 space-y-2.5 shadow-md hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">3. Arus Kas Bersih (Cash Flow)</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                cashFlow.actual >= 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              Surplus: {formatRp(cashFlow.actual)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Aktual Cash Flow:
              </span>
              <span className={`font-bold ${cashFlow.actual >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatRp(cashFlow.actual)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                Estimasi Target:
              </span>
              <span className="font-semibold text-amber-300">{formatRp(cashFlow.estimated)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Forecast Tren AI:
              </span>
              <span className="font-semibold text-purple-300">{formatRp(cashFlow.forecast)}</span>
            </div>
          </div>
        </div>

        {/* 4. Savings */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-[#E2B963]/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E2B963]/10 text-[#E2B963]">
                <PiggyBank className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">4. Tabungan & Akumulasi (Savings)</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Aktual Tersimpan:</span>
              <span className="font-bold text-[#E2B963]">{formatRp(savings.actual)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Estimasi Target:</span>
              <span className="font-semibold text-amber-300">{formatRp(savings.estimated)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Forecast Akhir Tahun:</span>
              <span className="font-semibold text-purple-300">{formatRp(savings.forecast)}</span>
            </div>
          </div>
        </div>

        {/* 5. Savings Rate */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-cyan-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Percent className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">5. Rasio Tabungan (Saving Rate)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {savingsRate.actual.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Aktual Ratio:</span>
              <span className="font-bold text-cyan-400">{savingsRate.actual.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Estimasi Standar:</span>
              <span className="font-semibold text-amber-300">{savingsRate.estimated.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Forecast Potensi:</span>
              <span className="font-semibold text-purple-300">{savingsRate.forecast.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 6. Net Worth Summary */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-indigo-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-200">6. Kekayaan Bersih (Net Worth)</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Aktual Net Worth:</span>
              <span className="font-bold text-indigo-300">{formatRp(netWorth.actual)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Estimasi Akhir Bulan:</span>
              <span className="font-semibold text-amber-300">{formatRp(netWorth.estimated)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[11px]">Forecast 6 Bulan:</span>
              <span className="font-semibold text-purple-300">{formatRp(netWorth.forecast)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Top Categories, Top Merchants, Account Balances, Debt, Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 7. Top Categories */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#E2B963]" />
              <h4 className="text-xs font-bold text-white">7. Top Kategori Pengeluaran</h4>
            </div>
            <span className="text-[10px] text-gray-400">Total: {topCategories.length} Kategori</span>
          </div>

          {topCategories.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Belum ada transaksi pada periode ini.</p>
          ) : (
            <div className="space-y-2.5">
              {topCategories.slice(0, 4).map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-200">{cat.name}</span>
                    <span className="font-bold text-white">
                      {formatRp(cat.actual)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, cat.percentage)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Estimasi Budget: {cat.estimated > 0 ? formatRp(cat.estimated) : '-'}</span>
                    <span>Forecast: {formatRp(cat.forecast)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Top Merchants */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">8. Top Merchant & Vendor</h4>
            </div>
            <span className="text-[10px] text-gray-400">Pengeluaran Terbesar</span>
          </div>

          {topMerchants.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Belum ada data merchant.</p>
          ) : (
            <div className="space-y-2">
              {topMerchants.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{m.merchant}</span>
                    <span className="text-[10px] text-gray-400">
                      {m.categoryName} • {m.transactionCount} Transaksi
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-400 block">{formatRp(m.actualAmount)}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      Aktual
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. Account Balances */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white">9. Saldo Akun & Rekening</h4>
            </div>
            <span className="text-xs font-bold text-blue-400">{formatRp(accountBalances.totalBalance)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5">
              <span className="text-[10px] text-gray-400">Bank & Deposito</span>
              <p className="font-bold text-white mt-0.5">{formatRp(accountBalances.byType.BANK)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5">
              <span className="text-[10px] text-gray-400">E-Wallet (Gopay/OVO)</span>
              <p className="font-bold text-white mt-0.5">{formatRp(accountBalances.byType.E_WALLET)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5">
              <span className="text-[10px] text-gray-400">Kas Tunai</span>
              <p className="font-bold text-white mt-0.5">{formatRp(accountBalances.byType.CASH)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5">
              <span className="text-[10px] text-gray-400">Aset Investasi</span>
              <p className="font-bold text-purple-400 mt-0.5">{formatRp(accountBalances.byType.INVESTMENT)}</p>
            </div>
          </div>
        </div>

        {/* 10. Debt & 11. Goals */}
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Debt */}
            <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  10. Utang & Liabilitas
                </span>
              </div>
              <p className="text-sm font-bold text-purple-400">{formatRp(debt.totalDebt)}</p>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div>Aktual Bayar: {formatRp(debt.actualPaidThisPeriod)}</div>
                <div>Estimasi Minimal: {formatRp(debt.monthlyMinPayment)}</div>
                <div>Forecast Bebas Utang: 6-12 Bln</div>
              </div>
            </div>

            {/* Goals */}
            <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#E2B963]" />
                  11. Target Keuangan
                </span>
                <span className="text-[10px] text-[#E2B963] font-bold">
                  {goals.progressPercentage.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm font-bold text-[#E2B963]">{formatRp(goals.totalCurrent)}</p>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div>Target Total: {formatRp(goals.totalTarget)}</div>
                <div>Aktual Nabung: {formatRp(goals.actualSavedThisPeriod)}</div>
                <div>Forecast Tercapai: 4-8 Bln</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
