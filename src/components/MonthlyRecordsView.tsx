import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Transaction, Category, Budget } from '../types/index.ts';
import { formatMoney, formatMoneyCompact } from '../lib/currency.ts';

interface MonthlyRecordsViewProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  defaultCurrency?: string;
}

export const MonthlyRecordsView: React.FC<MonthlyRecordsViewProps> = ({
  transactions,
  categories,
  budgets,
  defaultCurrency = 'NGN',
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({
    '2026-10-31': true,
    '2026-10-30': true,
  });

  const monthPrefix = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

  // Previous month prefix for comparison
  const prevMonthPrefix = useMemo(() => {
    const y = parseInt(selectedYear, 10);
    const m = parseInt(selectedMonth, 10);
    const prevDate = new Date(Date.UTC(y, m - 2, 1));
    return `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.transactionDate.startsWith(monthPrefix) && t.type === 'EXPENSE');
  }, [transactions, monthPrefix]);

  // Previous month transactions
  const prevMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.transactionDate.startsWith(prevMonthPrefix) && t.type === 'EXPENSE');
  }, [transactions, prevMonthPrefix]);

  // Total expenses
  const totalMonthlyExpenses = useMemo(() => {
    return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const prevMonthTotal = useMemo(() => {
    return prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  // Comparison
  const monthComparison = useMemo(() => {
    if (prevMonthTotal === 0) {
      return { pct: totalMonthlyExpenses > 0 ? 100 : 0, isMore: totalMonthlyExpenses > 0 };
    }
    const diff = totalMonthlyExpenses - prevMonthTotal;
    const pct = Math.round((Math.abs(diff) / prevMonthTotal) * 100 * 10) / 10;
    return { pct, isMore: diff >= 0 };
  }, [totalMonthlyExpenses, prevMonthTotal]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of monthTransactions) {
      const arr = map.get(t.transactionDate) || [];
      arr.push(t);
      map.set(t.transactionDate, arr);
    }
    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map(date => {
      const txs = map.get(date)!;
      txs.sort((a, b) => (b.transactionTime || '').localeCompare(a.transactionTime || ''));
      const dayTotal = txs.reduce((sum, t) => sum + t.amount, 0);
      return { date, transactions: txs, total: dayTotal };
    });
  }, [monthTransactions]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(parseInt(selectedYear, 10), parseInt(selectedMonth, 10), 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Average daily spending
  const avgDailySpending = useMemo(() => {
    return daysInMonth > 0 ? Math.round(totalMonthlyExpenses / daysInMonth) : 0;
  }, [totalMonthlyExpenses, daysInMonth]);

  // Highest and lowest spending days
  const extremeDays = useMemo(() => {
    if (groupedByDate.length === 0) return { highest: null, lowest: null };
    const sorted = [...groupedByDate].sort((a, b) => b.total - a.total);
    return {
      highest: sorted[0],
      lowest: sorted[sorted.length - 1],
    };
  }, [groupedByDate]);

  // Daily spending chart data for the month
  const dailyChartData = useMemo(() => {
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
      const found = groupedByDate.find(g => g.date === dayStr);
      data.push({
        day: `${day}`,
        fullDate: dayStr,
        expense: found ? found.total / 100 : 0,
      });
    }
    return data;
  }, [daysInMonth, monthPrefix, groupedByDate]);

  // Category breakdown for this month
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTransactions) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const pct = totalMonthlyExpenses > 0 ? Math.round((amount / totalMonthlyExpenses) * 100) : 0;
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          amount,
          percentage: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, categories, totalMonthlyExpenses]);

  // Monthly budget utilization
  const monthlyBudget = budgets.find(b => (!b.categoryId || b.categoryId === 'all') && b.period === 'monthly');
  const budgetLimit = monthlyBudget ? monthlyBudget.amount : 25000000;
  const budgetPct = Math.round((totalMonthlyExpenses / budgetLimit) * 100);

  const toggleExpandDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-5">
      {/* Month & Year Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear} Financial Performance
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={String(idx + 1)}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Monthly Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Monthly Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatMoney(totalMonthlyExpenses, defaultCurrency)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5">
            <span className={monthComparison.isMore ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {monthComparison.pct}% {monthComparison.isMore ? 'increase' : 'decrease'}
            </span>
            <span className="text-neutral-400">vs previous month</span>
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Average Daily Spending</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatMoney(avgDailySpending, defaultCurrency)}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Across {daysInMonth} calendar days
          </span>
        </div>

        {/* Highest Spending Day */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Highest Spending Day</span>
          <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white truncate">
            {extremeDays.highest ? formatMoney(extremeDays.highest.total, defaultCurrency) : '-'}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            {extremeDays.highest?.date || 'No activity'}
          </span>
        </div>

        {/* Monthly Budget Utilization */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Budget Utilization</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {budgetPct}%
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2 font-mono tabular-nums">
            {formatMoney(budgetLimit - totalMonthlyExpenses, defaultCurrency)} remaining
          </span>
        </div>
      </div>

      {/* Daily Spending Chart for the Month */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-1">
          Daily Spending Rhythm for {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear}
        </h3>
        <p className="text-[11px] text-neutral-500 mb-4">
          Day-by-day cash outlay profile
        </p>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChartData}>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => formatMoneyCompact(v, defaultCurrency)}
              />
              <Tooltip
                formatter={(val: any) => [
                  `${defaultCurrency === 'NGN' ? '₦' : defaultCurrency} ${Number(val).toLocaleString()}`,
                  'Day Total',
                ]}
                labelFormatter={(day: any) => `Day ${day} (${monthPrefix}-${String(day).padStart(2, '0')})`}
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="expense" fill="#059669" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">
          Monthly Spending by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categoryBreakdown.map(cat => (
            <div
              key={cat.id}
              className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                  {cat.name}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                  {cat.percentage}% of month
                </span>
              </div>
              <span className="text-xs font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                {formatMoney(cat.amount, defaultCurrency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grouped By Date Hierarchy View (Expandable date cards) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Month Date Breakdown & Ledger
            </h3>
            <p className="text-[11px] text-neutral-500">
              Expand each day to view underlying individual transactions
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-neutral-500">
            {monthTransactions.length} transactions
          </span>
        </div>

        {groupedByDate.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No expenses recorded for this month.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {groupedByDate.map(group => {
              const isExpanded = !!expandedDates[group.date];
              return (
                <div key={group.date} className="transition-colors">
                  {/* Date Group Header */}
                  <div
                    onClick={() => toggleExpandDate(group.date)}
                    className="flex items-center justify-between px-5 py-3 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                          {group.date}
                        </span>
                        <span className="text-[11px] text-neutral-500 ml-2">
                          ({group.transactions.length} expense{group.transactions.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                      {formatMoney(group.total, defaultCurrency)}
                    </div>
                  </div>

                  {/* Expanded Individual Transactions */}
                  {isExpanded && (
                    <div className="bg-white dark:bg-neutral-900 px-5 py-2 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                          {group.transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30">
                              <td className="py-2 pr-3 font-mono tabular-nums text-neutral-400 w-16">
                                {tx.transactionTime || '12:00'}
                              </td>
                              <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-200">
                                {tx.title}
                              </td>
                              <td className="py-2 pr-4 text-neutral-500">
                                {tx.categoryName}
                              </td>
                              <td className="py-2 pr-4 text-neutral-400 text-[11px]">
                                {tx.merchant || tx.description}
                              </td>
                              <td className="py-2 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};
