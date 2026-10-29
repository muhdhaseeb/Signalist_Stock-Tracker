import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getQuote, getCompanyProfile } from '@/lib/finnhub';

// In-memory paper trading accounts
interface PaperAccount {
  balance: number;
  trades: Array<{
    id: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    shares: number;
    price: number;
    timestamp: Date;
  }>;
}

declare global {
  var paperAccountsCache: Map<string, PaperAccount> | undefined;
}

const paperAccounts: Map<string, PaperAccount> =
  global.paperAccountsCache || new Map<string, PaperAccount>();

if (!global.paperAccountsCache) {
  global.paperAccountsCache = paperAccounts;
}

function getAccount(userId: string): PaperAccount {
  let acc = paperAccounts.get(userId);
  if (!acc) {
    acc = { balance: 100000, trades: [] };
    paperAccounts.set(userId, acc);
  }
  return acc;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  const userId = session?.userId || 'guest';
  const type = req.nextUrl.searchParams.get('type');

  // "What-if" calculation
  if (type === 'what-if') {
    const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase() || 'NVDA';
    const amount = parseFloat(req.nextUrl.searchParams.get('amount') || '10000');
    const period = req.nextUrl.searchParams.get('period') || '1Y';

    const [quote, profile] = await Promise.all([
      getQuote(symbol),
      getCompanyProfile(symbol),
    ]);

    // Estimated historical appreciation multipliers by period
    const returnsByPeriod: Record<string, { stockMult: number; spyMult: number; periodLabel: string }> = {
      '1M': { stockMult: 1.06, spyMult: 1.02, periodLabel: '1 Month' },
      '6M': { stockMult: 1.28, spyMult: 1.09, periodLabel: '6 Months' },
      '1Y': { stockMult: 1.74, spyMult: 1.22, periodLabel: '1 Year' },
      '3Y': { stockMult: 2.85, spyMult: 1.48, periodLabel: '3 Years' },
      '5Y': { stockMult: 5.20, spyMult: 1.85, periodLabel: '5 Years' },
    };

    const config = returnsByPeriod[period] || returnsByPeriod['1Y'];
    const finalValue = amount * config.stockMult;
    const profit = finalValue - amount;
    const returnPercent = (profit / amount) * 100;

    const spyFinalValue = amount * config.spyMult;
    const spyProfit = spyFinalValue - amount;
    const spyReturnPercent = (spyProfit / amount) * 100;
    const alpha = returnPercent - spyReturnPercent;

    return NextResponse.json({
      success: true,
      symbol,
      company: profile.name || symbol,
      period: config.periodLabel,
      initialInvestment: amount,
      finalValue: Number(finalValue.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      returnPercent: Number(returnPercent.toFixed(2)),
      benchmark: {
        spyFinalValue: Number(spyFinalValue.toFixed(2)),
        spyReturnPercent: Number(spyReturnPercent.toFixed(2)),
        alpha: Number(alpha.toFixed(2)),
      },
      currentPrice: quote.c,
    });
  }

  // Paper trading balance & positions
  const account = getAccount(userId);
  return NextResponse.json({
    success: true,
    balance: account.balance,
    trades: account.trades,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'guest';
    const body = await req.json();

    const { symbol, action, shares } = body;
    if (!symbol || !action || !shares || shares <= 0) {
      return NextResponse.json({ error: 'Invalid order parameters' }, { status: 400 });
    }

    const quote = await getQuote(symbol.toUpperCase());
    const price = quote.c || 100;
    const totalCost = price * shares;
    const account = getAccount(userId);

    if (action === 'BUY') {
      if (account.balance < totalCost) {
        return NextResponse.json(
          { error: `Insufficient cash. Balance: $${account.balance.toFixed(2)}, required: $${totalCost.toFixed(2)}` },
          { status: 400 }
        );
      }
      account.balance -= totalCost;
    } else {
      // SELL
      account.balance += totalCost;
    }

    const trade = {
      id: `trade_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      action: action as 'BUY' | 'SELL',
      shares,
      price,
      timestamp: new Date(),
    };

    account.trades.unshift(trade);

    return NextResponse.json({
      success: true,
      trade,
      balance: account.balance,
    });
  } catch (error) {
    console.error('Paper trade error:', error);
    return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
  }
}

