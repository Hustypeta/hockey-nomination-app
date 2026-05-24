/**
 * Deaktivace hráče ve fantasy poolu (active=false) — odevzdané sestavy zůstanou.
 *
 *   npm run fantasy:deactivate -- CAN26-F13-BARZAL
 */
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { deactivateMsFantasyRosterPlayerByCode } from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

async function main() {
  const code = process.argv.slice(2).find((a) => !a.startsWith("-"))?.trim().toUpperCase();
  if (!code) {
    console.error("Použití: npm run fantasy:deactivate -- CAN26-F13-BARZAL");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const row = await prisma.msFantasyRosterPlayer.findUnique({
    where: { code },
    select: { name: true, team: true, active: true },
  });
  if (!row) {
    console.error(`Hráč ${code} v poolu nenalezen.`);
    process.exit(1);
  }

  const result = await deactivateMsFantasyRosterPlayerByCode(prisma, code);
  if (!result) {
    console.error(`Deaktivace ${code} selhala.`);
    process.exit(1);
  }

  console.log(
    `OK: ${result.name} (${code}, ${row.team}) → active=false, id=${result.id}, ve ${result.lineupCount} odevzdaných sestavách zůstává ve snímku.`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
