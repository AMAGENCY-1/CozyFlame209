import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

// First line of defense for the client portal. Every portal page, action and API route
// also checks the session itself, so nothing relies on this alone.
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === '/portal/login') {
    if (session) return NextResponse.redirect(new URL('/portal', request.url));
    return NextResponse.next();
  }

  // The password setup page only creates a key in the browser; it changes nothing on the server.
  if (pathname === '/portal/setup') return NextResponse.next();

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const login = new URL('/portal/login', request.url);
    login.searchParams.set('next', pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/api/portal/:path*'],
};
