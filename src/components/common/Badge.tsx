import React from 'react';

export type BadgeVariant = 'gold' | 'emerald' | 'crimson' | 'amber' | 'slate';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const variantStyles = {
    gold: 'bg-[#E2B963]/15 text-[#E2B963] border border-[#E2B963]/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    crimson: 'bg-red-500/15 text-red-400 border border-red-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    slate: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
