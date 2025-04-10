import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIsAuthenticated, removeAuthCookie } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip the login page itself
    if (request.nextUrl.pathname === "/admin") {
      return NextResponse.next();
    }

    // Verify the admin session token
    const isAuthenticated = await getIsAuthenticated();

    // If there's no valid token, redirect to the admin login page
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      removeAuthCookie();
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};
