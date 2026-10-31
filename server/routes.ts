import { Router, Request, Response } from 'express';
import { db, DEFAULT_USER_ID } from './db.ts';
import {
  parseNaturalLanguageExpenses,
  generateFinancialInsights,
  answerFinancialQuestion,
  parseReceiptImage,
  ACTIVE_AI_MODEL
} from './ai.ts';
import { TransactionFilter } from '../src/types/index.ts';

export const apiRouter = Router();

// Middleware to resolve user
apiRouter.use((req, res, next) => {
  // Can be extended with session auth token header
  (req as any).userId = req.headers['x-user-id'] || DEFAULT_USER_ID;
  next();
});

// --- Health & Config ---
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'SpendWise AI',
    activeModel: ACTIVE_AI_MODEL,
    hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// --- User Profile & Settings ---
apiRouter.get('/user', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = db.getUser(userId);
  res.json({ success: true, data: user });
});

apiRouter.put('/user', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, defaultCurrency, theme } = req.body;
  const updated = db.updateUser(userId, { name, defaultCurrency, theme });
  res.json({ success: true, data: updated });
});

// --- Categories ---
apiRouter.get('/categories', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const categories = db.getCategories(userId);
  res.json({ success: true, data: categories });
});

apiRouter.post('/categories', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, icon, color, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'Name and type are required' });
  }
  const created = db.createCategory({ name, icon: icon || 'Tag', color: color || '#64748b', type }, userId);
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/categories/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const updated = db.updateCategory(id, req.body, userId);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/categories/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const ok = db.deleteCategory(id, userId);
  if (!ok) {
    return res.status(400).json({ success: false, error: 'Cannot delete category (may be system default or not found)' });
  }
  res.json({ success: true });
});

// --- Transactions ---
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const {
    search,
    type,
    categoryId,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    merchant,
    tag,
    sortBy,
  } = req.query;

  const filter: TransactionFilter = {
    search: typeof search === 'string' ? search : undefined,
    type: (type === 'INCOME' || type === 'EXPENSE' || type === 'ALL') ? type : undefined,
    categoryId: typeof categoryId === 'string' ? categoryId : undefined,
    paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    endDate: typeof endDate === 'string' ? endDate : undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    merchant: typeof merchant === 'string' ? merchant : undefined,
    tag: typeof tag === 'string' ? tag : undefined,
    sortBy: typeof sortBy === 'string' ? (sortBy as any) : 'date_desc',
  };

  const transactions = db.getTransactions(filter, userId);
  res.json({ success: true, data: transactions, total: transactions.length });
});

apiRouter.get('/transactions/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const tx = db.getTransactionById(id, userId);
  if (!tx) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true, data: tx });
});

apiRouter.post('/transactions', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const {
    type,
    title,
    amount, // In minor units (e.g. kobo) or converted
    currency,
    categoryId,
    transactionDate,
    transactionTime,
    paymentMethod,
    merchant,
    description,
    notes,
    tags,
    receiptUrl,
    isRecurring,
    recurringInterval,
  } = req.body;

  if (!title || typeof amount !== 'number' || amount <= 0 || !type || !categoryId) {
    return res.status(400).json({ success: false, error: 'Missing required transaction fields' });
  }

  const created = db.createTransaction({
    type,
    title: title.trim(),
    amount: Math.round(amount),
    currency: currency || 'NGN',
    categoryId,
    transactionDate: transactionDate || new Date().toISOString().slice(0, 10),
    transactionTime: transactionTime || '12:00',
    paymentMethod: paymentMethod || 'Debit Card',
    merchant: merchant || title,
    description: description || title,
    notes: notes || '',
    tags: Array.isArray(tags) ? tags : [],
    receiptUrl,
    isRecurring: !!isRecurring,
    recurringInterval,
  }, userId);

  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/transactions/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const updated = db.updateTransaction(id, req.body, userId);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/transactions/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const ok = db.deleteTransaction(id, userId);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true });
});

apiRouter.post('/transactions/:id/duplicate', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const duplicated = db.duplicateTransaction(id, userId);
  if (!duplicated) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.status(201).json({ success: true, data: duplicated });
});

// --- Budgets ---
apiRouter.get('/budgets', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const budgets = db.getBudgets(userId);
  res.json({ success: true, data: budgets });
});

apiRouter.post('/budgets', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { categoryId, amount, currency, period, startDate, endDate, alertThresholds } = req.body;
  if (!amount || amount <= 0 || !period) {
    return res.status(400).json({ success: false, error: 'Amount and period are required' });
  }
  const created = db.createBudget({
    categoryId: categoryId === 'all' ? undefined : categoryId,
    amount: Math.round(amount),
    currency: currency || 'NGN',
    period: period || 'monthly',
    startDate: startDate || '2026-10-01',
    endDate: endDate || '2026-10-31',
    alertThresholds: alertThresholds || [50, 75, 90, 100],
  }, userId);
  res.status(201).json({ success: true, data: created });
});

apiRouter.put('/budgets/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const updated = db.updateBudget(id, req.body, userId);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Budget not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/budgets/:id', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const ok = db.deleteBudget(id, userId);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Budget not found' });
  }
  res.json({ success: true });
});

// --- Financial Summary & Analytics ---
apiRouter.get('/summary', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const targetDate = typeof req.query.date === 'string' ? req.query.date : '2026-10-31';
  const summary = db.getSummary(userId, targetDate);
  res.json({ success: true, data: summary });
});

// --- AI Endpoints ---

// 1. Natural language expense parser
apiRouter.post('/ai/expense-parser', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { text, referenceDate } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Text prompt is required' });
  }
  const categories = db.getCategories(userId);
  const result = await parseNaturalLanguageExpenses(text, categories, referenceDate || '2026-10-31');
  res.json({ success: true, data: result });
});

// 2. Financial insights grounded on database metrics
apiRouter.get('/ai/financial-insights', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const summary = db.getSummary(userId, '2026-10-31');
  const allTx = db.getTransactions({}, userId);
  const monthExpenses = allTx.filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith('2026-10'));
  
  let largestExpense: any = undefined;
  if (monthExpenses.length > 0) {
    const sorted = [...monthExpenses].sort((a, b) => b.amount - a.amount);
    largestExpense = {
      title: sorted[0].title,
      amount: sorted[0].amount,
      date: sorted[0].transactionDate,
      category: sorted[0].categoryName || 'General',
    };
  }

  const insights = await generateFinancialInsights({
    monthExpenses: summary.monthExpenses.amount,
    prevMonthExpenses: summary.monthExpenses.previousPeriodAmount,
    monthIncome: summary.monthIncome.amount,
    netCashFlow: summary.netCashFlow,
    savingsRate: summary.savingsRate,
    currency: summary.currency,
    topCategories: summary.categoryBreakdown.slice(0, 3).map(c => ({
      name: c.categoryName,
      amount: c.totalAmount,
      percentage: c.percentage,
    })),
    largestExpense,
  });

  res.json({ success: true, data: insights });
});

// 3. Conversational AI Assistant
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const summary = db.getSummary(userId, '2026-10-31');
  const allTx = db.getTransactions({ sortBy: 'date_desc' }, userId);

  const contextData = {
    todayExpensesFormatted: summary.todayExpenses.formatted,
    monthExpensesFormatted: summary.monthExpenses.formatted,
    prevMonthExpensesFormatted: `${summary.currency} ${(summary.monthExpenses.previousPeriodAmount / 100).toLocaleString()}`,
    yearExpensesFormatted: summary.yearExpenses.formatted,
    monthIncomeFormatted: summary.monthIncome.formatted,
    netCashFlowFormatted: `${summary.currency} ${(summary.netCashFlow / 100).toLocaleString()}`,
    remainingBudgetFormatted: `${summary.currency} ${(summary.remainingBudget / 100).toLocaleString()}`,
    topCategories: summary.categoryBreakdown.slice(0, 5).map(c => ({
      name: c.categoryName,
      amountFormatted: `${summary.currency} ${(c.totalAmount / 100).toLocaleString()}`,
      percentage: c.percentage,
    })),
    recentTransactions: allTx.slice(0, 10).map(t => ({
      title: t.title,
      amountFormatted: `${t.currency} ${(t.amount / 100).toLocaleString()}`,
      date: t.transactionDate,
      category: t.categoryName || 'General',
      type: t.type,
    })),
  };

  const history = db.getChatHistory(userId).map(m => ({ role: m.role, content: m.content }));
  const answer = await answerFinancialQuestion(message, history, contextData);

  // Save conversation turn
  db.addChatMessage({
    id: `msg_u_${Date.now()}`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  }, userId);

  db.addChatMessage({
    id: `msg_a_${Date.now()}`,
    role: 'assistant',
    content: answer,
    timestamp: new Date().toISOString(),
  }, userId);

  res.json({ success: true, data: { response: answer } });
});

apiRouter.get('/ai/chat/history', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const history = db.getChatHistory(userId);
  res.json({ success: true, data: history });
});

apiRouter.delete('/ai/chat/history', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  db.clearChatHistory(userId);
  res.json({ success: true });
});

// 4. Receipt Scanner OCR
apiRouter.post('/ai/receipt-scanner', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { imageBase64, mimeType, referenceDate } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'imageBase64 is required' });
  }
  const categories = db.getCategories(userId);
  const result = await parseReceiptImage(imageBase64, mimeType || 'image/jpeg', categories, referenceDate || '2026-10-31');
  res.json({ success: true, data: result });
});

// --- Backup & Restore ---
apiRouter.get('/backup', (req: Request, res: Response) => {
  const backup = db.getFullBackup();
  res.setHeader('Content-Disposition', 'attachment; filename=spendwise-backup.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(backup, null, 2));
});

apiRouter.post('/restore', (req: Request, res: Response) => {
  const { backupData } = req.body;
  if (!backupData) {
    return res.status(400).json({ success: false, error: 'Missing backupData' });
  }
  const ok = db.restoreBackup(backupData);
  if (!ok) {
    return res.status(400).json({ success: false, error: 'Invalid backup structure' });
  }
  res.json({ success: true, message: 'Database successfully restored' });
});

// --- Export to CSV / Excel XML ---
apiRouter.get('/export', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const format = req.query.format === 'excel' ? 'excel' : req.query.format === 'json' ? 'json' : 'csv';
  const filter: TransactionFilter = {
    startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
    endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
    type: (req.query.type as any) || 'ALL',
    categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
  };
  const list = db.getTransactions(filter, userId);

  if (format === 'json') {
    res.setHeader('Content-Disposition', 'attachment; filename=spendwise-transactions.json');
    res.setHeader('Content-Type', 'application/json');
    return res.json(list);
  }

  if (format === 'csv') {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Title', 'Amount', 'Currency', 'Category', 'Payment Method', 'Merchant', 'Description', 'Notes', 'Tags'];
    const rows = list.map(t => [
      t.id,
      t.transactionDate,
      t.transactionTime,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      (t.amount / 100).toFixed(2),
      t.currency,
      `"${(t.categoryName || '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.tags.join(';')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=spendwise-transactions.csv');
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csvContent);
  }

  // Excel XML Format
  let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Transactions">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Date</Data></Cell>
    <Cell><Data ss:Type="String">Type</Data></Cell>
    <Cell><Data ss:Type="String">Title</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Amount</Data></Cell>
    <Cell><Data ss:Type="String">Currency</Data></Cell>
    <Cell><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell><Data ss:Type="String">Merchant</Data></Cell>
    <Cell><Data ss:Type="String">Description</Data></Cell>
   </Row>`;

  for (const t of list) {
    xml += `
   <Row>
    <Cell><Data ss:Type="String">${t.transactionDate}</Data></Cell>
    <Cell><Data ss:Type="String">${t.type}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.title)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.categoryName || '')}</Data></Cell>
    <Cell><Data ss:Type="Number">${(t.amount / 100).toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="String">${t.currency}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.paymentMethod)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.merchant || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(t.description || '')}</Data></Cell>
   </Row>`;
  }

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  res.setHeader('Content-Disposition', 'attachment; filename=spendwise-transactions.xls');
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  return res.send(xml);
});

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
