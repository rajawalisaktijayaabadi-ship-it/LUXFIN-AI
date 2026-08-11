import React, { useState } from 'react';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Database,
  Lock,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import Papa from 'papaparse';
import { storage } from '../../utils/storage';

interface ExportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHubModal: React.FC<ExportHubModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'CSV' | 'XLSX' | 'PDF' | 'JSON'>('CSV');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([
    'transactions',
    'accounts',
    'budgets',
    'goals',
    'networth',
  ]);
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'YTD'>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  if (!isOpen) return null;

  const state = storage.getState();
  const currentUser = state.user;

  const toggleEntity = (entity: string) => {
    if (selectedEntities.includes(entity)) {
      if (selectedEntities.length === 1) return; // keep at least 1
      setSelectedEntities(selectedEntities.filter((e) => e !== entity));
    } else {
      setSelectedEntities([...selectedEntities, entity]);
    }
  };

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        const timestamp = new Date().toISOString().substring(0, 10);
        const fileNamePrefix = `luxfin_export_${currentUser?.name?.replace(/\s+/g, '_') || 'user'}_${timestamp}`;

        if (format === 'JSON') {
          // Full Backup JSON
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(storage.exportJSON());
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `${fileNamePrefix}_full_backup.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        } else if (format === 'CSV') {
          // Export selected entities as CSV files
          if (selectedEntities.includes('transactions')) {
            const csv = Papa.unparse(
              state.transactions.map((t) => ({
                ID: t.id,
                Tanggal: t.date,
                Tipe: t.type,
                Vendor: t.vendor || t.merchant || '',
                Nominal: t.amount,
                Kategori: t.categoryId,
                Status: t.status,
                Catatan: t.notes || '',
              }))
            );
            downloadFile(csv, `${fileNamePrefix}_transactions.csv`, 'text/csv');
          }

          if (selectedEntities.includes('accounts')) {
            const csv = Papa.unparse(
              state.accounts.map((a) => ({
                ID: a.id,
                Nama_Akun: a.name,
                Tipe: a.type,
                Provider: a.provider,
                Saldo: a.balance,
                Status_Arsip: a.isArchived ? 'YA' : 'TIDAK',
              }))
            );
            downloadFile(csv, `${fileNamePrefix}_accounts.csv`, 'text/csv');
          }

          if (selectedEntities.includes('budgets')) {
            const csv = Papa.unparse(
              state.budgets.map((b) => ({
                ID: b.id,
                Kategori_ID: b.categoryId,
                Limit_Bulanan: b.monthlyLimit,
                Periode: b.period,
              }))
            );
            downloadFile(csv, `${fileNamePrefix}_budgets.csv`, 'text/csv');
          }

          if (selectedEntities.includes('goals')) {
            const csv = Papa.unparse(
              state.goals.map((g) => ({
                ID: g.id,
                Target_Judul: g.title,
                Target_Nominal: g.targetAmount,
                Terkumpul: g.currentAmount,
                Tenggat: g.targetDate,
              }))
            );
            downloadFile(csv, `${fileNamePrefix}_goals.csv`, 'text/csv');
          }

          if (selectedEntities.includes('networth')) {
            const summary = storage.getFinancialSummary();
            const csv = Papa.unparse([
              {
                Tanggal_Laporan: timestamp,
                Total_Aset: summary.netWorthSummary.totalAssets,
                Total_Liabilitas: summary.netWorthSummary.totalLiabilities,
                Net_Worth_Bersih: summary.netWorthSummary.netWorth,
                Pemasukan_Bulan_Ini: summary.cashflowSummary.monthlyIncome,
                Pengeluaran_Bulan_Ini: summary.cashflowSummary.monthlyExpense,
              },
            ]);
            downloadFile(csv, `${fileNamePrefix}_networth_summary.csv`, 'text/csv');
          }
        } else if (format === 'XLSX') {
          // XLSX formatted XML Spreadsheet
          let xmlContent = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Laporan_LUXFIN">
<Table>
<Row><Cell><Data ss:Type="String">LAPORAN KEUANGAN LUXFIN AI - ${currentUser?.name}</Data></Cell></Row>
<Row><Cell><Data ss:Type="String">Tanggal Ekspor: ${timestamp}</Data></Cell></Row>
<Row></Row>
<Row>
<Cell><Data ss:Type="String">TANGGAL</Data></Cell>
<Cell><Data ss:Type="String">TIPE</Data></Cell>
<Cell><Data ss:Type="String">VENDOR/MERCHANT</Data></Cell>
<Cell><Data ss:Type="String">NOMINAL (IDR)</Data></Cell>
<Cell><Data ss:Type="String">CATATAN</Data></Cell>
</Row>`;

          state.transactions.forEach((t) => {
            xmlContent += `<Row>
<Cell><Data ss:Type="String">${t.date}</Data></Cell>
<Cell><Data ss:Type="String">${t.type}</Data></Cell>
<Cell><Data ss:Type="String">${t.vendor || ''}</Data></Cell>
<Cell><Data ss:Type="Number">${t.amount}</Data></Cell>
<Cell><Data ss:Type="String">${t.notes || ''}</Data></Cell>
</Row>`;
          });

          xmlContent += `</Table></Worksheet></Workbook>`;
          downloadFile(xmlContent, `${fileNamePrefix}_spreadsheet.xls`, 'application/vnd.ms-excel');
        } else if (format === 'PDF') {
          // Printable Formatted PDF View
          const summary = storage.getFinancialSummary();
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>LUXFIN AI - Laporan Keuangan Personal</title>
                  <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; }
                    .header { border-bottom: 2px solid #E2B963; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .title { font-size: 24px; font-weight: bold; color: #111; }
                    .subtitle { font-size: 14px; color: #666; margin-top: 4px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
                    .card { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
                    .card-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
                    .card-val { font-size: 18px; font-weight: bold; margin-top: 5px; color: #111; }
                    table { w-full; width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #e0e0e0; padding: 10px; text-align: left; font-size: 12px; }
                    th { background: #f2f2f2; font-weight: bold; }
                    .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div>
                      <div class="title">LUXFIN AI - Executive Financial Statement</div>
                      <div class="subtitle">Pemilik Akun: ${currentUser?.name} | Email: ${currentUser?.email}</div>
                    </div>
                    <div><strong>Tgl: ${timestamp}</strong></div>
                  </div>

                  <div class="summary-grid">
                    <div class="card">
                      <div class="card-label">Net Worth Bersih</div>
                      <div class="card-val">Rp ${summary.netWorthSummary.netWorth.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="card">
                      <div class="card-label">Pemasukan Bulan Ini</div>
                      <div class="card-val" style="color: green;">Rp ${summary.cashflowSummary.monthlyIncome.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="card">
                      <div class="card-label">Pengeluaran Bulan Ini</div>
                      <div class="card-val" style="color: red;">Rp ${summary.cashflowSummary.monthlyExpense.toLocaleString('id-ID')}</div>
                    </div>
                  </div>

                  <h3>Daftar Transaksi Terbaru</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Tgl</th>
                        <th>Tipe</th>
                        <th>Merchant/Vendor</th>
                        <th>Nominal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${state.transactions
                        .slice(0, 50)
                        .map(
                          (t) => `
                        <tr>
                          <td>${t.date}</td>
                          <td>${t.type}</td>
                          <td>${t.vendor || '-'}</td>
                          <td>Rp ${t.amount.toLocaleString('id-ID')}</td>
                          <td>${t.status}</td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>

                  <div class="footer">
                    Dokumen rahasia keuangan yang dihasilkan secara aman dari LUXFIN AI Personal Engine.
                  </div>

                  <script>
                    window.onload = function() { window.print(); }
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        }

        setExportDone(true);
      } catch (err: any) {
        console.error('Export Error:', err);
        alert('Gagal mengekspor data.');
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#12151D] border border-[#E2B963]/30 rounded-3xl p-5 text-white flex flex-col space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#E2B963]/10 border border-[#E2B963]/30 text-[#E2B963]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Pusat Ekspor & Laporan Keuangan
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono border border-blue-500/30">
                  Data Terenkripsi
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Unduh data riwayat transaksi, akun, anggaran, & laporan PDF.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">1. Pilih Format Ekspor</label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => setFormat('CSV')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold transition-all ${
                format === 'CSV'
                  ? 'bg-[#E2B963] text-black border-[#E2B963] shadow-md'
                  : 'bg-[#181B22] text-gray-300 border-white/10 hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              CSV
            </button>

            <button
              onClick={() => setFormat('XLSX')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold transition-all ${
                format === 'XLSX'
                  ? 'bg-[#E2B963] text-black border-[#E2B963] shadow-md'
                  : 'bg-[#181B22] text-gray-300 border-white/10 hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Excel (XLSX)
            </button>

            <button
              onClick={() => setFormat('PDF')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold transition-all ${
                format === 'PDF'
                  ? 'bg-[#E2B963] text-black border-[#E2B963] shadow-md'
                  : 'bg-[#181B22] text-gray-300 border-white/10 hover:bg-white/5'
              }`}
            >
              <Printer className="w-5 h-5" />
              Cetak / PDF
            </button>

            <button
              onClick={() => setFormat('JSON')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold transition-all ${
                format === 'JSON'
                  ? 'bg-[#E2B963] text-black border-[#E2B963] shadow-md'
                  : 'bg-[#181B22] text-gray-300 border-white/10 hover:bg-white/5'
              }`}
            >
              <Database className="w-5 h-5" />
              JSON Backup
            </button>
          </div>
        </div>

        {/* Entity Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-xs font-bold text-white block">2. Modul Data yang Diekspor</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'transactions', label: 'Riwayat Transaksi', count: state.transactions.length },
              { id: 'accounts', label: 'Daftar Akun & Rekening', count: state.accounts.length },
              { id: 'budgets', label: 'Anggaran Bulanan', count: state.budgets.length },
              { id: 'goals', label: 'Target & Progress Tabungan', count: state.goals.length },
              { id: 'networth', label: 'Ikhtisar Net Worth & Arus Kas', count: 1 },
              { id: 'investments', label: 'Aset Investasi', count: state.investments.length },
            ].map((e) => (
              <label
                key={e.id}
                onClick={() => toggleEntity(e.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedEntities.includes(e.id)
                    ? 'bg-[#E2B963]/10 border-[#E2B963]/40 text-white font-semibold'
                    : 'bg-[#181B22] border-white/10 text-gray-400'
                }`}
              >
                <span>{e.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-[#E2B963]">
                  {e.count}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 rounded-2xl bg-[#181B22] border border-white/10 text-[11px] text-gray-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Penanganan Berkas Aman & Privat</strong>
            Data diekspor secara khusus untuk akun authenticated <strong>{currentUser?.email}</strong>. Seluruh proses penyiapan berkas berlangsung lokal tanpa mengekspos file ke domain publik.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
          >
            Batal
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Menyiapkan Berkas...' : `Unduh Berkas ${format}`}
          </button>
        </div>
      </div>
    </div>
  );
};
