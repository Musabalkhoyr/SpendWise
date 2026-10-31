# SpendWise AI — Intelligent Personal Expense Tracker

SpendWise AI is a complete, production-grade personal financial management platform powered by Google's Gemma 4 and Gemini architecture. It enables users to record individual expenses, track income and cash flow, manage dynamic category and monthly budgets, scan receipts with multimodal vision, and query their financial ledger using natural language.

---

## 🌟 Key Features

1. **Individual Expense Recording**:
   - Every transaction is saved and tracked as an individual, distinct entry with time, title, category, merchant, payment method, tags, and recurrence.
   - Never rolls up or collapses transactions into flat totals; all summaries are calculated deterministically from underlying records.
   - Quick Natural Language Expense Entry (e.g. *"₦2,500 transport today"* or *"Paid ₦15,000 for electricity yesterday"*) with pre-confirmation verification before saving.

2. **Gemma 4 AI Assistant & Categorization**:
   - Conversational assistant grounded directly in the user's real transactions and ledger figures.
   - Auto-categorization engine across 15 standard domains (Food & Groceries, Transport, Utilities, Housing, Education, Healthcare, etc.).
   - AI-driven financial pattern insights highlighting budget trajectories and single largest outlays.

3. **Multimodal Receipt Scanner**:
   - Upload receipt images or bills to extract merchant, total amount, currency, date, line items, and category.
   - Interactive preview and confirmation modal to review extracted values before committing to the ledger.

4. **Multi-Scale Hierarchy Reporting**:
   - **Daily Records**: Timeline view with calendar picker, daily KPIs, category breakdown, and time-stamped item list.
   - **Monthly Records**: Monthly burn rate, peak and lowest spending days, daily rhythm bar chart, and expandable date accordions.
   - **Yearly Records**: Complete hierarchy: **Year → Month → Day → Individual Expense**.

5. **Income & Cash Flow Tracking**:
   - Separate recording for salary, freelance, business, allowance, and gifts.
   - Deterministic Net Cash Flow calculation (`Net Cash Flow = Total Income − Total Expenses`) and savings retention percentage.

6. **Budget Management & Threshold Alerts**:
   - Category-specific and overall limits with real-time visual progress bars.
   - Configurable alert milestones at 50%, 75%, 90%, and 100% capacity.

7. **Data Export & Backup/Restore**:
   - Export financial reports to CSV, Excel-compatible XML, or print-ready PDF statements.
   - Full JSON snapshot backup and one-click database restore.

8. **Currency & Localization**:
   - Default currency is Nigerian Naira (**₦ NGN**), with full support for USD ($), EUR (€), GBP (£), GHS (GH₵), and KES (KSh).
   - Strict minor-unit integer arithmetic (kobo/cents) to eliminate floating-point rounding errors.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript (`tsx`)
- **Database**: ACID-compliant persistent file database (`data/spendwise.db.json`) with relational schema, minor unit financial precision, and user isolation
- **AI Integration**: Google `@google/genai` TypeScript SDK with configurable model ID (`GEMMA_MODEL_ID` / `GEMINI_MODEL`) and proxy routing

---

## 🛠️ Setup & Local Installation

### 1. Prerequisites
- Node.js 20 or higher
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the following variables:
```env
# Google GenAI / Gemma API Key
GEMINI_API_KEY="your_google_api_key_here"

# Configurable Gemma/Gemini Model
GEMMA_MODEL_ID="gemini-3.8-flash"

# Port and Session
PORT=3000
DATABASE_URL="file:./data/spendwise.db.json"
SESSION_SECRET="your_session_secret"
```

### 4. Run the Application
In development:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

In production:
```bash
npm run build
npm start
```

---

## 🧪 Running Tests

SpendWise AI includes an automated test suite verifying CRUD operations, minor-unit calculations, budget alerts, user isolation, and AI parsing resilience:
```bash
npm test
```

---

## 🔒 Security & Privacy

- All AI calls are proxied strictly through the backend (`/api/ai/*`). The API key is never exposed to browser bundles.
- Monetary values are stored as integers (minor units) to prevent JavaScript floating-point inaccuracies.
- User data is completely isolated by user ID at the database layer.
