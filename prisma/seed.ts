import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";
import { importMsFantasyRosterJson } from "../src/lib/msFantasyRosterImport";
import {
  MS2026_FANTASY_OFFICIAL_GAME_DAYS,
  ms2026FantasyResolveLockAt,
  ms2026FantasySortedMatches,
} from "../src/lib/ms2026FantasyOfficialGameDays";
import type { Prisma } from "@prisma/client";

loadEnv({ path: join(process.cwd(), ".env.local"), override: true });

/** MS 2026 fantasy import (`MS_FANTASY_SEED_*`). Kompletní kalendář + všechny soupisky z `data/`: `MS_FANTASY_SEED_FANTASY_DATA=true` (hrací dny **upsert** podle `slug` — **zachová odevzdané lineupy**; dál přepíše celý fantasy pool z JSON repre dle manifestu v `prisma/seed.ts`). Volitelně `MS_FANTASY_SEED_FANTASY_DATA_SKIP_POOL=true` — neimportuje soupisky a nemění pool. Jinak jednotlivé `MS_FANTASY_SEED_AUT` apod.; `MS_FANTASY_SEED_SAMPLE` už jen doplní **2 ukázkové hrací dny** (ne pool) pokud v DB žádné dny nejsou — pool vždy jen z JSON repre. Při každém seedu se smažou záznamy s kódem `SAMPLE-*` (starý vývojový vzorek). */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/** Pořadí importu fantasy poolu z `data/` (viz `MS_FANTASY_SEED_FANTASY_DATA`). */
const FANTASY_ROSTER_FILES: { team: string; file: string; note?: string }[] = [
  { team: "AUT", file: "austria-ms2026-fantasy-roster.json", note: "Platové tiery: C Zwerger, Schneider, Kickert, Tolvanen · D Nissner, M. Huber, Nickl, Wolf, Unterweger · gólman Vorauer E · zbytek E" },
  { team: "CZE", file: "czechia-ms2026-fantasy-roster.json" },
  { team: "CAN", file: "canada-ms2026-fantasy-roster.json" },
  { team: "DEN", file: "denmark-ms2026-fantasy-roster.json", note: "Platové tiery: bez A · B Sögaard, True, Russell, Blichfeld · C Olesen, Aagaard, Storm, Bruggisser, Jensen Aabo, Lauridsen, Dichow · D From, Scheel, Wejse, M. Jensen, K. Larsen, Koch · zbytek E" },
  { team: "FIN", file: "finland-ms2026-fantasy-roster.json" },
  { team: "GER", file: "germany-ms2026-fantasy-roster.json" },
  { team: "GBR", file: "great-britain-ms2026-fantasy-roster.json", note: "Platové tiery: C Kirk · D Bowns, Dowd, C. Neilson, Halbert, Richardson, T. Brown · zbytek E (Archie Hazeldine O)" },
  { team: "HUN", file: "hungary-ms2026-fantasy-roster.json", note: "Platové tiery: C Hári, Galló, Sebők · D Sofron, Bartalis, Stipsicz, Bálizs, Vay · zbytek E" },
  { team: "ITA", file: "italy-ms2026-fantasy-roster.json", note: "Platové tiery: jen D a E (bez A/B/C) — posun o tier dolů oproti původnímu C/D/E rozložení" },
  { team: "LAT", file: "latvia-ms2026-fantasy-roster.json", note: "Platové tiery: B Balcers, Gudļevskis · C Dzierkals, Krastenbergs, Zīle · D Batņa, Egle, Freibergs, Mamčics, Cibuļskis, Grigals, Mitens · zbytek E" },
  { team: "NOR", file: "norway-ms2026-fantasy-roster.json", note: "Platové tiery: C Pettersen, Brandsegg-Nygård, Solberg, Haukeland · D Johannesen, Martinsen, T. Olsen, E. Ø. Salsten, Vikingstad, Krogdahl, Kåsastul, Normann · zbytek E" },
  { team: "SLO", file: "slovenia-ms2026-fantasy-roster.json", note: "Platové tiery: C Sabolič, Tičar, Gregorc · D Drozg, Ograjenšek, Kuralt, Štebih, Magovac, Horák, Ž. Us · zbytek E · dresy null (IIHF)" },
  { team: "SVK", file: "slovakia-ms2026-fantasy-roster.json", note: "Platové tiery: bez A · B Hlavaj, M. Pospíšil, Hrivík · C Koch, Kňažko, Štrbák, Okuliar, K. Pospíšil, Sýkora · D Gajan, Gajdoš, Rosandič, Radivojevič, Liška, Faško-Rudáš, Kollár, Petrovský · zbytek E" },
  { team: "SUI", file: "switzerland-ms2026-fantasy-roster.json", note: "Platové tiery: A Josi, Hischier · B Genoni, Meier, Niederreiter, Suter, Moser · C Malgin, Andrighetto, Kukan, Marti, Berra, Aeschlimann · D Thürkauf, Riat, Bertschy, Berni, Egli, Frick · zbytek E" },
  { team: "SWE", file: "sweden-ms2026-fantasy-roster.json" },
  { team: "USA", file: "usa-ms2026-fantasy-roster.json" },
];

async function importFantasyRosterJson(
  team: string,
  filename: string,
  warnPrefix: string,
  note?: string
): Promise<number> {
  return importMsFantasyRosterJson(prisma, team, filename, warnPrefix, note);
}

/**
 * Import fantasy MS: hrací dny + program (`upsert` podle `slug`) — řádky `MsFantasyGameDay` se nemažou,
 * takže `ms_fantasy_lineups` zůstanou navázané (navíc DB FK `gameDayId` = ON DELETE RESTRICT brání smazání dne s lineupy).
 * Pool hráčů se defaultně vyprázdní a znovu načte z manifestu — nastav `MS_FANTASY_SEED_FANTASY_DATA_SKIP_POOL=true`,
 * pokud chceš jen doplnit/upravit kalendář a nechat soupisky v DB beze změny.
 */
async function seedMsFantasyFantasyDataBundle() {
  if (process.env.MS_FANTASY_SEED_FANTASY_DATA?.trim() !== "true") return;

  const dayRows = MS2026_FANTASY_OFFICIAL_GAME_DAYS;
  if (!Array.isArray(dayRows) || dayRows.length === 0) {
    console.warn("MS_FANTASY_SEED_FANTASY_DATA: prázdný seznam hracích dnů — přeskakuji fantasy.");
    return;
  }

  for (const r of dayRows) {
    const slug = r.slug.trim();
    const title = r.title.trim();
    const lockAt = ms2026FantasyResolveLockAt(r);
    const sortOrder = Number(r.sortOrder) || 0;
    const matches = ms2026FantasySortedMatches(r) as Prisma.InputJsonValue;
    await prisma.msFantasyGameDay.upsert({
      where: { slug },
      create: { slug, title, lockAt, sortOrder, matches },
      update: { title, lockAt, sortOrder, matches },
    });
  }
  console.log(
    `MS_FANTASY_SEED_FANTASY_DATA: ${dayRows.length} fantasy hracích dnů (upsert slug → lineupy zachovány) z src/lib/ms2026FantasyOfficialGameDays.ts`
  );

  if (process.env.MS_FANTASY_SEED_FANTASY_DATA_SKIP_POOL?.trim() === "true") {
    console.log("MS_FANTASY_SEED_FANTASY_DATA_SKIP_POOL=true — přeskakuji import fantasy poolu.");
    return;
  }

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
        { slug: "2026-05-15", title: "Hrací den 1 (vzorek)", lockAt: lock1, sortOrder: 1, matches: [] },
        { slug: "2026-05-16", title: "Hrací den 2 (vzorek)", lockAt: lock2, sortOrder: 2, matches: [] },
      ],
    });
    console.log("Seeded 2 sample MS fantasy game days (MS_FANTASY_SEED_SAMPLE)");
  }
}

async function seedAustriaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_AUT?.trim() !== "true") return;
  await importFantasyRosterJson(
    "AUT",
    "austria-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_AUT",
    "Platové tiery: C Zwerger, Schneider, Kickert, Tolvanen · D Nissner, M. Huber, Nickl, Wolf, Unterweger · gólman Vorauer E · zbytek E"
  );
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
  await importFantasyRosterJson("GBR", "great-britain-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_GBR", "Platové tiery: C Kirk · D Bowns, Dowd, C. Neilson, Halbert, Richardson, T. Brown · zbytek E (Archie Hazeldine O)");
}

async function seedHungaryMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_HUN?.trim() !== "true") return;
  await importFantasyRosterJson(
    "HUN",
    "hungary-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_HUN",
    "Platové tiery: C Hári, Galló, Sebők · D Sofron, Bartalis, Stipsicz, Bálizs, Vay · zbytek E"
  );
}

async function seedLatviaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_LAT?.trim() !== "true") return;
  await importFantasyRosterJson("LAT", "latvia-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_LAT", "Platové tiery: B Balcers, Gudļevskis · C Dzierkals, Krastenbergs, Zīle · D Batņa, Egle, Freibergs, Mamčics, Cibuļskis, Grigals, Mitens · zbytek E");
}

async function seedSwitzerlandMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SUI?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SUI",
    "switzerland-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SUI",
    "Platové tiery: A Josi, Hischier · B Genoni, Meier, Niederreiter, Suter, Moser · C Malgin, Andrighetto, Kukan, Marti, Berra, Aeschlimann · D Thürkauf, Riat, Bertschy, Berni, Egli, Frick · zbytek E"
  );
}

async function seedNorwayMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_NOR?.trim() !== "true") return;
  await importFantasyRosterJson("NOR", "norway-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_NOR", "Platové tiery: C Pettersen, Brandsegg-Nygård, Solberg, Haukeland · D Johannesen, Martinsen, T. Olsen, E. Ø. Salsten, Vikingstad, Krogdahl, Kåsastul, Normann · zbytek E");
}

async function seedSlovakiaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SVK?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SVK",
    "slovakia-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SVK",
    "Platové tiery: bez A · B Hlavaj, M. Pospíšil, Hrivík · C Koch, Kňažko, Štrbák, Okuliar, K. Pospíšil, Sýkora · D Gajan, Gajdoš, Rosandič, Radivojevič, Liška, Faško-Rudáš, Kollár, Petrovský · zbytek E"
  );
}

async function seedDenmarkMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_DEN?.trim() !== "true") return;
  await importFantasyRosterJson("DEN", "denmark-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_DEN", "Platové tiery: bez A · B Sögaard, True, Russell, Blichfeld · C Olesen, Aagaard, Storm, Bruggisser, Jensen Aabo, Lauridsen, Dichow · D From, Scheel, Wejse, M. Jensen, K. Larsen, Koch · zbytek E");
}

async function seedItalyMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_ITA?.trim() !== "true") return;
  await importFantasyRosterJson("ITA", "italy-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_ITA", "Platové tiery: jen D a E (bez A/B/C)");
}

async function seedSloveniaMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_SLO?.trim() !== "true") return;
  await importFantasyRosterJson(
    "SLO",
    "slovenia-ms2026-fantasy-roster.json",
    "MS_FANTASY_SEED_SLO",
    "Platové tiery: C Sabolič, Tičar, Gregorc · D Drozg, Ograjenšek, Kuralt, Štebih, Magovac, Horák, Ž. Us · zbytek E · dresy null (IIHF)"
  );
}

async function seedFinlandMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_FIN?.trim() !== "true") return;
  await importFantasyRosterJson("FIN", "finland-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_FIN");
}

async function seedGermanyMs2026FantasyRoster() {
  if (process.env.MS_FANTASY_SEED_GER?.trim() !== "true") return;
  await importFantasyRosterJson("GER", "germany-ms2026-fantasy-roster.json", "MS_FANTASY_SEED_GER");
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
    await seedFinlandMs2026FantasyRoster();
    await seedGermanyMs2026FantasyRoster();
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
