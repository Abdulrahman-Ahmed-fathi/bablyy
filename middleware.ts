import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (req.nextUrl.pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    const ip = getClientIp(req);
    if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/auth/callback/credentials"],
};