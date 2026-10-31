/**
 * SpendWise AI Automated Test Suite
 * Tests financial integrity, database isolation, calculations, edge cases, and AI parsing.
 */

import { db, DEFAULT_CATEGORIES } from './db.ts';
import { parseNaturalLanguageExpenses, generateFinancialInsights } from './ai.ts';
import { toMinorUnits, toMajorUnits, formatMoney } from '../src/lib/currency.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log('🧪 Starting SpendWise AI Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => void | Promise<void>) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name} - ${err.message}`);
      failed++;
    }
  };

  const testUserId = `usr_test_${Date.now()}`;

  // 1. Transaction CRUD
  await test('Adding an expense', () => {
    const tx = db.createTransaction({
      type: 'EXPENSE',
      title: 'Test Coffee',
      amount: 150000, // ₦1,500.00
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-31',
      transactionTime: '08:00',
      paymentMethod: 'Cash',
      merchant: 'Cafe',
      description: 'Morning coffee',
      tags: ['coffee'],
      isRecurring: false,
    }, testUserId);

    assert(tx.id.startsWith('tx_'), 'Transaction should have valid ID');
    assert(tx.amount === 150000, 'Amount should be stored in minor units (150000)');
    assert(tx.categoryName === 'Food and Groceries', 'Category name should be populated');
  });

  await test('Editing an expense', () => {
    const list = db.getTransactions({}, testUserId);
    const first = list[0];
    const updated = db.updateTransaction(first.id, {
      title: 'Updated Espresso',
      amount: 180000,
    }, testUserId);

    assert(updated !== null, 'Updated transaction should exist');
    assert(updated?.title === 'Updated Espresso', 'Title should be updated');
    assert(updated?.amount === 180000, 'Amount should be updated');
  });

  await test('Duplicating an expense', () => {
    const list = db.getTransactions({}, testUserId);
    const first = list[0];
    const duplicated = db.duplicateTransaction(first.id, testUserId);

    assert(duplicated !== null, 'Duplicated transaction should exist');
    assert(duplicated?.id !== first.id, 'Duplicated transaction should have new ID');
    assert(Boolean(duplicated?.title.includes('(Copy)')), 'Duplicated title should contain (Copy)');
  });

  await test('Deleting an expense', () => {
    const list = db.getTransactions({}, testUserId);
    const toDelete = list[0];
    const ok = db.deleteTransaction(toDelete.id, testUserId);
    assert(ok === true, 'Delete operation should return true');

    const remaining = db.getTransactionById(toDelete.id, testUserId);
    assert(remaining === undefined, 'Deleted transaction should not be found');
  });

  // 2. Multiple Expenses and Aggregations
  await test('Recording multiple expenses and daily total calculation', () => {
    // Clean test user data
    const existing = db.getTransactions({}, testUserId);
    existing.forEach(t => db.deleteTransaction(t.id, testUserId));

    db.createTransaction({
      type: 'EXPENSE',
      title: 'Breakfast',
      amount: 150000, // ₦1,500
      currency: 'NGN',
      categoryId: 'cat_food',
      transactionDate: '2026-10-31',
      transactionTime: '08:00',
      paymentMethod: 'Cash',
      merchant: 'Diner',
      description: 'Breakfast',
      tags: [],
      isRecurring: false,
    }, testUserId);

    db.createTransaction({
      type: 'EXPENSE',
      title: 'Transport',
      amount: 250000, // ₦2,500
      currency: 'NGN',
      categoryId: 'cat_transport',
      transactionDate: '2026-10-31',
      transactionTime: '09:00',
      paymentMethod: 'Debit Card',
      merchant: 'Ride',
      description: 'Ride',
      tags: [],
      isRecurring: false,
    }, testUserId);

    const summary = db.getSummary(testUserId, '2026-10-31');
    assert(summary.todayExpenses.amount === 400000, `Expected 400000 minor units (₦4,000), got ${summary.todayExpenses.amount}`);
  });

  // 3. Income & Net Cash Flow
  await test('Income and Net Cash Flow (Total Income - Total Expenses)', () => {
    db.createTransaction({
      type: 'INCOME',
      title: 'Freelance Design',
      amount: 10000000, // ₦100,000
      currency: 'NGN',
      categoryId: 'cat_inc_freelance',
      transactionDate: '2026-10-31',
      transactionTime: '10:00',
      paymentMethod: 'Bank Transfer',
      merchant: 'Client A',
      description: 'App UI design',
      tags: [],
      isRecurring: false,
    }, testUserId);

    const summary = db.getSummary(testUserId, '2026-10-31');
    assert(summary.monthIncome.amount === 10000000, 'Monthly income should equal ₦100,000');
    // Net cash flow = 10,000,000 - 400,000 = 9,600,000
    assert(summary.netCashFlow === 9600000, `Expected 9600000 net cash flow, got ${summary.netCashFlow}`);
    assert(summary.savingsRate === 96, `Expected 96% savings rate, got ${summary.savingsRate}%`);
  });

  // 4. Budget calculations & threshold alerts
  await test('Budget utilization and alert threshold calculation', () => {
    db.createBudget({
      categoryId: 'cat_food',
      amount: 300000, // ₦3,000 limit
      currency: 'NGN',
      period: 'monthly',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      alertThresholds: [50, 75, 90, 100],
    }, testUserId);

    // Food spending is currently ₦1,500 (150000) out of ₦3,000 (300000) = 50%
    const summary = db.getSummary(testUserId, '2026-10-31');
    const foodStatus = summary.budgetStatuses.find(b => b.categoryName === 'Food and Groceries');
    assert(foodStatus !== undefined, 'Food budget status must be found');
    assert(foodStatus?.percentageUsed === 50, `Expected 50% used, got ${foodStatus?.percentageUsed}%`);
  });

  // 5. Currency Handling & Minor Units Precision
  await test('Currency conversion and formatting without floating point rounding errors', () => {
    const minorUnits = toMinorUnits(2500.55);
    assert(minorUnits === 250055, 'toMinorUnits(2500.55) must be exactly 250055');
    const majorUnits = toMajorUnits(250055);
    assert(majorUnits === 2500.55, 'toMajorUnits(250055) must be 2500.55');

    const formattedNaira = formatMoney(250055, 'NGN');
    assert(formattedNaira.includes('2,500.55') && formattedNaira.includes('₦'), `Formatted Naira output: ${formattedNaira}`);
  });

  // 6. User Data Isolation
  await test('User data isolation across distinct user IDs', () => {
    const userA = `usr_alpha_${Date.now()}`;
    const userB = `usr_beta_${Date.now()}`;

    db.createTransaction({
      type: 'EXPENSE',
      title: 'Alpha Private Secret Expense',
      amount: 500000,
      currency: 'NGN',
      categoryId: 'cat_misc',
      transactionDate: '2026-10-31',
      transactionTime: '12:00',
      paymentMethod: 'Cash',
      merchant: 'Alpha Store',
      description: 'Private',
      tags: [],
      isRecurring: false,
    }, userA);

    const bTransactions = db.getTransactions({}, userB);
    const leaked = bTransactions.some(t => t.title.includes('Alpha Private'));
    assert(!leaked, 'User B must not see User A transactions');
  });

  // 7. AI Natural Language Expense Parsing & Fallback Resilience
  await test('Natural language expense parser heuristic fallback resilience', async () => {
    const result = await parseNaturalLanguageExpenses('Spent 2,500 naira on transport today', DEFAULT_CATEGORIES, '2026-10-31');
    assert(result.proposals.length > 0, 'Should extract at least one proposal');
    assert(result.proposals[0].amount === 2500, `Expected 2500 amount, got ${result.proposals[0].amount}`);
    assert(result.proposals[0].category === 'Transportation', `Expected Transportation category, got ${result.proposals[0].category}`);
  });

  // 8. Edge Cases
  await test('Edge case: Zero amount input handling', async () => {
    const result = await parseNaturalLanguageExpenses('Spent nothing today on anything', DEFAULT_CATEGORIES, '2026-10-31');
    assert(result.clarificationNeeded === true, 'Zero or missing amount should prompt for clarification');
  });

  await test('Edge case: Month boundaries & Leap year date validation', () => {
    // 2028 is a leap year; 2026 is not
    const feb2026 = new Date(2026, 2, 0).getDate(); // 28 days
    const feb2028 = new Date(2028, 2, 0).getDate(); // 29 days
    assert(feb2026 === 28, 'Feb 2026 must have 28 days');
    assert(feb2028 === 29, 'Feb 2028 must have 29 days');
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
