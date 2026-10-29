import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserWatchlist } from '@/lib/db/store';

export interface CalendarEvent {
  id: string;
  symbol: string;
  company: string;
  eventType: 'earnings' | 'dividend' | 'macro';
  date: string;
  timeOfDay: 'BMO' | 'AMC' | 'During Market';
  estimateEps?: number;
  actualEps?: number;
  priorEps?: number;
  dividendAmount?: number;
  isInWatchlist: boolean;
}

// Structured institutional event calendar
const MARKET_EVENTS: Omit<CalendarEvent, 'isInWatchlist'>[] = [
  {
    id: 'ev_1',
    symbol: 'NVDA',
    company: 'NVIDIA Corporation',
    eventType: 'earnings',
    date: '2026-11-18',
    timeOfDay: 'AMC',
    estimateEps: 0.84,
    priorEps: 0.68,
  },
  {
    id: 'ev_2',
    symbol: 'AAPL',
    company: 'Apple Inc',
    eventType: 'earnings',
    date: '2026-11-05',
    timeOfDay: 'AMC',
    estimateEps: 1.62,
    priorEps: 1.46,
  },
  {
    id: 'ev_3',
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    eventType: 'earnings',
    date: '2026-11-12',
    timeOfDay: 'AMC',
    estimateEps: 3.12,
    priorEps: 2.99,
  },
  {
    id: 'ev_4',
    symbol: 'TSLA',
    company: 'Tesla Inc',
    eventType: 'earnings',
    date: '2026-11-20',
    timeOfDay: 'AMC',
    estimateEps: 0.76,
    priorEps: 0.62,
  },
  {
    id: 'ev_5',
    symbol: 'GOOGL',
    company: 'Alphabet Inc',
    eventType: 'earnings',
    date: '2026-11-10',
    timeOfDay: 'BMO',
    estimateEps: 1.88,
    priorEps: 1.64,
  },
  {
    id: 'ev_6',
    symbol: 'AMZN',
    company: 'Amazon.com Inc',
    eventType: 'earnings',
    date: '2026-11-14',
    timeOfDay: 'AMC',
    estimateEps: 1.24,
    priorEps: 0.94,
  },
  {
    id: 'ev_7',
    symbol: 'JPM',
    company: 'JPMorgan Chase & Co',
    eventType: 'dividend',
    date: '2026-11-06',
    timeOfDay: 'During Market',
    dividendAmount: 1.15,
  },
  {
    id: 'ev_8',
    symbol: 'SPY',
    company: 'SPDR S&P 500 ETF',
    eventType: 'macro',
    date: '2026-11-04',
    timeOfDay: 'During Market',
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const watchlistOnly = req.nextUrl.searchParams.get('watchlistOnly') === 'true';

    let userWatchlistSymbols = new Set<string>();
    if (session?.userId) {
      const items = await getUserWatchlist(session.userId);
      userWatchlistSymbols = new Set(items.map((i) => i.symbol.toUpperCase()));
    }

    const events: CalendarEvent[] = MARKET_EVENTS.map((ev) => ({
      ...ev,
      isInWatchlist: userWatchlistSymbols.has(ev.symbol.toUpperCase()),
    }));

    const filtered = watchlistOnly ? events.filter((e) => e.isInWatchlist) : events;

    return NextResponse.json({
      success: true,
      totalCount: filtered.length,
      watchlistOnly,
      events: filtered,
    });
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: 'Failed to load calendar' }, { status: 500 });
  }
}

