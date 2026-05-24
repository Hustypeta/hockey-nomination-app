/**
 * SUI — sjednocení s IIHF kádrem MS 2026 (25 hráčů).
 *
 *   npm run fantasy:patch-sui
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

const ROSTER_FILE = "switzerland-ms2026-fantasy-roster.json";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const rows = JSON.parse(readFileSync(join(process.cwd(), "data", ROSTER_FILE), "utf-8")) as FantasyRosterJsonRow[];
  const validCodes = new Set(rows.map((r) => r.code.trim().toUpperCase()));

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  await importMsFantasyRosterJson(prisma, "SUI", ROSTER_FILE, "fantasy:patch-sui");

  const legacy = [
    "SUI26-F95-MOY",
    "SUI26-D00-CHANTON",
    "SUI26-D00-HELDNER",
    "SUI26-D00-SEILER",
    "SUI26-F00-FREHNER",
  ];
  for (const code of legacy) {
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, code);
    if (r) console.log(`Deaktivováno (legacy): ${r.name} (${code}), v ${r.lineupCount} sestavách.`);
  }

  const stale = await prisma.msFantasyRosterPlayer.findMany({
    where: { team: "SUI", active: true },
    select: { code: true, name: true },
  });
  for (const p of stale) {
    if (validCodes.has(p.code.toUpperCase())) continue;
    const r = await deactivateMsFantasyRosterPlayerByCode(prisma, p.code);
    if (r) console.log(`Deaktivováno (mimo IIHF soupisku): ${r.name} (${p.code}).`);
  }

  const active = await prisma.msFantasyRosterPlayer.count({ where: { team: "SUI", active: true } });
  console.log(`Hotovo. Aktivních SUI: ${active} (očekáváno ${rows.length}).`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
