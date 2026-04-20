import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateShareLinkSlug } from "@/lib/allocateNominationSlug";
import { validateGuestShareBody } from "@/lib/validateGuestShareBody";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const existing = await prisma.shareLink.findUnique({
      where: { code },
      select: { code: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Odkaz nenalezen." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = validateGuestShareBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { title, captainId, lineupStructure } = parsed;

    const slug = await allocateShareLinkSlug(prisma, title, code);

    await prisma.shareLink.update({
      where: { code },
      data: {
        slug,
        captainId,
        lineupStructure: lineupStructure as object,
        title,
      },
    });

    return NextResponse.json({ ok: true, code, slug });
  } catch (e) {
    console.error("PATCH /api/share-links/[code]", e);
    return NextResponse.json({ error: "Nepodařilo se aktualizovat odkaz." }, { status: 500 });
  }
}
