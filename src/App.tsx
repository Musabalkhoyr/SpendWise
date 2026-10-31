/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt, Sparkles } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { DailyRecordsView } from './components/DailyRecordsView.tsx';
import { MonthlyRecordsView } from './components/MonthlyRecordsView.tsx';
import { YearlyRecordsView } from './components/YearlyRecordsView.tsx';
import { IncomeView } from './components/IncomeView.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { AiAssistantView } from './components/AiAssistantView.tsx';
import { ReportsExportView } from './components/ReportsExportView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { ExpenseModal } from './components/ExpenseModal.tsx';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.tsx';
import { api } from './lib/api.ts';
import { User, Transaction, Category, Budget, DashboardSummary, TransactionType } from './types/index.ts';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spendwise_theme') === 'dark';
    }
    return false;
  });

  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expenseModalType, setExpenseModalType] = useState<TransactionType>('EXPENSE');
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme synchronization
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('spendwise_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('spendwise_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Fetch all core app data
  const fetchData = useCallback(async () => {
    try {
      const [userData, summaryData, txData, catData, bgData] = await Promise.all([
        api.getUser(),
        api.getSummary('2026-10-31'),
        api.getTransactions({ sortBy: 'date_desc' }),
        api.getCategories(),
        api.getBudgets(),
      ]);

      setUser(userData);
      setSummary(summaryData);
      setTransactions(txData);
      setCategories(catData);
      setBudgets(bgData);
    } catch (err) {
      console.error('Failed to load SpendWise data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal actions
  const handleOpenAddExpense = () => {
    setEditingTransaction(null);
    setExpenseModalType('EXPENSE');
    setIsExpenseModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setEditingTransaction(null);
    setExpenseModalType('INCOME');
    setIsExpenseModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setExpenseModalType(tx.type);
    setIsExpenseModalOpen(true);
  };

  const handleSaveTransaction = async (txData: any) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, txData);
    } else {
      await api.createTransaction(txData);
    }
    await fetchData();
  };

  const handleDuplicateTransaction = async (id: string) => {
    await api.duplicateTransaction(id);
    await fetchData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    await fetchData();
  };

  const defaultCurrency = user?.defaultCurrency || 'NGN';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenAddExpense={handleOpenAddExpense}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            user={user}
            activeView={activeView}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-neutral-500">Initializing SpendWise AI Engine...</p>
              </div>
            ) : (
              <>
                {activeView === 'dashboard' && (
                  <DashboardView
                    summary={summary}
                    recentTransactions={transactions}
                    categories={categories}
                    onOpenAddExpense={handleOpenAddExpense}
                    onSelectView={setActiveView}
                    onRefreshData={fetchData}
                  />
                )}

                {activeView === 'transactions' && (
                  <TransactionsView
                    transactions={transactions}
                    categories={categories}
                    onOpenAddExpense={handleOpenAddExpense}
                    onEditTransaction={handleEditTransaction}
                    onDuplicateTransaction={handleDuplicateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'daily' && (
                  <DailyRecordsView
                    transactions={transactions}
                    categories={categories}
                    onOpenAddExpense={handleOpenAddExpense}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'monthly' && (
                  <MonthlyRecordsView
                    transactions={transactions}
                    categories={categories}
                    budgets={budgets}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'yearly' && (
                  <YearlyRecordsView
                    transactions={transactions}
                    categories={categories}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'income' && (
                  <IncomeView
                    transactions={transactions}
                    categories={categories}
                    onOpenAddIncome={handleOpenAddIncome}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'budgets' && (
                  <BudgetView
                    budgets={budgets}
                    categories={categories}
                    transactions={transactions}
                    onBudgetsUpdated={fetchData}
                    defaultCurrency={defaultCurrency}
                  />
                )}

                {activeView === 'ai' && (
                  <AiAssistantView
                    categories={categories}
                    defaultCurrency={defaultCurrency}
                    onRefreshData={fetchData}
                  />
                )}

                {activeView === 'reports' && (
                  <ReportsExportView
                    transactions={transactions}
                    categories={categories}
                    defaultCurrency={defaultCurrency}
                    onDataRestored={fetchData}
                  />
                )}

                {activeView === 'settings' && (
                  <SettingsView
                    user={user}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    onUserUpdated={u => setUser(u)}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-40">
        <button
          onClick={handleOpenAddExpense}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-transform"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        initialData={editingTransaction}
        defaultCurrency={defaultCurrency}
        defaultType={expenseModalType}
      />

      <ReceiptScannerModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        categories={categories}
        onTransactionSaved={fetchData}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}
