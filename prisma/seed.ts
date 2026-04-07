import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database (MS 2026 kandidáti)...");

  const rows = loadMs2026Candidates().map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    role: p.role,
    club: p.club,
    league: p.league,
  }));

  await prisma.player.deleteMany({});
  await prisma.player.createMany({
    data: rows,
  });

  console.log(`Seeded ${rows.length} players from czech-ms-2026-candidates-80.json`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
