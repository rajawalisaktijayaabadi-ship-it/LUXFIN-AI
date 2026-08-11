import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Edit2, 
  Plus, 
  Check, 
  X, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Trash2,
  Sliders,
  BellRing
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';
import { BudgetPeriodType } from '../../types';

export const BudgetView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriodType | 'ALL'>('ALL');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [inputLimit, setInputLimit] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New budget state
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newPeriodType, setNewPeriodType] = useState<BudgetPeriodType>('MONTHLY');
  const [newCustomName, setNewCustomName] = useState('');

  const state = storage.getState();
  const budgets = state.budgets;
  const categories = state.categories.filter((c) => c.type === 'EXPENSE');

  // Calculated Usages
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const budgetUsages = storage.getBudgetUsages(currentMonthStr);
  const overspendingAlerts = storage.getOverspendingAlerts();

  // Summary Metrics
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingTotal = Math.max(0, totalBudgetLimit - totalSpent);
  const overallPercentage = totalBudgetLimit > 0 ? (totalSpent / totalBudgetLimit) * 100 : 0;

  const handleSaveCategoryLimit = (catId: string) => {
    const val = parseFloat(inputLimit.replace(/[^0-9]/g, ''));
    if (!isNaN(val) && val >= 0) {
      storage.updateBudget(catId, val);
    }
    setEditingCategoryId(null);
  };

  const handleCreateBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryId) return;
    const val = parseFloat(newLimit.replace(/[^0-9]/g, ''));
    if (isNaN(val) || val <= 0) return;

    storage.createBudget({
      userId: state.user.id || 'usr_01',
      categoryId: newCategoryId,
      monthlyLimit: val,
      period: currentMonthStr,
      periodType: newPeriodType,
      name: newCustomName || undefined,
    });

    setIsModalOpen(false);
    setNewCategoryId('');
    setNewLimit('');
    setNewCustomName('');
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
      storage.deleteBudget(budgetId);
    }
  };

  const handleApplyAIBudgets = () => {
    const { income } = storage.getMonthlyCashflow();
    const baseIncome = income > 0 ? income : 15000000;

    storage.updateBudget('cat_exp_food', Math.round(baseIncome * 0.25)); // 25% Makanan
    storage.updateBudget('cat_exp_bills', Math.round(baseIncome * 0.30)); // 30% Tagihan
    storage.updateBudget('cat_exp_shopping', Math.round(baseIncome * 0.15)); // 15% Belanja
    storage.updateBudget('cat_exp_transport', Math.round(baseIncome * 0.10)); // 10% Transportasi

    alert('Rekomendasi AI (Formula 50/30/20) berhasil diterapkan ke semua anggaran!');
  };

  // Filter budgets based on period tab
  const filteredCategories = categories.filter((cat) => {
    if (selectedPeriod === 'ALL') return true;
    const b = budgets.find((bgt) => bgt.categoryId === cat.id);
    if (!b) return true;
    return b.periodType === selectedPeriod || (!b.periodType && selectedPeriod === 'MONTHLY');
  });

  return (
    <div className="p-4 space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F7F6F2] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#E2B963]" />
            Perencanaan Anggaran & Batas Belanja
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Kelola alokasi dana mingguan, bulanan, tahunan, & kustom secara presisi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyAIBudgets}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            Alokasi Otomatis AI (50/30/20)
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#E2B963]/10 border border-[#E2B963]/30 text-[#E2B963] font-bold text-xs flex items-center gap-1 hover:bg-[#E2B963]/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Anggaran
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Total Anggaran Ditetapkan</span>
            <DollarSign className="w-4 h-4 text-[#E2B963]" />
          </div>
          <div className="text-lg font-extrabold text-[#F7F6F2]">
            {formatRp(totalBudgetLimit)}
          </div>
          <div className="text-[10px] text-[#9CA3AF]">
            Total batas pengeluaran periode ini
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Total Realisasi Pengeluaran</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400">
            {formatRp(totalSpent)}
          </div>
          <div className="text-[10px] text-[#9CA3AF]">
            {overallPercentage.toFixed(1)}% dari total limit
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Sisa Anggaran Aman</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-extrabold text-sky-400">
            {formatRp(remainingTotal)}
          </div>
          <div className="text-[10px] text-[#9CA3AF]">
            Dapat digunakan hingga akhir periode
          </div>
        </div>
      </div>

      {/* Overspending Alerts Banner */}
      {overspendingAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>Peringatan Overspending & Batas Kritis ({overspendingAlerts.length})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold">
              Butuh Perhatian
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {overspendingAlerts.map((alert, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#0B0D10]/60 border border-red-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{alert.categoryName}</div>
                  <div className="text-[10px] text-red-300">
                    Terpakai {formatRp(alert.spent)} / Batas {formatRp(alert.limit)} ({alert.percentage.toFixed(0)}%)
                  </div>
                </div>
                {alert.excess > 0 ? (
                  <span className="px-2 py-1 rounded bg-red-500 text-white font-bold text-[10px]">
                    Over {formatRp(alert.excess)}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    Mendekati Batas
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 bg-[#14171E] p-1 rounded-xl border border-white/5">
          {(['ALL', 'MONTHLY', 'WEEKLY', 'ANNUAL', 'CUSTOM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedPeriod(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPeriod === tab
                  ? 'bg-[#E2B963] text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {tab === 'ALL' && 'Semua'}
              {tab === 'MONTHLY' && 'Bulanan'}
              {tab === 'WEEKLY' && 'Mingguan'}
              {tab === 'ANNUAL' && 'Tahunan'}
              {tab === 'CUSTOM' && 'Kustom'}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#9CA3AF] shrink-0">
          {filteredCategories.length} Pos Terdaftar
        </span>
      </div>

      {/* Categories & Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCategories.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id);
          const limit = budget ? budget.monthlyLimit : 0;
          const spent = budget ? budget.spent : 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const remaining = Math.max(0, limit - spent);
          const isOver = percentage > 100;
          const isNearLimit = percentage >= 80 && !isOver;
          const isEditing = editingCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl bg-[#14171E] border transition-all space-y-3 ${
                isOver
                  ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/5'
                  : isNearLimit
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F7F6F2]">{cat.name}</h3>
                    {budget?.periodType && (
                      <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                        Periode: {budget.periodType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {budget && (
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-1 rounded bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Hapus Anggaran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={inputLimit}
                        onChange={(e) => setInputLimit(e.target.value)}
                        className="w-24 bg-[#0B0D10] border border-[#E2B963] rounded px-2 py-0.5 text-xs text-white"
                        placeholder="Limit Rp"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCategoryLimit(cat.id)}
                        className="p-1 bg-emerald-500 text-black rounded hover:brightness-110"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="p-1 bg-white/10 text-white rounded hover:bg-white/20"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setInputLimit(limit.toString());
                      }}
                      className="p-1 rounded bg-white/5 text-[#9CA3AF] hover:text-white flex items-center gap-1 text-[11px] transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{limit > 0 ? 'Edit' : 'Atur'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Details */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-[#0B0D10] overflow-hidden p-0.5 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-[#E2B963] to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#9CA3AF]">
                  <span>Terpakai: <strong className="text-white">{formatRp(spent)}</strong></span>
                  <span className={isOver ? 'text-red-400 font-bold' : 'text-white'}>
                    Limit: <strong>{formatRp(limit)}</strong> ({percentage.toFixed(0)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] pt-1 border-t border-white/5">
                  <span>Sisa Saldo Aman:</span>
                  <span className={isOver ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isOver ? `- ${formatRp(spent - limit)}` : formatRp(remaining)}
                  </span>
                </div>
              </div>

              {/* Overbudget warning badge */}
              {isOver && (
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Melebihi anggaran sebesar <strong>{formatRp(spent - limit)}</strong>. Kurangi belanja di pos ini!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#E2B963]" />
                Tambah Anggaran Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudgetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">
                  Kategori Pengeluaran
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">
                  Batas Anggaran (Rp)
                </label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="Contoh: 3000000"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">
                    Jenis Periode
                  </label>
                  <select
                    value={newPeriodType}
                    onChange={(e) => setNewPeriodType(e.target.value as BudgetPeriodType)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    <option value="MONTHLY">Bulanan</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="ANNUAL">Tahunan</option>
                    <option value="CUSTOM">Kustom</option>
                  </select>
                </div>

                {newPeriodType === 'CUSTOM' && (
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">
                      Nama Periode Kustom
                    </label>
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="e.g. Liburan Idul Fitri"
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E2B963] text-black font-bold hover:brightness-110"
                >
                  Simpan Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
