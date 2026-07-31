import { NextResponse } from "next/server";

export function middleware(request) {
  const user = request.cookies.get("user");

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.value;

  if (request.nextUrl.pathname === "/admin" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.nextUrl.pathname === "/employees" && role === "employee") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/profile", "/employees", "/admin", "/settings"],
};
