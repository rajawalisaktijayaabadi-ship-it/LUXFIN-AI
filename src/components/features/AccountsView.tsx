import React, { useState } from 'react';
import {
  Building2,
  Wallet,
  Smartphone,
  Banknote,
  TrendingUp,
  Plus,
  ArrowLeftRight,
  Edit2,
  Check,
  X,
  CreditCard,
  PiggyBank,
  Briefcase,
  Layers,
  Archive,
  Trash2,
  Scale,
  Eye,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatDateID } from '../../utils/formatters';
import { Account, AccountType, Transaction } from '../../types';

export const AccountsView: React.FC = () => {
  const state = storage.getState();
  const accounts = state.accounts;
  const transactions = state.transactions;
  const calculatedBalances = storage.getCalculatedAccountBalances();

  // Modals & States
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Account | null>(null);
  const [showReconcileModal, setShowReconcileModal] = useState<Account | null>(null);
  const [showTransferModal, setShowTransferModal] = useState<Account | null>(null);
  const [showArchiveFilter, setShowArchiveFilter] = useState(false);

  // Form States - Add / Edit Account
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('BANK');
  const [accProvider, setAccProvider] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accNotes, setAccNotes] = useState('');
  const [accColor, setAccColor] = useState('#E2B963');
  const [accExclude, setAccExclude] = useState(false);

  // Form States - Reconciliation
  const [physicalBalanceInput, setPhysicalBalanceInput] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconcileResult, setReconcileResult] = useState<{ diff: number; msg: string } | null>(null);

  // Form States - Transfer
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState('');

  // Status message alert
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalCalculatedNetWorth = calculatedBalances
    .filter((b) => {
      const acc = accounts.find((a) => a.id === b.accountId);
      return acc && !acc.isExcludedFromNetWorth && !acc.isArchived;
    })
    .reduce((sum, b) => sum + b.computedBalance, 0);

  const activeAccounts = accounts.filter((a) => showArchiveFilter ? a.isArchived : !a.isArchived);

  // Reset form fields
  const resetForm = () => {
    setAccName('');
    setAccType('BANK');
    setAccProvider('');
    setAccNumber('');
    setAccBalance('');
    setAccNotes('');
    setAccColor('#E2B963');
    setAccExclude(false);
  };

  // Open Edit Modal with pre-filled data
  const handleOpenEdit = (acc: Account) => {
    setShowEditModal(acc);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccProvider(acc.provider);
    setAccNumber(acc.accountNumber || '');
    setAccBalance((acc.initialBalance ?? acc.balance).toString());
    setAccNotes(acc.notes || '');
    setAccColor(acc.color || '#E2B963');
    setAccExclude(!!acc.isExcludedFromNetWorth);
  };

  // Submit Add Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    const initialVal = parseFloat(accBalance.replace(/[^0-9.]/g, '')) || 0;
    storage.addAccount({
      userId: state.user.id || 'usr_01',
      name: accName,
      type: accType,
      provider: accProvider || accName,
      accountNumber: accNumber,
      balance: initialVal,
      initialBalance: initialVal,
      color: accColor,
      notes: accNotes,
      icon: getIconForAccountType(accType),
      isExcludedFromNetWorth: accExclude,
      isArchived: false,
    });

    setActionMessage({ type: 'success', text: `Akun ${accName} berhasil ditambahkan.` });
    setShowAddModal(false);
    resetForm();
  };

  // Submit Edit Account
  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal || !accName.trim()) return;

    const initialVal = parseFloat(accBalance.replace(/[^0-9.]/g, '')) || showEditModal.balance;
    storage.updateAccount(showEditModal.id, {
      name: accName,
      type: accType,
      provider: accProvider,
      accountNumber: accNumber,
      notes: accNotes,
      color: accColor,
      initialBalance: initialVal,
      isExcludedFromNetWorth: accExclude,
    });

    setActionMessage({ type: 'success', text: `Data akun ${accName} berhasil diperbarui.` });
    setShowEditModal(null);
    resetForm();
  };

  // Handle Account Archive / Unarchive
  const handleToggleArchive = (acc: Account) => {
    const nextState = !acc.isArchived;
    storage.archiveAccount(acc.id, nextState);
    setActionMessage({
      type: 'success',
      text: `Akun ${acc.name} telah ${nextState ? 'diarsipkan' : 'diaktifkan kembali'}.`,
    });
    if (selectedAccount?.id === acc.id) setSelectedAccount(null);
  };

  // Handle Account Delete
  const handleDeleteAccount = (acc: Account) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun "${acc.name}"?`)) {
      const result = storage.deleteAccount(acc.id);
      setActionMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
      if (selectedAccount?.id === acc.id) setSelectedAccount(null);
    }
  };

  // Submit Reconciliation
  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReconcileModal) return;

    const physicalVal = parseFloat(physicalBalanceInput.replace(/[^0-9.]/g, ''));
    if (isNaN(physicalVal)) return;

    const result = storage.reconcileAccount(showReconcileModal.id, physicalVal, reconcileNotes);
    if (result.diff === 0) {
      setReconcileResult({ diff: 0, msg: 'Saldo di catatan sudah cocok 100% dengan kondisi fisik/bank. Tidak ada selisih.' });
    } else {
      setReconcileResult({
        diff: result.diff,
        msg: `Rekonsiliasi selesai! Dibuat transaksi penyesuaian ${result.diff > 0 ? 'Surplus' : 'Defisit'} sebesar ${formatRp(Math.abs(result.diff))}.`,
      });
    }

    setTimeout(() => {
      setShowReconcileModal(null);
      setReconcileResult(null);
      setPhysicalBalanceInput('');
      setReconcileNotes('');
    }, 2000);
  };

  // Submit Inter-Account Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTransferModal || !transferTargetId) return;

    const amountVal = parseFloat(transferAmount.replace(/[^0-9.]/g, ''));
    if (!amountVal || amountVal <= 0) return;

    if (showTransferModal.id === transferTargetId) {
      alert('Rekening sumber dan rekening tujuan tidak boleh sama.');
      return;
    }

    const targetAcc = accounts.find((a) => a.id === transferTargetId);

    storage.addTransaction({
      userId: state.user.id || 'usr_01',
      type: 'TRANSFER',
      amount: amountVal,
      accountId: showTransferModal.id,
      targetAccountId: transferTargetId,
      categoryId: 'cat_transfer',
      status: 'COMPLETED',
      date: transferDate,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      vendor: `Transfer ke ${targetAcc?.name || 'Rekening'}`,
      notes: transferNotes || `Pemindahbukuan saldo dari ${showTransferModal.name} ke ${targetAcc?.name}`,
      tags: ['TransferInternal'],
    });

    setTransferSuccessMsg(`Transfer ${formatRp(amountVal)} ke ${targetAcc?.name} berhasil disimpan.`);
    setTimeout(() => {
      setShowTransferModal(null);
      setTransferSuccessMsg('');
      setTransferAmount('');
      setTransferNotes('');
    }, 1500);
  };

  // Icon Helper function
  const getIconForAccountType = (type: AccountType) => {
    switch (type) {
      case 'BANK': return 'Building2';
      case 'E_WALLET': return 'Smartphone';
      case 'CREDIT_CARD': return 'CreditCard';
      case 'SAVINGS': return 'PiggyBank';
      case 'DEPOSIT': return 'Briefcase';
      case 'INVESTMENT': return 'TrendingUp';
      case 'CASH': return 'Banknote';
      default: return 'Wallet';
    }
  };

  const renderTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'BANK': return <Building2 className="w-5 h-5" />;
      case 'E_WALLET': return <Smartphone className="w-5 h-5" />;
      case 'CREDIT_CARD': return <CreditCard className="w-5 h-5" />;
      case 'SAVINGS': return <PiggyBank className="w-5 h-5" />;
      case 'DEPOSIT': return <Briefcase className="w-5 h-5" />;
      case 'INVESTMENT': return <TrendingUp className="w-5 h-5" />;
      case 'CASH': return <Banknote className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Alert Banner */}
      {actionMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Account Master Total Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1C2230] to-[#14171E] border border-[#E2B963]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">Total Likuiditas & Rekening Aktif</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F7F6F2] mt-0.5">{formatRp(totalCalculatedNetWorth)}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#E2B963] font-medium bg-[#E2B963]/10 px-2 py-0.5 rounded-full border border-[#E2B963]/20">
              {activeAccounts.length} Rekening Terhubung
            </span>
            <span className="text-[10px] text-slate-400">Presisi Matematika Core Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchiveFilter(!showArchiveFilter)}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showArchiveFilter
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-[#9CA3AF] border-white/10 hover:text-white'
            }`}
            title="Lihat Rekening Diarsipkan"
          >
            <Archive className="w-4 h-4" />
            <span>{showArchiveFilter ? 'Kembali' : 'Arsip'}</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Akun Baru
          </button>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="space-y-3">
        {activeAccounts.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-[#14171E] rounded-2xl border border-white/5 p-6">
            <Wallet className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#F7F6F2]">Tidak Ada Rekening {showArchiveFilter ? 'Arsip' : 'Aktif'}</p>
            <p className="text-xs text-[#9CA3AF]">
              {showArchiveFilter ? 'Belum ada rekening yang diarsipkan.' : 'Klik "Akun Baru" untuk menambahkan rekening bank, kas, atau e-wallet.'}
            </p>
          </div>
        ) : (
          activeAccounts.map((acc) => {
            const calc = calculatedBalances.find((c) => c.accountId === acc.id);
            const liveBalance = calc?.computedBalance ?? acc.balance;

            return (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-[#E2B963]/40 transition-all space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md font-bold"
                      style={{ backgroundColor: acc.color || '#E2B963' }}
                    >
                      {renderTypeIcon(acc.type)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#F7F6F2] hover:text-[#E2B963] transition-colors">
                          {acc.name}
                        </h3>
                        {acc.isExcludedFromNetWorth && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Non-NetWorth
                          </span>
                        )}
                        {acc.isArchived && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                            Arsip
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9CA3AF]">
                        {acc.provider} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-black ${calc?.isNegative ? 'text-rose-400' : 'text-[#E2B963]'}`}>
                      {formatRp(liveBalance)}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] uppercase font-mono">{acc.type}</p>
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-[#9CA3AF]">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setSelectedAccount(acc)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>

                    <button
                      onClick={() => {
                        setShowTransferModal(acc);
                        setTransferTargetId('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 flex items-center gap-1 transition-all"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Transfer
                    </button>

                    <button
                      onClick={() => {
                        setShowReconcileModal(acc);
                        setPhysicalBalanceInput(liveBalance.toString());
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 flex items-center gap-1 transition-all"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Rekonsiliasi
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white"
                      title="Edit Akun"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleArchive(acc)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-300"
                      title={acc.isArchived ? 'Buka Arsip' : 'Arsipkan Akun'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteAccount(acc)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - Add / Edit Account */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#F7F6F2]">
                {showEditModal ? 'Edit Data Rekening' : 'Tambah Rekening Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(null);
                  resetForm();
                }}
                className="p-1 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showEditModal ? handleUpdateAccount : handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Nama Rekening / Akun</label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Contoh: BCA Tabungan Utama"
                  required
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#9CA3AF] focus:border-[#E2B963] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Tipe Rekening</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#E2B963] focus:outline-none"
                  >
                    <option value="BANK">Bank</option>
                    <option value="E_WALLET">E-Wallet</option>
                    <option value="CASH">Kas Tunai</option>
                    <option value="CREDIT_CARD">Kartu Kredit</option>
                    <option value="SAVINGS">Tabungan</option>
                    <option value="DEPOSIT">Deposito</option>
                    <option value="INVESTMENT">Investasi</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Penyedia / Bank</label>
                  <input
                    type="text"
                    value={accProvider}
                    onChange={(e) => setAccProvider(e.target.value)}
                    placeholder="BCA, Mandiri, Gopay..."
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#9CA3AF] focus:border-[#E2B963] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Nomor Rekening (Opsional)</label>
                  <input
                    type="text"
                    value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#9CA3AF] focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">
                    {showEditModal ? 'Saldo Awal' : 'Saldo Saat Ini (Rp)'}
                  </label>
                  <input
                    type="number"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-[#E2B963] font-bold focus:border-[#E2B963] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Warna Label Kartu</label>
                <div className="flex items-center gap-2">
                  {['#E2B963', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#64748B'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAccColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        accColor === color ? 'scale-110 border-white' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkExclude"
                  checked={accExclude}
                  onChange={(e) => setAccExclude(e.target.checked)}
                  className="rounded bg-[#0B0D10] border-white/20 text-[#E2B963] focus:ring-0"
                />
                <label htmlFor="chkExclude" className="text-xs text-slate-300">
                  Kecualikan rekening ini dari perhitungan Net Worth utama
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E2B963] text-black font-bold shadow-md hover:opacity-90"
                >
                  {showEditModal ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Account Detail & Transaction History */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedAccount.color || '#E2B963' }}
                >
                  {renderTypeIcon(selectedAccount.type)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F7F6F2]">{selectedAccount.name}</h3>
                  <p className="text-xs text-[#9CA3AF]">{selectedAccount.provider} • {selectedAccount.type}</p>
                </div>
              </div>

              <button onClick={() => setSelectedAccount(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Computed Balance Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Saldo Terhitung Saat Ini</p>
                <p className="text-xl font-bold text-[#E2B963] mt-0.5">
                  {formatRp(
                    calculatedBalances.find((c) => c.accountId === selectedAccount.id)?.computedBalance ?? selectedAccount.balance
                  )}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>Saldo Awal: {formatRp(selectedAccount.initialBalance ?? selectedAccount.balance)}</div>
                <div className="text-emerald-400">
                  In Credits: +{formatRp(calculatedBalances.find((c) => c.accountId === selectedAccount.id)?.totalIncomeCredits ?? 0)}
                </div>
              </div>
            </div>

            {/* Account Transaction History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Riwayat Transaksi Akun Ini
              </h4>

              {transactions.filter((t) => t.accountId === selectedAccount.id || t.targetAccountId === selectedAccount.id).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Belum ada riwayat transaksi pada rekening ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {transactions
                    .filter((t) => t.accountId === selectedAccount.id || t.targetAccountId === selectedAccount.id)
                    .map((tx) => (
                      <div key={tx.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <div className="font-bold text-white font-sans">{tx.vendor || tx.notes || tx.type}</div>
                          <div className="text-[10px] text-slate-500">{tx.date} • {tx.categoryId}</div>
                        </div>

                        <div className={`text-right font-bold ${
                          tx.type === 'INCOME' ? 'text-emerald-400' :
                          tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-sky-400'
                        }`}>
                          {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '⇄'} {formatRp(tx.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Reconciliation */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Scale className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#F7F6F2]">Rekonsiliasi Bank & Kas</h3>
              </div>
              <button onClick={() => setShowReconcileModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">Akun: {showReconcileModal.name}</p>
              <p className="text-slate-400">
                Saldo Terhitung di LUXFIN AI: {' '}
                <strong className="text-[#E2B963]">
                  {formatRp(calculatedBalances.find((c) => c.accountId === showReconcileModal.id)?.computedBalance ?? showReconcileModal.balance)}
                </strong>
              </p>
            </div>

            {reconcileResult ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Proses Rekonsiliasi Sukses</span>
                </div>
                <p className="leading-relaxed">{reconcileResult.msg}</p>
              </div>
            ) : (
              <form onSubmit={handleReconcileSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">
                    Masukkan Saldo Fisik / Rekening Koran Sebenarnya (Rp)
                  </label>
                  <input
                    type="number"
                    value={physicalBalanceInput}
                    onChange={(e) => setPhysicalBalanceInput(e.target.value)}
                    placeholder="Contoh: 15250000"
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-[#E2B963] font-bold text-base focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Catatan Rekonsiliasi (Opsional)</label>
                  <input
                    type="text"
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    placeholder="Penyesuaian Bunga Bank / Biaya Admin / Uang Fisik Dompet"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowReconcileModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold shadow-md hover:bg-emerald-400"
                  >
                    Proses Penyesuaian
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal - Inter-Account Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <ArrowLeftRight className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#F7F6F2]">Transfer Antar Rekening</h3>
              </div>
              <button onClick={() => setShowTransferModal(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{transferSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening Sumber (Asal)</label>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold flex items-center justify-between">
                    <span>{showTransferModal.name}</span>
                    <span className="text-[#E2B963]">{formatRp(showTransferModal.balance)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening Tujuan</label>
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#E2B963] focus:outline-none"
                  >
                    <option value="">-- Pilih Rekening Tujuan --</option>
                    {accounts
                      .filter((a) => a.id !== showTransferModal.id && !a.isArchived)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.provider} - Saldo: {formatRp(a.balance)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Nominal Transfer (Rp)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-[#E2B963] font-bold text-base focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Tanggal Transfer</label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Catatan / Keterangan Transfer</label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Contoh: Pindah dana operasional mingguan"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-500"
                  >
                    Kirim Transfer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
