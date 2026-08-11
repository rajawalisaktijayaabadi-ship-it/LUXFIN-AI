import React from 'react';
import { formatRp, parseRp } from '../../utils/formatters';

export interface CurrencyInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Rp 0',
  error,
  disabled = false,
  className = '',
}) => {
  const numericValue = typeof value === 'number' ? value : parseRp(value);
  const displayValue = numericValue > 0 ? formatRp(numericValue) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRp(raw);
    onChange(parsed);
  };

  return (
    <div className="space-y-1 text-xs w-full">
      {label && <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-0.5">{label}</label>}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-[#14171E] border ${
          error ? 'border-red-500' : 'border-white/10 focus:border-[#E2B963]'
        } rounded-xl p-2.5 text-xs text-[#E2B963] font-bold placeholder-[#9CA3AF]/60 focus:outline-none transition-all ${className}`}
      />
      {error && <p className="text-[10px] text-red-400 font-semibold mt-0.5">{error}</p>}
    </div>
  );
};
