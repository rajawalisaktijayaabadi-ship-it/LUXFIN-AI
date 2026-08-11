import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface WelcomeScreenProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onGoogleAuth: () => void;
  onDemoAccess: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onGoogleAuth,
  onDemoAccess,
}) => {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col justify-between p-5 max-w-md mx-auto relative overflow-hidden animate-in fade-in duration-300">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E2B963]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-64 h-64 bg-[#C59A3F]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="flex justify-between items-center z-10 pt-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E2B963]" />
          <span className="font-bold text-sm tracking-wide text-white">LUXFIN AI</span>
        </div>
        <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#9CA3AF] flex items-center gap-1 font-mono">
          <Lock className="w-3 h-3 text-[#E2B963]" /> SECURE AUTH
        </span>
      </div>

      {/* Main Feature Banner */}
      <div className="my-auto space-y-6 z-10 py-6">
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-[#E2B963] uppercase tracking-widest bg-[#E2B963]/10 px-3 py-1 rounded-full border border-[#E2B963]/30">
            Sistem Keuangan VIP Komersial
          </span>
          <h1 className="text-2xl font-black text-white leading-tight">
            Kelola Kekayaan & Kas Bisnis dengan <span className="text-gold-gradient">Kecerdasan AI</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Catat arus kas, analisis rasio mampu beli, pantau aset investasi, dan dapatkan rekomendasi AI pribadi secara real-time.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 bg-[#14171E] p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#E2B963] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">AI Copilot OCR & Input Suara</p>
              <p className="text-[10px] text-[#9CA3AF]">Pindai struk & perintahkan AI mencatat otomatis.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#E2B963] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Kalkulator Mampu Beli (Affordability)</p>
              <p className="text-[10px] text-[#9CA3AF]">Evaluasi pembelian barang mahal secara rasional.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#E2B963] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Isolasi Data & Keamanan Enkripsi</p>
              <p className="text-[10px] text-[#9CA3AF]">Data tersimpan aman & tidak dapat diakses pihak lain.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 z-10 pb-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onNavigateLogin}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Masuk dengan Email
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onNavigateRegister}
        >
          Daftar Akun Baru
        </Button>

        {/* Google Authentication Button */}
        <button
          onClick={onGoogleAuth}
          className="w-full min-h-[46px] p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>

        <div className="pt-2 text-center">
          <button
            onClick={onDemoAccess}
            className="text-[11px] text-[#E2B963] font-semibold hover:underline cursor-pointer"
          >
            Masuk sebagai Tamu / Akses Instan (Mode Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
