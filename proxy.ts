import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('rbeas_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect dashboard, admin, employee and api/admin routes
  if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/employee') || path.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = decodeJwt(token);
    if (!decoded || !decoded.role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check for admin routes
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/employee', request.url));
      }
    }

    // Role check for employee routes
    if (path.startsWith('/employee')) {
      if (decoded.role !== 'employee') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    return NextResponse.next();
  }

  // Redirect signed-in users away from auth pages
  if (path === '/login' || path === '/register') {
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && (!decoded.exp || Date.now() < decoded.exp * 1000)) {
        const dest = decoded.role === 'admin' ? '/admin' : '/employee';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/employee/:path*', '/api/admin/:path*', '/login', '/register'],
};

export default proxy;
