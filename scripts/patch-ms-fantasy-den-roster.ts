/**
 * Dánsko — oficiální soupiska MS 2026 (24 hráčů). Import JSON + deaktivace starých kódů.
 *
 *   npm run fantasy:patch-den
 */
import { readFileSync } from "fs";
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  deactivateMsFantasyRosterPlayerByCode,
  importMsFantasyRosterJson,
  type FantasyRosterJsonRow,
} from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

const ROSTER_FILE = "denmark-ms2026-fantasy-roster.json";

/** Staré / chybné kódy (špatné pozice, Dichow mimo kádr, null čísla dresů). */
const LEGACY_DEACTIVATE = [
  "DEN26-G80-DICHOW",
  "DEN26-G00-HENRIKS",
  "DEN26-G00-SOGAARD",
  "DEN26-D00-BAASTRUP",
  "DEN26-D00-KLARSEN",
  "DEN26-D00-MJENSEN",
  "DEN26-D00-SETKOV",
  "DEN26-F05-KJAER",
  "DEN26-F00-SSVEJSTR",
  "DEN26-F00-DMADSEN",
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const fp = join(process.cwd(), "data", ROSTER_FILE);
  const rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  const validCodes = new Set(rows.map((r) => r.code.trim().toUpperCase()));

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const lineupCount = await prisma.msFantasyLineup.count();
  console.log(`Odevzdaných fantasy sestav: ${lineupCount} (nemění se).`);

  await importMsFantasyRosterJson(prisma, "DEN", ROSTER_FILE, "fantasy:patch-den");

  for (const code of LEGACY_DEACTIVATE) {
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, code);
    if (r) {
      console.log(`Deaktivováno (legacy): ${r.name} (${code}), v ${r.lineupCount} sestavách.`);
    }
  }

  const stale = await prisma.msFantasyRosterPlayer.findMany({
    where: { team: "DEN", active: true },
    select: { code: true, name: true },
  });
  for (const p of stale) {
    if (validCodes.has(p.code.toUpperCase())) continue;
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, p.code);
    if (r) console.log(`Deaktivováno (mimo soupisku): ${r.name} (${p.code}).`);
  }

  const activeDen = await prisma.msFantasyRosterPlayer.count({ where: { team: "DEN", active: true } });
  console.log(`Hotovo. Aktivních hráčů DEN: ${activeDen} (očekáváno ${rows.length}).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
