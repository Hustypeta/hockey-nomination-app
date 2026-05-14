import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse } from "@/lib/msFantasyApiGate";
import { isMsFantasyLineupSubmissionEnabled, salaryForTier } from "@/lib/msFantasyConfig";
import { validateMsFantasyLineup, type RosterPickInput } from "@/lib/msFantasyValidation";
import { ms2026FantasyOfficialLockAtIso } from "@/lib/ms2026FantasyOfficialGameDays";

function mapPlayerRow(p: {
  id: string;
  code: string;
  name: string;
  team: string;
  jerseyNumber: number | null;
  position: string;
  tier: string;
}) {
  const tier = p.tier.trim().toUpperCase();
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    team: p.team,
    jerseyNumber: p.jerseyNumber,
    position: p.position.trim().toUpperCase(),
    tier,
    salary: salaryForTier(tier, p.position),
  };
}

export async function GET(request: NextRequest) {
  const gate = msFantasyNotEnabledResponse();
  if (gate) return gate;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro zobrazení sestavy se přihlas." }, { status: 401 });
  }

  const gameDayId = request.nextUrl.searchParams.get("gameDayId")?.trim();
  if (!gameDayId) {
    return NextResponse.json({ error: "Chybí parametr gameDayId." }, { status: 400 });
  }

  const lineup = await prisma.msFantasyLineup.findUnique({
    where: { userId_gameDayId: { userId: session.user.id, gameDayId } },
  });

  if (!lineup) {
    return NextResponse.json({ lineup: null });
  }

  const players = await prisma.msFantasyRosterPlayer.findMany({
    where: { id: { in: lineup.pickIds } },
    select: {
      id: true,
      code: true,
      name: true,
      team: true,
      jerseyNumber: true,
      position: true,
      tier: true,
    },
  });
  const byId = Object.fromEntries(players.map((p) => [p.id, mapPlayerRow(p)]));
  const picks = lineup.pickIds.map((id) => byId[id] ?? null);

  return NextResponse.json({
    lineup: {
      gameDayId: lineup.gameDayId,
      salarySpent: lineup.salarySpent,
      pickIds: lineup.pickIds,
      picks,
    },
  });
}

export async function POST(request: NextRequest) {
  const gate = msFantasyNotEnabledResponse();
  if (gate) return gate;

  if (!isMsFantasyLineupSubmissionEnabled()) {
    return NextResponse.json(
      { error: "Odesílání fantasy sestav je dočasně vypnuté — zkus to prosím později." },
      { status: 403 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro odeslání sestavy se přihlas." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Očekává se JSON objekt." }, { status: 400 });
  }

  const gameDayId = "gameDayId" in body && typeof body.gameDayId === "string" ? body.gameDayId.trim() : "";
  const rawIds =
    "pickIds" in body && Array.isArray(body.pickIds) ? body.pickIds.filter((x) => typeof x === "string") : [];
  const pickIds = rawIds.map((x: string) => x.trim()).filter(Boolean);

  if (!gameDayId) {
    return NextResponse.json({ error: "Chybí gameDayId." }, { status: 400 });
  }

  const day = await prisma.msFantasyGameDay.findUnique({
    where: { id: gameDayId },
    select: { id: true, slug: true, lockAt: true },
  });
  if (!day) {
    return NextResponse.json({ error: "Neplatný fantasy den." }, { status: 400 });
  }

  const lockIso = ms2026FantasyOfficialLockAtIso(day.slug) ?? day.lockAt.toISOString();
  if (Date.now() >= new Date(lockIso).getTime()) {
    return NextResponse.json({ error: "Deadline už proběhl — sestavu nelze měnit." }, { status: 403 });
  }

  const unique = new Set(pickIds);
  if (unique.size !== pickIds.length) {
    return NextResponse.json({ error: "Žádný hráč se nesmí opakovat." }, { status: 400 });
  }

  const players = await prisma.msFantasyRosterPlayer.findMany({
    where: { id: { in: pickIds }, active: true },
    select: { id: true, position: true, tier: true },
  });

  if (players.length !== pickIds.length) {
    return NextResponse.json({ error: "Ve sestavě jsou neplatná nebo neaktivní id hráčů." }, { status: 400 });
  }

  const byId: Record<string, { id: string; position: string; tier: string }> = Object.fromEntries(
    players.map((p) => [p.id, { id: p.id, position: p.position, tier: p.tier }])
  );

  const ordered: RosterPickInput[] = pickIds.map((id) => {
    const row = byId[id];
    return { id: row.id, position: row.position, tier: row.tier };
  });

  const validation = validateMsFantasyLineup(ordered);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  await prisma.msFantasyLineup.upsert({
    where: { userId_gameDayId: { userId: session.user.id, gameDayId } },
    create: {
      userId: session.user.id,
      gameDayId,
      pickIds,
      salarySpent: validation.salary,
    },
    update: {
      pickIds,
      salarySpent: validation.salary,
    },
  });

  return NextResponse.json({ ok: true, salarySpent: validation.salary });
}
