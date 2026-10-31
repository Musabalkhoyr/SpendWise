import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
} from 'lucide-react';
import { Transaction, Category } from '../types/index.ts';
import { formatMoney } from '../lib/currency.ts';

interface DailyRecordsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddExpense: () => void;
  defaultCurrency?: string;
}

export const DailyRecordsView: React.FC<DailyRecordsViewProps> = ({
  transactions,
  categories,
  onOpenAddExpense,
  defaultCurrency = 'NGN',
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-10-31');

  // Change date by step
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Get previous day string
  const prevDateStr = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, [selectedDate]);

  // Current day transactions
  const dayTransactions = useMemo(() => {
    return transactions
      .filter(t => t.transactionDate === selectedDate && t.type === 'EXPENSE')
      .sort((a, b) => (a.transactionTime || '00:00').localeCompare(b.transactionTime || '00:00'));
  }, [transactions, selectedDate]);

  // Total amount spent today
  const totalSpent = useMemo(() => {
    return dayTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  // Previous day expenses
  const prevDaySpent = useMemo(() => {
    return transactions
      .filter(t => t.transactionDate === prevDateStr && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, prevDateStr]);

  // Percentage change vs previous day
  const comparison = useMemo(() => {
    if (prevDaySpent === 0) {
      return { pct: totalSpent > 0 ? 100 : 0, isMore: totalSpent > 0 };
    }
    const diff = totalSpent - prevDaySpent;
    const pct = Math.round((Math.abs(diff) / prevDaySpent) * 100 * 10) / 10;
    return { pct, isMore: diff >= 0 };
  }, [totalSpent, prevDaySpent]);

  // First and last transaction time
  const timeRange = useMemo(() => {
    if (dayTransactions.length === 0) return { first: '-', last: '-' };
    const times = dayTransactions.map(t => t.transactionTime).filter(Boolean);
    if (times.length === 0) return { first: '-', last: '-' };
    times.sort();
    return { first: times[0], last: times[times.length - 1] };
  }, [dayTransactions]);

  // Breakdown by category for this day
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of dayTransactions) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#64748b',
          amount,
          percentage: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [dayTransactions, categories, totalSpent]);

  const formattedHeaderDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="space-y-5">
      {/* Date Navigator Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {formattedHeaderDate}
            </span>
          </div>
          <button
            onClick={() => handleShiftDate(1)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
          />
          <button
            onClick={() => setSelectedDate('2026-10-31')}
            className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            Jump to Today
          </button>
        </div>
      </div>

      {/* Daily Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Day Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatMoney(totalSpent, defaultCurrency)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {comparison.isMore ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {comparison.pct}% more
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {comparison.pct}% less
              </span>
            )}
            <span className="text-neutral-400">vs prev day</span>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total Transactions</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {dayTransactions.length}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Individually verified entries
          </span>
        </div>

        {/* Activity Window */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">First & Last Transaction</span>
          <div className="text-base font-semibold font-mono tabular-nums text-neutral-900 dark:text-white">
            {timeRange.first} — {timeRange.last}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2">
            Timeline window
          </span>
        </div>

        {/* Top Category of the day */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Top Category</span>
          <div className="text-base font-semibold text-neutral-900 dark:text-white truncate">
            {categoryBreakdown[0]?.name || 'No transactions'}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-2 font-mono tabular-nums">
            {categoryBreakdown[0] ? `${categoryBreakdown[0].percentage}% of day total` : '-'}
          </span>
        </div>
      </div>

      {/* Category Breakdown for the Day */}
      {categoryBreakdown.length > 0 && (
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">
            Spending by Category for {selectedDate}
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
                    {cat.percentage}% of daily total
                  </span>
                </div>
                <span className="text-xs font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                  {formatMoney(cat.amount, defaultCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Individual Transaction Records Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Daily Recorded Transactions
            </h3>
            <p className="text-[11px] text-neutral-500">
              {dayTransactions.length} individual items on {selectedDate}
            </p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No expenses recorded on this day. Click "Add Expense" or use Quick Entry to record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="py-2.5 pl-4">Time</th>
                  <th className="py-2.5">Expense Title</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Payment Method</th>
                  <th className="py-2.5">Merchant / Notes</th>
                  <th className="py-2.5 text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {dayTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {tx.transactionTime || '12:00'}
                    </td>
                    <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                      {tx.title}
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-300">
                      {tx.categoryName}
                    </td>
                    <td className="py-3 text-neutral-500">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 text-neutral-500 truncate max-w-[200px]">
                      {tx.merchant || tx.description}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                      -{formatMoney(tx.amount, tx.currency)}
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
