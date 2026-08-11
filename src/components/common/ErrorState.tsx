import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3 my-4">
      <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>
      <p className="text-xs text-red-300 font-medium">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
};
