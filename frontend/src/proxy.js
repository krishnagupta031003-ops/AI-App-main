import { NextResponse } from 'next/server';

const protectedRoutes = ['/account', '/subscription'];
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
const authModeByRoute = {
  '/login': 'login',
  '/signup': 'signup',
  '/forgot-password': 'forgot',
  '/reset-password': 'reset',
};

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isPublicAuth = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthed = request.cookies.get('isAuthenticated')?.value === 'true';

  if (isProtected && !isAuthed) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isPublicAuth && isAuthed) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicAuth && !isAuthed) {
    const url = new URL('/', request.url);
    url.searchParams.set('auth', authModeByRoute[pathname] || 'login');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
