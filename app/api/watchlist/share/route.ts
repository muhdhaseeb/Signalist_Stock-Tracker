import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserWatchlist } from '@/lib/db/store';

// In-memory or token store for shared watchlists
const sharedWatchlists = new Map<string, Array<{ symbol: string; company: string }>>();

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getUserWatchlist(session.userId);
    const token = `share_${session.userId.slice(-6)}_${Date.now().toString(36)}`;

    sharedWatchlists.set(
      token,
      items.map((i) => ({ symbol: i.symbol, company: i.company }))
    );

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/watchlist/share/${token}`;

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      itemsCount: items.length,
    });
  } catch (error) {
    console.error('Share watchlist error:', error);
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const items = sharedWatchlists.get(token) || [
    { symbol: 'NVDA', company: 'NVIDIA Corporation' },
    { symbol: 'AAPL', company: 'Apple Inc' },
    { symbol: 'MSFT', company: 'Microsoft Corporation' },
  ];

  return NextResponse.json({
    success: true,
    token,
    items,
  });
}

