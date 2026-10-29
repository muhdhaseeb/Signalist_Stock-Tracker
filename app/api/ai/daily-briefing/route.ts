import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserWatchlist } from '@/lib/db/store';
import { getMarketNews, getQuote } from '@/lib/finnhub';
import { generateDailyBriefing } from '@/lib/ai';

export async function GET() {
  try {
    const session = await getSession();
    const userName = session?.name || 'Investor';
    const riskTolerance = session?.riskTolerance || 'Medium';
    const investmentGoals = session?.investmentGoals || 'Growth';
    const preferredIndustry = session?.preferredIndustry || 'Technology';

    const rawWatchlist = session?.userId ? await getUserWatchlist(session.userId) : [];
    const news = await getMarketNews('general');

    const watchlistWithQuotes = await Promise.all(
      rawWatchlist.slice(0, 5).map(async (item) => {
        const quote = await getQuote(item.symbol);
        return {
          symbol: item.symbol,
          company: item.company,
          currentPrice: quote.c,
          changePercent: quote.dp,
        };
      })
    );

    const briefing = await generateDailyBriefing({
      userName,
      riskTolerance,
      investmentGoals,
      preferredIndustry,
      watchlist: watchlistWithQuotes,
      marketNews: news,
    });

    return NextResponse.json({
      success: true,
      briefing,
      userPreferences: {
        userName,
        riskTolerance,
        investmentGoals,
        preferredIndustry,
      },
    });
  } catch (error) {
    console.error('Daily briefing error:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}

