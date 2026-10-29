import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguageAlert } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Alert prompt is required' }, { status: 400 });
    }

    const parsed = await parseNaturalLanguageAlert(query);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not extract a valid stock symbol or threshold from your request.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, alert: parsed });
  } catch (error) {
    console.error('Parse alert error:', error);
    return NextResponse.json({ error: 'Failed to parse natural language alert' }, { status: 500 });
  }
}

