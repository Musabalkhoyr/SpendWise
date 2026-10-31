import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Receipt,
  Check,
  AlertCircle,
  FileImage,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { Category, AIExpenseProposal } from '../types/index.ts';
import { toMinorUnits } from '../lib/currency.ts';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onTransactionSaved: () => void;
  defaultCurrency?: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onTransactionSaved,
  defaultCurrency = 'NGN',
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedProposal, setExtractedProposal] = useState<AIExpenseProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid receipt image (JPG, PNG, WebP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setError(null);
      setExtractedProposal(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScanReceipt = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setError(null);

    try {
      const res = await api.scanReceipt(imagePreview, mimeType, '2026-10-31');
      if (res.proposals && res.proposals.length > 0) {
        setExtractedProposal(res.proposals[0]);
      } else {
        setError('Could not extract valid receipt details. Please enter manually.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan receipt image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveExtracted = async () => {
    if (!extractedProposal) return;
    setIsSaving(true);
    setError(null);

    try {
      const matchedCategory = categories.find(
        c => c.name.toLowerCase() === extractedProposal.category?.toLowerCase()
      ) || categories.find(c => c.name.toLowerCase().includes('food')) || categories[0];

      await api.createTransaction({
        type: 'EXPENSE',
        title: extractedProposal.title || `${extractedProposal.merchant} Receipt`,
        amount: toMinorUnits(extractedProposal.amount),
        currency: extractedProposal.currency || defaultCurrency,
        categoryId: matchedCategory.id,
        transactionDate: extractedProposal.transactionDate || '2026-10-31',
        transactionTime: extractedProposal.transactionTime || '13:00',
        paymentMethod: extractedProposal.paymentMethod || 'Debit Card',
        merchant: extractedProposal.merchant || 'Retail Merchant',
        description: extractedProposal.description || 'Scanned receipt entry',
        notes: extractedProposal.notes || 'Created via AI Receipt Scanner',
        tags: ['receipt', matchedCategory.name.toLowerCase()],
        receiptUrl: imagePreview || undefined,
        isRecurring: false,
      });

      onTransactionSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save scanned transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              AI Receipt Scanner & OCR
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Zone */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-2 bg-neutral-50 dark:bg-neutral-800/40"
          >
            <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Click to select or upload a receipt photo
            </div>
            <p className="text-[11px] text-neutral-400">
              Supports JPEG, PNG, or WebP supermarket receipts, restaurant bills, and utility slips
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative max-h-48 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="max-h-48 object-contain w-full"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setExtractedProposal(null);
                }}
                className="absolute top-2 right-2 p-1 bg-neutral-900/70 text-white rounded-md hover:bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!extractedProposal && (
              <button
                onClick={handleScanReceipt}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isScanning ? 'Extracting with Multimodal Vision...' : 'Scan & Extract Details'}</span>
              </button>
            )}
          </div>
        )}

        {/* Extracted Details Confirmation Screen */}
        {extractedProposal && (
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
              <span>Extracted Transaction Details</span>
              <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
                Please verify before saving
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-500 block">Merchant Name</label>
                <input
                  type="text"
                  value={extractedProposal.merchant}
                  onChange={e => setExtractedProposal({ ...extractedProposal, merchant: e.target.value })}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md font-semibold text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block">Total Amount ({extractedProposal.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={extractedProposal.amount}
                  onChange={e => setExtractedProposal({ ...extractedProposal, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md font-mono tabular-nums text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block">Date</label>
                <input
                  type="date"
                  value={extractedProposal.transactionDate}
                  onChange={e => setExtractedProposal({ ...extractedProposal, transactionDate: e.target.value })}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block">Category</label>
                <select
                  value={extractedProposal.category}
                  onChange={e => setExtractedProposal({ ...extractedProposal, category: e.target.value })}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 block">Purchased Items / Description</label>
              <input
                type="text"
                value={extractedProposal.description}
                onChange={e => setExtractedProposal({ ...extractedProposal, description: e.target.value })}
                className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/40">
              <button
                onClick={() => setExtractedProposal(null)}
                className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              >
                Scan Again
              </button>
              <button
                onClick={handleSaveExtracted}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Confirm & Save Expense'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
