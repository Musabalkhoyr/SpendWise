import React, { useState } from 'react';
import { Sparkles, Send, Check, AlertCircle, X, Edit2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.ts';
import { AIParsingResult, AIExpenseProposal, Category } from '../types/index.ts';
import { toMinorUnits, formatMoney } from '../lib/currency.ts';

interface QuickExpenseInputProps {
  categories: Category[];
  onTransactionSaved: () => void;
  defaultCurrency?: string;
}

export const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({
  categories,
  onTransactionSaved,
  defaultCurrency = 'NGN',
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsingResult, setParsingResult] = useState<AIParsingResult | null>(null);
  const [proposals, setProposals] = useState<AIExpenseProposal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleParse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.parseNaturalLanguage(inputText.trim(), '2026-10-31');
      setParsingResult(res);
      setProposals(res.proposals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to parse natural language expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProposal = (index: number, field: keyof AIExpenseProposal, value: any) => {
    setProposals(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleConfirmAndSave = async () => {
    if (proposals.length === 0) return;
    setIsSaving(true);
    setError(null);

    try {
      for (const p of proposals) {
        // Resolve category id
        const matchedCategory = categories.find(
          c => c.name.toLowerCase() === p.category?.toLowerCase()
        ) || categories.find(c => c.name.toLowerCase().includes('miscellaneous')) || categories[0];

        await api.createTransaction({
          type: p.type || 'EXPENSE',
          title: p.title || 'Recorded Expense',
          amount: toMinorUnits(p.amount),
          currency: p.currency || defaultCurrency,
          categoryId: matchedCategory?.id || 'cat_misc',
          transactionDate: p.transactionDate || '2026-10-31',
          transactionTime: p.transactionTime || '12:00',
          paymentMethod: p.paymentMethod || 'Debit Card',
          merchant: p.merchant || p.title || 'General Merchant',
          description: p.description || p.title,
          notes: p.notes || 'Created via Quick AI Entry',
          tags: p.tags || [matchedCategory?.name?.toLowerCase() || 'expense'],
          isRecurring: false,
        });
      }

      setInputText('');
      setParsingResult(null);
      setProposals([]);
      onTransactionSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save parsed transactions');
    } finally {
      setIsSaving(false);
    }
  };

  const samplePrompts = [
    '₦2,500 transport today',
    'Bought food for ₦3,500',
    'Paid ₦10,000 for electricity yesterday',
    '₦500 bread and ₦1,800 airtime',
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Gemma Quick Expense Entry
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Type naturally in everyday language. Verified before saving.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleParse} className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder='e.g. "I spent ₦2,500 on transport today" or "₦15,000 electricity on the 20th"'
            className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors shrink-0"
          >
            {isLoading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <span>Extract</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Quick chip suggestions */}
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-neutral-400">Try:</span>
          {samplePrompts.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setInputText(prompt);
              }}
              className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2 py-0.5 rounded-md transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mt-3 p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Confirmation & Inspection Drawer for Extracted Details */}
      {parsingResult && proposals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Extracted Proposal ({proposals.length} item{proposals.length > 1 ? 's' : ''})
            </span>
            <button
              onClick={() => {
                setParsingResult(null);
                setProposals([]);
              }}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
          </div>

          {parsingResult.clarificationNeeded && parsingResult.clarificationQuestion && (
            <div className="p-2.5 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg">
              {parsingResult.clarificationQuestion}
            </div>
          )}

          <div className="space-y-2.5">
            {proposals.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
              >
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => handleUpdateProposal(idx, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md font-medium text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Amount ({item.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={e => handleUpdateProposal(idx, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono tabular-nums text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Category</label>
                  <select
                    value={item.category}
                    onChange={e => handleUpdateProposal(idx, 'category', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Date</label>
                  <input
                    type="date"
                    value={item.transactionDate}
                    onChange={e => handleUpdateProposal(idx, 'transactionDate', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setParsingResult(null);
                setProposals([]);
              }}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            >
              Discard
            </button>
            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Confirm & Save to Ledger'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
