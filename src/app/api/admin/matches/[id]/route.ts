import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrThrow();
    const { id } = await params;
    const hit = await prisma.match.findUnique({ where: { id }, select: { id: true } });
    if (!hit) return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    console.error("DELETE /api/admin/matches/[id]:", e);
    const message =
      status === 401
        ? "Neautorizováno."
        : e instanceof Error
          ? `Chyba: ${e.message}`
          : "Chyba.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrThrow();
    const { id } = await params;
    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;

    const data: {
      published?: boolean;
      ratingsOpen?: boolean;
      title?: string;
      opponent?: string | null;
      venue?: string | null;
      startsAt?: Date | null;
      homeCode?: string | null;
      awayCode?: string | null;
      category?: string;
    } = {};

    if (typeof b.published === "boolean") data.published = b.published;
    if (typeof b.ratingsOpen === "boolean") data.ratingsOpen = b.ratingsOpen;
    if (typeof b.title === "string" && b.title.trim()) data.title = b.title.trim();
    if (typeof b.opponent === "string") data.opponent = b.opponent.trim() || null;
    if (typeof b.venue === "string") data.venue = b.venue.trim() || null;
    if (typeof b.homeCode === "string") data.homeCode = b.homeCode.trim().toUpperCase() || null;
    if (typeof b.awayCode === "string") data.awayCode = b.awayCode.trim().toUpperCase() || null;
    if (typeof b.category === "string") data.category = b.category === "ms2026" ? "ms2026" : "beijir";
    if (typeof b.startsAt === "string" && b.startsAt.trim()) {
      const d = new Date(b.startsAt);
      if (!Number.isNaN(d.getTime())) data.startsAt = d;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nic ke změně." }, { status: 400 });
    }

    /**
     * `ratingsOpen` je nový sloupec; pokud prod DB ještě nemá migraci, fallback přes raw `ALTER TABLE`
     * + `UPDATE`. Pak ostatní pole zapíšeme standardně přes Prisma update.
     */
    const { ratingsOpen, ...rest } = data;

    if (typeof ratingsOpen === "boolean") {
      try {
        await prisma.match.update({ where: { id }, data: { ratingsOpen } });
      } catch (err) {
        console.warn("PATCH /api/admin/matches/[id] ratingsOpen update fell back to raw:", err);
        await prisma.$executeRaw`
          ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "ratingsOpen" BOOLEAN NOT NULL DEFAULT false
        `;
        await prisma.$executeRaw`
          UPDATE "matches" SET "ratingsOpen" = ${ratingsOpen} WHERE id = ${id}
        `;
      }
    }

    const matchSelect = {
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
    } as const;

    const updated =
      Object.keys(rest).length > 0
        ? await prisma.match.update({ where: { id }, data: rest, select: matchSelect })
        : await prisma.match.findUnique({ where: { id }, select: matchSelect });
    return NextResponse.json({ ok: true, match: updated });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    console.error("PATCH /api/admin/matches/[id]:", e);
    const message =
      status === 401
        ? "Neautorizováno."
        : e instanceof Error
          ? `Chyba: ${e.message}`
          : "Chyba.";
    return NextResponse.json({ error: message }, { status });
  }
}
