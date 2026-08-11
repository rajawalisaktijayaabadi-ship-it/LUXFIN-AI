import React, { useState } from 'react';
import { ArrowLeft, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input, PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { auth } from '../../utils/auth';

interface ResetPasswordScreenProps {
  initialEmail?: string;
  initialCode?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  initialEmail = '',
  initialCode = '',
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || code.length < 6) {
      setError('Masukkan 6 digit kode verifikasi.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auth.resetPassword(email, code, newPassword);
      setIsLoading(false);

      if (res.success) {
        setIsDone(true);
      } else {
        setError(res.error || 'Gagal memperbarui kata sandi.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col p-5 max-w-md mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#E2B963]">RESET KATA SANDI</span>
        <div className="w-8" />
      </div>

      <div className="my-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Buat Kata Sandi Baru</h2>
          <p className="text-xs text-[#9CA3AF]">
            Masukkan kode verifikasi dan tentukan kata sandi baru untuk <span className="text-white font-semibold">{email}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isDone ? (
          <div className="p-6 text-center bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-4 my-auto animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Kata Sandi Berhasil Diperbarui!</h3>
              <p className="text-xs text-[#9CA3AF]">
                Anda sekarang dapat masuk menggunakan kata sandi baru Anda.
              </p>
            </div>
            <Button variant="primary" className="w-full" onClick={onSuccess}>
              Masuk Sekarang
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Kode Verifikasi (6 Digit)"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
              required
            />

            <PasswordInput
              label="Kata Sandi Baru"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <PasswordInput
              label="Konfirmasi Kata Sandi Baru"
              placeholder="Ketik ulang kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Simpan Kata Sandi Baru
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
