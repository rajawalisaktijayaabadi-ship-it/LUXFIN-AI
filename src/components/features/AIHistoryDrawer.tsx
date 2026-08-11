import React from 'react';
import { History, X, MessageSquarePlus, Trash2, ArrowRight, MessageSquare, Calendar } from 'lucide-react';
import { AIConversationSession } from '../../types';
import { AICopilotStorage } from '../../utils/aiCopilotStorage';

interface AIHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: AIConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const AIHistoryDrawer: React.FC<AIHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-[#12151D] border-l border-white/10 p-5 flex flex-col space-y-4 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#E2B963]" />
            <h3 className="text-sm font-bold">Riwayat Percakapan AI</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Session Button */}
        <button
          onClick={() => {
            onNewSession();
            onClose();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E2B963] to-[#B8860B] text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" /> Mulai Percakapan Baru
        </button>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              Belum ada riwayat percakapan tersimpan.
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const formattedDate = new Date(s.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 group ${
                    isActive
                      ? 'bg-[#1C202B] border-[#E2B963] text-white shadow-lg'
                      : 'bg-[#161922] border-white/5 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    className="flex-1 text-left space-y-1 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E2B963]' : 'text-gray-500'}`} />
                      <h4 className="text-xs font-bold truncate">{s.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </span>
                      <span>• {s.messages.length} pesan</span>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Hapus percakapan ini dari riwayat?')) {
                        onDeleteSession(s.id);
                      }
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Hapus Percakapan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
