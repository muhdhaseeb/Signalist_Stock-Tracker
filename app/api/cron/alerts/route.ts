import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveAlerts, updateAlert, findUserById } from '@/lib/db/store';
import { getQuote } from '@/lib/finnhub';
import { sendAlertEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'signalist_cron_secret_token';

    // Verify cron authorization
    if (authHeader !== `Bearer ${expectedSecret}` && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const activeAlerts = await getAllActiveAlerts();
    const evaluated: Array<{
      symbol: string;
      triggered: boolean;
      currentPrice: number;
      threshold: number;
      type: string;
    }> = [];

    for (const alert of activeAlerts) {
      const quote = await getQuote(alert.symbol);
      const currentPrice = quote.c || 0;
      if (currentPrice <= 0) continue;

      let isTriggered = false;
      if (alert.alertType === 'upper' && currentPrice >= alert.threshold) {
        isTriggered = true;
      } else if (alert.alertType === 'lower' && currentPrice <= alert.threshold) {
        isTriggered = true;
      }

      evaluated.push({
        symbol: alert.symbol,
        triggered: isTriggered,
        currentPrice,
        threshold: alert.threshold,
        type: alert.alertType,
      });

      if (isTriggered) {
        const alertId = String((alert as { _id?: unknown; id?: unknown })._id || (alert as { id?: unknown }).id);
        await updateAlert(alert.userId, alertId, {
          triggered: true,
          active: false,
          lastTriggeredAt: new Date(),
        });

        const user = await findUserById(alert.userId);
        if (user && user.email) {
          await sendAlertEmail({
            email: user.email,
            name: user.name || 'Investor',
            symbol: alert.symbol,
            company: alert.company,
            currentPrice,
            threshold: alert.threshold,
            alertType: alert.alertType,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeAlerts.length,
      evaluated,
    });
  } catch (error) {
    console.error('Cron alert evaluation error:', error);
    return NextResponse.json({ error: 'Cron job execution failed' }, { status: 500 });
  }
}
