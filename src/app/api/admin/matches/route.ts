import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/matchAdmin";
import { uniqueSlug } from "@/lib/slug";

function readString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export async function GET() {
  try {
    await requireAdminOrThrow();
    const matches = await prisma.match.findMany({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      include: { officialLineup: { select: { updatedAt: true } } },
    });
    return NextResponse.json({ matches });
  } catch (e: unknown) {
    const status = typeof (e as { status?: unknown })?.status === "number" ? (e as any).status : 500;
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
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
      data: { title, slug, opponent, venue, startsAt, published },
    });
    return NextResponse.json({ ok: true, match: created });
  } catch (e: unknown) {
    const status = typeof (e as { status?: unknown })?.status === "number" ? (e as any).status : 500;
    console.error("POST /api/admin/matches:", e);
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
  }
}

