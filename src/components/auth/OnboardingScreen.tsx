import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck, Target, Wallet, DollarSign, Award, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';
import { CurrencyInput } from '../common/CurrencyInput';
import { Card } from '../common/Card';
import { auth } from '../../utils/auth';
import { OnboardingFinancialContext } from '../../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State (All Optional)
  const [incomeRange, setIncomeRange] = useState<string>('10m-25m');
  const [mainGoal, setMainGoal] = useState<string>('EMERGENCY_FUND');
  const [typicalExpenses, setTypicalExpenses] = useState<number>(8500000);
  const [existingDebt, setExistingDebt] = useState<number>(0);
  const [emergencyFundStatus, setEmergencyFundStatus] = useState<string>('1-3_MONTHS');
  const [savingsTarget, setSavingsTarget] = useState<number>(3000000);

  const handleFinish = () => {
    const contextData: OnboardingFinancialContext = {
      monthlyIncomeRange: incomeRange,
      mainGoal,
      typicalExpenses,
      existingDebt,
      emergencyFundStatus,
      preferredSavingsTarget: savingsTarget,
    };

    auth.updateFinancialContext(contextData);
    onComplete();
  };

  const INCOME_RANGES = [
    { value: '<5m', label: '< Rp 5.000.000 / bln' },
    { value: '5m-10m', label: 'Rp 5.000.000 - Rp 10.000.000' },
    { value: '10m-25m', label: 'Rp 10.000.000 - Rp 25.000.000' },
    { value: '25m-50m', label: 'Rp 25.000.000 - Rp 50.000.000' },
    { value: '50m+', label: '> Rp 50.000.000 / bln' },
  ];

  const GOALS = [
    { value: 'EMERGENCY_FUND', label: 'Membangun Dana Darurat', desc: 'Amankan kas 3-6 bulan pengeluaran' },
    { value: 'BUY_PROPERTY', label: 'Membeli Rumah / Properti', desc: 'Terkumpul DP & cicilan sehat' },
    { value: 'INVESTMENT', label: 'Mengembangkan Portofolio Investasi', desc: 'Reksadana, Saham & Emas' },
    { value: 'DEBT_FREE', label: 'Bebas Dari Utang & Cicilan', desc: 'Melunasi pinjaman secara terstruktur' },
    { value: 'RETIREMENT', label: 'Persiapan Pensiun & Kebebasan Finansial', desc: 'Aset pasif jangka panjang' },
  ];

  const EMERGENCY_STATUSES = [
    { value: 'NONE', label: 'Belum Punya Dana Darurat' },
    { value: '1-3_MONTHS', label: '1 - 3 Bulan Pengeluaran' },
    { value: '3-6_MONTHS', label: '3 - 6 Bulan Pengeluaran (Ideal)' },
    { value: '6+_MONTHS', label: 'Lebih dari 6 Bulan (Sangat Aman)' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F6F2] flex flex-col justify-between p-5 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E2B963]" />
            <span className="font-bold text-sm tracking-wide text-white">LUXFIN ONBOARDING</span>
          </div>
          <button
            onClick={handleFinish}
            className="text-xs text-[#9CA3AF] hover:text-[#E2B963] font-semibold underline cursor-pointer"
          >
            Lewati Semua
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#E2B963]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: INCOME & GOAL */}
      {step === 1 && (
        <div className="my-auto space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-[#E2B963] font-bold uppercase tracking-widest">
              Langkah 1 dari 3
            </span>
            <h2 className="text-xl font-bold text-white">Pendapatan & Tujuan Utama</h2>
            <p className="text-xs text-[#9CA3AF]">
              Bantu AI Copilot memahami skala keuangan Anda untuk rekomendasi yang akurat (opsional).
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#9CA3AF] block">Rentang Pendapatan Bulanan:</label>
            <div className="space-y-1.5">
              {INCOME_RANGES.map((r) => {
                const isSelected = incomeRange === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setIncomeRange(r.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#14171E] border-[#E2B963] text-[#E2B963] shadow-md'
                        : 'bg-[#14171E]/60 border-white/10 text-white hover:border-white/20'
                    }`}
                  >
                    <span>{r.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#E2B963]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-[#9CA3AF] block">Fokus Tujuan Utama Keuangan:</label>
            <div className="space-y-2">
              {GOALS.map((g) => {
                const isSelected = mainGoal === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setMainGoal(g.value)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#14171E] border-[#E2B963] shadow-md'
                        : 'bg-[#14171E]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#E2B963]' : 'text-white'}`}>
                        {g.label}
                      </p>
                      {isSelected && <Check className="w-4 h-4 text-[#E2B963]" />}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: EXPENSES & DEBT */}
      {step === 2 && (
        <div className="my-auto space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-[#E2B963] font-bold uppercase tracking-widest">
              Langkah 2 dari 3
            </span>
            <h2 className="text-xl font-bold text-white">Pengeluaran & Utang</h2>
            <p className="text-xs text-[#9CA3AF]">
              Gambaran beban bulanan membantu menghitung rasio kesehatan finansial secara otomatis.
            </p>
          </div>

          <Card variant="obsidian" className="space-y-4">
            <CurrencyInput
              label="Estimasi Pengeluaran Bulanan (Rp)"
              value={typicalExpenses}
              onChange={setTypicalExpenses}
            />

            <CurrencyInput
              label="Total Sisa Utang / Cicilan Saat Ini (Rp)"
              value={existingDebt}
              onChange={setExistingDebt}
            />
            <p className="text-[10px] text-[#9CA3AF]">
              Termasuk KPR, KTA, Kartu Kredit, atau cicilan barang (masukkan 0 jika tidak ada).
            </p>
          </Card>
        </div>
      )}

      {/* STEP 3: EMERGENCY FUND & SAVINGS TARGET */}
      {step === 3 && (
        <div className="my-auto space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-[#E2B963] font-bold uppercase tracking-widest">
              Langkah 3 dari 3
            </span>
            <h2 className="text-xl font-bold text-white">Ketahanan & Target Tabungan</h2>
            <p className="text-xs text-[#9CA3AF]">
              Berapa proteksi kas yang dimiliki dan berapa target yang ingin disisihkan tiap bulan?
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#9CA3AF] block">Ketersediaan Dana Darurat Saat Ini:</label>
            <div className="space-y-1.5">
              {EMERGENCY_STATUSES.map((es) => {
                const isSelected = emergencyFundStatus === es.value;
                return (
                  <button
                    key={es.value}
                    type="button"
                    onClick={() => setEmergencyFundStatus(es.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#14171E] border-[#E2B963] text-[#E2B963] shadow-md'
                        : 'bg-[#14171E]/60 border-white/10 text-white hover:border-white/20'
                    }`}
                  >
                    <span>{es.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#E2B963]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Card variant="obsidian" className="space-y-2">
            <CurrencyInput
              label="Target Alokasi Tabungan Bulanan (Rp)"
              value={savingsTarget}
              onChange={setSavingsTarget}
            />
          </Card>
        </div>
      )}

      {/* STEP 4: SUMMARY & AI SETUP */}
      {step === 4 && (
        <div className="my-auto space-y-5 animate-in zoom-in-95 duration-300">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14171E] via-[#1E2330] to-[#14171E] border border-[#E2B963]/30 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#E2B963]/20 text-[#E2B963] flex items-center justify-center mx-auto border border-[#E2B963]/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Profil Finansial Terkonfigurasi!</h2>
              <p className="text-xs text-[#9CA3AF]">
                AI Copilot telah menyesuaikan model proyeksi dan indikator kesehatan keuangan Anda.
              </p>
            </div>
          </div>

          <Card variant="obsidian" className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9CA3AF]">Skala Pendapatan</span>
              <span className="font-bold text-[#E2B963]">{incomeRange}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9CA3AF]">Fokus Utama</span>
              <span className="font-bold text-white">
                {GOALS.find((g) => g.value === mainGoal)?.label}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9CA3AF]">Estimasi Pengeluaran</span>
              <span className="font-bold text-white">Rp {typicalExpenses.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#9CA3AF]">Target Tabungan</span>
              <span className="font-bold text-emerald-400">Rp {savingsTarget.toLocaleString('id-ID')}/bln</span>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Nav Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        {step > 1 ? (
          <Button
            variant="secondary"
            onClick={() => setStep(step - 1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleFinish}>
            Lewati
          </Button>
        )}

        {step < 4 ? (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => setStep(step + 1)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lanjutkan
          </Button>
        ) : (
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleFinish}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Mulai Gunakan LUXFIN AI
          </Button>
        )}
      </div>
    </div>
  );
};
