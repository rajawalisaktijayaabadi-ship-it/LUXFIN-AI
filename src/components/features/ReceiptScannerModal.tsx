import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Check,
  AlertTriangle,
  Loader2,
  Trash2,
  Plus,
  ShieldAlert,
  FileText,
  DollarSign,
  Calendar,
  Store,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { ReceiptOCRResult, ReceiptOCRItem } from '../../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'UPLOAD' | 'SCANNING' | 'REVIEW'>('UPLOAD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Editable Form state from OCR
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [items, setItems] = useState<ReceiptOCRItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');

  // Confidence & Uncertainty tracking
  const [confidenceScores, setConfidenceScores] = useState<ReceiptOCRResult['confidenceScores']>({
    merchant: 'HIGH',
    date: 'HIGH',
    items: 'HIGH',
    total: 'HIGH',
  });
  const [uncertainFields, setUncertainFields] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const state = storage.getState();
  const accounts = state.accounts || [];
  const categories = state.categories.filter((c) => c.type === 'EXPENSE') || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOCR = async () => {
    if (!previewUrl) return;

    setIsScanning(true);
    setStep('SCANNING');
    setScanError(null);

    try {
      const res = await fetch('/api/ai/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: selectedFile?.type || 'image/jpeg',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const ocr: ReceiptOCRResult = data.result;
        setMerchant(ocr.merchant || 'Merchant Struk');
        setDate(ocr.date || new Date().toISOString().substring(0, 10));
        setItems(ocr.items || []);
        setSubtotal(ocr.subtotal || ocr.total || 0);
        setTax(ocr.tax || 0);
        setDiscount(ocr.discount || 0);
        setTotal(ocr.total || 0);

        if (ocr.confidenceScores) setConfidenceScores(ocr.confidenceScores);
        if (ocr.uncertainFields) setUncertainFields(ocr.uncertainFields);

        // Pre-select account and category
        if (accounts.length > 0) setAccountId(accounts[0].id);
        if (categories.length > 0) setCategoryId(categories[0].id);

        setNotes(`Pindai Nota via LUX AI OCR - ${ocr.rawSummary || 'Selesai'}`);
        setStep('REVIEW');
      } else {
        throw new Error(data.error || 'Gagal mengekstrak data struk.');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setScanError(err.message || 'Gagal membaca struk secara otomatis.');
      // Fallback to manual entry step with image preview
      setMerchant('Struk Pembelian');
      setDate(new Date().toISOString().substring(0, 10));
      setTotal(0);
      setStep('REVIEW');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: 'Item Baru', quantity: 1, price: 0, total: 0 }]);
  };

  const handleUpdateItem = (index: number, field: keyof ReceiptOCRItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'price') {
      item.total = Number(item.quantity) * Number(item.price);
    }
    updated[index] = item;
    setItems(updated);

    // Recalculate subtotal & total
    const newSubtotal = updated.reduce((s, i) => s + (i.total || 0), 0);
    setSubtotal(newSubtotal);
    setTotal(Math.max(0, newSubtotal + Number(tax) - Number(discount)));
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const newSubtotal = updated.reduce((s, i) => s + (i.total || 0), 0);
    setSubtotal(newSubtotal);
    setTotal(Math.max(0, newSubtotal + Number(tax) - Number(discount)));
  };

  const handleSaveTransaction = () => {
    if (!accountId || !categoryId || total <= 0) {
      alert('Pilih Akun, Kategori, dan pastikan Total Nominal lebih besar dari Rp 0.');
      return;
    }

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);

      storage.addTransaction({
        userId: state.user?.id || 'usr_01',
        type: 'EXPENSE',
        amount: Number(total),
        accountId,
        categoryId,
        vendor: merchant,
        merchant,
        date,
        status: 'COMPLETED',
        notes: notes || 'Pembelian via OCR Nota',
        receiptUrl: previewUrl || undefined,
        attachments: previewUrl
          ? [
              {
                id: `att_${Date.now()}`,
                fileName: selectedFile?.name || 'receipt_scanned.jpg',
                fileUrl: previewUrl,
                mimeType: selectedFile?.type || 'image/jpeg',
                uploadedAt: new Date().toISOString(),
              },
            ]
          : [],
        subtotal,
        tax,
        discount,
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          qty: i.quantity,
          totalPrice: i.total,
        })),
      });

      alert('✅ Transaksi & Struk Nota Berhasil Disimpan!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      console.error('Save Transaction error:', e);
      alert(`Gagal menyimpan transaksi: ${e.message}`);
    }
  };

  const isLowConfidence = (field: string) => {
    return (
      uncertainFields.includes(field) ||
      (confidenceScores as any)[field] === 'LOW'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#12151D] border border-[#E2B963]/30 rounded-3xl p-5 text-white flex flex-col space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#E2B963]/10 border border-[#E2B963]/30 text-[#E2B963]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Scanner Struk OCR AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2B963]/15 text-[#E2B963] font-mono border border-[#E2B963]/30">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Pindai foto nota belanjaan untuk ekstrak data transaksi otomatis.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 'UPLOAD' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full max-w-xs h-64 rounded-2xl overflow-hidden border-2 border-[#E2B963] shadow-lg group">
                <img src={previewUrl} alt="Preview Struk" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 hover:border-[#E2B963] rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-white/5 space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1C202B] text-[#E2B963] flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Unggah Foto Struk Nota Belanja</p>
                  <p className="text-[11px] text-gray-400 mt-1">Format PNG, JPG, JPEG (Maks. 10MB)</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200">
                  Pilih File dari Galeri
                </button>
              </div>
            )}

            {previewUrl && (
              <button
                onClick={handleRunOCR}
                className="w-full max-w-sm py-3 rounded-2xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs hover:brightness-110 shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Ekstrak Data dengan AI OCR
              </button>
            )}
          </div>
        )}

        {/* STEP 2: SCANNING / LOADING */}
        {step === 'SCANNING' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="w-10 h-10 animate-spin text-[#E2B963]" />
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-white">Menganalisis Gambar Struk...</h4>
              <p className="text-xs text-gray-400">Gemini Vision sedang merinci merchant, tanggal, item barang & total nominal.</p>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & EDIT */}
        {step === 'REVIEW' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            {scanError && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{scanError} Anda dapat mengisi/mengoreksi data transaksi secara manual di bawah.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Image Preview & Confidence */}
              <div className="space-y-3">
                <div className="h-48 rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative">
                  <img src={previewUrl!} alt="Struk Preview" className="w-full h-full object-contain" />
                </div>

                <div className="p-3 rounded-2xl bg-[#181B22] border border-white/10 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-[11px] font-semibold">Tingkat Keakuratan (Confidence)</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-[#E2B963]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#222733]">
                      <span className="text-gray-400">Merchant</span>
                      <span className={`font-bold ${isLowConfidence('merchant') ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {confidenceScores.merchant}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#222733]">
                      <span className="text-gray-400">Tanggal</span>
                      <span className={`font-bold ${isLowConfidence('date') ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {confidenceScores.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Main Transaction Info */}
              <div className="space-y-3">
                {/* Merchant Name */}
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#E2B963]" /> Nama Merchant / Toko
                    {isLowConfidence('merchant') && (
                      <span className="text-[9px] text-amber-400 ml-auto font-bold">⚠️ Perlu Diperiksa</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className={`w-full bg-[#1C202B] border rounded-xl p-2.5 text-xs text-white focus:outline-none ${
                      isLowConfidence('merchant')
                        ? 'border-amber-400/80 bg-amber-500/5'
                        : 'border-white/10 focus:border-[#E2B963]'
                    }`}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E2B963]" /> Tanggal Transaksi
                    {isLowConfidence('date') && (
                      <span className="text-[9px] text-amber-400 ml-auto font-bold">⚠️ Perlu Diperiksa</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full bg-[#1C202B] border rounded-xl p-2.5 text-xs text-white focus:outline-none ${
                      isLowConfidence('date')
                        ? 'border-amber-400/80 bg-amber-500/5'
                        : 'border-white/10 focus:border-[#E2B963]'
                    }`}
                  />
                </div>

                {/* Account & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Simpan ke Akun</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Rp {a.balance.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Kategori Pengeluaran</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#E2B963]" /> Rincian Barang / Items
                </h4>
                <button
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#E2B963] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs bg-[#181B22] rounded-xl border border-white/5">
                  Tidak ada daftar item barang terpisah. Total transaksi dihitung dari total bersih nota.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#181B22] border border-white/10 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                          placeholder="Nama Barang"
                          className="w-full bg-[#222733] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full bg-[#222733] border border-white/10 rounded-lg p-1.5 text-xs text-white text-center"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                          placeholder="Harga Satuan"
                          className="w-full bg-[#222733] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtotal, Tax, Discount & Total Nominal Summary */}
            <div className="p-4 rounded-2xl bg-[#181B22] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Subtotal Barang</span>
                <input
                  type="number"
                  value={subtotal}
                  onChange={(e) => {
                    setSubtotal(Number(e.target.value));
                    setTotal(Number(e.target.value) + Number(tax) - Number(discount));
                  }}
                  className="bg-[#222733] border border-white/10 rounded-lg p-1 text-xs text-white text-right w-32"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Pajak (Tax / PPN)</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => {
                    setTax(Number(e.target.value));
                    setTotal(subtotal + Number(e.target.value) - discount);
                  }}
                  className="bg-[#222733] border border-white/10 rounded-lg p-1 text-xs text-white text-right w-32"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Diskon / Potongan</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(Number(e.target.value));
                    setTotal(subtotal + tax - Number(e.target.value));
                  }}
                  className="bg-[#222733] border border-white/10 rounded-lg p-1 text-xs text-white text-right w-32"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-bold text-white">
                <span className="text-[#E2B963]">Total Pengeluaran Bersih</span>
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="bg-[#222733] border border-[#E2B963] rounded-lg p-1.5 text-sm font-bold text-[#E2B963] text-right w-40"
                />
              </div>
            </div>

            {/* Confirmation Footer */}
            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setStep('UPLOAD')}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
              >
                Ganti Gambar Struk
              </button>
              <button
                onClick={handleSaveTransaction}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> Konfirmasi & Simpan Transaksi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
