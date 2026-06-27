import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { publicLeaderboardDisplayName } from "../src/lib/publicUserLabel";

const root = process.cwd();
if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

async function main() {
  const best = await prisma.msFantasyLineupDayResult.findFirst({
    where: { points: 34 },
    include: {
      gameDay: { select: { title: true, slug: true } },
      lineup: { select: { pickIds: true, salarySpent: true } },
    },
    orderBy: { points: "desc" },
  });

  if (!best) {
    console.log("Sestava s 34 body nenalezena.");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: best.userId },
    select: { leaderboardNickname: true },
  });

  const roster = await prisma.msFantasyRosterPlayer.findMany({
    where: { id: { in: best.lineup.pickIds } },
  });
  const byId = new Map(roster.map((p) => [p.id, p]));

  type B = { rosterPlayerId?: string; name?: string; position?: string; points?: number };
  const breakdown = (Array.isArray(best.breakdown) ? best.breakdown : []) as B[];

  console.log(JSON.stringify({
    user: publicLeaderboardDisplayName({ userId: best.userId, nickname: user?.leaderboardNickname }),
    day: best.gameDay.title,
    points: best.points,
    salarySpent: best.lineup.salarySpent,
    picks: best.lineup.pickIds.map((pid) => {
      const p = byId.get(pid);
      const b = breakdown.find((x) => x.rosterPlayerId === pid);
      return {
        position: p?.position ?? "?",
        name: p?.name ?? pid,
        team: p?.team,
        points: b?.points ?? 0,
      };
    }),
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
