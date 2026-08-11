import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 text-xs w-full">
        {label && <label className="block text-[11px] font-semibold text-[#9CA3AF] mb-0.5">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-[#9CA3AF] pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            className={`w-full bg-[#14171E] border ${
              error ? 'border-red-500' : 'border-white/10 focus:border-[#E2B963]'
            } rounded-xl py-2.5 ${leftIcon ? 'pl-9' : 'pl-3.5'} ${
              rightIcon ? 'pr-9' : 'pr-3.5'
            } text-xs text-[#F7F6F2] placeholder-[#9CA3AF]/60 focus:outline-none transition-all ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-[#9CA3AF]">{rightIcon}</div>}
        </div>
        {error && <p className="text-[10px] text-red-400 font-semibold mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const SearchInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Cari...', className = '' }) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4" />}
      className={className}
    />
  );
};

export const PasswordInput: React.FC<InputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
};
