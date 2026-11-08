<div align="center">

# 📈 Signalist

### Next-Gen AI Stock Intelligence & Portfolio Management Platform

An institutional-grade market intelligence, equity analysis, and portfolio tracking suite built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![QA Verification](https://img.shields.io/badge/QA_Suite-30%2F30_PASS-10B981?style=for-the-badge&logo=checkmarx)](QA_LOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Architecture](#-architecture--system-design) • [Quickstart](#-getting-started) • [API & Scheduled Cron](#-scheduled-cron--alerts-engine) • [Testing](#-qa-testing--verification)

</div>

---

## 🌟 Overview

**Signalist** simplifies modern investing by bridging raw financial telemetry with artificial intelligence. Traditional retail stock apps overwhelm users with fragmented data; Signalist synthesizes real-time quotes, multi-timeframe technical charts, personalized AI daily briefings, and intelligent alert automation into an ultra-fast, accessible dashboard.

Designed from the ground up for speed, resilience, and data isolation, Signalist runs seamlessly with zero external database dependencies (using an automated in-memory fallback store) while supporting production MongoDB clusters out of the box.

---

## 🏛 Architecture & System Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                           │
│  (React 19 Server Components, Client Hydration, Turbopack Bundler)     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Authentication  │      │  Market Gateway  │      │   AI Engine      │
│  • Edge JWT jose │      │  • Finnhub API   │      │  • Anthropic API │
│  • Bcrypt Salted │      │  • Yahoo Public  │      │  • Heuristics    │
│  • Protected Nav │      │  • 80+ Directory │      │  • Catalyst NLP  │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Data Persistence Layer                             │
│  • Primary: MongoDB (Mongoose Schema Models & Transactions)           │
│  • Fallback: Deterministic In-Memory Cache Store (Zero-Config Dev)    │
│  • Rate Limiting: Token-bucket IP & Session Gatekeeper                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 🧠 AI Market Intelligence
- **Personalized Daily Briefing:** Dashboard intelligence card synthesized from the user's specific investment goals (*Growth, Income, Balanced, Conservative*), risk tolerance (*Low, Medium, High*), and preferred sectors. Includes one-click transactional email dispatch.
- **"Explain This Move" Catalyst Analysis:** On-demand AI modal analyzing why an asset moved today, citing news headlines, sentiment classification (*Bullish, Bearish, Neutral*), and direct financial publisher sources.
- **Natural Language Alert Parser:** Converts human prompts like *"Alert me if NVDA crosses above 160 dollars"* or *"Notify me if TSLA drops 5%"* into structured threshold rules with automated ticker extraction.

### 2. 🔍 Global Search & Command Palette (`⌘K` / `Ctrl+K`)
- **Global Command Palette:** Instant keyboard-driven lookup with debounced search across all US & international equities, ETFs, and indices.
- **Resilient Dual-Source Lookup:** Combines Finnhub API queries with Yahoo Finance public lookup and an 80+ ticker local catalog, ensuring any valid symbol worldwide resolves with real-time metadata.
- **Quick-Action Toggles:** Add or remove symbols from your watchlist directly within the command palette.

### 3. 📊 Interactive TradingView Technical Charts
- **Home Dashboard Widgets:** Market Overview tabs, Stock Heatmap, Real-Time Top Stories, and Market Quotes.
- **Stock Detail Pages (`/stocks/[symbol]`):**
  - Real-time quote banner with day change & volume
  - Advanced Interactive Candlestick Chart
  - Baseline Trend & Moving Average Chart
  - Multi-Timeframe Technical Analysis Gauges (Oscillators, Moving Averages)
  - Detailed Corporate Profile & Sector Breakdown
  - Fundamental Financials (P/E, EPS, 52-Week Range, Beta)
- **Lifecycle Resilience:** Custom `useTradingViewWidget` hook guards against React 19 StrictMode double-mounting and script detachment.

### 4. ⭐ Watchlist Management & Public Sharing
- **Real-Time Tracking Table:** Live prices, day change percentage, market capitalization, and P/E ratios.
- **Multi-Tenant Data Isolation:** Strict user scoping ensures private items remain isolated between accounts.
- **Public Shareable Watchlists (`/watchlist/share/[token]`):** Generate unique read-only share links for clients, friends, or social communities with live market quote hydration.

### 5. 🔔 Smart Alerts & Automated Cron Engine
- **Upper & Lower Price Triggers:** Real-time threshold monitoring with automated email notifications.
- **Serverless Cron Runner (`/api/cron/alerts`):** Bearer-token protected endpoint suitable for Vercel Cron, GitHub Actions, or Inngest to evaluate active alerts against live quotes and prevent duplicate dispatches.

### 6. 💼 Portfolio Analytics & SPY Benchmarking
- **Holdings Management:** Track cost basis, current equity, unrealized/realized P&L, and sector diversification.
- **Benchmark Alpha:** Real-time performance comparison against the S&P 500 (SPY) across `1D`, `1W`, `1M`, and `1Y` horizons.
- **Brokerage CSV Import:** Batch-import positions from brokerage export files or raw CSV text (`Symbol, Shares, Price`).

### 7. 🎮 Paper Trading & What-If Backtest Simulator
- **What-If Calculator:** Calculate how past investments (e.g., $10,000 in NVDA over 1 year) would have performed against the market.
- **Virtual Paper Trading:** Risk-free simulated trading terminal funded with **$100,000 in virtual cash** with an automated order ledger and balance tracking.

### 8. 📱 Progressive Web App (PWA) & Accessibility
- **PWA Manifest:** Standalone mobile app experience via `/manifest.json` with black-translucent status styling.
- **WCAG 2.1 Compliance:** Radix dialogs include dedicated accessible titles, descriptions, and keyboard focus traps. Form fields implement `aria-invalid` and `aria-describedby` announcements.

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16.1.6](https://nextjs.org/) (Turbopack) | App Router, Server Actions, Dynamic API Routes |
| **Frontend Library** | [React 19.2.3](https://react.dev/) | Concurrent rendering, modern hooks, server components |
| **Language** | [TypeScript 5.9.3](https://www.typescriptlang.org/) | Strict type checking, zero `any` policy |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS engine with container queries & CSS variables |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) | Accessible dialogs, command palettes, dropdowns, popovers |
| **Market Data** | [Finnhub API](https://finnhub.io/) + Yahoo Finance | Real-time quotes, profiles, and global market search |
| **Charting** | [TradingView Widgets](https://www.tradingview.com/) | Institutional candlestick, baseline, and gauge charts |
| **Database** | [MongoDB](https://www.mongodb.com/) (Mongoose 9) | Multi-collection persistence with memory store fallback |
| **Auth** | [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Stateless HTTP-only JWT cookies & salted passwords |
| **AI Models** | [Anthropic Claude 3.5](https://www.anthropic.com/) | Briefing generation, catalyst analysis, and alert parsing |
| **Email** | [Nodemailer](https://nodemailer.com/) | Transactional welcome emails & alert dispatch notifications |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** `v20.x` or `v22.x`
- **Package Manager:** `npm` (v10+) or `pnpm`
- **Git**

### 2. Clone & Install
```bash
git clone https://github.com/muhdhaseeb/Signalist_Stock-Tracker.git
cd Signalist_Stock-Tracker
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local environment:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
# Finnhub API Key (free tier at https://finnhub.io)
FINNHUB_API_KEY=your_finnhub_api_key

# Anthropic API Key (for Claude-powered AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key

# MongoDB Connection String (optional; falls back to in-memory store if omitted)
MONGODB_URI=mongodb://localhost:27017/signalist

# JWT Auth Secret (minimum 32 characters)
AUTH_SECRET=signalist_super_secret_jwt_key_32_chars_min_length_12345

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Transactional Email (SMTP / Mailtrap / Resend)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="Signalist Alerts <alerts@signalist.com>"

# Scheduled Alert Evaluation Cron Secret
CRON_SECRET=signalist_cron_secret_token
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> **Instant Testing Login:** Use the pre-seeded demo investor account on `/sign-in` (or click the **"Auto-fill"** shortcut button):
> - **Email:** `investor@signalist.com`
> - **Password:** `Password123`

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                  # Public auth layout, /sign-in, /sign-up
│   ├── (root)/                  # Authenticated app shell (Header, Nav)
│   │   ├── page.tsx             # Dashboard (AI Briefing + 4 TradingView widgets)
│   │   ├── search/              # Dedicated stock search page
│   │   ├── watchlist/           # Watchlist table & public share views
│   │   ├── portfolio/           # Portfolio P&L, health score & CSV import
│   │   ├── calendar/            # Earnings & economic market calendar
│   │   ├── simulator/           # Paper trading terminal & What-If calculator
│   │   └── stocks/[symbol]/     # Stock detail page with 6 TradingView widgets
│   ├── api/                     # REST API handlers
│   │   ├── ai/                  # Daily briefing, explain move, NLP alert parser
│   │   ├── alerts/              # User price alerts CRUD
│   │   ├── auth/                # Session, sign-in, sign-up, sign-out
│   │   ├── calendar/            # Market events & consensus data
│   │   ├── cron/                # Scheduled alert evaluator runner
│   │   ├── portfolio/           # Holdings calculation & CSV batch import
│   │   ├── stocks/              # Real-time multi-source search
│   │   └── watchlist/           # Watchlist sync & share token generation
│   ├── error.tsx                # Route segment error boundary
│   ├── global-error.tsx         # Root layout critical recovery boundary
│   └── layout.tsx               # Root HTML shell & font definitions
├── components/
│   ├── alerts/                  # AlertModal, AI natural language creator
│   ├── dashboard/               # DailyBriefingCard
│   ├── forms/                   # InputField, CountrySelect, FormSelect
│   ├── portfolio/               # AddHoldingModal, CsvImportModal
│   ├── stocks/                  # ExplainMoveModal, StockActions
│   ├── ui/                      # Accessible shadcn/ui component primitives
│   ├── watchlist/               # WatchlistTable, ShareWatchlistButton
│   ├── Header.tsx               # Sticky header with Search & UserDropdown
│   ├── SearchCommand.tsx        # Global Cmd+K Command Palette
│   └── TradingViewWidget.tsx    # Memory-safe TradingView embed wrapper
├── hooks/
│   └── useTradingViewWidget.tsx # Non-destructive lifecycle widget hook
├── lib/
│   ├── ai.ts                    # Claude prompt templates & heuristics fallback
│   ├── constants.ts             # Widget configurations & mock equities catalog
│   ├── email.ts                 # Nodemailer transactional templates
│   ├── finnhub.ts               # Finnhub & Yahoo multi-source market engine
│   ├── rate-limit.ts            # Sliding token-bucket rate limiter
│   └── db/                      # Mongoose models & in-memory store fallback
├── scripts/
│   └── qa-suite.mjs             # 30-assertion end-to-end QA test suite
└── QA_LOG.md                    # Formal verification log and defect tracker
```

---

## ⏰ Scheduled Cron & Alerts Engine

To evaluate price alerts on an automated interval, invoke the `/api/cron/alerts` endpoint via a cron scheduler (e.g., Vercel Cron, GitHub Actions, AWS EventBridge, or cron-job.org):

```bash
curl -X GET "https://your-domain.com/api/cron/alerts" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response payload:
```json
{
  "success": true,
  "processed": 8,
  "evaluatedAlerts": 8,
  "triggeredCount": 1,
  "evaluated": [
    {
      "symbol": "NVDA",
      "triggered": true,
      "currentPrice": 141.50,
      "threshold": 140.00,
      "type": "upper"
    }
  ]
}
```

---

## 🧪 QA Testing & Verification

Signalist includes an automated end-to-end verification suite testing all 30 user touchpoints from app boot to simulator execution:

```bash
# 1. Run ESLint (0 errors, 0 warnings)
npm run lint

# 2. Run TypeScript strict type-check (0 errors)
npx tsc --noEmit

# 3. Test production build packaging (Turbopack)
npm run build

# 4. Execute the automated QA verification suite (requires server running)
node scripts/qa-suite.mjs
```

### Automated Suite Coverage (30/30 PASS)
- [x] Route protection & 307 unauthenticated redirects
- [x] Web App Manifest `/manifest.json` delivery
- [x] Sign-up validation, password length constraints & duplicate email rejection
- [x] Session cookie lifecycle, refresh persistence & sign-out clearance
- [x] Multi-source global search (`AAPL`, `INTC`, `PLTR`, `DIS`, `WMT`, custom tickers)
- [x] Stock detail page normalization (case-insensitive `/stocks/nvda`)
- [x] Multi-user watchlist data isolation
- [x] Price alert validation (rejection of negative thresholds)
- [x] Portfolio P&L computation, sector allocation, and CSV batch import
- [x] AI daily briefing, catalyst breakdown, and natural language alert parser
- [x] Earnings calendar & $100k virtual paper trading simulator

See the full verification matrix in [`QA_LOG.md`](QA_LOG.md).

---

## 🔒 Security & Best Practices

- **Zero Secrets in Client Bundles:** All API keys (`FINNHUB_API_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`) are strictly kept on the server layer.
- **HTTP-Only Cookies:** Session tokens are transmitted exclusively via secure, SameSite HTTP-only cookies.
- **Rate Limiting:** Auth and AI endpoints implement IP-based sliding token bucket rate limiting to prevent credential brute-forcing and API abuse.
- **Input Sanitization:** All user inputs and CSV payloads are strictly validated using Zod schemas before database ingestion.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
