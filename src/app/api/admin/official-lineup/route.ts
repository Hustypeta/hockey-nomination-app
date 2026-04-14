import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import { iterLineupSlots } from "@/lib/contestScoring";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import { prisma } from "@/lib/prisma";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

const OFFICIAL_ID = "official";

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

function validateRosterPlayerIds(selectedPlayerIds: string[]): string | null {
  const all = loadMs2026Candidates();
  const byId = new Map(all.map((p) => [p.id, p]));
  const players = selectedPlayerIds.map((id) => byId.get(id)).filter(Boolean) as typeof all;
  if (players.length !== selectedPlayerIds.length) {
    return "Neplatní hráči v sestavě.";
  }
  const counts = { G: 0, D: 0, F: 0 };
  for (const p of players) {
    if (p.position in counts) counts[p.position as keyof typeof counts]++;
  }
  if (counts.G !== 3 || counts.D !== 8 || counts.F !== 14) {
    return `Neplatná soupiska: potřeba 3G, 8D, 14F (25 hráčů). Máte: ${counts.G}G, ${counts.D}D, ${counts.F}F.`;
  }
  return null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  const row = await prisma.officialLineup.findUnique({ where: { id: OFFICIAL_ID } });
  return NextResponse.json({
    lineupStructure: row?.lineupStructure ?? null,
    captainId: row?.captainId ?? null,
    updatedAt: row?.updatedAt?.toISOString() ?? null,
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawLineup = body.lineupStructure;
    const captainId = typeof body.captainId === "string" ? body.captainId : null;

    if (!rawLineup || typeof rawLineup !== "object") {
      return NextResponse.json({ error: "Chybí lineupStructure." }, { status: 400 });
    }

    const lineup = normalizeLineupStructure(rawLineup as LineupStructure);
    if (!isLineupComplete(lineup)) {
      return NextResponse.json(
        { error: "Sestava není kompletní (25 hráčů dle pravidel editoru)." },
        { status: 400 }
      );
    }

    const slotIds = iterLineupSlots(lineup).map((s) => s.playerId);
    if (new Set(slotIds).size !== 25) {
      return NextResponse.json({ error: "Každý hráč může být jen jednou." }, { status: 400 });
    }

    const rosterErr = validateRosterPlayerIds(slotIds);
    if (rosterErr) {
      return NextResponse.json({ error: rosterErr }, { status: 400 });
    }

    if (captainId && !slotIds.includes(captainId)) {
      return NextResponse.json({ error: "Kapitán musí být ze soupisky." }, { status: 400 });
    }

    const assistants = [...new Set(lineup.assistantIds ?? [])].filter(Boolean);
    for (const aid of assistants) {
      if (!slotIds.includes(aid)) {
        return NextResponse.json({ error: "Asistent musí být ze soupisky." }, { status: 400 });
      }
    }
    if (assistants.length > 2) {
      return NextResponse.json({ error: "Nejvýše 2 asistenti." }, { status: 400 });
    }

    await prisma.officialLineup.upsert({
      where: { id: OFFICIAL_ID },
      create: {
        id: OFFICIAL_ID,
        lineupStructure: lineup as object,
        captainId,
      },
      update: {
        lineupStructure: lineup as object,
        captainId,
      },
    });

    return NextResponse.json({ ok: true, message: "Oficiální soupiska uložena." });
  } catch (e) {
    console.error("official-lineup POST:", e);
    return NextResponse.json({ error: "Uložení se nepovedlo." }, { status: 500 });
  }
}
