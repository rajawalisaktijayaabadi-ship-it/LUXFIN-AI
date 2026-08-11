/**
 * LUXFIN AI - Deterministic Core Financial Calculation Engine
 * Guarantees precision decimal arithmetic, refund handling, transfer non-duplication,
 * budget tracking, net worth calculation, and user security context filtering.
 */

import {
  Account,
  Transaction,
  Budget,
  FinancialGoal,
  Debt,
  InvestmentAsset,
  TangibleAsset,
  Liability
} from '../types';
import { DecimalMath } from './decimalMath';
import { SecurityManager } from './securityManager';

export interface CashFlowSummary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  transferVolume: number;
  savings: number;
  savingRatePercentage: number;
}

export interface BudgetCalculatedUsage {
  budgetId: string;
  categoryId: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  isOverBudget: boolean;
  status: 'SAFE' | 'WARNING' | 'EXCEEDED';
}

export interface NetWorthBreakdown {
  liquidCash: number;
  investments: number;
  receivables: number;
  tangibleAssets: number;
  totalAssets: number;
  debtsOwed: number;
  otherLiabilities: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface CalculatedAccountBalance {
  accountId: string;
  accountName: string;
  initialBalance: number;
  computedBalance: number;
  totalIncomeCredits: number;
  totalExpenseDebits: number;
  totalTransferIn: number;
  totalTransferOut: number;
  totalRefunds: number;
  isNegative: boolean;
}

export class CoreFinanceEngine {
  /**
   * Deterministically calculates the current balance of a given account
   */
  public static calculateAccountBalance(
    account: Account,
    transactions: Transaction[],
    activeUserId: string
  ): CalculatedAccountBalance {
    SecurityManager.enforceOwnership(account, activeUserId, 'Account');

    const userTxs = SecurityManager.filterUserOwnedRecords(transactions, activeUserId)
      .filter((tx) => !tx.isDeleted && tx.status !== 'CANCELLED');

    let totalIncomeCredits = 0;
    let totalExpenseDebits = 0;
    let totalTransferIn = 0;
    let totalTransferOut = 0;
    let totalRefunds = 0;

    for (const tx of userTxs) {
      if (tx.status === 'REFUNDED' || tx.isRefund) {
        // Refund reverses previous impact
        if (tx.accountId === account.id) {
          if (tx.type === 'EXPENSE') {
            totalRefunds = DecimalMath.add(totalRefunds, tx.amount);
          } else if (tx.type === 'INCOME') {
            totalRefunds = DecimalMath.subtract(totalRefunds, tx.amount);
          }
        }
        continue;
      }

      if (tx.status !== 'COMPLETED') continue;

      // Primary account debits/credits
      if (tx.accountId === account.id) {
        if (tx.type === 'INCOME') {
          totalIncomeCredits = DecimalMath.add(totalIncomeCredits, tx.amount);
        } else if (tx.type === 'EXPENSE') {
          totalExpenseDebits = DecimalMath.add(totalExpenseDebits, tx.amount);
        } else if (tx.type === 'TRANSFER') {
          totalTransferOut = DecimalMath.add(totalTransferOut, tx.amount);
        }
      }

      // Transfer target account credits
      if (tx.type === 'TRANSFER' && tx.targetAccountId === account.id) {
        totalTransferIn = DecimalMath.add(totalTransferIn, tx.amount);
      }
    }

    const initial = account.initialBalance ?? account.balance;
    const computedBalance = DecimalMath.add(
      DecimalMath.subtract(
        DecimalMath.add(initial, totalIncomeCredits),
        totalExpenseDebits
      ),
      DecimalMath.add(
        DecimalMath.subtract(totalTransferIn, totalTransferOut),
        totalRefunds
      )
    );

    return {
      accountId: account.id,
      accountName: account.name,
      initialBalance: initial,
      computedBalance,
      totalIncomeCredits,
      totalExpenseDebits,
      totalTransferIn,
      totalTransferOut,
      totalRefunds,
      isNegative: computedBalance < 0,
    };
  }

  /**
   * Deterministically calculates Cash Flow for a specified period or all-time
   */
  public static calculateCashFlow(
    transactions: Transaction[],
    activeUserId: string,
    periodYYYYMM?: string
  ): CashFlowSummary {
    const userTxs = SecurityManager.filterUserOwnedRecords(transactions, activeUserId)
      .filter((tx) => !tx.isDeleted && tx.status === 'COMPLETED');

    let totalIncome = 0;
    let totalExpense = 0;
    let transferVolume = 0;

    for (const tx of userTxs) {
      if (periodYYYYMM && !tx.date.startsWith(periodYYYYMM)) continue;

      if (tx.type === 'INCOME') {
        totalIncome = DecimalMath.add(totalIncome, tx.amount);
      } else if (tx.type === 'EXPENSE') {
        totalExpense = DecimalMath.add(totalExpense, tx.amount);
      } else if (tx.type === 'TRANSFER') {
        transferVolume = DecimalMath.add(transferVolume, tx.amount);
      }
    }

    const netCashFlow = DecimalMath.subtract(totalIncome, totalExpense);
    const savings = netCashFlow > 0 ? netCashFlow : 0;
    const savingRatePercentage = DecimalMath.percentage(savings, totalIncome);

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      transferVolume,
      savings,
      savingRatePercentage,
    };
  }

  /**
   * Deterministically calculates Budget Usage for all user budgets
   */
  public static calculateBudgetUsage(
    budgets: Budget[],
    transactions: Transaction[],
    activeUserId: string,
    periodYYYYMM: string
  ): BudgetCalculatedUsage[] {
    const userBudgets = SecurityManager.filterUserOwnedRecords(budgets, activeUserId);
    const userTxs = SecurityManager.filterUserOwnedRecords(transactions, activeUserId)
      .filter((tx) => !tx.isDeleted && tx.status === 'COMPLETED' && tx.type === 'EXPENSE' && tx.date.startsWith(periodYYYYMM));

    return userBudgets.map((bgt) => {
      const categoryTxs = userTxs.filter((tx) => tx.categoryId === bgt.categoryId);
      const spent = DecimalMath.sum(categoryTxs.map((tx) => tx.amount));
      const remaining = DecimalMath.subtract(bgt.monthlyLimit, spent);
      const usagePercentage = DecimalMath.percentage(spent, bgt.monthlyLimit);
      const isOverBudget = spent > bgt.monthlyLimit;

      let status: 'SAFE' | 'WARNING' | 'EXCEEDED' = 'SAFE';
      if (usagePercentage >= 100) {
        status = 'EXCEEDED';
      } else if (usagePercentage >= 80) {
        status = 'WARNING';
      }

      return {
        budgetId: bgt.id,
        categoryId: bgt.categoryId,
        monthlyLimit: bgt.monthlyLimit,
        spent,
        remaining,
        usagePercentage,
        isOverBudget,
        status,
      };
    });
  }

  /**
   * Deterministically calculates Financial Goal Progress
   */
  public static calculateGoalProgress(
    goal: FinancialGoal,
    activeUserId: string
  ): {
    currentAmount: number;
    targetAmount: number;
    remainingAmount: number;
    progressPercentage: number;
    isCompleted: boolean;
  } {
    SecurityManager.enforceOwnership(goal, activeUserId, 'Goal');

    let current = goal.currentAmount;
    if (goal.contributions && goal.contributions.length > 0) {
      const totalContributed = DecimalMath.sum(goal.contributions.map((c) => c.amount));
      current = Math.max(current, totalContributed);
    }

    const remainingAmount = Math.max(0, DecimalMath.subtract(goal.targetAmount, current));
    const progressPercentage = DecimalMath.percentage(current, goal.targetAmount);

    return {
      currentAmount: current,
      targetAmount: goal.targetAmount,
      remainingAmount,
      progressPercentage,
      isCompleted: current >= goal.targetAmount,
    };
  }

  /**
   * Deterministically calculates Debt Summary & Payments
   */
  public static calculateDebtSummary(
    debts: Debt[],
    activeUserId: string
  ): {
    totalDebtOwed: number;
    totalReceivable: number;
    clearedDebtsCount: number;
    activeDebtsCount: number;
  } {
    const userDebts = SecurityManager.filterUserOwnedRecords(debts, activeUserId);

    let totalDebtOwed = 0;
    let totalReceivable = 0;
    let clearedDebtsCount = 0;
    let activeDebtsCount = 0;

    for (const dbt of userDebts) {
      const totalPaid = DecimalMath.sum(dbt.payments?.map((p) => p.amount) || []);
      const remaining = Math.max(0, DecimalMath.subtract(dbt.originalAmount, totalPaid));

      if (remaining === 0 || dbt.isCleared) {
        clearedDebtsCount++;
      } else {
        activeDebtsCount++;
        if (dbt.type === 'DEBT_OWED') {
          totalDebtOwed = DecimalMath.add(totalDebtOwed, remaining);
        } else {
          totalReceivable = DecimalMath.add(totalReceivable, remaining);
        }
      }
    }

    return {
      totalDebtOwed,
      totalReceivable,
      clearedDebtsCount,
      activeDebtsCount,
    };
  }

  /**
   * Deterministically calculates Net Worth
   */
  public static calculateNetWorth(
    accounts: Account[],
    transactions: Transaction[],
    investments: InvestmentAsset[],
    debts: Debt[],
    tangibleAssets: TangibleAsset[] = [],
    liabilities: Liability[] = [],
    activeUserId: string
  ): NetWorthBreakdown {
    const userAccounts = SecurityManager.filterUserOwnedRecords(accounts, activeUserId)
      .filter((acc) => !acc.isArchived && !acc.isExcludedFromNetWorth);

    // Compute live balance for cash accounts
    let liquidCash = 0;
    for (const acc of userAccounts) {
      const calcAcc = CoreFinanceEngine.calculateAccountBalance(acc, transactions, activeUserId);
      liquidCash = DecimalMath.add(liquidCash, calcAcc.computedBalance);
    }

    // Investments
    const userInvestments = SecurityManager.filterUserOwnedRecords(investments, activeUserId);
    const totalInvestments = DecimalMath.sum(
      userInvestments.map((inv) => DecimalMath.multiply(inv.units, inv.currentPrice))
    );

    // Debt & Receivables
    const debtSummary = CoreFinanceEngine.calculateDebtSummary(debts, activeUserId);

    // Tangible Assets
    const userTangible = SecurityManager.filterUserOwnedRecords(tangibleAssets, activeUserId);
    const totalTangible = DecimalMath.sum(userTangible.map((ast) => ast.estimatedValue));

    // Other Liabilities
    const userLiabilities = SecurityManager.filterUserOwnedRecords(liabilities, activeUserId);
    const totalOtherLiabilities = DecimalMath.sum(userLiabilities.map((l) => l.totalOwed));

    const totalAssets = DecimalMath.sum([
      liquidCash,
      totalInvestments,
      debtSummary.totalReceivable,
      totalTangible,
    ]);

    const totalLiabilities = DecimalMath.add(
      debtSummary.totalDebtOwed,
      totalOtherLiabilities
    );

    const netWorth = DecimalMath.subtract(totalAssets, totalLiabilities);

    return {
      liquidCash,
      investments: totalInvestments,
      receivables: debtSummary.totalReceivable,
      tangibleAssets: totalTangible,
      totalAssets,
      debtsOwed: debtSummary.totalDebtOwed,
      otherLiabilities: totalOtherLiabilities,
      totalLiabilities,
      netWorth,
    };
  }
}
