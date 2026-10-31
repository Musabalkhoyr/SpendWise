import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PiggyBank,
  CheckCircle,
} from 'lucide-react';
import { Transaction, Category } from '../types/index.ts';
import { formatMoney } from '../lib/currency.ts';

interface IncomeViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddIncome: () => void;
  defaultCurrency?: string;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  transactions,
  categories,
  onOpenAddIncome,
  defaultCurrency = 'NGN',
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Filter incomes
  const incomeTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === 'INCOME' && (!selectedMonth || t.transactionDate.startsWith(selectedMonth)))
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }, [transactions, selectedMonth]);

  // Expenses in the same month for net cash flow calculation
  const monthExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && (!selectedMonth || t.transactionDate.startsWith(selectedMonth)))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [incomeTransactions]);

  const netCashFlow = totalIncome - monthExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

  // Group by income category
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of incomeTransactions) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
        return {
          id: catId,
          name: cat?.name || 'Other Income',
          amount,
          percentage: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [incomeTransactions, categories, totalIncome]);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Income & Net Cash Flow Manager
            </h2>
            <p className="text-[11px] text-neutral-500">
              Track earnings separately to compute accurate savings and liquidity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
          >
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="">All Historical</option>
          </select>

          <button
            onClick={onOpenAddIncome}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Income</span>
          </button>
        </div>
      </div>

      {/* Net Cash Flow Formula Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Period Income</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            +{formatMoney(totalIncome, defaultCurrency)}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            {incomeTransactions.length} recorded inflow entries
          </span>
        </div>

        {/* Total Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Period Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            -{formatMoney(monthExpenses, defaultCurrency)}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Calculated from ledger
          </span>
        </div>

        {/* Net Cash Flow (Income - Expenses) */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Net Cash Flow</span>
          <div className={`text-xl font-bold font-mono tabular-nums ${
            netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {netCashFlow >= 0 ? '+' : ''}{formatMoney(netCashFlow, defaultCurrency)}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Formula: Income − Expenses
          </span>
        </div>

        {/* Savings Rate */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Savings Retention Rate</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {savingsRate}%
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Of total period income retained
          </span>
        </div>
      </div>

      {/* Income Streams by Category */}
      {incomeByCategory.length > 0 && (
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">
            Income Streams & Sources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {incomeByCategory.map(cat => (
              <div
                key={cat.id}
                className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                    {cat.percentage}% of total inflow
                  </span>
                </div>
                <span className="text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{formatMoney(cat.amount, defaultCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Income Transactions Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
            Recorded Income Entries
          </h3>
          <span className="text-xs font-mono tabular-nums text-neutral-500">
            {incomeTransactions.length} records
          </span>
        </div>

        {incomeTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No income transactions recorded for this period. Click "Record Income" to log salary, business or freelance revenue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="py-2.5 pl-4">Date</th>
                  <th className="py-2.5">Source / Title</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Deposit Method</th>
                  <th className="py-2.5">Notes</th>
                  <th className="py-2.5 text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {incomeTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {tx.transactionDate}
                    </td>
                    <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                      <div>{tx.title}</div>
                      {tx.merchant && tx.merchant !== tx.title && (
                        <div className="text-[10px] text-neutral-400">{tx.merchant}</div>
                      )}
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-300">
                      {tx.categoryName}
                    </td>
                    <td className="py-3 text-neutral-500">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 text-neutral-500 truncate max-w-[200px]">
                      {tx.description || tx.notes || '-'}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{formatMoney(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
