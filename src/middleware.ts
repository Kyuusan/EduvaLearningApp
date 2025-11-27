import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip untuk public routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 1. User belum login - redirect ke halaman login
  if (!token) {
    const signInUrl = new URL("/auth/masuk", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = token.role as string;

  // 2. ADMIN & GURU hanya boleh buka /admin
  if (pathname.startsWith("/admin")) {
    if (role !== "admin" && role !== "guru") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // 3. SISWA hanya boleh buka /user
  if (pathname.startsWith("/user")) {
    if (role !== "siswa") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (pathname === "/") {
    if (role === "siswa") {
      return NextResponse.redirect(new URL("/user", req.url));
    } else if (role === "admin" || role === "guru") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
   "/admin/:path*", 
    "/user/:path*",
  ],
};