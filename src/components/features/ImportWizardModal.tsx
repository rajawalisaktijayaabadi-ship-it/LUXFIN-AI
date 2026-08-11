import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  History,
  FileText,
  Copy,
  Info,
  Check,
  ShieldCheck,
  Download,
} from 'lucide-react';
import Papa from 'papaparse';
import { storage } from '../../utils/storage';
import { ImportLog, TransactionType } from '../../types';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'UPLOAD' | 'MAPPING' | 'PREVIEW' | 'VALIDATION' | 'EXECUTION' | 'HISTORY';

interface ColumnMapping {
  date: string;
  type: string;
  amount: string;
  category: string;
  vendor: string;
  account: string;
  notes: string;
}

interface ParsedRow {
  index: number;
  raw: Record<string, any>;
  mapped: {
    date: string;
    type: TransactionType;
    amount: number;
    category: string;
    vendor: string;
    account: string;
    notes: string;
  };
  isDuplicate: boolean;
  isValid: boolean;
  validationError?: string;
  selected: boolean;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<WizardStep>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Column Mapping
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    type: '',
    amount: '',
    category: '',
    vendor: '',
    account: '',
    notes: '',
  });

  const [aiMappingActive, setAiMappingActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Import Status
  const [importing, setImporting] = useState(false);
  const [lastImportLog, setLastImportLog] = useState<ImportLog | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const state = storage.getState();
  const accounts = state.accounts || [];
  const categories = state.categories || [];
  const existingTransactions = state.transactions || [];
  const importHistory = storage.getImportLogs();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          if (Array.isArray(content)) {
            const headers = Object.keys(content[0] || {});
            setFileHeaders(headers);
            setRawRows(content);
            autoDetectMapping(headers);
            setStep('MAPPING');
          } else {
            alert('File JSON harus berisi array daftar transaksi.');
          }
        } catch (err: any) {
          alert('Format JSON tidak valid.');
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      // CSV or XLSX parsed as text via PapaParse
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields && results.data) {
            setFileHeaders(results.meta.fields);
            setRawRows(results.data as Record<string, any>[]);
            autoDetectMapping(results.meta.fields);
            setStep('MAPPING');
          } else {
            alert('Gagal membaca kolom file CSV/XLSX.');
          }
        },
        error: (err) => {
          alert(`Gagal memproses file: ${err.message}`);
        },
      });
    }
  };

  const autoDetectMapping = (headers: string[]) => {
    const findHeader = (keywords: string[]) => {
      return headers.find((h) =>
        keywords.some((k) => h.toLowerCase().includes(k.toLowerCase()))
      ) || '';
    };

    setMapping({
      date: findHeader(['date', 'tanggal', 'time', 'tgl']),
      type: findHeader(['type', 'tipe', 'jenis', 'kind']),
      amount: findHeader(['amount', 'nominal', 'jumlah', 'value', 'harga', 'total']),
      category: findHeader(['category', 'kategori', 'cat']),
      vendor: findHeader(['vendor', 'merchant', 'penerima', 'toko', 'payee', 'description']),
      account: findHeader(['account', 'akun', 'rekening', 'bank']),
      notes: findHeader(['notes', 'catatan', 'keterangan', 'memo']),
    });
  };

  const handleAiAutoMap = () => {
    setAiMappingActive(true);
    setTimeout(() => {
      autoDetectMapping(fileHeaders);
      setAiMappingActive(false);
    }, 600);
  };

  const processMappingAndPreview = () => {
    if (!mapping.amount) {
      alert('Kolom Nominal/Amount wajib dipetakan!');
      return;
    }

    const processed: ParsedRow[] = rawRows.map((row, idx) => {
      const rawDate = row[mapping.date] || new Date().toISOString().substring(0, 10);
      const rawAmount = parseFloat(String(row[mapping.amount] || '0').replace(/[^0-9.-]/g, '')) || 0;
      const rawVendor = String(row[mapping.vendor] || 'Imported Transaction').trim();
      const rawCategory = String(row[mapping.category] || 'Umum').trim();
      const rawAccount = String(row[mapping.account] || '').trim();
      const rawNotes = String(row[mapping.notes] || '').trim();

      // Normalize Type
      let type: TransactionType = 'EXPENSE';
      const typeStr = String(row[mapping.type] || '').toLowerCase();
      if (typeStr.includes('inc') || typeStr.includes('masuk') || typeStr.includes('pemasukan') || rawAmount < 0) {
        type = 'INCOME';
      } else if (typeStr.includes('trans') || typeStr.includes('pindah')) {
        type = 'TRANSFER';
      }

      const normAmount = Math.abs(rawAmount);

      // Duplicate Check
      const isDuplicate = existingTransactions.some((t) => {
        const sameAmount = Math.abs(t.amount) === normAmount;
        const sameVendor = t.vendor?.toLowerCase() === rawVendor.toLowerCase();
        const sameDate = t.date === rawDate;
        return sameAmount && (sameVendor || sameDate);
      });

      // Validation check
      let isValid = true;
      let validationError = '';

      if (normAmount <= 0) {
        isValid = false;
        validationError = 'Nominal bernilai Rp 0 atau tidak valid.';
      }

      return {
        index: idx + 1,
        raw: row,
        mapped: {
          date: rawDate,
          type,
          amount: normAmount,
          category: rawCategory,
          vendor: rawVendor,
          account: rawAccount,
          notes: rawNotes,
        },
        isDuplicate,
        isValid,
        validationError,
        selected: !isDuplicate && isValid,
      };
    });

    setParsedRows(processed);
    setStep('PREVIEW');
  };

  const handleExecuteImport = () => {
    setImporting(true);

    setTimeout(() => {
      let importedCount = 0;
      let skippedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;
      const errors: { row: number; field: string; message: string }[] = [];

      const targetAccount = accounts[0]?.id || 'acc_main';

      parsedRows.forEach((row) => {
        if (!row.isValid) {
          errorCount++;
          errors.push({
            row: row.index,
            field: 'amount',
            message: row.validationError || 'Data tidak valid',
          });
          return;
        }

        if (row.isDuplicate && skipDuplicates) {
          duplicateCount++;
          skippedCount++;
          return;
        }

        if (!row.selected) {
          skippedCount++;
          return;
        }

        try {
          // Find or fallback category
          const matchedCategory =
            categories.find(
              (c) => c.name.toLowerCase() === row.mapped.category.toLowerCase()
            ) || categories[0];

          // Find or fallback account
          const matchedAccount =
            accounts.find(
              (a) => a.name.toLowerCase().includes(row.mapped.account.toLowerCase())
            ) || accounts[0];

          storage.addTransaction({
            userId: state.user?.id || 'usr_01',
            type: row.mapped.type,
            amount: row.mapped.amount,
            accountId: matchedAccount ? matchedAccount.id : targetAccount,
            categoryId: matchedCategory ? matchedCategory.id : 'cat_food',
            vendor: row.mapped.vendor,
            merchant: row.mapped.vendor,
            date: row.mapped.date,
            status: 'COMPLETED',
            notes: row.mapped.notes ? `[Import CSV] ${row.mapped.notes}` : '[Import CSV]',
          });

          importedCount++;
        } catch (err: any) {
          errorCount++;
          errors.push({
            row: row.index,
            field: 'system',
            message: err.message || 'Gagal menyimpan transaksi ke storage.',
          });
        }
      });

      const log = storage.addImportLog({
        fileName: file?.name || 'imported_data.csv',
        fileType: (file?.name.split('.').pop()?.toUpperCase() as any) || 'CSV',
        totalRows: parsedRows.length,
        importedRows: importedCount,
        skippedRows: skippedCount,
        duplicateRows: duplicateCount,
        errorCount,
        errors,
        status: errorCount > 0 ? (importedCount > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
      });

      setLastImportLog(log);
      setImporting(false);
      setStep('EXECUTION');

      if (onSuccess) onSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#12151D] border border-[#E2B963]/30 rounded-3xl p-5 text-white flex flex-col space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#E2B963]/10 border border-[#E2B963]/30 text-[#E2B963]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Wisard Import Data Keuangan
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30">
                  CSV / XLSX / JSON
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Import riwayat transaksi dengan pemetaan kolom otomatis & deteksi duplikat.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('HISTORY')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-[#E2B963]" /> Riwayat
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Stepper Bar */}
        {step !== 'HISTORY' && (
          <div className="grid grid-cols-4 gap-1 border-b border-white/10 pb-3 text-[11px]">
            <div
              className={`p-1.5 rounded-xl text-center font-bold flex items-center justify-center gap-1 ${
                step === 'UPLOAD' ? 'bg-[#E2B963] text-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              1. Unggah File
            </div>
            <div
              className={`p-1.5 rounded-xl text-center font-bold flex items-center justify-center gap-1 ${
                step === 'MAPPING' ? 'bg-[#E2B963] text-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              2. Pemetaan Kolom
            </div>
            <div
              className={`p-1.5 rounded-xl text-center font-bold flex items-center justify-center gap-1 ${
                step === 'PREVIEW' ? 'bg-[#E2B963] text-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              3. Pratinjau & Duplikat
            </div>
            <div
              className={`p-1.5 rounded-xl text-center font-bold flex items-center justify-center gap-1 ${
                step === 'EXECUTION' ? 'bg-[#E2B963] text-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              4. Laporan Hasil
            </div>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'UPLOAD' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 hover:border-[#E2B963] rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-white/5 space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1C202B] text-[#E2B963] flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Unggah File Transaksi</p>
                <p className="text-[11px] text-gray-400 mt-1">Dukungan CSV, Excel (XLSX), atau JSON Backup</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200">
                Pilih File dari Perangkat
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 'MAPPING' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181B22] border border-white/10">
              <div className="text-xs">
                <span className="text-gray-400">File Terbaca: </span>
                <span className="font-bold text-white">{file?.name}</span>
                <span className="text-gray-500 ml-2">({rawRows.length} baris data)</span>
              </div>

              <button
                onClick={handleAiAutoMap}
                disabled={aiMappingActive}
                className="px-3 py-1.5 rounded-xl bg-[#E2B963]/10 hover:bg-[#E2B963]/20 border border-[#E2B963]/30 text-[#E2B963] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiMappingActive ? 'Menganalisis Kolom...' : 'Pemetaan Otomatis AI'}
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Sesuaikan nama kolom dari file Anda dengan atribut transaksi LUXFIN AI:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">
                  Nominal / Amount <span className="text-rose-400">*Wajib</span>
                </label>
                <select
                  value={mapping.amount}
                  onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Nominal --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Tanggal Transaksi</label>
                <select
                  value={mapping.date}
                  onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Tanggal --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Vendor / Merchant / Deskripsi</label>
                <select
                  value={mapping.vendor}
                  onChange={(e) => setMapping({ ...mapping, vendor: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Vendor --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Kategori</label>
                <select
                  value={mapping.category}
                  onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Kategori --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Jenis / Tipe Transaksi</label>
                <select
                  value={mapping.type}
                  onChange={(e) => setMapping({ ...mapping, type: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Tipe --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Akun / Rekening</label>
                <select
                  value={mapping.account}
                  onChange={(e) => setMapping({ ...mapping, account: e.target.value })}
                  className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2 text-white focus:border-[#E2B963]"
                >
                  <option value="">-- Pilih Kolom Akun --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setStep('UPLOAD')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
              <button
                onClick={processMappingAndPreview}
                className="px-5 py-2 rounded-xl bg-[#E2B963] hover:bg-[#b8860b] text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                Lanjut Pratinjau <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW & DUPLICATE DETECTION */}
        {step === 'PREVIEW' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181B22] border border-white/10 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">
                  Total Data: <strong className="text-white">{parsedRows.length}</strong>
                </span>
                <span className="text-amber-400 font-semibold">
                  Potensi Duplikat:{' '}
                  <strong>{parsedRows.filter((r) => r.isDuplicate).length}</strong>
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-300">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded accent-[#E2B963]"
                />
                Abaikan Duplikat Otomatis
              </label>
            </div>

            {/* Preview Table */}
            <div className="border border-white/10 rounded-2xl overflow-x-auto max-h-64 bg-[#181B22]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1C202B] text-gray-400 border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="p-2.5">Tgl</th>
                    <th className="p-2.5">Vendor</th>
                    <th className="p-2.5">Nominal</th>
                    <th className="p-2.5">Tipe</th>
                    <th className="p-2.5">Status Duplikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.index}
                      className={row.isDuplicate ? 'bg-amber-500/10' : !row.isValid ? 'bg-rose-500/10' : ''}
                    >
                      <td className="p-2.5 text-gray-300">{row.mapped.date}</td>
                      <td className="p-2.5 font-bold text-white">{row.mapped.vendor}</td>
                      <td className="p-2.5 text-[#E2B963] font-mono font-bold">
                        Rp {row.mapped.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px]">
                          {row.mapped.type}
                        </span>
                      </td>
                      <td className="p-2.5">
                        {row.isDuplicate ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            ⚠️ Terdeteksi Duplikat
                          </span>
                        ) : !row.isValid ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            ❌ Format Salah
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            ✅ Siap Import
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={() => setStep('MAPPING')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali Pemetaan
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-5 py-2 rounded-xl bg-[#E2B963] hover:bg-[#b8860b] text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {importing ? 'Proses Import...' : 'Eksekusi Import Data'} <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT EXECUTION REPORT */}
        {step === 'EXECUTION' && lastImportLog && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Import Selesai Ditransformasi</h3>
              <p className="text-xs text-gray-400 mt-1">Data transaksi telah berhasil disinkronkan ke dalam LUXFIN AI.</p>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full max-w-md text-xs">
              <div className="p-2.5 rounded-2xl bg-[#181B22] border border-white/10">
                <span className="text-gray-400 text-[10px] block">Total Rows</span>
                <strong className="text-white text-sm">{lastImportLog.totalRows}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#181B22] border border-emerald-500/30">
                <span className="text-gray-400 text-[10px] block">Berhasil</span>
                <strong className="text-emerald-400 text-sm">{lastImportLog.importedRows}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#181B22] border border-amber-500/30">
                <span className="text-gray-400 text-[10px] block">Dilewati</span>
                <strong className="text-amber-400 text-sm">{lastImportLog.skippedRows}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#181B22] border border-rose-500/30">
                <span className="text-gray-400 text-[10px] block">Gagal</span>
                <strong className="text-rose-400 text-sm">{lastImportLog.errorCount}</strong>
              </div>
            </div>

            {lastImportLog.errors.length > 0 && (
              <div className="w-full max-w-md p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left text-xs space-y-1">
                <h4 className="font-bold text-rose-300">Laporan Error ({lastImportLog.errors.length}):</h4>
                <ul className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] text-rose-200">
                  {lastImportLog.errors.map((e, idx) => (
                    <li key={idx}>
                      Baris {e.row}: [{e.field}] {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#E2B963] text-black text-xs font-bold hover:brightness-110 shadow-md"
            >
              Selesai & Tutup
            </button>
          </div>
        )}

        {/* STEP 5: HISTORY & ERROR LOGS */}
        {step === 'HISTORY' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#E2B963]" /> Riwayat Aktivitas Import
            </h4>

            {importHistory.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">Belum ada riwayat aktivitas import file.</p>
            ) : (
              <div className="space-y-2">
                {importHistory.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-[#181B22] border border-white/10 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{log.fileName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                      <span>Tanggal: {new Date(log.timestamp).toLocaleString('id-ID')}</span>
                      <span>Berhasil: {log.importedRows}/{log.totalRows}</span>
                      <span>Duplikat: {log.duplicateRows}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3">
              <button
                onClick={() => setStep('UPLOAD')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200"
              >
                Mulai Import Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
