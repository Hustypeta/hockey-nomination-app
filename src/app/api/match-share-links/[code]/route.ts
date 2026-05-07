import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateShareLinkSlug } from "@/lib/allocateNominationSlug";
import { validateMatchShareBody } from "@/lib/validateMatchShareBody";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }
    const { code } = await params;
    const existing = await prisma.matchShareLink.findUnique({
      where: { code },
      select: { code: true, slug: true, userId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Odkaz nenalezen." }, { status: 404 });
    }
    // Legacy rows (before account saving): allow first authenticated user to "claim" by setting userId.
    if (existing.userId && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Nemáte přístup k tomuto odkazu." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = validateMatchShareBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { title, captainId, lineupStructure, defenseCount, allowExtraForward } = parsed;

    const slug = await allocateShareLinkSlug(prisma, title, code);

    await prisma.matchShareLink.update({
      where: { code },
      data: {
        slug,
        userId: existing.userId ?? session.user.id,
        captainId,
        lineupStructure: lineupStructure as object,
        title,
        defenseCount,
        allowExtraForward,
      },
    });

    return NextResponse.json({ ok: true, code, slug });
  } catch (e) {
    console.error("PATCH /api/match-share-links/[code]", e);
    return NextResponse.json({ error: "Nepodařilo se aktualizovat odkaz." }, { status: 500 });
  }
}

