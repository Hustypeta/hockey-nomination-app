import { NextRequest, NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import {
  isBracketPickemComplete,
  parseBracketPickemPayload,
} from "@/lib/bracketPayload";
import { OFFICIAL_PICKEM_ID } from "@/lib/pickemLeaderboard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminOrThrow();
    const row = await prisma.officialPickem.findUnique({ where: { id: OFFICIAL_PICKEM_ID } });
    const payload = row?.payload ? parseBracketPickemPayload(row.payload) : null;
    return NextResponse.json({
      payload,
      updatedAt: row?.updatedAt?.toISOString() ?? null,
      complete: payload ? isBracketPickemComplete(payload) : false,
    });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin pickem official-results GET:", e);
    return NextResponse.json({ error: "Chyba načtení oficiálních výsledků." }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrThrow();
    const body = await request.json().catch(() => null);
    const rawPayload = body && typeof body === "object" ? (body as Record<string, unknown>).payload : body;
    const payload = parseBracketPickemPayload(rawPayload);
    if (!payload) {
      return NextResponse.json({ error: "Neplatný payload Pick'em (očekáván v3)." }, { status: 400 });
    }
    if (!isBracketPickemComplete(payload)) {
      return NextResponse.json(
        { error: "Payload není kompletní — vyplň skupiny, play-off i bonusové tipy." },
        { status: 400 },
      );
    }

    await prisma.officialPickem.upsert({
      where: { id: OFFICIAL_PICKEM_ID },
      create: { id: OFFICIAL_PICKEM_ID, payload: payload as object },
      update: { payload: payload as object },
    });

    return NextResponse.json({ ok: true, message: "Oficiální výsledky Pick'em uloženy." });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin pickem official-results POST:", e);
    return NextResponse.json({ error: "Uložení se nepovedlo." }, { status });
  }
}

export async function DELETE() {
  try {
    await requireAdminOrThrow();
    await prisma.officialPickem.deleteMany({ where: { id: OFFICIAL_PICKEM_ID } });
    return NextResponse.json({
      ok: true,
      message: "Oficiální výsledky Pick'em odstraněny — vyhodnocení není k dispozici.",
    });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin pickem official-results DELETE:", e);
    return NextResponse.json({ error: "Odstranění se nepovedlo." }, { status });
  }
}
