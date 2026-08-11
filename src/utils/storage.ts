import {
  Account,
  Category,
  Subcategory,
  Transaction,
  TransactionItem,
  Tag,
  TransactionTag,
  Budget,
  BudgetItem,
  FinancialGoal,
  GoalContribution,
  BillSubscription,
  RecurringTransaction,
  Debt,
  DebtPayment,
  InvestmentAsset,
  InvestmentTransaction,
  TangibleAsset,
  Liability,
  Attachment,
  UserProfile,
  License,
  NotificationItem,
  AuditLog,
  FinancialHealthScore,
  ImportLog
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_BILLS,
  INITIAL_DEBTS,
  INITIAL_INVESTMENTS,
  INITIAL_TANGIBLE_ASSETS,
  INITIAL_LIABILITIES,
  INITIAL_USER,
  INITIAL_LICENSE,
  INITIAL_NOTIFICATIONS,
  SYSTEM_LICENSES
} from '../data/initialData';
import { CoreFinanceEngine, CashFlowSummary, BudgetCalculatedUsage, NetWorthBreakdown, CalculatedAccountBalance } from '../engine/financeEngine';
import { SecurityManager } from '../engine/securityManager';

const STORAGE_KEY = 'luxfin_app_state_v1';

export interface AppState {
  user: UserProfile;
  license: License;
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  transactionItems: TransactionItem[];
  tags: Tag[];
  transactionTags: TransactionTag[];
  budgets: Budget[];
  budgetItems: BudgetItem[];
  goals: FinancialGoal[];
  goalContributions: GoalContribution[];
  bills: BillSubscription[];
  recurringTransactions: RecurringTransaction[];
  debts: Debt[];
  debtPayments: DebtPayment[];
  investments: InvestmentAsset[];
  investmentTransactions: InvestmentTransaction[];
  tangibleAssets: TangibleAsset[];
  liabilities: Liability[];
  attachments: Attachment[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  financialScores: FinancialHealthScore[];
  importLogs: ImportLog[];
  offlineQueue: Transaction[];
}

class StorageManager {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          user: parsed.user || INITIAL_USER,
          license: parsed.license || INITIAL_LICENSE,
          accounts: parsed.accounts || INITIAL_ACCOUNTS,
          categories: parsed.categories || INITIAL_CATEGORIES,
          subcategories: parsed.subcategories || [],
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          transactionItems: parsed.transactionItems || [],
          tags: parsed.tags || [],
          transactionTags: parsed.transactionTags || [],
          budgets: parsed.budgets || INITIAL_BUDGETS,
          budgetItems: parsed.budgetItems || [],
          goals: parsed.goals || INITIAL_GOALS,
          goalContributions: parsed.goalContributions || [],
          bills: parsed.bills || INITIAL_BILLS,
          recurringTransactions: parsed.recurringTransactions || [],
          debts: parsed.debts || INITIAL_DEBTS,
          debtPayments: parsed.debtPayments || [],
          investments: parsed.investments || INITIAL_INVESTMENTS,
          investmentTransactions: parsed.investmentTransactions || [],
          tangibleAssets: parsed.tangibleAssets && parsed.tangibleAssets.length > 0 ? parsed.tangibleAssets : INITIAL_TANGIBLE_ASSETS,
          liabilities: parsed.liabilities && parsed.liabilities.length > 0 ? parsed.liabilities : INITIAL_LIABILITIES,
          attachments: parsed.attachments || [],
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          auditLogs: parsed.auditLogs || [],
          financialScores: parsed.financialScores || [],
          importLogs: parsed.importLogs || [],
          offlineQueue: parsed.offlineQueue || [],
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return {
      user: INITIAL_USER,
      license: INITIAL_LICENSE,
      accounts: INITIAL_ACCOUNTS,
      categories: INITIAL_CATEGORIES,
      subcategories: [],
      transactions: INITIAL_TRANSACTIONS,
      transactionItems: [],
      tags: [],
      transactionTags: [],
      budgets: INITIAL_BUDGETS,
      budgetItems: [],
      goals: INITIAL_GOALS,
      goalContributions: [],
      bills: INITIAL_BILLS,
      recurringTransactions: [],
      debts: INITIAL_DEBTS,
      debtPayments: [],
      investments: INITIAL_INVESTMENTS,
      investmentTransactions: [],
      tangibleAssets: INITIAL_TANGIBLE_ASSETS,
      liabilities: INITIAL_LIABILITIES,
      attachments: [],
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: [
        {
          id: 'log_init',
          userId: 'usr_01',
          timestamp: new Date().toISOString(),
          action: 'SYSTEM_INIT',
          details: 'Aplikasi LUXFIN AI database financial model diinisialisasi',
        }
      ],
      financialScores: [],
      importLogs: [],
      offlineQueue: [],
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): AppState {
    return this.state;
  }

  // --- USER PROFILE & LICENSE MANAGEMENT ---
  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.state.user = { ...this.state.user, ...updates };
    this.saveToStorage();
    return this.state.user;
  }

  public activateLicense(key: string): { success: boolean; message: string; license?: License } {
    const found = SYSTEM_LICENSES.find((l) => l.key.toUpperCase() === key.trim().toUpperCase());
    if (!found) {
      // Create a new valid key if valid format
      if (key.startsWith('LUX-')) {
        const newLic: License = {
          id: `lic_${Date.now()}`,
          key: key.toUpperCase(),
          status: 'ACTIVE',
          plan: 'PREMIUM_ANNUAL',
          createdDate: new Date().toISOString(),
          activatedDate: new Date().toISOString(),
          expirationDate: '2027-08-10T23:59:59Z',
          maxDevices: 2,
        };
        this.state.license = newLic;
        this.state.user.licenseKey = newLic.key;
        this.state.user.licenseStatus = 'ACTIVE';
        this.state.user.licensePlan = newLic.plan;
        this.addAuditLog('LICENSE_ACTIVATED', `Lisensi ${key} berhasil diaktifkan.`);
        this.saveToStorage();
        return { success: true, message: 'Lisensi berhasil diaktifkan!', license: newLic };
      }
      return { success: false, message: 'Kode lisensi tidak valid atau tidak ditemukan.' };
    }

    if (found.status === 'EXPIRED') {
      return { success: false, message: 'Lisensi telah kedaluwarsa.' };
    }
    if (found.status === 'SUSPENDED' || found.status === 'REVOKED') {
      return { success: false, message: 'Lisensi telah dibekukan atau dicabut oleh administrator.' };
    }

    found.status = 'ACTIVE';
    found.activatedDate = new Date().toISOString();
    this.state.license = found;
    this.state.user.licenseKey = found.key;
    this.state.user.licenseStatus = 'ACTIVE';
    this.state.user.licensePlan = found.plan;
    this.addAuditLog('LICENSE_ACTIVATED', `Lisensi ${found.key} diaktifkan.`);
    this.saveToStorage();
    return { success: true, message: 'Lisensi berhasil diverifikasi & diaktifkan.', license: found };
  }

  // --- TRANSACTIONS ---
  public addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    // Update account balance deterministically
    const accountIndex = this.state.accounts.findIndex((a) => a.id === tx.accountId);
    if (accountIndex !== -1) {
      if (tx.type === 'INCOME') {
        this.state.accounts[accountIndex].balance += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        this.state.accounts[accountIndex].balance -= tx.amount;
      } else if (tx.type === 'TRANSFER' && tx.targetAccountId) {
        this.state.accounts[accountIndex].balance -= tx.amount;
        const targetIndex = this.state.accounts.findIndex((a) => a.id === tx.targetAccountId);
        if (targetIndex !== -1) {
          this.state.accounts[targetIndex].balance += tx.amount;
        }
      }
    }

    // Update budget spent if expense
    if (tx.type === 'EXPENSE') {
      const budgetIndex = this.state.budgets.findIndex((b) => b.categoryId === tx.categoryId);
      if (budgetIndex !== -1) {
        this.state.budgets[budgetIndex].spent += tx.amount;
      }
    }

    this.state.transactions.unshift(newTx);
    this.addAuditLog('TRANSACTION_ADDED', `${tx.type} Rp ${tx.amount} (${tx.notes || tx.vendor || 'Tanpa Catatan'})`);
    this.saveToStorage();
    return newTx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const txIndex = this.state.transactions.findIndex((t) => t.id === id);
    if (txIndex === -1) return null;

    const oldTx = this.state.transactions[txIndex];

    // Revert old transaction balance impact
    const oldAccountIndex = this.state.accounts.findIndex((a) => a.id === oldTx.accountId);
    if (oldAccountIndex !== -1) {
      if (oldTx.type === 'INCOME') {
        this.state.accounts[oldAccountIndex].balance -= oldTx.amount;
      } else if (oldTx.type === 'EXPENSE') {
        this.state.accounts[oldAccountIndex].balance += oldTx.amount;
      } else if (oldTx.type === 'TRANSFER' && oldTx.targetAccountId) {
        this.state.accounts[oldAccountIndex].balance += oldTx.amount;
        const targetIndex = this.state.accounts.findIndex((a) => a.id === oldTx.targetAccountId);
        if (targetIndex !== -1) {
          this.state.accounts[targetIndex].balance -= oldTx.amount;
        }
      }
    }

    const updatedTx: Transaction = {
      ...oldTx,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Apply new transaction balance impact
    const newAccountIndex = this.state.accounts.findIndex((a) => a.id === updatedTx.accountId);
    if (newAccountIndex !== -1) {
      if (updatedTx.type === 'INCOME') {
        this.state.accounts[newAccountIndex].balance += updatedTx.amount;
      } else if (updatedTx.type === 'EXPENSE') {
        this.state.accounts[newAccountIndex].balance -= updatedTx.amount;
      } else if (updatedTx.type === 'TRANSFER' && updatedTx.targetAccountId) {
        this.state.accounts[newAccountIndex].balance -= updatedTx.amount;
        const targetIndex = this.state.accounts.findIndex((a) => a.id === updatedTx.targetAccountId);
        if (targetIndex !== -1) {
          this.state.accounts[targetIndex].balance += updatedTx.amount;
        }
      }
    }

    this.state.transactions[txIndex] = updatedTx;
    this.addAuditLog('TRANSACTION_UPDATED', `Memperbarui transaksi ${id} menjadi Rp ${updatedTx.amount}`);
    this.saveToStorage();
    return updatedTx;
  }

  public detectDuplicateTransactions(candidate: {
    amount: number;
    accountId: string;
    vendor?: string;
    categoryId?: string;
    date: string;
  }): Transaction[] {
    const candidateAmount = Number(candidate.amount);
    if (!candidateAmount || candidateAmount <= 0) return [];

    return this.state.transactions.filter((t) => {
      if (t.isDeleted) return false;
      const sameAccount = t.accountId === candidate.accountId;
      const sameAmount = Math.abs(t.amount - candidateAmount) < 1;
      const sameVendor = candidate.vendor && t.vendor
        ? t.vendor.toLowerCase().trim() === candidate.vendor.toLowerCase().trim()
        : false;

      // Check if transaction is within last 7 days
      const txDate = new Date(t.date).getTime();
      const candDate = new Date(candidate.date).getTime();
      const diffDays = Math.abs(candDate - txDate) / (1000 * 60 * 60 * 24);

      return sameAccount && (sameAmount || sameVendor) && diffDays <= 7;
    });
  }

  public deleteTransaction(id: string): void {
    const tx = this.state.transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert account balance
    const accountIndex = this.state.accounts.findIndex((a) => a.id === tx.accountId);
    if (accountIndex !== -1) {
      if (tx.type === 'INCOME') {
        this.state.accounts[accountIndex].balance -= tx.amount;
      } else if (tx.type === 'EXPENSE') {
        this.state.accounts[accountIndex].balance += tx.amount;
      } else if (tx.type === 'TRANSFER' && tx.targetAccountId) {
        this.state.accounts[accountIndex].balance += tx.amount;
        const targetIndex = this.state.accounts.findIndex((a) => a.id === tx.targetAccountId);
        if (targetIndex !== -1) {
          this.state.accounts[targetIndex].balance -= tx.amount;
        }
      }
    }

    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.addAuditLog('TRANSACTION_DELETED', `Menghapus transaksi ${id}`);
    this.saveToStorage();
  }

  // --- ACCOUNTS ---
  public addAccount(acc: Omit<Account, 'id'>): Account {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}`,
      userId: acc.userId || this.state.user.id || 'usr_01',
      createdAt: new Date().toISOString(),
    };
    this.state.accounts.push(newAcc);
    this.addAuditLog('ACCOUNT_CREATED', `Membuat akun ${newAcc.name} (${newAcc.type})`);
    this.saveToStorage();
    return newAcc;
  }

  public updateAccount(id: string, updates: Partial<Account>): Account | null {
    const acc = this.state.accounts.find((a) => a.id === id);
    if (!acc) return null;

    Object.assign(acc, updates, { updatedAt: new Date().toISOString() });
    this.addAuditLog('ACCOUNT_UPDATED', `Diperbarui data akun ${acc.name}`);
    this.saveToStorage();
    return acc;
  }

  public archiveAccount(id: string, isArchived: boolean = true): void {
    const acc = this.state.accounts.find((a) => a.id === id);
    if (!acc) return;

    acc.isArchived = isArchived;
    acc.updatedAt = new Date().toISOString();
    this.addAuditLog('ACCOUNT_ARCHIVED', `${isArchived ? 'Arsip' : 'Buka Arsip'} akun ${acc.name}`);
    this.saveToStorage();
  }

  public deleteAccount(id: string): { success: boolean; message: string } {
    const accIndex = this.state.accounts.findIndex((a) => a.id === id);
    if (accIndex === -1) return { success: false, message: 'Akun tidak ditemukan.' };

    const relatedTxs = this.state.transactions.filter((t) => t.accountId === id || t.targetAccountId === id);
    if (relatedTxs.length > 0) {
      // Soft deletion / Archiving recommended when transactions exist
      this.state.accounts[accIndex].isArchived = true;
      this.saveToStorage();
      return {
        success: true,
        message: `Akun memiliki ${relatedTxs.length} transaksi terkait. Akun telah diarsipkan dengan aman untuk menjaga keutuhan riwayat laporan keuangan.`,
      };
    }

    const removedAcc = this.state.accounts[accIndex];
    this.state.accounts.splice(accIndex, 1);
    this.addAuditLog('ACCOUNT_DELETED', `Menghapus akun ${removedAcc.name}`);
    this.saveToStorage();
    return { success: true, message: `Akun ${removedAcc.name} berhasil dihapus.` };
  }

  public reconcileAccount(id: string, physicalBalance: number, notes?: string): { adjustmentTx?: Transaction; diff: number } {
    const acc = this.state.accounts.find((a) => a.id === id);
    if (!acc) throw new Error('Akun tidak ditemukan.');

    const calcResult = CoreFinanceEngine.calculateAccountBalance(acc, this.state.transactions, this.state.user.id || 'usr_01');
    const currentComputed = calcResult.computedBalance;
    const diff = physicalBalance - currentComputed;

    if (Math.abs(diff) < 0.01) {
      return { diff: 0 };
    }

    let adjustmentTx: Transaction | undefined;

    if (diff > 0) {
      // Surplus adjustment -> INCOME
      adjustmentTx = this.addTransaction({
        userId: this.state.user.id || 'usr_01',
        type: 'INCOME',
        amount: Math.abs(diff),
        accountId: id,
        categoryId: 'cat_inc_other',
        status: 'COMPLETED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        vendor: 'Rekonsiliasi Bank',
        notes: notes || `Penyesuaian Selisih Rekonsiliasi Kas (Surplus +Rp ${Math.abs(diff).toLocaleString('id-ID')})`,
        tags: ['Reconciliation'],
      });
    } else {
      // Deficit adjustment -> EXPENSE
      adjustmentTx = this.addTransaction({
        userId: this.state.user.id || 'usr_01',
        type: 'EXPENSE',
        amount: Math.abs(diff),
        accountId: id,
        categoryId: 'cat_exp_other',
        status: 'COMPLETED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        vendor: 'Rekonsiliasi Bank',
        notes: notes || `Penyesuaian Selisih Rekonsiliasi Kas (Defisit -Rp ${Math.abs(diff).toLocaleString('id-ID')})`,
        tags: ['Reconciliation'],
      });
    }

    acc.balance = physicalBalance;
    this.addAuditLog('ACCOUNT_RECONCILED', `Rekonsiliasi akun ${acc.name}: Saldo baru Rp ${physicalBalance} (Selisih Rp ${diff})`);
    this.saveToStorage();

    return { adjustmentTx, diff };
  }

  public updateAccountBalance(accountId: string, newBalance: number): void {
    const acc = this.state.accounts.find((a) => a.id === accountId);
    if (acc) {
      const diff = newBalance - acc.balance;
      acc.balance = newBalance;
      this.addAuditLog('ACCOUNT_BALANCE_UPDATE', `Penyesuaian saldo ${acc.name} menjadi Rp ${newBalance}`);
      this.saveToStorage();
    }
  }

  // --- BUDGETS ---
  public updateBudget(categoryId: string, monthlyLimit: number, periodType?: any, period?: string): void {
    const budget = this.state.budgets.find((b) => b.categoryId === categoryId);
    if (budget) {
      budget.monthlyLimit = monthlyLimit;
      if (periodType) budget.periodType = periodType;
      if (period) budget.period = period;
    } else {
      this.state.budgets.push({
        id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        userId: this.state.user.id || 'usr_01',
        categoryId,
        monthlyLimit,
        spent: 0,
        period: period || new Date().toISOString().substring(0, 7),
        periodType: periodType || 'MONTHLY',
      });
    }
    this.saveToStorage();
  }

  public createBudget(budget: Omit<Budget, 'id' | 'spent'>): Budget {
    const newBudget: Budget = {
      ...budget,
      id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: budget.userId || this.state.user.id || 'usr_01',
      spent: 0,
      periodType: budget.periodType || 'MONTHLY',
    };
    this.state.budgets.push(newBudget);
    this.saveToStorage();
    return newBudget;
  }

  public deleteBudget(id: string): void {
    this.state.budgets = this.state.budgets.filter((b) => b.id !== id && b.categoryId !== id);
    this.saveToStorage();
  }

  public getOverspendingAlerts(): { categoryName: string; spent: number; limit: number; excess: number; percentage: number }[] {
    const usages = this.getBudgetUsages();
    return usages
      .filter((u) => u.isOverBudget || u.usagePercentage >= 80)
      .map((u) => {
        const cat = this.state.categories.find((c) => c.id === u.categoryId);
        return {
          categoryName: cat?.name || 'Pos Pengeluaran',
          spent: u.spent,
          limit: u.monthlyLimit,
          excess: Math.max(0, u.spent - u.monthlyLimit),
          percentage: u.usagePercentage,
        };
      });
  }

  // --- GOALS ---
  public addGoalContribution(goalId: string, amount: number, accountId: string, notes?: string): void {
    const goal = this.state.goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'COMPLETED';
    }

    const contrib: GoalContribution = {
      id: `gc_${Date.now()}`,
      goalId,
      userId: this.state.user.id || 'usr_01',
      accountId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Alokasi Tabungan Impian: ${goal.title}`,
    };

    if (!goal.contributions) goal.contributions = [];
    goal.contributions.unshift(contrib);
    this.state.goalContributions.unshift(contrib);

    this.addTransaction({
      userId: this.state.user.id || 'usr_01',
      type: 'EXPENSE',
      amount,
      accountId,
      categoryId: 'cat_exp_shopping',
      status: 'COMPLETED',
      notes: `Setoran Tabungan Target: ${goal.title}`,
      date: new Date().toISOString().split('T')[0],
    });

    this.addAuditLog('GOAL_CONTRIBUTION', `Menambah tabungan ${goal.title} sebesar Rp ${amount}`);
    this.saveToStorage();
  }

  public createGoal(goal: Omit<FinancialGoal, 'id' | 'currentAmount'>): FinancialGoal {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      userId: goal.userId || this.state.user.id || 'usr_01',
      currentAmount: 0,
      status: 'IN_PROGRESS',
      isArchived: false,
    };
    this.state.goals.push(newGoal);
    this.saveToStorage();
    return newGoal;
  }

  public updateGoal(id: string, updates: Partial<FinancialGoal>): void {
    const goal = this.state.goals.find((g) => g.id === id);
    if (goal) {
      Object.assign(goal, updates);
      this.saveToStorage();
    }
  }

  public archiveGoal(id: string): void {
    const goal = this.state.goals.find((g) => g.id === id);
    if (goal) {
      goal.isArchived = true;
      goal.status = 'ARCHIVED';
      this.saveToStorage();
    }
  }

  public calculateGoalForecast(goalId: string): {
    monthsRemaining: number;
    requiredMonthly: number;
    projectedFinishDate: string;
    isOnTrack: boolean;
  } {
    const goal = this.state.goals.find((g) => g.id === goalId);
    if (!goal) return { monthsRemaining: 0, requiredMonthly: 0, projectedFinishDate: '-', isOnTrack: true };

    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Month diff calculation
    const yearsDiff = targetDate.getFullYear() - today.getFullYear();
    const monthsDiff = yearsDiff * 12 + (targetDate.getMonth() - today.getMonth());
    const monthsRemaining = Math.max(1, monthsDiff);

    const requiredMonthly = Math.round(remaining / monthsRemaining);

    // Calculate historical contribution speed (average monthly deposit)
    let avgMonthlyDeposit = 0;
    if (goal.contributions && goal.contributions.length > 0) {
      const totalContributed = goal.contributions.reduce((s, c) => s + c.amount, 0);
      avgMonthlyDeposit = totalContributed / Math.max(1, goal.contributions.length);
    } else {
      avgMonthlyDeposit = goal.currentAmount / Math.max(1, (12 - monthsRemaining));
    }

    const projectedMonthsNeeded = avgMonthlyDeposit > 0 ? Math.ceil(remaining / avgMonthlyDeposit) : monthsRemaining;
    const projDate = new Date();
    projDate.setMonth(projDate.getMonth() + projectedMonthsNeeded);
    const projectedFinishDate = projDate.toISOString().split('T')[0];

    return {
      monthsRemaining,
      requiredMonthly,
      projectedFinishDate,
      isOnTrack: avgMonthlyDeposit >= requiredMonthly || goal.currentAmount >= goal.targetAmount,
    };
  }

  // --- BILLS & SUBSCRIPTIONS ---
  public addBill(bill: Omit<BillSubscription, 'id'>): BillSubscription {
    const newBill: BillSubscription = {
      ...bill,
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: bill.userId || this.state.user.id || 'usr_01',
      status: bill.status || 'ACTIVE',
      type: bill.type || 'BILL',
    };
    this.state.bills.push(newBill);
    this.saveToStorage();
    return newBill;
  }

  public updateBill(id: string, updates: Partial<BillSubscription>): void {
    const bill = this.state.bills.find((b) => b.id === id);
    if (bill) {
      Object.assign(bill, updates);
      this.saveToStorage();
    }
  }

  public deleteBill(id: string): void {
    this.state.bills = this.state.bills.filter((b) => b.id !== id);
    this.saveToStorage();
  }

  public payBill(billId: string, accountIdOverride?: string): void {
    const bill = this.state.bills.find((b) => b.id === billId);
    if (!bill) return;

    const accId = accountIdOverride || bill.accountId || this.state.accounts[0]?.id || 'acc_bca';
    const todayStr = new Date().toISOString().split('T')[0];

    bill.lastPaidDate = todayStr;

    this.addTransaction({
      userId: this.state.user.id || 'usr_01',
      type: 'EXPENSE',
      amount: bill.amount,
      accountId: accId,
      categoryId: bill.categoryId || 'cat_exp_bills',
      status: 'COMPLETED',
      vendor: bill.name,
      notes: `Pembayaran Tagihan/Langganan: ${bill.name}`,
      date: todayStr,
      tags: ['Tagihan', bill.type || 'BILL'],
    });

    this.addAuditLog('BILL_PAID', `Membayar tagihan ${bill.name} sebesar Rp ${bill.amount}`);
    this.saveToStorage();
  }

  public getUpcomingBills(daysAhead = 14): (BillSubscription & { daysUntilDue: number; nextDueDateStr: string })[] {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return this.state.bills
      .filter((b) => b.status === 'ACTIVE' && (b.type === 'BILL' || !b.type))
      .map((b) => {
        let dueMonth = currentMonth;
        let dueYear = currentYear;
        if (b.dueDateDay < currentDay) {
          dueMonth++;
          if (dueMonth > 11) {
            dueMonth = 0;
            dueYear++;
          }
        }
        const dueDate = new Date(dueYear, dueMonth, b.dueDateDay);
        const diffMs = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const nextDueDateStr = dueDate.toISOString().split('T')[0];

        return { ...b, daysUntilDue, nextDueDateStr };
      })
      .filter((b) => b.daysUntilDue >= 0 && b.daysUntilDue <= daysAhead)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  public getUpcomingSubscriptions(daysAhead = 30): (BillSubscription & { daysUntilDue: number; nextDueDateStr: string })[] {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return this.state.bills
      .filter((b) => b.status === 'ACTIVE' && b.type === 'SUBSCRIPTION')
      .map((b) => {
        let dueMonth = currentMonth;
        let dueYear = currentYear;
        if (b.dueDateDay < currentDay) {
          dueMonth++;
          if (dueMonth > 11) {
            dueMonth = 0;
            dueYear++;
          }
        }
        const dueDate = new Date(dueYear, dueMonth, b.dueDateDay);
        const diffMs = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const nextDueDateStr = dueDate.toISOString().split('T')[0];

        return { ...b, daysUntilDue, nextDueDateStr };
      })
      .filter((b) => b.daysUntilDue >= 0 && b.daysUntilDue <= daysAhead)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  // --- RECURRING TRANSACTIONS ---
  public addRecurringTransaction(recurring: Omit<RecurringTransaction, 'id'>): RecurringTransaction {
    const newRec: RecurringTransaction = {
      ...recurring,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: recurring.userId || this.state.user.id || 'usr_01',
      status: recurring.status || 'ACTIVE',
    };
    this.state.recurringTransactions.push(newRec);
    this.saveToStorage();
    return newRec;
  }

  public updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>): void {
    const rec = this.state.recurringTransactions.find((r) => r.id === id);
    if (rec) {
      Object.assign(rec, updates);
      this.saveToStorage();
    }
  }

  public deleteRecurringTransaction(id: string): void {
    this.state.recurringTransactions = this.state.recurringTransactions.filter((r) => r.id !== id);
    this.saveToStorage();
  }

  public processDueRecurringTransactions(): number {
    const todayStr = new Date().toISOString().split('T')[0];
    let processedCount = 0;

    for (const rec of this.state.recurringTransactions) {
      if (rec.status !== 'ACTIVE') continue;

      if (rec.nextRunDate <= todayStr) {
        // Execute transaction
        this.addTransaction({
          userId: rec.userId,
          type: rec.type,
          amount: rec.amount,
          accountId: rec.accountId,
          targetAccountId: rec.targetAccountId,
          categoryId: rec.categoryId,
          subcategory: rec.subcategory,
          status: 'COMPLETED',
          vendor: rec.name,
          notes: `[Otomatis Rutin] ${rec.name}`,
          date: todayStr,
          isRecurring: true,
          recurringFrequency: rec.frequency === 'CUSTOM' ? 'MONTHLY' : rec.frequency,
          recurringId: rec.id,
        });

        rec.lastRunDate = todayStr;

        // Calculate next run date
        const nextDate = new Date(rec.nextRunDate);
        if (rec.frequency === 'DAILY') {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (rec.frequency === 'WEEKLY') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (rec.frequency === 'MONTHLY') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (rec.frequency === 'YEARLY') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else if (rec.frequency === 'CUSTOM') {
          const interval = rec.customIntervalDays || 30;
          nextDate.setDate(nextDate.getDate() + interval);
        }
        rec.nextRunDate = nextDate.toISOString().split('T')[0];

        processedCount++;
      }
    }

    if (processedCount > 0) {
      this.saveToStorage();
    }
    return processedCount;
  }

  // --- DEBTS ---
  public recordDebtPayment(debtId: string, amount: number, accountId: string, notes?: string): void {
    const debt = this.state.debts.find((d) => d.id === debtId);
    if (!debt) return;

    debt.remainingAmount = Math.max(0, debt.remainingAmount - amount);
    debt.payments.unshift({
      id: `pmt_${Date.now()}`,
      debtId: debt.id,
      userId: this.state.user.id || 'usr_01',
      accountId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes,
    });

    this.addTransaction({
      userId: this.state.user.id || 'usr_01',
      type: debt.type === 'DEBT_OWED' ? 'EXPENSE' : 'INCOME',
      amount,
      accountId,
      categoryId: 'cat_exp_debt',
      status: 'COMPLETED',
      notes: `${debt.type === 'DEBT_OWED' ? 'Pembayaran Utang' : 'Penerimaan Piutang'}: ${debt.personOrInstitution}`,
      date: new Date().toISOString().split('T')[0],
    });

    this.saveToStorage();
  }

  public addDebt(debt: Omit<Debt, 'id' | 'remainingAmount' | 'payments'>): Debt {
    const newDebt: Debt = {
      ...debt,
      id: `dbt_${Date.now()}`,
      remainingAmount: debt.originalAmount,
      payments: [],
    };
    this.state.debts.push(newDebt);
    this.saveToStorage();
    return newDebt;
  }

  public updateDebt(id: string, updates: Partial<Debt>): void {
    const debt = this.state.debts.find((d) => d.id === id);
    if (debt) {
      Object.assign(debt, updates);
      this.saveToStorage();
    }
  }

  public deleteDebt(id: string): void {
    this.state.debts = this.state.debts.filter((d) => d.id !== id);
    this.saveToStorage();
  }

  public calculatePayoffProjections(
    strategy: 'SNOWBALL' | 'AVALANCHE' | 'CUSTOM',
    extraMonthlyBudget: number = 0
  ) {
    const activeDebts = this.state.debts
      .filter((d) => d.type === 'DEBT_OWED' && d.remainingAmount > 0 && !d.isCleared)
      .map((d) => ({ ...d }));

    if (activeDebts.length === 0) {
      return {
        strategy,
        totalRemainingBalance: 0,
        totalEstimatedMonths: 0,
        totalInterestPaid: 0,
        items: [],
      };
    }

    if (strategy === 'SNOWBALL') {
      activeDebts.sort((a, b) => a.remainingAmount - b.remainingAmount);
    } else if (strategy === 'AVALANCHE') {
      activeDebts.sort((a, b) => b.interestRateAnnual - a.interestRateAnnual);
    }

    let extraPool = extraMonthlyBudget;
    let grandTotalInterest = 0;
    let maxMonthsNeeded = 0;

    const items = activeDebts.map((debt, index) => {
      let balance = debt.remainingAmount;
      const rateMonthly = debt.interestRateAnnual / 100 / 12;
      const minPayment = debt.installment || debt.minimumMonthlyPayment || 100000;
      const extraAllocation = index === 0 ? extraPool : 0;
      const totalMonthlyPayment = minPayment + extraAllocation;

      let months = 0;
      let totalInterest = 0;

      while (balance > 0 && months < 360) {
        months++;
        const interestThisMonth = balance * rateMonthly;
        totalInterest += interestThisMonth;

        let principalThisMonth = totalMonthlyPayment - interestThisMonth;
        if (principalThisMonth <= 0) {
          principalThisMonth = Math.min(balance, 100000);
        }

        balance -= principalThisMonth;
      }

      grandTotalInterest += totalInterest;
      if (months > maxMonthsNeeded) maxMonthsNeeded = months;

      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + months);

      return {
        debtId: debt.id,
        debtName: debt.personOrInstitution,
        category: debt.category || 'OTHER',
        originalAmount: debt.originalAmount,
        remainingAmount: debt.remainingAmount,
        interestRateAnnual: debt.interestRateAnnual,
        monthlyPayment: minPayment,
        extraPaymentApplied: extraAllocation,
        totalMonthlyAllocation: totalMonthlyPayment,
        estimatedMonthsToPayoff: months,
        estimatedTotalInterestPaid: Math.round(totalInterest),
        projectedPayoffDate: projDate.toISOString().split('T')[0],
        payoffOrder: index + 1,
      };
    });

    const totalRemainingBalance = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

    return {
      strategy,
      extraMonthlyBudget,
      totalRemainingBalance,
      totalEstimatedMonths: maxMonthsNeeded,
      totalInterestPaid: Math.round(grandTotalInterest),
      items,
    };
  }

  // --- INVESTMENTS ---
  public addInvestmentAsset(asset: Omit<InvestmentAsset, 'id' | 'totalValue' | 'unrealizedGainLoss' | 'unrealizedGainLossPercentage'>): InvestmentAsset {
    const totalPurchaseValue = asset.units * asset.averageBuyPrice;
    const totalValue = asset.units * asset.currentPrice;
    const gainLoss = totalValue - totalPurchaseValue;
    const gainLossPct = totalPurchaseValue > 0 ? (gainLoss / totalPurchaseValue) * 100 : 0;

    const newAsset: InvestmentAsset = {
      ...asset,
      id: `inv_${Date.now()}`,
      totalPurchaseValue,
      totalValue,
      unrealizedGainLoss: gainLoss,
      unrealizedGainLossPercentage: gainLossPct,
    };
    this.state.investments.push(newAsset);
    this.saveToStorage();
    return newAsset;
  }

  public updateInvestmentAsset(id: string, updates: Partial<InvestmentAsset>): void {
    const inv = this.state.investments.find((i) => i.id === id);
    if (inv) {
      Object.assign(inv, updates);
      inv.totalPurchaseValue = inv.units * inv.averageBuyPrice;
      inv.totalValue = inv.units * inv.currentPrice;
      inv.unrealizedGainLoss = inv.totalValue - inv.totalPurchaseValue;
      inv.unrealizedGainLossPercentage = inv.totalPurchaseValue > 0
        ? (inv.unrealizedGainLoss / inv.totalPurchaseValue) * 100
        : 0;

      this.saveToStorage();
    }
  }

  public deleteInvestmentAsset(id: string): void {
    this.state.investments = this.state.investments.filter((i) => i.id !== id);
    this.saveToStorage();
  }

  public recordInvestmentTransaction(
    investmentId: string,
    type: 'BUY' | 'SELL' | 'DIVIDEND',
    units: number,
    pricePerUnit: number,
    accountId: string,
    notes?: string
  ): void {
    const inv = this.state.investments.find((i) => i.id === investmentId);
    if (!inv) return;

    const totalAmount = units * pricePerUnit;
    const todayStr = new Date().toISOString().split('T')[0];

    if (!inv.transactions) inv.transactions = [];
    inv.transactions.unshift({
      id: `invtx_${Date.now()}`,
      investmentId,
      userId: this.state.user.id || 'usr_01',
      type,
      units,
      pricePerUnit,
      totalAmount,
      accountId,
      date: todayStr,
      notes,
    });

    if (type === 'BUY') {
      const newTotalUnits = inv.units + units;
      const oldCost = inv.units * inv.averageBuyPrice;
      const newCost = oldCost + totalAmount;
      inv.units = newTotalUnits;
      inv.averageBuyPrice = newTotalUnits > 0 ? newCost / newTotalUnits : pricePerUnit;

      this.addTransaction({
        userId: this.state.user.id || 'usr_01',
        type: 'EXPENSE',
        amount: totalAmount,
        accountId,
        categoryId: 'cat_exp_other',
        status: 'COMPLETED',
        notes: `Pembelian Aset Investasi: ${inv.name} (${units} unit @ ${pricePerUnit})`,
        date: todayStr,
        tags: ['Investasi', inv.category],
      });
    } else if (type === 'SELL') {
      inv.units = Math.max(0, inv.units - units);

      this.addTransaction({
        userId: this.state.user.id || 'usr_01',
        type: 'INCOME',
        amount: totalAmount,
        accountId,
        categoryId: 'cat_inc_invest',
        status: 'COMPLETED',
        notes: `Penjualan Aset Investasi: ${inv.name} (${units} unit @ ${pricePerUnit})`,
        date: todayStr,
        tags: ['Investasi', inv.category],
      });
    } else if (type === 'DIVIDEND') {
      this.addTransaction({
        userId: this.state.user.id || 'usr_01',
        type: 'INCOME',
        amount: totalAmount,
        accountId,
        categoryId: 'cat_inc_invest',
        status: 'COMPLETED',
        notes: `Dividen/Hasil Investasi: ${inv.name}`,
        date: todayStr,
        tags: ['Dividen', inv.category],
      });
    }

    inv.totalPurchaseValue = inv.units * inv.averageBuyPrice;
    inv.totalValue = inv.units * inv.currentPrice;
    inv.unrealizedGainLoss = inv.totalValue - inv.totalPurchaseValue;
    inv.unrealizedGainLossPercentage = inv.totalPurchaseValue > 0
      ? (inv.unrealizedGainLoss / inv.totalPurchaseValue) * 100
      : 0;

    this.saveToStorage();
  }

  // --- TANGIBLE ASSETS & LIABILITIES ---
  public addTangibleAsset(asset: Omit<TangibleAsset, 'id'>): TangibleAsset {
    const newAst: TangibleAsset = {
      ...asset,
      id: `ast_${Date.now()}`,
      userId: asset.userId || this.state.user.id || 'usr_01',
      createdAt: new Date().toISOString(),
    };
    this.state.tangibleAssets.push(newAst);
    this.saveToStorage();
    return newAst;
  }

  public updateTangibleAsset(id: string, updates: Partial<TangibleAsset>): void {
    const ast = this.state.tangibleAssets.find((a) => a.id === id);
    if (ast) {
      Object.assign(ast, updates);
      this.saveToStorage();
    }
  }

  public deleteTangibleAsset(id: string): void {
    this.state.tangibleAssets = this.state.tangibleAssets.filter((a) => a.id !== id);
    this.saveToStorage();
  }

  public addLiability(liability: Omit<Liability, 'id'>): Liability {
    const newLia: Liability = {
      ...liability,
      id: `lia_${Date.now()}`,
      userId: liability.userId || this.state.user.id || 'usr_01',
      createdAt: new Date().toISOString(),
    };
    this.state.liabilities.push(newLia);
    this.saveToStorage();
    return newLia;
  }

  public updateLiability(id: string, updates: Partial<Liability>): void {
    const lia = this.state.liabilities.find((l) => l.id === id);
    if (lia) {
      Object.assign(lia, updates);
      this.saveToStorage();
    }
  }

  public deleteLiability(id: string): void {
    this.state.liabilities = this.state.liabilities.filter((l) => l.id !== id);
    this.saveToStorage();
  }

  // --- HISTORICAL NET WORTH ENGINE ---
  public getHistoricalNetWorth(monthsCount: number = 6) {
    const currentNetWorth = this.getNetWorth().netWorth;
    const { netCashflow } = this.getMonthlyCashflow();

    const history: { month: string; netWorth: number }[] = [];
    const today = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
      const estimatedValue = currentNetWorth - (i * (netCashflow || 2500000));
      history.push({
        month: monthLabel,
        netWorth: Math.max(0, estimatedValue),
      });
    }

    return history;
  }

  // --- NOTIFICATIONS & AUDIT ---
  public markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage();
    }
  }

  public addNotification(notif: { title: string; message: string; type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT'; linkTab?: string }): void {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: this.state.user.id || 'usr_01',
      title: notif.title,
      message: notif.message,
      type: notif.type || 'INFO',
      isRead: false,
      timestamp: new Date().toISOString(),
      linkTab: notif.linkTab,
    };
    this.state.notifications.unshift(newNotif as any);
    this.saveToStorage();
  }

  public addAuditLog(action: string, details: string): void {
    this.state.auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
    });
  }

  // --- DETERMINISTIC FINANCIAL CALCULATIONS VIA CORE ENGINE ---
  public getCalculatedAccountBalances(): CalculatedAccountBalance[] {
    const activeUserId = this.state.user.id || 'usr_01';
    return this.state.accounts.map((acc) =>
      CoreFinanceEngine.calculateAccountBalance(acc, this.state.transactions, activeUserId)
    );
  }

  public getCashFlowSummary(periodYYYYMM?: string): CashFlowSummary {
    const activeUserId = this.state.user.id || 'usr_01';
    return CoreFinanceEngine.calculateCashFlow(this.state.transactions, activeUserId, periodYYYYMM);
  }

  public getBudgetUsages(periodYYYYMM?: string): BudgetCalculatedUsage[] {
    const activeUserId = this.state.user.id || 'usr_01';
    const period = periodYYYYMM || new Date().toISOString().substring(0, 7);
    return CoreFinanceEngine.calculateBudgetUsage(this.state.budgets, this.state.transactions, activeUserId, period);
  }

  public getNetWorthBreakdown(): NetWorthBreakdown {
    const activeUserId = this.state.user.id || 'usr_01';
    return CoreFinanceEngine.calculateNetWorth(
      this.state.accounts,
      this.state.transactions,
      this.state.investments,
      this.state.debts,
      this.state.tangibleAssets,
      this.state.liabilities,
      activeUserId
    );
  }

  public getNetWorth(): { totalAssets: number; totalLiabilities: number; netWorth: number } {
    const breakdown = this.getNetWorthBreakdown();
    return {
      totalAssets: breakdown.totalAssets,
      totalLiabilities: breakdown.totalLiabilities,
      netWorth: breakdown.netWorth,
    };
  }

  public getMonthlyCashflow(yearMonth?: string): { income: number; expense: number; netCashflow: number } {
    const cf = this.getCashFlowSummary(yearMonth);
    return {
      income: cf.totalIncome,
      expense: cf.totalExpense,
      netCashflow: cf.netCashFlow,
    };
  }

  public calculateFinancialHealthScore(): FinancialHealthScore {
    const { income, expense } = this.getMonthlyCashflow();
    const { totalAssets, totalLiabilities, netWorth } = this.getNetWorth();

    // 1. Savings Rate Score (0 - 25)
    const savings = Math.max(0, income - expense);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    let savingsRateScore = Math.min(25, (savingsRate / 30) * 25); // 30% savings rate = 25 pts

    // 2. Emergency Fund Score (0 - 25)
    const monthlyExpenseAvg = expense > 0 ? expense : 3500000;
    const liquidAssets = this.state.accounts
      .filter((a) => a.type === 'BANK' || a.type === 'E_WALLET' || a.type === 'CASH')
      .reduce((sum, a) => sum + a.balance, 0);
    const monthsCovered = liquidAssets / monthlyExpenseAvg;
    let emergencyFundScore = Math.min(25, (monthsCovered / 6) * 25); // 6 months = 25 pts

    // 3. Debt Ratio Score (0 - 25)
    const monthlyDebtPayments = this.state.debts
      .filter((d) => d.type === 'DEBT_OWED')
      .reduce((sum, d) => sum + d.minimumMonthlyPayment, 0);
    const dtiRatio = income > 0 ? (monthlyDebtPayments / income) * 100 : 0;
    let debtRatioScore = dtiRatio <= 30 ? 25 : Math.max(0, 25 - (dtiRatio - 30) * 0.8);

    // 4. Budget Adherence Score (0 - 25)
    const totalBudgetLimit = this.state.budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalBudgetSpent = this.state.budgets.reduce((sum, b) => sum + b.spent, 0);
    let budgetAdherenceScore = 20;
    if (totalBudgetLimit > 0) {
      const usage = (totalBudgetSpent / totalBudgetLimit) * 100;
      if (usage <= 100) budgetAdherenceScore = 25;
      else budgetAdherenceScore = Math.max(0, 25 - (usage - 100) * 0.5);
    }

    const totalScore = Math.round(savingsRateScore + emergencyFundScore + debtRatioScore + budgetAdherenceScore);

    let grade: FinancialHealthScore['grade'] = 'C';
    if (totalScore >= 90) grade = 'S';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 55) grade = 'C';
    else if (totalScore >= 40) grade = 'D';
    else grade = 'F';

    const recs: string[] = [];
    if (monthsCovered < 3) {
      recs.push(`Prioritaskan menambah Dana Darurat hingga minimal 3–6 bulan pengeluaran (saat ini ${monthsCovered.toFixed(1)} bulan).`);
    }
    if (savingsRate < 20) {
      recs.push(`Tingkatkan rasio tabungan bulanan menjadi minimal 20% dari pendapatan (saat ini ${savingsRate.toFixed(1)}%).`);
    }
    if (dtiRatio > 30) {
      recs.push(`Rasio cicilan utang Anda (${dtiRatio.toFixed(1)}%) di atas rekomendasi aman 30%. Pertimbangkan strategi Snowball/Avalanche.`);
    }
    if (recs.length === 0) {
      recs.push('Kesehatan keuangan Anda sangat prima! Pertimbangkan untuk menambah alokasi investasi saham/reksadana.');
    }

    return {
      score: totalScore,
      grade,
      summary: `Skor Kesehatan Finansial Anda: ${totalScore}/100 (Kategori ${grade}). Kas cair menutupi ${monthsCovered.toFixed(1)} bulan pengeluaran.`,
      metrics: {
        savingsRateScore: Math.round(savingsRateScore),
        emergencyFundScore: Math.round(emergencyFundScore),
        debtRatioScore: Math.round(debtRatioScore),
        budgetAdherenceScore: Math.round(budgetAdherenceScore),
        investmentRatioScore: Math.round((totalAssets > 0 ? (liquidAssets / totalAssets) : 0) * 25),
      },
      recommendations: recs,
    };
  }

  // --- AI MODULE PREPARATION DATA PAYLOAD ---
  public getAIAnalysisPayload(): any {
    const cashflow = this.getMonthlyCashflow();
    const netWorth = this.getNetWorth();
    const budgetUsages = this.getBudgetUsages();
    const overspendingAlerts = this.getOverspendingAlerts();
    const upcomingBills = this.getUpcomingBills(30);
    const upcomingSubs = this.getUpcomingSubscriptions(30);
    const goalsForecasts = this.state.goals.map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate,
      forecast: this.calculateGoalForecast(g.id),
    }));

    return {
      user: {
        name: this.state.user.name,
        currency: this.state.user.preferredCurrency,
      },
      cashflowSummary: cashflow,
      netWorthSummary: netWorth,
      budgetAnalysis: {
        totalBudgets: this.state.budgets.length,
        usages: budgetUsages,
        alerts: overspendingAlerts,
      },
      goalsAnalysis: goalsForecasts,
      recurringCommitments: {
        bills: upcomingBills,
        subscriptions: upcomingSubs,
        totalMonthlyBills: upcomingBills.reduce((s, b) => s + b.amount, 0),
        totalMonthlySubs: upcomingSubs.reduce((s, s1) => s1.amount + s, 0),
      },
      healthScore: this.calculateFinancialHealthScore(),
    };
  }

  public getFinancialSummary() {
    return this.getAIAnalysisPayload();
  }

  public getImportLogs(): ImportLog[] {
    return this.state.importLogs || [];
  }

  public addImportLog(log: Omit<ImportLog, 'id' | 'timestamp'>): ImportLog {
    const newLog: ImportLog = {
      ...log,
      id: `log_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    if (!this.state.importLogs) this.state.importLogs = [];
    this.state.importLogs.unshift(newLog);
    this.saveToStorage();
    return newLog;
  }

  // --- EXPORT & RESET ---
  public exportJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.accounts && parsed.transactions) {
        this.state = parsed;
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON:', e);
    }
    return false;
  }

  public getTheme(): string {
    return localStorage.getItem('luxfin_theme') || 'dark';
  }

  public setTheme(theme: string): void {
    localStorage.setItem('luxfin_theme', theme);
  }

  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('luxfin_theme');
    this.state = this.loadFromStorage();
    this.notifyListeners();
  }
}

export const storage = new StorageManager();
