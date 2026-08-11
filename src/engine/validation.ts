/**
 * LUXFIN AI - Financial Entity Validation & Indexing Engine
 * Enforces business rules, date formats, non-empty labels, and amount boundaries.
 */

import { Transaction, Account, Budget, FinancialGoal, Debt } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FinancialValidationEngine {
  /**
   * Validate Transaction entity
   */
  public static validateTransaction(tx: Partial<Transaction>): ValidationResult {
    const errors: string[] = [];

    if (!tx.amount || tx.amount <= 0) {
      errors.push('Transaction amount must be a positive number greater than 0.');
    }

    if (!tx.accountId) {
      errors.push('Source Account ID is required.');
    }

    if (tx.type === 'TRANSFER') {
      if (!tx.targetAccountId) {
        errors.push('Target Account ID is required for transfer transactions.');
      }
      if (tx.accountId === tx.targetAccountId) {
        errors.push('Source and Target accounts cannot be the same account.');
      }
    }

    if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      errors.push('Transaction date must be in YYYY-MM-DD format.');
    }

    if (tx.status && !['COMPLETED', 'PENDING', 'REFUNDED', 'REVERSED', 'CANCELLED'].includes(tx.status)) {
      errors.push(`Invalid transaction status '${tx.status}'.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Account entity
   */
  public static validateAccount(account: Partial<Account>): ValidationResult {
    const errors: string[] = [];

    if (!account.name || account.name.trim().length === 0) {
      errors.push('Account name cannot be empty.');
    }

    if (!account.provider || account.provider.trim().length === 0) {
      errors.push('Account provider is required.');
    }

    if (typeof account.balance !== 'number' || isNaN(account.balance)) {
      errors.push('Account balance must be a valid number.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Budget entity
   */
  public static validateBudget(budget: Partial<Budget>): ValidationResult {
    const errors: string[] = [];

    if (!budget.monthlyLimit || budget.monthlyLimit <= 0) {
      errors.push('Budget monthly limit must be greater than 0.');
    }

    if (!budget.categoryId) {
      errors.push('Category ID is required for a budget.');
    }

    if (!budget.period || !/^\d{4}-\d{2}$/.test(budget.period)) {
      errors.push('Budget period must be in YYYY-MM format (e.g., 2026-08).');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Goal entity
   */
  public static validateGoal(goal: Partial<FinancialGoal>): ValidationResult {
    const errors: string[] = [];

    if (!goal.title || goal.title.trim().length === 0) {
      errors.push('Goal title is required.');
    }

    if (!goal.targetAmount || goal.targetAmount <= 0) {
      errors.push('Goal target amount must be greater than 0.');
    }

    if (goal.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(goal.targetDate)) {
      errors.push('Target date must be in YYYY-MM-DD format.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Debt entity
   */
  public static validateDebt(debt: Partial<Debt>): ValidationResult {
    const errors: string[] = [];

    if (!debt.personOrInstitution || debt.personOrInstitution.trim().length === 0) {
      errors.push('Person or Institution name is required.');
    }

    if (!debt.originalAmount || debt.originalAmount <= 0) {
      errors.push('Debt original amount must be greater than 0.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
