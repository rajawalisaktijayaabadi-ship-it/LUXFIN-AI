import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  CreditCard,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input, SearchInput, PasswordInput } from '../common/Input';
import { CurrencyInput } from '../common/CurrencyInput';
import { Select } from '../common/Select';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Tabs } from '../common/Tabs';
import { SegmentedControl } from '../common/SegmentedControl';
import { ProgressBar, CircularProgress, StepIndicator } from '../common/ProgressBar';
import { MiniSparkline, SimpleBarChart, SimpleDonutChart } from '../common/SimpleCharts';
import { Modal } from '../common/Modal';
import { Drawer } from '../common/Drawer';
import { Toast, ToastMessage } from '../common/Toast';
import { CardSkeleton, ListSkeleton, ChartSkeleton } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { SuccessState } from '../common/SuccessState';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

export const DesignSystemShowcase: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('components');
  const [segmentedValue, setSegmentedValue] = useState('monthly');
  const [currencyVal, setCurrencyVal] = useState(1500000);
  const [textVal, setTextVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const sampleChartData = [
    { label: 'Jan', value: 3500000, color: '#E2B963' },
    { label: 'Feb', value: 4200000, color: '#E2B963' },
    { label: 'Mar', value: 3100000, color: '#10B981' },
    { label: 'Apr', value: 5400000, color: '#E2B963' },
  ];

  const sampleDonutItems = [
    { label: 'Makanan', value: 2400000, color: '#E2B963' },
    { label: 'Transport', value: 800000, color: '#3B82F6' },
    { label: 'Hiburan', value: 650000, color: '#EC4899' },
    { label: 'Lainnya', value: 450000, color: '#10B981' },
  ];

  const triggerToast = (type: 'SUCCESS' | 'ERROR' | 'INFO', message: string) => {
    setToast({ id: `t_${Date.now()}`, type, message });
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1D222C] to-[#14171E] border border-[#E2B963]/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E2B963]" />
            <h1 className="text-sm font-bold text-white tracking-wide">LUXFIN AI — Design System Showcase</h1>
          </div>
          <Badge variant="gold">Obsidian Gold v1.0</Badge>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          Sistem Desain Premium Mobile-First (Obsidian + Champagne Gold) untuk Operating System Keuangan Komersial.
        </p>

        {/* Theme Switcher Controls */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#9CA3AF]">Tema Aplikasi:</span>
          <div className="flex items-center gap-1 bg-[#0B0D10] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                theme === 'dark' ? 'bg-[#E2B963] text-black font-bold shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                theme === 'light' ? 'bg-[#E2B963] text-black font-bold shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                theme === 'system' ? 'bg-[#E2B963] text-black font-bold shadow' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> System
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <Tabs
        tabs={[
          { id: 'components', label: 'Komponen UI', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'charts', label: 'Grafik & Indikator' },
          { id: 'states', label: 'State & Feedback' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: UI COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* Section: Typography & Badges */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">1. Typography & Badges</h3>
            <Card variant="obsidian" className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Headline Utama (16px Display)</h2>
                <p className="text-xs text-[#9CA3AF]">Body text standar untuk informasi keuangan dan deskripsi transaksi.</p>
                <p className="text-[10px] text-[#6B7280]">Caption / Subtext tambahan (10px Muted).</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                <Badge variant="gold">Gold Premium</Badge>
                <Badge variant="emerald">Lunas / Plus</Badge>
                <Badge variant="crimson">Jatuh Tempo</Badge>
                <Badge variant="amber">Peringatan</Badge>
                <Badge variant="slate">Draft</Badge>
              </div>
            </Card>
          </div>

          {/* Section: Avatars */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">2. Avatars</h3>
            <Card variant="obsidian" className="flex items-center gap-4">
              <Avatar name="Fitri Handayani" size="sm" status="online" />
              <Avatar name="Fitri Handayani" size="md" status="gold" />
              <Avatar name="Fitri Handayani" size="lg" status="online" />
              <Avatar name="Fitri Handayani" size="xl" status="busy" />
            </Card>
          </div>

          {/* Section: Buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">3. Buttons</h3>
            <Card variant="obsidian" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>Primary Gold</Button>
                <Button variant="secondary">Secondary Dark</Button>
                <Button variant="soft-gold">Soft Gold</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger" leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg" className="flex-1">Large</Button>
              </div>
            </Card>
          </div>

          {/* Section: Inputs & Selects */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">4. Form Inputs & Selects</h3>
            <Card variant="obsidian" className="space-y-3">
              <Input
                label="Nama Kategori"
                placeholder="mis. Tabungan Umroh"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
              />
              <CurrencyInput
                label="Nominal Transaksi (Rp)"
                value={currencyVal}
                onChange={setCurrencyVal}
              />
              <SearchInput value={searchVal} onChange={setSearchVal} placeholder="Cari transaksi..." />
              <PasswordInput label="Kata Sandi / PIN" placeholder="••••••••" />
              <Select
                label="Jenis Akun"
                options={[
                  { value: 'bank', label: 'Bank Rekening Utama' },
                  { value: 'ewallet', label: 'E-Wallet (Gopay/OVO)' },
                  { value: 'cash', label: 'Uang Tunai (Cash)' },
                ]}
              />
            </Card>
          </div>

          {/* Section: Cards & Layout Variants */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">5. Cards & Surfaces</h3>
            <div className="space-y-2">
              <Card variant="gold-border">
                <p className="text-xs font-bold text-[#E2B963]">Gold Gradient Border Card</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Kartu khusus untuk Ringkasan VIP, Rekomendasi AI, dan Skor Kesehatan.</p>
              </Card>
              <Card variant="obsidian">
                <p className="text-xs font-bold text-white">Obsidian Surface Card</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Kartu standar untuk list transaksi, akun, dan rincian anggaran.</p>
              </Card>
              <Card variant="glass">
                <p className="text-xs font-bold text-white">Glassmorphism Card</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Tampilan transparan modern dengan efek blur.</p>
              </Card>
            </div>
          </div>

          {/* Section: Controls & Interactive Overlays */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">6. Interactive Modals & Drawers</h3>
            <Card variant="obsidian" className="space-y-3">
              <SegmentedControl
                options={[
                  { value: 'monthly', label: 'Bulanan' },
                  { value: 'annual', label: 'Tahunan' },
                ]}
                value={segmentedValue}
                onChange={setSegmentedValue}
              />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Buka Modal</Button>
                <Button variant="soft-gold" onClick={() => setIsDrawerOpen(true)}>Buka Bottom Sheet</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CHARTS & INDICATORS */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">Progress & Step Indicators</h3>
            <Card variant="obsidian" className="space-y-4">
              <ProgressBar value={75} label="Target Dana Darurat (75%)" color="gold" />
              <ProgressBar value={40} label="Pengeluaran Anggaran (40%)" color="emerald" />
              <div className="pt-2 flex items-center justify-around border-t border-white/5">
                <CircularProgress value={85} size={70}>
                  <span className="text-xs font-bold text-[#E2B963]">85%</span>
                </CircularProgress>
                <CircularProgress value={60} size={70} color="#10B981">
                  <span className="text-xs font-bold text-emerald-400">60%</span>
                </CircularProgress>
              </div>
              <div className="pt-2 border-t border-white/5">
                <StepIndicator steps={['Identifikasi', 'Analisis AI', 'Selesai']} currentStep={1} />
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">Financial Mini Charts</h3>
            <Card variant="obsidian" className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] text-[#9CA3AF] font-semibold">Sparkline Tren Kas</span>
                <MiniSparkline data={[10, 25, 18, 40, 32, 55, 68]} height={40} />
              </div>
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[11px] text-[#9CA3AF] font-semibold">Bar Chart Arus Kas Bulanan</span>
                <SimpleBarChart data={sampleChartData} height={100} />
              </div>
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[11px] text-[#9CA3AF] font-semibold">Donut Chart Distribusi Pengeluaran</span>
                <SimpleDonutChart items={sampleDonutItems} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: STATES & FEEDBACK */}
      {activeTab === 'states' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">Toasts & Feedback</h3>
            <Card variant="obsidian" className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="primary" onClick={() => triggerToast('SUCCESS', 'Data berhasil disimpan!')}>Success</Button>
                <Button size="sm" variant="danger" onClick={() => triggerToast('ERROR', 'Gagal memproses transaksi.')}>Error</Button>
                <Button size="sm" variant="soft-gold" onClick={() => triggerToast('INFO', 'AI menganalisis struk Anda.')}>Info</Button>
              </div>
              {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">Skeleton Loaders</h3>
            <CardSkeleton />
            <ListSkeleton rows={2} />
            <ChartSkeleton />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#E2B963] uppercase tracking-wider">Empty, Error & Success States</h3>
            <EmptyState
              title="Belum Ada Transaksi"
              description="Catat transaksi harian Anda atau tanyakan AI Copilot."
              actionLabel="Tambah Transaksi"
              onAction={() => triggerToast('INFO', 'Tombol Tambah Diklik')}
            />
            <ErrorState message="Koneksi terputus saat mengambil data saldo terkemuka." onRetry={() => {}} />
            <SuccessState title="Lisensi VIP Berhasil Diaktifkan!" description="Anda mendapatkan akses penuh AI Copilot & Laporan Eksekutif." />
          </div>
        </div>
      )}

      {/* Sample Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Konfirmasi Tindakan">
        <div className="space-y-3 text-xs">
          <p className="text-[#9CA3AF]">
            Apakah Anda yakin ingin memproses rekonsiliasi data saldo secara otomatis dengan AI?
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => { setIsModalOpen(false); triggerToast('SUCCESS', 'Proses selesai'); }}>
              Ya, Lanjutkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sample Drawer / Bottom Sheet */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Opsi Transaksi Cepat">
        <div className="space-y-3 text-xs">
          <button
            onClick={() => { setIsDrawerOpen(false); triggerToast('SUCCESS', 'Model Struk Dipilih'); }}
            className="w-full p-3 rounded-xl bg-[#14171E] border border-white/10 text-left hover:border-[#E2B963] transition-all flex items-center gap-3"
          >
            <Shield className="w-5 h-5 text-[#E2B963]" />
            <div>
              <p className="font-bold text-white">Scan Struk Belanja (OCR)</p>
              <p className="text-[10px] text-[#9CA3AF]">Ekstrak total & vendor otomatis dari foto</p>
            </div>
          </button>
          <button
            onClick={() => { setIsDrawerOpen(false); triggerToast('INFO', 'Model AI Text Dipilih'); }}
            className="w-full p-3 rounded-xl bg-[#14171E] border border-white/10 text-left hover:border-[#E2B963] transition-all flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-[#E2B963]" />
            <div>
              <p className="font-bold text-white">Input Perintah Suara / Teks AI</p>
              <p className="text-[10px] text-[#9CA3AF]">Contoh: "Beli kopi 35rb pake Gopay"</p>
            </div>
          </button>
        </div>
      </Drawer>
    </div>
  );
};
