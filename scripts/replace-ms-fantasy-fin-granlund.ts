/**
 * Náhrada Teuvo Teräväinen → Michael Granlund na stejném id v poolu (zachová pickIds v lineups).
 *
 *   npm run fantasy:replace-fin-granlund
 */
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { replaceMsFantasyRosterPlayerInPlace } from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

const OUTGOING_CODE = "FIN26-F86-TEUVOT";
const REPLACEMENT = {
  code: "FIN26-F64-MICHAE",
  name: "Michael Granlund",
  team: "FIN",
  jerseyNumber: 64,
  position: "F",
  tier: "A",
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const result = await replaceMsFantasyRosterPlayerInPlace(prisma, OUTGOING_CODE, REPLACEMENT);
  if (!result) {
    const existing = await prisma.msFantasyRosterPlayer.findUnique({
      where: { code: REPLACEMENT.code },
      select: { id: true, name: true },
    });
    if (existing) {
      const lineupCount = await prisma.msFantasyLineup.count({
        where: { pickIds: { has: existing.id } },
      });
      console.log(
        `Hráč ${OUTGOING_CODE} už není v poolu — ${existing.name} (${REPLACEMENT.code}) je nastaven, ${lineupCount} sestav používá toto id.`
      );
      await prisma.$disconnect();
      return;
    }
    console.error(`Hráč ${OUTGOING_CODE} v poolu nenalezen.`);
    process.exit(1);
  }

  console.log(
    `OK: ${OUTGOING_CODE} → ${result.name} (${REPLACEMENT.code}), stejné id=${result.id}, dotčeno ${result.lineupCount} odevzdaných sestav.`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
