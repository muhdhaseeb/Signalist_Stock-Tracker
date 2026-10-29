import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getCompanyProfile } from '@/lib/finnhub';
import { explainStockMove } from '@/lib/ai';

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const [quote, profile] = await Promise.all([
      getQuote(symbol),
      getCompanyProfile(symbol),
    ]);

    // Fetch related news or simulated company-specific news
    const now = Math.floor(Date.now() / 1000);
    const mockCompanyNews = [
      {
        headline: `${profile.name || symbol} Reports Quarterly Operational Metrics and Updated Forward Guidance`,
        summary: `Management highlighted expanding gross margins, ongoing enterprise adoption, and disciplined operational expenditure.`,
        source: 'Bloomberg Markets',
        url: 'https://bloomberg.com',
        datetime: now - 7200,
      },
      {
        headline: `Wall Street Analysts Adjust Price Targets for ${symbol} Post Industry Survey`,
        summary: `Several major research desks revised rating metrics citing structural tailwinds and market share expansion.`,
        source: 'Reuters Financial',
        url: 'https://reuters.com',
        datetime: now - 18000,
      },
    ];

    const explanation = await explainStockMove({
      symbol,
      company: profile.name || symbol,
      currentPrice: quote.c || 0,
      changePercent: quote.dp || 0,
      industry: profile.finnhubIndustry,
      news: mockCompanyNews,
    });

    return NextResponse.json({
      success: true,
      explanation,
      stock: {
        symbol,
        company: profile.name || symbol,
        currentPrice: quote.c || 0,
        changePercent: quote.dp || 0,
      },
    });
  } catch (error) {
    console.error('Explain move error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

