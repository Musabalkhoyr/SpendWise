import fs from 'fs';
import path from 'path';
import {
  Transaction,
  Category,
  Budget,
  User,
  DashboardSummary,
  TransactionFilter,
  AIChatMessage
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'spendwise.db.json');

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  chatHistory: Record<string, AIChatMessage[]>;
}

export const DEFAULT_USER_ID = 'usr_spendwise_primary';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat_food', userId: 'system', name: 'Food and Groceries', icon: 'Utensils', color: '#16a34a', type: 'EXPENSE', isSystem: true },
  { id: 'cat_transport', userId: 'system', name: 'Transportation', icon: 'Car', color: '#0284c7', type: 'EXPENSE', isSystem: true },
  { id: 'cat_housing', userId: 'system', name: 'Housing and Rent', icon: 'Home', color: '#9333ea', type: 'EXPENSE', isSystem: true },
  { id: 'cat_utilities', userId: 'system', name: 'Utilities', icon: 'Zap', color: '#ea580c', type: 'EXPENSE', isSystem: true },
  { id: 'cat_internet', userId: 'system', name: 'Internet and Airtime', icon: 'Wifi', color: '#0d9488', type: 'EXPENSE', isSystem: true },
  { id: 'cat_education', userId: 'system', name: 'Education', icon: 'GraduationCap', color: '#4f46e5', type: 'EXPENSE', isSystem: true },
  { id: 'cat_healthcare', userId: 'system', name: 'Healthcare', icon: 'HeartPulse', color: '#e11d48', type: 'EXPENSE', isSystem: true },
  { id: 'cat_clothing', userId: 'system', name: 'Clothing', icon: 'Shirt', color: '#d97706', type: 'EXPENSE', isSystem: true },
  { id: 'cat_entertainment', userId: 'system', name: 'Entertainment', icon: 'Film', color: '#8b5cf6', type: 'EXPENSE', isSystem: true },
  { id: 'cat_personal', userId: 'system', name: 'Personal Care', icon: 'Sparkles', color: '#db2777', type: 'EXPENSE', isSystem: true },
  { id: 'cat_family', userId: 'system', name: 'Family and Gifts', icon: 'Gift', color: '#ec4899', type: 'EXPENSE', isSystem: true },
  { id: 'cat_subscriptions', userId: 'system', name: 'Subscriptions', icon: 'CreditCard', color: '#6366f1', type: 'EXPENSE', isSystem: true },
  { id: 'cat_shopping', userId: 'system', name: 'Shopping', icon: 'ShoppingBag', color: '#f59e0b', type: 'EXPENSE', isSystem: true },
  { id: 'cat_savings', userId: 'system', name: 'Savings', icon: 'PiggyBank', color: '#10b981', type: 'EXPENSE', isSystem: true },
  { id: 'cat_misc', userId: 'system', name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#64748b', type: 'EXPENSE', isSystem: true },

  // Income Categories
  { id: 'cat_inc_salary', userId: 'system', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_business', userId: 'system', name: 'Business', icon: 'TrendingUp', color: '#059669', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_freelance', userId: 'system', name: 'Freelancing', icon: 'Laptop', color: '#0284c7', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_allowance', userId: 'system', name: 'Allowance', icon: 'Wallet', color: '#8b5cf6', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_scholarship', userId: 'system', name: 'Scholarship', icon: 'Award', color: '#4f46e5', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_gifts', userId: 'system', name: 'Gifts', icon: 'Gift', color: '#ec4899', type: 'INCOME', isSystem: true },
  { id: 'cat_inc_other', userId: 'system', name: 'Other Income', icon: 'PlusCircle', color: '#64748b', type: 'INCOME', isSystem: true },
];

function generateSeedData(): DatabaseSchema {
  const user: User = {
    id: DEFAULT_USER_ID,
    name: 'Musab Gafar',
    email: 'gafarmusab93@gmail.com',
    defaultCurrency: 'NGN',
    theme: 'light',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  // 1 NGN = 100 minor units (kobo). e.g. ₦2,500 = 250000
  const transactions: Transaction[] = [
    // Today (2026-10-31)
    {
      id: 'tx_seed_101',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Transport to office',
      amount: 250000, // ₦2,500.00
      currency: 'NGN',
      categoryId: 'cat_transport',
      transactionDate: '2026-10-31',
      transactionTime: '08:15',
      paymentMethod: 'Cash',
      merchant: 'Ride Hail BRT',
      description: 'Morning commute via expressway',
      tags: ['commute', 'work'],
      isRecurring: false,
      createdAt: '2026-10-31T08:15:00Z',
      updatedAt: '2026-10-31T08:15:00Z',
    },
    {
      id: 'tx_seed_102',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Breakfast & Coffee',
      amount: 180000, // ₦1,800.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-31',
      transactionTime: '09:30',
      paymentMethod: 'Debit Card',
      merchant: 'Artisan Cafe Victoria Island',
      description: 'Morning toast and hot chocolate',
      tags: ['food', 'breakfast'],
      isRecurring: false,
      createdAt: '2026-10-31T09:30:00Z',
      updatedAt: '2026-10-31T09:30:00Z',
    },
    {
      id: 'tx_seed_103',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Lunch with team',
      amount: 420000, // ₦4,200.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-31',
      transactionTime: '13:45',
      paymentMethod: 'Debit Card',
      merchant: 'Bukka Hut Lagos',
      description: 'Jollof rice and grilled fish',
      tags: ['lunch', 'team'],
      isRecurring: false,
      createdAt: '2026-10-31T13:45:00Z',
      updatedAt: '2026-10-31T13:45:00Z',
    },

    // Yesterday (2026-10-30)
    {
      id: 'tx_seed_104',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Electricity Token Re-charge',
      amount: 1500000, // ₦15,000.00
      currency: 'NGN',
      categoryId: 'cat_utilities',
      transactionDate: '2026-10-30',
      transactionTime: '11:20',
      paymentMethod: 'Bank Transfer',
      merchant: 'IKEDC Meter 450192',
      description: 'Prepaid unit recharge for flat',
      tags: ['home', 'utilities'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-10-30T11:20:00Z',
      updatedAt: '2026-10-30T11:20:00Z',
    },
    {
      id: 'tx_seed_105',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Uber to Client Meeting',
      amount: 380000, // ₦3,800.00
      currency: 'NGN',
      categoryId: 'cat_transport',
      transactionDate: '2026-10-30',
      transactionTime: '14:10',
      paymentMethod: 'Debit Card',
      merchant: 'Uber Nigeria',
      description: 'Transit to client presentation in Ikoyi',
      tags: ['business', 'transport'],
      isRecurring: false,
      createdAt: '2026-10-30T14:10:00Z',
      updatedAt: '2026-10-30T14:10:00Z',
    },
    {
      id: 'tx_seed_106',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Dinner groceries',
      amount: 540000, // ₦5,400.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-30',
      transactionTime: '19:00',
      paymentMethod: 'Debit Card',
      merchant: 'Spar Supermarket',
      description: 'Fresh vegetables, milk, eggs, bread',
      tags: ['groceries'],
      isRecurring: false,
      createdAt: '2026-10-30T19:00:00Z',
      updatedAt: '2026-10-30T19:00:00Z',
    },

    // Earlier this week (2026-10-27 to 2026-10-29)
    {
      id: 'tx_seed_107',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Broadband Fiber Subscription',
      amount: 2200000, // ₦22,000.00
      currency: 'NGN',
      categoryId: 'cat_internet',
      transactionDate: '2026-10-28',
      transactionTime: '10:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'FiberOne HighSpeed',
      description: 'Monthly unlimited home fiber internet',
      tags: ['remote-work', 'internet'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-10-28T10:00:00Z',
      updatedAt: '2026-10-28T10:00:00Z',
    },
    {
      id: 'tx_seed_108',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Pharmacy prescription & vitamins',
      amount: 850000, // ₦8,500.00
      currency: 'NGN',
      categoryId: 'cat_healthcare',
      transactionDate: '2026-10-27',
      transactionTime: '17:30',
      paymentMethod: 'Debit Card',
      merchant: 'Medplus Pharmacy',
      description: 'Multivitamins and allergy drops',
      tags: ['health'],
      isRecurring: false,
      createdAt: '2026-10-27T17:30:00Z',
      updatedAt: '2026-10-27T17:30:00Z',
    },
    {
      id: 'tx_seed_109',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Spotify & Cloud storage',
      amount: 320000, // ₦3,200.00
      currency: 'NGN',
      categoryId: 'cat_subscriptions',
      transactionDate: '2026-10-25',
      transactionTime: '06:00',
      paymentMethod: 'Debit Card',
      merchant: 'Spotify Premium',
      description: 'Monthly family plan',
      tags: ['digital', 'entertainment'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-10-25T06:00:00Z',
      updatedAt: '2026-10-25T06:00:00Z',
    },

    // Mid-month October 2026
    {
      id: 'tx_seed_110',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Weekly Market Foodstuff',
      amount: 2850000, // ₦28,500.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-18',
      transactionTime: '11:00',
      paymentMethod: 'Cash',
      merchant: 'Mile 12 Central Market',
      description: 'Yams, plantains, rice, beef, cooking oil',
      tags: ['groceries', 'bulk'],
      isRecurring: false,
      createdAt: '2026-10-18T11:00:00Z',
      updatedAt: '2026-10-18T11:00:00Z',
    },
    {
      id: 'tx_seed_111',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Car Servicing & Engine Oil',
      amount: 3500000, // ₦35,000.00
      currency: 'NGN',
      categoryId: 'cat_transport',
      transactionDate: '2026-10-14',
      transactionTime: '15:20',
      paymentMethod: 'Bank Transfer',
      merchant: 'Lekki Auto Care',
      description: 'Synthetic oil replacement and filter check',
      tags: ['car', 'maintenance'],
      isRecurring: false,
      createdAt: '2026-10-14T15:20:00Z',
      updatedAt: '2026-10-14T15:20:00Z',
    },

    // October Income
    {
      id: 'tx_seed_201',
      userId: DEFAULT_USER_ID,
      type: 'INCOME',
      title: 'Monthly Engineering Salary',
      amount: 55000000, // ₦550,000.00
      currency: 'NGN',
      categoryId: 'cat_inc_salary',
      transactionDate: '2026-10-26',
      transactionTime: '09:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'Techcorp Global Ltd',
      description: 'Net monthly salary for October 2026',
      tags: ['salary', 'primary-income'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-10-26T09:00:00Z',
      updatedAt: '2026-10-26T09:00:00Z',
    },
    {
      id: 'tx_seed_202',
      userId: DEFAULT_USER_ID,
      type: 'INCOME',
      title: 'UI Design Consulting Project',
      amount: 18000000, // ₦180,000.00
      currency: 'NGN',
      categoryId: 'cat_inc_freelance',
      transactionDate: '2026-10-15',
      transactionTime: '16:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'Fintech Studio Partner',
      description: 'Mobile app design milestone completion',
      tags: ['freelance', 'client-project'],
      isRecurring: false,
      createdAt: '2026-10-15T16:00:00Z',
      updatedAt: '2026-10-15T16:00:00Z',
    },

    // September 2026 Historical Expenses
    {
      id: 'tx_seed_301',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Groceries & Bulk Provisions',
      amount: 4800000, // ₦48,000.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-09-12',
      transactionTime: '12:00',
      paymentMethod: 'Debit Card',
      merchant: 'Shoprite Lekki Mall',
      description: 'Pantry restocking for September',
      tags: ['groceries'],
      isRecurring: false,
      createdAt: '2026-09-12T12:00:00Z',
      updatedAt: '2026-09-12T12:00:00Z',
    },
    {
      id: 'tx_seed_302',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Fuel & Car maintenance',
      amount: 3200000, // ₦32,000.00
      currency: 'NGN',
      categoryId: 'cat_transport',
      transactionDate: '2026-09-20',
      transactionTime: '10:00',
      paymentMethod: 'Debit Card',
      merchant: 'TotalEnergies Station',
      description: 'Full tank fuel purchase',
      tags: ['fuel', 'transport'],
      isRecurring: false,
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'tx_seed_303',
      userId: DEFAULT_USER_ID,
      type: 'EXPENSE',
      title: 'Electricity token',
      amount: 1400000, // ₦14,000.00
      currency: 'NGN',
      categoryId: 'cat_utilities',
      transactionDate: '2026-09-28',
      transactionTime: '11:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'IKEDC Prepaid',
      description: 'Monthly electricity bill',
      tags: ['utilities'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-09-28T11:00:00Z',
      updatedAt: '2026-09-28T11:00:00Z',
    },
    {
      id: 'tx_seed_304',
      userId: DEFAULT_USER_ID,
      type: 'INCOME',
      title: 'September Salary',
      amount: 55000000, // ₦550,000.00
      currency: 'NGN',
      categoryId: 'cat_inc_salary',
      transactionDate: '2026-09-26',
      transactionTime: '09:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'Techcorp Global Ltd',
      description: 'Net monthly salary for September 2026',
      tags: ['salary'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: '2026-09-26T09:00:00Z',
      updatedAt: '2026-09-26T09:00:00Z',
    },
  ];

  const budgets: Budget[] = [
    {
      id: 'bg_overall_monthly',
      userId: DEFAULT_USER_ID,
      amount: 25000000, // ₦250,000.00 overall monthly limit
      currency: 'NGN',
      period: 'monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      alertThresholds: [50, 75, 90, 100],
    },
    {
      id: 'bg_food_monthly',
      userId: DEFAULT_USER_ID,
      categoryId: 'cat_food',
      amount: 6000000, // ₦60,000.00 food limit
      currency: 'NGN',
      period: 'monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      alertThresholds: [50, 75, 90, 100],
    },
    {
      id: 'bg_transport_monthly',
      userId: DEFAULT_USER_ID,
      categoryId: 'cat_transport',
      amount: 5000000, // ₦50,000.00 transport limit
      currency: 'NGN',
      period: 'monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      alertThresholds: [50, 75, 90, 100],
    },
    {
      id: 'bg_utilities_monthly',
      userId: DEFAULT_USER_ID,
      categoryId: 'cat_utilities',
      amount: 2500000, // ₦25,000.00 utilities limit
      currency: 'NGN',
      period: 'monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      alertThresholds: [50, 75, 90, 100],
    },
  ];

  return {
    users: [user],
    categories: DEFAULT_CATEGORIES,
    transactions,
    budgets,
    chatHistory: {},
  };
}

class SpendWiseDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.transactions && parsed.categories) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing fresh store:', err);
    }

    const initial = generateSeedData();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(state?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = state || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  // --- User Operations ---
  public getUser(userId = DEFAULT_USER_ID): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) {
      return this.data.users[0] || {
        id: DEFAULT_USER_ID,
        name: 'SpendWise User',
        email: 'user@spendwise.ai',
        defaultCurrency: 'NGN',
        theme: 'light',
        createdAt: new Date().toISOString(),
      };
    }
    return user;
  }

  public updateUser(userId = DEFAULT_USER_ID, updates: Partial<User>): User {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveDatabase();
      return this.data.users[idx];
    }
    const newUser: User = {
      id: userId,
      name: updates.name || 'SpendWise User',
      email: updates.email || 'user@spendwise.ai',
      defaultCurrency: updates.defaultCurrency || 'NGN',
      theme: updates.theme || 'light',
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  // --- Category Operations ---
  public getCategories(userId = DEFAULT_USER_ID): Category[] {
    return this.data.categories.filter(c => c.userId === 'system' || c.userId === userId);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public createCategory(category: Omit<Category, 'id' | 'userId'>, userId = DEFAULT_USER_ID): Category {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      isSystem: false,
    };
    this.data.categories.push(newCategory);
    this.saveDatabase();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>, userId = DEFAULT_USER_ID): Category | null {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;
    if (cat.isSystem) {
      // Create a user override or clone if system category
      const customClone: Category = {
        ...cat,
        ...updates,
        id: `cat_custom_${Date.now()}`,
        userId,
        isSystem: false,
      };
      this.data.categories.push(customClone);
      this.saveDatabase();
      return customClone;
    }
    Object.assign(cat, updates);
    this.saveDatabase();
    return cat;
  }

  public deleteCategory(id: string, userId = DEFAULT_USER_ID): boolean {
    const index = this.data.categories.findIndex(c => c.id === id && c.userId === userId);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.saveDatabase();
    return true;
  }

  // --- Transaction Operations ---
  public getTransactions(filter?: TransactionFilter, userId = DEFAULT_USER_ID): Transaction[] {
    let list = this.data.transactions.filter(t => t.userId === userId);

    if (filter) {
      if (filter.type && filter.type !== 'ALL') {
        list = list.filter(t => t.type === filter.type);
      }
      if (filter.categoryId) {
        list = list.filter(t => t.categoryId === filter.categoryId);
      }
      if (filter.paymentMethod) {
        list = list.filter(t => t.paymentMethod.toLowerCase() === filter.paymentMethod?.toLowerCase());
      }
      if (filter.startDate) {
        list = list.filter(t => t.transactionDate >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter(t => t.transactionDate <= filter.endDate!);
      }
      if (typeof filter.minAmount === 'number') {
        list = list.filter(t => t.amount >= filter.minAmount!);
      }
      if (typeof filter.maxAmount === 'number') {
        list = list.filter(t => t.amount <= filter.maxAmount!);
      }
      if (filter.merchant) {
        const m = filter.merchant.toLowerCase();
        list = list.filter(t => t.merchant.toLowerCase().includes(m));
      }
      if (filter.tag) {
        const tag = filter.tag.toLowerCase();
        list = list.filter(t => t.tags.some(tg => tg.toLowerCase() === tag));
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.tags.some(tg => tg.toLowerCase().includes(q))
        );
      }
    }

    // Sort order
    const sortBy = filter?.sortBy || 'date_desc';
    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        const dateComp = b.transactionDate.localeCompare(a.transactionDate);
        if (dateComp !== 0) return dateComp;
        return (b.transactionTime || '00:00').localeCompare(a.transactionTime || '00:00');
      } else if (sortBy === 'date_asc') {
        const dateComp = a.transactionDate.localeCompare(b.transactionDate);
        if (dateComp !== 0) return dateComp;
        return (a.transactionTime || '00:00').localeCompare(b.transactionTime || '00:00');
      } else if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      } else if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      } else if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    // Augment with category names
    return list.map(t => {
      const cat = this.getCategoryById(t.categoryId);
      return {
        ...t,
        categoryName: cat?.name || 'Uncategorized',
      };
    });
  }

  public getTransactionById(id: string, userId = DEFAULT_USER_ID): Transaction | undefined {
    const tx = this.data.transactions.find(t => t.id === id && t.userId === userId);
    if (!tx) return undefined;
    const cat = this.getCategoryById(tx.categoryId);
    return {
      ...tx,
      categoryName: cat?.name || 'Uncategorized',
    };
  }

  public createTransaction(txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId = DEFAULT_USER_ID): Transaction {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    this.data.transactions.push(newTx);
    this.saveDatabase();
    const cat = this.getCategoryById(newTx.categoryId);
    return {
      ...newTx,
      categoryName: cat?.name || 'Uncategorized',
    };
  }

  public updateTransaction(id: string, updates: Partial<Transaction>, userId = DEFAULT_USER_ID): Transaction | null {
    const idx = this.data.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (idx === -1) return null;
    const existing = this.data.transactions[idx];
    const updated: Transaction = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.transactions[idx] = updated;
    this.saveDatabase();
    const cat = this.getCategoryById(updated.categoryId);
    return {
      ...updated,
      categoryName: cat?.name || 'Uncategorized',
    };
  }

  public deleteTransaction(id: string, userId = DEFAULT_USER_ID): boolean {
    const idx = this.data.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (idx === -1) return false;
    this.data.transactions.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  public duplicateTransaction(id: string, userId = DEFAULT_USER_ID): Transaction | null {
    const original = this.getTransactionById(id, userId);
    if (!original) return null;
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original;
    return this.createTransaction({
      ...rest,
      title: `${original.title} (Copy)`,
    }, userId);
  }

  // --- Budget Operations ---
  public getBudgets(userId = DEFAULT_USER_ID): Budget[] {
    return this.data.budgets.filter(b => b.userId === userId).map(b => {
      const cat = b.categoryId ? this.getCategoryById(b.categoryId) : undefined;
      return {
        ...b,
        categoryName: cat ? cat.name : 'Overall Budget',
      };
    });
  }

  public createBudget(budget: Omit<Budget, 'id' | 'userId'>, userId = DEFAULT_USER_ID): Budget {
    const newBudget: Budget = {
      ...budget,
      id: `bg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
    };
    this.data.budgets.push(newBudget);
    this.saveDatabase();
    const cat = newBudget.categoryId ? this.getCategoryById(newBudget.categoryId) : undefined;
    return {
      ...newBudget,
      categoryName: cat ? cat.name : 'Overall Budget',
    };
  }

  public updateBudget(id: string, updates: Partial<Budget>, userId = DEFAULT_USER_ID): Budget | null {
    const idx = this.data.budgets.findIndex(b => b.id === id && b.userId === userId);
    if (idx === -1) return null;
    const updated = { ...this.data.budgets[idx], ...updates };
    this.data.budgets[idx] = updated;
    this.saveDatabase();
    const cat = updated.categoryId ? this.getCategoryById(updated.categoryId) : undefined;
    return {
      ...updated,
      categoryName: cat ? cat.name : 'Overall Budget',
    };
  }

  public deleteBudget(id: string, userId = DEFAULT_USER_ID): boolean {
    const idx = this.data.budgets.findIndex(b => b.id === id && b.userId === userId);
    if (idx === -1) return false;
    this.data.budgets.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- Chat History Operations ---
  public getChatHistory(userId = DEFAULT_USER_ID): AIChatMessage[] {
    return this.data.chatHistory[userId] || [];
  }

  public addChatMessage(message: AIChatMessage, userId = DEFAULT_USER_ID): void {
    if (!this.data.chatHistory[userId]) {
      this.data.chatHistory[userId] = [];
    }
    this.data.chatHistory[userId].push(message);
    // Keep last 50 messages
    if (this.data.chatHistory[userId].length > 50) {
      this.data.chatHistory[userId].shift();
    }
    this.saveDatabase();
  }

  public clearChatHistory(userId = DEFAULT_USER_ID): void {
    this.data.chatHistory[userId] = [];
    this.saveDatabase();
  }

  // --- Financial Summary & Deterministic Aggregation ---
  public getSummary(userId = DEFAULT_USER_ID, targetDate = '2026-10-31'): DashboardSummary {
    const user = this.getUser(userId);
    const currency = user.defaultCurrency || 'NGN';
    const allTx = this.data.transactions.filter(t => t.userId === userId);

    const [yearStr, monthStr, dayStr] = targetDate.split('-');
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);

    // Helpers for date boundaries
    const targetDayDate = new Date(Date.UTC(targetYear, targetMonth - 1, parseInt(dayStr, 10)));
    const prevDayDate = new Date(targetDayDate);
    prevDayDate.setUTCDate(prevDayDate.getUTCDate() - 1);
    const prevDayStr = prevDayDate.toISOString().slice(0, 10);

    // 1. Today vs Yesterday Expenses
    const todayExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate === targetDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const yesterdayExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate === prevDayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const todayPct = calculatePercentageChange(todayExpensesMinor, yesterdayExpensesMinor);

    // 2. This Week vs Last Week Expenses (7-day window ending at targetDate)
    const sevenDaysAgoDate = new Date(targetDayDate);
    sevenDaysAgoDate.setUTCDate(sevenDaysAgoDate.getUTCDate() - 6);
    const weekStartStr = sevenDaysAgoDate.toISOString().slice(0, 10);

    const fourteenDaysAgoDate = new Date(targetDayDate);
    fourteenDaysAgoDate.setUTCDate(fourteenDaysAgoDate.getUTCDate() - 13);
    const prevWeekStartStr = fourteenDaysAgoDate.toISOString().slice(0, 10);

    const weekExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate >= weekStartStr && t.transactionDate <= targetDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const prevWeekExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate >= prevWeekStartStr && t.transactionDate < weekStartStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekPct = calculatePercentageChange(weekExpensesMinor, prevWeekExpensesMinor);

    // 3. This Month vs Last Month
    const currentMonthPrefix = `${yearStr}-${monthStr.padStart(2, '0')}`;
    const prevMonthDate = new Date(Date.UTC(targetYear, targetMonth - 2, 1));
    const prevMonthPrefix = `${prevMonthDate.getUTCFullYear()}-${String(prevMonthDate.getUTCMonth() + 1).padStart(2, '0')}`;

    const monthExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(prevMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthPct = calculatePercentageChange(monthExpensesMinor, prevMonthExpensesMinor);

    // 4. This Year vs Last Year
    const prevYearStr = String(targetYear - 1);
    const yearExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(yearStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevYearExpensesMinor = allTx
      .filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(prevYearStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const yearPct = calculatePercentageChange(yearExpensesMinor, prevYearExpensesMinor);

    // 5. Total Income this month
    const monthIncomeMinor = allTx
      .filter(t => t.type === 'INCOME' && t.transactionDate.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthIncomeMinor = allTx
      .filter(t => t.type === 'INCOME' && t.transactionDate.startsWith(prevMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const incomePct = calculatePercentageChange(monthIncomeMinor, prevMonthIncomeMinor);

    // 6. Net Cash Flow & Savings
    const netCashFlow = monthIncomeMinor - monthExpensesMinor;
    const savingsRate = monthIncomeMinor > 0 ? Math.max(0, Math.round((netCashFlow / monthIncomeMinor) * 100)) : 0;

    // 7. Overall monthly budget remaining & utilization
    const monthlyOverallBudget = this.data.budgets.find(b => b.userId === userId && (!b.categoryId || b.categoryId === 'all') && b.period === 'monthly');
    const budgetAmount = monthlyOverallBudget ? monthlyOverallBudget.amount : 25000000; // default ₦250k
    const remainingBudget = budgetAmount - monthExpensesMinor;
    const budgetUtilizationPct = budgetAmount > 0 ? Math.round((monthExpensesMinor / budgetAmount) * 100) : 0;

    // 8. Category Breakdown for current month
    const monthExpenses = allTx.filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(currentMonthPrefix));
    const catMap = new Map<string, { total: number; count: number }>();
    for (const t of monthExpenses) {
      const existing = catMap.get(t.categoryId) || { total: 0, count: 0 };
      existing.total += t.amount;
      existing.count += 1;
      catMap.set(t.categoryId, existing);
    }

    const categories = this.getCategories(userId);
    const categoryBreakdown = Array.from(catMap.entries())
      .map(([catId, data]) => {
        const cat = categories.find(c => c.id === catId);
        const percentage = monthExpensesMinor > 0 ? Math.round((data.total / monthExpensesMinor) * 100) : 0;
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Uncategorized',
          color: cat?.color || '#64748b',
          totalAmount: data.total,
          percentage,
          count: data.count,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // 9. Daily Trend (last 14 days)
    const dailyTrend: Array<{ date: string; dayLabel: string; expense: number; income: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(targetDayDate);
      d.setUTCDate(d.getUTCDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      const exp = allTx.filter(t => t.type === 'EXPENSE' && t.transactionDate === dStr).reduce((s, t) => s + t.amount, 0);
      const inc = allTx.filter(t => t.type === 'INCOME' && t.transactionDate === dStr).reduce((s, t) => s + t.amount, 0);
      dailyTrend.push({
        date: dStr,
        dayLabel,
        expense: exp / 100, // major unit for clean charts
        income: inc / 100,
      });
    }

    // 10. Monthly Trend (12 months of current year)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthNames.map((mName, idx) => {
      const mStr = `${yearStr}-${String(idx + 1).padStart(2, '0')}`;
      const exp = allTx.filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
      const inc = allTx.filter(t => t.type === 'INCOME' && t.transactionDate.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
      return {
        month: mStr,
        monthName: mName,
        expense: exp / 100,
        income: inc / 100,
      };
    });

    // 11. Yearly Comparison (past 3 years)
    const yearsList = [targetYear - 2, targetYear - 1, targetYear];
    const yearlyComparison = yearsList.map(y => {
      const yStr = String(y);
      const exp = allTx.filter(t => t.type === 'EXPENSE' && t.transactionDate.startsWith(yStr)).reduce((s, t) => s + t.amount, 0);
      const inc = allTx.filter(t => t.type === 'INCOME' && t.transactionDate.startsWith(yStr)).reduce((s, t) => s + t.amount, 0);
      return {
        year: yStr,
        expense: exp / 100,
        income: inc / 100,
      };
    });

    // 12. Budget status list
    const budgets = this.getBudgets(userId);
    const budgetStatuses = budgets.map(b => {
      let spent = 0;
      if (b.categoryId && b.categoryId !== 'all') {
        spent = allTx
          .filter(t => t.type === 'EXPENSE' && t.categoryId === b.categoryId && t.transactionDate >= b.startDate && t.transactionDate <= b.endDate)
          .reduce((s, t) => s + t.amount, 0);
      } else {
        spent = allTx
          .filter(t => t.type === 'EXPENSE' && t.transactionDate >= b.startDate && t.transactionDate <= b.endDate)
          .reduce((s, t) => s + t.amount, 0);
      }
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      let status: 'normal' | 'warning' | 'critical' | 'exceeded' = 'normal';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 90) status = 'critical';
      else if (pct >= 75) status = 'warning';

      return {
        budgetId: b.id,
        categoryName: b.categoryName || 'Overall Budget',
        limit: b.amount,
        spent,
        remaining: b.amount - spent,
        percentageUsed: pct,
        status,
      };
    });

    return {
      todayExpenses: {
        amount: todayExpensesMinor,
        formatted: formatMoneyMinor(todayExpensesMinor, currency),
        previousPeriodAmount: yesterdayExpensesMinor,
        percentageChange: todayPct.value,
        isIncrease: todayPct.isIncrease,
      },
      weekExpenses: {
        amount: weekExpensesMinor,
        formatted: formatMoneyMinor(weekExpensesMinor, currency),
        previousPeriodAmount: prevWeekExpensesMinor,
        percentageChange: weekPct.value,
        isIncrease: weekPct.isIncrease,
      },
      monthExpenses: {
        amount: monthExpensesMinor,
        formatted: formatMoneyMinor(monthExpensesMinor, currency),
        previousPeriodAmount: prevMonthExpensesMinor,
        percentageChange: monthPct.value,
        isIncrease: monthPct.isIncrease,
      },
      yearExpenses: {
        amount: yearExpensesMinor,
        formatted: formatMoneyMinor(yearExpensesMinor, currency),
        previousPeriodAmount: prevYearExpensesMinor,
        percentageChange: yearPct.value,
        isIncrease: yearPct.isIncrease,
      },
      monthIncome: {
        amount: monthIncomeMinor,
        formatted: formatMoneyMinor(monthIncomeMinor, currency),
        previousPeriodAmount: prevMonthIncomeMinor,
        percentageChange: incomePct.value,
        isIncrease: incomePct.isIncrease,
      },
      remainingBudget,
      budgetUtilizationPct,
      netCashFlow,
      savingsRate,
      currency,
      categoryBreakdown,
      dailyTrend,
      monthlyTrend,
      yearlyComparison,
      budgetStatuses,
    };
  }

  // Backup & Restore
  public getFullBackup(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreBackup(imported: DatabaseSchema): boolean {
    if (!imported.users || !Array.isArray(imported.transactions)) {
      return false;
    }
    this.data = imported;
    this.saveDatabase();
    return true;
  }
}

function calculatePercentageChange(current: number, previous: number): { value: number; isIncrease: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isIncrease: current > 0 };
  }
  const diff = current - previous;
  const pct = Math.round((Math.abs(diff) / previous) * 100 * 10) / 10;
  return { value: pct, isIncrease: diff >= 0 };
}

function formatMoneyMinor(minorUnits: number, currency = 'NGN'): string {
  const major = minorUnits / 100;
  if (currency === 'NGN') {
    return `₦${major.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const db = new SpendWiseDatabase();
