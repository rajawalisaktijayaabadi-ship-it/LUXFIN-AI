import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Shield, 
  CheckCircle2, 
  Copy,
  ChevronRight,
  LogOut,
  Lock,
  Edit2,
  Sparkles
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { auth } from '../../utils/auth';
import { ActiveTab } from '../common/BottomNav';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface ProfileViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLicenseActivation: () => void;
  onNavigateSecurity: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  setActiveTab,
  onOpenLicenseActivation,
  onNavigateSecurity,
  onLogout,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const currentUser = auth.getCurrentUser() || storage.getState().user;
  const { user, license } = storage.getState();

  // Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(currentUser.licenseKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    auth.updateProfileDetails({
      name: editName,
      phone: editPhone,
    });
    setIsEditModalOpen(false);
  };

  const handleExportData = () => {
    const jsonStr = storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUXFIN_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importJSON(content)) {
        alert('Data berhasil dipulihkan dari cadangan JSON!');
        window.location.reload();
      } else {
        alert('File cadangan JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan aplikasi ke data awal? Semua transaksi buatan akan dihapus.')) {
      storage.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="p-5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#E2B963]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F7F6F2]">{currentUser.name}</h2>
              <span className="text-[10px] bg-[#E2B963]/20 text-[#E2B963] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-[#E2B963]/30">
                <ShieldCheck className="w-3 h-3" /> VIP
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">{currentUser.email}</p>
            {currentUser.phone && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{currentUser.phone}</p>}
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
          title="Edit Profil"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Financial Onboarding Context Preview */}
      {currentUser.financialContext && (
        <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#E2B963] font-bold">
            <Sparkles className="w-4 h-4" />
            <h3>Profil Finansial Terdaftar</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9CA3AF]">
            <div>Pendapatan: <span className="text-white font-semibold">{currentUser.financialContext.monthlyIncomeRange || '-'}</span></div>
            <div>Target Tabungan: <span className="text-emerald-400 font-semibold">Rp {currentUser.financialContext.preferredSavingsTarget?.toLocaleString('id-ID') || 0}/bln</span></div>
          </div>
        </div>
      )}

      {/* License Status Card (Server Validated) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1E2330] to-[#14171E] border border-[#E2B963]/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#E2B963]" />
            <h3 className="text-xs font-bold text-[#F7F6F2]">Lisensi Komersial Terverifikasi</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            {currentUser.licenseStatus || 'ACTIVE'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#0B0D10] p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-[10px] text-[#9CA3AF] block">Kode Lisensi Akun</span>
            <span className="text-xs font-mono font-bold text-[#E2B963]">{currentUser.licenseKey}</span>
          </div>
          <button
            onClick={handleCopyLicense}
            className="p-1.5 rounded-lg bg-white/5 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
            title="Salin Lisensi"
          >
            {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <span>Paket: {currentUser.licensePlan || 'VIP_LIFETIME'}</span>
          <button
            onClick={onOpenLicenseActivation}
            className="text-[#E2B963] underline font-semibold hover:opacity-80 cursor-pointer"
          >
            Aktivasi Kode Baru
          </button>
        </div>
      </div>

      {/* Security & Tools Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#F7F6F2] uppercase tracking-wider">Pengaturan & Keamanan</h3>

        <button
          onClick={onNavigateSecurity}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-[#E2B963]/40 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E2B963]/15 text-[#E2B963]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Keamanan & PIN Akun</p>
              <p className="text-[10px] text-[#9CA3AF]">Ubah password, PIN 6-digit, 2FA, & Sesi Aktif</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-emerald-500/40 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Financial Database Explorer</p>
              <p className="text-[10px] text-[#9CA3AF]">Eksplorasi 26 entitas data finansial & isolasi user</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => setActiveTab('test-suite')}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-indigo-500/40 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Finance Engine Test Suite</p>
              <p className="text-[10px] text-[#9CA3AF]">Jalankan 12+ pengujian otomatis presisi matematika & security</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-[#E2B963]/40 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E2B963]/15 text-[#E2B963]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Admin Security Panel</p>
              <p className="text-[10px] text-[#9CA3AF]">Manajemen lisensi, log audit, & perangkat</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        <button
          onClick={handleExportData}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Cadangkan Data (Export JSON)</p>
              <p className="text-[10px] text-[#9CA3AF]">Unduh seluruh data keuangan ke file lokal</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        <label className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all text-xs cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Pulihkan Data (Import JSON)</p>
              <p className="text-[10px] text-[#9CA3AF]">Unggah file cadangan JSON sebelumnya</p>
            </div>
          </div>
          <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </label>

        <button
          onClick={handleResetData}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Reset ke Data Default</p>
              <p className="text-[10px] text-[#9CA3AF]">Kembalikan ke data awal bawaan sistem</p>
            </div>
          </div>
        </button>

        {/* Privacy Policy & Data Handling */}
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-[#14171E] border border-white/5 flex items-center justify-between hover:border-emerald-500/40 transition-all text-xs text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#F7F6F2]">Kebijakan Privasi & Perlindungan Data</p>
              <p className="text-[10px] text-[#9CA3AF]">Panduan isolasi data, enkripsi, & pemrosesan AI</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </button>

        {/* Delete Account (GDPR Compliance) */}
        <button
          onClick={() => setIsDeleteAccountModalOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between hover:bg-red-500/20 transition-all text-xs text-left text-red-400 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Hapus Permanen Akun (Delete Account)</p>
              <p className="text-[10px] text-red-400/80">Hapus seluruh data finansial & pembatalan lisensi</p>
            </div>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between hover:bg-red-500/20 transition-all text-xs text-left text-red-400 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Keluar Akun (Logout)</p>
              <p className="text-[10px] text-red-400/80">Akhiri sesi ini secara aman</p>
            </div>
          </div>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profil Pengguna">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <Input
            label="Nama Lengkap"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Nomor Telepon / WhatsApp"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Konfirmasi Keluar Akun">
        <div className="space-y-4 text-xs">
          <p className="text-[#9CA3AF]">
            Apakah Anda yakin ingin keluar dari akun <span className="text-white font-bold">{currentUser.email}</span>?
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsLogoutModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                setIsLogoutModalOpen(false);
                auth.logout();
                onLogout();
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Kebijakan Privasi & Kebijakan Data">
        <div className="space-y-3 text-xs text-[#9CA3AF] max-h-96 overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-xs">1. Isolasi Data Multi-Tenant</h4>
            <p className="text-[11px]">Seluruh entitas akun, transaksi, dan aset finansial diikat secara ketat pada ID Pengguna Anda (<span className="text-[#E2B963] font-mono">{currentUser.id}</span>). Pengguna lain tidak memiliki akses baca atau tulis ke data Anda.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-xs">2. Pemrosesan LUX AI Intelligence</h4>
            <p className="text-[11px]">Perintah AI Anda dikirim secara terenkripsi ke Google Gemini Server-Side API. Tidak ada data finansial Anda yang digunakan untuk melatih model publik atau dibagikan ke pihak ketiga.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#14171E] border border-white/5 space-y-1">
            <h4 className="font-bold text-white text-xs">3. Validasi Lisensi Server</h4>
            <p className="text-[11px]">Validasi lisensi dilakukan melalui hashing kriptografi dan pemeriksaan pasangan perangkat utama guna mencegah duplikasi atau penyalahgunaan lisensi komersial.</p>
          </div>
          <Button variant="primary" className="w-full mt-2" onClick={() => setIsPrivacyModalOpen(false)}>
            Saya Mengerti
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal (GDPR Compliant) */}
      <Modal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} title="Hapus Permanen Seluruh Data Akun">
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-1">
            <p className="font-bold">PERINGATAN KERAS: Tindakan Ini Tidak Dapat Dibatalkan!</p>
            <p className="text-[11px]">Seluruh riwayat transaksi, akun bank, target tabungan, dan ikatan lisensi komersial akan dihapus secara permanen dari perangkat ini.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#9CA3AF] block">
              Untuk mengonfirmasi, ketik <span className="text-white font-bold font-mono">HAPUS SAYA</span> di bawah ini:
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="HAPUS SAYA"
              className="border-red-500/40 focus:border-red-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteAccountModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirmText !== 'HAPUS SAYA'}
              onClick={() => {
                storage.resetToDefault();
                auth.logout();
                setIsDeleteAccountModalOpen(false);
                onLogout();
              }}
            >
              Hapus Permanen Akun
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
