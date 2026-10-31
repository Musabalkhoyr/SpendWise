import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Budget, Category, Transaction } from '../types/index.ts';
import { formatMoney, toMinorUnits, toMajorUnits } from '../lib/currency.ts';
import { api } from '../lib/api.ts';

interface BudgetViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onBudgetsUpdated: () => void;
  defaultCurrency?: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  onBudgetsUpdated,
  defaultCurrency = 'NGN',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form states
  const [categoryId, setCategoryId] = useState('all');
  const [amountStr, setAmountStr] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [thresholds, setThresholds] = useState<number[]>([50, 75, 90, 100]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategoryId('all');
    setAmountStr('');
    setPeriod('monthly');
    setStartDate('2026-10-01');
    setEndDate('2026-10-31');
    setThresholds([50, 75, 90, 100]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId || 'all');
    setAmountStr(String(toMajorUnits(b.amount)));
    setPeriod(b.period);
    setStartDate(b.startDate);
    setEndDate(b.endDate);
    setThresholds(b.alertThresholds || [50, 75, 90, 100]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      await api.deleteBudget(id);
      onBudgetsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amountStr.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget.id, {
          categoryId: categoryId === 'all' ? undefined : categoryId,
          amount: toMinorUnits(amountNum),
          period,
          startDate,
          endDate,
          alertThresholds: thresholds,
        });
      } else {
        await api.createBudget({
          categoryId: categoryId === 'all' ? undefined : categoryId,
          amount: toMinorUnits(amountNum),
          currency: defaultCurrency,
          period,
          startDate,
          endDate,
          alertThresholds: thresholds,
        });
      }
      setIsModalOpen(false);
      onBudgetsUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate actual spending for each budget
  const budgetCalculations = budgets.map(b => {
    let spent = 0;
    if (b.categoryId && b.categoryId !== 'all') {
      spent = transactions
        .filter(t => t.type === 'EXPENSE' && t.categoryId === b.categoryId && t.transactionDate >= b.startDate && t.transactionDate <= b.endDate)
        .reduce((sum, t) => sum + t.amount, 0);
    } else {
      spent = transactions
        .filter(t => t.type === 'EXPENSE' && t.transactionDate >= b.startDate && t.transactionDate <= b.endDate)
        .reduce((sum, t) => sum + t.amount, 0);
    }

    const percentageUsed = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    const remaining = b.amount - spent;

    let alertLevel: 'none' | '50' | '75' | '90' | 'exceeded' = 'none';
    if (percentageUsed >= 100) alertLevel = 'exceeded';
    else if (percentageUsed >= 90) alertLevel = '90';
    else if (percentageUsed >= 75) alertLevel = '75';
    else if (percentageUsed >= 50) alertLevel = '50';

    return {
      ...b,
      spent,
      remaining,
      percentageUsed,
      alertLevel,
    };
  });

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Budget Management & Active Alert Thresholds
            </h2>
            <p className="text-[11px] text-neutral-500">
              Set spending limits and receive automated warnings at 50%, 75%, 90% and 100% capacity
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Budget</span>
        </button>
      </div>

      {/* Active Threshold Alert Banners (if any exceeded or critical) */}
      {budgetCalculations.some(b => b.alertLevel === 'exceeded' || b.alertLevel === '90') && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
              Budget Threshold Warnings Detected
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300 text-[11px]">
              {budgetCalculations
                .filter(b => b.alertLevel === 'exceeded' || b.alertLevel === '90')
                .map(b => (
                  <li key={b.id}>
                    <strong>{b.categoryName}</strong> is at{' '}
                    <span className="font-mono tabular-nums">{b.percentageUsed}%</span> of capacity{' '}
                    ({b.alertLevel === 'exceeded' ? 'EXCEEDED' : '90% critical threshold reached'})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetCalculations.map(b => (
          <div
            key={b.id}
            className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  {b.categoryName}
                </span>
                <span className="text-[11px] text-neutral-400 capitalize">
                  {b.period} Budget · {b.startDate} to {b.endDate}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md"
                  title="Edit budget"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBudget(b.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md"
                  title="Delete budget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Numbers: Limit vs Spent */}
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-neutral-400 block">Spent</span>
                <span className="text-base font-bold text-neutral-900 dark:text-white">
                  {formatMoney(b.spent, b.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block">Budget Cap</span>
                <span className="text-base font-bold text-neutral-500">
                  {formatMoney(b.amount, b.currency)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    b.alertLevel === 'exceeded'
                      ? 'bg-rose-500'
                      : b.alertLevel === '90'
                      ? 'bg-amber-500'
                      : b.alertLevel === '75'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                />
              </div>

              {/* Threshold tick marks */}
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>0%</span>
                <span className={b.percentageUsed >= 50 ? 'font-bold text-emerald-600' : ''}>50%</span>
                <span className={b.percentageUsed >= 75 ? 'font-bold text-amber-500' : ''}>75%</span>
                <span className={b.percentageUsed >= 90 ? 'font-bold text-amber-600' : ''}>90%</span>
                <span className={b.percentageUsed >= 100 ? 'font-bold text-rose-600' : ''}>100%</span>
              </div>
            </div>

            {/* Remaining amount & status tag */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">
                Remaining:{' '}
                <strong className={`font-mono tabular-nums ${b.remaining < 0 ? 'text-rose-600' : 'text-neutral-800 dark:text-neutral-200'}`}>
                  {formatMoney(b.remaining, b.currency)}
                </strong>
              </span>

              <span className={`text-[11px] font-semibold ${
                b.alertLevel === 'exceeded'
                  ? 'text-rose-600 dark:text-rose-400'
                  : b.alertLevel === '90'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {b.percentageUsed}% Used
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {editingBudget ? 'Edit Spending Budget' : 'Configure New Budget'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Budget Scope *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                >
                  <option value="all">Overall Monthly / Total Budget</option>
                  {categories.filter(c => c.type === 'EXPENSE').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Limit Amount ({defaultCurrency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50,000"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  className="w-full px-3 py-2 font-mono tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Cadence Period
                </label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Alert Milestones: 50%, 75%, 90%, 100% (Pre-configured)
                </span>
                <p className="text-[11px] text-neutral-400">
                  SpendWise AI automatically flags visual warnings when your expenses reach these key threshold milestones.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
