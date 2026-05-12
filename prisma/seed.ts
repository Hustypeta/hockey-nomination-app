import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";

/** MS 2026 fantasy import (`MS_FANTASY_SEED_*`) — v `ms_fantasy_roster_players` jen **platové tiery** (A–E). Tier A výjimečně SUI (Josi, Hischier, Meier). DEN/ITA/SLO: soupisky z veřejných zdrojů (viz JSON v `data/`), po zveřejnění IIHF lze snadno přepsat. */
type FantasyRosterJsonRow = {
  code: string;
  name: string;
  team: string;
  jerseyNumber: number | null;
  position: string;
  tier: string;
};

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

async function seedAustriaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_AUT?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "austria-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_AUT: nepodařilo se načíst data/austria-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_AUT: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "AUT" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Austria MS 2026 fantasy roster rows (MS_FANTASY_SEED_AUT)`);
}

async function seedUsaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_USA?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "usa-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_USA: nepodařilo se načíst data/usa-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_USA: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "USA" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} USA MS 2026 fantasy roster rows (MS_FANTASY_SEED_USA)`);
}

async function seedCanadaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_CAN?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "canada-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_CAN: nepodařilo se načíst data/canada-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_CAN: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "CAN" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Canada MS 2026 fantasy roster rows (MS_FANTASY_SEED_CAN)`);
}

async function seedSwedenMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SWE?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "sweden-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_SWE: nepodařilo se načíst data/sweden-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_SWE: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "SWE" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Sweden MS 2026 fantasy roster rows (MS_FANTASY_SEED_SWE)`);
}

async function seedGreatBritainMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_GBR?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "great-britain-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_GBR: nepodařilo se načíst data/great-britain-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_GBR: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "GBR" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Great Britain MS 2026 fantasy roster rows (MS_FANTASY_SEED_GBR)`);
  console.log("  Platové tiery: jen Kirk v C, zbytek D nebo E");
}

async function seedHungaryMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_HUN?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "hungary-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_HUN: nepodařilo se načíst data/hungary-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_HUN: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "HUN" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Hungary MS 2026 fantasy roster rows (MS_FANTASY_SEED_HUN)`);
  console.log("  Platové tiery: jen C až E (žádný nejvyšší ani druhý nejvyšší plat)");
}

async function seedLatviaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_LAT?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "latvia-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_LAT: nepodařilo se načíst data/latvia-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_LAT: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "LAT" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Latvia MS 2026 fantasy roster rows (MS_FANTASY_SEED_LAT)`);
  console.log("  Platové tiery: B Balcers, jádro v C, zbytek D/E");
}

async function seedSwitzerlandMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SUI?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "switzerland-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_SUI: nepodařilo se načíst data/switzerland-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_SUI: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "SUI" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Switzerland MS 2026 fantasy roster rows (MS_FANTASY_SEED_SUI)`);
  console.log("  Platové tiery: A Josi, Hischier, Meier · B Niederreiter, Moser · jádro C · zbytek D/E");
}

async function seedNorwayMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_NOR?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "norway-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_NOR: nepodařilo se načíst data/norway-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_NOR: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "NOR" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Norway MS 2026 fantasy roster rows (MS_FANTASY_SEED_NOR)`);
  console.log("  Platové tiery: jen C až E (žádný A ani B v platu)");
}

async function seedSlovakiaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SVK?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "slovakia-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_SVK: nepodařilo se načíst data/slovakia-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_SVK: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "SVK" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Slovakia MS 2026 fantasy roster rows (MS_FANTASY_SEED_SVK)`);
  console.log("  Platové tiery: B Hlavaj, M. Pospíšil, Sýkora · bez platového A · zbytek C/D/E");
}

async function seedDenmarkMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_DEN?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "denmark-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_DEN: nepodařilo se načíst data/denmark-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_DEN: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "DEN" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Denmark MS 2026 fantasy roster rows (MS_FANTASY_SEED_DEN)`);
  console.log("  Platové tiery: jen C–E (Mølgaard, Blichfeld v C) · zbytek D/E");
}

async function seedItalyMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_ITA?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "italy-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_ITA: nepodařilo se načíst data/italy-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_ITA: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "ITA" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Italy MS 2026 fantasy roster rows (MS_FANTASY_SEED_ITA)`);
  console.log("  Platové tiery: jen C–E (Larkin, Mantenuto v C) · zbytek D/E");
}

async function seedSloveniaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SLO?.trim() !== "true") return;
  const fp = join(process.cwd(), "data", "slovenia-ms2026-fantasy-roster.json");
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_SLO: nepodařilo se načíst data/slovenia-ms2026-fantasy-roster.json — přeskakuji.");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("MS_FANTASY_SEED_SLO: prázdný soubor — přeskakuji.");
    return;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team: "SLO" } });
  await prisma.msFantasyRosterPlayer.createMany({
    data: rows.map((r) => ({
      code: r.code,
      name: r.name,
      team: r.team,
      jerseyNumber: r.jerseyNumber ?? null,
      position: r.position,
      tier: r.tier.trim().toUpperCase(),
    })),
  });
  console.log(`Seeded ${rows.length} Slovenia MS 2026 fantasy roster rows (MS_FANTASY_SEED_SLO)`);
  console.log("  Platové tiery: jen C–E (Drozg, Sabolič v C) · dresy v datech null (doplnit z IIHF) · zbytek D/E");
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
  await seedAustriaMs2026FantasyRoster();
  await seedUsaMs2026FantasyRoster();
  await seedCanadaMs2026FantasyRoster();
  await seedSwedenMs2026FantasyRoster();
  await seedGreatBritainMs2026FantasyRoster();
  await seedHungaryMs2026FantasyRoster();
  await seedLatviaMs2026FantasyRoster();
  await seedSwitzerlandMs2026FantasyRoster();
  await seedNorwayMs2026FantasyRoster();
  await seedSlovakiaMs2026FantasyRoster();
  await seedDenmarkMs2026FantasyRoster();
  await seedItalyMs2026FantasyRoster();
  await seedSloveniaMs2026FantasyRoster();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
