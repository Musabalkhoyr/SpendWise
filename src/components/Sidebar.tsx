import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  CalendarDays,
  CalendarRange,
  Calendar,
  Wallet,
  PiggyBank,
  Bot,
  FileBarChart,
  Settings,
  PlusCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenAddExpense: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
  { id: 'daily', label: 'Daily Records', icon: CalendarDays },
  { id: 'monthly', label: 'Monthly Records', icon: CalendarRange },
  { id: 'yearly', label: 'Yearly Records', icon: Calendar },
  { id: 'income', label: 'Income & Cash Flow', icon: Wallet },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'ai', label: 'AI Assistant', icon: Bot, isSpecial: true },
  { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  onOpenAddExpense,
  isOpenMobile,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 w-64">
      {/* Brand & Mobile Close */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800/60">
        <div>
          <div className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            SpendWise AI
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Personal Expense Intelligence
          </p>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md md:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={() => {
            onOpenAddExpense();
            if (isOpenMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.isSpecial && (
                <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Gemma
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile note */}
      <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
            Musab Gafar
          </span>
          <span className="tabular-nums font-mono text-[10px] text-neutral-400">
            v2.6
          </span>
        </div>
        <p className="truncate text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          NGN · ₦ Primary Currency
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-20">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
