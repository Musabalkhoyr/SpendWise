import {
  Transaction,
  Category,
  Budget,
  User,
  DashboardSummary,
  TransactionFilter,
  AIParsingResult,
  AIInsight,
  AIChatMessage,
} from '../types/index.ts';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // User Profile
  async getUser(): Promise<User> {
    const res = await fetch('/api/user');
    return handleResponse<User>(res);
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<User>(res);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    return handleResponse<Category[]>(res);
  },

  async createCategory(cat: Omit<Category, 'id' | 'userId'>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return handleResponse<Category>(res);
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await handleResponse(res);
  },

  // Transactions
  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.search) params.set('search', filter.search);
      if (filter.type) params.set('type', filter.type);
      if (filter.categoryId) params.set('categoryId', filter.categoryId);
      if (filter.paymentMethod) params.set('paymentMethod', filter.paymentMethod);
      if (filter.startDate) params.set('startDate', filter.startDate);
      if (filter.endDate) params.set('endDate', filter.endDate);
      if (filter.minAmount) params.set('minAmount', filter.minAmount.toString());
      if (filter.maxAmount) params.set('maxAmount', filter.maxAmount.toString());
      if (filter.merchant) params.set('merchant', filter.merchant);
      if (filter.tag) params.set('tag', filter.tag);
      if (filter.sortBy) params.set('sortBy', filter.sortBy);
    }
    const res = await fetch(`/api/transactions?${params.toString()}`);
    return handleResponse<Transaction[]>(res);
  },

  async getTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`);
    return handleResponse<Transaction>(res);
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return handleResponse<Transaction>(res);
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Transaction>(res);
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    await handleResponse(res);
  },

  async duplicateTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}/duplicate`, { method: 'POST' });
    return handleResponse<Transaction>(res);
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const res = await fetch('/api/budgets');
    return handleResponse<Budget[]>(res);
  },

  async createBudget(budget: Omit<Budget, 'id' | 'userId'>): Promise<Budget> {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    return handleResponse<Budget>(res);
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const res = await fetch(`/api/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Budget>(res);
  },

  async deleteBudget(id: string): Promise<void> {
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    await handleResponse(res);
  },

  // Summary
  async getSummary(targetDate?: string): Promise<DashboardSummary> {
    const url = targetDate ? `/api/summary?date=${encodeURIComponent(targetDate)}` : '/api/summary';
    const res = await fetch(url);
    return handleResponse<DashboardSummary>(res);
  },

  // AI Services
  async parseNaturalLanguage(text: string, referenceDate?: string): Promise<AIParsingResult> {
    const res = await fetch('/api/ai/expense-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, referenceDate }),
    });
    return handleResponse<AIParsingResult>(res);
  },

  async getFinancialInsights(): Promise<AIInsight[]> {
    const res = await fetch('/api/ai/financial-insights');
    return handleResponse<AIInsight[]>(res);
  },

  async sendChatMessage(message: string): Promise<{ response: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse<{ response: string }>(res);
  },

  async getChatHistory(): Promise<AIChatMessage[]> {
    const res = await fetch('/api/ai/chat/history');
    return handleResponse<AIChatMessage[]>(res);
  },

  async clearChatHistory(): Promise<void> {
    const res = await fetch('/api/ai/chat/history', { method: 'DELETE' });
    await handleResponse(res);
  },

  async scanReceipt(imageBase64: string, mimeType: string, referenceDate?: string): Promise<AIParsingResult> {
    const res = await fetch('/api/ai/receipt-scanner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, referenceDate }),
    });
    return handleResponse<AIParsingResult>(res);
  },

  // Backup & Restore
  async restoreBackup(backupData: any): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupData }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};
