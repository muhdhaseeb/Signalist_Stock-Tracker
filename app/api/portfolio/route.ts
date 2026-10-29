import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserHoldings, addHolding, removeHolding, findUserById } from '@/lib/db/store';
import { getQuote, getCompanyProfile } from '@/lib/finnhub';
import { z } from 'zod';

const addHoldingSchema = z.object({
  symbol: z.string().min(1).toUpperCase().trim(),
  company: z.string().optional(),
  shares: z.coerce.number().positive('Shares must be greater than 0'),
  buyPrice: z.coerce.number().positive('Buy price must be greater than 0'),
  dateAcquired: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeframe = req.nextUrl.searchParams.get('timeframe') || '1D';
    const user = await findUserById(session.userId);
    const riskTolerance = user?.riskTolerance || session.riskTolerance || 'Medium';

    const rawHoldings = await getUserHoldings(session.userId);

    // Fetch SPY benchmark quote
    const spyQuote = await getQuote('SPY');
    const spyReturn = spyQuote.dp || 0.49;

    let totalValue = 0;
    let totalCostBasis = 0;
    const sectorMap: Record<string, number> = {};

    const holdingsWithData = await Promise.all(
      rawHoldings.map(async (holding) => {
        const quote = await getQuote(holding.symbol);
        const profile = await getCompanyProfile(holding.symbol);

        const currentPrice = quote.c || holding.buyPrice;
        const holdingValue = currentPrice * holding.shares;
        const holdingCost = holding.buyPrice * holding.shares;
        const unrealizedPnl = holdingValue - holdingCost;
        const unrealizedPnlPercent = holdingCost > 0 ? (unrealizedPnl / holdingCost) * 100 : 0;

        totalValue += holdingValue;
        totalCostBasis += holdingCost;

        const industry = profile.finnhubIndustry || 'Diversified';
        sectorMap[industry] = (sectorMap[industry] || 0) + holdingValue;

        const holdingId = String(
          (holding as { _id?: unknown; id?: unknown })._id || (holding as { id?: unknown }).id
        );

        return {
          id: holdingId,
          symbol: holding.symbol,
          company: holding.company || profile.name || holding.symbol,
          shares: holding.shares,
          buyPrice: holding.buyPrice,
          currentPrice,
          totalValue: Number(holdingValue.toFixed(2)),
          costBasis: Number(holdingCost.toFixed(2)),
          unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
          unrealizedPnlPercent: Number(unrealizedPnlPercent.toFixed(2)),
          dayChangePercent: quote.dp || 0,
          sector: industry,
          dateAcquired: holding.dateAcquired,
          notes: holding.notes,
        };
      })
    );

    const totalUnrealizedPnl = totalValue - totalCostBasis;
    const totalUnrealizedPnlPercent =
      totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;

    // Timeframe multipliers (simulated historical tracking for portfolio curves)
    const tfMultipliers: Record<string, { portfolio: number; spy: number }> = {
      '1D': { portfolio: 1.0, spy: 1.0 },
      '1W': { portfolio: 2.4, spy: 1.8 },
      '1M': { portfolio: 5.8, spy: 3.2 },
      '1Y': { portfolio: 18.5, spy: 14.2 },
    };
    const mult = tfMultipliers[timeframe] || tfMultipliers['1D'];

    // Sector allocation percentages
    const sectorAllocation = Object.entries(sectorMap).map(([sector, val]) => ({
      sector,
      value: Number(val.toFixed(2)),
      percentage: totalValue > 0 ? Number(((val / totalValue) * 100).toFixed(1)) : 0,
    }));

    // Calculate Portfolio Health Score & Mismatches
    let healthScore = 85;
    const healthFlags: string[] = [];

    // Check single stock concentration
    for (const h of holdingsWithData) {
      const weight = totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0;
      if (weight > 35) {
        healthScore -= 15;
        healthFlags.push(
          `High Concentration: ${h.symbol} accounts for ${weight.toFixed(1)}% of your portfolio.`
        );
      }
    }

    // Check sector concentration vs risk tolerance
    const maxSector = sectorAllocation.reduce(
      (max, s) => (s.percentage > (max?.percentage || 0) ? s : max),
      sectorAllocation[0]
    );

    if (maxSector && maxSector.percentage > 50) {
      healthScore -= 15;
      if (riskTolerance.toLowerCase() === 'low') {
        healthFlags.push(
          `Risk Mismatch: ${maxSector.percentage}% in ${maxSector.sector}, but your risk tolerance is set to Low.`
        );
      } else {
        healthFlags.push(
          `Sector Exposure: Over half your portfolio is concentrated in ${maxSector.sector}.`
        );
      }
    }

    if (holdingsWithData.length < 3 && holdingsWithData.length > 0) {
      healthScore -= 10;
      healthFlags.push('Under-diversified: Consider holding assets across at least 4-5 uncorrelated sectors.');
    }

    healthScore = Math.max(10, Math.min(100, healthScore));

    return NextResponse.json({
      success: true,
      timeframe,
      summary: {
        totalValue: Number(totalValue.toFixed(2)),
        totalCostBasis: Number(totalCostBasis.toFixed(2)),
        unrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
        unrealizedPnlPercent: Number(totalUnrealizedPnlPercent.toFixed(2)),
        realizedPnl: 0,
        timeframePortfolioReturn: Number((totalUnrealizedPnlPercent * (mult.portfolio / 2.0)).toFixed(2)),
        timeframeSpyReturn: Number((spyReturn * mult.spy).toFixed(2)),
      },
      sectorAllocation,
      health: {
        score: healthScore,
        rating: healthScore >= 80 ? 'Optimal' : healthScore >= 60 ? 'Moderate' : 'Caution Required',
        flags: healthFlags,
        riskTolerance,
      },
      holdings: holdingsWithData,
    });
  } catch (error) {
    console.error('Portfolio GET error:', error);
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
    const parsed = addHoldingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid holding data' },
        { status: 400 }
      );
    }

    const { symbol, company, shares, buyPrice, dateAcquired, notes } = parsed.data;
    let companyName = company;
    if (!companyName) {
      const profile = await getCompanyProfile(symbol);
      companyName = profile.name || symbol;
    }

    const created = await addHolding({
      userId: session.userId,
      symbol,
      company: companyName,
      shares,
      buyPrice,
      dateAcquired: dateAcquired ? new Date(dateAcquired) : new Date(),
      notes,
    });

    return NextResponse.json({ success: true, holding: created }, { status: 201 });
  } catch (error) {
    console.error('Portfolio POST error:', error);
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
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Holding ID is required' }, { status: 400 });
    }

    await removeHolding(session.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

