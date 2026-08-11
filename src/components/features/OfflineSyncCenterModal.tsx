import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { offlineSyncEngine, SyncEngineStatus, OfflineQueueItem } from '../../utils/offlineSyncEngine';
import { formatRp } from '../../utils/formatters';

interface OfflineSyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncCenterModal: React.FC<OfflineSyncCenterModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SyncEngineStatus>(offlineSyncEngine.getStatus());
  const [queue, setQueue] = useState<OfflineQueueItem[]>(offlineSyncEngine.getQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncEngine.subscribe((st) => {
      setStatus(st);
      setQueue(offlineSyncEngine.getQueue());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await offlineSyncEngine.autoSync();
    setIsSyncing(false);
    setQueue(offlineSyncEngine.getQueue());
  };

  const handleResolveConflict = (itemId: string, resolution: 'USE_LOCAL' | 'USE_SERVER' | 'MERGE') => {
    offlineSyncEngine.resolveConflict(itemId, resolution);
    setQueue(offlineSyncEngine.getQueue());
  };

  const handleSimulateConflict = () => {
    offlineSyncEngine.simulateConflict();
    setQueue(offlineSyncEngine.getQueue());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B0D10] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${status.isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {status.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Pusat Sinkronisasi Offline & Resolusi Konflik
              </h3>
              <p className="text-[11px] text-gray-400">
                {status.isOnline
                  ? 'Koneksi Internet Terhubung — Data Keuangan Tersinkronkan'
                  : 'Mode Offline Aktif — Seluruh Perubahan Disimpan dalam Antrean Lokal'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Summary Banner */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-gray-400 block">Status Koneksi</span>
            <span className={`font-bold ${status.isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-gray-400 block">Antrean Perubahan</span>
            <span className="font-bold text-white font-mono">{status.queuedCount} Item</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-gray-400 block">Konflik Data</span>
            <span className={`font-bold font-mono ${status.conflictCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {status.conflictCount} Konflik
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleManualSync}
            disabled={!status.isOnline || isSyncing}
            className="flex-1 py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyingkronkan...' : 'Singkronkan Antrean Sekarang'}
          </button>

          <button
            onClick={handleSimulateConflict}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Simulasi Konflik
          </button>
        </div>

        {/* Offline Queue Item List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E2B963]" />
              Daftar Antrean & Konflik Terdeteksi
            </h4>
            {queue.filter((q) => q.synced && !q.hasConflict).length > 0 && (
              <button
                onClick={() => offlineSyncEngine.clearSyncedQueue()}
                className="text-[10px] text-gray-400 hover:text-white cursor-pointer"
              >
                Bersihkan Terkirim
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#14171E]/50 border border-white/5 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
              <p className="text-xs font-bold text-white">Tidak Ada Antrean Offline</p>
              <p className="text-[11px] text-gray-400">
                Seluruh data transaksi & perubahan lokal telah 100% tersinkronisasi dengan aman.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                    item.hasConflict
                      ? 'bg-red-500/10 border-red-500/40'
                      : item.synced
                      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                      : 'bg-[#14171E] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                        {item.actionType}
                      </span>
                      {item.hasConflict ? (
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Konflik
                        </span>
                      ) : item.synced ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tersinkronisasi
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Mengantri (Offline)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Item Description */}
                  <div className="text-xs text-gray-200 font-medium">
                    {item.payload.notes || item.payload.title || JSON.stringify(item.payload).substring(0, 50)}
                    {item.payload.amount && (
                      <span className="font-bold text-[#E2B963] ml-2">{formatRp(item.payload.amount)}</span>
                    )}
                  </div>

                  {/* Conflict Resolution Card if Has Conflict */}
                  {item.hasConflict && item.conflictDetails && (
                    <div className="p-3 rounded-xl bg-[#0B0D10] border border-red-500/30 space-y-2 text-xs">
                      <div className="text-[11px] text-red-300 font-bold">
                        ⚠️ Reason: {item.conflictDetails.conflictReason}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-[9px] uppercase font-bold text-amber-400 block">Draf Lokal (Offline)</span>
                          <p className="font-semibold text-white mt-1">
                            {item.conflictDetails.localPayload.notes || 'Draf Offline'}
                          </p>
                          <p className="text-[#E2B963] font-mono font-bold">
                            {formatRp(item.conflictDetails.localPayload.amount || 0)}
                          </p>
                        </div>

                        <div className="p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-[9px] uppercase font-bold text-blue-400 block">Versi Server (Online)</span>
                          <p className="font-semibold text-white mt-1">
                            {item.conflictDetails.serverPayload.notes || 'Versi Server'}
                          </p>
                          <p className="text-[#E2B963] font-mono font-bold">
                            {formatRp(item.conflictDetails.serverPayload.amount || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Safe Resolution Options */}
                      <div className="pt-2 flex items-center gap-1.5">
                        <button
                          onClick={() => handleResolveConflict(item.id, 'USE_LOCAL')}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                        >
                          Gunakan Data Lokal
                        </button>
                        <button
                          onClick={() => handleResolveConflict(item.id, 'USE_SERVER')}
                          className="flex-1 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-500/40 cursor-pointer"
                        >
                          Gunakan Data Server
                        </button>
                        <button
                          onClick={() => handleResolveConflict(item.id, 'MERGE')}
                          className="flex-1 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40 cursor-pointer"
                        >
                          Gabungkan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Jaminan Keamanan Data Finansial
          </span>
          <span>LUXFIN AI PWA Sync v1.0</span>
        </div>
      </div>
    </div>
  );
};
