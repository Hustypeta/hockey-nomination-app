import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allocateNominationSlug } from "@/lib/allocateNominationSlug";
import { validateNominationPayload } from "@/lib/nominationPayloadServer";

/** Seznam nominací přihlášeného uživatele (nejnovější první). */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejseš přihlášený." }, { status: 401 });
    }

    const [rows, me] = await Promise.all([
      prisma.nomination.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          timeBonusPercent: true,
          captainId: true,
          title: true,
          slug: true,
          lineupStructure: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { contestEntryNominationId: true },
      }),
    ]);

    const entryId = me?.contestEntryNominationId ?? null;

    return NextResponse.json({
      contestEntryNominationId: entryId,
      nominations: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        timeBonusPercent: r.timeBonusPercent,
        captainId: r.captainId,
        title: r.title,
        slug: r.slug,
        lineupStructure: r.lineupStructure,
        isContestEntry: entryId !== null && r.id === entryId,
      })),
    });
  } catch (error) {
    console.error("GET /api/nominations failed:", error);
    return NextResponse.json({ error: "Nepodařilo se načíst nominace." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro uložení nominace se musíš přihlásit přes Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = validateNominationPayload(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { selectedPlayerIds, captainId, lineupStructure, title } = parsed.payload;

    const slug = await allocateNominationSlug(prisma, title ?? null, null);

    /** Koncept u účtu — bez uzávěrky; časový bonus se uplatní až při odeslání do soutěže. */
    const nomination = await prisma.nomination.create({
      data: {
        userId: session.user.id,
        selectedPlayerIds,
        captainId: captainId || null,
        lineupStructure: lineupStructure ?? undefined,
        timeBonusPercent: 0,
        title,
        slug,
      },
    });

    return NextResponse.json({
      id: nomination.id,
      slug: nomination.slug,
      message: "Nominace uložena",
      createdAt: nomination.createdAt.toISOString(),
      timeBonusPercent: 0,
    });
  } catch (error) {
    console.error("Failed to create nomination:", error);
    return NextResponse.json(
      { error: "Failed to create nomination" },
      { status: 500 }
    );
  }
}
