import React from 'react';
import { Plus, Sun, Moon, Sparkles, Receipt, Menu } from 'lucide-react';
import { User } from '../types/index.ts';

interface HeaderProps {
  user: User | null;
  activeView: string;
  onOpenAddExpense: () => void;
  onOpenReceiptScan: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Financial Dashboard',
  transactions: 'Expense & Income Ledger',
  daily: 'Daily Expense Records',
  monthly: 'Monthly Performance & Breakdown',
  yearly: 'Yearly Financial Records',
  income: 'Income & Cash Flow Tracking',
  budgets: 'Budget Management & Alerts',
  ai: 'AI Expense Assistant',
  reports: 'Reports & Export',
  settings: 'System & Currency Settings',
};

export const Header: React.FC<HeaderProps> = ({
  user,
  activeView,
  onOpenAddExpense,
  onOpenReceiptScan,
  isDark,
  onToggleTheme,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Zone 1: Mobile Hamburger + Brand Wordmark / Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 md:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
            SpendWise AI
          </span>
          <span className="hidden sm:inline text-xs text-neutral-400 dark:text-neutral-500" aria-hidden="true">
            /
          </span>
          <span className="hidden sm:inline text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">
            {VIEW_TITLES[activeView] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Zone 2: Model & Status Information */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Gemma 4 Financial Engine</span>
        </div>
        <span aria-hidden="true">·</span>
        <span>Default Currency: {user?.defaultCurrency || 'NGN'}</span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenReceiptScan}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Scan Receipt</span>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};
