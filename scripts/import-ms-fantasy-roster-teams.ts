/**
 * Doplní / přepíše fantasy pool jen pro vybrané repre (default FIN + GER).
 * Nemění ostatní týmy ani tabulku ms_fantasy_lineups.
 *
 * Použití: npx ts-node --project scripts/tsconfig.json scripts/import-ms-fantasy-roster-teams.ts
 * Volitelně: TEAMS=FIN,GER,CZE
 */
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importMsFantasyRosterJson } from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

const TEAM_FILES: Record<string, string> = {
  FIN: "finland-ms2026-fantasy-roster.json",
  GER: "germany-ms2026-fantasy-roster.json",
  SWE: "sweden-ms2026-fantasy-roster.json",
  ITA: "italy-ms2026-fantasy-roster.json",
  SUI: "switzerland-ms2026-fantasy-roster.json",
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const teamsRaw = process.argv.slice(2).join(",").trim() || process.env.TEAMS?.trim() || "FIN,GER";
  const teams = teamsRaw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const [lineupCount, poolCount] = await Promise.all([
    prisma.msFantasyLineup.count(),
    prisma.msFantasyRosterPlayer.count(),
  ]);
  console.log(`DB: ${poolCount} hráčů v poolu, ${lineupCount} odevzdaných fantasy sestav (beze změny).`);

  let imported = 0;
  for (const team of teams) {
    const file = TEAM_FILES[team];
    if (!file) {
      console.warn(`Neznámý tým ${team} — přeskakuji (známé: ${Object.keys(TEAM_FILES).join(", ")}).`);
      continue;
    }
    imported += await importMsFantasyRosterJson(prisma, team, file, "import-ms-fantasy-roster-teams");
  }

  const fin = await prisma.msFantasyRosterPlayer.count({ where: { team: "FIN" } });
  const ger = await prisma.msFantasyRosterPlayer.count({ where: { team: "GER" } });
  console.log(`Hotovo. Pool nyní: FIN=${fin}, GER=${ger} (importováno týmů: ${teams.join(", ")}).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
