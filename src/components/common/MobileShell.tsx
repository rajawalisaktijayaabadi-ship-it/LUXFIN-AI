import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Monitor,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(true);
  const [detectedOS, setDetectedOS] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [developerBypass, setDeveloperBypass] = useState<boolean>(false);
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android' | 'full'>('iphone');
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    const checkPlatform = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isAndroid = /Android/i.test(ua);
      const isIOS =
        /iPhone|iPad|iPod/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      const isMobile = isAndroid || isIOS || window.innerWidth < 820;

      setIsMobileDevice(isMobile);
      if (isAndroid) setDetectedOS('android');
      else if (isIOS) setDetectedOS('ios');
      else setDetectedOS('desktop');

      if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.href);
      }
    };

    checkPlatform();
    window.addEventListener('resize', checkPlatform);
    return () => window.removeEventListener('resize', checkPlatform);
  }, []);

  // 1. IF REAL MOBILE (ANDROID OR IOS) OR SMALL VIEWPORT -> SERVE NATIVE FULLSCREEN APP DIRECTLY
  if (isMobileDevice) {
    return (
      <div className="w-full min-h-screen bg-[#0B0D10] text-[#F7F6F2] selection:bg-[#E2B963] selection:text-black font-sans">
        {children}
      </div>
    );
  }

  // 2. IF ON DESKTOP & DEVELOPER BYPASS IS ACTIVE -> SHOW SIMULATED MOBILE PHONE FRAME
  if (developerBypass) {
    return (
      <div className="w-full min-h-screen bg-[#07080A] text-[#F7F6F2] flex flex-col items-center justify-start p-4 md:p-6 font-sans select-none">
        {/* Simulator Top Control Header */}
        <div className="w-full max-w-4xl bg-[#14171E] border border-[#E2B963]/30 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] flex items-center justify-center text-black font-black text-sm shadow-md">
              LX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide">LUXFIN AI</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SIMULATOR MODE
                </span>
              </div>
              <p className="text-[10px] text-[#9CA3AF]">Pratinjau Pengembang — Ukuran Layar Mobile Standar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0B0D10] p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setDeviceFrame('iphone')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  deviceFrame === 'iphone' ? 'bg-[#E2B963] text-black shadow' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                iOS (iPhone)
              </button>
              <button
                onClick={() => setDeviceFrame('android')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  deviceFrame === 'android' ? 'bg-emerald-400 text-black shadow' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setDeviceFrame('full')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  deviceFrame === 'full' ? 'bg-white/20 text-white shadow' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Full
              </button>
            </div>

            <button
              onClick={() => setDeveloperBypass(false)}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              Kunci Kembali
            </button>
          </div>
        </div>

        {/* Device Frame Viewport Container */}
        {deviceFrame === 'full' ? (
          <div className="w-full max-w-md bg-[#0B0D10] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {children}
          </div>
        ) : (
          <div className="relative flex-1 flex items-center justify-center pb-8">
            <div
              className={`transition-all duration-300 relative bg-[#0B0D10] border-4 border-[#2A2E39] shadow-[0_0_60px_rgba(226,185,99,0.15)] rounded-[48px] overflow-hidden flex flex-col ${
                deviceFrame === 'iphone' ? 'w-[395px] h-[830px]' : 'w-[412px] h-[840px]'
              }`}
            >
              {/* Phone Status Bar / Notch */}
              <div className="w-full bg-[#0B0D10] pt-2 px-6 pb-1 flex items-center justify-between text-[11px] text-[#9CA3AF] z-50 select-none border-b border-white/5">
                <span className="font-semibold text-white font-mono">09:41</span>
                <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mobile App Canvas */}
              <div className="flex-1 overflow-y-auto relative scrollbar-none">{children}</div>

              {/* Bottom Home Bar */}
              <div className="w-full bg-[#0B0D10] py-2 flex items-center justify-center z-50">
                <div className="w-28 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. DEFAULT RESTRICTION GUARD: ACCESSED ON DESKTOP PC / TABLET
  return (
    <div className="min-h-screen bg-[#07080A] text-[#F7F6F2] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E2B963]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#14171E] border-2 border-[#E2B963]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10 text-center">
        
        {/* Brand Header & Lock Icon */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] mx-auto flex items-center justify-center shadow-xl shadow-[#E2B963]/20 relative">
            <Smartphone className="w-8 h-8 text-black" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-red-500 rounded-full text-white border-2 border-[#14171E]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-mono">
              KHUSUS MOBILE ANDROID & IOS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
              Akses Terbatas Ke Smartphone
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
              Sistem Operasi LUXFIN AI dirancang khusus untuk berjalan di perangkat <span className="text-white font-bold">Android & iOS (iPhone)</span> guna memanfaatkan enkripsi keamanan hardware & sensor kamera Struk OCR.
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-black/60 p-5 rounded-2xl border border-white/10 space-y-3">
          <p className="text-xs font-bold text-[#E2B963] flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#E2B963]" />
            Scan QR Code Untuk Membuka di HP Anda
          </p>

          <div className="w-44 h-44 bg-white p-2.5 rounded-2xl mx-auto shadow-lg border-2 border-[#E2B963]/50 flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                currentUrl || 'https://ais-dev-bptyv4klriomxt4ubgzl3j-377049533239.asia-east1.run.app'
              )}`}
              alt="Scan QR Mobile Access"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-[10px] text-[#9CA3AF]">
            Arahkan kamera HP Android atau iPhone Anda ke gambar QR di atas untuk membuka secara otomatis.
          </p>
        </div>

        {/* Platform Compatibility Badges */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Sistem Yang Didukung:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Android App & PWA</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[#E2B963]">
              <span className="w-2 h-2 rounded-full bg-[#E2B963] animate-pulse" />
              <span>iOS (iPhone Safari)</span>
            </div>
          </div>
        </div>

        {/* Developer Bypass Link */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={() => setDeveloperBypass(true)}
            className="text-[11px] text-[#9CA3AF] hover:text-[#E2B963] flex items-center justify-center gap-1 mx-auto font-medium transition-all cursor-pointer underline"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Mode Pengembang: Buka Simulator Mobile di Desktop</span>
          </button>
        </div>

        <p className="text-[9px] text-[#9CA3AF]/60 font-mono">
          © 2026 LUXFIN AI Mobile Security Engine. Android & iOS Enforced.
        </p>

      </div>
    </div>
  );
};
