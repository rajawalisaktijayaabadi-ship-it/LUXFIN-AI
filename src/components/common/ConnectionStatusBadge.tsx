import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { offlineSyncEngine, SyncEngineStatus } from '../../utils/offlineSyncEngine';

interface ConnectionStatusBadgeProps {
  onOpenSyncCenter: () => void;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ onOpenSyncCenter }) => {
  const [status, setStatus] = useState<SyncEngineStatus>(offlineSyncEngine.getStatus());

  useEffect(() => {
    const unsubscribe = offlineSyncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  if (!status.isOnline) {
    return (
      <button
        onClick={onOpenSyncCenter}
        className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Offline</span>
        {status.queuedCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-mono text-[9px] font-black">
            {status.queuedCount}
          </span>
        )}
      </button>
    );
  }

  if (status.status === 'CONFLICT_DETECTED') {
    return (
      <button
        onClick={onOpenSyncCenter}
        className="px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-[11px] font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition-all cursor-pointer shadow-md animate-bounce"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span>Konflik Data ({status.conflictCount})</span>
      </button>
    );
  }

  if (status.status === 'SYNCING') {
    return (
      <button
        onClick={onOpenSyncCenter}
        className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
        <span>Menyingkronkan...</span>
      </button>
    );
  }

  if (status.queuedCount > 0) {
    return (
      <button
        onClick={onOpenSyncCenter}
        className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[11px] font-bold flex items-center gap-1.5 hover:bg-blue-500/25 transition-all cursor-pointer"
      >
        <Wifi className="w-3.5 h-3.5 text-blue-400" />
        <span>Sync ({status.queuedCount})</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpenSyncCenter}
      className="px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
    >
      <CheckCircle2 className="w-3 h-3" />
      <span className="hidden sm:inline">Synced</span>
    </button>
  );
};
