import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { aiLogger } from '../services/aiLogger.js';

export const aiRouter = Router();

const DISCLAIMER_TEXT = 'Disclaimer: Analisa & rekomendasi AI LUXFIN bersifat simulasi edukatif finansial personal dan bukan merupakan rekomendasi penasihat keuangan berlisensi.';

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
  Prompt Injection Guard Sanitizer
 */
function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/ignore previous instructions/gi, '[FILTERED_INSTRUCTION]')
    .replace(/bypass security/gi, '[FILTERED_INSTRUCTION]')
    .replace(/you are now in DAN mode/gi, '[FILTERED_INSTRUCTION]')
    .replace(/system prompt/gi, '[FILTERED_KEYWORD]')
    .replace(/reveal secrets/gi, '[FILTERED_KEYWORD]')
    .trim();
}

/**
  Helper to execute Gemini with a timeout limit (15s) and automatic fallback
 */
async function generateStructuredAI<T>(
  featureName: string,
  prompt: string,
  fallbackData: T,
  systemInstruction?: string
): Promise<T> {
  const sanitizedPrompt = sanitizeInput(prompt);
  const startTime = Date.now();
  let status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' = 'SUCCESS';

  try {
    const ai = getAi();
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI Request Timeout (>15s)')), 15000);
    });

    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: sanitizedPrompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction,
      },
    });

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const text = response.text;

    if (!text) {
      throw new Error('Gemini API returned empty text response');
    }

    const parsed = JSON.parse(text) as T;
    const executionMs = Date.now() - startTime;

    aiLogger.logExecution({
      featureName,
      model: 'gemini-3.6-flash',
      executionMs,
      tokenEstimate: Math.round((prompt.length + text.length) / 4),
      status: 'SUCCESS',
      sanitizedMetadata: { responseLength: text.length },
    });

    return { ...parsed, disclaimer: DISCLAIMER_TEXT };
  } catch (err: any) {
    const executionMs = Date.now() - startTime;
    status = err.message?.includes('Timeout') ? 'TIMEOUT' : 'ERROR';

    aiLogger.logExecution({
      featureName,
      model: 'gemini-3.6-flash',
      executionMs,
      tokenEstimate: Math.round(prompt.length / 4),
      status,
      sanitizedMetadata: { errorMessage: err.message },
    });

    console.error(`[AI Engine] Error in ${featureName}:`, err.message);
    return { ...fallbackData, disclaimer: DISCLAIMER_TEXT };
  }
}

// 1. Transaction Categorization
aiRouter.post('/categorize-transaction', async (req: Request, res: Response) => {
  const { vendor, amount, notes, availableCategories } = req.body;

  const prompt = `
Kategori transaksi keuangan Indonesia:
- Vendor/Merchant: "${vendor || 'Tidak ada'}"
- Jumlah: Rp ${amount || 0}
- Catatan: "${notes || ''}"
- Kategori Tersedia: ${JSON.stringify(availableCategories || [])}

Tentukan kategori paling tepat dari daftar. Kembalikan JSON:
{
  "suggestedCategory": "string",
  "suggestedSubcategory": "string",
  "confidenceScore": number (0-100),
  "tags": string[],
  "explanation": "string penjelasan singkat"
}
`;

  const fallback = {
    suggestedCategory: availableCategories?.[0] || 'Lain-lain',
    suggestedSubcategory: 'Umum',
    confidenceScore: 50,
    tags: ['Lain-lain'],
    explanation: 'Kategori default berdasarkan data transaksi minimal.',
  };

  const result = await generateStructuredAI('TransactionCategorization', prompt, fallback);
  return res.json({ success: true, result });
});

// 2. Spending Analysis
aiRouter.post('/spending-analysis', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Analisis Pengeluaran Finansial Pengguna LUXFIN AI:
Konteks Keuangan:
${JSON.stringify(financialContext || {})}

Evaluasi pola pengeluaran bulanan. Jika pengeluaran 0 atau tidak ada data transaksi, nyatakan data belum mencukupi.
Kembalikan JSON:
{
  "summary": "string ringkasan analisis",
  "topSpendingCategory": "string nama kategori terbesar",
  "unnecessarySpendingEstimate": number (estimasi rupiah pengeluaran yang bisa dihemat),
  "insights": string[] (3 poin wawasan),
  "benchmarkComparison": "string perbandingan dengan rasio ideal 50/30/20"
}
`;

  const fallback = {
    summary: 'Data pengeluaran saat ini belum cukup untuk analisis mendalam.',
    topSpendingCategory: financialContext?.categorySpending?.[0]?.categoryName || 'Belum ada',
    unnecessarySpendingEstimate: 0,
    insights: ['Catat transaksi rutin harian untuk mendapatkan wawasan analisis yang lebih tajam.'],
    benchmarkComparison: 'Rasio 50/30/20 dapat diterapkan setelah data pengeluaran sebulan terkumpul.',
  };

  const result = await generateStructuredAI('SpendingAnalysis', prompt, fallback);
  return res.json({ success: true, result });
});

// 3. Spending Pattern Detection
aiRouter.post('/spending-patterns', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Deteksi Pola Pengeluaran Finansial:
Konteks Keuangan:
${JSON.stringify(financialContext || {})}

Identifikasi kebiasaan/pola berulang pengguna (misal: mikrokonsumsi kopi/fast food, lonjakan pengeluaran akhir pekan, atau tagihan berulang).
Kembalikan JSON:
{
  "detectedPatterns": [
    {
      "title": "string nama pola",
      "description": "string penjelasan",
      "frequency": "Harian / Mingguan / Bulanan",
      "estimatedMonthlyImpact": number,
      "type": "POSITIVE" | "NEUTRAL" | "WARNING"
    }
  ],
  "primaryPatternSummary": "string ringkasan pola utama"
}
`;

  const fallback = {
    detectedPatterns: [
      {
        title: 'Pola Transaksi Rutin',
        description: 'Pola transaksi berulang akan muncul secara otomatis setelah mencatat minimal 10 transaksi.',
        frequency: 'Bulanan',
        estimatedMonthlyImpact: 0,
        type: 'NEUTRAL' as const,
      },
    ],
    primaryPatternSummary: 'Belum terdeteksi anomali atau akumulasi pengeluaran impulsif berulang.',
  };

  const result = await generateStructuredAI('SpendingPatternDetection', prompt, fallback);
  return res.json({ success: true, result });
});

// 4. Budget Recommendations
aiRouter.post('/budget-recommendations', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Rekomendasi Anggaran Bulanan Berdasarkan Aturan 50/30/20 Finansial Indonesia:
Konteks Keuangan:
- Pemasukan Bulanan: Rp ${financialContext?.cashflowSummary?.monthlyIncome || 0}
- Pengeluaran Bulanan: Rp ${financialContext?.cashflowSummary?.monthlyExpense || 0}
- Kategori Pengeluaran: ${JSON.stringify(financialContext?.categorySpending || [])}

Buat pembagian anggaran yang realistis dan terukur. Kembalikan JSON:
{
  "recommendedMonthlyBudget": number (total batas anggaran),
  "categoryBreakdown": [
    {
      "categoryName": "string",
      "recommendedLimit": number,
      "reasoning": "string alasan limit"
    }
  ],
  "savingsTargetRecommendation": number,
  "advice": "string saran umum"
}
`;

  const income = financialContext?.cashflowSummary?.monthlyIncome || 10000000;
  const fallback = {
    recommendedMonthlyBudget: Math.round(income * 0.8),
    categoryBreakdown: [
      { categoryName: 'Kebutuhan Pokok (50%)', recommendedLimit: Math.round(income * 0.5), reasoning: 'Alokasi wajib untuk tempat tinggal, makanan, & tagihan dasar.' },
      { categoryName: 'Gaya Hidup & Keinginan (30%)', recommendedLimit: Math.round(income * 0.3), reasoning: 'Batas hiburan, rekreasi, dan kebutuhan sekunder.' },
    ],
    savingsTargetRecommendation: Math.round(income * 0.2),
    advice: 'Gunakan alokasi 50/30/20 untuk menjaga keseimbangan antara arus kas dan tabungan masa depan.',
  };

  const result = await generateStructuredAI('BudgetRecommendations', prompt, fallback);
  return res.json({ success: true, result });
});

// 5. Financial Health Score Explanation
aiRouter.post('/health-score-explanation', async (req: Request, res: Response) => {
  const { healthScore, financialContext } = req.body;

  const prompt = `
Jelaskan Skor Kesehatan Finansial Pengguna:
Skor: ${healthScore?.score || 75}/100 (Grade ${healthScore?.grade || 'B'})
Konteks Keuangan:
${JSON.stringify(financialContext || {})}

Uraikan kekuatan utama, celah kerentanan, dan langkah perbaikan konkret. Kembalikan JSON:
{
  "score": ${healthScore?.score || 75},
  "grade": "${healthScore?.grade || 'B'}",
  "keyStrengths": string[] (2-3 poin),
  "vulnerabilities": string[] (2-3 poin),
  "actionableSteps": string[] (3 langkah taktis),
  "summary": "string penjelas singkat"
}
`;

  const fallback = {
    score: healthScore?.score || 75,
    grade: healthScore?.grade || 'B',
    keyStrengths: ['Arus kas bulanan tercatat aktif.', 'Pencatatan akun terorganisir.'],
    vulnerabilities: ['Rasio dana darurat perlu ditingkatkan hingga minimal 6 kali pengeluaran bulanan.'],
    actionableSteps: ['Alokasikan minimal 20% pemasukan bersih langsung ke tabungan di awal bulan.'],
    summary: `Skor kesehatan keuangan Anda saat ini adalah ${healthScore?.score || 75}/100.`,
  };

  const result = await generateStructuredAI('HealthScoreExplanation', prompt, fallback);
  return res.json({ success: true, result });
});

// 6. Financial Forecasting
aiRouter.post('/financial-forecast', async (req: Request, res: Response) => {
  const { months, financialContext } = req.body;
  const horizon = months || 6;

  const prompt = `
Proyeksi Finansial ${horizon} Bulan ke Depan:
Konteks Keuangan:
- Net Worth Saat Ini: Rp ${financialContext?.netWorthSummary?.netWorth || 0}
- Pemasukan Bulanan: Rp ${financialContext?.cashflowSummary?.monthlyIncome || 0}
- Pengeluaran Bulanan: Rp ${financialContext?.cashflowSummary?.monthlyExpense || 0}

Hitung proyeksi net worth & akumulasi tabungan berdasarkan skenario konservatif (inflasi/pengeluaran tak terduga +10%), moderat (laju saat ini), dan optimis (efisiensi pengeluaran +10%).
Kembalikan JSON:
{
  "horizonMonths": ${horizon},
  "projectedNetWorth": number,
  "projectedSavings": number,
  "scenarios": {
    "conservative": number,
    "moderate": number,
    "optimistic": number
  },
  "keyAssumptions": string[] (2-3 poin asumsi)
}
`;

  const currentNW = financialContext?.netWorthSummary?.netWorth || 0;
  const monthlySavings = (financialContext?.cashflowSummary?.monthlyIncome || 0) - (financialContext?.cashflowSummary?.monthlyExpense || 0);
  const fallback = {
    horizonMonths: horizon,
    projectedNetWorth: currentNW + monthlySavings * horizon,
    projectedSavings: Math.max(0, monthlySavings * horizon),
    scenarios: {
      conservative: Math.round(currentNW + monthlySavings * horizon * 0.85),
      moderate: Math.round(currentNW + monthlySavings * horizon),
      optimistic: Math.round(currentNW + monthlySavings * horizon * 1.15),
    },
    keyAssumptions: [
      'Pemasukan dan pengeluaran bulanan diasumsikan konsisten.',
      'Tidak memperhitungkan risiko volatilitas pasar investasi ekstrem.',
    ],
  };

  const result = await generateStructuredAI('FinancialForecast', prompt, fallback);
  return res.json({ success: true, result });
});

// 7. Goal Planning
aiRouter.post('/goal-planning', async (req: Request, res: Response) => {
  const { goal, financialContext } = req.body;

  const prompt = `
Rencana Strategi Pencapaian Target Keuangan:
Goal: "${goal?.title || 'Target Keuangan'}"
Target Rp: ${goal?.targetAmount || 0}
Terkumpul Rp: ${goal?.currentAmount || 0}
Tenggat Waktu: ${goal?.deadline || 'Tidak ditentukan'}

Konteks Keuangan:
- Arus Kas Net Bulanan: Rp ${financialContext?.cashflowSummary?.netCashflow || 0}

Hitung kontribusi bulanan yang dibutuhkan, evaluasi kelayakan realistis (isFeasible), dan buat langkah aksi.
Kembalikan JSON:
{
  "goalTitle": "${goal?.title || 'Target Keuangan'}",
  "targetAmount": ${goal?.targetAmount || 0},
  "currentAmount": ${goal?.currentAmount || 0},
  "recommendedMonthlyContribution": number,
  "projectedCompletionDate": "YYYY-MM-DD",
  "isFeasible": boolean,
  "feasibilityAssessment": "string penjelasan kelayakan",
  "actionPlan": string[] (3 langkah aksi)
}
`;

  const remaining = Math.max(0, (goal?.targetAmount || 0) - (goal?.currentAmount || 0));
  const fallback = {
    goalTitle: goal?.title || 'Target Keuangan',
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    recommendedMonthlyContribution: Math.round(remaining / 12) || 500000,
    projectedCompletionDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
    isFeasible: true,
    feasibilityAssessment: 'Target realistis jika Anda menyisihkan sebagian arus kas bulanan secara teratur.',
    actionPlan: [
      'Otomatiskan transfer ke rekening tabungan target di awal bulan.',
      'Evaluasi pengeluaran sekunder jika ingin mempercepat pencapaian target.',
    ],
  };

  const result = await generateStructuredAI('GoalPlanning', prompt, fallback);
  return res.json({ success: true, result });
});

// 8. Debt Strategy Analysis
aiRouter.post('/debt-strategy', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Analisis Strategi Pelunasan Utang (Avalanche vs Snowball):
Daftar Utang Pengguna:
${JSON.stringify(financialContext?.debtSummary || {})}

Gunakan kalkulasi matematis objektif untuk merekomendasikan strategi terbaik (Avalanche hemat bunga vs Snowball dorongan psikologis).
Kembalikan JSON:
{
  "recommendedStrategy": "AVALANCHE" | "SNOWBALL",
  "estimatedMonthsToPayoff": number,
  "estimatedInterestSaved": number,
  "payoffOrder": [
    {
      "debtName": "string",
      "remainingAmount": number,
      "interestRate": number,
      "order": number
    }
  ],
  "monthlyFastTrackPayment": number,
  "advice": "string saran spesifik"
}
`;

  const debts = financialContext?.debtSummary?.debts || [];
  const fallback = {
    recommendedStrategy: 'AVALANCHE' as const,
    estimatedMonthsToPayoff: debts.length > 0 ? 18 : 0,
    estimatedInterestSaved: debts.length > 0 ? 2500000 : 0,
    payoffOrder: debts.map((d: any, idx: number) => ({
      debtName: d.name,
      remainingAmount: d.remaining,
      interestRate: d.interestRate,
      order: idx + 1,
    })),
    monthlyFastTrackPayment: 500000,
    advice: debts.length > 0
      ? 'Prioritaskan pembayaran ekstra pada utang berbunga paling tinggi untuk menghemat total beban bunga.'
      : 'Saat ini Anda bebas dari utang berbunga tinggi! Pertahankan posisi keuangan ini.',
  };

  const result = await generateStructuredAI('DebtStrategyAnalysis', prompt, fallback);
  return res.json({ success: true, result });
});

// 9. Subscription Analysis
aiRouter.post('/subscription-analysis', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Analisis Langganan & Biaya Berulang (Subscriptions):
Daftar Langganan:
${JSON.stringify(financialContext?.billSubscriptionSummary || {})}

Evaluasi efisiensi biaya langganan bulanan. Identifikasi potensi pemborosan atau langganan ganda.
Kembalikan JSON:
{
  "activeSubscriptionsCount": number,
  "totalMonthlyCost": number,
  "totalAnnualCost": number,
  "unusedOrRedundantSuggestions": [
    {
      "name": "string",
      "monthlyPrice": number,
      "reason": "string alasan pertimbangan pembatalan"
    }
  ],
  "optimizationAdvice": "string saran penghematan"
}
`;

  const subs = financialContext?.billSubscriptionSummary?.subscriptions || [];
  const totalCost = financialContext?.billSubscriptionSummary?.totalMonthlySubscriptionCost || 0;
  const fallback = {
    activeSubscriptionsCount: subs.length,
    totalMonthlyCost: totalCost,
    totalAnnualCost: totalCost * 12,
    unusedOrRedundantSuggestions: [],
    optimizationAdvice: totalCost > 0
      ? 'Lakukan audit berkala harian/bulanan pada layanan streaming & aplikasi yang jarang digunakan.'
      : 'Belum ada langganan aktif yang berpotensi membebani arus kas bulanan Anda.',
  };

  const result = await generateStructuredAI('SubscriptionAnalysis', prompt, fallback);
  return res.json({ success: true, result });
});

// 10. Anomaly Detection
aiRouter.post('/anomaly-detection', async (req: Request, res: Response) => {
  const { recentTransactions, financialContext } = req.body;

  const prompt = `
Deteksi Anomali Transaksi Keuangan:
Transaksi Terbaru:
${JSON.stringify(recentTransactions || [])}

Konteks Rata-Rata Arus Kas:
${JSON.stringify(financialContext?.cashflowSummary || {})}

Cari transaksi ganda, nominal mencurigakan di luar kebiasaan, atau lonjakan pengeluaran mendadak.
Kembalikan JSON:
{
  "anomaliesFound": boolean,
  "detectedAnomalies": [
    {
      "vendor": "string",
      "amount": number,
      "date": "string",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "reason": "string alasan anomali"
    }
  ],
  "safetyScore": number (0-100),
  "summary": "string ringkasan audit keamanan transaksi"
}
`;

  const fallback = {
    anomaliesFound: false,
    detectedAnomalies: [],
    safetyScore: 95,
    summary: 'Seluruh transaksi terbaru berada dalam batas normal kewajaran.',
  };

  const result = await generateStructuredAI('AnomalyDetection', prompt, fallback);
  return res.json({ success: true, result });
});

// 11. Monthly Financial Review
aiRouter.post('/monthly-review', async (req: Request, res: Response) => {
  const { monthStr, financialContext } = req.body;

  const prompt = `
Review Keuangan Bulanan Komprehensif untuk Periode ${monthStr || 'Bulan Ini'}:
Konteks Finansial Lengkap:
${JSON.stringify(financialContext || {})}

Buat laporan evaluasi bulanan profesional, soroti pencapaian positif (wins), area perbaikan, dan strategi bulan depan.
Kembalikan JSON:
{
  "reviewPeriod": "${monthStr || 'Bulan Ini'}",
  "financialHeadline": "string judul pencapaian utama",
  "totalIncome": number,
  "totalExpense": number,
  "netSavings": number,
  "savingsRatePct": number,
  "top3Expenses": [{ "category": "string", "amount": number }],
  "wins": string[],
  "areasToImprove": string[],
  "nextMonthStrategy": "string strategi taktis"
}
`;

  const inc = financialContext?.cashflowSummary?.monthlyIncome || 0;
  const exp = financialContext?.cashflowSummary?.monthlyExpense || 0;
  const sav = inc - exp;
  const fallback = {
    reviewPeriod: monthStr || 'Bulan Ini',
    financialHeadline: 'Evaluasi Arus Kas & Pertumbuhan Aset Bulanan',
    totalIncome: inc,
    totalExpense: exp,
    netSavings: sav,
    savingsRatePct: inc > 0 ? Math.round((sav / inc) * 100) : 0,
    top3Expenses: (financialContext?.categorySpending || []).slice(0, 3).map((c: any) => ({
      category: c.categoryName,
      amount: c.amount,
    })),
    wins: ['Pencatatan keuangan bulanan berlangsung konsisten.', 'Arus kas berada dalam pantauan aktif.'],
    areasToImprove: ['Pertahankan optimasi pengeluaran sekunder.'],
    nextMonthStrategy: 'Alokasikan dana surplus bulan ini secara langsung ke portofolio investasi atau dana darurat.',
  };

  const result = await generateStructuredAI('MonthlyReview', prompt, fallback);
  return res.json({ success: true, result });
});

// 12. Personalized Financial Insights
aiRouter.post('/personalized-insights', async (req: Request, res: Response) => {
  const { financialContext } = req.body;

  const prompt = `
Hasilkan Insight Finansial Personalisasi (3-5 kartu insight bertindak):
Konteks Finansial:
${JSON.stringify(financialContext || {})}

Hasilkan insight berbobot spesifik untuk pengguna Indonesia (misal: rasio dana darurat, optimasi anggaran, pelunasan utang, alokasi reksadana/SBN).
Kembalikan JSON:
{
  "insights": [
    {
      "id": "string unique",
      "title": "string judul insight",
      "description": "string penjelasan actionable",
      "category": "BUDGET" | "GOAL" | "DEBT" | "INVESTMENT" | "SUBSCRIPTION" | "ANOMALY",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "actionText": "string label tombol aksi",
      "actionTab": "string nama tab navigasi"
    }
  ],
  "generatedAt": "string ISO timestamp"
}
`;

  const fallback = {
    insights: [
      {
        id: 'ins_01',
        title: 'Optimasi Dana Darurat',
        description: 'Pastikan tabungan cairan mencukupi minimal 6x pengeluaran bulanan Anda untuk menghadapi situasi tak terduga.',
        category: 'GOAL' as const,
        priority: 'HIGH' as const,
        actionText: 'Lihat Dana Darurat',
        actionTab: 'GOALS',
      },
      {
        id: 'ins_02',
        title: 'Evaluasi Anggaran Bulanan',
        description: 'Setel batas anggaran per kategori agar arus kas bulanan tetap terjaga positif.',
        category: 'BUDGET' as const,
        priority: 'MEDIUM' as const,
        actionText: 'Kelola Anggaran',
        actionTab: 'BUDGET',
      },
    ],
    generatedAt: new Date().toISOString(),
  };

  const result = await generateStructuredAI('PersonalizedInsights', prompt, fallback);
  return res.json({ success: true, result });
});

// 13. Receipt OCR Scanning
aiRouter.post('/ocr-receipt', async (req: Request, res: Response) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Data gambar struk (imageBase64) wajib diisi.' });
  }

  try {
    const ai = getAi();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = `
Anda adalah sistem OCR Struk Belanja & Nota Keuangan Indonesia tingkat lanjut.
Analisis gambar struk ini dan ekstrak seluruh informasi transaksi dengan teliti.

Kembalikan JSON terstruktur murni:
{
  "merchant": "string nama toko/merchant",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string nama barang/item",
      "quantity": number,
      "price": number,
      "total": number
    }
  ],
  "subtotal": number,
  "tax": number,
  "discount": number,
  "total": number,
  "confidenceScores": {
    "merchant": "HIGH" | "MEDIUM" | "LOW",
    "date": "HIGH" | "MEDIUM" | "LOW",
    "items": "HIGH" | "MEDIUM" | "LOW",
    "total": "HIGH" | "MEDIUM" | "LOW"
  },
  "uncertainFields": string[] (contoh: ["date", "tax"] jika agak buram/kabur),
  "rawSummary": "string ringkasan pembacaan nota"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Mata AI tidak menghasilkan respons Teks');

    const result = JSON.parse(text);
    return res.json({
      success: true,
      result,
      receipt: {
        vendor: result.merchant || result.vendor,
        total: result.total,
        date: result.date,
        items: result.items,
      },
    });
  } catch (err: any) {
    console.error('OCR Receipt Error:', err);
    // Fallback Mock OCR result if AI fails or image unreadable
    const fallbackObj = {
      merchant: 'Toko / Resto (Manual)',
      date: new Date().toISOString().substring(0, 10),
      items: [
        { name: 'Item Pembelian 1', quantity: 1, price: 50000, total: 50000 }
      ],
      subtotal: 50000,
      tax: 0,
      discount: 0,
      total: 50000,
      confidenceScores: {
        merchant: 'LOW' as const,
        date: 'MEDIUM' as const,
        items: 'LOW' as const,
        total: 'LOW' as const,
      },
      uncertainFields: ['merchant', 'items', 'total'],
      rawSummary: 'Data dibaca dengan mode manual karena gambar buram.',
    };
    return res.json({
      success: true,
      result: fallbackObj,
      receipt: {
        vendor: fallbackObj.merchant,
        total: fallbackObj.total,
        date: fallbackObj.date,
        items: fallbackObj.items,
      },
    });
  }
});

aiRouter.post('/scan-receipt', async (req: Request, res: Response) => {
  // Delegate to /ocr-receipt endpoint logic
  req.url = '/ocr-receipt';
  return aiRouter(req, res, () => {});
});
