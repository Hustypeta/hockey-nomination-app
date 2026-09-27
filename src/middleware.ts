import { NextRequest, NextResponse } from "next/server";

const WORK_PREVIEW_PREFIXES = ["/design", "/promo", "/cover", "/jersey-preview"] as const;

function isWorkPreviewPath(pathname: string): boolean {
  return WORK_PREVIEW_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isLocalhostRequest(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? "";
  const rawHost = forwarded || req.headers.get("host") || req.nextUrl.host || "";
  const host = rawHost.split(":")[0]?.toLowerCase() ?? "";
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

/** Předá layoutu původní cestu, ať se po Google přihlášení vrátí na fórum / soutěž, ne jen na hub.
 *  Pracovní náhledy (/design, /promo, /cover, /jersey-preview) jen na localhost. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isWorkPreviewPath(pathname) && !isLocalhostRequest(req)) {
    return new NextResponse(null, { status: 404, statusText: "Not Found" });
  }

  if (pathname === "/forum" || pathname.startsWith("/forum/") || pathname === "/souteze" || pathname.startsWith("/souteze/")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-callback-path", `${pathname}${req.nextUrl.search}`);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/forum",
    "/forum/:path*",
    "/souteze",
    "/souteze/:path*",
    "/design",
    "/design/:path*",
    "/promo",
    "/promo/:path*",
    "/cover",
    "/cover/:path*",
    "/jersey-preview",
    "/jersey-preview/:path*",
  ],
};
