import React, { useState } from 'react';
import { Key, ShieldCheck, X, AlertCircle, Loader2 } from 'lucide-react';
import { storage } from '../../utils/storage';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({ isOpen, onClose }) => {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Validate server side
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: inputKey.trim(),
          deviceId: 'dev_mobile_01',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || 'Lisensi tidak valid.');
      }

      // Activate in storage manager
      const act = storage.activateLicense(inputKey.trim());
      if (act.success) {
        onClose();
        alert('Lisensi komersial berhasil diverifikasi & diaktifkan!');
      } else {
        setErrorMsg(act.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memverifikasi lisensi dengan server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-[#0B0D10] border border-[#E2B963]/30 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#E2B963]" />
            <h3 className="text-xs font-bold text-[#F7F6F2]">Aktivasi Lisensi Komersial</h3>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerifyLicense} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] text-[#9CA3AF] mb-1">Kode Lisensi (Format: LUX-XXXX-XXXX)</label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="LUX-2026-IND-VIP88"
              className="w-full bg-[#14171E] border border-white/10 rounded-xl p-3 text-xs font-mono text-center text-[#E2B963] font-bold uppercase focus:outline-none focus:border-[#E2B963]"
            />
          </div>

          <div className="text-[10px] text-[#9CA3AF] bg-[#14171E] p-2.5 rounded-xl border border-white/5 space-y-1">
            <p>• Lisensi terverifikasi secara server-side.</p>
            <p>• Kode Lisensi Bawaan Uji Coba: <strong className="text-white">LUX-2026-IND-VIP88</strong></p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputKey.trim()}
            className="w-full py-3 rounded-xl bg-[#E2B963] text-black font-bold text-xs flex items-center justify-center gap-2 shadow hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifikasi Server...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Aktivasi Lisensi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
