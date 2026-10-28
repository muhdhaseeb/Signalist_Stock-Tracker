import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getUserAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from '@/lib/db/store';
import { getQuote, getCompanyProfile } from '@/lib/finnhub';
import { z } from 'zod';

const createAlertSchema = z.object({
  symbol: z.string().min(1).toUpperCase().trim(),
  company: z.string().optional(),
  alertName: z.string().min(1, 'Alert name is required').trim(),
  alertType: z.enum(['upper', 'lower']),
  threshold: z.coerce.number().positive('Threshold must be greater than 0'),
});

const updateAlertSchema = z.object({
  alertId: z.string().min(1),
  alertName: z.string().min(1).optional(),
  alertType: z.enum(['upper', 'lower']).optional(),
  threshold: z.coerce.number().positive().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await getUserAlerts(session.userId);

    // Hydrate current price for each alert
    const hydrated = await Promise.all(
      alerts.map(async (alert) => {
        const quote = await getQuote(alert.symbol);
        const alertId = String((alert as { _id?: unknown; id?: unknown })._id || (alert as { id?: unknown }).id);
        return {
          id: alertId,
          symbol: alert.symbol,
          company: alert.company,
          alertName: alert.alertName,
          currentPrice: quote.c || 0,
          alertType: alert.alertType,
          threshold: alert.threshold,
          changePercent: quote.dp,
        } as Alert;
      })
    );

    return NextResponse.json({ alerts: hydrated });
  } catch (error) {
    console.error('Alerts GET error:', error);
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
    const parsed = createAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid alert data' },
        { status: 400 }
      );
    }

    const { symbol, company, alertName, alertType, threshold } = parsed.data;
    let companyName = company;
    if (!companyName) {
      const profile = await getCompanyProfile(symbol);
      companyName = profile.name || symbol;
    }

    const created = await createAlert({
      userId: session.userId,
      symbol,
      company: companyName,
      alertName,
      alertType,
      threshold,
    });

    return NextResponse.json({ success: true, alert: created }, { status: 201 });
  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid alert data' },
        { status: 400 }
      );
    }

    const { alertId, ...updateData } = parsed.data;
    const updated = await updateAlert(session.userId, alertId, updateData);

    return NextResponse.json({ success: true, alert: updated });
  } catch (error) {
    console.error('Alerts PUT error:', error);
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
    const alertId = searchParams.get('id');
    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    await deleteAlert(session.userId, alertId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Alerts DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
