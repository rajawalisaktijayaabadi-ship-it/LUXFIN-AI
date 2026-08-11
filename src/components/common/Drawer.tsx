import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-auto bg-[#0B0D10] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />
        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-[#F7F6F2]">{title}</h3>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
