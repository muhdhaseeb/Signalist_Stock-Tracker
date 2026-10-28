import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'signalist_super_secret_jwt_key_at_least_32_characters_long'
);

const SESSION_COOKIE_NAME = 'signalist_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  country?: string;
  investmentGoals?: string;
  riskTolerance?: string;
  preferredIndustry?: string;
  [key: string]: unknown;
}

// Zod schemas
export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country: z.string().min(2, 'Please select a valid country').default('US'),
  investmentGoals: z.string().default('Growth'),
  riskTolerance: z.string().default('Medium'),
  preferredIndustry: z.string().default('Technology'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// Password helpers
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Token helpers
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Cookie helpers for Server Actions and Route Handlers
export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  const isLocalhost = !process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL.includes('localhost');
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
