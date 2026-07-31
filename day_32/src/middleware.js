import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");

  const pathname = request.nextUrl.pathname;

  // Public Routes
  if (
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Protected Routes
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};