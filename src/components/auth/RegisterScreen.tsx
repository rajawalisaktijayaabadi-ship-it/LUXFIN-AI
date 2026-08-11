import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Input, PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { auth } from '../../utils/auth';

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onGoogleAuth: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onSuccess,
  onNavigateLogin,
  onGoogleAuth,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password Strength Indicator
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', pct: 0 };
    if (password.length < 6) return { label: 'Terlalu Pendek (min. 6)', color: 'bg-red-500', pct: 25 };
    if (password.length < 10) return { label: 'Cukup Kuat', color: 'bg-amber-500', pct: 60 };
    return { label: 'Sangat Kuat (VIP Security)', color: 'bg-emerald-500', pct: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Email tidak valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreedTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auth.register({
        name,
        email,
        phone,
        passwordHash: password,
      });
      setIsLoading(false);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Gagal mendaftar akun.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col p-5 max-w-md mx-auto animate-in fade-in duration-300 pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#E2B963] tracking-wide flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> LUXFIN REGISTRATION
        </span>
        <div className="w-8" />
      </div>

      <div className="space-y-4 my-auto">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Buat Akun LUXFIN AI</h2>
          <p className="text-xs text-[#9CA3AF]">
            Dapatkan akun terenkripsi pribadi dengan akses AI Copilot Keuangan.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Nama Lengkap"
            placeholder="mis. Fitri Handayani"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Nomor WhatsApp / HP (Opsional)"
            type="tel"
            placeholder="+62 812-xxxx-xxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <PasswordInput
              label="Kata Sandi Baru"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            {password && (
              <div className="space-y-1">
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#9CA3AF] text-right font-semibold">{strength.label}</p>
              </div>
            )}
          </div>

          <PasswordInput
            label="Konfirmasi Kata Sandi"
            placeholder="Ketik ulang kata sandi"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#9CA3AF] pt-1">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-white/10 bg-[#14171E] text-[#E2B963] focus:ring-0"
            />
            <span>
              Saya menyetujui <span className="text-[#E2B963] underline">Syarat & Ketentuan</span> serta Kebijakan Privasi LUXFIN AI.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Daftar Akun
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
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
          <span>Daftar via Google</span>
        </button>
      </div>

      <div className="pt-4 text-center text-xs text-[#9CA3AF]">
        Sudah punya akun?{' '}
        <button
          onClick={onNavigateLogin}
          className="text-[#E2B963] font-bold hover:underline cursor-pointer"
        >
          Masuk di Sini
        </button>
      </div>
    </div>
  );
};
