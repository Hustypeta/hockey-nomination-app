import { createHash, randomBytes } from "node:crypto";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { publicLeaderboardDisplayName } from "../src/lib/publicUserLabel";

const root = process.cwd();
if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local"), override: true });

const prisma = new PrismaClient();

type Entrant = {
  userId: string;
  displayName: string;
  email: string | null;
  tickets: number;
};

/** Deterministický seed pro audit — změň jen pokud chceš znovu losovat. */
const DRAW_SEED = process.env.FANTASY_TOMBOLA_SEED?.trim() || `ms2026-fantasy-tombola-${new Date().toISOString().slice(0, 10)}`;

function seededUnit(seed: string, round: number): number {
  const h = createHash("sha256").update(`${seed}:${round}`).digest();
  const n = h.readUInt32BE(0);
  return n / 0x100000000;
}

function pickWeighted(entrants: Entrant[], seed: string, round: number): number {
  const total = entrants.reduce((s, e) => s + e.tickets, 0);
  if (total <= 0) throw new Error("Prázdné osudí.");
  let r = seededUnit(seed, round) * total;
  for (let i = 0; i < entrants.length; i++) {
    r -= entrants[i].tickets;
    if (r < 0) return i;
  }
  return entrants.length - 1;
}

async function main() {
  const lineups = await prisma.msFantasyLineup.findMany({
    select: { userId: true },
  });

  if (lineups.length === 0) {
    console.log("Žádné odevzdané sestavy.");
    return;
  }

  const ticketByUser = new Map<string, number>();
  for (const lu of lineups) {
    ticketByUser.set(lu.userId, (ticketByUser.get(lu.userId) ?? 0) + 1);
  }

  const userIds = [...ticketByUser.keys()];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, leaderboardNickname: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const entrants: Entrant[] = userIds
    .map((userId) => {
      const u = userById.get(userId);
      return {
        userId,
        displayName: publicLeaderboardDisplayName({
          userId,
          nickname: u?.leaderboardNickname,
        }),
        email: u?.email ?? null,
        tickets: ticketByUser.get(userId) ?? 0,
      };
    })
    .sort((a, b) => b.tickets - a.tickets || a.displayName.localeCompare(b.displayName, "cs"));

  const totalTickets = entrants.reduce((s, e) => s + e.tickets, 0);
  const pool = [...entrants];
  const winners: Entrant[] = [];
  const drawCount = Math.min(5, pool.length);

  console.log(`\n=== Fantasy tombola MS 2026 (5× 200 Kč) ===`);
  console.log(`Seed losování: ${DRAW_SEED}`);
  console.log(`Účastníků: ${entrants.length} · lístků celkem: ${totalTickets}`);
  console.log(`Pravidlo: 1 odevzdaný den = 1 lístek · max. 1 výhra na uživatele\n`);

  for (let round = 0; round < drawCount; round++) {
    const idx = pickWeighted(pool, DRAW_SEED, round);
    const w = pool.splice(idx, 1)[0];
    winners.push(w);
  }

  console.log("--- Vylosovaní výherci (veřejné přezdívky) ---");
  winners.forEach((w, i) => {
    console.log(
      `${i + 1}. ${w.displayName} — ${w.tickets} ${w.tickets === 1 ? "lístek" : w.tickets < 5 ? "lístky" : "lístků"}`,
    );
  });

  console.log("\n--- Kontakt pro pořadatele (e-mail) ---");
  winners.forEach((w, i) => {
    console.log(`${i + 1}. ${w.displayName} · ${w.email ?? "(bez e-mailu)"}`);
  });

  console.log("\n--- Top 10 podle počtu lístků ---");
  entrants.slice(0, 10).forEach((e, i) => {
    console.log(`${i + 1}. ${e.displayName} — ${e.tickets} lístků`);
  });

  // Náhodný audit byte (není součást seedu — jen důkaz že skript běžel)
  console.log(`\nAudit nonce: ${randomBytes(8).toString("hex")}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
