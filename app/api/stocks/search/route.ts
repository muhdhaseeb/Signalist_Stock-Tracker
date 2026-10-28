import { NextRequest, NextResponse } from 'next/server';
import { searchSymbols } from '@/lib/finnhub';
import { getSession } from '@/lib/auth/session';
import { getUserWatchlist } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    if (!q.trim()) {
      return NextResponse.json({ count: 0, result: [] });
    }

    const searchRes = await searchSymbols(q);
    const session = await getSession();

    let watchlistSymbols = new Set<string>();
    if (session?.userId) {
      const watchlist = await getUserWatchlist(session.userId);
      watchlistSymbols = new Set(watchlist.map((item) => item.symbol.toUpperCase()));
    }

    const items = (searchRes.result || [])
      .filter((item) => item.symbol && !item.symbol.includes('.'))
      .slice(0, 15)
      .map((item) => ({
        symbol: item.symbol.toUpperCase(),
        name: item.description || item.symbol,
        exchange: item.displaySymbol || item.type || 'US',
        type: item.type || 'Stock',
        isInWatchlist: watchlistSymbols.has(item.symbol.toUpperCase()),
      }));

    return NextResponse.json({
      count: items.length,
      result: items,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
