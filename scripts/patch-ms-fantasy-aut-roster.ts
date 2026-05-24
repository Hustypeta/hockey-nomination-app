/**
 * Rakousko: odstranit Philipp Wimmer z poolu (deaktivace), přidat Vinzenz Rohrer.
 * Odevzdané sestavy s Wimmerem zůstanou v DB beze změny (stejné id, active=false).
 *
 *   npm run fantasy:patch-aut
 */
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  deactivateMsFantasyRosterPlayerByCode,
  importMsFantasyRosterJson,
} from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

const WIMMER_CODE = "AUT26-D67-WIMMER";
const ROSTER_FILE = "austria-ms2026-fantasy-roster.json";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const lineupCountBefore = await prisma.msFantasyLineup.count();
  console.log(`Odevzdaných fantasy sestav: ${lineupCountBefore} (nemění se).`);

  await importMsFantasyRosterJson(
    prisma,
    "AUT",
    ROSTER_FILE,
    "fantasy:patch-aut",
    "Upsert podle code — nový hráč dostane nové id."
  );

  const deactivated = await deactivateMsFantasyRosterPlayerByCode(prisma, WIMMER_CODE);
  if (deactivated) {
    console.log(
      `Deaktivováno: ${deactivated.name} (${WIMMER_CODE}), id=${deactivated.id}, v ${deactivated.lineupCount} sestavách zůstává ve snímku.`
    );
  } else {
    console.log(`Hráč ${WIMMER_CODE} v poolu nebyl — přeskakuji deaktivaci.`);
  }

  const rohrer = await prisma.msFantasyRosterPlayer.findUnique({
    where: { code: "AUT26-F19-ROHRER" },
    select: { id: true, name: true, active: true, tier: true, position: true },
  });
  if (rohrer) {
    console.log(
      `Rohrer v poolu: ${rohrer.name}, ${rohrer.position}, tier ${rohrer.tier}, active=${rohrer.active}, id=${rohrer.id}.`
    );
  } else {
    console.error("Chybí AUT26-F19-ROHRER po importu — zkontroluj data/austria-ms2026-fantasy-roster.json");
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
