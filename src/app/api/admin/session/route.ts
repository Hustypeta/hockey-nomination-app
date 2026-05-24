import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";

/** Lehká kontrola admin cookie — bez dotazu na DB zápasů. */
export async function GET() {
  try {
    await requireAdminOrThrow();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    return NextResponse.json(
      { error: status === 401 ? "Neautorizováno." : "Chyba." },
      { status }
    );
  }
}
