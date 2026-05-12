import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";

loadEnv({ path: join(process.cwd(), ".env.local"), override: true });

/** MS 2026 fantasy import (`MS_FANTASY_SEED_*`). Kompletní kalendář + všechny soupisky z `data/`: `MS_FANTASY_SEED_FANTASY_DATA=true` (smaže fantasy dny včetně odevzdaných sestav a celý pool, pak načte `ms2026-fantasy-game-days.json` + JSON repre dle manifestu v `prisma/seed.ts`). Jinak jednotlivé `MS_FANTASY_SEED_AUT` apod.; `MS_FANTASY_SEED_SAMPLE` už jen doplní **2 ukázkové hrací dny** (ne pool) pokud v DB žádné dny nejsou — pool vždy jen z JSON repre. Při každém seedu se smažou záznamy s kódem `SAMPLE-*` (starý vývojový vzorek). */
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

/** Pořadí importu; chybí jen FIN/GER JSON v `data/` — doplníš a znovu spustíš `MS_FANTASY_SEED_FANTASY_DATA`. */
const FANTASY_ROSTER_FILES: { team: string; file: string; note?: string }[] = [
  { team: "AUT", file: "austria-ms2026-fantasy-roster.json" },
  { team: "CZE", file: "czechia-ms2026-fantasy-roster.json" },
  { team: "CAN", file: "canada-ms2026-fantasy-roster.json" },
  { team: "DEN", file: "denmark-ms2026-fantasy-roster.json", note: "Platové tiery: jen C–E (Mølgaard, Blichfeld v C) · zbytek D/E" },
  { team: "FIN", file: "finland-ms2026-fantasy-roster.json" },
  { team: "GER", file: "germany-ms2026-fantasy-roster.json" },
  { team: "GBR", file: "great-britain-ms2026-fantasy-roster.json", note: "Platové tiery: jen Kirk v C, zbytek D nebo E" },
  { team: "HUN", file: "hungary-ms2026-fantasy-roster.json", note: "Platové tiery: jen C až E (žádný nejvyšší ani druhý nejvyšší plat)" },
  { team: "ITA", file: "italy-ms2026-fantasy-roster.json", note: "Platové tiery: jen C–E (Larkin, Mantenuto v C) · zbytek D/E" },
  { team: "LAT", file: "latvia-ms2026-fantasy-roster.json", note: "Platové tiery: B Balcers, jádro v C, zbytek D/E" },
  { team: "NOR", file: "norway-ms2026-fantasy-roster.json", note: "Platové tiery: jen C až E (žádný A ani B v platu)" },
  { team: "SLO", file: "slovenia-ms2026-fantasy-roster.json", note: "Platové tiery: jen C–E (Drozg, Sabolič v C) · dresy v datech null (doplnit z IIHF) · zbytek D/E" },
  { team: "SVK", file: "slovakia-ms2026-fantasy-roster.json", note: "Platové tiery: B Hlavaj, M. Pospíšil, Sýkora · bez platového A · zbytek C/D/E" },
  { team: "SUI", file: "switzerland-ms2026-fantasy-roster.json", note: "Platové tiery: A Josi, Hischier, Meier · B Niederreiter, Moser · jádro C · zbytek D/E" },
  { team: "SWE", file: "sweden-ms2026-fantasy-roster.json" },
  { team: "USA", file: "usa-ms2026-fantasy-roster.json" },
];

type FantasyGameDayJsonRow = { slug: string; title: string; lockAt: string; sortOrder: number };

async function importFantasyRosterJson(
  team: string,
  filename: string,
  warnPrefix: string,
  note?: string
): Promise<number> {
  const fp = join(process.cwd(), "data", filename);
  let rows: FantasyRosterJsonRow[];
  try {
    rows = JSON.parse(readFileSync(fp, "utf-8")) as FantasyRosterJsonRow[];
  } catch {
    console.warn(`${warnPrefix}: nepodařilo se načíst data/${filename} — přeskakuji.`);
    return 0;
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn(`${warnPrefix}: prázdný nebo neplatný soubor data/${filename} — přeskakuji.`);
    return 0;
  }
  await prisma.msFantasyRosterPlayer.deleteMany({ where: { team } });
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
  console.log(`${warnPrefix}: ${rows.length} řádků (${team}) z data/${filename}`);
  if (note) console.log(`  ${note}`);
  return rows.length;
}

/**
 * Jednorázově: všechny hrací dny z `data/ms2026-fantasy-game-days.json` + celý fantasy pool ze všech JSON v manifestu.
 * Smaže existující fantasy dny (včetně odevzdaných sestav přes cascade) a celý pool hráčů, pak znovu naplní.
 */
async function seedMsFantasyFantasyDataBundle() {
  if (process.env.MS_FANTASY_SEED_FANTASY_DATA?.trim() !== "true") return;

  const fpDays = join(process.cwd(), "data", "ms2026-fantasy-game-days.json");
  let dayRows: FantasyGameDayJsonRow[];
  try {
    dayRows = JSON.parse(readFileSync(fpDays, "utf-8")) as FantasyGameDayJsonRow[];
  } catch {
    console.warn("MS_FANTASY_SEED_FANTASY_DATA: nepodařilo se načíst data/ms2026-fantasy-game-days.json — přeskakuji fantasy.");
    return;
  }
  if (!Array.isArray(dayRows) || dayRows.length === 0) {
    console.warn("MS_FANTASY_SEED_FANTASY_DATA: prázdný ms2026-fantasy-game-days.json — přeskakuji fantasy.");
    return;
  }

  await prisma.msFantasyGameDay.deleteMany({});
  await prisma.msFantasyGameDay.createMany({
    data: dayRows.map((r) => ({
      slug: r.slug.trim(),
      title: r.title.trim(),
      lockAt: new Date(r.lockAt),
      sortOrder: Number(r.sortOrder) || 0,
    })),
  });
  console.log(`MS_FANTASY_SEED_FANTASY_DATA: ${dayRows.length} fantasy hracích dnů z data/ms2026-fantasy-game-days.json`);

  await prisma.msFantasyRosterPlayer.deleteMany({});
  console.log("MS_FANTASY_SEED_FANTASY_DATA: fantasy pool vyprázdněn, importuji repre…");

  for (const { team, file, note } of FANTASY_ROSTER_FILES) {
    await importFantasyRosterJson(team, file, "MS_FANTASY_SEED_FANTASY_DATA", note);
  }
}

async function seedMsFantasySample() {
  if (process.env.MS_FANTASY_SEED_FANTASY_DATA?.trim() === "true") return;
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
}

async function seedAustriaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_AUT?.trim() !== "true") return;
  await importFantasyRosterJson("AUT", "austria-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_AUT");
}

async function seedUsaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_USA?.trim() !== "true") return;
  await importFantasyRosterJson("USA", "usa-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_USA");
}

async function seedCanadaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_CAN?.trim() !== "true") return;
  await importFantasyRosterJson("CAN", "canada-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_CAN");
}

async function seedSwedenMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SWE?.trim() !== "true") return;
  await importFantasyRosterJson("SWE", "sweden-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_SWE");
}

async function seedGreatBritainMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_GBR?.trim() !== "true") return;
  await importFantasyRosterJson("GBR", "great-britain-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_GBR", "Platové tiery: jen Kirk v C, zbytek D nebo E");
}

async function seedHungaryMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_HUN?.trim() !== "true") return;
  await importFantasyRosterJson(
    "HUN",
    "hungary-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_HUN",
    "Platové tiery: jen C až E (žádný nejvyšší ani druhý nejvyšší plat)"
  );
}

async function seedLatviaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_LAT?.trim() !== "true") return;
  await importFantasyRosterJson("LAT", "latvia-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_LAT", "Platové tiery: B Balcers, jádro v C, zbytek D/E");
}

async function seedSwitzerlandMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SUI?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SUI",
    "switzerland-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SUI",
    "Platové tiery: A Josi, Hischier, Meier · B Niederreiter, Moser · jádro C · zbytek D/E"
  );
}

async function seedNorwayMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_NOR?.trim() !== "true") return;
  await importFantasyRosterJson("NOR", "norway-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_NOR", "Platové tiery: jen C až E (žádný A ani B v platu)");
}

async function seedSlovakiaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SVK?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SVK",
    "slovakia-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SVK",
    "Platové tiery: B Hlavaj, M. Pospíšil, Sýkora · bez platového A · zbytek C/D/E"
  );
}

async function seedDenmarkMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_DEN?.trim() !== "true") return;
  await importFantasyRosterJson("DEN", "denmark-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_DEN", "Platové tiery: jen C–E (Mølgaard, Blichfeld v C) · zbytek D/E");
}

async function seedItalyMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_ITA?.trim() !== "true") return;
  await importFantasyRosterJson("ITA", "italy-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_ITA", "Platové tiery: jen C–E (Larkin, Mantenuto v C) · zbytek D/E");
}

async function seedSloveniaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SLO?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SLO",
    "slovenia-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SLO",
    "Platové tiery: jen C–E (Drozg, Sabolič v C) · dresy v datech null (doplnit z IIHF) · zbytek D/E"
  );
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

  const removedSample = await prisma.msFantasyRosterPlayer.deleteMany({
    where: { code: { startsWith: "SAMPLE-" } },
  });
  if (removedSample.count > 0) {
    console.log(`Odstraněno ${removedSample.count} řádků ukázkových fantasy hráčů (kód SAMPLE-*).`);
  }

  await seedMsFantasyFantasyDataBundle();

  const fantasyData = process.env.MS_FANTASY_SEED_FANTASY_DATA?.trim() === "true";
  if (!fantasyData) {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
