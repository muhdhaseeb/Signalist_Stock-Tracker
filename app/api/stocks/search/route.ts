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

    const rawResults = searchRes.result || [];
    // Prioritize clean primary symbols (e.g. without foreign exchange dots)
    const cleanSymbols = rawResults.filter((item) => item.symbol && !item.symbol.includes('.'));
    const candidates = cleanSymbols.length > 0 ? cleanSymbols : rawResults;

    const seenSymbols = new Set<string>();
    const items = [];

    for (const item of candidates) {
      if (!item.symbol) continue;
      if (item.type === 'OPTION' || item.type === 'FUTURE') continue;
      const upperSym = item.symbol.toUpperCase();
      if (upperSym.length > 8) continue;
      if (seenSymbols.has(upperSym)) continue;
      seenSymbols.add(upperSym);

      items.push({
        symbol: upperSym,
        name: item.description || upperSym,
        exchange: item.displaySymbol || item.type || 'US',
        type: item.type || 'Stock',
        isInWatchlist: watchlistSymbols.has(upperSym),
      });

      if (items.length >= 15) break;
    }

    // If no search matches were found at all, but the query looks like a ticker symbol (e.g. 1-6 characters like XYZ),
    // provide it as a direct selectable stock ticker so the user can open its TradingView chart.
    const upperQuery = q.trim().toUpperCase();
    if (items.length === 0 && /^[A-Z0-9]{1,6}$/.test(upperQuery)) {
      items.push({
        symbol: upperQuery,
        name: `${upperQuery} Stock`,
        exchange: 'US',
        type: 'Stock',
        isInWatchlist: watchlistSymbols.has(upperQuery),
      });
    }

    return NextResponse.json({
      count: items.length,
      result: items,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
