import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center bg-[#14171E] border border-white/5 rounded-2xl space-y-3 my-4">
      <div className="w-12 h-12 rounded-full bg-white/5 text-[#9CA3AF] flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-[#F7F6F2]">{title}</h3>
        {description && <p className="text-[11px] text-[#9CA3AF] max-w-xs mx-auto">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
