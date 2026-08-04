import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const pathname = request.nextUrl.pathname;

  // Public Routes
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  // Authentication Check
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Employee Routes
  if (
    pathname.startsWith("/employee") &&
    role !== "Employee" &&
    role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Manager Routes
  if (
    pathname.startsWith("/manager") &&
    role !== "Manager" &&
    role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin Routes
  if (pathname.startsWith("/admin") && role !== "Admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employee/:path*",
    "/manager/:path*",
    "/admin/:path*",
  ],
};
