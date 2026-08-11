import React, { useState } from 'react';
import { ArrowLeft, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { auth } from '../../utils/auth';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onNavigateReset: (email: string, code: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onNavigateReset,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentCode, setSentCode] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Masukkan alamat email terdaftar.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auth.requestPasswordReset(email);
      setIsLoading(false);

      if (res.success && res.code) {
        setSentCode(res.code);
      } else {
        setError(res.error || 'Gagal mengirim kode pemulihan.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col p-5 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#E2B963]">LUPA KATA SANDI</span>
        <div className="w-8" />
      </div>

      <div className="my-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Pemulihan Kata Sandi</h2>
          <p className="text-xs text-[#9CA3AF]">
            Masukkan email akun Anda. Kami akan mengirimkan 6 digit kode verifikasi rahasia.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sentCode ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-xs font-bold">Kode Pemulihan Dikirim!</h3>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Kode verifikasi telah dikirim ke <span className="text-white font-semibold">{email}</span>.
            </p>
            <div className="p-3 rounded-xl bg-[#0B0D10] border border-emerald-500/30 text-center space-y-1">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest">
                Kode Verifikasi Terenkripsi
              </span>
              <p className="text-2xl font-mono font-black text-[#E2B963] tracking-wider">{sentCode}</p>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => onNavigateReset(email, sentCode)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut Masukkan Kode
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              label="Alamat Email Terdaftar"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Kirim Kode Verifikasi
            </Button>
          </form>
        )}
      </div>

      <div className="pt-6 pb-2 text-center text-xs text-[#9CA3AF]">
        Ingat kata sandi Anda?{' '}
        <button onClick={onBack} className="text-[#E2B963] font-bold hover:underline cursor-pointer">
          Kembali ke Login
        </button>
      </div>
    </div>
  );
};
