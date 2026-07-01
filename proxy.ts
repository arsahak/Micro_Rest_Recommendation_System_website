import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("mrrs_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect everything EXCEPT:
//   /login        — login page (public)
//   /_next/*      — Next.js internals
//   /api/*        — Next.js API routes
//   /favicon.ico  — static asset
export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon\\.ico|api).*)",
  ],
};
