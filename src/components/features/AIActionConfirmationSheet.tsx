import React, { useState } from 'react';
import { ShieldCheck, Check, X, Edit3, ArrowRight, Sparkles, DollarSign, Target, PieChart, Layers } from 'lucide-react';
import { AIProposedAction } from '../../types';
import { storage } from '../../utils/storage';

interface AIActionConfirmationSheetProps {
  action: AIProposedAction;
  messageId: string;
  onConfirmed: (actionTitle: string, details: string) => void;
  onCancelled: () => void;
}

export const AIActionConfirmationSheet: React.FC<AIActionConfirmationSheetProps> = ({
  action,
  messageId,
  onConfirmed,
  onCancelled,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Editable payload state for Review modal
  const [payloadData, setPayloadData] = useState({
    categoryName: action.payload.categoryName || 'Makanan & Minuman',
    limit: action.payload.limit || action.payload.amount || 1500000,
    title: action.payload.title || action.title || 'Target Baru',
    targetAmount: action.payload.targetAmount || action.payload.amount || 10000000,
    targetMonths: action.payload.targetMonths || 6,
    amount: action.payload.amount || 150000,
    type: action.payload.type || 'EXPENSE',
    vendor: action.payload.vendor || 'Merchant',
    notes: action.payload.notes || 'Dibuat via LUX AI Copilot',
  });

  const getActionIcon = () => {
    switch (action.type) {
      case 'CREATE_BUDGET':
        return <PieChart className="w-4 h-4 text-[#E2B963]" />;
      case 'CREATE_GOAL':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'CREATE_TRANSACTION':
        return <DollarSign className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    try {
      const state = storage.getState();

      if (action.type === 'CREATE_BUDGET') {
        const cat = state.categories.find(
          (c) => c.name.toLowerCase() === payloadData.categoryName.toLowerCase()
        ) || state.categories[0];

        storage.createBudget({
          categoryId: cat ? cat.id : 'cat_food',
          monthlyLimit: Number(payloadData.limit),
          period: new Date().toISOString().substring(0, 7),
          userId: state.user?.id || 'usr_01',
        });

        onConfirmed(
          'Budget Dibuat',
          `Batas anggaran Rp ${Number(payloadData.limit).toLocaleString('id-ID')} untuk kategori "${payloadData.categoryName}" berhasil disimpan.`
        );
      } else if (action.type === 'CREATE_GOAL') {
        const d = new Date();
        d.setMonth(d.getMonth() + Number(payloadData.targetMonths));
        const targetDate = d.toISOString().substring(0, 10);

        storage.createGoal({
          title: payloadData.title,
          targetAmount: Number(payloadData.targetAmount),
          targetDate,
          category: 'CUSTOM',
          icon: 'Target',
          userId: state.user?.id || 'usr_01',
        });

        onConfirmed(
          'Target Tabungan Dibuat',
          `Goal "${payloadData.title}" sebesar Rp ${Number(payloadData.targetAmount).toLocaleString('id-ID')} (${payloadData.targetMonths} bulan) resmi aktif.`
        );
      } else if (action.type === 'CREATE_TRANSACTION') {
        const account = state.accounts[0];
        const category = state.categories[0];

        storage.addTransaction({
          userId: state.user?.id || 'usr_01',
          type: payloadData.type as any,
          amount: Number(payloadData.amount),
          accountId: account ? account.id : 'acc_main',
          categoryId: category ? category.id : 'cat_misc',
          status: 'COMPLETED',
          date: new Date().toISOString().substring(0, 10),
          notes: `${payloadData.notes} (${payloadData.vendor})`,
        });

        onConfirmed(
          'Transaksi Dicatat',
          `Transaksi Rp ${Number(payloadData.amount).toLocaleString('id-ID')} (${payloadData.vendor}) berhasil dicatat ke akun.`
        );
      } else {
        onConfirmed('Aksi Konfirmasi', 'Tindakan telah disetujui dan diterapkan.');
      }
    } catch (e: any) {
      console.error('Execution error:', e);
      alert(`Gagal mengeksekusi aksi: ${e.message}`);
    } finally {
      setIsExecuting(false);
      setIsPreviewOpen(false);
    }
  };

  if (action.status === 'CONFIRMED') {
    return (
      <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Check className="w-4 h-4 text-emerald-400" /> Aksi Terkonfirmasi & Berhasil Diterapkan
        </span>
        <ShieldCheck className="w-4 h-4 opacity-70" />
      </div>
    );
  }

  if (action.status === 'CANCELLED') {
    return (
      <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <X className="w-4 h-4" /> Aksi Dibatalkan
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-[#181B22] border border-[#E2B963]/40 space-y-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#222733] border border-white/10">
            {getActionIcon()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{action.title}</h4>
            <p className="text-[11px] text-gray-400 leading-snug">{action.description}</p>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E2B963]/15 text-[#E2B963] font-bold shrink-0 border border-[#E2B963]/30">
          Butuh Persetujuan
        </span>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#222733] hover:bg-[#2A3142] border border-white/10 text-xs font-semibold text-gray-200 transition-all flex items-center justify-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5 text-gray-400" /> Tinjau / Review
        </button>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black text-xs font-bold hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" /> Konfirmasi & Buat
        </button>
      </div>

      {/* Review / Edit Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#14171E] border border-[#E2B963]/40 p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E2B963]" />
                <h3 className="text-sm font-bold">Tinjau Paramater Aksi</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Silakan sesuaikan parameter sebelum LUX AI mendaftarkan data ke catatan keuangan Anda.
            </p>

            {/* Dynamic Form Inputs based on Action Type */}
            {action.type === 'CREATE_BUDGET' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Nama Kategori</label>
                  <input
                    type="text"
                    value={payloadData.categoryName}
                    onChange={(e) => setPayloadData({ ...payloadData, categoryName: e.target.value })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Batas Anggaran Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={payloadData.limit}
                    onChange={(e) => setPayloadData({ ...payloadData, limit: Number(e.target.value) })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
              </div>
            )}

            {action.type === 'CREATE_GOAL' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Judul Target Tabungan</label>
                  <input
                    type="text"
                    value={payloadData.title}
                    onChange={(e) => setPayloadData({ ...payloadData, title: e.target.value })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Target Nominal (Rp)</label>
                  <input
                    type="number"
                    value={payloadData.targetAmount}
                    onChange={(e) => setPayloadData({ ...payloadData, targetAmount: Number(e.target.value) })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Tenggat Waktu (Bulan)</label>
                  <input
                    type="number"
                    value={payloadData.targetMonths}
                    onChange={(e) => setPayloadData({ ...payloadData, targetMonths: Number(e.target.value) })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
              </div>
            )}

            {action.type === 'CREATE_TRANSACTION' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Merchant / Vendor</label>
                  <input
                    type="text"
                    value={payloadData.vendor}
                    onChange={(e) => setPayloadData({ ...payloadData, vendor: e.target.value })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Nominal Transaksi (Rp)</label>
                  <input
                    type="number"
                    value={payloadData.amount}
                    onChange={(e) => setPayloadData({ ...payloadData, amount: Number(e.target.value) })}
                    className="w-full bg-[#1C202B] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  onCancelled();
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Konfirmasi & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
