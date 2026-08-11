import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, RefreshCw, Sparkles, Share, PlusSquare } from 'lucide-react';
import { getPWAState, promptPWAInstall, subscribePWAInstallState, PWAInstallState } from '../../utils/pwaHelper';

export const PWAInstallBanner: React.FC = () => {
  const [pwaState, setPwaState] = useState<PWAInstallState>(getPWAState());
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [hasNewSWVersion, setHasNewSWVersion] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribePWAInstallState(() => {
      setPwaState(getPWAState());
    });

    const handleSWUpdate = (e: any) => {
      setHasNewSWVersion(true);
      if (e.detail) setSwReg(e.detail);
    };

    window.addEventListener('luxfin_sw_updated', handleSWUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('luxfin_sw_updated', handleSWUpdate);
    };
  }, []);

  const handleInstallClick = async () => {
    if (pwaState.isIOS) {
      setShowIOSGuide(true);
    } else if (pwaState.canPrompt) {
      const success = await promptPWAInstall();
      if (success) {
        setPwaState(getPWAState());
      }
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleUpdateSW = () => {
    if (swReg && swReg.waiting) {
      swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (dismissed && !hasNewSWVersion) return null;

  // Render SW Update Banner
  if (hasNewSWVersion) {
    return (
      <div className="bg-gradient-to-r from-purple-900/90 via-[#14171E] to-purple-900/90 border-b border-purple-500/40 px-4 py-2 text-xs flex items-center justify-between text-white animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
          <span>Versi baru LUXFIN AI tersedia!</span>
        </div>
        <button
          onClick={handleUpdateSW}
          className="px-3 py-1 rounded-lg bg-[#E2B963] text-black font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer text-[11px]"
        >
          <RefreshCw className="w-3 h-3" /> Perbarui Aplikasi
        </button>
      </div>
    );
  }

  // Hide install prompt if already installed in standalone mode
  if (pwaState.isInstalled || dismissed) return null;

  return (
    <>
      {/* PWA Install Banner at Top */}
      <div className="bg-[#14171E] border-b border-[#E2B963]/30 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#E2B963]/20 text-[#E2B963]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-[#F7F6F2]">Install LUXFIN AI PWA App</p>
            <p className="text-[10px] text-gray-400">Akses cepat offline, icon aplikasi, & performa tinggi.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-[#E2B963] text-black font-bold text-[11px] flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Step-By-Step Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0B0D10] border border-[#E2B963]/40 rounded-2xl p-5 space-y-4 shadow-2xl text-xs text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm text-[#E2B963]">Panduan Install PWA iOS / Safari</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#14171E] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#E2B963] text-black font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p className="text-[11px]">
                  Tekan tombol <Share className="w-3.5 h-3.5 text-blue-400 inline mx-0.5" /> <strong>Bagikan (Share)</strong> pada bilah bawah Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#14171E] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#E2B963] text-black font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p className="text-[11px]">
                  Gulir ke bawah dan pilih <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline mx-0.5" /> <strong>'Tambahkan ke Layar Utama' (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#14171E] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#E2B963] text-black font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p className="text-[11px]">
                  Tekan <strong>'Tambah'</strong> di kanan atas. Icon LUXFIN AI akan muncul di layar utama iOS Anda.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-[#E2B963] text-black font-bold text-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
