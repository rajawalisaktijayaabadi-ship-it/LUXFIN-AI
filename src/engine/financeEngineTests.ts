/**
 * LUXFIN AI - Financial Engine Unit Test Suite
 * Automated deterministic tests for arithmetic accuracy, refunds, transfers,
 * budget tracking, net worth, debt calculations, and multi-tenant security isolation.
 */

import { CoreFinanceEngine } from './financeEngine';
import { DecimalMath } from './decimalMath';
import { SecurityManager, SecurityViolationError } from './securityManager';
import { Account, Transaction, Budget, FinancialGoal, Debt, InvestmentAsset } from '../types';

export interface TestCaseResult {
  id: string;
  category: 'ARITHMETIC' | 'REFUNDS' | 'TRANSFERS' | 'BUDGETS' | 'NET_WORTH' | 'SECURITY';
  name: string;
  description: string;
  passed: boolean;
  actual: any;
  expected: any;
  durationMs: number;
  errorMessage?: string;
}

export class FinanceEngineTestSuite {
  public static runAllTests(): TestCaseResult[] {
    const results: TestCaseResult[] = [];

    // Test 1: Decimal Math Precision
    results.push(FinanceEngineTestSuite.testDecimalPrecision());

    // Test 2: Account Balance Calculation
    results.push(FinanceEngineTestSuite.testAccountBalance());

    // Test 3: Refund and Reversed Transactions
    results.push(FinanceEngineTestSuite.testRefundHandling());

    // Test 4: Internal Transfers Non-Duplication
    results.push(FinanceEngineTestSuite.testTransferNonDuplication());

    // Test 5: Negative Balances
    results.push(FinanceEngineTestSuite.testNegativeBalances());

    // Test 6: Cash Flow & Saving Rate
    results.push(FinanceEngineTestSuite.testCashFlowAndSavingRate());

    // Test 7: Budget Usage Calculation
    results.push(FinanceEngineTestSuite.testBudgetUsage());

    // Test 8: Goal Progress Calculation
    results.push(FinanceEngineTestSuite.testGoalProgress());

    // Test 9: Debt Balance & Payments
    results.push(FinanceEngineTestSuite.testDebtBalance());

    // Test 10: Net Worth Breakdown Formula
    results.push(FinanceEngineTestSuite.testNetWorthCalculation());

    // Test 11: Multi-Tenant Data Security Isolation (Valid Ownership)
    results.push(FinanceEngineTestSuite.testUserSecurityIsolationSuccess());

    // Test 12: Multi-Tenant Data Security Isolation Violation Trap
    results.push(FinanceEngineTestSuite.testUserSecurityIsolationViolationTrap());

    return results;
  }

  private static testDecimalPrecision(): TestCaseResult {
    const start = performance.now();
    const a = 0.1;
    const b = 0.2;
    const sum = DecimalMath.add(a, b);
    const expected = 0.3;
    const passed = sum === expected;

    return {
      id: 'tc_01',
      category: 'ARITHMETIC',
      name: '01. Decimal Precision (Floating-Point Drift Prevention)',
      description: 'Verifies that 0.1 + 0.2 equals exactly 0.3 without 0.30000000000000004 IEEE-754 drift.',
      passed,
      actual: sum,
      expected,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testAccountBalance(): TestCaseResult {
    const start = performance.now();
    const account: Account = {
      id: 'acc_test_1',
      userId: 'usr_test',
      name: 'Test Account',
      type: 'BANK',
      provider: 'Test Bank',
      balance: 1000000,
      initialBalance: 1000000,
      color: '#000',
      icon: 'Landmark',
    };

    const txs: Transaction[] = [
      {
        id: 'tx_1',
        userId: 'usr_test',
        type: 'INCOME',
        amount: 500000,
        accountId: 'acc_test_1',
        categoryId: 'cat_1',
        status: 'COMPLETED',
        date: '2026-08-01',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 200000,
        accountId: 'acc_test_1',
        categoryId: 'cat_2',
        status: 'COMPLETED',
        date: '2026-08-02',
        createdAt: new Date().toISOString(),
      },
    ];

    const result = CoreFinanceEngine.calculateAccountBalance(account, txs, 'usr_test');
    const expected = 1300000; // 1,000,000 + 500,000 - 200,000
    const passed = result.computedBalance === expected;

    return {
      id: 'tc_02',
      category: 'ARITHMETIC',
      name: '02. Deterministic Account Balance Calculation',
      description: 'Verifies initial balance plus income minus expense computes 1,300,000.',
      passed,
      actual: result.computedBalance,
      expected,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testRefundHandling(): TestCaseResult {
    const start = performance.now();
    const account: Account = {
      id: 'acc_refund_1',
      userId: 'usr_test',
      name: 'Refund Bank',
      type: 'BANK',
      provider: 'BCA',
      balance: 5000000,
      initialBalance: 5000000,
      color: '#000',
      icon: 'Landmark',
    };

    const txs: Transaction[] = [
      {
        id: 'tx_exp_orig',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 1000000,
        accountId: 'acc_refund_1',
        categoryId: 'cat_shop',
        status: 'COMPLETED',
        date: '2026-08-01',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_exp_refund',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 1000000,
        accountId: 'acc_refund_1',
        categoryId: 'cat_shop',
        status: 'REFUNDED',
        isRefund: true,
        parentTransactionId: 'tx_exp_orig',
        date: '2026-08-03',
        createdAt: new Date().toISOString(),
      },
    ];

    const result = CoreFinanceEngine.calculateAccountBalance(account, txs, 'usr_test');
    // 5,000,000 - 1,000,000 + 1,000,000 (refund) = 5,000,000
    const expected = 5000000;
    const passed = result.computedBalance === expected;

    return {
      id: 'tc_03',
      category: 'REFUNDS',
      name: '03. Refund & Reversed Transaction Reversal',
      description: 'Verifies that a refunded expense transaction credits back the exact monetary amount.',
      passed,
      actual: result.computedBalance,
      expected,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testTransferNonDuplication(): TestCaseResult {
    const start = performance.now();
    const txs: Transaction[] = [
      {
        id: 'tx_inc',
        userId: 'usr_test',
        type: 'INCOME',
        amount: 10000000,
        accountId: 'acc_bank',
        categoryId: 'cat_gaji',
        status: 'COMPLETED',
        date: '2026-08-01',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_trf',
        userId: 'usr_test',
        type: 'TRANSFER',
        amount: 3000000,
        accountId: 'acc_bank',
        targetAccountId: 'acc_wallet',
        categoryId: 'cat_transfer',
        status: 'COMPLETED',
        date: '2026-08-02',
        createdAt: new Date().toISOString(),
      },
    ];

    const cashFlow = CoreFinanceEngine.calculateCashFlow(txs, 'usr_test');
    // Income should be 10,000,000. Transfer 3,000,000 should NOT increase income or expense!
    const passed = cashFlow.totalIncome === 10000000 && cashFlow.totalExpense === 0 && cashFlow.transferVolume === 3000000;

    return {
      id: 'tc_04',
      category: 'TRANSFERS',
      name: '04. Transfer Non-Duplication Protection',
      description: 'Verifies internal account transfers do not contaminate Income or Expense totals.',
      passed,
      actual: { income: cashFlow.totalIncome, expense: cashFlow.totalExpense, transfer: cashFlow.transferVolume },
      expected: { income: 10000000, expense: 0, transfer: 3000000 },
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testNegativeBalances(): TestCaseResult {
    const start = performance.now();
    const account: Account = {
      id: 'acc_overdraft',
      userId: 'usr_test',
      name: 'Credit Card Account',
      type: 'CREDIT_CARD',
      provider: 'BCA Visa',
      balance: 0,
      initialBalance: 0,
      color: '#000',
      icon: 'CreditCard',
    };

    const txs: Transaction[] = [
      {
        id: 'tx_cc_1',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 1500000,
        accountId: 'acc_overdraft',
        categoryId: 'cat_gadget',
        status: 'COMPLETED',
        date: '2026-08-01',
        createdAt: new Date().toISOString(),
      },
    ];

    const result = CoreFinanceEngine.calculateAccountBalance(account, txs, 'usr_test');
    const expected = -1500000;
    const passed = result.computedBalance === expected && result.isNegative === true;

    return {
      id: 'tc_05',
      category: 'ARITHMETIC',
      name: '05. Negative Balance / Overdraft Handling',
      description: 'Verifies credit card or overdrawn accounts reflect negative balances accurately.',
      passed,
      actual: result.computedBalance,
      expected,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testCashFlowAndSavingRate(): TestCaseResult {
    const start = performance.now();
    const txs: Transaction[] = [
      {
        id: 'tx_inc_1',
        userId: 'usr_test',
        type: 'INCOME',
        amount: 20000000,
        accountId: 'acc_1',
        categoryId: 'cat_gaji',
        status: 'COMPLETED',
        date: '2026-08-01',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tx_exp_1',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 12000000,
        accountId: 'acc_1',
        categoryId: 'cat_makan',
        status: 'COMPLETED',
        date: '2026-08-05',
        createdAt: new Date().toISOString(),
      },
    ];

    const cashFlow = CoreFinanceEngine.calculateCashFlow(txs, 'usr_test');
    // Net = 8,000,000. Saving Rate = (8,000,000 / 20,000,000) * 100 = 40%
    const expectedSavings = 8000000;
    const expectedRate = 40;
    const passed = cashFlow.savings === expectedSavings && cashFlow.savingRatePercentage === expectedRate;

    return {
      id: 'tc_06',
      category: 'ARITHMETIC',
      name: '06. Net Cash Flow & Saving Rate Formula',
      description: 'Verifies savings (8M) and saving rate (40%) calculated from 20M Income and 12M Expense.',
      passed,
      actual: { savings: cashFlow.savings, rate: cashFlow.savingRatePercentage },
      expected: { savings: expectedSavings, rate: expectedRate },
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testBudgetUsage(): TestCaseResult {
    const start = performance.now();
    const budgets: Budget[] = [
      {
        id: 'bgt_food',
        userId: 'usr_test',
        categoryId: 'cat_food',
        monthlyLimit: 3000000,
        spent: 0,
        period: '2026-08',
      },
    ];

    const txs: Transaction[] = [
      {
        id: 'tx_f1',
        userId: 'usr_test',
        type: 'EXPENSE',
        amount: 2700000,
        accountId: 'acc_1',
        categoryId: 'cat_food',
        status: 'COMPLETED',
        date: '2026-08-10',
        createdAt: new Date().toISOString(),
      },
    ];

    const usages = CoreFinanceEngine.calculateBudgetUsage(budgets, txs, 'usr_test', '2026-08');
    const u = usages[0];
    // Spent: 2,700,000. Usage: 90%. Status: WARNING
    const passed = u.spent === 2700000 && u.usagePercentage === 90 && u.status === 'WARNING';

    return {
      id: 'tc_07',
      category: 'BUDGETS',
      name: '07. Budget Usage & Threshold Status',
      description: 'Verifies budget usage (90%) triggers WARNING threshold correctly when spent reaches 2.7M of 3M.',
      passed,
      actual: { spent: u.spent, percentage: u.usagePercentage, status: u.status },
      expected: { spent: 2700000, percentage: 90, status: 'WARNING' },
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testGoalProgress(): TestCaseResult {
    const start = performance.now();
    const goal: FinancialGoal = {
      id: 'goal_test',
      userId: 'usr_test',
      title: 'Emergency Fund',
      targetAmount: 50000000,
      currentAmount: 20000000,
      targetDate: '2026-12-31',
      category: 'EMERGENCY_FUND',
      icon: 'Shield',
      contributions: [
        { id: 'gc_1', goalId: 'goal_test', userId: 'usr_test', accountId: 'acc_1', amount: 15000000, date: '2026-07-01' },
        { id: 'gc_2', goalId: 'goal_test', userId: 'usr_test', accountId: 'acc_1', amount: 10000000, date: '2026-08-01' },
      ],
    };

    const progress = CoreFinanceEngine.calculateGoalProgress(goal, 'usr_test');
    // Total contributions = 25,000,000. Progress = 50%
    const passed = progress.currentAmount === 25000000 && progress.progressPercentage === 50 && progress.remainingAmount === 25000000;

    return {
      id: 'tc_08',
      category: 'ARITHMETIC',
      name: '08. Financial Goal Progress & Contributions',
      description: 'Verifies goal progress percentage (50%) from total contributions (25M of 50M).',
      passed,
      actual: { current: progress.currentAmount, percentage: progress.progressPercentage },
      expected: { current: 25000000, percentage: 50 },
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testDebtBalance(): TestCaseResult {
    const start = performance.now();
    const debts: Debt[] = [
      {
        id: 'debt_kpr',
        userId: 'usr_test',
        personOrInstitution: 'Bank KPR',
        type: 'DEBT_OWED',
        originalAmount: 100000000,
        remainingAmount: 100000000,
        interestRateAnnual: 5,
        minimumMonthlyPayment: 2000000,
        payments: [
          { id: 'p1', debtId: 'debt_kpr', userId: 'usr_test', accountId: 'acc_1', amount: 20000000, date: '2026-07-01' },
        ],
      },
    ];

    const summary = CoreFinanceEngine.calculateDebtSummary(debts, 'usr_test');
    // Remaining = 100,000,000 - 20,000,000 = 80,000,000
    const passed = summary.totalDebtOwed === 80000000;

    return {
      id: 'tc_09',
      category: 'ARITHMETIC',
      name: '09. Debt Remaining Balance & Payment Deduction',
      description: 'Verifies debt payments subtract cleanly from original principal balance.',
      passed,
      actual: summary.totalDebtOwed,
      expected: 80000000,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testNetWorthCalculation(): TestCaseResult {
    const start = performance.now();
    const accounts: Account[] = [
      { id: 'acc_1', userId: 'usr_test', name: 'Cash', type: 'CASH', provider: 'Cash', balance: 10000000, initialBalance: 10000000, color: '#000', icon: 'Banknote' },
    ];
    const txs: Transaction[] = [];
    const investments: InvestmentAsset[] = [
      { id: 'inv_1', userId: 'usr_test', name: 'Saham', symbol: 'BBCA', category: 'SAHAM', units: 100, averageBuyPrice: 8000, currentPrice: 10000, totalValue: 1000000, unrealizedGainLoss: 200000, unrealizedGainLossPercentage: 25 },
    ];
    const debts: Debt[] = [
      { id: 'dbt_1', userId: 'usr_test', personOrInstitution: 'Bank', type: 'DEBT_OWED', originalAmount: 3000000, remainingAmount: 3000000, interestRateAnnual: 0, minimumMonthlyPayment: 100000, payments: [] },
    ];

    const netWorthBreakdown = CoreFinanceEngine.calculateNetWorth(accounts, txs, investments, debts, [], [], 'usr_test');
    // Assets = 10,000,000 (cash) + 1,000,000 (investments 100*10000) = 11,000,000
    // Liabilities = 3,000,000 (debt)
    // Net Worth = 8,000,000
    const passed = netWorthBreakdown.totalAssets === 11000000 && netWorthBreakdown.totalLiabilities === 3000000 && netWorthBreakdown.netWorth === 8000000;

    return {
      id: 'tc_10',
      category: 'NET_WORTH',
      name: '10. Net Worth Formula (Assets - Liabilities)',
      description: 'Verifies net worth equals total assets minus liabilities accurately across cash, investments, and debts.',
      passed,
      actual: { assets: netWorthBreakdown.totalAssets, liabilities: netWorthBreakdown.totalLiabilities, netWorth: netWorthBreakdown.netWorth },
      expected: { assets: 11000000, liabilities: 3000000, netWorth: 8000000 },
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testUserSecurityIsolationSuccess(): TestCaseResult {
    const start = performance.now();
    const userRecords: Account[] = [
      { id: 'acc_u1', userId: 'usr_01', name: 'Budi Bank', type: 'BANK', provider: 'BCA', balance: 5000000, color: '#000', icon: 'Landmark' },
      { id: 'acc_u2', userId: 'usr_02', name: 'Other Bank', type: 'BANK', provider: 'Mandiri', balance: 9000000, color: '#000', icon: 'Landmark' },
    ];

    const filtered = SecurityManager.filterUserOwnedRecords(userRecords, 'usr_01');
    const passed = filtered.length === 1 && filtered[0].id === 'acc_u1';

    return {
      id: 'tc_11',
      category: 'SECURITY',
      name: '11. Multi-Tenant User Isolation (Data Filtering)',
      description: 'Verifies database query filters out external user records automatically.',
      passed,
      actual: filtered.map((r) => r.id),
      expected: ['acc_u1'],
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  private static testUserSecurityIsolationViolationTrap(): TestCaseResult {
    const start = performance.now();
    const foreignRecord: Account = {
      id: 'acc_secret_user2',
      userId: 'usr_02',
      name: 'User 2 Secret Vault',
      type: 'BANK',
      provider: 'Swiss Bank',
      balance: 1000000000,
      color: '#000',
      icon: 'Shield',
    };

    let caughtViolation = false;
    try {
      SecurityManager.enforceOwnership(foreignRecord, 'usr_01', 'Bank Account');
    } catch (e) {
      if (e instanceof SecurityViolationError) {
        caughtViolation = true;
      }
    }

    return {
      id: 'tc_12',
      category: 'SECURITY',
      name: '12. Security Boundary Trap (Unauthorized Access Block)',
      description: 'Verifies SecurityViolationError is thrown immediately if user 01 attempts to access user 02 data.',
      passed: caughtViolation,
      actual: caughtViolation ? 'SecurityViolationError Thrown & Blocked' : 'Unprotected Access Allowed!',
      expected: 'SecurityViolationError Thrown & Blocked',
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }
}
