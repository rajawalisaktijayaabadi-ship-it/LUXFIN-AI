import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = {
    SUCCESS: 'bg-emerald-950 border-emerald-500/40 text-emerald-300',
    ERROR: 'bg-red-950 border-red-500/40 text-red-300',
    INFO: 'bg-[#14171E] border-[#E2B963]/40 text-[#F7F6F2]',
  }[toast.type];

  const icons = {
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    ERROR: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    INFO: <Info className="w-4 h-4 text-[#E2B963] shrink-0" />,
  }[toast.type];

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-xl text-xs backdrop-blur-md animate-in slide-in-from-top-2 duration-300 gap-3 ${styles}`}
    >
      <div className="flex items-center gap-2.5">
        {icons}
        <span className="font-semibold">{toast.message}</span>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
