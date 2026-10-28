import { NextRequest, NextResponse } from 'next/server';
import { signInSchema, comparePassword, setSessionCookie } from '@/lib/auth/session';
import { findUserByEmail } from '@/lib/db/store';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`signin_${ip}`, 8, 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = String((user as { _id?: unknown; id?: unknown })._id || (user as { id?: unknown }).id);

    await setSessionCookie({
      userId,
      email: user.email,
      name: user.name,
      country: user.country,
      investmentGoals: user.investmentGoals,
      riskTolerance: user.riskTolerance,
      preferredIndustry: user.preferredIndustry,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        country: user.country,
        investmentGoals: user.investmentGoals,
        riskTolerance: user.riskTolerance,
        preferredIndustry: user.preferredIndustry,
      },
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
