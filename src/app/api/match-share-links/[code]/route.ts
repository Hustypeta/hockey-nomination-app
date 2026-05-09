import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateMatchShareLinkSlug } from "@/lib/allocateNominationSlug";
import { validateMatchShareBody } from "@/lib/validateMatchShareBody";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Načtení uložené sestavy do editoru (jen přihlášený vlastník, nebo neobsazený řádek userId = kdokoliv přihlášený s kódem).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }
    const { code } = await params;
    const row = await prisma.matchShareLink.findUnique({
      where: { code },
      select: {
        code: true,
        slug: true,
        userId: true,
        title: true,
        captainId: true,
        lineupStructure: true,
        defenseCount: true,
        allowExtraForward: true,
      },
    });
    if (!row) {
      return NextResponse.json({ error: "Odkaz nenalezen." }, { status: 404 });
    }
    if (row.userId && row.userId !== session.user.id) {
      return NextResponse.json({ error: "Nemáte přístup k této sestavě." }, { status: 403 });
    }
    return NextResponse.json({
      code: row.code,
      slug: row.slug,
      title: row.title,
      captainId: row.captainId,
      lineupStructure: row.lineupStructure,
      defenseCount: row.defenseCount,
      allowExtraForward: row.allowExtraForward,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GET /api/match-share-links/[code]", e);
    return NextResponse.json({ error: `Nepodařilo se načíst sestavu. ${msg}` }, { status: 500 });
  }
}

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
    if (existing.userId && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Nemáte přístup k tomuto odkazu." }, { status: 403 });
    }
    /** FK ochrana — pokud session.user.id neexistuje v User table, ukládáme anonymně. */
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    const ownerUserId = existing.userId ?? (userExists ? session.user.id : null);

    const body = await request.json();
    const parsed = validateMatchShareBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { title, captainId, lineupStructure, defenseCount, allowExtraForward } = parsed;

    const slug = await allocateMatchShareLinkSlug(prisma, title, code);

    await prisma.matchShareLink.update({
      where: { code },
      data: {
        slug,
        userId: ownerUserId,
        captainId,
        lineupStructure: lineupStructure as object,
        title,
        defenseCount,
        allowExtraForward,
      },
    });

    return NextResponse.json({ ok: true, code, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("PATCH /api/match-share-links/[code]", e);
    return NextResponse.json(
      { error: `Nepodařilo se aktualizovat odkaz. ${msg}` },
      { status: 500 }
    );
  }
}

