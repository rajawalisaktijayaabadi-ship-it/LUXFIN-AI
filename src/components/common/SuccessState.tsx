import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export interface SuccessStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  description,
  actionLabel = 'Lanjutkan',
  onAction,
}) => {
  return (
    <div className="p-8 text-center bg-emerald-950/30 border border-emerald-500/20 rounded-2xl space-y-4 my-4 animate-in zoom-in-95 duration-300">
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {description && <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">{description}</p>}
      </div>
      {onAction && (
        <Button size="sm" onClick={onAction} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
