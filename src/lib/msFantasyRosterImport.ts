import { readFileSync } from "fs";
import { join } from "path";
import type { PrismaClient } from "@prisma/client";

export type FantasyRosterJsonRow = {
  code: string;
  name: string;
  team: string;
  jerseyNumber: number | null;
  position: string;
  tier: string;
};

/**
 * Sloučí JSON repre do poolu přes `code` — **nemění id hráčů**, takže `pickIds` v odevzdaných sestavách zůstanou platné.
 */
export async function importMsFantasyRosterJson(
  prisma: PrismaClient,
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

  let upserted = 0;
  for (const r of rows) {
    const tier = r.tier.trim().toUpperCase();
    await prisma.msFantasyRosterPlayer.upsert({
      where: { code: r.code },
      create: {
        code: r.code,
        name: r.name,
        team: r.team,
        jerseyNumber: r.jerseyNumber ?? null,
        position: r.position,
        tier,
      },
      update: {
        name: r.name,
        team: r.team,
        jerseyNumber: r.jerseyNumber ?? null,
        position: r.position,
        tier,
        active: true,
      },
    });
    upserted++;
  }

  const lineupCount = await prisma.msFantasyLineup.count();
  console.log(
    `${warnPrefix}: ${upserted} hráčů (${team}) z data/${filename} — upsert podle code, ${lineupCount} odevzdaných sestav beze změny.`
  );
  if (note) console.log(`  ${note}`);
  return upserted;
}

/** Jednorázová úprava tieru v poolu (např. Lucas Raymond → A) bez doteku lineups. */
export async function patchMsFantasyRosterPlayerTier(
  prisma: PrismaClient,
  code: string,
  tier: string
): Promise<{ code: string; tier: string; name: string } | null> {
  const normalized = tier.trim().toUpperCase();
  const row = await prisma.msFantasyRosterPlayer.findUnique({
    where: { code },
    select: { id: true, name: true, tier: true },
  });
  if (!row) return null;
  await prisma.msFantasyRosterPlayer.update({
    where: { code },
    data: { tier: normalized },
  });
  return { code, tier: normalized, name: row.name };
}
