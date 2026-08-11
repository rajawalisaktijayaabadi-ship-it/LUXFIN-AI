import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 text-xs w-full">
        {label && <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-0.5">{label}</label>}
        <select
          ref={ref}
          className={`w-full bg-[#14171E] border ${
            error ? 'border-red-500' : 'border-white/10 focus:border-[#E2B963]'
          } rounded-xl p-2.5 text-xs text-[#F7F6F2] focus:outline-none transition-all ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#14171E] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-red-400 font-semibold mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
