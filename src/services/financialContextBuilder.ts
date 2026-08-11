import { StructuredFinancialContext } from '../types';
import { storage, AppState } from '../utils/storage';
import { FinancialEngineService } from './financialEngineService';
import { addRp, subRp } from '../utils/decimalMath';

export class FinancialContextBuilder {
  /**
   * Constructs a secure, structured financial context object.
   * Strips raw credentials, full account numbers, and unneeded raw database noise.
   */
  static buildContext(providedState?: Partial<AppState>): StructuredFinancialContext {
    const state = { ...storage.getState(), ...providedState };

    const userProfile = {
      userName: state.user?.name || 'Pengguna LUXFIN',
      currency: state.user?.preferredCurrency || 'IDR',
      plan: state.license?.plan || 'LUX_ENTERPRISE',
    };

    // Account Summary (Masking Sensitive IDs/Numbers)
    const activeAccounts = (state.accounts || []).filter((a) => !a.isArchived);
    const totalAccounts = activeAccounts.length;
    const totalAccountBalance = activeAccounts
      .filter((a) => !a.isExcludedFromNetWorth)
      .reduce((sum, a) => addRp(sum, a.balance), 0);

    const accountList = activeAccounts.map((a) => ({
      name: a.name,
      type: a.type,
      balance: a.balance,
    }));

    // Cashflow Summary (Current Month)
    const currentYM = new Date().toISOString().substring(0, 7);
    const cashflow = FinancialEngineService.calculateMonthlyCashflow(state.transactions || [], currentYM);
    const savingsRate = cashflow.income > 0 ? Math.max(0, ((cashflow.income - cashflow.expense) / cashflow.income) * 100) : 0;

    // Category Spending Breakdown
    const monthTxs = (state.transactions || []).filter((t) => t.date && t.date.startsWith(currentYM) && t.type === 'EXPENSE' && !t.isDeleted);
    const categoryMap: Record<string, number> = {};
    let totalMonthExpense = 0;

    const categoriesMap = new Map((state.categories || []).map((c) => [c.id, c.name]));

    for (const tx of monthTxs) {
      const catName = categoriesMap.get(tx.categoryId) || 'Lain-lain';
      categoryMap[catName] = addRp(categoryMap[catName] || 0, tx.amount);
      totalMonthExpense = addRp(totalMonthExpense, tx.amount);
    }

    const categorySpending = Object.entries(categoryMap).map(([catName, amount]) => ({
      categoryName: catName,
      amount,
      percentage: totalMonthExpense > 0 ? Math.round((amount / totalMonthExpense) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Budget Summary
    const budgets = state.budgets || [];
    let overBudgetCount = 0;
    const budgetItems = budgets.map((b) => {
      const catName = categoriesMap.get(b.categoryId) || 'Kategori';
      const remaining = subRp(b.monthlyLimit, b.spent);
      if (b.spent > b.monthlyLimit) overBudgetCount++;
      return {
        category: catName,
        limit: b.monthlyLimit,
        spent: b.spent,
        remaining,
      };
    });

    // Goal Summary
    const goals = state.goals || [];
    const goalItems = goals.map((g) => {
      const progressPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      return {
        title: g.title,
        target: g.targetAmount,
        current: g.currentAmount,
        deadline: g.targetDate,
        progressPct,
      };
    });

    // Bills & Subscriptions
    const bills = state.bills || [];
    const subscriptions = bills.filter((b) => b.type === 'SUBSCRIPTION' && b.status === 'ACTIVE');
    const upcomingBills = bills.filter((b) => b.type === 'BILL' && b.status === 'ACTIVE');

    const totalMonthlyBillsCost = upcomingBills.reduce((sum, b) => addRp(sum, b.amount), 0);
    const totalMonthlySubscriptionCost = subscriptions.reduce((sum, b) => addRp(sum, b.amount), 0);

    const subList = subscriptions.map((s) => ({
      name: s.name,
      price: s.amount,
      frequency: s.billingCycle || 'MONTHLY',
    }));

    // Debt & Liabilities
    const debts = state.debts || [];
    const owedDebts = debts.filter((d) => d.type === 'DEBT_OWED' && d.remainingAmount > 0 && !d.isCleared);
    const receivables = debts.filter((d) => d.type === 'RECEIVABLE' && d.remainingAmount > 0 && !d.isCleared);

    const totalOwed = owedDebts.reduce((sum, d) => addRp(sum, d.remainingAmount), 0);
    const totalReceivables = receivables.reduce((sum, d) => addRp(sum, d.remainingAmount), 0);

    const debtList = owedDebts.map((d) => ({
      name: d.personOrInstitution || d.category || 'Pinjaman',
      remaining: d.remainingAmount,
      interestRate: d.interestRateAnnual,
      minPayment: d.minimumMonthlyPayment || Math.round(d.remainingAmount * 0.05),
    }));

    // Investment Summary
    const investments = state.investments || [];
    const totalInvValue = investments.reduce((sum, i) => addRp(sum, i.totalValue), 0);
    const totalInvCost = investments.reduce((sum, i) => addRp(sum, i.totalPurchaseValue || i.averageBuyPrice * i.units), 0);
    const totalInvGainLoss = subRp(totalInvValue, totalInvCost);
    const totalInvGainLossPct = totalInvCost > 0 ? Math.round((totalInvGainLoss / totalInvCost) * 100) : 0;

    const allocMap: Record<string, number> = {};
    for (const inv of investments) {
      allocMap[inv.category] = addRp(allocMap[inv.category] || 0, inv.totalValue);
    }

    const assetAllocations = Object.entries(allocMap).map(([assetClass, val]) => ({
      assetClass,
      totalValue: val,
      percentage: totalInvValue > 0 ? Math.round((val / totalInvValue) * 100) : 0,
    }));

    // Net Worth Calculation
    const netWorthData = FinancialEngineService.calculateNetWorth(activeAccounts, investments, debts);

    // Historical Trends (Last 3 Months)
    const recentMonths: { month: string; income: number; expense: number; netWorth: number }[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().substring(0, 7);
      const monthFlow = FinancialEngineService.calculateMonthlyCashflow(state.transactions || [], ym);
      recentMonths.push({
        month: ym,
        income: monthFlow.income,
        expense: monthFlow.expense,
        netWorth: netWorthData.netWorth,
      });
    }

    return {
      userProfile,
      accountSummary: {
        totalAccounts,
        totalBalance: totalAccountBalance,
        accounts: accountList,
      },
      cashflowSummary: {
        monthlyIncome: cashflow.income,
        monthlyExpense: cashflow.expense,
        netCashflow: cashflow.netCashflow,
        savingsRate: Math.round(savingsRate),
      },
      categorySpending,
      budgetSummary: {
        totalBudgets: budgets.length,
        overBudgetCount,
        items: budgetItems,
      },
      goalSummary: {
        totalGoals: goals.length,
        items: goalItems,
      },
      billSubscriptionSummary: {
        upcomingBillsCount: upcomingBills.length,
        totalMonthlyBillsCost,
        subscriptionsCount: subscriptions.length,
        totalMonthlySubscriptionCost,
        subscriptions: subList,
      },
      debtSummary: {
        totalOwed,
        totalReceivables,
        debtCount: owedDebts.length,
        debts: debtList,
      },
      investmentSummary: {
        totalValue: totalInvValue,
        totalGainLoss: totalInvGainLoss,
        totalGainLossPct: totalInvGainLossPct,
        assetAllocations,
      },
      netWorthSummary: {
        totalAssets: netWorthData.totalAssets,
        totalLiabilities: netWorthData.totalLiabilities,
        netWorth: netWorthData.netWorth,
      },
      historicalTrends: {
        recentMonths,
      },
    };
  }
}
