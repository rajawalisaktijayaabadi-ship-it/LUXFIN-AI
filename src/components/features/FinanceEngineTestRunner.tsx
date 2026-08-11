import React, { useState, useEffect } from 'react';
import { FinanceEngineTestSuite, TestCaseResult } from '../../engine/financeEngineTests';
import { Play, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ShieldCheck, Calculator, ArrowRight, Cpu, Activity } from 'lucide-react';

export const FinanceEngineTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const runSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = FinanceEngineTestSuite.runAllTests();
      setTestResults(results);
      setIsRunning(false);
    }, 300);
  };

  useEffect(() => {
    runSuite();
  }, []);

  const totalTests = testResults.length;
  const passedTests = testResults.filter((t) => t.passed).length;
  const failedTests = testResults.filter((t) => !t.passed).length;
  const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const categories = ['ALL', 'ARITHMETIC', 'REFUNDS', 'TRANSFERS', 'BUDGETS', 'NET_WORTH', 'SECURITY'];

  const filteredResults = selectedCategory === 'ALL'
    ? testResults
    : testResults.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Core Finance Engine Test Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Deterministic Financial Calculations Suite
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Verifies zero floating-point arithmetic drift, refund credit logic, internal transfer non-duplication, budget thresholds, net worth formula, and database multi-tenant user security isolation.
            </p>
          </div>

          <button
            onClick={runSuite}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02] shrink-0"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Executing Tests...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Run Test Suite
              </>
            )}
          </button>
        </div>

        {/* Scorecard Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Total Test Cases</div>
            <div className="text-2xl font-bold text-white mt-1">{totalTests}</div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/30">
            <div className="text-xs text-emerald-300 font-medium">Passed</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              {passedTests}
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="bg-rose-950/40 rounded-xl p-4 border border-rose-500/30">
            <div className="text-xs text-rose-300 font-medium">Failed</div>
            <div className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-2">
              {failedTests}
              {failedTests > 0 ? (
                <XCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <span className="text-xs font-normal text-slate-400">0 errors</span>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/40 rounded-xl p-4 border border-indigo-500/30">
            <div className="text-xs text-indigo-300 font-medium">Accuracy Pass Rate</div>
            <div className="text-2xl font-bold text-indigo-300 mt-1">{passPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredResults.map((tc) => (
          <div
            key={tc.id}
            className={`rounded-xl p-5 transition-all border ${
              tc.passed
                ? 'bg-slate-900/90 border-emerald-500/30 text-white shadow-sm hover:border-emerald-500/50'
                : 'bg-rose-950/30 border-rose-500/50 text-white shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {tc.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base text-slate-100">{tc.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                      {tc.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({tc.durationMs}ms)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tc.description}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Actual:</div>
                <div className={tc.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {typeof tc.actual === 'object' ? JSON.stringify(tc.actual) : String(tc.actual)}
                </div>
              </div>
            </div>

            {!tc.passed && tc.errorMessage && (
              <div className="mt-3 p-3 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-200 text-xs font-mono">
                Error Details: {tc.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
