import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardSummary, Transaction, Category } from '../types/index.ts';
import { formatMoney, formatMoneyCompact } from '../lib/currency.ts';
import { QuickExpenseInput } from './QuickExpenseInput.tsx';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  recentTransactions: Transaction[];
  categories: Category[];
  onOpenAddExpense: () => void;
  onSelectView: (view: string) => void;
  onRefreshData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  recentTransactions,
  categories,
  onOpenAddExpense,
  onSelectView,
  onRefreshData,
}) => {
  if (!summary) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading financial dashboard...
      </div>
    );
  }

  const currency = summary.currency || 'NGN';

  return (
    <div className="space-y-6">
      {/* Quick Entry Banner */}
      <QuickExpenseInput
        categories={categories}
        onTransactionSaved={onRefreshData}
        defaultCurrency={currency}
      />

      {/* Financial Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Today's Expenses</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold tabular-nums font-mono text-neutral-900 dark:text-white">
            {summary.todayExpenses.formatted}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {summary.todayExpenses.isIncrease ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {summary.todayExpenses.percentageChange}% more
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {summary.todayExpenses.percentageChange}% less
              </span>
            )}
            <span className="text-neutral-400 dark:text-neutral-500">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: This Week's Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">This Week</span>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold tabular-nums font-mono text-neutral-900 dark:text-white">
            {summary.weekExpenses.formatted}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {summary.weekExpenses.isIncrease ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {summary.weekExpenses.percentageChange}% more
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {summary.weekExpenses.percentageChange}% less
              </span>
            )}
            <span className="text-neutral-400 dark:text-neutral-500">vs last 7 days</span>
          </div>
        </div>

        {/* Card 3: This Month's Expenses */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">This Month</span>
            <TrendingDown className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold tabular-nums font-mono text-neutral-900 dark:text-white">
            {summary.monthExpenses.formatted}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {summary.monthExpenses.isIncrease ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {summary.monthExpenses.percentageChange}% more
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {summary.monthExpenses.percentageChange}% less
              </span>
            )}
            <span className="text-neutral-400 dark:text-neutral-500">vs last month</span>
          </div>
        </div>

        {/* Card 4: Month Income & Net Cash Flow */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Month Income</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
            {summary.monthIncome.formatted}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Net Flow:</span>
            <span className={`tabular-nums font-mono font-semibold ${
              summary.netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatMoney(summary.netCashFlow, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary KPI Bar: Year total, Budget Remaining & Savings Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Total Spent in 2026</span>
            <span className="text-sm font-bold tabular-nums font-mono text-neutral-900 dark:text-white">
              {summary.yearExpenses.formatted}
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-mono tabular-nums">
            {summary.yearExpenses.percentageChange}% vs 2025
          </span>
        </div>

        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Remaining Monthly Budget</span>
            <span className={`text-sm font-bold tabular-nums font-mono ${
              summary.remainingBudget >= 0 ? 'text-neutral-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatMoney(summary.remainingBudget, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
              {summary.budgetUtilizationPct}%
            </span>
            <span className="text-[10px] text-neutral-400 block">used</span>
          </div>
        </div>

        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Monthly Savings Rate</span>
            <span className="text-sm font-bold tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
              {summary.savingsRate}%
            </span>
          </div>
          <PiggyBank className="w-5 h-5 text-emerald-500/80" />
        </div>
      </div>

      {/* Dashboard Charts: Grid of 6 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Daily Spending Trend (Last 14 Days) */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                Daily Spending Trend
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                14-day daily transaction pattern
              </p>
            </div>
            <button
              onClick={() => onSelectView('daily')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Daily View →
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.dailyTrend}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dayLabel"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => formatMoneyCompact(v, currency)}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${currency === 'NGN' ? '₦' : currency} ${Number(value).toLocaleString()}`,
                    'Daily Total',
                  ]}
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown Donut */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                Expense Breakdown by Category
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Share of monthly expenditure
              </p>
            </div>
            <button
              onClick={() => onSelectView('monthly')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Breakdown →
            </button>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            {summary.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    dataKey="totalAmount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      formatMoney(Number(val), currency),
                      'Spent',
                    ]}
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(val, entry: any) => (
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        {val} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-neutral-400">No expenses recorded yet</div>
            )}
          </div>
        </div>

        {/* Chart 3: Monthly Spending Trend (Full Year) */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                Monthly Spending Trend (2026)
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                12-month annual progression
              </p>
            </div>
            <button
              onClick={() => onSelectView('yearly')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Yearly View →
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyTrend}>
                <XAxis
                  dataKey="monthName"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => formatMoneyCompact(v, currency)}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `${currency === 'NGN' ? '₦' : currency} ${Number(val).toLocaleString()}`,
                    'Expenses',
                  ]}
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="expense" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Income vs Expenses Chart */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                Income vs Expenses Comparison
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Monthly cash inflow compared with outflow
              </p>
            </div>
            <button
              onClick={() => onSelectView('income')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Income Records →
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyTrend}>
                <XAxis
                  dataKey="monthName"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => formatMoneyCompact(v, currency)}
                />
                <Tooltip
                  formatter={(val: any) => [
                    `${currency === 'NGN' ? '₦' : currency} ${Number(val).toLocaleString()}`,
                  ]}
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Utilization Progress Section */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Budget Utilization & Threshold Status
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Live consumption against configured limits
            </p>
          </div>
          <button
            onClick={() => onSelectView('budgets')}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Manage Budgets →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {summary.budgetStatuses.map(b => (
            <div
              key={b.budgetId}
              className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {b.categoryName}
                </span>
                <span className={`text-[11px] font-semibold tabular-nums ${
                  b.status === 'exceeded'
                    ? 'text-rose-600 dark:text-rose-400'
                    : b.status === 'critical'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}>
                  {b.percentageUsed}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    b.status === 'exceeded'
                      ? 'bg-rose-500'
                      : b.status === 'critical'
                      ? 'bg-amber-500'
                      : b.percentageUsed >= 50
                      ? 'bg-emerald-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono tabular-nums pt-0.5">
                <span>Spent: {formatMoney(b.spent, currency)}</span>
                <span>Cap: {formatMoney(b.limit, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Individual Transactions Ledger Preview */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Recent Recorded Expenses & Inflow
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Every expense is saved individually as a separate transaction
            </p>
          </div>
          <button
            onClick={() => onSelectView('transactions')}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All ({recentTransactions.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                <th className="pb-2 pl-1">Date & Time</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Payment Method</th>
                <th className="pb-2 text-right pr-1">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {recentTransactions.slice(0, 6).map(tx => (
                <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-2.5 pl-1 font-mono tabular-nums text-neutral-500">
                    {tx.transactionDate} <span className="text-[10px] text-neutral-400">{tx.transactionTime}</span>
                  </td>
                  <td className="py-2.5 font-medium text-neutral-900 dark:text-white">
                    <div className="truncate max-w-[220px]">{tx.title}</div>
                    {tx.merchant && tx.merchant !== tx.title && (
                      <div className="text-[10px] text-neutral-400 truncate">{tx.merchant}</div>
                    )}
                  </td>
                  <td className="py-2.5 text-neutral-600 dark:text-neutral-400">
                    {tx.categoryName}
                  </td>
                  <td className="py-2.5 text-neutral-500 dark:text-neutral-400">
                    {tx.paymentMethod}
                  </td>
                  <td className={`py-2.5 pr-1 text-right font-mono tabular-nums font-semibold ${
                    tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
