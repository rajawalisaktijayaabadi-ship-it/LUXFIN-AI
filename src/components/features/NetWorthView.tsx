import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Home,
  Car,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  X,
  CreditCard,
  Building,
  Activity,
  BarChart3
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { formatRp, formatPercentage } from '../../utils/formatters';
import { TangibleAsset, Liability, AssetCategory, LiabilityCategory } from '../../types';

export const NetWorthView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TANGIBLE_ASSETS' | 'LIABILITIES'>('OVERVIEW');
  
  // Tangible Asset Modal State
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<TangibleAsset | null>(null);
  const [astName, setAstName] = useState('');
  const [astCategory, setAstCategory] = useState<AssetCategory>('PROPERTY');
  const [astPurchaseVal, setAstPurchaseVal] = useState('');
  const [astEstimatedVal, setAstEstimatedVal] = useState('');
  const [astNotes, setAstNotes] = useState('');

  // Liability Modal State
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [liaName, setLiaName] = useState('');
  const [liaCategory, setLiaCategory] = useState<LiabilityCategory>('PERSONAL_LOAN');
  const [liaTotalOwed, setLiaTotalOwed] = useState('');
  const [liaMonthlyPay, setLiaMonthlyPay] = useState('');
  const [liaInterest, setLiaInterest] = useState('');
  const [liaNotes, setLiaNotes] = useState('');

  const state = storage.getState();
  const netWorthData = storage.getNetWorthBreakdown();
  const { totalAssets, totalLiabilities, netWorth } = netWorthData;
  const { netCashflow } = storage.getMonthlyCashflow();
  const historicalData = storage.getHistoricalNetWorth(6);

  const tangibleAssets = state.tangibleAssets;
  const liabilities = state.liabilities;

  // Tangible asset modal handlers
  const openAddAssetModal = () => {
    setEditingAsset(null);
    setAstName('');
    setAstCategory('PROPERTY');
    setAstPurchaseVal('');
    setAstEstimatedVal('');
    setAstNotes('');
    setShowAssetModal(true);
  };

  const openEditAssetModal = (ast: TangibleAsset) => {
    setEditingAsset(ast);
    setAstName(ast.name);
    setAstCategory(ast.category);
    setAstPurchaseVal(ast.purchaseValue.toString());
    setAstEstimatedVal(ast.estimatedValue.toString());
    setAstNotes(ast.notes || '');
    setShowAssetModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const estVal = parseFloat(astEstimatedVal.replace(/[^0-9]/g, '')) || 0;
    const purVal = parseFloat(astPurchaseVal.replace(/[^0-9]/g, '')) || estVal;

    if (!astName || estVal <= 0) return;

    if (editingAsset) {
      storage.updateTangibleAsset(editingAsset.id, {
        name: astName,
        category: astCategory,
        purchaseValue: purVal,
        estimatedValue: estVal,
        notes: astNotes,
      });
    } else {
      storage.addTangibleAsset({
        userId: state.user.id || 'usr_01',
        name: astName,
        category: astCategory,
        purchaseValue: purVal,
        estimatedValue: estVal,
        notes: astNotes,
      });
    }

    setShowAssetModal(false);
  };

  // Liability modal handlers
  const openAddLiabilityModal = () => {
    setEditingLiability(null);
    setLiaName('');
    setLiaCategory('PERSONAL_LOAN');
    setLiaTotalOwed('');
    setLiaMonthlyPay('');
    setLiaInterest('');
    setLiaNotes('');
    setShowLiabilityModal(true);
  };

  const openEditLiabilityModal = (lia: Liability) => {
    setEditingLiability(lia);
    setLiaName(lia.name);
    setLiaCategory(lia.category);
    setLiaTotalOwed(lia.totalOwed.toString());
    setLiaMonthlyPay((lia.monthlyPayment || 0).toString());
    setLiaInterest((lia.interestRate || 0).toString());
    setLiaNotes(lia.notes || '');
    setShowLiabilityModal(true);
  };

  const handleSaveLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const owedVal = parseFloat(liaTotalOwed.replace(/[^0-9]/g, '')) || 0;
    const payVal = parseFloat(liaMonthlyPay.replace(/[^0-9]/g, '')) || 0;
    const intVal = parseFloat(liaInterest) || 0;

    if (!liaName || owedVal <= 0) return;

    if (editingLiability) {
      storage.updateLiability(editingLiability.id, {
        name: liaName,
        category: liaCategory,
        totalOwed: owedVal,
        monthlyPayment: payVal,
        interestRate: intVal,
        notes: liaNotes,
      });
    } else {
      storage.addLiability({
        userId: state.user.id || 'usr_01',
        name: liaName,
        category: liaCategory,
        totalOwed: owedVal,
        monthlyPayment: payVal,
        interestRate: intVal,
        notes: liaNotes,
      });
    }

    setShowLiabilityModal(false);
  };

  const monthlySavingsAvg = Math.max(1000000, netCashflow > 0 ? netCashflow : 3000000);
  const forecastMonths = [1, 3, 6, 12];

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Navigation Tabs */}
      <div className="flex bg-[#14171E] p-1 rounded-2xl border border-white/5 text-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF]'
          }`}
        >
          Ringkasan Kekayaan
        </button>
        <button
          onClick={() => setActiveTab('TANGIBLE_ASSETS')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'TANGIBLE_ASSETS' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF]'
          }`}
        >
          Aset Fisik ({tangibleAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('LIABILITIES')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'LIABILITIES' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF]'
          }`}
        >
          Kewajiban ({liabilities.length})
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Net Worth Summary Main Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1E2330] to-[#14171E] border border-[#E2B963]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                Kekayaan Bersih (Net Worth = Assets - Liabilities)
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Solven / Sehat
              </span>
            </div>

            <h2 className="text-3xl font-black text-[#F7F6F2]">{formatRp(netWorth)}</h2>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-[#9CA3AF] text-[10px]">Total Seluruh Aset:</span>
                <p className="font-bold text-emerald-400 text-sm">{formatRp(totalAssets)}</p>
              </div>
              <div>
                <span className="text-[#9CA3AF] text-[10px]">Total Seluruh Kewajiban:</span>
                <p className="font-bold text-red-400 text-sm">{formatRp(totalLiabilities)}</p>
              </div>
            </div>
          </div>

          {/* Historical Net Worth Trend Visualizer */}
          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#E2B963]" />
                <h3 className="text-xs font-bold text-[#F7F6F2]">Riwayat Tren Net Worth (6 Bulan)</h3>
              </div>
            </div>

            <div className="pt-2 flex items-end justify-between gap-1.5 h-28">
              {historicalData.map((h, i) => {
                const maxNW = Math.max(...historicalData.map((d) => d.netWorth));
                const heightPct = maxNW > 0 ? (h.netWorth / maxNW) * 100 : 20;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] text-[#E2B963] font-bold font-mono">
                      {(h.netWorth / 1000000).toFixed(0)}M
                    </span>
                    <div
                      style={{ height: `${Math.max(15, heightPct)}%` }}
                      className="w-full bg-gradient-to-t from-[#E2B963]/30 to-[#E2B963] rounded-t-lg transition-all"
                    />
                    <span className="text-[9px] text-[#9CA3AF]">{h.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Breakdown Detail List */}
          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-[#F7F6F2] uppercase tracking-wider">
              Komposisi Aset (Assets Breakdown)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="font-bold text-white">Kas Cair & Tabungan Bank</p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {((netWorthData.liquidCash / (totalAssets || 1)) * 100).toFixed(1)}% dari Total Aset
                    </p>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">{formatRp(netWorthData.liquidCash)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <p className="font-bold text-white">Portofolio Investasi</p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {((netWorthData.investments / (totalAssets || 1)) * 100).toFixed(1)}% dari Total Aset
                    </p>
                  </div>
                </div>
                <span className="font-bold text-blue-400">{formatRp(netWorthData.investments)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <div>
                    <p className="font-bold text-white">Aset Fisik (Properti/Kendaraan)</p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {((netWorthData.tangibleAssets / (totalAssets || 1)) * 100).toFixed(1)}% dari Total Aset
                    </p>
                  </div>
                </div>
                <span className="font-bold text-purple-400">{formatRp(netWorthData.tangibleAssets)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <div>
                    <p className="font-bold text-white">Piutang Tercatat (Receivables)</p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {((netWorthData.receivables / (totalAssets || 1)) * 100).toFixed(1)}% dari Total Aset
                    </p>
                  </div>
                </div>
                <span className="font-bold text-teal-400">{formatRp(netWorthData.receivables)}</span>
              </div>
            </div>
          </div>

          {/* 12-Month Projection Engine */}
          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E2B963]" />
                <h3 className="text-xs font-bold text-[#F7F6F2]">Simulasi Proyeksi Pertumbuhan AI</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                + {formatRp(monthlySavingsAvg)}/bln
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {forecastMonths.map((m) => {
                const projectedAddition = monthlySavingsAvg * m * (1 + (0.06 * m) / 12);
                const futureNetWorth = netWorth + projectedAddition;

                return (
                  <div
                    key={m}
                    className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{m} Bulan Ke Depan</span>
                      <p className="text-[10px] text-[#9CA3AF]">
                        +{formatRp(projectedAddition)} estimasi akumulasi
                      </p>
                    </div>
                    <span className="font-bold text-[#E2B963] text-sm">{formatRp(futureNetWorth)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tangible Assets Management Tab */}
      {activeTab === 'TANGIBLE_ASSETS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F7F6F2] uppercase tracking-wider">
              Daftar Aset Fisik & Properti
            </h3>
            <button
              onClick={openAddAssetModal}
              className="px-3 py-1.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Aset Fisik
            </button>
          </div>

          {tangibleAssets.map((ast) => (
            <div
              key={ast.id}
              className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase">
                    {ast.category}
                  </span>
                  <h3 className="text-xs font-bold text-[#F7F6F2] mt-0.5">{ast.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditAssetModal(ast)}
                    className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => storage.deleteTangibleAsset(ast.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#9CA3AF]">Estimasi Nilai Pasar:</span>
                  <p className="font-bold text-emerald-400 text-xs">{formatRp(ast.estimatedValue)}</p>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Harga Beli Awal:</span>
                  <p className="font-bold text-white text-xs">{formatRp(ast.purchaseValue)}</p>
                </div>
              </div>

              {ast.notes && <p className="text-[10px] text-[#9CA3AF] pt-1 border-t border-white/5">{ast.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Liabilities Management Tab */}
      {activeTab === 'LIABILITIES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F7F6F2] uppercase tracking-wider">
              Daftar Kewajiban & Liabilitas Lainnya
            </h3>
            <button
              onClick={openAddLiabilityModal}
              className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kewajiban
            </button>
          </div>

          {liabilities.map((lia) => (
            <div
              key={lia.id}
              className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase">
                    {lia.category}
                  </span>
                  <h3 className="text-xs font-bold text-[#F7F6F2] mt-0.5">{lia.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditLiabilityModal(lia)}
                    className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => storage.deleteLiability(lia.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#9CA3AF]">Sisa Kewajiban:</span>
                  <p className="font-bold text-red-400 text-xs">{formatRp(lia.totalOwed)}</p>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Cicilan Bulanan:</span>
                  <p className="font-bold text-white text-xs">{formatRp(lia.monthlyPayment || 0)}/bln</p>
                </div>
              </div>

              {lia.notes && <p className="text-[10px] text-[#9CA3AF] pt-1 border-t border-white/5">{lia.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Tangible Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">
                {editingAsset ? 'Edit Aset Fisik' : 'Tambah Aset Fisik Baru'}
              </h3>
              <button onClick={() => setShowAssetModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Nama Aset</label>
                <input
                  type="text"
                  value={astName}
                  onChange={(e) => setAstName(e.target.value)}
                  placeholder="Contoh: Rumah Tinggal BSD / Honda HR-V"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Kategori</label>
                <select
                  value={astCategory}
                  onChange={(e) => setAstCategory(e.target.value as AssetCategory)}
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                >
                  <option value="PROPERTY">Properti (Rumah / Tanah)</option>
                  <option value="VEHICLE">Kendaraan (Mobil / Motor)</option>
                  <option value="PHYSICAL_ASSET">Aset Fisik Lainnya</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Estimasi Nilai Pasar Saat Ini (Rp)</label>
                <input
                  type="text"
                  value={astEstimatedVal}
                  onChange={(e) => setAstEstimatedVal(e.target.value)}
                  placeholder="500000000"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Harga Beli Awal (Rp)</label>
                <input
                  type="text"
                  value={astPurchaseVal}
                  onChange={(e) => setAstPurchaseVal(e.target.value)}
                  placeholder="400000000"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Catatan</label>
                <input
                  type="text"
                  value={astNotes}
                  onChange={(e) => setAstNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E2B963] text-black font-bold text-xs mt-2"
              >
                Simpan Aset Fisik
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Liability Modal */}
      {showLiabilityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-[#F7F6F2]">
                {editingLiability ? 'Edit Kewajiban' : 'Tambah Kewajiban Baru'}
              </h3>
              <button onClick={() => setShowLiabilityModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLiability} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Nama Kewajiban</label>
                <input
                  type="text"
                  value={liaName}
                  onChange={(e) => setLiaName(e.target.value)}
                  placeholder="Contoh: Sisa Pinjaman Bank Mandiri"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Kategori</label>
                <select
                  value={liaCategory}
                  onChange={(e) => setLiaCategory(e.target.value as LiabilityCategory)}
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                >
                  <option value="PERSONAL_LOAN">Pinjaman Bank / Personal</option>
                  <option value="CREDIT_CARD">Tagihan Kartu Kredit</option>
                  <option value="PAYLATER">PayLater / BNPL</option>
                  <option value="MORTGAGE">KPR / Hipotek</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Total Sisa Sisa Kewajiban (Rp)</label>
                <input
                  type="text"
                  value={liaTotalOwed}
                  onChange={(e) => setLiaTotalOwed(e.target.value)}
                  placeholder="50000000"
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Cicilan Bulanan (Rp)</label>
                  <input
                    type="text"
                    value={liaMonthlyPay}
                    onChange={(e) => setLiaMonthlyPay(e.target.value)}
                    placeholder="1500000"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Suku Bunga (% p.a.)</label>
                  <input
                    type="text"
                    value={liaInterest}
                    onChange={(e) => setLiaInterest(e.target.value)}
                    placeholder="6.5"
                    className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9CA3AF] mb-0.5">Catatan</label>
                <input
                  type="text"
                  value={liaNotes}
                  onChange={(e) => setLiaNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full bg-[#14171E] border border-white/10 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs mt-2"
              >
                Simpan Kewajiban
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
