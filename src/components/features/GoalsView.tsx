import React, { useState } from 'react';
import { 
  Target, 
  ShieldAlert, 
  Home, 
  Car,
  GraduationCap,
  Heart,
  Plane, 
  Smartphone,
  TrendingUp,
  Plus, 
  CheckCircle, 
  X,
  Calendar,
  DollarSign,
  Archive,
  Edit2,
  Clock,
  Check,
  AlertCircle,
  History
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';
import { GoalCategory, FinancialGoal } from '../../types';

export const GoalsView: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribAccount, setContribAccount] = useState('acc_bca');
  const [contribNotes, setContribNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);

  // New / Edit Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('PURCHASE');
  const [goalDate, setGoalDate] = useState('2027-12-31');
  const [goalNotes, setGoalNotes] = useState('');

  const state = storage.getState();
  const goals = state.goals || [];
  const accounts = state.accounts || [];

  const handleCreateOrUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget.replace(/[^0-9]/g, ''));
    if (!goalTitle || !targetVal || targetVal <= 0) return;

    const iconMap: Record<GoalCategory, string> = {
      EMERGENCY_FUND: 'ShieldAlert',
      HOUSE: 'Home',
      VEHICLE: 'Car',
      EDUCATION: 'GraduationCap',
      WEDDING: 'Heart',
      VACATION: 'Plane',
      GADGET: 'Smartphone',
      INVESTMENT: 'TrendingUp',
      CUSTOM: 'Target',
      PURCHASE: 'Home',
      OTHER: 'Target',
    };

    if (editingGoal) {
      storage.updateGoal(editingGoal.id, {
        title: goalTitle,
        targetAmount: targetVal,
        targetDate: goalDate,
        category: goalCategory,
        icon: iconMap[goalCategory] || 'Target',
        notes: goalNotes,
      });
      setEditingGoal(null);
    } else {
      storage.createGoal({
        userId: state.user.id || 'usr_01',
        title: goalTitle,
        targetAmount: targetVal,
        targetDate: goalDate,
        category: goalCategory,
        icon: iconMap[goalCategory] || 'Target',
        notes: goalNotes,
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setGoalTitle('');
    setGoalTarget('');
    setGoalCategory('PURCHASE');
    setGoalDate('2027-12-31');
    setGoalNotes('');
    setEditingGoal(null);
  };

  const openEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTarget(goal.targetAmount.toString());
    setGoalCategory(goal.category);
    setGoalDate(goal.targetDate);
    setGoalNotes(goal.notes || '');
    setShowAddModal(true);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amountVal = parseFloat(contribAmount.replace(/[^0-9]/g, ''));
    if (!amountVal || amountVal <= 0) return;

    storage.addGoalContribution(contributeGoalId, amountVal, contribAccount, contribNotes);
    setContributeGoalId(null);
    setContribAmount('');
    setContribNotes('');
  };

  const handleArchiveGoal = (id: string) => {
    if (confirm('Arsipkan target finansial ini?')) {
      storage.archiveGoal(id);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'ARCHIVED') return g.isArchived || g.status === 'ARCHIVED';
    return !g.isArchived && g.status !== 'ARCHIVED';
  });

  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case 'EMERGENCY_FUND':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'HOUSE':
      case 'PURCHASE':
        return <Home className="w-5 h-5 text-sky-400" />;
      case 'VEHICLE':
        return <Car className="w-5 h-5 text-purple-400" />;
      case 'EDUCATION':
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'WEDDING':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'VACATION':
        return <Plane className="w-5 h-5 text-teal-400" />;
      case 'GADGET':
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'INVESTMENT':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <Target className="w-5 h-5 text-[#E2B963]" />;
    }
  };

  return (
    <div className="p-4 space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F7F6F2] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#E2B963]" />
            Target & Tabungan Impian
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Proyeksi cerdas & kalkulasi setoran bulanan presisi menuju kebebasan finansial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Buat Target Baru
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ACTIVE'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aktif Berjalan ({goals.filter((g) => !g.isArchived && g.status !== 'ARCHIVED').length})
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ARCHIVED'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Diarsipkan ({goals.filter((g) => g.isArchived || g.status === 'ARCHIVED').length})
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-[#14171E] rounded-2xl border border-white/5 space-y-2">
            <Target className="w-10 h-10 text-[#E2B963] mx-auto opacity-50" />
            <p className="text-sm font-semibold text-gray-300">Belum ada target di kategori ini</p>
            <p className="text-xs text-gray-500">Klik 'Buat Target Baru' untuk memulai tabungan impian Anda</p>
          </div>
        ) : (
          filteredGoals.map((g) => {
            const percentage = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isCompleted = g.currentAmount >= g.targetAmount || g.status === 'COMPLETED';

            // Calculate forecast metrics
            const forecast = storage.calculateGoalForecast(g.id);

            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl bg-[#14171E] border space-y-3.5 transition-all relative overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#0B0D10] border border-white/5">
                      {getCategoryIcon(g.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F7F6F2] flex items-center gap-1.5">
                        {g.title}
                        {isCompleted && (
                          <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Tercapai!
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#E2B963]" />
                        <span>Tenggat: {g.targetDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(g)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition"
                      title="Ubah Target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!g.isArchived && (
                      <button
                        onClick={() => handleArchiveGoal(g.id)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-amber-400 transition"
                        title="Arsipkan Target"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 rounded-full bg-[#0B0D10] overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-[#E2B963] to-emerald-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#E2B963]">
                      {formatRp(g.currentAmount)}
                    </span>
                    <span className="text-gray-400 font-semibold">
                      Target: <strong className="text-white">{formatRp(g.targetAmount)}</strong> ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Deterministic Forecast & Required Monthly Box */}
                {!isCompleted && (
                  <div className="p-3 rounded-xl bg-[#0B0D10]/80 border border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-gray-400 text-[10px] flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        Setoran Wajib Bulanan
                      </div>
                      <div className="font-bold text-emerald-400 text-xs">
                        {formatRp(forecast.requiredMonthly)} /bln
                      </div>
                      <div className="text-[9px] text-gray-500">
                        Sisa {forecast.monthsRemaining} bulan tenggat
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E2B963]" />
                        Proyeksi Selesai
                      </div>
                      <div className="font-bold text-white text-xs">
                        {forecast.projectedFinishDate}
                      </div>
                      <div className="text-[9px] text-gray-500 flex items-center gap-1">
                        {forecast.isOnTrack ? (
                          <span className="text-emerald-400 font-semibold">Sesuai Jadwal</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Butuh Tambahan Setoran</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes & Actions */}
                {g.notes && <p className="text-[11px] text-gray-400 italic bg-[#0B0D10]/40 p-2 rounded-lg">{g.notes}</p>}

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <button
                    onClick={() => setExpandedHistoryGoalId(expandedHistoryGoalId === g.id ? null : g.id)}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-[#E2B963]" />
                    <span>{g.contributions?.length || 0} Riwayat Setoran</span>
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={() => setContributeGoalId(g.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1"
                    >
                      + Nabung Sekarang
                    </button>
                  )}
                </div>

                {/* History Drawer */}
                {expandedHistoryGoalId === g.id && (
                  <div className="p-3 bg-[#0B0D10] rounded-xl space-y-2 border border-white/5 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-gray-300 border-b border-white/10 pb-1">
                      Riwayat Setoran Tabungan
                    </div>
                    {(!g.contributions || g.contributions.length === 0) ? (
                      <div className="text-[11px] text-gray-500 italic">Belum ada catatan setoran manual.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {g.contributions.map((c) => (
                          <div key={c.id} className="flex justify-between items-center text-[11px] text-gray-300 p-1.5 bg-white/5 rounded-lg">
                            <div>
                              <div className="font-semibold text-emerald-400">+{formatRp(c.amount)}</div>
                              <div className="text-[9px] text-gray-500">{c.date} • {c.notes || 'Setoran'}</div>
                            </div>
                            <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                              {c.accountId}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New / Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#E2B963]" />
                {editingGoal ? 'Ubah Target Finansial' : 'Buat Target Impian Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nama Target Impian</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. DP Rumah BSD / Liburan Jepang"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Kategori Target</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    <option value="EMERGENCY_FUND">Dana Darurat</option>
                    <option value="HOUSE">Rumah / Properti</option>
                    <option value="VEHICLE">Kendaraan</option>
                    <option value="EDUCATION">Pendidikan</option>
                    <option value="WEDDING">Pernikahan</option>
                    <option value="VACATION">Liburan</option>
                    <option value="GADGET">Gadget / Elektronik</option>
                    <option value="INVESTMENT">Investasi</option>
                    <option value="CUSTOM">Lainnya / Kustom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Target Nominal (Rp)</label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="Contoh: 50000000"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Tenggat Target (Target Date)</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Catatan / Strategi Simpanan</label>
                <textarea
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  placeholder="e.g. Alokasikan 20% bonus tahunan + reksadana"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none h-16"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E2B963] text-black font-bold hover:brightness-110"
                >
                  {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#14171E] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F7F6F2] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Tambah Setoran Tabungan
              </h3>
              <button onClick={() => setContributeGoalId(null)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nominal Setoran (Rp)</label>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="Contoh: 1000000"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white font-bold focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Sumber Rekening / Kas</label>
                <select
                  value={contribAccount}
                  onChange={(e) => setContribAccount(e.target.value)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRp(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Catatan Setoran</label>
                <input
                  type="text"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  placeholder="Setoran rutin bulanan"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:brightness-110"
                >
                  Konfirmasi Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
