import { NextRequest, NextResponse } from "next/server";

/** Předá layoutu původní cestu, ať se po Google přihlášení vrátí na fórum / soutěž, ne jen na hub. */
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-callback-path", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/forum", "/forum/:path*", "/souteze", "/souteze/:path*"],
};
