import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Repeat, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  Zap, 
  Bell, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';
import { BillSubscription, RecurringTransaction, TransactionType } from '../../types';

export const BillsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BILLS_SUBS' | 'RECURRING'>('BILLS_SUBS');
  const [filterType, setFilterType] = useState<'ALL' | 'BILL' | 'SUBSCRIPTION'>('ALL');

  // Modals
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddRecurringModal, setShowAddRecurringModal] = useState(false);
  const [editingBill, setEditingBill] = useState<BillSubscription | null>(null);

  // New / Edit Bill Form State
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billType, setBillType] = useState<'BILL' | 'SUBSCRIPTION'>('BILL');
  const [billDueDateDay, setBillDueDateDay] = useState(15);
  const [billCycle, setBillCycle] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [billAccount, setBillAccount] = useState('acc_bca');
  const [billCategory, setBillCategory] = useState('cat_exp_bills');
  const [billAutoPaid, setBillAutoPaid] = useState(false);

  // Recurring Form State
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recType, setRecType] = useState<TransactionType>('EXPENSE');
  const [recFrequency, setRecFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');
  const [recCustomDays, setRecCustomDays] = useState(30);
  const [recAccount, setRecAccount] = useState('acc_bca');
  const [recCategory, setRecCategory] = useState('cat_exp_bills');
  const [recStartDate, setRecStartDate] = useState(new Date().toISOString().split('T')[0]);

  const state = storage.getState();
  const bills = state.bills || [];
  const recurringTxs = state.recurringTransactions || [];
  const accounts = state.accounts || [];
  const categories = state.categories || [];

  // Calculations
  const upcomingBills = storage.getUpcomingBills(14);
  const upcomingSubs = storage.getUpcomingSubscriptions(30);

  const totalMonthlyBills = bills
    .filter((b) => b.status === 'ACTIVE' && (b.type === 'BILL' || !b.type))
    .reduce((sum, b) => sum + b.amount, 0);

  const totalMonthlySubs = bills
    .filter((b) => b.status === 'ACTIVE' && b.type === 'SUBSCRIPTION')
    .reduce((sum, b) => sum + b.amount, 0);

  const handlePayBill = (billId: string, name: string) => {
    if (confirm(`Konfirmasi pembayaran tagihan "${name}"? Ini akan mencatat pengeluaran secara otomatis.`)) {
      storage.payBill(billId);
      alert(`Tagihan "${name}" berhasil dibayar & tercatat di riwayat transaksi!`);
    }
  };

  const handleToggleBillStatus = (bill: BillSubscription) => {
    const nextStatus = bill.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    storage.updateBill(bill.id, { status: nextStatus });
  };

  const handleDeleteBill = (id: string, name: string) => {
    if (confirm(`Hapus tagihan/langganan "${name}"?`)) {
      storage.deleteBill(id);
    }
  };

  const handleCreateOrUpdateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(billAmount.replace(/[^0-9]/g, ''));
    if (!billName || !amountVal) return;

    if (editingBill) {
      storage.updateBill(editingBill.id, {
        name: billName,
        amount: amountVal,
        type: billType,
        dueDateDay: billDueDateDay,
        billingCycle: billCycle,
        accountId: billAccount,
        categoryId: billCategory,
        autoPaid: billAutoPaid,
      });
      setEditingBill(null);
    } else {
      storage.addBill({
        userId: state.user.id || 'usr_01',
        name: billName,
        amount: amountVal,
        type: billType,
        dueDateDay: billDueDateDay,
        billingCycle: billCycle,
        accountId: billAccount,
        categoryId: billCategory,
        autoPaid: billAutoPaid,
        status: 'ACTIVE',
      });
    }

    setShowAddBillModal(false);
    resetBillForm();
  };

  const resetBillForm = () => {
    setBillName('');
    setBillAmount('');
    setBillType('BILL');
    setBillDueDateDay(15);
    setBillCycle('MONTHLY');
    setEditingBill(null);
  };

  const openEditBillModal = (bill: BillSubscription) => {
    setEditingBill(bill);
    setBillName(bill.name);
    setBillAmount(bill.amount.toString());
    setBillType(bill.type || 'BILL');
    setBillDueDateDay(bill.dueDateDay);
    setBillCycle(bill.billingCycle);
    setBillAccount(bill.accountId);
    setBillCategory(bill.categoryId);
    setBillAutoPaid(bill.autoPaid);
    setShowAddBillModal(true);
  };

  const handleCreateRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(recAmount.replace(/[^0-9]/g, ''));
    if (!recName || !amountVal) return;

    storage.addRecurringTransaction({
      userId: state.user.id || 'usr_01',
      name: recName,
      amount: amountVal,
      type: recType,
      accountId: recAccount,
      categoryId: recCategory,
      frequency: recFrequency,
      customIntervalDays: recFrequency === 'CUSTOM' ? recCustomDays : undefined,
      startDate: recStartDate,
      nextRunDate: recStartDate,
      status: 'ACTIVE',
    });

    setShowAddRecurringModal(false);
    setRecName('');
    setRecAmount('');
  };

  const handleProcessDueRecurring = () => {
    const count = storage.processDueRecurringTransactions();
    if (count > 0) {
      alert(`Berhasil memproses ${count} transaksi rutin yang jatuh tempo hari ini!`);
    } else {
      alert('Tidak ada transaksi rutin yang jatuh tempo hari ini.');
    }
  };

  const filteredBills = bills.filter((b) => {
    if (filterType === 'BILL') return b.type === 'BILL' || !b.type;
    if (filterType === 'SUBSCRIPTION') return b.type === 'SUBSCRIPTION';
    return true;
  });

  return (
    <div className="p-4 space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F7F6F2] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E2B963]" />
            Tagihan, Langganan & Transaksi Rutin
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Kelola kewajiban berkala & atur otomatisasi eksekusi transaksi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'BILLS_SUBS' ? (
            <button
              onClick={() => {
                resetBillForm();
                setShowAddBillModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Tagihan
            </button>
          ) : (
            <button
              onClick={() => setShowAddRecurringModal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Buat Transaksi Rutin
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Tagihan Bulanan</p>
          <h3 className="text-xl font-extrabold text-[#E2B963]">{formatRp(totalMonthlyBills)}</h3>
          <p className="text-[10px] text-gray-500">
            {bills.filter((b) => b.status === 'ACTIVE' && (b.type === 'BILL' || !b.type)).length} Tagihan Aktif
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Langganan Bulanan</p>
          <h3 className="text-xl font-extrabold text-purple-400">{formatRp(totalMonthlySubs)}</h3>
          <p className="text-[10px] text-gray-500">
            {bills.filter((b) => b.status === 'ACTIVE' && b.type === 'SUBSCRIPTION').length} Layanan Aktif
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Tagihan Mendatang (14 Hari)</p>
          <h3 className="text-xl font-extrabold text-rose-400">{upcomingBills.length} Tagihan</h3>
          <p className="text-[10px] text-rose-300 font-semibold">
            Total {formatRp(upcomingBills.reduce((s, b) => s + b.amount, 0))}
          </p>
        </div>
      </div>

      {/* Main Tab Toggle */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('BILLS_SUBS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'BILLS_SUBS'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Tagihan & Langganan ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('RECURRING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'RECURRING'
                ? 'bg-[#E2B963] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Otomatisasi Rutin ({recurringTxs.length})
          </button>
        </div>

        {activeTab === 'BILLS_SUBS' && (
          <div className="flex gap-1 text-[11px] bg-[#14171E] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2 py-0.5 rounded ${filterType === 'ALL' ? 'bg-white/10 text-white font-bold' : 'text-gray-400'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('BILL')}
              className={`px-2 py-0.5 rounded ${filterType === 'BILL' ? 'bg-white/10 text-white font-bold' : 'text-gray-400'}`}
            >
              Tagihan
            </button>
            <button
              onClick={() => setFilterType('SUBSCRIPTION')}
              className={`px-2 py-0.5 rounded ${filterType === 'SUBSCRIPTION' ? 'bg-white/10 text-white font-bold' : 'text-gray-400'}`}
            >
              Langganan
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: BILLS & SUBSCRIPTIONS LIST */}
      {activeTab === 'BILLS_SUBS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBills.map((bill) => {
            const isSub = bill.type === 'SUBSCRIPTION';
            const isActive = bill.status === 'ACTIVE';

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-2xl bg-[#14171E] border space-y-3 transition-all ${
                  isActive
                    ? 'border-white/5 hover:border-white/20'
                    : 'border-white/5 opacity-60 bg-black/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        isSub ? 'bg-purple-500/15 text-purple-400' : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F7F6F2] flex items-center gap-2">
                        {bill.name}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isSub ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isSub ? 'Langganan' : 'Tagihan'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#E2B963]" />
                        <span>
                          Jatuh tempo tgl {bill.dueDateDay} • Siklus: {bill.billingCycle}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#F7F6F2]">{formatRp(bill.amount)}</p>
                    <div className="flex justify-end gap-1 mt-1">
                      <button
                        onClick={() => handleToggleBillStatus(bill)}
                        className={`p-1 rounded text-[10px] font-bold ${
                          isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                        }`}
                        title="Ubah Status"
                      >
                        {isActive ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status & Payment Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <div className="text-gray-400">
                    {bill.autoPaid ? (
                      <span className="text-sky-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-sky-400" /> Autodebet Rekening
                      </span>
                    ) : (
                      <span className="text-amber-400">Bayar Manual</span>
                    )}
                    {bill.lastPaidDate && (
                      <div className="text-[9px] text-gray-500">Terakhir dibayar: {bill.lastPaidDate}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditBillModal(bill)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                      title="Edit Tagihan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id, bill.name)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400"
                      title="Hapus Tagihan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePayBill(bill.id, bill.name)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold hover:brightness-110 active:scale-95 transition shadow-sm"
                    >
                      Bayar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RECURRING TRANSACTIONS ENGINE */}
      {activeTab === 'RECURRING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-purple-400" />
                Mesin Transaksi Otomatis Rutin
              </h3>
              <p className="text-xs text-gray-400">
                Otomatiskan pencatatan pemasukan/pengeluaran harian, mingguan, bulanan, atau tahunan
              </p>
            </div>

            <button
              onClick={handleProcessDueRecurring}
              className="px-4 py-2 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow hover:brightness-110 flex items-center gap-1.5 shrink-0"
            >
              <Zap className="w-4 h-4" />
              Proses Transaksi Jatuh Tempo Hari Ini
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recurringTxs.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-2 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {rec.name}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          rec.type === 'INCOME'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {rec.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Frekuensi: <strong className="text-white">{rec.frequency}</strong> • Tanggal Eksekusi Berikutnya: <strong className="text-[#E2B963]">{rec.nextRunDate}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">{formatRp(rec.amount)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-white/5">
                  <span>Terakhir Jalan: {rec.lastRunDate || 'Belum pernah'}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus otomatisasi rutin "${rec.name}"?`)) {
                        storage.deleteRecurringTransaction(rec.id);
                      }
                    }}
                    className="text-red-400 hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Bill Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#E2B963]" />
                {editingBill ? 'Ubah Tagihan / Langganan' : 'Tambah Tagihan Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddBillModal(false);
                  resetBillForm();
                }}
                className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateBill} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nama Tagihan / Layanan</label>
                <input
                  type="text"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder="e.g. Indihome / Netflix 4K / Listrik PLN"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Tipe Komitmen</label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as 'BILL' | 'SUBSCRIPTION')}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    <option value="BILL">Tagihan Rutin</option>
                    <option value="SUBSCRIPTION">Langganan Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Contoh: 186000"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Tanggal Jatuh Tempo (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billDueDateDay}
                    onChange={(e) => setBillDueDateDay(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Siklus Pembayaran</label>
                  <select
                    value={billCycle}
                    onChange={(e) => setBillCycle(e.target.value as any)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    <option value="MONTHLY">Bulanan</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="QUARTERLY">Triwulanan</option>
                    <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Rekening Pembayaran</label>
                  <select
                    value={billAccount}
                    onChange={(e) => setBillAccount(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Kategori</label>
                  <select
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-[#E2B963] outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoPaidCheck"
                  checked={billAutoPaid}
                  onChange={(e) => setBillAutoPaid(e.target.checked)}
                  className="rounded bg-[#0B0D10] border-white/10 accent-[#E2B963]"
                />
                <label htmlFor="autoPaidCheck" className="text-gray-300 font-medium cursor-pointer">
                  Autodebet / Pembayaran Otomatis
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBillModal(false);
                    resetBillForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E2B963] text-black font-bold hover:brightness-110"
                >
                  {editingBill ? 'Simpan Perubahan' : 'Simpan Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recurring Transaction Modal */}
      {showAddRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-purple-400" />
                Buat Otomatisasi Transaksi Rutin
              </h3>
              <button
                onClick={() => setShowAddRecurringModal(false)}
                className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurringSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nama Otomatisasi</label>
                <input
                  type="text"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  placeholder="e.g. Gaji Pokok / Sewa Kost / Tabungan Emas"
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Jenis Transaksi</label>
                  <select
                    value={recType}
                    onChange={(e) => setRecType(e.target.value as TransactionType)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  >
                    <option value="EXPENSE">Pengeluaran</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    placeholder="Contoh: 1500000"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Frekuensi Execution</label>
                  <select
                    value={recFrequency}
                    onChange={(e) => setRecFrequency(e.target.value as any)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  >
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                    <option value="CUSTOM">Kustom Interval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={recStartDate}
                    onChange={(e) => setRecStartDate(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                    required
                  />
                </div>
              </div>

              {recFrequency === 'CUSTOM' && (
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Interval Hari (setiap N hari)</label>
                  <input
                    type="number"
                    value={recCustomDays}
                    onChange={(e) => setRecCustomDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Rekening</label>
                  <select
                    value={recAccount}
                    onChange={(e) => setRecAccount(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Kategori</label>
                  <select
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-white focus:border-purple-400 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddRecurringModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold hover:brightness-110"
                >
                  Aktifkan Otomatisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
