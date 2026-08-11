import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  X,
  FileText,
  Edit3,
  Eye,
  AlertTriangle,
  Repeat,
  Paperclip,
  Check,
  Tag,
  Clock,
  Building2,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  Camera,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatDateID } from '../../utils/formatters';
import { Transaction, TransactionType } from '../../types';
import { ReceiptScannerModal } from './ReceiptScannerModal';
import { ImportWizardModal } from './ImportWizardModal';
import { ExportHubModal } from './ExportHubModal';

interface TransactionsViewProps {
  onOpenSmartAdd: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenSmartAdd }) => {
  const state = storage.getState();
  const accounts = state.accounts;
  const categories = state.categories;
  const transactions = state.transactions;

  // Search, Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'RECURRING' | 'ALL'>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals & Active Selections
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Prompt 11 Feature Modals State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Form State for Editing/Adding Transaction
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [txAmount, setTxAmount] = useState('');
  const [txAccountId, setTxAccountId] = useState('');
  const [txTargetAccountId, setTxTargetAccountId] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txVendor, setTxVendor] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txTime, setTxTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [txTagsInput, setTxTagsInput] = useState('');
  const [txReceiptUrl, setTxReceiptUrl] = useState('');
  const [txIsRecurring, setTxIsRecurring] = useState(false);
  const [txRecurringFreq, setTxRecurringFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Duplicate Warning Sheet State
  const [duplicateSuspects, setDuplicateSuspects] = useState<Transaction[]>([]);
  const [pendingTxToSave, setPendingTxToSave] = useState<Partial<Transaction> | null>(null);

  // Handle Edit Click
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxAccountId(tx.accountId);
    setTxTargetAccountId(tx.targetAccountId || '');
    setTxCategoryId(tx.categoryId);
    setTxVendor(tx.vendor || tx.merchant || '');
    setTxNotes(tx.notes || '');
    setTxDate(tx.date);
    setTxTime(tx.time || '12:00');
    setTxTagsInput(tx.tags ? tx.tags.join(', ') : '');
    setTxReceiptUrl(tx.receiptUrl || '');
    setTxIsRecurring(!!tx.isRecurring);
    setTxRecurringFreq(tx.recurringFrequency || 'MONTHLY');
    setSelectedTx(null);
  };

  // Check Duplicates before submitting Edit/Save
  const handleCheckAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(txAmount.replace(/[^0-9.]/g, ''));
    if (!amountVal || amountVal <= 0 || !txAccountId) return;

    const candidateData = {
      type: txType,
      amount: amountVal,
      accountId: txAccountId,
      targetAccountId: txType === 'TRANSFER' ? txTargetAccountId : undefined,
      categoryId: txCategoryId || (txType === 'INCOME' ? 'cat_inc_salary' : 'cat_exp_food'),
      vendor: txVendor,
      notes: txNotes,
      date: txDate,
      time: txTime,
      tags: txTagsInput ? txTagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      receiptUrl: txReceiptUrl,
      isRecurring: txIsRecurring,
      recurringFrequency: txIsRecurring ? txRecurringFreq : undefined,
      status: 'COMPLETED' as const,
      userId: state.user.id || 'usr_01',
    };

    // If new transaction or amount/date changed, check for potential duplicates in last 7 days
    if (!editingTx) {
      const duplicates = storage.detectDuplicateTransactions({
        amount: amountVal,
        accountId: txAccountId,
        vendor: txVendor,
        categoryId: txCategoryId,
        date: txDate,
      });

      if (duplicates.length > 0) {
        setDuplicateSuspects(duplicates);
        setPendingTxToSave(candidateData);
        return;
      }
    }

    executeSaveTransaction(candidateData);
  };

  // Perform Save to storage
  const executeSaveTransaction = (candidateData: Partial<Transaction>) => {
    if (editingTx) {
      storage.updateTransaction(editingTx.id, candidateData);
    } else {
      storage.addTransaction(candidateData as any);
    }

    setEditingTx(null);
    setDuplicateSuspects([]);
    setPendingTxToSave(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingTx) return;
    storage.deleteTransaction(deletingTx.id);
    setDeletingTx(null);
    setSelectedTx(null);
  };

  // Filtering Logic
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchVendor = tx.vendor?.toLowerCase().includes(term) || tx.merchant?.toLowerCase().includes(term);
      const matchNotes = tx.notes?.toLowerCase().includes(term);
      const matchCategory = tx.categoryId.toLowerCase().includes(term);
      const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(term));
      const matchAmount = tx.amount.toString().includes(term);
      if (!matchVendor && !matchNotes && !matchCategory && !matchTags && !matchAmount) {
        return false;
      }
    }

    // 2. Type Filter
    if (selectedType === 'RECURRING') {
      if (!tx.isRecurring) return false;
    } else if (selectedType !== 'ALL') {
      if (tx.type !== selectedType) return false;
    }

    // 3. Account Filter
    if (selectedAccount !== 'ALL') {
      if (tx.accountId !== selectedAccount && tx.targetAccountId !== selectedAccount) return false;
    }

    // 4. Category Filter
    if (selectedCategory !== 'ALL') {
      if (tx.categoryId !== selectedCategory) return false;
    }

    // 5. Date Filter
    if (dateFilter === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      if (tx.date !== todayStr) return false;
    } else if (dateFilter === 'WEEK') {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      if (tx.date < weekAgo) return false;
    } else if (dateFilter === 'MONTH') {
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (!tx.date.startsWith(currentMonth)) return false;
    } else if (dateFilter === 'CUSTOM') {
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
    }

    // 6. Amount Filter
    const minVal = parseFloat(minAmount);
    const maxVal = parseFloat(maxAmount);
    if (!isNaN(minVal) && tx.amount < minVal) return false;
    if (!isNaN(maxVal) && tx.amount > maxVal) return false;

    return true;
  });

  // Sorting Logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'DATE_DESC') {
      return new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime();
    }
    if (sortBy === 'DATE_ASC') {
      return new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime();
    }
    if (sortBy === 'AMOUNT_DESC') {
      return b.amount - a.amount;
    }
    if (sortBy === 'AMOUNT_ASC') {
      return a.amount - b.amount;
    }
    return 0;
  });

  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#F7F6F2]">Riwayat & Manajemen Transaksi</h2>
          <p className="text-xs text-[#9CA3AF]">
            Menampilkan {sortedTransactions.length} dari {transactions.length} Catatan Keuangan
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#181B22] border border-[#E2B963]/30 text-[#E2B963] font-bold text-xs flex items-center gap-1.5 hover:bg-[#E2B963]/10 transition-all cursor-pointer whitespace-nowrap"
            title="Scan Nota Struk dengan AI OCR"
          >
            <Camera className="w-3.5 h-3.5" />
            Scanner OCR
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#181B22] border border-white/10 text-gray-200 font-bold text-xs flex items-center gap-1.5 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            title="Import File CSV, XLSX, atau JSON"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Import
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#181B22] border border-white/10 text-gray-200 font-bold text-xs flex items-center gap-1.5 hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            title="Ekspor Data Keuangan & Laporan PDF"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Ekspor
          </button>

          <button
            onClick={onOpenSmartAdd}
            className="px-3.5 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Smart Entry
          </button>
        </div>
      </div>

      {/* Primary Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari merchant, catatan, nominal, atau tags..."
              className="w-full bg-[#14171E] border border-white/10 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2.5 rounded-2xl border text-xs flex items-center gap-1.5 transition-all ${
              showAdvancedFilters || dateFilter !== 'ALL' || selectedCategory !== 'ALL' || minAmount || maxAmount
                ? 'bg-[#E2B963]/15 text-[#E2B963] border-[#E2B963]/40 font-bold'
                : 'bg-[#14171E] border-white/10 text-[#9CA3AF] hover:text-white'
            }`}
            title="Filter Lanjutan"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'EXPENSE', label: 'Pengeluaran' },
            { id: 'INCOME', label: 'Pemasukan' },
            { id: 'TRANSFER', label: 'Transfer' },
            { id: 'RECURRING', label: 'Rutin / Berulang' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-[#E2B963] text-black shadow-md'
                  : 'bg-[#14171E] border border-white/5 text-[#9CA3AF] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Account Filter */}
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Filter Rekening</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                >
                  <option value="ALL">Semua Rekening</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Filter Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Urutkan Berdasarkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                >
                  <option value="DATE_DESC">Tanggal Terbaru</option>
                  <option value="DATE_ASC">Tanggal Terlama</option>
                  <option value="AMOUNT_DESC">Nominal Tertinggi</option>
                  <option value="AMOUNT_ASC">Nominal Terendah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
              {/* Date Filter Selection */}
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Rentang Waktu</label>
                <div className="grid grid-cols-4 gap-1">
                  {['ALL', 'TODAY', 'WEEK', 'MONTH'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDateFilter(d as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        dateFilter === d
                          ? 'bg-white/15 border-white text-white'
                          : 'bg-[#0B0D10] border-white/5 text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {d === 'ALL' ? 'Semua' : d === 'TODAY' ? 'Hari Ini' : d === 'WEEK' ? '7 Hari' : 'Bulan Ini'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Range Nominal (Min - Max)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="Min Rp"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-[#9CA3AF]"
                  />
                  <span className="text-[#9CA3AF]">-</span>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Max Rp"
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white placeholder-[#9CA3AF]"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('ALL');
                  setSelectedAccount('ALL');
                  setSelectedCategory('ALL');
                  setDateFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setMinAmount('');
                  setMaxAmount('');
                  setSortBy('DATE_DESC');
                }}
                className="text-xs text-[#E2B963] hover:underline font-semibold"
              >
                Reset Semua Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-[#14171E] rounded-2xl border border-white/5 p-6">
            <FileText className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-40" />
            <p className="text-sm font-bold text-[#F7F6F2]">Tidak Ada Catatan Transaksi Ditemukan</p>
            <p className="text-xs text-[#9CA3AF]">
              Coba atur ulang kata kunci pencarian atau sesuaikan filter Anda.
            </p>
          </div>
        ) : (
          sortedTransactions.map((tx) => {
            const isExpense = tx.type === 'EXPENSE';
            const isIncome = tx.type === 'INCOME';
            const acc = accounts.find((a) => a.id === tx.accountId);
            const targetAcc = tx.targetAccountId ? accounts.find((a) => a.id === tx.targetAccountId) : null;
            const categoryObj = categories.find((c) => c.id === tx.categoryId);

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-[#E2B963]/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl text-white shadow-sm ${
                      isIncome
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isExpense
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isExpense ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Repeat className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#F7F6F2] group-hover:text-[#E2B963] transition-colors">
                        {tx.vendor || tx.merchant || tx.notes || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                      </p>
                      {tx.isRecurring && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-0.5">
                          <Repeat className="w-2.5 h-2.5" /> Rutin
                        </span>
                      )}
                      {tx.receiptUrl && (
                        <span title="Ada Struk/Attachment">
                          <Paperclip className="w-3 h-3 text-[#E2B963]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1.5 mt-0.5">
                      <span>{acc?.name || 'Rekening'}</span>
                      {targetAcc && (
                        <>
                          <ArrowRight className="w-2.5 h-2.5 text-sky-400" />
                          <span>{targetAcc.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{categoryObj?.name || tx.categoryId}</span>
                      <span>•</span>
                      <span>{formatDateID(tx.date)}</span>
                    </p>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="text-right">
                  <p
                    className={`text-xs font-extrabold ${
                      isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : 'text-sky-400'
                    }`}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''} {formatRp(tx.amount)}
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] font-mono">{tx.time || '12:00'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - Transaction Detail */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#F7F6F2]">Detail Transaksi</h3>
              <button onClick={() => setSelectedTx(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{selectedTx.type}</p>
              <p className={`text-2xl font-black ${
                selectedTx.type === 'INCOME' ? 'text-emerald-400' : selectedTx.type === 'EXPENSE' ? 'text-rose-400' : 'text-sky-400'
              }`}>
                {formatRp(selectedTx.amount)}
              </p>
              <p className="text-xs text-white font-bold">{selectedTx.vendor || selectedTx.merchant || 'Transaksi LUXFIN'}</p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between py-1.5">
                <span className="text-[#9CA3AF]">Tanggal & Waktu</span>
                <span className="text-white font-semibold">{formatDateID(selectedTx.date)} {selectedTx.time || ''}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#9CA3AF]">Rekening</span>
                <span className="text-white font-semibold">
                  {accounts.find((a) => a.id === selectedTx.accountId)?.name || selectedTx.accountId}
                  {selectedTx.targetAccountId && (
                    <span className="text-sky-400"> → {accounts.find((a) => a.id === selectedTx.targetAccountId)?.name}</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#9CA3AF]">Kategori</span>
                <span className="text-white font-semibold">
                  {categories.find((c) => c.id === selectedTx.categoryId)?.name || selectedTx.categoryId}
                </span>
              </div>

              {selectedTx.notes && (
                <div className="py-1.5">
                  <span className="text-[#9CA3AF] block mb-0.5">Catatan</span>
                  <p className="text-white bg-slate-950 p-2.5 rounded-lg border border-slate-800">{selectedTx.notes}</p>
                </div>
              )}

              {selectedTx.tags && selectedTx.tags.length > 0 && (
                <div className="py-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#9CA3AF]">Tags:</span>
                  {selectedTx.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-[#E2B963]/15 text-[#E2B963] font-mono text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedTx.receiptUrl && (
                <div className="py-2">
                  <span className="text-[#9CA3AF] block mb-1">Lampiran Struk / Bukti:</span>
                  <img
                    src={selectedTx.receiptUrl}
                    alt="Receipt Attachment"
                    className="max-h-40 rounded-xl border border-white/10 mx-auto object-cover"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => setDeletingTx(selectedTx)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedTx)}
                  className="px-4 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Delete Confirmation */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Transaksi</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Apakah Anda yakin ingin menghapus catatan {deletingTx.vendor || deletingTx.notes || 'transaksi ini'} sebesar{' '}
                <strong className="text-white">{formatRp(deletingTx.amount)}</strong>?
                Tindakan ini akan mengembalikan saldo rekening secara otomatis.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Edit / Add Transaction */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-[#F7F6F2]">Edit Transaksi Keuangan</h3>
              <button onClick={() => setEditingTx(null)} className="p-1 text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckAndSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      txType === t
                        ? t === 'EXPENSE'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : t === 'INCOME'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-[#0B0D10] border-white/10 text-[#9CA3AF]'
                    }`}
                  >
                    {t === 'EXPENSE' ? 'Pengeluaran' : t === 'INCOME' ? 'Pemasukan' : 'Transfer'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-[#E2B963] font-bold text-base focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Merchant / Vendor</label>
                  <input
                    type="text"
                    value={txVendor}
                    onChange={(e) => setTxVendor(e.target.value)}
                    placeholder="Starbucks, Tokopedia, Klien..."
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening {txType === 'TRANSFER' ? 'Sumber' : ''}</label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                  >
                    <option value="">-- Pilih Rekening --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                    ))}
                  </select>
                </div>

                {txType === 'TRANSFER' ? (
                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening Tujuan</label>
                    <select
                      value={txTargetAccountId}
                      onChange={(e) => setTxTargetAccountId(e.target.value)}
                      required
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                    >
                      <option value="">-- Pilih Tujuan --</option>
                      {accounts.filter((a) => a.id !== txAccountId).map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Kategori</label>
                    <select
                      value={txCategoryId}
                      onChange={(e) => setTxCategoryId(e.target.value)}
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                    >
                      {categories
                        .filter((c) => c.type === (txType === 'INCOME' ? 'INCOME' : 'EXPENSE'))
                        .map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Tanggal</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Waktu</label>
                  <input
                    type="time"
                    value={txTime}
                    onChange={(e) => setTxTime(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Catatan transaksi opsional..."
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Tags (Pisahkan koma)</label>
                <input
                  type="text"
                  value={txTagsInput}
                  onChange={(e) => setTxTagsInput(e.target.value)}
                  placeholder="Makan, Kantor, Liburan..."
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E2B963] text-black font-bold shadow-md hover:opacity-90"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Warning Sheet Modal */}
      {duplicateSuspects.length > 0 && pendingTxToSave && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171E] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Deteksi Duplikasi Transaksi!</h3>
                <p className="text-xs text-amber-300">Ditemukan transaksi serupa dalam 7 hari terakhir.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-300">Transaksi Baru Yang Akan Disimpan:</p>
              <div className="flex items-center justify-between text-white font-mono">
                <span>{pendingTxToSave.vendor || pendingTxToSave.notes || 'Transaksi'}</span>
                <span className="font-bold text-[#E2B963]">{formatRp(pendingTxToSave.amount || 0)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">Transaksi Mirip di Riwayat:</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {duplicateSuspects.map((dup) => (
                  <div key={dup.id} className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-amber-200">{dup.vendor || dup.notes || 'Transaksi'}</p>
                      <p className="text-[10px] text-amber-400/80">{dup.date} • {dup.categoryId}</p>
                    </div>
                    <p className="font-mono font-bold text-amber-300">{formatRp(dup.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setDuplicateSuspects([]);
                  setPendingTxToSave(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
              >
                Batal / Periksa Lagi
              </button>

              <button
                onClick={() => executeSaveTransaction(pendingTxToSave)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
              >
                Tetap Simpan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt 11 Modals */}
      <ReceiptScannerModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ExportHubModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

