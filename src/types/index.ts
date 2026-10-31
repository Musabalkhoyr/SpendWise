export type TransactionType = 'EXPENSE' | 'INCOME';

export type PaymentMethod = 
  | 'Cash'
  | 'Bank Transfer'
  | 'Debit Card'
  | 'Credit Card'
  | 'USSD'
  | 'Mobile Wallet'
  | 'Other';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number; // Stored in minor units (e.g. kobo: 250000 = ₦2,500.00)
  currency: string; // e.g. 'NGN'
  categoryId: string;
  categoryName?: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  paymentMethod: PaymentMethod;
  merchant: string;
  description: string;
  notes?: string;
  tags: string[];
  receiptUrl?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId?: string; // Optional: category-specific or overall if omitted
  categoryName?: string;
  amount: number; // In minor units
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  alertThresholds: number[]; // e.g. [50, 75, 90, 100]
}

export interface User {
  id: string;
  name: string;
  email: string;
  defaultCurrency: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface FinancialMetric {
  amount: number; // minor units
  formatted: string;
  previousPeriodAmount: number;
  percentageChange: number; // e.g. -12.5 or +24.0
  isIncrease: boolean;
}

export interface DashboardSummary {
  todayExpenses: FinancialMetric;
  weekExpenses: FinancialMetric;
  monthExpenses: FinancialMetric;
  yearExpenses: FinancialMetric;
  monthIncome: FinancialMetric;
  remainingBudget: number; // minor units
  budgetUtilizationPct: number;
  netCashFlow: number; // income - expenses
  savingsRate: number; // percentage
  currency: string;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
    totalAmount: number;
    percentage: number;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    dayLabel: string;
    expense: number;
    income: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    monthName: string;
    expense: number;
    income: number;
  }>;
  yearlyComparison: Array<{
    year: string;
    expense: number;
    income: number;
  }>;
  budgetStatuses: Array<{
    budgetId: string;
    categoryName: string;
    limit: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    status: 'normal' | 'warning' | 'critical' | 'exceeded';
  }>;
}

export interface TransactionFilter {
  search?: string;
  type?: TransactionType | 'ALL';
  categoryId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
  tag?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'title_asc';
}

export interface AIExpenseProposal {
  title: string;
  amount: number; // major unit in proposal, will be converted to minor unit
  currency: string;
  type: TransactionType;
  category: string;
  transactionDate: string;
  transactionTime: string;
  paymentMethod: PaymentMethod;
  merchant: string;
  description: string;
  notes?: string;
  tags?: string[];
}

export interface AIParsingResult {
  proposals: AIExpenseProposal[];
  summaryText: string;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  observation: string;
  impact: 'positive' | 'neutral' | 'warning' | 'opportunity';
  metricHighlight?: string;
  actionableTip?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredData?: any;
}
