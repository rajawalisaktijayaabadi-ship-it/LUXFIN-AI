import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { FinancialEngineService } from '../services/financialEngineService';

export function useFinancialData() {
  const [state, setState] = useState(() => storage.getState());

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setState(storage.getState());
    });
    return unsubscribe;
  }, []);

  const netWorthData = FinancialEngineService.calculateNetWorth(
    state.accounts,
    state.investments,
    state.debts
  );

  const cashflowData = FinancialEngineService.calculateMonthlyCashflow(state.transactions);

  const healthScore = FinancialEngineService.calculateFinancialHealthScore(
    cashflowData.income,
    cashflowData.expense,
    netWorthData.netWorth,
    state.accounts.filter((a) => a.type === 'BANK' || a.type === 'E_WALLET' || a.type === 'CASH').reduce((s, a) => s + a.balance, 0),
    netWorthData.totalLiabilities,
    state.budgets
  );

  return {
    state,
    accounts: state.accounts,
    transactions: state.transactions,
    goals: state.goals,
    budgets: state.budgets,
    debts: state.debts,
    investments: state.investments,
    bills: state.bills,
    user: state.user,
    netWorthData,
    cashflowData,
    healthScore,
  };
}
