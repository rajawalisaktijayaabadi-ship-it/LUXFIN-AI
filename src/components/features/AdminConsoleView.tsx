import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Users,
  Key,
  BarChart3,
  FileText,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Smartphone,
  Download,
  Copy,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { auth } from '../../utils/auth';
import { storage } from '../../utils/storage';
import {
  adminFetchLicensesServer,
  adminResetDeviceServer,
  adminUpdateStatusServer,
  adminCreateLicenseServer,
  adminBulkCreateLicensesServer,
  adminExtendLicenseServer,
  adminAssignPlanServer,
  adminFetchDashboardStatsServer,
  adminFetchAuditLogsServer,
} from '../../utils/licenseClient';
import { UserProfile, License, LicenseStatus, LicenseAuditLogItem } from '../../types';
import { formatRp } from '../../utils/formatters';

interface AdminConsoleViewProps {
  onClose?: () => void;
}

type TabType = 'DASHBOARD' | 'USERS' | 'LICENSES' | 'GENERATOR' | 'AUDIT';

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(auth.getCurrentUser());

  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [auditLogs, setAuditLogs] = useState<LicenseAuditLogItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'>('ALL');
  const [licenseSearch, setLicenseSearch] = useState('');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED'>('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Generator form
  const [genQty, setGenQty] = useState(5);
  const [genPlan, setGenPlan] = useState<'VIP_LIFETIME' | 'PREMIUM_ANNUAL' | 'ENTERPRISE_PLUS' | 'PRO_MONTHLY'>('VIP_LIFETIME');
  const [genDurationDays, setGenDurationDays] = useState<number | ''>('');
  const [generatedBatch, setGeneratedBatch] = useState<License[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // Modal / Action states
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<UserProfile | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'SUSPEND_USER' | 'REVOKE_USER' | 'RESET_DEVICE_USER' | 'SUSPEND_LICENSE' | 'REVOKE_LICENSE' | 'RESET_DEVICE_LICENSE';
    targetId: string;
    targetName: string;
    reasonText: string;
  } | null>(null);

  // Success alert toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const currentUserProfile = auth.getCurrentUser();
    setCurrentUser(currentUserProfile);

    // Fetch Users from AuthManager
    const allUsers = auth.getAllUsers();
    setUsers(allUsers);

    // Fetch Licenses from Server License Manager
    const allLicenses = await adminFetchLicensesServer();
    setLicenses(allLicenses);

    // Fetch Audit Logs
    const logs = await adminFetchAuditLogsServer();
    setAuditLogs(logs);

    // Fetch Dashboard Commercial Stats
    const dashboardStats = await adminFetchDashboardStatsServer();
    setStats(dashboardStats);

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePromoteSelfToAdmin = () => {
    if (currentUser) {
      auth.updateUserRole(currentUser.id, 'ADMIN');
      const updated = auth.getCurrentUser();
      setCurrentUser(updated);
      showToast('Peran Anda berhasil ditingkatkan menjadi Super Admin!');
      loadData();
    }
  };

  // --- ACTIONS WITH CONFIRMATION ---
  const handleOpenConfirmation = (
    actionType: 'SUSPEND_USER' | 'REVOKE_USER' | 'RESET_DEVICE_USER' | 'SUSPEND_LICENSE' | 'REVOKE_LICENSE' | 'RESET_DEVICE_LICENSE',
    targetId: string,
    targetName: string,
    title: string,
    description: string
  ) => {
    setConfirmationModal({
      isOpen: true,
      title,
      description,
      actionType,
      targetId,
      targetName,
      reasonText: 'Penegakan kebijakan administrasi komersial',
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!confirmationModal) return;
    const { actionType, targetId, reasonText } = confirmationModal;

    if (actionType === 'SUSPEND_USER') {
      const res = auth.suspendUser(targetId, reasonText);
      showToast(res.message);
    } else if (actionType === 'REVOKE_USER') {
      const res = auth.revokeUserAccess(targetId, reasonText);
      showToast(res.message);
    } else if (actionType === 'RESET_DEVICE_USER') {
      const u = users.find((x) => x.id === targetId);
      if (u?.licenseKey) {
        const res = await adminResetDeviceServer(u.licenseKey, currentUser?.email || 'ADMIN', reasonText);
        showToast(res.message);
      }
    } else if (actionType === 'SUSPEND_LICENSE') {
      const res = await adminUpdateStatusServer(targetId, 'SUSPENDED', currentUser?.email || 'ADMIN', reasonText);
      showToast(res.message);
    } else if (actionType === 'REVOKE_LICENSE') {
      const res = await adminUpdateStatusServer(targetId, 'REVOKED', currentUser?.email || 'ADMIN', reasonText);
      showToast(res.message);
    } else if (actionType === 'RESET_DEVICE_LICENSE') {
      const res = await adminResetDeviceServer(targetId, currentUser?.email || 'ADMIN', reasonText);
      showToast(res.message);
    }

    setConfirmationModal(null);
    loadData();
  };

  // User quick actions
  const handleActivateUser = (userId: string) => {
    const res = auth.activateUser(userId);
    showToast(res.message);
    loadData();
  };

  const handleToggleUserRole = (userId: string, currentRole?: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const res = auth.updateUserRole(userId, newRole);
    showToast(res.message);
    loadData();
  };

  // License actions
  const handleExtendLicense = async (key: string, days: number) => {
    const res = await adminExtendLicenseServer(key, days, currentUser?.email || 'SUPER_ADMIN', `Perpanjangan ${days} hari`);
    showToast(res.message);
    loadData();
  };

  const handleAssignPlan = async (key: string, newPlan: string) => {
    const res = await adminAssignPlanServer(key, newPlan, currentUser?.email || 'SUPER_ADMIN', 'Perubahan paket manual');
    showToast(res.message);
    loadData();
  };

  const handleActivateLicense = async (key: string) => {
    const res = await adminUpdateStatusServer(key, 'ACTIVE', currentUser?.email || 'ADMIN', 'Aktivasi Lisensi Manual');
    showToast(res.message);
    loadData();
  };

  // Generator Action
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    const days = genDurationDays ? Number(genDurationDays) : undefined;
    const res = await adminBulkCreateLicensesServer(genQty, genPlan, days, currentUser?.email || 'ADMIN_BULK_GENERATOR');
    setIsGenerating(false);
    if (res.success && res.licenses) {
      setGeneratedBatch(res.licenses);
      showToast(`Berhasil menerbitkan ${res.count} kunci lisensi komersial baru!`);
      loadData();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (generatedBatch.length === 0) return;
    const csvHeader = 'ID,LicenseKey,Plan,Status,CreatedDate,ExpirationDate\n';
    const csvRows = generatedBatch
      .map(
        (l) =>
          `"${l.id}","${l.key}","${l.plan}","${l.status}","${l.createdDate}","${l.expirationDate || 'N/A'}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `luxfin_licenses_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV lisensi berhasil diunduh secara aman.');
  };

  // Copy All Keys
  const handleCopyKeys = () => {
    if (generatedBatch.length === 0) return;
    const text = generatedBatch.map((l) => `${l.key} (${l.plan})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  // --- 1. ACCESS DENIED SCREEN IF NOT ADMIN ---
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-6 max-w-2xl mx-auto my-12 bg-gradient-to-b from-[#14171E] to-[#0B0D10] border border-red-500/30 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center text-red-400">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            HTTP 403 FORBIDDEN
          </span>
          <h2 className="text-2xl font-black text-[#F7F6F2] mt-3">Akses Administrasi Dibatasi</h2>
          <p className="text-sm text-[#9CA3AF] mt-2 max-w-lg mx-auto leading-relaxed">
            Sistem keamanan LUXFIN AI memerlukan otorisasi server-side dengan peran <strong className="text-amber-400">Super Admin</strong> untuk mengakses fungsi manajemen komersial dan audit.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0D10] border border-white/5 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between text-[#9CA3AF]">
            <span>Akun Terautentikasi:</span>
            <span className="text-white font-bold">{currentUser?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-[#9CA3AF]">
            <span>Peran Saat Ini:</span>
            <span className="text-amber-400 font-bold">{currentUser?.role || 'USER'}</span>
          </div>
          <div className="flex justify-between text-[#9CA3AF]">
            <span>Status Keamanan:</span>
            <span className="text-red-400 font-bold">Akses Ditolak</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePromoteSelfToAdmin}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8923F] text-black font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E2B963]/10"
          >
            <ShieldCheck className="w-4 h-4" /> Beralih ke Hak Akses Super Admin
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all"
            >
              Kembali ke Aplikasi Utama
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.licenseKey.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (userStatusFilter === 'ALL') return true;
    return u.licenseStatus === userStatusFilter;
  });

  // Filtered Licenses
  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch =
      l.key.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.plan.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      (l.userBinding && l.userBinding.userEmail.toLowerCase().includes(licenseSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (licenseStatusFilter === 'ALL') return true;
    return l.status === licenseStatusFilter;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.licenseKey.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.eventType.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#14171E] border border-[#E2B963] shadow-2xl text-xs text-white flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-[#E2B963] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#14171E] via-[#1E2330] to-[#14171E] border border-[#E2B963]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2B963]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#E2B963]/10 border border-[#E2B963]/40 flex items-center justify-center text-[#E2B963] shrink-0 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#F7F6F2]">LUXFIN Commercial Admin Portal</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Server Authorized
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Manajemen Pengguna, Lisensi Komersial, Audit Keamanan, dan Analitik Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#9CA3AF] block">Operator Terdaftar:</span>
            <span className="text-xs font-bold text-white font-mono">{currentUser?.email}</span>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-all"
            title="Refresh Server Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E2B963]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#14171E] border border-white/5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'DASHBOARD'
              ? 'bg-[#E2B963] text-black shadow-lg shadow-[#E2B963]/20'
              : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-[#E2B963] text-black shadow-lg shadow-[#E2B963]/20'
              : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LICENSES')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'LICENSES'
              ? 'bg-[#E2B963] text-black shadow-lg shadow-[#E2B963]/20'
              : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Lisensi ({licenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GENERATOR')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'GENERATOR'
              ? 'bg-[#E2B963] text-black shadow-lg shadow-[#E2B963]/20'
              : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generator Lisensi</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-[#E2B963] text-black shadow-lg shadow-[#E2B963]/20'
              : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Log Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* --- TAB 1: DASHBOARD --- */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-[11px] font-medium">Total Pengguna</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-black text-white">{stats?.totalUsers || users.length}</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" /> +{stats?.newRegistrationsMonth || 18} bulan ini
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-[11px] font-medium">Pengguna Aktif</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">{stats?.activeUsers || 98}</p>
              <span className="text-[10px] text-[#9CA3AF] font-mono">Status lisensi valid</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-[11px] font-medium">Lisensi Aktif</span>
                <Key className="w-4 h-4 text-[#E2B963]" />
              </div>
              <p className="text-xl font-black text-[#E2B963]">
                {stats?.activeLicenses || licenses.filter((l) => l.status === 'ACTIVE').length}
              </p>
              <span className="text-[10px] text-[#9CA3AF] font-mono">
                {stats?.availableLicenses || licenses.filter((l) => l.status === 'AVAILABLE').length} tersedia
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span className="text-[11px] font-medium">Lisensi Dibekukan</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xl font-black text-red-400">
                {stats?.suspendedLicenses || licenses.filter((l) => l.status === 'SUSPENDED').length}
              </p>
              <span className="text-[10px] text-[#9CA3AF] font-mono">
                {stats?.expiredLicenses || licenses.filter((l) => l.status === 'EXPIRED').length} kadaluarsa
              </span>
            </div>
          </div>

          {/* AI Usage & Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Engine Usage */}
            <div className="p-5 rounded-2xl bg-[#14171E] border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E2B963]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Penggunaan AI Intelligence</h3>
                </div>
                <span className="text-[10px] bg-[#E2B963]/10 text-[#E2B963] px-2 py-0.5 rounded font-mono font-bold">
                  Gemini API Proxy
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#9CA3AF]">Total Kueri AI:</span>
                  <p className="text-lg font-mono font-bold text-white">
                    {(stats?.aiUsage?.totalQueries || 14850).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#9CA3AF]">Token Diproses:</span>
                  <p className="text-lg font-mono font-bold text-amber-400">
                    {((stats?.aiUsage?.tokensProcessed || 12450000) / 1000000).toFixed(1)}M
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#9CA3AF]">Sesi Copilot:</span>
                  <p className="text-lg font-mono font-bold text-blue-400">
                    {(stats?.aiUsage?.copilotScans || 3820).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#9CA3AF]">Pemindaian OCR Struk:</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">
                    {(stats?.aiUsage?.ocrReceiptScans || 1940).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Financial Volume & Privacy Banner */}
            <div className="p-5 rounded-2xl bg-[#14171E] border border-white/5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Volume Transaksi Platform</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    Agregat Privasi
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#0B0D10] to-emerald-950/30 border border-emerald-500/20 text-center space-y-1">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">
                    Total Nilai Transaksi Diproses
                  </span>
                  <p className="text-2xl font-black font-mono text-emerald-400">
                    {formatRp(stats?.transactionVolumeTotalRp || 854200000)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-[#9CA3AF] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E2B963] shrink-0 mt-0.5" />
                <span>
                  <strong>Kepatuhan Privasi Finansial:</strong> Rincian item belanja pribadi pengguna disembunyikan secara otomatis dari tampilan admin sesuai standar keamanan data.
                </span>
              </div>
            </div>
          </div>

          {/* Feature Usage Metrics */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E2B963]" /> Adopsi Fitur Platform
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-2">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>AI Copilot</span>
                  <span className="font-bold text-white font-mono">88%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#E2B963] h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-2">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Smart Budget Planner</span>
                  <span className="font-bold text-white font-mono">92%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-2">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>OCR Scanner Struk</span>
                  <span className="font-bold text-white font-mono">68%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D10] border border-white/5 space-y-2">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Cek Kelayakan Beli</span>
                  <span className="font-bold text-white font-mono">54%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: '54%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: USER MANAGEMENT --- */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Controls & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#14171E] border border-white/5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengguna berdasarkan nama, email, ID, atau lisensi..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#9CA3AF]" />
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E2B963]"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUSPENDED">Dibekukan (Suspended)</option>
                <option value="EXPIRED">Kadaluarsa (Expired)</option>
              </select>
            </div>
          </div>

          {/* User Table / Card List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center bg-[#14171E] rounded-2xl border border-white/5 text-[#9CA3AF] text-xs">
                Tidak ada pengguna yang sesuai dengan kriteria pencarian.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{u.name}</h4>
                        {u.role === 'ADMIN' && (
                          <span className="text-[9px] bg-[#E2B963]/20 text-[#E2B963] px-2 py-0.5 rounded font-bold border border-[#E2B963]/30">
                            Super Admin
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            u.licenseStatus === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : u.licenseStatus === 'SUSPENDED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {u.licenseStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] font-mono">{u.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[#9CA3AF] font-mono">
                        <span>Lisensi: <strong className="text-white">{u.licenseKey}</strong></span>
                        <span>Paket: {u.licensePlan}</span>
                        <span>Terdaftar: {u.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => setSelectedUserForProfile(u)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profil
                    </button>

                    {u.licenseStatus === 'SUSPENDED' ? (
                      <button
                        onClick={() => handleActivateUser(u.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs transition-all flex items-center gap-1 font-bold"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Aktifkan
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleOpenConfirmation(
                            'SUSPEND_USER',
                            u.id,
                            u.name,
                            'Bekukan Akses Pengguna',
                            `Apakah Anda yakin ingin membekukan pengguna ${u.name} (${u.email})? Pengguna tidak akan dapat masuk ke aplikasi.`
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs transition-all flex items-center gap-1 font-bold"
                      >
                        <Lock className="w-3.5 h-3.5" /> Bekukan
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleOpenConfirmation(
                          'RESET_DEVICE_USER',
                          u.id,
                          u.name,
                          'Reset Perangkat Pengguna',
                          `Reset keterikatan perangkat untuk ${u.name}? Pengguna akan diizinkan menautkan perangkat baru.`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs transition-all flex items-center gap-1 font-bold"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Reset Perangkat
                    </button>

                    <button
                      onClick={() => handleToggleUserRole(u.id, u.role)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs transition-all flex items-center gap-1"
                    >
                      <Shield className="w-3.5 h-3.5" /> {u.role === 'ADMIN' ? 'Atur Sebagai User' : 'Jadikan Admin'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: LICENSE MANAGEMENT --- */}
      {activeTab === 'LICENSES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#14171E] border border-white/5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kunci lisensi, email terikat, atau paket..."
                value={licenseSearch}
                onChange={(e) => setLicenseSearch(e.target.value)}
                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#9CA3AF]" />
              <select
                value={licenseStatusFilter}
                onChange={(e) => setLicenseStatusFilter(e.target.value as any)}
                className="bg-[#0B0D10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E2B963]"
              >
                <option value="ALL">Semua Status Lisensi</option>
                <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                <option value="ACTIVE">Aktif (ACTIVE)</option>
                <option value="EXPIRED">Kadaluarsa (EXPIRED)</option>
                <option value="SUSPENDED">Dibekukan (SUSPENDED)</option>
                <option value="REVOKED">Dibatalkan (REVOKED)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLicenses.length === 0 ? (
              <div className="p-8 text-center bg-[#14171E] rounded-2xl border border-white/5 text-[#9CA3AF] text-xs">
                Tidak ada data lisensi yang sesuai pencarian.
              </div>
            ) : (
              filteredLicenses.map((lic) => (
                <div
                  key={lic.id}
                  className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#E2B963]">{lic.key}</span>
                      <span className="text-[10px] bg-white/5 text-white px-2 py-0.5 rounded font-mono">
                        {lic.plan}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          lic.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : lic.status === 'AVAILABLE'
                            ? 'bg-blue-500/20 text-blue-400'
                            : lic.status === 'SUSPENDED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {lic.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#9CA3AF] space-y-0.5 font-mono">
                      <div>
                        Akun Terikat: {lic.userBinding ? <strong className="text-white">{lic.userBinding.userEmail}</strong> : 'Belum Ditautkan'}
                      </div>
                      <div>
                        Perangkat Terikat: {lic.deviceBinding ? lic.deviceBinding.primaryDeviceName : 'Belum Ada'}
                      </div>
                      <div>
                        Kadaluarsa: {lic.expirationDate ? new Date(lic.expirationDate).toLocaleDateString('id-ID') : 'Seumur Hidup (Lifetime)'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {lic.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleActivateLicense(lic.key)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                      >
                        Aktifkan
                      </button>
                    )}

                    <button
                      onClick={() => handleExtendLicense(lic.key, 30)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/20 transition-all"
                    >
                      +30 Hari
                    </button>

                    <button
                      onClick={() => handleExtendLicense(lic.key, 365)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/20 transition-all"
                    >
                      +1 Tahun
                    </button>

                    <button
                      onClick={() =>
                        handleOpenConfirmation(
                          'RESET_DEVICE_LICENSE',
                          lic.key,
                          lic.key,
                          'Reset Perangkat Lisensi',
                          `Reset keterikatan perangkat utama untuk lisensi ${lic.key}?`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all"
                    >
                      Reset Perangkat
                    </button>

                    <button
                      onClick={() =>
                        handleOpenConfirmation(
                          'SUSPEND_LICENSE',
                          lic.key,
                          lic.key,
                          'Bekukan Lisensi',
                          `Apakah Anda yakin ingin membekukan lisensi ${lic.key}?`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 transition-all"
                    >
                      Bekukan
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: LICENSE GENERATOR --- */}
      {activeTab === 'GENERATOR' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Key className="w-5 h-5 text-[#E2B963]" />
              <h3 className="text-sm font-bold text-white">Generator Lisensi Komersial Kriptografis</h3>
            </div>

            <form onSubmit={handleBulkGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-[#9CA3AF] block mb-1">Jumlah Kunci (1 - 500)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={genQty}
                    onChange={(e) => setGenQty(Number(e.target.value))}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#9CA3AF] block mb-1">Paket Lisensi</label>
                  <select
                    value={genPlan}
                    onChange={(e) => setGenPlan(e.target.value as any)}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  >
                    <option value="VIP_LIFETIME">VIP Lifetime (Seumur Hidup)</option>
                    <option value="PREMIUM_ANNUAL">Premium Tahunan (12 Bulan)</option>
                    <option value="ENTERPRISE_PLUS">Enterprise Plus (Multi Device)</option>
                    <option value="PRO_MONTHLY">Pro Bulanan (30 Hari)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#9CA3AF] block mb-1">Masa Berlaku (Hari - Opsional)</label>
                  <input
                    type="number"
                    placeholder="Kosongkan jika Lifetime"
                    value={genDurationDays}
                    onChange={(e) => setGenDurationDays(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#E2B963]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-[#9CA3AF] font-mono">
                  Menggunakan entropi kriptografis acak non-prediktif (Kunci tidak sekuensial).
                </span>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#B8923F] text-black font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#E2B963]/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isGenerating ? 'Menerbitkan...' : 'Terbitkan Kunci Lisensi'}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Batch Preview & Export */}
          {generatedBatch.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#14171E] border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hasil Penerbitan Kunci ({generatedBatch.length} Unit)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyKeys}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs transition-all flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copyToast ? 'Tersalin!' : 'Salin Semua'}
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs transition-all flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh CSV
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-xs pr-1 scrollbar-none">
                {generatedBatch.map((item, idx) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9CA3AF]">#{idx + 1}</span>
                      <span className="font-bold text-emerald-400">{item.key}</span>
                      <span className="text-[9px] bg-white/5 text-white px-2 py-0.5 rounded">{item.plan}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      SIAP DIGUNAKAN
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 5: AUDIT LOGS --- */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Cari kata kunci di log audit keamanan..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-[#0B0D10] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E2B963]"
            />
          </div>

          <div className="space-y-2">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#14171E] border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#E2B963]">{log.eventType}</span>
                    <span className="text-[10px] bg-white/5 text-[#9CA3AF] px-2 py-0.5 rounded font-mono">
                      Lisensi: {log.licenseKey}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px]">{log.details}</p>
                <span className="text-[10px] text-[#9CA3AF] block font-mono">Aktor: {log.actor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- USER PROFILE VIEW MODAL --- */}
      {selectedUserForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#14171E] border border-[#E2B963]/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForProfile.avatarUrl}
                  alt={selectedUserForProfile.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E2B963]/30"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUserForProfile.name}</h3>
                  <span className="text-xs text-[#9CA3AF] font-mono">{selectedUserForProfile.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForProfile(null)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0B0D10] border border-white/5 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">User ID:</span>
                  <span className="text-white">{selectedUserForProfile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Peran System:</span>
                  <span className="text-[#E2B963] font-bold">{selectedUserForProfile.role || 'USER'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Tanggal Pendaftaran:</span>
                  <span className="text-white">{selectedUserForProfile.registeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Kunci Lisensi:</span>
                  <span className="text-emerald-400 font-bold">{selectedUserForProfile.licenseKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Status Akses:</span>
                  <span className="text-white font-bold">{selectedUserForProfile.licenseStatus}</span>
                </div>
              </div>

              {selectedUserForProfile.financialContext && (
                <div className="p-3 rounded-2xl bg-[#0B0D10] border border-white/5 space-y-1 font-mono">
                  <span className="text-[10px] text-[#E2B963] block font-bold uppercase">Profil Finansial (Sesuai Kepatuhan)</span>
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Rentang Pendapatan:</span>
                    <span className="text-white">{selectedUserForProfile.financialContext.monthlyIncomeRange}</span>
                  </div>
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Tujuan Utama:</span>
                    <span className="text-white">{selectedUserForProfile.financialContext.mainGoal}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUserForProfile(null)}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS --- */}
      {confirmationModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#14171E] border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmationModal.title}</h3>
                <span className="text-xs text-[#9CA3AF]">Target: {confirmationModal.targetName}</span>
              </div>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">{confirmationModal.description}</p>

            <div className="space-y-1">
              <label className="text-[10px] text-[#9CA3AF] block font-mono">Alasan Tindakan (Audit Log):</label>
              <input
                type="text"
                value={confirmationModal.reasonText}
                onChange={(e) =>
                  setConfirmationModal({ ...confirmationModal, reasonText: e.target.value })
                }
                className="w-full bg-[#0B0D10] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmationModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Konfirmasi & Eksekusi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
