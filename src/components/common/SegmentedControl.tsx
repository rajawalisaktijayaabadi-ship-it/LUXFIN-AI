import React from 'react';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex bg-[#0B0D10] p-1 rounded-xl border border-white/10 gap-1 ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-3 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#14171E] text-[#E2B963] border border-[#E2B963]/30 shadow'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
