import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { normalizeNominationTitle } from "@/lib/nominationTitle";
import type { LineupStructure } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const exists = await prisma.shareLink.findUnique({
      where: { code },
      select: { code: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Odkaz nenalezen." }, { status: 404 });
    }

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

    await prisma.shareLink.update({
      where: { code },
      data: {
        captainId,
        lineupStructure: lineupStructure as object,
        title,
      },
    });

    return NextResponse.json({ ok: true, code });
  } catch (e) {
    console.error("PATCH /api/share-links/[code]", e);
    return NextResponse.json({ error: "Nepodařilo se aktualizovat odkaz." }, { status: 500 });
  }
}
