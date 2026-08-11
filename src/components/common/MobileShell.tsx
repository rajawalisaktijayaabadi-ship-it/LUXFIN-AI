import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'ipad' | 'full'>('iphone');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop || deviceFrame === 'full') {
    return <div className="w-full min-h-screen bg-[#0B0D10] text-[#F7F6F2] selection:bg-[#E2B963] selection:text-black">{children}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#07080A] text-[#F7F6F2] flex flex-col items-center justify-start p-4 md:p-6 font-sans">
      {/* Top Banner Header */}
      <div className="w-full max-w-5xl bg-[#14171E] border border-[#E2B963]/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E2B963] to-[#B8860B] flex items-center justify-center text-black font-black text-xl shadow-lg">
            LX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#F7F6F2]">LUXFIN AI</h1>
              <span className="text-[10px] uppercase tracking-wider bg-[#E2B963]/15 text-[#E2B963] px-2 py-0.5 rounded-full border border-[#E2B963]/30 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Mobile OS
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">Your Money. Smarter. — Aplikasi Khusus Smartphone & Tablet (PWA)</p>
          </div>
        </div>

        {/* Viewport Simulator Controls */}
        <div className="flex items-center gap-2 bg-[#0B0D10] p-1.5 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setDeviceFrame('iphone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              deviceFrame === 'iphone'
                ? 'bg-[#E2B963] text-black font-semibold shadow'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            iPhone (390px)
          </button>
          <button
            onClick={() => setDeviceFrame('ipad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              deviceFrame === 'ipad'
                ? 'bg-[#E2B963] text-black font-semibold shadow'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            Tablet (600px)
          </button>
          <button
            onClick={() => setDeviceFrame('full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              (deviceFrame as string) === 'full'
                ? 'bg-[#E2B963] text-black font-semibold shadow'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Mode Penuh
          </button>
        </div>
      </div>

      {/* Device Frame Simulator */}
      <div className="relative flex-1 flex items-center justify-center pb-8">
        <div
          className={`transition-all duration-300 relative bg-[#0B0D10] border-4 border-[#2A2E39] shadow-[0_0_50px_rgba(226,185,99,0.15)] rounded-[48px] overflow-hidden flex flex-col ${
            deviceFrame === 'iphone' ? 'w-[400px] h-[840px]' : 'w-[640px] h-[880px]'
          }`}
        >
          {/* Simulated Phone Notch / Dynamic Island */}
          <div className="w-full bg-[#0B0D10] pt-2 px-6 pb-1 flex items-center justify-between text-[11px] text-[#9CA3AF] z-50 select-none">
            <span className="font-semibold text-white">09:41</span>
            <div className="w-24 h-5 bg-black rounded-full mx-auto flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Actual Mobile App Inner Viewport */}
          <div className="flex-1 overflow-y-auto relative scrollbar-none">{children}</div>

          {/* Simulated Home Indicator Bar */}
          <div className="w-full bg-[#0B0D10] py-2 flex items-center justify-center z-50">
            <div className="w-32 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
