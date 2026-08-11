import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  ArrowRight,
  Receipt,
  FileText,
  Calendar,
  Wallet,
  Tag,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { TransactionType } from '../../types';
import { formatRp } from '../../utils/formatters';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'text' | 'ocr' | 'manual';
}

export const SmartAddModal: React.FC<SmartAddModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'text',
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'ocr' | 'manual'>(defaultMode);
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmation Sheet State before saving
  const [parsedData, setParsedData] = useState<{
    type: TransactionType;
    amount: number;
    accountId: string;
    targetAccountId?: string;
    categoryId: string;
    subcategory?: string;
    vendor?: string;
    notes?: string;
    tags?: string[];
    date: string;
    time?: string;
    items?: { name: string; price: number; qty: number }[];
  } | null>(null);

  // Manual Form State
  const [manualType, setManualType] = useState<TransactionType>('EXPENSE');
  const [manualAmount, setManualAmount] = useState('');
  const [manualAccount, setManualAccount] = useState('');
  const [manualTargetAccount, setManualTargetAccount] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualVendor, setManualVendor] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTags, setManualTags] = useState('');

  // Duplicate warning state
  const [duplicateSuspects, setDuplicateSuspects] = useState<any[]>([]);

  const state = storage.getState();
  const accounts = state.accounts;
  const categories = state.categories;

  if (!isOpen) return null;

  const defaultAccId = accounts[0]?.id || 'acc_bca';
  const defaultCatId = categories[0]?.id || 'cat_exp_food';

  // Quick NL Examples
  const quickExamples = [
    'Tadi makan ayam geprek 25000 pakai BCA',
    'Gaji bulanan masuk 15000000 ke Mandiri',
    'Transfer 500000 dari BCA ke Gopay',
    'Beli kopi starbucks 55000 cash',
  ];

  // Handle Natural Language Parse via Server API
  const handleParseText = async (textToParse?: string) => {
    const query = textToParse || promptText;
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setParsedData(null);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: query,
          availableAccounts: accounts.map((a) => ({ id: a.id, name: a.name, provider: a.provider })),
          availableCategories: categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses kalimat dengan AI.');
      }

      const p = data.parsed;
      const detectedAccount = accounts.find((a) => a.id === p.accountId) ? p.accountId : defaultAccId;
      const detectedCat = categories.find((c) => c.id === p.categoryId) ? p.categoryId : defaultCatId;

      setParsedData({
        type: p.type || 'EXPENSE',
        amount: Number(p.amount) || 0,
        accountId: detectedAccount,
        targetAccountId: p.targetAccountId || undefined,
        categoryId: detectedCat,
        subcategory: p.subcategory || '',
        vendor: p.vendor || '',
        notes: p.notes || query,
        tags: p.tags || ['SmartAI'],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan jaringan server AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Receipt Image Upload & OCR
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');
    setParsedData(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/ai/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal membaca struk dengan AI OCR.');
        }

        const r = data.receipt;
        setParsedData({
          type: 'EXPENSE',
          amount: Number(r.total) || 0,
          accountId: defaultAccId,
          categoryId: defaultCatId,
          vendor: r.vendor || 'Struk Belanja',
          notes: `Scan Struk AI (${r.items?.length || 0} item)`,
          date: r.date || new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          items: r.items || [],
          tags: ['ReceiptOCR'],
        });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses gambar struk.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Manual Form to Review Confirmation Sheet
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(manualAmount.replace(/[^0-9.]/g, ''));
    if (!amountVal || amountVal <= 0) return;

    setParsedData({
      type: manualType,
      amount: amountVal,
      accountId: manualAccount || defaultAccId,
      targetAccountId: manualType === 'TRANSFER' ? manualTargetAccount : undefined,
      categoryId: manualCategory || defaultCatId,
      vendor: manualVendor,
      notes: manualNotes,
      date: manualDate,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      tags: manualTags ? manualTags.split(',').map((t) => t.trim()) : ['ManualInput'],
    });
  };

  // Check Duplicates before final save
  const handlePreSaveCheck = () => {
    if (!parsedData) return;

    const duplicates = storage.detectDuplicateTransactions({
      amount: parsedData.amount,
      accountId: parsedData.accountId,
      vendor: parsedData.vendor,
      categoryId: parsedData.categoryId,
      date: parsedData.date,
    });

    if (duplicates.length > 0) {
      setDuplicateSuspects(duplicates);
    } else {
      handleFinalSave();
    }
  };

  // Final Save to Persistent Storage
  const handleFinalSave = () => {
    if (!parsedData) return;

    storage.addTransaction({
      userId: state.user.id || 'usr_01',
      type: parsedData.type,
      amount: parsedData.amount,
      accountId: parsedData.accountId,
      targetAccountId: parsedData.targetAccountId,
      categoryId: parsedData.categoryId,
      subcategory: parsedData.subcategory,
      vendor: parsedData.vendor,
      notes: parsedData.notes,
      tags: parsedData.tags,
      date: parsedData.date,
      time: parsedData.time || '12:00',
      items: parsedData.items,
      status: 'COMPLETED',
    });

    onClose();
    setParsedData(null);
    setDuplicateSuspects([]);
    setPromptText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14171E] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E2B963]/15 text-[#E2B963]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F7F6F2]">Tambah Transaksi Keuangan</h3>
              <p className="text-[10px] text-[#9CA3AF]">Input cerdas dengan NLP Indonesia & Scan OCR</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!parsedData && (
          <div className="grid grid-cols-3 gap-1 bg-[#0B0D10] p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'text' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Teks AI
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ocr' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Scan Struk
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'manual' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Manual
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-12 text-center space-y-3 bg-[#0B0D10] rounded-2xl border border-white/5 p-6">
            <Loader2 className="w-8 h-8 text-[#E2B963] animate-spin mx-auto" />
            <p className="text-xs font-bold text-white">Gemini AI Sedang Menganalisis Transaksi...</p>
            <p className="text-[10px] text-[#9CA3AF]">Mengekstrak nominal, rekening, kategori, dan detail merchant</p>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="p-1 text-rose-400 hover:text-white">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ELEGANT CONFIRMATION SHEET / REVIEW FORM */}
        {parsedData ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-3 duration-200">
            <div className="p-3 rounded-xl bg-[#E2B963]/10 border border-[#E2B963]/30 flex items-center gap-2 text-xs text-[#E2B963]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#E2B963]" />
              <span className="font-semibold">
                Mohon tinjau & sesuaikan data hasil ekstraksi AI sebelum Anda menyimpannya.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0D10] border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[#9CA3AF] font-semibold">Tipe Transaksi</span>
                <div className="flex gap-1">
                  {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setParsedData({ ...parsedData, type: t })}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                        parsedData.type === t
                          ? 'bg-[#E2B963] text-black border-[#E2B963]'
                          : 'bg-[#14171E] text-[#9CA3AF] border-white/5'
                      }`}
                    >
                      {t === 'EXPENSE' ? 'Pengeluaran' : t === 'INCOME' ? 'Pemasukan' : 'Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={parsedData.amount}
                    onChange={(e) => setParsedData({ ...parsedData, amount: Number(e.target.value) || 0 })}
                    className="w-full bg-[#14171E] border border-[#E2B963] rounded-xl px-3 py-2 text-[#E2B963] font-black text-base focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Merchant / Vendor</label>
                  <input
                    type="text"
                    value={parsedData.vendor || ''}
                    onChange={(e) => setParsedData({ ...parsedData, vendor: e.target.value })}
                    placeholder="Nama Toko / Pihak Kedua"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening Asal</label>
                  <select
                    value={parsedData.accountId}
                    onChange={(e) => setParsedData({ ...parsedData, accountId: e.target.value })}
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                    ))}
                  </select>
                </div>

                {parsedData.type === 'TRANSFER' ? (
                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening Tujuan</label>
                    <select
                      value={parsedData.targetAccountId || ''}
                      onChange={(e) => setParsedData({ ...parsedData, targetAccountId: e.target.value })}
                      className="w-full bg-[#14171E] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="">-- Pilih Rekening --</option>
                      {accounts.filter((a) => a.id !== parsedData.accountId).map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Kategori</label>
                    <select
                      value={parsedData.categoryId}
                      onChange={(e) => setParsedData({ ...parsedData, categoryId: e.target.value })}
                      className="w-full bg-[#14171E] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1 font-semibold">Catatan Transaksi</label>
                <input
                  type="text"
                  value={parsedData.notes || ''}
                  onChange={(e) => setParsedData({ ...parsedData, notes: e.target.value })}
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {parsedData.items && parsedData.items.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[#9CA3AF] mb-1 font-semibold">Daftar Rincian Struk ({parsedData.items.length} item):</p>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {parsedData.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] p-1.5 rounded bg-[#14171E] text-slate-300">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-mono">{formatRp(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Suspect Warning Sheet inside Review */}
            {duplicateSuspects.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Peringatan Potential Duplicate!</span>
                </div>
                <p className="text-[11px]">Ditemukan transaksi dengan nilai serupa baru saja dicatat dalam 7 hari terakhir.</p>
              </div>
            )}

            {/* Confirmation Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
              >
                Kembali Edit Input
              </button>

              <button
                type="button"
                onClick={duplicateSuspects.length > 0 ? handleFinalSave : handlePreSaveCheck}
                className="px-6 py-2.5 rounded-xl bg-[#E2B963] text-black font-extrabold text-xs shadow-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Konfirmasi & Simpan
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: Natural Language AI Text Input */}
            {activeTab === 'text' && !isLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#9CA3AF]">
                    Tuliskan Transaksi Menggunakan Bahasa Sehari-hari:
                  </label>
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Contoh: Tadi makan ayam geprek 25000 pakai BCA..."
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#9CA3AF] focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                {/* Quick Examples */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-[#9CA3AF] font-semibold">Contoh Kalimat Cepat:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickExamples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => {
                          setPromptText(ex);
                          handleParseText(ex);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 transition-all text-left"
                      >
                        "{ex}"
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleParseText()}
                  disabled={!promptText.trim()}
                  className="w-full py-3 rounded-xl bg-[#E2B963] disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Proses Kalimat Keuangan
                </button>
              </div>
            )}

            {/* TAB 2: OCR Scan Struk */}
            {activeTab === 'ocr' && !isLoading && (
              <div className="py-6 text-center space-y-4 bg-[#0B0D10] rounded-2xl border border-dashed border-white/15 p-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E2B963]/15 text-[#E2B963] flex items-center justify-center mx-auto">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Unggah Foto Struk / Nota Belanja</h4>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                    AI Gemini Vision akan membaca total, merchant, tanggal, dan rincian item secara otomatis
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs shadow-lg cursor-pointer hover:opacity-90 transition-all">
                  <Upload className="w-4 h-4" />
                  Pilih Gambar Struk
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* TAB 3: Form Manual */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setManualType(t)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        manualType === t
                          ? 'bg-[#E2B963] text-black border-[#E2B963]'
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
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="0"
                      required
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-[#E2B963] font-bold text-base focus:border-[#E2B963] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Merchant / Vendor</label>
                    <input
                      type="text"
                      value={manualVendor}
                      onChange={(e) => setManualVendor(e.target.value)}
                      placeholder="Nama Merchant / Toko"
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Rekening</label>
                    <select
                      value={manualAccount}
                      onChange={(e) => setManualAccount(e.target.value)}
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.provider})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#9CA3AF] mb-1 font-semibold">Kategori</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#9CA3AF] mb-1 font-semibold">Catatan</label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Keterangan transaksi..."
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E2B963] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E2B963] text-black font-bold shadow-lg hover:opacity-90 cursor-pointer"
                >
                  Tinjau Data Transaksi
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
