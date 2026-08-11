import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Award,
  Users,
  ChevronRight,
  Calculator,
  PieChart,
  Star,
  Shield,
  Bot,
  Smartphone,
  Check,
  BarChart3,
  Flame,
  UserCheck
} from 'lucide-react';
import { Button } from '../common/Button';

interface WelcomeScreenProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onGoogleAuth: () => void;
  onDemoAccess: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onGoogleAuth,
  onDemoAccess,
}) => {
  // Interactive Wealth Calculator State (High CTR Click-Bait Simulator)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(25000000);
  const [savingsPercent, setSavingsPercent] = useState<number>(30);
  const [isAnnualBilling, setIsAnnualBilling] = useState<boolean>(true);

  const monthlySavings = (monthlyIncome * savingsPercent) / 100;
  // 3-year estimation with AI compounding optimization (+8% avg yield)
  const threeYearAssetProjections = Math.round(monthlySavings * 36 * 1.15);
  const fiveYearAssetProjections = Math.round(monthlySavings * 60 * 1.32);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] relative overflow-x-hidden selection:bg-[#E2B963]/30 selection:text-white pb-12">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#E2B963]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] -left-20 w-[400px] h-[400px] bg-[#C59A3F]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10 space-y-8 pt-4">

        {/* 1. TOP NAVIGATION HEADER */}
        <header className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E2B963] to-[#997428] flex items-center justify-center shadow-lg shadow-[#E2B963]/20">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1">
                LUXFIN <span className="text-[#E2B963]">AI</span>
              </span>
              <span className="text-[9px] text-[#9CA3AF] block font-mono">FINANCIAL OS VIP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateLogin}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#E2B963]/40 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Masuk
            </button>
            <button
              onClick={onNavigateRegister}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E2B963] to-[#C59A3F] text-black text-xs font-extrabold hover:brightness-110 shadow-md shadow-[#E2B963]/20 transition-all cursor-pointer"
            >
              Daftar
            </button>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        <section className="space-y-5 text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2B963]/10 border border-[#E2B963]/30 text-[#E2B963] text-[10px] font-bold tracking-widest uppercase animate-pulse">
            <Flame className="w-3.5 h-3.5 text-[#E2B963]" />
            <span>Sistem Operasi Keuangan AI No.1 untuk VIP & Entrepreneur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
            Kuasai <span className="text-gold-gradient">100% Arus Kas</span> & Lipatgandakan Kekayaan Anda Dengan AI Intelligence
          </h1>

          <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed max-w-sm mx-auto">
            Otomatisasi pencatatan transaksi, analisis rasio mampu beli instan, dan kelola portofolio aset Anda dalam satu aplikasi mewah berstandar komersial.
          </p>

          {/* Social Proof Metric Badge */}
          <div className="flex items-center justify-center gap-4 py-2 border-y border-white/5 bg-[#14171E]/60 rounded-2xl backdrop-blur-md px-3">
            <div className="text-center">
              <p className="text-sm font-black text-white font-mono">Rp 12.8M+</p>
              <p className="text-[9px] text-[#9CA3AF]">Aset Dikelola</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-sm font-black text-[#E2B963] font-mono">99.4%</p>
              <p className="text-[9px] text-[#9CA3AF]">Presisi AI OCR</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-sm font-black text-emerald-400 font-mono">12.4K+</p>
              <p className="text-[9px] text-[#9CA3AF]">Eksekutif Aktif</p>
            </div>
          </div>

          {/* CTA Primary Action Group */}
          <div className="space-y-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-extrabold shadow-xl shadow-[#E2B963]/25"
              onClick={onNavigateRegister}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Mulai Kebebasan Finansial — Gratis
            </Button>

            <button
              onClick={onGoogleAuth}
              className="w-full min-h-[46px] p-3 rounded-xl bg-[#14171E] border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Lanjutkan Cepat dengan Google</span>
            </button>

            <button
              onClick={onDemoAccess}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#E2B963] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#E2B963]" />
              <span>Coba Mode Demo Instan (Tanpa Daftar)</span>
            </button>
          </div>
        </section>

        {/* 3. HIGH CTR INTERACTIVE SIMULATOR (CLICK-BAIT WEALTH SIMULATOR) */}
        <section className="bg-gradient-to-b from-[#14171E] to-[#0D0F14] p-5 rounded-3xl border border-[#E2B963]/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E2B963]/15 text-[#E2B963]">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">Simulator Proyeksi AI Wealth</h3>
            </div>
            <span className="text-[9px] text-[#E2B963] bg-[#E2B963]/10 px-2 py-0.5 rounded-full font-mono border border-[#E2B963]/20">
              LIVE SIMULATION
            </span>
          </div>

          <p className="text-[11px] text-[#9CA3AF]">
            Berapa potensi kekayaan Anda jika dikelola secara otomatis dengan strategi alokasi LUXFIN AI?
          </p>

          {/* Slider 1: Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Pendapatan Per Bulan:</span>
              <span className="font-bold text-[#E2B963] font-mono">{formatRupiah(monthlyIncome)}</span>
            </div>
            <input
              type="range"
              min={5000000}
              max={100000000}
              step={2500000}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full accent-[#E2B963] cursor-pointer bg-white/10 h-2 rounded-lg"
            />
          </div>

          {/* Slider 2: Target Savings Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Target Alokasi Tabungan:</span>
              <span className="font-bold text-emerald-400 font-mono">{savingsPercent}% ({formatRupiah(monthlySavings)}/bln)</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={savingsPercent}
              onChange={(e) => setSavingsPercent(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer bg-white/10 h-2 rounded-lg"
            />
          </div>

          {/* Projection Result Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
              <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Proyeksi 3 Tahun (AI Optimized)</p>
              <p className="text-sm font-black text-[#E2B963] font-mono mt-1">{formatRupiah(threeYearAssetProjections)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 text-center">
              <p className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Proyeksi 5 Tahun (Freedom Asset)</p>
              <p className="text-sm font-black text-emerald-400 font-mono mt-1">{formatRupiah(fiveYearAssetProjections)}</p>
            </div>
          </div>

          <button
            onClick={onNavigateRegister}
            className="w-full py-2.5 rounded-xl bg-[#E2B963]/15 border border-[#E2B963]/30 hover:bg-[#E2B963]/25 text-xs font-bold text-[#E2B963] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Klaim Rencana Otomatisasi Ini Sekarang</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* 4. CORE FEATURES SHOWCASE */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-[#E2B963] uppercase tracking-widest">
              Teknologi Kelas Eksekutif
            </span>
            <h2 className="text-xl font-black text-white">4 Pilar Keunggulan LUXFIN AI</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Feature 1 */}
            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-[#E2B963]/30 transition-all flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#E2B963]/10 text-[#E2B963] shrink-0 mt-0.5">
                <Bot className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  AI Copilot & OCR Struk Scanner
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">INSTANT</span>
                </h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Foto struk belanja atau gunakan perintah suara. AI Copilot secara otomatis menguraikan nominal, tanggal, dan kategori tanpa perlu diketik manual.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-[#E2B963]/30 transition-all flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Engine Kalkulator Mampu Beli (Affordability)</h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Ingin membeli properti, kendaraan, atau barang mewah? Evaluasi skor risiko rasional berdasarkan arus kas aktual sebelum mengambil keputusan.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-[#E2B963]/30 transition-all flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Smart Net Worth & Multi-Account Analytics</h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Pantau total kekayaan bersih (tabungan, investasi rintis, properti) dikurangi kewajiban utang dengan kalkulator simulasi pelunasan Snowball/Avalanche.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 hover:border-[#E2B963]/30 transition-all flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Keamanan Enkripsi Private & Support PWA Offline</h4>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Bekerja 100% offline tanpa gangguan sinyal. Data Anda diisolasi ketat dengan enkripsi lokal dan lisensi server terverifikasi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. COMPARISON MATRIX (TRADITIONAL VS LUXFIN AI) */}
        <section className="bg-[#14171E] p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Mengapa Beralih Ke LUXFIN AI?
            </span>
            <h3 className="text-base font-extrabold text-white">Perbandingan Metode Finansial</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider pb-1 border-b border-white/5">
              <span>Metode Konvensional</span>
              <span className="text-[#E2B963]">LUXFIN AI Operating System</span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-2 border-b border-white/5 items-center">
              <span className="text-[#9CA3AF]">Catat di Excel/Buku Manual (Lupa/Repot)</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> OCR Struk & Voice AI Auto-Categorize
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-2 border-b border-white/5 items-center">
              <span className="text-[#9CA3AF]">Beli barang impian pakai insting / impulsif</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Kalkulator Mampu Beli Rasional
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-2 items-center">
              <span className="text-[#9CA3AF]">Aplikasi gratisan dipenuhi iklan & bocor data</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Private Data Isolation VIP System
              </span>
            </div>
          </div>
        </section>        {/* 6. PRICING & LICENSE PLANS */}
        <section className="space-y-4 pt-2">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-[#E2B963] uppercase tracking-widest bg-[#E2B963]/10 px-3 py-1 rounded-full border border-[#E2B963]/20">
              HARGA LISENSI RESMI
            </span>
            <h2 className="text-xl font-black text-white">Satu Harga Terjangkau, Akses Penuh Tanpa Batas</h2>
            <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
              Nikmati seluruh keunggulan LUXFIN AI Operating System tanpa biaya tersembunyi.
            </p>
          </div>

          {/* SINGLE PREMIUM PLAN CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1A1D26] to-[#14171E] border-2 border-[#E2B963] space-y-5 relative shadow-2xl shadow-[#E2B963]/15">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E2B963] to-[#C59A3F] text-black text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-black" />
              AKSES VIP FULL VERSION
            </div>

            <div className="text-center pt-2 space-y-1">
              <h3 className="font-black text-lg text-white flex items-center justify-center gap-1.5">
                LUXFIN AI EXECUTIVE PASS
                <Sparkles className="w-4 h-4 text-[#E2B963]" />
              </h3>
              <p className="text-[11px] text-[#9CA3AF]">Akses Lengkap Seluruh Fitur AI & Finansial</p>
            </div>

            {/* Price Box */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-[#9CA3AF] line-through font-mono">Rp 499.000</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  DISKON PROMO
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#E2B963] font-mono">Rp 99.000</span>
                <span className="text-xs text-[#9CA3AF] font-bold">/ tahun</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-mono">
                Setara dengan hanya <span className="text-emerald-400 font-bold">Rp 8.250 / bulan</span>
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#F7F6F2] pt-1">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">UNLIMITED Query AI Copilot & Voice Assistant</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Scanner Struk Belanja Auto-OCR Presisi Tinggi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Calculators Mampu Beli (Affordability Engine)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Pencatatan Multi-Bank, E-Wallet & Dompet Tunai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Kalkulator Simulasi Utang Snowball & Avalanche</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Dukungan Mode PWA Offline & Enkripsi Lokal</span>
              </li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-black shadow-xl shadow-[#E2B963]/25"
              onClick={onNavigateRegister}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Dapatkan Lisensi Rp 99rb / Tahun
            </Button>
          </div>
        </section>

        {/* 7. SOCIAL PROOF & TESTIMONIALS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#E2B963]" />
              Pengalaman Pengguna VIP
            </h3>
            <div className="flex items-center gap-1 text-[#E2B963] text-xs font-bold font-mono">
              <Star className="w-3.5 h-3.5 fill-[#E2B963]" />
              <span>4.9 / 5.0</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#14171E] border border-white/5 space-y-2">
            <p className="text-xs text-[#F7F6F2] italic leading-relaxed">
              "LUXFIN AI mengubah total cara saya mengelola arus kas 3 bisnis saya. Fitur Affordability Engine sangat membantu saya memutuskan kapan tepatnya membeli aset tanpa mengganggu cashflow usaha."
            </p>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-white">Hendra Wijaya</p>
                <p className="text-[10px] text-[#9CA3AF]">Founder & Serial Entrepreneur, Jakarta</p>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">VERIFIED VIP</span>
            </div>
          </div>
        </section>

        {/* 7. HIGH CONVERSION FINAL CALL TO ACTION */}
        <section className="bg-gradient-to-r from-[#E2B963]/20 via-[#14171E] to-[#C59A3F]/20 p-6 rounded-3xl border border-[#E2B963]/40 text-center space-y-4 shadow-2xl">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#E2B963] uppercase tracking-widest bg-[#E2B963]/10 px-3 py-1 rounded-full border border-[#E2B963]/20">
              AKSES INSTAN VIP
            </span>
            <h2 className="text-xl font-black text-white">Siap Untuk Kebebasan Finansial Sejati?</h2>
            <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
              Dapatkan kendali penuh atas uang, tabungan, dan portofolio Anda hanya dalam hitungan detik.
            </p>
          </div>

          <div className="space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-extrabold shadow-lg shadow-[#E2B963]/20"
              onClick={onNavigateRegister}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Daftar Akun Baru (Gratis)
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full text-xs font-bold"
              onClick={onNavigateLogin}
            >
              Sudah Memiliki Akun? Masuk di Sini
            </Button>
          </div>
        </section>

        {/* 8. FOOTER */}
        <footer className="text-center pt-4 space-y-2 border-t border-white/5">
          <div className="flex items-center justify-center gap-3 text-[10px] text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#E2B963]" /> 256-Bit SSL Enkripsi
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Private Isolation
            </span>
          </div>
          <p className="text-[10px] text-[#9CA3AF]/60 font-mono">
            © 2026 LUXFIN AI Systems Inc. All Rights Reserved. Commercial Financial OS.
          </p>
        </footer>

      </div>
    </div>
  );
};
