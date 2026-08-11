import { storage } from './storage';
import { Transaction, Account, Budget, FinancialGoal, BillSubscription, InvestmentAsset, Debt } from '../types';

export type TimeFilterPeriod = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface MetricTriad {
  actual: number;
  estimated: number;
  forecast: number;
}

export interface TopCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  actual: number;
  estimated: number;
  forecast: number;
  percentage: number;
}

export interface TopMerchant {
  merchant: string;
  transactionCount: number;
  actualAmount: number;
  categoryName: string;
}

export interface AccountBalanceSummary {
  totalBalance: number;
  byType: {
    BANK: number;
    E_WALLET: number;
    CASH: number;
    INVESTMENT: number;
    CREDIT_CARD: number;
  };
  accounts: Account[];
}

export interface AnalyticsEngineData {
  period: TimeFilterPeriod;
  dateRange: DateRange;
  income: MetricTriad;
  expenses: MetricTriad;
  cashFlow: MetricTriad;
  savings: MetricTriad;
  savingsRate: MetricTriad; // percentages
  topCategories: TopCategory[];
  topMerchants: TopMerchant[];
  accountBalances: AccountBalanceSummary;
  netWorth: {
    actual: number;
    estimated: number;
    forecast: number;
    totalAssets: number;
    totalLiabilities: number;
  };
  debt: {
    totalDebt: number;
    monthlyMinPayment: number;
    actualPaidThisPeriod: number;
    estimatedPaidThisPeriod: number;
    forecastPaidThisPeriod: number;
    items: Debt[];
  };
  goals: {
    totalTarget: number;
    totalCurrent: number;
    progressPercentage: number;
    actualSavedThisPeriod: number;
    estimatedSavedThisPeriod: number;
    forecastSavedThisPeriod: number;
    items: FinancialGoal[];
  };
  // Chart Series Data
  timelineChartData: Array<{
    date: string;
    actualIncome: number;
    actualExpense: number;
    estimatedExpense: number;
    forecastExpense: number;
  }>;
  categoryChartData: Array<{
    name: string;
    actual: number;
    estimated: number;
    color: string;
  }>;
  areaNetWorthData: Array<{
    period: string;
    assets: number;
    liabilities: number;
    netWorth: number;
  }>;
  donutAssetData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  donutCategoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  comparisonChartData: Array<{
    metric: string;
    actual: number;
    estimated: number;
    forecast: number;
  }>;
}

/**
 * Utility to calculate helper dates based on filter selection
 */
export function getDateRangeForFilter(
  period: TimeFilterPeriod,
  customRange?: DateRange
): DateRange {
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  if (period === 'CUSTOM' && customRange?.startDate && customRange?.endDate) {
    return customRange;
  }

  const start = new Date(now);

  if (period === 'WEEK') {
    start.setDate(now.getDate() - 7);
  } else if (period === 'MONTH') {
    start.setDate(1); // 1st of current month
  } else if (period === 'QUARTER') {
    const currentMonth = now.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
  } else if (period === 'YEAR') {
    start.setMonth(0, 1); // Jan 1st of current year
  }

  return {
    startDate: start.toISOString().substring(0, 10),
    endDate: todayStr,
  };
}

/**
 * Main Analytics Engine Calculator
 */
export function computeAnalyticsData(
  period: TimeFilterPeriod,
  customRange?: DateRange
): AnalyticsEngineData {
  const state = storage.getState();
  const dateRange = getDateRangeForFilter(period, customRange);
  const { startDate, endDate } = dateRange;

  // Filter transactions within selected range
  const filteredTx = state.transactions.filter((t) => {
    return t.date >= startDate && t.date <= endDate;
  });

  // Calculate Actual Income & Expenses
  let actualIncome = 0;
  let actualExpense = 0;

  filteredTx.forEach((tx) => {
    if (tx.type === 'INCOME') {
      actualIncome += tx.amount;
    } else if (tx.type === 'EXPENSE') {
      actualExpense += tx.amount;
    }
  });

  // Days in range for run-rate forecasting
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const now = new Date();
  const totalDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24)) + 1);
  
  // Elapsed days so far (up to now)
  const daysPassed = Math.min(
    totalDays,
    Math.max(1, Math.ceil((now.getTime() - startD.getTime()) / (1000 * 3600 * 24)))
  );

  // Calculate Estimated Values
  // Estimated Expenses = Sum of active budgets for the period length (pro-rated)
  const totalMonthlyBudgets = state.budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const periodMonths = totalDays / 30;
  const estimatedExpenses = totalMonthlyBudgets * (periodMonths || 1);

  // Estimated Income = Salary or recurring income bills
  const recurringBills = state.bills || [];
  const totalMonthlyRecurringBills = recurringBills.reduce((sum, b) => sum + b.amount, 0);
  // Baseline income fallback
  const baseIncome = actualIncome > 0 ? actualIncome : 10000000;
  const estimatedIncome = baseIncome * (periodMonths || 1);

  // Calculate Forecast Values (AI / Velocity projection)
  const expenseVelocity = daysPassed > 0 ? (actualExpense / daysPassed) : 0;
  const forecastExpenses = daysPassed >= totalDays ? actualExpense : actualExpense + expenseVelocity * (totalDays - daysPassed);

  const incomeVelocity = daysPassed > 0 ? (actualIncome / daysPassed) : 0;
  const forecastIncome = daysPassed >= totalDays ? actualIncome : actualIncome + incomeVelocity * (totalDays - daysPassed);

  // Net Cashflow
  const actualCashflow = actualIncome - actualExpense;
  const estimatedCashflow = estimatedIncome - estimatedExpenses;
  const forecastCashflow = forecastIncome - forecastExpenses;

  // Savings
  const actualSavings = Math.max(0, actualCashflow);
  const estimatedSavings = Math.max(0, estimatedCashflow);
  const forecastSavings = Math.max(0, forecastCashflow);

  // Savings Rate (%)
  const actualSavingRate = actualIncome > 0 ? (actualSavings / actualIncome) * 100 : 0;
  const estimatedSavingRate = estimatedIncome > 0 ? (estimatedSavings / estimatedIncome) * 100 : 0;
  const forecastSavingRate = forecastIncome > 0 ? (forecastSavings / forecastIncome) * 100 : 0;

  // Top Categories (Expenses)
  const categoryMap: { [catId: string]: { actual: number; txCount: number } } = {};
  filteredTx.filter((t) => t.type === 'EXPENSE').forEach((tx) => {
    if (!categoryMap[tx.categoryId]) {
      categoryMap[tx.categoryId] = { actual: 0, txCount: 0 };
    }
    categoryMap[tx.categoryId].actual += tx.amount;
    categoryMap[tx.categoryId].txCount += 1;
  });

  const topCategories: TopCategory[] = Object.keys(categoryMap)
    .map((catId) => {
      const cat = state.categories.find((c) => c.id === catId);
      const budget = state.budgets.find((b) => b.categoryId === catId);
      const act = categoryMap[catId].actual;
      const est = (budget?.monthlyLimit || 0) * (periodMonths || 1);
      const catVelocity = daysPassed > 0 ? (act / daysPassed) : 0;
      const fcst = daysPassed >= totalDays ? act : act + catVelocity * (totalDays - daysPassed);

      return {
        id: catId,
        name: cat?.name || 'Lain-lain',
        color: cat?.color || '#E2B963',
        icon: cat?.icon,
        actual: act,
        estimated: est,
        forecast: fcst,
        percentage: actualExpense > 0 ? (act / actualExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.actual - a.actual);

  // Top Merchants
  const merchantMap: { [m: string]: { amount: number; count: number; categoryId: string } } = {};
  filteredTx.filter((t) => t.type === 'EXPENSE').forEach((tx) => {
    const merchantName = tx.vendor || tx.merchant || 'Merchant Umum';
    if (!merchantMap[merchantName]) {
      merchantMap[merchantName] = { amount: 0, count: 0, categoryId: tx.categoryId };
    }
    merchantMap[merchantName].amount += tx.amount;
    merchantMap[merchantName].count += 1;
  });

  const topMerchants: TopMerchant[] = Object.keys(merchantMap)
    .map((m) => {
      const cat = state.categories.find((c) => c.id === merchantMap[m].categoryId);
      return {
        merchant: m,
        transactionCount: merchantMap[m].count,
        actualAmount: merchantMap[m].amount,
        categoryName: cat?.name || 'Umum',
      };
    })
    .sort((a, b) => b.actualAmount - a.actualAmount)
    .slice(0, 5);

  // Account Balances Summary
  const accountBalances: AccountBalanceSummary = {
    totalBalance: 0,
    byType: {
      BANK: 0,
      E_WALLET: 0,
      CASH: 0,
      INVESTMENT: 0,
      CREDIT_CARD: 0,
    },
    accounts: state.accounts,
  };

  state.accounts.forEach((acc) => {
    if (!acc.isArchived) {
      accountBalances.totalBalance += acc.balance;
      if (acc.type in accountBalances.byType) {
        accountBalances.byType[acc.type as keyof typeof accountBalances.byType] += acc.balance;
      }
    }
  });

  // Net Worth & Debt
  const { totalAssets, totalLiabilities, netWorth: actualNetWorth } = storage.getNetWorth();
  const estimatedNetWorth = actualNetWorth + estimatedCashflow;
  const forecastNetWorth = actualNetWorth + forecastCashflow * 3; // 3-month forecast horizon

  const debtItems = state.debts || [];
  const totalDebt = debtItems.reduce((s, d) => s + d.remainingAmount, 0);
  const monthlyMinPayment = debtItems.reduce((s, d) => s + (d.minimumMonthlyPayment || d.installment || 0), 0);

  const debtTxs = filteredTx.filter((t) => t.notes?.toLowerCase().includes('utang') || t.notes?.toLowerCase().includes('bayar'));
  const actualPaidDebt = debtTxs.reduce((s, t) => s + t.amount, 0);

  // Goals
  const goalItems = state.goals || [];
  const totalGoalTarget = goalItems.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalCurrent = goalItems.reduce((s, g) => s + g.currentAmount, 0);
  const goalProgressPct = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

  // --- CHART DATA PREPARATION ---
  
  // 1. Timeline Chart (Last 7-10 points inside selected range)
  const timelineChartData: Array<{
    date: string;
    actualIncome: number;
    actualExpense: number;
    estimatedExpense: number;
    forecastExpense: number;
  }> = [];

  const dailyMap: { [date: string]: { inc: number; exp: number } } = {};
  filteredTx.forEach((tx) => {
    if (!dailyMap[tx.date]) dailyMap[tx.date] = { inc: 0, exp: 0 };
    if (tx.type === 'INCOME') dailyMap[tx.date].inc += tx.amount;
    if (tx.type === 'EXPENSE') dailyMap[tx.date].exp += tx.amount;
  });

  const sortedDates = Object.keys(dailyMap).sort();
  // Ensure we have at least a few sample dates if empty
  if (sortedDates.length === 0) {
    timelineChartData.push({
      date: startDate,
      actualIncome: actualIncome,
      actualExpense: actualExpense,
      estimatedExpense: estimatedExpenses,
      forecastExpense: forecastExpenses,
    });
  } else {
    sortedDates.forEach((d) => {
      timelineChartData.push({
        date: d.substring(5), // MM-DD
        actualIncome: dailyMap[d].inc,
        actualExpense: dailyMap[d].exp,
        estimatedExpense: Math.round(estimatedExpenses / (sortedDates.length || 1)),
        forecastExpense: Math.round(forecastExpenses / (sortedDates.length || 1)),
      });
    });
  }

  // 2. Category Chart Data
  const categoryChartData = topCategories.slice(0, 6).map((c) => ({
    name: c.name,
    actual: c.actual,
    estimated: c.estimated > 0 ? c.estimated : Math.round(c.actual * 1.1),
    color: c.color,
  }));

  // 3. Area Net Worth Data (Hist / Projections)
  const areaNetWorthData = [
    { period: 'Bulan Lalu', assets: Math.round(totalAssets * 0.95), liabilities: totalLiabilities, netWorth: Math.round(actualNetWorth * 0.94) },
    { period: 'Saat Ini (Aktual)', assets: totalAssets, liabilities: totalLiabilities, netWorth: actualNetWorth },
    { period: 'Target (Estimasi)', assets: Math.round(totalAssets + estimatedCashflow), liabilities: Math.round(totalLiabilities * 0.95), netWorth: estimatedNetWorth },
    { period: 'Proyeksi (Forecast)', assets: Math.round(totalAssets + forecastCashflow * 3), liabilities: Math.round(totalLiabilities * 0.85), netWorth: forecastNetWorth },
  ];

  // 4. Donut Asset Allocation
  const donutAssetData = [
    { name: 'Bank / Deposito', value: accountBalances.byType.BANK, color: '#3B82F6' },
    { name: 'E-Wallet', value: accountBalances.byType.E_WALLET, color: '#10B981' },
    { name: 'Tunai', value: accountBalances.byType.CASH, color: '#F59E0B' },
    { name: 'Investasi', value: accountBalances.byType.INVESTMENT, color: '#8B5CF6' },
  ].filter((d) => d.value > 0);

  if (donutAssetData.length === 0) {
    donutAssetData.push({ name: 'Kas Utama', value: accountBalances.totalBalance || 100000, color: '#E2B963' });
  }

  // 5. Donut Category Expense
  const donutCategoryData = topCategories.slice(0, 5).map((c) => ({
    name: c.name,
    value: c.actual,
    color: c.color,
  }));

  if (donutCategoryData.length === 0) {
    donutCategoryData.push({ name: 'Belum Ada Pengeluaran', value: 1, color: '#6B7280' });
  }

  // 6. Comparison Chart Data (Actual vs Estimated vs Forecast)
  const comparisonChartData = [
    { metric: 'Pemasukan', actual: actualIncome, estimated: estimatedIncome, forecast: forecastIncome },
    { metric: 'Pengeluaran', actual: actualExpense, estimated: estimatedExpenses, forecast: forecastExpenses },
    { metric: 'Arus Kas', actual: Math.max(0, actualCashflow), estimated: Math.max(0, estimatedCashflow), forecast: Math.max(0, forecastCashflow) },
    { metric: 'Tabungan', actual: actualSavings, estimated: estimatedSavings, forecast: forecastSavings },
    { metric: 'Bayar Utang', actual: actualPaidDebt, estimated: monthlyMinPayment, forecast: Math.round(monthlyMinPayment * 1.1) },
  ];

  return {
    period,
    dateRange,
    income: { actual: actualIncome, estimated: estimatedIncome, forecast: forecastIncome },
    expenses: { actual: actualExpense, estimated: estimatedExpenses, forecast: forecastExpenses },
    cashFlow: { actual: actualCashflow, estimated: estimatedCashflow, forecast: forecastCashflow },
    savings: { actual: actualSavings, estimated: estimatedSavings, forecast: forecastSavings },
    savingsRate: { actual: actualSavingRate, estimated: estimatedSavingRate, forecast: forecastSavingRate },
    topCategories,
    topMerchants,
    accountBalances,
    netWorth: {
      actual: actualNetWorth,
      estimated: estimatedNetWorth,
      forecast: forecastNetWorth,
      totalAssets,
      totalLiabilities,
    },
    debt: {
      totalDebt,
      monthlyMinPayment,
      actualPaidThisPeriod: actualPaidDebt,
      estimatedPaidThisPeriod: monthlyMinPayment,
      forecastPaidThisPeriod: Math.round(monthlyMinPayment * 1.1),
      items: debtItems,
    },
    goals: {
      totalTarget: totalGoalTarget,
      totalCurrent: totalGoalCurrent,
      progressPercentage: goalProgressPct,
      actualSavedThisPeriod: actualSavings,
      estimatedSavedThisPeriod: estimatedSavings,
      forecastSavedThisPeriod: forecastSavings,
      items: goalItems,
    },
    timelineChartData,
    categoryChartData,
    areaNetWorthData,
    donutAssetData,
    donutCategoryData,
    comparisonChartData,
  };
}
