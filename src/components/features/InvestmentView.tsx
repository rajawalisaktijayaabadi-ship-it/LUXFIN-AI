import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Building,
  ShieldCheck,
  X,
  Edit3,
  Trash2,
  PieChart,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle,
  BarChart2
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatPercentage } from '../../utils/formatters';
import { InvestmentAsset, InvestmentCategory } from '../../types';

export const InvestmentView: React.FC = () => {
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
  
  // Transaction recording state
  const [txAssetId, setTxAssetId] = useState<string | null>(null);
  const [txType, setTxType] = useState<'BUY' | 'SELL' | 'DIVIDEND'>('BUY');
  const [txUnits, setTxUnits] = useState('');
  const [txPricePerUnit, setTxPricePerUnit] = useState('');
  const [txAccount, setTxAccount] = useState('acc_bca');
  const [txNotes, setTxNotes] = useState('');

  // Form states
  const [assetName, setAssetName] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetCategory, setAssetCategory] = useState<InvestmentCategory>('REKSADANA');
  const [assetUnits, setAssetUnits] = useState('');
  const [assetBuyPrice, setAssetBuyPrice] = useState('');
  const [assetCurrentPrice, setAssetCurrentPrice] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const state = storage.getState();
  const investments = state.investments;
  const accounts = state.accounts;

  const totalPortfolioValue = investments.reduce((sum, i) => sum + (i.totalValue || i.units * i.currentPrice), 0);
  const totalPurchaseValue = investments.reduce((sum, i) => sum + (i.totalPurchaseValue || i.units * i.averageBuyPrice), 0);
  const totalGainLoss = totalPortfolioValue - totalPurchaseValue;
  const totalGainLossPct = totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;

  const openAddModal = () => {
    setEditingAsset(null);
    setAssetName('');
    setAssetSymbol('');
    setAssetCategory('REKSADANA');
    setAssetUnits('');
    setAssetBuyPrice('');
    setAssetCurrentPrice('');
    setShowAddEditModal(true);
  };

  const openEditModal = (asset: InvestmentAsset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetSymbol(asset.symbol);
    setAssetCategory(asset.category);
    setAssetUnits(asset.units.toString());
    setAssetBuyPrice(asset.averageBuyPrice.toString());
    setAssetCurrentPrice(asset.currentPrice.toString());
    setShowAddEditModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsVal = parseFloat(assetUnits.replace(/[^0-9.]/g, '')) || 0;
    const buyVal = parseFloat(assetBuyPrice.replace(/[^0-9]/g, '')) || 0;
    const currentVal = assetCurrentPrice
      ? parseFloat(assetCurrentPrice.replace(/[^0-9]/g, ''))
      : buyVal;

    if (!assetName || unitsVal <= 0) return;

    if (editingAsset) {
      storage.updateInvestmentAsset(editingAsset.id, {
        name: assetName,
        symbol: assetSymbol || assetName.substring(0, 4).toUpperCase(),
        category: assetCategory,
        units: unitsVal,
        averageBuyPrice: buyVal,
        currentPrice: currentVal,
      });
    } else {
      storage.addInvestmentAsset({
        userId: state.user.id || 'usr_01',
        name: assetName,
        symbol: assetSymbol || assetName.substring(0, 4).toUpperCase(),
        category: assetCategory,
        units: unitsVal,
        averageBuyPrice: buyVal,
        currentPrice: currentVal,
      });
    }

    setShowAddEditModal(false);
  };

  const handleDeleteAsset = (id: string) => {
    storage.deleteInvestmentAsset(id);
    setDeleteConfirmId(null);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAssetId) return;

    const unitsVal = parseFloat(txUnits.replace(/[^0-9.]/g, '')) || 0;
    const priceVal = parseFloat(txPricePerUnit.replace(/[^0-9]/g, '')) || 0;

    if (unitsVal <= 0 || priceVal <= 0) return;

    storage.recordInvestmentTransaction(
      txAssetId,
      txType,
      unitsVal,
      priceVal,
      txAccount,
      txNotes
    );

    setTxAssetId(null);
    setTxUnits('');
    setTxPricePerUnit('');
    setTxNotes('');
  };

  const getCategoryLabel = (cat: InvestmentCategory) => {
    switch (cat) {
      case 'SAHAM': return 'Saham';
      case 'REKSADANA': return 'Reksadana';
      case 'OBLIGASI': return 'Obligasi / SBN';
      case 'EMAS': return 'Emas Mulia';
      case 'DEPOSITO': return 'Deposito';
      case 'KRIPTO': return 'Kripto';
      case 'PROPERTI': return 'Properti Investasi';
      default: return 'Lainnya';
    }
  };

  const getCategoryBadgeColor = (cat: InvestmentCategory) => {
    switch (cat) {
      case 'SAHAM': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REKSADANA': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'OBLIGASI': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'EMAS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'KRIPTO': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DEPOSITO': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Disclaimer Warning Card */}
      <div className="p-3 rounded-xl bg-[#14171E] border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200/80">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Pemberitahuan Penting:</strong> Informasi & kalkulasi portofolio investasi di aplikasi ini bersifat sebagai alat bantu pencatatan personal dan simulasi analisa. Ini <strong>BUKAN</strong> merupakan saran keuangan, rekomendasi investasi resmi, atau jaminan keuntungan di masa depan.
        </p>
      </div>

      {/* Portfolio Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1A202C] to-[#14171E] border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
            Total Nilai Portofolio Investasi
          </span>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1 shadow hover:bg-[#d8ae57] transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Aset Baru
          </button>
        </div>

        <h2 className="text-3xl font-black text-[#F7F6F2]">{formatRp(totalPortfolioValue)}</h2>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-[#9CA3AF]">Modal Pembelian (Cost):</span>
            <p className="font-bold text-white">{formatRp(totalPurchaseValue)}</p>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF]">Unrealized Gain / Loss:</span>
            <p
              className={`font-bold flex items-center gap-0.5 ${
                totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {totalGainLoss >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {formatRp(totalGainLoss)} ({formatPercentage(totalGainLossPct)})
            </p>
          </div>
        </div>
      </div>

      {/* Asset Allocation Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-[#14171E] border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-[#E2B963]" /> Alokasi Aset Portofolio
          </span>
          <span className="text-[10px] text-[#9CA3AF]">{investments.length} Instrumen</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-2.5 w-full bg-[#0B0D10] rounded-full overflow-hidden flex">
          {investments.map((inv, idx) => {
            const alloc = totalPortfolioValue > 0
              ? ((inv.totalValue || inv.units * inv.currentPrice) / totalPortfolioValue) * 100
              : 0;
            const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400', 'bg-teal-400', 'bg-pink-400'];
            return (
              <div
                key={inv.id}
                style={{ width: `${alloc}%` }}
                className={`h-full ${colors[idx % colors.length]}`}
                title={`${inv.name}: ${alloc.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[10px] pt-1">
          {investments.map((inv, idx) => {
            const alloc = totalPortfolioValue > 0
              ? ((inv.totalValue || inv.units * inv.currentPrice) / totalPortfolioValue) * 100
              : 0;
            return (
              <span key={inv.id} className="text-[#9CA3AF] flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full inline-block ${['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400', 'bg-teal-400', 'bg-pink-400'][idx % 6]}`} />
                {inv.symbol}: {alloc.toFixed(1)}%
              </span>
            );
          })}
        </div>
      </div>

      {/* Asset Cards List */}
      <div className="space-y-3">
        {investments.map((inv) => {
          const itemValue = inv.totalValue || inv.units * inv.currentPrice;
          const itemCost = inv.totalPurchaseValue || inv.units * inv.averageBuyPrice;
          const itemGain = itemValue - itemCost;
          const itemGainPct = itemCost > 0 ? (itemGain / itemCost) * 100 : 0;
          const alloc = totalPortfolioValue > 0 ? (itemValue / totalPortfolioValue) * 100 : 0;
          const badgeStyle = getCategoryBadgeColor(inv.category);

          return (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-[#F7F6F2]">{inv.name}</h3>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${badgeStyle}`}>
                        {inv.symbol}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                      {getCategoryLabel(inv.category)} • {inv.units.toLocaleString('id-ID')} Unit • Alokasi {alloc.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setTxAssetId(inv.id);
                      setTxPricePerUnit(inv.currentPrice.toString());
                    }}
                    className="px-2 py-1 rounded-lg bg-[#E2B963]/20 text-[#E2B963] text-[10px] font-bold hover:bg-[#E2B963] hover:text-black transition-all"
                  >
                    + Transaksi
                  </button>
                  <button
                    onClick={() => openEditModal(inv)}
                    className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(inv.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
                <div>
                  <span className="text-[#9CA3AF]">Nilai Portofolio:</span>
                  <p className="font-bold text-white text-xs">{formatRp(itemValue)}</p>
                  <p className="text-[9px] text-[#9CA3AF]">
                    Harga Saat Ini: {formatRp(inv.currentPrice)}/unit
                  </p>
                </div>

                <div>
                  <span className="text-[#9CA3AF]">Keuntungan / Kerugian:</span>
                  <p
                    className={`font-bold text-xs flex items-center gap-0.5 ${
                      itemGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {itemGain >= 0 ? '+' : ''}{formatRp(itemGain)} ({formatPercentage(itemGainPct)})
                  </p>
                  <p className="text-[9px] text-[#9CA3AF]">
                    Modal Beli Rata-Rata: {formatRp(inv.averageBuyPrice)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Asset Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">
                {editingAsset ? 'Edit Aset Investasi' : 'Tambah Aset Investasi Baru'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Nama Aset / Produk</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Contoh: Sucorinvest Money Market / BBCA"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Kode / Simbol</label>
                  <input
                    type="text"
                    value={assetSymbol}
                    onChange={(e) => setAssetSymbol(e.target.value.toUpperCase())}
                    placeholder="SMMF / BBCA"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Kategori</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as InvestmentCategory)}
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  >
                    <option value="REKSADANA">Reksadana</option>
                    <option value="SAHAM">Saham</option>
                    <option value="OBLIGASI">Obligasi / SBN</option>
                    <option value="EMAS">Emas</option>
                    <option value="DEPOSITO">Deposito</option>
                    <option value="KRIPTO">Kripto</option>
                    <option value="PROPERTI">Properti</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Jumlah Unit / Lot / Gram</label>
                  <input
                    type="text"
                    value={assetUnits}
                    onChange={(e) => setAssetUnits(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Harga Beli Rata-Rata (Rp)</label>
                  <input
                    type="text"
                    value={assetBuyPrice}
                    onChange={(e) => setAssetBuyPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Harga Pasar Saat Ini (Rp)</label>
                <input
                  type="text"
                  value={assetCurrentPrice}
                  onChange={(e) => setAssetCurrentPrice(e.target.value)}
                  placeholder="Opsional, default sama dengan harga beli"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs mt-2 hover:bg-emerald-400"
              >
                {editingAsset ? 'Simpan Perubahan' : 'Tambah Aset'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Investment Transaction Modal */}
      {txAssetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">Catat Transaksi Investasi</h3>
              <button onClick={() => setTxAssetId(null)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-3 gap-1 bg-[#14171E] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('BUY')}
                    className={`py-1 rounded-lg font-bold text-[10px] ${
                      txType === 'BUY' ? 'bg-emerald-500 text-black' : 'text-[#9CA3AF]'
                    }`}
                  >
                    Beli (+Unit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('SELL')}
                    className={`py-1 rounded-lg font-bold text-[10px] ${
                      txType === 'SELL' ? 'bg-red-500 text-white' : 'text-[#9CA3AF]'
                    }`}
                  >
                    Jual (-Unit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('DIVIDEND')}
                    className={`py-1 rounded-lg font-bold text-[10px] ${
                      txType === 'DIVIDEND' ? 'bg-[#E2B963] text-black' : 'text-[#9CA3AF]'
                    }`}
                  >
                    Dividen
                  </button>
                </div>
              </div>

              {txType !== 'DIVIDEND' && (
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-1">Jumlah Unit</label>
                  <input
                    type="text"
                    value={txUnits}
                    onChange={(e) => setTxUnits(e.target.value)}
                    placeholder="10"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">
                  {txType === 'DIVIDEND' ? 'Nominal Dividen (Rp)' : 'Harga Per Unit (Rp)'}
                </label>
                <input
                  type="text"
                  value={txPricePerUnit}
                  onChange={(e) => setTxPricePerUnit(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Rekening Terkait</label>
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value)}
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRp(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-1">Catatan</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs mt-2"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-red-500/30 rounded-2xl p-4 space-y-3 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-xs font-bold text-[#F7F6F2]">Hapus Aset Investasi?</h3>
            <p className="text-[11px] text-[#9CA3AF]">Aset akan dihapus dari kalkulasi portofolio Anda.</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteAsset(deleteConfirmId)}
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
