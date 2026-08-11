import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  Zap,
  Info,
  ArrowRight,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import {
  activateLicenseServer,
  getOrCreateDeviceId,
} from '../../utils/licenseClient';
import { UserProfile, LicenseValidationResult, LicenseErrorCode } from '../../types';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onActivationSuccess: (result: LicenseValidationResult) => void;
  onOpenAdminPanel?: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onActivationSuccess,
  onOpenAdminPanel,
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<LicenseValidationResult | null>(null);

  if (!isOpen) return null;

  const { deviceId, deviceName } = getOrCreateDeviceId();

  const handleActivate = async (keyToActivate?: string) => {
    const key = keyToActivate || licenseInput;
    if (!key.trim()) return;

    setIsSubmitting(true);
    setValidationResult(null);

    const result = await activateLicenseServer(key, currentUser);
    setIsSubmitting(false);
    setValidationResult(result);

    if (result.valid) {
      setTimeout(() => {
        onActivationSuccess(result);
      }, 1200);
    }
  };

  const getErrorContent = (errorCode?: LicenseErrorCode, msg?: string) => {
    switch (errorCode) {
      case 'ALREADY_ACTIVATED':
        return {
          title: 'Lisensi Terikat ke Akun Lain',
          badge: 'Aturan 1 Akun = 1 Lisensi',
          icon: <Lock className="w-8 h-8 text-amber-400" />,
          color: 'from-amber-950/60 to-red-950/40 border-amber-500/40',
          desc: msg || 'Lisensi ini sudah terdaftar pada akun pengguna lain. Setiap lisensi komersial hanya dapat digunakan oleh 1 akun.',
          advice: 'Silakan gunakan lisensi yang terdaftar untuk akun Anda atau hubungi admin untuk transfer hak milik.',
        };
      case 'DEVICE_CONFLICT':
        return {
          title: 'Konflik Perangkat Utama',
          badge: 'Terikat ke Perangkat Lain',
          icon: <Smartphone className="w-8 h-8 text-amber-400" />,
          color: 'from-amber-950/60 to-orange-950/40 border-amber-500/40',
          desc: msg || 'Lisensi Anda terikat pada perangkat utama lain. Penggunaan paralel di perangkat baru ditolak demi keamanan.',
          advice: 'Gunakan fitur Reset Perangkat di Admin Panel atau masuk melalui perangkat utama yang terdaftar.',
        };
      case 'EXPIRED':
        return {
          title: 'Masa Berlaku Lisensi Habis',
          badge: 'Kadaluarsa',
          icon: <Clock className="w-8 h-8 text-red-400" />,
          color: 'from-red-950/60 to-pink-950/40 border-red-500/40',
          desc: msg || 'Masa aktif paket lisensi ini telah habis.',
          advice: 'Silakan perbarui langganan atau tukarkan lisensi komersial baru.',
        };
      case 'SUSPENDED':
        return {
          title: 'Lisensi Dibekukan',
          badge: 'Pembekuan Keamanan',
          icon: <ShieldAlert className="w-8 h-8 text-amber-400" />,
          color: 'from-amber-950/60 to-red-950/40 border-amber-500/40',
          desc: msg || 'Lisensi ini ditangguhkan sementara oleh administrator.',
          advice: 'Hubungi dukungan pelanggan LUXFIN AI untuk verifikasi identitas dan pembukaan blokir.',
        };
      case 'REVOKED':
        return {
          title: 'Lisensi Dibatalkan Permanen',
          badge: 'Dibatalkan (Revoked)',
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: 'from-red-950/80 to-stone-950/80 border-red-500/60',
          desc: msg || 'Lisensi komersial ini telah dibatalkan secara resmi.',
          advice: 'Lisensi tidak berlaku lagi karena refund atau pelanggaran Lisensi Pengguna.',
        };
      case 'INVALID_KEY':
        return {
          title: 'Kode Lisensi Tidak Valid',
          badge: 'Tidak Terdaftar',
          icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
          color: 'from-stone-900/90 to-red-950/30 border-stone-700/60',
          desc: msg || 'Kode lisensi yang Anda masukkan tidak terdaftar di server kami.',
          advice: 'Periksa kembali ejaan kode lisensi Anda. Format baku: LUX-XXXX-2026-XXXX.',
        };
      default:
        return {
          title: 'Kesalahan Validasi Server',
          badge: 'Gagal Terhubung',
          icon: <Server className="w-8 h-8 text-stone-400" />,
          color: 'from-stone-900/90 to-stone-950/90 border-stone-800',
          desc: msg || 'Gagal terhubung ke server validasi lisensi komersial.',
          advice: 'Pastikan perangkat terhubung ke internet dan coba lagi beberapa saat.',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-stone-950 border border-amber-500/30 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-amber-500/15 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100">Aktivasi Lisensi Komersial</h3>
                <p className="text-xs text-amber-400/90 font-medium">LUXFIN AI Enterprise Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 text-stone-400 flex items-center justify-center hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-stone-800/60 text-[11px] text-stone-400">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Server Validation: <strong className="text-emerald-400">Online (Strict Enforcement)</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Rule banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-amber-300">Aturan Lisensi Komersial Resmi:</p>
              <p className="text-stone-400">
                <strong>1 Akun = 1 Lisensi.</strong> Lisensi akan diikat secara permanen pada akun pengguna <strong>{currentUser.email}</strong> dan perangkat utama saat ini.
              </p>
            </div>
          </div>

          {/* Device Fingerprint info */}
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-400">
              <span>Akun Terikat:</span>
              <span className="text-stone-200 font-medium">{currentUser.email}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Perangkat Utama:</span>
              <span className="text-amber-400/90 font-mono text-[11px]">{deviceName}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Fingerprint ID:</span>
              <span className="text-stone-400 font-mono text-[10px]">{deviceId}</span>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">Masukkan Kunci Lisensi:</label>
            <div className="relative">
              <input
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                placeholder="LUX-VIP-2026-XXXX"
                className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-amber-500/30 rounded-xl text-stone-100 font-mono placeholder-stone-600 focus:outline-none focus:border-amber-400 text-sm tracking-wider"
              />
              <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Sample quick-fill buttons for dev/test */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-stone-400 font-medium">Uji Coba Cepat Lisensi (Pilih Kunci):</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setLicenseInput('LUX-VIP-2026-8899');
                  handleActivate('LUX-VIP-2026-8899');
                }}
                className="px-2.5 py-1 text-[11px] font-mono bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/25 transition-colors"
              >
                LUX-VIP-2026-8899 (VIP)
              </button>
              <button
                onClick={() => {
                  setLicenseInput('LUX-DEV-BYPASS-2026');
                  handleActivate('LUX-DEV-BYPASS-2026');
                }}
                className="px-2.5 py-1 text-[11px] font-mono bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                LUX-DEV-BYPASS-2026 (Dev)
              </button>
              <button
                onClick={() => {
                  setLicenseInput('LUX-PRO-EXPIRED-9900');
                  handleActivate('LUX-PRO-EXPIRED-9900');
                }}
                className="px-2.5 py-1 text-[11px] font-mono bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/25 transition-colors"
              >
                LUX-PRO-EXPIRED-9900
              </button>
              <button
                onClick={() => {
                  setLicenseInput('LUX-VIP-SUSPENDED-1122');
                  handleActivate('LUX-VIP-SUSPENDED-1122');
                }}
                className="px-2.5 py-1 text-[11px] font-mono bg-orange-500/15 border border-orange-500/30 rounded-lg text-orange-300 hover:bg-orange-500/25 transition-colors"
              >
                LUX-VIP-SUSPENDED
              </button>
            </div>
          </div>

          {/* Validation Result Display */}
          {validationResult && (
            <div className="animate-fadeIn space-y-3">
              {validationResult.valid ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-stone-900 border border-emerald-500/50 flex flex-col items-center text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-300">Aktivasi Lisensi Server Berhasil!</h4>
                  <p className="text-xs text-stone-300">
                    Lisensi <strong>{validationResult.licenseKey}</strong> ({validationResult.plan}) telah resmi aktif & terikat ke akun Anda.
                  </p>
                  <div className="text-[11px] text-stone-400 pt-1 font-mono">
                    Device Bound: {validationResult.deviceBinding?.primaryDeviceName || deviceName}
                  </div>
                </div>
              ) : (
                (() => {
                  const err = getErrorContent(validationResult.errorCode, validationResult.errorMessage);
                  return (
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${err.color} border space-y-3`}>
                      <div className="flex items-start space-x-3">
                        <div className="shrink-0 mt-0.5">{err.icon}</div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-stone-100">{err.title}</h4>
                            <span className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
                              {err.badge}
                            </span>
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed">{err.desc}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                        <p className="font-semibold text-amber-400">Rekomendasi Pemulihan:</p>
                        <p className="text-stone-300">{err.advice}</p>
                      </div>

                      {onOpenAdminPanel && (validationResult.errorCode === 'DEVICE_CONFLICT' || validationResult.errorCode === 'ALREADY_ACTIVATED') && (
                        <button
                          onClick={onOpenAdminPanel}
                          className="w-full py-2 bg-stone-900 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-300 hover:bg-stone-800 flex items-center justify-center space-x-1.5"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>Buka Admin Panel untuk Reset Perangkat / Kelola Lisensi</span>
                        </button>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* Activate Button */}
          <button
            onClick={() => handleActivate()}
            disabled={isSubmitting || !licenseInput.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>Memverifikasi dengan Server...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-stone-950" />
                <span>Verifikasi & Aktifkan Lisensi</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
