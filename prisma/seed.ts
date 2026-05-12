import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedMsFantasySample() {
  if (process.env.MS_FANTASY_SEED_SAMPLE?.trim() !== "true") return;

  const existingDays = await prisma.msFantasyGameDay.count();
  if (existingDays === 0) {
    const lock1 = new Date("2026-05-15T16:00:00.000Z");
    const lock2 = new Date("2026-05-16T14:30:00.000Z");
    await prisma.msFantasyGameDay.createMany({
      data: [
        { slug: "2026-05-15", title: "Hrací den 1 (vzorek)", lockAt: lock1, sortOrder: 1 },
        { slug: "2026-05-16", title: "Hrací den 2 (vzorek)", lockAt: lock2, sortOrder: 2 },
      ],
    });
    console.log("Seeded 2 sample MS fantasy game days (MS_FANTASY_SEED_SAMPLE)");
  }

  const existingRoster = await prisma.msFantasyRosterPlayer.count();
  if (existingRoster === 0) {
    await prisma.msFantasyRosterPlayer.createMany({
      data: [
        { code: "SAMPLE-G-1", name: "Ukázkový Brankář", team: "CZE", jerseyNumber: 1, position: "G", tier: "A" },
        { code: "SAMPLE-G-2", name: "Druhý Brankář", team: "SWE", jerseyNumber: 30, position: "G", tier: "B" },
        { code: "SAMPLE-D-1", name: "Ukázkový Obránce", team: "CAN", jerseyNumber: 8, position: "D", tier: "B" },
        { code: "SAMPLE-D-2", name: "Tvrdý Defenzivák", team: "USA", jerseyNumber: 33, position: "D", tier: "C" },
        { code: "SAMPLE-F-1", name: "Útočná Hvězda", team: "FIN", jerseyNumber: 88, position: "F", tier: "A" },
        { code: "SAMPLE-F-2", name: "Kreativní Center", team: "CZE", jerseyNumber: 14, position: "F", tier: "B" },
        { code: "SAMPLE-F-3", name: "Wing Střelec", team: "FIN", jerseyNumber: 17, position: "F", tier: "C" },
        { code: "SAMPLE-F-4", name: "Dvousměrák", team: "LAT", jerseyNumber: 47, position: "F", tier: "D" },
        { code: "SAMPLE-F-5", name: "Rychlý Křídelník", team: "AUT", jerseyNumber: 11, position: "F", tier: "E" },
        { code: "SAMPLE-D-3", name: "Tichý Blokátor", team: "CHE", jerseyNumber: 5, position: "D", tier: "E" },
      ],
    });
    console.log("Seeded 10 sample fantasy roster players (MS_FANTASY_SEED_SAMPLE)");
  }
}

async function main() {
  console.log("Seeding database (MS 2026 kandidáti)...");

  const rows = loadMs2026Candidates().map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    role: p.role,
    club: p.club,
    league: p.league,
    jerseyNumber: p.jerseyNumber ?? null,
  }));

  await prisma.player.deleteMany({});
  await prisma.player.createMany({
    data: rows,
  });

  console.log(`Seeded ${rows.length} players from czech-ms-2026-candidates-80.json`);

  await seedMsFantasySample();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
