import React, { useState } from 'react';
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  CheckCircle,
  Flame,
  Snowflake,
  X,
  History,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  Sliders,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatPercentage } from '../../utils/formatters';
import { Debt, DebtCategory, DebtType } from '../../types';

export const DebtView: React.FC = () => {
  const [strategy, setStrategy] = useState<'SNOWBALL' | 'AVALANCHE' | 'CUSTOM'>('AVALANCHE');
  const [extraMonthlyBudget, setExtraMonthlyBudget] = useState<number>(500000);
  
  // Modals state
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [historyDebtId, setHistoryDebtId] = useState<string | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('acc_bca');
  const [payNotes, setPayNotes] = useState('');

  // Add/Edit debt form states
  const [formType, setFormType] = useState<DebtType>('DEBT_OWED');
  const [formCategory, setFormCategory] = useState<DebtCategory>('CREDIT_CARD');
  const [formPerson, setFormPerson] = useState('');
  const [formOriginalAmount, setFormOriginalAmount] = useState('');
  const [formRemainingAmount, setFormRemainingAmount] = useState('');
  const [formInterestRate, setFormInterestRate] = useState('');
  const [formMinPayment, setFormMinPayment] = useState('');
  const [formInstallment, setFormInstallment] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formTermMonths, setFormTermMonths] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const state = storage.getState();
  const debts = state.debts;
  const accounts = state.accounts;

  const totalOwed = debts
    .filter((d) => d.type === 'DEBT_OWED')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalReceivable = debts
    .filter((d) => d.type === 'RECEIVABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const projections = storage.calculatePayoffProjections(strategy, extraMonthlyBudget);

  const openAddModal = () => {
    setEditingDebt(null);
    setFormType('DEBT_OWED');
    setFormCategory('CREDIT_CARD');
    setFormPerson('');
    setFormOriginalAmount('');
    setFormRemainingAmount('');
    setFormInterestRate('18.0');
    setFormMinPayment('');
    setFormInstallment('');
    setFormDueDate('');
    setFormTermMonths('12');
    setFormNotes('');
    setShowAddEditModal(true);
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setFormType(debt.type);
    setFormCategory(debt.category || 'OTHER');
    setFormPerson(debt.personOrInstitution);
    setFormOriginalAmount(debt.originalAmount.toString());
    setFormRemainingAmount(debt.remainingAmount.toString());
    setFormInterestRate(debt.interestRateAnnual.toString());
    setFormMinPayment((debt.minimumMonthlyPayment || 0).toString());
    setFormInstallment((debt.installment || debt.minimumMonthlyPayment || 0).toString());
    setFormDueDate(debt.dueDate || '');
    setFormTermMonths((debt.termMonths || 12).toString());
    setFormNotes(debt.notes || '');
    setShowAddEditModal(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const origVal = parseFloat(formOriginalAmount.replace(/[^0-9]/g, '')) || 0;
    const remVal = formRemainingAmount
      ? parseFloat(formRemainingAmount.replace(/[^0-9]/g, ''))
      : origVal;
    const rateVal = parseFloat(formInterestRate) || 0;
    const minVal = parseFloat(formMinPayment.replace(/[^0-9]/g, '')) || 0;
    const instVal = parseFloat(formInstallment.replace(/[^0-9]/g, '')) || minVal;
    const termVal = parseInt(formTermMonths, 10) || 12;

    if (!formPerson || origVal <= 0) return;

    if (editingDebt) {
      storage.updateDebt(editingDebt.id, {
        type: formType,
        category: formCategory,
        personOrInstitution: formPerson,
        originalAmount: origVal,
        remainingAmount: remVal,
        interestRateAnnual: rateVal,
        minimumMonthlyPayment: minVal,
        installment: instVal,
        dueDate: formDueDate || new Date().toISOString().split('T')[0],
        termMonths: termVal,
        notes: formNotes,
      });
    } else {
      storage.addDebt({
        userId: state.user.id || 'usr_01',
        type: formType,
        category: formCategory,
        personOrInstitution: formPerson,
        originalAmount: origVal,
        interestRateAnnual: rateVal,
        minimumMonthlyPayment: minVal,
        installment: instVal,
        dueDate: formDueDate || new Date().toISOString().split('T')[0],
        termMonths: termVal,
        notes: formNotes,
      });
    }

    setShowAddEditModal(false);
  };

  const handleDeleteDebt = (id: string) => {
    storage.deleteDebt(id);
    setDeleteConfirmId(null);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDebtId) return;
    const amountVal = parseFloat(payAmount.replace(/[^0-9]/g, ''));
    if (!amountVal) return;

    storage.recordDebtPayment(paymentDebtId, amountVal, payAccount, payNotes);
    setPaymentDebtId(null);
    setPayAmount('');
    setPayNotes('');
  };

  const getCategoryLabel = (cat?: DebtCategory) => {
    switch (cat) {
      case 'CREDIT_CARD': return 'Kartu Kredit';
      case 'PERSONAL_LOAN': return 'Pinjaman Pribadi';
      case 'KPR': return 'KPR / Rumah';
      case 'KKB': return 'KKB / Mobil';
      case 'MOTORCYCLE_LOAN': return 'Kredit Motor';
      case 'PAYLATER': return 'PayLater';
      case 'BNPL': return 'BNPL';
      default: return 'Lainnya';
    }
  };

  const getCategoryColor = (cat?: DebtCategory) => {
    switch (cat) {
      case 'CREDIT_CARD': return 'border-purple-500/30 text-purple-400 bg-purple-500/10';
      case 'KPR': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      case 'KKB': return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'PAYLATER':
      case 'BNPL': return 'border-pink-500/30 text-pink-400 bg-pink-500/10';
      default: return 'border-red-500/30 text-red-400 bg-red-500/10';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#14171E] border border-red-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9CA3AF] font-medium">Total Utang (Liabilitas)</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-black text-red-400">{formatRp(totalOwed)}</p>
          <p className="text-[10px] text-[#9CA3AF]">{debts.filter((d) => d.type === 'DEBT_OWED').length} Pinjaman Aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#14171E] border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9CA3AF] font-medium">Piutang (Pemberian)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">{formatRp(totalReceivable)}</p>
          <p className="text-[10px] text-[#9CA3AF]">{debts.filter((d) => d.type === 'RECEIVABLE').length} Piutang Tercatat</p>
        </div>
      </div>

      {/* Debt Strategy & Projections Engine */}
      <div className="p-4 rounded-2xl bg-[#14171E] border border-[#E2B963]/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#E2B963]" />
            <h3 className="text-xs font-bold text-[#F7F6F2]">Proyeksi Pelunasan Utang AI</h3>
          </div>

          <div className="flex bg-[#0B0D10] p-1 rounded-xl text-[10px] border border-white/5">
            <button
              onClick={() => setStrategy('AVALANCHE')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                strategy === 'AVALANCHE' ? 'bg-[#E2B963] text-black' : 'text-[#9CA3AF]'
              }`}
            >
              <Flame className="w-3 h-3" /> Avalanche
            </button>
            <button
              onClick={() => setStrategy('SNOWBALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                strategy === 'SNOWBALL' ? 'bg-[#E2B963] text-black' : 'text-[#9CA3AF]'
              }`}
            >
              <Snowflake className="w-3 h-3" /> Snowball
            </button>
            <button
              onClick={() => setStrategy('CUSTOM')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                strategy === 'CUSTOM' ? 'bg-[#E2B963] text-black' : 'text-[#9CA3AF]'
              }`}
            >
              <Sliders className="w-3 h-3" /> Kustom
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#9CA3AF]">
          {strategy === 'AVALANCHE' && 'Memprioritaskan utang bunga tertinggi (Bunga Efektif) untuk menghemat biaya bunga total.'}
          {strategy === 'SNOWBALL' && 'Memprioritaskan sisa utang terkecil untuk melunasi pinjaman lebih cepat secara jumlah.'}
          {strategy === 'CUSTOM' && 'Pengalokasian anggaran tambahan bulanan kustom sesuai kapasitas finansial Anda.'}
        </p>

        {/* Extra monthly budget controller */}
        <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#9CA3AF] text-[11px]">Anggaran Ekstra Bulanan:</span>
          <div className="flex items-center gap-2">
            {[250000, 500000, 1000000].map((b) => (
              <button
                key={b}
                onClick={() => setExtraMonthlyBudget(b)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  extraMonthlyBudget === b
                    ? 'bg-[#E2B963]/20 border border-[#E2B963] text-[#E2B963]'
                    : 'bg-white/5 text-[#9CA3AF]'
                }`}
              >
                +{formatRp(b)}
              </button>
            ))}
          </div>
        </div>

        {/* Projections Summary Box */}
        {projections.items.length > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#0B0D10] to-[#14171E] border border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#9CA3AF]">Estimasi Lunas Total:</span>
              <p className="font-bold text-[#E2B963]">{projections.totalEstimatedMonths} Bulan Lagi</p>
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3AF]">Total Bunga Dibayar:</span>
              <p className="font-bold text-red-400">{formatRp(projections.totalInterestPaid)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Debt Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#F7F6F2] uppercase tracking-wider">Daftar Catatan Utang & Piutang</h3>
        <button
          onClick={openAddModal}
          className="px-3 py-1.5 rounded-xl bg-[#E2B963] text-black text-xs font-bold flex items-center gap-1 shadow hover:bg-[#d8ae57] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Catatan
        </button>
      </div>

      {/* Debt List */}
      <div className="space-y-3">
        {debts.map((d) => {
          const catLabel = getCategoryLabel(d.category);
          const catStyle = getCategoryColor(d.category);
          const projItem = projections.items.find((i) => i.debtId === d.id);

          return (
            <div
              key={d.id}
              className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                        d.type === 'DEBT_OWED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {d.type === 'DEBT_OWED' ? 'Utang' : 'Piutang'}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${catStyle}`}>
                      {catLabel}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#F7F6F2] mt-1">{d.personOrInstitution}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryDebtId(d.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                    title="Riwayat Pembayaran"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(d)}
                    className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(d.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                <div>
                  <span className="text-[#9CA3AF]">Sisa Pinjaman:</span>
                  <p className="font-bold text-white text-xs">{formatRp(d.remainingAmount)}</p>
                  <p className="text-[9px] text-[#9CA3AF]">dari awal {formatRp(d.originalAmount)}</p>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Cicilan / Bunga:</span>
                  <p className="font-bold text-[#E2B963] text-xs">
                    {formatRp(d.installment || d.minimumMonthlyPayment)}/bln
                  </p>
                  <p className="text-[9px] text-[#9CA3AF]">Bunga: {d.interestRateAnnual}% p.a.</p>
                </div>
              </div>

              {projItem && d.type === 'DEBT_OWED' && (
                <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-[#9CA3AF]">
                    Urutan Pelunasan #{projItem.payoffOrder} • Estimasi Lunas:
                  </span>
                  <span className="font-bold text-emerald-400">
                    {projItem.projectedPayoffDate} ({projItem.estimatedMonthsToPayoff} bln)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#9CA3AF]">
                  Jatuh tempo: {d.dueDate ? d.dueDate : 'Setiap Tgl ' + (d.dueDateDay || 1)}
                </span>
                <button
                  onClick={() => setPaymentDebtId(d.id)}
                  className="px-3 py-1 rounded-xl bg-white/10 text-white text-[10px] font-bold hover:bg-[#E2B963] hover:text-black transition-all"
                >
                  Catat Pembayaran
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Debt Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">
                {editingDebt ? 'Edit Catatan Utang / Piutang' : 'Tambah Catatan Utang Baru'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Tipe Catatan</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as DebtType)}
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  >
                    <option value="DEBT_OWED">Utang Saya (Liabilitas)</option>
                    <option value="RECEIVABLE">Piutang (Pemberian Pinjaman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DebtCategory)}
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  >
                    <option value="CREDIT_CARD">Kartu Kredit</option>
                    <option value="PERSONAL_LOAN">Pinjaman Personal</option>
                    <option value="KPR">KPR (Rumah)</option>
                    <option value="KKB">KKB (Mobil)</option>
                    <option value="MOTORCYCLE_LOAN">Kredit Motor</option>
                    <option value="PAYLATER">PayLater</option>
                    <option value="BNPL">BNPL</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Nama Lembaga / Orang</label>
                <input
                  type="text"
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                  placeholder="Contoh: Bank BCA (Kartu Kredit) / Budi"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Nominal Pokok Awal (Rp)</label>
                  <input
                    type="text"
                    value={formOriginalAmount}
                    onChange={(e) => setFormOriginalAmount(e.target.value)}
                    placeholder="10000000"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Sisa Utang Saat Ini (Rp)</label>
                  <input
                    type="text"
                    value={formRemainingAmount}
                    onChange={(e) => setFormRemainingAmount(e.target.value)}
                    placeholder="Sama dengan nominal awal jika baru"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Bunga Tahunan (% p.a.)</label>
                  <input
                    type="text"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(e.target.value)}
                    placeholder="18.0"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Cicilan Bulanan (Rp)</label>
                  <input
                    type="text"
                    value={formInstallment}
                    onChange={(e) => setFormInstallment(e.target.value)}
                    placeholder="500000"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Tenor (Bulan)</label>
                  <input
                    type="number"
                    value={formTermMonths}
                    onChange={(e) => setFormTermMonths(e.target.value)}
                    placeholder="12"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Keterangan pendukung..."
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs mt-2 hover:bg-[#d8ae57]"
              >
                {editingDebt ? 'Simpan Perubahan' : 'Tambah Utang'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Recorder Modal */}
      {paymentDebtId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">Catat Pembayaran Cicilan</h3>
              <button onClick={() => setPaymentDebtId(null)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Nominal Bayar (Rp)</label>
                <input
                  type="text"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Rp 0"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Sumber Rekening</label>
                <select
                  value={payAccount}
                  onChange={(e) => setPayAccount(e.target.value)}
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRp(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Catatan Pembayaran</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Pembayaran cicilan bulan ini"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs"
              >
                Simpan Pembayaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment History View Modal */}
      {historyDebtId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">Riwayat Pembayaran</h3>
              <button onClick={() => setHistoryDebtId(null)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debts.find((d) => d.id === historyDebtId)?.payments.length === 0 ? (
                <p className="text-center text-xs text-[#9CA3AF] py-4">Belum ada riwayat pembayaran.</p>
              ) : (
                debts
                  .find((d) => d.id === historyDebtId)
                  ?.payments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="p-2.5 rounded-xl bg-[#14171E] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{formatRp(pmt.amount)}</p>
                        <p className="text-[9px] text-[#9CA3AF]">{pmt.date} • {pmt.notes || 'Pembayaran'}</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Lunas
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-red-500/30 rounded-2xl p-4 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-xs font-bold text-[#F7F6F2]">Hapus Catatan Utang/Piutang?</h3>
            <p className="text-[11px] text-[#9CA3AF]">
              Tindakan ini tidak dapat dibatalkan. Riwayat pembayaran terkait akan tetap disimpan di log transaksi.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteDebt(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
