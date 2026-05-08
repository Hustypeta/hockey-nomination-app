import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";

/** Hromadné mazání: smaže všechny zápasy v dané kategorii, kde nehraje CZE (ani jako home, ani jako away). */
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrThrow();
    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;
    const mode = typeof b.mode === "string" ? b.mode : "";

    if (mode === "non-czech") {
      const category = typeof b.category === "string" ? b.category : null;
      const where = {
        ...(category ? { category } : {}),
        AND: [
          { OR: [{ homeCode: { not: "CZE" } }, { homeCode: null }] },
          { OR: [{ awayCode: { not: "CZE" } }, { awayCode: null }] },
        ],
      };
      const hits = await prisma.match.findMany({
        where,
        select: { id: true, title: true, homeCode: true, awayCode: true },
      });
      const idsToDelete = hits
        .filter((m) => {
          const t = (m.title || "").toUpperCase();
          if (m.homeCode === "CZE" || m.awayCode === "CZE") return false;
          return !/\bCZE\b/.test(t);
        })
        .map((m) => m.id);
      if (idsToDelete.length === 0) return NextResponse.json({ ok: true, deleted: 0 });
      const res = await prisma.match.deleteMany({ where: { id: { in: idsToDelete } } });
      return NextResponse.json({ ok: true, deleted: res.count });
    }

    return NextResponse.json({ error: "Neznámý mode." }, { status: 400 });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    console.error("POST /api/admin/matches/bulk-delete:", e);
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
  }
}
