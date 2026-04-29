import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/error",
  "/swagger",
  "/api/auth",
  "/api/openapi",
  "/api/swagger",
];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some(
      (path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    ) ||
    /\.(png|jpg|jpeg|gif|svg|ico)$/.test(pathname);

  if (!session && !isPublic) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};