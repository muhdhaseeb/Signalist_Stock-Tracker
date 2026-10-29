import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'signalist_super_secret_jwt_key_at_least_32_characters_long'
);

const SESSION_COOKIE_NAME = 'signalist_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static and public routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(png|jpe?g|gif|svg|ico|webp|json|woff2?|ttf|css|js)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, {
        algorithms: ['HS256'],
      });
      if (payload && payload.userId) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  // Redirect authenticated user away from auth pages to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect unauthenticated user to sign-in
  if (!isAuthPage && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', req.url);
    if (pathname !== '/') {
      signInUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|manifest.json|robots.txt).*)'],
};
