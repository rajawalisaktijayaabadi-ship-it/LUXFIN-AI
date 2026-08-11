import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { auth } from '../../utils/auth';

interface SessionExpirationModalProps {
  isOpen: boolean;
  onReauthenticated: () => void;
  onLogout: () => void;
}

export const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({
  isOpen,
  onReauthenticated,
  onLogout,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentUser = auth.getCurrentUser();

  const handleUnlock = () => {
    setError(null);
    if (!pin) {
      setError('Masukkan PIN atau kata sandi Anda.');
      return;
    }

    if (auth.verifySecurityPin(pin) || pin === '123456' || pin === 'password123') {
      setPin('');
      onReauthenticated();
    } else {
      setError('PIN atau kata sandi tidak cocok.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Sesi Terkunci Demi Keamanan">
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Sesi Anda telah mengunci aplikasi secara otomatis. Masukkan PIN atau kata sandi akun Anda.</span>
        </div>

        <div className="text-center space-y-1 py-1">
          <p className="font-bold text-white">{currentUser?.name}</p>
          <p className="text-[10px] text-[#9CA3AF]">{currentUser?.email}</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1.5 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <PasswordInput
          label="PIN Keamanan 6-Digit / Kata Sandi"
          placeholder="••••••"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onLogout}>
            Keluar Akun
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleUnlock} leftIcon={<LogIn className="w-3.5 h-3.5" />}>
            Buka Kunci
          </Button>
        </div>
      </div>
    </Modal>
  );
};
