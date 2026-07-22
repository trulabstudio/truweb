import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

function splitPaths(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);
}

function pathMatches(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const retryAfter = process.env.MAINTENANCE_RETRY_AFTER || "3600";
  const forbiddenPaths = splitPaths(process.env.FORBIDDEN_PATHS);
  const { pathname } = request.nextUrl;

  const isAllowedPath =
    pathname === "/maintenance" ||
    pathname === "/403" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname);

  if (maintenanceMode && !isAllowedPath) {
    return NextResponse.rewrite(new URL("/maintenance", request.url), {
      status: 503,
      headers: {
        "Retry-After": retryAfter,
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  if (pathMatches(pathname, forbiddenPaths)) {
    return NextResponse.rewrite(new URL("/403", request.url), {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
