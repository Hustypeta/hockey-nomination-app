import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  FantasyAdminLineupResult,
  FantasyAdminPickedPlayer,
  FantasyAdminStatInput,
} from "@/lib/msFantasyAdminTypes";
import { clampFantasyStatInt, statRowToFantasyPoints } from "@/lib/msFantasyStatPreview";
import type { MsFantasyGoalieBox, MsFantasySkaterBox } from "@/lib/msFantasyConfig";
import {
  MS2026_FANTASY_OFFICIAL_GAME_DAYS,
  ms2026FantasyResolveLockAt,
  ms2026FantasySortedMatches,
} from "@/lib/ms2026FantasyOfficialGameDays";
import { goalieFantasyPoints, lineupDayPoints, skaterFantasyPoints } from "@/lib/msFantasyScoring";

export type { FantasyAdminLineupResult, FantasyAdminPickedPlayer, FantasyAdminStatInput };

export async function ensureMsFantasyGameDayBySlug(slug: string) {
  const trimmed = slug.trim();
  const existing = await prisma.msFantasyGameDay.findUnique({ where: { slug: trimmed } });
  if (existing) return existing;

  const seed = MS2026_FANTASY_OFFICIAL_GAME_DAYS.find((d) => d.slug === trimmed);
  if (!seed) return null;

  const lockAt = ms2026FantasyResolveLockAt(seed);
  const matches = ms2026FantasySortedMatches(seed) as Prisma.InputJsonValue;
  return prisma.msFantasyGameDay.create({
    data: {
      slug: seed.slug,
      title: seed.title,
      lockAt,
      sortOrder: seed.sortOrder,
      matches,
    },
  });
}

export async function listMsFantasyAdminGameDays() {
  const dbRows = await prisma.msFantasyGameDay.findMany({
    orderBy: [{ sortOrder: "asc" }, { lockAt: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      lockAt: true,
      _count: { select: { lineups: true, playerDayStats: true, lineupDayResults: true } },
    },
  });
  const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]));

  return MS2026_FANTASY_OFFICIAL_GAME_DAYS.map((seed) => {
    const db = dbBySlug.get(seed.slug);
    return {
      id: db?.id ?? null,
      slug: seed.slug,
      title: seed.title,
      lockAt: (db?.lockAt ?? ms2026FantasyResolveLockAt(seed)).toISOString(),
      lineupCount: db?._count.lineups ?? 0,
      statsCount: db?._count.playerDayStats ?? 0,
      resultsCount: db?._count.lineupDayResults ?? 0,
      inDatabase: Boolean(db),
    };
  });
}

export async function loadMsFantasyAdminDay(slug: string) {
  const gameDay = await ensureMsFantasyGameDayBySlug(slug);
  if (!gameDay) return null;

  const [lineups, statRows] = await Promise.all([
    prisma.msFantasyLineup.findMany({
      where: { gameDayId: gameDay.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            leaderboardNickname: true,
          },
        },
        dayResult: { select: { points: true, scoredAt: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.msFantasyPlayerDayStat.findMany({ where: { gameDayId: gameDay.id } }),
  ]);

  const pickCount = new Map<string, number>();
  for (const lu of lineups) {
    for (const pid of lu.pickIds) {
      pickCount.set(pid, (pickCount.get(pid) ?? 0) + 1);
    }
  }

  const rosterIds = [...pickCount.keys()];
  const roster =
    rosterIds.length > 0
      ? await prisma.msFantasyRosterPlayer.findMany({
          where: { id: { in: rosterIds } },
          orderBy: [{ team: "asc" }, { name: "asc" }],
        })
      : [];

  const statByPlayer = new Map(statRows.map((s) => [s.rosterPlayerId, s]));

  const pickedPlayers: FantasyAdminPickedPlayer[] = roster.map((p) => {
    const s = statByPlayer.get(p.id);
    return {
      rosterPlayerId: p.id,
      code: p.code,
      name: p.name,
      team: p.team,
      position: p.position,
      tier: p.tier,
      pickCount: pickCount.get(p.id) ?? 0,
      goals: s?.goals ?? 0,
      assists: s?.assists ?? 0,
      plusMinus: s?.plusMinus ?? 0,
      wins: s?.wins ?? 0,
      goalsAgainst: s?.goalsAgainst ?? 0,
      shutouts: s?.shutouts ?? 0,
      fantasyPoints: s?.fantasyPoints ?? 0,
    };
  });

  pickedPlayers.sort((a, b) => b.pickCount - a.pickCount || a.name.localeCompare(b.name, "cs"));

  const lineupSummaries = lineups.map((lu) => ({
    lineupId: lu.id,
    userId: lu.userId,
    displayName:
      lu.user.leaderboardNickname?.trim() ||
      lu.user.name?.trim() ||
      lu.user.email?.split("@")[0] ||
      "Hráč",
    pickIds: lu.pickIds,
    salarySpent: lu.salarySpent,
    points: lu.dayResult?.points ?? null,
    scoredAt: lu.dayResult?.scoredAt?.toISOString() ?? null,
  }));

  return {
    gameDay: {
      id: gameDay.id,
      slug: gameDay.slug,
      title: gameDay.title,
      lockAt: gameDay.lockAt.toISOString(),
    },
    lineupCount: lineups.length,
    pickedPlayers,
    lineups: lineupSummaries,
  };
}

export async function saveMsFantasyAdminDayStats(gameDayId: string, inputs: FantasyAdminStatInput[]) {
  const rosterIds = inputs.map((i) => i.rosterPlayerId).filter(Boolean);
  const players =
    rosterIds.length > 0
      ? await prisma.msFantasyRosterPlayer.findMany({
          where: { id: { in: rosterIds } },
          select: { id: true, position: true },
        })
      : [];
  const posById = new Map(players.map((p) => [p.id, p.position]));

  for (const row of inputs) {
    if (!row.rosterPlayerId) continue;
    const position = posById.get(row.rosterPlayerId) ?? "F";
    const goals = clampFantasyStatInt(row.goals, 0, 99);
    const assists = clampFantasyStatInt(row.assists, 0, 99);
    const plusMinus = clampFantasyStatInt(row.plusMinus, -99, 99);
    const wins = clampFantasyStatInt(row.wins, 0, 9);
    const goalsAgainst = clampFantasyStatInt(row.goalsAgainst, 0, 99);
    const shutouts = clampFantasyStatInt(row.shutouts, 0, 9);
    const fantasyPoints = statRowToFantasyPoints(position, row);

    await prisma.msFantasyPlayerDayStat.upsert({
      where: {
        gameDayId_rosterPlayerId: { gameDayId, rosterPlayerId: row.rosterPlayerId },
      },
      create: {
        gameDayId,
        rosterPlayerId: row.rosterPlayerId,
        goals,
        assists,
        plusMinus,
        wins,
        goalsAgainst,
        shutouts,
        fantasyPoints,
      },
      update: {
        goals,
        assists,
        plusMinus,
        wins,
        goalsAgainst,
        shutouts,
        fantasyPoints,
      },
    });
  }
}

export async function evaluateMsFantasyAdminDay(gameDayId: string): Promise<{
  results: FantasyAdminLineupResult[];
  missingStatPlayerIds: string[];
}> {
  const [lineups, statRows] = await Promise.all([
    prisma.msFantasyLineup.findMany({
      where: { gameDayId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            leaderboardNickname: true,
          },
        },
      },
    }),
    prisma.msFantasyPlayerDayStat.findMany({ where: { gameDayId } }),
  ]);

  const statByPlayer = new Map(statRows.map((s) => [s.rosterPlayerId, s]));
  const allPickIds = [...new Set(lineups.flatMap((l) => l.pickIds))];
  const roster =
    allPickIds.length > 0
      ? await prisma.msFantasyRosterPlayer.findMany({ where: { id: { in: allPickIds } } })
      : [];
  const rosterById = new Map(roster.map((p) => [p.id, p]));

  const missingStatPlayerIds: string[] = [];
  for (const pid of allPickIds) {
    if (!statByPlayer.has(pid)) missingStatPlayerIds.push(pid);
  }

  const results: FantasyAdminLineupResult[] = [];

  for (const lu of lineups) {
    const breakdown: FantasyAdminLineupResult["breakdown"] = [];
    const pickRows: Array<{
      position: string;
      skater?: MsFantasySkaterBox | null;
      goalie?: MsFantasyGoalieBox | null;
    }> = [];

    for (const pid of lu.pickIds) {
      const player = rosterById.get(pid);
      const stat = statByPlayer.get(pid);
      const name = player?.name ?? pid;
      const position = player?.position ?? "F";

      if (!stat) {
        breakdown.push({ rosterPlayerId: pid, name, position, points: 0 });
        pickRows.push({ position });
        continue;
      }

      const isGk = position === "G";
      if (isGk) {
        const goalie: MsFantasyGoalieBox = {
          wins: stat.wins,
          goalsAgainst: stat.goalsAgainst,
          shutouts: stat.shutouts,
        };
        const pts = goalieFantasyPoints(goalie);
        breakdown.push({ rosterPlayerId: pid, name, position, points: pts });
        pickRows.push({ position, goalie });
      } else {
        const skater: MsFantasySkaterBox = {
          goals: stat.goals,
          assists: stat.assists,
          plusMinus: stat.plusMinus,
        };
        const pts = skaterFantasyPoints(skater);
        breakdown.push({ rosterPlayerId: pid, name, position, points: pts });
        pickRows.push({ position, skater });
      }
    }

    const points = lineupDayPoints(pickRows);
    const displayName =
      lu.user.leaderboardNickname?.trim() ||
      lu.user.name?.trim() ||
      lu.user.email?.split("@")[0] ||
      "Hráč";

    await prisma.msFantasyLineupDayResult.upsert({
      where: { lineupId: lu.id },
      create: {
        lineupId: lu.id,
        gameDayId,
        userId: lu.userId,
        points,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
      },
      update: {
        points,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
        scoredAt: new Date(),
      },
    });

    results.push({
      lineupId: lu.id,
      userId: lu.userId,
      displayName,
      points,
      salarySpent: lu.salarySpent,
      breakdown,
    });
  }

  results.sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName, "cs"));

  return { results, missingStatPlayerIds };
}
