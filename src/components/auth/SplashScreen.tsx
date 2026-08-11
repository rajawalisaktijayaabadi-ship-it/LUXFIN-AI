import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Mengaktifkan Enkripsi End-to-End...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Memeriksa Sesi & Lisensi Komersial...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Mempersiapkan AI Copilot Keuangan...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Selesai');
    }, 1800);

    const timer4 = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D10] flex flex-col items-center justify-between p-8 select-none animate-in fade-in duration-300">
      <div className="w-full flex justify-end">
        <span className="text-[10px] text-[#E2B963] bg-[#E2B963]/10 px-2.5 py-1 rounded-full border border-[#E2B963]/20 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> VIP ENTERPRISE v1.0
        </span>
      </div>

      {/* Center Logo */}
      <div className="flex flex-col items-center space-y-6 text-center my-auto">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#14171E] via-[#252B37] to-[#14171E] border-2 border-[#E2B963] border-gold-glow flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
            <Sparkles className="w-12 h-12 text-[#E2B963] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#E2B963] to-[#C59A3F] text-black font-black text-[9px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-widest">
            AI CORE
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">
            LUX<span className="text-gold-gradient">FIN AI</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] max-w-xs font-medium tracking-wide">
            Operating System Keuangan Komersial & Proteksi Kekayaan Pribadi
          </p>
        </div>
      </div>

      {/* Bottom Progress */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gold-gradient h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#9CA3AF]">
          <span>{statusText}</span>
          <span className="font-mono text-[#E2B963] font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
