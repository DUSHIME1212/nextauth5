import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Array of protected pages
const protectedPages = ["/profile", "/dashboard", "/admin","/"];

// Middleware function
export async function middleware(request: NextRequest) {
  // Get the session using NextAuth's auth function
  const session = await auth();

  // Get the requested pathname
  const { pathname } = request.nextUrl;

  // Check if the requested page is in the protectedPages array
  const isProtected = protectedPages.some((page) =>
    pathname.startsWith(page)
  );

  // If the page is protected and there's no session, redirect to sign-in
  if (isProtected && !session) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname); // Redirect back after sign-in
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*", "/"],
};