import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  Smartphone,
  UserCheck,
  Clock,
  RefreshCw,
  Server,
  AlertTriangle,
  Key,
  Lock,
  Sliders,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  verifyLicenseServer,
  getOrCreateDeviceId,
  adminFetchAuditLogsServer,
} from '../../utils/licenseClient';
import { UserProfile, LicenseValidationResult, LicenseAuditLogItem } from '../../types';

interface LicenseStatusScreenProps {
  currentUser: UserProfile;
  onOpenActivationModal: () => void;
  onOpenAdminModal: () => void;
}

export const LicenseStatusScreen: React.FC<LicenseStatusScreenProps> = ({
  currentUser,
  onOpenActivationModal,
  onOpenAdminModal,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationResult, setValidationResult] = useState<LicenseValidationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<LicenseAuditLogItem[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);

  const { deviceId, deviceName } = getOrCreateDeviceId();

  const handleVerify = async () => {
    if (!currentUser.licenseKey) return;
    setIsVerifying(true);

    const res = await verifyLicenseServer(currentUser.licenseKey, currentUser.id);
    setIsVerifying(false);
    setValidationResult(res);

    const logs = await adminFetchAuditLogsServer(currentUser.licenseKey);
    setAuditLogs(logs);
  };

  useEffect(() => {
    if (currentUser.licenseKey) {
      handleVerify();
    }
  }, [currentUser.licenseKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>LISENSI AKTIF</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>KADALUARSA</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DIBEKUKAN</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-400 border border-stone-700 flex items-center space-x-1.5">
            <XCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>DIBATALKAN</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
            BELUM AKTIF
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 border border-amber-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-stone-100">Sistem Lisensi Komersial</h2>
            </div>
            <p className="text-xs text-stone-400 max-w-md">
              Manajemen hak guna aplikasi resmi, perlindungan enkripsi server, dan keterikatan perangkat utama.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenActivationModal}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5 text-stone-950" />
              <span>Aktivasi Kode Baru</span>
            </button>
            <button
              onClick={onOpenAdminModal}
              className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-stone-900 border border-amber-500/30 text-amber-300 hover:bg-stone-800 transition-all flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary License Card */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-stone-200">
                Paket: {currentUser.licensePlan || 'VIP Lifetime Edition'}
              </span>
            </div>
            <p className="text-xs text-stone-400">Aturan Keamanan: 1 Akun = 1 Lisensi</p>
          </div>
          {getStatusBadge(currentUser.licenseStatus)}
        </div>

        {/* License Key Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400">Kunci Lisensi Terdaftar:</label>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center justify-between font-mono text-sm tracking-wider text-amber-300">
            <span>{currentUser.licenseKey || 'BELUM DIBAIKKAN / MODE DEMO'}</span>
            {currentUser.licenseKey && (
              <button
                onClick={() => copyToClipboard(currentUser.licenseKey)}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg bg-stone-900 border border-stone-800"
                title="Salin Kunci"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* User & Device Bindings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Binding */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <div className="flex items-center space-x-2 text-stone-300 text-xs font-semibold">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Keterikatan Pengguna (User Binding)</span>
            </div>
            <div className="space-y-1 text-xs text-stone-400 pl-6">
              <p>Pengguna: <strong className="text-stone-200">{currentUser.name}</strong></p>
              <p>Email: <strong className="text-stone-200">{currentUser.email}</strong></p>
              <p>ID Akun: <span className="font-mono text-[11px] text-stone-400">{currentUser.id}</span></p>
            </div>
          </div>

          {/* Device Binding */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <div className="flex items-center space-x-2 text-stone-300 text-xs font-semibold">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Keterikatan Perangkat Utama (Device Binding)</span>
            </div>
            <div className="space-y-1 text-xs text-stone-400 pl-6">
              <p>Perangkat: <strong className="text-amber-300/90">{deviceName}</strong></p>
              <p>Device ID: <span className="font-mono text-[10px] text-stone-400">{deviceId}</span></p>
              <p>Status: <strong className="text-emerald-400">Terikat Sempurna (Server Verified)</strong></p>
            </div>
          </div>
        </div>

        {/* Routine Verification State */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Validasi Server Terakhir: <strong className="text-stone-200">{new Date().toLocaleDateString('id-ID')}</strong></span>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/30 text-xs text-amber-300 hover:bg-stone-800 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Verifikasi Server Ulang</span>
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-stone-200">Riwayat Audit Lisensi (Server Audit Trail)</h3>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">{auditLogs.length} Catatan</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-stone-500">Belum ada riwayat audit untuk kunci ini.</div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="font-semibold text-amber-400/90">{log.eventType}</span>
                  <span className="text-[10px] text-stone-500 font-mono">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                </div>
                <p className="text-stone-300">{log.details}</p>
                <div className="text-[10px] text-stone-500">Aktor: {log.actor}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
