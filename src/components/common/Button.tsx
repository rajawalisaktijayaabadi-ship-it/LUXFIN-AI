import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'soft-gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-xs gap-2 min-h-[44px]',
    lg: 'px-5 py-3.5 text-sm gap-2.5 min-h-[50px]',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#E2B963] to-[#C59A3F] text-black hover:brightness-110 shadow-lg shadow-[#E2B963]/10',
    secondary: 'bg-[#14171E] text-[#F7F6F2] border border-white/10 hover:border-white/20',
    outline: 'bg-transparent text-[#E2B963] border border-[#E2B963]/40 hover:bg-[#E2B963]/10',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    ghost: 'bg-transparent text-[#9CA3AF] hover:text-white hover:bg-white/5',
    'soft-gold': 'bg-[#E2B963]/15 text-[#E2B963] border border-[#E2B963]/30 hover:bg-[#E2B963]/25',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
};
