import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-white/10 gap-4 overflow-x-auto scrollbar-none ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-2.5 px-1 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#E2B963] text-[#E2B963]'
                  : 'border-transparent text-[#9CA3AF] hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                    isActive ? 'bg-[#E2B963] text-black' : 'bg-white/10 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex p-1 bg-[#14171E] border border-white/5 rounded-2xl gap-1 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-[#E2B963] to-[#C59A3F] text-black shadow-md font-bold'
                : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                  isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
