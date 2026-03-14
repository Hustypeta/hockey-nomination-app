import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Načtení hráčů z JSON (Extraliga, NHL, AHL, SHL, Liiga, NL dle Elite Prospects)
const jsonPath = join(__dirname, "..", "czech-players-2025-26.json");
const allPlayers = JSON.parse(
  readFileSync(jsonPath, "utf-8")
) as Array<{ name: string; position: string; role: string; club: string }>;

// Vyřazení: důchodce (Krejčí), hráči z 2. ligy (Czechia2)
const EXCLUDED_NAMES = new Set(["David Krejčí"]);

// Kluby 2. ligy 2025-26 (Czechia2) – hráče z těchto týmů vyřadit
const EXCLUDED_CLUBS = new Set([
  "AZ Havířov",
  "Draci Šumperk",
  "HC Bobři Valašské Meziříčí",
  "HC ISMM Kopřivnice",
  "HC LERAM Orli Znojmo",
  "HC Slezan Opava",
  "HC Spartak Uherský Brod",
  "HHK Velké Meziříčí",
  "HK Kroměříž",
  "HK Nový Jičín",
  "LHK Jestřábi Prostějov",
  "SHKM Baník Hodonín",
  "SKLH Žďár nad Sázavou",
  "Technika Hockey Brno",
  "BK Havlíčkův Brod",
  "HC Benátky nad Jizerou",
  "HC Děčín",
  "HC Kobra Praha",
  "HC Milevsko 1934",
  "HC Příbram",
  "HC Stadion Cheb",
  "HC Stadion Vrchlabí",
  "HC Wikov Hronov",
  "HK Kralupy nad Vltavou",
  "HC Slovan Ústí nad Labem",
  "IHC Králové Písek",
  "Mostečtí lvi",
  "SK Kadaň",
]);

const samplePlayers = allPlayers
  .filter((p) => !EXCLUDED_NAMES.has(p.name) && !EXCLUDED_CLUBS.has(p.club))
  .map((p) => ({
    name: p.name,
    position: p.position as "G" | "D" | "F",
    role: p.role || (p.position === "G" ? "G" : null),
    club: p.club,
  }));

async function main() {
  console.log("Seeding database...");

  await prisma.player.deleteMany({});
  await prisma.player.createMany({
    data: samplePlayers,
  });

  console.log(`Seeded ${samplePlayers.length} players`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
