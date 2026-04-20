import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { normalizeNominationTitle } from "@/lib/nominationTitle";
import type { LineupStructure } from "@/types";

function genShareCode(len = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length]!;
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      captainId?: unknown;
      lineupStructure?: unknown;
      title?: unknown;
    };

    const raw = body.lineupStructure;
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Chybí lineupStructure." }, { status: 400 });
    }

    const lineupStructure = normalizeLineupStructure(raw as LineupStructure);
    const captainId = typeof body.captainId === "string" ? body.captainId : null;
    const title = normalizeNominationTitle(body.title);

    let code = genShareCode(10);
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await prisma.shareLink.findUnique({ where: { code }, select: { code: true } });
      if (!clash) break;
      code = genShareCode(10);
    }

    await prisma.shareLink.create({
      data: {
        code,
        captainId,
        lineupStructure: lineupStructure as object,
        title,
      },
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      code,
      path: `/l/${code}`,
      url: `${origin}/l/${code}`,
    });
  } catch (e) {
    console.error("POST /api/share-links", e);
    return NextResponse.json({ error: "Nepodařilo se vytvořit odkaz." }, { status: 500 });
  }
}
