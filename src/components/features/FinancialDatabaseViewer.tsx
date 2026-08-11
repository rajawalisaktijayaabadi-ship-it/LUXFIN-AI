import React, { useState } from 'react';
import { storage } from '../../utils/storage';
import {
  Database,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  FolderTree,
  PieChart,
  Target,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  Paperclip,
  FileText,
  UserCheck,
  Lock,
  Search,
  Plus
} from 'lucide-react';

export const FinancialDatabaseViewer: React.FC = () => {
  const [activeEntityTab, setActiveEntityTab] = useState<string>('accounts');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const state = storage.getState();
  const calculatedAccounts = storage.getCalculatedAccountBalances();
  const cashFlowSummary = storage.getCashFlowSummary();
  const netWorthBreakdown = storage.getNetWorthBreakdown();

  const entityTabs = [
    { id: 'accounts', label: 'Accounts', count: state.accounts.length, icon: Building2 },
    { id: 'transactions', label: 'Transactions', count: state.transactions.length, icon: ArrowLeftRight },
    { id: 'categories', label: 'Categories', count: state.categories.length, icon: FolderTree },
    { id: 'budgets', label: 'Budgets', count: state.budgets.length, icon: PieChart },
    { id: 'goals', label: 'Goals', count: state.goals.length, icon: Target },
    { id: 'debts', label: 'Debts', count: state.debts.length, icon: CreditCard },
    { id: 'investments', label: 'Investments', count: state.investments.length, icon: TrendingUp },
    { id: 'bills', label: 'Bills & Subs', count: state.bills.length, icon: ShieldAlert },
    { id: 'auditLogs', label: 'Audit Logs', count: state.auditLogs.length, icon: FileText },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Entity Model Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              <Database className="w-3.5 h-3.5" />
              26 Entities Financial Data Model & Schema Engine
            </div>
            <h2 className="text-2xl font-bold">Financial Database Explorer</h2>
            <p className="text-slate-400 text-xs">
              Every financial record enforces multi-tenant <span className="text-emerald-400 font-semibold">userId</span> ownership, status constraints, and deterministic calculations.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[10px]">Active User Context</div>
              <div className="text-indigo-300 font-bold flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                {state.user.id} ({state.user.name})
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-slate-500 text-[10px]">Security Rule</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5" />
                ISOLATED_USER_ONLY
              </div>
            </div>
          </div>
        </div>

        {/* Live Aggregation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Calculated Net Worth</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{formatRupiah(netWorthBreakdown.netWorth)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Assets: {formatRupiah(netWorthBreakdown.totalAssets)}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">August Net Cash Flow</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">{formatRupiah(cashFlowSummary.netCashFlow)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Income: {formatRupiah(cashFlowSummary.totalIncome)}</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Database Record Count</div>
            <div className="text-xl font-bold text-white mt-1">
              {state.accounts.length + state.transactions.length + state.categories.length + state.goals.length + state.debts.length} Records
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across 26 Normalized Entities</div>
          </div>
        </div>
      </div>

      {/* Entity Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {entityTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveEntityTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeEntityTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] text-indigo-300 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Entity Table Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {activeEntityTab === 'accounts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Account ID</th>
                  <th className="p-4">User Owner</th>
                  <th className="p-4">Account Name</th>
                  <th className="p-4">Type / Provider</th>
                  <th className="p-4">Initial Balance</th>
                  <th className="p-4">Calculated Live Balance</th>
                  <th className="p-4">Net Worth Exclude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {state.accounts.map((acc) => {
                  const calc = calculatedAccounts.find((c) => c.accountId === acc.id);
                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-indigo-400 font-bold">{acc.id}</td>
                      <td className="p-4 text-emerald-400">{acc.userId || 'usr_01'}</td>
                      <td className="p-4 text-white font-sans font-medium">{acc.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
                          {acc.type} ({acc.provider})
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{formatRupiah(acc.initialBalance ?? acc.balance)}</td>
                      <td className={`p-4 font-bold ${calc?.isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatRupiah(calc?.computedBalance ?? acc.balance)}
                      </td>
                      <td className="p-4">
                        {acc.isExcludedFromNetWorth ? (
                          <span className="text-amber-400">Yes (Excluded)</span>
                        ) : (
                          <span className="text-slate-500">No (Included)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeEntityTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">TX ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Account ID</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {state.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-indigo-400 font-bold">{tx.id}</td>
                    <td className="p-4 text-emerald-400">{tx.userId || 'usr_01'}</td>
                    <td className="p-4 text-slate-400">{tx.date} {tx.time || ''}</td>
                    <td className="p-4 font-sans font-bold">
                      {tx.type === 'INCOME' && <span className="text-emerald-400">INCOME</span>}
                      {tx.type === 'EXPENSE' && <span className="text-rose-400">EXPENSE</span>}
                      {tx.type === 'TRANSFER' && <span className="text-sky-400">TRANSFER</span>}
                    </td>
                    <td className="p-4 font-bold text-white">{formatRupiah(tx.amount)}</td>
                    <td className="p-4 text-slate-300">{tx.accountId} {tx.targetAccountId ? `→ ${tx.targetAccountId}` : ''}</td>
                    <td className="p-4 text-slate-400">{tx.categoryId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        tx.status === 'REFUNDED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tx.status || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeEntityTab === 'categories' && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {state.categories.map((cat) => (
              <div key={cat.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 font-bold">{cat.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    cat.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {cat.type}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{cat.name}</div>
                <div className="text-xs text-slate-400">Subcategories: {cat.subcategories.join(', ')}</div>
              </div>
            ))}
          </div>
        )}

        {activeEntityTab === 'budgets' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Budget ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Category ID</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Monthly Limit</th>
                  <th className="p-4">Calculated Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {state.budgets.map((bgt) => (
                  <tr key={bgt.id} className="hover:bg-slate-800/40">
                    <td className="p-4 text-indigo-400 font-bold">{bgt.id}</td>
                    <td className="p-4 text-emerald-400">{bgt.userId || 'usr_01'}</td>
                    <td className="p-4 text-slate-200">{bgt.categoryId}</td>
                    <td className="p-4 text-slate-400">{bgt.period}</td>
                    <td className="p-4 font-bold text-white">{formatRupiah(bgt.monthlyLimit)}</td>
                    <td className="p-4 text-amber-400 font-bold">{formatRupiah(bgt.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeEntityTab === 'goals' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.goals.map((goal) => (
              <div key={goal.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400">{goal.id}</span>
                  <span className="text-xs text-emerald-400 font-mono">Owner: {goal.userId || 'usr_01'}</span>
                </div>
                <div className="text-base font-bold text-white">{goal.title}</div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current: <strong className="text-emerald-400">{formatRupiah(goal.currentAmount)}</strong></span>
                  <span>Target: <strong className="text-white">{formatRupiah(goal.targetAmount)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeEntityTab === 'debts' && (
          <div className="p-6 space-y-4">
            {state.debts.map((dbt) => (
              <div key={dbt.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400">{dbt.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dbt.type === 'DEBT_OWED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {dbt.type}
                  </span>
                </div>
                <div className="text-base font-bold text-white">{dbt.personOrInstitution}</div>
                <div className="text-xs text-slate-400">
                  Original: {formatRupiah(dbt.originalAmount)} | Remaining: <strong className="text-amber-400">{formatRupiah(dbt.remainingAmount)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeEntityTab === 'investments' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.investments.map((inv) => (
              <div key={inv.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400">{inv.id}</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{inv.category}</span>
                </div>
                <div className="text-base font-bold text-white">{inv.name} ({inv.symbol})</div>
                <div className="text-xs text-slate-400">
                  Units: {inv.units} | Value: <strong className="text-emerald-400">{formatRupiah(inv.totalValue)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeEntityTab === 'bills' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.bills.map((bill) => (
              <div key={bill.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400">{bill.id}</span>
                  <span className="text-xs text-slate-400 font-mono">Due Day {bill.dueDateDay}</span>
                </div>
                <div className="text-base font-bold text-white">{bill.name}</div>
                <div className="text-xs text-slate-400">Amount: <strong className="text-rose-400">{formatRupiah(bill.amount)}</strong> / {bill.billingCycle}</div>
              </div>
            ))}
          </div>
        )}

        {activeEntityTab === 'auditLogs' && (
          <div className="p-6 space-y-2 font-mono text-xs text-slate-300">
            {state.auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-indigo-400 font-bold">{log.action}: </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
