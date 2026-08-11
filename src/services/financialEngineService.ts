import { Account, Transaction, Debt, InvestmentAsset, FinancialGoal, Budget, FinancialHealthScore } from '../types';
import { addRp, subRp, roundRp, percentOf } from '../utils/decimalMath';

export class FinancialEngineService {
  /**
   * Calculates Net Worth (Total Assets - Total Liabilities)
   */
  static calculateNetWorth(
    accounts: Account[],
    investments: InvestmentAsset[],
    debts: Debt[]
  ): { totalAssets: number; totalLiabilities: number; netWorth: number } {
    const totalLiquidAssets = accounts
      .filter((a) => !a.isExcludedFromNetWorth)
      .reduce((sum, a) => addRp(sum, a.balance), 0);

    const totalInvestmentAssets = investments.reduce(
      (sum, i) => addRp(sum, i.totalValue),
      0
    );

    const totalReceivables = debts
      .filter((d) => d.type === 'RECEIVABLE')
      .reduce((sum, d) => addRp(sum, d.remainingAmount), 0);

    const totalAssets = addRp(totalLiquidAssets, totalInvestmentAssets, totalReceivables);

    const totalLiabilities = debts
      .filter((d) => d.type === 'DEBT_OWED')
      .reduce((sum, d) => addRp(sum, d.remainingAmount), 0);

    const netWorth = subRp(totalAssets, totalLiabilities);

    return { totalAssets, totalLiabilities, netWorth };
  }

  /**
   * Calculates Monthly Income, Expense, and Net Cashflow
   */
  static calculateMonthlyCashflow(
    transactions: Transaction[],
    yearMonthStr?: string
  ): { income: number; expense: number; netCashflow: number } {
    const currentYM = yearMonthStr || new Date().toISOString().substring(0, 7);

    const monthTxs = transactions.filter((t) => t.date && t.date.startsWith(currentYM));

    const income = monthTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => addRp(sum, t.amount), 0);

    const expense = monthTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => addRp(sum, t.amount), 0);

    const netCashflow = subRp(income, expense);

    return { income, expense, netCashflow };
  }

  /**
   * Calculates Financial Health Score (0-100 & Grade S-F)
   */
  static calculateFinancialHealthScore(
    income: number,
    expense: number,
    netWorth: number,
    liquidAssets: number,
    debtsOwed: number,
    budgets: Budget[]
  ): FinancialHealthScore {
    // 1. Savings Rate (Target: >= 20% of income)
    const savings = subRp(income, expense);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const savingsRateScore = Math.min(25, Math.max(0, Math.round((savingsRate / 20) * 25)));

    // 2. Emergency Fund Ratio (Target: 6x monthly expenses)
    const emergencyMonths = expense > 0 ? liquidAssets / expense : 6;
    const emergencyFundScore = Math.min(25, Math.max(0, Math.round((emergencyMonths / 6) * 25)));

    // 3. Debt to Income Ratio (Target: <= 30% of income)
    const debtRatio = income > 0 ? (debtsOwed / (income * 12)) * 100 : 0;
    const debtRatioScore = debtRatio === 0 ? 25 : Math.max(0, Math.round(25 - (debtRatio / 50) * 25));

    // 4. Budget Adherence (Target: 100% within limits)
    let totalAdherencePct = 100;
    if (budgets.length > 0) {
      const overBudgets = budgets.filter((b) => b.spent > b.monthlyLimit).length;
      totalAdherencePct = Math.max(0, 100 - (overBudgets / budgets.length) * 50);
    }
    const budgetAdherenceScore = Math.round((totalAdherencePct / 100) * 25);

    const score = Math.min(100, savingsRateScore + emergencyFundScore + debtRatioScore + budgetAdherenceScore);

    let grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (score >= 90) grade = 'S';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    else grade = 'F';

    const recommendations: string[] = [];
    if (savingsRate < 20) {
      recommendations.push(`Tingkatkan rasio tabungan bulanan (saat ini ${savingsRate.toFixed(1)}%, target ideal minimal 20%).`);
    }
    if (emergencyMonths < 6) {
      recommendations.push(`Dana darurat baru mencukupi ${emergencyMonths.toFixed(1)} bulan pengeluaran. Targetkan 6 bulan (${Math.round(expense * 6 / 1_000_000)}jt).`);
    }
    if (debtsOwed > 0) {
      recommendations.push('Gunakan metode Avalanche untuk melunasi utang berbunga tertinggi terlebih dahulu.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Kondisi finansial Anda sangat prima! Pertahankan alokasi investasi bulanan Anda.');
    }

    return {
      score,
      grade,
      summary: `Skor Kesehatan Finansial Anda adalah ${score}/100 (Kategori ${grade}).`,
      metrics: {
        savingsRateScore,
        emergencyFundScore,
        debtRatioScore,
        budgetAdherenceScore,
        investmentRatioScore: 20,
      },
      recommendations,
    };
  }

  /**
   * Sorts debts according to Avalanche or Snowball strategy
   */
  static calculateDebtStrategy(debts: Debt[], strategy: 'AVALANCHE' | 'SNOWBALL'): Debt[] {
    const owedList = debts.filter((d) => d.type === 'DEBT_OWED' && d.remainingAmount > 0);
    if (strategy === 'AVALANCHE') {
      // Highest interest rate first
      return [...owedList].sort((a, b) => b.interestRateAnnual - a.interestRateAnnual);
    } else {
      // Smallest remaining balance first
      return [...owedList].sort((a, b) => a.remainingAmount - b.remainingAmount);
    }
  }
}
