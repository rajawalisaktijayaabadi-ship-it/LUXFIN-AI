import React from 'react';
import { Home, ArrowLeftRight, PlusCircle, Sparkles, User, PieChart } from 'lucide-react';

export type ActiveTab = 
  | 'home' 
  | 'transactions' 
  | 'accounts' 
  | 'analytics' 
  | 'budget' 
  | 'goals' 
  | 'bills' 
  | 'debt' 
  | 'investments' 
  | 'networth' 
  | 'copilot' 
  | 'affordability'
  | 'profile'
  | 'reports'
  | 'admin'
  | 'design-system'
  | 'database'
  | 'test-suite';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSmartAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenSmartAdd }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#14171E]/95 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center justify-around max-w-md mx-auto shadow-2xl">
      {/* Home */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'home' ? 'text-[#E2B963] scale-105' : 'text-[#9CA3AF] hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Beranda</span>
      </button>

      {/* Transactions */}
      <button
        onClick={() => setActiveTab('transactions')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'transactions' ? 'text-[#E2B963] scale-105' : 'text-[#9CA3AF] hover:text-white'
        }`}
      >
        <ArrowLeftRight className="w-5 h-5" />
        <span className="text-[10px] font-medium">Transaksi</span>
      </button>

      {/* Center Action Button (+ Add Smart Transaction) */}
      <button
        onClick={onOpenSmartAdd}
        className="relative -top-4 bg-gradient-to-tr from-[#E2B963] via-[#D4AF37] to-[#F3E5AB] text-black p-3.5 rounded-full shadow-[0_4px_20px_rgba(226,185,99,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-[#0B0D10]"
      >
        <PlusCircle className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* LUX AI Copilot */}
      <button
        onClick={() => setActiveTab('copilot')}
        className={`flex flex-col items-center gap-1 transition-all relative ${
          activeTab === 'copilot' ? 'text-[#E2B963] scale-105' : 'text-[#9CA3AF] hover:text-white'
        }`}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <span className="text-[10px] font-medium">LUX AI</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'profile' ? 'text-[#E2B963] scale-105' : 'text-[#9CA3AF] hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Profil</span>
      </button>
    </nav>
  );
};
