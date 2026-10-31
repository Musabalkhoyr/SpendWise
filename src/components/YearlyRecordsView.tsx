import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Transaction, Category } from '../types/index.ts';
import { formatMoney } from '../lib/currency.ts';

interface YearlyRecordsViewProps {
  transactions: Transaction[];
  categories: Category[];
  defaultCurrency?: string;
}

export const YearlyRecordsView: React.FC<YearlyRecordsViewProps> = ({
  transactions,
  categories,
  defaultCurrency = 'NGN',
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  // Expand states for hierarchy: Year -> Month -> Day
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    '2026-10': true,
  });
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    '2026-10-31': true,
  });

  const prevYearStr = String(parseInt(selectedYear, 10) - 1);

  // Year transactions
  const yearExpenses = useMemo(() => {
    return transactions.filter(t => t.transactionDate.startsWith(selectedYear) && t.type === 'EXPENSE');
  }, [transactions, selectedYear]);

  const prevYearExpenses = useMemo(() => {
    return transactions.filter(t => t.transactionDate.startsWith(prevYearStr) && t.type === 'EXPENSE');
  }, [transactions, prevYearStr]);

  const totalYearSpent = useMemo(() => {
    return yearExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [yearExpenses]);

  const prevYearSpent = useMemo(() => {
    return prevYearExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [prevYearExpenses]);

  // Year vs Year comparison
  const yearComparison = useMemo(() => {
    if (prevYearSpent === 0) {
      return { pct: totalYearSpent > 0 ? 100 : 0, isMore: totalYearSpent > 0 };
    }
    const diff = totalYearSpent - prevYearSpent;
    const pct = Math.round((Math.abs(diff) / prevYearSpent) * 100 * 10) / 10;
    return { pct, isMore: diff >= 0 };
  }, [totalYearSpent, prevYearSpent]);

  // Hierarchy Data Structure: Year -> 12 Months -> Days -> Transactions
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyHierarchy = useMemo(() => {
    const list = [];
    for (let m = 1; m <= 12; m++) {
      const monthPrefix = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const mExpenses = yearExpenses.filter(t => t.transactionDate.startsWith(monthPrefix));
      const mTotal = mExpenses.reduce((sum, t) => sum + t.amount, 0);

      // Group by days
      const daysMap = new Map<string, Transaction[]>();
      for (const t of mExpenses) {
        const arr = daysMap.get(t.transactionDate) || [];
        arr.push(t);
        daysMap.set(t.transactionDate, arr);
      }

      const daysList = Array.from(daysMap.keys())
        .sort((a, b) => b.localeCompare(a))
        .map(dayStr => {
          const txs = daysMap.get(dayStr)!;
          txs.sort((a, b) => (b.transactionTime || '').localeCompare(a.transactionTime || ''));
          const dayTotal = txs.reduce((s, t) => s + t.amount, 0);
          return { dayStr, total: dayTotal, transactions: txs };
        });

      list.push({
        monthNumber: m,
        monthPrefix,
        name: monthNames[m - 1],
        total: mTotal,
        transactionCount: mExpenses.length,
        days: daysList,
      });
    }
    return list;
  }, [selectedYear, yearExpenses]);

  // Active months (with > 0 spending)
  const activeMonths = useMemo(() => {
    return monthlyHierarchy.filter(m => m.total > 0);
  }, [monthlyHierarchy]);

  // Average monthly spending
  const avgMonthlySpending = useMemo(() => {
    const monthsCount = activeMonths.length || 1;
    return Math.round(totalYearSpent / monthsCount);
  }, [totalYearSpent, activeMonths]);

  // Highest and lowest spending month
  const extremeMonths = useMemo(() => {
    if (activeMonths.length === 0) return { highest: null, lowest: null };
    const sorted = [...activeMonths].sort((a, b) => b.total - a.total);
    return {
      highest: sorted[0],
      lowest: sorted[sorted.length - 1],
    };
  }, [activeMonths]);

  // Category breakdown for the entire year
  const yearlyCategoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of yearExpenses) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const pct = totalYearSpent > 0 ? Math.round((amount / totalYearSpent) * 100) : 0;
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          amount,
          percentage: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [yearExpenses, categories, totalYearSpent]);

  const toggleMonth = (prefix: string) => {
    setExpandedMonths(prev => ({ ...prev, [prefix]: !prev[prefix] }));
  };

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="space-y-5">
      {/* Year Filter Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Year {selectedYear} Comprehensive Ledger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Select Year:</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-semibold"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Yearly KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Yearly Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Yearly Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatMoney(totalYearSpent, defaultCurrency)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            <span className={yearComparison.isMore ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {yearComparison.pct}% {yearComparison.isMore ? 'more' : 'less'}
            </span>
            <span className="text-neutral-400">vs {prevYearStr}</span>
          </div>
        </div>

        {/* Average Monthly Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Average Monthly Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatMoney(avgMonthlySpending, defaultCurrency)}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Normalized monthly burn
          </span>
        </div>

        {/* Peak Spending Month */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Highest Spending Month</span>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white truncate">
            {extremeMonths.highest ? formatMoney(extremeMonths.highest.total, defaultCurrency) : '-'}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2 font-medium">
            {extremeMonths.highest?.name || 'No data'}
          </span>
        </div>

        {/* Lowest Spending Month */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Lowest Spending Month</span>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white truncate">
            {extremeMonths.lowest ? formatMoney(extremeMonths.lowest.total, defaultCurrency) : '-'}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2 font-medium">
            {extremeMonths.lowest?.name || 'No data'}
          </span>
        </div>
      </div>

      {/* Yearly Category Breakdown */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">
          Annual Category Distribution ({selectedYear})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {yearlyCategoryBreakdown.map(cat => (
            <div
              key={cat.id}
              className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                  {cat.name}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                  {cat.percentage}% of year total
                </span>
              </div>
              <span className="text-xs font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                {formatMoney(cat.amount, defaultCurrency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Hierarchical Drilldown: Year -> Month -> Day -> Individual Expense */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Full Financial Hierarchy: Year → Month → Day → Individual Expense</span>
            </h3>
            <p className="text-[11px] text-neutral-500">
              Direct audit trail from yearly totals down to granular itemized receipts
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-neutral-500">
            {yearExpenses.length} Total Verified Records
          </span>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {monthlyHierarchy.map(month => {
            const isMonthExpanded = !!expandedMonths[month.monthPrefix];
            return (
              <div key={month.monthPrefix} className="bg-neutral-50/30 dark:bg-neutral-900/40">
                {/* Level 1: Month Row */}
                <div
                  onClick={() => toggleMonth(month.monthPrefix)}
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isMonthExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {month.name} {selectedYear}
                      </span>
                      <span className="text-[11px] text-neutral-500 ml-2">
                        ({month.transactionCount} transaction{month.transactionCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                    {formatMoney(month.total, defaultCurrency)}
                  </div>
                </div>

                {/* Level 2: Days in Month */}
                {isMonthExpanded && (
                  <div className="pl-6 sm:pl-10 pr-5 pb-3 pt-1 space-y-2">
                    {month.days.length === 0 ? (
                      <div className="text-[11px] text-neutral-400 py-2">
                        No transactions recorded for {month.name}.
                      </div>
                    ) : (
                      month.days.map(day => {
                        const isDayExpanded = !!expandedDays[day.dayStr];
                        return (
                          <div
                            key={day.dayStr}
                            className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs"
                          >
                            {/* Day Header */}
                            <div
                              onClick={() => toggleDay(day.dayStr)}
                              className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                {isDayExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                                )}
                                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono tabular-nums">
                                  {day.dayStr}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  · {day.transactions.length} record{day.transactions.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="text-xs font-semibold font-mono tabular-nums text-neutral-900 dark:text-white">
                                {formatMoney(day.total, defaultCurrency)}
                              </span>
                            </div>

                            {/* Level 3: Individual Transactions Table */}
                            {isDayExpanded && (
                              <div className="p-3 overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                  <thead>
                                    <tr className="text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-1">
                                      <th className="pb-1 pl-1">Time</th>
                                      <th className="pb-1">Title</th>
                                      <th className="pb-1">Category</th>
                                      <th className="pb-1">Merchant / Recipient</th>
                                      <th className="pb-1 text-right pr-1">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                    {day.transactions.map(tx => (
                                      <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                                        <td className="py-1.5 pl-1 font-mono tabular-nums text-neutral-400">
                                          {tx.transactionTime || '12:00'}
                                        </td>
                                        <td className="py-1.5 font-medium text-neutral-900 dark:text-white">
                                          {tx.title}
                                        </td>
                                        <td className="py-1.5 text-neutral-500">
                                          {tx.categoryName}
                                        </td>
                                        <td className="py-1.5 text-neutral-400 truncate max-w-[150px]">
                                          {tx.merchant || tx.description}
                                        </td>
                                        <td className="py-1.5 pr-1 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                                          -{formatMoney(tx.amount, tx.currency)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
