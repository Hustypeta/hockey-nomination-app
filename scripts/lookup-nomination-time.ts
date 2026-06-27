/**
 * Čas nominace v DB: npm run lookup:nomination -- <nominationId>
 */
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });

import { prisma } from "@/lib/prisma";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

const id = process.argv[2]?.trim();
if (!id) {
  console.error("Usage: npm run lookup:nomination -- <nominationId>");
  process.exit(2);
}

const fmt = (d: Date) =>
  d.toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    dateStyle: "full",
    timeStyle: "medium",
  });

async function main() {
  const n = await prisma.nomination.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          leaderboardNickname: true,
          contestEntryNominationId: true,
        },
      },
      contestEntryForUser: { select: { id: true } },
    },
  });

  if (!n) {
    console.error("Nominace nenalezena:", id);
    process.exit(1);
  }

  const display = n.user
    ? publicLeaderboardDisplayName({
        userId: n.user.id,
        nickname: n.user.leaderboardNickname,
      })
    : "—";

  console.log("ID:", n.id);
  console.log("Název:", n.title ?? "(bez názvu)");
  console.log("Slug:", n.slug ?? "—");
  console.log("Uživatel:", display);
  if (n.user?.email) console.log("E-mail:", n.user.email);
  console.log("Soutěžní odevzdání:", n.contestEntryForUser ? "ano" : "ne (jen koncept)");
  console.log("Časový bonus:", `${n.timeBonusPercent} %`);
  console.log("");
  console.log("createdAt (UTC):", n.createdAt.toISOString());
  console.log("createdAt (Česko):", fmt(n.createdAt));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
