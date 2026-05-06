import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/matchAdmin";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import type { LineupStructure } from "@/types";
import { collectMatchLineupIds, isMatchLineupComplete } from "@/lib/matchLineupValidation";

function readString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function readDefenseCount(v: unknown): 6 | 7 | 8 | null {
  return v === 6 || v === 7 || v === 8 ? v : null;
}

function validatePlayerIds(ids: string[]): string | null {
  const all = loadMs2026Candidates();
  const byId = new Set(all.map((p) => p.id));
  for (const id of ids) {
    if (!byId.has(id)) return "Neplatní hráči v sestavě.";
  }
  if (new Set(ids).size !== ids.length) return "Každý hráč může být jen jednou.";
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrThrow();
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: { officialLineup: true },
    });
    if (!match) return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    return NextResponse.json({ match });
  } catch (e: unknown) {
    const status = typeof (e as { status?: unknown })?.status === "number" ? (e as any).status : 500;
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrThrow();
    const { id } = await params;

    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;

    const rawLineup = b.lineupStructure;
    if (!rawLineup || typeof rawLineup !== "object") {
      return NextResponse.json({ error: "Chybí sestava." }, { status: 400 });
    }
    const lineup = rawLineup as LineupStructure;
    const captainId = readString(b.captainId);
    const defenseCount = readDefenseCount(b.defenseCount) ?? 8;
    const allowExtraForward = Boolean(b.allowExtraForward);
    const published = Boolean(b.published);

    if (!isMatchLineupComplete(lineup, { defenseCount, allowExtraForward })) {
      return NextResponse.json({ error: "Sestava není kompletní podle zvolených pravidel." }, { status: 400 });
    }

    const ids = collectMatchLineupIds(lineup, { defenseCount, allowExtraForward });
    const idErr = validatePlayerIds(ids);
    if (idErr) return NextResponse.json({ error: idErr }, { status: 400 });

    if (captainId && !ids.includes(captainId)) {
      return NextResponse.json({ error: "Kapitán musí být ze sestavy." }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id }, select: { id: true } });
    if (!match) return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });

    await prisma.matchOfficialLineup.upsert({
      where: { matchId: id },
      create: {
        matchId: id,
        lineupStructure: lineup as object,
        captainId,
        defenseCount,
        allowExtraForward,
      },
      update: {
        lineupStructure: lineup as object,
        captainId,
        defenseCount,
        allowExtraForward,
      },
    });

    await prisma.match.update({ where: { id }, data: { published } });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const status = typeof (e as { status?: unknown })?.status === "number" ? (e as any).status : 500;
    console.error("POST /api/admin/matches/[id]/official-lineup:", e);
    return NextResponse.json({ error: status === 401 ? "Neautorizováno." : "Chyba." }, { status });
  }
}

