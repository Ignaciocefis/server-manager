import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/error",
  "/swagger",
  "/api/auth",
  "/api/openapi",
  "/api/swagger",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};