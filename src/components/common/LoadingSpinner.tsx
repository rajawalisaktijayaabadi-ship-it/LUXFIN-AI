import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Memuat data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-6 h-6 text-[#E2B963] animate-spin" />
      <span className="text-xs text-[#9CA3AF] font-medium">{label}</span>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-1/3 h-4 bg-white/10 rounded" />
        <div className="w-1/4 h-4 bg-white/10 rounded" />
      </div>
      <div className="w-1/2 h-6 bg-white/10 rounded" />
    </div>
  );
};

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-[#14171E] border border-white/5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 w-2/3">
            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="w-3/4 h-3 bg-white/10 rounded" />
              <div className="w-1/2 h-2 bg-white/5 rounded" />
            </div>
          </div>
          <div className="w-1/4 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-4 animate-pulse">
      <div className="w-1/3 h-4 bg-white/10 rounded" />
      <div className="h-32 bg-white/5 rounded-xl flex items-end justify-around p-2 gap-2">
        <div className="w-1/6 h-1/2 bg-white/10 rounded-t" />
        <div className="w-1/6 h-3/4 bg-white/10 rounded-t" />
        <div className="w-1/6 h-1/3 bg-white/10 rounded-t" />
        <div className="w-1/6 h-full bg-white/10 rounded-t" />
      </div>
    </div>
  );
};
