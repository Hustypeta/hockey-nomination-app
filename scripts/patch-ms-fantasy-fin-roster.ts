/**
 * FIN — sjednocení s IIHF kádrem MS 2026 (25 hráčů).
 *
 *   npm run fantasy:patch-fin
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

const ROSTER_FILE = "finland-ms2026-fantasy-roster.json";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const rows = JSON.parse(readFileSync(join(process.cwd(), "data", ROSTER_FILE), "utf-8")) as FantasyRosterJsonRow[];
  const validCodes = new Set(rows.map((r) => r.code.trim().toUpperCase()));

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  await importMsFantasyRosterJson(prisma, "FIN", ROSTER_FILE, "fantasy:patch-fin");

  const legacy = [
    "FIN26-F37-EEMILE",
    "FIN26-F00-AKURATY",
    "FIN26-F00-PUHAKKA",
    "FIN26-F00-PAKKILA",
    "FIN26-D00-RIIKOLA",
    "FIN26-D00-KUKKONE",
    "FIN26-D00-VILEN",
    "FIN26-G00-IGNATJE",
    "FIN26-F86-TEUVOT",
  ];
  for (const code of legacy) {
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, code);
    if (r) console.log(`Deaktivováno (legacy): ${r.name} (${code}), v ${r.lineupCount} sestavách.`);
  }

  const stale = await prisma.msFantasyRosterPlayer.findMany({
    where: { team: "FIN", active: true },
    select: { code: true, name: true },
  });
  for (const p of stale) {
    if (validCodes.has(p.code.toUpperCase())) continue;
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, p.code);
    if (r) console.log(`Deaktivováno (mimo IIHF soupisku): ${r.name} (${p.code}).`);
  }

  const active = await prisma.msFantasyRosterPlayer.count({ where: { team: "FIN", active: true } });
  console.log(`Hotovo. Aktivních FIN: ${active} (očekáváno ${rows.length}).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
