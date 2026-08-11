import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldAlert,
  RotateCcw,
  PlusCircle,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  User,
  Smartphone,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Zap,
} from 'lucide-react';
import {
  adminFetchLicensesServer,
  adminResetDeviceServer,
  adminUpdateStatusServer,
  adminCreateLicenseServer,
  adminFetchAuditLogsServer,
  runAutomatedLicenseTestSuite,
  TestResultItem,
} from '../../utils/licenseClient';
import { License, LicenseStatus, LicenseAuditLogItem } from '../../types';

interface LicenseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseAdminModal: React.FC<LicenseAdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'CREATE' | 'TEST_SUITE' | 'AUDIT_LOGS'>('MANAGEMENT');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [auditLogs, setAuditLogs] = useState<LicenseAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create form state
  const [newPlan, setNewPlan] = useState('VIP_LIFETIME');
  const [customKey, setCustomKey] = useState('');
  const [expirationDays, setExpirationDays] = useState<number | ''>('');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Test suite state
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState<{
    passedCount: number;
    failedCount: number;
    totalCount: number;
    results: TestResultItem[];
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const list = await adminFetchLicensesServer();
    setLicenses(list);
    const logs = await adminFetchAuditLogsServer();
    setAuditLogs(logs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetDevice = async (key: string) => {
    if (!confirm(`Reset keterikatan perangkat untuk lisensi ${key}? Pengguna akan dapat menautkan perangkat baru.`)) return;
    const res = await adminResetDeviceServer(key, 'ADMIN_PANEL_USER', 'Permintaan Reset Perangkat Manual');
    alert(res.message);
    loadData();
  };

  const handleUpdateStatus = async (key: string, newStatus: LicenseStatus) => {
    if (!confirm(`Ubah status lisensi ${key} menjadi ${newStatus}?`)) return;
    const res = await adminUpdateStatusServer(key, newStatus, 'ADMIN_PANEL_USER', 'Perubahan Status Manual');
    alert(res.message);
    loadData();
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccessMsg('');
    const days = expirationDays ? Number(expirationDays) : undefined;
    const res = await adminCreateLicenseServer(newPlan, customKey || undefined, days);
    if (res.success && res.license) {
      setCreateSuccessMsg(`Lisensi Baru Berhasil Dibuat: ${res.license.key}`);
      setCustomKey('');
      loadData();
    }
  };

  const handleRunTestSuite = async () => {
    setIsTestRunning(true);
    setTestSuiteResults(null);
    const results = await runAutomatedLicenseTestSuite();
    setIsTestRunning(false);
    setTestSuiteResults(results);
  };

  const filteredLicenses = licenses.filter(
    (l) =>
      l.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userBinding?.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-4xl bg-stone-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">Panel Kontrol Lisensi Komersial (Admin)</h3>
              <p className="text-xs text-amber-400/90 font-mono">Server Architecture & Business Rules Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 text-stone-400 flex items-center justify-center hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-stone-800/80 bg-stone-950 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MANAGEMENT')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'MANAGEMENT'
                ? 'bg-stone-900 border-amber-500/40 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Daftar Lisensi Server ({licenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'CREATE'
                ? 'bg-stone-900 border-amber-500/40 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Terbitkan Lisensi Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('TEST_SUITE')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'TEST_SUITE'
                ? 'bg-stone-900 border-amber-500/40 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Uji Otomatis Aturan Lisensi</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-stone-900 border-amber-500/40 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Trail Global ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MANAGEMENT */}
          {activeTab === 'MANAGEMENT' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kunci, email pengguna, atau paket..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                </div>
                <button
                  onClick={loadData}
                  className="px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs font-semibold text-stone-300 hover:text-white flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan Data</span>
                </button>
              </div>

              {/* License List Table */}
              <div className="space-y-3">
                {filteredLicenses.map((lic) => (
                  <div
                    key={lic.id}
                    className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span className="font-mono font-bold text-sm text-stone-100 tracking-wider">{lic.key}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                          {lic.plan}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            lic.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : lic.status === 'EXPIRED'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : lic.status === 'SUSPENDED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : lic.status === 'REVOKED'
                              ? 'bg-stone-800 text-stone-400 border border-stone-700'
                              : 'bg-stone-800 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {lic.status}
                        </span>
                      </div>
                    </div>

                    {/* Bindings info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-400 bg-stone-950 p-2.5 rounded-lg border border-stone-800/60">
                      <div>
                        <span className="text-stone-500">Akun Terikat:</span>{' '}
                        <strong className="text-stone-200">
                          {lic.userBinding ? `${lic.userBinding.userName} (${lic.userBinding.userEmail})` : 'Belum Diikat (Tersedia)'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-500">Perangkat Utama:</span>{' '}
                        <strong className="text-stone-200">
                          {lic.deviceBinding ? lic.deviceBinding.primaryDeviceName : 'Belum Diikat'}
                        </strong>
                      </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleResetDevice(lic.key)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/20 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Perangkat</span>
                      </button>

                      {lic.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(lic.key, 'ACTIVE')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/20"
                        >
                          Aktifkan
                        </button>
                      )}

                      {lic.status !== 'SUSPENDED' && (
                        <button
                          onClick={() => handleUpdateStatus(lic.key, 'SUSPENDED')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/20"
                        >
                          Bekukan (Suspend)
                        </button>
                      )}

                      {lic.status !== 'REVOKED' && (
                        <button
                          onClick={() => handleUpdateStatus(lic.key, 'REVOKED')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/20"
                        >
                          Batalkan (Revoke)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE LICENSE */}
          {activeTab === 'CREATE' && (
            <div className="max-w-lg mx-auto p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-100">Terbitkan Kunci Lisensi Komersial Baru</h4>
                <p className="text-xs text-stone-400">
                  Buat lisensi komersial resmi untuk pelanggan atau lingkungan testing enterprise.
                </p>
              </div>

              {createSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-mono font-bold">
                  {createSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateLicense} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">Pilih Paket Lisensi:</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="VIP_LIFETIME">VIP Lifetime Edition (Akses Selamanya)</option>
                    <option value="PREMIUM_ANNUAL">Enterprise Premium Annual (1 Tahun)</option>
                    <option value="PREMIUM_MONTHLY">Pro Monthly (30 Hari)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">Custom Kunci Lisensi (Opsional):</label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                    placeholder="Kosongkan untuk auto-generate (contoh: LUX-VIP-2026-9900)"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">Masa Kadaluarsa (Hari, Opsional):</label>
                  <input
                    type="number"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 365 (Kosongkan untuk Lifetime)"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                >
                  Generate Lisensi Sekarang
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AUTOMATED TEST SUITE */}
          {activeTab === 'TEST_SUITE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-100">Suite Pengujian Otomatis Aturan Lisensi</h4>
                  <p className="text-xs text-stone-400">
                    Eksekusi 10 skenario pengujian unit terintegrasi untuk memverifikasi seluruh aturan bisnis lisensi komersial.
                  </p>
                </div>

                <button
                  onClick={handleRunTestSuite}
                  disabled={isTestRunning}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0"
                >
                  {isTestRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menjalankan Uji Otomatis...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Jalankan Test Suite Lisensi</span>
                    </>
                  )}
                </button>
              </div>

              {testSuiteResults && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Summary Scorecard */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                      <p className="text-xs text-stone-400">Total Pengujian</p>
                      <p className="text-xl font-bold text-stone-100">{testSuiteResults.totalCount}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
                      <p className="text-xs text-emerald-300">Lulus (PASSED)</p>
                      <p className="text-xl font-bold text-emerald-400">{testSuiteResults.passedCount}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40">
                      <p className="text-xs text-red-300">Gagal (FAILED)</p>
                      <p className="text-xl font-bold text-red-400">{testSuiteResults.failedCount}</p>
                    </div>
                  </div>

                  {/* Test Cases List */}
                  <div className="space-y-2">
                    {testSuiteResults.results.map((res) => (
                      <div
                        key={res.testNumber}
                        className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                          res.passed
                            ? 'bg-stone-900/90 border-emerald-500/30 text-stone-200'
                            : 'bg-red-950/60 border-red-500/50 text-stone-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-amber-400">Test #{res.testNumber}:</span>
                            <span className="font-bold text-stone-100">{res.testName}</span>
                          </div>
                          <p className="text-stone-400">Ekspektasi: <span className="text-stone-300">{res.expectedOutcome}</span></p>
                          <p className="text-stone-400">Hasil Nyata: <span className="text-amber-300 font-mono">{res.actualOutcome}</span></p>
                        </div>

                        <div>
                          {res.passed ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>PASSED</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center space-x-1">
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>FAILED</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-300">Catatan Audit Keamanan Lisensi Global Server:</h4>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-400">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-400">{log.licenseKey}</span>
                        <span className="px-1.5 py-0.5 rounded bg-stone-800 text-[10px] text-stone-300">{log.eventType}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-stone-300">{log.details}</p>
                    <div className="text-[10px] text-stone-500">Aktor: {log.actor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
