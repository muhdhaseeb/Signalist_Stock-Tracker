import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema, hashPassword, setSessionCookie } from '@/lib/auth/session';
import { findUserByEmail, createUser } from '@/lib/db/store';
import { rateLimit } from '@/lib/rate-limit';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`signup_${ip}`, 6, 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid form data' },
        { status: 400 }
      );
    }

    const { fullName, email, password, country, investmentGoals, riskTolerance, preferredIndustry } =
      parsed.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      name: fullName,
      email,
      password: hashedPassword,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
    });

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

    // Dispatch welcome email asynchronously without blocking response
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
      intro: `Welcome to Signalist! Your account is set up with an investment focus on ${user.preferredIndustry} and a ${user.riskTolerance} risk profile.`,
    }).catch((err) => console.error('Error dispatching welcome email:', err));

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
