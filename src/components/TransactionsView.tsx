import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Copy,
  ChevronDown,
  ArrowUpDown,
  Tag,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { Transaction, Category, TransactionFilter } from '../types/index.ts';
import { formatMoney } from '../lib/currency.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddExpense: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDuplicateTransaction: (id: string) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  defaultCurrency?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  onOpenAddExpense,
  onEditTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
  defaultCurrency = 'NGN',
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Modals state
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Client-side filtration and sorting
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.merchant?.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (selectedType !== 'ALL') {
      result = result.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(t => t.categoryId === selectedCategory);
    }

    if (selectedPaymentMethod !== 'ALL') {
      result = result.filter(t => t.paymentMethod === selectedPaymentMethod);
    }

    if (startDate) {
      result = result.filter(t => t.transactionDate >= startDate);
    }

    if (endDate) {
      result = result.filter(t => t.transactionDate <= endDate);
    }

    if (minAmount) {
      const minMinor = parseFloat(minAmount) * 100;
      if (!isNaN(minMinor)) {
        result = result.filter(t => t.amount >= minMinor);
      }
    }

    if (maxAmount) {
      const maxMinor = parseFloat(maxAmount) * 100;
      if (!isNaN(maxMinor)) {
        result = result.filter(t => t.amount <= maxMinor);
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        const d = b.transactionDate.localeCompare(a.transactionDate);
        return d !== 0 ? d : (b.transactionTime || '').localeCompare(a.transactionTime || '');
      } else if (sortBy === 'date_asc') {
        const d = a.transactionDate.localeCompare(b.transactionDate);
        return d !== 0 ? d : (a.transactionTime || '').localeCompare(b.transactionTime || '');
      } else if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      } else if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      } else if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [
    transactions,
    search,
    selectedType,
    selectedCategory,
    selectedPaymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
  ]);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDeleteTransaction(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSelectedPaymentMethod('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, merchant, tag, description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isFiltersOpen
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {isFiltersOpen && (
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Type */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Transaction Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              >
                <option value="ALL">All Transactions</option>
                <option value="EXPENSE">Expenses Only (-)</option>
                <option value="INCOME">Income Only (+)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {/* Sort Order */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Min Amount (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Max Amount (₦)</label>
              <input
                type="number"
                placeholder="100,000"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
              />
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <button
                onClick={clearAllFilters}
                className="w-full py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''} Found
          </span>
          <span className="text-[11px] text-neutral-500">
            Isolated per-record storage
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No transactions match the selected filters or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="py-2.5 pl-4">Date & Time</th>
                  <th className="py-2.5">Title & Merchant</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right pr-4">Amount</th>
                  <th className="py-2.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredTransactions.map(tx => (
                  <tr
                    key={tx.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-3 pl-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      <div>{tx.transactionDate}</div>
                      <div className="text-[10px] text-neutral-400">{tx.transactionTime || '12:00'}</div>
                    </td>

                    <td className="py-3 pr-2">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate max-w-[200px]">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                        {tx.merchant || tx.description}
                      </div>
                    </td>

                    <td className="py-3 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                      {tx.categoryName}
                    </td>

                    <td className="py-3 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>

                    <td className={`py-3 pr-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                    </td>

                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingTx(tx)}
                          title="View details"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit transaction"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateTransaction(tx.id)}
                          title="Duplicate transaction"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          title="Delete transaction"
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Transaction Details</h3>
              <button
                onClick={() => setViewingTx(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Title:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{viewingTx.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Amount:</span>
                <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
                  {formatMoney(viewingTx.amount, viewingTx.currency)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Category:</span>
                <span className="text-neutral-800 dark:text-neutral-200">{viewingTx.categoryName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Date & Time:</span>
                <span className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                  {viewingTx.transactionDate} {viewingTx.transactionTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Payment Method:</span>
                <span className="text-neutral-800 dark:text-neutral-200">{viewingTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500">Merchant / Recipient:</span>
                <span className="text-neutral-800 dark:text-neutral-200">{viewingTx.merchant || '-'}</span>
              </div>
              <div className="py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-500 block mb-0.5">Description:</span>
                <p className="text-neutral-800 dark:text-neutral-200">{viewingTx.description || '-'}</p>
              </div>
              {viewingTx.notes && (
                <div className="py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                  <span className="text-neutral-500 block mb-0.5">Notes:</span>
                  <p className="text-neutral-800 dark:text-neutral-200">{viewingTx.notes}</p>
                </div>
              )}
              {viewingTx.tags && viewingTx.tags.length > 0 && (
                <div className="py-1">
                  <span className="text-neutral-500 block mb-1">Tags:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {viewingTx.tags.map(t => (
                      <span key={t} className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingTx(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Delete Transaction?</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to permanently delete this transaction? All associated financial reports, daily aggregates, and budget utilization will update immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
