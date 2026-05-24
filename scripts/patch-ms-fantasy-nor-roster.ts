/**
 * NOR — sjednocení s IIHF kádrem MS 2026 (25 hráčů).
 *
 *   npm run fantasy:patch-nor
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

const ROSTER_FILE = "norway-ms2026-fantasy-roster.json";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const rows = JSON.parse(readFileSync(join(process.cwd(), "data", ROSTER_FILE), "utf-8")) as FantasyRosterJsonRow[];
  const validCodes = new Set(rows.map((r) => r.code.trim().toUpperCase()));

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  await importMsFantasyRosterJson(prisma, "NOR", ROSTER_FILE, "fantasy:patch-nor");

  const legacy = ["NOR26-D00-KOPPER", "NOR26-F00-BRANDSEG"];
  for (const code of legacy) {
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, code);
    if (r) console.log(`Deaktivováno (legacy): ${r.name} (${code}), v ${r.lineupCount} sestavách.`);
  }

  const stale = await prisma.msFantasyRosterPlayer.findMany({
    where: { team: "NOR", active: true },
    select: { code: true, name: true },
  });
  for (const p of stale) {
    if (validCodes.has(p.code.toUpperCase())) continue;
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, p.code);
    if (r) console.log(`Deaktivováno (mimo IIHF soupisku): ${r.name} (${p.code}).`);
  }

  const active = await prisma.msFantasyRosterPlayer.count({ where: { team: "NOR", active: true } });
  console.log(`Hotovo. Aktivních NOR: ${active} (očekáváno ${rows.length}).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
