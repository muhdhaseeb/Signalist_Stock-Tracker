import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '@/lib/db/store';
import { getQuote, getCompanyProfile, getBasicFinancials, formatMarketCap } from '@/lib/finnhub';
import { z } from 'zod';

const addWatchlistSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  company: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getUserWatchlist(session.userId);

    // Hydrate each stock with live quote and profile
    const hydrated = await Promise.all(
      items.map(async (item) => {
        const symbol = item.symbol.toUpperCase();
        const [quote, profile, financials] = await Promise.all([
          getQuote(symbol),
          getCompanyProfile(symbol),
          getBasicFinancials(symbol),
        ]);

        const price = quote.c || 0;
        const changePercent = quote.dp || 0;
        const peRatio = financials?.metric?.peNormalizedAnnual
          ? financials.metric.peNormalizedAnnual.toFixed(2)
          : 'N/A';

        return {
          userId: session.userId,
          symbol,
          company: item.company || profile.name || symbol,
          addedAt: item.addedAt,
          currentPrice: price,
          changePercent,
          priceFormatted: `$${price.toFixed(2)}`,
          changeFormatted: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          marketCap: formatMarketCap(profile.marketCapitalization),
          peRatio,
        } as StockWithData;
      })
    );

    return NextResponse.json({ watchlist: hydrated });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addWatchlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid stock data' }, { status: 400 });
    }

    const { symbol, company } = parsed.data;
    let companyName = company;
    if (!companyName) {
      const profile = await getCompanyProfile(symbol);
      companyName = profile.name || symbol;
    }

    const item = await addToWatchlist(session.userId, symbol, companyName);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    await removeFromWatchlist(session.userId, symbol);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
