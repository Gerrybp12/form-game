import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];

function isPublicPath(pathname: string) {
  // allow next internals + static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  // ✅ allow any file in /public by extension (png, css, js, fonts, etc)
  // this prevents "weird page" due to assets redirected to /login
  const isFile = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (isFile) return true;

  // allow public form filling
  if (pathname.startsWith("/public")) return true;

  // allow specific public pages
  if (PUBLIC_PATHS.includes(pathname)) return true;

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fb_token")?.value;

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};