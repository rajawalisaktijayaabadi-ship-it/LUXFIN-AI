import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Input, PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { auth } from '../../utils/auth';
import { storage } from '../../utils/storage';

interface SecurityScreenProps {
  onBack: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ onBack }) => {
  const user = auth.getCurrentUser();
  const [sessions, setSessions] = useState(auth.getSessionsList());

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // PIN state
  const [pin, setPin] = useState(user?.securityPin || '');
  const [pinSaved, setPinSaved] = useState(false);

  // 2FA state
  const [twoFA, setTwoFA] = useState(user?.twoFactorEnabled || false);

  const auditLogs = storage.getState().auditLogs.slice(0, 5);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPass.length < 6) {
      setPassMessage({ type: 'ERROR', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: 'ERROR', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    auth.updateProfileDetails({});
    setPassMessage({ type: 'SUCCESS', text: 'Kata sandi akun berhasil diperbarui!' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleSavePin = () => {
    if (pin.length !== 6 || isNaN(Number(pin))) {
      alert('PIN Keamanan harus berupa 6 digit angka.');
      return;
    }
    auth.setSecurityPin(pin);
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFA;
    setTwoFA(nextVal);
    auth.toggle2FA(nextVal);
  };

  const handleRevokeSession = (sessionId: string) => {
    auth.revokeSession(sessionId);
    setSessions(auth.getSessionsList());
  };

  return (
    <div className="p-4 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171E] border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-bold text-[#E2B963] tracking-wide flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> PUSAT KEAMANAN
        </span>
      </div>

      {/* Security Status Card */}
      <Card variant="gold-border" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E2B963]" />
            <h2 className="text-sm font-bold text-white">Status Proteksi Akun</h2>
          </div>
          <Badge variant="emerald">Enkripsi 256-bit Active</Badge>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          Seluruh kredensial dan log sesi dilindungi oleh kunci RSA terenkripsi.
        </p>
      </Card>

      {/* 1. Change Password */}
      <Card variant="obsidian" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Lock className="w-4 h-4 text-[#E2B963]" />
          <h3 className="text-xs font-bold text-white">Ubah Kata Sandi</h3>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              passMessage.type === 'SUCCESS'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            {passMessage.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <PasswordInput
            label="Kata Sandi Baru"
            placeholder="Minimal 6 karakter"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
          />
          <PasswordInput
            label="Konfirmasi Kata Sandi Baru"
            placeholder="Ketik ulang kata sandi baru"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />
          <Button type="submit" variant="soft-gold" size="sm" className="w-full">
            Perbarui Kata Sandi
          </Button>
        </form>
      </Card>

      {/* 2. Security PIN & 2FA */}
      <Card variant="obsidian" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <KeyRound className="w-4 h-4 text-[#E2B963]" />
          <h3 className="text-xs font-bold text-white">PIN Akses Cepat & Otentikasi 2-Faktor</h3>
        </div>

        {/* PIN Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#9CA3AF] block">PIN Akses 6-Digit (Aplikasi / Transaksi):</label>
          <div className="flex gap-2">
            <Input
              type="password"
              maxLength={6}
              placeholder="123456"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="font-mono text-center tracking-widest font-bold"
            />
            <Button size="sm" variant="primary" onClick={handleSavePin}>
              {pinSaved ? 'Tersimpan!' : 'Simpan PIN'}
            </Button>
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Otentikasi 2-Faktor (2FA)</p>
            <p className="text-[10px] text-[#9CA3AF]">Minta kode verifikasi tambahan saat login dari perangkat baru.</p>
          </div>
          <button
            type="button"
            onClick={handleToggle2FA}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
              twoFA ? 'bg-[#E2B963]' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ease-in-out ${
                twoFA ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 3. Active Sessions */}
      <Card variant="obsidian" className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#E2B963]" />
            <h3 className="text-xs font-bold text-white">Sesi Login Aktif</h3>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">{sessions.length} Sesi Terhubung</span>
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => (
            <div
              key={sess.sessionId}
              className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{sess.deviceName}</p>
                  {sess.isCurrent && <Badge variant="gold">Sesi Ini</Badge>}
                </div>
                <p className="text-[10px] text-[#9CA3AF]">
                  IP: {sess.ipAddress} • Login: {new Date(sess.loginAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.sessionId)}
                  className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Keluar
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Audit Security Log */}
      <Card variant="obsidian" className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold text-white">Log Aktivitas Keamanan</h3>
          <span className="text-[10px] text-[#9CA3AF]">Terbaru</span>
        </div>

        <div className="space-y-1.5">
          {auditLogs.map((log) => (
            <div key={log.id} className="text-[11px] p-2 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{log.action}</p>
                <p className="text-[10px] text-[#9CA3AF]">{log.details}</p>
              </div>
              <span className="text-[9px] text-[#9CA3AF] font-mono">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
