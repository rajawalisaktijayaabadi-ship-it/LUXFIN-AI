import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'obsidian' | 'gold-border' | 'glass' | 'minimal';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'obsidian',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseStyles = 'rounded-2xl p-4 transition-all duration-200';

  const variantStyles = {
    obsidian: 'bg-[#14171E] border border-white/10 shadow-lg',
    'gold-border': 'bg-[#14171E] border border-[#E2B963]/40 border-gold-glow shadow-xl',
    glass: 'bg-[#14171E]/70 backdrop-blur-md border border-white/10 shadow-xl',
    minimal: 'bg-white/5 border border-white/5',
  };

  const hoverStyles = hoverable || onClick ? 'cursor-pointer hover:border-[#E2B963]/50 hover:scale-[1.01] active:scale-[0.99]' : '';

  return (
    <div onClick={onClick} className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
