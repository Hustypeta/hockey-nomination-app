import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function genShareCode(len = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length]!;
  return out;
}

/**
 * Vytvoří krátký odkaz na Pick’em tipy.
 * Ukládáme do tabulky `share_links` (payload do `lineupStructure`) a servírujeme přes /p/{code}.
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Chybí payload Pick’em." }, { status: 400 });
    }

    let code = genShareCode(10);
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await prisma.shareLink.findUnique({ where: { code }, select: { code: true } });
      if (!clash) break;
      code = genShareCode(10);
    }

    await prisma.shareLink.create({
      data: {
        code,
        slug: null,
        captainId: null,
        lineupStructure: body as object,
        title: "Pick’em",
      },
    });

    const origin = new URL(request.url).origin;
    const path = `/p/${encodeURIComponent(code)}`;
    return NextResponse.json({ ok: true, code, path, url: `${origin}${path}` });
  } catch (e) {
    console.error("POST /api/pickem/share-links", e);
    return NextResponse.json({ error: "Nepodařilo se vytvořit odkaz." }, { status: 500 });
  }
}

