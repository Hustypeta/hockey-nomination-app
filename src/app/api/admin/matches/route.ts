import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { uniqueSlug } from "@/lib/slug";

function readString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function readCategory(v: unknown): "beijir" | "ms2026" {
  return v === "ms2026" ? "ms2026" : "beijir";
}

export async function GET() {
  try {
    await requireAdminOrThrow();
    /**
     * `select` se vyhýbá sloupcům, které prod DB nemusí mít po novém schématu (např. `ratingsOpen`).
     * Tu hodnotu pak doplňujeme raw query níže s tolerancí chybějícího sloupce.
     */
    const matches = await prisma.match.findMany({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        homeCode: true,
        awayCode: true,
        opponent: true,
        startsAt: true,
        venue: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        officialLineup: { select: { updatedAt: true } },
      },
    });

    let ratingsMap = new Map<string, boolean>();
    try {
      const rows = await prisma.$queryRaw<Array<{ id: string; ratingsOpen: boolean | null }>>`
        SELECT id, "ratingsOpen" FROM "Match"
      `;
      ratingsMap = new Map(rows.map((r) => [r.id, Boolean(r.ratingsOpen)]));
    } catch {
      // Stará produkční DB bez `ratingsOpen` — defaultně false, ať se admin nerozbije.
    }

    const enriched = matches.map((m) => ({
      ...m,
      ratingsOpen: ratingsMap.get(m.id) ?? false,
    }));
    return NextResponse.json({ matches: enriched });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    if (status >= 500) {
      console.error("GET /api/admin/matches:", e);
    }
    const message =
      status === 401
        ? "Neautorizováno."
        : e instanceof Error
          ? `Chyba: ${e.message}`
          : "Chyba.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrThrow();
    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;

    const title = (readString(b.title) ?? "").trim();
    if (!title) return NextResponse.json({ error: "Chybí název zápasu." }, { status: 400 });
    const opponent = (readString(b.opponent) ?? "").trim() || null;
    const venue = (readString(b.venue) ?? "").trim() || null;
    const category = readCategory(b.category);
    const homeCode = (readString(b.homeCode) ?? "").trim().toUpperCase() || null;
    const awayCode = (readString(b.awayCode) ?? "").trim().toUpperCase() || null;
    const startsAt =
      typeof b.startsAt === "string" && b.startsAt.trim()
        ? new Date(b.startsAt)
        : null;
    const published = Boolean(b.published);

    const slug = await uniqueSlug(title, async (s) => {
      const hit = await prisma.match.findUnique({ where: { slug: s }, select: { id: true } });
      return !!hit;
    });

    const created = await prisma.match.create({
      data: { title, slug, opponent, venue, startsAt, published, category, homeCode, awayCode },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        homeCode: true,
        awayCode: true,
        opponent: true,
        startsAt: true,
        venue: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ ok: true, match: created });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    console.error("POST /api/admin/matches:", e);
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
  }
}

