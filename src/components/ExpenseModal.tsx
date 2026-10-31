import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, RefreshCw, Paperclip, Check } from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types/index.ts';
import { toMinorUnits, toMajorUnits, SUPPORTED_CURRENCIES } from '../lib/currency.ts';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: any) => Promise<void>;
  categories: Category[];
  initialData?: Transaction | null;
  defaultCurrency?: string;
  defaultType?: TransactionType;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'Debit Card',
  'Credit Card',
  'USSD',
  'Mobile Wallet',
  'Other',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  defaultCurrency = 'NGN',
  defaultType = 'EXPENSE',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('2026-10-31');
  const [time, setTime] = useState('12:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Debit Card');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when opening or when initialData changes
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmountStr(String(toMajorUnits(initialData.amount)));
      setCurrency(initialData.currency || defaultCurrency);
      setCategoryId(initialData.categoryId);
      setDate(initialData.transactionDate);
      setTime(initialData.transactionTime || '12:00');
      setPaymentMethod(initialData.paymentMethod || 'Debit Card');
      setMerchant(initialData.merchant || '');
      setDescription(initialData.description || '');
      setNotes(initialData.notes || '');
      setTagsInput(initialData.tags?.join(', ') || '');
      setIsRecurring(!!initialData.isRecurring);
      setRecurringInterval(initialData.recurringInterval || 'monthly');
    } else {
      setType(defaultType);
      setTitle('');
      setAmountStr('');
      setCurrency(defaultCurrency);
      const filtered = categories.filter(c => c.type === defaultType);
      setCategoryId(filtered[0]?.id || (categories[0]?.id ?? ''));
      setDate(new Date().toISOString().slice(0, 10));
      setTime(new Date().toTimeString().slice(0, 5));
      setPaymentMethod('Debit Card');
      setMerchant('');
      setDescription('');
      setNotes('');
      setTagsInput('');
      setIsRecurring(false);
      setRecurringInterval('monthly');
    }
    setError(null);
  }, [initialData, isOpen, defaultType, defaultCurrency, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amountStr.replace(/,/g, ''));
    if (!title.trim()) {
      setError('Please provide a title for this transaction.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const minorUnits = toMinorUnits(amountNum);

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        title: title.trim(),
        amount: minorUnits,
        currency,
        categoryId,
        transactionDate: date,
        transactionTime: time,
        paymentMethod,
        merchant: merchant.trim() || title.trim(),
        description: description.trim() || title.trim(),
        notes: notes.trim(),
        tags,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {initialData ? 'Edit Transaction' : type === 'EXPENSE' ? 'Record Individual Expense' : 'Record Income'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Saved as a distinct, individually tracked financial entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                const cat = categories.find(c => c.type === 'EXPENSE');
                if (cat) setCategoryId(cat.id);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'EXPENSE'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                const cat = categories.find(c => c.type === 'INCOME');
                if (cat) setCategoryId(cat.id);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'INCOME'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Transaction Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Transportation to office, Lunch with team"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="2,500.00"
                  className="w-full pl-3 pr-8 py-2 text-xs tabular-nums font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
                />
                <span className="absolute right-2.5 top-2 text-xs font-semibold text-neutral-400">
                  {currency === 'NGN' ? '₦' : currency}
                </span>
              </div>
            </div>
          </div>

          {/* Category & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merchant & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Merchant or Recipient
              </label>
              <input
                type="text"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                placeholder="e.g. Bukka Hut, Uber, Total Energies, Shoprite"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="commute, lunch, personal"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Transport from home to school via BRT terminal"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional memo, invoice number, or reminder details..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400 resize-none"
            />
          </div>

          {/* Recurring Expense Option */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-neutral-300 focus:ring-emerald-500"
              />
              <span>Recurring Transaction</span>
            </label>

            {isRecurring && (
              <div className="mt-2.5 flex items-center gap-3">
                <span className="text-xs text-neutral-500">Frequency:</span>
                <div className="flex items-center gap-1.5">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(interval => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setRecurringInterval(interval)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${
                        recurringInterval === interval
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Record Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
