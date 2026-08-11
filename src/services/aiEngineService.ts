import { ApiClient } from '../api/apiClient';
import { FinancialContextBuilder } from './financialContextBuilder';
import {
  TransactionCategorizationResult,
  SpendingAnalysisResult,
  SpendingPatternResult,
  BudgetRecommendationResult,
  HealthScoreExplanationResult,
  FinancialForecastResult,
  GoalPlanningResult,
  DebtStrategyAnalysisResult,
  SubscriptionAnalysisResult,
  AnomalyDetectionResult,
  AffordabilityAnalysisResult,
  MonthlyReviewResult,
  PersonalizedInsightsResult,
  StructuredFinancialContext,
  FinancialGoal,
  FinancialHealthScore,
} from '../types';
import { AppState } from '../utils/storage';

export class AIEngineService {
  /**
   * Helper to build context or use provided snapshot
   */
  private static getContext(customContext?: Partial<AppState> | StructuredFinancialContext): StructuredFinancialContext {
    if (customContext && 'accountSummary' in customContext) {
      return customContext as StructuredFinancialContext;
    }
    return FinancialContextBuilder.buildContext(customContext as Partial<AppState>);
  }

  // 1. Transaction Categorization
  static async categorizeTransaction(
    vendor: string,
    amount: number,
    notes?: string,
    availableCategories?: string[]
  ): Promise<TransactionCategorizationResult> {
    const res = await ApiClient.post<TransactionCategorizationResult>('/api/ai/categorize-transaction', {
      vendor,
      amount,
      notes,
      availableCategories,
    });

    return res.data || {
      suggestedCategory: availableCategories?.[0] || 'Lain-lain',
      suggestedSubcategory: 'Umum',
      confidenceScore: 50,
      tags: ['AutoCat'],
      explanation: 'Kategori default fallback.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 2. Spending Analysis
  static async analyzeSpending(customContext?: Partial<AppState>): Promise<SpendingAnalysisResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<SpendingAnalysisResult>('/api/ai/spending-analysis', {
      financialContext: context,
    });

    return res.data || {
      summary: 'Data pengeluaran belum mencukupi untuk analisis detail.',
      topSpendingCategory: context.categorySpending[0]?.categoryName || 'Belum ada',
      unnecessarySpendingEstimate: 0,
      insights: ['Selesaikan pencatatan transaksi sebulan penuh untuk melihat pola detail.'],
      benchmarkComparison: 'Rasio 50/30/20 dapat dihitung secara akurat setelah data tersedia.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 3. Spending Pattern Detection
  static async detectSpendingPatterns(customContext?: Partial<AppState>): Promise<SpendingPatternResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<SpendingPatternResult>('/api/ai/spending-patterns', {
      financialContext: context,
    });

    return res.data || {
      detectedPatterns: [
        {
          title: 'Pola Transaksi Rutin',
          description: 'Pola transaksi berulang akan otomatis terdeteksi seiring bertambahnya riwayat harian.',
          frequency: 'Bulanan',
          estimatedMonthlyImpact: 0,
          type: 'NEUTRAL',
        },
      ],
      primaryPatternSummary: 'Belum ditemukan anomali pengeluaran signifikan.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 4. Budget Recommendations
  static async generateBudgetRecommendations(customContext?: Partial<AppState>): Promise<BudgetRecommendationResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<BudgetRecommendationResult>('/api/ai/budget-recommendations', {
      financialContext: context,
    });

    const income = context.cashflowSummary.monthlyIncome || 10000000;

    return res.data || {
      recommendedMonthlyBudget: Math.round(income * 0.8),
      categoryBreakdown: [
        { categoryName: 'Kebutuhan Pokok (50%)', recommendedLimit: Math.round(income * 0.5), reasoning: 'Alokasi primer tempat tinggal & konsumsi dasar.' },
        { categoryName: 'Gaya Hidup (30%)', recommendedLimit: Math.round(income * 0.3), reasoning: 'Batas hiburan dan kebutuhan sekunder.' },
      ],
      savingsTargetRecommendation: Math.round(income * 0.2),
      advice: 'Gunakan alokasi 50/30/20 sebagai panduan utama anggaran bulanan.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 5. Financial Health Score Explanation
  static async explainHealthScore(
    healthScore: any,
    customContext?: Partial<AppState>
  ): Promise<HealthScoreExplanationResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<HealthScoreExplanationResult>('/api/ai/health-score-explanation', {
      healthScore,
      financialContext: context,
    });

    return res.data || {
      score: healthScore?.score || 75,
      grade: healthScore?.grade || 'B',
      keyStrengths: ['Pencatatan keuangan aktif.', 'Pengelolaan akun terorganisir.'],
      vulnerabilities: ['Rasio tabungan darurat perlu ditingkatkan.'],
      actionableSteps: ['Sisihkan minimal 20% pemasukan bersih langsung di awal bulan.'],
      summary: `Skor kesehatan finansial Anda adalah ${healthScore?.score || 75}/100.`,
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 6. Financial Forecasting
  static async forecastFinancials(
    months: number = 6,
    customContext?: Partial<AppState>
  ): Promise<FinancialForecastResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<FinancialForecastResult>('/api/ai/financial-forecast', {
      months,
      financialContext: context,
    });

    const currentNW = context.netWorthSummary.netWorth;
    const monthlyNet = context.cashflowSummary.netCashflow;

    return res.data || {
      horizonMonths: months,
      projectedNetWorth: currentNW + monthlyNet * months,
      projectedSavings: Math.max(0, monthlyNet * months),
      scenarios: {
        conservative: Math.round(currentNW + monthlyNet * months * 0.85),
        moderate: Math.round(currentNW + monthlyNet * months),
        optimistic: Math.round(currentNW + monthlyNet * months * 1.15),
      },
      keyAssumptions: ['Asumsi tren arus kas stabil selama periode proyeksi.'],
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 7. Goal Planning
  static async planGoalStrategy(
    goal: Partial<FinancialGoal>,
    customContext?: Partial<AppState>
  ): Promise<GoalPlanningResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<GoalPlanningResult>('/api/ai/goal-planning', {
      goal,
      financialContext: context,
    });

    const rem = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));

    return res.data || {
      goalTitle: goal.title || 'Target Keuangan',
      targetAmount: goal.targetAmount || 0,
      currentAmount: goal.currentAmount || 0,
      recommendedMonthlyContribution: Math.round(rem / 12) || 500000,
      projectedCompletionDate: goal.targetDate || (goal as any).deadline || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      isFeasible: true,
      feasibilityAssessment: 'Target dapat dicapai dengan menyisihkan arus kas bulanan secara teratur.',
      actionPlan: ['Setel otodebit tabungan bulanan.', 'Evaluasi pengeluaran non-esensial.'],
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 8. Debt Strategy Analysis
  static async analyzeDebtStrategy(customContext?: Partial<AppState>): Promise<DebtStrategyAnalysisResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<DebtStrategyAnalysisResult>('/api/ai/debt-strategy', {
      financialContext: context,
    });

    const debts = context.debtSummary.debts;

    return res.data || {
      recommendedStrategy: 'AVALANCHE',
      estimatedMonthsToPayoff: debts.length > 0 ? 12 : 0,
      estimatedInterestSaved: 1500000,
      payoffOrder: debts.map((d, i) => ({
        debtName: d.name,
        remainingAmount: d.remaining,
        interestRate: d.interestRate,
        order: i + 1,
      })),
      monthlyFastTrackPayment: 500000,
      advice: debts.length > 0
        ? 'Prioritaskan pelunasan utang dengan suku bunga tertinggi terlebih dahulu.'
        : 'Anda saat ini tidak memiliki beban utang berbunga tinggi.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 9. Subscription Analysis
  static async analyzeSubscriptions(customContext?: Partial<AppState>): Promise<SubscriptionAnalysisResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<SubscriptionAnalysisResult>('/api/ai/subscription-analysis', {
      financialContext: context,
    });

    const totalCost = context.billSubscriptionSummary.totalMonthlySubscriptionCost;

    return res.data || {
      activeSubscriptionsCount: context.billSubscriptionSummary.subscriptionsCount,
      totalMonthlyCost: totalCost,
      totalAnnualCost: totalCost * 12,
      unusedOrRedundantSuggestions: [],
      optimizationAdvice: 'Lakukan evaluasi langganan berkala untuk menghindari biaya otomatis yang tidak terpakai.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 10. Anomaly Detection
  static async detectAnomalies(
    recentTransactions: any[],
    customContext?: Partial<AppState>
  ): Promise<AnomalyDetectionResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<AnomalyDetectionResult>('/api/ai/anomaly-detection', {
      recentTransactions,
      financialContext: context,
    });

    return res.data || {
      anomaliesFound: false,
      detectedAnomalies: [],
      safetyScore: 98,
      summary: 'Tidak terdeteksi anomali atau transaksi mencurigakan.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 11. Affordability Analysis
  static async analyzeAffordability(
    itemName: string,
    price: number,
    customContext?: Partial<AppState>
  ): Promise<AffordabilityAnalysisResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<AffordabilityAnalysisResult>('/api/ai/affordability', {
      itemName,
      price,
      financialContext: context,
    });

    return res.data || {
      itemName,
      price,
      status: 'WARNING',
      badgeText: 'Pertimbangkan Kembali',
      score: 65,
      impactSummary: 'Pembelian ini akan mengurangi sebagian kas cair Anda.',
      recoveryMonths: 2,
      advicePoints: ['Pastikan dana darurat tetap utuh.', 'Pertimbangkan menunda 30 hari untuk memastikan kebutuhan.'],
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 12. Monthly Financial Review
  static async generateMonthlyReview(
    monthStr?: string,
    customContext?: Partial<AppState>
  ): Promise<MonthlyReviewResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<MonthlyReviewResult>('/api/ai/monthly-review', {
      monthStr: monthStr || new Date().toISOString().substring(0, 7),
      financialContext: context,
    });

    const inc = context.cashflowSummary.monthlyIncome;
    const exp = context.cashflowSummary.monthlyExpense;

    return res.data || {
      reviewPeriod: monthStr || 'Bulan Ini',
      financialHeadline: 'Ringkasan Kinerja Finansial Bulanan',
      totalIncome: inc,
      totalExpense: exp,
      netSavings: inc - exp,
      savingsRatePct: context.cashflowSummary.savingsRate,
      top3Expenses: context.categorySpending.slice(0, 3).map((c) => ({
        category: c.categoryName,
        amount: c.amount,
      })),
      wins: ['Konsisten mencatat arus kas.', 'Menjaga likuiditas tabungan.'],
      areasToImprove: ['Optimalkan alokasi anggaran bulanan.'],
      nextMonthStrategy: 'Tingkatkan rasio simpanan langsung setelah menerima pemasukan utama.',
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }

  // 13. Personalized Financial Insights
  static async generatePersonalizedInsights(customContext?: Partial<AppState>): Promise<PersonalizedInsightsResult> {
    const context = this.getContext(customContext);

    const res = await ApiClient.post<PersonalizedInsightsResult>('/api/ai/personalized-insights', {
      financialContext: context,
    });

    return res.data || {
      insights: [
        {
          id: 'ins_01',
          title: 'Optimasi Dana Darurat',
          description: 'Pastikan tabungan cair mencukupi minimal 6x pengeluaran bulanan.',
          category: 'GOAL',
          priority: 'HIGH',
          actionText: 'Lihat Target Dana Darurat',
          actionTab: 'GOALS',
        },
        {
          id: 'ins_02',
          title: 'Monitoring Anggaran Bulanan',
          description: 'Setel limit kategori belanja agar pengeluaran sekunder tetap terkontrol.',
          category: 'BUDGET',
          priority: 'MEDIUM',
          actionText: 'Atur Anggaran',
          actionTab: 'BUDGET',
        },
      ],
      generatedAt: new Date().toISOString(),
      disclaimer: 'Analisa & saran AI ini bersifat simulasi edukatif finansial personal.',
    };
  }
}
