import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Minus,
  ArrowLeftRight,
  Camera,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Wallet,
  Zap,
  Activity,
  AlertTriangle,
  Bell,
  PieChart,
  Target,
  Receipt,
  Bot,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  BarChart3,
  Scale,
  RefreshCw,
  Info,
  Building2,
  Coins
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatRpShort } from '../../utils/formatters';
import { ActiveTab } from '../common/BottomNav';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSmartAdd: (mode?: 'text' | 'ocr' | 'manual') => void;
  onOpenScanReceipt: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenSmartAdd,
  onOpenScanReceipt,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeAlertFilter, setActiveAlertFilter] = useState<'ALL' | 'CRITICAL'>('ALL');
  const state = storage.getState();

  // 1. RINGKASAN KEUANGAN CALCULATIONS
  const breakdown = storage.getNetWorthBreakdown();
  const { totalAssets, totalLiabilities, netWorth, liquidCash } = breakdown;
  
  const cashflowSummary = storage.getCashFlowSummary();
  const { totalIncome: income, totalExpense: expense, netCashFlow: netCashflow, savings, savingRatePercentage } = cashflowSummary;

  const healthScore = storage.calculateFinancialHealthScore();
  
  // Budget calculations
  const budgetUsages = storage.getBudgetUsages();
  const totalBudgetLimit = budgetUsages.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalBudgetSpent = budgetUsages.reduce((acc, b) => acc + b.spent, 0);
  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);

  // Total Liquid Saldo
  const totalSaldo = liquidCash;

  // 2. AI DAILY BRIEFING COMPUTATIONS
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat pagi 👋';
    if (hour >= 12 && hour < 15) return 'Selamat siang 👋';
    if (hour >= 15 && hour < 18) return 'Selamat sore 👋';
    return 'Selamat malam 👋';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = state.transactions.filter(
    (tx) => tx.date.startsWith(todayStr) && tx.type === 'EXPENSE' && !tx.isDeleted && tx.status === 'COMPLETED'
  );
  const todayExpenseTotal = todayTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  // Daily budget remaining logic
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailyBudgetRemaining = Math.round(totalBudgetRemaining / daysRemaining);

  // Top spending category for briefing
  const topUsedBudget = [...budgetUsages].sort((a, b) => b.usagePercentage - a.usagePercentage)[0];
  const topCategory = state.categories.find((c) => c.id === topUsedBudget?.categoryId);

  // 3. SMART ALERTS ENGINE
  const generateSmartAlerts = () => {
    const alerts = [];

    // Alert 1: Budget hampir habis
    const highBudgets = budgetUsages.filter((b) => b.usagePercentage >= 80);
    if (highBudgets.length > 0) {
      const highest = highBudgets[0];
      const cat = state.categories.find((c) => c.id === highest.categoryId);
      alerts.push({
        id: 'alert-budget',
        type: highest.usagePercentage >= 100 ? 'DANGER' : 'WARNING',
        title: 'Budget hampir habis',
        desc: `Kategori ${cat?.name || 'Utama'} terpakai ${highest.usagePercentage.toFixed(0)}% (Sisa ${formatRp(highest.remaining)}).`,
        actionText: 'Atur Budget',
        tab: 'budget' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-budget-ok',
        type: 'INFO',
        title: 'Budget Terkendali',
        desc: `Total budget terpakai ${((totalBudgetSpent / (totalBudgetLimit || 1)) * 100).toFixed(0)}% bulan ini.`,
        actionText: 'Lihat Budget',
        tab: 'budget' as ActiveTab,
      });
    }

    // Alert 2: Pengeluaran meningkat
    if (expense > income && income > 0) {
      alerts.push({
        id: 'alert-[#E2B963]',
        type: 'DANGER',
        title: 'Pengeluaran Meningkat',
        desc: `Pengeluaran bulan ini (${formatRpShort(expense)}) telah melebihi pemasukan (${formatRpShort(income)}).`,
        actionText: 'Evaluasi Cashflow',
        tab: 'analytics' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-expense-normal',
        type: 'INFO',
        title: 'Pengeluaran Stabil',
        desc: `Arus kas positif dengan surplus ${formatRpShort(netCashflow)} bulan ini.`,
        actionText: 'Lihat Grafik',
        tab: 'analytics' as ActiveTab,
      });
    }

    // Alert 3: Saldo rendah
    const lowBalanceAcc = state.accounts.find((acc) => acc.balance < 500000 && acc.type !== 'CREDIT_CARD');
    if (lowBalanceAcc) {
      alerts.push({
        id: 'alert-low-balance',
        type: 'WARNING',
        title: 'Saldo Rendah',
        desc: `Akun ${lowBalanceAcc.name} tersisa ${formatRp(lowBalanceAcc.balance)} (di bawah batas aman Rp500rb).`,
        actionText: 'Top Up / Transfer',
        tab: 'accounts' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-balance-safe',
        type: 'INFO',
        title: 'Saldo Likuid Aman',
        desc: `Seluruh dompet & rekening berada dalam kondisi saldo sehat.`,
        actionText: 'Lihat Akun',
        tab: 'accounts' as ActiveTab,
      });
    }

    // Alert 4: Tagihan mendekat
    const upcomingBills = storage.getUpcomingBills(7);
    if (upcomingBills.length > 0) {
      const bill = upcomingBills[0];
      alerts.push({
        id: 'alert-bill-due',
        type: 'WARNING',
        title: 'Tagihan Mendekat',
        desc: `${bill.name} (${formatRp(bill.amount)}) jatuh tempo ${bill.daysUntilDue === 0 ? 'hari ini' : `${bill.daysUntilDue} hari lagi`}.`,
        actionText: 'Bayar Sekarang',
        tab: 'bills' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-bill-clear',
        type: 'INFO',
        title: 'Tagihan Terjadwal',
        desc: `Tidak ada tagihan mendesak dalam 7 hari ke depan.`,
        actionText: 'Daftar Tagihan',
        tab: 'bills' as ActiveTab,
      });
    }

    // Alert 5: Goal terlambat
    const activeGoals = state.goals.filter((g) => !g.isArchived);
    const slowGoal = activeGoals.find((g) => (g.currentAmount / g.targetAmount) < 0.3);
    if (slowGoal) {
      alerts.push({
        id: 'alert-goal-slow',
        type: 'WARNING',
        title: 'Goal Perlu Alokasi',
        desc: `Target "${slowGoal.title}" baru tercapai ${((slowGoal.currentAmount / slowGoal.targetAmount) * 100).toFixed(0)}%.`,
        actionText: 'Tambah Tabungan',
        tab: 'goals' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-goal-on-track',
        type: 'INFO',
        title: 'Goal Berjalan Lancar',
        desc: `Progres target impian Anda berjalan sesuai estimasi alokasi.`,
        actionText: 'Lihat Impian',
        tab: 'goals' as ActiveTab,
      });
    }

    // Alert 6: Transaksi abnormal
    const largeTx = state.transactions.find(
      (tx) => tx.type === 'EXPENSE' && tx.amount >= 1500000 && !tx.isDeleted
    );
    if (largeTx) {
      alerts.push({
        id: 'alert-abnormal-tx',
        type: 'WARNING',
        title: 'Transaksi Abnormal',
        desc: `Terdeteksi pengeluaran besar ${formatRp(largeTx.amount)} pada ${largeTx.vendor || largeTx.notes || 'transaksi'}.`,
        actionText: 'Periksa Transaksi',
        tab: 'transactions' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-tx-normal',
        type: 'INFO',
        title: 'Pola Transaksi Normal',
        desc: `Tidak ditemukan transaksi tidak wajar dalam riwayat terbaru.`,
        actionText: 'Semua Transaksi',
        tab: 'transactions' as ActiveTab,
      });
    }

    // Alert 7: Saving rate turun
    if (savingRatePercentage < 20) {
      alerts.push({
        id: 'alert-saving-low',
        type: 'WARNING',
        title: 'Saving Rate Turun',
        desc: `Rasio tabungan bulan ini ${savingRatePercentage.toFixed(1)}% (Di bawah target ideal 20%).`,
        actionText: 'Tingkatkan Tabungan',
        tab: 'analytics' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-saving-good',
        type: 'INFO',
        title: 'Saving Rate Ideal',
        desc: `Rasio tabungan Anda ${savingRatePercentage.toFixed(1)}% melampaui standar finansial.`,
        actionText: 'Analisis Tabungan',
        tab: 'analytics' as ActiveTab,
      });
    }

    // Alert 8: Debt payment mendekat
    const activeDebts = state.debts.filter((d) => !d.isCleared && d.type === 'DEBT_OWED');
    if (activeDebts.length > 0) {
      const debt = activeDebts[0];
      alerts.push({
        id: 'alert-debt-near',
        type: 'WARNING',
        title: 'Debt Payment Mendekat',
        desc: `Cicilan ${debt.personOrInstitution} (Sisa ${formatRp(debt.remainingAmount)}) perlu dialokasikan.`,
        actionText: 'Kelola Utang',
        tab: 'debt' as ActiveTab,
      });
    } else {
      alerts.push({
        id: 'alert-debt-clear',
        type: 'INFO',
        title: 'Bebas Pinjaman',
        desc: `Portofolio utang dalam kondisi terkontrol & terkelola.`,
        actionText: 'Laporan Utang',
        tab: 'debt' as ActiveTab,
      });
    }

    return alerts;
  };

  const smartAlerts = generateSmartAlerts();
  const criticalCount = smartAlerts.filter((a) => a.type === 'DANGER' || a.type === 'WARNING').length;

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-300">
      
      {/* 1. AI DAILY BRIEFING BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E2330] via-[#14171E] to-[#1A1E29] border border-[#E2B963]/30 p-5 shadow-2xl space-y-3">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#E2B963]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E2B963] to-[#B8860B] flex items-center justify-center text-black shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-white">{getGreeting()}</span>
              <span className="text-[9px] text-[#E2B963] block font-mono font-bold uppercase tracking-wider">
                AI DAILY BRIEFING
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#E2B963] bg-[#E2B963]/10 border border-[#E2B963]/30 px-3 py-1.5 rounded-xl hover:bg-[#E2B963]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tanya LUX AI</span>
          </button>
        </div>

        {/* Dynamic Briefing Bullet List */}
        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-[#F7F6F2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B963] mt-1.5 shrink-0" />
            <p>
              Hari ini pengeluaran Anda <span className="font-bold text-[#E2B963] font-mono">{formatRp(todayExpenseTotal)}</span>.
            </p>
          </div>

          <div className="flex items-start gap-2 text-[#F7F6F2]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p>
              Anda masih memiliki budget harian aman sebesar{' '}
              <span className="font-bold text-emerald-400 font-mono">{formatRp(dailyBudgetRemaining)}</span>.
            </p>
          </div>

          {topUsedBudget && (
            <div className="flex items-start gap-2 text-[#F7F6F2]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <p>
                Pengeluaran <span className="font-bold text-white">{topCategory?.name || 'Utama'}</span> bulan ini sudah mencapai{' '}
                <span className="font-bold text-amber-400 font-mono">{topUsedBudget.usagePercentage.toFixed(0)}%</span> budget.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. RINGKASAN KEUANGAN (FINANCIAL SUMMARY) GRID */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#E2B963]" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">Ringkasan Keuangan Utama</h2>
          </div>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-white transition-colors"
          >
            {hideBalance ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#E2B963]" />
                <span>Tampilkan</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>Sembunyikan</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Hero Card: Net Worth */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#191D27] to-[#14171E] border-2 border-[#E2B963]/40 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">NET WORTH (KEKAYAAN BERSIH)</span>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                {hideBalance ? 'Rp ••••••••••' : formatRp(netWorth)}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#E2B963]/15 text-[#E2B963] border border-[#E2B963]/30">
              <Scale className="w-6 h-6" />
            </div>
          </div>

          {/* 4 Core Summary Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Total Saldo Likuid</span>
              <p className="font-bold text-white font-mono text-sm">{hideBalance ? 'Rp •••••••' : formatRp(totalSaldo)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Total Aset</span>
              <p className="font-bold text-emerald-400 font-mono text-sm">{hideBalance ? 'Rp •••••••' : formatRp(totalAssets)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Total Utang & Kewajiban</span>
              <p className="font-bold text-red-400 font-mono text-sm">{hideBalance ? 'Rp •••••••' : formatRp(totalLiabilities)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Financial Health Score</span>
              <p className="font-bold text-[#E2B963] font-mono text-sm flex items-center gap-1">
                {healthScore.score} / 100
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-black">
                  Gred {healthScore.grade}
                </span>
              </p>
            </div>
          </div>

          {/* Cashflow & Budget Operational Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 border-t border-white/10 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Pemasukan Bulan Ini</span>
              <p className="font-bold text-emerald-400 font-mono">{hideBalance ? 'Rp ••••••' : formatRp(income)}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Pengeluaran Bulan Ini</span>
              <p className="font-bold text-red-400 font-mono">{hideBalance ? 'Rp ••••••' : formatRp(expense)}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Cash Flow (Arus Kas)</span>
              <p className={`font-bold font-mono ${netCashflow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {hideBalance ? 'Rp ••••••' : formatRp(netCashflow)}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Total Tabungan</span>
              <p className="font-bold text-[#E2B963] font-mono">{hideBalance ? 'Rp ••••••' : formatRp(savings)}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Saving Rate</span>
              <p className="font-bold text-emerald-400 font-mono">{savingRatePercentage.toFixed(1)}%</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-[#9CA3AF]">Budget Terpakai / Sisa</span>
              <p className="font-bold text-white font-mono text-[11px]">
                {hideBalance ? 'Rp ••• / Rp •••' : `${formatRpShort(totalBudgetSpent)} / ${formatRpShort(totalBudgetRemaining)}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E2B963]" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">Quick Actions (Aksi Cepat)</h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {/* Action 1: Tambah Pemasukan */}
          <button
            onClick={() => onOpenSmartAdd('manual')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-emerald-500/20 hover:border-emerald-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Tambah Pemasukan</span>
          </button>

          {/* Action 2: Tambah Pengeluaran */}
          <button
            onClick={() => onOpenSmartAdd('manual')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-red-500/20 hover:border-red-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 group-hover:scale-110 transition-transform">
              <Minus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Tambah Pengeluaran</span>
          </button>

          {/* Action 3: Transfer */}
          <button
            onClick={() => onOpenSmartAdd('manual')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-blue-500/20 hover:border-blue-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Transfer Saldo</span>
          </button>

          {/* Action 4: Scan Struk */}
          <button
            onClick={onOpenScanReceipt}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-purple-500/20 hover:border-purple-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Scan Struk OCR</span>
          </button>

          {/* Action 5: Tambah Budget */}
          <button
            onClick={() => setActiveTab('budget')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-amber-500/20 hover:border-amber-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Tambah Budget</span>
          </button>

          {/* Action 6: Tambah Goal */}
          <button
            onClick={() => setActiveTab('goals')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-emerald-500/20 hover:border-emerald-500 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Tambah Goal</span>
          </button>

          {/* Action 7: Tambah Tagihan */}
          <button
            onClick={() => setActiveTab('bills')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-[#E2B963]/20 hover:border-[#E2B963] active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-[#E2B963]/15 text-[#E2B963] group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Tambah Tagihan</span>
          </button>

          {/* Action 8: Tanya AI */}
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#14171E] border border-[#E2B963]/30 hover:border-[#E2B963] active:scale-95 transition-all text-center group cursor-pointer shadow-lg shadow-[#E2B963]/10"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] text-black group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[#E2B963] leading-tight">Tanya AI</span>
          </button>
        </div>
      </section>

      {/* 4. SMART ALERTS PANEL (8 INTELLIGENT ALERT CATEGORIES) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#E2B963]" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              Smart Alerts Intelligence
              {criticalCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {criticalCount} PERHATIAN
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setActiveAlertFilter('ALL')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                activeAlertFilter === 'ALL' ? 'bg-[#E2B963] text-black' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Semua ({smartAlerts.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {smartAlerts.map((alert) => {
            const isDanger = alert.type === 'DANGER';
            const isWarning = alert.type === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDanger
                    ? 'bg-red-500/10 border-red-500/30'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#14171E] border-white/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isDanger
                        ? 'bg-red-500/20 text-red-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {isDanger || isWarning ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {alert.title}
                      {isDanger && <span className="text-[9px] bg-red-500/30 text-red-400 px-1.5 rounded font-mono">CRITICAL</span>}
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{alert.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab(alert.tab)}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#E2B963] border border-[#E2B963]/20 shrink-0 self-center transition-all cursor-pointer"
                >
                  {alert.actionText}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RECENT TRANSACTIONS PREVIEW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E2B963]" />
            Transaksi Terakhir
          </h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-[#E2B963] hover:underline font-bold"
          >
            Lihat Semua ({state.transactions.length})
          </button>
        </div>

        <div className="space-y-2">
          {state.transactions.slice(0, 5).map((tx) => {
            const isExpense = tx.type === 'EXPENSE';
            const isIncome = tx.type === 'INCOME';

            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-[#E2B963]/30 transition-all cursor-pointer"
                onClick={() => setActiveTab('transactions')}
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
                    className={`text-xs font-bold font-mono ${
                      isIncome ? 'text-emerald-400' : isExpense ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''} {formatRp(tx.amount)}
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] uppercase font-mono">{tx.accountId.replace('acc_', '')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
