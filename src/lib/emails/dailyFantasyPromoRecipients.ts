import { prisma } from "@/lib/prisma";

export type DailyFantasyPromoRecipient = {
  email: string;
  userId: string;
};

/** Registrovaní uživatelé s e‑mailem, kteří nejsou v nominační soutěži (bez contest entry). */
export async function listDailyFantasyPromoRecipients(): Promise<DailyFantasyPromoRecipient[]> {
  const users = await prisma.user.findMany({
    where: {
      email: { not: null },
      contestEntryNominationId: null,
    },
    select: { id: true, email: true },
    orderBy: { id: "asc" },
  });

  const out: DailyFantasyPromoRecipient[] = [];
  const seen = new Set<string>();

  for (const u of users) {
    const email = (u.email ?? "").trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ email, userId: u.id });
  }

  return out;
}
