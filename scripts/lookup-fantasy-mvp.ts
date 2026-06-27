import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { publicLeaderboardDisplayName } from "../src/lib/publicUserLabel";

const root = process.cwd();
if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local"), override: true });
if (existsSync(join(root, ".env"))) config({ path: join(root, ".env") });

const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.msFantasyPlayerDayStat.findMany({
    include: {
      gameDay: { select: { title: true, slug: true } },
    },
  });

  const roster = await prisma.msFantasyRosterPlayer.findMany({
    select: { id: true, name: true, code: true, team: true, position: true },
  });
  const rosterById = new Map(roster.map((p) => [p.id, p]));

  const totalByPlayer = new Map<string, { points: number; days: number; bestDay: number; bestDayTitle: string }>();
  for (const s of stats) {
    const cur = totalByPlayer.get(s.rosterPlayerId) ?? { points: 0, days: 0, bestDay: 0, bestDayTitle: "" };
    cur.points += s.fantasyPoints;
    cur.days += 1;
    if (s.fantasyPoints > cur.bestDay) {
      cur.bestDay = s.fantasyPoints;
      cur.bestDayTitle = s.gameDay.title;
    }
    totalByPlayer.set(s.rosterPlayerId, cur);
  }

  const sorted = [...totalByPlayer.entries()].sort((a, b) => b[1].points - a[1].points);
  console.log("\n=== Top 10 hráčů (součet fantasy bodů za MS) ===");
  for (const [id, agg] of sorted.slice(0, 10)) {
    const p = rosterById.get(id);
    console.log(
      `${p?.name ?? id} (${p?.team} ${p?.position}) — celkem ${agg.points}b za ${agg.days} dnů, max den ${agg.bestDay}b (${agg.bestDayTitle})`,
    );
  }

  const results = await prisma.msFantasyLineupDayResult.findMany({
    select: { breakdown: true, userId: true, points: true },
  });
  const users = await prisma.user.findMany({
    select: { id: true, leaderboardNickname: true, email: true },
  });
  const displayName = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    return publicLeaderboardDisplayName({
      userId,
      nickname: u?.leaderboardNickname,
    });
  };

  type PickRow = { rosterPlayerId?: string; name?: string; points?: number };
  let bestPick: { playerName: string; points: number; userId: string } | null = null;

  for (const r of results) {
    const breakdown = (Array.isArray(r.breakdown) ? r.breakdown : []) as PickRow[];
    for (const row of breakdown) {
      const pts = row.points ?? 0;
      if (!bestPick || pts > bestPick.points) {
        bestPick = {
          playerName: row.name ?? row.rosterPlayerId ?? "?",
          points: pts,
          userId: r.userId,
        };
      }
    }
  }

  console.log("\n=== Nejsilnější jednotlivý pick v sestavě (jeden den) ===");
  if (bestPick) {
    console.log(
      `${bestPick.playerName} — ${bestPick.points}b (měl ho ${displayName(bestPick.userId)})`,
    );
  }

  const dayResults = await prisma.msFantasyLineupDayResult.findMany({
    include: { gameDay: { select: { title: true } } },
    orderBy: { points: "desc" },
    take: 5,
  });
  console.log("\n=== Nejlepší den uživatele (nejvíc bodů za jeden herní den) ===");
  for (const r of dayResults) {
    console.log(`${displayName(r.userId)} — ${r.points}b (${r.gameDay.title})`);
  }

  const topUser = await prisma.msFantasyLineupDayResult.groupBy({
    by: ["userId"],
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: 1,
  });
  console.log("\n=== Celkový vítěz fantasy ===");
  if (topUser[0]) {
    console.log(
      `${displayName(topUser[0].userId)} — ${topUser[0]._sum.points ?? 0}b celkem`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
