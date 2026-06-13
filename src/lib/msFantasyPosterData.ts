import { prisma } from "@/lib/prisma";
import { MS_FANTASY_CAP } from "@/lib/msFantasyConfig";
import type { FantasyLineupPosterPayload, FantasyPosterPick } from "@/lib/msFantasyPosterTypes";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

type BreakdownRow = {
  rosterPlayerId?: string;
  name?: string;
  position?: string;
  points?: number;
};

function orderedSlots(picks: FantasyPosterPick[]): (FantasyPosterPick | null)[] {
  const out: (FantasyPosterPick | null)[] = [null, null, null, null, null, null];
  const g = picks.find((p) => p.position === "G");
  const ds = picks.filter((p) => p.position === "D");
  const fs = picks.filter((p) => p.position === "F");
  if (g) out[0] = g;
  ds.slice(0, 2).forEach((p, i) => {
    out[1 + i] = p;
  });
  fs.slice(0, 3).forEach((p, i) => {
    out[3 + i] = p;
  });
  return out;
}

async function loadPosterFromResult(resultId: string): Promise<FantasyLineupPosterPayload | null> {
  const row = await prisma.msFantasyLineupDayResult.findUnique({
    where: { id: resultId },
    include: {
      gameDay: { select: { title: true, slug: true, id: true } },
      lineup: { select: { id: true, pickIds: true, pickSalaries: true, salarySpent: true, userId: true } },
    },
  });
  if (!row?.lineup) return null;

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { leaderboardNickname: true },
  });

  const roster = await prisma.msFantasyRosterPlayer.findMany({
    where: { id: { in: row.lineup.pickIds } },
  });
  const rosterById = new Map(roster.map((p) => [p.id, p]));

  const stats = await prisma.msFantasyPlayerDayStat.findMany({
    where: { gameDayId: row.gameDayId, rosterPlayerId: { in: row.lineup.pickIds } },
  });
  const statById = new Map(stats.map((s) => [s.rosterPlayerId, s]));

  const breakdown = (Array.isArray(row.breakdown) ? row.breakdown : []) as BreakdownRow[];
  const pointsById = new Map(breakdown.map((b) => [b.rosterPlayerId ?? "", b.points ?? 0]));

  const picks: FantasyPosterPick[] = row.lineup.pickIds.map((pid, i) => {
    const p = rosterById.get(pid);
    const s = statById.get(pid);
    return {
      id: pid,
      code: p?.code ?? "",
      name: p?.name ?? pid,
      team: p?.team ?? "",
      position: p?.position ?? "F",
      salary: row.lineup.pickSalaries[i] ?? 0,
      goals: s?.goals ?? 0,
      assists: s?.assists ?? 0,
      plusMinus: s?.plusMinus ?? 0,
      wins: s?.wins ?? 0,
      goalsAgainst: s?.goalsAgainst ?? 0,
      shutouts: s?.shutouts ?? 0,
      fantasyPoints: pointsById.get(pid) ?? s?.fantasyPoints ?? 0,
    };
  });

  const slots = orderedSlots(picks).filter((p): p is FantasyPosterPick => Boolean(p));

  return {
    resultId: row.id,
    lineupId: row.lineup.id,
    gameDayTitle: row.gameDay.title,
    gameDaySlug: row.gameDay.slug,
    points: row.points,
    salarySpent: row.lineup.salarySpent,
    salaryCap: MS_FANTASY_CAP,
    suggestedDisplayName: publicLeaderboardDisplayName({
      userId: row.userId,
      nickname: user?.leaderboardNickname,
    }),
    picks: slots,
  };
}

/** Nejlepší vyhodnocený den (nejvíc bodů v jedné sestavě). */
export async function loadMsFantasyBestDayLineupPoster(): Promise<FantasyLineupPosterPayload | null> {
  const best = await prisma.msFantasyLineupDayResult.findFirst({
    orderBy: { points: "desc" },
    select: { id: true },
  });
  if (!best) return null;
  return loadPosterFromResult(best.id);
}

export async function loadMsFantasyLineupPosterByResultId(
  resultId: string,
): Promise<FantasyLineupPosterPayload | null> {
  return loadPosterFromResult(resultId);
}
