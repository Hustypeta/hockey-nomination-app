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

/** Nahradí jen řádky dané repre v poolu — ostatní týmy a odevzdané lineupy (pickIds) nedotkne. */
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
  const removed = await prisma.msFantasyRosterPlayer.deleteMany({ where: { team } });
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
  console.log(
    `${warnPrefix}: ${rows.length} hráčů (${team}) z data/${filename} (předtím v poolu pro ${team}: ${removed.count})`
  );
  if (note) console.log(`  ${note}`);
  return rows.length;
}
