import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for route protection (previously Middleware)
 * - Protects /admin/* routes - requires token cookie
 * - Protects /employee/* routes - requires token cookie
 * - Public routes: /login, /register, /api/auth/*, /
 *
 * Note: Full JWT verification happens in API routes.
 * This proxy only checks for token presence.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, allow the request to proceed
  // Role-based verification happens in API routes
  return NextResponse.next();
}

// Configure matcher to only run on dashboard routes
export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
};
