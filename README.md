# 📈 Signalist — AI Stock Tracker & Portfolio Management

Signalist is an enterprise-grade stock tracking, market intelligence, and portfolio analytics platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

It combines real-time Finnhub market data with TradingView technical charts, Claude-powered AI daily briefings, automated price alerts, and full portfolio health diagnostics.

---

## ✨ Features Implemented

### 🔐 Authentication & Session Persistence
- **Secure Auth:** Salted password hashing with `bcryptjs` and edge-compatible JWT session management via `jose`.
- **Investor Personalization:** Onboarding captures country, investment goals (Growth, Income, Balanced, Conservative), risk tolerance (Low, Medium, High), and target industry.
- **Route Protection:** Next.js middleware guards protected routes and manages session state.
- **Welcome Emails:** Automated transactional welcome email dispatch via Nodemailer/SMTP matching `WelcomeEmailData`.

### 📊 Real-Time Market Data & TradingView Widgets
- **Finnhub Integration:** Live quotes, company profiles, fundamentals (P/E ratio, market cap), and market news with server-side caching (`revalidate`) and 429 rate-limit backoff.
- **Stock Detail Pages (`/stocks/[symbol]`):**
  - Symbol Info Bar
  - Interactive Candle Chart
  - Baseline Trend Chart
  - Technical Analysis Multi-Timeframe Gauges
  - Company Profile
  - Financial Fundamentals

### 🔍 Command Palette & Search (`⌘K` / `Ctrl+K`)
- **Global Command Palette:** Instant symbol search with debounced Finnhub queries and direct "Add to Watchlist" toggling.
- **Dedicated Search Page (`/search`):** Search bar with live suggestions and popular market movers.

### ⭐ Watchlist Management (`/watchlist`)
- Real-time table displaying company, symbol, price, 24h change, market cap, and P/E ratio.
- Inline alert creation and stock removal with optimistic updates.
- Shareable watchlists (`/watchlist/share/[token]`) for public sharing.
- Curated watchlist market news feed.

### 🔔 Smart Alerts & Evaluation Cron
- **Threshold Price Alerts:** Upper and lower price triggers with email notifications.
- **Smart Alert Types:** % single-day moves, 52-week highs/lows, and volume spikes.
- **Natural Language Alert Creation:** Type queries like `"tell me if NVDA drops 5% in a day"` to auto-parse parameters.
- **Scheduled Runner (`/api/cron/alerts`):** Automated cron endpoint evaluating active alerts against live market quotes.

### 🧠 Standout Differentiating Features
1. **Personalized AI Daily Briefing:** Dashboard card synthesizing user's risk tolerance, investment goals, watchlist, and news into tailored morning takeaways, with one-click email dispatch.
2. **"Explain This Move" Button:** AI-generated contextual analysis explaining today's price movements with catalyst tagging and direct source links.
3. **Portfolio Tracking & P&L:** Holdings cost basis, unrealized/realized P&L, 1D/1W/1M/1Y timeframe filtering, and benchmark comparison against the S&P 500 (SPY).
4. **CSV Portfolio Import:** Batch upload or paste brokerage CSV exports (`Symbol, Shares, Price`).
5. **Portfolio Health Score (0-100):** Algorithmic diagnosis flagging single-stock concentration and sector-risk mismatches against stated risk tolerance.
6. **Earnings & Events Calendar (`/calendar`):** Key earnings announcements and dividend record dates with watchlist filter toggle.
7. **Paper Trading & "What-If" Simulator (`/simulator`):**
   - **"What-If" Calculator:** Computes historical returns and SPY alpha for any asset and timeframe.
   - **Paper Trading Terminal:** Practice trades with $100,000 virtual cash and live order execution ledger.
8. **PWA & Production Polish:** Web App Manifest (`manifest.json`), error boundaries (`error.tsx`, `not-found.tsx`), and SEO metadata.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **UI & Components:** React 19, Tailwind CSS v4, shadcn/ui (`command`, `popover`, `dialog`, `select`, `avatar`, `dropdown-menu`)
- **Language:** TypeScript (Strict)
- **Database:** MongoDB (Mongoose) with zero-setup in-memory fallback
- **Market Data:** Finnhub REST API
- **AI Engine:** Anthropic API (Claude 3.5 Sonnet) with algorithmic heuristics fallback
- **Email:** Nodemailer (SMTP / Mailtrap / Resend)
- **Auth:** JWT (`jose`) + `bcryptjs`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ or 22+
- npm or yarn

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
# Finnhub API Key (get from https://finnhub.io)
FINNHUB_API_KEY=your_finnhub_api_key

# Anthropic API Key (for AI Briefing & Move Explanations)
ANTHROPIC_API_KEY=your_anthropic_api_key

# MongoDB Connection String (optional, falls back to memory store if unavailable)
MONGODB_URI=mongodb://localhost:27017/signalist

# Auth JWT Secret
AUTH_SECRET=signalist_super_secret_jwt_key_32_chars_min_length_12345

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (SMTP / Nodemailer)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="Signalist <notifications@signalist.com>"

# Scheduled Alert Evaluation Cron Secret
CRON_SECRET=signalist_cron_secret_token
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and start production
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏰ Scheduled Jobs & Cron Setup

To evaluate price alerts automatically on a schedule, configure a cron job (via Vercel Cron, GitHub Actions, or Inngest) to trigger:
```bash
curl -X GET "https://your-domain.com/api/cron/alerts?secret=YOUR_CRON_SECRET"
```

---

## 🧪 Verification Commands

```bash
# TypeScript verification
npx tsc --noEmit

# Code linting
npm run lint

# Production build test
npm run build
```
