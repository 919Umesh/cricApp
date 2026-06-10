import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

/**
 * Fast cookie gate for the admin area. Full session verification happens
 * server-side in the admin layout (lib/auth.ts); this just bounces obvious
 * anonymous visitors before they hit it.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
