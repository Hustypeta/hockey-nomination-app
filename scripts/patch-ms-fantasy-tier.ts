/**
 * Bezpečně změní tier hráče v poolu podle `code` (nemění ms_fantasy_lineups).
 *
 * Výchozí: Lucas Raymond (SWE) → A
 *   npm run fantasy:patch-tier
 *
 * Vlastní:
 *   PLAYER_CODE=SWE26-F23-RAYMOND TIER=A npm run fantasy:patch-tier
 */
import { config } from "dotenv";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { patchMsFantasyRosterPlayerTier } from "../src/lib/msFantasyRosterImport";

config({ path: join(process.cwd(), ".env.local"), override: true });

const DEFAULT_CODES = ["SWE26-F23-RAYMOND", "SWE26-D14-EKHOLM"];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (.env.local)");

  const codesRaw = process.env.PLAYER_CODE?.trim() || process.env.PLAYER_CODES?.trim();
  const codes = codesRaw
    ? codesRaw.split(",").map((c) => c.trim()).filter(Boolean)
    : DEFAULT_CODES;
  const tier = (process.env.TIER ?? "A").trim().toUpperCase();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const lineupCount = await prisma.msFantasyLineup.count();

  for (const code of codes) {
    const before = await prisma.msFantasyRosterPlayer.findUnique({
      where: { code },
      select: { id: true, name: true, tier: true, team: true },
    });
    if (!before) {
      console.error(`Hráč ${code} v poolu nenalezen.`);
      process.exit(1);
    }

    const usesPlayer = await prisma.msFantasyLineup.count({
      where: { pickIds: { has: before.id } },
    });

    const patched = await patchMsFantasyRosterPlayerTier(prisma, code, tier);
    if (!patched) {
      console.error(`Patch selhal: ${code}`);
      process.exit(1);
    }

    console.log(
      `${before.name} (${before.team}): tier ${before.tier} → ${patched.tier}` +
        (usesPlayer > 0
          ? ` — v ${usesPlayer} odevzdaných sestavách (pickIds beze změny).`
          : "")
    );
  }

  console.log(`Celkem ${lineupCount} odevzdaných fantasy sestav v DB.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
