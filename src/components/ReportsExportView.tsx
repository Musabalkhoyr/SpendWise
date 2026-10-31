import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Upload,
  Calendar,
  Layers,
  Database,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, Category } from '../types/index.ts';
import { formatMoney } from '../lib/currency.ts';
import { api } from '../lib/api.ts';

interface ReportsExportViewProps {
  transactions: Transaction[];
  categories: Category[];
  defaultCurrency?: string;
  onDataRestored: () => void;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  transactions,
  categories,
  defaultCurrency = 'NGN',
  onDataRestored,
}) => {
  const [reportType, setReportType] = useState<'all' | 'monthly' | 'custom'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filtered transactions for report
  const filteredList = useMemo(() => {
    let list = [...transactions];
    if (reportType === 'monthly') {
      list = list.filter(t => t.transactionDate.startsWith(selectedMonth));
    } else if (reportType === 'custom') {
      if (startDate) list = list.filter(t => t.transactionDate >= startDate);
      if (endDate) list = list.filter(t => t.transactionDate <= endDate);
    }
    return list.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }, [transactions, reportType, selectedMonth, startDate, endDate]);

  const totalIncome = useMemo(() => {
    return filteredList.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  }, [filteredList]);

  const totalExpenses = useMemo(() => {
    return filteredList.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  }, [filteredList]);

  const netCashFlow = totalIncome - totalExpenses;

  // Category breakdown for filtered set
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filteredList.filter(t => t.type === 'EXPENSE')) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
        return {
          name: cat?.name || 'Uncategorized',
          amount,
          percentage: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredList, categories, totalExpenses]);

  // Export handlers
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    params.set('format', 'csv');
    if (reportType === 'monthly') {
      params.set('startDate', `${selectedMonth}-01`);
      params.set('endDate', `${selectedMonth}-31`);
    } else if (reportType === 'custom') {
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
    }
    window.location.href = `/api/export?${params.toString()}`;
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    params.set('format', 'excel');
    if (reportType === 'monthly') {
      params.set('startDate', `${selectedMonth}-01`);
      params.set('endDate', `${selectedMonth}-31`);
    } else if (reportType === 'custom') {
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
    }
    window.location.href = `/api/export?${params.toString()}`;
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleBackupDownload = () => {
    window.location.href = '/api/backup';
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const res = await api.restoreBackup(parsed);
        if (res.success) {
          setStatusMessage('Database restored successfully from backup file.');
          onDataRestored();
        }
      } catch (err: any) {
        setStatusMessage(`Restore failed: ${err.message || 'Invalid JSON file'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Action Bar (Hidden when printing) */}
      <div className="print:hidden space-y-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Financial Statements, Reports & Data Export</span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Generate audit-ready reports in PDF, Excel, and CSV format with complete transaction breakdown.
              </p>
            </div>

            {/* Quick Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Report Scope Selector */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 flex-wrap text-xs">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Date Range:</span>
            <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1 rounded-sm font-medium ${
                  reportType === 'monthly' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setReportType('all')}
                className={`px-3 py-1 rounded-sm font-medium ${
                  reportType === 'all' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setReportType('custom')}
                className={`px-3 py-1 rounded-sm font-medium ${
                  reportType === 'custom' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                }`}
              >
                Custom Range
              </button>
            </div>

            {reportType === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200"
              >
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
              </select>
            )}

            {reportType === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Database Backup & Restore Utility */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                Ledger Backup & Snapshot Restore
              </h3>
              <p className="text-[11px] text-neutral-500">
                Safeguard all financial history, categories, and AI conversations in a portable JSON file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </label>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Printable / Display Report Card (matches prompt PDF requirements) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 block mb-1">
              Personal Financial Statement
            </span>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              SpendWise AI Financial Report
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Account Holder: Musab Gafar · Date Range:{' '}
              {reportType === 'monthly' ? selectedMonth : `${startDate} to ${endDate}`}
            </p>
          </div>

          <div className="text-right text-xs text-neutral-400">
            <div>Generated: 2026-10-31</div>
            <div>Currency: {defaultCurrency}</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
          <div>
            <span className="text-[11px] text-neutral-500 block">Total Inflow (Income)</span>
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              +{formatMoney(totalIncome, defaultCurrency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Total Outflow (Expenses)</span>
            <span className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              -{formatMoney(totalExpenses, defaultCurrency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Net Cash Flow</span>
            <span className={`text-lg font-bold font-mono tabular-nums ${
              netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
            }`}>
              {netCashFlow >= 0 ? '+' : ''}{formatMoney(netCashFlow, defaultCurrency)}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Category Breakdown Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                <tr>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Share of Total</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {categoryBreakdown.map(cat => (
                  <tr key={cat.name}>
                    <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">
                      {cat.name}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-neutral-500">
                      {cat.percentage}%
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                      {formatMoney(cat.amount, defaultCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Itemized Transactions Ledger */}
        <div>
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Individual Transaction Audit Trail ({filteredList.length} Records)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                <tr>
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Payment Method</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredList.map(tx => (
                  <tr key={tx.id}>
                    <td className="py-2 font-mono tabular-nums text-neutral-500">
                      {tx.transactionDate} {tx.transactionTime}
                    </td>
                    <td className="py-2">
                      <span className={`text-[10px] font-semibold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 font-medium text-neutral-900 dark:text-white">
                      {tx.title}
                    </td>
                    <td className="py-2 text-neutral-500">
                      {tx.categoryName}
                    </td>
                    <td className="py-2 text-neutral-500">
                      {tx.paymentMethod}
                    </td>
                    <td className={`py-2 text-right font-mono tabular-nums font-semibold ${
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-neutral-900 dark:text-white'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Disclaimer */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
          <span>SpendWise AI Automated Ledger Generation · Factual Database Truth</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
