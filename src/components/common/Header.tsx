import React, { useState } from 'react';
import { 
  Bell, 
  Grid, 
  ShieldCheck, 
  Wallet, 
  PieChart, 
  Target, 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  LineChart, 
  HelpCircle,
  FileText,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { storage } from '../../utils/storage';
import { formatRp } from '../../utils/formatters';

import { ConnectionStatusBadge } from './ConnectionStatusBadge';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadNotifsCount: number;
  onOpenNotifs: () => void;
  onOpenSyncCenter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifsCount,
  onOpenNotifs,
  onOpenSyncCenter,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const state = storage.getState();
  const { user } = state;

  const menuItems = [
    { tab: 'accounts', label: 'Rekening & Dompet', icon: Wallet, desc: 'Kelola BCA, Gopay, OVO, Cash' },
    { tab: 'analytics', label: 'Analisis Keuangan', icon: PieChart, desc: 'Grafik arus kas & pengeluaran' },
    { tab: 'budget', label: 'Anggaran Bulanan', icon: Receipt, desc: 'Batas belanja per kategori' },
    { tab: 'goals', label: 'Target Keuangan', icon: Target, desc: 'Dana darurat & rumah impian' },
    { tab: 'bills', label: 'Tagihan & Langganan', icon: CreditCard, desc: 'Netflix, WiFi, Listrik PLN' },
    { tab: 'debt', label: 'Utang & Piutang', icon: CreditCard, desc: 'Strategi Snowball / Avalanche' },
    { tab: 'investments', label: 'Portofolio Investasi', icon: TrendingUp, desc: 'Reksadana, Saham, Emas, BTC' },
    { tab: 'networth', label: 'Kekayaan Bersih & Proyeksi', icon: LineChart, desc: 'Aset vs Liabilitas & Forecast' },
    { tab: 'affordability', label: 'Analisis Mampu Beli?', icon: HelpCircle, desc: 'Kalkulator AI Beli Barang Baru' },
    { tab: 'reports', label: 'Laporan Bulanan', icon: FileText, desc: 'Review keuangan & PDF' },
    { tab: 'design-system', label: 'Design System Showcase', icon: Grid, desc: 'Showcase komponen UI & token' },
    { tab: 'admin', label: 'Admin Security Panel', icon: Shield, desc: 'Manajemen lisensi & audit' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md px-4 py-3 border-b border-white/5 flex items-center justify-between">
        {/* User Info & License Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('profile')}
            className="relative cursor-pointer group"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#E2B963]/60 group-hover:border-[#E2B963] transition-all"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0B0D10]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#F7F6F2] tracking-tight">{user.name}</h2>
              <span className="text-[10px] bg-[#E2B963]/20 text-[#E2B963] border border-[#E2B963]/40 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> VIP
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">LUXFIN AI OS</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Connection / Offline Sync Status Badge */}
          <ConnectionStatusBadge onOpenSyncCenter={onOpenSyncCenter} />

          {/* Notifications button */}
          <button
            onClick={onOpenNotifs}
            className="relative p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white hover:border-[#E2B963]/50 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Full Navigation Drawer Grid Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#E2B963] hover:bg-[#E2B963]/10 transition-all flex items-center gap-1.5"
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Fitur</span>
          </button>
        </div>
      </header>

      {/* Feature Navigation Modal / Sheet */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-xs bg-[#0B0D10] h-full border-l border-white/10 p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E2B963] text-black font-black flex items-center justify-center text-xs">
                    LX
                  </div>
                  <span className="font-bold text-sm text-[#F7F6F2]">Menu Sistem LUXFIN</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        setActiveTab(item.tab as ActiveTab);
                        setShowMenu(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#E2B963]/15 border border-[#E2B963]/40 text-[#E2B963]'
                          : 'bg-[#14171E]/60 border border-white/5 text-[#9CA3AF] hover:bg-[#14171E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-[#E2B963] text-black' : 'bg-white/5 text-[#E2B963]'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#F7F6F2]">{item.label}</p>
                          <p className="text-[10px] text-[#9CA3AF]">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-[10px] text-[#9CA3AF]">LUXFIN AI Commercial v1.0.4</p>
              <p className="text-[9px] text-[#E2B963]">Lisensi VIP Resmi Terverifikasi</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
