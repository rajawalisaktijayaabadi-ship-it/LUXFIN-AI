import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { Input, PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { auth } from '../../utils/auth';

interface LoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onGoogleAuth: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
  onGoogleAuth,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auth.login(email, password);
      setIsLoading(false);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Gagal masuk. Periksa kembali detail Anda.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const fillQuickDemo = () => {
    setEmail('fitrihandayani.cloud99@gmail.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col p-5 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#E2B963] tracking-wide flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> LUXFIN AUTH
        </span>
        <div className="w-8" />
      </div>

      <div className="my-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Selamat Datang Kembali</h2>
          <p className="text-xs text-[#9CA3AF]">
            Masukkan email dan kata sandi akun LUXFIN AI Anda untuk melanjutkan.
          </p>
        </div>

        {/* Demo Auto-Fill Banner */}
        <div className="p-3 rounded-xl bg-[#E2B963]/10 border border-[#E2B963]/30 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-[#E2B963]">Akun Demo VIP</p>
            <p className="text-[10px] text-[#9CA3AF]">fitrihandayani.cloud99@gmail.com</p>
          </div>
          <button
            type="button"
            onClick={fillQuickDemo}
            className="px-2.5 py-1 rounded-lg bg-[#E2B963] text-black font-bold text-[10px] hover:brightness-110 cursor-pointer"
          >
            Isi Otomatis
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Terdaftar"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#9CA3AF]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-[#14171E] text-[#E2B963] focus:ring-0"
              />
              <span>Ingat Saya</span>
            </label>

            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-[#E2B963] font-semibold hover:underline cursor-pointer text-[11px]"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Masuk Sekarang
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0B0D10] px-3 text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
            atau
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={onGoogleAuth}
          className="w-full min-h-[44px] p-2.5 rounded-xl bg-[#14171E] border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
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
          <span>Masuk via Google</span>
        </button>
      </div>

      {/* Footer Link */}
      <div className="pt-6 pb-2 text-center text-xs text-[#9CA3AF]">
        Belum memiliki akun?{' '}
        <button
          onClick={onNavigateRegister}
          className="text-[#E2B963] font-bold hover:underline cursor-pointer"
        >
          Daftar Gratis
        </button>
      </div>
    </div>
  );
};
