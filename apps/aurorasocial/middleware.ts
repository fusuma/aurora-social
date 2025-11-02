import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Inject tenant context into headers for downstream use
  const requestHeaders = new Headers(request.headers);

  if (session.user.tenantId) {
    requestHeaders.set("x-tenant-id", session.user.tenantId);
  }

  if (session.user.role) {
    requestHeaders.set("x-user-role", session.user.role);
  }

  if (session.user.id) {
    requestHeaders.set("x-user-id", session.user.id);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Protect all routes except public ones
    "/((?!login|api/auth|auth/verify-request|auth/error|_next/static|_next/image|favicon.ico).*)",
  ],
};
