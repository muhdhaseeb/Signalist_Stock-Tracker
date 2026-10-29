import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { addHolding } from '@/lib/db/store';
import { getCompanyProfile } from '@/lib/finnhub';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { csvData } = await req.json();
    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }

    const lines = csvData
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must contain at least a header and 1 row' }, { status: 400 });
    }

    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const symbolIdx = header.findIndex((h) => h.includes('symbol') || h.includes('ticker'));
    const sharesIdx = header.findIndex((h) => h.includes('share') || h.includes('quantity') || h.includes('qty'));
    const priceIdx = header.findIndex((h) => h.includes('price') || h.includes('cost'));

    if (symbolIdx === -1 || sharesIdx === -1 || priceIdx === -1) {
      return NextResponse.json(
        { error: 'CSV must have headers for Symbol, Shares, and Price (e.g. Symbol,Shares,Price)' },
        { status: 400 }
      );
    }

    const imported: unknown[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const symbol = cols[symbolIdx]?.toUpperCase();
      const shares = parseFloat(cols[sharesIdx]);
      const buyPrice = parseFloat(cols[priceIdx]);

      if (symbol && !isNaN(shares) && shares > 0 && !isNaN(buyPrice) && buyPrice > 0) {
        const profile = await getCompanyProfile(symbol);
        const item = await addHolding({
          userId: session.userId,
          symbol,
          company: profile.name || symbol,
          shares,
          buyPrice,
          dateAcquired: new Date(),
        });
        imported.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: imported.length,
    });
  } catch (error) {
    console.error('Portfolio CSV import error:', error);
    return NextResponse.json({ error: 'CSV import failed' }, { status: 500 });
  }
}

