import NextAuth from "next-auth";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Auth.js can replace the request origin with AUTH_URL before calling a
 * middleware callback. Capture the real origin first; never send a visitor
 * to that configured URL. All protected pages/actions still check live roles.
 */
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const loginUrl = new URL("/admin/login", request.url);
  // Some hosted proxy runtimes expose an internal loopback URL. In production
  // Vercel provides its trusted deployment domain; never use a client-supplied
  // callback or arbitrary forwarding header to construct an external redirect.
  if (process.env.VERCEL === "1" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(loginUrl.hostname)) {
    const hostname = process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      : process.env.VERCEL_URL;
    if (hostname && /^[a-z0-9.-]+$/i.test(hostname)) {
      loginUrl.protocol = "https:";
      loginUrl.hostname = hostname;
      loginUrl.port = "";
    }
  }
  const guarded = auth(req => {
    if (req.nextUrl.pathname === "/admin/login" || req.auth?.user) {
      return NextResponse.next();
    }
    return NextResponse.redirect(loginUrl);
  });
  // Auth.js overload inference selects AppRouteHandlerFn for a one-argument
  // callback; this invocation is its middleware adapter, with a NextFetchEvent.
  const run = guarded as unknown as (request: NextRequest, event: NextFetchEvent) => ReturnType<typeof guarded>;
  return run(request, event);
}

export const config = {
  matcher: ["/admin/:path*"],
};
