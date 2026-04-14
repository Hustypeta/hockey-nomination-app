import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  CONTEST_ADMIN_COOKIE,
  isAdminAuthConfigured,
  signAdminSession,
} from "@/lib/adminSession";

function passwordMatches(input: string, expected: string): boolean {
  const ha = createHash("sha256").update(input, "utf8").digest();
  const hb = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        { error: "Admin přístup není nakonfigurován (CONTEST_ADMIN_SECRET, CONTEST_ADMIN_PASSWORD)." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const expected = process.env.CONTEST_ADMIN_PASSWORD ?? "";
    if (!passwordMatches(password, expected)) {
      return NextResponse.json({ error: "Neplatné heslo." }, { status: 401 });
    }

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const token = signAdminSession(exp);
    if (!token) {
      return NextResponse.json({ error: "Chyba podpisu session." }, { status: 503 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CONTEST_ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
    return res;
  } catch (e) {
    console.error("admin login:", e);
    return NextResponse.json({ error: "Chyba přihlášení." }, { status: 500 });
  }
}
